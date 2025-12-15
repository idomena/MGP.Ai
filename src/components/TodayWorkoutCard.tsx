import { motion } from "framer-motion";
import { Play, Clock, Dumbbell, ChevronRight, Flame } from "lucide-react";
import { WorkoutDay } from "@/data/exercises";
import { Badge } from "@/components/ui/badge";

interface TodayWorkoutCardProps {
  workout: WorkoutDay;
  onStart: () => void;
  isCompleted?: boolean;
}

export function TodayWorkoutCard({ workout, onStart, isCompleted = false }: TodayWorkoutCardProps) {
  if (workout.shortName === "Rest") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a]"
      >
        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#aaf163]/20 to-[#10b981]/20 flex items-center justify-center mb-4">
            <span className="text-4xl">🧘</span>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">Rest Day</h3>
          <p className="text-white/60 text-sm">Your body needs recovery. Take it easy today!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl"
      data-testid="card-today-workout"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#7c57ff]/40 via-[#60a5fa]/30 to-[#00c6ff]/40" />
      
      <div className="relative">
        <div className="flex">
          <div className="flex-1 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-[#aaf163] text-background border-none text-xs font-bold">
                TODAY
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white/80 text-xs">
                Day {workout.day}
              </Badge>
            </div>
            
            <h2 className="text-white text-2xl font-bold mb-1">{workout.name}</h2>
            <p className="text-white/70 text-sm mb-4">{workout.focus}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-white/80">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{workout.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <Dumbbell className="w-4 h-4" />
                <span className="text-sm font-medium">{workout.exercises.length} exercises</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">~250 cal</span>
              </div>
            </div>

            {isCompleted ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#aaf163]/20 text-[#aaf163]">
                <span className="text-lg">✓</span>
                <span className="font-semibold">Completed</span>
              </div>
            ) : (
              <button
                onClick={onStart}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-background font-bold hover:bg-white/90 transition-colors shadow-lg"
                data-testid="button-start-today-workout"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Workout
              </button>
            )}
          </div>
          
          <div className="relative w-36 flex-shrink-0">
            {workout.previewGif && (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={workout.previewGif}
                  alt={workout.name}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#7c57ff]/80" />
              </div>
            )}
          </div>
        </div>
        
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <span className="text-white/60 text-sm">Preview exercises</span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {workout.exercises.slice(0, 4).map((exercise, idx) => (
              <div
                key={exercise.id}
                className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/30 border border-white/10"
              >
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1 left-1 text-[10px] text-white font-medium">
                  {idx + 1}
                </span>
              </div>
            ))}
            {workout.exercises.length > 4 && (
              <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-white/60 text-sm font-medium">+{workout.exercises.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function UpcomingWorkoutCard({ workout, onClick }: { workout: WorkoutDay; onClick?: () => void }) {
  if (workout.shortName === "Rest") {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#aaf163]/20 to-[#10b981]/20 flex items-center justify-center">
            <span className="text-xl">🧘</span>
          </div>
          <div>
            <p className="text-white/50 text-xs">Day {workout.day}</p>
            <h4 className="text-white font-medium">Rest Day</h4>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:border-[#7c57ff]/50 transition-colors"
      data-testid={`button-upcoming-day-${workout.day}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black/30">
          {workout.previewGif ? (
            <img
              src={workout.previewGif}
              alt={workout.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#7c57ff]/50 to-[#60a5fa]/50" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/50 text-xs">Day {workout.day}</p>
          <h4 className="text-white font-medium truncate">{workout.name}</h4>
          <p className="text-white/40 text-xs">{workout.duration} • {workout.exercises.length} exercises</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/30" />
      </div>
    </button>
  );
}
