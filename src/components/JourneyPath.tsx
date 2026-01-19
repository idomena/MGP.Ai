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

  const nodeSpacing = 100;
  const viewBoxWidth = 300;
  const nodeRadius = 32;
  const padding = 50;

  const getNodePosition = (index: number): NodePosition => {
    const patterns = [
      { xPercent: 50 },
      { xPercent: 28 },
      { xPercent: 72 },
      { xPercent: 35 },
      { xPercent: 65 },
    ];
    const pattern = patterns[index % patterns.length];
    return {
      x: (viewBoxWidth * pattern.xPercent) / 100,
      y: padding + index * nodeSpacing,
    };
  };

  const nodePositions = dayStatuses.map((_, idx) => getNodePosition(idx));
  const viewBoxHeight = padding * 2 + (dayStatuses.length - 1) * nodeSpacing;

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

  const aspectRatio = viewBoxWidth / viewBoxHeight;
  const containerHeight = `${viewBoxHeight * 1.2}px`;

  return (
    <div className="relative w-full" style={{ height: containerHeight }}>
      <svg 
        className="w-full h-full" 
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c57ff" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background glow path */}
        {pathD && (
          <motion.path
            d={pathD}
            stroke="url(#journeyGradient)"
            strokeWidth="12"
            fill="none"
            opacity="0.4"
            filter="url(#pathGlow)"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        )}
        
        {/* Main path */}
        {pathD && (
          <motion.path
            d={pathD}
            stroke="url(#journeyGradient)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        {/* Workout Nodes - rendered inside SVG */}
        {dayStatuses.map((dayInfo, idx) => {
          const position = nodePositions[idx];
          const isActive = dayInfo.status === "active";
          const isLocked = dayInfo.status === "locked";
          const isCompleted = dayInfo.isCompleted;
          const workout = getWorkoutForDay(dayInfo.day);

          const bgColor = isCompleted 
            ? "#10b981" 
            : isActive 
              ? "#7c57ff"
              : isLocked
                ? "#3f3f46"
                : "#6b5fb8";

          const glowColor = isCompleted 
            ? "rgba(16,185,129,0.6)" 
            : isActive 
              ? "rgba(124,87,255,0.7)"
              : "transparent";

          return (
            <motion.g
              key={dayInfo.day}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: idx * 0.08,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
              onClick={() => !isLocked && onDayClick(dayInfo.day)}
              data-testid={`journey-node-${dayInfo.day}`}
            >
              {/* Pulse ring for active day */}
              {isActive && !isCompleted && (
                <>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={nodeRadius + 10}
                    fill="none"
                    stroke="#7c57ff"
                    strokeWidth="2"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="r"
                      values={`${nodeRadius + 10};${nodeRadius + 22};${nodeRadius + 10}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0;0.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}

              {/* Glow effect circle */}
              {(isActive || isCompleted) && (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={nodeRadius + 4}
                  fill={glowColor}
                  filter="url(#nodeGlow)"
                />
              )}

              {/* Background circle with gradient */}
              <defs>
                <linearGradient id={`nodeGrad-${dayInfo.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  {isCompleted ? (
                    <>
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </>
                  ) : isActive ? (
                    <>
                      <stop offset="0%" stopColor="#7c57ff" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </>
                  ) : isLocked ? (
                    <>
                      <stop offset="0%" stopColor="#52525b" />
                      <stop offset="100%" stopColor="#3f3f46" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="rgba(124,87,255,0.7)" />
                      <stop offset="100%" stopColor="rgba(96,165,250,0.7)" />
                    </>
                  )}
                </linearGradient>
              </defs>

              {/* Main circle */}
              <circle
                cx={position.x}
                cy={position.y}
                r={nodeRadius}
                fill={`url(#nodeGrad-${dayInfo.day})`}
                stroke="#18181b"
                strokeWidth="3"
              />

              {/* Icon */}
              <g transform={`translate(${position.x - 12}, ${position.y - 12})`}>
                {isLocked ? (
                  <Lock className="w-6 h-6 text-zinc-400" width={24} height={24} color="#a1a1aa" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-white" width={24} height={24} color="white" />
                ) : isActive ? (
                  <Play className="w-6 h-6 text-white" width={24} height={24} color="white" fill="white" style={{ marginLeft: 2 }} />
                ) : (
                  <Dumbbell className="w-6 h-6 text-white/90" width={24} height={24} color="rgba(255,255,255,0.9)" />
                )}
              </g>

              {/* Day label */}
              <text
                x={position.x}
                y={position.y + nodeRadius + 18}
                textAnchor="middle"
                fill={isActive ? "white" : "#71717a"}
                fontSize="11"
                fontWeight="600"
              >
                Day {dayInfo.day}
              </text>

              {/* TODAY badge */}
              {isActive && !isCompleted && (
                <g transform={`translate(${position.x + nodeRadius - 8}, ${position.y - nodeRadius - 4})`}>
                  <rect
                    x={-16}
                    y={-8}
                    width={32}
                    height={16}
                    rx={8}
                    fill="#aaf163"
                  />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill="black"
                    fontSize="8"
                    fontWeight="700"
                  >
                    TODAY
                  </text>
                </g>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
