import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/data/workoutExercises';

export interface SupabaseExercise {
  id: string;
  title: string;
  muscle_group: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
  secondary_muscles: string[] | null;
  equipment: 'bodyweight' | 'dumbbell' | 'barbell' | 'machine' | 'cable';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercise_type: 'compound' | 'isolation';
  movement_pattern: 'push' | 'pull' | 'squat' | 'hinge' | 'carry';
  is_safe: boolean;
  description: string | null;
  // ExerciseDB enriched columns (added by migration)
  gif_url?: string | null;
  target_muscle?: string | null;
  instructions_list?: string[] | null;
}


function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Supabase — primary source (enriched by migration) ────────────────────────

export function mapToExercise(ex: SupabaseExercise): Exercise {
  const primary = capitalize(ex.target_muscle ?? ex.muscle_group);
  const secondary = ex.secondary_muscles?.length ? ex.secondary_muscles : [];
  const muscles = secondary.length > 0
    ? `${primary}, ${secondary.slice(0, 2).map(capitalize).join(', ')}`
    : primary;

  return {
    id:               hashString(ex.title),
    name:             ex.title,
    muscles,
    sets:             3,
    reps:             '12, 10, 8',
    time:             '10 min',
    difficulty:       capitalize(ex.difficulty),
    gifUrl:           ex.gif_url ?? '',
    instructions:     ex.instructions_list?.[0] ?? ex.description ?? '',
    // Enriched fields
    target:           ex.target_muscle ?? undefined,
    equipmentName:    ex.equipment,
    secondaryMuscles: secondary,
    instructionsList: ex.instructions_list ?? undefined,
  };
}

export async function fetchExercisesByMuscleGroup(muscleGroup: string): Promise<SupabaseExercise[]> {
  const { data, error } = await supabase
    .from('exercises_library')
    .select('id, title, muscle_group, secondary_muscles, equipment, difficulty, exercise_type, movement_pattern, is_safe, description, gif_url, target_muscle, instructions_list')
    .eq('muscle_group', muscleGroup);

  if (error) {
    console.error('Error fetching exercises by muscle group:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchAndMapExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
  const exercises = await fetchExercisesByMuscleGroup(muscleGroup);
  return exercises.map(mapToExercise);
}
