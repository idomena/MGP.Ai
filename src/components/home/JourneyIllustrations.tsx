/**
 * Small original illustrations that live along the Journey path.
 * Every piece is drawn around (0,0) = the point where it touches the ground,
 * so callers can place it with a single translate().
 */
import { cozy } from "@/lib/cozyTheme";

type P = { x: number; y: number; flip?: boolean; scale?: number };

const place = ({ x, y, flip, scale = 1 }: P) =>
  `translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`;

const GroundShadow = ({ w }: { w: number }) => (
  <ellipse cx={0} cy={1} rx={w} ry={w * 0.22} fill={cozy.pathEdge} opacity={0.55} />
);

export function Sprig(p: P) {
  return (
    <g transform={place(p)}>
      <GroundShadow w={11} />
      <path d="M0 0 C0 -10 1 -18 -1 -28" stroke={cozy.grassDeep} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M-1 -26 C-12 -30 -15 -40 -9 -44 C-3 -40 -1 -33 -1 -26Z" fill={cozy.grass} />
      <path d="M0 -16 C10 -18 16 -27 12 -33 C4 -31 0 -24 0 -16Z" fill={cozy.grassDeep} />
      <path d="M0 -8 C-8 -9 -13 -15 -11 -20 C-4 -19 -1 -14 0 -8Z" fill={cozy.grassDeep} opacity={0.8} />
    </g>
  );
}

export function Rocks(p: P) {
  return (
    <g transform={place(p)}>
      <GroundShadow w={18} />
      <path d="M-16 0 C-18 -9 -10 -15 -2 -13 C5 -12 8 -5 6 0Z" fill={cozy.stoneDeep} />
      <path d="M-12 -9 C-9 -12 -4 -12 -1 -11" stroke="#fff" strokeOpacity={0.45} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M4 0 C3 -6 8 -9 13 -8 C18 -7 19 -2 17 0Z" fill={cozy.stone} />
    </g>
  );
}

export function GrassTuft(p: P) {
  return (
    <g transform={place(p)} stroke={cozy.grassDeep} strokeWidth={2} strokeLinecap="round" fill="none">
      <path d="M-6 0 C-7 -6 -9 -9 -12 -11" />
      <path d="M-1 0 C-1 -7 0 -11 1 -15" />
      <path d="M4 0 C5 -5 8 -8 11 -9" />
    </g>
  );
}

export function Bush(p: P) {
  return (
    <g transform={place(p)}>
      <GroundShadow w={20} />
      <circle cx={-9} cy={-10} r={11} fill={cozy.grassDeep} />
      <circle cx={6} cy={-13} r={13} fill={cozy.grass} />
      <circle cx={-1} cy={-20} r={10} fill={cozy.grass} />
      <circle cx={2} cy={-22} r={3} fill="#fff" opacity={0.35} />
    </g>
  );
}

export function Signpost(p: P) {
  return (
    <g transform={place(p)}>
      <GroundShadow w={10} />
      <rect x={-2} y={-34} width={4} height={34} rx={2} fill={cozy.woodDeep} />
      <path d="M-14 -34 H10 L16 -28 L10 -22 H-14 A3 3 0 0 1 -17 -25 V-31 A3 3 0 0 1 -14 -34Z" fill={cozy.wood} />
      <path d="M-11 -28 H6" stroke={cozy.surface} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export function WaterBottle(p: P) {
  return (
    <g transform={place(p)}>
      <GroundShadow w={9} />
      <rect x={-7} y={-26} width={14} height={26} rx={5} fill={cozy.sky} />
      <rect x={-4} y={-31} width={8} height={6} rx={2} fill={cozy.ink} opacity={0.55} />
      <rect x={-7} y={-17} width={14} height={6} fill={cozy.surface} opacity={0.55} />
      <rect x={-4} y={-23} width={2.5} height={18} rx={1.25} fill="#fff" opacity={0.45} />
    </g>
  );
}

export function Dumbbell(p: P) {
  return (
    <g transform={place(p)}>
      <GroundShadow w={18} />
      <rect x={-12} y={-7} width={24} height={4} rx={2} fill={cozy.stoneDeep} />
      <rect x={-18} y={-13} width={7} height={14} rx={3} fill={cozy.ink} opacity={0.7} />
      <rect x={11} y={-13} width={7} height={14} rx={3} fill={cozy.ink} opacity={0.7} />
      <rect x={-16.5} y={-11} width={2} height={7} rx={1} fill="#fff" opacity={0.3} />
    </g>
  );
}

/** Recovery nook: little bench, crescent moon and a cloud. */
export function RestNook(p: P) {
  return (
    <g transform={place(p)}>
      <GroundShadow w={22} />
      {/* bench */}
      <rect x={-20} y={-14} width={40} height={5} rx={2.5} fill={cozy.wood} />
      <rect x={-20} y={-22} width={40} height={4} rx={2} fill={cozy.wood} opacity={0.85} />
      <rect x={-16} y={-9} width={3} height={9} rx={1.5} fill={cozy.woodDeep} />
      <rect x={13} y={-9} width={3} height={9} rx={1.5} fill={cozy.woodDeep} />
      {/* moon + cloud */}
      <path d="M14 -58 A9 9 0 1 0 22 -45 A7 7 0 1 1 14 -58Z" fill={cozy.rest} />
      <g opacity={0.9}>
        <circle cx={-8} cy={-44} r={6} fill={cozy.surface} />
        <circle cx={0} cy={-47} r={8} fill={cozy.surface} />
        <circle cx={8} cy={-43} r={5} fill={cozy.surface} />
        <rect x={-14} y={-43} width={27} height={5} rx={2.5} fill={cozy.surface} />
      </g>
    </g>
  );
}

/** Milestone landmark: a small summit with a pennant flag. */
export function MilestoneFlag(p: P) {
  return (
    <g transform={place(p)}>
      <path d="M-26 0 C-18 -14 -8 -24 2 -24 C12 -24 20 -12 28 0Z" fill={cozy.bgDeep} />
      <path d="M-10 -16 C-5 -21 0 -23 4 -23" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} fill="none" strokeLinecap="round" />
      <rect x={1} y={-58} width={3} height={36} rx={1.5} fill={cozy.woodDeep} />
      <path d="M4 -57 C12 -55 18 -58 26 -54 C19 -50 13 -48 4 -46Z" fill={cozy.streak} />
    </g>
  );
}

export function Sparkle({ x, y, size = 6, color = cozy.primary }: { x: number; y: number; size?: number; color?: string }) {
  const s = size;
  return (
    <path
      d={`M${x} ${y - s} C${x + s * 0.18} ${y - s * 0.18} ${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} C${x + s * 0.18} ${y + s * 0.18} ${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} C${x - s * 0.18} ${y + s * 0.18} ${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} C${x - s * 0.18} ${y - s * 0.18} ${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z`}
      fill={color}
    />
  );
}

/** Soft organic meadow patch that gives the world a sense of terrain. */
export function MeadowPatch({ x, y, w, h, tone = "deep" }: { x: number; y: number; w: number; h: number; tone?: "deep" | "grass" }) {
  const d = `M${x - w / 2} ${y}
    C${x - w / 2} ${y - h * 0.7} ${x - w * 0.15} ${y - h} ${x + w * 0.08} ${y - h * 0.92}
    C${x + w * 0.38} ${y - h * 0.82} ${x + w / 2} ${y - h * 0.45} ${x + w / 2} ${y - h * 0.05}
    C${x + w / 2} ${y + h * 0.5} ${x + w * 0.1} ${y + h * 0.62} ${x - w * 0.12} ${y + h * 0.5}
    C${x - w * 0.36} ${y + h * 0.4} ${x - w / 2} ${y + h * 0.3} ${x - w / 2} ${y}Z`;
  return <path d={d} fill={tone === "deep" ? cozy.bgDeep : cozy.grass} opacity={tone === "deep" ? 0.9 : 0.35} />;
}

export const DECOR_KINDS = ["sprig", "rocks", "tuft", "bush", "sign", "bottle", "dumbbell"] as const;
export type DecorKind = (typeof DECOR_KINDS)[number];

export function Decor({ kind, ...p }: P & { kind: DecorKind }) {
  switch (kind) {
    case "sprig": return <Sprig {...p} />;
    case "rocks": return <Rocks {...p} />;
    case "tuft": return <GrassTuft {...p} />;
    case "bush": return <Bush {...p} />;
    case "sign": return <Signpost {...p} />;
    case "bottle": return <WaterBottle {...p} />;
    case "dumbbell": return <Dumbbell {...p} />;
  }
}
