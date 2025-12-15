import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect } from "react";
import { BarChart3, CheckCircle, Flame, TrendingUp, BarChart, Calendar as CalendarIcon, Target, ChevronDown, CheckCircle2, Users, Clock, Play, X, Lock, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TodayWorkoutCard, UpcomingWorkoutCard } from "@/components/TodayWorkoutCard";
import { getWorkoutForDay as getWorkoutData } from "@/data/exercises";
import { Badge } from "@/components/ui/badge";

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

    try {
      // Save the moved workout to the new day
      const { error } = await supabase
        .from('workout_schedule')
        .upsert({
          user_id: user.id,
          day_number: toDay,
          workout_name: workoutToMove.name,
          exercises: workoutToMove.exercises,
          duration: workoutToMove.time,
          focus: workoutToMove.focus
        }, {
          onConflict: 'user_id,day_number'
        });

      if (error) {
        console.error('Error rescheduling workout:', error);
        toast.error("Failed to reschedule workout");
      } else {
        toast.success(`Workout moved from Day ${fromDay} to Day ${toDay}!`);
        setShowRescheduleModal(false);
        setShowWorkoutModal(false);
      }
    } catch (error) {
      console.error('Error rescheduling:', error);
      toast.error("Failed to reschedule workout");
    }
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

  // Fetch completed workouts and custom schedule
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch progress from server API (source of truth for day progression)
      await fetchProgress();

      // Fetch custom schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('workout_schedule')
        .select('*')
        .eq('user_id', user.id);

      if (scheduleError) {
        console.error('Error fetching schedule:', scheduleError);
      } else {
        const schedule: Record<number, any> = {};
        scheduleData.forEach(item => {
          schedule[item.day_number] = {
            name: item.workout_name,
            muscles: defaultWorkoutDetails[item.day_number as keyof typeof defaultWorkoutDetails]?.muscles || "Various",
            time: item.duration,
            exercises: item.exercises,
            focus: item.focus
          };
        });
        setCustomSchedule(schedule);
      }
    };

    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('workout_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_completions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchProgress();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_schedule',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      {/* Toggle Buttons */}
      <div className="mt-6">
        <div className="bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] rounded-full p-1">
          <div className="flex">
            <button
              className={`flex-1 ${activeView === "weekly" ? "bg-background" : "bg-transparent"} text-white py-3 px-6 rounded-full text-center font-semibold transition-all duration-300 disabled:opacity-50`}
              onClick={() => handleViewChange("weekly")}
              disabled={isTransitioning}
            >
              Weekly Program
            </button>
            <button
              className={`flex-1 ${activeView === "quarterly" ? "bg-background" : "bg-transparent"} text-white py-3 px-6 rounded-full text-center font-semibold transition-all duration-300 disabled:opacity-50`}
              onClick={() => handleViewChange("quarterly")}
              disabled={isTransitioning}
            >
              Quarterly Plan
            </button>
          </div>
        </div>
      </div>

      {activeView === "quarterly" ? (
        <>
          {/* Q1 2025 Plan Card */}
          <div className="mt-6 bg-gradient-to-br from-[#00c6ff] via-[#60a5fa] to-[#7c57ff] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white text-2xl font-bold">Q1 2025 Plan</h2>
                <p className="text-white/80 text-sm mt-1">January 1, 2025 - March 31, 2025</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Quarter Progress</span>
                <span className="text-white font-bold">15%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Week 3 of 12</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>3 Main Goals</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4" />
                <span>Tap to view months</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            <button className="flex-1 bg-muted text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </button>
            <button className="flex-1 bg-transparent text-muted-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-border">
              <Target className="w-4 h-4" />
              Goals
            </button>
            <button className="flex-1 bg-transparent text-muted-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-border">
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
          </div>

          {/* Key Metrics */}
          <div className="mt-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-[#60a5fa]" />
              Key Metrics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Workouts Completed */}
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#60a5fa]/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#60a5fa]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Workouts Completed</p>
                    <p className="text-white text-2xl font-bold mt-1">16/48</p>
                    <Progress value={33} className="mt-2 h-1.5" />
                  </div>
                </div>
              </div>

              {/* Calories Burned */}
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Calories Burned</p>
                    <p className="text-white text-2xl font-bold mt-1">12,450</p>
                    <Progress value={26} className="mt-2 h-1.5 [&>div]:bg-red-500" />
                  </div>
                </div>
              </div>

              {/* Strength Increase */}
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#aaf163]/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#aaf163]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Strength Increase</p>
                    <p className="text-white text-2xl font-bold mt-1">+15%</p>
                    <Progress value={15} className="mt-2 h-1.5 [&>div]:bg-[#aaf163]" />
                  </div>
                </div>
              </div>

              {/* Consistency Score */}
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Consistency Score</p>
                    <p className="text-white text-2xl font-bold mt-1">8.5/10</p>
                    <Progress value={85} className="mt-2 h-1.5 [&>div]:bg-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Weekly Program View - Visual First */}
          <div className="mt-6 space-y-6">
            {isLoadingProgress ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-[#7c57ff] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Today's Workout - Hero Card */}
                {currentDay && (() => {
                  const todayWorkout = getWorkoutData(currentDay);
                  const todayStatus = dayStatuses.find(d => d.status === "active");
                  const isCompleted = todayStatus?.isCompleted || false;
                  
                  return (
                    <TodayWorkoutCard
                      workout={todayWorkout}
                      onStart={() => handleStartWorkout(currentDay)}
                      isCompleted={isCompleted}
                    />
                  );
                })()}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-white/60 text-xs">Streak</span>
                    </div>
                    <p className="text-white text-xl font-bold">12</p>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-[#aaf163]" />
                      <span className="text-white/60 text-xs">Done</span>
                    </div>
                    <p className="text-white text-xl font-bold">{completedDays.size}/90</p>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-[#7c57ff]" />
                      <span className="text-white/60 text-xs">XP</span>
                    </div>
                    <p className="text-white text-xl font-bold">2,840</p>
                  </motion.div>
                </div>

                {/* Upcoming Workouts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Coming Up</h3>
                    <Link to="/calendar" className="text-[#7c57ff] text-sm flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {currentDay && [1, 2, 3].map((offset) => {
                      const upcomingDay = currentDay + offset;
                      if (upcomingDay > 90) return null;
                      const upcomingWorkout = getWorkoutData(upcomingDay);
                      return (
                        <UpcomingWorkoutCard
                          key={upcomingDay}
                          workout={upcomingWorkout}
                          onClick={() => handleDayClick(upcomingDay)}
                        />
                      );
                    })}
                  </div>
                </motion.div>

                {/* Progress Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">90-Day Progress</h3>
                    <Badge variant="outline" className="border-[#aaf163]/50 text-[#aaf163]">
                      {Math.round((completedDays.size / 90) * 100)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={(completedDays.size / 90) * 100} 
                    className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#7c57ff] [&>div]:to-[#aaf163]" 
                  />
                  <p className="text-white/50 text-sm mt-3">
                    {90 - completedDays.size} workouts remaining
                  </p>
                </motion.div>
              </>
            )}
          </div>
        </>
      )}

      {/* Workout Details Modal */}
      <Dialog open={showWorkoutModal} onOpenChange={setShowWorkoutModal}>
        <DialogContent className="bg-gradient-to-br from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] border-none p-0 max-w-md">
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
