import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dumbbell, Clock, Target, X, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import LazyGif from "./LazyGif";

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
  // ExerciseDB enriched fields
  target?: string;
  bodyPart?: string;
  equipmentName?: string;
  secondaryMuscles?: string[];
  instructionsList?: string[];
}

interface ExerciseDetailsModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Beginner:     { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  Intermediate: { bg: "bg-amber-500/15",   text: "text-amber-400",   dot: "bg-amber-400"   },
  Advanced:     { bg: "bg-rose-500/15",    text: "text-rose-400",    dot: "bg-rose-400"    },
};

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default function ExerciseDetailsModal({ exercise, isOpen, onClose }: ExerciseDetailsModalProps) {
  if (!exercise) return null;

  const diff = DIFFICULTY_STYLE[exercise.difficulty] ?? DIFFICULTY_STYLE.Intermediate;

  // Use instructionsList (array from ExerciseDB) when available, else split plain string
  const instructionSteps: string[] =
    exercise.instructionsList && exercise.instructionsList.length > 0
      ? exercise.instructionsList
      : exercise.instructions
        ? exercise.instructions.split(/(?<=[.!?])\s+/).filter(Boolean)
        : [];

  // Muscle badges: target + secondary (up to 3)
  const muscleBadges = [
    exercise.target && capitalize(exercise.target),
    ...(exercise.secondaryMuscles ?? []).slice(0, 3).map(capitalize),
  ].filter(Boolean) as string[];

  const equipmentLabel = exercise.equipmentName
    ? capitalize(exercise.equipmentName)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#13131f] border-white/10 text-white max-w-md mx-auto p-0 overflow-hidden rounded-3xl">
        <VisuallyHidden>
          <DialogTitle>{exercise.name} Details</DialogTitle>
        </VisuallyHidden>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Close"
          data-testid="button-close-modal"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* ── GIF Hero ──────────────────────────────────────────────────────── */}
        <div className="relative w-full h-56 bg-gradient-to-br from-[#1e1e38] to-[#14142a] overflow-hidden">
          {exercise.gifUrl ? (
            <LazyGif
              src={exercise.gifUrl.startsWith('/api/') ? exercise.gifUrl : `/api/proxy-image?url=${encodeURIComponent(exercise.gifUrl)}`}
              alt={`${exercise.name} demonstration`}
              className="w-full h-full"
              objectFit="contain"
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <Dumbbell className="w-16 h-16 text-white/10" />
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="w-16 h-16 text-white/10" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#13131f] via-transparent to-transparent" />
          {/* Body-part chip */}
          {exercise.bodyPart && (
            <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] text-white/80 font-medium capitalize">
              {exercise.bodyPart}
            </div>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="px-5 pb-6 space-y-5 -mt-2">

          {/* Name + difficulty */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight">{exercise.name}</h2>
              <p className="text-white/50 text-sm mt-0.5">{exercise.muscles}</p>
            </div>
            <span className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${diff.bg} ${diff.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {exercise.difficulty}
            </span>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-3 gap-2.5"
          >
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <Dumbbell className="w-4 h-4 text-[#60a5fa] mx-auto mb-1.5" />
              <p className="text-white font-bold text-base">{exercise.sets}</p>
              <p className="text-white/40 text-[11px]">Sets</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <Target className="w-4 h-4 text-[#7c57ff] mx-auto mb-1.5" />
              <p className="text-white font-bold text-sm leading-tight">{exercise.reps}</p>
              <p className="text-white/40 text-[11px]">Reps</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <Clock className="w-4 h-4 text-[#aaf163] mx-auto mb-1.5" />
              <p className="text-white font-bold text-base">{exercise.time}</p>
              <p className="text-white/40 text-[11px]">Duration</p>
            </div>
          </motion.div>

          {/* Muscle + Equipment badges */}
          {(muscleBadges.length > 0 || equipmentLabel) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="flex flex-wrap gap-2"
            >
              {muscleBadges.map((m) => (
                <span
                  key={m}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7c57ff]/12 text-[#a78bfa] text-xs font-medium border border-[#7c57ff]/20"
                >
                  <Target className="w-3 h-3" />
                  {m}
                </span>
              ))}
              {equipmentLabel && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#60a5fa]/10 text-[#60a5fa] text-xs font-medium border border-[#60a5fa]/20">
                  <Dumbbell className="w-3 h-3" />
                  {equipmentLabel}
                </span>
              )}
            </motion.div>
          )}

          {/* How to perform — numbered list */}
          {instructionSteps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#aaf163]" />
                <h3 className="text-white font-semibold text-sm">How to Perform</h3>
              </div>
              <ol className="space-y-3">
                {instructionSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#7c57ff]/20 text-[#a78bfa] text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-white/70 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full bg-white/8 hover:bg-white/12 text-white/80 py-3 rounded-2xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            data-testid="button-close-details"
          >
            <ChevronRight className="w-4 h-4 rotate-90" />
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
