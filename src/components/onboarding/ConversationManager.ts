export type QuestionType = 
  | 'name'
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
  componentType: 'name' | 'assistant' | 'weight' | 'options' | 'yesno' | 'textarea' | 'review';
  options?: { id: string; label: string; icon?: string; description?: string }[];
  multiSelect?: boolean;
  required?: boolean;
}

export const ASSISTANT_NAME = "Max";

export const QUESTIONS: Question[] = [
  {
    id: 'name',
    botMessage: `Hey there! I'm ${ASSISTANT_NAME}, your AI fitness coach. I'm here to help you create a personalized workout plan. What's your name?`,
    componentType: 'name',
    required: true,
  },
  {
    id: 'assistant',
    botMessage: "Great to meet you! What type of coaching style do you prefer?",
    componentType: 'assistant',
    required: true,
  },
  {
    id: 'weight',
    botMessage: "To personalize your workouts, what's your current weight?",
    componentType: 'weight',
    required: true,
  },
  {
    id: 'goals',
    botMessage: "What are your fitness goals? Select all that apply.",
    componentType: 'options',
    multiSelect: true,
    required: true,
    options: [
      { id: 'lose_weight', label: 'Lose Weight', icon: 'TrendingDown', description: 'Burn fat and slim down' },
      { id: 'build_muscle', label: 'Build Muscle', icon: 'Dumbbell', description: 'Gain strength and size' },
      { id: 'improve_endurance', label: 'Improve Endurance', icon: 'Heart', description: 'Build stamina and cardio' },
      { id: 'increase_flexibility', label: 'Flexibility', icon: 'Stretch', description: 'Improve mobility' },
      { id: 'general_fitness', label: 'General Fitness', icon: 'Activity', description: 'Stay healthy and active' },
      { id: 'stress_relief', label: 'Stress Relief', icon: 'Wind', description: 'Mental wellness' },
    ],
  },
  {
    id: 'experience',
    botMessage: "What's your fitness experience level?",
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
    botMessage: "Which days would you like to train?",
    componentType: 'options',
    multiSelect: true,
    required: true,
    options: [
      { id: 'Mon', label: 'Monday', icon: 'Calendar' },
      { id: 'Tue', label: 'Tuesday', icon: 'Calendar' },
      { id: 'Wed', label: 'Wednesday', icon: 'Calendar' },
      { id: 'Thu', label: 'Thursday', icon: 'Calendar' },
      { id: 'Fri', label: 'Friday', icon: 'Calendar' },
      { id: 'Sat', label: 'Saturday', icon: 'Calendar' },
      { id: 'Sun', label: 'Sunday', icon: 'Calendar' },
    ],
  },
  {
    id: 'workoutTypes',
    botMessage: "What types of workouts interest you?",
    componentType: 'options',
    multiSelect: true,
    required: true,
    options: [
      { id: 'push', label: 'Push', icon: 'ArrowUp', description: 'Chest, Shoulders, Triceps' },
      { id: 'pull', label: 'Pull', icon: 'ArrowDown', description: 'Back, Biceps' },
      { id: 'legs', label: 'Legs', icon: 'Footprints', description: 'Quads, Hamstrings, Calves' },
      { id: 'upper', label: 'Upper Body', icon: 'User', description: 'Chest, Back, Arms' },
      { id: 'lower', label: 'Lower Body', icon: 'Move', description: 'Legs, Glutes' },
      { id: 'full', label: 'Full Body', icon: 'Body', description: 'Complete workout' },
      { id: 'core', label: 'Core', icon: 'Circle', description: 'Abs, Obliques' },
      { id: 'cardio', label: 'Cardio', icon: 'HeartPulse', description: 'HIIT, Conditioning' },
    ],
  },
  {
    id: 'injuries',
    botMessage: "Do you have any injuries or limitations I should know about?",
    componentType: 'yesno',
    required: true,
  },
  {
    id: 'additionalInfo',
    botMessage: "Anything else you'd like to share about your fitness journey or preferences?",
    componentType: 'textarea',
    required: false,
  },
  {
    id: 'review',
    botMessage: "Here's a summary of your profile. Review and confirm when you're ready!",
    componentType: 'review',
    required: true,
  },
];

export interface UserSelections {
  name: string;
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
    name: '',
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
