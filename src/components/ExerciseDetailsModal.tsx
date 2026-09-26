import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dumbbell, Clock, Target, X, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Exercise {
  id: number;
  name: string;
  muscles: string;
  sets: number;
  reps: string;
  time: string;
  difficulty: string;
  gif_url?: string;
  instructions?: string;
  // ExerciseDB enriched fields
  target?: string;
  bodyPart?: string;
  equipment?: string;
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
  Beginner: { bg: "bg-cozy-sage-soft", text: "text-cozy-sage-deep", dot: "bg-cozy-sage-soft" },
  Intermediate: { bg: "bg-cozy-streak-soft", text: "text-cozy-streak-deep", dot: "bg-cozy-streak-soft" },
  Advanced: { bg: "bg-cozy-danger-soft", text: "text-cozy-danger", dot: "bg-cozy-danger-soft" },
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
      <DialogContent className="bg-cozy-bg border-cozy-line text-cozy-ink max-w-md mx-auto p-0 overflow-hidden rounded-3xl">
        <VisuallyHidden>
          <DialogTitle>{exercise.name} Details</DialogTitle>
        </VisuallyHidden>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-cozy-surface shadow-cozy-sm flex items-center justify-center hover:bg-cozy-sunk transition-colors"
          aria-label="Close"
          data-testid="button-close-modal"
        >
          <X className="w-4 h-4 text-cozy-ink" />
        </button>

        {/* ── GIF Hero ──────────────────────────────────────────────────────── */}
        <div className="relative w-full h-56 bg-cozy-surface overflow-hidden">
          {exercise.gif_url ? (
            <img
              src={`https://wsrv.nl/?url=${exercise.gif_url}&output=gif`}
              alt={exercise.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="w-16 h-16 text-cozy-ink-faint" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-cozy-bg via-transparent to-transparent" />
          {/* Body-part chip */}
          {exercise.bodyPart && (
            <div className="absolute top-3 left-3 bg-cozy-surface shadow-cozy-sm px-2.5 py-1 rounded-full text-[11px] text-cozy-ink-soft font-medium capitalize">
              {exercise.bodyPart}
            </div>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="px-5 pb-6 space-y-5 -mt-2">

          {/* Name + difficulty */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-cozy-ink leading-tight">{exercise.name}</h2>
              <p className="text-cozy-ink-faint text-sm mt-0.5">{exercise.muscles}</p>
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
            <div className="bg-cozy-sunk rounded-2xl p-3 text-center">
              <Dumbbell className="w-4 h-4 text-cozy-sky-deep mx-auto mb-1.5" />
              <p className="text-cozy-ink font-bold text-base">{exercise.sets}</p>
              <p className="text-cozy-ink-faint text-[11px]">Sets</p>
            </div>
            <div className="bg-cozy-sunk rounded-2xl p-3 text-center">
              <Target className="w-4 h-4 text-cozy-primary mx-auto mb-1.5" />
              <p className="text-cozy-ink font-bold text-sm leading-tight">{exercise.reps}</p>
              <p className="text-cozy-ink-faint text-[11px]">Reps</p>
            </div>
            <div className="bg-cozy-sunk rounded-2xl p-3 text-center">
              <Clock className="w-4 h-4 text-cozy-sage-deep mx-auto mb-1.5" />
              <p className="text-cozy-ink font-bold text-base">{exercise.time}</p>
              <p className="text-cozy-ink-faint text-[11px]">Duration</p>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cozy-primary-soft text-cozy-primary text-xs font-medium border border-cozy-primary-line"
                >
                  <Target className="w-3 h-3" />
                  {m}
                </span>
              ))}
              {equipmentLabel && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cozy-sky-soft text-cozy-sky-deep text-xs font-medium border border-cozy-sky">
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
              className="bg-cozy-sunk rounded-2xl p-4 border border-cozy-line"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-cozy-sage-deep" />
                <h3 className="text-cozy-ink font-semibold text-sm">How to Perform</h3>
              </div>
              <ol className="space-y-3">
                {instructionSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-cozy-primary-soft text-cozy-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-cozy-ink-soft text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full bg-cozy-sunk hover:bg-cozy-line text-cozy-ink-soft py-3 rounded-2xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
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
