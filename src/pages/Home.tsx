import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useState } from "react";
import { BarChart3, CheckCircle, Flame, TrendingUp, BarChart, Calendar as CalendarIcon, Target, ChevronDown, CheckCircle2, Clock, Play, X, ChevronLeft, ChevronRight, Plus, Zap, Trophy, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useWorkoutSchedule } from "@/hooks/useWorkoutSchedule";
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { Button } from "@/components/ui/button";

const DraggableWorkoutCard = ({ day, workout, isCompleted, children }: any) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `workout-${day}`,
    data: { day, workout }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      {children}
    </div>
  );
};

const DroppableDay = ({ day, children }: any) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day}`,
    data: { day }
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'bg-primary/10 ring-2 ring-primary rounded-2xl' : ''}`}
    >
      {children}
    </div>
  );
};

// Floating Nutrition Widget Component
const NutritionWidget = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="fixed bottom-24 right-4 z-40"
  >
    <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-2xl max-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center">
          <Utensils className="w-4 h-4 text-accent-green" />
        </div>
        <span className="text-xs text-muted-foreground">Post-Workout Meal</span>
      </div>
      <p className="text-foreground font-semibold text-sm">Grilled Chicken Salad</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-accent-green font-bold text-lg">320 kcal</span>
        <span className="text-xs text-muted-foreground">Perfect for your Back</span>
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<"weekly" | "quarterly">("weekly");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDays, setExtendDays] = useState(7);
  const [draggedWorkout, setDraggedWorkout] = useState<any>(null);

  const {
    workouts,
    completedDays,
    loading,
    currentWeekOffset,
    setCurrentWeekOffset,
    getCurrentWeekDays,
    moveWorkout,
    extendProgram
  } = useWorkoutSchedule(user?.id);

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

  const handleDragStart = (event: any) => {
    const { active } = event;
    setDraggedWorkout(active.data.current);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedWorkout(null);

    if (!over || active.id === over.id) return;

    const fromDay = active.data.current?.day;
    const toDay = over.data.current?.day;

    if (fromDay !== undefined && toDay !== undefined) {
      await moveWorkout(fromDay, toDay);
    }
  };

  const handleExtendProgram = async () => {
    const success = await extendProgram(extendDays);
    if (success) {
      setShowExtendModal(false);
    }
  };

  const weekDays = getCurrentWeekDays();
  const weekStart = startOfWeek(addDays(new Date(), currentWeekOffset * 7));
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to check if a day is a milestone (every 7 days)
  const isMilestone = (day: number) => day % 7 === 0;
  
  // Helper to check if this is today's workout
  const isTodayWorkout = (date: Date) => isToday(date);

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
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#60a5fa]/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#60a5fa]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Workouts Completed</p>
                    <p className="text-white text-2xl font-bold mt-1">{completedDays.size}/48</p>
                    <Progress value={(completedDays.size / 48) * 100} className="mt-2 h-1.5" />
                  </div>
                </div>
              </div>

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
          {/* Weekly Navigation Header */}
          <div className="mt-6 flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Week {currentWeekOffset + 1}</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekOffset(Math.max(0, currentWeekOffset - 1))}
                disabled={currentWeekOffset === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-muted-foreground text-sm">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* S-Curved Vertical Circles Timeline with Drag and Drop */}
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="relative mt-6 pb-6">
              {/* S-Curved connecting path */}
              <svg 
                className="absolute left-0 top-0 w-20 h-full pointer-events-none" 
                preserveAspectRatio="none"
                style={{ minHeight: `${weekDays.length * 120}px` }}
              >
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00c6ff" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#7c57ff" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 40 40 ${weekDays.map((_, idx) => {
                    const y = 40 + idx * 120;
                    const curve = idx % 2 === 0 ? 'C 60' : 'C 20';
                    const nextY = 40 + (idx + 1) * 120;
                    return `${curve} ${y + 30}, ${idx % 2 === 0 ? '20' : '60'} ${y + 90}, 40 ${nextY}`;
                  }).join(' ')}`}
                  fill="none"
                  stroke="url(#pathGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-60"
                />
              </svg>
              
              {weekDays.map((day, idx) => {
                const workout = workouts[day];
                const isCompleted = completedDays.has(day);
                const dayOfWeek = daysOfWeek[idx];
                const date = addDays(weekStart, idx);
                const isToday = isTodayWorkout(date);
                const milestone = isMilestone(day);

                return (
                  <DroppableDay key={day} day={day}>
                    <motion.div
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                      className={`relative mb-8 flex items-start gap-4 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Node Circle with States */}
                      <div className="relative z-10 flex-shrink-0">
                        {/* Glow effect for today */}
                        {isToday && (
                          <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#00c6ff] to-[#7c57ff] animate-pulse blur-md opacity-60" />
                        )}
                        
                        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-accent-green to-green-600' 
                            : isToday
                              ? 'bg-gradient-to-br from-[#00c6ff] to-[#7c57ff] ring-4 ring-[#00c6ff]/30 scale-110'
                              : milestone
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-600'
                                : 'bg-card border-2 border-border'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-8 h-8 text-white" />
                          ) : isToday ? (
                            <Zap className="w-8 h-8 text-white" />
                          ) : milestone ? (
                            <Trophy className="w-7 h-7 text-white" />
                          ) : (
                            <span className="text-muted-foreground font-bold text-lg">{day}</span>
                          )}
                        </div>
                        
                        {/* Today label */}
                        {isToday && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 bg-accent-green text-background text-[10px] font-bold px-2 py-0.5 rounded-full"
                          >
                            TODAY
                          </motion.div>
                        )}
                        
                        {/* Milestone label */}
                        {milestone && !isCompleted && !isToday && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-background text-[10px] font-bold px-2 py-0.5 rounded-full">
                            WEEK {Math.floor(day / 7)}
                          </div>
                        )}
                      </div>

                      {/* Workout Card - Draggable */}
                      <div className="flex-1">
                        <DraggableWorkoutCard day={day} workout={workout} isCompleted={isCompleted}>
                          <div
                            onClick={() => handleDayClick(day)}
                            className={`bg-card rounded-2xl p-4 hover:ring-2 hover:ring-primary transition-all cursor-pointer ${
                              isToday ? 'ring-2 ring-[#00c6ff]/50 shadow-lg shadow-[#00c6ff]/20' : ''
                            } ${isCompleted ? 'opacity-75' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-foreground font-bold text-lg">{workout?.name || 'Rest Day'}</h4>
                                <p className="text-muted-foreground text-sm">{dayOfWeek}, {format(date, 'MMM d')}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isToday ? 'bg-accent-green/20 text-accent-green' : 'text-muted-foreground'
                              }`}>
                                Day {day}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{workout?.time || '0 min'}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {workout?.exercises || 0} exercises
                              </div>
                              <div className="ml-auto">
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                                  {workout?.focus || 'Rest'}
                                </span>
                              </div>
                            </div>

                            {isCompleted && (
                              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-accent-green text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Completed</span>
                              </div>
                            )}

                            {isToday && !isCompleted && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartWorkout(day);
                                }}
                                className="mt-3 w-full bg-gradient-to-r from-accent-green to-green-500 text-background py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Start Workout
                              </motion.button>
                            )}
                          </div>
                        </DraggableWorkoutCard>
                      </div>
                    </motion.div>
                  </DroppableDay>
                );
              })}
            </div>

            <DragOverlay>
              {draggedWorkout ? (
                <div className="bg-card rounded-2xl p-4 opacity-90 shadow-2xl w-64 border border-primary">
                  <h4 className="text-foreground font-semibold">{draggedWorkout.workout?.name}</h4>
                  <p className="text-sm text-muted-foreground">{draggedWorkout.workout?.time}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Extend Program Button */}
          <Button
            onClick={() => setShowExtendModal(true)}
            className="w-full mt-4 bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-foreground hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Extend Program
          </Button>

          {/* Floating Nutrition Widget */}
          <NutritionWidget />
        </>
      )}

      {/* Workout Details Modal */}
      <Dialog open={showWorkoutModal} onOpenChange={setShowWorkoutModal}>
        <DialogContent className="bg-muted border-border max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">
                {workouts[selectedDay!]?.name || 'Rest Day'}
              </h2>
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>Day {selectedDay}</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#60a5fa]">{workouts[selectedDay!]?.exercises || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Exercises</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#7c57ff]">{workouts[selectedDay!]?.time || '0 min'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#aaf163]">{workouts[selectedDay!]?.focus || 'Rest'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Focus</p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Targeted Muscles</h3>
                <p className="text-muted-foreground">{workouts[selectedDay!]?.muscles || 'Full Body Recovery'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (selectedDay !== null) {
                    handleStartWorkout(selectedDay);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Play className="w-4 h-4" />
                Start Workout
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extend Program Modal */}
      <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
        <DialogContent className="bg-muted border-border max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">Extend Program</h2>
              <button
                onClick={() => setShowExtendModal(false)}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-muted-foreground">How many days would you like to add to your program?</p>
              
              <div className="grid grid-cols-3 gap-3">
                {[7, 14, 21, 28].map((days) => (
                  <button
                    key={days}
                    onClick={() => setExtendDays(days)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      extendDays === days
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    <p className="text-2xl font-bold">{days}</p>
                    <p className="text-xs mt-1">{days === 7 ? '1 week' : `${days / 7} weeks`}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleExtendProgram}
              className="w-full bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white"
            >
              Extend Program
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <NavigationBar />
    </div>
  );
}
