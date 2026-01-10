import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useState } from "react";
import { Gift, Flame, Utensils, Trophy, Award } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards");

  const rewards = [
    {
      id: 1,
      name: "Free Delivery",
      description: "Get free delivery on your next order",
      pointsCost: 200,
      icon: Gift,
      color: "#60a5fa",
    },
    {
      id: 2,
      name: "20% Off Your Order",
      description: "Save 20% on any meal from our partner restaurants",
      pointsCost: 350,
      icon: Award,
      color: "#aaf163",
    },
    {
      id: 3,
      name: "Premium Meal Upgrade",
      description: "Upgrade any meal to a premium option for free",
      pointsCost: 400,
      icon: Trophy,
      color: "#ffeb3b",
    },
  ];

  const history = [
    {
      id: 1,
      date: "Jan 16, 2025",
      action: "Completed Workout",
      points: "+50",
      icon: Flame,
      color: "#7c57ff",
    },
    {
      id: 2,
      date: "Jan 15, 2025",
      action: "Ordered Meal",
      points: "+25",
      icon: Utensils,
      color: "#aaf163",
    },
  ];

  const totalPoints = 450;

  const handleRedeem = (rewardName: string, pointsCost: number) => {
    toast.success(`Redeemed ${rewardName} for ${pointsCost} points! 🎉`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 overflow-y-auto" role="main" aria-label="Rewards page">
      <MobileHeader />

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-white">Rewards</h1>
        <p className="text-gray-400 mt-2">Earn points and redeem rewards</p>
      </div>

      {/* Points Display */}
      <section className="mt-6 bg-gradient-to-r from-[#7c57ff] to-[#00c6ff] rounded-xl p-0.5" aria-labelledby="points-heading">
        <div className="bg-[#1a1a1a] rounded-[10px] p-6 text-center">
          <p id="points-heading" className="text-gray-400 mb-2">Your Points</p>
          <p className="text-5xl font-bold text-white" data-testid="text-total-points" aria-live="polite">{totalPoints}</p>
          <p className="text-gray-400 mt-2 text-sm">50 points needed for next reward</p>
        </div>
      </section>

      {/* Tabs */}
      <nav className="mt-6 flex gap-2" role="tablist" aria-label="Rewards navigation">
        <button
          role="tab"
          aria-selected={activeTab === "rewards"}
          aria-controls="rewards-panel"
          onClick={() => setActiveTab("rewards")}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#7c57ff] ${
            activeTab === "rewards"
              ? "bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white"
              : "bg-[#3f3f3f] text-gray-400"
          }`}
          data-testid="tab-rewards"
        >
          Rewards
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "history"}
          aria-controls="history-panel"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#7c57ff] ${
            activeTab === "history"
              ? "bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white"
              : "bg-[#3f3f3f] text-gray-400"
          }`}
          data-testid="tab-history"
        >
          History
        </button>
      </nav>

      {/* Content */}
      {activeTab === "rewards" && (
        <section id="rewards-panel" role="tabpanel" aria-labelledby="tab-rewards" className="mt-6 space-y-4">
          {rewards.map((reward, index) => {
            const Icon = reward.icon;
            const canAfford = totalPoints >= reward.pointsCost;

            return (
              <motion.article
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-[#3f3f3f] rounded-xl p-6 ${canAfford ? "opacity-100" : "opacity-60"}`}
                data-testid={`card-reward-${reward.id}`}
              >
                <div className="flex items-start">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: `${reward.color}20` }}
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6" style={{ color: reward.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{reward.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{reward.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[#aaf163] font-semibold">{reward.pointsCost} points</span>
                      {canAfford && (
                        <button 
                          onClick={() => handleRedeem(reward.name, reward.pointsCost)}
                          className="px-4 py-2 bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] text-white rounded-full text-sm font-semibold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={`Redeem ${reward.name} for ${reward.pointsCost} points`}
                          data-testid={`button-redeem-${reward.id}`}
                        >
                          Redeem
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}

      {activeTab === "history" && (
        <section id="history-panel" role="tabpanel" aria-labelledby="tab-history" className="mt-6 space-y-4">
          {history.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#3f3f3f] rounded-xl p-4 flex items-center"
                data-testid={`card-history-${item.id}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                  style={{ backgroundColor: `${item.color}20` }}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{item.action}</h4>
                  <p className="text-gray-400 text-sm">{item.date}</p>
                </div>
                <span 
                  className={`font-bold ${item.points.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                  aria-label={`${item.points.startsWith("+") ? "Earned" : "Spent"} ${item.points.replace(/[+-]/, "")} points`}
                >
                  {item.points}
                </span>
              </motion.article>
            );
          })}
        </section>
      )}

      <NavigationBar />
    </div>
  );
}
