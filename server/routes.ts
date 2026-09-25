import type { Express, Request, Response } from "express";
import { generateContent, generateCoachResponse, extractTextFromImage, selectExercisesWithAI, type ExerciseFromDB } from "./gemini";
import { searchByName, getByBodyPart, MUSCLE_TO_BODY_PART, type ExerciseDBEntry } from "./services/exerciseDb";
import {
  generateRequestSchema,
  ocrRequestSchema,
  completeWorkoutRequestSchema,
  aiCoachRequestSchema,
  exerciseSelectionSchema,
  userPrograms,
  workoutCompletions,
  nutritionLogs,
  insertNutritionLogSchema,
} from "../shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { createCheckoutSession, createPortalSession, getSubscription, handleWebhook } from "./stripe";
import { sendSuccess, sendError, sendValidationError, sendForbidden } from "./utils/response";
import { asyncHandler } from "./middleware/errorHandler";
import { aiLimiter, strictAiLimiter } from "./middleware/rateLimiter";

// Legacy constant — used only in the unused /api/progress legacy routes below.
// The frontend does not call these routes; day calculation is done client-side.
const LEGACY_MAX_DISPLAY_DAYS = 30;
const DEBUG_DAY_OFFSET = parseInt(process.env.DEBUG_DAY_OFFSET || "0", 10);

function calculateDayStatus(dayNumber: number, currentDay: number): "locked" | "active" | "preview" | "past" {
  if (dayNumber < currentDay) {
    return "past";
  } else if (dayNumber === currentDay) {
    return "active";
  }
  return "preview";
}

function calculateCurrentDay(programStartDate: Date, serverNow: Date): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const start = startOfDay(programStartDate);
  const now = startOfDay(serverNow);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // No upper cap — journey is unlimited
  return Math.max(1, diffDays + 1 + DEBUG_DAY_OFFSET);
}

export function registerRoutes(app: Express): void {
  app.post("/api/generate", aiLimiter, asyncHandler(async (req, res) => {
    const validation = generateRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error.errors[0].message);
    }

    const { prompt, systemPrompt } = validation.data;
    const text = await generateContent(prompt, systemPrompt);

    sendSuccess(res, { text });
  }));

  app.post("/api/select-exercises", aiLimiter, asyncHandler(async (req, res) => {
    const validation = exerciseSelectionSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error.errors[0].message);
    }

    const { workoutType, userDifficulty, recentExerciseIds, exerciseCount, availableExercises } = validation.data;

    const selectedExercises = await selectExercisesWithAI(
      availableExercises as ExerciseFromDB[],
      workoutType,
      userDifficulty,
      recentExerciseIds,
      exerciseCount
    );

    sendSuccess(res, { exercises: selectedExercises });
  }));

  app.post("/api/ai-coach", aiLimiter, asyncHandler(async (req, res) => {
    const validation = aiCoachRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error.errors[0].message);
    }

    const {
      message,
      assistantType,
      context,
      workoutName,
      allExercises,
      currentExerciseIndex,
      completedExercises,
      totalExercises,
      history
    } = validation.data;

    let enhancedContext = context;
    
    if (allExercises && allExercises.length > 0 && !context?.exerciseName) {
      const currentEx = currentExerciseIndex !== undefined 
        ? allExercises[currentExerciseIndex] 
        : allExercises[0];
      
      if (currentEx) {
        enhancedContext = {
          exerciseName: currentEx.name,
          muscleGroups: currentEx.muscles.split(/[,/]/).map(m => m.trim()),
          sets: currentEx.sets,
          reps: typeof currentEx.reps === 'string' ? parseInt(currentEx.reps) || 12 : currentEx.reps,
          workoutType: workoutName,
        };
      }
    }

    let workoutOverview = "";
    if (allExercises && allExercises.length > 0) {
      workoutOverview = `\n\nFULL WORKOUT PLAN (${workoutName || "Today's Workout"}):\n`;
      allExercises.forEach((ex, i) => {
        const status = completedExercises !== undefined && i < completedExercises 
          ? "[DONE]" 
          : currentExerciseIndex !== undefined && i === currentExerciseIndex 
            ? "[CURRENT]" 
            : "";
        workoutOverview += `${i + 1}. ${ex.name} - ${ex.muscles} (${ex.sets}x${ex.reps}) ${status}\n`;
      });
      
      if (completedExercises !== undefined && totalExercises !== undefined) {
        const progressPercent = Math.round((completedExercises / totalExercises) * 100);
        workoutOverview += `\nPROGRESS: ${completedExercises}/${totalExercises} exercises (${progressPercent}% complete)`;
      }
    }

    const contextualMessage = workoutOverview 
      ? `${message}\n${workoutOverview}`
      : message;

    const response = await generateCoachResponse(contextualMessage, enhancedContext, history, assistantType);

    const actions: Array<{ type: string; data: Record<string, unknown> }> = [];
    let cleanResponse = response;

    const actionRegex = /\[ACTION:(\w+)\](.*?)\[\/ACTION\]/gs;
    let match;
    while ((match = actionRegex.exec(response)) !== null) {
      try {
        const actionType = match[1];
        const actionData = JSON.parse(match[2]);
        actions.push({ type: actionType, data: actionData });
      } catch (e) {
      }
    }

    cleanResponse = response.replace(/\[ACTION:\w+\].*?\[\/ACTION\]/gs, '').trim();

    sendSuccess(res, { response: cleanResponse, advice: cleanResponse, actions });
  }));

  app.post("/api/ocr-extract", strictAiLimiter, asyncHandler(async (req, res) => {
    const validation = ocrRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error.errors[0].message);
    }

    const { image, mimeType } = validation.data;

    if (image.length > 5000000) {
      return sendError(res, "Image too large (max 3.75MB)", 400);
    }

    const text = await extractTextFromImage(image, mimeType);

    sendSuccess(res, { text });
  }));

  app.get("/api/health", (_req, res) => {
    sendSuccess(res, { 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0"
    });
  });

  app.get("/api/time", (_req, res) => {
    const serverNow = new Date();
    sendSuccess(res, {
      serverTime: serverNow.toISOString(),
      date: serverNow.toISOString().split('T')[0],
      dayOfWeek: serverNow.getDay(),
      timestamp: serverNow.getTime(),
    });
  });

  app.get("/api/progress/:userId", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
      return sendValidationError(res, "User ID is required");
    }

    const serverNow = new Date();
    
    const existingProgram = await db.select()
      .from(userPrograms)
      .where(eq(userPrograms.userId, userId))
      .limit(1);

    let programStartDate: Date;
    let totalDays = LEGACY_MAX_DISPLAY_DAYS;

    if (existingProgram.length === 0) {
      const todayStr = serverNow.toISOString().split('T')[0];
      await db.insert(userPrograms).values({
        userId,
        startDate: todayStr,
        totalDays: LEGACY_MAX_DISPLAY_DAYS,
      }).onConflictDoNothing();
      programStartDate = serverNow;
    } else {
      programStartDate = new Date(existingProgram[0].startDate);
      totalDays = existingProgram[0].totalDays || LEGACY_MAX_DISPLAY_DAYS;
    }

    const currentDay = calculateCurrentDay(programStartDate, serverNow);

    const completionsData = await db.select({ dayNumber: workoutCompletions.dayNumber })
      .from(workoutCompletions)
      .where(eq(workoutCompletions.userId, userId));

    const completedDays = completionsData.map(c => c.dayNumber);

    const displayDays: { day: number; status: "locked" | "active" | "preview" | "past"; isCompleted: boolean }[] = [];
    const startDay = 1;
    const endDay = Math.min(totalDays, 30);
    
    for (let day = startDay; day <= endDay; day++) {
      displayDays.push({
        day,
        status: calculateDayStatus(day, currentDay),
        isCompleted: completedDays.includes(day),
      });
    }

    sendSuccess(res, {
      serverDate: serverNow.toISOString(),
      currentDay,
      totalDays,
      programStartDate: programStartDate.toISOString().split('T')[0],
      completedDays,
      dayStatuses: displayDays,
    });
  }));

  app.post("/api/progress/complete", asyncHandler(async (req, res) => {
    const validation = completeWorkoutRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error.errors[0].message);
    }

    const { userId, dayNumber, workoutName, durationMinutes, caloriesBurned } = validation.data;

    const serverNow = new Date();

    const existingProgram = await db.select()
      .from(userPrograms)
      .where(eq(userPrograms.userId, userId))
      .limit(1);

    if (existingProgram.length === 0) {
      return sendError(res, "User program not initialized", 400, "Program not found");
    }

    const programStartDate = new Date(existingProgram[0].startDate);
    const currentDay = calculateCurrentDay(programStartDate, serverNow);

    if (dayNumber !== currentDay) {
      const message = dayNumber < currentDay 
        ? "Cannot complete past workouts" 
        : "Cannot complete future workouts";
      return sendForbidden(res, `${message}. Today is Day ${currentDay}, but attempted to complete Day ${dayNumber}`);
    }

    const existingCompletion = await db.select({ id: workoutCompletions.id })
      .from(workoutCompletions)
      .where(and(
        eq(workoutCompletions.userId, userId),
        eq(workoutCompletions.dayNumber, dayNumber)
      ))
      .limit(1);

    if (existingCompletion.length > 0) {
      return sendError(res, `Day ${dayNumber} has already been marked as complete`, 400, "Workout already completed");
    }

    await db.insert(workoutCompletions).values({
      userId,
      dayNumber,
      workoutName: workoutName || `Day ${dayNumber} Workout`,
      durationMinutes: durationMinutes || 0,
      caloriesBurned: caloriesBurned || 0,
    });

    sendSuccess(res, { completed: true }, `Day ${dayNumber} workout completed successfully!`);
  }));

  // ── Email ─────────────────────────────────────────────────────────────────

  app.post("/api/email/welcome", asyncHandler(async (req: Request, res: Response) => {
    const { email, name } = req.body;
    if (!email) return sendError(res, "email required", 400);

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn("[Email] RESEND_API_KEY not set — skipping welcome email");
      return sendSuccess(res, { sent: false });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MGP.AI <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to MGP.AI — your coach is ready",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:16px;">
            <h1 style="color:#a88bff;margin-bottom:8px;">Welcome to MGP.AI${name ? `, ${name}` : ''}!</h1>
            <p style="color:#aaa;line-height:1.6;">Your AI fitness coach is ready. Complete your onboarding to start your personalized fitness journey.</p>
            <a href="${frontendUrl}/onboarding"
               style="display:inline-block;margin-top:24px;padding:14px 28px;background:linear-gradient(135deg,#7c57ff,#60a5fa);color:#fff;border-radius:999px;text-decoration:none;font-weight:600;">
              Get Started →
            </a>
            <p style="color:#555;font-size:12px;margin-top:32px;">You're receiving this because you signed up for MGP.AI.</p>
          </div>
        `,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("[Email] Resend error:", errText);
    }

    sendSuccess(res, { sent: r.ok });
  }));

  // ── Stripe / Payments ──────────────────────────────────────────────────────

  app.post("/api/payments/checkout", asyncHandler(async (req: Request, res: Response) => {
    const { userId, userEmail } = req.body;
    if (!userId || !userEmail) return sendError(res, "userId and userEmail required", 400);
    const origin = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5000";
    const session = await createCheckoutSession(userId, userEmail, origin);
    sendSuccess(res, { url: session.url });
  }));

  app.post("/api/payments/portal", asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) return sendError(res, "userId required", 400);
    const origin = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5000";
    const session = await createPortalSession(userId, origin);
    sendSuccess(res, { url: session.url });
  }));

  app.get("/api/payments/subscription/:userId", asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const sub = await getSubscription(userId);
    sendSuccess(res, { subscription: sub });
  }));

  app.post("/api/payments/webhook", asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) return sendError(res, "Missing stripe-signature header", 400);
    const result = await handleWebhook(req.body as Buffer, sig);
    res.json(result);
  }));

  // ── Nutrition Logs ─────────────────────────────────────────────────────────

  app.post("/api/nutrition/log", asyncHandler(async (req: Request, res: Response) => {
    const validation = insertNutritionLogSchema.safeParse(req.body);
    if (!validation.success) return sendValidationError(res, validation.error.errors[0].message);
    const entry = await db.insert(nutritionLogs).values(validation.data).returning();
    sendSuccess(res, { entry: entry[0] }, "Food logged successfully");
  }));

  app.get("/api/nutrition/:userId/:date", asyncHandler(async (req: Request, res: Response) => {
    const { userId, date } = req.params;
    if (!userId || !date) return sendValidationError(res, "userId and date required");
    const logs = await db
      .select()
      .from(nutritionLogs)
      .where(and(eq(nutritionLogs.userId, userId), eq(nutritionLogs.logDate, date)));
    const totalCalories = logs.reduce((sum, l) => sum + (l.calories ?? 0), 0);
    sendSuccess(res, { logs, totalCalories });
  }));

  app.delete("/api/nutrition/log/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendValidationError(res, "Invalid log ID");
    await db.delete(nutritionLogs).where(eq(nutritionLogs.id, id));
    sendSuccess(res, { deleted: true });
  }));

  app.get("/api/progress/validate/:userId/:dayNumber", asyncHandler(async (req, res) => {
    const { userId, dayNumber } = req.params;
    const day = parseInt(dayNumber, 10);

    if (!userId || isNaN(day)) {
      return sendValidationError(res, "Invalid user ID or day number");
    }

    const serverNow = new Date();

    let existingProgram = await db.select()
      .from(userPrograms)
      .where(eq(userPrograms.userId, userId))
      .limit(1);

    if (existingProgram.length === 0) {
      const todayStr = serverNow.toISOString().split('T')[0];
      await db.insert(userPrograms).values({
        userId,
        startDate: todayStr,
        totalDays: LEGACY_MAX_DISPLAY_DAYS,
      }).onConflictDoNothing();
      
      existingProgram = await db.select()
        .from(userPrograms)
        .where(eq(userPrograms.userId, userId))
        .limit(1);
    }

    if (existingProgram.length === 0) {
      return sendError(res, "Failed to initialize program", 500);
    }

    const programStartDate = new Date(existingProgram[0].startDate);
    const currentDay = calculateCurrentDay(programStartDate, serverNow);

    const canStart = day === currentDay;
    const status = calculateDayStatus(day, currentDay);

    const formattedDate = serverNow.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    sendSuccess(res, {
      canStart,
      status,
      currentDay,
      requestedDay: day,
      serverDate: serverNow.toISOString(),
      formattedDate,
    });
  }));

  // ── ExerciseDB proxy routes ────────────────────────────────────────────────

  /** GET /api/exercisedb/search?name=bench+press
   *  Returns up to 5 ExerciseDB entries matching the name. */
  app.get("/api/exercisedb/search", asyncHandler(async (req, res) => {
    const name = (req.query.name as string || "").trim();
    if (!name) return sendError(res, "name query param required", 400);
    if (!process.env.EXERCISE_API_KEY) {
      return sendError(res, "ExerciseDB not configured", 503);
    }
    const results = await searchByName(name, 5);
    sendSuccess(res, { results });
  }));

  /** GET /api/exercisedb/muscle/:group
   *  Returns exercises for a MGP muscle group (chest, back, shoulders, arms, legs, core). */
  app.get("/api/exercisedb/muscle/:group", asyncHandler(async (req, res) => {
    const group = req.params.group.toLowerCase();
    const bodyParts = MUSCLE_TO_BODY_PART[group];
    if (!bodyParts || bodyParts.length === 0) {
      return sendError(res, `Unknown muscle group: ${group}`, 400);
    }
    if (!process.env.EXERCISE_API_KEY) {
      return sendError(res, "ExerciseDB not configured", 503);
    }
    const limit = parseInt((req.query.limit as string) || "25", 10);
    const raw: ExerciseDBEntry[] = [];
    for (const bp of bodyParts) {
      const data = await getByBodyPart(bp, limit);
      raw.push(...data);
    }
    const results = raw;
    sendSuccess(res, { results });
  }));

}
