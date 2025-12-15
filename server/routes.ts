import type { Express } from "express";
import { generateContent, generateCoachResponse, extractTextFromImage } from "./gemini";
import { generateRequestSchema, ocrRequestSchema, completeWorkoutRequestSchema } from "../shared/schema";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured: missing URL or key');
    return null;
  }
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

const TOTAL_PROGRAM_DAYS = 90;

function calculateDayStatus(dayNumber: number, currentDay: number, completedDays: number[]): "locked" | "active" | "preview" {
  if (dayNumber < currentDay) {
    return "locked";
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
  return Math.max(1, Math.min(diffDays + 1, TOTAL_PROGRAM_DAYS));
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

  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const sb = getSupabase();
      if (!sb) {
        return res.status(503).json({
          success: false,
          error: "Database not configured",
        });
      }

      const serverNow = new Date();
      
      const { data: programData, error: programError } = await sb
        .from('user_programs')
        .select('start_date, total_days')
        .eq('user_id', userId)
        .single();

      let programStartDate: Date;
      let totalDays = TOTAL_PROGRAM_DAYS;

      if (programError || !programData) {
        const { error: insertError } = await sb
          .from('user_programs')
          .upsert({
            user_id: userId,
            start_date: serverNow.toISOString().split('T')[0],
            total_days: TOTAL_PROGRAM_DAYS
          }, { onConflict: 'user_id' });

        if (insertError) {
          console.error('Error creating user program:', insertError);
        }
        programStartDate = serverNow;
      } else {
        programStartDate = new Date(programData.start_date);
        totalDays = programData.total_days || TOTAL_PROGRAM_DAYS;
      }

      const currentDay = calculateCurrentDay(programStartDate, serverNow);

      const { data: completionsData, error: completionsError } = await sb
        .from('workout_completions')
        .select('day_number')
        .eq('user_id', userId);

      if (completionsError) {
        console.error('Error fetching completions:', completionsError);
      }

      const completedDays = completionsData?.map(c => c.day_number) || [];

      const displayDays = [];
      const startDay = Math.max(1, currentDay - 4);
      const endDay = Math.min(totalDays, startDay + 4);
      
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

      const sb = getSupabase();
      if (!sb) {
        return res.status(503).json({
          success: false,
          message: "Database not configured",
          error: "Database not configured",
        });
      }

      const { userId, dayNumber, workoutName, durationMinutes, caloriesBurned } = validation.data;

      const serverNow = new Date();

      const { data: programData, error: programError } = await sb
        .from('user_programs')
        .select('start_date')
        .eq('user_id', userId)
        .single();

      if (programError || !programData) {
        return res.status(400).json({
          success: false,
          message: "Program not found",
          error: "User program not initialized",
        });
      }

      const programStartDate = new Date(programData.start_date);
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

      const { data: existingCompletion } = await sb
        .from('workout_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('day_number', dayNumber)
        .single();

      if (existingCompletion) {
        return res.status(400).json({
          success: false,
          message: "Workout already completed",
          error: `Day ${dayNumber} has already been marked as complete`,
        });
      }

      const { error: insertError } = await sb
        .from('workout_completions')
        .insert({
          user_id: userId,
          day_number: dayNumber,
          workout_name: workoutName || `Day ${dayNumber} Workout`,
          duration_minutes: durationMinutes || 0,
          calories_burned: caloriesBurned || 0,
        });

      if (insertError) {
        console.error('Error saving completion:', insertError);
        return res.status(500).json({
          success: false,
          message: "Failed to save workout completion",
          error: insertError.message,
        });
      }

      res.json({
        success: true,
        message: `Day ${dayNumber} workout completed successfully!`,
      });
    } catch (error) {
      console.error("Error completing workout:", error);
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

      const sb = getSupabase();
      if (!sb) {
        return res.status(503).json({
          success: false,
          canStart: false,
          error: "Database not configured",
        });
      }

      const serverNow = new Date();

      const { data: programData, error: programError } = await sb
        .from('user_programs')
        .select('start_date')
        .eq('user_id', userId)
        .single();

      if (programError || !programData) {
        return res.status(400).json({
          success: false,
          canStart: false,
          error: "Program not found",
        });
      }

      const programStartDate = new Date(programData.start_date);
      const currentDay = calculateCurrentDay(programStartDate, serverNow);

      const canStart = day === currentDay;
      const status = calculateDayStatus(day, currentDay, []);

      res.json({
        success: true,
        canStart,
        status,
        currentDay,
        requestedDay: day,
        serverDate: serverNow.toISOString(),
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
