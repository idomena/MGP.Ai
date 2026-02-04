export type QuestionType = 
  | 'coachName'
  | 'name'
  | 'gender'
  | 'assistant'
  | 'weight'
  | 'goals'
  | 'experience'
  | 'trainingDays'
  | 'workoutTypes'
  | 'injuries'
  | 'additionalInfo'
  | 'review';

export interface Question {
  id: QuestionType;
  botMessage: string;
  componentType: 'name' | 'coachName' | 'gender' | 'assistant' | 'weight' | 'options' | 'trainingDays' | 'yesno' | 'textarea' | 'review';
  options?: { id: string; label: string; icon?: string; description?: string }[];
  multiSelect?: boolean;
  required?: boolean;
}

export const DEFAULT_COACH_NAME = "Coach";

export const QUESTIONS: Question[] = [
  {
    id: 'coachName',
    botMessage: `Hey there! Welcome to MGP.AI! I'm your personal AI fitness coach, and I'm super excited to help you crush your fitness goals! Before we start, what would you like to call me? Give me a fun name!`,
    componentType: 'coachName',
    required: true,
  },
  {
    id: 'name',
    botMessage: `Love it! Now tell me, what's YOUR name? I want to get to know the awesome person I'll be training!`,
    componentType: 'name',
    required: true,
  },
  {
    id: 'gender',
    botMessage: "Nice to meet you, {name}! Just so I can personalize things a bit more - what's your gender?",
    componentType: 'gender',
    required: true,
  },
  {
    id: 'weight',
    botMessage: "Great, {name}! Now let's get a bit more personal - what's your current weight? Don't worry, this helps me tailor workouts just for you!",
    componentType: 'weight',
    required: true,
  },
  {
    id: 'goals',
    botMessage: "Alright {name}, this is the exciting part! What's your main goal?",
    componentType: 'options',
    multiSelect: false,
    required: true,
    options: [
      { id: 'lose_weight', label: 'Lose Weight', icon: 'TrendingDown', description: 'Burn fat and slim down' },
      { id: 'build_muscle', label: 'Build Muscle', icon: 'Dumbbell', description: 'Gain strength and size' },
      { id: 'improve_endurance', label: 'Improve Endurance', icon: 'Heart', description: 'Build stamina and cardio' },
    ],
  },
  {
    id: 'experience',
    botMessage: "Love those goals! Now, where are you on your fitness journey so far?",
    componentType: 'options',
    multiSelect: false,
    required: true,
    options: [
      { id: 'beginner', label: 'Beginner', icon: 'Leaf', description: 'Just starting out' },
      { id: 'intermediate', label: 'Intermediate', icon: 'Zap', description: '1-2 years of training' },
      { id: 'advanced', label: 'Advanced', icon: 'Trophy', description: '3+ years of experience' },
    ],
  },
  {
    id: 'trainingDays',
    botMessage: "Alright, let's plan your week! Which days work best for you to train?",
    componentType: 'trainingDays',
    multiSelect: true,
    required: true,
  },
  {
    id: 'workoutTypes',
    botMessage: "Nice schedule! Pick your workout splits - single muscles or combos, mix and match however you like!",
    componentType: 'options',
    multiSelect: true,
    required: true,
    options: [
      { id: 'chest', label: 'Chest', icon: 'Dumbbell', description: 'Pecs only' },
      { id: 'back', label: 'Back', icon: 'User', description: 'Lats, rows' },
      { id: 'shoulders', label: 'Shoulders', icon: 'Target', description: 'Delts only' },
      { id: 'arms', label: 'Arms', icon: 'Zap', description: 'Biceps & Triceps' },
      { id: 'legs', label: 'Legs', icon: 'Move', description: 'Quads, hams, glutes' },
      { id: 'core', label: 'Core', icon: 'Activity', description: 'Abs, obliques' },
      { id: 'chest_shoulders', label: 'Chest + Shoulders', icon: 'Dumbbell', description: 'Push combo' },
      { id: 'back_arms', label: 'Back + Arms', icon: 'User', description: 'Pull combo' },
      { id: 'chest_back', label: 'Chest + Back', icon: 'Dumbbell', description: 'Upper body' },
      { id: 'shoulders_arms', label: 'Shoulders + Arms', icon: 'Target', description: 'Upper combo' },
      { id: 'legs_core', label: 'Legs + Core', icon: 'Move', description: 'Lower combo' },
      { id: 'cardio', label: 'Cardio', icon: 'HeartPulse', description: 'HIIT, conditioning' },
      { id: 'full', label: 'Full Body', icon: 'Body', description: 'All muscles' },
    ],
  },
  {
    id: 'injuries',
    botMessage: "Safety first! Do you have any injuries or physical limitations I should keep in mind?",
    componentType: 'yesno',
    required: true,
  },
  {
    id: 'additionalInfo',
    botMessage: "Almost done! Anything else you'd like me to know? Maybe dietary preferences, equipment you have, or just say hi!",
    componentType: 'textarea',
    required: false,
  },
  {
    id: 'review',
    botMessage: "You're all set! Here's your profile summary. Take a look and let's get started when you're ready!",
    componentType: 'review',
    required: true,
  },
];

export interface UserSelections {
  coachName: string;
  name: string;
  gender: 'male' | 'female' | 'other' | '';
  assistantType: 'coach' | 'nutritionist' | 'trainer';
  weight: { value: number; unit: 'kg' | 'lbs' };
  goals: string[];
  experience: string;
  trainingDays: string[];
  workoutTypes: string[];
  hasInjuries: boolean;
  injuryDetails?: string;
  additionalInfo?: string;
}

export function getDefaultSelections(): UserSelections {
  return {
    coachName: 'Coach',
    name: '',
    gender: '',
    assistantType: 'coach',
    weight: { value: 70, unit: 'kg' },
    goals: [],
    experience: '',
    trainingDays: [],
    workoutTypes: [],
    hasInjuries: false,
  };
}

export function getQuestionByIndex(index: number): Question | null {
  return QUESTIONS[index] || null;
}

export function getNextQuestionIndex(currentIndex: number, selections: UserSelections): number {
  const nextIndex = currentIndex + 1;
  
  if (currentIndex === QUESTIONS.findIndex(q => q.id === 'injuries')) {
    if (!selections.hasInjuries) {
      const additionalInfoIndex = QUESTIONS.findIndex(q => q.id === 'additionalInfo');
      return additionalInfoIndex;
    }
  }
  
  return nextIndex;
}

export function isOnboardingComplete(selections: UserSelections): boolean {
  return (
    selections.name.length > 0 &&
    selections.goals.length > 0 &&
    selections.experience.length > 0 &&
    selections.trainingDays.length > 0 &&
    selections.workoutTypes.length > 0
  );
}
