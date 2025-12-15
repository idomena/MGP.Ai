import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronDown, ChevronUp, Clock, Dumbbell } from "lucide-react";
import { Exercise } from "@/data/exercises";
import { Badge } from "@/components/ui/badge";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  isActive?: boolean;
  onStart?: () => void;
}

export function ExerciseCard({ exercise, index, isActive = false, onStart }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl border ${
        isActive 
          ? "border-[#7c57ff] bg-gradient-to-br from-[#7c57ff]/20 to-[#60a5fa]/10" 
          : "border-white/10 bg-white/5"
      } backdrop-blur-xl`}
      data-testid={`exercise-card-${exercise.id}`}
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/30">
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className={`w-full h-full object-cover ${isPlaying ? "" : "opacity-50"}`}
            loading="lazy"
          />
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
            data-testid={`button-toggle-gif-${exercise.id}`}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white" />
            )}
          </button>
          <div className="absolute bottom-1 left-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-black/60 text-white border-none">
              {exercise.muscleGroup}
            </Badge>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-white font-semibold text-base leading-tight">{exercise.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-white/60 text-sm">
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  {exercise.sets} sets
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exercise.reps}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              data-testid={`button-expand-${exercise.id}`}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-white/70" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/70" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs border-white/20 text-white/70">
              {exercise.equipment}
            </Badge>
            <Badge variant="outline" className="text-xs border-white/20 text-white/70">
              {exercise.duration}
            </Badge>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/10">
              <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">How to perform:</p>
              <ul className="space-y-1.5">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#7c57ff]/30 flex items-center justify-center flex-shrink-0 text-xs text-[#7c57ff]">
                      {idx + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isActive && onStart && (
        <div className="px-4 pb-4">
          <button
            onClick={onStart}
            className="w-full py-3 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
            data-testid={`button-start-exercise-${exercise.id}`}
          >
            Start Exercise
          </button>
        </div>
      )}
    </motion.div>
  );
}

export function ExerciseCardCompact({ exercise, onClick }: { exercise: Exercise; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-[#7c57ff]/50 transition-colors text-left"
      data-testid={`button-exercise-${exercise.id}`}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black/30">
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{exercise.name}</h4>
          <p className="text-white/50 text-xs mt-0.5">{exercise.sets} sets x {exercise.reps}</p>
        </div>
        <Play className="w-5 h-5 text-[#7c57ff]" />
      </div>
    </button>
  );
}
