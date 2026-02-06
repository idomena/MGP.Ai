import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { saveOnboardingAndGeneratePlan } from "@/services/workoutPlanService";

import {
  QUESTIONS,
  DEFAULT_COACH_NAME,
  getDefaultSelections,
  UserSelections,
  Question,
} from "@/components/onboarding/ConversationManager";

import NameInput from "@/components/onboarding/NameInput";
import { GenderSelector } from "@/components/onboarding/GenderSelector";
import WeightSelector from "@/components/onboarding/WeightSelector";
import OptionSelector from "@/components/onboarding/OptionSelector";
import MuscleFocusSelector from "@/components/onboarding/MuscleFocusSelector";
import { TrainingDaysSelector } from "@/components/onboarding/TrainingDaysSelector";
import YesNoSelector from "@/components/onboarding/YesNoSelector";
import AdditionalInfo from "@/components/onboarding/AdditionalInfo";
import ReviewSelections from "@/components/onboarding/ReviewSelections";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  showComponent?: boolean;
  questionIndex?: number;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [selections, setSelections] = useState<UserSelections>(getDefaultSelections());
  const [showCurrentComponent, setShowCurrentComponent] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const isMountedRef = useRef(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      if (isMountedRef.current) {
        callback();
      }
    }, delay);
    timeoutRefs.current.push(id);
    return id;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showCurrentComponent]);

  const addBotMessage = useCallback((content: string, showComponent = false, questionIndex?: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content,
      showComponent,
      questionIndex,
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const simulateTyping = useCallback((callback: () => void, delay = 300) => {
    if (!isMountedRef.current) return;
    setIsTyping(true);
    safeSetTimeout(() => {
      if (!isMountedRef.current) return;
      setIsTyping(false);
      callback();
    }, delay);
  }, [safeSetTimeout]);

  const askNextQuestion = useCallback((questionIndex: number) => {
    if (questionIndex >= QUESTIONS.length) {
      return;
    }

    const question = QUESTIONS[questionIndex];
    setCurrentQuestionIndex(questionIndex);
    setShowCurrentComponent(false);

    simulateTyping(() => {
      if (!isMountedRef.current) return;
      
      let message = question.botMessage;
      if (message.includes('{coachName}')) {
        message = message.replace(/\{coachName\}/g, selections.coachName || DEFAULT_COACH_NAME);
      }
      if (message.includes('{name}')) {
        message = message.replace(/\{name\}/g, selections.name);
      }
      
      addBotMessage(message, true, questionIndex);
      
      safeSetTimeout(() => {
        if (isMountedRef.current) {
          setShowCurrentComponent(true);
        }
      }, 200);
    }, 200);
  }, [simulateTyping, addBotMessage, safeSetTimeout, selections.name, selections.coachName]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      askNextQuestion(0);
    }
  }, [askNextQuestion]);

  const handleAnswer = useCallback((questionId: string, answer: string, displayText: string) => {
    addUserMessage(displayText);
    setShowCurrentComponent(false);

    const nextIndex = currentQuestionIndex + 1;
    
    try {
      const progress = { selections: { ...selections }, currentStep: nextIndex };
      localStorage.setItem('mgp_onboarding_progress', JSON.stringify(progress));
    } catch (e) {}

    if (questionId === 'injuries' && answer === 'no') {
      const additionalInfoIndex = QUESTIONS.findIndex(q => q.id === 'additionalInfo');
      safeSetTimeout(() => askNextQuestion(additionalInfoIndex), 500);
    } else if (nextIndex < QUESTIONS.length) {
      safeSetTimeout(() => askNextQuestion(nextIndex), 500);
    }
  }, [currentQuestionIndex, addUserMessage, askNextQuestion, safeSetTimeout, selections]);

  const handleCoachNameSubmit = (coachName: string) => {
    const name = coachName.trim() || DEFAULT_COACH_NAME;
    setSelections(prev => ({ ...prev, coachName: name }));
    handleAnswer('coachName', name, name);
  };

  const handleNameSubmit = (name: string) => {
    setSelections(prev => ({ ...prev, name }));
    handleAnswer('name', name, name);
  };

  const handleGenderSelect = (gender: 'male' | 'female' | 'other') => {
    setSelections(prev => ({ ...prev, gender }));
    const labels = { 
      male: 'Male', 
      female: 'Female', 
      other: 'Other'
    };
    handleAnswer('gender', gender, labels[gender]);
  };


  const handleWeightSelect = (weight: number, unit: 'kg' | 'lbs') => {
    setSelections(prev => ({ ...prev, weight: { value: weight, unit } }));
    handleAnswer('weight', `${weight}`, `${weight} ${unit}`);
  };

  const handleGoalsSelect = (goals: string[]) => {
    setSelections(prev => ({ ...prev, goals }));
    const labels = goals.map(id => QUESTIONS.find(q => q.id === 'goals')?.options?.find(o => o.id === id)?.label || id);
    handleAnswer('goals', goals.join(','), labels.join(', '));
  };

  const handleExperienceSelect = (experience: string[]) => {
    const exp = experience[0];
    setSelections(prev => ({ ...prev, experience: exp }));
    const label = QUESTIONS.find(q => q.id === 'experience')?.options?.find(o => o.id === exp)?.label || exp;
    handleAnswer('experience', exp, label);
  };

  const handleTrainingDaysSelect = (days: string[]) => {
    setSelections(prev => ({ ...prev, trainingDays: days }));
    handleAnswer('trainingDays', days.join(','), days.join(', '));
  };

  const handleMuscleFocusSelect = (muscles: string[]) => {
    setSelections(prev => ({ ...prev, muscleFocus: muscles }));
    const labels = muscles.map(m => m.charAt(0).toUpperCase() + m.slice(1));
    handleAnswer('muscleFocus', muscles.join(','), labels.join(', '));
  };

  const handleInjuriesSelect = (hasInjuries: boolean) => {
    setSelections(prev => ({ ...prev, hasInjuries }));
    handleAnswer('injuries', hasInjuries ? 'yes' : 'no', hasInjuries ? 'Yes' : 'No');
  };

  const handleAdditionalInfoSubmit = (text: string) => {
    setSelections(prev => ({ ...prev, additionalInfo: text }));
    handleAnswer('additionalInfo', text, text || 'Skipped');
  };

  const handleAdditionalInfoSkip = () => {
    handleAnswer('additionalInfo', '', 'Skipped');
  };

  const handleReviewConfirm = async () => {
    if (!user?.id) {
      toast.error("Please log in to continue");
      return;
    }

    setIsComplete(true);
    addUserMessage("Let's go!");

    const onboardingData = {
      coachName: selections.coachName,
      userName: selections.name,
      gender: selections.gender,
      assistantType: selections.assistantType,
      weight: selections.weight,
      goals: selections.goals,
      muscleFocus: selections.muscleFocus,
      experience: selections.experience,
      trainingDays: selections.trainingDays,
      selectedWorkouts: selections.muscleFocus.length > 0 ? selections.muscleFocus : selections.workoutTypes,
      hasInjuries: selections.hasInjuries,
      additionalInfo: selections.additionalInfo,
    };

    const localPrefs = {
      ...onboardingData,
      startDate: new Date().toISOString(),
    };
    localStorage.setItem("mgp_workout_preferences", JSON.stringify(localPrefs));

    simulateTyping(async () => {
      if (!isMountedRef.current) return;

      const result = await saveOnboardingAndGeneratePlan(user.id, onboardingData);

      if (result.success) {
        addBotMessage(`Awesome, ${selections.name}! I'm ${selections.coachName}, and your personalized 21-day workout plan is ready. Let's crush it together!`);
        
        safeSetTimeout(() => {
          toast.success("Your 21-day workout plan is ready!");
          navigate("/");
        }, 2000);
      } else {
        addBotMessage(`Oops! Something went wrong while creating your plan. Let's try again.`);
        toast.error("Failed to create workout plan. Please try again.");
        setIsComplete(false);
      }
    }, 1000);
  };

  const handleReviewEdit = (field: string) => {
    const questionIndex = QUESTIONS.findIndex(q => q.id === field);
    if (questionIndex >= 0) {
      setShowCurrentComponent(false);
      safeSetTimeout(() => askNextQuestion(questionIndex), 300);
    }
  };

  const getCurrentQuestion = (): Question | null => {
    return QUESTIONS[currentQuestionIndex] || null;
  };

  const renderInputComponent = () => {
    const question = getCurrentQuestion();
    if (!question || !showCurrentComponent || isComplete) return null;

    switch (question.componentType) {
      case 'coachName':
        return <NameInput onSubmit={handleCoachNameSubmit} placeholder="Give me a name..." />;
      
      case 'name':
        return <NameInput onSubmit={handleNameSubmit} placeholder="Enter your name..." />;
      
      case 'gender':
        return <GenderSelector onSelect={handleGenderSelect} />;
      
      case 'weight':
        return <WeightSelector onSelect={handleWeightSelect} />;
      
      case 'options':
        if (question.id === 'goals') {
          return <OptionSelector options={question.options || []} multiSelect={false} onSelect={handleGoalsSelect} />;
        }
        if (question.id === 'experience') {
          return <OptionSelector options={question.options || []} multiSelect={false} onSelect={handleExperienceSelect} />;
        }
        return null;
      
      case 'muscleFocus':
        return <MuscleFocusSelector onSelect={handleMuscleFocusSelect} />;

      case 'trainingDays':
        return <TrainingDaysSelector onSelect={handleTrainingDaysSelect} />;

      case 'yesno':
        return <YesNoSelector onSelect={handleInjuriesSelect} />;
      
      case 'textarea':
        return <AdditionalInfo onSubmit={handleAdditionalInfoSubmit} onSkip={handleAdditionalInfoSkip} />;
      
      case 'review':
        const genderLabels: Record<string, string> = { 
          male: 'Male', female: 'Female', other: 'Other', '': 'Not set'
        };
        return (
          <ReviewSelections
            selections={{
              coachName: selections.coachName,
              name: selections.name,
              gender: genderLabels[selections.gender] || 'Not set',
              weight: `${selections.weight.value} ${selections.weight.unit}`,
              goals: selections.goals,
              muscleFocus: selections.muscleFocus,
              experience: selections.experience,
              trainingDays: selections.trainingDays,
              injuries: selections.hasInjuries ? 'Yes' : 'No',
              additionalInfo: selections.additionalInfo || 'None',
            }}
            onConfirm={handleReviewConfirm}
            onEdit={handleReviewEdit}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      <header className="sticky top-0 z-50 px-4 py-4 border-b border-white/10 bg-[#0f0f1a]/80 backdrop-blur-lg">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7c57ff]" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] bg-clip-text text-transparent">
            {selections.coachName || DEFAULT_COACH_NAME} - AI Coach
          </h1>
        </div>
        <div className="mt-3 w-full bg-white/10 rounded-full h-1.5">
          <div 
            className="h-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="text-white/40 text-xs mt-1 text-center">
          Step {currentQuestionIndex + 1} of {QUESTIONS.length}
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                  ${message.type === 'bot' 
                    ? 'bg-gradient-to-br from-[#7c57ff] to-[#60a5fa]' 
                    : 'bg-white/10'
                  }
                `}>
                  {message.type === 'bot' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white/70" />
                  )}
                </div>

                <div className={`
                  max-w-[80%] px-4 py-3 rounded-2xl
                  ${message.type === 'bot'
                    ? 'bg-white/5 rounded-tl-sm'
                    : 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] rounded-tr-sm'
                  }
                `}>
                  <p className="text-white text-sm leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>


          <AnimatePresence>
            {showCurrentComponent && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                {renderInputComponent()}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>
    </div>
  );
}
