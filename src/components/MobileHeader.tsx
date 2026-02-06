import { useState } from "react";
import Logo from "./Logo";
import { Bell, User } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "./NotificationPanel";

export default function MobileHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  return (
    <header 
      className="relative flex items-center justify-between py-4" 
      role="banner"
      style={{ paddingTop: 'calc(var(--safe-area-inset-top, 0px) + 1rem)' }}
    >
      <Link 
        to="/profile" 
        aria-label="Go to profile" 
        data-testid="button-profile"
        className="focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-full"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00c6ff] to-[#7c57ff] flex items-center justify-center text-white font-bold shadow-lg">
          <User className="w-6 h-6" aria-hidden="true" />
        </div>
      </Link>
      
      <Logo />
      
      <button 
        className="relative w-12 h-12 rounded-full bg-muted flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#7c57ff]"
        aria-label="Notifications"
        data-testid="button-notifications"
        onClick={() => setShowNotifications((prev) => !prev)}
      >
        <Bell className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 border-2 border-[#0f0f1a]"
            data-testid="badge-notification-count"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
