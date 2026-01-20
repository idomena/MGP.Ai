import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play } from "lucide-react";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
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
  const nodeSize = 70;
  const todayNodeSize = 90;
  const padding = 80;
  const amplitude = Math.min(containerWidth * 0.2, 100);

  const getNodePosition = (index: number): NodePosition => {
    const frequency = 0.5;
    const xOffset = Math.sin(index * frequency * Math.PI) * amplitude;
    return {
      x: containerWidth / 2 + xOffset,
      y: padding + index * nodeSpacing,
    };
  };

  const nodePositions = dayStatuses.map((_, idx) => getNodePosition(idx));
  const totalHeight = padding * 2 + (dayStatuses.length - 1) * nodeSpacing + 100;

  const generatePathSegment = (startIdx: number, endIdx: number): string => {
    if (endIdx <= startIdx) return '';
    const start = nodePositions[startIdx];
    const end = nodePositions[endIdx];
    const midY = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-visible"
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
        width={containerWidth}
        height={totalHeight}
        viewBox={`0 0 ${containerWidth} ${totalHeight}`}
        preserveAspectRatio="none"
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
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {nodePositions.map((_, idx) => {
          if (idx === 0) return null;
          const prevDayCompleted = dayStatuses[idx - 1]?.isCompleted;
          const isUpcoming = !prevDayCompleted;
          const pathD = generatePathSegment(idx - 1, idx);
          
          if (isUpcoming) {
            return (
              <motion.path
                key={`path-${idx}`}
                d={pathD}
                stroke="#3f3f46"
                strokeWidth="4"
                strokeDasharray="8 8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              />
            );
          }
          
          return (
            <g key={`path-${idx}`}>
              <motion.path
                d={pathD}
                stroke="url(#completedGradient)"
                strokeWidth="8"
                fill="none"
                opacity="0.3"
                strokeLinecap="round"
                filter="url(#glowFilter)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              />
              <motion.path
                d={pathD}
                stroke="url(#completedGradient)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              />
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-0" style={{ height: `${totalHeight}px` }}>
        {dayStatuses.map((dayInfo, idx) => {
          const position = nodePositions[idx];
          const isActive = dayInfo.status === "active" && !dayInfo.isCompleted;
          const isLocked = dayInfo.status === "locked" || dayInfo.status === "preview";
          const isCompleted = dayInfo.isCompleted;
          const size = isActive ? todayNodeSize : nodeSize;
          const workout = getWorkoutForDay(dayInfo.day);

          return (
            <motion.div
              key={dayInfo.day}
              ref={isActive ? todayRef : undefined}
              className="absolute"
              style={{ 
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: idx * 0.06,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
            >
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="rounded-full bg-[#7c57ff]/30"
                    style={{ width: size + 30, height: size + 30 }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              )}

              {isActive && (
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#aaf163] text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 + 0.3 }}
                >
                  TODAY
                </motion.div>
              )}

              <button
                onClick={() => !isLocked && onDayClick(dayInfo.day)}
                disabled={isLocked}
                className={`
                  relative flex items-center justify-center rounded-full transition-all duration-200
                  ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 active:scale-95'}
                  focus:outline-none focus:ring-2 focus:ring-[#7c57ff] focus:ring-offset-2 focus:ring-offset-[#0a0e27]
                `}
                style={{ 
                  width: size, 
                  height: size,
                  background: isCompleted 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : isActive 
                      ? 'linear-gradient(135deg, #7c57ff 0%, #60a5fa 100%)'
                      : 'linear-gradient(135deg, #52525b 0%, #3f3f46 100%)',
                  boxShadow: isActive 
                    ? '0 0 30px rgba(124,87,255,0.6), 0 0 60px rgba(124,87,255,0.3)'
                    : isCompleted
                      ? '0 0 20px rgba(16,185,129,0.4)'
                      : 'none',
                }}
                aria-label={`Day ${dayInfo.day} - ${workout.name}${isLocked ? ' (locked)' : isCompleted ? ' (completed)' : isActive ? ' (today)' : ''}`}
                data-testid={`journey-node-${dayInfo.day}`}
              >
                <div className="absolute inset-1 rounded-full border-2 border-white/10" />
                
                {isLocked ? (
                  <Lock className="w-6 h-6 text-white/50" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-7 h-7 text-white" />
                ) : isActive ? (
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                ) : (
                  <span className="text-white font-bold text-lg">{dayInfo.day}</span>
                )}
              </button>

              <div className={`
                mt-3 text-center whitespace-nowrap
                ${isActive ? 'text-white font-semibold' : 'text-white/50'}
              `}>
                <div className="text-sm">Day {dayInfo.day}</div>
                {isActive && (
                  <div className="text-xs text-[#7c57ff] mt-0.5">{workout.shortName}</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, #0a0e27 100%)'
        }}
      />
    </div>
  );
}
