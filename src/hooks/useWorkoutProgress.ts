import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  push: { name: "Push", duration: "35 min", exercises: 5 },
  pull: { name: "Pull", duration: "40 min", exercises: 5 },
  legs: { name: "Legs", duration: "45 min", exercises: 6 },
  upper: { name: "Upper Body", duration: "35 min", exercises: 5 },
  lower: { name: "Lower Body", duration: "40 min", exercises: 5 },
  core: { name: "Core", duration: "25 min", exercises: 4 },
  full: { name: "Full Body", duration: "45 min", exercises: 6 },
  cardio: { name: "Cardio", duration: "30 min", exercises: 4 },
  rest: { name: "Rest Day", duration: "0 min", exercises: 0 },
};

interface StoredPreferences {
  trainingDays: string[];
  selectedWorkouts: string[];
  startDate: string;
}

function getStoredPreferences(): StoredPreferences | null {
  try {
    const stored = localStorage.getItem("mgp_workout_preferences");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading preferences:", e);
  }
  return null;
}

function generate21DayPlan(preferences: StoredPreferences): Array<{ day: number; title: string; workoutType: string }> {
  const startDate = new Date(preferences.startDate);
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const plan: Array<{ day: number; title: string; workoutType: string }> = [];
  
  let workoutIndex = 0;
  
  for (let dayNum = 1; dayNum <= TOTAL_PROGRAM_DAYS; dayNum++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayNum - 1);
    const dayOfWeek = dayOrder[currentDate.getDay()];
    
    if (preferences.trainingDays.includes(dayOfWeek)) {
      const workoutType = preferences.selectedWorkouts[workoutIndex % preferences.selectedWorkouts.length];
      const info = WORKOUT_INFO[workoutType] || { name: workoutType };
      plan.push({ day: dayNum, title: info.name, workoutType });
      workoutIndex++;
    } else {
      plan.push({ day: dayNum, title: "Rest Day", workoutType: "rest" });
    }
  }
  
  return plan;
}

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
    setIsLoading(true);
    setError(null);

    try {
      const preferences = getStoredPreferences();
      
      if (!preferences) {
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

      const plan = generate21DayPlan(preferences);
      
      let completedDayNumbers: number[] = [];
      
      if (user?.id) {
        const { data: completions, error: fetchError } = await supabase
          .from("workout_completions")
          .select("day_number")
          .eq("user_id", user.id)
          .eq("completed", true);
        
        if (!fetchError && completions) {
          completedDayNumbers = completions.map(c => c.day_number);
        }
      }
      
      setCompletedDays(completedDayNumbers);
      
      let activeDay = 1;
      for (let d = 1; d <= TOTAL_PROGRAM_DAYS; d++) {
        const dayPlan = plan.find(p => p.day === d);
        const isRestDay = dayPlan?.workoutType === "rest";
        
        if (isRestDay) {
          continue;
        }
        
        if (!completedDayNumbers.includes(d)) {
          activeDay = d;
          break;
        }
        
        if (d === TOTAL_PROGRAM_DAYS) {
          activeDay = TOTAL_PROGRAM_DAYS;
        }
      }
      setCurrentDay(activeDay);
      
      const statuses: DayStatus[] = plan.map(p => {
        let status: "completed" | "active" | "locked";
        
        if (completedDayNumbers.includes(p.day)) {
          status = "completed";
        } else if (p.day === activeDay) {
          status = "active";
        } else {
          status = "locked";
        }
        
        return {
          day: p.day,
          status,
          title: p.title,
          workoutType: p.workoutType,
        };
      });
      
      setDayStatuses(statuses);
      
      let streak = 0;
      const sortedCompleted = [...completedDayNumbers].sort((a, b) => b - a);
      for (let i = 0; i < sortedCompleted.length; i++) {
        const expectedDay = activeDay - 1 - i;
        if (sortedCompleted[i] === expectedDay && expectedDay > 0) {
          streak++;
        } else {
          break;
        }
      }
      
      setUserStats({
        workoutsCompleted: completedDayNumbers.length,
        totalWorkouts: TOTAL_PROGRAM_DAYS,
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
    console.log("Completing workout:", { dayNumber, currentDay, dayInfo, completedDays });
    
    if (dayInfo?.workoutType === "rest") {
      console.log(`Day ${dayNumber} is a rest day, skipping`);
      return false;
    }

    if (completedDays.includes(dayNumber)) {
      console.log(`Day ${dayNumber} already completed`);
      return true;
    }

    // Get the workout title from the day info or use a fallback
    const workoutTitle = dayInfo?.title || "Workout";
    const workoutType = dayInfo?.workoutType || "full";

    try {
      console.log("Inserting workout completion:", {
        user_id: user.id,
        day_number: dayNumber,
        title: workoutTitle,
        workout_type: workoutType,
      });

      const { error: insertError } = await supabase
        .from("workout_completions")
        .insert({
          user_id: user.id,
          day_number: dayNumber,
          title: workoutTitle,
          workout_type: workoutType,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error inserting workout_completion:", insertError);
        console.error("Insert error details:", JSON.stringify(insertError));
        return false;
      }

      console.log(`Workout day ${dayNumber} saved to Supabase successfully`);
      
      // Update local state only after successful save
      setCompletedDays(prev => [...prev, dayNumber]);
      
      // Find next active day (skip rest days)
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
