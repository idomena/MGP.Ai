import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect } from "react";
import { Gift, Flame, Trophy, Award, Zap, Target, Dumbbell, Moon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CompletedWorkout {
  day_number: number;
  title: string;
  workout_type: string;
  completed_at: string | null;
}

const XP_PER_WORKOUT = 50;
const XP_PER_REST = 10;

const REWARDS = [
  {
    id: 1,
    name: "7-Day Streak Shield",
    description: "Protect your streak — one skipped day won't break it",
    pointsCost: 200,
    icon: Flame,
    color: "#ec8a3f",
  },
  {
    id: 2,
    name: "Workout Swap",
    description: "Unlock the ability to swap any future workout type",
    pointsCost: 150,
    icon: Award,
    color: "#6f9fc4",
  },
  {
    id: 3,
    name: "AI Coach Boost",
    description: "Unlock a deep-dive AI analysis of your progress so far",
    pointsCost: 300,
    icon: Trophy,
    color: "#93b58c",
  },
];

function formatDate(isoStr: string | null): string {
  if (!isoStr) return "Unknown date";
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RewardsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards");
  const [completions, setCompletions] = useState<CompletedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("workout_completions")
      .select("day_number, title, workout_type, completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("day_number", { ascending: false })
      .then(({ data }) => {
        if (data) setCompletions(data as CompletedWorkout[]);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  // Calculate XP from real data
  const totalXP = completions.reduce((sum, c) => {
    return sum + (c.workout_type === "rest" ? XP_PER_REST : XP_PER_WORKOUT);
  }, 0);

  // Calculate current streak (consecutive completed days, most recent first)
  const streak = (() => {
    const sorted = [...completions]
      .filter(c => c.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

    if (sorted.length === 0) return 0;

    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].completed_at!);
      const curr = new Date(sorted[i].completed_at!);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) count++;
      else break;
    }
    return count;
  })();

  const workoutsCompleted = completions.filter(c => c.workout_type !== "rest" && c.completed_at).length;

  const handleRedeem = (rewardName: string, pointsCost: number) => {
    if (totalXP < pointsCost) {
      toast.error(`You need ${pointsCost - totalXP} more XP to redeem this reward.`);
      return;
    }
    toast.success(`${rewardName} redeemed! Feature coming soon.`);
  };

  return (
    <div className="min-h-screen bg-cozy-bg pb-24 px-4 overflow-y-auto" role="main" aria-label="Rewards page">
      <MobileHeader />

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-cozy-ink">Rewards</h1>
        <p className="text-cozy-ink-faint mt-1 text-sm">Earn XP by completing workouts</p>
      </div>

      {/* XP Card */}
      <section className="mt-5 bg-cozy-primary rounded-2xl p-0.5" aria-labelledby="points-heading">
        <div className="bg-cozy-bg rounded-[15px] p-5">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 text-cozy-primary animate-spin" />
            </div>
          ) : (
            <>
              <p id="points-heading" className="text-cozy-ink-faint text-sm mb-1">Total XP</p>
              <p className="text-5xl font-bold text-cozy-ink" data-testid="text-total-points" aria-live="polite">
                {totalXP.toLocaleString()}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-cozy-sunk rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-1">
                    <Dumbbell className="w-4 h-4 text-cozy-primary" />
                  </div>
                  <p className="text-cozy-ink font-bold text-lg">{workoutsCompleted}</p>
                  <p className="text-cozy-ink-faint text-xs">Workouts</p>
                </div>
                <div className="bg-cozy-sunk rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-1">
                    <Flame className="w-4 h-4 text-cozy-streak-deep" />
                  </div>
                  <p className="text-cozy-ink font-bold text-lg">{streak}</p>
                  <p className="text-cozy-ink-faint text-xs">Streak</p>
                </div>
                <div className="bg-cozy-sunk rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-1">
                    <Zap className="w-4 h-4 text-cozy-streak-deep" />
                  </div>
                  <p className="text-cozy-ink font-bold text-lg">{XP_PER_WORKOUT}</p>
                  <p className="text-cozy-ink-faint text-xs">XP/workout</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Tabs */}
      <nav className="mt-5 flex gap-2" role="tablist" aria-label="Rewards navigation">
        <button
          role="tab"
          aria-selected={activeTab === "rewards"}
          onClick={() => setActiveTab("rewards")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cozy-primary ${
            activeTab === "rewards"
              ? " bg-cozy-primary text-white"
              : "bg-cozy-sunk text-cozy-ink-faint"
          }`}
          data-testid="tab-rewards"
        >
          Rewards
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cozy-primary ${
            activeTab === "history"
              ? " bg-cozy-primary text-white"
              : "bg-cozy-sunk text-cozy-ink-faint"
          }`}
          data-testid="tab-history"
        >
          History
        </button>
      </nav>

      {/* Rewards tab */}
      {activeTab === "rewards" && (
        <section id="rewards-panel" role="tabpanel" className="mt-4 space-y-3">
          {REWARDS.map((reward, index) => {
            const Icon = reward.icon;
            const canAfford = totalXP >= reward.pointsCost;
            return (
              <motion.article
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`bg-cozy-surface border border-cozy-line rounded-2xl p-4 ${!canAfford ? "opacity-60" : ""}`}
                data-testid={`card-reward-${reward.id}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${reward.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: reward.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-cozy-ink font-semibold">{reward.name}</h3>
                    <p className="text-cozy-ink-faint text-sm mt-0.5 leading-snug">{reward.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-cozy-streak-deep" />
                        <span className="text-cozy-streak-deep font-semibold text-sm">{reward.pointsCost} XP</span>
                      </div>
                      <button
                        onClick={() => handleRedeem(reward.name, reward.pointsCost)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cozy-line ${
                          canAfford
                            ? " bg-cozy-primary text-white hover:opacity-90"
                            : "bg-cozy-sunk text-cozy-ink-faint cursor-not-allowed"
                        }`}
                        aria-label={`Redeem ${reward.name} for ${reward.pointsCost} XP`}
                        data-testid={`button-redeem-${reward.id}`}
                      >
                        {canAfford ? "Redeem" : `Need ${reward.pointsCost - totalXP} more`}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <section id="history-panel" role="tabpanel" className="mt-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-cozy-primary animate-spin" />
            </div>
          ) : completions.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="w-10 h-10 text-cozy-ink-faint mx-auto mb-3" />
              <p className="text-cozy-ink-faint text-sm">No workouts completed yet</p>
              <p className="text-cozy-ink-faint text-xs mt-1">Complete a workout to earn XP</p>
            </div>
          ) : (
            completions
              .filter(c => c.completed_at)
              .map((item, index) => {
                const isRest = item.workout_type === "rest";
                const xpEarned = isRest ? XP_PER_REST : XP_PER_WORKOUT;
                const Icon = isRest ? Moon : Dumbbell;
                const color = isRest ? "#6f9fc4" : "#7a5bd3";
                return (
                  <motion.article
                    key={`${item.day_number}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.4) }}
                    className="bg-cozy-surface border border-cozy-line rounded-xl p-3 flex items-center gap-3"
                    data-testid={`card-history-${index}`}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cozy-ink text-sm font-medium truncate">
                        {isRest ? "Rest Day" : item.title || `Day ${item.day_number} Workout`}
                      </p>
                      <p className="text-cozy-ink-faint text-xs">
                        Day {item.day_number} · {formatDate(item.completed_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Zap className="w-3 h-3 text-cozy-streak-deep" />
                      <span className="text-cozy-streak-deep font-bold text-sm">+{xpEarned}</span>
                    </div>
                  </motion.article>
                );
              })
          )}
        </section>
      )}

      <NavigationBar />
    </div>
  );
}
