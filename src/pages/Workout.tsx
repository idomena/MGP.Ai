import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  ArrowLeft,
  Lock,
  Clock,
  Dumbbell,
  Target,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Eye,
  Calendar,
  CalendarDays,
} from "lucide-react";
import NavigationBar from "@/components/NavigationBar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutAIAssistant from "@/components/WorkoutAIAssistant";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import MuscleAnatomyDiagram from "@/components/MuscleAnatomyDiagram";
import RescheduleModal from "@/components/RescheduleModal";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { useExercises } from "@/hooks/useExercises";
import {
  getExercisesForWorkoutType,
  type Exercise,
} from "@/data/workoutExercises";

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    completeWorkout,
    swapWorkouts,
    currentDay: programCurrentDay,
    completedDays,
    dayStatuses,
    getWorkoutForDay,
  } = useWorkoutProgress();

  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  const dayNumber = id ? parseInt(id, 10) : 1;

  const workoutTemplate = getWorkoutForDay(dayNumber);
  const workoutName = workoutTemplate.title;

  const { data: dbExercises } = useExercises(
    workoutTemplate.workoutType,
    dayNumber,
  );
  const exercises =
    dbExercises && dbExercises.length > 0
      ? dbExercises
      : getExercisesForWorkoutType(workoutTemplate.workoutType, dayNumber);

  const currentDay = programCurrentDay || 1;
  const isToday = dayNumber === currentDay;
  const isCompleted = completedDays.includes(dayNumber);
  const isPast = dayNumber < currentDay;
  const canStartWorkout = isToday && !isCompleted;

  const workoutStatus: "completed" | "active" | "locked" | "missed" = isCompleted
    ? "completed"
    : isToday
      ? "active"
      : isPast
        ? "missed"
        : "locked";

  const totalDuration = useMemo(() => {
    return exercises.reduce((sum, ex) => {
      const minutes = parseInt(ex.time) || 5;
      return sum + minutes;
    }, 0);
  }, [exercises]);

  const focusArea = useMemo(() => {
    const type = workoutTemplate.workoutType.toLowerCase();
    if (type === "upper") return "Upper Body";
    if (type === "lower") return "Lower Body";
    if (type === "full") return "Full Body";
    if (type === "cardio") return "Cardio";
    if (type === "rest") return "Recovery";
    return type.charAt(0).toUpperCase() + type.slice(1);
  }, [workoutTemplate.workoutType]);

  const targetedMuscles = useMemo(() => {
    const allMuscles = exercises.map(ex => ex.muscles).join(", ");
    const muscleArray = allMuscles.split(/,\s*/).map(m => m.trim()).filter(m => m);
    const uniqueMuscles = [...new Set(muscleArray)];
    return uniqueMuscles.slice(0, 5);
  }, [exercises]);

  const [showMuscles, setShowMuscles] = useState(false);

  const handleStartWorkout = () => {
    if (!canStartWorkout) {
      toast.error("You can only start today's workout");
      return;
    }
    setIsWorkoutActive(true);
  };

  const handleViewDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleWorkoutComplete = async () => {
    setIsWorkoutActive(false);
    const success = await completeWorkout(dayNumber);
    if (success) {
      toast.success("Workout complete! Great job!");
    } else {
      toast.error("Failed to save workout. Please try again.");
    }
    navigate("/");
  };

  const handleWorkoutExit = () => {
    setIsWorkoutActive(false);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const handleReschedule = async (fromDay: number, toDay: number) => {
    const success = await swapWorkouts(fromDay, toDay);
    if (success) {
      toast.success(`Workout rescheduled! Day ${fromDay} and Day ${toDay} have been swapped.`);
    } else {
      toast.error("Failed to reschedule workout. Please try again.");
    }
  };

  const currentDayInfo = {
    day: dayNumber,
    title: workoutName,
    workoutType: workoutTemplate.workoutType,
    date: "",
  };

  if (isWorkoutActive) {
    return (
      <WorkoutSession
        exercises={exercises}
        dayNumber={dayNumber}
        workoutName={workoutName}
        onComplete={handleWorkoutComplete}
        onExit={handleWorkoutExit}
        onCompleteWorkout={completeWorkout}
      />
    );
  }

  const getStatusBadgeColor = () => {
    switch (workoutStatus) {
      case "completed": return "bg-green-500";
      case "active": return "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa]";
      case "missed": return "bg-orange-500";
      default: return "bg-zinc-600";
    }
  };

  const getStatusText = () => {
    switch (workoutStatus) {
      case "completed": return "Completed";
      case "active": return "Today";
      case "missed": return "Missed";
      default: return "Locked";
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4 bg-[#0f0f1a]/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-center">
            <p className="text-white/50 text-xs">Day {dayNumber}</p>
            <h1 className="text-white font-semibold text-lg">{workoutName}</h1>
          </div>

          <button
            onClick={() => setIsAIOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-lg shadow-[#7c57ff]/30"
            data-testid="button-ai-help"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Workout Summary Card */}
      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #7c57ff 0%, #60a5fa 50%, #00d9ff 100%)",
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          
          <div className="relative p-5">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">
                  {isToday ? "Today's Workout" : `Day ${dayNumber} Workout`}
                </p>
                <h2 className="text-white text-xl font-bold">{workoutName}</h2>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${getStatusBadgeColor()}`}>
                {getStatusText()}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-white/80 text-xs mb-1">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Exercises</span>
                </div>
                <p className="text-white text-xl font-bold">{exercises.length}</p>
              </div>
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-white/80 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Duration</span>
                </div>
                <p className="text-white text-xl font-bold">{totalDuration} min</p>
              </div>
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-white/80 text-xs mb-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>Focus</span>
                </div>
                <p className="text-white text-lg font-bold">{focusArea}</p>
              </div>
            </div>

            {/* Targeted Muscles Row */}
            <button
              onClick={() => setShowMuscles(!showMuscles)}
              className="w-full bg-[#1a1a2e]/60 backdrop-blur-sm rounded-2xl p-3.5 mb-4 flex items-center justify-between"
              data-testid="button-targeted-muscles"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-[#00d9ff]" />
                </div>
                <span className="text-white font-medium">Targeted Muscles</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-white/50 transition-transform ${showMuscles ? 'rotate-90' : ''}`} />
            </button>

            {/* Muscles Anatomy Diagram (expandable) */}
            {showMuscles && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#1a1a2e]/80 backdrop-blur-sm rounded-2xl p-4 mb-4"
              >
                <MuscleAnatomyDiagram targetedMuscles={targetedMuscles} />
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {targetedMuscles.map((muscle, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-sm"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canStartWorkout ? (
                <button
                  onClick={handleStartWorkout}
                  className="flex-1 bg-white text-[#7c57ff] py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg"
                  data-testid="button-start-workout"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Workout
                </button>
              ) : isCompleted ? (
                <div className="flex-1 bg-white/20 text-white py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Completed
                </div>
              ) : (
                <div className="flex-1 bg-white/20 text-white/70 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  {isPast ? "Missed" : "Locked"}
                </div>
              )}
              
              <button
                onClick={() => setShowExerciseModal(true)}
                className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"
                data-testid="button-preview"
              >
                <Eye className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Secondary Action Buttons */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setIsRescheduleOpen(true)}
                className="flex-1 bg-[#1a1a2e]/60 backdrop-blur-sm py-3 rounded-2xl font-medium text-white flex items-center justify-center gap-2 border border-white/10"
                data-testid="button-reschedule"
              >
                <CalendarDays className="w-4 h-4" />
                Reschedule
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Exercise List */}
      <div className="px-4 py-2">
        <h3 className="text-white/70 text-sm font-medium mb-3 px-1">Exercises</h3>
        
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {/* Exercise Number Badge */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg
                  ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-br from-[#60a5fa] to-[#00d9ff]'}
                  shadow-lg
                `}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
              </div>

              {/* Exercise Card */}
              <div 
                className="ml-6 bg-gradient-to-br from-[#1a1a2e] to-[#252540] rounded-2xl overflow-hidden border border-white/5"
                data-testid={`card-exercise-${exercise.id}`}
              >
                {/* Image placeholder with gradient */}
                <div className="h-32 bg-gradient-to-br from-[#3a3a5c] to-[#2a2a4c] relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Dumbbell className="w-12 h-12 text-white/20" />
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`
                      px-2.5 py-1 rounded-full text-xs font-medium
                      ${exercise.difficulty === 'Beginner' 
                        ? 'bg-green-500/80 text-white' 
                        : exercise.difficulty === 'Intermediate'
                          ? 'bg-yellow-500/80 text-white'
                          : 'bg-red-500/80 text-white'
                      }
                    `}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>

                {/* Exercise Info */}
                <div className="p-4">
                  <h4 className="text-white font-semibold text-lg mb-1">{exercise.name}</h4>
                  <p className="text-[#60a5fa] text-sm mb-4">{exercise.muscles}</p>

                  {/* Stats Row */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
                      <p className="text-white/50 text-xs mb-0.5">Sets</p>
                      <p className="text-white font-bold">{exercise.sets}</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
                      <p className="text-white/50 text-xs mb-0.5">Reps</p>
                      <p className="text-white font-bold text-sm">{exercise.reps}</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
                      <p className="text-white/50 text-xs mb-0.5">Time</p>
                      <p className="text-white font-bold">{exercise.time}</p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => handleViewDetails(exercise)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                    data-testid={`button-details-${exercise.id}`}
                  >
                    <span className="text-white/80 font-medium">View Details</span>
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />

      {/* AI Assistant Modal */}
      <WorkoutAIAssistant
        workoutName={workoutName}
        exercises={exercises.map((e) => ({
          name: e.name,
          muscles: e.muscles,
          sets: e.sets,
          time: e.time,
        }))}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <ExerciseDetailsModal
          exercise={selectedExercise}
          isOpen={showExerciseModal}
          onClose={() => {
            setShowExerciseModal(false);
            setSelectedExercise(null);
          }}
        />
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        currentDay={currentDayInfo}
        allDays={dayStatuses.map(ds => ({
          day: ds.day,
          title: ds.title,
          workoutType: ds.workoutType,
          date: ds.date,
        }))}
        onReschedule={handleReschedule}
      />
    </div>
  );
}
