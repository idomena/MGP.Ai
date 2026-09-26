import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Moon, Lock, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkoutPlan } from "@/services/workoutPlanService";

interface WorkoutDay {
  dayNumber: number;
  title: string;
  workoutType: string;
  completed: boolean;
  date: string;
  status: "not_started" | "completed" | "skipped";
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [plan, setPlan] = useState<WorkoutDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    getWorkoutPlan(user.id)
      .then((data) => setPlan(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build a map from date string → workout day
  const planByDate = new Map<string, WorkoutDay>();
  for (const w of plan) {
    planByDate.set(w.date, w);
  }

  // Build the calendar grid for the current month
  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDow = firstDay.getDay(); // 0=Sun

  const todayStr = toYMD(today);

  const cells: (null | number)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const getDayInfo = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const workout = planByDate.get(dateStr);
    const isToday = dateStr === todayStr;
    return { dateStr, workout, isToday };
  };

  // Stats for the viewed month
  const monthWorkouts = plan.filter(w => {
    const [y, m] = w.date.split("-").map(Number);
    return y === viewYear && m === viewMonth + 1;
  });
  const completedThisMonth = monthWorkouts.filter(w => w.status === "completed").length;
  const scheduledThisMonth = monthWorkouts.filter(w => w.workoutType !== "rest").length;

  return (
    <div className="min-h-screen bg-cozy-bg pb-24 px-4 overflow-y-auto" role="main" aria-label="Calendar page">
      <MobileHeader />

      {/* Month navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-cozy-sunk hover:bg-cozy-sunk transition-colors focus:outline-none focus:ring-2 focus:ring-cozy-primary"
          aria-label="Previous month"
          data-testid="button-prev-month"
        >
          <ChevronLeft className="w-5 h-5 text-cozy-ink" />
        </button>

        <div className="text-center">
          <h1 className="text-cozy-ink text-xl font-bold" data-testid="text-current-month">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h1>
        </div>

        <button
          onClick={handleNextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-cozy-sunk hover:bg-cozy-sunk transition-colors focus:outline-none focus:ring-2 focus:ring-cozy-primary"
          aria-label="Next month"
          data-testid="button-next-month"
        >
          <ChevronRight className="w-5 h-5 text-cozy-ink" />
        </button>
      </div>

      {/* Month stats */}
      {!isLoading && scheduledThisMonth > 0 && (
        <div className="mt-4 flex gap-3">
          <div className="flex-1 bg-cozy-surface rounded-xl p-3 text-center border border-cozy-line">
            <p className="text-cozy-primary text-2xl font-bold">{completedThisMonth}</p>
            <p className="text-cozy-ink-faint text-xs mt-0.5">Completed</p>
          </div>
          <div className="flex-1 bg-cozy-surface rounded-xl p-3 text-center border border-cozy-line">
            <p className="text-cozy-ink text-2xl font-bold">{scheduledThisMonth}</p>
            <p className="text-cozy-ink-faint text-xs mt-0.5">Scheduled</p>
          </div>
          <div className="flex-1 bg-cozy-surface rounded-xl p-3 text-center border border-cozy-line">
            <p className="text-cozy-sage-deep text-2xl font-bold">
              {scheduledThisMonth > 0 ? Math.round((completedThisMonth / scheduledThisMonth) * 100) : 0}%
            </p>
            <p className="text-cozy-ink-faint text-xs mt-0.5">Hit rate</p>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div className="mt-6">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-cozy-ink-faint text-xs font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-cozy-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const { dateStr, workout, isToday } = getDayInfo(day);
              const isCompleted = workout?.status === "completed";
              const isSkipped = workout?.status === "skipped";
              const isRest = workout?.workoutType === "rest";
              const isScheduled = workout && !isCompleted && !isSkipped;
              const canStart = isToday && workout && !isCompleted && !isRest;

              let cellBg = "bg-cozy-sunk";
              let textColor = "text-cozy-ink-faint";
              let dotColor = "";

              if (isToday && !workout) {
                cellBg = "bg-cozy-sunk ring-1 ring-cozy-line";
                textColor = "text-cozy-ink font-bold";
              } else if (isCompleted && !isRest) {
                cellBg = "bg-cozy-sage-soft";
                textColor = "text-cozy-sage-deep font-semibold";
                dotColor = "bg-cozy-sage";
              } else if (isCompleted && isRest) {
                cellBg = "bg-cozy-sky-soft";
                textColor = "text-cozy-sky-deep";
              } else if (isSkipped) {
                cellBg = "bg-cozy-streak-soft";
                textColor = "text-cozy-streak-deep";
              } else if (isToday && isRest) {
                cellBg = "bg-cozy-sky-soft ring-1 ring-cozy-sky";
                textColor = "text-cozy-sky-deep font-bold";
              } else if (isToday) {
                cellBg = "bg-cozy-primary ring-2 ring-cozy-primary-line shadow-cozy-md";
                textColor = "text-white font-bold";
              } else if (isRest && isScheduled) {
                cellBg = "bg-cozy-sunk";
                textColor = "text-cozy-ink-faint";
              } else if (isScheduled) {
                cellBg = "bg-cozy-primary-soft";
                textColor = "text-cozy-primary";
                dotColor = "bg-cozy-primary-soft";
              }

              const handleClick = () => {
                if (workout && canStart) {
                  navigate(`/workout/${workout.dayNumber}`);
                }
              };

              return (
                <button
                  key={dateStr}
                  onClick={handleClick}
                  disabled={!canStart}
                  className={`
                    relative flex flex-col items-center justify-center aspect-square rounded-xl
                    transition-all duration-150 focus:outline-none
                    ${cellBg} ${canStart ? "active:scale-95 hover:ring-1 hover:ring-cozy-primary-line" : ""}
                  `}
                  aria-label={`${day}${workout ? ` - ${workout.title}` : ""}${isToday ? " (today)" : ""}`}
                  data-testid={`button-day-${day}`}
                >
                  <span className={`text-sm leading-none ${textColor}`}>{day}</span>
                  {isCompleted && !isRest && (
                    <CheckCircle2 className="w-2.5 h-2.5 text-cozy-sage-deep mt-0.5" />
                  )}
                  {isRest && workout && (
                    <Moon className="w-2 h-2 text-cozy-sky-deep mt-0.5" />
                  )}
                  {isScheduled && !isRest && !isToday && (
                    <div className="w-1 h-1 rounded-full bg-cozy-primary-soft mt-0.5" />
                  )}
                  {isSkipped && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cozy-streak-soft mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
        {[
          { color: "bg-cozy-primary", label: "Today's workout" },
          { color: "bg-cozy-sage-soft", label: "Completed" },
          { color: "bg-cozy-primary-soft", label: "Scheduled" },
          { color: "bg-cozy-streak-soft", label: "Skipped" },
          { color: "bg-cozy-sky-soft", label: "Rest day" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-cozy-ink-faint text-xs">{label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming workouts */}
      {!isLoading && (() => {
        const upcoming = plan
          .filter(w => w.date >= todayStr && !w.completed && w.workoutType !== "rest")
          .slice(0, 3);
        if (upcoming.length === 0) return null;
        return (
          <div className="mt-8">
            <h2 className="text-cozy-ink font-semibold text-base mb-3">Upcoming Workouts</h2>
            <div className="space-y-2">
              {upcoming.map(w => {
                const d = new Date(w.date + "T00:00:00");
                const label = w.date === todayStr
                  ? "Today"
                  : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                return (
                  <div
                    key={w.dayNumber}
                    className="flex items-center justify-between bg-cozy-surface border border-cozy-line rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cozy-primary-soft flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-cozy-primary" />
                      </div>
                      <div>
                        <p className="text-cozy-ink text-sm font-medium">{w.title}</p>
                        <p className="text-cozy-ink-faint text-xs">{label} · Day {w.dayNumber}</p>
                      </div>
                    </div>
                    {w.date === todayStr && (
                      <button
                        onClick={() => navigate(`/workout/${w.dayNumber}`)}
                        className="text-xs bg-cozy-primary text-white px-3 py-1.5 rounded-full font-medium"
                      >
                        Start
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <NavigationBar />
    </div>
  );
}
