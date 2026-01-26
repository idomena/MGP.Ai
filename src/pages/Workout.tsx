import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, ArrowLeft, Lock, Loader2, Clock, Dumbbell, ChevronRight, Sparkles, CheckCircle2, Calendar, Info } from "lucide-react";
import NavigationBar from "@/components/NavigationBar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutAIAssistant from "@/components/WorkoutAIAssistant";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";

interface ValidationResult {
  success: boolean;
  canStart: boolean;
  status: "locked" | "active" | "preview" | "completed";
  currentDay: number;
  requestedDay: number;
  serverDate?: string;
  formattedDate?: string;
  error?: string;
}

interface Exercise {
  id: number;
  name: string;
  muscles: string;
  sets: number;
  reps: string;
  time: string;
  difficulty: string;
  gifUrl: string;
  instructions?: string;
}

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completeWorkout, currentDay: programCurrentDay, completedDays, getWorkoutForDay } = useWorkoutProgress();
  
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedExerciseForAI, setSelectedExerciseForAI] = useState<string | undefined>(undefined);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  const dayNumber = id ? parseInt(id, 10) : 1;
  
  const workoutTemplate = getWorkoutForDay(dayNumber);
  const workoutName = workoutTemplate.name;

  const exercises: Exercise[] = [
    {
      id: 1,
      name: "Machine T-bar Row",
      muscles: "Back, Lats",
      sets: 3,
      reps: "12, 10, 8",
      time: "10 min",
      difficulty: "Intermediate",
      gifUrl: "https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif",
      instructions: "Grip the handles firmly, keep your back straight, and pull the weight towards your chest. Squeeze your back muscles at the top of the movement.",
    },
    {
      id: 2,
      name: "Lat Pull Down",
      muscles: "Back, Shoulders",
      sets: 3,
      reps: "12, 10, 8",
      time: "8 min",
      difficulty: "Beginner",
      gifUrl: "https://media.giphy.com/media/l0MYyv6UK0Bd4DE76/giphy.gif",
      instructions: "Sit down and grab the bar with a wide grip. Pull the bar down to your chest while keeping your back straight. Slowly return to starting position.",
    },
    {
      id: 3,
      name: "Hammer Curls",
      muscles: "Biceps, Forearms",
      sets: 4,
      reps: "12, 10, 8, 8",
      time: "10 min",
      difficulty: "Intermediate",
      gifUrl: "https://media.giphy.com/media/xT0xeIbYVQcBFDSdVu/giphy.gif",
      instructions: "Hold dumbbells with palms facing each other. Curl the weights up while keeping your elbows close to your body. Lower slowly.",
    },
  ];

  useEffect(() => {
    const validateWorkoutAccess = async () => {
      if (!user) {
        setIsValidating(false);
        return;
      }

      try {
        setIsValidating(true);
        const response = await fetch(`/api/progress/validate/${user.id}/${dayNumber}`);
        const data: ValidationResult = await response.json();
        
        if (data.success) {
          // Only allow starting today's workout, but keep the backend's status
          // for accurate display (completed vs locked for past days)
          if (dayNumber === data.currentDay) {
            data.canStart = true;
          } else {
            data.canStart = false;
          }
          
          // If status is "locked" but day is in the past, it means user skipped it
          // Backend returns appropriate status, we just use it
        }

        setValidationResult(data);
      } catch (error) {
        console.error("Error validating workout access:", error);
      } finally {
        setIsValidating(false);
      }
    };

    validateWorkoutAccess();
  }, [user, dayNumber]);

  const currentDay = programCurrentDay || 1;
  const isToday = dayNumber === currentDay;
  const isCompleted = completedDays.includes(dayNumber);
  const canStartWorkout = isToday && !isCompleted;
  const workoutStatus = isCompleted ? "completed" : isToday ? "active" : dayNumber < currentDay ? "past" : "preview";

  const handleStartWorkout = () => {
    if (!canStartWorkout) {
      toast.error("You can only start today's workout");
      return;
    }
    setIsWorkoutActive(true);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    if (canStartWorkout) {
      setIsWorkoutActive(true);
    } else {
      setSelectedExercise(exercise);
      setShowExerciseModal(true);
    }
  };

  const handleWorkoutComplete = async () => {
    setIsWorkoutActive(false);
    
    // Save workout completion to database - use shortName as workout_type
    const success = await completeWorkout(dayNumber, workoutTemplate.name, workoutTemplate.shortName);
    
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

  const handleGoToTodaysWorkout = () => {
    if (currentDay && currentDay !== dayNumber) {
      navigate(`/workout/${currentDay}`);
    }
  };

  const openAIForExercise = (exerciseName: string) => {
    setSelectedExerciseForAI(exerciseName);
    setIsAIOpen(true);
  };

  const openGeneralAI = () => {
    setSelectedExerciseForAI(undefined);
    setIsAIOpen(true);
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7c57ff] animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading workout...</p>
        </div>
      </div>
    );
  }

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

  const isPastDay = dayNumber < currentDay;
  const isFutureDay = dayNumber > currentDay;

  const getStatusBadge = () => {
    switch (workoutStatus) {
      case "completed":
        return (
          <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </div>
        );
      case "active":
        return (
          <div className="flex items-center gap-2 bg-[#7c57ff]/20 text-[#7c57ff] px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            TODAY
          </div>
        );
      case "preview":
        return (
          <div className="flex items-center gap-2 bg-zinc-500/20 text-zinc-400 px-4 py-2 rounded-full text-sm font-medium">
            <Lock className="w-4 h-4" />
            Coming Soon
          </div>
        );
      case "past":
        return (
          <div className="flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium">
            <Calendar className="w-4 h-4" />
            Missed
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (workoutStatus) {
      case "completed":
        return (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-green-400 font-medium">Great job!</p>
              <p className="text-green-400/70 text-sm">You completed this workout. Keep up the momentum!</p>
            </div>
          </motion.div>
        );
      case "preview":
        return (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-500/10 border border-zinc-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <Calendar className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-zinc-300 font-medium">Coming Soon</p>
              <p className="text-zinc-400 text-sm">Complete Day {currentDay} first to unlock this workout.</p>
            </div>
          </motion.div>
        );
      case "past":
        return (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <Calendar className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-orange-400 font-medium">Missed Workout</p>
              <p className="text-orange-400/70 text-sm">This workout was not completed. You can view the exercises below.</p>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pb-24 overflow-y-auto" role="main" aria-label="Workout list page">
      {/* Header */}
      <header className="relative px-4 pt-6 pb-4">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="absolute left-4 top-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Go back"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] bg-clip-text text-transparent">
              MGP·AI
            </h1>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-3">
          {getStatusBadge()}
        </div>

        {/* Day Number */}
        <p className="text-center text-white/60 text-sm mb-1">Day {dayNumber}</p>

        {/* Workout Title */}
        <h2 className="text-center text-white text-xl font-bold">{workoutName}</h2>
      </header>

      {/* Status Message */}
      <div className="px-4 mb-4">
        {getStatusMessage()}
      </div>

      {/* Exercise Cards */}
      <div className="px-4 py-2 space-y-4">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative bg-gradient-to-br from-[#3a3a5c] via-[#4a4a7c] to-[#5a5a9c] rounded-2xl p-4 overflow-hidden
              ${workoutStatus === "completed" ? "opacity-80" : ""}
              ${workoutStatus === "preview" ? "opacity-60" : ""}
            `}
            data-testid={`card-exercise-${exercise.id}`}
          >
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-4 relative">
              {/* Number Circle */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${workoutStatus === "completed" ? "bg-green-500" : "bg-[#60a5fa]"}
              `}>
                {workoutStatus === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-bold text-lg">{index + 1}</span>
                )}
              </div>

              {/* Exercise Icon & Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="w-4 h-4 text-white/70" />
                  <h3 className="text-white font-semibold text-base">{exercise.name}</h3>
                </div>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <div className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" />
                    <span>{exercise.sets} Sets</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{exercise.time}</span>
                  </div>
                </div>
              </div>

              {/* Action Button - Play for today, Info for others */}
              {canStartWorkout ? (
                <button
                  onClick={() => handleExerciseClick(exercise)}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  aria-label={`Start ${exercise.name}`}
                  data-testid={`button-play-${exercise.id}`}
                >
                  <Play className="w-6 h-6 text-white fill-white" />
                </button>
              ) : (
                <button
                  onClick={() => handleExerciseClick(exercise)}
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={`View details for ${exercise.name}`}
                  data-testid={`button-info-${exercise.id}`}
                >
                  <Info className="w-5 h-5 text-white/70" />
                </button>
              )}

              {/* AI Help Button */}
              <button
                onClick={() => openAIForExercise(exercise.name)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={`Get AI help for ${exercise.name}`}
                data-testid={`button-ai-${exercise.id}`}
              >
                <ChevronRight className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Action Area */}
      <div className="px-4 py-4 space-y-3">
        {/* Start Workout Button - ONLY for today */}
        {canStartWorkout && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleStartWorkout}
            className="w-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#7c57ff]/30"
            data-testid="button-start-workout"
            aria-label="Start workout session"
          >
            <Play className="w-5 h-5 fill-current" aria-hidden="true" />
            Start Workout
          </motion.button>
        )}

        {/* Go to Today's Workout Button - for past/future workouts */}
        {!canStartWorkout && currentDay !== dayNumber && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleGoToTodaysWorkout}
            className="w-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#7c57ff]/30"
            data-testid="button-go-to-today"
          >
            <Play className="w-5 h-5 fill-current" />
            Go to Day {currentDay}
          </motion.button>
        )}
      </div>

      {/* Floating AI Button */}
      <button
        onClick={openGeneralAI}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-lg shadow-[#7c57ff]/50"
        aria-label="Get AI help for workout"
        data-testid="button-workout-ai"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>

      {/* Bottom Navigation Bar */}
      <NavigationBar />

      {/* AI Assistant Modal */}
      <WorkoutAIAssistant
        workoutName={workoutName}
        exercises={exercises.map(e => ({ name: e.name, muscles: e.muscles, sets: e.sets, time: e.time }))}
        currentExercise={selectedExerciseForAI}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Exercise Details Modal (View-only for past/future) */}
      {selectedExercise && (
        <ExerciseDetailsModal
          exercise={selectedExercise}
          isOpen={showExerciseModal}
          onClose={() => {
            setShowExerciseModal(false);
            setSelectedExercise(null);
          }}
        />
      )}
    </div>
  );
}
