import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dumbbell, Clock, Target, X } from "lucide-react";
import { motion } from "framer-motion";

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

interface ExerciseDetailsModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExerciseDetailsModal({ exercise, isOpen, onClose }: ExerciseDetailsModalProps) {
  if (!exercise) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md mx-auto p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{exercise.name} Details</DialogTitle>
        </VisuallyHidden>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Close"
          data-testid="button-close-modal"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Exercise GIF/Video */}
        <div className="relative w-full h-48 bg-gradient-to-br from-[#3a3a5c] to-[#2a2a4c] overflow-hidden">
          <img
            src={exercise.gifUrl}
            alt={`${exercise.name} demonstration`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
          {/* Demo Watermark */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white/80 font-medium">
            Demo Only
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Exercise Name */}
          <div>
            <h2 className="text-xl font-bold text-white">{exercise.name}</h2>
            <p className="text-white/60 text-sm mt-1">{exercise.muscles}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 rounded-xl p-3 text-center"
            >
              <Dumbbell className="w-5 h-5 text-[#60a5fa] mx-auto mb-1" />
              <p className="text-white font-bold">{exercise.sets}</p>
              <p className="text-white/50 text-xs">Sets</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/5 rounded-xl p-3 text-center"
            >
              <Target className="w-5 h-5 text-[#7c57ff] mx-auto mb-1" />
              <p className="text-white font-bold text-sm">{exercise.reps}</p>
              <p className="text-white/50 text-xs">Reps</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 rounded-xl p-3 text-center"
            >
              <Clock className="w-5 h-5 text-[#aaf163] mx-auto mb-1" />
              <p className="text-white font-bold">{exercise.time}</p>
              <p className="text-white/50 text-xs">Duration</p>
            </motion.div>
          </div>

          {/* Difficulty */}
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/60 text-xs mb-1">Difficulty</p>
            <p className="text-white font-medium">{exercise.difficulty}</p>
          </div>

          {/* Instructions */}
          {exercise.instructions && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/5 rounded-xl p-4"
            >
              <h3 className="text-white font-semibold mb-2">How to perform</h3>
              <p className="text-white/70 text-sm leading-relaxed">{exercise.instructions}</p>
            </motion.div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            data-testid="button-close-details"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
