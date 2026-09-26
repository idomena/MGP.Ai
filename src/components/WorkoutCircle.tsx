import { Check, Lock } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkoutCircleProps {
  dayNumber: number;
  title: string;
  status: "completed" | "current" | "locked";
  onClick: () => void;
}

export function WorkoutCircle({
  dayNumber,
  title,
  status,
  onClick,
}: WorkoutCircleProps) {
  const getStyles = () => {
    switch (status) {
      case "completed":
        return " bg-cozy-sage cursor-pointer shadow-cozy-md ";
      case "current":
        return " bg-cozy-primary cursor-pointer shadow-cozy-md ";
      case "locked":
        return "bg-cozy-line cursor-not-allowed opacity-60";
    }
  };

  const isClickable = status !== "locked";

  const circleContent = (
    <motion.button
      type="button"
      className={`
        relative rounded-full w-14 h-14 sm:w-16 sm:h-16 
        flex items-center justify-center 
        transition-all duration-200 
        border-2 border-transparent
        focus:outline-none focus:ring-2 focus:ring-cozy-primary focus:ring-offset-2 focus:ring-offset-cozy-bg
        ${getStyles()}
      `}
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { scale: 1.08 } : undefined}
      whileTap={isClickable ? { scale: 0.95 } : undefined}
      disabled={!isClickable}
      aria-label={`Day ${dayNumber}: ${title}${status === "completed" ? " - Completed" : status === "current" ? " - Today's workout" : " - Locked"}`}
      data-testid={`workout-circle-${dayNumber}`}
    >
      {status === "completed" && (
        <Check className="w-6 h-6 sm:w-7 sm:h-7 text-cozy-ink" strokeWidth={3} />
      )}

      {status === "current" && (
        <>
          <span className="text-cozy-ink font-bold text-lg sm:text-xl">
            {dayNumber}
          </span>
          <span className="absolute -top-1 -right-1 bg-cozy-surface text-cozy-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
            TODAY
          </span>
          <span className="absolute inset-0 rounded-full animate-ping bg-cozy-primary-soft" />
        </>
      )}

      {status === "locked" && (
        <div className="flex flex-col items-center">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-cozy-ink-soft" />
          <span className="text-cozy-ink-faint text-xs font-medium mt-0.5">
            {dayNumber}
          </span>
        </div>
      )}
    </motion.button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{circleContent}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-cozy-surface text-cozy-ink border-cozy-line px-3 py-2"
      >
        <div className="text-center">
          <p className="font-semibold">Day {dayNumber}</p>
          <p className="text-xs text-cozy-ink-soft">{title}</p>
          {status === "locked" && (
            <p className="text-xs text-cozy-streak-deep mt-1">
              Complete previous days first
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default WorkoutCircle;
