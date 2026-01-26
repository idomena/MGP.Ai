import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type UserProgress = Tables<"user_progress">;
type ExerciseTemplate = Tables<"exercise_templates">;
type WorkoutCompletion = Tables<"workout_completions">;

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

const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  { dayNumber: 1, title: "Chest", workoutType: "Chest", duration: "35 min", exercisesCount: 5 },
  { dayNumber: 2, title: "Back", workoutType: "Back", duration: "40 min", exercisesCount: 5 },
  { dayNumber: 3, title: "Legs", workoutType: "Legs", duration: "45 min", exercisesCount: 6 },
  { dayNumber: 4, title: "Shoulders", workoutType: "Shoulders", duration: "30 min", exercisesCount: 4 },
  { dayNumber: 5, title: "Arms", workoutType: "Arms", duration: "35 min", exercisesCount: 5 },
  { dayNumber: 6, title: "Core", workoutType: "Core", duration: "25 min", exercisesCount: 4 },
  { dayNumber: 7, title: "Rest Day", workoutType: "Recovery", duration: "0 min", exercisesCount: 0 },
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
    const template = exerciseTemplates.find(t => t.dayNumber === day);
    if (template) return template;
    return getDefaultTemplate(day);
  }, [exerciseTemplates]);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch or create user_progress
      let userProgress: UserProgress | null = null;
      
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (progressError && progressError.code === "PGRST116") {
        // No row exists, create one
        const { data: newProgress, error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            current_day: 1,
            workouts_completed: 0,
            streak: 0,
            xp: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user_progress:", insertError);
        } else {
          userProgress = newProgress;
        }
      } else if (progressError) {
        console.error("Error fetching user_progress:", progressError);
      } else {
        userProgress = progressData;
      }

      const userCurrentDay = userProgress?.current_day ?? 1;
      setCurrentDay(userCurrentDay);
      
      setUserStats({
        workoutsCompleted: userProgress?.workouts_completed ?? 0,
        totalWorkouts: TOTAL_PROGRAM_DAYS,
        streak: userProgress?.streak ?? 0,
        xp: userProgress?.xp ?? 0,
        currentDay: userCurrentDay,
      });

      // 2. Fetch exercise_templates
      const { data: templates, error: templatesError } = await supabase
        .from("exercise_templates")
        .select("*")
        .order("day_number", { ascending: true });

      let workoutTemplates: WorkoutTemplate[] = [];
      
      if (templatesError) {
        console.error("Error fetching exercise_templates:", templatesError);
        // Use default templates
        workoutTemplates = Array.from({ length: TOTAL_PROGRAM_DAYS }, (_, i) => getDefaultTemplate(i + 1));
      } else if (templates && templates.length > 0) {
        workoutTemplates = templates.map(t => ({
          dayNumber: t.day_number,
          title: t.title,
          workoutType: t.workout_type,
          duration: t.duration,
          exercisesCount: t.exercises_count,
        }));
      } else {
        // No templates in DB, use defaults
        workoutTemplates = Array.from({ length: TOTAL_PROGRAM_DAYS }, (_, i) => getDefaultTemplate(i + 1));
      }
      
      setExerciseTemplates(workoutTemplates);

      // 3. Fetch workout_completions (with title for workout names)
      const { data: completions, error: completionsError } = await supabase
        .from("workout_completions")
        .select("day_number, title, workout_type")
        .eq("user_id", user.id);

      let completedDayNumbers: number[] = [];
      const completionTitles: Record<number, { title: string; workoutType: string }> = {};
      
      if (completionsError) {
        console.error("Error fetching workout_completions:", completionsError);
      } else if (completions) {
        completedDayNumbers = completions.map(c => c.day_number);
        // Store titles from completions for display
        completions.forEach(c => {
          if (c.title) {
            completionTitles[c.day_number] = {
              title: c.title,
              workoutType: c.workout_type || c.title,
            };
          }
        });
      }
      
      setCompletedDays(completedDayNumbers);

      // Calculate current day: if user_progress doesn't exist, use max completed + 1
      let effectiveCurrentDay = userCurrentDay;
      if (!userProgress && completedDayNumbers.length > 0) {
        effectiveCurrentDay = Math.max(...completedDayNumbers) + 1;
        if (effectiveCurrentDay > TOTAL_PROGRAM_DAYS) {
          effectiveCurrentDay = TOTAL_PROGRAM_DAYS;
        }
        setCurrentDay(effectiveCurrentDay);
        setUserStats(prev => ({ ...prev, currentDay: effectiveCurrentDay }));
      }

      // 4. Build day statuses - STRICT LOGIC
      const statuses: DayStatus[] = [];
      for (let day = 1; day <= TOTAL_PROGRAM_DAYS; day++) {
        const template = workoutTemplates.find(t => t.dayNumber === day) || getDefaultTemplate(day);
        
        // Use title from workout_completions if available, else from template
        const completionData = completionTitles[day];
        const displayTitle = completionData?.title || template.title;
        const displayType = completionData?.workoutType || template.workoutType;
        
        let status: "completed" | "active" | "locked";
        if (completedDayNumbers.includes(day)) {
          status = "completed";
        } else if (day === effectiveCurrentDay) {
          status = "active";
        } else {
          status = "locked";
        }

        statuses.push({
          day,
          status,
          title: displayTitle,
          workoutType: displayType,
        });

        console.log(`CIRCLE Day ${day}: status=${status}, title=${displayTitle}`);
      }
      
      setDayStatuses(statuses);

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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log("Real-time update: user_progress changed");
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

    const template = getWorkoutForDay(dayNumber);

    // Optimistic UI update
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
      // 1. Insert workout_completions
      const { error: insertError } = await supabase
        .from("workout_completions")
        .insert({
          user_id: user.id,
          day_number: dayNumber,
          title: template.title,
          workout_type: template.workoutType,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error inserting workout_completion:", insertError);
        await fetchProgress(); // Revert to actual state
        return false;
      }

      // 2. Update user_progress
      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          current_day: dayNumber + 1,
          workouts_completed: userStats.workoutsCompleted + 1,
          streak: userStats.streak + 1,
          xp: userStats.xp + XP_PER_WORKOUT,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating user_progress:", updateError);
        await fetchProgress(); // Revert to actual state
        return false;
      }

      console.log(`Workout day ${dayNumber} completed successfully`);
      return true;
    } catch (err) {
      console.error("Error completing workout:", err);
      await fetchProgress(); // Revert to actual state
      return false;
    }
  }, [user?.id, currentDay, completedDays, getWorkoutForDay, userStats, fetchProgress]);

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
