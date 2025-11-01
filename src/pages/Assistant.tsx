import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { Dumbbell, Apple, Activity, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AssistantPage() {
  const quickPrompts = [
    {
      id: 1,
      text: "How can I improve my bench press?",
      icon: Dumbbell,
    },
    {
      id: 2,
      text: "What should I eat before a workout?",
      icon: Apple,
    },
    {
      id: 3,
      text: "My shoulder hurts when I lift weights",
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      <div className="mt-6">
        <h1 className="text-2xl font-bold">
          Hello{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00c6ff] to-[#7c57ff]">
            Champion
          </span>
        </h1>
        <h2 className="text-2xl font-bold mt-1">How Can I Help You Today?</h2>
      </div>

      {/* Main Chat Button */}
      <div className="mt-6">
        <Link to="/assistant/chat">
          <div className="relative bg-gradient-to-r from-[#7c57ff] to-[#00c6ff] rounded-xl p-0.5 shadow-lg hover:shadow-[0_0_15px_rgba(124,87,255,0.5)] transition-all duration-300 hover:scale-[1.02] cursor-pointer">
            <div className="bg-[#2a2a2a] rounded-[10px] p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-inner">
                <MessageCircle className="w-6 h-6 text-[#7c57ff]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">Start a conversation</h3>
                <p className="text-white/60 text-xs">Ask me anything about fitness</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Prompts */}
      <div className="mt-8">
        <h3 className="text-white font-semibold mb-4">Quick Questions</h3>
        <div className="space-y-3">
          {quickPrompts.map((prompt) => {
            const Icon = prompt.icon;
            return (
              <Link key={prompt.id} to={`/assistant/chat?prompt=${encodeURIComponent(prompt.text)}`}>
                <div className="bg-[#3f3f3f] rounded-xl p-4 flex items-center hover:bg-[#4a4a4a] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] flex items-center justify-center mr-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-sm flex-1">{prompt.text}</p>
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
