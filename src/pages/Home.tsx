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
  status: "locked" | "active" | "preview";
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
                  <p className="text-white text-sm font-bold">5/5</p>
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-white/60 text-xs">Streak</p>
                  <p className="text-white text-sm font-bold flex items-center gap-1">
                    12 <Flame className="w-3 h-3 text-orange-500" />
                  </p>
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-white/60 text-xs">XP</p>
                  <p className="text-white text-sm font-bold">2,840</p>
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

      {/* Workout Details Modal */}
      <Dialog open={showWorkoutModal} onOpenChange={setShowWorkoutModal}>
        <DialogContent className="bg-gradient-to-br from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] border-none p-0 max-w-md">
          <VisuallyHidden>
            <DialogTitle>Workout Details</DialogTitle>
          </VisuallyHidden>
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-bold">
                  {selectedDay && workoutDetails[selectedDay as keyof typeof workoutDetails]?.name}
                </h2>
                <p className="text-white/80 text-sm mt-1">Day {selectedDay}</p>
              </div>
              <button 
                onClick={() => setShowWorkoutModal(false)}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                <Users className="w-5 h-5 text-[#7c57ff] mx-auto mb-2" />
                <p className="text-muted-foreground text-xs mb-1">Exercises</p>
                <p className="text-white font-bold">
                  {selectedDay && workoutDetails[selectedDay as keyof typeof workoutDetails]?.exercises}
                </p>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-[#60a5fa] mx-auto mb-2" />
                <p className="text-muted-foreground text-xs mb-1">Duration</p>
                <p className="text-white font-bold">
                  {selectedDay && workoutDetails[selectedDay as keyof typeof workoutDetails]?.time}
                </p>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                <Target className="w-5 h-5 text-[#aaf163] mx-auto mb-2" />
                <p className="text-muted-foreground text-xs mb-1">Muscles</p>
                <p className="text-white font-bold text-xs">
                  {selectedDay && workoutDetails[selectedDay as keyof typeof workoutDetails]?.muscles.split(',')[0]}
                </p>
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#7c57ff]" />
                Targeted Muscles
              </h3>
              <p className="text-muted-foreground text-sm">
                {selectedDay && workoutDetails[selectedDay as keyof typeof workoutDetails]?.muscles}
              </p>
            </div>

            {(() => {
              const selectedDayStatus = dayStatuses.find(d => d.day === selectedDay);
              const isActiveDay = selectedDayStatus?.status === "active";
              const isAlreadyCompleted = selectedDayStatus?.isCompleted;
              const canStart = isActiveDay && !isAlreadyCompleted;
              
              return (
                <button 
                  onClick={() => {
                    if (selectedDay && canStart) {
                      handleStartWorkout(selectedDay);
                    } else if (isAlreadyCompleted) {
                      toast.info("You've already completed today's workout!");
                    } else if (!isActiveDay) {
                      toast.error("You can only start today's workout");
                    }
                  }}
                  disabled={!canStart}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform mb-3 ${
                    canStart 
                      ? 'bg-white text-[#7c57ff] hover:scale-105' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {isAlreadyCompleted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Already Completed
                    </>
                  ) : !isActiveDay ? (
                    <>
                      <Lock className="w-5 h-5" />
                      {selectedDayStatus?.status === "locked" ? "Past Workout" : "Future Workout"}
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Start Workout
                    </>
                  )}
                </button>
              );
            })()}

            <button 
              onClick={() => {
                setShowWorkoutModal(false);
                setShowRescheduleModal(true);
              }}
              className="w-full bg-[#2a2a2a] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#3a3a3a] transition-colors"
            >
              📅 Reschedule Workout
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <DialogContent className="bg-gradient-to-br from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] border-none p-0 max-w-md">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-bold">Reschedule Workout</h2>
                <p className="text-white/80 text-sm mt-1">
                  Move Day {selectedDay} to a new day
                </p>
              </div>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">Select Target Day</h3>
              <div className="grid grid-cols-5 gap-3">
                {[12, 13, 14, 15, 16].map((day) => (
                  <button
                    key={day}
                    disabled={day === selectedDay}
                    onClick={() => {
                      if (selectedDay) {
                        handleRescheduleWorkout(selectedDay, day);
                      }
                    }}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                      day === selectedDay
                        ? 'bg-[#1a1a1a] text-muted-foreground cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-white/60 text-sm text-center">
              Click on a day to move this workout
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <NavigationBar />
    </div>
  );
}
