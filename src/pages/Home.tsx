import NavigationBar from "@/components/NavigationBar";
import JourneyPath, { workoutLabel } from "@/components/JourneyPath";
import HomeHeader from "@/components/home/HomeHeader";
import SchedulingAIAssistant from "@/components/SchedulingAIAssistant";
import ChangeWorkoutTypeModal from "@/components/ChangeWorkoutTypeModal";
import { useState, useEffect } from "react";
import { CheckCircle, CheckCircle2, Flame, TrendingUp, Target, Play, X, Lock, Moon, RefreshCw, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { getJourneyWindow } from "@/lib/journeyWindow";
import { cozy, cozyRaw } from "@/lib/cozyTheme";
import "@/styles/cozy.css";

// How much of the endless journey Home shows around today (rendering only).
const HOME_WINDOW_BEFORE = 2;
const HOME_WINDOW_AFTER = 12;

export default function Home() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<"weekly" | "quarterly">("weekly");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showSchedulingAI, setShowSchedulingAI] = useState(false);
  const [showChangeType, setShowChangeType] = useState(false);
  const [customSchedule, setCustomSchedule] = useState<Record<number, any>>({});

  const { isLoading: isLoadingOnboarding, needsOnboarding } = useOnboardingStatus();

  // Use hook for all workout progress data - single source of truth
  const {
    dayStatuses,
    currentDay,
    completedDays,
    userStats,
    isLoading: isLoadingProgress,
    error: progressError,
    getWorkoutForDay,
    moveWorkout,
    changeWorkoutType,
    isTodayCompleted,
    todayIsRestDay,
    refetch,
  } = useWorkoutProgress();

  useEffect(() => {
    if (!isLoadingOnboarding && needsOnboarding) {
      navigate("/onboarding");
    }
  }, [isLoadingOnboarding, needsOnboarding, navigate]);

  // Warm page chrome while Home is mounted (overscroll + browser UI colour).
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    const meta = document.querySelector('meta[name="theme-color"]');
    const prevTheme = meta?.getAttribute("content");
    document.body.style.backgroundColor = cozyRaw.bg;
    meta?.setAttribute("content", cozyRaw.bg);
    return () => {
      document.body.style.backgroundColor = prevBg;
      if (meta && prevTheme) meta.setAttribute("content", prevTheme);
    };
  }, []);

  if (isLoadingOnboarding) {
    return (
      <div className="cozy-root flex h-screen flex-col items-center justify-center gap-5">
        <p className="cozy-display text-[28px] font-semibold" style={{ color: cozy.ink }}>MGP.AI</p>
        <motion.div
          className="h-8 w-8 rounded-full"
          style={{ border: `3px solid ${cozy.primarySoft}`, borderTopColor: cozy.primary }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const defaultWorkoutDetails = {
    12: { name: "Chest & Triceps", muscles: "Chest, Triceps", time: "35 min", exercises: 5, focus: "Chest" },
    13: { name: "Back & Biceps", muscles: "Back, Biceps", time: "40 min", exercises: 4, focus: "Back" },
    14: { name: "Legs", muscles: "Quads, Hamstrings", time: "45 min", exercises: 6, focus: "Legs" },
    15: { name: "Shoulders & Core", muscles: "Shoulders, Abs", time: "30 min", exercises: 4, focus: "Shoulders" },
    16: { name: "Back + Front hand", muscles: "Back, Biceps, Forearms", time: "28 min", exercises: 3, focus: "Back" },
  };

  // Merge default schedule with custom schedule
  const workoutDetails = { ...defaultWorkoutDetails, ...customSchedule };

  const handleViewChange = async (view: "weekly" | "quarterly") => {
    if (view === activeView || isTransitioning) return;
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setActiveView(view);
    setIsTransitioning(false);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setShowWorkoutModal(true);
  };

  const handleStartWorkout = (day: number) => {
    navigate(`/workout/${day}`);
  };

  const handleChangeWorkoutType = async (newType: string, newTitle: string) => {
    if (!selectedDay) return false;
    const success = await changeWorkoutType(selectedDay, newType, newTitle);
    if (success) {
      toast.success(`Day ${selectedDay} changed to ${newTitle}`);
    } else {
      toast.error("Failed to change workout type. Please try again.");
    }
    return success;
  };

  const handleRescheduleWorkout = async (fromDay: number, toDay: number) => {
    if (!authUser || fromDay === toDay) return;

    const workoutToMove = workoutDetails[fromDay as keyof typeof workoutDetails];
    if (!workoutToMove) return;

    setCustomSchedule(prev => {
      const updated = { ...prev };
      updated[toDay] = workoutToMove;
      delete updated[fromDay];
      return updated;
    });

    toast.success(`Workout moved from Day ${fromDay} to Day ${toDay}!`);
    setShowRescheduleModal(false);
    setShowWorkoutModal(false);
  };

  // ─── Presentation data ──────────────────────────────────────────────────
  const meta = authUser?.user_metadata ?? {};
  const firstName =
    (meta.full_name as string | undefined)?.trim().split(/\s+/)[0] ||
    authUser?.email?.split("@")[0] ||
    "friend";
  const avatarUrl = (meta.avatar_url as string | undefined) || (meta.picture as string | undefined);

  const todayWorkout = currentDay ? getWorkoutForDay(currentDay) : null;
  const todayMeta = todayWorkout && todayWorkout.exercisesCount > 0
    ? `${todayWorkout.duration} · ${todayWorkout.exercisesCount} exercises`
    : undefined;

  // Everything below reads today's real status; isTodayCompleted is also true for skipped days.
  const todayStatus = dayStatuses.find(d => d.day === currentDay)?.status;
  // Streak/XP are real hook values, but they read 0 until the first load finishes — don't show them before that.
  const hasProgress = dayStatuses.length > 0;
  const subline = !dayStatuses.length
    ? "Your journey starts with one step."
    : todayStatus === "completed"
      ? todayIsRestDay ? "Rest day done. You're still progressing." : "Today's session is done. Enjoy the glow."
      : todayStatus === "skipped"
        ? "Today slipped by. Tomorrow is a fresh step."
        : todayIsRestDay
          ? "Rest day. Recharge — you're still progressing."
          : `Day ${currentDay} of your journey. One step at a time.`;

  const completionPct = userStats.totalWorkouts > 0
    ? Math.round((userStats.workoutsCompleted / userStats.totalWorkouts) * 100)
    : 0;
  const now = new Date();
  const quarterLabel = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;

  const statusPill = (bg: string, color: string, text: string) => (
    <div className="rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: bg, color }}>{text}</div>
  );

  return (
    <div className="cozy-root relative min-h-screen overflow-x-hidden" role="main" aria-label="Home page">
      {/* Soft morning light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[340px]"
        style={{ background: `radial-gradient(120% 80% at 50% 0%, ${cozy.surface} 0%, transparent 70%)` }}
      />

      <div className="relative mx-auto max-w-md">
        <HomeHeader name={firstName} avatarUrl={avatarUrl} streak={hasProgress ? userStats.streak : null} subline={subline} />

        {/* View switch + quiet XP */}
        <motion.div
          className="mt-4 flex items-center justify-between px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center gap-5" role="tablist" aria-label="Program view selector">
            {([
              ["weekly", "Journey"],
              ["quarterly", "Overview"],
            ] as const).map(([view, label]) => {
              const selected = activeView === view;
              return (
                <button
                  key={view}
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${view}-panel`}
                  onClick={() => handleViewChange(view)}
                  disabled={isTransitioning}
                  className="relative py-2 text-[15px] transition-colors focus:outline-none focus-visible:underline"
                  style={{ color: selected ? cozy.ink : cozy.inkFaint, fontWeight: selected ? 600 : 500, minWidth: 0 }}
                  data-testid={`tab-${view}`}
                >
                  {label}
                  {selected && (
                    <motion.span
                      layoutId="home-tab-dot"
                      className="absolute -bottom-0.5 left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full"
                      style={{ background: cozy.primary }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {hasProgress && (
            <div className="flex items-center gap-1.5 text-[13.5px] font-medium" style={{ color: cozy.inkSoft }} data-testid="text-xp">
              <Sparkles size={15} color={cozy.primary} aria-hidden />
              <span className="tabular-nums" style={{ color: cozy.ink, fontWeight: 600 }}>{userStats.xp.toLocaleString()}</span> XP
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeView === "quarterly" ? (
            <motion.section
              key="overview"
              id="quarterly-panel"
              className="px-5 pb-36 pt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35 }}
            >
              <div
                className="flex flex-col items-center rounded-[26px] px-6 py-7"
                style={{ background: cozy.surface, border: `1px solid ${cozy.line}`, boxShadow: `${cozy.shadowMd}, ${cozy.highlight}` }}
              >
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: cozy.inkSoft }}>{quarterLabel}</p>
                <div className="relative mt-4 h-40 w-40">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
                    <circle cx="50" cy="50" r="42" fill="none" stroke={cozy.path} strokeWidth="9" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke={cozy.primary} strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={`${completionPct * 2.64} ${100 * 2.64}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="cozy-display text-[40px] font-semibold leading-none" style={{ color: cozy.ink }}>{completionPct}%</span>
                    <span className="mt-1 text-[13px]" style={{ color: cozy.inkSoft }}>complete</span>
                  </div>
                </div>
                <p className="mt-4 text-[15px]" style={{ color: cozy.inkSoft }}>
                  Week <span style={{ color: cozy.ink, fontWeight: 600 }}>{Math.max(1, Math.ceil(currentDay / 7))}</span> of your journey
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { icon: CheckCircle, tint: cozy.primarySoft, color: cozy.primary, title: "Workouts", sub: "Completed so far", value: `${userStats.workoutsCompleted}/${userStats.totalWorkouts}` },
                  { icon: Sparkles, tint: cozy.primarySoft, color: cozy.primary, title: "XP earned", sub: "All time", value: userStats.xp.toLocaleString() },
                  { icon: Flame, tint: cozy.streakSoft, color: cozy.streak, title: "Current streak", sub: "Days in a row", value: `${userStats.streak}` },
                  { icon: TrendingUp, tint: cozy.sageSoft, color: cozy.sageDeep, title: "Consistency", sub: "Workouts per day so far", value: `${currentDay > 0 ? Math.round((userStats.workoutsCompleted / currentDay) * 100) : 0}%` },
                ].map(({ icon: Icon, tint, color, title, sub, value }) => (
                  <div
                    key={title}
                    className="flex items-center gap-4 rounded-[20px] px-4 py-3.5"
                    style={{ background: cozy.surface, border: `1px solid ${cozy.line}`, boxShadow: cozy.shadowSm }}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: tint }}>
                      <Icon size={21} color={color} aria-hidden />
                    </span>
                    <div className="flex-1 leading-tight">
                      <p className="text-[15.5px] font-semibold" style={{ color: cozy.ink }}>{title}</p>
                      <p className="text-[13px]" style={{ color: cozy.inkSoft }}>{sub}</p>
                    </div>
                    <p className="cozy-display text-[26px] font-semibold" style={{ color: cozy.ink }}>{value}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="journey"
              id="weekly-panel"
              className="mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <JourneyPath
                dayStatuses={getJourneyWindow(dayStatuses, currentDay, HOME_WINDOW_BEFORE, HOME_WINDOW_AFTER)}
                currentDay={currentDay}
                onDayClick={handleDayClick}
                isLoading={isLoadingProgress}
                error={progressError}
                onRetry={refetch}
                onStartToday={handleStartWorkout}
                todayMeta={todayMeta}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Legal links (Home-styled footer) */}
        <footer className="flex flex-col items-center gap-1.5 pb-32 pt-2 text-[12.5px]" style={{ color: cozy.inkFaint }} data-testid="footer">
          <div className="flex items-center gap-3">
            <Link to="/privacy-policy" className="hover:underline" data-testid="link-privacy-policy">Privacy Policy</Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="hover:underline" data-testid="link-terms">Terms of Service</Link>
          </div>
          <p data-testid="text-copyright">MGP.AI {now.getFullYear()}</p>
        </footer>
      </div>

      {/* Workout Modal */}
      <Dialog open={showWorkoutModal} onOpenChange={setShowWorkoutModal}>
        <DialogContent
          className="cozy-root mx-auto w-[calc(100%-32px)] max-w-md rounded-[28px] border p-6 sm:rounded-[28px]"
          style={{ background: cozy.surface, borderColor: cozy.line, color: cozy.ink, boxShadow: cozy.shadowLg }}
        >
          <VisuallyHidden>
            <DialogTitle>Workout Details</DialogTitle>
          </VisuallyHidden>
          {selectedDay && (() => {
            const dayStatus = dayStatuses.find(d => d.day === selectedDay);
            const workout = getWorkoutForDay(selectedDay);
            const isCompleted = dayStatus?.status === "completed";
            const isActive = dayStatus?.status === "active";
            const isLocked = dayStatus?.status === "locked";
            const tile = { background: cozy.surfaceSunk, border: `1px solid ${cozy.line}` };

            return (
            <div className="space-y-4">
              <div className="flex items-center justify-between pr-8">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: cozy.inkSoft }}>Day {selectedDay}</p>
                  <h3 className="cozy-display mt-0.5 text-[24px] font-semibold" style={{ color: cozy.ink }}>
                    {dayStatus ? workoutLabel(dayStatus) : workout.title}
                  </h3>
                </div>
                {isCompleted && statusPill(cozy.sageSoft, cozy.sageDeep, "Completed")}
                {isActive && statusPill(cozy.primarySoft, cozy.primaryDeep, "Today")}
                {isLocked && statusPill(cozy.surfaceSunk, cozy.inkSoft, "Upcoming")}
                {dayStatus?.status === "skipped" && statusPill(cozy.streakSoft, cozy.streakDeep, "Missed")}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-3" style={tile}>
                  <p className="mb-1 text-[12.5px]" style={{ color: cozy.inkSoft }}>Duration</p>
                  <p className="font-semibold">{workout.duration}</p>
                </div>
                <div className="rounded-2xl p-3" style={tile}>
                  <p className="mb-1 text-[12.5px]" style={{ color: cozy.inkSoft }}>Exercises</p>
                  <p className="font-semibold">{workout.exercisesCount}</p>
                </div>
              </div>

              <div className="rounded-2xl p-3" style={tile}>
                <p className="mb-1 text-[12.5px]" style={{ color: cozy.inkSoft }}>Workout Type</p>
                <p className="font-semibold capitalize">{workout.workoutType}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowWorkoutModal(false);
                    setShowChangeType(true);
                  }}
                  className="cozy-press flex items-center justify-center gap-2 rounded-2xl py-3 font-medium"
                  style={{ background: cozy.surface, border: `1px solid ${cozy.line}`, boxShadow: cozy.shadowSm, color: cozy.ink }}
                  data-testid="button-change-type-modal"
                >
                  <RefreshCw className="h-4 w-4" style={{ color: cozy.inkSoft }} />
                  <span className="text-sm">Change</span>
                </button>
                <button
                  onClick={() => {
                    setShowWorkoutModal(false);
                    setTimeout(() => setShowSchedulingAI(true), 150);
                  }}
                  className="cozy-press flex items-center justify-center gap-2 rounded-2xl py-3 font-medium"
                  style={{ background: cozy.primarySoft, color: cozy.primaryDeep }}
                  data-testid="button-ai-schedule-modal"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">AI Schedule</span>
                </button>
              </div>

              {(() => {
                const isRestDay = workout.workoutType === "rest";
                const banner = (bg: string, color: string, icon: React.ReactNode, text: string, note: string) => (
                  <div className="space-y-2.5">
                    <div className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-semibold" style={{ background: bg, color }}>
                      {icon}
                      {text}
                    </div>
                    <p className="text-center text-[13.5px]" style={{ color: cozy.inkSoft }}>{note}</p>
                  </div>
                );

                // Completed workouts show completed state
                if (isCompleted) {
                  return banner(cozy.sageSoft, cozy.sageDeep, <CheckCircle2 className="h-5 w-5" />,
                    isRestDay ? "Rest Day Complete" : "Workout Completed",
                    isRestDay ? "You earned this rest!" : "Great job on completing this workout!");
                }

                // Skipped workouts
                if (dayStatus?.status === "skipped") {
                  return banner(cozy.streakSoft, cozy.streakDeep, <X className="h-5 w-5" />,
                    "Workout Missed", "No worries — keep going with today's workout!");
                }

                // Active + today completed
                if (isActive && isTodayCompleted) {
                  return banner(cozy.sageSoft, cozy.sageDeep, <CheckCircle2 className="h-5 w-5" />,
                    "Today's Workout Completed", "Great job! Come back tomorrow for your next workout.");
                }

                // Active rest day - auto-complete message
                if (isActive && isRestDay) {
                  return banner(cozy.restSoft, cozy.restDeep, <Moon className="h-5 w-5" />,
                    "Rest Day — Recharge", "Take it easy today. Your body grows stronger while it recovers.");
                }

                // Active day shows start button
                if (isActive) {
                  return (
                    <motion.button
                      whileTap={{ scale: 0.97, y: 2 }}
                      onClick={() => {
                        setShowWorkoutModal(false);
                        handleStartWorkout(selectedDay);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[17px] font-semibold text-white"
                      style={{ background: cozy.primary, boxShadow: `0 4px 0 ${cozy.primaryDeep}, 0 10px 22px ${cozy.primaryGlow}` }}
                      data-testid="button-start-modal"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      Start Workout
                    </motion.button>
                  );
                }

                // Locked days show locked state
                return banner(cozy.surfaceSunk, cozy.inkSoft, <Lock className="h-5 w-5" />,
                  "Coming up", "This workout opens on its scheduled day.");
              })()}
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Scheduling AI Assistant */}
      <SchedulingAIAssistant
        isOpen={showSchedulingAI}
        onClose={() => setShowSchedulingAI(false)}
        currentDay={currentDay}
        selectedDay={selectedDay}
        dayStatuses={dayStatuses.map(ds => ({
          day: ds.day,
          title: ds.title,
          workoutType: ds.workoutType,
          date: ds.date,
        }))}
        onMoveWorkout={async (fromDay, toDay) => {
          const success = await moveWorkout(fromDay, toDay);
          if (success) {
            toast.success(`Workout moved from Day ${fromDay} to Day ${toDay}`);
          }
          return success;
        }}
        onSkipWorkout={async (day) => {
          const success = await changeWorkoutType(day, "rest", "Rest Day");
          if (success) {
            toast.success(`Day ${day} is now a Rest Day`);
          }
          return success;
        }}
        onChangeWorkoutType={async (day, newType, newTitle) => {
          const success = await changeWorkoutType(day, newType, newTitle);
          if (success) {
            toast.success(`Day ${day} changed to ${newTitle}`);
          }
          return success;
        }}
      />

      {/* Change Workout Type Modal */}
      {selectedDay && (
        <ChangeWorkoutTypeModal
          isOpen={showChangeType}
          onClose={() => setShowChangeType(false)}
          currentType={getWorkoutForDay(selectedDay).workoutType}
          dayNumber={selectedDay}
          onChangeType={handleChangeWorkoutType}
        />
      )}

      <NavigationBar />
    </div>
  );
}
