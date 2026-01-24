import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { WorkoutTemplate, ExerciseTemplate } from "@/types/database";

/**
 * Extended workout type that includes associated exercises
 */
export interface WorkoutWithExercises extends WorkoutTemplate {
  exercises: ExerciseTemplate[];
}

interface UseWorkoutsReturn {
  workouts: WorkoutWithExercises[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all workouts with their exercises from Supabase
 * Orders workouts by day_number for proper sequence display
 * Note: Uses workout_completions table as the primary workout data source
 */
export function useWorkouts(): UseWorkoutsReturn {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("workout_completions")
        .select("*")
        .order("day_number", { ascending: true });

      if (user?.id) {
        query = query.eq("user_id", user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const workoutsWithExercises: WorkoutWithExercises[] = (data || []).map(
        (workout) => ({
          ...workout,
          exercises: [],
        })
      );

      setWorkouts(workoutsWithExercises);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch workouts";
      console.error("Error fetching workouts:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return { workouts, loading, error, refetch: fetchWorkouts };
}
