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
    id: 101,
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
    id: 102,
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
    id: 103,
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
    id: 104,
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
    id: 201,
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
    id: 202,
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
    id: 203,
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
    id: 204,
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
    id: 301,
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
    id: 302,
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
    id: 303,
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
    id: 304,
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
    id: 305,
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
    id: 401,
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
    id: 402,
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
    id: 403,
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
    id: 404,
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
    id: 501,
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
    id: 502,
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
    id: 503,
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
    id: 504,
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
    id: 505,
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
    id: 601,
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
    id: 602,
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
    id: 603,
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
    id: 604,
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
    id: 701,
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
    id: 702,
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
    id: 703,
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

// Helper to pick exercises with rotation based on day
function pickWithRotation(exercises: Exercise[], count: number, dayNumber: number): Exercise[] {
  const result: Exercise[] = [];
  const offset = (dayNumber - 1) % exercises.length;
  
  for (let i = 0; i < count && i < exercises.length; i++) {
    const index = (offset + i) % exercises.length;
    result.push(exercises[index]);
  }
  return result;
}

// Upper body exercise variations for different days
const UPPER_VARIATIONS = [
  // Variation 1: Chest focus
  () => [
    CHEST_EXERCISES[0],    // Bench Press
    CHEST_EXERCISES[1],    // Incline DB Press
    BACK_EXERCISES[1],     // Lat Pull Down
    SHOULDERS_EXERCISES[1], // Lateral Raises
    ARMS_EXERCISES[2],     // Tricep Pushdowns
  ],
  // Variation 2: Back focus
  () => [
    BACK_EXERCISES[0],     // T-bar Row
    BACK_EXERCISES[1],     // Lat Pull Down
    CHEST_EXERCISES[2],    // Cable Flyes
    SHOULDERS_EXERCISES[3], // Rear Delt Flyes
    ARMS_EXERCISES[0],     // Barbell Curls
  ],
  // Variation 3: Shoulder focus
  () => [
    SHOULDERS_EXERCISES[0], // Overhead Press
    SHOULDERS_EXERCISES[1], // Lateral Raises
    CHEST_EXERCISES[3],    // Push-Ups
    BACK_EXERCISES[3],     // Dumbbell Rows
    ARMS_EXERCISES[3],     // Skull Crushers
  ],
];

// Lower body exercise variations
const LOWER_VARIATIONS = [
  // Variation 1: Quad focus
  () => [
    LEGS_EXERCISES[0],     // Squats
    LEGS_EXERCISES[1],     // Leg Press
    LEGS_EXERCISES[3],     // Leg Curls
    LEGS_EXERCISES[4],     // Calf Raises
    CORE_EXERCISES[0],     // Plank
  ],
  // Variation 2: Hamstring focus
  () => [
    LEGS_EXERCISES[2],     // Romanian Deadlifts
    LEGS_EXERCISES[3],     // Leg Curls
    LEGS_EXERCISES[0],     // Squats
    LEGS_EXERCISES[4],     // Calf Raises
    CORE_EXERCISES[3],     // Leg Raises
  ],
  // Variation 3: Glute focus
  () => [
    LEGS_EXERCISES[0],     // Squats
    LEGS_EXERCISES[2],     // Romanian Deadlifts
    LEGS_EXERCISES[1],     // Leg Press
    CORE_EXERCISES[2],     // Russian Twists
    LEGS_EXERCISES[4],     // Calf Raises
  ],
];

// Full body exercise variations
const FULL_VARIATIONS = [
  // Variation 1
  () => [
    CHEST_EXERCISES[0],    // Bench Press
    BACK_EXERCISES[0],     // T-bar Row
    LEGS_EXERCISES[0],     // Squats
    SHOULDERS_EXERCISES[0], // Overhead Press
    CORE_EXERCISES[0],     // Plank
  ],
  // Variation 2
  () => [
    CHEST_EXERCISES[1],    // Incline Press
    BACK_EXERCISES[1],     // Lat Pull Down
    LEGS_EXERCISES[1],     // Leg Press
    SHOULDERS_EXERCISES[1], // Lateral Raises
    CORE_EXERCISES[1],     // Crunches
  ],
  // Variation 3
  () => [
    CHEST_EXERCISES[3],    // Push-Ups
    BACK_EXERCISES[3],     // Dumbbell Rows
    LEGS_EXERCISES[2],     // Romanian Deadlifts
    SHOULDERS_EXERCISES[2], // Front Raises
    CORE_EXERCISES[2],     // Russian Twists
  ],
];

// Cardio exercise variations
const CARDIO_VARIATIONS = [
  // Variation 1
  () => [
    LEGS_EXERCISES[0],     // Squats
    CORE_EXERCISES[0],     // Plank
    CORE_EXERCISES[1],     // Crunches
    LEGS_EXERCISES[4],     // Calf Raises
  ],
  // Variation 2
  () => [
    LEGS_EXERCISES[1],     // Leg Press
    CORE_EXERCISES[2],     // Russian Twists
    CORE_EXERCISES[3],     // Leg Raises
    CHEST_EXERCISES[3],    // Push-Ups
  ],
  // Variation 3
  () => [
    LEGS_EXERCISES[2],     // Romanian Deadlifts
    CORE_EXERCISES[0],     // Plank
    SHOULDERS_EXERCISES[1], // Lateral Raises
    CORE_EXERCISES[1],     // Crunches
  ],
];

export function getExercisesForWorkoutType(workoutType: string, dayNumber: number = 1): Exercise[] {
  const normalizedType = workoutType.toLowerCase().trim();
  const variationIndex = (dayNumber - 1) % 3;
  
  switch (normalizedType) {
    // Specific muscle groups - rotate through exercises
    case "chest":
      return pickWithRotation(CHEST_EXERCISES, 4, dayNumber);
    case "back":
      return pickWithRotation(BACK_EXERCISES, 4, dayNumber);
    case "legs":
      return pickWithRotation(LEGS_EXERCISES, 5, dayNumber);
    case "shoulders":
      return pickWithRotation(SHOULDERS_EXERCISES, 4, dayNumber);
    case "arms":
      return pickWithRotation(ARMS_EXERCISES, 5, dayNumber);
    case "core":
      return pickWithRotation(CORE_EXERCISES, 4, dayNumber);
    
    // Workout types - use variations based on day
    case "upper":
    case "upper body":
      return UPPER_VARIATIONS[variationIndex]();
    
    case "lower":
    case "lower body":
      return LOWER_VARIATIONS[variationIndex]();
    
    case "cardio":
      return CARDIO_VARIATIONS[variationIndex]();
    
    case "full":
    case "full body":
      return FULL_VARIATIONS[variationIndex]();
    
    case "push":
      // Rotate push exercises
      return variationIndex === 0 ? [
        CHEST_EXERCISES[0], CHEST_EXERCISES[1], SHOULDERS_EXERCISES[0], SHOULDERS_EXERCISES[1], ARMS_EXERCISES[2],
      ] : variationIndex === 1 ? [
        CHEST_EXERCISES[1], CHEST_EXERCISES[2], SHOULDERS_EXERCISES[2], SHOULDERS_EXERCISES[0], ARMS_EXERCISES[3],
      ] : [
        CHEST_EXERCISES[3], CHEST_EXERCISES[0], SHOULDERS_EXERCISES[1], SHOULDERS_EXERCISES[3], ARMS_EXERCISES[2],
      ];
    
    case "pull":
      // Rotate pull exercises
      return variationIndex === 0 ? [
        BACK_EXERCISES[0], BACK_EXERCISES[1], BACK_EXERCISES[3], ARMS_EXERCISES[0], ARMS_EXERCISES[1],
      ] : variationIndex === 1 ? [
        BACK_EXERCISES[1], BACK_EXERCISES[2], BACK_EXERCISES[0], ARMS_EXERCISES[1], ARMS_EXERCISES[0],
      ] : [
        BACK_EXERCISES[3], BACK_EXERCISES[0], BACK_EXERCISES[2], ARMS_EXERCISES[0], ARMS_EXERCISES[4],
      ];
    
    // Rest/Recovery
    case "rest":
    case "rest day":
    case "recovery":
      return REST_DAY_EXERCISES;
    
    default:
      // Default to full body with variation
      return FULL_VARIATIONS[variationIndex]();
  }
}

export function getAlternativesForMuscleGroup(exercise: Exercise): Exercise[] {
  const musclesLower = exercise.muscles.toLowerCase();
  const alternatives: Exercise[] = [];
  
  if (musclesLower.includes("chest") || musclesLower.includes("triceps")) {
    alternatives.push(...CHEST_EXERCISES);
  }
  if (musclesLower.includes("back") || musclesLower.includes("lats")) {
    alternatives.push(...BACK_EXERCISES);
  }
  if (musclesLower.includes("quad") || musclesLower.includes("glute") || musclesLower.includes("hamstring") || musclesLower.includes("leg") || musclesLower.includes("calf")) {
    alternatives.push(...LEGS_EXERCISES);
  }
  if (musclesLower.includes("shoulder") || musclesLower.includes("deltoid")) {
    alternatives.push(...SHOULDERS_EXERCISES);
  }
  if (musclesLower.includes("bicep") || musclesLower.includes("forearm") || musclesLower.includes("arm")) {
    alternatives.push(...ARMS_EXERCISES);
  }
  if (musclesLower.includes("core") || musclesLower.includes("abs") || musclesLower.includes("oblique")) {
    alternatives.push(...CORE_EXERCISES);
  }
  
  const seen = new Set<number>();
  return alternatives.filter(ex => {
    if (seen.has(ex.id)) return false;
    seen.add(ex.id);
    return true;
  });
}
