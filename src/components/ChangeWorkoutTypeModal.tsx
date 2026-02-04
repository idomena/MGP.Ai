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
  { id: "chest", title: "Chest", color: "bg-blue-500" },
  { id: "shoulders", title: "Shoulders", color: "bg-orange-500" },
  { id: "back", title: "Back", color: "bg-green-500" },
  { 
    id: "arms", 
    title: "Arms", 
    color: "bg-cyan-500",
    subOptions: [
      { id: "biceps", title: "Front Arm (Biceps)", shortTitle: "Biceps" },
      { id: "triceps", title: "Back Arm (Triceps)", shortTitle: "Triceps" },
    ]
  },
  { id: "legs", title: "Legs", color: "bg-emerald-500" },
  { id: "core", title: "Core / Abs", color: "bg-yellow-500" },
];

const OTHER_OPTIONS: MuscleGroup[] = [
  { id: "cardio", title: "Cardio", color: "bg-red-500" },
  { id: "full", title: "Full Body", color: "bg-purple-500" },
  { id: "rest", title: "Rest Day", color: "bg-gray-500" },
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
    // If it's a special option (cardio, full, rest), select only that
    if (OTHER_OPTIONS.find(o => o.id === muscleId)) {
      setSelectedMuscles([muscleId]);
      setExpandedArms(false);
      return;
    }

    // Clear special options when selecting muscle groups
    const clearedMuscles = selectedMuscles.filter(m => !OTHER_OPTIONS.find(o => o.id === m));
    
    // Handle arms specially
    if (muscleId === "arms") {
      setExpandedArms(!expandedArms);
      return;
    }

    // Toggle regular muscle
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
      // Remove other arm options and add this one
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
        }, 1000);
      }
    } catch (err) {
      console.error("Error changing workout type:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    if (type === "rest") return <Moon className="w-5 h-5 text-white" />;
    if (type === "cardio") return <Heart className="w-5 h-5 text-white" />;
    if (type === "full") return <Zap className="w-5 h-5 text-white" />;
    if (type === "legs") return <Activity className="w-5 h-5 text-white" />;
    return <Dumbbell className="w-5 h-5 text-white" />;
  };

  const isSelected = (id: string) => selectedMuscles.includes(id);
  const hasArmSelection = selectedMuscles.includes("biceps") || selectedMuscles.includes("triceps");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#1a1a2e] rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar for mobile */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h2 className="text-white font-bold text-lg">Build Your Workout</h2>
              <p className="text-white/50 text-sm">Day {dayNumber} - Select muscle groups</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              data-testid="button-close-change-type"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg">Workout Updated!</h3>
            </motion.div>
          ) : (
            <>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* Muscle Groups */}
                <div className="space-y-2 mb-4">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Muscle Groups</p>
                  
                  {MUSCLE_GROUPS.map((muscle) => {
                    const hasSubOptions = !!muscle.subOptions;
                    const muscleSelected = hasSubOptions ? hasArmSelection : isSelected(muscle.id);
                    
                    return (
                      <div key={muscle.id}>
                        <button
                          onClick={() => toggleMuscle(muscle.id)}
                          className={`
                            w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3
                            ${muscleSelected
                              ? "bg-white/10 border-[#7c57ff]"
                              : "bg-white/5 border-transparent hover:bg-white/10"
                            }
                          `}
                          data-testid={`muscle-${muscle.id}`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${muscle.color}`}>
                            {getIconForType(muscle.id)}
                          </div>
                          <span className="flex-1 text-left text-white font-medium">{muscle.title}</span>
                          
                          {hasSubOptions ? (
                            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${expandedArms ? "rotate-180" : ""}`} />
                          ) : (
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                              ${muscleSelected ? "bg-[#7c57ff] border-[#7c57ff]" : "border-white/30"}`}>
                              {muscleSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          )}
                        </button>
                        
                        {/* Arms sub-options */}
                        {hasSubOptions && (
                          <AnimatePresence>
                            {expandedArms && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-6 pt-2 space-y-2">
                                  {muscle.subOptions?.map((sub) => (
                                    <button
                                      key={sub.id}
                                      onClick={() => toggleArmOption(sub.id)}
                                      className={`
                                        w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3
                                        ${isSelected(sub.id)
                                          ? "bg-white/10 border-[#7c57ff]"
                                          : "bg-white/5 border-transparent hover:bg-white/10"
                                        }
                                      `}
                                      data-testid={`muscle-${sub.id}`}
                                    >
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${muscle.color}`}>
                                        <Dumbbell className="w-4 h-4 text-white" />
                                      </div>
                                      <span className="flex-1 text-left text-white/90 text-sm">{sub.title}</span>
                                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                        ${isSelected(sub.id) ? "bg-[#7c57ff] border-[#7c57ff]" : "border-white/30"}`}>
                                        {isSelected(sub.id) && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 my-4" />

                {/* Other Options */}
                <div className="space-y-2">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Or Choose</p>
                  <div className="grid grid-cols-3 gap-2">
                    {OTHER_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleMuscle(option.id)}
                        className={`
                          p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                          ${isSelected(option.id)
                            ? "bg-white/10 border-[#7c57ff]"
                            : "bg-white/5 border-transparent hover:bg-white/10"
                          }
                        `}
                        data-testid={`option-${option.id}`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${option.color}`}>
                          {getIconForType(option.id)}
                        </div>
                        <span className="text-xs text-white/80 font-medium">{option.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selection Preview & Confirm */}
              <div className="p-5 pt-3 border-t border-white/10 bg-[#1a1a2e]">
                {selectedMuscles.length > 0 && (
                  <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-xs mb-1">Today's workout:</p>
                    <p className="text-white font-semibold">{getSelectionSummary()}</p>
                  </div>
                )}
                
                <button
                  onClick={handleConfirm}
                  disabled={selectedMuscles.length === 0 || isLoading}
                  className={`
                    w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all
                    ${
                      selectedMuscles.length > 0 && !isLoading
                        ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-purple-500/30 active:scale-[0.98]"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }
                  `}
                  data-testid="button-confirm-change-type"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : selectedMuscles.length > 0 ? (
                    <>
                      <Check className="w-5 h-5" />
                      Confirm Selection
                    </>
                  ) : (
                    "Select muscle groups"
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
