import { useState } from "react";
import { motion } from "framer-motion";
import { Check, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Option {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

interface OptionSelectorProps {
  options: Option[];
  multiSelect: boolean;
  onSelect: (selected: string[]) => void;
}

export default function OptionSelector({ options, multiSelect, onSelect }: OptionSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const getIcon = (iconName?: string): LucideIcon | null => {
    if (!iconName) return null;
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    return icons[iconName] || null;
  };

  const handleOptionClick = (optionId: string) => {
    let newSelected: string[];

    if (multiSelect) {
      newSelected = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];
    } else {
      newSelected = selected.includes(optionId) ? [] : [optionId];
    }

    setSelected(newSelected);
  };

  const handleConfirm = () => {
    if (selected.length > 0) {
      onSelect(selected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-3"
    >
      {options.map((option, index) => {
        const isSelected = selected.includes(option.id);
        const IconComponent = getIcon(option.icon);

        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleOptionClick(option.id)}
            className={`
              w-full flex items-center justify-between p-4 rounded-2xl
              transition-all duration-200 border-2
              ${isSelected
                ? 'bg-[#7c57ff]/10 border-[#7c57ff]'
                : 'bg-white/5 border-transparent hover:bg-white/10'
              }
            `}
            data-testid={`option-card-${option.id}`}
          >
            <div className="flex items-center gap-4">
              {IconComponent && (
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${isSelected ? 'bg-[#7c57ff]/20' : 'bg-white/10'}
                `}>
                  <IconComponent className={`w-6 h-6 ${isSelected ? 'text-[#7c57ff]' : 'text-white/60'}`} />
                </div>
              )}
              <div className="text-left">
                <p className={`font-semibold text-base ${isSelected ? 'text-white' : 'text-white/90'}`}>
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-sm text-white/50 mt-0.5">{option.description}</p>
                )}
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
        disabled={selected.length === 0}
        className={`
          w-full mt-6 py-4 rounded-2xl font-semibold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200 btn-glow
          ${selected.length > 0
            ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
          }
        `}
        data-testid="button-confirm-selection"
      >
        <span>Continue</span>
        {selected.length > 0 && (
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
