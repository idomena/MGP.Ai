import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { Send, Loader2, ArrowLeft, SquarePen } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { callAiCoach } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const DEFAULT_GREETING: Message = {
  role: "assistant",
  content: "Hello! How can I help you with your fitness journey today?",
  timestamp: new Date(),
};

const MAX_STORED_MESSAGES = 100;
const MAX_HISTORY_FOR_API = 20;

function loadChatHistory(userId: string): Message[] {
  try {
    const raw = localStorage.getItem(`chat_history_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

function saveChatHistory(userId: string, messages: Message[]): void {
  try {
    const toStore = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(`chat_history_${userId}`, JSON.stringify(toStore));
  } catch {
    // silent fail
  }
}

export default function AssistantChatPage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get("prompt");
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([DEFAULT_GREETING]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user?.id && !historyLoaded) {
      const saved = loadChatHistory(user.id);
      if (saved.length > 0) {
        setMessages(saved);
      }
      setHistoryLoaded(true);
    }
  }, [user?.id, historyLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveMessages = useCallback((msgs: Message[]) => {
    if (user?.id) {
      saveChatHistory(user.id, msgs);
    }
  }, [user?.id]);

  useEffect(() => {
    if (initialPrompt && historyLoaded) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, historyLoaded]);

  const handleNewChat = () => {
    const freshMessages = [{ ...DEFAULT_GREETING, timestamp: new Date() }];
    setMessages(freshMessages);
    saveMessages(freshMessages);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const historyForApi = messages
        .map(m => ({ role: m.role, content: m.content }))
        .slice(-MAX_HISTORY_FOR_API);

      const data = await callAiCoach(messageText, historyForApi);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.advice || data.response || "I'm here to help with your fitness goals!",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get response. Please try again.");
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24" role="main" aria-label="AI Assistant Chat">
      <div className="px-4">
        <MobileHeader />
        
        <div className="mt-4 flex items-center justify-between gap-2">
          <Link 
            to="/assistant" 
            className="flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-lg p-1"
            aria-label="Go back to Assistant"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Assistant
          </Link>
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-lg p-1"
            aria-label="Start new chat"
            data-testid="button-new-chat"
          >
            <SquarePen className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4" 
        role="log" 
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            role="article"
            aria-label={`${message.role === "user" ? "You" : "Assistant"} said`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-[#7c57ff] to-[#00c6ff] text-white"
                  : "bg-[#3f3f3f] text-white"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1" aria-label={`Sent at ${message.timestamp.toLocaleTimeString()}`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start" role="status" aria-label="Assistant is typing">
            <div className="bg-[#3f3f3f] rounded-2xl px-4 py-3">
              <div className="flex space-x-2" aria-hidden="true">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
              <span className="sr-only">Assistant is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 bg-background">
        <form 
          className="flex items-center gap-2 bg-[#3f3f3f] rounded-full px-4 py-2"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <label htmlFor="chat-input" className="sr-only">Type your message</label>
          <input
            id="chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none focus:ring-0"
            data-testid="input-message"
            aria-describedby="send-hint"
          />
          <span id="send-hint" className="sr-only">Press Enter to send</span>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={isTyping ? "Sending message" : "Send message"}
            data-testid="button-send"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-5 h-5 text-white" aria-hidden="true" />
            )}
          </button>
        </form>
      </div>

      <NavigationBar />
    </div>
  );
}
