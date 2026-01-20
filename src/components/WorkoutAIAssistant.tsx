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
  time: string;
}

interface WorkoutAIAssistantProps {
  workoutName: string;
  exercises: Exercise[];
  currentExercise?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkoutAIAssistant({ 
  workoutName,
  exercises,
  currentExercise,
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
    const contextText = currentExercise 
      ? `About: **${currentExercise}**` 
      : `Today's workout: **${workoutName}**`;
    
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `${contextText}\n\nI'm your AI workout assistant! Ask me about proper form, alternatives, modifications, or any questions about your exercises.`
    }]);
  }, [workoutName, currentExercise]);

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
      const exerciseList = exercises.map(e => `${e.name} (${e.muscles}, ${e.sets} sets)`).join(", ");
      const recentHistory = messages
        .slice(-4)
        .map(m => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
        .join("\n");

      const contextualPrompt = `You are an AI workout assistant helping with "${workoutName}".
${currentExercise ? `Current exercise focus: ${currentExercise}` : ""}
Exercises in this workout: ${exerciseList}

${recentHistory ? `Recent conversation:\n${recentHistory}\n\n` : ""}User's question: ${input.trim()}

Provide a helpful, practical answer (2-4 sentences). Focus on form, safety, and encouragement. If asked about alternatives, consider equipment availability.`;

      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: contextualPrompt })
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

  const quickQuestions = [
    "How do I warm up?",
    "What's a good alternative?",
    "Is this safe for beginners?"
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
