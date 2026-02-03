import logoImage from "@/assets/images/logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
  xl: "h-24",
};

export default function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <img
      src={logoImage}
      alt="MGP.AI - My Gym Partner"
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      data-testid="logo-image"
    />
  );
}
