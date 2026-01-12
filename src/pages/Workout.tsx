import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, ArrowLeft, Lock, Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";
import { useAuth } from "@/contexts/AuthContext";

interface ValidationResult {
  success: boolean;
  canStart: boolean;
  status: "locked" | "active" | "preview";
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
}

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const dayNumber = id ? parseInt(id, 10) : 1;

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
    },
  ];

  useEffect(() => {
    const validateWorkoutAccess = async () => {
      if (!user) {
        setIsValidating(false);
        setAccessBlocked(true);
        setBlockReason("Please log in to access workouts");
        return;
      }

      try {
        setIsValidating(true);
        const response = await fetch(`/api/progress/validate/${user.id}/${dayNumber}`);
        const data: ValidationResult = await response.json();

        setValidationResult(data);

        if (!data.success || !data.canStart) {
          setAccessBlocked(true);
          if (data.status === "locked") {
            setBlockReason(`This is a past workout (Day ${dayNumber}). You can only complete today's workout (Day ${data.currentDay}).`);
          } else if (data.status === "preview") {
            setBlockReason(`This workout (Day ${dayNumber}) is scheduled for a future date. Today's workout is Day ${data.currentDay}.`);
          } else {
            setBlockReason(data.error || "Unable to access this workout.");
          }
        } else {
          setAccessBlocked(false);
        }
      } catch (error) {
        console.error("Error validating workout access:", error);
        setAccessBlocked(true);
        setBlockReason("Failed to validate workout access. Please try again.");
      } finally {
        setIsValidating(false);
      }
    };

    validateWorkoutAccess();
  }, [user, dayNumber]);

  const handleStartWorkout = () => {
    if (accessBlocked) {
      toast.error("You cannot start this workout");
      return;
    }
    setIsWorkoutActive(true);
    toast.success("Workout started! Good luck!");
  };

  const handleWorkoutComplete = () => {
    setIsWorkoutActive(false);
    toast.success("Workout complete! Great job!");
  };

  const handleWorkoutExit = () => {
    setIsWorkoutActive(false);
    toast.info("Workout paused. Come back anytime!");
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const handleGoToTodaysWorkout = () => {
    if (validationResult?.currentDay) {
      navigate(`/workout/${validationResult.currentDay}`);
    } else {
      navigate("/");
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7c57ff] animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (accessBlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-4">Workout Locked</h1>
          <p className="text-muted-foreground mb-8">{blockReason}</p>
          <div className="flex flex-col gap-3">
            {validationResult?.currentDay && validationResult.currentDay !== dayNumber && (
              <button
                onClick={handleGoToTodaysWorkout}
                className="w-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
                data-testid="button-go-to-today"
              >
                <Play className="w-5 h-5" />
                Go to Day {validationResult.currentDay}
              </button>
            )}
            <button
              onClick={handleGoBack}
              className="w-full bg-muted text-white py-4 rounded-2xl font-semibold"
              data-testid="button-go-back"
            >
              Back to Home
            </button>
          </div>
        </div>
        <NavigationBar />
      </div>
    );
  }

  if (isWorkoutActive) {
    return (
      <WorkoutSession
        exercises={exercises}
        dayNumber={dayNumber}
        workoutName="Back + Front hand"
        onComplete={handleWorkoutComplete}
        onExit={handleWorkoutExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 overflow-y-auto" role="main" aria-label="Workout page">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-muted">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            aria-label="Go back"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">Day {dayNumber}</h1>
            <p className="text-muted-foreground text-sm">Back + Front hand</p>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="px-4 py-4 space-y-4">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedExercise(selectedExercise?.id === exercise.id ? null : exercise)}
            className="bg-muted rounded-2xl overflow-hidden cursor-pointer"
            data-testid={`card-exercise-${exercise.id}`}
          >
            {/* GIF and Basic Info */}
            <div className="flex gap-4 p-4">
              <div className="w-24 h-24 rounded-xl bg-background overflow-hidden flex-shrink-0">
                <img
                  src={exercise.gifUrl}
                  alt={`${exercise.name} demonstration`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-white font-semibold text-lg">{exercise.name}</h3>
                <p className="text-[#7c57ff] text-sm">{exercise.muscles}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {exercise.sets} sets · {exercise.reps}
                </p>
              </div>
              <div className="flex items-center">
                <ChevronRight 
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    selectedExercise?.id === exercise.id ? 'rotate-90' : ''
                  }`} 
                />
              </div>
            </div>

            {/* Expanded Details */}
            {selectedExercise?.id === exercise.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-background/50 px-4 pb-4"
              >
                <div className="pt-4 grid grid-cols-3 gap-3">
                  <div className="bg-background/50 rounded-xl p-3 text-center">
                    <p className="text-muted-foreground text-xs">Sets</p>
                    <p className="text-white font-bold">{exercise.sets}</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-3 text-center">
                    <p className="text-muted-foreground text-xs">Reps</p>
                    <p className="text-white font-bold">{exercise.reps}</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-3 text-center">
                    <p className="text-muted-foreground text-xs">Time</p>
                    <p className="text-white font-bold">{exercise.time}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Start Button */}
      <div className="fixed bottom-20 left-4 right-4">
        <button
          onClick={handleStartWorkout}
          className="w-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
          data-testid="button-start-workout"
          aria-label="Start workout session"
        >
          <Play className="w-5 h-5 fill-current" aria-hidden="true" />
          Start Workout
        </button>
      </div>

      <NavigationBar />
    </div>
  );
}
