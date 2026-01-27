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
  {
    type: "upper",
    title: "Upper Body",
    icon: Dumbbell,
    color: "from-blue-500 to-blue-600",
    description: "Chest, back, shoulders, and arms",
  },
  {
    type: "lower",
    title: "Lower Body",
    icon: Activity,
    color: "from-green-500 to-green-600",
    description: "Quads, hamstrings, glutes, and calves",
  },
  {
    type: "full",
    title: "Full Body",
    icon: Zap,
    color: "from-purple-500 to-purple-600",
    description: "Complete body workout",
  },
  {
    type: "cardio",
    title: "Cardio",
    icon: Heart,
    color: "from-red-500 to-red-600",
    description: "Heart-pumping cardio session",
  },
  {
    type: "rest",
    title: "Rest Day",
    icon: Moon,
    color: "from-gray-500 to-gray-600",
    description: "Recovery and stretching",
  },
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
    const success = await onChangeType(selected.type, selected.title);
    setIsLoading(false);

    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedType(null);
        onClose();
      }, 1500);
    }
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
          className="w-full max-w-md bg-[#1a1a2e] rounded-t-3xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">
                  Change Workout
                </h2>
                <p className="text-white/50 text-sm">Day {dayNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              data-testid="button-close-change-type"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Workout Changed!
              </h3>
              <p className="text-white/60 text-center">
                Day {dayNumber} is now{" "}
                {WORKOUT_TYPES.find((t) => t.type === selectedType)?.title}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Workout Type Options */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
                <p className="text-white/60 text-sm mb-2">
                  Select a new workout type:
                </p>
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
                        w-full p-4 rounded-2xl border transition-all flex items-center gap-4
                        ${
                          isCurrentType
                            ? "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
                            : isSelected
                              ? "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] border-transparent"
                              : "bg-white/5 border-white/10 hover:border-[#7c57ff]/50"
                        }
                      `}
                      data-testid={`workout-type-${workout.type}`}
                    >
                      <div
                        className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${isSelected ? "bg-white/20" : `bg-gradient-to-br ${workout.color}`}
                      `}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className={`font-semibold ${isSelected ? "text-white" : "text-white/90"}`}
                        >
                          {workout.title}
                          {isCurrentType && (
                            <span className="ml-2 text-xs text-white/40">
                              (Current)
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-sm ${isSelected ? "text-white/80" : "text-white/50"}`}
                        >
                          {workout.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#7c57ff]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-white/10 flex gap-3 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-medium"
                  data-testid="button-cancel-change-type"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedType === null || isLoading}
                  className={`
                    flex-1 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2
                    ${
                      selectedType !== null && !isLoading
                        ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }
                  `}
                  data-testid="button-confirm-change-type"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm
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
