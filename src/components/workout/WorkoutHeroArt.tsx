/**
 * "Mission base" scene for the Workout entry hero.
 * Same world as the Home Journey (terrain, trail, summit flag, scenery),
 * with today's equipment as the floating emblem.
 */
import { motion, useReducedMotion } from "framer-motion";
import { cozy } from "@/lib/cozyTheme";
import { Bush, GrassTuft, MilestoneFlag, Rocks, Sprig, Sparkle } from "@/components/home/JourneyIllustrations";

export type EmblemKind = "dumbbell" | "kettlebell" | "heart" | "target" | "full" | "rest";

export function emblemForType(workoutType: string): EmblemKind {
  const t = workoutType.toLowerCase();
  if (t === "rest") return "rest";
  if (t === "cardio") return "heart";
  if (t === "core") return "target";
  if (t === "full" || t.includes("full")) return "full";
  if (t === "lower" || t.includes("leg")) return "kettlebell";
  return "dumbbell";
}

function DumbbellEmblem() {
  return (
    <g transform="rotate(-14)">
      <rect x={-50} y={-4.5} width={100} height={9} rx={4.5} fill={cozy.ink} opacity={0.72} />
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s < 0 ? -44 : 32} y={-25} width={12} height={50} rx={5} fill={cozy.primary} />
          <rect x={s < 0 ? -57 : 46} y={-19} width={11} height={38} rx={4.5} fill={cozy.primaryDeep} />
          <rect x={s < 0 ? -63 : 57} y={-7} width={6} height={14} rx={2.5} fill={cozy.stone} />
          <rect x={s < 0 ? -41 : 35} y={-20} width={2.5} height={32} rx={1.25} fill="#fff" opacity={0.35} />
        </g>
      ))}
    </g>
  );
}

function KettlebellEmblem({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <path d="M-20 -14 C-22 -50 22 -50 20 -14" fill="none" stroke={cozy.primaryDeep} strokeWidth={10} strokeLinecap="round" />
      <path d="M-15 -20 C-15 -40 -2 -44 6 -42" fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
      <path d="M-36 10 C-36 -14 -18 -24 0 -24 C18 -24 36 -14 36 10 C36 28 24 36 0 36 C-24 36 -36 28 -36 10Z" fill={cozy.primary} />
      <path d="M-24 0 C-22 -10 -14 -16 -6 -17" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
      <rect x={-22} y={32} width={44} height={6} rx={3} fill={cozy.primaryDeep} />
    </g>
  );
}

function HeartEmblem() {
  return (
    <g>
      <path d="M0 34 C-40 8 -46 -14 -34 -28 C-22 -41 -6 -36 0 -22 C6 -36 22 -41 34 -28 C46 -14 40 8 0 34Z" fill={cozy.streak} />
      <path d="M-30 -4 H-12 L-5 -16 L4 10 L11 -4 H30" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-26 -22 C-22 -28 -16 -30 -10 -28" fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function TargetEmblem() {
  return (
    <g>
      <circle r={42} fill={cozy.primarySoft} />
      <circle r={31} fill={cozy.surface} />
      <circle r={20} fill={cozy.primary} />
      <circle r={9} fill={cozy.surface} />
      <circle r={4} fill={cozy.primaryDeep} />
    </g>
  );
}

function RestEmblem() {
  return (
    <g>
      <path d="M8 -38 A36 36 0 1 0 38 14 A28 28 0 1 1 8 -38Z" fill={cozy.rest} />
      <g transform="translate(-18 22)" opacity={0.95}>
        <circle cx={-12} cy={0} r={10} fill={cozy.surface} />
        <circle cx={2} cy={-5} r={13} fill={cozy.surface} />
        <circle cx={16} cy={1} r={8} fill={cozy.surface} />
        <rect x={-22} y={0} width={46} height={9} rx={4.5} fill={cozy.surface} />
      </g>
    </g>
  );
}

export default function WorkoutHeroArt({ kind, className = "" }: { kind: EmblemKind; className?: string }) {
  const reduce = useReducedMotion();
  const isRest = kind === "rest";
  const halo = isRest ? cozy.restSoft : cozy.primarySoft;

  return (
    <svg
      viewBox="0 0 390 236"
      preserveAspectRatio="xMidYMax slice"
      className={`block h-full w-full ${className}`}
      aria-hidden="true"
    >
      {/* sky warmth */}
      <circle cx={292} cy={104} r={86} fill={halo} opacity={0.9} />
      <circle cx={292} cy={104} r={56} fill={cozy.surface} opacity={0.55} />

      {/* far + mid hills */}
      <path d="M0 150 C60 128 120 136 176 146 C236 157 268 118 318 116 C352 115 372 124 390 132 V236 H0Z" fill={cozy.bgDeep} />
      <path d="M0 184 C70 166 140 176 206 170 C262 165 314 150 390 158 V236 H0Z" fill={cozy.grass} opacity={0.35} />

      {/* the trail, climbing to today's summit */}
      <path
        d="M28 236 C112 220 168 206 128 188 C96 174 146 160 226 151 C258 147 283 136 296 126
           L303 128 C293 141 268 154 236 159 C174 168 142 178 162 192 C198 214 152 230 122 236Z"
        fill={cozy.path}
        stroke={cozy.pathEdge}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M78 232 C150 214 150 198 136 188 C120 176 170 164 232 156 C262 151 282 141 297 130"
        fill="none" stroke={cozy.pathEdge} strokeWidth={3} strokeDasharray="0.1 11" strokeLinecap="round" />

      {!isRest && <MilestoneFlag x={300} y={130} scale={0.85} />}

      {/* scenery */}
      <Bush x={352} y={176} scale={0.9} />
      <Sprig x={30} y={196} />
      <Rocks x={210} y={214} scale={0.85} />
      <GrassTuft x={262} y={196} />
      <GrassTuft x={70} y={214} flip />
      <Sparkle x={362} y={68} size={6} color={cozy.streak} />
      <Sparkle x={228} y={60} size={4} color={isRest ? cozy.restDeep : cozy.primary} />

      {/* today's emblem, floating like the Journey's Today checkpoint */}
      <g transform="translate(118 108)">
        <motion.ellipse
          cx={0}
          cy={74}
          rx={42}
          ry={7}
          fill={cozy.ink}
          opacity={0.1}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={reduce ? undefined : { scaleX: [1, 0.88, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.g
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, -6, 0], scale: 1 }}
          transition={
            reduce
              ? { duration: 0.4 }
              : { opacity: { duration: 0.5, delay: 0.15 }, scale: { duration: 0.5, delay: 0.15 }, y: { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 } }
          }
        >
          {kind === "dumbbell" && <DumbbellEmblem />}
          {kind === "kettlebell" && <KettlebellEmblem />}
          {kind === "heart" && <HeartEmblem />}
          {kind === "target" && <TargetEmblem />}
          {kind === "rest" && <RestEmblem />}
          {kind === "full" && (
            <g>
              <g transform="translate(-22 -18) scale(0.78)"><DumbbellEmblem /></g>
              <g transform="translate(46 34)"><KettlebellEmblem scale={0.5} /></g>
            </g>
          )}
        </motion.g>
      </g>
    </svg>
  );
}
