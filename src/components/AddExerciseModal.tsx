import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronDown, ChevronUp, Dumbbell, Clock, Check, Plus, Zap, Eye, EyeOff } from "lucide-react";
import { Exercise, getAllAvailableExercises, getMuscleGroupsForWorkoutType } from "@/data/workoutExercises";
import LazyGif from "@/components/LazyGif";

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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  chest: { bg: "rgba(244, 63, 94, 0.15)", text: "#f43f5e", border: "rgba(244, 63, 94, 0.3)" },
  back: { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
  shoulders: { bg: "rgba(249, 115, 22, 0.15)", text: "#f97316", border: "rgba(249, 115, 22, 0.3)" },
  arms: { bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7", border: "rgba(168, 85, 247, 0.3)" },
  legs: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e", border: "rgba(34, 197, 94, 0.3)" },
  core: { bg: "rgba(236, 72, 153, 0.15)", text: "#ec4899", border: "rgba(236, 72, 153, 0.3)" },
};

function getSubtitleText(groups: string[]): string {
  if (groups.length === 0) return "Browse all available exercises";
  if (groups.length === 6) return "All muscle group exercises";
  const labels = groups.map(g => CATEGORY_LABELS[g] || g);
  if (labels.length === 1) return `${labels[0]} exercises`;
  if (labels.length === 2) return `${labels[0]} & ${labels[1]} exercises`;
  return `${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]} exercises`;
}

export default function AddExerciseModal({
  isOpen,
  onClose,
  onAddExercise,
  currentExercises,
  workoutType,
}: AddExerciseModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedPreview, setSelectedPreview] = useState<number | null>(null);
  const [showAllGroups, setShowAllGroups] = useState(false);

  const relevantGroups = useMemo(() => getMuscleGroupsForWorkoutType(workoutType), [workoutType]);

  const allExercises = useMemo(() => getAllAvailableExercises(), []);

  const currentExerciseIds = useMemo(() => {
    return new Set(currentExercises.map(ex => ex.id));
  }, [currentExercises]);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const result: Record<string, Exercise[]> = {};

    for (const [category, exercises] of Object.entries(allExercises)) {
      if (!showAllGroups && !query && !relevantGroups.includes(category)) {
        continue;
      }

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
  }, [allExercises, searchQuery, showAllGroups, relevantGroups]);

  const sortedCategories = useMemo(() => {
    const entries = Object.entries(filteredExercises);
    const relevant: [string, Exercise[]][] = [];
    const other: [string, Exercise[]][] = [];

    for (const entry of entries) {
      if (relevantGroups.includes(entry[0])) {
        relevant.push(entry);
      } else {
        other.push(entry);
      }
    }

    return { relevant, other };
  }, [filteredExercises, relevantGroups]);

  const isCategoryExpanded = (category: string): boolean => {
    if (expandedCategories[category] !== undefined) {
      return expandedCategories[category];
    }
    return relevantGroups.includes(category);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const currentState = prev[category] !== undefined ? prev[category] : relevantGroups.includes(category);
      return { ...prev, [category]: !currentState };
    });
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (currentExerciseIds.has(exercise.id)) return;
    onAddExercise(exercise);
  };

  if (!isOpen) return null;

  const renderCategorySection = (category: string, exercises: Exercise[]) => {
    const isExpanded = isCategoryExpanded(category);
    const colors = CATEGORY_COLORS[category] || { bg: "rgba(255,255,255,0.1)", text: "#ffffff", border: "rgba(255,255,255,0.2)" };

    return (
      <div key={category} className="bg-white/5 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between p-4"
          data-testid={`button-toggle-category-${category}`}
        >
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-md text-xs font-semibold"
              style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              data-testid={`badge-category-${category}`}
            >
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
              const isPreviewOpen = selectedPreview === exercise.id;
              return (
                <div
                  key={exercise.id}
                  className={`w-full rounded-xl text-left transition-all ${
                    isAlreadyAdded
                      ? "bg-white/5 opacity-50"
                      : isPreviewOpen
                        ? "bg-[#7c57ff]/10 border-[#7c57ff]/30"
                        : "bg-white/5 hover:bg-[#7c57ff]/20 hover:border-[#7c57ff]/30"
                  } border border-white/10`}
                  data-testid={`card-exercise-preview-${exercise.id}`}
                >
                  <button
                    onClick={() => setSelectedPreview(isPreviewOpen ? null : exercise.id)}
                    className="w-full p-3 text-left"
                    data-testid={`button-preview-exercise-${exercise.id}`}
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
                      {isPreviewOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#7c57ff] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isPreviewOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                        data-testid={`preview-details-${exercise.id}`}
                      >
                        <div className="px-3 pb-3 space-y-3">
                          {exercise.gifUrl && (
                            <div className="rounded-xl overflow-hidden bg-black/30 aspect-video" data-testid={`preview-gif-${exercise.id}`}>
                              <LazyGif
                                src={exercise.gifUrl}
                                alt={exercise.name}
                                className="w-full h-full"
                                objectFit="contain"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-2" data-testid={`preview-difficulty-${exercise.id}`}>
                            <Zap className="w-3.5 h-3.5 text-[#7c57ff]" />
                            <span className="text-white/60 text-xs">{exercise.difficulty}</span>
                          </div>

                          {exercise.instructions && (
                            <p className="text-white/50 text-xs leading-relaxed" data-testid={`preview-instructions-${exercise.id}`}>
                              {exercise.instructions}
                            </p>
                          )}

                          {isAlreadyAdded ? (
                            <div
                              className="w-full py-2.5 rounded-xl bg-green-500/20 text-green-400 text-sm font-medium flex items-center justify-center gap-2"
                              data-testid={`status-already-added-${exercise.id}`}
                            >
                              <Check className="w-4 h-4" />
                              Already Added
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddExercise(exercise)}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white text-sm font-medium flex items-center justify-center gap-2"
                              data-testid={`button-add-exercise-${exercise.id}`}
                            >
                              <Plus className="w-4 h-4" />
                              Add to Workout
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    );
  };

  const hasNoResults = sortedCategories.relevant.length === 0 && sortedCategories.other.length === 0;
  const isSearching = searchQuery.trim().length > 0;

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
                <p className="text-white/50 text-sm" data-testid="text-subtitle-muscle-groups">
                  {getSubtitleText(relevantGroups)}
                </p>
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

          <div className="px-4 py-3 border-b border-white/10 space-y-2">
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

            {!isSearching && relevantGroups.length < 6 && (
              <button
                onClick={() => setShowAllGroups(prev => !prev)}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 transition-colors hover:bg-white/10"
                data-testid="button-toggle-show-all"
              >
                {showAllGroups ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Show Relevant Only
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Show All Exercises
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedCategories.relevant.map(([category, exercises]) =>
              renderCategorySection(category, exercises)
            )}

            {showAllGroups && sortedCategories.other.length > 0 && !isSearching && (
              <>
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-xs font-medium uppercase tracking-wide">Other Muscle Groups</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                {sortedCategories.other.map(([category, exercises]) =>
                  renderCategorySection(category, exercises)
                )}
              </>
            )}

            {isSearching && sortedCategories.other.length > 0 && (
              <>
                {sortedCategories.other.map(([category, exercises]) =>
                  renderCategorySection(category, exercises)
                )}
              </>
            )}

            {hasNoResults && (
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
