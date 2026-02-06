import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkoutPlan, markWorkoutComplete, autoSkipPastWorkouts } from "@/services/workoutPlanService";

function toLocalDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

interface DayStatus {
  day: number;
  status: "completed" | "active" | "locked" | "skipped";
  title: string;
  workoutType: string;
  date: string;
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
  swapWorkouts: (fromDay: number, toDay: number) => Promise<boolean>;
  changeWorkoutType: (dayNumber: number, newType: string, newTitle: string) => Promise<boolean>;
  moveWorkout: (fromDay: number, toDay: number) => Promise<boolean>;
  getWorkoutForDay: (day: number) => WorkoutTemplate;
  exerciseTemplates: WorkoutTemplate[];
  isTodayCompleted: boolean;
  todayIsRestDay: boolean;
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
  const [isTodayCompleted, setIsTodayCompleted] = useState(false);
  const [todayIsRestDay, setTodayIsRestDay] = useState(false);
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
      setIsTodayCompleted(false);
      setTodayIsRestDay(false);
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
      let plan = await getWorkoutPlan(user.id);

      if (plan.length === 0) {
        setDayStatuses([]);
        setCompletedDays([]);
        setCurrentDay(1);
        setIsTodayCompleted(false);
        setTodayIsRestDay(false);
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

      const day1 = plan.find(p => p.dayNumber === 1);
      if (day1) {
        const startDate = parseLocalDate(day1.date);
        const skippedCount = await autoSkipPastWorkouts(user.id, startDate);
        if (skippedCount > 0) {
          plan = await getWorkoutPlan(user.id);
        }
      }

      const now = new Date();
      const todayStr = toLocalDateStr(now);
      const todaysPlan = plan.find(p => p.date === todayStr);

      let activeDay: number;
      if (!todaysPlan) {
        const firstDay = plan[0];
        const lastDay = plan[plan.length - 1];
        if (todayStr < firstDay.date) {
          activeDay = 1;
        } else {
          activeDay = lastDay.dayNumber;
        }
      } else {
        activeDay = todaysPlan.dayNumber;
      }

      setIsTodayCompleted(todaysPlan?.status === "completed" || todaysPlan?.status === "skipped" || false);
      setTodayIsRestDay(todaysPlan?.workoutType === "rest" || false);

      const completedDayNumbers = plan
        .filter(p => p.status === "completed")
        .map(p => p.dayNumber);
      
      setCompletedDays(completedDayNumbers);
      setCurrentDay(activeDay);

      const statuses: DayStatus[] = plan.map(p => {
        let status: "completed" | "active" | "locked" | "skipped";

        if (p.status === "completed") {
          status = "completed";
        } else if (p.status === "skipped") {
          status = "skipped";
        } else if (p.dayNumber === activeDay && p.status === "not_started") {
          status = "active";
        } else if (p.date < todayStr && p.workoutType !== "rest") {
          status = "skipped";
        } else if (p.date < todayStr && p.workoutType === "rest") {
          status = "completed";
        } else {
          status = "locked";
        }

        return {
          day: p.dayNumber,
          status,
          title: p.title,
          workoutType: p.workoutType,
          date: p.date,
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
        if (workoutDays[i].status === "completed") {
          streak++;
        } else {
          break;
        }
      }

      const totalActualWorkouts = plan.filter(p => p.workoutType !== "rest").length;
      const trulyCompleted = plan.filter(p => p.status === "completed" && p.workoutType !== "rest").length;

      setUserStats({
        workoutsCompleted: trulyCompleted,
        totalWorkouts: totalActualWorkouts,
        streak,
        xp: trulyCompleted * XP_PER_WORKOUT,
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
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchProgress]);

  const swapWorkouts = useCallback(async (fromDay: number, toDay: number): Promise<boolean> => {
    if (!user?.id) {
      console.error("No user logged in");
      return false;
    }

    try {
      const fromDayInfo = dayStatuses.find(d => d.day === fromDay);
      const toDayInfo = dayStatuses.find(d => d.day === toDay);

      if (!fromDayInfo || !toDayInfo) {
        console.error("Could not find day info for swap");
        return false;
      }

      const { error: error1 } = await supabase
        .from("workout_completions")
        .update({ 
          title: toDayInfo.title, 
          workout_type: toDayInfo.workoutType 
        })
        .eq("user_id", user.id)
        .eq("day_number", fromDay);

      if (error1) {
        console.error("Error updating fromDay in Supabase:", error1);
        return false;
      }

      const { error: error2 } = await supabase
        .from("workout_completions")
        .update({ 
          title: fromDayInfo.title, 
          workout_type: fromDayInfo.workoutType 
        })
        .eq("user_id", user.id)
        .eq("day_number", toDay);

      if (error2) {
        console.error("Error updating toDay in Supabase:", error2);
        return false;
      }

      setDayStatuses(prev => prev.map(ds => {
        if (ds.day === fromDay) {
          return {
            ...ds,
            title: toDayInfo.title,
            workoutType: toDayInfo.workoutType,
          };
        }
        if (ds.day === toDay) {
          return {
            ...ds,
            title: fromDayInfo.title,
            workoutType: fromDayInfo.workoutType,
          };
        }
        return ds;
      }));

      return true;
    } catch (err) {
      console.error("Error swapping workouts:", err);
      return false;
    }
  }, [user?.id, dayStatuses]);

  const completeWorkout = useCallback(async (dayNumber: number): Promise<boolean> => {
    if (!user?.id) {
      console.error("No user logged in");
      return false;
    }

    const dayInfo = dayStatuses.find(d => d.day === dayNumber);

    if (dayInfo?.workoutType === "rest") {
      return false;
    }

    if (completedDays.includes(dayNumber)) {
      return true;
    }

    try {
      const success = await markWorkoutComplete(user.id, dayNumber);

      if (!success) {
        return false;
      }

      setCompletedDays(prev => [...prev, dayNumber]);
      setIsTodayCompleted(true);

      setDayStatuses(prev => prev.map(ds => {
        if (ds.day === dayNumber) return { ...ds, status: "completed" as const };
        return ds;
      }));

      setUserStats(prev => ({
        ...prev,
        workoutsCompleted: prev.workoutsCompleted + 1,
        streak: prev.streak + 1,
        xp: prev.xp + XP_PER_WORKOUT,
      }));

      return true;
    } catch (err) {
      console.error("Error completing workout:", err);
      return false;
    }
  }, [user?.id, completedDays, dayStatuses]);

  const changeWorkoutType = useCallback(async (dayNumber: number, newType: string, newTitle: string): Promise<boolean> => {
    if (!user?.id) {
      console.error("No user logged in");
      return false;
    }

    try {
      const currentStatus = dayStatuses.find(ds => ds.day === dayNumber);
      const wasRestDay = currentStatus?.workoutType === "rest";
      const changingToWorkout = newType !== "rest";
      
      const updateData: Record<string, unknown> = { 
        title: newTitle, 
        workout_type: newType 
      };
      
      if (wasRestDay && changingToWorkout) {
        updateData.completed = false;
        updateData.completed_at = null;
      }
      
      const { error } = await supabase
        .from("workout_completions")
        .update(updateData)
        .eq("user_id", user.id)
        .eq("day_number", dayNumber);

      if (error) {
        console.error("Error updating workout type in Supabase:", error);
        return false;
      }

      setDayStatuses(prev => prev.map(ds => {
        if (ds.day === dayNumber) {
          let newStatus = ds.status;
          if (wasRestDay && changingToWorkout) {
            if (dayNumber === currentDay) {
              newStatus = "active";
            } else {
              newStatus = "locked";
            }
          }
          return {
            ...ds,
            title: newTitle,
            workoutType: newType,
            status: newStatus,
          };
        }
        return ds;
      }));

      return true;
    } catch (err) {
      console.error("Error changing workout type:", err);
      return false;
    }
  }, [user?.id, dayStatuses, currentDay]);

  const moveWorkout = useCallback(async (fromDay: number, toDay: number): Promise<boolean> => {
    if (!user?.id) {
      console.error("No user logged in");
      return false;
    }

    try {
      const fromDayInfo = dayStatuses.find(d => d.day === fromDay);
      const toDayInfo = dayStatuses.find(d => d.day === toDay);

      if (!fromDayInfo || !toDayInfo) {
        console.error("Could not find day info for move");
        return false;
      }

      const { error: error1 } = await supabase
        .from("workout_completions")
        .update({ 
          title: fromDayInfo.title, 
          workout_type: fromDayInfo.workoutType 
        })
        .eq("user_id", user.id)
        .eq("day_number", toDay);

      if (error1) {
        console.error("Error updating toDay in Supabase:", error1);
        return false;
      }

      const { error: error2 } = await supabase
        .from("workout_completions")
        .update({ 
          title: "Rest Day", 
          workout_type: "rest" 
        })
        .eq("user_id", user.id)
        .eq("day_number", fromDay);

      if (error2) {
        console.error("Error updating fromDay to rest in Supabase:", error2);
        return false;
      }

      setDayStatuses(prev => prev.map(ds => {
        if (ds.day === fromDay) {
          return {
            ...ds,
            title: "Rest Day",
            workoutType: "rest",
          };
        }
        if (ds.day === toDay) {
          return {
            ...ds,
            title: fromDayInfo.title,
            workoutType: fromDayInfo.workoutType,
          };
        }
        return ds;
      }));

      return true;
    } catch (err) {
      console.error("Error moving workout:", err);
      return false;
    }
  }, [user?.id, dayStatuses]);

  return {
    dayStatuses,
    currentDay,
    completedDays,
    userStats,
    isLoading,
    error,
    refetch: fetchProgress,
    completeWorkout,
    swapWorkouts,
    changeWorkoutType,
    moveWorkout,
    getWorkoutForDay,
    exerciseTemplates: [],
    isTodayCompleted,
    todayIsRestDay,
  };
}
