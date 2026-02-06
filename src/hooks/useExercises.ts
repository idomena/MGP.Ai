import { useQuery } from "@tanstack/react-query";
import { type Exercise, getExercisesForWorkoutType } from "@/data/workoutExercises";

export function useExercises(workoutType: string, dayNumber: number = 1) {
  return useQuery({
    queryKey: ["exercises", workoutType, dayNumber],
    enabled: !!workoutType,
    queryFn: async () => {
      // Get exercises from local data based on workout type and day (for variety)
      const exercises = getExercisesForWorkoutType(workoutType, dayNumber);
      return exercises;
    },
    staleTime: 1000 * 60 * 5,
  });
}
