import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Target, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkoutPage() {
  const { id } = useParams();

  const workout = {
    id: id || "16",
    name: "Back training + Front hand",
    date: "January 16, 2025",
    exercises: [
      {
        id: 1,
        name: "Machine T-bar Row",
        sets: 3,
        reps: "12, 10, 8",
        time: "10 min",
        muscles: "Back, Lats",
        difficulty: "Intermediate",
      },
      {
        id: 2,
        name: "Lat Pull Down",
        sets: 3,
        reps: "12, 10, 8",
        time: "8 min",
        muscles: "Back, Shoulders",
        difficulty: "Beginner",
      },
      {
        id: 3,
        name: "Hammers",
        sets: 4,
        reps: "12, 10, 8, 8",
        time: "10 min",
        muscles: "Biceps, Forearms",
        difficulty: "Intermediate",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      <div className="mt-4">
        <Link to="/calendar" className="flex items-center text-gray-400 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calendar
        </Link>

        <div className="bg-gradient-to-r from-[#7c57ff] to-[#00c6ff] rounded-xl p-0.5">
          <div className="bg-[#1a1a1a] rounded-[10px] p-6">
            <h1 className="text-white text-2xl font-bold">{workout.name}</h1>
            <p className="text-gray-400 mt-2">{workout.date}</p>

            <div className="flex gap-4 mt-4">
              <div className="flex items-center text-gray-400">
                <Dumbbell className="w-4 h-4 mr-2" />
                <span className="text-sm">{workout.exercises.length} exercises</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">~30 min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {workout.exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#3f3f3f] rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{exercise.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{exercise.muscles}</p>

                  <div className="mt-4 flex gap-6">
                    <div>
                      <p className="text-gray-400 text-xs">Sets</p>
                      <p className="text-white font-semibold">{exercise.sets}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Reps</p>
                      <p className="text-white font-semibold">{exercise.reps}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Time</p>
                      <p className="text-white font-semibold">{exercise.time}</p>
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  exercise.difficulty === "Beginner" ? "bg-green-500/20 text-green-400" :
                  exercise.difficulty === "Intermediate" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {exercise.difficulty}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}
