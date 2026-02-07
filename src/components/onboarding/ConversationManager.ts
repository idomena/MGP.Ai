export type QuestionType = 
  | 'coachName'
  | 'name'
  | 'gender'
  | 'assistant'
  | 'weight'
  | 'goals'
  | 'muscleFocus'
  | 'experience'
  | 'trainingDays'

  | 'injuries'
  | 'additionalInfo'
  | 'review';

export interface Question {
  id: QuestionType;
  botMessage: string;
  componentType: 'name' | 'coachName' | 'gender' | 'assistant' | 'weight' | 'options' | 'muscleFocus' | 'trainingDays' | 'yesno' | 'textarea' | 'review';
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
    botMessage: `{coachName}: Love it! Now tell me, what's YOUR name? I want to get to know the awesome person I'll be training!`,
    componentType: 'name',
    required: true,
  },
  {
    id: 'gender',
    botMessage: "{coachName}: Nice to meet you, {name}! Just so I can personalize things a bit more - what's your gender?",
    componentType: 'gender',
    required: true,
  },
  {
    id: 'weight',
    botMessage: "{coachName}: Great, {name}! Now let's get a bit more personal - what's your current weight? Don't worry, this helps me tailor workouts just for you!",
    componentType: 'weight',
    required: true,
  },
  {
    id: 'goals',
    botMessage: "{coachName}: Alright, {name}! What's your main goal? What gets you excited to train?",
    componentType: 'options',
    multiSelect: false,
    required: true,
    options: [
      { id: 'build_muscle', label: 'Build Muscle', icon: 'Dumbbell', description: 'Gain strength and size' },
      { id: 'lose_fat', label: 'Lose Fat', icon: 'Flame', description: 'Burn fat and get lean' },
      { id: 'get_fit', label: 'Get Fit', icon: 'Heart', description: 'Improve overall fitness' },
      { id: 'athletic_performance', label: 'Athletic Performance', icon: 'Zap', description: 'Train like an athlete' },
    ],
  },
  {
    id: 'muscleFocus',
    botMessage: "{coachName}: Now let's dial in your focus. Which muscle groups are you most excited to develop? Don't worry, we'll create a balanced program!",
    componentType: 'muscleFocus',
    multiSelect: true,
    required: true,
  },
  {
    id: 'experience',
    botMessage: "{coachName}: Love those goals! Now, where are you on your fitness journey so far?",
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
    botMessage: "{coachName}: Alright, let's plan your week! Which days work best for you to train?",
    componentType: 'trainingDays',
    multiSelect: true,
    required: true,
  },

  {
    id: 'injuries',
    botMessage: "{coachName}: Safety first! Do you have any injuries or physical limitations I should keep in mind?",
    componentType: 'yesno',
    required: true,
  },
  {
    id: 'additionalInfo',
    botMessage: "{coachName}: Almost there, {name}! Anything else about your lifestyle, dietary preferences, or specific goals you'd like to share? This helps me design the perfect program for you!",
    componentType: 'textarea',
    required: false,
  },
  {
    id: 'review',
    botMessage: "{coachName}: Perfect, {name}! I've got everything I need. Here's your profile summary - take a look and let's get started!",
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
  muscleFocus: string[];
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
    muscleFocus: [],
    experience: '',
    trainingDays: [],

    workoutTypes: ['full'],
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
    selections.muscleFocus.length > 0 &&
    selections.experience.length > 0 &&
    selections.trainingDays.length > 0
  );
}
