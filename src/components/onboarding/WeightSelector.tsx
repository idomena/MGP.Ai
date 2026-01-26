import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, AlertTriangle } from "lucide-react";

interface WeightSelectorProps {
  onSelect: (weight: number, unit: 'kg' | 'lbs') => void;
}

export default function WeightSelector({ onSelect }: WeightSelectorProps) {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [weight, setWeight] = useState(unit === 'kg' ? 70 : 154);

  const minWeight = unit === 'kg' ? 40 : 88;
  const maxWeight = unit === 'kg' ? 200 : 440;

  const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
    if (from === to) return value;
    return from === 'kg' ? Math.round(value * 2.205) : Math.round(value / 2.205);
  };

  const handleUnitToggle = () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg';
    const newWeight = convertWeight(weight, unit, newUnit);
    setUnit(newUnit);
    setWeight(newWeight);
  };

  const getWarning = (): string | null => {
    const weightInKg = unit === 'kg' ? weight : Math.round(weight / 2.205);
    if (weightInKg < 50) {
      return "This weight seems low. Please ensure this is accurate for your safety.";
    }
    if (weightInKg > 150) {
      return "This weight is above average. We'll customize your plan accordingly.";
    }
    return null;
  };

  const warning = getWarning();

  const handleConfirm = () => {
    onSelect(weight, unit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <Scale className="w-6 h-6 text-[#7c57ff]" />
        <span className="text-white/80 text-sm">Select your weight</span>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={handleUnitToggle}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            unit === 'kg'
              ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
          data-testid="button-unit-kg"
        >
          kg
        </button>
        <button
          onClick={handleUnitToggle}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            unit === 'lbs'
              ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
          data-testid="button-unit-lbs"
        >
          lbs
        </button>
      </div>

      <div className="text-center mb-6">
        <motion.span
          key={weight}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] bg-clip-text text-transparent"
        >
          {weight}
        </motion.span>
        <span className="text-2xl text-white/60 ml-2">{unit}</span>
      </div>

      <div className="px-4">
        <input
          type="range"
          min={minWeight}
          max={maxWeight}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7c57ff]"
          style={{
            background: `linear-gradient(to right, #7c57ff 0%, #60a5fa ${((weight - minWeight) / (maxWeight - minWeight)) * 100}%, rgba(255,255,255,0.1) ${((weight - minWeight) / (maxWeight - minWeight)) * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
          data-testid="slider-weight"
        />
        <div className="flex justify-between text-xs text-white/40 mt-2">
          <span>{minWeight} {unit}</span>
          <span>{maxWeight} {unit}</span>
        </div>
      </div>

      {warning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-200/80">{warning}</p>
        </motion.div>
      )}

      <button
        onClick={handleConfirm}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white font-semibold shadow-lg shadow-[#7c57ff]/30 hover:shadow-[#7c57ff]/50 transition-all"
        data-testid="button-confirm-weight"
      >
        Confirm Weight
      </button>
    </motion.div>
  );
}
