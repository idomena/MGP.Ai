export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  gifUrl: string;
  duration: string;
  reps?: string;
  sets?: number;
  instructions: string[];
}

export interface WorkoutDay {
  day: number;
  name: string;
  shortName: string;
  focus: string;
  duration: string;
  exercises: Exercise[];
  previewGif: string;
}

const exerciseGifs = {
  pushUp: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHR4Y2p4NnRyMXBnZHB0dHBqZWNnZW1oNjNmNnZ4ZW1wZXN4eXRiYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5t9IcXiBCyw60XPpGu/giphy.gif",
  benchPress: "https://media.giphy.com/media/1qfDU4MJv9xoGtRKvh/giphy.gif",
  chestFly: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnJiNmw0dWVqbGV4Y3phYnQ5Y2JwZnAyOW5iamxnZWxoMnRneWppeCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xUySTQZfdpSkIIg88M/giphy.gif",
  tricepDip: "https://media.giphy.com/media/3oriNYQX2lC6dfW2Ji/giphy.gif",
  pullUp: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGl0MGx5aGV3bGRsdzR3OWJ6dzNmZ3VtZ2Q2dndhbGpnZHVtbWZkdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0HlNO86BWOY9hHoY/giphy.gif",
  deadlift: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWRyOXB6N2d2YjNhMG1hN2RpM2xoZGR6dGxndGpzYmNiNDNqNjR4eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KzM5PePP4KgVi/giphy.gif",
  bentOverRow: "https://media.giphy.com/media/l0MYB4U8GyJpkOSSc/giphy.gif",
  bicepCurl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXRvdGZhY2gxdnR6dWUwYWd3eTY5ZmxwZWFyMXF5ejVwMGNkYjJodSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEhmPYchExWvKoRfG/giphy.gif",
  squat: "https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif",
  lunge: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdG5sbzBiZTZ4NWJ3czFqd3U2cWJlcXBtYXdvdWRrY2hrbmNlZXV1eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3ohhwGzBv4VJvYOBnW/giphy.gif",
  legPress: "https://media.giphy.com/media/xUySTVQyBQfC5ZjdC0/giphy.gif",
  calfRaise: "https://media.giphy.com/media/l4FGI8GoTL7N4DsyI/giphy.gif",
  shoulderPress: "https://media.giphy.com/media/3oEhmPYchExWvKoRfG/giphy.gif",
  lateralRaise: "https://media.giphy.com/media/l0HlNO86BWOY9hHoY/giphy.gif",
  frontRaise: "https://media.giphy.com/media/xUySTQZfdpSkIIg88M/giphy.gif",
  hammerCurl: "https://media.giphy.com/media/3oEhmPYchExWvKoRfG/giphy.gif",
  tricepExtension: "https://media.giphy.com/media/3oriNYQX2lC6dfW2Ji/giphy.gif",
  plank: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzRycWRtamV2aHAweXBpNzI1NjB6NnNsZnE3OHB2dDgybHRvOXU5cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT8qBff8cRRFf7k2u4/giphy.gif",
  crunch: "https://media.giphy.com/media/5t9IcXiBCyw60XPpGu/giphy.gif",
  mountainClimber: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWRyOXB6N2d2YjNhMG1hN2RpM2xoZGR6dGxndGpzYmNiNDNqNjR4eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0MYB4U8GyJpkOSSc/giphy.gif",
  russianTwist: "https://media.giphy.com/media/3oriO8vwmRIZTddJ2U/giphy.gif",
};

export const chestExercises: Exercise[] = [
  {
    id: "chest-1",
    name: "Push-Ups",
    muscleGroup: "Chest",
    equipment: "Bodyweight",
    gifUrl: exerciseGifs.pushUp,
    duration: "45 sec",
    reps: "15-20",
    sets: 3,
    instructions: ["Keep your body in a straight line", "Lower until chest nearly touches floor", "Push back up explosively"]
  },
  {
    id: "chest-2",
    name: "Dumbbell Bench Press",
    muscleGroup: "Chest",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.benchPress,
    duration: "60 sec",
    reps: "10-12",
    sets: 4,
    instructions: ["Lie flat on bench", "Press dumbbells up", "Lower with control"]
  },
  {
    id: "chest-3",
    name: "Chest Fly",
    muscleGroup: "Chest",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.chestFly,
    duration: "45 sec",
    reps: "12-15",
    sets: 3,
    instructions: ["Arms slightly bent", "Open arms wide", "Squeeze at top"]
  },
  {
    id: "chest-4",
    name: "Tricep Dips",
    muscleGroup: "Triceps",
    equipment: "Bench/Chair",
    gifUrl: exerciseGifs.tricepDip,
    duration: "45 sec",
    reps: "12-15",
    sets: 3,
    instructions: ["Hands on edge of bench", "Lower body down", "Push back up"]
  },
];

export const backExercises: Exercise[] = [
  {
    id: "back-1",
    name: "Pull-Ups",
    muscleGroup: "Back",
    equipment: "Pull-up Bar",
    gifUrl: exerciseGifs.pullUp,
    duration: "60 sec",
    reps: "8-12",
    sets: 4,
    instructions: ["Grip bar shoulder-width", "Pull chin above bar", "Lower with control"]
  },
  {
    id: "back-2",
    name: "Bent Over Row",
    muscleGroup: "Back",
    equipment: "Dumbbells/Barbell",
    gifUrl: exerciseGifs.bentOverRow,
    duration: "60 sec",
    reps: "10-12",
    sets: 4,
    instructions: ["Hinge at hips", "Pull weight to lower chest", "Squeeze shoulder blades"]
  },
  {
    id: "back-3",
    name: "Deadlift",
    muscleGroup: "Back/Legs",
    equipment: "Barbell",
    gifUrl: exerciseGifs.deadlift,
    duration: "90 sec",
    reps: "6-8",
    sets: 4,
    instructions: ["Feet hip-width apart", "Keep back straight", "Drive through heels"]
  },
  {
    id: "back-4",
    name: "Bicep Curls",
    muscleGroup: "Biceps",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.bicepCurl,
    duration: "45 sec",
    reps: "12-15",
    sets: 3,
    instructions: ["Keep elbows fixed", "Curl weight up", "Squeeze at top"]
  },
];

export const legExercises: Exercise[] = [
  {
    id: "legs-1",
    name: "Barbell Squats",
    muscleGroup: "Quads/Glutes",
    equipment: "Barbell",
    gifUrl: exerciseGifs.squat,
    duration: "90 sec",
    reps: "8-10",
    sets: 4,
    instructions: ["Bar on upper back", "Squat until thighs parallel", "Drive up through heels"]
  },
  {
    id: "legs-2",
    name: "Walking Lunges",
    muscleGroup: "Quads/Glutes",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.lunge,
    duration: "60 sec",
    reps: "12 each leg",
    sets: 3,
    instructions: ["Step forward", "Lower back knee to floor", "Push up and repeat"]
  },
  {
    id: "legs-3",
    name: "Leg Press",
    muscleGroup: "Quads/Hamstrings",
    equipment: "Machine",
    gifUrl: exerciseGifs.legPress,
    duration: "60 sec",
    reps: "10-12",
    sets: 4,
    instructions: ["Feet shoulder-width on platform", "Lower until 90 degrees", "Push through heels"]
  },
  {
    id: "legs-4",
    name: "Calf Raises",
    muscleGroup: "Calves",
    equipment: "Bodyweight/Machine",
    gifUrl: exerciseGifs.calfRaise,
    duration: "45 sec",
    reps: "15-20",
    sets: 4,
    instructions: ["Stand on edge of step", "Rise up on toes", "Lower with control"]
  },
];

export const shoulderExercises: Exercise[] = [
  {
    id: "shoulders-1",
    name: "Shoulder Press",
    muscleGroup: "Shoulders",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.shoulderPress,
    duration: "60 sec",
    reps: "10-12",
    sets: 4,
    instructions: ["Start at shoulder height", "Press overhead", "Lower with control"]
  },
  {
    id: "shoulders-2",
    name: "Lateral Raises",
    muscleGroup: "Side Delts",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.lateralRaise,
    duration: "45 sec",
    reps: "12-15",
    sets: 3,
    instructions: ["Arms at sides", "Raise to shoulder height", "Control the descent"]
  },
  {
    id: "shoulders-3",
    name: "Front Raises",
    muscleGroup: "Front Delts",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.frontRaise,
    duration: "45 sec",
    reps: "12-15",
    sets: 3,
    instructions: ["Arms in front", "Raise to eye level", "Lower slowly"]
  },
];

export const armExercises: Exercise[] = [
  {
    id: "arms-1",
    name: "Bicep Curls",
    muscleGroup: "Biceps",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.bicepCurl,
    duration: "45 sec",
    reps: "12-15",
    sets: 4,
    instructions: ["Keep elbows fixed", "Curl weight up", "Squeeze at top"]
  },
  {
    id: "arms-2",
    name: "Hammer Curls",
    muscleGroup: "Biceps/Forearms",
    equipment: "Dumbbells",
    gifUrl: exerciseGifs.hammerCurl,
    duration: "45 sec",
    reps: "12-15",
    sets: 3,
    instructions: ["Neutral grip", "Curl to shoulder", "Control the negative"]
  },
  {
    id: "arms-3",
    name: "Tricep Extensions",
    muscleGroup: "Triceps",
    equipment: "Dumbbell",
    gifUrl: exerciseGifs.tricepExtension,
    duration: "45 sec",
    reps: "12-15",
    sets: 4,
    instructions: ["Hold weight overhead", "Lower behind head", "Extend fully"]
  },
  {
    id: "arms-4",
    name: "Tricep Dips",
    muscleGroup: "Triceps",
    equipment: "Bench/Bars",
    gifUrl: exerciseGifs.tricepDip,
    duration: "45 sec",
    reps: "12-15",
    sets: 3,
    instructions: ["Hands on edge", "Lower body down", "Push back up"]
  },
];

export const coreExercises: Exercise[] = [
  {
    id: "core-1",
    name: "Plank Hold",
    muscleGroup: "Core",
    equipment: "Bodyweight",
    gifUrl: exerciseGifs.plank,
    duration: "60 sec",
    reps: "Hold",
    sets: 3,
    instructions: ["Forearms on ground", "Body straight line", "Engage core throughout"]
  },
  {
    id: "core-2",
    name: "Crunches",
    muscleGroup: "Abs",
    equipment: "Bodyweight",
    gifUrl: exerciseGifs.crunch,
    duration: "45 sec",
    reps: "20-25",
    sets: 3,
    instructions: ["Hands behind head", "Curl up squeezing abs", "Lower with control"]
  },
  {
    id: "core-3",
    name: "Mountain Climbers",
    muscleGroup: "Core/Cardio",
    equipment: "Bodyweight",
    gifUrl: exerciseGifs.mountainClimber,
    duration: "45 sec",
    reps: "30 each leg",
    sets: 3,
    instructions: ["Start in plank", "Drive knees to chest", "Alternate quickly"]
  },
  {
    id: "core-4",
    name: "Russian Twists",
    muscleGroup: "Obliques",
    equipment: "Weight/Bodyweight",
    gifUrl: exerciseGifs.russianTwist,
    duration: "45 sec",
    reps: "20 each side",
    sets: 3,
    instructions: ["Lean back slightly", "Rotate torso side to side", "Keep feet elevated"]
  },
];

export const workoutProgram: WorkoutDay[] = [
  {
    day: 1,
    name: "Chest Day",
    shortName: "Chest",
    focus: "Upper Body Push",
    duration: "35 min",
    exercises: chestExercises,
    previewGif: exerciseGifs.pushUp,
  },
  {
    day: 2,
    name: "Back Day",
    shortName: "Back",
    focus: "Upper Body Pull",
    duration: "40 min",
    exercises: backExercises,
    previewGif: exerciseGifs.pullUp,
  },
  {
    day: 3,
    name: "Leg Day",
    shortName: "Legs",
    focus: "Lower Body",
    duration: "45 min",
    exercises: legExercises,
    previewGif: exerciseGifs.squat,
  },
  {
    day: 4,
    name: "Shoulder Day",
    shortName: "Shoulders",
    focus: "Upper Body",
    duration: "30 min",
    exercises: shoulderExercises,
    previewGif: exerciseGifs.shoulderPress,
  },
  {
    day: 5,
    name: "Arm Day",
    shortName: "Arms",
    focus: "Biceps & Triceps",
    duration: "35 min",
    exercises: armExercises,
    previewGif: exerciseGifs.bicepCurl,
  },
  {
    day: 6,
    name: "Core Day",
    shortName: "Core",
    focus: "Abs & Stability",
    duration: "25 min",
    exercises: coreExercises,
    previewGif: exerciseGifs.plank,
  },
  {
    day: 7,
    name: "Rest Day",
    shortName: "Rest",
    focus: "Recovery",
    duration: "0 min",
    exercises: [],
    previewGif: "",
  },
];

export function getWorkoutForDay(dayNumber: number): WorkoutDay {
  const index = (dayNumber - 1) % workoutProgram.length;
  return { ...workoutProgram[index], day: dayNumber };
}

export function getExercisesForDay(dayNumber: number): Exercise[] {
  const workout = getWorkoutForDay(dayNumber);
  return workout.exercises;
}
