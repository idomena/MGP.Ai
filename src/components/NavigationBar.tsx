import { Home, Dumbbell, MessageCircle, Apple, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import aiAssistantLogo from "@assets/image_1770399092998.png";

export default function NavigationBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Workout", path: "/workout", icon: Dumbbell },
    { name: "Assistant", path: "/assistant", icon: MessageCircle },
    { name: "Nutrition", path: "/nutrition", icon: Apple },
    { name: "More", path: "/profile", icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe" role="navigation" aria-label="Main navigation">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] rounded-t-3xl" aria-hidden="true" />
        <div className="absolute inset-0 bg-black/20 rounded-t-3xl backdrop-blur-xl" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/30 rounded-t-3xl" aria-hidden="true" />
        
        <div className="relative flex justify-around items-center h-[72px]">
          {/* Center floating button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <Link 
              to="/assistant/chat" 
              aria-label="Open AI Assistant chat"
              data-testid="button-assistant-chat"
              className="block focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-full"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-[0_0_30px_rgba(124,87,255,0.6)] backdrop-blur-xl border-2 border-white/20">
                <img src={aiAssistantLogo} alt="" className="w-8 h-8" aria-hidden="true" />
              </div>
            </Link>
          </div>

          {navItems.map((item, index) => {
            // Skip the middle item (index 2) since we have a centered floating button
            if (index === 2) return <div key={item.name} className="flex-1" aria-hidden="true" />;
            
            const isActive = currentPath === item.path || 
                            (item.path === "/workout" && currentPath.startsWith("/workout"));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full focus:outline-none focus:ring-2 focus:ring-[#7c57ff] focus:ring-inset"
                aria-label={`Go to ${item.name}`}
                aria-current={isActive ? "page" : undefined}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-[#aaf163] drop-shadow-[0_0_8px_rgba(170,241,99,0.5)]" : "text-white/70"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={`text-xs mt-1 transition-colors ${
                    isActive ? "text-[#aaf163] drop-shadow-[0_0_8px_rgba(170,241,99,0.5)]" : "text-white/70"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
