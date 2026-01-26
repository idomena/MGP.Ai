import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Dumbbell, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { id: "Mon", label: "Monday", short: "M" },
  { id: "Tue", label: "Tuesday", short: "T" },
  { id: "Wed", label: "Wednesday", short: "W" },
  { id: "Thu", label: "Thursday", short: "T" },
  { id: "Fri", label: "Friday", short: "F" },
  { id: "Sat", label: "Saturday", short: "S" },
  { id: "Sun", label: "Sunday", short: "S" },
];

const WORKOUT_TEMPLATES = [
  { id: "push", name: "Push", description: "Chest, Shoulders, Triceps", icon: "💪", color: "from-red-500 to-orange-500" },
  { id: "pull", name: "Pull", description: "Back, Biceps", icon: "🏋️", color: "from-blue-500 to-cyan-500" },
  { id: "legs", name: "Legs", description: "Quads, Hamstrings, Calves", icon: "🦵", color: "from-green-500 to-emerald-500" },
  { id: "upper", name: "Upper Body", description: "Chest, Back, Arms", icon: "👐", color: "from-purple-500 to-pink-500" },
  { id: "lower", name: "Lower Body", description: "Legs, Glutes", icon: "🔥", color: "from-yellow-500 to-amber-500" },
  { id: "full", name: "Full Body", description: "Complete workout", icon: "⚡", color: "from-indigo-500 to-violet-500" },
  { id: "core", name: "Core", description: "Abs, Obliques", icon: "🎯", color: "from-teal-500 to-cyan-500" },
  { id: "cardio", name: "Cardio", description: "HIIT, Conditioning", icon: "❤️", color: "from-rose-500 to-red-500" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const toggleWorkout = (workoutId: string) => {
    setSelectedWorkouts(prev =>
      prev.includes(workoutId)
        ? prev.filter(w => w !== workoutId)
        : [...prev, workoutId]
    );
  };

  const generateWorkoutPlan = async () => {
    if (!user?.id) {
      toast.error("Please log in to continue");
      return;
    }

    if (selectedDays.length === 0) {
      toast.error("Please select at least one training day");
      return;
    }

    if (selectedWorkouts.length === 0) {
      toast.error("Please select at least one workout type");
      return;
    }

    setIsGenerating(true);

    try {
      const { error: prefError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          training_days: selectedDays,
          selected_workouts: selectedWorkouts,
          onboarding_completed: true,
        });

      if (prefError) {
        console.error("Error saving preferences:", prefError);
      }

      const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const startDate = new Date();
      const workoutRows: any[] = [];
      let workoutIndex = 0;

      for (let dayNum = 1; dayNum <= 21; dayNum++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayNum - 1);
        
        const dayOfWeek = dayOrder[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
        
        if (selectedDays.includes(dayOfWeek)) {
          const workoutId = selectedWorkouts[workoutIndex % selectedWorkouts.length];
          const template = WORKOUT_TEMPLATES.find(t => t.id === workoutId);
          
          workoutRows.push({
            user_id: user.id,
            day_number: dayNum,
            date: currentDate.toISOString().split("T")[0],
            title: template?.name || "Workout",
            workout_type: template?.id || workoutId,
            workout_template_id: workoutId,
            completed: false,
          });
          
          workoutIndex++;
        }
      }

      if (workoutRows.length > 0) {
        const { error: insertError } = await supabase
          .from("workout_completions")
          .insert(workoutRows);

        if (insertError) {
          console.error("Error inserting workouts:", insertError);
          toast.error("Failed to generate workout plan");
          setIsGenerating(false);
          return;
        }
      }

      toast.success("Your 21-day workout plan is ready!");
      navigate("/");
    } catch (err) {
      console.error("Error generating plan:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] bg-clip-text text-transparent text-center">
          MGP·AI
        </h1>
        <p className="text-white/60 text-center mt-2">Let's set up your workout plan</p>
      </header>

      <div className="flex justify-center gap-2 px-6 py-4">
        {[1, 2].map(s => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s <= step ? "bg-[#7c57ff] w-16" : "bg-white/20 w-8"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 px-6 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#7c57ff]/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[#7c57ff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Training Days</h2>
                <p className="text-white/60 mt-2">Select the days you want to train</p>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center transition-all
                      ${selectedDays.includes(day.id)
                        ? "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                      }
                    `}
                    data-testid={`button-day-${day.id}`}
                  >
                    <span className="text-lg font-bold">{day.short}</span>
                    <span className="text-xs mt-1 hidden sm:block">{day.id}</span>
                    {selectedDays.includes(day.id) && (
                      <Check className="w-4 h-4 mt-1" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <p className="text-white/80 text-center">
                  {selectedDays.length === 0 
                    ? "Select your training days"
                    : `${selectedDays.length} day${selectedDays.length > 1 ? "s" : ""} per week`
                  }
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#7c57ff]/20 flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-[#7c57ff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Workout Types</h2>
                <p className="text-white/60 mt-2">Choose the workouts for your plan</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {WORKOUT_TEMPLATES.map(workout => (
                  <button
                    key={workout.id}
                    onClick={() => toggleWorkout(workout.id)}
                    className={`
                      relative p-4 rounded-2xl text-left transition-all overflow-hidden
                      ${selectedWorkouts.includes(workout.id)
                        ? "bg-gradient-to-br " + workout.color + " shadow-lg"
                        : "bg-white/10 hover:bg-white/15"
                      }
                    `}
                    data-testid={`button-workout-${workout.id}`}
                  >
                    {selectedWorkouts.includes(workout.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#7c57ff]" />
                      </div>
                    )}
                    <span className="text-2xl">{workout.icon}</span>
                    <h3 className="text-white font-semibold mt-2">{workout.name}</h3>
                    <p className="text-white/70 text-sm">{workout.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <p className="text-white/80 text-center">
                  {selectedWorkouts.length === 0
                    ? "Select workout types to include"
                    : `${selectedWorkouts.length} workout${selectedWorkouts.length > 1 ? "s" : ""} selected`
                  }
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e] to-transparent">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2"
              data-testid="button-back"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}
          
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={selectedDays.length === 0}
              className={`
                flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all
                ${selectedDays.length > 0
                  ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
                }
              `}
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={generateWorkoutPlan}
              disabled={selectedWorkouts.length === 0 || isGenerating}
              className={`
                flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all
                ${selectedWorkouts.length > 0 && !isGenerating
                  ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
                }
              `}
              data-testid="button-generate"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Start My Journey
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
