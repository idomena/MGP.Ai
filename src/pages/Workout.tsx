import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import posthog from "posthog-js";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Target,
  Sparkles,
  ChevronDown,
  RefreshCw,
  ArrowRightLeft,
  Calendar,
  Plus,
  Trash2,
  SlidersHorizontal,
  ListOrdered,
  Info,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import NavigationBar from "@/components/NavigationBar";
import { AnimatePresence, motion } from "framer-motion";
import { BrandMark } from "@/components/brand/Brand";
import WorkoutHeroArt, { emblemForType } from "@/components/workout/WorkoutHeroArt";
import { ActionSheet, FinishStep, PlanStep, StartWorkoutButton, WorkoutStatusBanner } from "@/components/workout/WorkoutParts";
import { cozy } from "@/lib/cozyTheme";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutAIAssistant from "@/components/WorkoutAIAssistant";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import ChangeWorkoutTypeModal from "@/components/ChangeWorkoutTypeModal";
import SwapExerciseModal from "@/components/SwapExerciseModal";
import SchedulingAIAssistant from "@/components/SchedulingAIAssistant";
import MuscleAnatomyDiagram from "@/components/MuscleAnatomyDiagram";
import AddExerciseModal from "@/components/AddExerciseModal";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { useExercises } from "@/hooks/useExercises";
import {
  getExercisesForWorkoutType,
  getAlternativesForMuscleGroup,
  type Exercise,
} from "@/data/workoutExercises";

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  chest: "#c4553d",
  back: "#6f9fc4",
  lats: "#6f9fc4",
  shoulders: "#ec8a3f",
  deltoid: "#ec8a3f",
  deltoids: "#ec8a3f",
  arms: "#7a5bd3",
  biceps: "#7a5bd3",
  triceps: "#7a5bd3",
  forearms: "#7a5bd3",
  legs: "#93b58c",
  quads: "#93b58c",
  glutes: "#93b58c",
  hamstrings: "#93b58c",
  calves: "#93b58c",
  core: "#c4553d",
  abs: "#c4553d",
};

function getMuscleGroupColor(muscles: string): string {
  const parts = muscles.toLowerCase().split(",").map(m => m.trim());
  for (const part of parts) {
    for (const [key, color] of Object.entries(MUSCLE_GROUP_COLORS)) {
      if (part.includes(key)) return color;
    }
  }
  return "#7a5bd3";
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
  if (t.includes("chest")) return "#c4553d";
  if (t.includes("back")) return "#6f9fc4";
  if (t.includes("shoulder")) return "#ec8a3f";
  if (t.includes("arm") || t.includes("bicep") || t.includes("tricep")) return "#7a5bd3";
  if (t.includes("leg") || t.includes("lower")) return "#93b58c";
  if (t.includes("core") || t.includes("abs")) return "#c4553d";
  if (t.includes("full") || t.includes("upper") || t.includes("push") || t.includes("pull")) return "#7a5bd3";
  return "#7a5bd3";
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "Beginner": return "#93b58c";
    case "Intermediate": return "#ec8a3f";
    case "Advanced": return "#c4553d";
    default: return "#7a5bd3";
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
  // Presentation-only state for the redesigned entry page
  const [editMode, setEditMode] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [menuExercise, setMenuExercise] = useState<{ exercise: Exercise; index: number } | null>(null);
  const [showStickyStart, setShowStickyStart] = useState(false);
  const heroCtaRef = useRef<HTMLDivElement>(null);

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

  // Sticky START: appears only once the hero's Start button has scrolled out of view (upwards).
  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el || !canStartWorkout || isWorkoutActive) {
      setShowStickyStart(false);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setShowStickyStart(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [canStartWorkout, isWorkoutActive, isLoading, isRestDay]);

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
      <div className="cozy-root flex min-h-screen flex-col items-center justify-center gap-4" role="status" aria-label="Loading workout">
        <motion.span
          animate={{ scale: [1, 1.06, 1], opacity: [0.9, 0.6, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <BrandMark size={52} color={cozy.primary} />
        </motion.span>
        <span className="text-[15px]" style={{ color: cozy.inkSoft }}>Preparing your workout…</span>
      </div>
    );
  }

  const isAddedExercise = (exercise: Exercise) => addedExercises.some(ex => ex.id === exercise.id);

  // ─── Presentation data (all derived from existing real data) ────────────
  const focusGroups = Array.from(
    new Set(exercises.map(ex => getMuscleGroupLabel(ex.muscles || "")).filter(l => l !== "Other")),
  ).slice(0, 3);
  const unlockLabel = dayStatusEntry?.date
    ? (() => {
        const [y, m, d] = dayStatusEntry.date.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      })()
    : undefined;
  const eyebrow = isRestDay
    ? (isToday ? "Today · Rest day" : `Day ${dayNumber} · Rest day`)
    : isToday
      ? "Today's workout"
      : `Day ${dayNumber} · ${workoutStatus === "locked" ? "Coming up" : workoutStatus === "completed" ? "Completed" : workoutStatus === "skipped" ? "Skipped" : "Missed"}`;
  const heroCopy = isRestDay
    ? "Recovery is part of the path. Rest well — you're still progressing."
    : workoutStatus === "active"
      ? "Everything's ready. Warm up, breathe, and take it one set at a time."
      : workoutStatus === "completed"
        ? "You cleared this checkpoint. Enjoy the recovery."
        : workoutStatus === "locked"
          ? "A preview of what's waiting further along your path."
          : "This one's behind you — today's checkpoint is waiting on Home.";
  const titleSize = workoutName.length > 22 ? "clamp(28px, 8vw, 34px)" : "clamp(34px, 10.5vw, 42px)";

  const menuActions = menuExercise
    ? [
        { key: "details", icon: <Info className="h-5 w-5" />, label: "Exercise details", sub: "Form, muscles and instructions", onSelect: () => handleViewDetails(menuExercise.exercise) },
        { key: "swap", icon: <ArrowRightLeft className="h-5 w-5" />, label: "Swap exercise", sub: "Pick an alternative for the same muscles", tone: "primary" as const, onSelect: () => handleOpenSwapExercise(menuExercise.exercise), testid: `button-swap-${menuExercise.exercise.id}` },
        { key: "up", icon: <ArrowUp className="h-5 w-5" />, label: "Move earlier", onSelect: () => handleMoveExercise(menuExercise.index, "up"), disabled: menuExercise.index === 0 },
        { key: "down", icon: <ArrowDown className="h-5 w-5" />, label: "Move later", onSelect: () => handleMoveExercise(menuExercise.index, "down"), disabled: menuExercise.index === exercises.length - 1 },
        { key: "remove", icon: <Trash2 className="h-5 w-5" />, label: "Remove from workout", tone: "danger" as const, onSelect: () => handleRemoveExercise(menuExercise.exercise), testid: `button-remove-${menuExercise.exercise.id}` },
      ]
    : [];

  const adjustActions = [
    { key: "coach", icon: <Sparkles className="h-5 w-5" />, label: "Ask your coach", sub: "Tweak today's session with AI", tone: "primary" as const, onSelect: () => setIsAIOpen(true), testid: "button-ai-help-sheet" },
    ...(!isRestDay ? [
      { key: "edit", icon: <ListOrdered className="h-5 w-5" />, label: "Edit exercises", sub: "Reorder or remove", onSelect: () => setEditMode(true), testid: "button-edit-mode" },
      { key: "add", icon: <Plus className="h-5 w-5" />, label: "Add an exercise", onSelect: () => setIsAddExerciseOpen(true), testid: "button-add-exercise" },
    ] : []),
    { key: "type", icon: <RefreshCw className="h-5 w-5" />, label: isRestDay ? "Change to a workout" : "Change workout type", onSelect: () => setIsChangeTypeOpen(true), testid: "button-change-type" },
    { key: "schedule", icon: <Calendar className="h-5 w-5" />, label: "Reschedule", sub: "Move this workout to another day", onSelect: () => setIsSchedulingAIOpen(true), testid: "button-schedule" },
  ];

  return (
    <div className="cozy-root relative min-h-screen overflow-x-hidden">
      <div className="relative mx-auto max-w-md">
        {/* ── HERO SCENE ───────────────────────────────────────────── */}
        <section className="relative" aria-labelledby="workout-title">
          <motion.div
            className="relative h-[250px] overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${cozy.surface} 0%, ${cozy.bg} 100%)`,
              // the world softly dissolves into the page instead of ending on a seam
              WebkitMaskImage: "linear-gradient(180deg, #000 78%, transparent 100%)",
              maskImage: "linear-gradient(180deg, #000 78%, transparent 100%)",
            }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-x-0 bottom-0 h-[236px]">
              <WorkoutHeroArt kind={emblemForType(workoutTemplate.workoutType)} />
            </div>
          </motion.div>

          {/* top bar floats over the scene */}
          <div
            className="absolute inset-x-0 top-0 flex items-center justify-between px-4"
            style={{ paddingTop: "calc(var(--safe-area-inset-top, 0px) + 14px)" }}
          >
            <button
              type="button"
              onClick={handleGoBack}
              className="cozy-press flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
              style={{ background: cozy.surface, boxShadow: cozy.shadowSm }}
              aria-label="Back to your journey"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: cozy.ink }} />
            </button>

            <div
              className="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5"
              style={{ background: cozy.surface, boxShadow: cozy.shadowSm }}
            >
              <BrandMark size={20} color={cozy.primary} title="MGP.AI" />
              <span className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: cozy.ink }} data-testid="text-day-number">
                Day {dayNumber}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAIOpen(true)}
              className="cozy-press flex h-11 items-center gap-1.5 rounded-full pl-3 pr-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
              style={{ background: cozy.primarySoft, color: cozy.primaryDeep, boxShadow: cozy.shadowSm }}
              aria-label="Ask your AI coach"
              data-testid="button-ai-help"
            >
              <Sparkles className="h-[18px] w-[18px]" />
              <span className="text-[14px] font-semibold">Coach</span>
            </button>
          </div>

          {/* mission briefing */}
          <div className="relative -mt-1 px-5">
            <motion.p
              className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: isRestDay ? cozy.restDeep : workoutStatus === "active" ? cozy.primary : cozy.inkSoft }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              data-testid="text-status"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
              {eyebrow}
            </motion.p>
            <motion.h1
              id="workout-title"
              className="cozy-display mt-2 font-semibold leading-[1.02]"
              style={{ color: cozy.ink, fontSize: titleSize }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              data-testid="text-workout-name"
            >
              {workoutName}
            </motion.h1>
            <motion.p
              className="mt-3 max-w-[34ch] text-[15.5px] leading-relaxed"
              style={{ color: cozy.inkSoft }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.45 }}
            >
              {heroCopy}
            </motion.p>

            {!isRestDay && (
              <motion.ul
                className="mt-5 flex flex-wrap items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32, duration: 0.4 }}
                data-testid="stats-bar"
              >
                {totalDuration > 0 && (
                  <li className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-semibold" style={{ background: cozy.surface, color: cozy.ink, boxShadow: cozy.shadowSm }}>
                    <Clock className="h-4 w-4" style={{ color: cozy.skyDeep }} />
                    <span data-testid="text-duration">{totalDuration}</span>
                    <span className="font-medium" style={{ color: cozy.inkSoft }}>min</span>
                  </li>
                )}
                <li className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-semibold" style={{ background: cozy.surface, color: cozy.ink, boxShadow: cozy.shadowSm }}>
                  <Dumbbell className="h-4 w-4" style={{ color: cozy.primary }} />
                  <span data-testid="text-exercise-count">{exercises.length}</span>
                  <span className="font-medium" style={{ color: cozy.inkSoft }}>{exercises.length === 1 ? "exercise" : "exercises"}</span>
                </li>
                {focusGroups.length > 0 && (
                  <li className="px-1 text-[14px] font-medium" style={{ color: cozy.inkSoft }} data-testid="text-workout-type">
                    {focusGroups.join(" · ")}
                  </li>
                )}
              </motion.ul>
            )}

            {/* the moment */}
            <motion.div
              ref={heroCtaRef}
              className="mt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {isRestDay ? (
                <button
                  type="button"
                  onClick={() => setIsChangeTypeOpen(true)}
                  className="cozy-press flex h-14 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold"
                  style={{ background: cozy.restSoft, color: cozy.restDeep }}
                  data-testid="button-change-to-workout"
                >
                  <RefreshCw className="h-[18px] w-[18px]" />
                  Change to a workout
                </button>
              ) : canStartWorkout ? (
                <StartWorkoutButton onClick={handleStartWorkout} />
              ) : (
                <WorkoutStatusBanner
                  status={workoutStatus === "active" ? "locked" : workoutStatus}
                  isToday={isToday}
                  unlockLabel={unlockLabel}
                />
              )}
            </motion.div>

            {/* quiet secondary actions */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {!isRestDay && (
                <button
                  type="button"
                  onClick={() => setIsMusclesExpanded(!isMusclesExpanded)}
                  className="flex h-11 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
                  style={{ color: isMusclesExpanded ? cozy.primaryDeep : cozy.inkSoft, background: isMusclesExpanded ? cozy.primarySoft : "transparent" }}
                  aria-expanded={isMusclesExpanded}
                  data-testid="button-toggle-muscles"
                >
                  <Target className="h-4 w-4" />
                  Muscle map
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMusclesExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAdjustOpen(true)}
                className="flex h-11 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
                style={{ color: cozy.inkSoft }}
                data-testid="button-adjust"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Adjust workout
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isMusclesExpanded && !isRestDay && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-[26px] p-4" style={{ background: cozy.surface, boxShadow: cozy.shadowSm }}>
                    <MuscleAnatomyDiagram targetedMuscles={targetedMuscles} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── TODAY'S PLAN ─────────────────────────────────────────── */}
        {!isRestDay && (
          <section className="mt-9 px-5" style={{ paddingBottom: "calc(var(--safe-area-inset-bottom, 0px) + 190px)" }} aria-labelledby="plan-title">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 id="plan-title" className="cozy-display text-[25px] font-semibold leading-tight" style={{ color: cozy.ink }}>
                  {isToday ? "Today's plan" : "The plan"}
                </h2>
                <p className="mt-0.5 text-[14px]" style={{ color: cozy.inkSoft }}>
                  {editMode ? "Reorder, drag or remove — saved for this day." : `${exercises.length} ${exercises.length === 1 ? "step" : "steps"} to the finish line`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className="flex h-10 shrink-0 items-center rounded-full px-4 text-[14px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
                style={editMode
                  ? { background: cozy.primary, color: "#fff", boxShadow: `0 3px 0 ${cozy.primaryDeep}` }
                  : { background: cozy.surface, color: cozy.ink, boxShadow: cozy.shadowSm }}
                data-testid="button-toggle-edit"
              >
                {editMode ? "Done" : "Edit"}
              </button>
            </div>

            <ol className="relative" aria-label="Exercises in order">
              {exercises.map((exercise, index) => (
                <PlanStep
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  count={exercises.length}
                  done={isCompleted}
                  editMode={editMode}
                  muscleLabel={getMuscleGroupLabel(exercise.muscles || "")}
                  muscleColor={getMuscleGroupColor(exercise.muscles || "")}
                  onOpen={() => handleViewDetails(exercise)}
                  onMenu={() => setMenuExercise({ exercise, index })}
                  onMoveUp={() => handleMoveExercise(index, "up")}
                  onMoveDown={() => handleMoveExercise(index, "down")}
                  onRemove={() => handleRemoveExercise(exercise)}
                  isDragSource={dragFromIndex === index}
                  isDragOver={dragOverIndex === index && dragFromIndex !== index}
                  dragProps={editMode ? {
                    draggable: true,
                    onDragStart: () => handleDragStart(index),
                    onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
                    onDrop: (e: React.DragEvent) => handleDrop(e, index),
                    onDragEnd: handleDragEnd,
                  } : {}}
                />
              ))}
              <FinishStep done={isCompleted} />
            </ol>

            <AnimatePresence>
              {editMode && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  onClick={() => setIsAddExerciseOpen(true)}
                  className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[22px] text-[15px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
                  style={{ color: cozy.primaryDeep, background: cozy.primarySoft, border: `1.5px dashed ${cozy.primaryLine}` }}
                  data-testid="button-add-exercise-inline"
                >
                  <Plus className="h-5 w-5" />
                  Add an exercise
                </motion.button>
              )}
            </AnimatePresence>
          </section>
        )}
        {isRestDay && <div style={{ height: "calc(var(--safe-area-inset-bottom, 0px) + 140px)" }} />}
      </div>

      {/* ── STICKY START (after the hero CTA scrolls away) ─────────── */}
      <AnimatePresence>
        {showStickyStart && canStartWorkout && !editMode && (
          <motion.div
            className="fixed inset-x-0 z-40 px-4"
            style={{ bottom: "calc(var(--safe-area-inset-bottom, 0px) + 86px)" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto max-w-md">
              <StartWorkoutButton compact onClick={handleStartWorkout} label={`Start ${workoutName}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavigationBar />

      {/* ── Sheets ───────────────────────────────────────────────── */}
      <ActionSheet
        open={!!menuExercise}
        onOpenChange={(o) => { if (!o) setMenuExercise(null); }}
        title={menuExercise?.exercise.name ?? ""}
        description={menuExercise ? `Step ${menuExercise.index + 1} · ${menuExercise.exercise.sets} sets × ${menuExercise.exercise.reps}${isAddedExercise(menuExercise.exercise) ? " · added by you" : ""}` : undefined}
        actions={menuActions}
      />
      <ActionSheet
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        title="Adjust workout"
        description="Everything's ready as it is — tweak only if you want to."
        actions={adjustActions}
      />

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
            gif_url: "",
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

      <AnimatePresence>
        {deleteConfirmExercise && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(59,47,39,0.36)] px-4 sm:items-center"
            style={{ paddingBottom: "calc(var(--safe-area-inset-bottom, 0px) + 16px)" }}
            onClick={() => setDeleteConfirmExercise(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="modal-delete-confirm"
          >
            <motion.div
              className="w-full max-w-sm rounded-[28px] p-6"
              style={{ background: cozy.surface, boxShadow: cozy.shadowLg }}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              exit={{ y: 30 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: cozy.dangerSoft }}>
                <Trash2 className="h-5 w-5" style={{ color: cozy.danger }} />
              </span>
              <h3 className="cozy-display mt-4 text-[22px] font-semibold" style={{ color: cozy.ink }} data-testid="text-delete-title">Remove exercise?</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: cozy.inkSoft }} data-testid="text-delete-message">
                <span className="font-semibold" style={{ color: cozy.ink }}>{deleteConfirmExercise.name}</span> will be removed from this day's workout.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteConfirmExercise(null)}
                  className="h-12 flex-1 rounded-full text-[15px] font-semibold"
                  style={{ background: cozy.surfaceSunk, color: cozy.ink }}
                  data-testid="button-cancel-delete"
                >
                  Keep it
                </button>
                <button
                  onClick={confirmDeleteExercise}
                  className="h-12 flex-1 rounded-full text-[15px] font-semibold text-white"
                  style={{ background: cozy.danger, boxShadow: `0 3px 0 color-mix(in srgb, ${cozy.danger} 70%, black)` }}
                  data-testid="button-confirm-delete"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
