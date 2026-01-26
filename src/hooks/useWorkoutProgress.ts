import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, Json } from "@/integrations/supabase/types";

type WorkoutCompletion = Tables<"workout_completions">;

interface DayStatus {
  day: number;
  status: "completed" | "active" | "locked";
  title: string;
  workoutType: string;
  workoutTemplateId?: string | null;
  exerciseTemplateId?: string | null;
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

const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  { dayNumber: 1, title: "Push", workoutType: "push", duration: "35 min", exercisesCount: 5 },
  { dayNumber: 2, title: "Pull", workoutType: "pull", duration: "40 min", exercisesCount: 5 },
  { dayNumber: 3, title: "Legs", workoutType: "legs", duration: "45 min", exercisesCount: 6 },
  { dayNumber: 4, title: "Upper Body", workoutType: "upper", duration: "35 min", exercisesCount: 5 },
  { dayNumber: 5, title: "Lower Body", workoutType: "lower", duration: "40 min", exercisesCount: 5 },
  { dayNumber: 6, title: "Core", workoutType: "core", duration: "25 min", exercisesCount: 4 },
  { dayNumber: 7, title: "Full Body", workoutType: "full", duration: "45 min", exercisesCount: 6 },
];

function getDefaultTemplate(day: number): WorkoutTemplate {
  const index = (day - 1) % DEFAULT_TEMPLATES.length;
  return { ...DEFAULT_TEMPLATES[index], dayNumber: day };
}

export function useWorkoutProgress(): WorkoutProgressData {
  const { user } = useAuth();
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [exerciseTemplates, setExerciseTemplates] = useState<WorkoutTemplate[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    workoutsCompleted: 0,
    totalWorkouts: TOTAL_PROGRAM_DAYS,
    streak: 0,
    xp: 0,
    currentDay: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWorkoutForDay = useCallback((day: number): WorkoutTemplate => {
    const status = dayStatuses.find(d => d.day === day);
    if (status) {
      return {
        dayNumber: day,
        title: status.title,
        workoutType: status.workoutType,
        duration: "35 min",
        exercisesCount: 5,
      };
    }
    const template = exerciseTemplates.find(t => t.dayNumber === day);
    if (template) return template;
    return getDefaultTemplate(day);
  }, [dayStatuses, exerciseTemplates]);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: workoutCompletions, error: completionsError } = await supabase
        .from("workout_completions")
        .select("*")
        .eq("user_id", user.id)
        .order("day_number", { ascending: true });

      if (completionsError) {
        console.error("Error fetching workout_completions:", completionsError);
        setError("Failed to load workout data");
        setIsLoading(false);
        return;
      }

      if (!workoutCompletions || workoutCompletions.length === 0) {
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

      const completedDayNumbers = workoutCompletions
        .filter(w => w.completed)
        .map(w => w.day_number);
      
      setCompletedDays(completedDayNumbers);

      let activeDay = 1;
      for (const workout of workoutCompletions) {
        if (!workout.completed) {
          activeDay = workout.day_number;
          break;
        }
        activeDay = workout.day_number + 1;
      }
      
      if (activeDay > workoutCompletions.length) {
        activeDay = workoutCompletions.length;
      }
      
      setCurrentDay(activeDay);

      const statuses: DayStatus[] = workoutCompletions.map(w => {
        let status: "completed" | "active" | "locked";
        
        if (w.completed) {
          status = "completed";
        } else if (w.day_number === activeDay) {
          status = "active";
        } else {
          status = "locked";
        }

        console.log(`CIRCLE Day ${w.day_number}: status=${status}, title=${w.title}`);

        return {
          day: w.day_number,
          status,
          title: w.title,
          workoutType: w.workout_type,
          workoutTemplateId: w.workout_template_id,
          exerciseTemplateId: w.exercise_template_id,
        };
      });

      setDayStatuses(statuses);

      const workoutsCompleted = completedDayNumbers.length;
      let streak = 0;
      for (let i = completedDayNumbers.length - 1; i >= 0; i--) {
        if (completedDayNumbers.includes(i + 1)) {
          streak++;
        } else {
          break;
        }
      }

      setUserStats({
        workoutsCompleted,
        totalWorkouts: workoutCompletions.length,
        streak,
        xp: workoutsCompleted * XP_PER_WORKOUT,
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

    if (dayNumber !== currentDay) {
      console.error(`Cannot complete day ${dayNumber}, current day is ${currentDay}`);
      return false;
    }

    if (completedDays.includes(dayNumber)) {
      console.log(`Day ${dayNumber} already completed`);
      return true;
    }

    setCompletedDays(prev => [...prev, dayNumber]);
    setCurrentDay(prev => prev + 1);
    setDayStatuses(prev => prev.map(ds => {
      if (ds.day === dayNumber) return { ...ds, status: "completed" as const };
      if (ds.day === dayNumber + 1) return { ...ds, status: "active" as const };
      return ds;
    }));
    setUserStats(prev => ({
      ...prev,
      workoutsCompleted: prev.workoutsCompleted + 1,
      streak: prev.streak + 1,
      xp: prev.xp + XP_PER_WORKOUT,
      currentDay: prev.currentDay + 1,
    }));

    try {
      const { error: updateError } = await supabase
        .from("workout_completions")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("day_number", dayNumber);

      if (updateError) {
        console.error("Error updating workout_completion:", updateError);
        await fetchProgress();
        return false;
      }

      console.log(`Workout day ${dayNumber} completed successfully`);
      return true;
    } catch (err) {
      console.error("Error completing workout:", err);
      await fetchProgress();
      return false;
    }
  }, [user?.id, currentDay, completedDays, fetchProgress]);

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
    exerciseTemplates,
  };
}
