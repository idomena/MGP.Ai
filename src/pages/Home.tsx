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
    className="mt-6"
  >
    <div className="bg-card/90 backdrop-blur-lg border border-border/50 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
          <Utensils className="w-5 h-5 text-accent-green" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Post-Workout Meal</p>
          <p className="text-foreground font-semibold text-sm">Grilled Chicken Salad</p>
        </div>
        <div className="text-right">
          <span className="text-accent-green font-bold">320 kcal</span>
          <p className="text-[10px] text-muted-foreground">Perfect for Back</p>
        </div>
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
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekOffset(Math.max(0, currentWeekOffset - 1))}
                disabled={currentWeekOffset === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <h3 className="text-foreground font-bold text-base">Week {currentWeekOffset + 1}</h3>
                <p className="text-muted-foreground text-xs">
                  {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-accent-green" />
              <span>{completedDays.size}/{weekDays.length}</span>
            </div>
          </div>

          {/* Clean Vertical Timeline */}
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="relative mt-4">
              {/* Vertical connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#00c6ff] via-primary to-[#7c57ff] rounded-full" />
              
              <div className="space-y-4">
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative flex items-start gap-4 pl-1"
                      >
                        {/* Node Circle */}
                        <div className="relative z-10 flex-shrink-0">
                          {isToday && (
                            <div className="absolute inset-0 w-12 h-12 rounded-full bg-primary animate-pulse blur-md opacity-50" />
                          )}
                          
                          <div className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                            isCompleted 
                              ? 'bg-accent-green' 
                              : isToday
                                ? 'bg-gradient-to-br from-[#00c6ff] to-primary ring-2 ring-primary/40'
                                : milestone
                                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                                  : 'bg-card border border-border'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-background" />
                            ) : isToday ? (
                              <Zap className="w-6 h-6 text-white" />
                            ) : milestone ? (
                              <Trophy className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-muted-foreground font-semibold text-sm">{day}</span>
                            )}
                          </div>
                          
                          {isToday && (
                            <span className="absolute -top-1 -right-1 bg-accent-green text-background text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                              NOW
                            </span>
                          )}
                        </div>

                        {/* Workout Card */}
                        <div className="flex-1 min-w-0">
                          <DraggableWorkoutCard day={day} workout={workout} isCompleted={isCompleted}>
                            <div
                              onClick={() => handleDayClick(day)}
                              className={`bg-card rounded-xl p-3 transition-all cursor-pointer ${
                                isToday ? 'ring-1 ring-primary/50 shadow-lg shadow-primary/10' : ''
                              } ${isCompleted ? 'opacity-60' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-foreground font-semibold text-sm truncate">
                                  {workout?.name || 'Rest Day'}
                                </h4>
                                <span className="text-[10px] text-muted-foreground ml-2">
                                  {dayOfWeek}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {workout?.time || '0m'}
                                </span>
                                <span>{workout?.exercises || 0} ex</span>
                                <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                                  {workout?.focus || 'Rest'}
                                </span>
                              </div>

                              {isCompleted && (
                                <div className="mt-2 flex items-center gap-1 text-accent-green text-xs">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Done</span>
                                </div>
                              )}

                              {isToday && !isCompleted && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartWorkout(day);
                                  }}
                                  className="mt-2 w-full bg-accent-green text-background py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
                                >
                                  <Play className="w-4 h-4" />
                                  Start
                                </button>
                              )}
                            </div>
                          </DraggableWorkoutCard>
                        </div>
                      </motion.div>
                    </DroppableDay>
                  );
                })}
              </div>
            </div>

            <DragOverlay>
              {draggedWorkout ? (
                <div className="bg-card rounded-xl p-3 opacity-95 shadow-xl border border-primary">
                  <h4 className="text-foreground font-semibold text-sm">{draggedWorkout.workout?.name}</h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Nutrition Widget */}
          <NutritionWidget />

          {/* Extend Program Button */}
          <Button
            onClick={() => setShowExtendModal(true)}
            variant="outline"
            className="w-full mt-4 border-dashed border-border text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Extend Program
          </Button>
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
