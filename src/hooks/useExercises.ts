import { useQuery } from "@tanstack/react-query";
import { type Exercise, getExercisesForWorkoutType } from "@/data/workoutExercises";
import { fetchAndMapExercisesByMuscleGroup } from "@/services/exercisesLibraryService";
import { isSupabaseConfigured } from "@/lib/supabase";

const MUSCLE_GROUP_MAP: Record<string, string[]> = {
  chest: ["chest"],
  back: ["back"],
  legs: ["legs"],
  shoulders: ["shoulders"],
  arms: ["arms"],
  core: ["core"],
  chest_shoulders: ["chest", "shoulders"],
  "chest + shoulders": ["chest", "shoulders"],
  back_arms: ["back", "arms"],
  "back + arms": ["back", "arms"],
  chest_back: ["chest", "back"],
  "chest + back": ["chest", "back"],
  shoulders_arms: ["shoulders", "arms"],
  "shoulders + arms": ["shoulders", "arms"],
  legs_core: ["legs", "core"],
  "legs + core": ["legs", "core"],
  full: ["chest", "back", "shoulders", "arms", "legs", "core"],
  "full body": ["chest", "back", "shoulders", "arms", "legs", "core"],
  cardio: [],
};

export function useExercises(workoutType: string, dayNumber: number = 1) {
  return useQuery({
    queryKey: ["exercises", workoutType, dayNumber],
    enabled: !!workoutType && workoutType !== "rest",
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        return getExercisesForWorkoutType(workoutType, dayNumber);
      }

      const normalizedType = workoutType.toLowerCase().trim();
      const muscleGroups = MUSCLE_GROUP_MAP[normalizedType];

      if (!muscleGroups || muscleGroups.length === 0) {
        return getExercisesForWorkoutType(workoutType, dayNumber);
      }

      try {
        const fetchPromises = muscleGroups.map(group => fetchAndMapExercisesByMuscleGroup(group));
        const results = await Promise.all(fetchPromises);
        const allExercises = results.flat();

        if (allExercises.length === 0) {
          return getExercisesForWorkoutType(workoutType, dayNumber);
        }

        const exercisesPerGroup = muscleGroups.length === 1 ? 5 : Math.ceil(6 / muscleGroups.length);
        const selected: Exercise[] = [];

        for (let i = 0; i < results.length; i++) {
          const groupExercises = results[i];
          const offset = (dayNumber - 1) * exercisesPerGroup;
          const picked: Exercise[] = [];
          for (let j = 0; j < exercisesPerGroup && j < groupExercises.length; j++) {
            const idx = (offset + j) % groupExercises.length;
            picked.push(groupExercises[idx]);
          }
          selected.push(...picked);
        }

        return selected;
      } catch {
        return getExercisesForWorkoutType(workoutType, dayNumber);
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
