import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface AppNotification {
  id: string;
  type: "workout_complete" | "workout_reminder" | "streak" | "milestone";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const MAX_NOTIFICATIONS = 50;

function getStorageKey(userId: string): string {
  return `notifications_${userId}`;
}

function loadNotifications(userId: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNotifications(userId: string, notifications: AppNotification[]) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(notifications));
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (user?.id) {
      setNotifications(loadNotifications(user.id));
    } else {
      setNotifications([]);
    }
  }, [user?.id]);

  const persist = useCallback(
    (updated: AppNotification[]) => {
      if (!user?.id) return;
      saveNotifications(user.id, updated);
      setNotifications(updated);
    },
    [user?.id]
  );

  const addNotification = useCallback(
    (
      type: AppNotification["type"],
      title: string,
      message: string
    ) => {
      if (!user?.id) return;
      const newNotification: AppNotification = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
      };
      const current = loadNotifications(user.id);
      const updated = [newNotification, ...current].slice(0, MAX_NOTIFICATIONS);
      persist(updated);
    },
    [user?.id, persist]
  );

  const markAsRead = useCallback(
    (id: string) => {
      if (!user?.id) return;
      const current = loadNotifications(user.id);
      const updated = current.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      persist(updated);
    },
    [user?.id, persist]
  );

  const markAllAsRead = useCallback(() => {
    if (!user?.id) return;
    const current = loadNotifications(user.id);
    const updated = current.map((n) => ({ ...n, read: true }));
    persist(updated);
  }, [user?.id, persist]);

  const clearAll = useCallback(() => {
    if (!user?.id) return;
    persist([]);
  }, [user?.id, persist]);

  const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }, []);

  const sendBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      try {
        new Notification(title, {
          body,
          icon: "/logo.png",
        });
      } catch {
        // Silent fail for environments that don't support notifications
      }
    },
    []
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestBrowserPermission,
    sendBrowserNotification,
  };
}
