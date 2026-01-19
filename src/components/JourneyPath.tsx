import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, Dumbbell } from "lucide-react";

interface DayStatus {
  day: number;
  status: "locked" | "active" | "preview";
  isCompleted: boolean;
}

interface WorkoutInfo {
  name: string;
  shortName: string;
  muscles: string;
  time: string;
  exercises: number;
  focus: string;
}

interface JourneyPathProps {
  dayStatuses: DayStatus[];
  onDayClick: (day: number) => void;
  getWorkoutForDay: (day: number) => WorkoutInfo;
  isLoading?: boolean;
}

interface NodePosition {
  x: number;
  y: number;
}

export default function JourneyPath({ dayStatuses, onDayClick, getWorkoutForDay, isLoading }: JourneyPathProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#7c57ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dayStatuses.length) {
    return (
      <div className="text-muted-foreground text-center py-10">
        Loading your journey...
      </div>
    );
  }

  const nodeSpacing = 120;
  const containerWidth = 320;
  const nodeSize = 80;
  const padding = 50;

  const getNodePosition = (index: number): NodePosition => {
    const patterns = [
      { xPercent: 50 },
      { xPercent: 25 },
      { xPercent: 75 },
      { xPercent: 30 },
      { xPercent: 70 },
    ];
    const pattern = patterns[index % patterns.length];
    return {
      x: (containerWidth * pattern.xPercent) / 100,
      y: padding + index * nodeSpacing,
    };
  };

  const nodePositions = dayStatuses.map((_, idx) => getNodePosition(idx));
  const containerHeight = padding * 2 + (dayStatuses.length - 1) * nodeSpacing + nodeSize;

  const generatePath = (): string => {
    if (nodePositions.length < 2) return '';
    
    let path = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    
    for (let i = 1; i < nodePositions.length; i++) {
      const prev = nodePositions[i - 1];
      const curr = nodePositions[i];
      const midY = (prev.y + curr.y) / 2;
      
      path += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  const pathD = generatePath();

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height: containerHeight }}
    >
      {/* SVG Path connecting the nodes */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ zIndex: 0 }}
      >
        <defs>
          <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c57ff" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {pathD && (
          <>
            {/* Background glow path */}
            <motion.path
              d={pathD}
              stroke="url(#journeyGradient)"
              strokeWidth="12"
              fill="none"
              opacity="0.3"
              filter="url(#pathGlow)"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            
            {/* Main path */}
            <motion.path
              d={pathD}
              stroke="url(#journeyGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </>
        )}
      </svg>

      {/* Workout Nodes */}
      {dayStatuses.map((dayInfo, idx) => {
        const position = nodePositions[idx];
        const isActive = dayInfo.status === "active";
        const isLocked = dayInfo.status === "locked";
        const isCompleted = dayInfo.isCompleted;
        const workout = getWorkoutForDay(dayInfo.day);

        return (
          <motion.div
            key={dayInfo.day}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: idx * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="absolute"
            style={{ 
              left: `calc(${(position.x / containerWidth) * 100}% - ${nodeSize / 2}px)`,
              top: position.y - nodeSize / 2,
              width: nodeSize,
              height: nodeSize,
              zIndex: 1,
            }}
          >
            <motion.button
              onClick={() => !isLocked && onDayClick(dayInfo.day)}
              disabled={isLocked}
              className={`relative w-full h-full group ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={!isLocked ? { scale: 1.15 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              data-testid={`journey-node-${dayInfo.day}`}
            >
              {/* Pulse ring for active day */}
              {isActive && !isCompleted && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa]"
                  style={{ margin: '-6px' }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Main circle */}
              <div 
                className={`
                  w-full h-full rounded-full flex flex-col items-center justify-center
                  transition-all duration-300 border-4 border-background shadow-lg
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-[#10b981] to-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : isActive 
                      ? 'bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] shadow-[0_0_25px_rgba(124,87,255,0.5)]'
                      : isLocked
                        ? 'bg-zinc-700/90'
                        : 'bg-gradient-to-br from-[#7c57ff]/70 to-[#60a5fa]/70'
                  }
                `}
              >
                {isLocked ? (
                  <Lock className="w-7 h-7 text-zinc-400" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-white" />
                ) : isActive ? (
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                ) : (
                  <Dumbbell className="w-7 h-7 text-white/90" />
                )}
              </div>

              {/* Day label */}
              <div 
                className={`
                  absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-xs font-semibold
                  ${isActive ? 'text-white' : 'text-zinc-500'}
                `}
              >
                Day {dayInfo.day}
              </div>

              {/* Workout name tooltip on hover */}
              {!isLocked && (
                <div 
                  className={`
                    absolute left-1/2 -translate-x-1/2 -top-10
                    bg-zinc-800 text-white text-xs font-medium
                    px-3 py-1.5 rounded-lg whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none shadow-lg z-10
                  `}
                >
                  {workout.shortName}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                    <div className="border-4 border-transparent border-t-zinc-800" />
                  </div>
                </div>
              )}

              {/* TODAY badge */}
              {isActive && !isCompleted && (
                <motion.div 
                  className="absolute -right-1 -top-1 bg-[#aaf163] text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 + 0.3, type: "spring" }}
                >
                  TODAY
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
