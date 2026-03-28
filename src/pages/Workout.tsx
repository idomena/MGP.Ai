import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import posthog from "posthog-js";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  ArrowLeft,
  Lock,
  Clock,
  Dumbbell,
  Target,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRightLeft,
  Moon,
  Calendar,
  X,
  Plus,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NavigationBar from "@/components/NavigationBar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutAIAssistant from "@/components/WorkoutAIAssistant";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import ChangeWorkoutTypeModal from "@/components/ChangeWorkoutTypeModal";
import SwapExerciseModal from "@/components/SwapExerciseModal";
import SchedulingAIAssistant from "@/components/SchedulingAIAssistant";
import MuscleAnatomyDiagram from "@/components/MuscleAnatomyDiagram";
import AddExerciseModal from "@/components/AddExerciseModal";
import LazyGif from "@/components/LazyGif";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { useExercises } from "@/hooks/useExercises";
import {
  getExercisesForWorkoutType,
  getAlternativesForMuscleGroup,
  type Exercise,
} from "@/data/workoutExercises";

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  chest: "#f43f5e",
  back: "#3b82f6",
  lats: "#3b82f6",
  shoulders: "#f97316",
  deltoid: "#f97316",
  deltoids: "#f97316",
  arms: "#a855f7",
  biceps: "#a855f7",
  triceps: "#a855f7",
  forearms: "#a855f7",
  legs: "#22c55e",
  quads: "#22c55e",
  glutes: "#22c55e",
  hamstrings: "#22c55e",
  calves: "#22c55e",
  core: "#ec4899",
  abs: "#ec4899",
};

function getMuscleGroupColor(muscles: string): string {
  const parts = muscles.toLowerCase().split(",").map(m => m.trim());
  for (const part of parts) {
    for (const [key, color] of Object.entries(MUSCLE_GROUP_COLORS)) {
      if (part.includes(key)) return color;
    }
  }
  return "#7c57ff";
}

function getMuscleGroupLabel(muscles: string): string {
  const lower = muscles.toLowerCase();
  if (lower.includes("chest")) return "Chest";
  if (lower.includes("back") || lower.includes("lats")) return "Back";
  if (lower.includes("shoulder") || lower.includes("deltoid")) return "Shoulders";
  if (lower.includes("bicep") || lower.includes("tricep") || lower.includes("forearm")) return "Arms";
  if (lower.includes("quad") || lower.includes("glute") || lower.includes("hamstring") || lower.includes("leg") || lower.includes("calf")) return "Legs";
  if (lower.includes("core") || lower.includes("abs")) return "Core";
  return "Other";
}

function getWorkoutTypeColor(workoutType: string): string {
  const t = workoutType.toLowerCase();
  if (t.includes("chest")) return "#f43f5e";
  if (t.includes("back")) return "#3b82f6";
  if (t.includes("shoulder")) return "#f97316";
  if (t.includes("arm") || t.includes("bicep") || t.includes("tricep")) return "#a855f7";
  if (t.includes("leg") || t.includes("lower")) return "#22c55e";
  if (t.includes("core") || t.includes("abs")) return "#ec4899";
  if (t.includes("full") || t.includes("upper") || t.includes("push") || t.includes("pull")) return "#7c57ff";
  return "#7c57ff";
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "Beginner": return "#22c55e";
    case "Intermediate": return "#eab308";
    case "Advanced": return "#ef4444";
    default: return "#7c57ff";
  }
}

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    completeWorkout,
    changeWorkoutType,
    moveWorkout,
    currentDay: programCurrentDay,
    completedDays,
    getWorkoutForDay,
    dayStatuses,
    isLoading,
    isTodayCompleted,
    todayIsRestDay,
  } = useWorkoutProgress();

  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isChangeTypeOpen, setIsChangeTypeOpen] = useState(false);
  const [isSwapExerciseOpen, setIsSwapExerciseOpen] = useState(false);
  const [isSchedulingAIOpen, setIsSchedulingAIOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseToSwap, setExerciseToSwap] = useState<Exercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [customExercises, setCustomExercises] = useState<Record<number, Exercise>>({});
  const [isMusclesExpanded, setIsMusclesExpanded] = useState(false);
  const [addedExercises, setAddedExercises] = useState<Exercise[]>([]);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);
  const hasLoadedFromStorage = useRef(false);
  const [exerciseOrder, setExerciseOrder] = useState<number[] | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const hasLoadedOrder = useRef(false);
  const [deleteConfirmExercise, setDeleteConfirmExercise] = useState<Exercise | null>(null);
  const [hiddenExercises, setHiddenExercises] = useState<Set<number>>(new Set());
  const hasLoadedHidden = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const touchDragIndex = useRef<number | null>(null);
  const [touchDragActive, setTouchDragActive] = useState(false);

  const currentDay = programCurrentDay || 1;
  const dayNumber = id ? parseInt(id, 10) : currentDay;
  const storageKey = user?.id ? `added_exercises_${user.id}_day${dayNumber}` : null;

  useEffect(() => {
    hasLoadedFromStorage.current = false;
    if (!storageKey) {
      hasLoadedFromStorage.current = true;
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAddedExercises(parsed);
        }
      }
    } catch {
    }
    hasLoadedFromStorage.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !hasLoadedFromStorage.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(addedExercises));
    } catch {
    }
  }, [addedExercises, storageKey]);

  const hiddenStorageKey = user?.id ? `hidden_exercises_${user.id}_day${dayNumber}` : null;

  useEffect(() => {
    hasLoadedHidden.current = false;
    if (!hiddenStorageKey) {
      hasLoadedHidden.current = true;
      return;
    }
    try {
      const saved = localStorage.getItem(hiddenStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHiddenExercises(new Set(parsed));
        }
      } else {
        setHiddenExercises(new Set());
      }
    } catch {
      setHiddenExercises(new Set());
    }
    hasLoadedHidden.current = true;
  }, [hiddenStorageKey]);

  useEffect(() => {
    if (!hiddenStorageKey || !hasLoadedHidden.current) return;
    try {
      localStorage.setItem(hiddenStorageKey, JSON.stringify(Array.from(hiddenExercises)));
    } catch {}
  }, [hiddenExercises, hiddenStorageKey]);

  const orderStorageKey = user?.id ? `exercise_order_${user.id}_day${dayNumber}` : null;

  useEffect(() => {
    hasLoadedOrder.current = false;
    if (!orderStorageKey) {
      hasLoadedOrder.current = true;
      return;
    }
    try {
      const saved = localStorage.getItem(orderStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setExerciseOrder(parsed);
        }
      } else {
        setExerciseOrder(null);
      }
    } catch {
      setExerciseOrder(null);
    }
    hasLoadedOrder.current = true;
  }, [orderStorageKey]);

  useEffect(() => {
    if (!orderStorageKey || !hasLoadedOrder.current) return;
    if (exerciseOrder) {
      try {
        localStorage.setItem(orderStorageKey, JSON.stringify(exerciseOrder));
      } catch {}
    } else {
      localStorage.removeItem(orderStorageKey);
    }
  }, [exerciseOrder, orderStorageKey]);

  const workoutTemplate = getWorkoutForDay(dayNumber);
  const workoutName = workoutTemplate.title;

  const { data: dbExercises } = useExercises(workoutTemplate.workoutType, dayNumber);
  const baseExercises = dbExercises && dbExercises.length > 0
    ? dbExercises
    : getExercisesForWorkoutType(workoutTemplate.workoutType, dayNumber);
  
  const unorderedExercises = useMemo(() => {
    const base = baseExercises
      .map(ex => customExercises[ex.id] || ex)
      .filter(ex => !hiddenExercises.has(ex.id));
    return [...base, ...addedExercises];
  }, [baseExercises, customExercises, addedExercises, hiddenExercises]);

  const exercises = useMemo(() => {
    if (!exerciseOrder) return unorderedExercises;
    const exerciseMap = new Map(unorderedExercises.map(ex => [ex.id, ex]));
    const ordered: Exercise[] = [];
    for (const id of exerciseOrder) {
      const ex = exerciseMap.get(id);
      if (ex) {
        ordered.push(ex);
        exerciseMap.delete(id);
      }
    }
    exerciseMap.forEach(ex => ordered.push(ex));
    return ordered;
  }, [unorderedExercises, exerciseOrder]);

  const isToday = dayNumber === currentDay;
  const isCompleted = completedDays.includes(dayNumber);
  const isPast = dayNumber < currentDay;
  const isRestDay = workoutTemplate.workoutType === "rest";
  const canStartWorkout = isToday && !isCompleted && !isRestDay;

  const dayStatusEntry = dayStatuses.find(d => d.day === dayNumber);
  const workoutStatus: "completed" | "active" | "locked" | "missed" | "skipped" = 
    dayStatusEntry?.status === "skipped"
      ? "skipped"
      : isCompleted
        ? "completed"
        : isToday
          ? "active"
          : isPast
            ? "missed"
            : "locked";

  const totalDuration = useMemo(() => {
    return exercises.reduce((sum, ex) => {
      const minutes = parseInt(ex.time) || 5;
      return sum + minutes;
    }, 0);
  }, [exercises]);

  const targetedMuscles = useMemo(() => {
    const muscles = new Set<string>();
    exercises.forEach(ex => {
      if (ex.muscles) {
        ex.muscles.split(',').forEach(m => muscles.add(m.trim()));
      }
    });
    return Array.from(muscles);
  }, [exercises]);

  const handleStartWorkout = () => {
    if (!canStartWorkout) {
      toast.error("You can only start today's workout");
      return;
    }
    setIsWorkoutActive(true);
    posthog.capture('workout_started', { day: dayNumber });
  };

  const handleViewDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleWorkoutComplete = async () => {
    setIsWorkoutActive(false);
    const success = await completeWorkout(dayNumber);
    if (success) {
      posthog.capture('workout_completed', { day: dayNumber });
      toast.success("Great job! Come back tomorrow for your next workout.");
    } else {
      toast.error("Failed to save workout. Please try again.");
    }
  };

  const handleWorkoutExit = () => {
    setIsWorkoutActive(false);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const handleChangeWorkoutType = async (newType: string, newTitle: string) => {
    const success = await changeWorkoutType(dayNumber, newType, newTitle);
    if (success) {
      toast.success(`Day ${dayNumber} changed to ${newTitle}`);
    } else {
      toast.error("Failed to change workout type. Please try again.");
    }
    return success;
  };

  const handleOpenSwapExercise = (exercise: Exercise) => {
    setExerciseToSwap(exercise);
    setIsSwapExerciseOpen(true);
    setOpenActionsId(null);
  };

  const handleAddExercise = (exercise: Exercise) => {
    setAddedExercises(prev => [...prev, exercise]);
    toast.success(`${exercise.name} added to workout`);
  };

  const handleRemoveExercise = (exercise: Exercise) => {
    setDeleteConfirmExercise(exercise);
    setOpenActionsId(null);
  };

  const confirmDeleteExercise = () => {
    if (!deleteConfirmExercise) return;
    const isAdded = addedExercises.some(ex => ex.id === deleteConfirmExercise.id);
    if (isAdded) {
      setAddedExercises(prev => prev.filter(ex => ex.id !== deleteConfirmExercise.id));
    } else {
      setHiddenExercises(prev => new Set([...prev, deleteConfirmExercise.id]));
    }
    if (exerciseOrder) {
      setExerciseOrder(prev => prev ? prev.filter(id => id !== deleteConfirmExercise.id) : null);
    }
    toast.success(`${deleteConfirmExercise.name} removed from workout`);
    setDeleteConfirmExercise(null);
  };

  const handleDragStart = useCallback((index: number) => {
    setDragFromIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragFromIndex === null || dragFromIndex === toIndex) {
      setDragFromIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...exercises];
    const [moved] = reordered.splice(dragFromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setExerciseOrder(reordered.map(ex => ex.id));
    setDragFromIndex(null);
    setDragOverIndex(null);
  }, [dragFromIndex, exercises]);

  const handleDragEnd = useCallback(() => {
    setDragFromIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleMoveExercise = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= exercises.length) return;
    const reordered = [...exercises];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setExerciseOrder(reordered.map(ex => ex.id));
  }, [exercises]);

  const handleSwapExercise = (newExercise: Exercise) => {
    if (!exerciseToSwap) return;
    
    setCustomExercises(prev => ({
      ...prev,
      [exerciseToSwap.id]: newExercise,
    }));
    
    const swapKey = `custom_exercises_${user?.id}_${dayNumber}`;
    const current = JSON.parse(localStorage.getItem(swapKey) || "{}");
    current[exerciseToSwap.id] = newExercise;
    localStorage.setItem(swapKey, JSON.stringify(current));
    
    toast.success(`Swapped to ${newExercise.name}`);
  };

  if (isWorkoutActive) {
    return (
      <WorkoutSession
        exercises={exercises}
        dayNumber={dayNumber}
        workoutName={workoutName}
        onComplete={handleWorkoutComplete}
        onExit={handleWorkoutExit}
        onCompleteWorkout={completeWorkout}
      />
    );
  }

  if (isLoading && !id) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#7c57ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/50 text-sm">Loading workout...</span>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (workoutStatus) {
      case "completed": return "text-green-400";
      case "active": return "text-[#7c57ff]";
      case "missed": return "text-orange-400";
      case "skipped": return "text-orange-400";
      default: return "text-white/40";
    }
  };

  const getStatusText = () => {
    switch (workoutStatus) {
      case "completed": return "Completed";
      case "active": return "Today";
      case "missed": return "Missed";
      case "skipped": return "Skipped";
      default: return "Locked";
    }
  };

  const workoutColor = getWorkoutTypeColor(workoutTemplate.workoutType);
  const isAddedExercise = (exercise: Exercise) => addedExercises.some(ex => ex.id === exercise.id);

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      <header className="sticky top-0 z-40 px-4 py-4 bg-[#0f0f1a]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleGoBack}
            className="rounded-full"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Button>
          
          <div className="text-center">
            <span className="text-white/40 text-xs font-medium" data-testid="text-day-number">DAY {dayNumber}</span>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-white font-bold text-lg" data-testid="text-workout-name">{workoutName}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                workoutStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                workoutStatus === 'active' ? 'bg-[#7c57ff]/20 text-[#7c57ff]' :
                workoutStatus === 'missed' || workoutStatus === 'skipped' ? 'bg-orange-500/20 text-orange-400' :
                'bg-white/10 text-white/40'
              }`} data-testid="text-status">{getStatusText()}</span>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsAIOpen(true)}
            className="rounded-full"
            data-testid="button-ai-help"
          >
            <Sparkles className="w-5 h-5 text-[#7c57ff]" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {!isRestDay && (
          <div className="px-4 py-4" data-testid="stats-bar">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a1a2e] rounded-2xl p-4 text-center">
                <Dumbbell className="w-5 h-5 text-[#7c57ff] mx-auto mb-1" />
                <span className="text-white font-bold text-xl block" data-testid="text-exercise-count">{exercises.length}</span>
                <span className="text-white/40 text-xs">Exercises</span>
              </div>
              <div className="bg-[#1a1a2e] rounded-2xl p-4 text-center">
                <Clock className="w-5 h-5 text-[#60a5fa] mx-auto mb-1" />
                <span className="text-white font-bold text-xl block" data-testid="text-duration">{totalDuration}</span>
                <span className="text-white/40 text-xs">Minutes</span>
              </div>
              <div className="bg-[#1a1a2e] rounded-2xl p-4 text-center" style={{ borderTop: `3px solid ${workoutColor}` }}>
                <Target className="w-5 h-5 mx-auto mb-1" style={{ color: workoutColor }} />
                <span className="text-white font-bold text-sm block capitalize" data-testid="text-workout-type">{workoutTemplate.workoutType.replace('_', ' ')}</span>
                <span className="text-white/40 text-xs">Focus</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                onClick={() => setIsSchedulingAIOpen(true)}
                className="flex-1 bg-white/5 rounded-xl py-3"
                data-testid="button-schedule"
              >
                <Calendar className="w-4 h-4 text-white/60 mr-2" />
                <span className="text-white/70 text-sm">Reschedule</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsChangeTypeOpen(true)}
                className="flex-1 bg-white/5 rounded-xl py-3"
                data-testid="button-change-type"
              >
                <RefreshCw className="w-4 h-4 text-white/60 mr-2" />
                <span className="text-white/70 text-sm">Change Type</span>
              </Button>
            </div>

            <div className="mt-4 bg-[#1a1a2e] rounded-2xl overflow-hidden">
              <button
                onClick={() => setIsMusclesExpanded(!isMusclesExpanded)}
                className="w-full flex items-center justify-between p-4"
                data-testid="button-toggle-muscles"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#7c57ff]" />
                  <span className="text-white font-medium">Targeted Muscles</span>
                </div>
                {isMusclesExpanded ? (
                  <ChevronUp className="w-5 h-5 text-white/50" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/50" />
                )}
              </button>
              
              {isMusclesExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4"
                >
                  <MuscleAnatomyDiagram targetedMuscles={targetedMuscles} />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {isRestDay ? (
          <div className="px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7c57ff]/20 to-[#60a5fa]/20 flex items-center justify-center">
                <Moon className="w-10 h-10 text-[#7c57ff]" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2" data-testid="text-rest-day-title">Rest Day</h2>
              <p className="text-white/50 text-sm mb-6">Take a break and recover. Your muscles need it!</p>
              
              <Button
                variant="ghost"
                onClick={() => setIsChangeTypeOpen(true)}
                className="mx-auto bg-white/10 px-6 rounded-xl"
                data-testid="button-change-to-workout"
              >
                <RefreshCw className="w-4 h-4 text-white/70 mr-2" />
                <span className="text-white text-sm font-medium">Change to Workout</span>
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="px-4 pb-40">
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${workoutColor}15`,
                    color: workoutColor,
                    border: `1px solid ${workoutColor}30`,
                  }}
                  data-testid="badge-workout-focus"
                >
                  {workoutTemplate.workoutType.replace('_', ' ')}
                </span>
                <span className="text-white/60 text-sm font-medium">Exercises</span>
              </div>
              <span className="text-white/30 text-xs">{exercises.length} total</span>
            </div>
            <div className="space-y-2.5">
              {exercises.map((exercise, index) => {
                const muscleColor = getMuscleGroupColor(exercise.muscles);
                const muscleLabel = getMuscleGroupLabel(exercise.muscles);
                const diffColor = getDifficultyColor(exercise.difficulty);
                const actionsOpen = openActionsId === exercise.id;
                const isAdded = isAddedExercise(exercise);

                return (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-[#1a1a2e] rounded-2xl overflow-hidden transition-all duration-150 ${
                      dragFromIndex === index ? 'opacity-40 scale-[0.97]' : ''
                    } ${
                      dragOverIndex === index && dragFromIndex !== index ? 'ring-2 ring-[#7c57ff] ring-offset-1 ring-offset-[#0f0f1a]' : ''
                    }`}
                    data-testid={`card-exercise-${exercise.id}`}
                  >
                    <div className="flex items-stretch">
                      <div
                        className="flex flex-col items-center justify-center w-8 shrink-0 gap-0.5 py-2"
                        data-testid={`drag-handle-${exercise.id}`}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveExercise(index, 'up'); }}
                          disabled={index === 0}
                          className={`w-5 h-5 rounded flex items-center justify-center ${index === 0 ? 'opacity-15' : 'opacity-30 active:opacity-80 active:bg-white/10'}`}
                          data-testid={`button-move-up-${exercise.id}`}
                          aria-label={`Move ${exercise.name} up`}
                        >
                          <ChevronUp className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveExercise(index, 'down'); }}
                          disabled={index === exercises.length - 1}
                          className={`w-5 h-5 rounded flex items-center justify-center ${index === exercises.length - 1 ? 'opacity-15' : 'opacity-30 active:opacity-80 active:bg-white/10'}`}
                          data-testid={`button-move-down-${exercise.id}`}
                          aria-label={`Move ${exercise.name} down`}
                        >
                          <ChevronDown className="w-3 h-3 text-white" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleViewDetails(exercise)}
                        className="flex-1 py-3 pr-2 text-left"
                        data-testid={`button-details-${exercise.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#1e1e38]" data-testid={`thumbnail-${exercise.id}`}>
                            {exercise.gifUrl ? (
                              <LazyGif
                                src={exercise.gifUrl}
                                alt={exercise.name}
                                className="w-full h-full"
                                objectFit="cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#252550] to-[#1a1a3a]">
                                <Dumbbell className="w-6 h-6 text-white/20" />
                              </div>
                            )}
                            <div
                              className="absolute bottom-0 left-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-tr-lg"
                              style={{ backgroundColor: isCompleted ? '#22c55e' : '#7c57ff' }}
                              data-testid={`badge-exercise-number-${exercise.id}`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <h4 className="text-white font-semibold text-sm leading-tight" data-testid={`text-exercise-name-${exercise.id}`}>{exercise.name}</h4>
                              <span
                                className="px-1.5 py-px rounded text-[10px] font-semibold shrink-0"
                                style={{
                                  backgroundColor: `${muscleColor}18`,
                                  color: muscleColor,
                                }}
                                data-testid={`badge-muscle-group-${exercise.id}`}
                              >
                                {muscleLabel}
                              </span>
                            </div>
                            <p className="text-white/35 text-xs mb-1.5" data-testid={`text-exercise-muscles-${exercise.id}`}>{exercise.muscles}</p>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white/50 text-xs" data-testid={`text-exercise-sets-${exercise.id}`}>
                                {exercise.sets}s × {exercise.reps}
                              </span>
                              <span className="text-white/20">·</span>
                              <span className="text-white/35 text-xs" data-testid={`text-exercise-time-${exercise.id}`}>
                                {exercise.time}
                              </span>
                              <span className="text-white/20">·</span>
                              <span className="flex items-center gap-1 text-xs" data-testid={`badge-difficulty-${exercise.id}`}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diffColor }} />
                                <span style={{ color: diffColor, opacity: 0.8 }}>{exercise.difficulty}</span>
                              </span>
                              {exercise.equipmentName && (
                                <>
                                  <span className="text-white/20">·</span>
                                  <span className="text-white/30 text-xs capitalize">{exercise.equipmentName}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-white/15 shrink-0" />
                        </div>
                      </button>

                      <div className="flex items-center pr-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionsId(actionsOpen ? null : exercise.id);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-40 active:opacity-100 active:bg-white/10"
                          data-testid={`button-actions-${exercise.id}`}
                          aria-label={`Actions for ${exercise.name}`}
                        >
                          <MoreHorizontal className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {actionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="px-3 pb-2.5 flex gap-2"
                      >
                        <button
                          onClick={() => handleOpenSwapExercise(exercise)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7c57ff]/10 rounded-lg text-xs text-[#7c57ff] font-medium"
                          data-testid={`button-swap-${exercise.id}`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Swap
                        </button>
                        <button
                          onClick={() => handleRemoveExercise(exercise)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 rounded-lg text-xs text-red-400 font-medium"
                          data-testid={`button-remove-${exercise.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                        <button
                          onClick={() => setOpenActionsId(null)}
                          className="ml-auto flex items-center px-2 py-1.5 rounded-lg text-xs text-white/30"
                          data-testid={`button-close-actions-${exercise.id}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <Button
              variant="ghost"
              onClick={() => setIsAddExerciseOpen(true)}
              className="w-full mt-4 bg-[#7c57ff]/10 border border-dashed border-[#7c57ff]/30 rounded-2xl py-4"
              data-testid="button-add-exercise"
            >
              <Plus className="w-5 h-5 text-[#7c57ff] mr-2" />
              <span className="text-[#7c57ff] font-medium">Add Exercise</span>
            </Button>
          </div>
        )}
      </div>

      {!isRestDay && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a] to-transparent pt-8">
          {canStartWorkout ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Button
                onClick={handleStartWorkout}
                className="w-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-6 rounded-2xl font-bold text-base shadow-lg shadow-[#7c57ff]/30"
                data-testid="button-start-workout"
              >
                <Play className="w-5 h-5 fill-current mr-2" />
                Start Workout
              </Button>
            </motion.div>
          ) : workoutStatus === "skipped" ? (
            <div className="w-full bg-orange-500/20 text-orange-400 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border border-orange-500/30" data-testid="status-skipped">
              <X className="w-5 h-5" />
              Workout Skipped
            </div>
          ) : isCompleted ? (
            <div>
              <div className="w-full bg-green-500/20 text-green-400 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border border-green-500/30" data-testid="status-completed">
                <CheckCircle2 className="w-5 h-5" />
                Workout Completed
              </div>
              {isToday && (
                <p className="text-center text-white/50 text-sm mt-2">Come back tomorrow for your next workout</p>
              )}
            </div>
          ) : (
            <div className="w-full bg-white/10 text-white/50 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2" data-testid="status-locked">
              <Lock className="w-5 h-5" />
              {isPast ? "Workout Missed" : "Workout Locked"}
            </div>
          )}
        </div>
      )}

      <NavigationBar />

      <WorkoutAIAssistant
        workoutName={workoutName}
        exercises={exercises}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onAddExercise={(exerciseData) => {
          const newExercise: Exercise = {
            id: 10000 + Date.now() % 10000,
            name: exerciseData.name,
            muscles: exerciseData.muscles,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            time: exerciseData.time,
            difficulty: "Intermediate",
            gifUrl: "",
            instructions: "",
          };
          handleAddExercise(newExercise);
        }}
        onRemoveExercise={(exerciseName) => {
          const found = addedExercises.some(e => e.name === exerciseName);
          if (found) {
            setAddedExercises(prev => prev.filter(e => e.name !== exerciseName));
            toast.success(`${exerciseName} removed from workout`);
          }
        }}
      />

      <ExerciseDetailsModal
        exercise={selectedExercise}
        isOpen={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setSelectedExercise(null);
        }}
      />

      <ChangeWorkoutTypeModal
        isOpen={isChangeTypeOpen}
        onClose={() => setIsChangeTypeOpen(false)}
        currentType={workoutTemplate.workoutType}
        dayNumber={dayNumber}
        onChangeType={handleChangeWorkoutType}
      />

      {exerciseToSwap && (
        <SwapExerciseModal
          isOpen={isSwapExerciseOpen}
          onClose={() => {
            setIsSwapExerciseOpen(false);
            setExerciseToSwap(null);
          }}
          currentExercise={exerciseToSwap}
          alternatives={getAlternativesForMuscleGroup(exerciseToSwap)}
          onSwap={handleSwapExercise}
        />
      )}

      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onAddExercise={handleAddExercise}
        currentExercises={exercises}
        workoutType={workoutTemplate.workoutType}
      />

      <SchedulingAIAssistant
        isOpen={isSchedulingAIOpen}
        onClose={() => setIsSchedulingAIOpen(false)}
        currentDay={currentDay}
        selectedDay={dayNumber}
        dayStatuses={dayStatuses}
        onMoveWorkout={moveWorkout}
        onChangeWorkoutType={changeWorkoutType}
      />

      {deleteConfirmExercise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          onClick={() => setDeleteConfirmExercise(null)}
          data-testid="modal-delete-confirm"
        >
          <div
            className="w-full max-w-sm bg-[#1a1a2e] rounded-2xl p-6 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base" data-testid="text-delete-title">Remove Exercise</h3>
                <p className="text-white/50 text-sm">This cannot be undone</p>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6" data-testid="text-delete-message">
              Are you sure you want to remove <span className="text-white font-medium">{deleteConfirmExercise.name}</span> from this workout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmExercise(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium text-sm"
                data-testid="button-cancel-delete"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExercise}
                className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium text-sm border border-red-500/30"
                data-testid="button-confirm-delete"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
