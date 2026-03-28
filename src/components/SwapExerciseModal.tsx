import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Dumbbell, ArrowRightLeft, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Exercise } from "@/data/workoutExercises";
import LazyGif from "@/components/LazyGif";

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
  const [expandedPreview, setExpandedPreview] = useState<number | null>(null);

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
      setExpandedPreview(null);
      onClose();
    }, 1500);
  };

  const togglePreview = (exerciseId: number) => {
    setExpandedPreview(prev => prev === exerciseId ? null : exerciseId);
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
          className="w-full max-w-md bg-[#1a1a2e] rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
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

              <div className="flex-1 p-4 overflow-y-auto">
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
                      const isPreviewOpen = expandedPreview === exercise.id;

                      return (
                        <div
                          key={exercise.id}
                          className={`
                            rounded-2xl border transition-all overflow-hidden
                            ${
                              isSelected
                                ? "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] border-transparent"
                                : "bg-white/5 border-white/10"
                            }
                          `}
                          data-testid={`card-swap-exercise-${exercise.id}`}
                        >
                          <div className="flex items-center gap-3 p-4">
                            <button
                              onClick={() => setSelectedExercise(exercise)}
                              className="flex items-center gap-3 flex-1 text-left"
                              data-testid={`swap-exercise-${exercise.id}`}
                            >
                              <div
                                className={`
                                w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                                ${isSelected ? "bg-white/20" : "bg-gradient-to-br from-[#3a3a5c] to-[#2a2a4c]"}
                              `}
                              >
                                <Dumbbell className="w-6 h-6 text-white/60" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium ${isSelected ? "text-white" : "text-white/90"}`}
                                >
                                  {exercise.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs ${isSelected ? "text-white/80" : "text-white/50"}`}
                                  >
                                    {exercise.sets} sets x {exercise.reps}
                                  </span>
                                  <span className="text-white/30">|</span>
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
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                                  <Check className="w-4 h-4 text-[#7c57ff]" />
                                </div>
                              )}
                            </button>
                            <button
                              onClick={() => togglePreview(exercise.id)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-white/20" : "bg-white/10"
                              }`}
                              data-testid={`button-preview-swap-${exercise.id}`}
                            >
                              {isPreviewOpen ? (
                                <ChevronUp className="w-4 h-4 text-white/70" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-white/70" />
                              )}
                            </button>
                          </div>

                          <AnimatePresence>
                            {isPreviewOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                data-testid={`preview-details-swap-${exercise.id}`}
                              >
                                <div className={`px-4 pb-4 space-y-3 ${isSelected ? "" : "border-t border-white/10 pt-3 mx-4 mb-0 px-0 pb-4"}`}>
                                  {exercise.gifUrl && (
                                    <div className="rounded-xl overflow-hidden bg-black/30 aspect-video" data-testid={`preview-gif-swap-${exercise.id}`}>
                                      <LazyGif
                                        src={exercise.gifUrl.startsWith('/api/') ? exercise.gifUrl : `/api/proxy-image?url=${encodeURIComponent(exercise.gifUrl)}`}
                                        alt={exercise.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2" data-testid={`preview-difficulty-swap-${exercise.id}`}>
                                    <Zap className="w-3.5 h-3.5 text-[#7c57ff]" />
                                    <span className={`text-xs ${isSelected ? "text-white/80" : "text-white/60"}`}>
                                      {exercise.difficulty}
                                    </span>
                                    <span className="text-white/30">|</span>
                                    <span className={`text-xs ${isSelected ? "text-white/80" : "text-white/60"}`}>
                                      {exercise.time}
                                    </span>
                                  </div>

                                  {exercise.instructions && (
                                    <p className={`text-xs leading-relaxed ${isSelected ? "text-white/70" : "text-white/50"}`} data-testid={`preview-instructions-swap-${exercise.id}`}>
                                      {exercise.instructions}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-medium"
                  data-testid="button-cancel-swap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedExercise === null}
                  className={`
                    flex-1 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2
                    ${
                      selectedExercise !== null
                        ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white"
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
