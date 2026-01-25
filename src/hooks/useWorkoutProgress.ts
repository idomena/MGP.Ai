import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type WorkoutCompletion = Tables<"workout_completions">;

interface DayStatus {
  day: number;
  status: "locked" | "active" | "preview" | "past";
  isCompleted: boolean;
}

interface UserStats {
  workoutsCompleted: number;
  totalWorkouts: number;
  streak: number;
  xp: number;
}

interface WorkoutProgressData {
  dayStatuses: DayStatus[];
  currentDay: number;
  completedDays: number[];
  userStats: UserStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  completeWorkout: (day: number, title: string, workoutType: string) => Promise<boolean>;
}

const TOTAL_PROGRAM_DAYS = 21;
const XP_PER_WORKOUT = 100;

function calculateStreak(completedDays: number[], currentDay: number): number {
  if (completedDays.length === 0) return 0;
  
  let streak = 0;
  const sortedDays = [...completedDays].sort((a, b) => b - a);
  
  for (let day = currentDay; day >= 1; day--) {
    if (sortedDays.includes(day) || day === currentDay) {
      if (sortedDays.includes(day)) {
        streak++;
      }
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateDayStatus(
  dayNumber: number,
  currentDay: number,
  completedDays: number[]
): "locked" | "active" | "preview" | "past" {
  if (dayNumber < currentDay) {
    return "past";
  } else if (dayNumber === currentDay) {
    return "active";
  } else {
    return "preview";
  }
}

function calculateCurrentDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startClean = startOfDay(start);
  const nowClean = startOfDay(now);
  
  const diffTime = nowClean.getTime() - startClean.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, Math.min(diffDays + 1, TOTAL_PROGRAM_DAYS));
}

export function useWorkoutProgress(): WorkoutProgressData {
  const { user } = useAuth();
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    workoutsCompleted: 0,
    totalWorkouts: TOTAL_PROGRAM_DAYS,
    streak: 0,
    xp: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get profile for start date
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("user_id", user.id)
        .single();

      let startDate: string;

      if (profileError || !profile) {
        // Fall back to today if no profile found
        startDate = new Date().toISOString().split("T")[0];
      } else {
        startDate = profile.created_at.split("T")[0];
      }

      const calculatedCurrentDay = calculateCurrentDay(startDate);
      setCurrentDay(calculatedCurrentDay);

      // Fetch workout completions for this user
      let completedDayNumbers: number[] = [];
      
      try {
        const { data: completions, error: completionsError } = await supabase
          .from("workout_completions")
          .select("day_number, completed")
          .eq("user_id", user.id)
          .eq("completed", true);

        if (completionsError) {
          console.error("Error fetching workout completions:", completionsError);
        }

        if (!completionsError && completions) {
          completedDayNumbers = completions.map((c) => c.day_number);
        }
      } catch (err) {
        console.error("workout_completions fetch error:", err);
      }
      
      console.log("COMPLETED DAYS FROM DB:", completedDayNumbers);
      setCompletedDays(completedDayNumbers);

      // Build day statuses for all 30 days
      const statuses: DayStatus[] = [];
      for (let day = 1; day <= TOTAL_PROGRAM_DAYS; day++) {
        statuses.push({
          day,
          status: calculateDayStatus(day, calculatedCurrentDay, completedDayNumbers),
          isCompleted: completedDayNumbers.includes(day),
        });
      }
      setDayStatuses(statuses);

      // Calculate stats
      const streak = calculateStreak(completedDayNumbers, calculatedCurrentDay);
      const xp = completedDayNumbers.length * XP_PER_WORKOUT;

      setUserStats({
        workoutsCompleted: completedDayNumbers.length,
        totalWorkouts: TOTAL_PROGRAM_DAYS,
        streak,
        xp,
      });

    } catch (err) {
      console.error("Error fetching workout progress:", err);
      // Even on error, set up default state so UI doesn't break
      const calculatedCurrentDay = 1;
      setCurrentDay(calculatedCurrentDay);
      setCompletedDays([]);
      
      const statuses: DayStatus[] = [];
      for (let day = 1; day <= TOTAL_PROGRAM_DAYS; day++) {
        statuses.push({
          day,
          status: calculateDayStatus(day, calculatedCurrentDay, []),
          isCompleted: false,
        });
      }
      setDayStatuses(statuses);
      setUserStats({
        workoutsCompleted: 0,
        totalWorkouts: TOTAL_PROGRAM_DAYS,
        streak: 0,
        xp: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time subscription for workout completions
    // This will work once the table exists in Supabase
    const channel = supabase
      .channel("workout_completions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_completions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Real-time update received:", payload);
          fetchProgress();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to workout_completions changes");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchProgress]);

  const completeWorkout = useCallback(async (day: number, title: string, workoutType: string): Promise<boolean> => {
    if (!user?.id) {
      console.error("No user logged in");
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from("workout_completions")
        .insert({
          user_id: user.id,
          day_number: day,
          title,
          workout_type: workoutType,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error completing workout:", insertError);
        return false;
      }

      console.log(`Workout day ${day} completed successfully`);
      await fetchProgress();
      return true;
    } catch (err) {
      console.error("Error completing workout:", err);
      return false;
    }
  }, [user?.id, fetchProgress]);

  return {
    dayStatuses,
    currentDay,
    completedDays,
    userStats,
    isLoading,
    error,
    refetch: fetchProgress,
    completeWorkout,
  };
}
