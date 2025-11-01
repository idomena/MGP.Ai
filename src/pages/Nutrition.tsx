import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useState } from "react";
import { Camera, ImageIcon, Search, Zap, Droplets, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<"scan" | "history" | "insights">("scan");
  const navigate = useNavigate();

  const nutritionData = {
    calories: { consumed: 1850, goal: 2200, percentage: 84 },
    protein: { consumed: 135, goal: 160, unit: "g", percentage: 84 },
    carbs: { consumed: 180, goal: 220, unit: "g", percentage: 82 },
    fats: { consumed: 55, goal: 70, unit: "g", percentage: 79 },
    water: { consumed: 1.8, goal: 2.5, unit: "L", percentage: 72 },
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-white">Nutrition Tracking</h1>
        <p className="text-gray-400 mt-2">Track your daily nutrition goals</p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        {["scan", "history", "insights"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white"
                : "bg-[#3f3f3f] text-gray-400"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Daily Summary */}
      <div className="mt-6 bg-[#3f3f3f] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Calories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm flex items-center">
                <Flame className="w-4 h-4 mr-1" />
                Calories
              </span>
              <span className="text-white font-bold">{nutritionData.calories.consumed}/{nutritionData.calories.goal}</span>
            </div>
            <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7c57ff] to-[#00c6ff]" style={{ width: `${nutritionData.calories.percentage}%` }} />
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Protein
              </span>
              <span className="text-white font-bold">{nutritionData.protein.consumed}/{nutritionData.protein.goal}g</span>
            </div>
            <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#aaf163]" style={{ width: `${nutritionData.protein.percentage}%` }} />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Carbs</span>
              <span className="text-white font-bold">{nutritionData.carbs.consumed}/{nutritionData.carbs.goal}g</span>
            </div>
            <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#60a5fa]" style={{ width: `${nutritionData.carbs.percentage}%` }} />
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Fats</span>
              <span className="text-white font-bold">{nutritionData.fats.consumed}/{nutritionData.fats.goal}g</span>
            </div>
            <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#ffeb3b]" style={{ width: `${nutritionData.fats.percentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Scan Section */}
      {activeTab === "scan" && (
        <div className="mt-6">
          <div className="bg-gradient-to-r from-[#7c57ff] to-[#00c6ff] rounded-xl p-0.5">
            <div className="bg-[#1a1a1a] rounded-[10px] p-8 text-center">
              <Camera className="w-16 h-16 mx-auto text-white mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Scan Your Meal</h3>
              <p className="text-gray-400 mb-6">Use OCR to quickly log your food</p>
              <Button
                onClick={() => navigate("/ocr")}
                className="bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white font-semibold py-3 px-8 rounded-full"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scan Food
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <button className="bg-[#3f3f3f] rounded-xl p-4 text-center">
              <ImageIcon className="w-8 h-8 mx-auto text-[#60a5fa] mb-2" />
              <span className="text-white text-sm">Upload Photo</span>
            </button>
            <button className="bg-[#3f3f3f] rounded-xl p-4 text-center">
              <Search className="w-8 h-8 mx-auto text-[#aaf163] mb-2" />
              <span className="text-white text-sm">Search Food</span>
            </button>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  );
}
