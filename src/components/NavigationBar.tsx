import { Home, Dumbbell, MessageCircle, Salad, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cozy } from "@/lib/cozyTheme";
import "@/styles/cozy.css";

export default function NavigationBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Workout", path: "/workout", icon: Dumbbell },
    { name: "Assistant", path: "/assistant", icon: MessageCircle },
    { name: "Nutrition", path: "/nutrition", icon: Salad },
    { name: "More", path: "/profile", icon: MoreHorizontal },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-3"
      style={{ paddingBottom: "calc(var(--safe-area-inset-bottom, 0px) + 10px)", fontFamily: cozy.fontBody }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className="relative mx-auto flex h-[66px] max-w-md items-center rounded-[28px] px-1.5"
        style={{
          background: cozy.surface,
          border: `1px solid ${cozy.line}`,
          boxShadow: `${cozy.shadowLg}, ${cozy.highlight}`,
        }}
      >
        {navItems.map((item, index) => {
          // The middle slot is the Assistant chat button
          if (index === 2) {
            return (
              <div key={item.name} className="flex flex-1 justify-center">
                <Link
                  to="/assistant/chat"
                  aria-label="Open AI Assistant chat"
                  data-testid="button-assistant-chat"
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cozy-primary)] focus-visible:ring-offset-2"
                >
                  <motion.span
                    whileTap={{ scale: 0.92, y: 2 }}
                    className="-mt-1 flex h-[50px] w-[50px] items-center justify-center rounded-full"
                    style={{
                      background: cozy.primary,
                      boxShadow: `0 3px 0 ${cozy.primaryDeep}, 0 8px 18px ${cozy.primaryGlow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    }}
                  >
                    <MessageCircle className="h-[22px] w-[22px] text-white" strokeWidth={2.2} aria-hidden="true" />
                  </motion.span>
                </Link>
              </div>
            );
          }

          const isActive = currentPath === item.path ||
                          (item.path === "/workout" && currentPath.startsWith("/workout"));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--cozy-primary)]"
              aria-label={`Go to ${item.name}`}
              aria-current={isActive ? "page" : undefined}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <motion.span
                whileTap={{ scale: 0.9 }}
                className="flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-200"
                style={{ background: isActive ? cozy.primarySoft : "transparent" }}
              >
                <Icon
                  className="h-[21px] w-[21px]"
                  color={isActive ? cozy.primary : cozy.inkSoft}
                  strokeWidth={isActive ? 2.4 : 2}
                  aria-hidden="true"
                />
              </motion.span>
              <span
                className="text-[11px] leading-none transition-colors"
                style={{ color: isActive ? cozy.primaryDeep : cozy.inkSoft, fontWeight: isActive ? 600 : 500 }}
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
