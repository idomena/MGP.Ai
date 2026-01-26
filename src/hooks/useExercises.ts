import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Exercise, getExercisesForWorkoutType } from "@/data/workoutExercises";

export function useExercises(workoutType: string) {
  return useQuery({
    queryKey: ["exercises", workoutType],
    enabled: !!workoutType,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("exercises_templates")
          .select("*")
          .eq("workout_type", workoutType.toLowerCase())
          .order("order_index", { ascending: true });

        if (error || !data || data.length === 0) {
          console.log("Using local exercise data for:", workoutType);
          return getExercisesForWorkoutType(workoutType);
        }

        const exercises: Exercise[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          muscles: Array.isArray(row.muscle_groups) ? row.muscle_groups.join(", ") : "",
          sets: row.sets || 3,
          reps: row.reps || "10",
          time: row.duration_minutes ? `${row.duration_minutes} min` : "5 min",
          difficulty: "Beginner",
          gifUrl: row.video_url || "",
          instructions: row.instructions || "",
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
