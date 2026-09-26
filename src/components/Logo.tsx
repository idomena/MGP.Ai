import { BrandWordmark } from "@/components/brand/Brand";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

// Official MGP.AI wordmark (light-background variant). Small sizes drop the tagline.
const sizes = {
  sm: { height: 26, variant: "compact" as const },
  md: { height: 32, variant: "compact" as const },
  lg: { height: 64, variant: "full" as const },
  xl: { height: 96, variant: "full" as const },
};

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const s = sizes[size];
  return <BrandWordmark height={s.height} variant={s.variant} className={className} />;
}
