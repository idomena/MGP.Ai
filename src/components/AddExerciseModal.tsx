import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronDown, ChevronUp, Dumbbell, Clock, Check } from "lucide-react";
import { Exercise, getAllAvailableExercises } from "@/data/workoutExercises";

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
  currentExercises: Exercise[];
  workoutType: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
};

export default function AddExerciseModal({
  isOpen,
  onClose,
  onAddExercise,
  currentExercises,
  workoutType,
}: AddExerciseModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const allExercises = useMemo(() => getAllAvailableExercises(), []);

  const currentExerciseIds = useMemo(() => {
    return new Set(currentExercises.map(ex => ex.id));
  }, [currentExercises]);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const result: Record<string, Exercise[]> = {};

    for (const [category, exercises] of Object.entries(allExercises)) {
      const filtered = query
        ? exercises.filter(
            ex =>
              ex.name.toLowerCase().includes(query) ||
              ex.muscles.toLowerCase().includes(query)
          )
        : exercises;

      if (filtered.length > 0) {
        result[category] = filtered;
      }
    }

    return result;
  }, [allExercises, searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (currentExerciseIds.has(exercise.id)) return;
    onAddExercise(exercise);
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
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Add Exercise</h2>
                <p className="text-white/50 text-sm">Browse all available exercises</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              data-testid="button-close-add-exercise"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="px-4 py-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7c57ff]/50"
                data-testid="input-search-exercises"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {Object.entries(filteredExercises).map(([category, exercises]) => {
              const isExpanded = expandedCategories[category] !== false;
              return (
                <div key={category} className="bg-white/5 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4"
                    data-testid={`button-toggle-category-${category}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium capitalize">
                        {CATEGORY_LABELS[category] || category}
                      </span>
                      <span className="text-white/30 text-xs">
                        ({exercises.length})
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/50" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/50" />
                    )}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-3 pb-3 space-y-2"
                    >
                      {exercises.map((exercise) => {
                        const isAlreadyAdded = currentExerciseIds.has(exercise.id);
                        return (
                          <button
                            key={exercise.id}
                            onClick={() => handleAddExercise(exercise)}
                            disabled={isAlreadyAdded}
                            className={`w-full p-3 rounded-xl text-left transition-all ${
                              isAlreadyAdded
                                ? "bg-white/5 opacity-50 cursor-not-allowed"
                                : "bg-white/5 hover:bg-[#7c57ff]/20 hover:border-[#7c57ff]/30"
                            } border border-white/10`}
                            data-testid={`button-add-exercise-${exercise.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-medium text-sm truncate">
                                    {exercise.name}
                                  </p>
                                  {isAlreadyAdded && (
                                    <span className="flex items-center gap-1 text-green-400 text-xs shrink-0">
                                      <Check className="w-3 h-3" />
                                      Added
                                    </span>
                                  )}
                                </div>
                                <p className="text-white/40 text-xs mt-0.5">
                                  {exercise.muscles}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-white/50 text-xs">
                                    {exercise.sets} sets x {exercise.reps}
                                  </span>
                                  <span className="flex items-center gap-1 text-white/30 text-xs">
                                    <Clock className="w-3 h-3" />
                                    {exercise.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })}

            {Object.keys(filteredExercises).length === 0 && (
              <div className="text-center py-8">
                <Dumbbell className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No exercises found</p>
                <p className="text-white/20 text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-white/10 text-white font-medium"
              data-testid="button-done-add-exercise"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
