import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkoutPlan, markWorkoutComplete } from "@/services/workoutPlanService";

interface DayStatus {
  day: number;
  status: "completed" | "active" | "locked";
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
      let plan = await getWorkoutPlan(user.id);

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

      // Find the first uncompleted day and auto-complete rest days that user has reached
      let activeDay = 1;
      let needsRefetch = false;
      
      for (const day of plan) {
        if (!day.completed) {
          if (day.workoutType === "rest") {
            // Auto-complete rest days when user reaches them
            console.log(`Auto-completing rest day ${day.dayNumber}`);
            try {
              await markWorkoutComplete(user.id, day.dayNumber);
              needsRefetch = true;
            } catch (err) {
              console.error("Failed to auto-complete rest day:", err);
            }
            continue; // Move to next day
          }
          activeDay = day.dayNumber;
          break;
        }
        activeDay = day.dayNumber + 1; // Move past completed days
        if (day.dayNumber === TOTAL_PROGRAM_DAYS) {
          activeDay = TOTAL_PROGRAM_DAYS;
        }
      }
      
      // If we auto-completed rest days, refetch to get updated data
      if (needsRefetch) {
        const updatedPlan = await getWorkoutPlan(user.id);
        plan = updatedPlan;
        // Recalculate completed days
        const updatedCompletedDays = plan.filter(p => p.completed).map(p => p.dayNumber);
        setCompletedDays(updatedCompletedDays);
      }
      
      setCurrentDay(activeDay);

      const statuses: DayStatus[] = plan.map(p => {
        let status: "completed" | "active" | "locked";

        if (p.completed) {
          status = "completed";
        } else if (p.dayNumber === activeDay) {
          status = "active";
        } else if (p.dayNumber < activeDay) {
          // Days before active day should be completed (catches edge cases)
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

      // Update Supabase: swap workout_type and title between the two days
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

      // Update local state to swap the workout types and titles
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

      console.log(`Swapped Day ${fromDay} with Day ${toDay} in Supabase`);
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

  const changeWorkoutType = useCallback(async (dayNumber: number, newType: string, newTitle: string): Promise<boolean> => {
    if (!user?.id) {
      console.error("No user logged in");
      return false;
    }

    try {
      const { error } = await supabase
        .from("workout_completions")
        .update({ 
          title: newTitle, 
          workout_type: newType 
        })
        .eq("user_id", user.id)
        .eq("day_number", dayNumber);

      if (error) {
        console.error("Error updating workout type in Supabase:", error);
        return false;
      }

      setDayStatuses(prev => prev.map(ds => {
        if (ds.day === dayNumber) {
          return {
            ...ds,
            title: newTitle,
            workoutType: newType,
          };
        }
        return ds;
      }));

      console.log(`Changed Day ${dayNumber} to ${newTitle} in Supabase`);
      return true;
    } catch (err) {
      console.error("Error changing workout type:", err);
      return false;
    }
  }, [user?.id]);

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

      console.log(`Moved workout from Day ${fromDay} to Day ${toDay} in Supabase`);
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
  };
}
