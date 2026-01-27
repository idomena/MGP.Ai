import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Exercise, getExercisesForWorkoutType } from "@/data/workoutExercises";

// Map workout types to muscle groups for exercises_library
const WORKOUT_TO_MUSCLE_GROUP: Record<string, string[]> = {
  upper: ["chest", "back", "shoulders", "arms"],
  lower: ["legs"],
  cardio: ["legs", "core"],
  full: ["chest", "back", "legs", "shoulders", "arms", "core"],
  push: ["chest", "shoulders", "arms"],
  pull: ["back", "arms"],
  legs: ["legs"],
};

export function useExercises(workoutType: string) {
  return useQuery({
    queryKey: ["exercises", workoutType],
    enabled: !!workoutType,
    queryFn: async () => {
      try {
        const muscleGroups = WORKOUT_TO_MUSCLE_GROUP[workoutType.toLowerCase()] || ["chest", "back", "legs"];
        
        const { data, error } = await (supabase as any)
          .from("exercises_library")
          .select("*")
          .in("muscle_group", muscleGroups)
          .eq("is_safe", true)
          .order("exercise_type", { ascending: false }); // compounds first

        if (error || !data || data.length === 0) {
          console.log("Using local exercise data for:", workoutType);
          return getExercisesForWorkoutType(workoutType);
        }

        // Select a balanced workout: 1-2 compounds + 2-3 isolations
        const compounds = data.filter((e: any) => e.exercise_type === "compound").slice(0, 2);
        const isolations = data.filter((e: any) => e.exercise_type === "isolation").slice(0, 3);
        const selectedExercises = [...compounds, ...isolations].slice(0, 5);

        const exercises: Exercise[] = selectedExercises.map((row: any, index: number) => ({
          id: row.id,
          name: row.title,
          muscles: row.secondary_muscles?.length 
            ? `${row.muscle_group}, ${row.secondary_muscles.join(", ")}` 
            : row.muscle_group,
          sets: row.exercise_type === "compound" ? 4 : 3,
          reps: row.exercise_type === "compound" ? "6-8" : "10-12",
          time: "5 min",
          difficulty: row.difficulty || "beginner",
          gifUrl: "",
          instructions: row.description || "",
          equipment: row.equipment,
          movementPattern: row.movement_pattern,
        }));

        return exercises;
      } catch (err) {
        console.log("Falling back to local exercise data");
        return getExercisesForWorkoutType(workoutType);
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
