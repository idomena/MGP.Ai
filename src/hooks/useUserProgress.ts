import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProgress } from "@/types/database";

interface UseUserProgressReturn {
  progress: UserProgress[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markWorkoutComplete: (
    dayNumber: number,
    workoutId: string
  ) => Promise<boolean>;
}

/**
 * Hook to fetch and manage user's workout progress
 * Provides functions to track completion status and mark workouts as done
 */
export function useUserProgress(): UseUserProgressReturn {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("workout_completions")
        .select("*")
        .eq("user_id", user.id)
        .order("day_number", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const mappedProgress: UserProgress[] = (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id || user.id,
        workout_id: item.id,
        day_number: item.day_number,
        completed: item.completed || false,
        completed_at: item.completed_at,
        duration_minutes: null,
        calories_burned: null,
        notes: null,
        created_at: item.created_at,
        updated_at: item.created_at,
      }));

      setProgress(mappedProgress);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch progress";
      console.error("Error fetching user progress:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markWorkoutComplete = useCallback(
    async (dayNumber: number, workoutId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const { error: updateError } = await supabase
          .from("workout_completions")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", workoutId)
          .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }

        await fetchProgress();
        return true;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to mark workout complete";
        console.error("Error marking workout complete:", errorMessage);
        setError(errorMessage);
        return false;
      }
    },
    [user?.id, fetchProgress]
  );

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("user_progress_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_completions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchProgress]);

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
    markWorkoutComplete,
  };
}
