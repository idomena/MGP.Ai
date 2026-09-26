import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import {
  ArrowRight, Check, CheckCircle2, ChevronDown, ChevronUp, Dumbbell, Flag, GripVertical, Lock, MoreHorizontal, Play, Trash2, X,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import type { Exercise } from "@/data/workoutExercises";
import { cozy } from "@/lib/cozyTheme";

// ─── Start ────────────────────────────────────────────────────────────────

/** The page's primary action. Tactile rim, gentle light sweep, press feedback. */
export function StartWorkoutButton({ onClick, compact = false, label = "Start workout" }: {
  onClick: () => void; compact?: boolean; label?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.975, y: 3 }}
      className={`group relative flex w-full items-center overflow-hidden rounded-full text-left text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-primary-line ${compact ? "h-14 pl-2 pr-5" : "h-[66px] pl-2.5 pr-6"}`}
      style={{
        background: cozy.primary,
        boxShadow: `0 5px 0 ${cozy.primaryDeep}, 0 14px 30px ${cozy.primaryGlow}, inset 0 1px 0 rgba(255,255,255,0.28)`,
      }}
      data-testid="button-start-workout"
    >
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-24 -skew-x-12"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }}
          initial={{ left: "-30%" }}
          animate={{ left: ["-30%", "130%"] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.4, ease: "easeInOut", delay: 1.2 }}
        />
      )}
      <span
        className={`relative flex shrink-0 items-center justify-center rounded-full ${compact ? "h-10 w-10" : "h-[50px] w-[50px]"}`}
        style={{ background: "rgba(255,255,255,0.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}
      >
        <Play className={compact ? "h-[18px] w-[18px]" : "h-[22px] w-[22px]"} fill="#fff" strokeWidth={0} aria-hidden />
      </span>
      <span className={`relative flex-1 pl-4 font-semibold tracking-[-0.01em] ${compact ? "text-[16px]" : "text-[18px]"}`}>{label}</span>
      <ArrowRight className="relative h-5 w-5 opacity-80 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </motion.button>
  );
}

export type WorkoutStatus = "completed" | "active" | "locked" | "missed" | "skipped";

/** Replaces Start when the day can't be started — same geometry, calm tone. */
export function WorkoutStatusBanner({ status, isToday, unlockLabel }: {
  status: Exclude<WorkoutStatus, "active">; isToday: boolean; unlockLabel?: string;
}) {
  const map = {
    completed: { bg: cozy.sageSoft, fg: cozy.sageDeep, icon: <CheckCircle2 className="h-5 w-5" />, title: "Workout complete", sub: isToday ? "Lovely work. Come back tomorrow for the next step." : "This checkpoint is cleared.", testid: "status-completed" },
    skipped: { bg: cozy.streakSoft, fg: cozy.streakDeep, icon: <X className="h-5 w-5" />, title: "Workout skipped", sub: "No stress — the path keeps going.", testid: "status-skipped" },
    missed: { bg: cozy.streakSoft, fg: cozy.streakDeep, icon: <X className="h-5 w-5" />, title: "Workout missed", sub: "Today's workout is waiting for you on Home.", testid: "status-locked" },
    locked: { bg: cozy.surfaceSunk, fg: cozy.inkSoft, icon: <Lock className="h-5 w-5" />, title: "Not unlocked yet", sub: unlockLabel ? `Opens ${unlockLabel}.` : "Opens on its scheduled day.", testid: "status-locked" },
  }[status];
  return (
    <div className="flex items-center gap-3.5 rounded-[26px] px-4 py-3.5" style={{ background: map.bg, color: map.fg }} data-testid={map.testid}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: cozy.surface }}>{map.icon}</span>
      <span className="leading-tight">
        <span className="block text-[16px] font-semibold">{map.title}</span>
        <span className="mt-0.5 block text-[13.5px]" style={{ color: cozy.inkSoft }}>{map.sub}</span>
      </span>
    </div>
  );
}

// ─── Today's plan: the sequence ───────────────────────────────────────────

const dotted: React.CSSProperties = {
  backgroundImage: `radial-gradient(circle, ${cozy.pathEdge} 1.6px, transparent 1.8px)`,
  backgroundSize: "4px 11px",
  backgroundRepeat: "repeat-y",
  backgroundPosition: "center top",
};

export function PlanStep({
  exercise, index, count, done, editMode, muscleLabel, muscleColor,
  onOpen, onMenu, onMoveUp, onMoveDown, onRemove,
  dragProps, isDragSource, isDragOver,
}: {
  exercise: Exercise; index: number; count: number; done: boolean; editMode: boolean;
  muscleLabel: string; muscleColor: string;
  onOpen: () => void; onMenu: () => void; onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void;
  dragProps: Record<string, unknown>; isDragSource: boolean; isDragOver: boolean;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: isDragSource ? 0.45 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-3"
      data-testid={`card-exercise-${exercise.id}`}
      {...dragProps}
    >
      {/* sequence rail */}
      <div className="flex w-9 shrink-0 flex-col items-center">
        <span
          className="mt-5 flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold tabular-nums"
          style={
            done
              ? { background: cozy.sage, color: "#fff", boxShadow: `0 3px 0 ${cozy.sageDeep}` }
              : { background: cozy.surface, color: cozy.primaryDeep, boxShadow: `0 3px 0 ${cozy.pathEdge}, ${cozy.shadowSm}` }
          }
          data-testid={`badge-exercise-number-${exercise.id}`}
          aria-hidden
        >
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
        </span>
        <span className="mt-2 w-2 flex-1" style={dotted} aria-hidden />
      </div>

      {/* the exercise */}
      <div
        className={`mb-3 flex min-w-0 flex-1 items-center gap-3 rounded-[24px] p-2.5 pr-1.5 transition-shadow ${isDragOver ? "ring-2 ring-cozy-primary" : ""}`}
        style={{
          background: cozy.surface,
          boxShadow: editMode ? `inset 0 0 0 1.5px ${cozy.line}` : `${cozy.shadowSm}, ${cozy.highlight}`,
        }}
      >
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-[18px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
          style={{ minHeight: 0 }}
          data-testid={`button-details-${exercise.id}`}
        >
          <span className={`relative shrink-0 overflow-hidden rounded-[18px] transition-all duration-300 ${editMode ? "h-0 w-0 opacity-0" : "h-[68px] w-[68px]"}`} style={{ background: cozy.surfaceSunk }} data-testid={`thumbnail-${exercise.id}`}>
            {/* fallback sits underneath; the image covers it when it loads */}
            <span className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="h-6 w-6" style={{ color: cozy.inkFaint }} aria-hidden />
            </span>
            {exercise.gif_url ? (
              <img
                src={`https://wsrv.nl/?url=${exercise.gif_url}&output=gif`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : null}
          </span>
          <span className={`min-w-0 flex-1 py-1 ${editMode ? "pl-1.5" : ""}`}>
            <span className="line-clamp-2 text-[16px] font-semibold leading-snug" style={{ color: cozy.ink }} data-testid={`text-exercise-name-${exercise.id}`}>
              {exercise.name}
            </span>
            <span className="mt-1 block text-[14px]" style={{ color: cozy.inkSoft }} data-testid={`text-exercise-sets-${exercise.id}`}>
              {exercise.sets} sets <span style={{ color: cozy.inkFaint }}>×</span> {exercise.reps}
            </span>
            <span className="mt-1.5 flex items-center gap-2">
              {muscleLabel !== "Other" && (
                <span
                  className="rounded-full px-2 py-0.5 text-[12px] font-semibold"
                  style={{ background: `color-mix(in srgb, ${muscleColor} 16%, transparent)`, color: muscleColor }}
                  data-testid={`badge-muscle-group-${exercise.id}`}
                >
                  {muscleLabel}
                </span>
              )}
              {exercise.time && (
                <span className="whitespace-nowrap text-[12.5px]" style={{ color: cozy.inkFaint }} data-testid={`text-exercise-time-${exercise.id}`}>{exercise.time}</span>
              )}
            </span>
          </span>
        </button>

        {editMode ? (
          <div className="flex shrink-0 items-center">
            <div className="flex flex-col">
              <IconBtn label={`Move ${exercise.name} up`} onClick={onMoveUp} disabled={index === 0} testid={`button-move-up-${exercise.id}`}><ChevronUp className="h-4 w-4" /></IconBtn>
              <IconBtn label={`Move ${exercise.name} down`} onClick={onMoveDown} disabled={index === count - 1} testid={`button-move-down-${exercise.id}`}><ChevronDown className="h-4 w-4" /></IconBtn>
            </div>
            <IconBtn label={`Remove ${exercise.name}`} onClick={onRemove} testid={`button-remove-${exercise.id}`} danger><Trash2 className="h-4 w-4" /></IconBtn>
            <span className="hidden h-11 w-6 cursor-grab items-center justify-center active:cursor-grabbing sm:flex" style={{ color: cozy.inkFaint }} data-testid={`drag-handle-${exercise.id}`} aria-hidden>
              <GripVertical className="h-4 w-4" />
            </span>
          </div>
        ) : (
          <IconBtn label={`Actions for ${exercise.name}`} onClick={onMenu} testid={`button-actions-${exercise.id}`}>
            <MoreHorizontal className="h-5 w-5" />
          </IconBtn>
        )}
      </div>
    </motion.li>
  );
}

function IconBtn({ label, onClick, disabled, testid, danger, children }: {
  label: string; onClick: () => void; disabled?: boolean; testid?: string; danger?: boolean; children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      aria-label={label}
      className="flex h-11 w-10 items-center justify-center rounded-full transition-colors active:bg-cozy-sunk disabled:opacity-25 focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
      style={{ color: danger ? cozy.danger : cozy.inkSoft, minWidth: 0, minHeight: 0 }}
      data-testid={testid}
    >
      {children}
    </button>
  );
}

export function FinishStep({ done }: { done: boolean }) {
  return (
    <li className="flex items-center gap-3" aria-label="Finish">
      <div className="flex w-9 shrink-0 justify-center">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: done ? cozy.sage : cozy.streakSoft, color: done ? "#fff" : cozy.streakDeep }}
        >
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Flag className="h-4 w-4" />}
        </span>
      </div>
      <p className="text-[14.5px] leading-snug" style={{ color: cozy.inkSoft }}>
        <span className="font-semibold" style={{ color: cozy.ink }}>{done ? "Checkpoint cleared" : "Finish line"}</span>
        {done ? " · this workout is on your path." : " · complete the session to clear today's checkpoint."}
      </p>
    </li>
  );
}

// ─── Bottom sheet ─────────────────────────────────────────────────────────

export interface SheetAction {
  key: string;
  icon: ReactNode;
  label: string;
  sub?: string;
  onSelect: () => void;
  tone?: "default" | "primary" | "danger";
  disabled?: boolean;
  testid?: string;
}

export function ActionSheet({ open, onOpenChange, title, description, actions }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; actions: SheetAction[];
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent
        className="cozy-root mx-auto max-w-md rounded-t-[30px] border-0 px-4"
        style={{ background: cozy.surface, paddingBottom: "calc(var(--safe-area-inset-bottom, 0px) + 18px)", boxShadow: cozy.shadowLg }}
      >
        <div className="px-2 pb-2 pt-4">
          <DrawerTitle className="cozy-display text-[22px] font-semibold" style={{ color: cozy.ink }}>{title}</DrawerTitle>
          {description && (
            <DrawerDescription className="mt-0.5 text-[14px]" style={{ color: cozy.inkSoft }}>{description}</DrawerDescription>
          )}
        </div>
        <ul className="space-y-1.5 pb-1">
          {actions.map((a) => {
            const tint = a.tone === "danger" ? { bg: cozy.dangerSoft, fg: cozy.danger } : a.tone === "primary" ? { bg: cozy.primarySoft, fg: cozy.primary } : { bg: cozy.surfaceSunk, fg: cozy.inkSoft };
            return (
              <li key={a.key}>
                <button
                  type="button"
                  onClick={() => { onOpenChange(false); a.onSelect(); }}
                  disabled={a.disabled}
                  className="flex w-full items-center gap-3.5 rounded-[20px] px-2 py-2.5 text-left transition-colors active:bg-cozy-sunk disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-primary"
                  data-testid={a.testid}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: tint.bg, color: tint.fg }}>{a.icon}</span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[16px] font-semibold" style={{ color: a.tone === "danger" ? cozy.danger : cozy.ink }}>{a.label}</span>
                    {a.sub && <span className="mt-0.5 block truncate text-[13.5px]" style={{ color: cozy.inkSoft }}>{a.sub}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}
