interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

// Cozy wordmark. The original neon PNG (src/assets/images/logo.png) is kept in the repo
// but doesn't read on the warm light palette.
const sizes = {
  sm: { word: 20, tag: 0 },
  md: { word: 26, tag: 0 },
  lg: { word: 32, tag: 11 },
  xl: { word: 44, tag: 13 },
};

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const s = sizes[size];
  return (
    <span
      className={`inline-flex flex-col items-center leading-none ${className}`}
      role="img"
      aria-label="MGP.AI - My Gym Partner"
      data-testid="logo-image"
    >
      <span
        className="font-display font-semibold tracking-tight text-cozy-ink"
        style={{ fontSize: s.word, letterSpacing: "-0.02em" }}
      >
        MGP<span className="text-cozy-primary">·</span>AI
      </span>
      {s.tag > 0 && (
        <span
          className="mt-1.5 font-semibold uppercase text-cozy-ink-soft"
          style={{ fontSize: s.tag, letterSpacing: "0.22em" }}
        >
          My Gym Partner
        </span>
      )}
    </span>
  );
}
