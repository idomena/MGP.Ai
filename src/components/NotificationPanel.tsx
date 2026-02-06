import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Bell,
  Flame,
  Trophy,
  CheckCheck,
  Trash2,
  X,
} from "lucide-react";
import type { AppNotification } from "@/hooks/useNotifications";

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getNotificationIcon(type: AppNotification["type"]) {
  switch (type) {
    case "workout_complete":
      return <Dumbbell className="w-4 h-4 text-green-400" />;
    case "workout_reminder":
      return <Bell className="w-4 h-4 text-[#60a5fa]" />;
    case "streak":
      return <Flame className="w-4 h-4 text-orange-400" />;
    case "milestone":
      return <Trophy className="w-4 h-4 text-yellow-400" />;
    default:
      return <Bell className="w-4 h-4 text-white/60" />;
  }
}

export default function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onClose,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        const bellButton = document.querySelector(
          '[data-testid="button-notifications"]'
        );
        if (bellButton && bellButton.contains(e.target as Node)) return;
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-0 right-0 mt-2 mx-2 z-[60] rounded-2xl bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden"
      data-testid="notification-panel"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs text-white/40">
              {unreadCount} unread
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-[#7c57ff] hover:text-[#7c57ff]/80 transition-colors"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read all</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-red-400 transition-colors"
              data-testid="button-clear-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors ml-1"
            data-testid="button-close-notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <Bell className="w-8 h-8 text-white/20 mb-3" />
            <p className="text-white/40 text-sm">No notifications yet</p>
            <p className="text-white/20 text-xs mt-1">
              Stay active and they will show up here
            </p>
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  onClick={() => {
                    if (!notification.read) onMarkAsRead(notification.id);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-white/5 ${
                    !notification.read ? "bg-[#7c57ff]/5" : ""
                  }`}
                  data-testid={`notification-item-${notification.id}`}
                >
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === "workout_complete"
                        ? "bg-green-500/10"
                        : notification.type === "workout_reminder"
                        ? "bg-blue-500/10"
                        : notification.type === "streak"
                        ? "bg-orange-500/10"
                        : "bg-yellow-500/10"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm font-medium truncate ${
                          !notification.read ? "text-white" : "text-white/70"
                        }`}
                        data-testid={`notification-title-${notification.id}`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-[#7c57ff] flex-shrink-0" />
                      )}
                    </div>
                    <p
                      className="text-xs text-white/50 mt-0.5 line-clamp-2"
                      data-testid={`notification-message-${notification.id}`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">
                      {getRelativeTime(notification.timestamp)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
