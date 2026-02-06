import type { Express } from "express";
import { generateContent, generateCoachResponse, extractTextFromImage, selectExercisesWithAI, type ExerciseFromDB } from "./gemini";
import { 
  generateRequestSchema, 
  ocrRequestSchema, 
  completeWorkoutRequestSchema, 
  aiCoachRequestSchema,
  exerciseSelectionSchema,
  userPrograms, 
  workoutCompletions 
} from "../shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { sendSuccess, sendError, sendValidationError, sendForbidden } from "./utils/response";
import { asyncHandler } from "./middleware/errorHandler";
import { aiLimiter, strictAiLimiter } from "./middleware/rateLimiter";

const TOTAL_PROGRAM_DAYS = 21;
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
  return Math.max(1, Math.min(diffDays + 1 + DEBUG_DAY_OFFSET, TOTAL_PROGRAM_DAYS));
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

    const response = await generateCoachResponse(contextualMessage, enhancedContext, history);

    sendSuccess(res, { response, advice: response });
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
    let totalDays = TOTAL_PROGRAM_DAYS;

    if (existingProgram.length === 0) {
      const todayStr = serverNow.toISOString().split('T')[0];
      await db.insert(userPrograms).values({
        userId,
        startDate: todayStr,
        totalDays: TOTAL_PROGRAM_DAYS,
      }).onConflictDoNothing();
      programStartDate = serverNow;
    } else {
      programStartDate = new Date(existingProgram[0].startDate);
      totalDays = existingProgram[0].totalDays || TOTAL_PROGRAM_DAYS;
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
        totalDays: TOTAL_PROGRAM_DAYS,
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
}
