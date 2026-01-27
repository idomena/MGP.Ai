import { supabase } from "@/integrations/supabase/client";

const TOTAL_PROGRAM_DAYS = 21;

const WORKOUT_INFO: Record<string, { name: string; duration: string; exercises: number }> = {
  upper: { name: "Upper Body", duration: "35 min", exercises: 5 },
  lower: { name: "Lower Body", duration: "40 min", exercises: 5 },
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

    const { error: programError } = await supabase
      .from("user_programs")
      .upsert(
        {
          user_id: userId,
          start_date: startDateStr,
          total_days: TOTAL_PROGRAM_DAYS,
        },
        { onConflict: "user_id" }
      );

    if (programError) {
      console.error("Error upserting program:", programError);
      return { success: false, error: programError.message };
    }

    const plan = generate21DayPlan(startDate, data.trainingDays, data.selectedWorkouts);

    const completionRows = plan.map((day) => ({
      user_id: userId,
      day_number: day.dayNumber,
      title: day.title,
      workout_type: day.workoutType,
      completed: false,
    }));

    const { error: completionsError } = await supabase
      .from("workout_completions")
      .upsert(completionRows, { 
        onConflict: "user_id,day_number",
        ignoreDuplicates: true 
      });

    if (completionsError) {
      console.error("Error inserting workout completions:", completionsError);
      return { success: false, error: completionsError.message };
    }

    const { count, error: countError } = await supabase
      .from("workout_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError || count !== TOTAL_PROGRAM_DAYS) {
      console.error("Workout plan incomplete:", { count, expected: TOTAL_PROGRAM_DAYS });
      return { success: false, error: "Failed to create complete workout plan" };
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
): Array<{ dayNumber: number; title: string; workoutType: string }> {
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const plan: Array<{ dayNumber: number; title: string; workoutType: string }> = [];

  let workoutIndex = 0;

  for (let dayNum = 1; dayNum <= TOTAL_PROGRAM_DAYS; dayNum++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayNum - 1);
    const dayOfWeek = dayOrder[currentDate.getDay()];

    if (trainingDays.includes(dayOfWeek)) {
      const workoutType = selectedWorkouts[workoutIndex % selectedWorkouts.length];
      const info = WORKOUT_INFO[workoutType] || { name: workoutType };
      plan.push({
        dayNumber: dayNum,
        title: info.name,
        workoutType,
      });
      workoutIndex++;
    } else {
      plan.push({
        dayNumber: dayNum,
        title: "Rest Day",
        workoutType: "rest",
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
}>> {
  try {
    const { data, error } = await supabase
      .from("workout_completions")
      .select("day_number, title, workout_type, completed")
      .eq("user_id", userId)
      .order("day_number", { ascending: true });

    if (error) {
      console.error("Error fetching workout plan:", error);
      return [];
    }

    return (data || []).map((row) => ({
      dayNumber: row.day_number,
      title: row.title || "Workout",
      workoutType: row.workout_type || "full",
      completed: row.completed || false,
    }));
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
