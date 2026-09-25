import { motion, useReducedMotion } from "framer-motion";
import { Activity, Check, Dumbbell, Footprints, HeartPulse, Lock, Moon, Play, Target, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cozy } from "@/lib/cozyTheme";
import { Decor, DECOR_KINDS, MeadowPatch, MilestoneFlag, RestNook, Sparkle, GrassTuft } from "@/components/home/JourneyIllustrations";

interface DayStatus {
  day: number;
  status: "completed" | "active" | "locked" | "skipped";
  title: string;
  workoutType: string;
  date: string;
}

interface JourneyPathProps {
  dayStatuses: DayStatus[];
  onDayClick: (day: number) => void;
  isLoading?: boolean;
  /** Starts today's workout directly from the hero checkpoint. */
  onStartToday?: (day: number) => void;
  /** e.g. "35 min · 5 exercises" */
  todayMeta?: string;
  todayCompleted?: boolean;
}

// ─── Layout constants ──────────────────────────────────────────────────────
const NODE = 60;
const NODE_DISTANT = 50;
const NODE_TODAY = 96;
const GAP = 136;
const TODAY_EXTRA_GAP = 46;
const TOP = 78;
const TAIL = 250;
const UPCOMING_COUNT = 3;

/**
 * Milestone landmarks. Keyed by journey day for now; can later be driven by
 * completed-workout counts without touching the rendering below.
 */
const MILESTONES: Record<number, string> = {
  7: "First week",
  21: "Three weeks",
  50: "Day 50",
  100: "Day 100",
};
export function getMilestone(day: number): string | null {
  if (MILESTONES[day]) return MILESTONES[day];
  if (day > 100 && day % 100 === 0) return `Day ${day}`;
  return null;
}

// Deterministic pseudo-random in [0,1) so the world is stable between renders.
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** Hand-feeling horizontal rhythm: left → center → right → center → left, never exactly repeating. */
const xFraction = (day: number) => {
  const wave = Math.sin(day * 1.21 + 0.4) * 0.215;
  const jitter = (hash(day) - 0.5) * 0.07;
  return Math.min(0.75, Math.max(0.25, 0.5 + wave + jitter));
};

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
const formatDate = (dateStr: string) =>
  dateStr ? parseLocalDate(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";

const TYPE_LABELS: Record<string, string> = {
  upper: "Upper Body", lower: "Lower Body", chest: "Chest", back: "Back", shoulders: "Shoulders", arms: "Arms",
  legs: "Legs", core: "Core", chest_shoulders: "Chest + Shoulders", back_arms: "Back + Arms", chest_back: "Chest + Back",
  shoulders_arms: "Shoulders + Arms", legs_core: "Legs + Core", full: "Full Body", cardio: "Cardio", rest: "Rest Day",
};
export const workoutLabel = (d: Pick<DayStatus, "title" | "workoutType">) =>
  d.title && d.title !== "Workout" ? d.title : TYPE_LABELS[d.workoutType] ?? d.workoutType;

function TypeIcon({ type, size, color }: { type: string; size: number; color: string }) {
  const props = { size, color, strokeWidth: 2.2, "aria-hidden": true };
  if (type === "rest") return <Moon {...props} />;
  if (type === "cardio") return <HeartPulse {...props} />;
  if (type === "full") return <Activity {...props} />;
  if (type === "core") return <Target {...props} />;
  if (type === "lower" || type === "legs" || type === "legs_core") return <Footprints {...props} />;
  return <Dumbbell {...props} />;
}

// Catmull-Rom → cubic Bézier segments for a soft, organic curve.
type Pt = { x: number; y: number };
function curveSegments(pts: Pt[]): string[] {
  const segs: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 1 / 5.2;
    const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t };
    const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t };
    segs.push(`C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
  }
  return segs;
}

type Kind = "completed" | "skipped" | "today" | "upcoming" | "distant";

interface LaidOutNode {
  info: DayStatus;
  idx: number;
  x: number;
  y: number;
  size: number;
  kind: Kind;
  isRest: boolean;
  labelSide: "left" | "right";
  fade: number;
}

export default function JourneyPath({
  dayStatuses,
  onDayClick,
  isLoading,
  onStartToday,
  todayMeta,
  todayCompleted,
}: JourneyPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const didScroll = useRef(false);
  const [width, setWidth] = useState(375);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const update = () => containerRef.current && setWidth(containerRef.current.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isLoading, dayStatuses.length]);

  // Bring today into view once, only if it isn't already comfortably visible.
  useEffect(() => {
    if (didScroll.current || !todayRef.current) return;
    didScroll.current = true;
    const t = setTimeout(() => {
      const rect = todayRef.current?.getBoundingClientRect();
      if (rect && rect.bottom > window.innerHeight - 120) {
        todayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 600);
    return () => clearTimeout(t);
  }, [dayStatuses]);

  const layout = useMemo(() => {
    let todayIdx = dayStatuses.findIndex((d) => d.status === "active");
    if (todayIdx === -1) todayIdx = dayStatuses.findIndex((d) => d.status === "locked");
    if (todayIdx === -1) todayIdx = dayStatuses.length - 1;

    let y = TOP;
    const nodes: LaidOutNode[] = dayStatuses.map((info, idx) => {
      if (idx > 0) {
        y += GAP + (hash(info.day * 5.3) - 0.5) * 22;
        if (idx === todayIdx || idx === todayIdx + 1) y += TODAY_EXTRA_GAP;
      }
      let kind: Kind;
      if (info.status === "completed") kind = "completed";
      else if (info.status === "skipped") kind = "skipped";
      else if (idx === todayIdx) kind = "today";
      else if (idx - todayIdx <= UPCOMING_COUNT) kind = "upcoming";
      else kind = "distant";

      let fx = xFraction(info.day);
      // The hero sits to one side so its card has room on the other;
      // its neighbours lean the same way so the path doesn't run under the card.
      const todaySide = xFraction(dayStatuses[todayIdx]?.day ?? 0) < 0.5 ? "left" : "right";
      if (kind === "today") fx = todaySide === "left" ? 0.27 : 0.73;
      else if (Math.abs(idx - todayIdx) === 1) fx = todaySide === "left" ? Math.min(fx, 0.4) : Math.max(fx, 0.6);
      const x = fx * width;
      const size = kind === "today" ? NODE_TODAY : kind === "distant" ? NODE_DISTANT : NODE;
      const fade = kind === "distant" ? Math.max(0.4, 1 - (idx - todayIdx - UPCOMING_COUNT) * 0.09) : 1;
      return {
        info, idx, x, y, size, kind, fade,
        isRest: info.workoutType === "rest",
        labelSide: x < width / 2 ? "right" : "left",
      };
    });

    const first = dayStatuses[0]?.day ?? 1;
    const last = dayStatuses[dayStatuses.length - 1]?.day ?? 1;
    const lastY = nodes[nodes.length - 1]?.y ?? TOP;
    const pts: Pt[] = [
      { x: xFraction(first - 1) * width, y: -110 },
      ...nodes.map((n) => ({ x: n.x, y: n.y })),
      { x: xFraction(last + 1) * width, y: lastY + GAP },
      { x: xFraction(last + 2) * width, y: lastY + GAP * 2 },
    ];
    const segs = curveSegments(pts);
    const start = `M ${pts[0].x.toFixed(1)} ${pts[0].y}`;
    const fullPath = `${start} ${segs.join(" ")}`;
    const donePath = `${start} ${segs.slice(0, todayIdx + 1).join(" ")}`;
    const height = lastY + TAIL;
    return { nodes, todayIdx, fullPath, donePath, height };
  }, [dayStatuses, width]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24" aria-busy="true">
        <motion.div
          className="h-10 w-10 rounded-full"
          style={{ border: `3px solid ${cozy.primarySoft}`, borderTopColor: cozy.primary }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p style={{ color: cozy.inkSoft }} className="text-[15px]">Preparing your path…</p>
      </div>
    );
  }

  if (!dayStatuses.length) {
    return (
      <p className="py-16 text-center text-[15px]" style={{ color: cozy.inkSoft }}>
        Your path is being prepared…
      </p>
    );
  }

  const { nodes, todayIdx, fullPath, donePath, height } = layout;
  const H = height;
  const fadeTop = 90 / H;
  const fadeBottomStart = Math.max(fadeTop, (H - 420) / H);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden" style={{ height: H }}>
      {/* ── World layer ─────────────────────────────────────────── */}
      <svg className="pointer-events-none absolute inset-0" width="100%" height={H} aria-hidden="true">
        <defs>
          <linearGradient id="journey-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset={fadeTop} stopColor="#fff" stopOpacity="1" />
            <stop offset={fadeBottomStart} stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="journey-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={H}>
            <rect x="0" y="0" width={width} height={H} fill="url(#journey-fade)" />
          </mask>
        </defs>

        <g mask="url(#journey-mask)">
          {/* terrain */}
          {nodes.map((n) => {
            const h = hash(n.info.day * 2.7);
            if (h < 0.45) return null;
            const onLeft = n.x > width / 2;
            return (
              <MeadowPatch
                key={`meadow-${n.info.day}`}
                x={onLeft ? width * (0.02 + h * 0.06) : width * (0.92 + h * 0.06)}
                y={n.y + 30}
                w={110 + h * 60}
                h={46 + h * 26}
                tone={h > 0.8 ? "grass" : "deep"}
              />
            );
          })}

          {/* the path: edge, body, sheen */}
          <path d={fullPath} stroke={cozy.pathEdge} strokeWidth={52} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={fullPath} stroke={cozy.path} strokeWidth={42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={fullPath} stroke={cozy.surface} strokeOpacity={0.4} strokeWidth={14} fill="none" strokeLinecap="round" />
          {/* future stepping marks */}
          <path d={fullPath} stroke={cozy.pathEdge} strokeWidth={5} strokeDasharray="0.1 20" fill="none" strokeLinecap="round" />

          {/* travelled path — richer, sage-tinted */}
          {todayIdx >= 0 && (
            <>
              <motion.path
                d={donePath}
                stroke={cozy.pathDone}
                strokeWidth={42}
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: reduceMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
              />
              <path d={donePath} stroke={cozy.sage} strokeOpacity={0.6} strokeWidth={5} strokeDasharray="0.1 20" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* scenery */}
          {nodes.map((n) => {
            const decorSide = n.labelSide === "right" ? -1 : 1;
            const reach = n.size / 2 + 30 + hash(n.info.day * 9.1) * 16;
            const dx = n.x + decorSide * reach;
            const gy = n.y + 16 + hash(n.info.day * 4.4) * 14;
            const clampX = Math.min(width - 22, Math.max(22, dx));
            const milestone = getMilestone(n.info.day);
            // Today's side of the world belongs to its card + halo — keep it clear.
            if (n.kind === "today") return null;
            if (milestone) return <MilestoneFlag key={`deco-${n.info.day}`} x={clampX} y={gy + 6} />;
            if (n.isRest) return <RestNook key={`deco-${n.info.day}`} x={Math.min(width - 28, Math.max(28, dx))} y={gy + 4} />;
            const h = hash(n.info.day * 3.1);
            if (h < 0.42) {
              return h < 0.18 ? <GrassTuft key={`deco-${n.info.day}`} x={clampX} y={gy} flip={decorSide > 0} /> : null;
            }
            const kind = DECOR_KINDS[Math.floor(hash(n.info.day * 7.7) * DECOR_KINDS.length)];
            return <Decor key={`deco-${n.info.day}`} kind={kind} x={clampX} y={gy} flip={decorSide > 0} scale={0.95} />;
          })}
        </g>
      </svg>

      {/* ── Milestone captions ───────────────────────────────────── */}
      {nodes.map((n) => {
        const milestone = getMilestone(n.info.day);
        if (!milestone) return null;
        const decorSide = n.labelSide === "right" ? -1 : 1;
        const reach = n.size / 2 + 30 + hash(n.info.day * 9.1) * 16;
        const cx = Math.min(width - 22, Math.max(22, n.x + decorSide * reach));
        const gy = n.y + 16 + hash(n.info.day * 4.4) * 14;
        return (
          <span
            key={`ms-${n.info.day}`}
            className="pointer-events-none absolute whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-semibold"
            style={{
              left: Math.min(width - 50, Math.max(50, cx)),
              top: gy + 12,
              transform: "translateX(-50%)",
              color: cozy.streakDeep,
              background: cozy.streakSoft,
              opacity: n.fade,
            }}
          >
            {milestone}
          </span>
        );
      })}

      {/* ── Checkpoints ─────────────────────────────────────────── */}
      {nodes.map((n) =>
        n.kind === "today" ? (
          <TodayCheckpoint
            key={`node-${n.info.day}-${n.idx}`}
            node={n}
            width={width}
            anchorRef={todayRef}
            meta={todayMeta}
            completed={!!todayCompleted}
            reduceMotion={!!reduceMotion}
            onOpen={() => onDayClick(n.info.day)}
            onStart={onStartToday ? () => onStartToday(n.info.day) : undefined}
          />
        ) : (
          <Checkpoint
            key={`node-${n.info.day}-${n.idx}`}
            node={n}
            width={width}
            isNext={n.idx === todayIdx + 1}
            delay={Math.min(0.15 + Math.abs(n.idx - todayIdx) * 0.05, 0.7)}
            onClick={() => onDayClick(n.info.day)}
          />
        ),
      )}

      <p
        className="cozy-display pointer-events-none absolute inset-x-0 text-center text-[15px] italic"
        style={{ bottom: 70, color: cozy.inkFaint }}
      >
        The path keeps going…
      </p>
    </div>
  );
}

// ─── Regular checkpoint ────────────────────────────────────────────────────

function discStyle(kind: Kind, isRest: boolean): { face: string; rim: string; border?: string } {
  if (kind === "completed") return { face: cozy.sage, rim: cozy.sageDeep };
  if (kind === "skipped") return { face: cozy.surfaceSunk, rim: cozy.stone, border: cozy.line };
  if (isRest) return { face: cozy.restSoft, rim: cozy.rest };
  if (kind === "upcoming") return { face: cozy.surface, rim: cozy.pathEdge, border: cozy.line };
  return { face: cozy.surfaceSunk, rim: cozy.stone, border: cozy.line };
}

function Disc({ size, face, rim, border, children, rimDepth = 5 }: {
  size: number; face: string; rim: string; border?: string; rimDepth?: number; children: ReactNode;
}) {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: face,
    border: border ? `1.5px solid ${border}` : undefined,
    boxShadow: `0 ${rimDepth}px 0 ${rim}, 0 ${rimDepth + 6}px 18px rgba(92,66,38,0.12), inset 0 2px 0 rgba(255,255,255,0.45)`,
  };
  return (
    <div className="flex items-center justify-center rounded-full" style={style}>
      {children}
    </div>
  );
}

function Checkpoint({ node, width, isNext, delay, onClick }: {
  node: LaidOutNode; width: number; isNext: boolean; delay: number; onClick: () => void;
}) {
  const { info, kind, isRest, size, x, y, labelSide, fade } = node;
  const { face, rim, border } = discStyle(kind, isRest);
  const label = isRest ? "Rest day" : workoutLabel(info);

  let icon: ReactNode;
  if (kind === "completed") icon = <Check size={26} color="#fff" strokeWidth={3.2} aria-hidden />;
  else if (kind === "skipped") icon = <X size={20} color={cozy.streak} strokeWidth={2.6} aria-hidden />;
  else if (isRest) icon = <Moon size={kind === "distant" ? 18 : 22} color={cozy.restDeep} strokeWidth={2.2} aria-hidden />;
  else if (kind === "upcoming") icon = <TypeIcon type={info.workoutType} size={24} color={cozy.primary} />;
  else icon = <Lock size={17} color={cozy.inkFaint} strokeWidth={2.2} aria-hidden />;

  const title =
    kind === "completed" ? { size: 14, color: cozy.inkSoft, weight: 500 }
    : kind === "upcoming" ? { size: 15.5, color: isRest ? cozy.restDeep : cozy.ink, weight: 600 }
    : kind === "skipped" ? { size: 14, color: cozy.inkFaint, weight: 500 }
    : { size: 14, color: isRest ? cozy.restDeep : cozy.inkSoft, weight: 500 };

  const sub =
    kind === "completed" ? "Done"
    : kind === "skipped" ? "Missed"
    : isRest && kind === "upcoming" ? "Recharge"
    : isNext ? "Tomorrow"
    : kind === "upcoming" ? formatDate(info.date)
    : null;

  const statusText = kind === "completed" ? " (completed)" : kind === "skipped" ? " (missed)" : kind === "distant" ? " (locked)" : "";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group absolute flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cozy-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--cozy-bg)]"
      style={{
        // anchor the disc (not the label) on the path point
        ...(labelSide === "right" ? { left: x - size / 2 } : { right: width - x - size / 2 }),
        top: y,
        translate: "0 -50%",
        flexDirection: labelSide === "right" ? "row" : "row-reverse",
        transformOrigin: labelSide === "right" ? `${size / 2}px 50%` : `calc(100% - ${size / 2}px) 50%`,
        minHeight: 0,
        minWidth: 0,
      }}
      initial={{ opacity: 0, scale: isNext ? 0.85 : 0.94 }}
      animate={{ opacity: fade, scale: 1 }}
      transition={{ delay, duration: isNext ? 0.6 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.94 }}
      aria-label={`Day ${info.day}: ${label}${statusText}`}
      data-testid={`journey-node-${info.day}`}
    >
      <Disc size={size} face={face} rim={rim} border={border} rimDepth={kind === "distant" ? 4 : 5}>
        {icon}
      </Disc>
      <span
        className="flex max-w-[132px] flex-col leading-tight"
        style={{ textAlign: labelSide === "right" ? "left" : "right" }}
      >
        <span className="whitespace-nowrap" style={{ fontSize: title.size, color: title.color, fontWeight: title.weight }}>{label}</span>
        {sub && (
          <span className="mt-0.5 text-[13px]" style={{ color: kind === "upcoming" && !isRest ? cozy.inkSoft : cozy.inkFaint }}>
            {sub}
          </span>
        )}
      </span>
    </motion.button>
  );
}

// ─── Today: the hero checkpoint ────────────────────────────────────────────

function celebrateOnce(dateKey: string) {
  try {
    const key = `mgp-celebrated-${dateKey}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}

function TodayCheckpoint({ node, width, anchorRef, meta, completed, reduceMotion, onOpen, onStart }: {
  node: LaidOutNode;
  width: number;
  anchorRef: React.RefObject<HTMLDivElement>;
  meta?: string;
  completed: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
  onStart?: () => void;
}) {
  const { info, x, y, size, isRest } = node;
  const label = workoutLabel(info);
  const cardOnRight = x < width / 2;
  const gutter = 16;
  const gap = 14;
  const cardLeft = cardOnRight ? x + size / 2 + gap : gutter;
  const cardRight = cardOnRight ? width - gutter : x - size / 2 - gap;
  const cardWidth = Math.min(222, cardRight - cardLeft);
  const [celebrate] = useState(() => completed && !reduceMotion && celebrateOnce(info.date || String(info.day)));

  const tone = completed
    ? { face: cozy.sage, rim: cozy.sageDeep, glow: cozy.sageSoft, accent: cozy.sageDeep }
    : isRest
      ? { face: cozy.rest, rim: cozy.restDeep, glow: cozy.restSoft, accent: cozy.restDeep }
      : { face: cozy.primary, rim: cozy.primaryDeep, glow: cozy.primaryGlow, accent: cozy.primary };

  const float = reduceMotion ? undefined : { y: [0, -5, 0] };
  const floatTransition = { duration: 3.6, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <>
      {/* disc */}
      <motion.div
        ref={anchorRef}
        className="absolute"
        style={{ left: x - size / 2, top: y - size / 2, width: size, height: size }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 18 }}
      >
        {/* breathing halo */}
        <motion.div
          aria-hidden
          className="absolute rounded-full"
          style={{ inset: -14, background: tone.glow }}
          animate={reduceMotion ? undefined : { scale: [1, 1.07, 1], opacity: [0.75, 0.4, 0.75] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.button
          type="button"
          onClick={completed || isRest || !onStart ? onOpen : onStart}
          className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cozy-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--cozy-bg)]"
          animate={float}
          transition={floatTransition}
          whileTap={{ scale: 0.93 }}
          aria-label={`Today, day ${info.day}: ${label}${completed ? " (completed)" : ""}`}
          data-testid={`journey-node-${info.day}`}
        >
          <Disc size={size} face={tone.face} rim={tone.rim} rimDepth={7}>
            {completed ? (
              <Check size={40} color="#fff" strokeWidth={3.2} aria-hidden />
            ) : isRest ? (
              <Moon size={36} color="#fff" strokeWidth={2.2} aria-hidden />
            ) : (
              <Play size={36} color="#fff" fill="#fff" className="ml-1" aria-hidden />
            )}
          </Disc>
        </motion.button>

        {/* ambient sparkles */}
        <svg className="pointer-events-none absolute" style={{ left: -26, top: -24, overflow: "visible" }} width={size + 52} height={size + 48} aria-hidden>
          <Sparkle x={8} y={22} size={5} color={tone.accent} />
          <Sparkle x={size + 44} y={14} size={7} color={cozy.streak} />
          <Sparkle x={size + 36} y={size + 40} size={4} color={tone.accent} />
        </svg>

        {celebrate && <CelebrationBurst size={size} />}
      </motion.div>

      {/* hero card */}
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="absolute cursor-pointer rounded-[22px] p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cozy-primary)]"
        style={{
          left: cardLeft,
          width: cardWidth,
          top: y,
          translate: "0 -50%",
          background: cozy.surface,
          border: `1px solid ${cozy.line}`,
          boxShadow: `${cozy.shadowLg}, ${cozy.highlight}`,
          minHeight: 0,
        }}
        initial={{ opacity: 0, x: cardOnRight ? -10 : 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-label={`Today's workout details: ${label}`}
      >
        <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: tone.accent }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: tone.accent }} />
          {isRest && !completed ? "Today · Rest" : "Today"}
        </div>
        <h3 className="cozy-display mt-1.5 text-[23px] font-semibold leading-[1.1]" style={{ color: cozy.ink }}>
          {isRest ? "Recharge" : label}
        </h3>
        <p className="mt-1 text-[13.5px] leading-snug" style={{ color: cozy.inkSoft }}>
          {completed
            ? "Done for today. Lovely work."
            : isRest
              ? "Recovery is part of the path. You're still progressing."
              : meta}
        </p>

        {!completed && !isRest && onStart && (
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            whileTap={{ scale: 0.96, y: 2 }}
            className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: cozy.primary,
              boxShadow: `0 3px 0 ${cozy.primaryDeep}, 0 8px 18px ${cozy.primaryGlow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
            }}
            data-testid="button-start-today"
          >
            <Play size={15} fill="#fff" color="#fff" aria-hidden />
            Start
          </motion.button>
        )}
        {completed && (
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold"
            style={{ background: cozy.sageSoft, color: cozy.sageDeep }}
          >
            <Check size={14} strokeWidth={3} aria-hidden /> Completed
          </div>
        )}
      </motion.div>
    </>
  );
}

/** Short, one-time sparkle burst the first time Home is seen after finishing today. */
function CelebrationBurst({ size }: { size: number }) {
  const pieces = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    return { a, d: size * 0.85 + (i % 3) * 8, c: i % 3 === 0 ? cozy.streak : i % 3 === 1 ? cozy.sage : cozy.primary };
  });
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{ left: size / 2 - 4, top: size / 2 - 4, background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
          animate={{ x: Math.cos(p.a) * p.d, y: Math.sin(p.a) * p.d, opacity: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}
