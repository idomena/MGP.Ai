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
      return <Dumbbell className="w-4 h-4 text-cozy-sage-deep" />;
    case "workout_reminder":
      return <Bell className="w-4 h-4 text-cozy-sky-deep" />;
    case "streak":
      return <Flame className="w-4 h-4 text-cozy-streak-deep" />;
    case "milestone":
      return <Trophy className="w-4 h-4 text-cozy-streak-deep" />;
    default:
      return <Bell className="w-4 h-4 text-cozy-ink-soft" />;
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
      className="absolute top-full left-0 right-0 mt-2 mx-2 z-[60] rounded-2xl bg-cozy-surface border border-cozy-line shadow-cozy-md overflow-hidden"
      data-testid="notification-panel"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-cozy-line">
        <h3 className="text-cozy-ink font-semibold text-sm">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs text-cozy-ink-faint">
              {unreadCount} unread
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-cozy-primary hover:text-cozy-primary transition-colors"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read all</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-cozy-ink-faint hover:text-cozy-danger transition-colors"
              data-testid="button-clear-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-cozy-ink-faint hover:text-cozy-ink transition-colors ml-1"
            data-testid="button-close-notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <Bell className="w-8 h-8 text-cozy-ink-faint mb-3" />
            <p className="text-cozy-ink-faint text-sm">No notifications yet</p>
            <p className="text-cozy-ink-faint text-xs mt-1">
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
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-cozy-sunk ${
                    !notification.read ? "bg-cozy-primary-soft" : ""
                  }`}
                  data-testid={`notification-item-${notification.id}`}
                >
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === "workout_complete"
                        ? "bg-cozy-sage-soft"
                        : notification.type === "workout_reminder"
                        ? "bg-cozy-sky-soft"
                        : notification.type === "streak"
                        ? "bg-cozy-streak-soft"
                        : "bg-cozy-streak-soft"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm font-medium truncate ${
                          !notification.read ? "text-cozy-ink" : "text-cozy-ink-soft"
                        }`}
                        data-testid={`notification-title-${notification.id}`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-cozy-primary flex-shrink-0" />
                      )}
                    </div>
                    <p
                      className="text-xs text-cozy-ink-faint mt-0.5 line-clamp-2"
                      data-testid={`notification-message-${notification.id}`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-cozy-ink-faint mt-1">
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
