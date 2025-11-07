import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useState } from "react";
import { BarChart3, CheckCircle, Flame, TrendingUp, BarChart, Calendar as CalendarIcon, Target, ChevronDown, CheckCircle2, Clock, Play, X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useWorkoutSchedule } from "@/hooks/useWorkoutSchedule";
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { format, startOfWeek, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";

const DraggableWorkoutCard = ({ day, workout, isCompleted }: any) => {
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
      <div className={`bg-muted rounded-xl p-4 ${isCompleted ? 'ring-2 ring-green-500' : ''} hover:ring-2 hover:ring-primary transition-all`}>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-500 text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed</span>
          </div>
        )}
        <h4 className="text-white font-semibold">{workout?.name || 'Rest Day'}</h4>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {workout?.time || '0 min'}
          </span>
          <span>{workout?.exercises || 0} exercises</span>
        </div>
        <div className="mt-2">
          <span className="text-xs text-primary">{workout?.focus || 'Recovery'}</span>
        </div>
      </div>
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
      className={`p-2 rounded-lg transition-colors ${isOver ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
    >
      {children}
    </div>
  );
};

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
          {/* Weekly Program View */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Week {currentWeekOffset + 1}
              </h3>
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

            {/* Week Date Range */}
            <div className="text-center mb-4">
              <p className="text-muted-foreground text-sm">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </p>
            </div>

            {/* Drag and Drop Weekly Schedule */}
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="space-y-3">
                {weekDays.map((day, idx) => {
                  const workout = workouts[day];
                  const isCompleted = completedDays.has(day);
                  const dayOfWeek = daysOfWeek[idx];
                  const date = addDays(weekStart, idx);

                  return (
                    <div key={day} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{dayOfWeek}</h4>
                          <p className="text-xs text-muted-foreground">{format(date, 'MMM d')}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">Day {day}</span>
                      </div>
                      
                      <DroppableDay day={day}>
                        <div onClick={() => handleDayClick(day)}>
                          <DraggableWorkoutCard
                            day={day}
                            workout={workout}
                            isCompleted={isCompleted}
                          />
                        </div>
                      </DroppableDay>
                    </div>
                  );
                })}
              </div>

              <DragOverlay>
                {draggedWorkout ? (
                  <div className="bg-muted rounded-xl p-4 opacity-90 shadow-xl">
                    <h4 className="text-white font-semibold">{draggedWorkout.workout?.name}</h4>
                    <p className="text-sm text-muted-foreground">{draggedWorkout.workout?.time}</p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Extend Program Button */}
            <Button
              onClick={() => setShowExtendModal(true)}
              className="w-full mt-6 bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Extend Program
            </Button>

            {/* Weekly Stats */}
            <div className="mt-8">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Weekly Progress
              </h3>
              
              <div className="bg-muted rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#60a5fa]/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-[#60a5fa]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl">{Array.from(completedDays).filter(d => weekDays.includes(d)).length}</p>
                      <p className="text-muted-foreground text-sm">Workouts Done</p>
                    </div>
                  </div>
                  <Progress value={(Array.from(completedDays).filter(d => weekDays.includes(d)).length / 7) * 100} className="w-24 h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl">2,340</p>
                      <p className="text-muted-foreground text-sm">Calories Burned</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#aaf163]/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#aaf163]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl">4</p>
                      <p className="text-muted-foreground text-sm">Day Streak</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
