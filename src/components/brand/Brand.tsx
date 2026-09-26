/**
 * Official MGP.AI brand assets.
 *
 * Source art (unchanged, kept in the repo):
 *   - src/assets/images/logo.png   — primary wordmark (cyan→purple "MGP·AI" + "My Gym Partner")
 *   - public/mgp-icon.jpeg         — monogram mark (white on black)
 *
 * Derived variants for the warm light UI (same artwork, nothing redrawn):
 *   - brand/mgp-wordmark-light.png   — wordmark with the white tagline recoloured to warm ink
 *   - brand/mgp-wordmark-compact.png — wordmark letters only (tagline cropped), for small placements
 *   - brand/mgp-mark.png             — monogram as a white-on-transparent alpha mask, tintable via CSS
 */
import type { CSSProperties } from "react";
import wordmarkLight from "@/assets/brand/mgp-wordmark-light.png";
import wordmarkCompact from "@/assets/brand/mgp-wordmark-compact.png";
import markMask from "@/assets/brand/mgp-mark.png";

interface WordmarkProps {
  /** Rendered height in px. */
  height: number;
  /** "full" includes the "My Gym Partner" tagline. */
  variant?: "full" | "compact";
  className?: string;
}

export function BrandWordmark({ height, variant = "full", className = "" }: WordmarkProps) {
  return (
    <img
      src={variant === "full" ? wordmarkLight : wordmarkCompact}
      alt="MGP.AI - My Gym Partner"
      style={{ height, width: "auto" }}
      className={`select-none object-contain ${className}`}
      draggable={false}
      data-testid="logo-image"
    />
  );
}

interface MarkProps {
  size: number;
  /** Any CSS colour or cozy token, e.g. "var(--cozy-primary)". */
  color?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** The MGP monogram, tinted to any colour (it's a mask, so it follows the palette). */
export function BrandMark({ size, color = "var(--cozy-ink)", className = "", style, title }: MarkProps) {
  const mask = `url(${markMask}) center / contain no-repeat`;
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size * (701 / 740),
        backgroundColor: color,
        WebkitMask: mask,
        mask,
        ...style,
      }}
    />
  );
}
