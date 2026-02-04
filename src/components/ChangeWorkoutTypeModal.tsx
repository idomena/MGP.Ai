import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Dumbbell, Heart, Zap, Moon, Activity, Layers } from "lucide-react";

interface ChangeWorkoutTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: string;
  dayNumber: number;
  onChangeType: (newType: string, newTitle: string) => Promise<boolean>;
}

const SINGLE_MUSCLES = [
  { type: "chest", title: "Chest", color: "bg-blue-500" },
  { type: "back", title: "Back", color: "bg-green-500" },
  { type: "shoulders", title: "Shoulders", color: "bg-orange-500" },
  { type: "arms", title: "Arms", color: "bg-cyan-500" },
  { type: "legs", title: "Legs", color: "bg-emerald-500" },
  { type: "core", title: "Core", color: "bg-yellow-500" },
];

const COMBO_WORKOUTS = [
  { type: "chest_shoulders", title: "Chest + Shoulders", color: "bg-gradient-to-r from-blue-500 to-orange-500" },
  { type: "back_arms", title: "Back + Arms", color: "bg-gradient-to-r from-green-500 to-cyan-500" },
  { type: "chest_back", title: "Chest + Back", color: "bg-gradient-to-r from-blue-500 to-green-500" },
  { type: "shoulders_arms", title: "Shoulders + Arms", color: "bg-gradient-to-r from-orange-500 to-cyan-500" },
  { type: "legs_core", title: "Legs + Core", color: "bg-gradient-to-r from-emerald-500 to-yellow-500" },
];

const OTHER_WORKOUTS = [
  { type: "cardio", title: "Cardio", color: "bg-red-500" },
  { type: "full", title: "Full Body", color: "bg-purple-500" },
  { type: "rest", title: "Rest Day", color: "bg-gray-500" },
];

export default function ChangeWorkoutTypeModal({
  isOpen,
  onClose,
  currentType,
  dayNumber,
  onChangeType,
}: ChangeWorkoutTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "combo" | "other">("single");

  useEffect(() => {
    if (isOpen) {
      setSelectedType(null);
      setShowSuccess(false);
      setActiveTab("single");
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedType) return;

    const allWorkouts = [...SINGLE_MUSCLES, ...COMBO_WORKOUTS, ...OTHER_WORKOUTS];
    const selected = allWorkouts.find((t) => t.type === selectedType);
    if (!selected) return;

    setIsLoading(true);
    try {
      const success = await onChangeType(selected.type, selected.title);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedType(null);
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error("Error changing workout type:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentWorkouts = () => {
    switch (activeTab) {
      case "single": return SINGLE_MUSCLES;
      case "combo": return COMBO_WORKOUTS;
      case "other": return OTHER_WORKOUTS;
    }
  };

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
          className="w-full max-w-md bg-[#1a1a2e] rounded-t-3xl sm:rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar for mobile */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-white font-bold text-lg">Change Workout</h2>
              <p className="text-white/50 text-sm">Day {dayNumber}</p>
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
              <h3 className="text-white font-semibold text-lg">Updated!</h3>
            </motion.div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 px-5 mb-4">
                <button
                  onClick={() => setActiveTab("single")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
                    ${activeTab === "single" 
                      ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white" 
                      : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                  data-testid="tab-single"
                >
                  <Dumbbell className="w-4 h-4" />
                  Single
                </button>
                <button
                  onClick={() => setActiveTab("combo")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
                    ${activeTab === "combo" 
                      ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white" 
                      : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                  data-testid="tab-combo"
                >
                  <Layers className="w-4 h-4" />
                  Combo
                </button>
                <button
                  onClick={() => setActiveTab("other")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
                    ${activeTab === "other" 
                      ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white" 
                      : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                  data-testid="tab-other"
                >
                  <Heart className="w-4 h-4" />
                  Other
                </button>
              </div>

              {/* Workout Options */}
              <div className="px-5 pb-4">
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {getCurrentWorkouts().map((workout) => {
                    const isCurrentType = currentType 
                      ? workout.type.toLowerCase() === currentType.toLowerCase()
                      : false;
                    const isSelected = workout.type === selectedType;

                    return (
                      <button
                        key={workout.type}
                        onClick={() => !isCurrentType && setSelectedType(workout.type)}
                        disabled={isCurrentType}
                        className={`
                          relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3
                          ${
                            isCurrentType
                              ? "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
                              : isSelected
                                ? "bg-white/10 border-[#7c57ff] scale-[1.02]"
                                : "bg-white/5 border-transparent hover:bg-white/10 active:scale-95"
                          }
                        `}
                        data-testid={`workout-type-${workout.type}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${workout.color}`}>
                          {workout.type === "rest" ? (
                            <Moon className="w-6 h-6 text-white" />
                          ) : workout.type === "cardio" ? (
                            <Heart className="w-6 h-6 text-white" />
                          ) : workout.type === "full" ? (
                            <Zap className="w-6 h-6 text-white" />
                          ) : workout.type.includes("_") ? (
                            <Layers className="w-6 h-6 text-white" />
                          ) : (
                            <Dumbbell className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <span className={`text-sm font-medium text-center ${isSelected ? "text-white" : "text-white/80"}`}>
                          {workout.title}
                        </span>
                        {isSelected && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7c57ff] flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                        {isCurrentType && (
                          <span className="absolute top-2 right-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/60">
                            Current
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </div>

              {/* Confirm Button */}
              <div className="p-5 pt-2 pb-8 sm:pb-5">
                <button
                  onClick={handleConfirm}
                  disabled={selectedType === null || isLoading}
                  className={`
                    w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all
                    ${
                      selectedType !== null && !isLoading
                        ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-purple-500/30 active:scale-[0.98]"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }
                  `}
                  data-testid="button-confirm-change-type"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirm Change
                    </>
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
