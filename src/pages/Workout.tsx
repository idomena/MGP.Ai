import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NavigationBar from "@/components/NavigationBar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutAIAssistant from "@/components/WorkoutAIAssistant";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import ChangeWorkoutTypeModal from "@/components/ChangeWorkoutTypeModal";
import SwapExerciseModal from "@/components/SwapExerciseModal";
import SchedulingAIAssistant from "@/components/SchedulingAIAssistant";
import MuscleAnatomyDiagram from "@/components/MuscleAnatomyDiagram";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { useExercises } from "@/hooks/useExercises";
import {
  getExercisesForWorkoutType,
  type Exercise,
} from "@/data/workoutExercises";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const statsCardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

const expandVariants = {
  collapsed: { 
    opacity: 0, 
    height: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    }
  },
  expanded: { 
    opacity: 1, 
    height: "auto",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    }
  },
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

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

  const currentDay = programCurrentDay || 1;
  const dayNumber = id ? parseInt(id, 10) : currentDay;
  const workoutTemplate = getWorkoutForDay(dayNumber);
  const workoutName = workoutTemplate.title;

  const { data: dbExercises } = useExercises(workoutTemplate.workoutType, dayNumber);
  const baseExercises = dbExercises && dbExercises.length > 0
    ? dbExercises
    : getExercisesForWorkoutType(workoutTemplate.workoutType, dayNumber);
  
  const exercises = useMemo(() => {
    return baseExercises.map(ex => customExercises[ex.id] || ex);
  }, [baseExercises, customExercises]);

  const isToday = dayNumber === currentDay;
  const isCompleted = completedDays.includes(dayNumber);
  const isPast = dayNumber < currentDay;
  const canStartWorkout = isToday && !isCompleted;
  const isRestDay = workoutTemplate.workoutType === "rest";

  const workoutStatus: "completed" | "active" | "locked" | "missed" = isCompleted
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
  };

  const handleViewDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleWorkoutComplete = async () => {
    setIsWorkoutActive(false);
    const success = await completeWorkout(dayNumber);
    if (success) {
      toast.success("Workout complete! Great job!");
    } else {
      toast.error("Failed to save workout. Please try again.");
    }
    navigate("/");
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
  };

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
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <WorkoutSession
          exercises={exercises}
          dayNumber={dayNumber}
          workoutName={workoutName}
          onComplete={handleWorkoutComplete}
          onExit={handleWorkoutExit}
          onCompleteWorkout={completeWorkout}
        />
      </motion.div>
    );
  }

  if (isLoading && !id) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="w-12 h-12 border-3 border-[#7c57ff] border-t-transparent rounded-full animate-spin glow-pulse" />
          <span className="text-white/60 text-sm">Loading workout...</span>
        </motion.div>
      </div>
    );
  }

  const getStatusText = () => {
    switch (workoutStatus) {
      case "completed": return "Completed";
      case "active": return "Today";
      case "missed": return "Missed";
      default: return "Locked";
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg flex flex-col">
      <motion.header 
        className="sticky top-0 z-40 px-4 py-4 glass-card border-b border-white/5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={handleGoBack}
              className="rounded-full tap-scale"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </Button>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-white/40 text-xs font-medium" data-testid="text-day-number">DAY {dayNumber}</span>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-white font-bold text-lg" data-testid="text-workout-name">{workoutName}</h1>
              <motion.span 
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  workoutStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                  workoutStatus === 'active' ? 'bg-[#7c57ff]/20 text-[#7c57ff] glow-pulse' :
                  workoutStatus === 'missed' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-white/10 text-white/40'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.2 }}
                data-testid="text-status"
              >
                {getStatusText()}
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsAIOpen(true)}
              className="rounded-full tap-scale"
              data-testid="button-ai-help"
            >
              <Sparkles className="w-5 h-5 text-[#7c57ff]" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto pb-32">
        {!isRestDay && (
          <div className="px-4 py-4" data-testid="stats-bar">
            <motion.div 
              className="grid grid-cols-3 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                variants={statsCardVariants}
                className="glass-card rounded-2xl p-4 text-center"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                >
                  <Dumbbell className="w-5 h-5 text-[#7c57ff] mx-auto mb-1" />
                </motion.div>
                <span className="text-white font-bold text-xl block" data-testid="text-exercise-count">{exercises.length}</span>
                <span className="text-white/40 text-xs">Exercises</span>
              </motion.div>
              <motion.div 
                variants={statsCardVariants}
                className="glass-card rounded-2xl p-4 text-center"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.15 }}
                >
                  <Clock className="w-5 h-5 text-[#60a5fa] mx-auto mb-1" />
                </motion.div>
                <span className="text-white font-bold text-xl block" data-testid="text-duration">{totalDuration}</span>
                <span className="text-white/40 text-xs">Minutes</span>
              </motion.div>
              <motion.div 
                variants={statsCardVariants}
                className="glass-card rounded-2xl p-4 text-center"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.2 }}
                >
                  <Target className="w-5 h-5 text-[#00d9ff] mx-auto mb-1" />
                </motion.div>
                <span className="text-white font-bold text-sm block capitalize" data-testid="text-workout-type">{workoutTemplate.workoutType.replace('_', ' ')}</span>
                <span className="text-white/40 text-xs">Focus</span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex gap-2 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  onClick={() => setIsSchedulingAIOpen(true)}
                  className="w-full glass-card rounded-xl py-3 tap-scale"
                  data-testid="button-schedule"
                >
                  <Calendar className="w-4 h-4 text-white/60 mr-2" />
                  <span className="text-white/70 text-sm">Reschedule</span>
                </Button>
              </motion.div>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  onClick={() => setIsChangeTypeOpen(true)}
                  className="w-full glass-card rounded-xl py-3 tap-scale"
                  data-testid="button-change-type"
                >
                  <RefreshCw className="w-4 h-4 text-white/60 mr-2" />
                  <span className="text-white/70 text-sm">Change Type</span>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-4 glass-card rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.button
                onClick={() => setIsMusclesExpanded(!isMusclesExpanded)}
                className="w-full flex items-center justify-between p-4 tap-scale"
                whileTap={{ scale: 0.98 }}
                data-testid="button-toggle-muscles"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#7c57ff]" />
                  <span className="text-white font-medium">Targeted Muscles</span>
                </div>
                <motion.div
                  animate={{ rotate: isMusclesExpanded ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <ChevronDown className="w-5 h-5 text-white/50" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {isMusclesExpanded && (
                  <motion.div
                    variants={expandVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="px-4 pb-4 overflow-hidden"
                  >
                    <MuscleAnatomyDiagram targetedMuscles={targetedMuscles} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {isRestDay ? (
          <div className="px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-center"
            >
              <motion.div 
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7c57ff]/20 to-[#60a5fa]/20 flex items-center justify-center glow-pulse"
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Moon className="w-10 h-10 text-[#7c57ff]" />
              </motion.div>
              <h2 className="text-white text-xl font-bold mb-2" data-testid="text-rest-day-title">Rest Day</h2>
              <p className="text-white/50 text-sm mb-6">Take a break and recover. Your muscles need it!</p>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => setIsChangeTypeOpen(true)}
                  className="mx-auto glass-card hover:bg-white/15 px-6 rounded-xl tap-scale"
                  data-testid="button-change-to-workout"
                >
                  <RefreshCw className="w-4 h-4 text-white/70 mr-2" />
                  <span className="text-white text-sm font-medium">Change to Workout</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div className="px-4">
            <motion.div 
              className="flex items-center justify-between mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-white/50 text-sm font-medium">Exercises</span>
              <span className="text-white/30 text-xs">{exercises.length} total</span>
            </motion.div>
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  variants={itemVariants}
                  className={`glass-card rounded-2xl overflow-hidden ${isToday && !isCompleted ? 'glow-border' : ''}`}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  data-testid={`card-exercise-${exercise.id}`}
                >
                  <motion.button
                    onClick={() => handleViewDetails(exercise)}
                    className="w-full p-4 text-left tap-scale"
                    data-testid={`button-details-${exercise.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0
                          ${isCompleted 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] text-white'}
                        `}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 20,
                          delay: index * 0.05
                        }}
                        data-testid={`badge-exercise-number-${exercise.id}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-base mb-1" data-testid={`text-exercise-name-${exercise.id}`}>{exercise.name}</h4>
                        <p className="text-white/40 text-sm mb-2" data-testid={`text-exercise-muscles-${exercise.id}`}>{exercise.muscles}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-white/5 px-2.5 py-1 rounded-lg text-white/60 text-xs" data-testid={`text-exercise-sets-${exercise.id}`}>
                            {exercise.sets} sets × {exercise.reps} reps
                          </span>
                          <span className="bg-white/5 px-2.5 py-1 rounded-lg text-white/40 text-xs" data-testid={`text-exercise-time-${exercise.id}`}>
                            {exercise.time}
                          </span>
                        </div>
                      </div>

                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ChevronRight className="w-5 h-5 text-white/20 shrink-0 mt-2" />
                      </motion.div>
                    </div>
                  </motion.button>
                  
                  <div className="px-4 pb-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => handleOpenSwapExercise(exercise)}
                        className="w-full bg-[#7c57ff]/10 rounded-xl py-2 tap-scale"
                        data-testid={`button-swap-${exercise.id}`}
                      >
                        <ArrowRightLeft className="w-4 h-4 text-[#7c57ff] mr-2" />
                        <span className="text-[#7c57ff] text-sm font-medium">Swap Exercise</span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {!isRestDay && (
        <motion.div 
          className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a] to-transparent pt-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
        >
          {canStartWorkout ? (
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                onClick={handleStartWorkout}
                className="w-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-6 rounded-2xl font-bold text-base btn-glow glow-pulse"
                data-testid="button-start-workout"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mr-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                </motion.div>
                Start Workout
              </Button>
            </motion.div>
          ) : isCompleted ? (
            <motion.div 
              className="w-full glass-card bg-green-500/20 text-green-400 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border border-green-500/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              data-testid="status-completed"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
              Workout Completed
            </motion.div>
          ) : (
            <motion.div 
              className="w-full glass-card text-white/50 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-testid="status-locked"
            >
              <Lock className="w-5 h-5" />
              {isPast ? "Workout Missed" : "Workout Locked"}
            </motion.div>
          )}
        </motion.div>
      )}

      <NavigationBar />

      <WorkoutAIAssistant
        workoutName={workoutName}
        exercises={exercises}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
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
          alternatives={exercises.filter(e => e.id !== exerciseToSwap.id)}
          onSwap={handleSwapExercise}
        />
      )}

      <SchedulingAIAssistant
        isOpen={isSchedulingAIOpen}
        onClose={() => setIsSchedulingAIOpen(false)}
        currentDay={currentDay}
        selectedDay={dayNumber}
        dayStatuses={dayStatuses}
        onMoveWorkout={moveWorkout}
        onChangeWorkoutType={changeWorkoutType}
      />
    </div>
  );
}
