import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Bot, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
];

const WORKOUT_TEMPLATES = [
  { id: "push", name: "Push", description: "Chest, Shoulders, Triceps" },
  { id: "pull", name: "Pull", description: "Back, Biceps" },
  { id: "legs", name: "Legs", description: "Quads, Hamstrings, Calves" },
  { id: "upper", name: "Upper Body", description: "Chest, Back, Arms" },
  { id: "lower", name: "Lower Body", description: "Legs, Glutes" },
  { id: "full", name: "Full Body", description: "Complete workout" },
  { id: "core", name: "Core", description: "Abs, Obliques" },
  { id: "cardio", name: "Cardio", description: "HIIT, Conditioning" },
];

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  options?: { id: string; label: string; description?: string }[];
  multiSelect?: boolean;
}

type OnboardingStep = "welcome" | "name" | "days" | "workouts" | "generating" | "complete";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const isMountedRef = useRef(true);

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
  }, [messages, isTyping]);

  const addBotMessage = (content: string, options?: Message["options"], multiSelect?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content,
      options,
      multiSelect,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = useCallback((callback: () => void, delay = 1000) => {
    if (!isMountedRef.current) return;
    setIsTyping(true);
    safeSetTimeout(() => {
      if (!isMountedRef.current) return;
      setIsTyping(false);
      callback();
    }, delay);
  }, [safeSetTimeout]);

  useEffect(() => {
    if (currentStep === "welcome") {
      simulateTyping(() => {
        if (!isMountedRef.current) return;
        addBotMessage("Hey there! I'm your MGP AI fitness coach. I'm here to help you create a personalized 21-day workout plan.");
        safeSetTimeout(() => {
          simulateTyping(() => {
            if (!isMountedRef.current) return;
            addBotMessage("What's your name?");
            setCurrentStep("name");
          }, 800);
        }, 500);
      }, 1200);
    }
  }, [simulateTyping, safeSetTimeout]);

  const handleNameSubmit = () => {
    if (!inputValue.trim()) return;
    
    const name = inputValue.trim();
    setUserName(name);
    addUserMessage(name);
    setInputValue("");

    simulateTyping(() => {
      if (!isMountedRef.current) return;
      addBotMessage(
        `Nice to meet you, ${name}! Let's build your perfect workout schedule.`,
      );
      safeSetTimeout(() => {
        simulateTyping(() => {
          if (!isMountedRef.current) return;
          addBotMessage(
            "Which days would you like to train? Tap all that apply, then hit confirm.",
            DAYS_OF_WEEK.map(d => ({ id: d.id, label: d.label })),
            true
          );
          setCurrentStep("days");
        }, 800);
      }, 500);
    }, 1000);
  };

  const handleDaysConfirm = () => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one training day");
      return;
    }

    const dayLabels = selectedDays.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.label || id);
    addUserMessage(dayLabels.join(", "));

    simulateTyping(() => {
      if (!isMountedRef.current) return;
      addBotMessage(
        `${selectedDays.length} day${selectedDays.length > 1 ? "s" : ""} per week - solid commitment!`
      );
      safeSetTimeout(() => {
        simulateTyping(() => {
          if (!isMountedRef.current) return;
          addBotMessage(
            "Now, what types of workouts do you want to include in your plan?",
            WORKOUT_TEMPLATES.map(w => ({ id: w.id, label: w.name, description: w.description })),
            true
          );
          setCurrentStep("workouts");
        }, 800);
      }, 500);
    }, 1000);
  };

  const handleWorkoutsConfirm = () => {
    if (selectedWorkouts.length === 0) {
      toast.error("Please select at least one workout type");
      return;
    }

    if (!user?.id) {
      toast.error("Please log in to continue");
      return;
    }

    const workoutLabels = selectedWorkouts.map(id => WORKOUT_TEMPLATES.find(w => w.id === id)?.name || id);
    addUserMessage(workoutLabels.join(", "));
    setCurrentStep("generating");

    simulateTyping(() => {
      if (!isMountedRef.current) return;
      addBotMessage("Great choices! Let me put together your personalized 21-day plan...");
      
      safeSetTimeout(() => {
        if (!isMountedRef.current) return;
        try {
          const preferences = {
            trainingDays: selectedDays,
            selectedWorkouts: selectedWorkouts,
            startDate: new Date().toISOString(),
            userName: userName,
          };
          
          localStorage.setItem("mgp_workout_preferences", JSON.stringify(preferences));
          
          setIsTyping(true);
          safeSetTimeout(() => {
            if (!isMountedRef.current) return;
            setIsTyping(false);
            
            addBotMessage(`Your plan is ready, ${userName}! You've got ${selectedDays.length} training days per week with ${selectedWorkouts.length} different workout types. Let's crush it!`);
            setCurrentStep("complete");
            
            safeSetTimeout(() => {
              if (!isMountedRef.current) return;
              toast.success("Your 21-day workout plan is ready!");
              navigate("/");
            }, 2000);
          }, 2000);
        } catch (err) {
          console.error("Error generating plan:", err);
          toast.error("Something went wrong. Please try again.");
          setCurrentStep("workouts");
        }
      }, 1500);
    }, 1000);
  };

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const toggleWorkout = (workoutId: string) => {
    setSelectedWorkouts(prev =>
      prev.includes(workoutId)
        ? prev.filter(w => w !== workoutId)
        : [...prev, workoutId]
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentStep === "name") {
      handleNameSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      <header className="px-6 pt-6 pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] bg-clip-text text-transparent text-center">
          MGP·AI Coach
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-32">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.type === "bot" 
                  ? "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa]" 
                  : "bg-white/20"
                }
              `}>
                {message.type === "bot" ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className={`
                max-w-[80%] rounded-2xl px-4 py-3
                ${message.type === "bot"
                  ? "bg-white/10 text-white rounded-tl-sm"
                  : "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] text-white rounded-tr-sm"
                }
              `}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.options && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {message.options.map((option) => {
                        const isSelected = currentStep === "days" 
                          ? selectedDays.includes(option.id)
                          : selectedWorkouts.includes(option.id);
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              if (currentStep === "days") {
                                toggleDay(option.id);
                              } else if (currentStep === "workouts") {
                                toggleWorkout(option.id);
                              }
                            }}
                            disabled={currentStep === "generating" || currentStep === "complete"}
                            className={`
                              px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                              ${isSelected
                                ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg"
                                : "bg-white/10 text-white/80 hover:bg-white/20"
                              }
                              ${currentStep === "generating" || currentStep === "complete" ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                            data-testid={`option-${option.id}`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {message.multiSelect && currentStep !== "generating" && currentStep !== "complete" && (
                      <button
                        onClick={() => {
                          if (currentStep === "days") {
                            handleDaysConfirm();
                          } else if (currentStep === "workouts") {
                            handleWorkoutsConfirm();
                          }
                        }}
                        className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white text-sm font-semibold shadow-lg shadow-[#7c57ff]/30"
                        data-testid="button-confirm"
                      >
                        Confirm Selection
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {currentStep === "name" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e] to-transparent">
          <div className="flex gap-2 bg-white/10 rounded-2xl p-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your name..."
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:outline-none"
              autoFocus
              data-testid="input-name"
            />
            <button
              onClick={handleNameSubmit}
              disabled={!inputValue.trim()}
              className={`
                p-3 rounded-xl transition-all
                ${inputValue.trim()
                  ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white"
                  : "bg-white/10 text-white/40"
                }
              `}
              data-testid="button-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
