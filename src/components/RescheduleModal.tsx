import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ArrowRightLeft, Check } from "lucide-react";

interface DayInfo {
  day: number;
  title: string;
  workoutType: string;
  date: string;
}

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: DayInfo;
  allDays: DayInfo[];
  onReschedule: (fromDay: number, toDay: number) => void;
}

export default function RescheduleModal({
  isOpen,
  onClose,
  currentDay,
  allDays,
  onReschedule,
}: RescheduleModalProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelectDay = (day: number) => {
    if (day !== currentDay.day) {
      setSelectedDay(day);
    }
  };

  const handleConfirmReschedule = () => {
    if (selectedDay !== null) {
      onReschedule(currentDay.day, selectedDay);
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedDay(null);
        onClose();
      }, 1500);
    }
  };

  const targetDayInfo = allDays.find(d => d.day === selectedDay);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  const getWorkoutTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      upper: "Upper Body",
      lower: "Lower Body",
      full: "Full Body",
      cardio: "Cardio",
      rest: "Rest Day",
    };
    return labels[type.toLowerCase()] || type;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#1a1a2e] rounded-t-3xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Reschedule Workout</h2>
                <p className="text-white/50 text-sm">Day {currentDay.day} - {getWorkoutTypeLabel(currentDay.workoutType)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              data-testid="button-close-reschedule"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Confirmation Message */}
          {showConfirmation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Workout Rescheduled!</h3>
              <p className="text-white/60 text-center">
                Day {currentDay.day} and Day {selectedDay} have been swapped.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Swap Preview */}
              {selectedDay !== null && targetDayInfo && (
                <div className="p-4 bg-[#252540] border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <p className="text-white/50 text-xs mb-1">From</p>
                      <p className="text-white font-medium">Day {currentDay.day}</p>
                      <p className="text-[#60a5fa] text-sm">{getWorkoutTypeLabel(currentDay.workoutType)}</p>
                    </div>
                    <div className="px-4">
                      <ArrowRightLeft className="w-5 h-5 text-[#7c57ff]" />
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-white/50 text-xs mb-1">To</p>
                      <p className="text-white font-medium">Day {selectedDay}</p>
                      <p className="text-[#60a5fa] text-sm">{getWorkoutTypeLabel(targetDayInfo.workoutType)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Day Selection Grid */}
              <div className="p-4 overflow-y-auto max-h-[40vh]">
                <p className="text-white/60 text-sm mb-3">Select a day to swap with:</p>
                <div className="grid grid-cols-3 gap-2">
                  {allDays.map((day) => {
                    const isCurrentDay = day.day === currentDay.day;
                    const isSelected = day.day === selectedDay;
                    
                    return (
                      <button
                        key={day.day}
                        onClick={() => handleSelectDay(day.day)}
                        disabled={isCurrentDay}
                        className={`
                          p-3 rounded-xl border transition-all
                          ${isCurrentDay 
                            ? "bg-white/5 border-white/10 opacity-40 cursor-not-allowed" 
                            : isSelected
                              ? "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] border-transparent"
                              : "bg-white/5 border-white/10 hover:border-[#7c57ff]/50"
                          }
                        `}
                        data-testid={`reschedule-day-${day.day}`}
                      >
                        <p className={`font-semibold ${isSelected ? "text-white" : "text-white/80"}`}>
                          Day {day.day}
                        </p>
                        <p className={`text-xs ${isSelected ? "text-white/80" : "text-white/50"}`}>
                          {getWorkoutTypeLabel(day.workoutType).split(" ")[0]}
                        </p>
                        {day.date && (
                          <p className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-white/40"}`}>
                            {formatDate(day.date).split(",")[0]}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-medium"
                  data-testid="button-cancel-reschedule"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReschedule}
                  disabled={selectedDay === null}
                  className={`
                    flex-1 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2
                    ${selectedDay !== null
                      ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                    }
                  `}
                  data-testid="button-confirm-reschedule"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Swap Days
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
