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
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          const IconComponent = getIcon(option.icon);

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionClick(option.id)}
              className={`
                relative p-4 rounded-xl text-left transition-all
                ${isSelected
                  ? 'bg-gradient-to-br from-[#7c57ff]/30 to-[#60a5fa]/30 border-2 border-[#7c57ff]'
                  : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                }
              `}
              data-testid={`option-card-${option.id}`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              {IconComponent && (
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-[#7c57ff]/20' : 'bg-white/10'
                }`}>
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-[#7c57ff]' : 'text-white/60'}`} />
                </div>
              )}

              <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-white/80'}`}>
                {option.label}
              </p>

              {option.description && (
                <p className="text-xs text-white/50 mt-1">{option.description}</p>
              )}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={handleConfirm}
        disabled={selected.length === 0}
        className={`
          w-full py-3 rounded-xl font-semibold transition-all
          ${selected.length > 0
            ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
          }
        `}
        data-testid="button-confirm-selection"
      >
        {multiSelect ? `Confirm Selection (${selected.length})` : 'Confirm'}
      </button>
    </motion.div>
  );
}
