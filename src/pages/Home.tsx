import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useState } from "react";
import { BarChart3, CheckCircle, Flame, TrendingUp, BarChart, Calendar as CalendarIcon, Target, ChevronDown, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<"weekly" | "quarterly">("quarterly");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = async (view: "weekly" | "quarterly") => {
    if (view === activeView || isTransitioning) return;
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setActiveView(view);
    setIsTransitioning(false);
  };

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
          {/* Weekly Program View */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Your Program
              </h3>
              <button className="text-muted-foreground text-sm flex items-center gap-1 hover:text-white transition-colors">
                View Stats →
              </button>
            </div>

            {/* Post-Workout Meal Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted rounded-2xl p-4 mb-6"
            >
              <div className="h-1 rounded-full bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#aaf163] mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🥗</div>
                  <div>
                    <h4 className="text-white font-semibold">Post-Workout Meal</h4>
                    <p className="text-muted-foreground text-sm">Perfect for your Back + Front hand</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#7c57ff] text-sm font-semibold flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    320 kcal
                  </span>
                  <button className="hover:rotate-180 transition-transform duration-300">
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              <svg className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7c57ff" />
                    <stop offset="100%" stopColor="#00c6ff" />
                  </linearGradient>
                </defs>
                <path
                  d="M 200 60 Q 150 120, 200 180 Q 250 240, 200 300 Q 150 360, 200 420 Q 250 480, 200 540"
                  stroke="url(#pathGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="8 4"
                />
              </svg>

              <div className="flex flex-col items-center gap-8 relative" style={{ zIndex: 1 }}>
                {[12, 13, 14, 15, 16].map((day, idx) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link to={day === 16 ? "/workout/16" : "#"}>
                      <div className={`relative ${idx % 2 === 0 ? 'ml-32' : 'mr-32'}`}>
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#7c57ff] flex items-center justify-center text-white text-2xl font-bold shadow-lg hover:scale-110 transition-transform ${day === 16 ? 'ring-4 ring-[#7c57ff]/50 animate-pulse' : ''}`}>
                          {day}
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#aaf163] flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-background" />
                          </div>
                        </div>
                        {day === 16 && (
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#aaf163] text-background text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            TODAY
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <NavigationBar />
    </div>
  );
}
