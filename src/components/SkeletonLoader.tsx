import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
}

export function Skeleton({ className = "", variant = "rectangular" }: SkeletonProps) {
  const baseClasses = "skeleton";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-lg",
    card: "rounded-2xl",
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}

export function WorkoutCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-14 h-14" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4 h-5" />
          <Skeleton variant="text" className="w-1/2 h-4" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function JourneyPathSkeleton() {
  return (
    <div className="flex flex-col items-center py-10 space-y-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4"
        >
          <Skeleton variant="circular" className="w-16 h-16" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-24 h-4" />
            <Skeleton variant="text" className="w-16 h-3" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col items-center gap-4">
        <Skeleton variant="circular" className="w-24 h-24" />
        <Skeleton variant="text" className="w-32 h-6" />
        <Skeleton variant="text" className="w-48 h-4" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="card" className="h-16" />
        ))}
      </div>
    </div>
  );
}
