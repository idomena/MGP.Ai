import { Home, Calendar, Apple, Dumbbell, Award, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function NavigationBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Calendar", path: "/calendar", icon: Calendar },
    { name: "Nutrition", path: "/nutrition", icon: Apple },
    { name: "Workout", path: "/workout", icon: Dumbbell },
    { name: "Rewards", path: "/rewards", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#3f3f3f] z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? "text-[#7c57ff]" : "text-gray-400"
                }`}
              />
              <span
                className={`text-xs mt-1 ${
                  isActive ? "text-[#7c57ff]" : "text-gray-400"
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
