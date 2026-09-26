import { motion, AnimatePresence } from "framer-motion";

interface InteractiveBodyDiagramProps {
  selectedMuscle: string | null;
  onSelectMuscle: (muscleGroup: string) => void;
  highlightedMuscles?: string[];
}

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#c4553d",
  back: "#6f9fc4",
  shoulders: "#ec8a3f",
  arms: "#7a5bd3",
  legs: "#93b58c",
  core: "#c4553d",
};

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
};

function getMuscleStyle(
  muscleGroup: string,
  selectedMuscle: string | null,
  highlightedMuscles: string[]
) {
  const isSelected = selectedMuscle === muscleGroup;
  const isHighlighted = highlightedMuscles.includes(muscleGroup);
  const color = MUSCLE_COLORS[muscleGroup] || "#e9dcc7";

  if (isSelected) {
    return { fill: color, opacity: 1, filter: `drop-shadow(0 0 6px ${color})` };
  }
  if (isHighlighted) {
    return { fill: color, opacity: 0.6, filter: "none" };
  }
  return { fill: "#e9dcc7", opacity: 0.5, filter: "none" };
}

function MuscleGroup({
  muscleGroup,
  selectedMuscle,
  highlightedMuscles,
  onSelectMuscle,
  children,
  testId,
}: {
  muscleGroup: string;
  selectedMuscle: string | null;
  highlightedMuscles: string[];
  onSelectMuscle: (muscleGroup: string) => void;
  children: React.ReactNode;
  testId: string;
}) {
  const isSelected = selectedMuscle === muscleGroup;
  const style = getMuscleStyle(muscleGroup, selectedMuscle, highlightedMuscles);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectMuscle(muscleGroup);
    }
  };

  return (
    <motion.g
      data-testid={testId}
      role="button"
      tabIndex={0}
      aria-label={MUSCLE_LABELS[muscleGroup]}
      onClick={() => onSelectMuscle(muscleGroup)}
      onKeyDown={handleKeyDown}
      style={{ cursor: "pointer", filter: style.filter }}
      whileTap={{ scale: 1.05 }}
      initial={{ opacity: 1 }}
      animate={
        isSelected
          ? {
              opacity: [1, 0.7, 1],
              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }
          : { opacity: 1 }
      }
    >
      {children}
    </motion.g>
  );
}

export default function InteractiveBodyDiagram({
  selectedMuscle,
  onSelectMuscle,
  highlightedMuscles = [],
}: InteractiveBodyDiagramProps) {
  const s = (muscleGroup: string) =>
    getMuscleStyle(muscleGroup, selectedMuscle, highlightedMuscles);

  return (
    <div className="flex flex-col items-center gap-2" data-testid="interactive-body-diagram">
      <div className="flex justify-center gap-3">
        {/* Front View */}
        <div className="relative flex flex-col items-center">
          <svg width="140" height="220" viewBox="0 0 120 200">
            {/* Head */}
            <ellipse cx="60" cy="18" rx="14" ry="16" fill="#867869" opacity="0.5" />
            {/* Neck */}
            <rect x="54" y="32" width="12" height="10" fill="#867869" opacity="0.5" />

            {/* Shoulders Front */}
            <MuscleGroup
              muscleGroup="shoulders"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-shoulders-front"
            >
              <ellipse cx="32" cy="48" rx="12" ry="8" fill={s("shoulders").fill} opacity={s("shoulders").opacity} />
              <ellipse cx="88" cy="48" rx="12" ry="8" fill={s("shoulders").fill} opacity={s("shoulders").opacity} />
            </MuscleGroup>

            {/* Chest */}
            <MuscleGroup
              muscleGroup="chest"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-chest"
            >
              <path
                d="M38 50 Q60 45 82 50 Q85 65 82 75 Q60 80 38 75 Q35 65 38 50"
                fill={s("chest").fill}
                opacity={s("chest").opacity}
              />
            </MuscleGroup>

            {/* Core */}
            <MuscleGroup
              muscleGroup="core"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-core"
            >
              <rect x="45" y="78" width="30" height="35" rx="4" fill={s("core").fill} opacity={s("core").opacity} />
              <path d="M38 78 L45 78 L45 113 L38 108 Z" fill={s("core").fill} opacity={s("core").opacity} />
              <path d="M82 78 L75 78 L75 113 L82 108 Z" fill={s("core").fill} opacity={s("core").opacity} />
            </MuscleGroup>

            {/* Hip */}
            <ellipse cx="60" cy="120" rx="20" ry="8" fill="#867869" opacity="0.4" />

            {/* Arms Front (Biceps + Forearms) */}
            <MuscleGroup
              muscleGroup="arms"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-arms-front"
            >
              <ellipse cx="26" cy="70" rx="6" ry="18" fill={s("arms").fill} opacity={s("arms").opacity} />
              <ellipse cx="94" cy="70" rx="6" ry="18" fill={s("arms").fill} opacity={s("arms").opacity} />
              <ellipse cx="22" cy="100" rx="5" ry="14" fill={s("arms").fill} opacity={s("arms").opacity} />
              <ellipse cx="98" cy="100" rx="5" ry="14" fill={s("arms").fill} opacity={s("arms").opacity} />
            </MuscleGroup>

            {/* Legs Front (Quads) */}
            <MuscleGroup
              muscleGroup="legs"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-legs-front"
            >
              <ellipse cx="48" cy="150" rx="10" ry="28" fill={s("legs").fill} opacity={s("legs").opacity} />
              <ellipse cx="72" cy="150" rx="10" ry="28" fill={s("legs").fill} opacity={s("legs").opacity} />
            </MuscleGroup>

            {/* Lower Legs (non-interactive) */}
            <ellipse cx="46" cy="190" rx="6" ry="12" fill="#867869" opacity="0.4" />
            <ellipse cx="74" cy="190" rx="6" ry="12" fill="#867869" opacity="0.4" />
          </svg>
          <span className="text-xs text-muted-foreground mt-1">Front</span>
        </div>

        {/* Back View */}
        <div className="relative flex flex-col items-center">
          <svg width="140" height="220" viewBox="0 0 120 200">
            {/* Head */}
            <ellipse cx="60" cy="18" rx="14" ry="16" fill="#867869" opacity="0.5" />
            {/* Neck */}
            <rect x="54" y="32" width="12" height="10" fill="#867869" opacity="0.5" />

            {/* Back (Traps + Upper Back + Lats + Lower Back) */}
            <MuscleGroup
              muscleGroup="back"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-back"
            >
              <path d="M40 40 Q60 35 80 40 L75 55 Q60 50 45 55 Z" fill={s("back").fill} opacity={s("back").opacity} />
              <path
                d="M42 55 Q60 50 78 55 Q80 72 78 80 Q60 85 42 80 Q40 72 42 55"
                fill={s("back").fill}
                opacity={s("back").opacity}
              />
              <path d="M35 60 L42 55 L42 85 L38 90 Z" fill={s("back").fill} opacity={s("back").opacity} />
              <path d="M85 60 L78 55 L78 85 L82 90 Z" fill={s("back").fill} opacity={s("back").opacity} />
              <rect x="45" y="85" width="30" height="25" rx="4" fill={s("back").fill} opacity={s("back").opacity} />
            </MuscleGroup>

            {/* Shoulders Back */}
            <MuscleGroup
              muscleGroup="shoulders"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-shoulders-back"
            >
              <ellipse cx="32" cy="48" rx="12" ry="8" fill={s("shoulders").fill} opacity={s("shoulders").opacity} />
              <ellipse cx="88" cy="48" rx="12" ry="8" fill={s("shoulders").fill} opacity={s("shoulders").opacity} />
            </MuscleGroup>

            {/* Arms Back (Triceps) */}
            <MuscleGroup
              muscleGroup="arms"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-arms-back"
            >
              <ellipse cx="26" cy="70" rx="6" ry="18" fill={s("arms").fill} opacity={s("arms").opacity} />
              <ellipse cx="94" cy="70" rx="6" ry="18" fill={s("arms").fill} opacity={s("arms").opacity} />
            </MuscleGroup>

            {/* Forearms Back (non-interactive) */}
            <ellipse cx="22" cy="100" rx="5" ry="14" fill="#867869" opacity="0.4" />
            <ellipse cx="98" cy="100" rx="5" ry="14" fill="#867869" opacity="0.4" />

            {/* Legs Back (Glutes + Hamstrings + Calves) */}
            <MuscleGroup
              muscleGroup="legs"
              selectedMuscle={selectedMuscle}
              highlightedMuscles={highlightedMuscles}
              onSelectMuscle={onSelectMuscle}
              testId="muscle-legs-back"
            >
              <ellipse cx="50" cy="122" rx="12" ry="10" fill={s("legs").fill} opacity={s("legs").opacity} />
              <ellipse cx="70" cy="122" rx="12" ry="10" fill={s("legs").fill} opacity={s("legs").opacity} />
              <ellipse cx="48" cy="155" rx="10" ry="24" fill={s("legs").fill} opacity={s("legs").opacity} />
              <ellipse cx="72" cy="155" rx="10" ry="24" fill={s("legs").fill} opacity={s("legs").opacity} />
              <ellipse cx="46" cy="188" rx="6" ry="12" fill={s("legs").fill} opacity={s("legs").opacity} />
              <ellipse cx="74" cy="188" rx="6" ry="12" fill={s("legs").fill} opacity={s("legs").opacity} />
            </MuscleGroup>
          </svg>
          <span className="text-xs text-muted-foreground mt-1">Back</span>
        </div>
      </div>

      {/* Selected muscle label */}
      <AnimatePresence mode="wait">
        {selectedMuscle && (
          <motion.div
            key={selectedMuscle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md"
            style={{ backgroundColor: `${MUSCLE_COLORS[selectedMuscle]}20` }}
            data-testid="selected-muscle-label"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: MUSCLE_COLORS[selectedMuscle] }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: MUSCLE_COLORS[selectedMuscle] }}
            >
              {MUSCLE_LABELS[selectedMuscle]} selected
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
