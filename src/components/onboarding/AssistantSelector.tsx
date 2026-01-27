import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Apple, Dumbbell, Check } from "lucide-react";

type AssistantType = 'coach' | 'nutritionist' | 'trainer';

interface AssistantSelectorProps {
  onSelect: (type: AssistantType) => void;
}

const assistants = [
  {
    type: 'coach' as AssistantType,
    name: 'Coach',
    icon: Flame,
    emoji: '🏋️',
    description: 'Motivational support & accountability',
  },
  {
    type: 'nutritionist' as AssistantType,
    name: 'Nutritionist',
    icon: Apple,
    emoji: '🥗',
    description: 'Diet guidance & meal planning',
  },
  {
    type: 'trainer' as AssistantType,
    name: 'Fitness Trainer',
    icon: Dumbbell,
    emoji: '💪',
    description: 'Technique & exercise coaching',
  },
];

export default function AssistantSelector({ onSelect }: AssistantSelectorProps) {
  const [selected, setSelected] = useState<AssistantType | null>(null);

  const handleSelect = (type: AssistantType) => {
    setSelected(type);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-3"
    >
      {assistants.map((assistant, index) => {
        const isSelected = selected === assistant.type;

        return (
          <motion.button
            key={assistant.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(assistant.type)}
            className={`
              w-full flex items-center justify-between p-4 rounded-2xl
              transition-all duration-200 border-2
              ${isSelected
                ? 'bg-[#7c57ff]/10 border-[#7c57ff]'
                : 'bg-white/5 border-transparent hover:bg-white/10'
              }
            `}
            data-testid={`assistant-${assistant.type}`}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                ${isSelected ? 'bg-[#7c57ff]/20' : 'bg-white/10'}
              `}>
                {assistant.emoji}
              </div>
              <div className="text-left">
                <p className={`font-semibold text-base ${isSelected ? 'text-white' : 'text-white/90'}`}>
                  {assistant.name}
                </p>
                <p className="text-sm text-white/50">{assistant.description}</p>
              </div>
            </div>

            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
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
        onClick={handleConfirm}
        disabled={!selected}
        className={`
          w-full mt-6 py-4 rounded-2xl font-semibold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${selected
            ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
          }
        `}
        data-testid="button-confirm-assistant"
      >
        <span>Continue</span>
        {selected && (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}
