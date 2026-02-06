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
  X,
  Plus,
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
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { useExercises } from "@/hooks/useExercises";
import {
  getExercisesForWorkoutType,
  type Exercise,
} from "@/data/workoutExercises";

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
  const [showSuggestion, setShowSuggestion] = useState(true);

  const currentDay = programCurrentDay || 1;
  const dayNumber = id ? parseInt(id, 10) : currentDay;
  const workoutTemplate = getWorkoutForDay(dayNumber);
  const workoutName = workoutTemplate.title;

  const { data: dbExercises } = useExercises(workoutTemplate.workoutType, dayNumber);
  const baseExercises = dbExercises && dbExercises.length > 0
    ? dbExercises
    : getExercisesForWorkoutType(workoutTemplate.workoutType, dayNumber);
  
  const exercises = useMemo(() => {
    const base = baseExercises.map(ex => customExercises[ex.id] || ex);
    return [...base, ...addedExercises];
  }, [baseExercises, customExercises, addedExercises]);

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
  };

  const handleViewDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleWorkoutComplete = async () => {
    setIsWorkoutActive(false);
    const success = await completeWorkout(dayNumber);
    if (success) {
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
  };

  const handleAddExercise = (exercise: Exercise) => {
    setAddedExercises(prev => [...prev, exercise]);
    toast.success(`${exercise.name} added to workout`);
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

  // Show loading state while data is being fetched
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

  const COMPLEMENTARY_MUSCLES: Record<string, { muscles: string[], label: string }> = {
    chest: { muscles: ['back', 'arms'], label: 'Back or Arms' },
    back: { muscles: ['chest', 'arms'], label: 'Chest or Arms' },
    shoulders: { muscles: ['arms', 'chest'], label: 'Arms or Chest' },
    arms: { muscles: ['chest', 'back'], label: 'Chest or Back' },
    legs: { muscles: ['core'], label: 'Core' },
    core: { muscles: ['legs'], label: 'Legs' },
  };

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

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Clean Header */}
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Stats Cards */}
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
              <div className="bg-[#1a1a2e] rounded-2xl p-4 text-center">
                <Target className="w-5 h-5 text-[#00d9ff] mx-auto mb-1" />
                <span className="text-white font-bold text-sm block capitalize" data-testid="text-workout-type">{workoutTemplate.workoutType.replace('_', ' ')}</span>
                <span className="text-white/40 text-xs">Focus</span>
              </div>
            </div>
            
            {/* Quick Actions */}
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

            {/* Targeted Muscles Collapsible */}
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

        {showSuggestion && !isRestDay && COMPLEMENTARY_MUSCLES[workoutTemplate.workoutType] && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 bg-[#7c57ff]/10 border border-[#7c57ff]/20 rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium">
                  Want to add some {COMPLEMENTARY_MUSCLES[workoutTemplate.workoutType].label} exercises?
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Adding complementary muscles makes your workout more balanced
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSuggestion(false)}
                  className="text-white/40 text-xs"
                  data-testid="button-dismiss-suggestion"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => { setIsAddExerciseOpen(true); setShowSuggestion(false); }}
                  className="bg-[#7c57ff] text-white text-xs rounded-xl"
                  data-testid="button-accept-suggestion"
                >
                  Add
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rest Day View */}
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
                className="mx-auto bg-white/10 hover:bg-white/15 px-6 rounded-xl"
                data-testid="button-change-to-workout"
              >
                <RefreshCw className="w-4 h-4 text-white/70 mr-2" />
                <span className="text-white text-sm font-medium">Change to Workout</span>
              </Button>
            </motion.div>
          </div>
        ) : (
          /* Exercise List */
          <div className="px-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-sm font-medium">Exercises</span>
              <span className="text-white/30 text-xs">{exercises.length} total</span>
            </div>
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-[#1a1a2e] rounded-2xl overflow-hidden"
                  data-testid={`card-exercise-${exercise.id}`}
                >
                  {/* Main Content - Clickable */}
                  <button
                    onClick={() => handleViewDetails(exercise)}
                    className="w-full p-4 text-left"
                    data-testid={`button-details-${exercise.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Number Badge */}
                      <div 
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0
                          ${isCompleted 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] text-white'}
                        `}
                        data-testid={`badge-exercise-number-${exercise.id}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-base mb-1" data-testid={`text-exercise-name-${exercise.id}`}>{exercise.name}</h4>
                        <p className="text-white/40 text-sm mb-2" data-testid={`text-exercise-muscles-${exercise.id}`}>{exercise.muscles}</p>
                        
                        {/* Stats Pills */}
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-white/5 px-2.5 py-1 rounded-lg text-white/60 text-xs" data-testid={`text-exercise-sets-${exercise.id}`}>
                            {exercise.sets} sets × {exercise.reps} reps
                          </span>
                          <span className="bg-white/5 px-2.5 py-1 rounded-lg text-white/40 text-xs" data-testid={`text-exercise-time-${exercise.id}`}>
                            {exercise.time}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-white/20 shrink-0 mt-2" />
                    </div>
                  </button>
                  
                  {/* Swap Action */}
                  <div className="px-4 pb-3">
                    <Button
                      variant="ghost"
                      onClick={() => handleOpenSwapExercise(exercise)}
                      className="w-full bg-[#7c57ff]/10 rounded-xl py-2"
                      data-testid={`button-swap-${exercise.id}`}
                    >
                      <ArrowRightLeft className="w-4 h-4 text-[#7c57ff] mr-2" />
                      <span className="text-[#7c57ff] text-sm font-medium">Swap Exercise</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
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

      {/* Fixed Bottom Action Button */}
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

      {/* Bottom Navigation */}
      <NavigationBar />

      {/* AI Assistant Modal */}
      <WorkoutAIAssistant
        workoutName={workoutName}
        exercises={exercises}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Exercise Details Modal */}
      <ExerciseDetailsModal
        exercise={selectedExercise}
        isOpen={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setSelectedExercise(null);
        }}
      />

      {/* Change Workout Type Modal */}
      <ChangeWorkoutTypeModal
        isOpen={isChangeTypeOpen}
        onClose={() => setIsChangeTypeOpen(false)}
        currentType={workoutTemplate.workoutType}
        dayNumber={dayNumber}
        onChangeType={handleChangeWorkoutType}
      />

      {/* Swap Exercise Modal */}
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

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onAddExercise={handleAddExercise}
        currentExercises={exercises}
        workoutType={workoutTemplate.workoutType}
      />

      {/* Scheduling AI Assistant */}
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
