import { useState } from "react";
import { motion } from "framer-motion";

interface WeightSelectorProps {
  onSelect: (weight: number, unit: 'kg' | 'lbs') => void;
}

export default function WeightSelector({ onSelect }: WeightSelectorProps) {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [weight, setWeight] = useState(70);

  const minWeight = unit === 'kg' ? 30 : 66;
  const maxWeight = unit === 'kg' ? 200 : 440;

  const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit !== unit) {
      const convertedWeight = newUnit === 'lbs'
        ? Math.round(weight * 2.205)
        : Math.round(weight / 2.205);
      setUnit(newUnit);
      setWeight(Math.max(newUnit === 'kg' ? 30 : 66, Math.min(newUnit === 'kg' ? 200 : 440, convertedWeight)));
    }
  };

  const handleContinue = () => {
    onSelect(weight, unit);
  };

  const percentage = ((weight - minWeight) / (maxWeight - minWeight)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-8"
    >
      <div className="flex justify-center gap-3">
        <button
          onClick={() => handleUnitChange('kg')}
          className={`
            px-8 py-3 rounded-full font-semibold text-base transition-all duration-200
            ${unit === 'kg'
              ? 'bg-white text-[#0f0f1a] shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }
          `}
          data-testid="button-unit-kg"
        >
          Kg
        </button>
        <button
          onClick={() => handleUnitChange('lbs')}
          className={`
            px-8 py-3 rounded-full font-semibold text-base transition-all duration-200
            ${unit === 'lbs'
              ? 'bg-white text-[#0f0f1a] shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }
          `}
          data-testid="button-unit-lbs"
        >
          Lbs
        </button>
      </div>

      <div className="text-center py-6">
        <motion.div
          key={weight}
          initial={{ scale: 0.95, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="inline-flex items-baseline"
        >
          <span className="text-7xl font-bold text-white">{weight}</span>
          <span className="text-2xl font-medium text-white/50 ml-2">{unit}</span>
        </motion.div>
      </div>

      <div className="px-2 space-y-4">
        <div className="relative">
          <input
            type="range"
            min={minWeight}
            max={maxWeight}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7c57ff 0%, #60a5fa ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
            }}
            data-testid="slider-weight"
          />
          
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, #7c57ff, #60a5fa);
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(124, 87, 255, 0.4);
              border: 3px solid white;
            }
            input[type="range"]::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, #7c57ff, #60a5fa);
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(124, 87, 255, 0.4);
              border: 3px solid white;
            }
          `}</style>
        </div>

        <div className="flex justify-between text-sm text-white/40 font-medium">
          <span>{minWeight} {unit}</span>
          <span>{maxWeight} {unit}</span>
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
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
    </motion.div>
  );
}
