import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings, Bell, Award, Zap, Flame, Target, ChevronRight, Shield, HelpCircle, Star, Dumbbell, LogOut, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPlan = async () => {
    if (!user?.id) return;
    
    setIsResetting(true);
    try {
      const { error } = await supabase
        .from("workout_completions")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to reset workout plan.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Plan Reset",
          description: "Redirecting to setup your new plan...",
        });
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Error resetting plan:", err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/login");
  };

  const stats = [
    { label: "Workouts", value: "16", icon: Dumbbell, color: "#7c57ff" },
    { label: "Streak", value: "12", icon: Flame, color: "#f97316" },
    { label: "XP", value: "2,840", icon: Zap, color: "#eab308" },
  ];

  const achievements = [
    { id: 1, name: "First Workout", icon: Star, unlocked: true },
    { id: 2, name: "7 Day Streak", icon: Flame, unlocked: true },
    { id: 3, name: "Strength Master", icon: Target, unlocked: false },
    { id: 4, name: "30 Workouts", icon: Award, unlocked: false },
  ];

  const menuItems = [
    { label: "Settings", icon: Settings, path: "/settings" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Privacy", icon: Shield, path: "/privacy" },
    { label: "Help & Support", icon: HelpCircle, path: "/help" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e27] pb-24 overflow-y-auto" role="main" aria-label="Profile page">
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-[#7c57ff] to-[#60a5fa]" aria-hidden="true" />
        
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#00c6ff] p-1">
              <div className="w-full h-full rounded-full bg-[#1a1f3e] flex items-center justify-center">
                <User className="w-14 h-14 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#aaf163] flex items-center justify-center">
              <span className="text-black font-bold text-sm">12</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-20">
        <header className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold" data-testid="text-username">
            {user?.email?.split("@")[0] || "Fitness Pro"}
          </h1>
          <p className="text-white/60 text-sm mt-1">Member since January 2026</p>
        </header>

        <section className="mb-6" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Your Stats</h2>
          <div className="flex gap-3 justify-center">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                >
                  <Icon className="w-6 h-6 mb-2" style={{ color: stat.color }} aria-hidden="true" />
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mb-6" aria-labelledby="achievements-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="achievements-heading" className="text-white font-semibold">Achievements</h2>
            <Link to="/achievements" className="text-[#7c57ff] text-sm">View All</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${
                    achievement.unlocked 
                      ? "bg-gradient-to-br from-[#7c57ff]/30 to-[#60a5fa]/30 border border-[#7c57ff]/50" 
                      : "bg-white/5 border border-white/10 opacity-50"
                  }`}
                >
                  <Icon className={`w-8 h-8 ${achievement.unlocked ? "text-[#aaf163]" : "text-white/40"}`} aria-hidden="true" />
                  <p className={`text-[10px] mt-1 text-center px-1 ${achievement.unlocked ? "text-white" : "text-white/40"}`}>
                    {achievement.name}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="menu-heading">
          <h2 id="menu-heading" className="sr-only">Menu Options</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                    index !== menuItems.length - 1 ? "border-b border-white/10" : ""
                  }`}
                  data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-white font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>

        <button
          onClick={handleResetPlan}
          disabled={isResetting}
          className="w-full mt-6 flex items-center justify-center gap-3 p-4 bg-[#7c57ff]/10 hover:bg-[#7c57ff]/20 border border-[#7c57ff]/20 rounded-2xl transition-colors disabled:opacity-50"
          data-testid="button-reset-plan"
          aria-label="Reset workout plan"
        >
          <RefreshCw className={`w-5 h-5 text-[#7c57ff] ${isResetting ? 'animate-spin' : ''}`} />
          <span className="text-[#7c57ff] font-medium">
            {isResetting ? "Resetting..." : "Reset Workout Plan"}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full mt-3 flex items-center justify-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-colors"
          data-testid="button-logout"
          aria-label="Log out"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-medium">Log Out</span>
        </button>

        <p className="text-center text-white/30 text-xs mt-8">
          MGP.AI v1.0.0 - Your AI Fitness Coach
        </p>
      </div>

      <NavigationBar />
    </div>
  );
}
