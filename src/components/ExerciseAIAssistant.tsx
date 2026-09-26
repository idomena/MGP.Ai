import { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ExerciseAIAssistantProps {
  exerciseName: string;
  muscleGroups: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExerciseAIAssistant({ 
  exerciseName, 
  muscleGroups, 
  isOpen, 
  onClose 
}: ExerciseAIAssistantProps) {
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
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `I'm here to help you with **${exerciseName}**! Ask me anything about form, technique, modifications, or what muscles this exercise targets.`
    }]);
  }, [exerciseName]);

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
      const recentHistory = messages
        .slice(-4)
        .map(m => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
        .join("\n");

      const contextualPrompt = `You are helping someone during their workout. They are currently doing "${exerciseName}" which targets: ${muscleGroups}.

${recentHistory ? `Recent conversation:\n${recentHistory}\n\n` : ""}User's new question: ${input.trim()}

Provide a helpful, concise answer (2-4 sentences) focused on this specific exercise. Be encouraging and practical.`;

      const response = await fetch(`${API_BASE}/api/ai-coach`, {
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
    "How do I do this correctly?",
    "What's a good alternative?",
    "Can I do this at home?"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(59,47,39,0.36)] z-[60]"
            onClick={onClose}
          />

          {/* Chat Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-cozy-surface rounded-t-3xl max-h-[75vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cozy-line">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cozy-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-cozy-ink font-semibold">AI Exercise Coach</h3>
                  <p className="text-cozy-ink-soft text-sm">{exerciseName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-cozy-surface flex items-center justify-center hover:bg-cozy-line transition-colors"
                aria-label="Close AI assistant"
                data-testid="button-close-ai-chat"
              >
                <X className="w-5 h-5 text-cozy-ink" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[50vh]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-cozy-primary text-white rounded-br-md"
                        : "bg-cozy-surface text-cozy-ink rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-cozy-surface px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-5 h-5 text-cozy-primary animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-cozy-ink-soft text-xs mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => sendMessage(), 0);
                      }}
                      className="px-3 py-1.5 bg-cozy-surface text-cozy-ink text-sm rounded-full hover:bg-cozy-line transition-colors"
                      data-testid={`button-quick-question-${q.slice(0, 10)}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-cozy-line">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this exercise..."
                  className="flex-1 bg-cozy-surface text-cozy-ink px-4 py-3 rounded-xl placeholder-cozy-ink-soft focus:outline-none focus:ring-2 focus:ring-cozy-primary"
                  disabled={isLoading}
                  data-testid="input-ai-message"
                  aria-label="Type your question"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-xl bg-cozy-primary flex items-center justify-center disabled:opacity-50 transition-opacity"
                  aria-label="Send message"
                  data-testid="button-send-message"
                >
                  <Send className="w-5 h-5 text-cozy-ink" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
