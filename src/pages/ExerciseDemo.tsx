import { useState } from "react";
import ExerciseDemonstrator, { AnimationId, Difficulty } from "@/components/ExerciseDemonstrator";

const EXERCISES: { name: string; animationId: AnimationId; difficulty: Difficulty }[] = [
  { name: "Barbell Squat",    animationId: "squat",    difficulty: "intermediate" },
  { name: "Push-Up",          animationId: "pushup",   difficulty: "beginner"     },
  { name: "Forward Lunge",    animationId: "lunge",    difficulty: "beginner"     },
  { name: "Overhead Press",   animationId: "press",    difficulty: "intermediate" },
  { name: "Bicep Curl",       animationId: "curl",     difficulty: "beginner"     },
  { name: "Bent Over Row",    animationId: "row",      difficulty: "intermediate" },
  { name: "Deadlift",         animationId: "deadlift", difficulty: "advanced"     },
];

export default function ExerciseDemo() {
  const [selected, setSelected] = useState(0);
  const ex = EXERCISES[selected];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">M</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Exercise Demonstrator</h1>
          <p className="text-xs text-gray-500">3D animation preview — MGP.AI</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* 3D Viewer */}
        <div className="flex-1 min-h-[520px] rounded-2xl overflow-hidden shadow-xl">
          <ExerciseDemonstrator
            key={ex.animationId}
            exerciseName={ex.name}
            animationId={ex.animationId}
            difficulty={ex.difficulty}
            autoPlay
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-64 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
            Animations
          </p>
          {EXERCISES.map((e, i) => (
            <button
              key={e.animationId}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium
                ${i === selected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                  : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
            >
              <span className="block">{e.name}</span>
              <span className={`text-[11px] capitalize ${i === selected ? "text-indigo-200" : "text-gray-400"}`}>
                {e.difficulty} · {e.animationId}
              </span>
            </button>
          ))}

          {/* Info card */}
          <div className="mt-auto p-4 bg-white rounded-xl border border-gray-200 text-xs text-gray-500 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-1">About this preview</p>
            Approve the look &amp; feel here. Once confirmed, all 20 animations will be exported to
            <span className="font-mono text-indigo-600"> src/assets/workouts/</span>
          </div>
        </div>
      </div>
    </div>
  );
}
