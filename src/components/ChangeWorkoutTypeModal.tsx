import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Dumbbell, Heart, Zap, Moon, Activity, ChevronDown } from "lucide-react";

interface ChangeWorkoutTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: string;
  dayNumber: number;
  onChangeType: (newType: string, newTitle: string) => Promise<boolean>;
}

interface MuscleGroup {
  id: string;
  title: string;
  color: string;
  subOptions?: { id: string; title: string; shortTitle: string }[];
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: "chest", title: "Chest", color: "bg-cozy-sky" },
  { id: "shoulders", title: "Shoulders", color: "bg-cozy-streak" },
  { id: "back", title: "Back", color: "bg-cozy-sage" },
  { 
    id: "arms", 
    title: "Arms", 
    color: "bg-cozy-sky",
    subOptions: [
      { id: "biceps", title: "Front Arm (Biceps)", shortTitle: "Biceps" },
      { id: "triceps", title: "Back Arm (Triceps)", shortTitle: "Triceps" },
    ]
  },
  { id: "legs", title: "Legs", color: "bg-cozy-sage" },
  { id: "core", title: "Core / Abs", color: "bg-cozy-streak" },
];

const OTHER_OPTIONS: MuscleGroup[] = [
  { id: "cardio", title: "Cardio", color: "bg-cozy-danger" },
  { id: "full", title: "Full Body", color: "bg-cozy-primary" },
  { id: "rest", title: "Rest Day", color: "bg-cozy-stone" },
];

export default function ChangeWorkoutTypeModal({
  isOpen,
  onClose,
  currentType,
  dayNumber,
  onChangeType,
}: ChangeWorkoutTypeModalProps) {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [expandedArms, setExpandedArms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedMuscles([]);
      setExpandedArms(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const toggleMuscle = (muscleId: string) => {
    if (OTHER_OPTIONS.find(o => o.id === muscleId)) {
      setSelectedMuscles([muscleId]);
      setExpandedArms(false);
      return;
    }

    const clearedMuscles = selectedMuscles.filter(m => !OTHER_OPTIONS.find(o => o.id === m));
    
    if (muscleId === "arms") {
      setExpandedArms(!expandedArms);
      return;
    }

    if (clearedMuscles.includes(muscleId)) {
      setSelectedMuscles(clearedMuscles.filter(m => m !== muscleId));
    } else {
      setSelectedMuscles([...clearedMuscles, muscleId]);
    }
  };

  const toggleArmOption = (armId: string) => {
    const clearedMuscles = selectedMuscles.filter(m => !OTHER_OPTIONS.find(o => o.id === m));
    
    if (clearedMuscles.includes(armId)) {
      setSelectedMuscles(clearedMuscles.filter(m => m !== armId));
    } else {
      const withoutArms = clearedMuscles.filter(m => m !== "biceps" && m !== "triceps");
      setSelectedMuscles([...withoutArms, armId]);
    }
  };

  const getSelectionSummary = () => {
    if (selectedMuscles.length === 0) return "";
    
    const names = selectedMuscles.map(id => {
      if (id === "biceps") return "Biceps";
      if (id === "triceps") return "Triceps";
      const muscle = [...MUSCLE_GROUPS, ...OTHER_OPTIONS].find(m => m.id === id);
      return muscle?.title || id;
    });
    
    return names.join(" + ");
  };

  const getWorkoutType = () => {
    if (selectedMuscles.length === 0) return "";
    if (selectedMuscles.length === 1) return selectedMuscles[0];
    return selectedMuscles.sort().join("_");
  };

  const handleConfirm = async () => {
    if (selectedMuscles.length === 0) return;

    const workoutType = getWorkoutType();
    const workoutTitle = getSelectionSummary();

    setIsLoading(true);
    try {
      const success = await onChangeType(workoutType, workoutTitle);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedMuscles([]);
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error("Error changing workout type:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    if (type === "rest") return <Moon className="w-6 h-6 text-cozy-ink" />;
    if (type === "cardio") return <Heart className="w-6 h-6 text-cozy-ink" />;
    if (type === "full") return <Zap className="w-6 h-6 text-cozy-ink" />;
    if (type === "legs") return <Activity className="w-6 h-6 text-cozy-ink" />;
    return <Dumbbell className="w-6 h-6 text-cozy-ink" />;
  };

  const isSelected = (id: string) => selectedMuscles.includes(id);
  const hasArmSelection = selectedMuscles.includes("biceps") || selectedMuscles.includes("triceps");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[rgba(59,47,39,0.36)] " onClick={onClose}>
      {/* Spacer to push modal to bottom */}
      <div className="flex-1" />
      
      {/* Modal */}
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full bg-cozy-surface rounded-t-[28px] shadow-cozy-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <div>
            <h2 className="text-cozy-ink font-bold text-xl">Build Your Workout</h2>
            <p className="text-cozy-ink-faint text-base">Day {dayNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-cozy-sunk flex items-center justify-center"
            data-testid="button-close-change-type"
          >
            <X className="w-5 h-5 text-cozy-ink" />
          </button>
        </div>

        {showSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-cozy-sage flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-cozy-ink font-semibold text-xl">Workout Updated!</h3>
          </div>
        ) : (
          <>
            {/* Scrollable content - fixed height */}
            <div className="h-[45vh] overflow-y-auto px-6 py-2">
              {/* Muscle Groups */}
              <div className="space-y-3 mb-5">
                <p className="text-cozy-ink-faint text-sm font-semibold uppercase tracking-wider mb-3">Select Muscle Groups</p>
                
                {MUSCLE_GROUPS.map((muscle) => {
                  const hasSubOptions = !!muscle.subOptions;
                  const muscleSelected = hasSubOptions ? hasArmSelection : isSelected(muscle.id);
                  
                  return (
                    <div key={muscle.id}>
                      <button
                        onClick={() => toggleMuscle(muscle.id)}
                        className={`
                          w-full min-h-[56px] px-4 rounded-2xl border-2 transition-all flex items-center gap-4
                          ${muscleSelected
                            ? "bg-cozy-sunk border-cozy-primary"
                            : "bg-cozy-sunk border-transparent"
                          }
                        `}
                        data-testid={`muscle-${muscle.id}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${muscle.color}`}>
                          {getIconForType(muscle.id)}
                        </div>
                        <span className="flex-1 text-left text-cozy-ink font-semibold text-lg">{muscle.title}</span>
                        
                        {hasSubOptions ? (
                          <ChevronDown className={`w-6 h-6 text-cozy-ink-faint transition-transform ${expandedArms ? "rotate-180" : ""}`} />
                        ) : (
                          <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center
                            ${muscleSelected ? "bg-cozy-primary border-cozy-primary" : "border-cozy-line"}`}>
                            {muscleSelected && <Check className="w-5 h-5 text-cozy-ink" />}
                          </div>
                        )}
                      </button>
                      
                      {/* Arms sub-options */}
                      {hasSubOptions && expandedArms && (
                        <div className="pl-5 pt-2 space-y-2">
                          {muscle.subOptions?.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => toggleArmOption(sub.id)}
                              className={`
                                w-full min-h-[52px] px-4 rounded-xl border-2 flex items-center gap-3
                                ${isSelected(sub.id)
                                  ? "bg-cozy-sky-soft border-cozy-sky"
                                  : "bg-cozy-sunk border-transparent"
                                }
                              `}
                              data-testid={`muscle-${sub.id}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${muscle.color}`}>
                                <Dumbbell className="w-5 h-5 text-cozy-ink" />
                              </div>
                              <span className="flex-1 text-left text-cozy-ink text-base font-medium">{sub.title}</span>
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center
                                ${isSelected(sub.id) ? "bg-cozy-sky-soft border-cozy-sky" : "border-cozy-line"}`}>
                                {isSelected(sub.id) && <Check className="w-4 h-4 text-cozy-ink" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-cozy-sunk" />
                <span className="text-cozy-ink-faint text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-cozy-sunk" />
              </div>

              {/* Other Options */}
              <div className="pb-4">
                <p className="text-cozy-ink-faint text-sm font-semibold uppercase tracking-wider mb-3">Quick Options</p>
                <div className="grid grid-cols-3 gap-3">
                  {OTHER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleMuscle(option.id)}
                      className={`
                        min-h-[90px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2
                        ${isSelected(option.id)
                          ? "bg-cozy-sunk border-cozy-primary"
                          : "bg-cozy-sunk border-transparent"
                        }
                      `}
                      data-testid={`option-${option.id}`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${option.color}`}>
                        {getIconForType(option.id)}
                      </div>
                      <span className="text-sm text-cozy-ink font-medium">{option.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FIXED Bottom Section */}
            <div className="px-6 pt-4 pb-8 bg-cozy-surface border-t border-cozy-line">
              {/* Selection Preview */}
              {selectedMuscles.length > 0 && (
                <div className="p-4 rounded-2xl bg-cozy-primary-soft border border-cozy-line mb-4">
                  <p className="text-cozy-ink-faint text-sm mb-1">Today's workout:</p>
                  <p className="text-cozy-ink font-bold text-lg">{getSelectionSummary()}</p>
                </div>
              )}
              
              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={selectedMuscles.length === 0 || isLoading}
                className={`
                  w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-3
                  ${
                    selectedMuscles.length > 0 && !isLoading
                      ? " bg-cozy-primary text-white"
                      : "bg-cozy-sunk text-cozy-ink-faint"
                  }
                `}
                data-testid="button-confirm-change-type"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-cozy-line border-t-cozy-line rounded-full animate-spin" />
                ) : selectedMuscles.length > 0 ? (
                  <>
                    <Check className="w-6 h-6" />
                    Start Workout
                  </>
                ) : (
                  "Select muscle groups"
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
