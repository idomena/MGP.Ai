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

const GIF_URL_MAP: Record<string, string> = {
  'bench press': '/assets/Bench-Press.gif',
  'incline dumbbell press': '/assets/Incline-Dumbbell-Press.gif',
  'dumbbell press': '/assets/Dumbbell-Press.gif',
  'push-ups': '/assets/Push-Up.gif',
  'dumbbell fly': '/assets/Dumbbell-Fly.gif',
  'barbell bent over row': '/assets/Barbell-Bent-Over-Row.gif',
  'lat pull down': '/assets/Lat-Pulldown.gif',
  'seated cable row': '/assets/Seated-Cable-Row.gif',
  'dumbbell rows': '/assets/Dumbbell-Row.gif',
  'pull-ups': '/assets/Pull-up.gif',
  'barbell squats': '/assets/Barbell-Squat.gif',
  'leg press': '/assets/Leg-Press.gif',
  'romanian deadlifts': '/assets/Barbell-Deadlift.gif',
  'leg curls': '/assets/Seated-Leg-Curl.gif',
  'calf raises': '/assets/Barbell-Squat.gif',
  'hip thrusts': '/assets/Barbell-Hip-Thrust.gif',
  'leg extension': '/assets/Leg-Extension.gif',
  'barbell lunges': '/assets/Barbell-Lunge.gif',
  'lying leg raises': '/assets/Lying-Leg-Raise.gif',
  'kettlebell swings': '/assets/Kettlebell-Swings.gif',
  'overhead press': '/assets/Barbell-Standing-Military-Press.gif',
  'lateral raises': '/assets/Dumbbell-Lateral-Raise.gif',
  'front raises': '/assets/Dumbbell-Front-Raise.gif',
  'rear delt flyes': '/assets/Dumbbell-Reverse-Fly.gif',
  'face pulls': '/assets/Face-Pull.gif',
  'dumbbell overhead press': '/assets/Standing-Dumbbell-Overhead-Press.gif',
  'barbell curls': '/assets/Barbell-Curl.gif',
  'ez bar curls': '/assets/Z-Bar-Curl.gif',
  'tricep pushdowns': '/assets/Tricep-Pushdown.gif',
  'skull crushers': '/assets/Skull-Crusher.gif',
  'plank': '/assets/Ab-Wheel-Rollout.gif',
  'cable crunches': '/assets/Kneeling-Cable-Crunch.gif',
  'russian twists': '/assets/Russian-Twist.gif',
  'hanging leg raises': '/assets/Hanging-Leg-Raises.gif',
  'burpees': '/assets/Burpees.gif',
  'wrist curls': '',
};

function getGifUrl(title: string): string {
  return GIF_URL_MAP[title.toLowerCase()] || '';
}

export function mapToExercise(ex: SupabaseExercise): Exercise {
  const primary = capitalize(ex.muscle_group);
  const muscles = ex.secondary_muscles && ex.secondary_muscles.length > 0
    ? `${primary}, ${ex.secondary_muscles.join(', ')}`
    : primary;

  return {
    id: hashString(ex.title),
    name: ex.title,
    muscles,
    sets: 3,
    reps: '12, 10, 8',
    time: '10 min',
    difficulty: capitalize(ex.difficulty),
    gifUrl: getGifUrl(ex.title),
    instructions: ex.description || '',
  };
}

export async function fetchExercisesByMuscleGroup(muscleGroup: string): Promise<SupabaseExercise[]> {
  const { data, error } = await supabase
    .from('exercises_library')
    .select('*')
    .eq('muscle_group', muscleGroup);

  if (error) {
    console.error('Error fetching exercises by muscle group:', error.message);
    return [];
  }

  return data ?? [];
}

export async function fetchAllExercises(): Promise<Record<string, SupabaseExercise[]>> {
  const { data, error } = await supabase
    .from('exercises_library')
    .select('*');

  if (error) {
    console.error('Error fetching all exercises:', error.message);
    return {};
  }

  const grouped: Record<string, SupabaseExercise[]> = {};
  for (const exercise of data ?? []) {
    const group = exercise.muscle_group;
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(exercise);
  }

  return grouped;
}

export async function fetchAndMapExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
  const exercises = await fetchExercisesByMuscleGroup(muscleGroup);
  return exercises.map(mapToExercise);
}

export async function fetchAndMapAllExercises(): Promise<Record<string, Exercise[]>> {
  const grouped = await fetchAllExercises();
  const mapped: Record<string, Exercise[]> = {};

  for (const [group, exercises] of Object.entries(grouped)) {
    mapped[group] = exercises.map(mapToExercise);
  }

  return mapped;
}
