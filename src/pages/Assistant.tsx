import { useState, useEffect } from "react";
import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { Dumbbell, Salad, Activity, MessageCircle, Weight, Heart, ClipboardList } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AssistantPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    try {
      const prefs = localStorage.getItem("mgp_workout_preferences");
      if (prefs) {
        const parsed = JSON.parse(prefs);
        if (parsed.userName) setUserName(parsed.userName);
      }
    } catch {}
  }, []);

  const handleCategoryClick = (prompt: string) => {
    navigate(`/assistant/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const categories = [
    { id: 1, label: "Exercises", icon: Dumbbell, prompt: "Tell me about effective exercises for building strength" },
    { id: 2, label: "Pain", icon: Activity, prompt: "I'm experiencing some workout-related pain, can you help?" },
    { id: 3, label: "Diet", icon: Salad, prompt: "What should I eat for my fitness goals?" },
    { id: 4, label: "Mass", icon: Weight, prompt: "How can I build muscle mass effectively?" },
    { id: 5, label: "Toning", icon: Heart, prompt: "What's the best way to tone my body?" },
    { id: 6, label: "Program", icon: ClipboardList, prompt: "Help me create a workout program" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 px-4 overflow-y-auto" role="main" aria-label="AI Assistant page">
      <MobileHeader />

      <div className="mt-6">
        <h1 className="text-2xl font-bold">
          <span className="flex items-center gap-2 text-cozy-ink">
            <MessageCircle className="w-6 h-6" aria-hidden="true" />
            Hello <span className="italic text-cozy-primary" data-testid="text-user-name">{userName}</span>
          </span>
        </h1>
        <h2 className="text-2xl font-bold mt-2 text-cozy-ink">How Can I Help You Today?</h2>
      </div>

      {/* Main Chat Button */}
      <div className="mt-6">
        <Link 
          to="/assistant/chat" 
          className="block focus:outline-none focus:ring-2 focus:ring-cozy-primary rounded-2xl"
          aria-label="Start a conversation with AI assistant"
          data-testid="button-start-chat"
        >
          <div className="relative bg-cozy-primary rounded-2xl p-0.5 shadow-cozy-md hover:shadow-cozy-md transition-all duration-300">
            <div className="bg-cozy-surface rounded-[15px] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-cozy-surface flex items-center justify-center shadow-inner" aria-hidden="true">
                <MessageCircle className="w-7 h-7 text-cozy-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-cozy-ink font-semibold text-base">Start a conversation</h3>
                <p className="text-cozy-ink-soft text-sm">Ask me anything about fitness</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-cozy-sage-soft flex items-center justify-center" aria-hidden="true">
                <MessageCircle className="w-5 h-5 text-cozy-sage-deep" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Categories */}
      <section className="mt-8" aria-labelledby="categories-heading">
        <h3 id="categories-heading" className="text-cozy-ink font-semibold text-lg mb-4">Categories</h3>
        <ul className="grid grid-cols-3 gap-4 list-none p-0 m-0">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <li key={category.id}>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleCategoryClick(category.prompt)}
                  className="w-full bg-muted rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-muted/80 transition-all cursor-pointer active:scale-95 aspect-square focus:outline-none focus:ring-2 focus:ring-cozy-primary"
                  aria-label={`Ask about ${category.label}`}
                  data-testid={`button-category-${category.label.toLowerCase()}`}
                >
                  <Icon className="w-8 h-8 text-cozy-ink" aria-hidden="true" />
                  <p className="text-cozy-ink text-sm font-medium">{category.label}</p>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </section>

      <NavigationBar />
    </div>
  );
}
