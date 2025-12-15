import { useState, useEffect } from "react";
import { X, Check, Timer, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Exercise {
  id: number;
  name: string;
  muscles: string;
  sets: number;
  reps: string;
  time: string;
  difficulty: string;
}

interface WorkoutSessionProps {
  exercises: Exercise[];
  dayNumber: number;
  workoutName: string;
  onComplete: () => void;
  onExit: () => void;
}

export default function WorkoutSession({ exercises, dayNumber, workoutName, onComplete, onExit }: WorkoutSessionProps) {
  const [startTime] = useState(Date.now());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(60);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());

  const currentExercise = exercises[currentExerciseIndex];
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetsCount = completedSets.size;
  const progress = (completedSetsCount / totalSets) * 100;

  useEffect(() => {
    if (isResting && restTimer > 0) {
      const timer = setTimeout(() => setRestTimer(restTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
      setRestTimer(60);
      toast.success("Rest complete! Ready for next set");
    }
  }, [isResting, restTimer]);

  const handleCompleteSet = async () => {
    const setKey = `${currentExerciseIndex}-${currentSet}`;
    setCompletedSets(prev => new Set([...prev, setKey]));
    
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      setIsResting(true);
      toast.success("Great set! Take a 60 second rest");
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setRestTimer(90);
      setIsResting(true);
      toast.success("Exercise complete! Moving to next one");
    } else {
      // Calculate workout duration and estimated calories
      const durationMinutes = Math.round((Date.now() - startTime) / 60000);
      
      toast.success("Workout complete! Amazing job! 🎉");
      onComplete();
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimer(60);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-white font-bold text-lg">Workout in Progress</h2>
          <div className="w-10 h-10" />
        </div>
        
        <div className="mb-2">
          <div className="flex items-center justify-between text-white/90 text-sm mb-1">
            <span>Overall Progress</span>
            <span>{completedSetsCount} / {totalSets} sets</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>
      </div>

      {/* Current Exercise */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center mb-8 relative">
                <div className="absolute inset-4 rounded-full bg-background flex flex-col items-center justify-center">
                  <Timer className="w-12 h-12 text-white mb-2" />
                  <span className="text-white text-4xl font-bold">{restTimer}s</span>
                </div>
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">Rest Time</h3>
              <p className="text-muted-foreground text-center mb-6">Take a breather, you're doing great!</p>
              <button
                onClick={handleSkipRest}
                className="px-8 py-3 bg-muted text-white rounded-full font-semibold hover:bg-muted/80 transition-all"
              >
                Skip Rest
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center text-white font-bold text-xl">
                    {currentExerciseIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-2xl font-bold">{currentExercise.name}</h3>
                    <p className="text-[#7c57ff] text-sm">{currentExercise.muscles}</p>
                  </div>
                  <div className="bg-[#aaf163] text-background text-xs font-bold px-3 py-1 rounded-full">
                    {currentExercise.difficulty}
                  </div>
                </div>
              </div>

              {/* Set Info */}
              <div className="bg-muted rounded-2xl p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground text-sm mb-2">Current Set</p>
                  <p className="text-white text-5xl font-bold">{currentSet} / {currentExercise.sets}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <p className="text-muted-foreground text-xs mb-1">Reps</p>
                    <p className="text-white font-bold text-2xl">{currentExercise.reps}</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <p className="text-muted-foreground text-xs mb-1">Time</p>
                    <p className="text-white font-bold text-2xl">{currentExercise.time}</p>
                  </div>
                </div>
              </div>

              {/* Sets Progress */}
              <div className="bg-muted rounded-2xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-3">Sets Progress</h4>
                <div className="flex gap-2">
                  {Array.from({ length: currentExercise.sets }).map((_, idx) => {
                    const setKey = `${currentExerciseIndex}-${idx + 1}`;
                    const isCompleted = completedSets.has(setKey);
                    const isCurrent = idx + 1 === currentSet;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          isCompleted
                            ? "bg-[#aaf163]"
                            : isCurrent
                            ? "bg-[#7c57ff]"
                            : "bg-background/50"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Next Exercise Preview */}
              {currentExerciseIndex < exercises.length - 1 && currentSet === currentExercise.sets && (
                <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Next Exercise</p>
                    <p className="text-white font-semibold">{exercises[currentExerciseIndex + 1].name}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Set Button */}
      {!isResting && (
        <div className="p-6 bg-background border-t border-border">
          <button
            onClick={handleCompleteSet}
            className="w-full bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <Check className="w-6 h-6" />
            Complete Set {currentSet}
          </button>
        </div>
      )}
    </div>
  );
}
