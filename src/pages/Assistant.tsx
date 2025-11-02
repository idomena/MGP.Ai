import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { Dumbbell, Apple, Activity, MessageCircle, Weight, Heart, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

export default function AssistantPage() {
  const categories = [
    { id: 1, label: "Exercises", icon: Dumbbell },
    { id: 2, label: "Pain", icon: Activity },
    { id: 3, label: "Diet", icon: Apple },
    { id: 4, label: "Mass", icon: Weight },
    { id: 5, label: "Toning", icon: Heart },
    { id: 6, label: "Program", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      <div className="mt-6">
        <h1 className="text-2xl font-bold">
          <span className="flex items-center gap-2 text-white">
            <MessageCircle className="w-6 h-6" />
            Hello <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00c6ff] to-[#7c57ff]">Ido Mena</span>
          </span>
        </h1>
        <h2 className="text-2xl font-bold mt-2 text-white">How Can I Help You Today?</h2>
      </div>

      {/* Main Chat Button */}
      <div className="mt-6">
        <Link to="/assistant/chat">
          <div className="relative bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] rounded-2xl p-0.5 shadow-lg hover:shadow-[0_0_20px_rgba(124,87,255,0.5)] transition-all duration-300">
            <div className="bg-[#2a2a2a] rounded-[15px] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner">
                <MessageCircle className="w-7 h-7 text-[#7c57ff]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base">Start a conversation</h3>
                <p className="text-white/60 text-sm">Ask me anything about fitness</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#aaf163]/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#aaf163]" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Categories */}
      <div className="mt-8">
        <h3 className="text-white font-semibold text-lg mb-4">Categories</h3>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.id} to={`/assistant/chat?category=${encodeURIComponent(category.label)}`}>
                <div className="bg-muted rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-muted/80 transition-colors aspect-square">
                  <Icon className="w-8 h-8 text-white" />
                  <p className="text-white text-sm font-medium">{category.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}
