import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Flame } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "@/components/NotificationPanel";
import { cozy } from "@/lib/cozyTheme";

interface HomeHeaderProps {
  name: string;
  avatarUrl?: string;
  streak: number;
  subline: string;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
});

export default function HomeHeader({ name, avatarUrl, streak, subline }: HomeHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const initial = (name.trim()[0] || "M").toUpperCase();

  return (
    <header
      className="relative px-5"
      role="banner"
      style={{ paddingTop: "calc(var(--safe-area-inset-top, 0px) + 18px)" }}
    >
      {/* Top row: who + streak */}
      <motion.div className="flex items-center gap-3" {...rise(0)}>
        <Link
          to="/profile"
          aria-label="Go to profile"
          data-testid="button-profile"
          className="cozy-press shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cozy-primary)]"
          style={{ minHeight: 0 }}
        >
          <span
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-[17px] font-semibold"
            style={{
              background: cozy.primarySoft,
              color: cozy.primaryDeep,
              boxShadow: `0 0 0 3px ${cozy.surface}, ${cozy.shadowSm}`,
            }}
          >
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : initial}
          </span>
        </Link>

        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[13.5px]" style={{ color: cozy.inkSoft }}>{greeting()},</p>
          <p className="truncate text-[17px] font-semibold" style={{ color: cozy.ink }}>{name}</p>
        </div>

        <div
          className="flex h-10 items-center gap-1.5 rounded-full pl-2.5 pr-3.5"
          style={{ background: cozy.streakSoft, boxShadow: cozy.highlight }}
          aria-label={`${streak} day streak`}
          data-testid="streak-chip"
        >
          <Flame size={19} color={cozy.streak} fill={cozy.streak} fillOpacity={0.25} strokeWidth={2.2} aria-hidden />
          <span className="text-[16px] font-bold tabular-nums" style={{ color: cozy.streakDeep }}>{streak}</span>
        </div>

        <button
          className="cozy-press relative flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cozy-primary)]"
          style={{ background: cozy.surface, border: `1px solid ${cozy.line}`, boxShadow: cozy.shadowSm, minHeight: 0, minWidth: 0 }}
          aria-label="Notifications"
          data-testid="button-notifications"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <Bell size={18} color={cozy.inkSoft} strokeWidth={2.1} aria-hidden />
          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ background: cozy.streak, border: `2px solid ${cozy.bg}` }}
              data-testid="badge-notification-count"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="cozy-display mt-7 text-[34px] font-semibold leading-[1.08]"
        style={{ color: cozy.ink, fontSize: 34 }}
        {...rise(0.08)}
      >
        Ready to get <span className="italic" style={{ color: cozy.primary }}>stronger?</span>
      </motion.h1>
      <motion.p className="mt-2 text-[15px] leading-snug" style={{ color: cozy.inkSoft }} {...rise(0.14)}>
        {subline}
      </motion.p>

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
