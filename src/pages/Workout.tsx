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
  RefreshCw,
  ArrowRightLeft,
  Moon,
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

  const getStatusColor = () => {
    switch (workoutStatus) {
      case "completed": return "text-green-400";
      case "active": return "text-[#7c57ff]";
      case "missed": return "text-orange-400";
      default: return "text-white/40";
    }
  };

  const getStatusText = () => {
    switch (workoutStatus) {
      case "completed": return "Completed";
      case "active": return "Today";
      case "missed": return "Missed";
      default: return "Locked";
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Compact Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-[#0f0f1a] border-b border-white/5">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleGoBack}
            className="rounded-full bg-white/10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs" data-testid="text-day-number">Day {dayNumber}</span>
              <span className={`text-xs font-medium ${getStatusColor()}`} data-testid="text-status">{getStatusText()}</span>
            </div>
            <h1 className="text-white font-semibold text-base truncate" data-testid="text-workout-name">{workoutName}</h1>
          </div>

          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsChangeTypeOpen(true)}
              className="rounded-full bg-white/10"
              data-testid="button-change-type"
            >
              <RefreshCw className="w-4 h-4 text-white/70" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsAIOpen(true)}
              className="rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa]"
              data-testid="button-ai-help"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Quick Stats Bar */}
        {!isRestDay && (
          <div className="px-4 py-3 flex items-center justify-center gap-4 border-b border-white/5" data-testid="stats-bar">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-[#7c57ff]" />
              <span className="text-white font-semibold text-sm" data-testid="text-exercise-count">{exercises.length}</span>
              <span className="text-white/50 text-xs">exercises</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#60a5fa]" />
              <span className="text-white font-semibold text-sm" data-testid="text-duration">{totalDuration}</span>
              <span className="text-white/50 text-xs">min</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#00d9ff]" />
              <span className="text-white/70 text-xs" data-testid="text-workout-type">{workoutTemplate.workoutType}</span>
            </div>
          </div>
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
          <div className="px-4 py-3">
            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-[#1a1a2e] rounded-xl p-3 border border-white/5"
                  data-testid={`card-exercise-${exercise.id}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Number Badge */}
                    <div 
                      className={`
                        min-w-[32px] h-8 px-2 rounded-lg flex items-center justify-center text-sm font-bold
                        ${isCompleted 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gradient-to-br from-[#7c57ff]/20 to-[#60a5fa]/20 text-[#7c57ff]'}
                      `}
                      data-testid={`badge-exercise-number-${exercise.id}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate" data-testid={`text-exercise-name-${exercise.id}`}>{exercise.name}</h4>
                      <p className="text-white/40 text-xs" data-testid={`text-exercise-muscles-${exercise.id}`}>{exercise.muscles}</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-white/60" data-testid={`text-exercise-sets-${exercise.id}`}>{exercise.sets}×{exercise.reps}</span>
                      <div className="w-px h-3 bg-white/10" />
                      <span className="text-white/40" data-testid={`text-exercise-time-${exercise.id}`}>{exercise.time}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleViewDetails(exercise)}
                        className="rounded-lg bg-white/5"
                        data-testid={`button-details-${exercise.id}`}
                      >
                        <ChevronRight className="w-4 h-4 text-white/50" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenSwapExercise(exercise)}
                        className="rounded-lg bg-[#7c57ff]/10"
                        data-testid={`button-swap-${exercise.id}`}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-[#7c57ff]" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
          ) : isCompleted ? (
            <div className="w-full bg-green-500/20 text-green-400 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border border-green-500/30" data-testid="status-completed">
              <CheckCircle2 className="w-5 h-5" />
              Workout Completed
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
