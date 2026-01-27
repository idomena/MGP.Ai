import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import JourneyPath from "@/components/JourneyPath";
import SchedulingAIAssistant from "@/components/SchedulingAIAssistant";
import ChangeWorkoutTypeModal from "@/components/ChangeWorkoutTypeModal";
import { useState, useEffect } from "react";
import { BarChart3, CheckCircle, CheckCircle2, Flame, TrendingUp, BarChart, Calendar as CalendarIcon, Target, ChevronDown, Users, Clock, Play, X, Lock, Moon, MessageCircle, RefreshCw, Sparkles, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

export default function Home() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<"weekly" | "quarterly">("weekly");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showSchedulingAI, setShowSchedulingAI] = useState(false);
  const [showChangeType, setShowChangeType] = useState(false);
  const [showStatsExpanded, setShowStatsExpanded] = useState(false);
  const [customSchedule, setCustomSchedule] = useState<Record<number, any>>({});

  const { isLoading: isLoadingOnboarding, needsOnboarding } = useOnboardingStatus();

  // Use hook for all workout progress data - single source of truth
  const {
    dayStatuses,
    currentDay,
    completedDays,
    userStats,
    isLoading: isLoadingProgress,
    error: progressError,
    getWorkoutForDay,
    moveWorkout,
    changeWorkoutType,
  } = useWorkoutProgress();

  useEffect(() => {
    if (!isLoadingOnboarding && needsOnboarding) {
      navigate("/onboarding");
    }
  }, [isLoadingOnboarding, needsOnboarding, navigate]);

  if (isLoadingOnboarding) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#7c57ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  const defaultWorkoutDetails = {
    12: { name: "Chest & Triceps", muscles: "Chest, Triceps", time: "35 min", exercises: 5, focus: "Chest" },
    13: { name: "Back & Biceps", muscles: "Back, Biceps", time: "40 min", exercises: 4, focus: "Back" },
    14: { name: "Legs", muscles: "Quads, Hamstrings", time: "45 min", exercises: 6, focus: "Legs" },
    15: { name: "Shoulders & Core", muscles: "Shoulders, Abs", time: "30 min", exercises: 4, focus: "Shoulders" },
    16: { name: "Back + Front hand", muscles: "Back, Biceps, Forearms", time: "28 min", exercises: 3, focus: "Back" },
  };

  // Merge default schedule with custom schedule
  const workoutDetails = { ...defaultWorkoutDetails, ...customSchedule };

  const handleViewChange = async (view: "weekly" | "quarterly") => {
    if (view === activeView || isTransitioning) return;
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setActiveView(view);
    setIsTransitioning(false);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setShowWorkoutModal(true);
  };

  const handleStartWorkout = (day: number) => {
    navigate(`/workout/${day}`);
  };

  const handleChangeWorkoutType = async (newType: string, newTitle: string) => {
    if (!selectedDay) return false;
    const success = await changeWorkoutType(selectedDay, newType, newTitle);
    if (success) {
      toast.success(`Day ${selectedDay} changed to ${newTitle}`);
    } else {
      toast.error("Failed to change workout type. Please try again.");
    }
    return success;
  };

  const handleRescheduleWorkout = async (fromDay: number, toDay: number) => {
    if (!authUser || fromDay === toDay) return;

    const workoutToMove = workoutDetails[fromDay as keyof typeof workoutDetails];
    if (!workoutToMove) return;

    setCustomSchedule(prev => {
      const updated = { ...prev };
      updated[toDay] = workoutToMove;
      delete updated[fromDay];
      return updated;
    });
    
    toast.success(`Workout moved from Day ${fromDay} to Day ${toDay}!`);
    setShowRescheduleModal(false);
    setShowWorkoutModal(false);
  };

  return (
    <div className="h-screen bg-background flex flex-col" role="main" aria-label="Home page">
      {/* Fixed Top Section */}
      <div className="flex-shrink-0 px-4">
        <MobileHeader />

        {/* Toggle Buttons */}
        <nav className="mt-6" role="tablist" aria-label="Program view selector">
        <div className="bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] rounded-full p-1">
          <div className="flex">
            <button
              role="tab"
              aria-selected={activeView === "weekly"}
              aria-controls="weekly-panel"
              className={`flex-1 ${activeView === "weekly" ? "bg-background" : "bg-transparent"} text-white py-3 px-6 rounded-full text-center font-semibold transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50`}
              onClick={() => handleViewChange("weekly")}
              disabled={isTransitioning}
              data-testid="tab-weekly"
            >
              Weekly Program
            </button>
            <button
              role="tab"
              aria-selected={activeView === "quarterly"}
              aria-controls="quarterly-panel"
              className={`flex-1 ${activeView === "quarterly" ? "bg-background" : "bg-transparent"} text-white py-3 px-6 rounded-full text-center font-semibold transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50`}
              onClick={() => handleViewChange("quarterly")}
              disabled={isTransitioning}
              data-testid="tab-quarterly"
            >
              Quarterly Plan
            </button>
          </div>
        </div>
      </nav>

        {/* Weekly Program Header and Stats - Fixed */}
        {activeView === "weekly" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Your Program
              </h3>
              <button 
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="text-muted-foreground text-sm flex items-center gap-1 hover:text-white transition-colors hover:gap-2"
              >
                View Stats →
              </button>
            </div>

            {/* Floating Stats Button - Expands on tap */}
            <motion.button
              onClick={() => setShowStatsExpanded(!showStatsExpanded)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#2a2a3e] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-3 px-4 py-2.5 mx-auto"
            >
              <AnimatePresence mode="wait">
                {showStatsExpanded ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-[#7c57ff]" />
                      <span className="text-white font-bold text-sm">{userStats.workoutsCompleted}/{userStats.totalWorkouts}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-white font-bold text-sm">{userStats.streak}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-white font-bold text-sm">{userStats.xp.toLocaleString()}</span>
                    </div>
                    <X className="w-4 h-4 text-white/50 ml-1" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="w-5 h-5 text-[#7c57ff]" />
                    <span className="text-white font-semibold text-sm">Stats</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
      {activeView === "quarterly" ? (
        <div className="mt-8 space-y-10">
          {/* Quarter Header - Clean and Bold */}
          <div className="text-center">
            <h1 className="text-white text-4xl font-bold mb-2">Q1 2026</h1>
            <p className="text-zinc-400 text-lg">90-Day Transformation</p>
          </div>

          {/* Main Progress Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(userStats.workoutsCompleted / userStats.totalWorkouts * 100) * 2.64} ${100 * 2.64}`}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c57ff" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white text-5xl font-bold">{Math.round(userStats.workoutsCompleted / userStats.totalWorkouts * 100)}%</span>
                <span className="text-zinc-500 text-sm mt-1">Complete</span>
              </div>
            </div>
            <p className="text-zinc-400 mt-6 text-center">
              Week <span className="text-white font-semibold">{Math.ceil(currentDay / 7)}</span> of {Math.ceil(userStats.totalWorkouts / 7)}
            </p>
          </div>

          {/* Key Stats - Simple Vertical List */}
          <div className="space-y-4">
            {/* Workouts */}
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#7c57ff]/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#7c57ff]" />
                </div>
                <div>
                  <p className="text-white text-lg font-medium">Workouts</p>
                  <p className="text-zinc-500 text-sm">This quarter</p>
                </div>
              </div>
              <p className="text-white text-3xl font-bold">{userStats.workoutsCompleted}<span className="text-zinc-500 text-xl">/{userStats.totalWorkouts}</span></p>
            </div>

            {/* XP */}
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-white text-lg font-medium">XP Earned</p>
                  <p className="text-zinc-500 text-sm">Total this quarter</p>
                </div>
              </div>
              <p className="text-white text-3xl font-bold">{userStats.xp.toLocaleString()}</p>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#aaf163]/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#aaf163]" />
                </div>
                <div>
                  <p className="text-white text-lg font-medium">Current Streak</p>
                  <p className="text-zinc-500 text-sm">Consecutive days</p>
                </div>
              </div>
              <p className="text-white text-3xl font-bold">{userStats.streak}</p>
            </div>

            {/* Consistency */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#60a5fa]/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#60a5fa]" />
                </div>
                <div>
                  <p className="text-white text-lg font-medium">Consistency</p>
                  <p className="text-zinc-500 text-sm">Weekly average</p>
                </div>
              </div>
              <p className="text-white text-3xl font-bold">{currentDay > 0 ? Math.round((userStats.workoutsCompleted / currentDay) * 100) : 0}<span className="text-zinc-500 text-xl">%</span></p>
            </div>
          </div>

          {/* Bottom Spacer */}
          <div className="h-8" />
        </div>
      ) : (
        <>
          {/* Weekly Program View - Only Journey Path scrolls */}
          <div className="mt-4">
            <JourneyPath
              dayStatuses={dayStatuses}
              onDayClick={handleDayClick}
              isLoading={isLoadingProgress}
            />
          </div>
        </>
      )}
      </div>

      {/* Workout Modal */}
      <Dialog open={showWorkoutModal} onOpenChange={setShowWorkoutModal}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md mx-auto">
          <VisuallyHidden>
            <DialogTitle>Workout Details</DialogTitle>
          </VisuallyHidden>
          {selectedDay && (() => {
            const dayStatus = dayStatuses.find(d => d.day === selectedDay);
            const workout = getWorkoutForDay(selectedDay);
            const isCompleted = dayStatus?.status === "completed";
            const isActive = dayStatus?.status === "active";
            const isLocked = dayStatus?.status === "locked";
            
            return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Day {selectedDay}</h3>
                  <p className="text-white/60">{workout.title}</p>
                </div>
                {isCompleted && (
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </div>
                )}
                {isActive && (
                  <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    TODAY
                  </div>
                )}
                {isLocked && (
                  <div className="bg-zinc-500/20 text-zinc-400 px-3 py-1 rounded-full text-sm font-medium">
                    Locked
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/60 text-xs mb-1">Duration</p>
                  <p className="text-white font-semibold">{workout.duration}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/60 text-xs mb-1">Exercises</p>
                  <p className="text-white font-semibold">{workout.exercisesCount}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/60 text-xs mb-1">Workout Type</p>
                <p className="text-white font-semibold">{workout.workoutType}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowWorkoutModal(false);
                    setShowChangeType(true);
                  }}
                  className="bg-[#1a1a2e]/60 backdrop-blur-sm py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 border border-white/10"
                  data-testid="button-change-type-modal"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Change</span>
                </button>
                <button
                  onClick={() => {
                    setShowWorkoutModal(false);
                    setTimeout(() => setShowSchedulingAI(true), 150);
                  }}
                  className="bg-gradient-to-br from-[#7c57ff]/20 to-[#60a5fa]/20 backdrop-blur-sm py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 border border-[#7c57ff]/30"
                  data-testid="button-ai-schedule-modal"
                >
                  <Sparkles className="w-4 h-4 text-[#7c57ff]" />
                  <span className="text-sm">AI Schedule</span>
                </button>
              </div>

              {(() => {
                const isRestDay = workout.workoutType === "rest";
                
                // Completed workouts show completed state
                if (isCompleted) {
                  return (
                    <div className="space-y-3">
                      <div className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                        {isRestDay ? "Rest Day Complete" : "Workout Completed"}
                      </div>
                      <p className="text-white/40 text-center text-sm">
                        {isRestDay ? "You earned this rest!" : "Great job on completing this workout!"}
                      </p>
                    </div>
                  );
                }
                
                // Active rest day - auto-complete message
                if (isActive && isRestDay) {
                  return (
                    <div className="space-y-3">
                      <div className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Moon className="w-5 h-5" />
                        Rest Day - Relax!
                      </div>
                      <p className="text-white/40 text-center text-sm">
                        Take it easy today. Your body needs recovery to grow stronger!
                      </p>
                    </div>
                  );
                }
                
                // Active day shows start button
                if (isActive) {
                  return (
                    <button
                      onClick={() => {
                        setShowWorkoutModal(false);
                        handleStartWorkout(selectedDay);
                      }}
                      className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white"
                      data-testid="button-start-modal"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Start Workout
                    </button>
                  );
                }
                
                // Locked days show locked state
                return (
                  <div className="space-y-3">
                    <div className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-white/10 text-white/40">
                      <Lock className="w-5 h-5" />
                      Locked
                    </div>
                    <p className="text-white/40 text-center text-sm">
                      Complete previous workouts to unlock
                    </p>
                  </div>
                );
              })()}
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Scheduling AI Button */}
      <button
        onClick={() => setShowSchedulingAI(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-lg shadow-[#7c57ff]/30"
        data-testid="button-scheduling-ai"
        aria-label="Open scheduling assistant"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Scheduling AI Assistant */}
      <SchedulingAIAssistant
        isOpen={showSchedulingAI}
        onClose={() => setShowSchedulingAI(false)}
        currentDay={currentDay}
        selectedDay={selectedDay}
        dayStatuses={dayStatuses.map(ds => ({
          day: ds.day,
          title: ds.title,
          workoutType: ds.workoutType,
          date: ds.date,
        }))}
        onMoveWorkout={async (fromDay, toDay) => {
          const success = await moveWorkout(fromDay, toDay);
          if (success) {
            toast.success(`Workout moved from Day ${fromDay} to Day ${toDay}`);
          }
          return success;
        }}
        onSkipWorkout={async (day) => {
          const success = await changeWorkoutType(day, "rest", "Rest Day");
          if (success) {
            toast.success(`Day ${day} is now a Rest Day`);
          }
          return success;
        }}
        onChangeWorkoutType={async (day, newType, newTitle) => {
          const success = await changeWorkoutType(day, newType, newTitle);
          if (success) {
            toast.success(`Day ${day} changed to ${newTitle}`);
          }
          return success;
        }}
      />

      {/* Change Workout Type Modal */}
      {selectedDay && (
        <ChangeWorkoutTypeModal
          isOpen={showChangeType}
          onClose={() => setShowChangeType(false)}
          currentType={getWorkoutForDay(selectedDay).workoutType}
          dayNumber={selectedDay}
          onChangeType={handleChangeWorkoutType}
        />
      )}

      <NavigationBar />
    </div>
  );
}
