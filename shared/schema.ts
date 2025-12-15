import { z } from "zod";

export const generateRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(10000, "Prompt too long"),
  systemPrompt: z.string().optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z.object({
  text: z.string(),
  success: z.boolean(),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

export const ocrRequestSchema = z.object({
  image: z.string().min(1, "Image data is required"),
});

export type OcrRequest = z.infer<typeof ocrRequestSchema>;

export const ocrResponseSchema = z.object({
  text: z.string(),
  success: z.boolean(),
});

export type OcrResponse = z.infer<typeof ocrResponseSchema>;

export const progressResponseSchema = z.object({
  success: z.boolean(),
  serverDate: z.string(),
  currentDay: z.number(),
  totalDays: z.number(),
  programStartDate: z.string(),
  completedDays: z.array(z.number()),
  dayStatuses: z.array(z.object({
    day: z.number(),
    status: z.enum(["locked", "active", "preview"]),
    isCompleted: z.boolean(),
  })),
});

export type ProgressResponse = z.infer<typeof progressResponseSchema>;

export const completeWorkoutRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  dayNumber: z.number().int().min(1, "Day number must be positive"),
  workoutName: z.string().optional(),
  durationMinutes: z.number().optional(),
  caloriesBurned: z.number().optional(),
});

export type CompleteWorkoutRequest = z.infer<typeof completeWorkoutRequestSchema>;

export const completeWorkoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export type CompleteWorkoutResponse = z.infer<typeof completeWorkoutResponseSchema>;
