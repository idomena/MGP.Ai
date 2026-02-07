import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronDown, ChevronUp, Dumbbell, Clock, Check, Plus, Zap, ArrowLeft, Loader2 } from "lucide-react";
import { Exercise, getAllAvailableExercises, getMuscleGroupsForWorkoutType } from "@/data/workoutExercises";
import { fetchAndMapExercisesByMuscleGroup } from "@/services/exercisesLibraryService";
import { isSupabaseConfigured } from "@/lib/supabase";
import InteractiveBodyDiagram from "@/components/InteractiveBodyDiagram";
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

export default function AddExerciseModal({
  isOpen,
  onClose,
  onAddExercise,
  currentExercises,
  workoutType,
}: AddExerciseModalProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreview, setSelectedPreview] = useState<number | null>(null);
  const [supabaseExercises, setSupabaseExercises] = useState<Exercise[]>([]);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [supabaseError, setSupabaseError] = useState(false);

  const relevantGroups = useMemo(() => getMuscleGroupsForWorkoutType(workoutType), [workoutType]);
  const allLocalExercises = useMemo(() => getAllAvailableExercises(), []);

  const currentExerciseIds = useMemo(() => {
    return new Set(currentExercises.map(ex => ex.id));
  }, [currentExercises]);
  const currentExerciseNames = useMemo(() => {
    return new Set(currentExercises.map(ex => ex.name.toLowerCase()));
  }, [currentExercises]);

  useEffect(() => {
    if (!selectedMuscle) {
      setSupabaseExercises([]);
      setSupabaseError(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setSupabaseExercises([]);
      setIsLoadingSupabase(false);
      return;
    }

    let cancelled = false;
    setIsLoadingSupabase(true);
    setSupabaseError(false);

    fetchAndMapExercisesByMuscleGroup(selectedMuscle)
      .then(exercises => {
        if (!cancelled) {
          setSupabaseExercises(exercises);
          setIsLoadingSupabase(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSupabaseError(true);
          setIsLoadingSupabase(false);
        }
      });

    return () => { cancelled = true; };
  }, [selectedMuscle]);

  const displayExercises = useMemo(() => {
    if (!selectedMuscle) return [];

    const localForGroup = allLocalExercises[selectedMuscle] || [];
    const supaNames = new Set(supabaseExercises.map(e => e.name.toLowerCase()));
    const localFiltered = localForGroup.filter(e => !supaNames.has(e.name.toLowerCase()));
    const combined = [...supabaseExercises, ...localFiltered];

    const query = searchQuery.toLowerCase().trim();
    if (!query) return combined;

    return combined.filter(
      ex => ex.name.toLowerCase().includes(query) || ex.muscles.toLowerCase().includes(query)
    );
  }, [selectedMuscle, supabaseExercises, allLocalExercises, searchQuery]);

  const handleAddExercise = (exercise: Exercise) => {
    if (currentExerciseIds.has(exercise.id) || currentExerciseNames.has(exercise.name.toLowerCase())) return;
    onAddExercise(exercise);
  };

  const handleBack = () => {
    setSelectedMuscle(null);
    setSearchQuery("");
    setSelectedPreview(null);
  };

  const handleClose = () => {
    setSelectedMuscle(null);
    setSearchQuery("");
    setSelectedPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  const colors = selectedMuscle ? CATEGORY_COLORS[selectedMuscle] : null;
  const isExerciseAdded = (exercise: Exercise) =>
    currentExerciseIds.has(exercise.id) || currentExerciseNames.has(exercise.name.toLowerCase());

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#1a1a2e] rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {selectedMuscle ? (
                <button
                  onClick={handleBack}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                  data-testid="button-back-to-diagram"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-white font-semibold text-lg" data-testid="text-modal-title">
                  {selectedMuscle ? `${CATEGORY_LABELS[selectedMuscle]} Exercises` : "Add Exercise"}
                </h2>
                <p className="text-white/50 text-sm" data-testid="text-subtitle-muscle-groups">
                  {selectedMuscle ? "Tap an exercise to preview" : "Tap a muscle group to browse"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              data-testid="button-close-add-exercise"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {!selectedMuscle ? (
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-white/40 text-xs text-center mb-3 uppercase tracking-wider font-medium">
                Select a muscle group
              </p>
              <InteractiveBodyDiagram
                selectedMuscle={selectedMuscle}
                onSelectMuscle={setSelectedMuscle}
                highlightedMuscles={relevantGroups}
              />
              <div className="grid grid-cols-3 gap-2 mt-4">
                {["chest", "back", "shoulders", "arms", "legs", "core"].map(group => {
                  const groupColors = CATEGORY_COLORS[group];
                  const isRelevant = relevantGroups.includes(group);
                  return (
                    <button
                      key={group}
                      onClick={() => setSelectedMuscle(group)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor: isRelevant ? groupColors.bg : "rgba(255,255,255,0.05)",
                        color: isRelevant ? groupColors.text : "rgba(255,255,255,0.5)",
                        border: `1px solid ${isRelevant ? groupColors.border : "rgba(255,255,255,0.1)"}`,
                      }}
                      data-testid={`button-muscle-${group}`}
                    >
                      {CATEGORY_LABELS[group]}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder={`Search ${CATEGORY_LABELS[selectedMuscle]} exercises...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7c57ff]/50"
                    data-testid="input-search-exercises"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoadingSupabase && (
                  <div className="flex items-center justify-center py-8 gap-2" data-testid="loading-exercises">
                    <Loader2 className="w-5 h-5 text-[#7c57ff] animate-spin" />
                    <span className="text-white/50 text-sm">Loading exercises...</span>
                  </div>
                )}

                {!isLoadingSupabase && displayExercises.length === 0 && (
                  <div className="text-center py-8">
                    <Dumbbell className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No exercises found</p>
                    <p className="text-white/20 text-xs mt-1">Try a different search term</p>
                  </div>
                )}

                {!isLoadingSupabase && displayExercises.map((exercise) => {
                  const alreadyAdded = isExerciseAdded(exercise);
                  const isPreviewOpen = selectedPreview === exercise.id;

                  return (
                    <div
                      key={exercise.id}
                      className={`w-full rounded-xl text-left transition-all ${
                        alreadyAdded
                          ? "bg-white/5 opacity-50"
                          : isPreviewOpen
                            ? "bg-[#7c57ff]/10 border-[#7c57ff]/30"
                            : "bg-white/5"
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-medium text-sm truncate">
                                {exercise.name}
                              </p>
                              {colors && (
                                <span
                                  className="px-1.5 py-px rounded text-[10px] font-semibold shrink-0"
                                  style={{ backgroundColor: colors.bg, color: colors.text }}
                                >
                                  {CATEGORY_LABELS[selectedMuscle]}
                                </span>
                              )}
                              {alreadyAdded && (
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

                              {alreadyAdded ? (
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
              </div>
            </>
          )}

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleClose}
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
