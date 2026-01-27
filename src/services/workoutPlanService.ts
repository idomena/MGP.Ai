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
    const { data: existingPrefs } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingPrefs) {
      const { error: updateError } = await supabase
        .from("user_preferences")
        .update({
          training_days: data.trainingDays,
          selected_workouts: data.selectedWorkouts,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating preferences:", updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_preferences")
        .insert({
          user_id: userId,
          training_days: data.trainingDays,
          selected_workouts: data.selectedWorkouts,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error inserting preferences:", insertError);
        return { success: false, error: insertError.message };
      }
    }

    const { data: existingProgram } = await supabase
      .from("user_programs")
      .select("id")
      .eq("user_id", userId)
      .single();

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (!existingProgram) {
      const { error: programError } = await supabase
        .from("user_programs")
        .insert({
          user_id: userId,
          start_date: startDate.toISOString().split("T")[0],
          total_days: TOTAL_PROGRAM_DAYS,
        });

      if (programError) {
        console.error("Error creating program:", programError);
        return { success: false, error: programError.message };
      }
    }

    const { data: existingCompletions } = await supabase
      .from("workout_completions")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (existingCompletions && existingCompletions.length > 0) {
      console.log("Workout plan already exists for user, skipping generation");
      return { success: true };
    }

    const plan = generate21DayPlan(startDate, data.trainingDays, data.selectedWorkouts);

    const completionRows = plan.map((day) => ({
      user_id: userId,
      day_number: day.dayNumber,
      date: day.date,
      title: day.title,
      workout_type: day.workoutType,
      completed: false,
    }));

    const { error: completionsError } = await supabase
      .from("workout_completions")
      .insert(completionRows);

    if (completionsError) {
      console.error("Error inserting workout completions:", completionsError);
      return { success: false, error: completionsError.message };
    }

    console.log("Successfully generated 21-day workout plan");
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
): Array<{ dayNumber: number; date: string; title: string; workoutType: string }> {
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const plan: Array<{ dayNumber: number; date: string; title: string; workoutType: string }> = [];

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
        date: dateStr,
        title: info.name,
        workoutType,
      });
      workoutIndex++;
    } else {
      plan.push({
        dayNumber: dayNum,
        date: dateStr,
        title: "Rest Day",
        workoutType: "rest",
      });
    }
  }

  return plan;
}

export async function checkUserHasWorkoutPlan(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("workout_completions")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      console.error("Error checking workout plan:", error);
      return false;
    }

    return data && data.length > 0;
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
  date: string;
  title: string;
  workoutType: string;
  completed: boolean;
}>> {
  try {
    const { data, error } = await supabase
      .from("workout_completions")
      .select("day_number, date, title, workout_type, completed")
      .eq("user_id", userId)
      .order("day_number", { ascending: true });

    if (error) {
      console.error("Error fetching workout plan:", error);
      return [];
    }

    return (data || []).map((row) => ({
      dayNumber: row.day_number,
      date: row.date || "",
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
