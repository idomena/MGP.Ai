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
                ? 'bg-cozy-primary-soft border-cozy-primary' 
                : 'bg-cozy-sunk border-transparent hover:bg-cozy-sunk'
              }
            `}
            data-testid={`button-gender-${option.id}`}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-2xl
                ${isSelected ? 'bg-cozy-primary-soft' : 'bg-cozy-sunk'}
              `}>
                {option.emoji}
              </div>
              <span className="text-lg font-medium text-cozy-ink">{option.label}</span>
            </div>
            
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${isSelected 
                ? 'bg-cozy-primary border-cozy-primary' 
                : 'border-cozy-line'
              }
            `}>
              {isSelected && <Check className="w-4 h-4 text-cozy-ink" />}
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
            ? ' bg-cozy-primary text-white shadow-cozy-md '
            : 'bg-cozy-sunk text-cozy-ink-faint cursor-not-allowed'
          }
        `}
        data-testid="button-continue-gender"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
