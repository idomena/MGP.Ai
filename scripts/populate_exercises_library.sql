-- Run this SQL in the Supabase SQL Editor to populate the exercises_library table.
-- This adds all exercises with proper muscle groups, equipment, and descriptions.

INSERT INTO public.exercises_library (title, muscle_group, secondary_muscles, equipment, difficulty, exercise_type, movement_pattern, is_safe, description)
VALUES
  -- CHEST EXERCISES
  ('Bench Press', 'chest', ARRAY['triceps'], 'barbell', 'intermediate', 'compound', 'push', true, 'Lie on a flat bench with feet on the floor. Grip the bar slightly wider than shoulder-width. Lower the bar to your chest, then push up explosively.'),
  ('Incline Dumbbell Press', 'chest', ARRAY['shoulders'], 'dumbbell', 'intermediate', 'compound', 'push', true, 'Set bench to 30-45 degrees. Press dumbbells up from chest level, keeping elbows at 45 degrees from your body.'),
  ('Dumbbell Press', 'chest', ARRAY[]::text[], 'dumbbell', 'beginner', 'compound', 'push', true, 'Lie flat on bench with dumbbells at chest level. Press up until arms are extended. Lower with control.'),
  ('Push-Ups', 'chest', ARRAY['triceps', 'core'], 'bodyweight', 'beginner', 'compound', 'push', true, 'Keep body straight from head to heels. Lower chest to floor, then push back up. Keep core tight throughout.'),
  ('Dumbbell Fly', 'chest', ARRAY['front deltoids'], 'dumbbell', 'intermediate', 'isolation', 'push', true, 'Lie on a flat bench holding dumbbells above chest with arms slightly bent. Lower arms out to sides in a wide arc until you feel a stretch in your chest, then squeeze arms back together.'),

  -- BACK EXERCISES
  ('Barbell Bent Over Row', 'back', ARRAY['lats'], 'barbell', 'intermediate', 'compound', 'pull', true, 'Bend at hips with slight knee bend, grip barbell. Pull bar to lower chest, squeezing back muscles. Lower with control.'),
  ('Lat Pull Down', 'back', ARRAY['shoulders'], 'machine', 'beginner', 'compound', 'pull', true, 'Sit down and grab the bar with a wide grip. Pull the bar down to your chest while keeping your back straight.'),
  ('Seated Cable Row', 'back', ARRAY['biceps'], 'cable', 'beginner', 'compound', 'pull', true, 'Sit with feet on platform, knees slightly bent. Pull handles to your stomach, squeezing shoulder blades together.'),
  ('Dumbbell Rows', 'back', ARRAY['lats'], 'dumbbell', 'intermediate', 'compound', 'pull', true, 'Place one knee and hand on bench. Keep back flat. Pull dumbbell to hip, elbow close to body.'),
  ('Pull-Ups', 'back', ARRAY['biceps', 'lats'], 'bodyweight', 'intermediate', 'compound', 'pull', true, 'Hang from a pull-up bar with an overhand grip, hands slightly wider than shoulder-width. Pull yourself up until your chin is above the bar, then lower with control.'),

  -- LEGS EXERCISES
  ('Barbell Squats', 'legs', ARRAY['glutes', 'hamstrings'], 'barbell', 'intermediate', 'compound', 'squat', true, 'Stand with bar on upper back. Feet shoulder-width apart. Squat down until thighs are parallel to floor, then drive up.'),
  ('Leg Press', 'legs', ARRAY['glutes'], 'machine', 'beginner', 'compound', 'squat', true, 'Sit in machine with feet shoulder-width on platform. Lower weight until knees reach 90 degrees, then push back up.'),
  ('Romanian Deadlifts', 'legs', ARRAY['glutes', 'lower back'], 'barbell', 'intermediate', 'compound', 'hinge', true, 'Hold barbell with straight arms. Hinge at hips, lowering bar along legs while keeping back straight. Feel stretch in hamstrings.'),
  ('Leg Curls', 'legs', ARRAY[]::text[], 'machine', 'beginner', 'isolation', 'pull', true, 'Lie face down on machine. Curl heels towards glutes, squeezing hamstrings at the top. Lower with control.'),
  ('Calf Raises', 'legs', ARRAY[]::text[], 'bodyweight', 'beginner', 'isolation', 'push', true, 'Stand on platform edge with heels hanging off. Rise up on toes, squeeze calves at top, then lower below platform level.'),
  ('Hip Thrusts', 'legs', ARRAY['hamstrings'], 'barbell', 'intermediate', 'compound', 'hinge', true, 'Sit with upper back against bench, barbell across hips. Drive through heels, squeeze glutes at top, then lower.'),
  ('Leg Extension', 'legs', ARRAY[]::text[], 'machine', 'beginner', 'isolation', 'push', true, 'Sit on the leg extension machine with your back flat against the pad. Extend your legs until fully straight, squeeze quads at the top, then lower with control.'),
  ('Barbell Lunges', 'legs', ARRAY['glutes', 'hamstrings'], 'barbell', 'intermediate', 'compound', 'squat', true, 'Stand with barbell on upper back. Step forward into a lunge, lowering until both knees are at 90 degrees. Push back to starting position and alternate legs.'),
  ('Kettlebell Swings', 'legs', ARRAY['glutes', 'core'], 'dumbbell', 'intermediate', 'compound', 'hinge', true, 'Stand with feet shoulder-width apart, holding kettlebell with both hands. Hinge at hips, swing kettlebell back between legs, then drive hips forward to swing it to chest height.'),

  -- SHOULDERS EXERCISES
  ('Overhead Press', 'shoulders', ARRAY['triceps'], 'barbell', 'intermediate', 'compound', 'push', true, 'Stand with bar at shoulder level. Press bar overhead until arms are fully extended. Lower with control.'),
  ('Lateral Raises', 'shoulders', ARRAY[]::text[], 'dumbbell', 'beginner', 'isolation', 'push', true, 'Stand with dumbbells at sides. Raise arms out to sides until parallel to floor. Keep slight bend in elbows.'),
  ('Front Raises', 'shoulders', ARRAY[]::text[], 'dumbbell', 'beginner', 'isolation', 'push', true, 'Hold dumbbells in front of thighs. Raise one arm at a time to shoulder height, then lower. Alternate arms.'),
  ('Rear Delt Flyes', 'shoulders', ARRAY[]::text[], 'dumbbell', 'beginner', 'isolation', 'pull', true, 'Bend forward at hips. Raise dumbbells out to sides, squeezing rear delts. Keep slight bend in elbows.'),
  ('Face Pulls', 'shoulders', ARRAY['upper back'], 'cable', 'beginner', 'isolation', 'pull', true, 'Set cable at face height. Pull rope towards face, separating ends and squeezing shoulder blades.'),
  ('Dumbbell Overhead Press', 'shoulders', ARRAY['triceps'], 'dumbbell', 'intermediate', 'compound', 'push', true, 'Stand holding dumbbells at shoulder height with palms facing forward. Press dumbbells overhead until arms are fully extended, then lower with control.'),

  -- ARMS EXERCISES
  ('Barbell Curls', 'arms', ARRAY[]::text[], 'barbell', 'beginner', 'isolation', 'pull', true, 'Stand with barbell, arms extended. Curl bar up to shoulders, keeping elbows pinned to sides. Lower with control.'),
  ('EZ Bar Curls', 'arms', ARRAY['forearms'], 'barbell', 'intermediate', 'isolation', 'pull', true, 'Hold EZ bar with underhand grip. Curl up while keeping elbows pinned to sides. Lower slowly.'),
  ('Tricep Pushdowns', 'arms', ARRAY[]::text[], 'cable', 'beginner', 'isolation', 'push', true, 'Stand at cable machine with rope attachment. Push down until arms are fully extended. Squeeze triceps at bottom.'),
  ('Skull Crushers', 'arms', ARRAY[]::text[], 'barbell', 'intermediate', 'isolation', 'push', true, 'Lie on bench with bar overhead. Lower bar towards forehead by bending elbows. Extend arms back up.'),
  ('Wrist Curls', 'arms', ARRAY[]::text[], 'dumbbell', 'beginner', 'isolation', 'pull', true, 'Sit with forearms on thighs, wrists over knees. Curl dumbbells up using only wrist motion. Lower slowly.'),

  -- CORE EXERCISES
  ('Plank', 'core', ARRAY['abs'], 'bodyweight', 'beginner', 'isolation', 'push', true, 'Hold push-up position on forearms. Keep body straight from head to heels. Engage core throughout.'),
  ('Cable Crunches', 'core', ARRAY[]::text[], 'cable', 'beginner', 'isolation', 'pull', true, 'Kneel facing cable machine. Hold rope behind head. Crunch down, bringing elbows to knees. Squeeze abs at bottom.'),
  ('Russian Twists', 'core', ARRAY['abs'], 'bodyweight', 'intermediate', 'isolation', 'pull', true, 'Sit with knees bent, feet off floor. Lean back slightly. Rotate torso side to side, touching floor each side.'),
  ('Hanging Leg Raises', 'core', ARRAY['hip flexors'], 'bodyweight', 'intermediate', 'isolation', 'pull', true, 'Hang from pull-up bar. Raise legs to 90 degrees keeping them straight, then lower with control.'),
  ('Lying Leg Raises', 'legs', ARRAY['hip flexors'], 'bodyweight', 'beginner', 'isolation', 'pull', true, 'Lie flat on your back with legs straight. Raise legs to 90 degrees keeping them straight, then lower slowly without touching the floor.'),
  ('Burpees', 'core', ARRAY['full body', 'cardio'], 'bodyweight', 'intermediate', 'compound', 'push', true, 'Start standing. Drop into a squat, kick feet back into a push-up position, do a push-up, jump feet forward, then explode up with a jump.')

ON CONFLICT DO NOTHING;
