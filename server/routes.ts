import type { Express } from "express";
import { generateContent, generateCoachResponse, extractTextFromImage } from "./gemini";
import { generateRequestSchema, ocrRequestSchema, completeWorkoutRequestSchema, userPrograms, workoutCompletions } from "../shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

const TOTAL_PROGRAM_DAYS = 21;

// DEBUG: Simulate being on day 7 (add 6 days offset)
// Set to 0 for production
const DEBUG_DAY_OFFSET = 6;

function calculateDayStatus(dayNumber: number, currentDay: number, completedDays: number[]): "locked" | "active" | "preview" | "past" {
  if (dayNumber < currentDay) {
    // Past days - check if completed or missed
    return "past";
  } else if (dayNumber === currentDay) {
    return "active";
  } else {
    return "preview";
  }
}

function calculateCurrentDay(programStartDate: Date, serverNow: Date): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const start = startOfDay(programStartDate);
  const now = startOfDay(serverNow);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // Add debug offset to simulate being further in the program
  return Math.max(1, Math.min(diffDays + 1 + DEBUG_DAY_OFFSET, TOTAL_PROGRAM_DAYS));
}

export function registerRoutes(app: Express): void {
  app.post("/api/generate", async (req, res) => {
    try {
      const validation = generateRequestSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message,
        });
      }

      const { prompt, systemPrompt } = validation.data;
      const text = await generateContent(prompt, systemPrompt);

      res.json({
        success: true,
        text,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  });

  app.post("/api/ai-coach", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          success: false,
          error: "Message is required",
        });
      }

      if (message.length > 5000) {
        return res.status(400).json({
          success: false,
          error: "Message too long (max 5000 characters)",
        });
      }

      const response = await generateCoachResponse(message);

      res.json({
        success: true,
        response,
        advice: response,
      });
    } catch (error) {
      console.error("Error in AI coach:", error);
      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("429") || message.includes("quota")) {
        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded. Please try again in a moment.",
        });
      }

      res.status(500).json({
        success: false,
        error: message,
      });
    }
  });

  app.post("/api/ocr-extract", async (req, res) => {
    try {
      const validation = ocrRequestSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message,
        });
      }

      const { image, mimeType } = req.body;

      if (image.length > 5000000) {
        return res.status(400).json({
          success: false,
          error: "Image too large (max 3.75MB)",
        });
      }

      const text = await extractTextFromImage(image, mimeType);

      res.json({
        success: true,
        text,
      });
    } catch (error) {
      console.error("Error extracting text:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/time", (_req, res) => {
    const serverNow = new Date();
    const dateStr = serverNow.toISOString().split('T')[0];
    
    res.json({
      serverTime: serverNow.toISOString(),
      date: dateStr,
      dayOfWeek: serverNow.getDay(),
      timestamp: serverNow.getTime(),
    });
  });

  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
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
      // Show all 30 days for the full month journey view
      const startDay = 1;
      const endDay = Math.min(totalDays, 30);
      
      for (let day = startDay; day <= endDay; day++) {
        displayDays.push({
          day,
          status: calculateDayStatus(day, currentDay, completedDays),
          isCompleted: completedDays.includes(day),
        });
      }

      res.json({
        success: true,
        serverDate: serverNow.toISOString(),
        currentDay,
        totalDays,
        programStartDate: programStartDate.toISOString().split('T')[0],
        completedDays,
        dayStatuses: displayDays,
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  });

  app.post("/api/progress/complete", async (req, res) => {
    try {
      const validation = completeWorkoutRequestSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: validation.error.errors[0].message,
        });
      }

      const { userId, dayNumber, workoutName, durationMinutes, caloriesBurned } = validation.data;

      const serverNow = new Date();

      const existingProgram = await db.select()
        .from(userPrograms)
        .where(eq(userPrograms.userId, userId))
        .limit(1);

      if (existingProgram.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Program not found",
          error: "User program not initialized",
        });
      }

      const programStartDate = new Date(existingProgram[0].startDate);
      const currentDay = calculateCurrentDay(programStartDate, serverNow);

      if (dayNumber !== currentDay) {
        return res.status(403).json({
          success: false,
          message: dayNumber < currentDay 
            ? "Cannot complete past workouts" 
            : "Cannot complete future workouts",
          error: `Today is Day ${currentDay}, but attempted to complete Day ${dayNumber}`,
        });
      }

      const existingCompletion = await db.select({ id: workoutCompletions.id })
        .from(workoutCompletions)
        .where(and(
          eq(workoutCompletions.userId, userId),
          eq(workoutCompletions.dayNumber, dayNumber)
        ))
        .limit(1);

      if (existingCompletion.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Workout already completed",
          error: `Day ${dayNumber} has already been marked as complete`,
        });
      }

      await db.insert(workoutCompletions).values({
        userId,
        dayNumber,
        workoutName: workoutName || `Day ${dayNumber} Workout`,
        durationMinutes: durationMinutes || 0,
        caloriesBurned: caloriesBurned || 0,
      });

      res.json({
        success: true,
        message: `Day ${dayNumber} workout completed successfully!`,
      });
    } catch (error: any) {
      console.error("Error completing workout:", error);
      
      if (error?.code === '23505' || error?.message?.includes('unique constraint')) {
        return res.status(400).json({
          success: false,
          message: "Workout already completed",
          error: "This workout has already been marked as complete",
        });
      }
      
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        message: "Failed to complete workout",
        error: message,
      });
    }
  });

  app.get("/api/progress/validate/:userId/:dayNumber", async (req, res) => {
    try {
      const { userId, dayNumber } = req.params;
      const day = parseInt(dayNumber, 10);

      if (!userId || isNaN(day)) {
        return res.status(400).json({
          success: false,
          canStart: false,
          error: "Invalid user ID or day number",
        });
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
        return res.status(500).json({
          success: false,
          canStart: false,
          error: "Failed to initialize program",
        });
      }

      const programStartDate = new Date(existingProgram[0].startDate);
      const currentDay = calculateCurrentDay(programStartDate, serverNow);

      const canStart = day === currentDay;
      const status = calculateDayStatus(day, currentDay, []);

      const formattedDate = serverNow.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });

      res.json({
        success: true,
        canStart,
        status,
        currentDay,
        requestedDay: day,
        serverDate: serverNow.toISOString(),
        formattedDate,
      });
    } catch (error) {
      console.error("Error validating workout access:", error);
      res.status(500).json({
        success: false,
        canStart: false,
        error: "Failed to validate workout access",
      });
    }
  });
}
