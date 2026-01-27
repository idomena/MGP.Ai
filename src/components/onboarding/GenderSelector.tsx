import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface GenderOption {
  id: 'male' | 'female' | 'other';
  label: string;
  emoji: string;
}

const genderOptions: GenderOption[] = [
  { id: 'female', label: 'Female', emoji: '👩' },
  { id: 'male', label: 'Male', emoji: '👨' },
  { id: 'other', label: 'Other', emoji: '🧑' },
];

interface GenderSelectorProps {
  onSelect: (gender: 'male' | 'female' | 'other') => void;
}

export function GenderSelector({ onSelect }: GenderSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
  };

  const handleContinue = () => {
    if (selected) {
      onSelect(selected as 'male' | 'female' | 'other');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-3"
    >
      {genderOptions.map((option, index) => {
        const isSelected = selected === option.id;
        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(option.id)}
            className={`
              w-full flex items-center justify-between p-4 rounded-2xl
              transition-all duration-200 border-2
              ${isSelected 
                ? 'bg-[#7c57ff]/10 border-[#7c57ff]' 
                : 'bg-white/5 border-transparent hover:bg-white/10'
              }
            `}
            data-testid={`button-gender-${option.id}`}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-2xl
                ${isSelected ? 'bg-[#7c57ff]/20' : 'bg-white/10'}
              `}>
                {option.emoji}
              </div>
              <span className="text-lg font-medium text-white">{option.label}</span>
            </div>
            
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${isSelected 
                ? 'bg-[#7c57ff] border-[#7c57ff]' 
                : 'border-white/30'
              }
            `}>
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
          </motion.button>
        );
      })}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={!selected}
        className={`
          w-full mt-6 py-4 rounded-2xl font-semibold text-lg
          flex items-center justify-center gap-2
          transition-all duration-200
          ${selected
            ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
          }
        `}
        data-testid="button-continue-gender"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
