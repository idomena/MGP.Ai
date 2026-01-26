export interface Exercise {
  id: number;
  name: string;
  muscles: string;
  sets: number;
  reps: string;
  time: string;
  difficulty: string;
  gifUrl: string;
  instructions: string;
}

const CHEST_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Bench Press",
    muscles: "Chest, Triceps",
    sets: 4,
    reps: "12, 10, 8, 6",
    time: "12 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Lie on a flat bench with feet on the floor. Grip the bar slightly wider than shoulder-width. Lower the bar to your chest, then push up explosively.",
  },
  {
    id: 2,
    name: "Incline Dumbbell Press",
    muscles: "Upper Chest, Shoulders",
    sets: 3,
    reps: "12, 10, 8",
    time: "10 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Set bench to 30-45 degrees. Press dumbbells up from chest level, keeping elbows at 45 degrees from your body.",
  },
  {
    id: 3,
    name: "Cable Flyes",
    muscles: "Chest",
    sets: 3,
    reps: "15, 12, 10",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/xT0xeIbYVQcBFDSdVu/giphy.gif",
    instructions: "Stand between cables with slight forward lean. Bring handles together in front of chest with slight bend in elbows.",
  },
  {
    id: 4,
    name: "Push-Ups",
    muscles: "Chest, Triceps, Core",
    sets: 3,
    reps: "15, 15, 15",
    time: "5 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Keep body straight from head to heels. Lower chest to floor, then push back up. Keep core tight throughout.",
  },
];

const BACK_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Machine T-bar Row",
    muscles: "Back, Lats",
    sets: 3,
    reps: "12, 10, 8",
    time: "10 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Grip the handles firmly, keep your back straight, and pull the weight towards your chest. Squeeze your back muscles at the top.",
  },
  {
    id: 2,
    name: "Lat Pull Down",
    muscles: "Back, Shoulders",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Sit down and grab the bar with a wide grip. Pull the bar down to your chest while keeping your back straight.",
  },
  {
    id: 3,
    name: "Seated Cable Row",
    muscles: "Back, Biceps",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/xT0xeIbYVQcBFDSdVu/giphy.gif",
    instructions: "Sit with feet on platform, knees slightly bent. Pull handles to your stomach, squeezing shoulder blades together.",
  },
  {
    id: 4,
    name: "Dumbbell Rows",
    muscles: "Back, Lats",
    sets: 3,
    reps: "10, 10, 10",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Place one knee and hand on bench. Keep back flat. Pull dumbbell to hip, elbow close to body.",
  },
];

const LEGS_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Barbell Squats",
    muscles: "Quads, Glutes, Hamstrings",
    sets: 4,
    reps: "12, 10, 8, 6",
    time: "15 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Stand with bar on upper back. Feet shoulder-width apart. Squat down until thighs are parallel to floor, then drive up.",
  },
  {
    id: 2,
    name: "Leg Press",
    muscles: "Quads, Glutes",
    sets: 3,
    reps: "12, 10, 8",
    time: "10 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Sit in machine with feet shoulder-width on platform. Lower weight until knees reach 90 degrees, then push back up.",
  },
  {
    id: 3,
    name: "Romanian Deadlifts",
    muscles: "Hamstrings, Glutes, Lower Back",
    sets: 3,
    reps: "12, 10, 8",
    time: "10 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/xT0xeIbYVQcBFDSdVu/giphy.gif",
    instructions: "Hold barbell with straight arms. Hinge at hips, lowering bar along legs while keeping back straight. Feel stretch in hamstrings.",
  },
  {
    id: 4,
    name: "Leg Curls",
    muscles: "Hamstrings",
    sets: 3,
    reps: "15, 12, 10",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Lie face down on machine. Curl heels towards glutes, squeezing hamstrings at the top. Lower with control.",
  },
  {
    id: 5,
    name: "Calf Raises",
    muscles: "Calves",
    sets: 4,
    reps: "20, 15, 15, 12",
    time: "5 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Stand on platform edge with heels hanging off. Rise up on toes, squeeze calves at top, then lower below platform level.",
  },
];

const SHOULDERS_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Overhead Press",
    muscles: "Shoulders, Triceps",
    sets: 4,
    reps: "12, 10, 8, 6",
    time: "10 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Stand with bar at shoulder level. Press bar overhead until arms are fully extended. Lower with control.",
  },
  {
    id: 2,
    name: "Lateral Raises",
    muscles: "Side Deltoids",
    sets: 3,
    reps: "15, 12, 12",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Stand with dumbbells at sides. Raise arms out to sides until parallel to floor. Keep slight bend in elbows.",
  },
  {
    id: 3,
    name: "Front Raises",
    muscles: "Front Deltoids",
    sets: 3,
    reps: "12, 12, 10",
    time: "6 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/xT0xeIbYVQcBFDSdVu/giphy.gif",
    instructions: "Hold dumbbells in front of thighs. Raise one arm at a time to shoulder height, then lower. Alternate arms.",
  },
  {
    id: 4,
    name: "Rear Delt Flyes",
    muscles: "Rear Deltoids",
    sets: 3,
    reps: "15, 12, 10",
    time: "6 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Bend forward at hips. Raise dumbbells out to sides, squeezing rear delts. Keep slight bend in elbows.",
  },
];

const ARMS_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Barbell Curls",
    muscles: "Biceps",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Stand with barbell, arms extended. Curl bar up to shoulders, keeping elbows pinned to sides. Lower with control.",
  },
  {
    id: 2,
    name: "Hammer Curls",
    muscles: "Biceps, Forearms",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/xT0xeIbYVQcBFDSdVu/giphy.gif",
    instructions: "Hold dumbbells with palms facing each other. Curl up while keeping wrists neutral. Lower slowly.",
  },
  {
    id: 3,
    name: "Tricep Pushdowns",
    muscles: "Triceps",
    sets: 3,
    reps: "15, 12, 10",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Stand at cable machine with rope attachment. Push down until arms are fully extended. Squeeze triceps at bottom.",
  },
  {
    id: 4,
    name: "Skull Crushers",
    muscles: "Triceps",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Lie on bench with bar overhead. Lower bar towards forehead by bending elbows. Extend arms back up.",
  },
  {
    id: 5,
    name: "Wrist Curls",
    muscles: "Forearms",
    sets: 3,
    reps: "20, 15, 15",
    time: "5 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Sit with forearms on thighs, wrists over knees. Curl dumbbells up using only wrist motion. Lower slowly.",
  },
];

const CORE_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Plank",
    muscles: "Core, Abs",
    sets: 3,
    reps: "60s, 45s, 30s",
    time: "5 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Hold push-up position on forearms. Keep body straight from head to heels. Engage core throughout.",
  },
  {
    id: 2,
    name: "Crunches",
    muscles: "Abs",
    sets: 3,
    reps: "20, 20, 15",
    time: "6 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Lie on back with knees bent. Place hands behind head. Lift shoulders off floor, contracting abs. Lower slowly.",
  },
  {
    id: 3,
    name: "Russian Twists",
    muscles: "Obliques, Abs",
    sets: 3,
    reps: "20, 20, 15",
    time: "6 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/xT0xeIbYVQcBFDSdVu/giphy.gif",
    instructions: "Sit with knees bent, feet off floor. Lean back slightly. Rotate torso side to side, touching floor each side.",
  },
  {
    id: 4,
    name: "Leg Raises",
    muscles: "Lower Abs",
    sets: 3,
    reps: "15, 12, 10",
    time: "6 min",
    difficulty: "Intermediate",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Lie flat on back, hands under glutes. Raise legs to 90 degrees, then lower without touching floor.",
  },
];

const REST_DAY_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Light Stretching",
    muscles: "Full Body",
    sets: 1,
    reps: "10 min",
    time: "10 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
    instructions: "Perform gentle stretches for all major muscle groups. Hold each stretch for 30 seconds. Focus on breathing.",
  },
  {
    id: 2,
    name: "Foam Rolling",
    muscles: "Full Body",
    sets: 1,
    reps: "10 min",
    time: "10 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
    instructions: "Roll slowly over tight muscles. Pause on tender spots for 30-60 seconds. Cover legs, back, and shoulders.",
  },
  {
    id: 3,
    name: "Walking",
    muscles: "Cardio, Legs",
    sets: 1,
    reps: "20-30 min",
    time: "25 min",
    difficulty: "Beginner",
    gifUrl: "https://media.giphy.com/media/xT0xeIbYVQcBFDSdVu/giphy.gif",
    instructions: "Take a light walk at a comfortable pace. Focus on active recovery without straining muscles.",
  },
];

export function getExercisesForWorkoutType(workoutType: string): Exercise[] {
  const normalizedType = workoutType.toLowerCase().trim();
  
  switch (normalizedType) {
    case "chest":
      return CHEST_EXERCISES;
    case "back":
      return BACK_EXERCISES;
    case "legs":
      return LEGS_EXERCISES;
    case "shoulders":
      return SHOULDERS_EXERCISES;
    case "arms":
      return ARMS_EXERCISES;
    case "core":
      return CORE_EXERCISES;
    case "rest day":
    case "recovery":
      return REST_DAY_EXERCISES;
    default:
      return CHEST_EXERCISES;
  }
}
