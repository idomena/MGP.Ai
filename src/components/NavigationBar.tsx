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
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#7c57ff] via-[#9d6fff] to-[#b88eff] z-50">
      <div className="flex justify-around items-center h-20 relative">
        {/* Center floating button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link to="/assistant/chat">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl">
              <MessageCircle className="w-8 h-8 text-[#7c57ff]" />
            </div>
          </Link>
        </div>

        {navItems.map((item, index) => {
          // Skip the middle item (index 2) since we have a centered floating button
          if (index === 2) return <div key={item.name} className="flex-1" />;
          
          const isActive = currentPath === item.path || 
                          (item.path === "/workout" && currentPath.startsWith("/workout"));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? "text-[#aaf163]" : "text-white/70"
                }`}
              />
              <span
                className={`text-xs mt-1 ${
                  isActive ? "text-[#aaf163]" : "text-white/70"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
