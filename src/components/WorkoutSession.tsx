import { useState, useEffect } from "react";
import { X, Check, Sparkles, SkipForward, Clock, Zap } from "lucide-react";
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
  onCompleteWorkout: (day: number, title: string, workoutType: string) => Promise<boolean>;
}

export default function WorkoutSession({ exercises, dayNumber, workoutName, onComplete, onExit, onCompleteWorkout }: WorkoutSessionProps) {
  const { user } = useAuth();
  const [startTime] = useState(Date.now());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSet, setCompletedSet] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(90);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const isLastSet = currentSet >= currentExercise.sets;
  const isLastExercise = currentExerciseIndex >= exercises.length - 1;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      timer = setTimeout(() => {
        setRestTimeLeft(restTimeLeft - 1);
      }, 1000);
    } else if (isResting && restTimeLeft === 0) {
      advanceToNextSet();
    }
    return () => clearTimeout(timer);
  }, [isResting, restTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const advanceToNextSet = () => {
    setIsResting(false);
    setRestTimeLeft(90);
    setCurrentSet(completedSet + 1);
    setCompletedSet(0);
  };

  const skipRest = () => {
    advanceToNextSet();
  };

  const handleCompleteSet = async () => {
    if (currentSet < currentExercise.sets) {
      setCompletedSet(currentSet);
      setIsResting(true);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedSet(0);
    } else {
      setIsSubmitting(true);
      try {
        const success = await onCompleteWorkout(dayNumber, workoutName, workoutName);
        
        if (!success) {
          console.error('Error saving workout completion');
        } else {
          console.log(`Workout Day ${dayNumber} saved to Supabase successfully`);
        }
      } catch (error) {
        console.error('Error saving workout completion:', error);
      } finally {
        setIsSubmitting(false);
      }
      
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        onComplete();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0e27] z-50 flex flex-col">
      <button
        onClick={onExit}
        className="absolute top-4 left-4 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
        data-testid="button-exit-workout"
        aria-label="Exit workout"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="h-[50vh] relative bg-zinc-900 rounded-b-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {currentExercise.gifUrl ? (
              <img
                src={currentExercise.gifUrl}
                alt={`${currentExercise.name} demonstration`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#7c57ff]/20 flex items-center justify-center">
                    <Zap className="w-10 h-10 text-[#7c57ff]" />
                  </div>
                  <span className="text-zinc-400 text-lg">{currentExercise.name}</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
          <span className="text-white text-sm font-semibold">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentExercise.id}-${currentSet}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-6">
              <h1 className="text-white text-2xl font-bold mb-1" data-testid="text-current-exercise">
                {currentExercise.name}
              </h1>
              <p className="text-[#7c57ff] text-sm font-medium">
                {currentExercise.muscles}
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#setGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(currentSet / currentExercise.sets) * 264} 264`}
                  />
                  <defs>
                    <linearGradient id="setGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c57ff" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-4xl font-bold">{currentSet}</span>
                  <span className="text-zinc-500 text-sm">of {currentExercise.sets}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 mb-auto">
              <div className="bg-white/5 rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Reps</p>
                <p className="text-white text-2xl font-bold">{currentExercise.reps}</p>
              </div>
              <div className="bg-white/5 rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Time</p>
                <p className="text-white text-2xl font-bold">{currentExercise.time}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3 mt-4 pb-safe">
          <button
            onClick={() => setIsAIOpen(true)}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            data-testid="button-ai-assistant"
            aria-label="Ask AI for help with this exercise"
          >
            <Sparkles className="w-6 h-6 text-[#7c57ff]" />
          </button>

          <button
            onClick={handleCompleteSet}
            disabled={isSubmitting || isResting}
            className="flex-1 h-16 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-70 shadow-lg shadow-[#7c57ff]/30"
            data-testid="button-complete-set"
          >
            <Check className="w-6 h-6" />
            {isSubmitting 
              ? "Saving..." 
              : isLastSet && isLastExercise 
                ? "Finish Workout" 
                : `Complete Set ${currentSet}`
            }
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <div className="relative mb-8">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#restGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(restTimeLeft / 90) * 264} 264`}
                  />
                  <defs>
                    <linearGradient id="restGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Clock className="w-8 h-8 text-white/60 mb-2" />
                  <span className="text-white text-5xl font-bold">{formatTime(restTimeLeft)}</span>
                  <span className="text-white/60 text-sm mt-1">Rest Time</span>
                </div>
              </div>

              <p className="text-white text-xl font-semibold mb-2">Set {completedSet} Complete!</p>
              <p className="text-white/60 mb-8">Get ready for Set {completedSet + 1}</p>

              <button
                onClick={skipRest}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto transition-colors"
              >
                <SkipForward className="w-5 h-5" />
                Skip Rest
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-[#7c57ff] to-[#60a5fa] z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
              className="text-center"
            >
              <div className="text-8xl mb-6">🎉</div>
              <h1 className="text-white text-4xl font-bold mb-4">Workout Complete!</h1>
              <p className="text-white/80 text-xl mb-8">Amazing work today!</p>
              
              <div className="flex justify-center gap-6 mb-8">
                <div className="bg-white/20 rounded-2xl px-6 py-4 text-center">
                  <p className="text-white/80 text-sm">XP Earned</p>
                  <p className="text-white text-2xl font-bold">+100</p>
                </div>
                <div className="bg-white/20 rounded-2xl px-6 py-4 text-center">
                  <p className="text-white/80 text-sm">Streak</p>
                  <p className="text-white text-2xl font-bold">12</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExerciseAIAssistant
        exerciseName={currentExercise.name}
        muscleGroups={currentExercise.muscles}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </div>
  );
}
