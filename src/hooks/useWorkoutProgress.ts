import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkoutPlan, markWorkoutComplete } from "@/services/workoutPlanService";

interface DayStatus {
  day: number;
  status: "completed" | "active" | "locked";
  title: string;
  workoutType: string;
}

interface UserStats {
  workoutsCompleted: number;
  totalWorkouts: number;
  streak: number;
  xp: number;
  currentDay: number;
}

export interface WorkoutTemplate {
  dayNumber: number;
  title: string;
  workoutType: string;
  duration: string;
  exercisesCount: number;
}

interface WorkoutProgressData {
  dayStatuses: DayStatus[];
  currentDay: number;
  completedDays: number[];
  userStats: UserStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  completeWorkout: (dayNumber: number) => Promise<boolean>;
  getWorkoutForDay: (day: number) => WorkoutTemplate;
  exerciseTemplates: WorkoutTemplate[];
}

const TOTAL_PROGRAM_DAYS = 21;
const XP_PER_WORKOUT = 50;

const WORKOUT_INFO: Record<string, { name: string; duration: string; exercises: number }> = {
  upper: { name: "Upper Body", duration: "35 min", exercises: 5 },
  lower: { name: "Lower Body", duration: "40 min", exercises: 5 },
  cardio: { name: "Cardio", duration: "30 min", exercises: 4 },
  full: { name: "Full Body", duration: "45 min", exercises: 6 },
  rest: { name: "Rest Day", duration: "0 min", exercises: 0 },
};

export function useWorkoutProgress(): WorkoutProgressData {
  const { user } = useAuth();
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    workoutsCompleted: 0,
    totalWorkouts: TOTAL_PROGRAM_DAYS,
    streak: 0,
    xp: 0,
    currentDay: 1,
  });

  const getWorkoutForDay = useCallback((day: number): WorkoutTemplate => {
    const status = dayStatuses.find(d => d.day === day);
    if (status) {
      const info = WORKOUT_INFO[status.workoutType] || { duration: "30 min", exercises: 5 };
      return {
        dayNumber: day,
        title: status.title,
        workoutType: status.workoutType,
        duration: info.duration,
        exercisesCount: info.exercises,
      };
    }
    return {
      dayNumber: day,
      title: "Workout",
      workoutType: "full",
      duration: "35 min",
      exercisesCount: 5,
    };
  }, [dayStatuses]);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setDayStatuses([]);
      setCompletedDays([]);
      setCurrentDay(1);
      setUserStats({
        workoutsCompleted: 0,
        totalWorkouts: 0,
        streak: 0,
        xp: 0,
        currentDay: 1,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const plan = await getWorkoutPlan(user.id);

      if (plan.length === 0) {
        setDayStatuses([]);
        setCompletedDays([]);
        setCurrentDay(1);
        setUserStats({
          workoutsCompleted: 0,
          totalWorkouts: 0,
          streak: 0,
          xp: 0,
          currentDay: 1,
        });
        setIsLoading(false);
        return;
      }

      const completedDayNumbers = plan
        .filter(p => p.completed)
        .map(p => p.dayNumber);
      
      setCompletedDays(completedDayNumbers);

      let activeDay = 1;
      for (const day of plan) {
        if (day.workoutType === "rest") {
          continue;
        }
        if (!day.completed) {
          activeDay = day.dayNumber;
          break;
        }
        if (day.dayNumber === TOTAL_PROGRAM_DAYS) {
          activeDay = TOTAL_PROGRAM_DAYS;
        }
      }
      setCurrentDay(activeDay);

      const statuses: DayStatus[] = plan.map(p => {
        let status: "completed" | "active" | "locked";

        if (p.completed) {
          status = "completed";
        } else if (p.workoutType === "rest") {
          status = "completed";
        } else if (p.dayNumber === activeDay) {
          status = "active";
        } else {
          status = "locked";
        }

        return {
          day: p.dayNumber,
          status,
          title: p.title,
          workoutType: p.workoutType,
        };
      });

      setDayStatuses(statuses);

      let streak = 0;
      const workoutDays = plan
        .filter(p => p.workoutType !== "rest")
        .sort((a, b) => a.dayNumber - b.dayNumber);

      let startIndex = workoutDays.length - 1;
      for (let i = workoutDays.length - 1; i >= 0; i--) {
        if (workoutDays[i].dayNumber < activeDay) {
          startIndex = i;
          break;
        }
        if (workoutDays[i].dayNumber === activeDay) {
          startIndex = i - 1;
          break;
        }
      }

      for (let i = startIndex; i >= 0; i--) {
        if (workoutDays[i].completed) {
          streak++;
        } else {
          break;
        }
      }

      const totalActualWorkouts = plan.filter(p => p.workoutType !== "rest").length;

      setUserStats({
        workoutsCompleted: completedDayNumbers.length,
        totalWorkouts: totalActualWorkouts,
        streak,
        xp: completedDayNumbers.length * XP_PER_WORKOUT,
        currentDay: activeDay,
      });

    } catch (err) {
      console.error("Error fetching workout progress:", err);
      setError("Failed to load workout progress");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("workout_progress_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_completions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log("Real-time update: workout_completions changed");
          fetchProgress();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to workout progress changes");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchProgress]);

  const completeWorkout = useCallback(async (dayNumber: number): Promise<boolean> => {
    if (!user?.id) {
      console.error("No user logged in");
      return false;
    }

    const dayInfo = dayStatuses.find(d => d.day === dayNumber);

    if (dayInfo?.workoutType === "rest") {
      console.log(`Day ${dayNumber} is a rest day, skipping`);
      return false;
    }

    if (completedDays.includes(dayNumber)) {
      console.log(`Day ${dayNumber} already completed`);
      return true;
    }

    try {
      const success = await markWorkoutComplete(user.id, dayNumber);

      if (!success) {
        return false;
      }

      console.log(`Workout day ${dayNumber} marked complete`);

      setCompletedDays(prev => [...prev, dayNumber]);

      let nextActiveDay = dayNumber + 1;
      for (let d = dayNumber + 1; d <= TOTAL_PROGRAM_DAYS; d++) {
        const nextDayInfo = dayStatuses.find(ds => ds.day === d);
        if (nextDayInfo?.workoutType !== "rest") {
          nextActiveDay = d;
          break;
        }
      }

      setCurrentDay(nextActiveDay);
      setDayStatuses(prev => prev.map(ds => {
        if (ds.day === dayNumber) return { ...ds, status: "completed" as const };
        if (ds.day === nextActiveDay) return { ...ds, status: "active" as const };
        return ds;
      }));
      setUserStats(prev => ({
        ...prev,
        workoutsCompleted: prev.workoutsCompleted + 1,
        streak: prev.streak + 1,
        xp: prev.xp + XP_PER_WORKOUT,
        currentDay: nextActiveDay,
      }));

      return true;
    } catch (err) {
      console.error("Error completing workout:", err);
      return false;
    }
  }, [user?.id, currentDay, completedDays, dayStatuses]);

  return {
    dayStatuses,
    currentDay,
    completedDays,
    userStats,
    isLoading,
    error,
    refetch: fetchProgress,
    completeWorkout,
    getWorkoutForDay,
    exerciseTemplates: [],
  };
}
