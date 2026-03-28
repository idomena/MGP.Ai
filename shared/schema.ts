import { z } from "zod";
import { pgTable, serial, text, integer, date, timestamp, varchar, uniqueIndex, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const userPrograms = pgTable("user_programs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  startDate: date("start_date").notNull(),
  totalDays: integer("total_days").notNull().default(90),
});

export const workoutCompletions = pgTable("workout_completions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  dayNumber: integer("day_number").notNull(),
  workoutName: text("workout_name"),
  durationMinutes: integer("duration_minutes"),
  caloriesBurned: integer("calories_burned"),
  completedAt: timestamp("completed_at").defaultNow(),
}, (table) => ({
  userDayUnique: uniqueIndex("workout_completions_user_day_unique").on(table.userId, table.dayNumber),
}));

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  status: varchar("status", { length: 50 }).notNull().default("trialing"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nutritionLogs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: date("log_date").notNull(),
  foodName: text("food_name").notNull(),
  calories: integer("calories"),
  proteinG: decimal("protein_g", { precision: 6, scale: 1 }),
  carbsG: decimal("carbs_g", { precision: 6, scale: 1 }),
  fatG: decimal("fat_g", { precision: 6, scale: 1 }),
  servingSize: text("serving_size"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNutritionLogSchema = createInsertSchema(nutritionLogs).omit({ id: true, loggedAt: true });

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = z.infer<typeof insertNutritionLogSchema>;

export const insertUserProgramSchema = createInsertSchema(userPrograms).omit({ id: true });
export const insertWorkoutCompletionSchema = createInsertSchema(workoutCompletions).omit({ id: true, completedAt: true });

export type UserProgram = typeof userPrograms.$inferSelect;
export type InsertUserProgram = z.infer<typeof insertUserProgramSchema>;

export type WorkoutCompletion = typeof workoutCompletions.$inferSelect;
export type InsertWorkoutCompletion = z.infer<typeof insertWorkoutCompletionSchema>;

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
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]).optional().default("image/jpeg"),
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

export const exerciseContextSchema = z.object({
  exerciseName: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  currentSet: z.number().optional(),
  isResting: z.boolean().optional(),
  workoutType: z.string().optional(),
}).optional();

export const aiCoachRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  assistantType: z.enum(["coach", "nutritionist", "trainer"]).optional().default("coach"),
  context: exerciseContextSchema,
  workoutName: z.string().optional(),
  allExercises: z.array(z.object({
    name: z.string(),
    muscles: z.string(),
    sets: z.number(),
    reps: z.union([z.string(), z.number()]),
    time: z.string(),
  })).optional(),
  currentExerciseIndex: z.number().optional(),
  completedExercises: z.number().optional(),
  totalExercises: z.number().optional(),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional().default([]),
});

export type AiCoachRequest = z.infer<typeof aiCoachRequestSchema>;

export const exerciseSelectionSchema = z.object({
  workoutType: z.string(),
  userDifficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  recentExerciseIds: z.array(z.string()).optional().default([]),
  exerciseCount: z.number().min(1).max(10).optional().default(5),
  availableExercises: z.array(z.object({
    id: z.string(),
    title: z.string(),
    muscle_group: z.string(),
    secondary_muscles: z.array(z.string()).optional(),
    equipment: z.string(),
    difficulty: z.string(),
    exercise_type: z.string(),
    movement_pattern: z.string(),
    is_safe: z.boolean(),
    description: z.string().optional(),
  })),
});

export type ExerciseSelectionRequest = z.infer<typeof exerciseSelectionSchema>;
