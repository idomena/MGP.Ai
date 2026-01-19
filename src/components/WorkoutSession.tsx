import { useState } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Exercise {
  id: number;
  name: string;
  muscles: string;
  sets: number;
  reps: string;
  time: string;
  difficulty: string;
  gifUrl?: string;
}

interface WorkoutSessionProps {
  exercises: Exercise[];
  dayNumber: number;
  workoutName: string;
  onComplete: () => void;
  onExit: () => void;
}

export default function WorkoutSession({ exercises, dayNumber, workoutName, onComplete, onExit }: WorkoutSessionProps) {
  const { user } = useAuth();
  const [startTime] = useState(Date.now());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const isLastSet = currentSet >= currentExercise.sets;
  const isLastExercise = currentExerciseIndex >= exercises.length - 1;

  const handleCompleteSet = async () => {
    if (currentSet < currentExercise.sets) {
      // Move to next set
      setCurrentSet(currentSet + 1);
      toast.success("Set complete!");
    } else if (currentExerciseIndex < exercises.length - 1) {
      // Move to next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      toast.success("Exercise complete!");
    } else {
      // Workout complete
      const durationMinutes = Math.round((Date.now() - startTime) / 60000);
      const estimatedCalories = Math.round(durationMinutes * 8);
      
      if (user) {
        setIsSubmitting(true);
        try {
          const response = await fetch('/api/progress/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              dayNumber,
              workoutName,
              durationMinutes,
              caloriesBurned: estimatedCalories,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            console.error('Error saving workout completion:', data.error || data.message);
            if (data.message === "Workout already completed") {
              toast.info("This workout was already completed!");
            } else if (response.status === 403) {
              toast.error(data.message || "Cannot complete this workout");
            } else {
              toast.error("Workout completed but couldn't save progress");
            }
          } else {
            toast.success("Workout complete!");
          }
        } catch (error) {
          console.error('Error saving workout completion:', error);
          toast.error("Workout completed but couldn't save progress");
        } finally {
          setIsSubmitting(false);
        }
      }
      
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* X Button - Top Left */}
      <button
        onClick={onExit}
        className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
        data-testid="button-exit-workout"
        aria-label="Exit workout"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Exercise Counter - Top Right */}
      <div className="absolute top-6 right-6 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
        <span className="text-white text-sm font-medium">
          {currentExerciseIndex + 1} / {totalExercises}
        </span>
      </div>

      {/* Large Video Area - 60-70% of screen */}
      <div className="flex-1 flex items-center justify-center p-4" style={{ minHeight: '60vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg aspect-square rounded-3xl overflow-hidden bg-zinc-900"
          >
            {currentExercise.gifUrl ? (
              <img
                src={currentExercise.gifUrl}
                alt={`${currentExercise.name} demonstration`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-zinc-600 text-xl">No video</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exercise Info - Minimal */}
      <div className="px-8 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${currentExercise.id}-${currentSet}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            {/* Exercise Name */}
            <h1 className="text-white text-3xl font-bold mb-2" data-testid="text-current-exercise">
              {currentExercise.name}
            </h1>
            
            {/* Muscle Group */}
            <p className="text-zinc-400 text-lg mb-6">
              {currentExercise.muscles}
            </p>

            {/* Reps and Time - Simple display */}
            <div className="flex justify-center gap-12 mb-2">
              <div>
                <p className="text-zinc-500 text-sm uppercase tracking-wide mb-1">Reps</p>
                <p className="text-white text-2xl font-semibold">{currentExercise.reps}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm uppercase tracking-wide mb-1">Time</p>
                <p className="text-white text-2xl font-semibold">{currentExercise.time}</p>
              </div>
            </div>

            {/* Current Set Indicator */}
            <p className="text-zinc-500 text-sm mt-4">
              Set {currentSet} of {currentExercise.sets}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Complete Button - Bottom */}
      <div className="px-6 pb-8 pt-4">
        <button
          onClick={handleCompleteSet}
          disabled={isSubmitting}
          className="w-full bg-white text-black py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-70"
          data-testid="button-complete-set"
        >
          <Check className="w-6 h-6" />
          {isSubmitting 
            ? "Saving..." 
            : isLastSet && isLastExercise 
              ? "Finish Workout" 
              : "Complete Set"
          }
        </button>
      </div>
    </div>
  );
}
