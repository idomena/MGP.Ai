import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { Link } from "react-router-dom";
import { Calendar, Apple, Dumbbell, MessageCircle, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      title: "Calendar",
      description: "View your workout schedule",
      icon: Calendar,
      link: "/calendar",
      gradient: "from-[#00c6ff] to-[#7c57ff]",
    },
    {
      title: "Nutrition",
      description: "Track your meals and calories",
      icon: Apple,
      link: "/nutrition",
      gradient: "from-[#aaf163] to-[#00c6ff]",
    },
    {
      title: "Workouts",
      description: "Browse workout programs",
      icon: Dumbbell,
      link: "/workout",
      gradient: "from-[#7c57ff] to-[#b3a0ff]",
    },
    {
      title: "AI Assistant",
      description: "Get personalized fitness advice",
      icon: MessageCircle,
      link: "/assistant",
      gradient: "from-[#60a5fa] to-[#7c57ff]",
    },
    {
      title: "Rewards",
      description: "Earn points and get rewards",
      icon: Trophy,
      link: "/rewards",
      gradient: "from-[#aaf163] to-[#60a5fa]",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-white">
          Welcome {user?.email?.split("@")[0] || "back"}!
        </h1>
        <p className="text-gray-400 mt-2">Ready to crush your fitness goals today?</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} to={feature.link}>
              <div className={`bg-gradient-to-r ${feature.gradient} rounded-xl p-0.5 hover:shadow-lg transition-all duration-300`}>
                <div className="bg-[#1a1a1a] rounded-[10px] p-6 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
                    <p className="text-white/60 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <NavigationBar />
    </div>
  );
}
