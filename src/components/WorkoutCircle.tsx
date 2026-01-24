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
        return "bg-gradient-to-br from-green-500 to-green-600 cursor-pointer shadow-lg shadow-green-500/20";
      case "current":
        return "bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] cursor-pointer shadow-lg shadow-purple-500/30";
      case "locked":
        return "bg-zinc-700/50 cursor-not-allowed opacity-60";
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
        focus:outline-none focus:ring-2 focus:ring-[#7c57ff] focus:ring-offset-2 focus:ring-offset-[#0a0e27]
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
        <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={3} />
      )}

      {status === "current" && (
        <>
          <span className="text-white font-bold text-lg sm:text-xl">
            {dayNumber}
          </span>
          <span className="absolute -top-1 -right-1 bg-white text-[#7c57ff] text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
            TODAY
          </span>
          <span className="absolute inset-0 rounded-full animate-ping bg-[#7c57ff]/30" />
        </>
      )}

      {status === "locked" && (
        <div className="flex flex-col items-center">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
          <span className="text-white/40 text-xs font-medium mt-0.5">
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
        className="bg-zinc-800 text-white border-zinc-700 px-3 py-2"
      >
        <div className="text-center">
          <p className="font-semibold">Day {dayNumber}</p>
          <p className="text-xs text-zinc-400">{title}</p>
          {status === "locked" && (
            <p className="text-xs text-orange-400 mt-1">
              Complete previous days first
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default WorkoutCircle;
