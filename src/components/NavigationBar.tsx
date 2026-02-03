import { Home, Dumbbell, MessageCircle, Apple, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
        <div className="absolute inset-0 bg-[#1a1a2e] rounded-t-2xl border-t border-white/10" aria-hidden="true" />
        
        <div className="relative flex justify-around items-center h-[72px]">
          {/* Center floating button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <Link 
              to="/assistant/chat" 
              aria-label="Open AI Assistant chat"
              data-testid="button-assistant-chat"
              className="block"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-lg border-2 border-[#0f0f1a]">
                <MessageCircle className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
            </Link>
          </div>

          {navItems.map((item, index) => {
            if (index === 2) return <div key={item.name} className="flex-1" aria-hidden="true" />;
            
            const isActive = currentPath === item.path || 
                            (item.path === "/workout" && currentPath.startsWith("/workout"));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full"
                aria-label={`Go to ${item.name}`}
                aria-current={isActive ? "page" : undefined}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-[#7c57ff]" : "text-white/50"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={`text-xs mt-1 transition-colors ${
                    isActive ? "text-[#7c57ff]" : "text-white/50"
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
