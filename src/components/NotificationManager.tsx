import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { useNotifications } from "@/hooks/useNotifications";

const COMPLETION_MESSAGES = [
  "You crushed it today! Keep pushing forward.",
  "Another workout in the books! Great effort.",
  "Consistency is key - great job showing up!",
  "That was solid work. Your future self thanks you.",
  "Way to get it done! Rest up and recover well.",
];

const REMINDER_MESSAGES = [
  "Your workout is waiting for you. You have got this!",
  "A little effort goes a long way. Time to move!",
  "Stay on track - your body will thank you later.",
  "Every rep counts. Let us make today count!",
  "Keep the momentum going - start your workout now.",
];

const MILESTONES = [5, 10, 15, 20];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getReminderKey(userId: string): string {
  return `notification_reminder_date_${userId}`;
}

function getMilestoneKey(userId: string): string {
  return `notification_milestones_${userId}`;
}

function getCompletionKey(userId: string): string {
  return `notification_completion_day_${userId}`;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NotificationManager() {
  const { user } = useAuth();
  const {
    isTodayCompleted,
    todayIsRestDay,
    userStats,
    isLoading,
    currentDay,
  } = useWorkoutProgress();
  const {
    addNotification,
    sendBrowserNotification,
    requestBrowserPermission,
  } = useNotifications();

  const prevCompletedRef = useRef<boolean>(false);
  const hasInitRef = useRef(false);

  useEffect(() => {
    if (user?.id && "Notification" in window && Notification.permission === "default") {
      requestBrowserPermission();
    }
  }, [user?.id, requestBrowserPermission]);

  useEffect(() => {
    if (isLoading || !user?.id) return;

    if (!hasInitRef.current) {
      prevCompletedRef.current = isTodayCompleted;
      hasInitRef.current = true;

      handleReminder();
      handleMilestones();
      return;
    }

    if (isTodayCompleted && !prevCompletedRef.current) {
      handleWorkoutComplete();
    }

    prevCompletedRef.current = isTodayCompleted;
  }, [isTodayCompleted, isLoading, user?.id]);

  useEffect(() => {
    if (isLoading || !user?.id || !hasInitRef.current) return;
    handleMilestones();
  }, [userStats.workoutsCompleted]);

  function handleWorkoutComplete() {
    if (!user?.id) return;

    const completionKey = getCompletionKey(user.id);
    const todayStr = getTodayStr();
    const lastCompletionDay = localStorage.getItem(completionKey);
    if (lastCompletionDay === todayStr) return;
    localStorage.setItem(completionKey, todayStr);

    const msg = pickRandom(COMPLETION_MESSAGES);
    addNotification("workout_complete", "Workout Complete!", msg);
    sendBrowserNotification("Workout Complete!", msg);

    if (userStats.streak >= 3) {
      const streakMsg = `You are on fire! ${userStats.streak} day streak! Keep it up!`;
      addNotification("streak", "Streak Going Strong!", streakMsg);
      sendBrowserNotification("Streak Going Strong!", streakMsg);
    }
  }

  function handleReminder() {
    if (!user?.id) return;
    if (isTodayCompleted || todayIsRestDay) return;

    const hour = new Date().getHours();
    if (hour < 14) return;

    const reminderKey = getReminderKey(user.id);
    const todayStr = getTodayStr();
    const lastReminder = localStorage.getItem(reminderKey);
    if (lastReminder === todayStr) return;
    localStorage.setItem(reminderKey, todayStr);

    const msg = pickRandom(REMINDER_MESSAGES);
    addNotification("workout_reminder", "Don't Forget Your Workout!", msg);
    sendBrowserNotification("Don't Forget Your Workout!", msg);
  }

  function handleMilestones() {
    if (!user?.id) return;

    const milestoneKey = getMilestoneKey(user.id);
    let reached: number[] = [];
    try {
      reached = JSON.parse(localStorage.getItem(milestoneKey) || "[]");
    } catch {
      reached = [];
    }

    const count = userStats.workoutsCompleted;
    for (const m of MILESTONES) {
      if (count >= m && !reached.includes(m)) {
        reached.push(m);
        const msg = `You have completed ${m} workouts! That is an incredible achievement. Keep going!`;
        addNotification(
          "milestone",
          `Milestone Reached - ${m} Workouts!`,
          msg
        );
        sendBrowserNotification(`Milestone Reached!`, msg);
      }
    }

    localStorage.setItem(milestoneKey, JSON.stringify(reached));
  }

  return null;
}
