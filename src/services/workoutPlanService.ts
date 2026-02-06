import { supabase } from "@/integrations/supabase/client";

const TOTAL_PROGRAM_DAYS = 21;

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

const WORKOUT_INFO: Record<string, { name: string; duration: string; exercises: number }> = {
  chest: { name: "Chest", duration: "35 min", exercises: 5 },
  back: { name: "Back", duration: "35 min", exercises: 5 },
  shoulders: { name: "Shoulders", duration: "30 min", exercises: 4 },
  arms: { name: "Arms", duration: "35 min", exercises: 5 },
  biceps: { name: "Biceps", duration: "25 min", exercises: 4 },
  triceps: { name: "Triceps", duration: "25 min", exercises: 4 },
  legs: { name: "Legs", duration: "40 min", exercises: 5 },
  quads: { name: "Quads", duration: "30 min", exercises: 4 },
  hamstrings: { name: "Hamstrings", duration: "30 min", exercises: 4 },
  glutes: { name: "Glutes", duration: "30 min", exercises: 4 },
  core: { name: "Core", duration: "25 min", exercises: 4 },
  chest_shoulders: { name: "Chest + Shoulders", duration: "45 min", exercises: 6 },
  back_arms: { name: "Back + Arms", duration: "45 min", exercises: 6 },
  chest_back: { name: "Chest + Back", duration: "45 min", exercises: 6 },
  shoulders_arms: { name: "Shoulders + Arms", duration: "40 min", exercises: 6 },
  legs_core: { name: "Legs + Core", duration: "45 min", exercises: 6 },
  cardio: { name: "Cardio", duration: "30 min", exercises: 4 },
  full: { name: "Full Body", duration: "45 min", exercises: 6 },
  rest: { name: "Rest Day", duration: "0 min", exercises: 0 },
};

interface OnboardingData {
  coachName: string;
  userName: string;
  gender: string;
  assistantType: string;
  weight: { value: number; unit: string };
  goals: string[];
  muscleFocus?: string[];
  experience: string;
  trainingDays: string[];
  selectedWorkouts: string[];
  hasInjuries: boolean;
  additionalInfo?: string;
}

// Parse user's additional info to extract muscle focus preferences
function parseMuscleFocus(additionalInfo: string, defaultWorkouts: string[]): string[] {
  if (!additionalInfo || additionalInfo.trim() === '') {
    return defaultWorkouts.length > 0 ? defaultWorkouts : ['full'];
  }
  
  const text = additionalInfo.toLowerCase();
  const detectedMuscles: string[] = [];
  
  // Check for muscle group keywords
  const muscleKeywords: Record<string, string[]> = {
    chest: ['chest', 'pecs', 'pectoral', 'bench'],
    back: ['back', 'lats', 'latissimus', 'pull-up', 'pullup', 'row'],
    shoulders: ['shoulder', 'delts', 'deltoid', 'press'],
    arms: ['arm', 'bicep', 'tricep', 'curl'],
    biceps: ['bicep', 'biceps', 'front arm'],
    triceps: ['tricep', 'triceps', 'back arm'],
    legs: ['leg', 'quad', 'hamstring', 'glute', 'squat', 'lunge', 'calf', 'calves'],
    core: ['core', 'abs', 'abdominal', 'stomach', 'plank', 'crunch'],
    full: ['full body', 'everything', 'all muscles', 'total body', 'whole body'],
  };
  
  for (const [muscle, keywords] of Object.entries(muscleKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      detectedMuscles.push(muscle);
    }
  }
  
  // If user mentioned specific muscles, use those
  if (detectedMuscles.length > 0) {
    // Remove duplicates (e.g., if biceps and arms both detected, keep arms)
    if (detectedMuscles.includes('biceps') || detectedMuscles.includes('triceps')) {
      const filtered = detectedMuscles.filter(m => m !== 'arms');
      if (!filtered.includes('biceps') && !filtered.includes('triceps')) {
        return detectedMuscles;
      }
      return filtered;
    }
    return [...new Set(detectedMuscles)];
  }
  
  // Fall back to default or full body
  return defaultWorkouts.length > 0 ? defaultWorkouts : ['full'];
}

export async function saveOnboardingAndGeneratePlan(
  userId: string,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use explicit muscle focus from onboarding if available, otherwise parse from additionalInfo
    const focusWorkouts = (data.muscleFocus && data.muscleFocus.length > 0)
      ? data.muscleFocus
      : parseMuscleFocus(data.additionalInfo || '', data.selectedWorkouts);
    
    const { error: prefsError } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: userId,
          training_days: data.trainingDays,
          selected_workouts: focusWorkouts,
          onboarding_completed: false,
        },
        { onConflict: "user_id" }
      );

    if (prefsError) {
      console.error("Error upserting preferences:", prefsError);
      return { success: false, error: prefsError.message };
    }

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const startDateStr = toLocalDateStr(startDate);

    // Store start date in localStorage as fallback (Supabase column may not exist)
    try {
      localStorage.setItem(`mgp_start_date_${userId}`, startDateStr);
    } catch (e) {
      // localStorage not available
    }

    const plan = generate21DayPlan(startDate, data.trainingDays, focusWorkouts);

    const completionRows = plan.map((day) => ({
      user_id: userId,
      day_number: day.dayNumber,
      title: day.title,
      workout_type: day.workoutType,
      completed: false,
    }));

    // Always delete existing workout data and create fresh plan
    const { error: deleteError } = await supabase
      .from("workout_completions")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting old workout data:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Wait a moment for delete to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Insert new 21-day plan
    const { error: completionsError } = await supabase
      .from("workout_completions")
      .insert(completionRows);

    if (completionsError) {
      console.error("Error inserting workout completions:", completionsError);
      return { success: false, error: completionsError.message };
    }

    // Verify the plan was created successfully
    const { count, error: countError } = await supabase
      .from("workout_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError || count !== TOTAL_PROGRAM_DAYS) {
      console.error("Workout plan incomplete:", { count, expected: TOTAL_PROGRAM_DAYS });
      return { success: false, error: `Expected ${TOTAL_PROGRAM_DAYS} workouts but found ${count}` };
    }

    const { error: finalUpdateError } = await supabase
      .from("user_preferences")
      .update({ onboarding_completed: true })
      .eq("user_id", userId);

    if (finalUpdateError) {
      console.error("Error marking onboarding complete:", finalUpdateError);
      return { success: false, error: finalUpdateError.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in saveOnboardingAndGeneratePlan:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

function generate21DayPlan(
  startDate: Date,
  trainingDays: string[],
  selectedWorkouts: string[]
): Array<{ dayNumber: number; title: string; workoutType: string; date: string }> {
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const plan: Array<{ dayNumber: number; title: string; workoutType: string; date: string }> = [];

  let workoutIndex = 0;

  for (let dayNum = 1; dayNum <= TOTAL_PROGRAM_DAYS; dayNum++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayNum - 1);
    const dayOfWeek = dayOrder[currentDate.getDay()];
    const dateStr = toLocalDateStr(currentDate);

    if (trainingDays.includes(dayOfWeek)) {
      const workoutType = selectedWorkouts[workoutIndex % selectedWorkouts.length];
      const info = WORKOUT_INFO[workoutType] || { name: workoutType };
      plan.push({
        dayNumber: dayNum,
        title: info.name,
        workoutType,
        date: dateStr,
      });
      workoutIndex++;
    } else {
      plan.push({
        dayNumber: dayNum,
        title: "Rest Day",
        workoutType: "rest",
        date: dateStr,
      });
    }
  }

  return plan;
}

export async function checkUserHasWorkoutPlan(userId: string): Promise<boolean> {
  try {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("onboarding_completed")
      .eq("user_id", userId)
      .single();

    if (prefs?.onboarding_completed) {
      const { data: completions } = await supabase
        .from("workout_completions")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (completions && completions.length > 0) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error("Error checking workout plan:", err);
    return false;
  }
}

export async function getUserPreferences(userId: string): Promise<{
  trainingDays: string[];
  selectedWorkouts: string[];
  onboardingCompleted: boolean;
} | null> {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("training_days, selected_workouts, onboarding_completed")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      trainingDays: data.training_days || [],
      selectedWorkouts: data.selected_workouts || [],
      onboardingCompleted: data.onboarding_completed || false,
    };
  } catch (err) {
    console.error("Error getting user preferences:", err);
    return null;
  }
}

export async function getWorkoutPlan(userId: string): Promise<Array<{
  dayNumber: number;
  title: string;
  workoutType: string;
  completed: boolean;
  date: string;
  status: "not_started" | "completed" | "skipped";
}>> {
  try {
    const { data, error } = await supabase
      .from("workout_completions")
      .select("day_number, title, workout_type, completed, completed_at, created_at")
      .eq("user_id", userId)
      .order("day_number", { ascending: true });

    if (error) {
      console.error("Error fetching workout plan:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const day1 = data.find(d => d.day_number === 1);
    let startDate: Date;
    
    if (day1?.created_at) {
      const createdDate = new Date(day1.created_at);
      startDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate(), 0, 0, 0, 0);
    } else {
      let startDateStr: string | null = null;
      try {
        startDateStr = localStorage.getItem(`mgp_start_date_${userId}`);
      } catch (e) {
        // localStorage not available
      }
      startDate = startDateStr ? parseLocalDate(startDateStr) : new Date();
      startDate.setHours(0, 0, 0, 0);
    }

    return data.map((row) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + row.day_number - 1);
      const dateStr = toLocalDateStr(date);

      let status: "not_started" | "completed" | "skipped";
      if (!row.completed) {
        status = "not_started";
      } else if (row.completed_at) {
        status = "completed";
      } else {
        status = "skipped";
      }
      
      return {
        dayNumber: row.day_number,
        title: row.title || "Workout",
        workoutType: row.workout_type || "full",
        completed: row.completed || false,
        date: dateStr,
        status,
      };
    });
  } catch (err) {
    console.error("Error fetching workout plan:", err);
    return [];
  }
}

export async function markWorkoutSkipped(
  userId: string,
  dayNumber: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("workout_completions")
      .update({
        completed: true,
        completed_at: null,
      })
      .eq("user_id", userId)
      .eq("day_number", dayNumber);

    if (error) {
      console.error("Error marking workout skipped:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error marking workout skipped:", err);
    return false;
  }
}

export async function autoSkipPastWorkouts(
  userId: string,
  programStartDate: Date
): Promise<number> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const { data, error } = await supabase
      .from("workout_completions")
      .select("day_number, workout_type")
      .eq("user_id", userId)
      .eq("completed", false)
      .neq("workout_type", "rest");

    if (error || !data || data.length === 0) {
      return 0;
    }

    const startDate = new Date(programStartDate.getFullYear(), programStartDate.getMonth(), programStartDate.getDate(), 0, 0, 0, 0);

    const todayStr = toLocalDateStr(today);

    const daysToSkip: number[] = [];
    for (const row of data) {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(startDate.getDate() + row.day_number - 1);
      const scheduledStr = toLocalDateStr(scheduledDate);

      if (scheduledStr < todayStr) {
        daysToSkip.push(row.day_number);
      }
    }

    let skippedCount = 0;

    if (daysToSkip.length > 0) {
      const { error: updateError } = await supabase
        .from("workout_completions")
        .update({ completed: true, completed_at: null })
        .eq("user_id", userId)
        .in("day_number", daysToSkip);

      if (updateError) {
        console.error("Error auto-skipping workouts:", updateError);
      } else {
        skippedCount += daysToSkip.length;
      }
    }

    const { data: restData, error: restError } = await supabase
      .from("workout_completions")
      .select("day_number, workout_type")
      .eq("user_id", userId)
      .eq("completed", false)
      .eq("workout_type", "rest");

    if (!restError && restData && restData.length > 0) {
      const restDaysToComplete: number[] = [];
      for (const row of restData) {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(startDate.getDate() + row.day_number - 1);
        const scheduledStr = toLocalDateStr(scheduledDate);
        if (scheduledStr < todayStr) {
          restDaysToComplete.push(row.day_number);
        }
      }
      if (restDaysToComplete.length > 0) {
        await supabase
          .from("workout_completions")
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq("user_id", userId)
          .in("day_number", restDaysToComplete);
        skippedCount += restDaysToComplete.length;
      }
    }

    return skippedCount;
  } catch (err) {
    console.error("Error in autoSkipPastWorkouts:", err);
    return 0;
  }
}

export async function markWorkoutComplete(
  userId: string,
  dayNumber: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("workout_completions")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("day_number", dayNumber);

    if (error) {
      console.error("Error marking workout complete:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error marking workout complete:", err);
    return false;
  }
}
