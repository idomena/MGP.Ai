/**
 * Typed references to the Cozy design tokens defined in src/styles/cozy.css.
 * Use these in inline styles / SVG fills instead of hardcoded hex values.
 */
const v = (name: string) => `var(--cozy-${name})`;

export const cozy = {
  bg: v("bg"),
  bgDeep: v("bg-deep"),
  surface: v("surface"),
  surfaceSunk: v("surface-sunk"),
  line: v("line"),

  ink: v("ink"),
  inkSoft: v("ink-soft"),
  inkFaint: v("ink-faint"),

  primary: v("primary"),
  primaryDeep: v("primary-deep"),
  primarySoft: v("primary-soft"),
  primaryGlow: v("primary-glow"),
  primaryLine: v("primary-line"),

  sage: v("sage"),
  sageDeep: v("sage-deep"),
  sageSoft: v("sage-soft"),

  streak: v("streak"),
  streakDeep: v("streak-deep"),
  streakSoft: v("streak-soft"),

  sky: v("sky"),
  skySoft: v("sky-soft"),
  skyDeep: v("sky-deep"),
  danger: v("danger"),
  dangerSoft: v("danger-soft"),

  rest: v("rest"),
  restDeep: v("rest-deep"),
  restSoft: v("rest-soft"),

  stone: v("stone"),
  stoneDeep: v("stone-deep"),

  path: v("path"),
  pathEdge: v("path-edge"),
  pathDone: v("path-done"),
  grass: v("grass"),
  grassDeep: v("grass-deep"),
  wood: v("wood"),
  woodDeep: v("wood-deep"),

  shadowSm: v("shadow-sm"),
  shadowMd: v("shadow-md"),
  shadowLg: v("shadow-lg"),
  highlight: v("highlight"),

  fontDisplay: v("font-display"),
  fontBody: v("font-body"),
} as const;

/** Raw values needed where CSS variables can't be used (e.g. <meta name="theme-color">). */
export const cozyRaw = {
  bg: "#f6efe3",
} as const;
