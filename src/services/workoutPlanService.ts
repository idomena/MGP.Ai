import { supabase } from "@/integrations/supabase/client";

const TOTAL_PROGRAM_DAYS = 21;

const WORKOUT_INFO: Record<string, { name: string; duration: string; exercises: number }> = {
  chest_triceps: { name: "Chest & Triceps", duration: "40 min", exercises: 6 },
  back_biceps: { name: "Back & Biceps", duration: "40 min", exercises: 6 },
  shoulders_legs: { name: "Shoulders & Legs", duration: "45 min", exercises: 6 },
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
  experience: string;
  trainingDays: string[];
  selectedWorkouts: string[];
  hasInjuries: boolean;
  additionalInfo?: string;
}

export async function saveOnboardingAndGeneratePlan(
  userId: string,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: prefsError } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: userId,
          training_days: data.trainingDays,
          selected_workouts: data.selectedWorkouts,
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
    const startDateStr = startDate.toISOString().split("T")[0];

    // Store start date in localStorage as fallback (Supabase column may not exist)
    try {
      localStorage.setItem(`mgp_start_date_${userId}`, startDateStr);
    } catch (e) {
      // localStorage not available
    }

    const plan = generate21DayPlan(startDate, data.trainingDays, data.selectedWorkouts);

    const completionRows = plan.map((day) => ({
      user_id: userId,
      day_number: day.dayNumber,
      title: day.title,
      workout_type: day.workoutType,
      completed: false,
    }));

    // Always delete existing workout data and create fresh plan
    console.log("Clearing any existing workout data for user:", userId);
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
    console.log("Inserting 21-day workout plan...");
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

    console.log("Verification count:", count);

    if (countError || count !== TOTAL_PROGRAM_DAYS) {
      console.error("Workout plan incomplete:", { count, expected: TOTAL_PROGRAM_DAYS });
      return { success: false, error: `Expected ${TOTAL_PROGRAM_DAYS} workouts but found ${count}` };
    }

    console.log("Successfully ensured 21-day workout plan exists");

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
    const dateStr = currentDate.toISOString().split("T")[0];

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
}>> {
  try {
    const { data, error } = await supabase
      .from("workout_completions")
      .select("day_number, title, workout_type, completed, created_at")
      .eq("user_id", userId)
      .order("day_number", { ascending: true });

    if (error) {
      console.error("Error fetching workout plan:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Calculate start_date from Day 1's created_at (database is source of truth)
    const day1 = data.find(d => d.day_number === 1);
    let startDate: Date;
    
    if (day1?.created_at) {
      // Day 1's created_at is the program start date
      startDate = new Date(day1.created_at);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Fallback: check localStorage, then default to today
      let startDateStr: string | null = null;
      try {
        startDateStr = localStorage.getItem(`mgp_start_date_${userId}`);
      } catch (e) {
        // localStorage not available
      }
      startDate = startDateStr ? new Date(startDateStr) : new Date();
    }

    return data.map((row) => {
      // Calculate date from day_number
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + row.day_number - 1);
      const dateStr = date.toISOString().split("T")[0];
      
      return {
        dayNumber: row.day_number,
        title: row.title || "Workout",
        workoutType: row.workout_type || "full",
        completed: row.completed || false,
        date: dateStr,
      };
    });
  } catch (err) {
    console.error("Error fetching workout plan:", err);
    return [];
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
