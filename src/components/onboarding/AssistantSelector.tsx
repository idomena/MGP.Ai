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
    description: 'Motivational support to keep you inspired and accountable on your fitness journey.',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/50',
  },
  {
    type: 'nutritionist' as AssistantType,
    name: 'Nutritionist',
    icon: Apple,
    description: 'Diet-focused guidance for optimal nutrition and meal planning.',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/50',
  },
  {
    type: 'trainer' as AssistantType,
    name: 'Fitness Trainer',
    icon: Dumbbell,
    description: 'Technique-focused coaching for proper form and exercise execution.',
    gradient: 'from-[#7c57ff] to-[#60a5fa]',
    bgGradient: 'from-[#7c57ff]/20 to-[#60a5fa]/20',
    borderColor: 'border-[#7c57ff]/50',
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
      className="space-y-4"
    >
      <p className="text-center text-white/60 text-sm mb-4">
        Choose your AI assistant type
      </p>

      <div className="space-y-3">
        {assistants.map((assistant, index) => {
          const isSelected = selected === assistant.type;
          const IconComponent = assistant.icon;

          return (
            <motion.button
              key={assistant.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(assistant.type)}
              className={`
                w-full p-4 rounded-2xl text-left transition-all relative
                bg-gradient-to-br ${assistant.bgGradient}
                border-2 ${isSelected ? assistant.borderColor : 'border-transparent'}
                hover:border-white/20
              `}
              data-testid={`assistant-${assistant.type}`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r ${assistant.gradient} flex items-center justify-center`}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${assistant.gradient} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg">{assistant.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{assistant.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected}
        className={`
          w-full py-3 rounded-xl font-semibold transition-all mt-4
          ${selected
            ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
          }
        `}
        data-testid="button-confirm-assistant"
      >
        Continue with {selected ? assistants.find(a => a.type === selected)?.name : 'Selection'}
      </button>
    </motion.div>
  );
}
