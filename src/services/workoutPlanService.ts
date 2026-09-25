import { supabase } from "@/integrations/supabase/client";

// Internal batch sizes — not product concepts, not exposed to users.
// The journey is unlimited; these are just how many rows we generate at a time.
const INITIAL_BATCH_SIZE = 30;
const EXTENSION_BATCH_SIZE = 30;
// Trigger extension when this many days remain in the generated buffer.
const EXTENSION_LOOKAHEAD = 7;

// Module-level lock: prevents concurrent extension calls for the same user.
const _extendingUsers = new Set<string>();

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

function parseMuscleFocus(additionalInfo: string, defaultWorkouts: string[]): string[] {
  if (!additionalInfo || additionalInfo.trim() === '') {
    return defaultWorkouts.length > 0 ? defaultWorkouts : ['full'];
  }

  const text = additionalInfo.toLowerCase();
  const detectedMuscles: string[] = [];

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

  if (detectedMuscles.length > 0) {
    if (detectedMuscles.includes('biceps') || detectedMuscles.includes('triceps')) {
      const filtered = detectedMuscles.filter(m => m !== 'arms');
      if (!filtered.includes('biceps') && !filtered.includes('triceps')) {
        return detectedMuscles;
      }
      return filtered;
    }
    return [...new Set(detectedMuscles)];
  }

  return defaultWorkouts.length > 0 ? defaultWorkouts : ['full'];
}

/**
 * Core batch generator — the only place workout rows are created.
 *
 * @param startDayNum   First day number in this batch (1 for initial, N+1 for extensions)
 * @param count         How many days to generate
 * @param programStartDate  Calendar date of Day 1 (used to derive day-of-week for each day)
 * @param trainingDays  Which weekdays are workout days (["Mon","Wed","Fri"] etc.)
 * @param selectedWorkouts  Ordered list of workout types to rotate through
 * @param startWorkoutIndex  Position in the rotation to resume from (critical for continuity)
 *
 * Rest days do NOT advance startWorkoutIndex — only actual workout days do.
 */
export function generateDaysBatch(
  startDayNum: number,
  count: number,
  programStartDate: Date,
  trainingDays: string[],
  selectedWorkouts: string[],
  startWorkoutIndex: number
): Array<{ dayNumber: number; title: string; workoutType: string; date: string }> {
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const plan: Array<{ dayNumber: number; title: string; workoutType: string; date: string }> = [];
  const workouts = selectedWorkouts.length > 0 ? selectedWorkouts : ['full'];

  let workoutIndex = startWorkoutIndex;

  for (let offset = 0; offset < count; offset++) {
    const dayNum = startDayNum + offset;
    const currentDate = new Date(programStartDate);
    currentDate.setDate(programStartDate.getDate() + dayNum - 1);
    const dayOfWeek = dayOrder[currentDate.getDay()];
    const dateStr = toLocalDateStr(currentDate);

    if (trainingDays.includes(dayOfWeek)) {
      const workoutType = workouts[workoutIndex % workouts.length];
      const info = WORKOUT_INFO[workoutType] || { name: workoutType };
      plan.push({ dayNumber: dayNum, title: info.name, workoutType, date: dateStr });
      workoutIndex++; // only advances on actual workout days
    } else {
      plan.push({ dayNumber: dayNum, title: "Rest Day", workoutType: "rest", date: dateStr });
      // workoutIndex NOT incremented — rest days don't affect rotation
    }
  }

  return plan;
}

export async function saveOnboardingAndGeneratePlan(
  userId: string,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  try {
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
          weight_value: data.weight?.value ?? null,
          weight_unit: data.weight?.unit ?? 'kg',
          goals: data.goals ?? [],
          experience: data.experience ?? null,
          gender: data.gender ?? null,
          assistant_type: data.assistantType ?? 'coach',
          user_name: data.userName ?? null,
          coach_name: data.coachName ?? null,
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

    try {
      localStorage.setItem(`mgp_start_date_${userId}`, startDateStr);
    } catch (e) {
      // localStorage not available
    }

    // Generate the initial buffer. INITIAL_BATCH_SIZE is an internal detail only.
    const plan = generateDaysBatch(1, INITIAL_BATCH_SIZE, startDate, data.trainingDays, focusWorkouts, 0);

    const completionRows = plan.map((day) => ({
      user_id: userId,
      day_number: day.dayNumber,
      title: day.title,
      workout_type: day.workoutType,
      completed: false,
    }));

    // Delete existing plan and create fresh
    const { error: deleteError } = await supabase
      .from("workout_completions")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting old workout data:", deleteError);
      return { success: false, error: deleteError.message };
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const { error: completionsError } = await supabase
      .from("workout_completions")
      .insert(completionRows);

    if (completionsError) {
      console.error("Error inserting workout completions:", completionsError);
      return { success: false, error: completionsError.message };
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

/**
 * Extend the journey for a user when they're approaching the end of their
 * generated buffer. Safe to call repeatedly — idempotent by design:
 *
 * 1. Module-level lock prevents concurrent calls for the same user.
 * 2. DB check: only inserts days that don't already exist.
 * 3. Verifies actual max day from DB before deciding to extend.
 */
export async function extendJourneyIfNeeded(
  userId: string,
  currentDay: number
): Promise<boolean> {
  // Concurrent call guard
  if (_extendingUsers.has(userId)) return false;

  try {
    // Get the highest day number currently generated for this user
    const { data: maxRow, error: maxErr } = await supabase
      .from("workout_completions")
      .select("day_number")
      .eq("user_id", userId)
      .order("day_number", { ascending: false })
      .limit(1)
      .single();

    if (maxErr || !maxRow) return false;

    const maxGeneratedDay = maxRow.day_number;

    // Only extend when the buffer is running low
    if (currentDay < maxGeneratedDay - EXTENSION_LOOKAHEAD) return false;

    _extendingUsers.add(userId);

    // Get user preferences for workout rotation
    const prefs = await getUserPreferences(userId);
    if (!prefs || prefs.trainingDays.length === 0) {
      return false;
    }

    // Get program start date from Day 1's creation timestamp
    const { data: day1Row } = await supabase
      .from("workout_completions")
      .select("created_at")
      .eq("user_id", userId)
      .eq("day_number", 1)
      .single();

    let programStartDate: Date;
    if (day1Row?.created_at) {
      programStartDate = new Date(day1Row.created_at);
    } else {
      // Fallback to localStorage
      let stored: string | null = null;
      try { stored = localStorage.getItem(`mgp_start_date_${userId}`); } catch (e) { /* */ }
      programStartDate = stored ? parseLocalDate(stored) : new Date();
    }
    programStartDate.setHours(0, 0, 0, 0);

    // Derive workout rotation index: count all non-rest days already generated.
    // This ensures rotation continues seamlessly regardless of how many extensions
    // have already occurred.
    const { data: workoutRows } = await supabase
      .from("workout_completions")
      .select("day_number")
      .eq("user_id", userId)
      .neq("workout_type", "rest")
      .order("day_number");

    const startWorkoutIndex = workoutRows?.length ?? 0;

    // Generate next batch starting immediately after the current last day
    const newDays = generateDaysBatch(
      maxGeneratedDay + 1,
      EXTENSION_BATCH_SIZE,
      programStartDate,
      prefs.trainingDays,
      prefs.selectedWorkouts,
      startWorkoutIndex
    );

    // Idempotency check: only insert days that don't already exist in the DB
    const newDayNumbers = newDays.map(d => d.dayNumber);
    const { data: existingRows } = await supabase
      .from("workout_completions")
      .select("day_number")
      .eq("user_id", userId)
      .in("day_number", newDayNumbers);

    const existingDayNums = new Set((existingRows ?? []).map(r => r.day_number));
    const toInsert = newDays
      .filter(d => !existingDayNums.has(d.dayNumber))
      .map(d => ({
        user_id: userId,
        day_number: d.dayNumber,
        title: d.title,
        workout_type: d.workoutType,
        completed: false,
      }));

    if (toInsert.length === 0) return false; // already extended

    const { error: insertError } = await supabase
      .from("workout_completions")
      .insert(toInsert);

    if (insertError) {
      console.error("Error extending journey:", insertError);
      return false;
    }

    console.log(`[Journey] Extended user ${userId}: Days ${maxGeneratedDay + 1}–${maxGeneratedDay + toInsert.length}`);
    return true;
  } finally {
    _extendingUsers.delete(userId);
  }
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
