import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Dumbbell, ArrowRightLeft } from "lucide-react";
import { Exercise } from "@/data/workoutExercises";

interface SwapExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExercise: Exercise;
  alternatives: Exercise[];
  onSwap: (newExercise: Exercise) => void;
}

export default function SwapExerciseModal({
  isOpen,
  onClose,
  currentExercise,
  alternatives,
  onSwap,
}: SwapExerciseModalProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredAlternatives = useMemo(() => {
    return alternatives.filter((ex) => ex.id !== currentExercise.id);
  }, [alternatives, currentExercise.id]);

  const handleConfirm = () => {
    if (!selectedExercise) return;

    onSwap(selectedExercise);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedExercise(null);
      onClose();
    }, 1500);
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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md glass-card rounded-t-3xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">
                  Swap Exercise
                </h2>
                <p className="text-white/50 text-sm">{currentExercise.muscles}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              data-testid="button-close-swap"
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
                Exercise Swapped!
              </h3>
              <p className="text-white/60 text-center">
                Replaced with {selectedExercise?.name}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Current Exercise */}
              <div className="p-4 bg-[#252540] border-b border-white/10">
                <p className="text-white/50 text-xs mb-2">Current Exercise</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3a3a5c] to-[#2a2a4c] flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{currentExercise.name}</p>
                    <p className="text-[#60a5fa] text-sm">{currentExercise.muscles}</p>
                  </div>
                </div>
              </div>

              {/* Alternative Exercises */}
              <div className="p-4 overflow-y-auto max-h-[45vh]">
                <p className="text-white/60 text-sm mb-3">
                  Select an alternative ({filteredAlternatives.length} available):
                </p>
                
                {filteredAlternatives.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/40">No alternatives available for this muscle group</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAlternatives.map((exercise) => {
                      const isSelected = selectedExercise?.id === exercise.id;

                      return (
                        <button
                          key={exercise.id}
                          onClick={() => setSelectedExercise(exercise)}
                          className={`
                            w-full p-4 rounded-2xl border transition-all flex items-center gap-3
                            ${
                              isSelected
                                ? "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] border-transparent"
                                : "bg-white/5 border-white/10 hover:border-[#7c57ff]/50"
                            }
                          `}
                          data-testid={`swap-exercise-${exercise.id}`}
                        >
                          <div
                            className={`
                            w-12 h-12 rounded-xl flex items-center justify-center
                            ${isSelected ? "bg-white/20" : "bg-gradient-to-br from-[#3a3a5c] to-[#2a2a4c]"}
                          `}
                          >
                            <Dumbbell className="w-6 h-6 text-white/60" />
                          </div>
                          <div className="flex-1 text-left">
                            <p
                              className={`font-medium ${isSelected ? "text-white" : "text-white/90"}`}
                            >
                              {exercise.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs ${isSelected ? "text-white/80" : "text-white/50"}`}
                              >
                                {exercise.sets} sets
                              </span>
                              <span className="text-white/30">•</span>
                              <span
                                className={`text-xs ${
                                  exercise.difficulty === "Beginner"
                                    ? "text-green-400"
                                    : exercise.difficulty === "Intermediate"
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                }`}
                              >
                                {exercise.difficulty}
                              </span>
                            </div>
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
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-medium transition-all hover:bg-white/20"
                  data-testid="button-cancel-swap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedExercise === null}
                  className={`
                    flex-1 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all
                    ${
                      selectedExercise !== null
                        ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white btn-glow"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }
                  `}
                  data-testid="button-confirm-swap"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Swap
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
