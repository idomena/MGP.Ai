import { Home, Dumbbell, MessageCircle, Apple, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

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
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe" 
      role="navigation" 
      aria-label="Main navigation"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] rounded-t-3xl" aria-hidden="true" />
        <div className="absolute inset-0 bg-black/30 rounded-t-3xl backdrop-blur-xl" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/40 rounded-t-3xl" aria-hidden="true" />
        
        <div className="relative flex justify-around items-center h-[72px]">
          {/* Center floating button with enhanced glow */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 -top-6"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.4 }}
          >
            <Link 
              to="/assistant/chat" 
              aria-label="Open AI Assistant chat"
              data-testid="button-assistant-chat"
              className="block focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-full"
            >
              <motion.div 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-[0_0_30px_rgba(124,87,255,0.6)] backdrop-blur-xl border-2 border-white/20 relative overflow-hidden"
                whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(124,87,255,0.8)" }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: [
                    "0 0 30px rgba(124,87,255,0.6)",
                    "0 0 50px rgba(124,87,255,0.8)",
                    "0 0 30px rgba(124,87,255,0.6)"
                  ]
                }}
                transition={{ 
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <MessageCircle className="w-8 h-8 text-white relative z-10" aria-hidden="true" />
              </motion.div>
            </Link>
          </motion.div>

          {navItems.map((item, index) => {
            if (index === 2) return <div key={item.name} className="flex-1" aria-hidden="true" />;
            
            const isActive = currentPath === item.path || 
                            (item.path === "/workout" && currentPath.startsWith("/workout"));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full focus:outline-none focus:ring-2 focus:ring-[#7c57ff] focus:ring-inset relative"
                aria-label={`Go to ${item.name}`}
                aria-current={isActive ? "page" : undefined}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <motion.div
                  className="flex flex-col items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="relative"
                    animate={isActive ? { 
                      filter: "drop-shadow(0 0 8px rgba(170,241,99,0.7))"
                    } : {}}
                  >
                    <Icon
                      className={`w-6 h-6 transition-colors duration-200 ${
                        isActive ? "text-[#aaf163]" : "text-white/70"
                      }`}
                      aria-hidden="true"
                    />
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-[#aaf163]"
                        style={{ x: "-50%" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                  <motion.span
                    className={`text-xs mt-1 transition-colors duration-200 ${
                      isActive ? "text-[#aaf163]" : "text-white/70"
                    }`}
                    animate={isActive ? { textShadow: "0 0 8px rgba(170,241,99,0.5)" } : { textShadow: "none" }}
                  >
                    {item.name}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
