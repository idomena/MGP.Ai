import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import JourneyPath from "@/components/JourneyPath";
import { useState, useEffect } from "react";
import { BarChart3, CheckCircle, CheckCircle2, Flame, TrendingUp, BarChart, Calendar as CalendarIcon, Target, ChevronDown, Users, Clock, Play, X, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DayStatus {
  day: number;
  status: "locked" | "active" | "preview" | "past";
  isCompleted: boolean;
}

export default function Home() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<"weekly" | "quarterly">("weekly");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [customSchedule, setCustomSchedule] = useState<Record<number, any>>({});
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Workout rotation for 90 days (repeating 6-day cycle with rest)
  const workoutRotation = [
    { name: "Chest", shortName: "Chest", muscles: "Chest, Triceps", time: "35 min", exercises: 5, focus: "Chest" },
    { name: "Back", shortName: "Back", muscles: "Back, Biceps", time: "40 min", exercises: 5, focus: "Back" },
    { name: "Legs", shortName: "Legs", muscles: "Quads, Hamstrings, Glutes", time: "45 min", exercises: 6, focus: "Legs" },
    { name: "Shoulders", shortName: "Shoulders", muscles: "Shoulders, Traps", time: "30 min", exercises: 4, focus: "Shoulders" },
    { name: "Arms", shortName: "Arms", muscles: "Biceps, Triceps, Forearms", time: "35 min", exercises: 5, focus: "Arms" },
    { name: "Core", shortName: "Core", muscles: "Abs, Obliques, Lower Back", time: "25 min", exercises: 4, focus: "Core" },
    { name: "Rest Day", shortName: "Rest", muscles: "", time: "0 min", exercises: 0, focus: "Recovery" },
  ];

  const getWorkoutForDay = (day: number) => {
    const index = (day - 1) % workoutRotation.length;
    return workoutRotation[index];
  };

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

  const navigate = useNavigate();

  const handleStartWorkout = (day: number) => {
    navigate(`/workout/${day}`);
  };

  const handleRescheduleWorkout = async (fromDay: number, toDay: number) => {
    if (!user || fromDay === toDay) return;

    const workoutToMove = workoutDetails[fromDay as keyof typeof workoutDetails];
    if (!workoutToMove) return;

    // Update local schedule state
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

  // Fetch progress from server API
  const fetchProgress = async () => {
    if (!user) return;
    
    try {
      setIsLoadingProgress(true);
      const response = await fetch(`/api/progress/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentDay(data.currentDay);
        setDayStatuses(data.dayStatuses);
        setCompletedDays(new Set(data.completedDays));
      } else {
        console.error('Error fetching progress:', data.error);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Fetch progress from server API on mount
  useEffect(() => {
    if (!user) return;
    fetchProgress();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24 px-4 overflow-y-auto" role="main" aria-label="Home page">
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
                  strokeDasharray={`${15 * 2.64} ${100 * 2.64}`}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c57ff" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white text-5xl font-bold">15%</span>
                <span className="text-zinc-500 text-sm mt-1">Complete</span>
              </div>
            </div>
            <p className="text-zinc-400 mt-6 text-center">
              Week <span className="text-white font-semibold">3</span> of 12
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
              <p className="text-white text-3xl font-bold">16<span className="text-zinc-500 text-xl">/48</span></p>
            </div>

            {/* Calories */}
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-white text-lg font-medium">Calories Burned</p>
                  <p className="text-zinc-500 text-sm">Total this quarter</p>
                </div>
              </div>
              <p className="text-white text-3xl font-bold">12.4k</p>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#aaf163]/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#aaf163]" />
                </div>
                <div>
                  <p className="text-white text-lg font-medium">Best Streak</p>
                  <p className="text-zinc-500 text-sm">Consecutive days</p>
                </div>
              </div>
              <p className="text-white text-3xl font-bold">12</p>
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
              <p className="text-white text-3xl font-bold">85<span className="text-zinc-500 text-xl">%</span></p>
            </div>
          </div>

          {/* Bottom Spacer */}
          <div className="h-8" />
        </div>
      ) : (
        <>
          {/* Weekly Program View */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
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

            {/* Weekly Progress Card - Compact */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold text-sm">Weekly Progress</h4>
                <TrendingUp className="w-4 h-4 text-[#7c57ff]" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="backdrop-blur-sm bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-white/60 text-xs">Workouts</p>
                  <p className="text-white font-bold text-lg">{currentDay || 16}/∞</p>
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-white/60 text-xs">Streak</p>
                  <p className="text-white font-bold text-lg">12 🔥</p>
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-white/60 text-xs">XP</p>
                  <p className="text-white font-bold text-lg">2,840 ⚡</p>
                </div>
              </div>
            </motion.div>

            {/* Journey Path */}
            <JourneyPath
              dayStatuses={dayStatuses}
              onDayClick={handleDayClick}
              getWorkoutForDay={getWorkoutForDay}
              isLoading={isLoadingProgress}
            />
          </div>
        </>
      )}

      {/* Workout Modal */}
      <Dialog open={showWorkoutModal} onOpenChange={setShowWorkoutModal}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md mx-auto">
          <VisuallyHidden>
            <DialogTitle>Workout Details</DialogTitle>
          </VisuallyHidden>
          {selectedDay && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Day {selectedDay}</h3>
                  <p className="text-white/60">{getWorkoutForDay(selectedDay).name}</p>
                </div>
                {(() => {
                  const dayStatus = dayStatuses.find(d => d.day === selectedDay);
                  if (dayStatus?.isCompleted) {
                    return (
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        Completed
                      </div>
                    );
                  }
                  if (dayStatus?.status === "past" && !dayStatus?.isCompleted) {
                    return (
                      <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                        Missed
                      </div>
                    );
                  }
                  if (dayStatus?.status === "active") {
                    return (
                      <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                        TODAY
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/60 text-xs mb-1">Duration</p>
                  <p className="text-white font-semibold">{getWorkoutForDay(selectedDay).time}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/60 text-xs mb-1">Exercises</p>
                  <p className="text-white font-semibold">{getWorkoutForDay(selectedDay).exercises}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/60 text-xs mb-1">Target Muscles</p>
                <p className="text-white font-semibold">{getWorkoutForDay(selectedDay).muscles}</p>
              </div>

              {(() => {
                const dayStatus = dayStatuses.find(d => d.day === selectedDay);
                const isLocked = dayStatus?.status === "locked" || dayStatus?.status === "preview";
                const isActive = dayStatus?.status === "active";
                const isPast = dayStatus?.status === "past";
                const isCompleted = dayStatus?.isCompleted;
                const isMissed = isPast && !isCompleted;
                
                // Past days (completed or missed) are view-only - no Start button
                if (isPast) {
                  return (
                    <div className="space-y-3">
                      {isCompleted ? (
                        <div className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle2 className="w-5 h-5" />
                          Workout Completed
                        </div>
                      ) : (
                        <div className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          <X className="w-5 h-5" />
                          Workout Missed
                        </div>
                      )}
                      <p className="text-white/40 text-center text-sm">
                        Past workouts cannot be started
                      </p>
                    </div>
                  );
                }
                
                return (
                  <button
                    onClick={() => {
                      setShowWorkoutModal(false);
                      handleStartWorkout(selectedDay);
                    }}
                    disabled={isLocked}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2
                      ${isLocked 
                        ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white'
                      }
                    `}
                    data-testid="button-start-modal"
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-5 h-5" />
                        {dayStatus?.status === "preview" ? "Coming Soon" : "Locked"}
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        {isActive ? "Start Workout" : "View Workout"}
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <NavigationBar />
    </div>
  );
}
