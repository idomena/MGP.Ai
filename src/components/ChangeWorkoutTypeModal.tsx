import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Dumbbell, Heart, Zap, Moon, Activity } from "lucide-react";

interface ChangeWorkoutTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: string;
  dayNumber: number;
  onChangeType: (newType: string, newTitle: string) => Promise<boolean>;
}

const WORKOUT_TYPES = [
  { type: "chest", title: "Chest", icon: Dumbbell, color: "from-blue-500 to-blue-600" },
  { type: "back", title: "Back", icon: Activity, color: "from-green-500 to-green-600" },
  { type: "shoulders", title: "Shoulders", icon: Zap, color: "from-orange-500 to-orange-600" },
  { type: "arms", title: "Arms", icon: Dumbbell, color: "from-cyan-500 to-cyan-600" },
  { type: "legs", title: "Legs", icon: Activity, color: "from-emerald-500 to-emerald-600" },
  { type: "core", title: "Core", icon: Zap, color: "from-yellow-500 to-yellow-600" },
  { type: "cardio", title: "Cardio", icon: Heart, color: "from-red-500 to-red-600" },
  { type: "full", title: "Full Body", icon: Zap, color: "from-purple-500 to-purple-600" },
  { type: "rest", title: "Rest Day", icon: Moon, color: "from-gray-500 to-gray-600" },
];

export default function ChangeWorkoutTypeModal({
  isOpen,
  onClose,
  currentType,
  dayNumber,
  onChangeType,
}: ChangeWorkoutTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(null);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedType) return;

    const selected = WORKOUT_TYPES.find((t) => t.type === selectedType);
    if (!selected) return;

    setIsLoading(true);
    try {
      const success = await onChangeType(selected.type, selected.title);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedType(null);
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error("Error changing workout type:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-[#1a1a2e] rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">Day {dayNumber}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
              data-testid="button-close-change-type"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-base">Done!</h3>
            </motion.div>
          ) : (
            <>
              {/* Compact Workout Options - Grid Layout */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {WORKOUT_TYPES.map((workout) => {
                  const isCurrentType = currentType 
                    ? workout.type.toLowerCase() === currentType.toLowerCase()
                    : false;
                  const isSelected = workout.type === selectedType;
                  const Icon = workout.icon;

                  return (
                    <button
                      key={workout.type}
                      onClick={() => !isCurrentType && setSelectedType(workout.type)}
                      disabled={isCurrentType}
                      className={`
                        p-3 rounded-xl border transition-all flex flex-col items-center gap-2
                        ${
                          isCurrentType
                            ? "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
                            : isSelected
                              ? "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] border-transparent scale-105"
                              : "bg-white/5 border-white/10 active:scale-95"
                        }
                      `}
                      data-testid={`workout-type-${workout.type}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? "bg-white/20" : `bg-gradient-to-br ${workout.color}`}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-white/80"}`}>
                        {workout.title}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-[#7c57ff]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Floating Confirm Button */}
              <div className="p-3 pt-0">
                <button
                  onClick={handleConfirm}
                  disabled={selectedType === null || isLoading}
                  className={`
                    w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                    ${
                      selectedType !== null && !isLoading
                        ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-purple-500/30 active:scale-95"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }
                  `}
                  data-testid="button-confirm-change-type"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm Change
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
