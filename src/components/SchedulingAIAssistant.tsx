import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Calendar, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: {
    type: "move_workout" | "skip_workout" | "change_workout";
    fromDay: number;
    toDay?: number;
    fromTitle: string;
    newType?: string;
    newTitle?: string;
    confirmed?: boolean;
  };
}

interface DayInfo {
  day: number;
  title: string;
  workoutType: string;
  date: string;
}

interface SchedulingAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  selectedDay?: number | null;
  dayStatuses: DayInfo[];
  onMoveWorkout: (fromDay: number, toDay: number) => Promise<boolean>;
  onSkipWorkout?: (day: number) => Promise<boolean>;
  onChangeWorkoutType?: (day: number, newType: string, newTitle: string) => Promise<boolean>;
}

export default function SchedulingAIAssistant({
  isOpen,
  onClose,
  currentDay,
  selectedDay,
  dayStatuses,
  onMoveWorkout,
  onSkipWorkout,
  onChangeWorkoutType,
}: SchedulingAIAssistantProps) {
  const sourceDay = selectedDay || currentDay;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<Message["action"] | null>(null);
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
    const sourceDayInfo = dayStatuses.find((d) => d.day === sourceDay);
    const isSelectedDifferent = selectedDay && selectedDay !== currentDay;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: isSelectedDifferent 
          ? `I can help you reschedule **Day ${sourceDay}** (${sourceDayInfo?.title || "Workout"}).\n\nTell me where you'd like to move it:\n• "Move to Sunday"\n• "Move to day 15"\n• "Move to tomorrow"`
          : `Hi! I'm your scheduling assistant. I can help you move workouts around your journey.\n\nToday is **Day ${currentDay}** (${sourceDayInfo?.title || "Workout"}).\n\nJust tell me what you'd like to do, like:\n• "Move today's workout to Sunday"\n• "I can't workout today, reschedule it"\n• "Push my workout to tomorrow"`,
      },
    ]);
    setPendingAction(null);
  }, [isOpen, currentDay, selectedDay, sourceDay, dayStatuses]);

  const parseDateFromText = (text: string): number | null => {
    const lowerText = text.toLowerCase();
    
    const dayMatch = lowerText.match(/day\s*(\d+)/);
    if (dayMatch) {
      const targetDay = parseInt(dayMatch[1], 10);
      if (targetDay >= 1 && targetDay !== currentDay) {
        return targetDay;
      }
    }

    if (lowerText.includes("tomorrow")) {
      return currentDay + 1;
    }

    if (lowerText.includes("day after tomorrow")) {
      return currentDay + 2;
    }
    
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < dayNames.length; i++) {
      if (lowerText.includes(dayNames[i])) {
        for (const ds of dayStatuses) {
          if (ds.date && ds.day !== currentDay) {
            const date = new Date(ds.date);
            if (date.getDay() === i && ds.day > currentDay) {
              return ds.day;
            }
          }
        }
        
        for (const ds of dayStatuses) {
          if (ds.date && ds.day !== currentDay) {
            const date = new Date(ds.date);
            if (date.getDay() === i) {
              return ds.day;
            }
          }
        }
      }
    }
    
    const nextWeekMatch = lowerText.match(/next\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (nextWeekMatch) {
      const dayName = nextWeekMatch[1];
      if (dayName === "week") {
        return currentDay + 7;
      }
      const dayIndex = dayNames.indexOf(dayName);
      if (dayIndex !== -1) {
        for (const ds of dayStatuses) {
          if (ds.date && ds.day > currentDay) {
            const date = new Date(ds.date);
            if (date.getDay() === dayIndex) {
              return ds.day;
            }
          }
        }
      }
    }
    
    return null;
  };

  const parseSourceDayFromText = (text: string): number => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("today") || lowerText.includes("my workout") || lowerText.includes("this workout")) {
      return sourceDay;
    }
    
    const dayMatch = lowerText.match(/day\s*(\d+)/g);
    if (dayMatch && dayMatch.length > 0) {
      const firstMatch = dayMatch[0].match(/\d+/);
      if (firstMatch) {
        return parseInt(firstMatch[0], 10);
      }
    }
    
    return sourceDay;
  };

  const parseWorkoutTypeFromText = (text: string): { type: string; title: string } | null => {
    const lowerText = text.toLowerCase();
    
    // Check for combo workouts first (more specific)
    if ((lowerText.includes("chest") && lowerText.includes("shoulder")) || lowerText.includes("chest+shoulder")) {
      return { type: "chest_shoulders", title: "Chest + Shoulders" };
    }
    if ((lowerText.includes("back") && lowerText.includes("arm")) || lowerText.includes("back+arm")) {
      return { type: "back_arms", title: "Back + Arms" };
    }
    if ((lowerText.includes("chest") && lowerText.includes("back")) || lowerText.includes("chest+back")) {
      return { type: "chest_back", title: "Chest + Back" };
    }
    if ((lowerText.includes("shoulder") && lowerText.includes("arm")) || lowerText.includes("shoulder+arm")) {
      return { type: "shoulders_arms", title: "Shoulders + Arms" };
    }
    if ((lowerText.includes("leg") && lowerText.includes("core")) || lowerText.includes("leg+core")) {
      return { type: "legs_core", title: "Legs + Core" };
    }
    
    // Single muscle groups
    if (lowerText.includes("chest") || lowerText.includes("pec")) {
      return { type: "chest", title: "Chest" };
    }
    if (lowerText.includes("back") || lowerText.includes("lat") || lowerText.includes("row")) {
      return { type: "back", title: "Back" };
    }
    if (lowerText.includes("shoulder") || lowerText.includes("delt")) {
      return { type: "shoulders", title: "Shoulders" };
    }
    if (lowerText.includes("arm") || lowerText.includes("bicep") || lowerText.includes("tricep")) {
      return { type: "arms", title: "Arms" };
    }
    if (lowerText.includes("leg") || lowerText.includes("glute") || lowerText.includes("squat") || lowerText.includes("quad")) {
      return { type: "legs", title: "Legs" };
    }
    if (lowerText.includes("core") || lowerText.includes("abs") || lowerText.includes("oblique")) {
      return { type: "core", title: "Core" };
    }
    if (lowerText.includes("cardio") || lowerText.includes("running") || lowerText.includes("hiit")) {
      return { type: "cardio", title: "Cardio" };
    }
    if (lowerText.includes("full body") || lowerText.includes("fullbody") || lowerText.includes("total body")) {
      return { type: "full", title: "Full Body" };
    }
    
    return null;
  };

  const processUserInput = async (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    const isSchedulingRequest = 
      lowerInput.includes("move") ||
      lowerInput.includes("reschedule") ||
      lowerInput.includes("push") ||
      lowerInput.includes("change") ||
      lowerInput.includes("can't workout") ||
      lowerInput.includes("cannot workout") ||
      lowerInput.includes("skip");
    
    if (isSchedulingRequest) {
      const isSkipRequest = lowerInput.includes("skip");
      const parsedSourceDay = parseSourceDayFromText(userInput);
      const sourceDayInfo = dayStatuses.find((d) => d.day === parsedSourceDay);
      
      // Handle skip requests - convert workout to rest day
      if (isSkipRequest && sourceDayInfo && sourceDayInfo.workoutType !== "rest") {
        const action: Message["action"] = {
          type: "skip_workout",
          fromDay: parsedSourceDay,
          fromTitle: sourceDayInfo.title,
        };
        
        setPendingAction(action);
        
        return {
          content: `I'll skip your **${sourceDayInfo.title}** on Day ${parsedSourceDay} and turn it into a Rest Day.\n\nYou can always change it back later if needed.\n\nShould I skip this workout?`,
          action,
        };
      }
      
      // Handle change workout type requests (e.g., "change to upper body", "make this a leg day")
      const isChangeTypeRequest = lowerInput.includes("change") && 
        (lowerInput.includes("to ") || lowerInput.includes("this ") || lowerInput.includes("make"));
      const targetWorkoutType = parseWorkoutTypeFromText(userInput);
      
      if (isChangeTypeRequest && targetWorkoutType && sourceDayInfo) {
        // Don't allow changing to the same type
        if (sourceDayInfo.workoutType === targetWorkoutType.type) {
          return {
            content: `Day ${parsedSourceDay} is already a ${targetWorkoutType.title} workout. Would you like to change it to something else?`,
          };
        }
        
        const action: Message["action"] = {
          type: "change_workout",
          fromDay: parsedSourceDay,
          fromTitle: sourceDayInfo.title,
          newType: targetWorkoutType.type,
          newTitle: targetWorkoutType.title,
        };
        
        setPendingAction(action);
        
        return {
          content: `I'll change Day ${parsedSourceDay} from **${sourceDayInfo.title}** to **${targetWorkoutType.title}**.\n\nShould I make this change?`,
          action,
        };
      }
      
      // Handle move requests
      const targetDay = parseDateFromText(userInput);
      
      if (targetDay && targetDay !== parsedSourceDay) {
        const targetDayInfo = dayStatuses.find((d) => d.day === targetDay);
        
        if (sourceDayInfo && targetDayInfo) {
          const action: Message["action"] = {
            type: "move_workout",
            fromDay: parsedSourceDay,
            toDay: targetDay,
            fromTitle: sourceDayInfo.title,
          };
          
          setPendingAction(action);
          
          return {
            content: `I'll move your **${sourceDayInfo.title}** from Day ${parsedSourceDay} to Day ${targetDay}.\n\nDay ${parsedSourceDay} will become a Rest Day, and Day ${targetDay} will get the ${sourceDayInfo.title} workout.\n\nShould I make this change?`,
            action,
          };
        }
      } else if (!targetDay && !isSkipRequest && !(isChangeTypeRequest && targetWorkoutType)) {
        // Only show move error if it's not a change type request
        if (isChangeTypeRequest && !targetWorkoutType) {
          return {
            content: "I couldn't figure out which workout type you want. Try saying:\n• \"Change to Upper Body\"\n• \"Change to Lower Body\"\n• \"Change to Cardio\"\n• \"Change to Full Body\"",
          };
        }
        return {
          content: "I couldn't figure out which day you want to move the workout to. Could you try again? For example:\n• \"Move to Sunday\"\n• \"Reschedule to day 15\"\n• \"Push to tomorrow\"",
        };
      }
    }
    
    try {
      const scheduleContext = dayStatuses
        .map((d) => `Day ${d.day}: ${d.title} (${d.workoutType})${d.day === currentDay ? " - TODAY" : ""}`)
        .join("\n");
      
      const response = await fetch(`${API_BASE}/api/ai-coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You are a workout scheduling assistant. The user's ongoing fitness journey schedule is:
${scheduleContext}

Today is Day ${currentDay}.

User's message: "${userInput}"

If the user is asking about scheduling or moving workouts, explain how they can do it by saying something like "move my workout to Sunday" or "reschedule to day 15". If they're asking about their schedule, provide relevant information. Keep responses brief (2-3 sentences).`,
        }),
      });
      
      const data = await response.json();
      return {
        content: data.success && data.response
          ? data.response
          : "I'm here to help you reschedule your workouts. Try saying something like 'move today's workout to Sunday' or 'reschedule to day 15'.",
      };
    } catch (error) {
      return {
        content: "I'm here to help you reschedule workouts. Try saying 'move today's workout to Sunday' or 'reschedule to day 15'.",
      };
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await processUserInput(input.trim());
      
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.content,
          action: response.action,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    
    setIsLoading(true);
    
    let success = false;
    
    if (pendingAction.type === "skip_workout") {
      // Skip workout by calling onSkipWorkout
      if (onSkipWorkout) {
        success = await onSkipWorkout(pendingAction.fromDay);
      }
    } else if (pendingAction.type === "change_workout" && pendingAction.newType && pendingAction.newTitle) {
      // Change workout type
      if (onChangeWorkoutType) {
        success = await onChangeWorkoutType(pendingAction.fromDay, pendingAction.newType, pendingAction.newTitle);
      }
    } else if (pendingAction.type === "move_workout" && pendingAction.toDay) {
      // Move workout
      success = await onMoveWorkout(pendingAction.fromDay, pendingAction.toDay);
    }
    
    setIsLoading(false);
    
    if (success) {
      let successMessage: string;
      if (pendingAction.type === "skip_workout") {
        successMessage = `Done! I've skipped your ${pendingAction.fromTitle} on Day ${pendingAction.fromDay}. It's now a Rest Day.`;
      } else if (pendingAction.type === "change_workout") {
        successMessage = `Done! I've changed Day ${pendingAction.fromDay} to ${pendingAction.newTitle}.`;
      } else {
        successMessage = `Done! I've moved your ${pendingAction.fromTitle} from Day ${pendingAction.fromDay} to Day ${pendingAction.toDay}. Day ${pendingAction.fromDay} is now a Rest Day.`;
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: `confirm-${Date.now()}`,
          role: "assistant",
          content: successMessage,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't make that change. Please try again.",
        },
      ]);
    }
    
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `cancel-${Date.now()}`,
        role: "assistant",
        content: "No problem! Let me know if you'd like to make any other changes to your schedule.",
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isSelectedDifferent = selectedDay && selectedDay !== currentDay;
  const sourceDayInfo = dayStatuses.find((d) => d.day === sourceDay);
  const isRestDay = sourceDayInfo?.workoutType === "rest";
  
  const quickCommands = isSelectedDifferent
    ? isRestDay
      ? [`Change to Upper Body`, `Change to Lower Body`, `Change to Cardio`]
      : [`Skip this workout`, `Move to tomorrow`, `Change to Upper Body`]
    : isRestDay
      ? ["Change to Upper Body", "Change to Lower Body", "Change to Cardio"]
      : ["Skip today", "Move today to tomorrow", "What's my schedule?"];

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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Scheduling Assistant
                  </h3>
                  <p className="text-white/60 text-sm">Move and manage workouts</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                data-testid="button-close-scheduling-ai"
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
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

            {pendingAction && (
              <div className="px-4 pb-3">
                <div className="bg-[#252540] rounded-2xl p-4 border border-[#7c57ff]/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <p className="text-white/50 text-xs">Day {pendingAction.fromDay}</p>
                        <p className="text-white font-medium text-sm">{pendingAction.fromTitle}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#7c57ff]" />
                      <div className="text-center">
                        <p className="text-white/50 text-xs">Day {pendingAction.toDay}</p>
                        <p className="text-white font-medium text-sm">{pendingAction.fromTitle}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelAction}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm"
                      data-testid="button-cancel-move"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmAction}
                      disabled={isLoading}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white font-medium text-sm flex items-center justify-center gap-2"
                      data-testid="button-confirm-move"
                    >
                      <Check className="w-4 h-4" />
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.length <= 1 && !pendingAction && (
              <div className="px-4 pb-3">
                <p className="text-white/50 text-xs mb-2">Quick commands:</p>
                <div className="flex flex-wrap gap-2">
                  {quickCommands.map((cmd) => (
                    <button
                      key={cmd}
                      onClick={async () => {
                        if (isLoading) return;
                        
                        const userMessage: Message = {
                          id: `user-${Date.now()}`,
                          role: "user",
                          content: cmd,
                        };
                        
                        setMessages((prev) => [...prev, userMessage]);
                        setIsLoading(true);
                        
                        try {
                          const response = await processUserInput(cmd);
                          const assistantMessage: Message = {
                            id: `assistant-${Date.now()}`,
                            role: "assistant",
                            content: response.content,
                            action: response.action,
                          };
                          setMessages((prev) => [...prev, assistantMessage]);
                        } catch (error) {
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: `error-${Date.now()}`,
                              role: "assistant",
                              content: "Sorry, something went wrong. Please try again.",
                            },
                          ]);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="px-3 py-2 bg-white/10 text-white/80 text-sm rounded-full hover:bg-white/20 transition-colors"
                      data-testid={`button-quick-${cmd.slice(0, 8)}`}
                    >
                      {cmd}
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
                  placeholder="Tell me how to reschedule..."
                  className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7c57ff] border border-white/10 focus:border-[#7c57ff]"
                  disabled={isLoading}
                  data-testid="input-scheduling-message"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] flex items-center justify-center disabled:opacity-50 transition-opacity"
                  data-testid="button-send-scheduling"
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
