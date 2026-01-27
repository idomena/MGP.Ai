import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface WeightSelectorProps {
  onSelect: (weight: number, unit: 'kg' | 'lbs') => void;
}

export default function WeightSelector({ onSelect }: WeightSelectorProps) {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [weight, setWeight] = useState(70);
  const scrollRef = useRef<HTMLDivElement>(null);

  const minWeight = unit === 'kg' ? 30 : 66;
  const maxWeight = unit === 'kg' ? 200 : 440;

  const weights = Array.from(
    { length: maxWeight - minWeight + 1 },
    (_, i) => minWeight + i
  );

  useEffect(() => {
    if (scrollRef.current) {
      const index = weight - minWeight;
      const itemWidth = 16;
      const containerWidth = scrollRef.current.offsetWidth;
      const scrollPosition = (index * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
      scrollRef.current.scrollLeft = scrollPosition;
    }
  }, [weight, minWeight]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.offsetWidth;
      const scrollPosition = scrollRef.current.scrollLeft + (containerWidth / 2);
      const itemWidth = 16;
      const index = Math.round(scrollPosition / itemWidth);
      const newWeight = Math.max(minWeight, Math.min(maxWeight, minWeight + index));
      if (newWeight !== weight) {
        setWeight(newWeight);
      }
    }
  };

  const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit !== unit) {
      const newMinWeight = newUnit === 'kg' ? 30 : 66;
      const newMaxWeight = newUnit === 'kg' ? 200 : 440;
      const convertedWeight = newUnit === 'lbs'
        ? Math.round(weight * 2.205)
        : Math.round(weight / 2.205);
      setUnit(newUnit);
      setWeight(Math.max(newMinWeight, Math.min(newMaxWeight, convertedWeight)));
    }
  };

  const handleContinue = () => {
    onSelect(weight, unit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-8"
    >
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleUnitChange('kg')}
          className={`
            px-10 py-3 rounded-full font-semibold text-lg transition-all duration-200 border-2
            ${unit === 'kg'
              ? 'bg-white text-[#0f0f1a] border-white'
              : 'bg-transparent text-white/70 border-white/20 hover:border-white/40'
            }
          `}
          data-testid="button-unit-kg"
        >
          Kg
        </button>
        <button
          onClick={() => handleUnitChange('lbs')}
          className={`
            px-10 py-3 rounded-full font-semibold text-lg transition-all duration-200 border-2
            ${unit === 'lbs'
              ? 'bg-white text-[#0f0f1a] border-white'
              : 'bg-transparent text-white/70 border-white/20 hover:border-white/40'
            }
          `}
          data-testid="button-unit-lbs"
        >
          Lbs
        </button>
      </div>

      <div className="text-center py-8">
        <motion.div
          key={weight}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-flex items-baseline gap-2"
        >
          <span className="text-7xl font-bold text-white">{weight}</span>
          <span className="text-3xl font-medium text-white/60">{unit}</span>
        </motion.div>
      </div>

      <div className="relative h-24">
        <div className="absolute left-1/2 top-0 w-1 h-16 bg-[#7c57ff] transform -translate-x-1/2 z-10 rounded-full" />
        <div className="absolute left-1/2 top-14 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#7c57ff]" />
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-x-auto hide-scrollbar h-full flex items-end pb-4"
        >
          <div
            className="flex items-end"
            style={{
              width: `${weights.length * 16 + 400}px`,
              paddingLeft: '50%',
              paddingRight: '50%'
            }}
          >
            {weights.map((w) => {
              const isMajor = w % 10 === 0;
              const isMid = w % 5 === 0 && !isMajor;
              const distance = Math.abs(w - weight);
              const opacity = distance === 0 ? 1 : distance < 5 ? 0.6 : 0.3;

              return (
                <div
                  key={w}
                  className="flex flex-col items-center justify-end"
                  style={{ width: '16px' }}
                >
                  <div
                    className="w-0.5 rounded-full transition-all duration-150"
                    style={{
                      height: isMajor ? '40px' : isMid ? '24px' : '12px',
                      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                    }}
                  />
                  {isMajor && (
                    <span
                      className="text-xs mt-2 font-medium transition-all"
                      style={{ color: `rgba(255, 255, 255, ${opacity})` }}
                    >
                      {w}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white font-semibold text-lg shadow-lg shadow-[#7c57ff]/30 hover:shadow-[#7c57ff]/50 transition-all flex items-center justify-center gap-3"
          data-testid="button-continue-weight"
        >
          <span>Continue</span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
