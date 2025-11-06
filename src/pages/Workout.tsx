import NavigationBar from "@/components/NavigationBar";
import { useState } from "react";
import { Users, Clock, Target, Eye, Play, X, ChevronDown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WorkoutSession from "@/components/WorkoutSession";

export default function WorkoutPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  const workout = {
    id: "16",
    name: "Back training + Front hand",
    shortName: "Back + Front hand",
    date: "January 16, 2025",
    day: "Day 16",
    exercises: 3,
    duration: "28 min",
    focus: "Back",
    exercisesList: [
      {
        id: 1,
        name: "Machine T-bar Row",
        muscles: "Back, Lats",
        sets: 3,
        reps: "12, 10, 8",
        time: "10 min",
        difficulty: "Intermediate",
      },
      {
        id: 2,
        name: "Lat Pull Down",
        muscles: "Back, Shoulders",
        sets: 3,
        reps: "12, 10, 8",
        time: "8 min",
        difficulty: "Beginner",
      },
      {
        id: 3,
        name: "Hammers",
        muscles: "Biceps, Forearms",
        sets: 4,
        reps: "12, 10, 8, 8",
        time: "10 min",
        difficulty: "Intermediate",
      },
    ],
  };

  const handleStartWorkout = () => {
    setIsWorkoutActive(true);
    toast.success("Workout started! Good luck! 💪");
  };

  const handleWorkoutComplete = () => {
    setIsWorkoutActive(false);
    toast.success("Workout complete! Great job! 🎉");
  };

  const handleWorkoutExit = () => {
    setIsWorkoutActive(false);
    toast.info("Workout paused. Come back anytime!");
  };

  const handleViewDetails = (exerciseName: string) => {
    toast.info(`Viewing details for ${exerciseName}`);
  };

  return (
    <>
      {isWorkoutActive ? (
        <WorkoutSession
          exercises={workout.exercisesList}
          dayNumber={16}
          workoutName={workout.shortName}
          onComplete={handleWorkoutComplete}
          onExit={handleWorkoutExit}
        />
      ) : (
        <div className="min-h-screen bg-background pb-20 px-4">
      <div className="pt-6">
        <h1 className="text-white text-2xl font-bold text-center mb-6">
          {workout.name}
        </h1>

        {/* Today's Workout Card */}
        <div className="bg-gradient-to-br from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] rounded-3xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-white text-2xl font-bold">Today's Workout</h2>
              <p className="text-white/80 text-sm mt-1">{workout.shortName}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-white" />
                <p className="text-white/80 text-xs">Exercises</p>
              </div>
              <p className="text-white text-2xl font-bold">{workout.exercises}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-white" />
                <p className="text-white/80 text-xs">Duration</p>
              </div>
              <p className="text-white text-2xl font-bold">{workout.duration}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-white" />
                <p className="text-white/80 text-xs">Focus</p>
              </div>
              <p className="text-white text-2xl font-bold">{workout.focus}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleStartWorkout}
              className="flex-1 bg-white text-[#7c57ff] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-white/90 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Workout
            </button>
            <button 
              onClick={() => setShowDetails(true)}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all hover:scale-105"
            >
              <Eye className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Exercise List */}
        <div className="mt-6 space-y-4">
          {workout.exercisesList.map((exercise, index) => (
            <motion.div 
              key={exercise.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-muted rounded-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-muted to-muted/50 p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{exercise.name}</h3>
                    <p className="text-[#7c57ff] text-sm">{exercise.muscles}</p>
                  </div>
                  <div className="bg-[#aaf163] text-background text-xs font-bold px-3 py-1 rounded-full">
                    {exercise.difficulty}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background/50 rounded-xl p-3 text-center">
                    <p className="text-muted-foreground text-xs mb-1">Sets</p>
                    <p className="text-white font-bold text-lg">{exercise.sets}</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-3 text-center">
                    <p className="text-muted-foreground text-xs mb-1">Reps</p>
                    <p className="text-white font-bold text-lg">{exercise.reps}</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-3 text-center">
                    <p className="text-muted-foreground text-xs mb-1">Time</p>
                    <p className="text-white font-bold text-lg">{exercise.time}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleViewDetails(exercise.name)}
                  className="w-full mt-4 bg-muted/50 text-muted-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-muted/70 transition-all hover:text-white"
                >
                  View Details →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Workout Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gradient-to-br from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] border-none p-0 max-w-md">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-bold">{workout.shortName}</h2>
                <p className="text-white/80 text-sm mt-1">{workout.date}</p>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                <Users className="w-5 h-5 text-[#7c57ff] mx-auto mb-2" />
                <p className="text-muted-foreground text-xs mb-1">Exercises</p>
                <p className="text-white font-bold">6</p>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-[#60a5fa] mx-auto mb-2" />
                <p className="text-muted-foreground text-xs mb-1">Duration</p>
                <p className="text-white font-bold">45 min</p>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-center">
                <Target className="w-5 h-5 text-[#aaf163] mx-auto mb-2" />
                <p className="text-muted-foreground text-xs mb-1">Difficulty</p>
                <p className="text-white font-bold">High</p>
              </div>
            </div>

            <button className="w-full bg-[#2a2a2a] text-white py-3 rounded-xl font-semibold flex items-center justify-between px-4 mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#7c57ff]" />
                <span>Targeted Muscles</span>
              </div>
              <ChevronDown className="w-5 h-5" />
            </button>

            <div className="bg-[#2a2a2a] rounded-xl p-4 mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#60a5fa]/20 to-[#7c57ff]/20 flex items-center justify-center">
                  <div className="text-center text-xs text-muted-foreground">
                    Tap to expand
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#7c57ff]"></div>
                    <span className="text-white text-sm">Latissimus Dorsi</span>
                  </div>
                  <span className="text-muted-foreground text-sm">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#60a5fa]"></div>
                    <span className="text-white text-sm">Rhomboids</span>
                  </div>
                  <span className="text-muted-foreground text-sm">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#aaf163]"></div>
                    <span className="text-white text-sm">Biceps</span>
                  </div>
                  <span className="text-muted-foreground text-sm">15%</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleStartWorkout}
              className="w-full bg-white text-[#7c57ff] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mb-3 hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Workout
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => toast.info("Customize feature coming soon!")}
                className="bg-[#2a2a2a] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#3a3a3a] transition-colors"
              >
                ✏️ Customize
              </button>
              <button 
                onClick={() => toast.info("Reschedule feature coming soon!")}
                className="bg-[#2a2a2a] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#3a3a3a] transition-colors"
              >
                📅 Reschedule
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NavigationBar />
    </div>
      )}
    </>
  );
}
