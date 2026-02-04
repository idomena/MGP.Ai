import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Dumbbell, Heart, Zap, Moon, Activity, ChevronRight, ArrowLeft } from "lucide-react";

interface ChangeWorkoutTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: string;
  dayNumber: number;
  onChangeType: (newType: string, newTitle: string) => Promise<boolean>;
}

interface WorkoutOption {
  type: string;
  title: string;
  color: string;
  subOptions?: { type: string; title: string; description: string }[];
}

const WORKOUT_OPTIONS: WorkoutOption[] = [
  { type: "chest", title: "Chest", color: "bg-blue-500" },
  { type: "back", title: "Back", color: "bg-green-500" },
  { type: "shoulders", title: "Shoulders", color: "bg-orange-500" },
  { 
    type: "arms", 
    title: "Arms", 
    color: "bg-cyan-500",
    subOptions: [
      { type: "biceps", title: "Biceps", description: "Front arm" },
      { type: "triceps", title: "Triceps", description: "Back arm" },
      { type: "arms", title: "Full Arms", description: "Biceps + Triceps" },
    ]
  },
  { 
    type: "legs", 
    title: "Legs", 
    color: "bg-emerald-500",
    subOptions: [
      { type: "quads", title: "Quads", description: "Front legs" },
      { type: "hamstrings", title: "Hamstrings", description: "Back legs" },
      { type: "glutes", title: "Glutes", description: "Butt muscles" },
      { type: "legs", title: "Full Legs", description: "All leg muscles" },
    ]
  },
  { type: "core", title: "Core", color: "bg-yellow-500" },
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
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(null);
      setSelectedTitle(null);
      setShowSuccess(false);
      setExpandedOption(null);
    }
  }, [isOpen]);

  const handleOptionClick = (option: WorkoutOption) => {
    if (option.subOptions) {
      setExpandedOption(option.type);
    } else {
      setSelectedType(option.type);
      setSelectedTitle(option.title);
    }
  };

  const handleSubOptionClick = (subType: string, subTitle: string) => {
    setSelectedType(subType);
    setSelectedTitle(subTitle);
  };

  const handleConfirm = async () => {
    if (!selectedType || !selectedTitle) return;

    setIsLoading(true);
    try {
      const success = await onChangeType(selectedType, selectedTitle);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedType(null);
          setSelectedTitle(null);
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
    if (type === "rest") return <Moon className="w-6 h-6 text-white" />;
    if (type === "cardio") return <Heart className="w-6 h-6 text-white" />;
    if (type === "full") return <Zap className="w-6 h-6 text-white" />;
    if (type === "legs" || type === "quads" || type === "hamstrings" || type === "glutes") 
      return <Activity className="w-6 h-6 text-white" />;
    return <Dumbbell className="w-6 h-6 text-white" />;
  };

  if (!isOpen) return null;

  const expandedOptionData = WORKOUT_OPTIONS.find(o => o.type === expandedOption);

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
            <div className="flex items-center gap-3">
              {expandedOption && (
                <button
                  onClick={() => setExpandedOption(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
              )}
              <div>
                <h2 className="text-white font-bold text-lg">
                  {expandedOption ? expandedOptionData?.title : "Change Workout"}
                </h2>
                <p className="text-white/50 text-sm">Day {dayNumber}</p>
              </div>
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
              {/* Main Options or Sub-Options */}
              <div className="px-5 pb-4">
                <AnimatePresence mode="wait">
                  {expandedOption && expandedOptionData?.subOptions ? (
                    <motion.div
                      key="suboptions"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="space-y-2"
                    >
                      {expandedOptionData.subOptions.map((sub) => {
                        const isSelected = selectedType === sub.type;
                        const isCurrentType = currentType?.toLowerCase() === sub.type.toLowerCase();

                        return (
                          <button
                            key={sub.type}
                            onClick={() => !isCurrentType && handleSubOptionClick(sub.type, sub.title)}
                            disabled={isCurrentType}
                            className={`
                              w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4
                              ${
                                isCurrentType
                                  ? "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
                                  : isSelected
                                    ? "bg-white/10 border-[#7c57ff]"
                                    : "bg-white/5 border-transparent hover:bg-white/10 active:scale-[0.98]"
                              }
                            `}
                            data-testid={`workout-sub-${sub.type}`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${expandedOptionData.color}`}>
                              {getIconForType(sub.type)}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-white font-medium">{sub.title}</p>
                              <p className="text-white/50 text-sm">{sub.description}</p>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#7c57ff] flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {isCurrentType && (
                              <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/60">
                                Current
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mainoptions"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="grid grid-cols-3 gap-3"
                    >
                      {WORKOUT_OPTIONS.map((option) => {
                        const isSelected = selectedType === option.type && !option.subOptions;
                        const isCurrentType = !option.subOptions && currentType?.toLowerCase() === option.type.toLowerCase();
                        const hasSubOptions = !!option.subOptions;

                        return (
                          <button
                            key={option.type}
                            onClick={() => !isCurrentType && handleOptionClick(option)}
                            disabled={isCurrentType}
                            className={`
                              relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                              ${
                                isCurrentType
                                  ? "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
                                  : isSelected
                                    ? "bg-white/10 border-[#7c57ff] scale-[1.02]"
                                    : "bg-white/5 border-transparent hover:bg-white/10 active:scale-95"
                              }
                            `}
                            data-testid={`workout-type-${option.type}`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.color}`}>
                              {getIconForType(option.type)}
                            </div>
                            <span className="text-sm font-medium text-white/80 text-center">
                              {option.title}
                            </span>
                            {hasSubOptions && (
                              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            )}
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7c57ff] flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
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
                      {selectedTitle ? `Change to ${selectedTitle}` : "Select a workout"}
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
