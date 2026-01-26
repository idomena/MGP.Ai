import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Exercise } from "@/data/workoutExercises";

export function useExercises(workoutType: string) {
  return useQuery({
    queryKey: ["exercises", workoutType],
    enabled: !!workoutType,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_templates")
        .select("*")
        .eq("workout_type", workoutType.toLowerCase())
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching exercises:", error);
        throw error;
      }

      const exercises: Exercise[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        muscles: row.muscles || "",
        sets: row.sets || 3,
        reps: row.reps || "10",
        time: row.duration || "5 min",
        difficulty: row.difficulty || "Beginner",
        gifUrl: row.gif_url || "",
        instructions: row.instructions || "",
      }));

      return exercises;
    },
    staleTime: 1000 * 60 * 5,
  });
}
