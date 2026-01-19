import { useState } from "react";
import { X, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import ExerciseAIAssistant from "./ExerciseAIAssistant";

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
  const [isAIOpen, setIsAIOpen] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const isLastSet = currentSet >= currentExercise.sets;
  const isLastExercise = currentExerciseIndex >= exercises.length - 1;

  const handleCompleteSet = async () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
    } else {
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
          }
        } catch (error) {
          console.error('Error saving workout completion:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
      
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* X Button - Top Left Only */}
      <button
        onClick={onExit}
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center hover:bg-zinc-700 transition-colors"
        data-testid="button-exit-workout"
        aria-label="Exit workout"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Video Area - 50% of screen */}
      <div className="h-[50vh] relative bg-zinc-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {currentExercise.gifUrl ? (
              <img
                src={currentExercise.gifUrl}
                alt={`${currentExercise.name} demonstration`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-zinc-600 text-lg">No video available</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Exercise Counter Badge */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-zinc-800/80 backdrop-blur-sm">
          <span className="text-white text-sm font-medium">
            {currentExerciseIndex + 1} / {totalExercises}
          </span>
        </div>
      </div>

      {/* Content Area - Remaining 50% */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentExercise.id}-${currentSet}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {/* Exercise Name - Large and Clear */}
            <div className="text-center mb-8">
              <h1 className="text-white text-3xl font-bold mb-2" data-testid="text-current-exercise">
                {currentExercise.name}
              </h1>
              <p className="text-zinc-500 text-base">
                {currentExercise.muscles}
              </p>
            </div>

            {/* Set Counter - Prominent and Centered */}
            <div className="text-center mb-8">
              <p className="text-[#7c57ff] text-lg font-semibold mb-1">CURRENT SET</p>
              <p className="text-white text-6xl font-bold">
                {currentSet} <span className="text-zinc-600 text-4xl">of {currentExercise.sets}</span>
              </p>
            </div>

            {/* Reps and Time - Clear Display */}
            <div className="flex justify-center gap-16 mb-auto">
              <div className="text-center">
                <p className="text-zinc-500 text-sm uppercase tracking-wider mb-2">Reps</p>
                <p className="text-white text-4xl font-bold">{currentExercise.reps}</p>
              </div>
              <div className="text-center">
                <p className="text-zinc-500 text-sm uppercase tracking-wider mb-2">Rest</p>
                <p className="text-white text-4xl font-bold">{currentExercise.time}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Button Row - AI Assistant and Complete */}
        <div className="flex items-center gap-3 mt-6">
          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAIOpen(true)}
            className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0"
            data-testid="button-ai-assistant"
            aria-label="Ask AI for help with this exercise"
          >
            <Sparkles className="w-6 h-6 text-[#7c57ff]" />
          </button>

          {/* Complete Button - Full Width */}
          <button
            onClick={handleCompleteSet}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-70"
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

      {/* AI Assistant Modal */}
      <ExerciseAIAssistant
        exerciseName={currentExercise.name}
        muscleGroups={currentExercise.muscles}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </div>
  );
}
