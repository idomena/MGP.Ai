/**
 * Database type definitions for MGP.AI fitness application
 * These interfaces match the Supabase database tables
 */

/**
 * WorkoutTemplate - Represents a workout for a specific day in the program
 * Maps to the workout_completions table in Supabase
 */
export interface WorkoutTemplate {
  id: string;
  user_id: string | null;
  day_number: number;
  title: string;
  workout_type: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

/**
 * ExerciseTemplate - Represents an individual exercise within a workout
 * Maps to the exercise_templates table in Supabase
 */
export interface ExerciseTemplate {
  id: string;
  workout_id: string;
  name: string;
  description: string | null;
  sets: number;
  reps: number;
  duration_seconds: number | null;
  rest_seconds: number;
  order_index: number;
  gif_url: string | null;
  video_url: string | null;
  muscle_group: string;
  equipment: string | null;
  created_at: string;
}

/**
 * UserProgress - Tracks a user's progress through the workout program
 * Maps to the user_progress table in Supabase
 */
export interface UserProgress {
  id: string;
  user_id: string;
  workout_id: string;
  day_number: number;
  completed: boolean;
  completed_at: string | null;
  duration_minutes: number | null;
  calories_burned: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * UserStats - Aggregated statistics for a user
 * Maps to the user_stats table in Supabase
 */
export interface UserStats {
  id: string;
  user_id: string;
  total_workouts: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  total_calories: number;
  total_minutes: number;
  current_day: number;
  program_start_date: string;
  last_workout_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Profile - User profile information
 * Maps to the profiles table in Supabase
 */
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
