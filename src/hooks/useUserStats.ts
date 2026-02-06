import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { UserStats } from "@/types/database";

interface UseUserStatsReturn {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStats: (updates: Partial<UserStats>) => Promise<boolean>;
}

const XP_PER_WORKOUT = 100;

/**
 * Hook to fetch and update user statistics
 * Calculates stats from workout_completions if no user_stats table exists
 */
export function useUserStats(): UseUserStatsReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStatsFromCompletions = useCallback(async (): Promise<UserStats | null> => {
    if (!user?.id) return null;

    try {
      const { data: completions, error: completionsError } = await supabase
        .from("workout_completions")
        .select("day_number, completed, completed_at")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (completionsError) {
        return null;
      }

      const completedDays = (completions || []).map((c) => c.day_number).sort((a, b) => a - b);
      const totalWorkouts = completedDays.length;
      const totalXp = totalWorkouts * XP_PER_WORKOUT;

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (let i = 0; i < completedDays.length; i++) {
        if (i === 0 || completedDays[i] === completedDays[i - 1] + 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("user_id", user.id)
        .single();

      const startDate = profile?.created_at || new Date().toISOString();
      const lastCompletedAt = completions?.length
        ? completions.sort((a, b) => 
            new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
          )[0]?.completed_at
        : null;

      const today = new Date();
      const start = new Date(startDate);
      const currentDay = Math.max(1, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      if (completedDays.includes(currentDay) || completedDays.includes(currentDay - 1)) {
        for (let day = currentDay; day >= 1; day--) {
          if (completedDays.includes(day)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      return {
        id: user.id,
        user_id: user.id,
        total_workouts: totalWorkouts,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_xp: totalXp,
        total_calories: 0,
        total_minutes: 0,
        current_day: currentDay,
        program_start_date: startDate,
        last_workout_date: lastCompletedAt,
        created_at: startDate,
        updated_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error("Error calculating stats:", err);
      return null;
    }
  }, [user?.id]);

  const fetchStats = useCallback(async () => {
    if (!user?.id) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const calculatedStats = await calculateStatsFromCompletions();
      setStats(calculatedStats);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch stats";
      console.error("Error fetching user stats:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, calculateStatsFromCompletions]);

  const updateStats = useCallback(
    async (updates: Partial<UserStats>): Promise<boolean> => {
      if (!user?.id || !stats) return false;

      try {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                ...updates,
                updated_at: new Date().toISOString(),
              }
            : null
        );

        return true;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update stats";
        console.error("Error updating stats:", errorMessage);
        setError(errorMessage);
        return false;
      }
    },
    [user?.id, stats]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("user_stats_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_completions",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    updateStats,
  };
}
