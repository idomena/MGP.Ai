import { useQuery } from "@tanstack/react-query";
import { type Exercise, getExercisesForWorkoutType } from "@/data/workoutExercises";

export function useExercises(workoutType: string) {
  return useQuery({
    queryKey: ["exercises", workoutType],
    enabled: !!workoutType,
    queryFn: async () => {
      // Get exercises from local data based on workout type
      const exercises = getExercisesForWorkoutType(workoutType);
      console.log("Loaded", exercises.length, "exercises for:", workoutType);
      return exercises;
    },
    staleTime: 1000 * 60 * 5,
  });
}
