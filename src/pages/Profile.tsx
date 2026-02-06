import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings, Bell, Award, Zap, Flame, Target, ChevronRight, Shield, HelpCircle, Star, Dumbbell, LogOut, RefreshCw, Calendar, TrendingUp, Mail, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface WorkoutCompletion {
  id: string;
  day_number: number;
  title: string;
  workout_type: string;
  completed: boolean;
  completed_at: string;
}

interface UserProgram {
  start_date: string;
  total_days: number;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutCompletion[]>([]);
  const [userProgram, setUserProgram] = useState<UserProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [completionsRes, programRes] = await Promise.all([
        supabase
          .from("workout_completions")
          .select("*")
          .eq("user_id", user.id)
          .eq("completed", true)
          .order("day_number", { ascending: false }),
        supabase
          .from("user_programs")
          .select("start_date, total_days")
          .eq("user_id", user.id)
          .single()
      ]);

      if (completionsRes.data) {
        setCompletedWorkouts(completionsRes.data);
      }
      if (programRes.data) {
        setUserProgram(programRes.data);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("profile_workout_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_completions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log("Profile: workout data changed, refetching...");
          fetchUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const actualWorkouts = completedWorkouts.filter(w => w.workout_type !== "rest");

  const calculateStreak = (): number => {
    if (actualWorkouts.length === 0) return 0;
    
    const sortedDays = actualWorkouts
      .map(w => w.day_number)
      .sort((a, b) => b - a);
    
    let streak = 1;
    for (let i = 0; i < sortedDays.length - 1; i++) {
      if (sortedDays[i] - sortedDays[i + 1] <= 2) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calculateXP = (): number => {
    return actualWorkouts.length * 150;
  };

  const calculateTotalMinutes = (): number => {
    return actualWorkouts.length * 30;
  };

  const getMemberSince = (): string => {
    if (userProgram?.start_date) {
      const date = new Date(userProgram.start_date);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return "January 2026";
  };

  const handleResetPlan = async () => {
    if (!user?.id) return;
    
    setIsResetting(true);
    try {
      localStorage.removeItem("mgp_workout_preferences");
      
      const { error } = await supabase
        .from("workout_completions")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.log("Could not clear Supabase completions:", error);
      }
      
      toast({
        title: "Plan Reset",
        description: "Redirecting to setup your new plan...",
      });
      navigate("/onboarding");
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

  const workoutCount = actualWorkouts.length;
  const streak = calculateStreak();
  const xp = calculateXP();
  const totalMinutes = calculateTotalMinutes();

  const stats = [
    { label: "Workouts", value: workoutCount.toString(), icon: Dumbbell, color: "#7c57ff" },
    { label: "Streak", value: streak.toString(), icon: Flame, color: "#f97316" },
    { label: "XP", value: xp.toLocaleString(), icon: Zap, color: "#eab308" },
  ];

  const achievements = [
    { id: 1, name: "First Workout", icon: Star, unlocked: workoutCount >= 1, requirement: "Complete 1 workout" },
    { id: 2, name: "7 Day Streak", icon: Flame, unlocked: streak >= 7, requirement: "7 days in a row" },
    { id: 3, name: "10 Workouts", icon: Target, unlocked: workoutCount >= 10, requirement: "Complete 10 workouts" },
    { id: 4, name: "21 Day Hero", icon: Award, unlocked: workoutCount >= 21, requirement: "Complete full program" },
  ];

  const menuItems = [
    { label: "Privacy Policy", icon: Shield, path: "/privacy-policy" },
    { label: "Terms of Service", icon: Settings, path: "/terms" },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-[#0a0e27] pb-24 overflow-y-auto" role="main" aria-label="Profile page">
      <div className="relative">
        <div className="h-44 bg-gradient-to-br from-[#7c57ff] via-[#9b6dff] to-[#60a5fa]" aria-hidden="true">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
          <div className="relative">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#00c6ff] p-1 shadow-xl shadow-[#7c57ff]/30"
            >
              <div className="w-full h-full rounded-full bg-[#1a1f3e] flex items-center justify-center">
                <User className="w-14 h-14 text-white" />
              </div>
            </motion.div>
            {streak > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-gradient-to-br from-[#f97316] to-[#fbbf24] flex items-center justify-center shadow-lg"
              >
                <Flame className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-20">
        <header className="text-center mb-6">
          <h1 className="text-white text-2xl font-bold" data-testid="text-username">
            {user?.email?.split("@")[0] || "Fitness Pro"}
          </h1>
          <p className="text-white/60 text-sm mt-1">Member since {getMemberSince()}</p>
          
          {userProgram && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10">
              <Calendar className="w-4 h-4 text-[#7c57ff]" />
              <span className="text-white/80 text-sm">Day {completedWorkouts.length + 1} of {userProgram.total_days}</span>
            </div>
          )}
        </header>

        <section className="mb-6" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Your Stats</h2>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center"
                >
                  <div 
                    className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: stat.color }} aria-hidden="true" />
                  </div>
                  <p className="text-white text-xl font-bold">
                    {isLoading ? "-" : stat.value}
                  </p>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-white font-medium">Total Training Time</p>
                  <p className="text-white/60 text-sm">{isLoading ? "-" : `${totalMinutes} minutes`}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                {isLoading ? "" : `~${Math.round(totalMinutes / 60)} hrs`}
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mb-6" aria-labelledby="achievements-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="achievements-heading" className="text-white font-semibold">
              Achievements ({unlockedCount}/{achievements.length})
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 ${
                    achievement.unlocked 
                      ? "bg-gradient-to-br from-[#7c57ff]/30 to-[#60a5fa]/30 border border-[#7c57ff]/50" 
                      : "bg-white/5 border border-white/10 opacity-50"
                  }`}
                  title={achievement.requirement}
                >
                  <Icon className={`w-7 h-7 ${achievement.unlocked ? "text-[#aaf163]" : "text-white/40"}`} aria-hidden="true" />
                  <p className={`text-[9px] mt-1.5 text-center leading-tight ${achievement.unlocked ? "text-white" : "text-white/40"}`}>
                    {achievement.name}
                  </p>
                </motion.div>
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

        <section className="mt-6" aria-labelledby="help-heading">
          <h2 id="help-heading" className="text-white font-semibold mb-3">Help & Support</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <a
              href="mailto:hello.mgp.ai@gmail.com"
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/10"
              data-testid="link-support-email"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7c57ff]/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#7c57ff]" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-white font-medium block">Email Us</span>
                  <span className="text-white/40 text-xs">hello.mgp.ai@gmail.com</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40" aria-hidden="true" />
            </a>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-white font-medium block">FAQ</span>
                  <span className="text-white/40 text-xs">Common questions answered</span>
                </div>
              </div>
              <span className="text-white/30 text-xs">Coming soon</span>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-3">
          <Button
            onClick={handleResetPlan}
            disabled={isResetting}
            variant="outline"
            className="w-full h-14 bg-[#7c57ff]/10 hover:bg-[#7c57ff]/20 border-[#7c57ff]/30 text-[#7c57ff]"
            data-testid="button-reset-plan"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? "Resetting..." : "Reset Workout Plan"}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-14 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </div>

        <p className="text-center text-white/30 text-xs mt-8 mb-4">
          MGP.AI v1.0.0
        </p>
      </div>

      <NavigationBar />
    </div>
  );
}
