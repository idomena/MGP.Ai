import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, X, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

interface DayStatus {
  day: number;
  status: "completed" | "active" | "locked" | "skipped";
  title: string;
  workoutType: string;
  date: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface JourneyPathProps {
  dayStatuses: DayStatus[];
  onDayClick: (day: number) => void;
  isLoading?: boolean;
}

interface NodePosition {
  x: number;
  y: number;
}

export default function JourneyPath({ dayStatuses, onDayClick, isLoading }: JourneyPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (todayRef.current && containerRef.current) {
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [dayStatuses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#7c57ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dayStatuses.length) {
    return (
      <div className="text-white/60 text-center py-10">
        Loading your journey...
      </div>
    );
  }

  const nodeSpacing = 140;
  const nodeRadius = 32;
  const todayNodeRadius = 42;
  const padding = 80;
  const amplitude = Math.min(containerWidth * 0.15, 80);

  const getNodePosition = (index: number): NodePosition => {
    const frequency = 0.5;
    const xOffset = Math.sin(index * frequency * Math.PI) * amplitude;
    return {
      x: containerWidth / 2 + xOffset,
      y: padding + index * nodeSpacing,
    };
  };

  const nodePositions = dayStatuses.map((_, idx) => getNodePosition(idx));
  const totalHeight = padding * 2 + (dayStatuses.length - 1) * nodeSpacing + 60;

  const generatePathD = (): string => {
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

  const fullPath = generatePathD();

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: `${totalHeight}px` }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(124,87,255,0.15) 0%, transparent 50%)'
        }}
      />

      <svg 
        className="absolute inset-0" 
        width="100%"
        height={totalHeight}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#7c57ff" />
          </linearGradient>
          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c57ff" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="nodeCompletedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="nodeActiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c57ff" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="nodeLockedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#3f3f46" />
          </linearGradient>
          <linearGradient id="nodeMissedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="activeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={fullPath}
          stroke="#3f3f46"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {nodePositions.map((pos, idx) => {
          if (idx === 0) return null;
          const prevDayStatus = dayStatuses[idx - 1]?.status;
          const prevDayCompleted = prevDayStatus === "completed";
          const prevDaySkipped = prevDayStatus === "skipped";
          
          if (prevDayCompleted) {
            const prev = nodePositions[idx - 1];
            const midY = (prev.y + pos.y) / 2;
            const segmentPath = `M ${prev.x} ${prev.y} C ${prev.x} ${midY}, ${pos.x} ${midY}, ${pos.x} ${pos.y}`;
            
            return (
              <g key={`completed-path-${idx}`}>
                <motion.path
                  d={segmentPath}
                  stroke="url(#completedGradient)"
                  strokeWidth="10"
                  fill="none"
                  opacity="0.4"
                  strokeLinecap="round"
                  filter="url(#glowFilter)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                />
                <motion.path
                  d={segmentPath}
                  stroke="url(#completedGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                />
              </g>
            );
          }
          if (prevDaySkipped) {
            const prev = nodePositions[idx - 1];
            const midY = (prev.y + pos.y) / 2;
            const segmentPath = `M ${prev.x} ${prev.y} C ${prev.x} ${midY}, ${pos.x} ${midY}, ${pos.x} ${pos.y}`;
            
            return (
              <g key={`skipped-path-${idx}`}>
                <motion.path
                  d={segmentPath}
                  stroke="#f97316"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.4"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                />
              </g>
            );
          }
          return null;
        })}

        {dayStatuses.map((dayInfo, idx) => {
          const pos = nodePositions[idx];
          const isActive = dayInfo.status === "active";
          const isLocked = dayInfo.status === "locked";
          const isCompleted = dayInfo.status === "completed";
          const isSkipped = dayInfo.status === "skipped";
          const radius = isActive ? todayNodeRadius : nodeRadius;

          return (
            <g key={`journey-day-${dayInfo.day}-${idx}`}>
              {isActive && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + 15}
                  fill="none"
                  stroke="#7c57ff"
                  strokeWidth="2"
                  opacity="0.5"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={
                  isCompleted 
                    ? "url(#nodeCompletedGradient)"
                    : isSkipped
                      ? "url(#nodeMissedGradient)"
                      : isActive 
                        ? "url(#nodeActiveGradient)"
                        : "url(#nodeLockedGradient)"
                }
                filter={isActive ? "url(#activeGlow)" : isCompleted ? "url(#glowFilter)" : undefined}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: isLocked ? 0.7 : 1 }}
                transition={{ 
                  delay: idx * 0.06,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              />

              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius - 3}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />

              <foreignObject
                x={pos.x - radius}
                y={pos.y - radius}
                width={radius * 2}
                height={radius * 2}
                style={{ overflow: 'visible' }}
              >
                <button
                  ref={isActive ? todayRef : undefined}
                  onClick={() => onDayClick(dayInfo.day)}
                  className="w-full h-full flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#7c57ff] focus:ring-offset-2 focus:ring-offset-[#0a0e27] rounded-full"
                  style={{ background: 'transparent' }}
                  aria-label={`Day ${dayInfo.day} - ${dayInfo.title}${isLocked ? ' (locked)' : isCompleted ? ' (completed)' : isSkipped ? ' (skipped)' : isActive ? ' (today)' : ''}`}
                  data-testid={`journey-node-${dayInfo.day}`}
                >
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-white/50" />
                  ) : isSkipped ? (
                    <X className="w-6 h-6 text-white" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : isActive ? (
                    <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                  ) : (
                    <span className="text-white font-bold text-base">{dayInfo.day}</span>
                  )}
                </button>
              </foreignObject>

              {isActive && (
                <motion.g
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 + 0.3 }}
                >
                  <rect
                    x={pos.x - 28}
                    y={pos.y - radius - 28}
                    width="56"
                    height="20"
                    rx="10"
                    fill="#aaf163"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - radius - 14}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#000"
                  >
                    TODAY
                  </text>
                </motion.g>
              )}

              <text
                x={pos.x}
                y={pos.y + radius + 18}
                textAnchor="middle"
                fontSize="13"
                fill={isActive ? "#fff" : "rgba(255,255,255,0.5)"}
                fontWeight={isActive ? "600" : "400"}
              >
                Day {dayInfo.day}
              </text>
              
              <text
                x={pos.x}
                y={pos.y + radius + 34}
                textAnchor="middle"
                fontSize="11"
                fill={isActive ? "#60a5fa" : "rgba(255,255,255,0.4)"}
              >
                {dayInfo.workoutType === 'chest' ? 'Chest' : 
                 dayInfo.workoutType === 'back' ? 'Back' : 
                 dayInfo.workoutType === 'shoulders' ? 'Shoulders' : 
                 dayInfo.workoutType === 'arms' ? 'Arms' : 
                 dayInfo.workoutType === 'legs' ? 'Legs' : 
                 dayInfo.workoutType === 'core' ? 'Core' : 
                 dayInfo.workoutType === 'chest_shoulders' ? 'Chest+Shoulders' : 
                 dayInfo.workoutType === 'back_arms' ? 'Back+Arms' : 
                 dayInfo.workoutType === 'chest_back' ? 'Chest+Back' : 
                 dayInfo.workoutType === 'shoulders_arms' ? 'Shoulders+Arms' : 
                 dayInfo.workoutType === 'legs_core' ? 'Legs+Core' : 
                 dayInfo.workoutType === 'full' ? 'Full Body' : 
                 dayInfo.workoutType === 'cardio' ? 'Cardio' : 
                 dayInfo.workoutType === 'rest' ? 'Rest Day' : 
                 dayInfo.workoutType}
              </text>
              
              <text
                x={pos.x}
                y={pos.y + radius + 48}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(255,255,255,0.35)"
              >
                {dayInfo.date ? formatDate(dayInfo.date) : ""}
              </text>
            </g>
          );
        })}
      </svg>

      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, #0a0e27 100%)'
        }}
      />

      {/* Coming Soon Sign */}
      <div 
        className="relative pb-20 flex flex-col items-center justify-center"
        style={{ marginTop: "-20px" }}
      >
        <div className="w-16 h-1 rounded-full bg-white/10 mb-8" />
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#7c57ff]/20 to-[#60a5fa]/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 px-8 py-6 rounded-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-lg">Coming Soon</h3>
              <p className="text-white/50 text-sm max-w-[200px]">New levels and features are being prepared for your journey.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
