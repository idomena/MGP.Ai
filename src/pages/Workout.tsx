import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Clock, Target, Eye, Play, X, ChevronDown, Lock, AlertCircle, Loader2, ArrowLeft, Dumbbell, Flame } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";
import { useAuth } from "@/contexts/AuthContext";
import { ExerciseCard } from "@/components/ExerciseCard";
import { getWorkoutForDay, getExercisesForDay } from "@/data/exercises";
import { Badge } from "@/components/ui/badge";

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

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showDetails, setShowDetails] = useState(false);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>("");
  const [serverDate, setServerDate] = useState<string>("Loading...");

  const dayNumber = id ? parseInt(id, 10) : 1;
  
  // Get workout data from exercise database
  const workoutData = getWorkoutForDay(dayNumber);
  const exercises = getExercisesForDay(dayNumber);

  const workout = {
    id: dayNumber.toString(),
    name: workoutData.name,
    shortName: workoutData.shortName,
    date: serverDate || "Loading...",
    day: `Day ${dayNumber}`,
    exercises: exercises.length,
    duration: workoutData.duration,
    focus: workoutData.focus,
    previewGif: workoutData.previewGif,
    exercisesList: exercises,
  };

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
        
        if (data.formattedDate) {
          setServerDate(data.formattedDate);
        }

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

  const handleViewDetails = (exerciseName: string) => {
    toast.info(`Viewing details for ${exerciseName}`);
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
          <p className="text-white text-lg">Validating workout access...</p>
        </div>
      </div>
    );
  }

  if (accessBlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            {validationResult?.status === "locked" ? (
              <Lock className="w-10 h-10 text-muted-foreground" />
            ) : (
              <AlertCircle className="w-10 h-10 text-amber-500" />
            )}
          </div>
          <h1 className="text-white text-2xl font-bold mb-4">
            {validationResult?.status === "locked" ? "Workout Locked" : "Workout Not Available"}
          </h1>
          <p className="text-muted-foreground mb-8">{blockReason}</p>
          <div className="flex flex-col gap-3">
            {validationResult?.currentDay && validationResult.currentDay !== dayNumber && (
              <button
                onClick={handleGoToTodaysWorkout}
                className="w-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
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

  return (
    <>
      {isWorkoutActive ? (
        <WorkoutSession
          exercises={workout.exercisesList}
          dayNumber={dayNumber}
          workoutName={workout.shortName}
          onComplete={handleWorkoutComplete}
          onExit={handleWorkoutExit}
        />
      ) : (
        <div className="min-h-screen bg-background pb-20 px-4">
          <div className="pt-6">
            <h1 className="text-white text-2xl font-bold text-center mb-6" data-testid="text-workout-name">
              {workout.name}
            </h1>

            <div className="bg-gradient-to-br from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] rounded-3xl p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-white text-2xl font-bold">Day {dayNumber} Workout</h2>
                  <p className="text-white/80 text-sm mt-1">{workout.shortName}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-white" />
                    <p className="text-white/80 text-xs">Exercises</p>
                  </div>
                  <p className="text-white text-2xl font-bold" data-testid="text-exercise-count">{workout.exercises}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-white" />
                    <p className="text-white/80 text-xs">Duration</p>
                  </div>
                  <p className="text-white text-2xl font-bold" data-testid="text-duration">{workout.duration}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-white" />
                    <p className="text-white/80 text-xs">Focus</p>
                  </div>
                  <p className="text-white text-2xl font-bold" data-testid="text-focus">{workout.focus}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleStartWorkout}
                  className="flex-1 bg-white text-[#7c57ff] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-white/90 transition-all hover:scale-105"
                  data-testid="button-start-workout"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Workout
                </button>
                <button 
                  onClick={() => setShowDetails(true)}
                  className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all hover:scale-105"
                  data-testid="button-view-details"
                >
                  <Eye className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Visual Exercise Cards */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Exercises</h3>
                <Badge variant="outline" className="border-white/20 text-white/60">
                  {workout.exercises} total
                </Badge>
              </div>
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>

          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="bg-gradient-to-br from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] border-none p-0 max-w-md">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-white text-2xl font-bold">{workout.shortName}</h2>
                    <p className="text-white/80 text-sm mt-1">{workout.date}</p>
                  </div>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                    <Users className="w-5 h-5 text-[#7c57ff] mx-auto mb-2" />
                    <p className="text-muted-foreground text-xs mb-1">Exercises</p>
                    <p className="text-white font-bold">{workout.exercises}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                    <Clock className="w-5 h-5 text-[#60a5fa] mx-auto mb-2" />
                    <p className="text-muted-foreground text-xs mb-1">Duration</p>
                    <p className="text-white font-bold">{workout.duration}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                    <Target className="w-5 h-5 text-[#aaf163] mx-auto mb-2" />
                    <p className="text-muted-foreground text-xs mb-1">Difficulty</p>
                    <p className="text-white font-bold">High</p>
                  </div>
                </div>

                <button className="w-full bg-[#2a2a2a] text-white py-3 rounded-xl font-semibold flex items-center justify-between px-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#7c57ff]" />
                    <span>Targeted Muscles</span>
                  </div>
                  <ChevronDown className="w-5 h-5" />
                </button>

                <div className="bg-[#2a2a2a] rounded-xl p-4 mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#60a5fa]/20 to-[#7c57ff]/20 flex items-center justify-center">
                      <div className="text-center text-xs text-muted-foreground">
                        Tap to expand
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#7c57ff]"></div>
                        <span className="text-white text-sm">Latissimus Dorsi</span>
                      </div>
                      <span className="text-muted-foreground text-sm">60%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#60a5fa]"></div>
                        <span className="text-white text-sm">Rhomboids</span>
                      </div>
                      <span className="text-muted-foreground text-sm">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#aaf163]"></div>
                        <span className="text-white text-sm">Biceps</span>
                      </div>
                      <span className="text-muted-foreground text-sm">15%</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleStartWorkout}
                  className="w-full bg-white text-[#7c57ff] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mb-3 hover:scale-105 transition-transform"
                  data-testid="button-modal-start-workout"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Workout
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => toast.info("Customize feature coming soon!")}
                    className="bg-[#2a2a2a] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#3a3a3a] transition-colors"
                  >
                    Customize
                  </button>
                  <button 
                    onClick={() => toast.info("Reschedule feature coming soon!")}
                    className="bg-[#2a2a2a] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#3a3a3a] transition-colors"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <NavigationBar />
        </div>
      )}
    </>
  );
}
