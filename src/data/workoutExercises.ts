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
  // ExerciseDB enriched fields (optional — present when fetched from API)
  target?: string;
  bodyPart?: string;
  equipmentName?: string;
  secondaryMuscles?: string[];
  instructionsList?: string[];
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
    gifUrl: "/assets/Bench-Press.gif",
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
    gifUrl: "/assets/Incline-Dumbbell-Press.gif",
    instructions: "Set bench to 30-45 degrees. Press dumbbells up from chest level, keeping elbows at 45 degrees from your body.",
  },
  {
    id: 103,
    name: "Dumbbell Press",
    muscles: "Chest",
    sets: 3,
    reps: "15, 12, 10",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "/assets/Dumbbell-Press.gif",
    instructions: "Lie flat on bench with dumbbells at chest level. Press up until arms are extended. Lower with control.",
  },
  {
    id: 104,
    name: "Push-Ups",
    muscles: "Chest, Triceps, Core",
    sets: 3,
    reps: "15, 15, 15",
    time: "5 min",
    difficulty: "Beginner",
    gifUrl: "/assets/Push-Up.gif",
    instructions: "Keep body straight from head to heels. Lower chest to floor, then push back up. Keep core tight throughout.",
  },
  {
    id: 105,
    name: "Dumbbell Fly",
    muscles: "Chest, Front Deltoids",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Dumbbell-Fly.gif",
    instructions: "Lie on a flat bench holding dumbbells above chest with arms slightly bent. Lower arms out to sides in a wide arc until you feel a stretch in your chest, then squeeze arms back together.",
  },
];

const BACK_EXERCISES: Exercise[] = [
  {
    id: 201,
    name: "Barbell Bent Over Row",
    muscles: "Back, Lats",
    sets: 3,
    reps: "12, 10, 8",
    time: "10 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Barbell-Bent-Over-Row.gif",
    instructions: "Bend at hips with slight knee bend, grip barbell. Pull bar to lower chest, squeezing back muscles. Lower with control.",
  },
  {
    id: 202,
    name: "Lat Pull Down",
    muscles: "Back, Shoulders",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "/assets/Lat-Pulldown.gif",
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
    gifUrl: "/assets/Seated-Cable-Row.gif",
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
    gifUrl: "/assets/Dumbbell-Row.gif",
    instructions: "Place one knee and hand on bench. Keep back flat. Pull dumbbell to hip, elbow close to body.",
  },
  {
    id: 205,
    name: "Pull-Ups",
    muscles: "Back, Biceps, Lats",
    sets: 3,
    reps: "10, 8, 6",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Pull-up.gif",
    instructions: "Hang from a pull-up bar with an overhand grip, hands slightly wider than shoulder-width. Pull yourself up until your chin is above the bar, then lower with control.",
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
    gifUrl: "/assets/Barbell-Squat.gif",
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
    gifUrl: "/assets/Leg-Press.gif",
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
    gifUrl: "/assets/Barbell-Deadlift.gif",
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
    gifUrl: "/assets/Seated-Leg-Curl.gif",
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
    gifUrl: "/assets/Barbell-Squat.gif",
    instructions: "Stand on platform edge with heels hanging off. Rise up on toes, squeeze calves at top, then lower below platform level.",
  },
  {
    id: 306,
    name: "Hip Thrusts",
    muscles: "Glutes, Hamstrings",
    sets: 3,
    reps: "12, 10, 10",
    time: "10 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Barbell-Hip-Thrust.gif",
    instructions: "Sit with upper back against bench, barbell across hips. Drive through heels, squeeze glutes at top, then lower.",
  },
  {
    id: 307,
    name: "Leg Extension",
    muscles: "Quads",
    sets: 3,
    reps: "15, 12, 10",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "/assets/Leg-Extension.gif",
    instructions: "Sit on the leg extension machine with your back flat against the pad. Extend your legs until fully straight, squeeze quads at the top, then lower with control.",
  },
  {
    id: 308,
    name: "Barbell Lunges",
    muscles: "Quads, Glutes, Hamstrings",
    sets: 3,
    reps: "10, 10, 8",
    time: "10 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Barbell-Lunge.gif",
    instructions: "Stand with barbell on upper back. Step forward into a lunge, lowering until both knees are at 90 degrees. Push back to starting position and alternate legs.",
  },
  {
    id: 309,
    name: "Lying Leg Raises",
    muscles: "Lower Abs, Hip Flexors",
    sets: 3,
    reps: "15, 12, 10",
    time: "6 min",
    difficulty: "Beginner",
    gifUrl: "/assets/Lying-Leg-Raise.gif",
    instructions: "Lie flat on your back with legs straight. Raise legs to 90 degrees keeping them straight, then lower slowly without touching the floor.",
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
    gifUrl: "/assets/Barbell-Standing-Military-Press.gif",
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
    gifUrl: "/assets/Dumbbell-Lateral-Raise.gif",
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
    gifUrl: "/assets/Dumbbell-Front-Raise.gif",
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
    gifUrl: "/assets/Dumbbell-Reverse-Fly.gif",
    instructions: "Bend forward at hips. Raise dumbbells out to sides, squeezing rear delts. Keep slight bend in elbows.",
  },
  {
    id: 405,
    name: "Face Pulls",
    muscles: "Rear Deltoids, Upper Back",
    sets: 3,
    reps: "15, 12, 12",
    time: "6 min",
    difficulty: "Beginner",
    gifUrl: "/assets/Face-Pull.gif",
    instructions: "Set cable at face height. Pull rope towards face, separating ends and squeezing shoulder blades.",
  },
  {
    id: 406,
    name: "Dumbbell Overhead Press",
    muscles: "Shoulders, Triceps",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Standing-Dumbbell-Overhead-Press.gif",
    instructions: "Stand holding dumbbells at shoulder height with palms facing forward. Press dumbbells overhead until arms are fully extended, then lower with control.",
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
    gifUrl: "/assets/Barbell-Curl.gif",
    instructions: "Stand with barbell, arms extended. Curl bar up to shoulders, keeping elbows pinned to sides. Lower with control.",
  },
  {
    id: 502,
    name: "EZ Bar Curls",
    muscles: "Biceps, Forearms",
    sets: 3,
    reps: "12, 10, 8",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Z-Bar-Curl.gif",
    instructions: "Hold EZ bar with underhand grip. Curl up while keeping elbows pinned to sides. Lower slowly.",
  },
  {
    id: 503,
    name: "Tricep Pushdowns",
    muscles: "Triceps",
    sets: 3,
    reps: "15, 12, 10",
    time: "8 min",
    difficulty: "Beginner",
    gifUrl: "/assets/Tricep-Pushdown.gif",
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
    gifUrl: "/assets/Skull-Crusher.gif",
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
    gifUrl: "/assets/Ab-Wheel-Rollout.gif",
    instructions: "Hold push-up position on forearms. Keep body straight from head to heels. Engage core throughout.",
  },
  {
    id: 602,
    name: "Cable Crunches",
    muscles: "Abs",
    sets: 3,
    reps: "20, 20, 15",
    time: "6 min",
    difficulty: "Beginner",
    gifUrl: "/assets/Kneeling-Cable-Crunch.gif",
    instructions: "Kneel facing cable machine. Hold rope behind head. Crunch down, bringing elbows to knees. Squeeze abs at bottom.",
  },
  {
    id: 603,
    name: "Russian Twists",
    muscles: "Obliques, Abs",
    sets: 3,
    reps: "20, 20, 15",
    time: "6 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Russian-Twist.gif",
    instructions: "Sit with knees bent, feet off floor. Lean back slightly. Rotate torso side to side, touching floor each side.",
  },
  {
    id: 604,
    name: "Hanging Leg Raises",
    muscles: "Lower Abs, Hip Flexors",
    sets: 3,
    reps: "15, 12, 10",
    time: "6 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Hanging-Leg-Raises.gif",
    instructions: "Hang from pull-up bar. Raise legs to 90 degrees keeping them straight, then lower with control.",
  },
];

const CARDIO_EXERCISES_LIST: Exercise[] = [
  {
    id: 801,
    name: "Burpees",
    muscles: "Full Body, Cardio",
    sets: 3,
    reps: "15, 12, 10",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Burpees.gif",
    instructions: "Start standing. Drop into a squat, kick feet back into a push-up position, do a push-up, jump feet forward, then explode up with a jump.",
  },
  {
    id: 802,
    name: "Kettlebell Swings",
    muscles: "Glutes, Hamstrings, Core",
    sets: 3,
    reps: "15, 15, 12",
    time: "8 min",
    difficulty: "Intermediate",
    gifUrl: "/assets/Kettlebell-Swings.gif",
    instructions: "Stand with feet shoulder-width apart, holding kettlebell with both hands. Hinge at hips, swing kettlebell back between legs, then drive hips forward to swing it to chest height.",
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
    CARDIO_EXERCISES_LIST[0], // Burpees
    CARDIO_EXERCISES_LIST[1], // Kettlebell Swings
    CORE_EXERCISES[0],     // Plank
    LEGS_EXERCISES[0],     // Squats
  ],
  // Variation 2
  () => [
    CARDIO_EXERCISES_LIST[1], // Kettlebell Swings
    CARDIO_EXERCISES_LIST[0], // Burpees
    CORE_EXERCISES[2],     // Russian Twists
    CHEST_EXERCISES[3],    // Push-Ups
  ],
  // Variation 3
  () => [
    CARDIO_EXERCISES_LIST[0], // Burpees
    LEGS_EXERCISES[2],     // Romanian Deadlifts
    CORE_EXERCISES[0],     // Plank
    CARDIO_EXERCISES_LIST[1], // Kettlebell Swings
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
    case "biceps":
      return pickWithRotation(ARMS_EXERCISES.filter(e => 
        e.name.toLowerCase().includes('curl') || 
        e.name.toLowerCase().includes('bicep')
      ), 4, dayNumber);
    case "triceps":
      return pickWithRotation(ARMS_EXERCISES.filter(e => 
        e.name.toLowerCase().includes('tricep') || 
        e.name.toLowerCase().includes('pushdown') ||
        e.name.toLowerCase().includes('extension') ||
        e.name.toLowerCase().includes('dip')
      ), 4, dayNumber);
    case "quads":
      return pickWithRotation(LEGS_EXERCISES.filter(e => 
        e.name.toLowerCase().includes('squat') || 
        e.name.toLowerCase().includes('leg press') ||
        e.name.toLowerCase().includes('extension') ||
        e.name.toLowerCase().includes('lunge')
      ), 4, dayNumber);
    case "hamstrings":
      return pickWithRotation(LEGS_EXERCISES.filter(e => 
        e.name.toLowerCase().includes('curl') || 
        e.name.toLowerCase().includes('deadlift') ||
        e.name.toLowerCase().includes('hamstring')
      ), 4, dayNumber);
    case "glutes":
      return pickWithRotation(LEGS_EXERCISES.filter(e => 
        e.name.toLowerCase().includes('hip') || 
        e.name.toLowerCase().includes('glute') ||
        e.name.toLowerCase().includes('bridge') ||
        e.name.toLowerCase().includes('squat')
      ), 4, dayNumber);
    case "core":
      return pickWithRotation(CORE_EXERCISES, 4, dayNumber);
    
    // Combo workout types
    case "chest_shoulders":
    case "chest + shoulders":
      return [
        ...pickWithRotation(CHEST_EXERCISES, 3, dayNumber),
        ...pickWithRotation(SHOULDERS_EXERCISES, 3, dayNumber),
      ];
    
    case "back_arms":
    case "back + arms":
      return [
        ...pickWithRotation(BACK_EXERCISES, 3, dayNumber),
        ...pickWithRotation(ARMS_EXERCISES, 3, dayNumber),
      ];
    
    case "chest_back":
    case "chest + back":
      return [
        ...pickWithRotation(CHEST_EXERCISES, 3, dayNumber),
        ...pickWithRotation(BACK_EXERCISES, 3, dayNumber),
      ];
    
    case "shoulders_arms":
    case "shoulders + arms":
      return [
        ...pickWithRotation(SHOULDERS_EXERCISES, 3, dayNumber),
        ...pickWithRotation(ARMS_EXERCISES, 3, dayNumber),
      ];
    
    case "legs_core":
    case "legs + core":
      return [
        ...pickWithRotation(LEGS_EXERCISES, 4, dayNumber),
        ...pickWithRotation(CORE_EXERCISES, 2, dayNumber),
      ];
    
    // Legacy workout types (for backward compatibility)
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
      // Handle custom multi-muscle combinations (e.g., "biceps_chest", "back_shoulders_core")
      const muscles = normalizedType.split("_").filter(m => m.length > 0);
      if (muscles.length > 1) {
        const combined: Exercise[] = [];
        
        const getMuscleExercises = (muscle: string): Exercise[] => {
          switch (muscle) {
            case "chest": return CHEST_EXERCISES;
            case "back": return BACK_EXERCISES;
            case "shoulders": return SHOULDERS_EXERCISES;
            case "arms": return ARMS_EXERCISES;
            case "biceps": return ARMS_EXERCISES.filter(e => 
              e.name.toLowerCase().includes('curl') || e.name.toLowerCase().includes('bicep'));
            case "triceps": return ARMS_EXERCISES.filter(e => 
              e.name.toLowerCase().includes('tricep') || e.name.toLowerCase().includes('pushdown') ||
              e.name.toLowerCase().includes('extension') || e.name.toLowerCase().includes('dip'));
            case "legs": return LEGS_EXERCISES;
            case "core": return CORE_EXERCISES;
            default: return [];
          }
        };

        if (muscles.length === 2) {
          const primaryCount = 3;
          const secondaryCount = 2;
          combined.push(...pickWithRotation(getMuscleExercises(muscles[0]), primaryCount, dayNumber));
          combined.push(...pickWithRotation(getMuscleExercises(muscles[1]), secondaryCount, dayNumber));
        } else {
          const exercisesPerMuscle = Math.max(2, Math.floor(6 / muscles.length));
          for (const muscle of muscles) {
            combined.push(...pickWithRotation(getMuscleExercises(muscle), exercisesPerMuscle, dayNumber));
          }
        }
        
        if (combined.length > 0) return combined;
      }
      
      // Default to full body with variation
      return FULL_VARIATIONS[variationIndex]();
  }
}

export function getAllAvailableExercises(): Record<string, Exercise[]> {
  return {
    chest: CHEST_EXERCISES,
    back: BACK_EXERCISES,
    shoulders: SHOULDERS_EXERCISES,
    arms: ARMS_EXERCISES,
    legs: LEGS_EXERCISES,
    core: CORE_EXERCISES,
    cardio: CARDIO_EXERCISES_LIST,
  };
}

export function getMuscleGroupsForWorkoutType(workoutType: string): string[] {
  const normalizedType = workoutType.toLowerCase().trim();
  
  switch (normalizedType) {
    case "chest": return ["chest"];
    case "back": return ["back"];
    case "legs": return ["legs"];
    case "shoulders": return ["shoulders"];
    case "arms": return ["arms"];
    case "biceps": return ["arms"];
    case "triceps": return ["arms"];
    case "quads": return ["legs"];
    case "hamstrings": return ["legs"];
    case "glutes": return ["legs"];
    case "core": return ["core"];
    case "chest_shoulders":
    case "chest + shoulders": return ["chest", "shoulders"];
    case "back_arms":
    case "back + arms": return ["back", "arms"];
    case "chest_back":
    case "chest + back": return ["chest", "back"];
    case "shoulders_arms":
    case "shoulders + arms": return ["shoulders", "arms"];
    case "legs_core":
    case "legs + core": return ["legs", "core"];
    case "upper":
    case "upper body": return ["chest", "back", "shoulders", "arms"];
    case "lower":
    case "lower body": return ["legs", "core"];
    case "push": return ["chest", "shoulders", "arms"];
    case "pull": return ["back", "arms"];
    case "full":
    case "full body": return ["chest", "back", "shoulders", "arms", "legs", "core"];
    case "cardio": return ["legs", "core"];
    default:
      const muscles = normalizedType.split("_").filter(m => m.length > 0);
      const groups: string[] = [];
      for (const muscle of muscles) {
        if (["chest", "back", "shoulders", "arms", "legs", "core"].includes(muscle)) {
          groups.push(muscle);
        } else if (["biceps", "triceps"].includes(muscle)) {
          if (!groups.includes("arms")) groups.push("arms");
        } else if (["quads", "hamstrings", "glutes"].includes(muscle)) {
          if (!groups.includes("legs")) groups.push("legs");
        }
      }
      return groups.length > 0 ? groups : ["chest", "back", "shoulders", "arms", "legs", "core"];
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
