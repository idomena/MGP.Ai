import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, ArrowLeft, Lock, Loader2, Clock, Dumbbell, ChevronRight, Home, Headphones, MessageCircle, Scan, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutAIAssistant from "@/components/WorkoutAIAssistant";
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
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedExerciseForAI, setSelectedExerciseForAI] = useState<string | undefined>(undefined);

  const dayNumber = id ? parseInt(id, 10) : 1;
  const workoutName = "Back training + Front hand";
  const workoutDate = "16/1/2025";

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
  };

  const handlePlayExercise = (exercise: Exercise) => {
    if (accessBlocked) {
      toast.error("You cannot start this workout");
      return;
    }
    setIsWorkoutActive(true);
  };

  const handleWorkoutComplete = () => {
    setIsWorkoutActive(false);
    toast.success("Workout complete! Great job!");
  };

  const handleWorkoutExit = () => {
    setIsWorkoutActive(false);
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

  if (accessBlocked) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white/60" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-4">Workout Locked</h1>
          <p className="text-white/60 mb-8">{blockReason}</p>
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
              className="w-full bg-white/10 text-white py-4 rounded-2xl font-semibold"
              data-testid="button-go-back"
            >
              Back to Home
            </button>
          </div>
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
      />
    );
  }

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

        {/* Date */}
        <p className="text-center text-white/60 text-sm mb-2">{workoutDate}</p>

        {/* Workout Title */}
        <h2 className="text-center text-white text-xl font-bold">{workoutName}</h2>
      </header>

      {/* Exercise Cards */}
      <div className="px-4 py-4 space-y-4">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-gradient-to-br from-[#3a3a5c] via-[#4a4a7c] to-[#5a5a9c] rounded-2xl p-4 overflow-hidden"
            data-testid={`card-exercise-${exercise.id}`}
          >
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-4 relative">
              {/* Number Circle */}
              <div className="w-10 h-10 rounded-full bg-[#60a5fa] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">{index + 1}</span>
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

              {/* Play Button */}
              <button
                onClick={() => handlePlayExercise(exercise)}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label={`Start ${exercise.name}`}
                data-testid={`button-play-${exercise.id}`}
              >
                <Play className="w-6 h-6 text-white fill-white" />
              </button>

              {/* Arrow Icon */}
              <button
                onClick={() => openAIForExercise(exercise.name)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={`Get AI help for ${exercise.name}`}
                data-testid={`button-info-${exercise.id}`}
              >
                <ChevronRight className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Start All Button */}
      <div className="px-4 py-4">
        <button
          onClick={handleStartWorkout}
          className="w-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#7c57ff]/30"
          data-testid="button-start-workout"
          aria-label="Start workout session"
        >
          <Play className="w-5 h-5 fill-current" aria-hidden="true" />
          Start Workout
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50" role="navigation" aria-label="Workout navigation">
        <div className="relative">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] rounded-t-3xl" />
          
          {/* Content */}
          <div className="relative flex justify-around items-center h-20 px-4">
            {/* Home */}
            <button
              onClick={() => navigate("/")}
              className="flex flex-col items-center justify-center p-2"
              aria-label="Go to Home"
              data-testid="nav-home-workout"
            >
              <Home className="w-6 h-6 text-[#aaf163]" />
            </button>

            {/* AI Assistant - Headphones */}
            <button
              onClick={openGeneralAI}
              className="flex flex-col items-center justify-center p-2"
              aria-label="Open AI workout assistant"
              data-testid="nav-ai-assistant"
            >
              <Headphones className="w-6 h-6 text-white" />
            </button>

            {/* Center Floating Button */}
            <div className="relative -top-6">
              <button
                onClick={openGeneralAI}
                className="w-16 h-16 rounded-full bg-[#7c57ff] flex items-center justify-center shadow-lg shadow-[#7c57ff]/50 border-4 border-[#1a1a2e]"
                aria-label="Chat with AI"
                data-testid="nav-center-chat"
              >
                <MessageCircle className="w-7 h-7 text-white" />
              </button>
            </div>

            {/* Scan */}
            <button
              onClick={() => navigate("/nutrition")}
              className="flex flex-col items-center justify-center p-2"
              aria-label="Scan nutrition"
              data-testid="nav-scan"
            >
              <Scan className="w-6 h-6 text-white" />
            </button>

            {/* More */}
            <button
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center justify-center p-2"
              aria-label="More options"
              data-testid="nav-more-workout"
            >
              <MoreHorizontal className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* AI Assistant Modal */}
      <WorkoutAIAssistant
        workoutName={workoutName}
        exercises={exercises.map(e => ({ name: e.name, muscles: e.muscles, sets: e.sets, time: e.time }))}
        currentExercise={selectedExerciseForAI}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </div>
  );
}
