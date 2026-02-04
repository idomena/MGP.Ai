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
    if (type === "rest") return <Moon className="w-6 h-6 text-white" />;
    if (type === "cardio") return <Heart className="w-6 h-6 text-white" />;
    if (type === "full") return <Zap className="w-6 h-6 text-white" />;
    if (type === "legs") return <Activity className="w-6 h-6 text-white" />;
    return <Dumbbell className="w-6 h-6 text-white" />;
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
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-full max-w-lg bg-[#1a1a2e] rounded-t-[28px] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-white font-bold text-xl">Build Your Workout</h2>
              <p className="text-white/50 text-base mt-0.5">Day {dayNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
              data-testid="button-close-change-type"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 flex flex-col items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-5 shadow-lg shadow-green-500/30"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-white font-semibold text-xl">Workout Updated!</h3>
            </motion.div>
          ) : (
            <>
              {/* Scrollable content */}
              <div className="overflow-y-auto px-6 py-2 overscroll-contain" style={{ maxHeight: 'calc(70vh - 180px)' }}>
                {/* Muscle Groups */}
                <div className="space-y-3 mb-5">
                  <p className="text-white/40 text-sm font-semibold uppercase tracking-wider mb-4">Select Muscle Groups</p>
                  
                  {MUSCLE_GROUPS.map((muscle) => {
                    const hasSubOptions = !!muscle.subOptions;
                    const muscleSelected = hasSubOptions ? hasArmSelection : isSelected(muscle.id);
                    
                    return (
                      <div key={muscle.id}>
                        <button
                          onClick={() => toggleMuscle(muscle.id)}
                          className={`
                            w-full min-h-[56px] px-4 rounded-2xl border-2 transition-all flex items-center gap-4 active:scale-[0.98]
                            ${muscleSelected
                              ? "bg-white/10 border-[#7c57ff] shadow-lg shadow-purple-500/10"
                              : "bg-white/5 border-transparent active:bg-white/10"
                            }
                          `}
                          data-testid={`muscle-${muscle.id}`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${muscle.color} shadow-lg`}>
                            {getIconForType(muscle.id)}
                          </div>
                          <span className="flex-1 text-left text-white font-semibold text-lg">{muscle.title}</span>
                          
                          {hasSubOptions ? (
                            <motion.div
                              animate={{ rotate: expandedArms ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-6 h-6 text-white/50" />
                            </motion.div>
                          ) : (
                            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
                              ${muscleSelected ? "bg-[#7c57ff] border-[#7c57ff]" : "border-white/30"}`}>
                              {muscleSelected && <Check className="w-5 h-5 text-white" />}
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
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="pl-5 pt-3 space-y-2">
                                  {muscle.subOptions?.map((sub) => (
                                    <motion.button
                                      key={sub.id}
                                      initial={{ x: -10, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ duration: 0.2 }}
                                      onClick={() => toggleArmOption(sub.id)}
                                      className={`
                                        w-full min-h-[52px] px-4 rounded-xl border-2 transition-all flex items-center gap-3 active:scale-[0.98]
                                        ${isSelected(sub.id)
                                          ? "bg-cyan-500/20 border-cyan-400"
                                          : "bg-white/5 border-transparent active:bg-white/10"
                                        }
                                      `}
                                      data-testid={`muscle-${sub.id}`}
                                    >
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${muscle.color}`}>
                                        <Dumbbell className="w-5 h-5 text-white" />
                                      </div>
                                      <span className="flex-1 text-left text-white text-base font-medium">{sub.title}</span>
                                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                        ${isSelected(sub.id) ? "bg-cyan-400 border-cyan-400" : "border-white/30"}`}>
                                        {isSelected(sub.id) && <Check className="w-4 h-4 text-white" />}
                                      </div>
                                    </motion.button>
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
                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-sm font-medium">OR</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Other Options */}
                <div className="pb-4">
                  <p className="text-white/40 text-sm font-semibold uppercase tracking-wider mb-4">Quick Options</p>
                  <div className="grid grid-cols-3 gap-3">
                    {OTHER_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleMuscle(option.id)}
                        className={`
                          min-h-[100px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 active:scale-[0.96]
                          ${isSelected(option.id)
                            ? "bg-white/10 border-[#7c57ff] shadow-lg shadow-purple-500/10"
                            : "bg-white/5 border-transparent active:bg-white/10"
                          }
                        `}
                        data-testid={`option-${option.id}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.color} shadow-lg`}>
                          {getIconForType(option.id)}
                        </div>
                        <span className="text-sm text-white font-semibold">{option.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Section - Fixed */}
              <div className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-white/10 bg-[#1a1a2e] relative z-10">
                {/* Selection Preview */}
                {selectedMuscles.length > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7c57ff]/20 to-[#60a5fa]/20 border border-white/10 mb-4">
                    <p className="text-white/50 text-sm mb-1">Today's workout:</p>
                    <p className="text-white font-bold text-lg">{getSelectionSummary()}</p>
                  </div>
                )}
                
                {/* Confirm Button */}
                <button
                  onClick={handleConfirm}
                  disabled={selectedMuscles.length === 0 || isLoading}
                  style={{ touchAction: 'manipulation' }}
                  className={`
                    w-full min-h-[56px] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                    ${
                      selectedMuscles.length > 0 && !isLoading
                        ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-xl shadow-purple-500/30 active:opacity-80"
                        : "bg-white/10 text-white/40"
                    }
                  `}
                  data-testid="button-confirm-change-type"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : selectedMuscles.length > 0 ? (
                    <>
                      <Check className="w-6 h-6" />
                      Start Workout
                    </>
                  ) : (
                    "Select muscle groups to start"
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
