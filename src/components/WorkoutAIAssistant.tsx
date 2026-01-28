import { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, Loader2, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Exercise {
  name: string;
  muscles: string;
  sets: number;
  reps: string | number;
  time: string;
}

interface WorkoutAIAssistantProps {
  workoutName: string;
  exercises: Exercise[];
  currentExercise?: string;
  currentExerciseIndex?: number;
  completedExercises?: number;
  isResting?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkoutAIAssistant({ 
  workoutName,
  exercises,
  currentExercise,
  currentExerciseIndex,
  completedExercises = 0,
  isResting = false,
  isOpen, 
  onClose 
}: WorkoutAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Build a personalized welcome message based on context
    let welcomeMessage = "";
    
    if (currentExercise) {
      const currentEx = exercises.find(e => e.name === currentExercise);
      welcomeMessage = `I see you're working on **${currentExercise}**`;
      if (currentEx) {
        welcomeMessage += ` targeting your ${currentEx.muscles}.`;
      }
      if (isResting) {
        welcomeMessage += `\n\nTake a moment to catch your breath! Need any tips for your next set?`;
      } else {
        welcomeMessage += `\n\nNeed help with form, breathing, or modifications? I'm here!`;
      }
    } else {
      welcomeMessage = `Today's workout: **${workoutName}** with ${exercises.length} exercises.`;
      if (completedExercises > 0) {
        const progressPercent = Math.round((completedExercises / exercises.length) * 100);
        welcomeMessage += `\n\nYou've completed ${completedExercises}/${exercises.length} exercises (${progressPercent}%). Great progress!`;
      }
      welcomeMessage += `\n\nAsk me about form tips, alternatives, or any questions!`;
    }
    
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: welcomeMessage
    }]);
  }, [workoutName, currentExercise, exercises, completedExercises, isResting]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const recentHistory = messages
        .slice(-4)
        .map(m => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
        .join("\n");

      // Build the user's message with conversation context
      const userQuestion = recentHistory 
        ? `Previous conversation:\n${recentHistory}\n\nUser's new question: ${input.trim()}`
        : input.trim();

      // Build exercise context if we have a current exercise
      const currentEx = currentExercise 
        ? exercises.find(e => e.name === currentExercise)
        : undefined;

      const exerciseContext = currentEx ? {
        exerciseName: currentEx.name,
        muscleGroups: currentEx.muscles.split(/[,/]/).map(m => m.trim()),
        sets: currentEx.sets,
        reps: typeof currentEx.reps === 'string' ? parseInt(currentEx.reps) || 12 : currentEx.reps,
        isResting: isResting,
        workoutType: workoutName,
      } : undefined;

      // Send full context to the API
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userQuestion,
          context: exerciseContext,
          workoutName: workoutName,
          allExercises: exercises.map(e => ({
            name: e.name,
            muscles: e.muscles,
            sets: e.sets,
            reps: e.reps,
            time: e.time,
          })),
          currentExerciseIndex: currentExerciseIndex,
          completedExercises: completedExercises,
          totalExercises: exercises.length,
        })
      });

      const data = await response.json();

      if (data.success && data.response) {
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again."
        }]);
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Connection issue. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Context-aware quick questions
  const quickQuestions = currentExercise 
    ? [
        `How do I do ${currentExercise} correctly?`,
        "Is my form okay?",
        "What's a good alternative?",
      ]
    : [
        "How should I warm up?",
        "What order should I do these?",
        "Any tips for beginners?",
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#1a1a2e] rounded-t-3xl h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Workout Assistant</h3>
                  <p className="text-white/60 text-sm">
                    {currentExercise ? `About: ${currentExercise}` : workoutName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Close AI assistant"
                data-testid="button-close-workout-ai"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white rounded-br-md"
                        : "bg-white/10 text-white rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-5 h-5 text-[#7c57ff] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="px-4 pb-3">
                <p className="text-white/50 text-xs mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => sendMessage(), 0);
                      }}
                      className="px-3 py-2 bg-white/10 text-white/80 text-sm rounded-full hover:bg-white/20 transition-colors"
                      data-testid={`button-quick-${q.slice(0, 8)}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your workout..."
                  className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7c57ff] border border-white/10 focus:border-[#7c57ff]"
                  disabled={isLoading}
                  data-testid="input-workout-ai-message"
                  aria-label="Type your question"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] flex items-center justify-center disabled:opacity-50 transition-opacity"
                  aria-label="Send message"
                  data-testid="button-send-workout-ai"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
