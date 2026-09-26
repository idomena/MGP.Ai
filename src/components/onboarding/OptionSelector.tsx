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
                ? 'bg-cozy-primary-soft border-cozy-primary'
                : 'bg-cozy-sunk border-transparent hover:bg-cozy-sunk'
              }
            `}
            data-testid={`option-card-${option.id}`}
          >
            <div className="flex items-center gap-4">
              {IconComponent && (
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${isSelected ? 'bg-cozy-primary-soft' : 'bg-cozy-sunk'}
                `}>
                  <IconComponent className={`w-6 h-6 ${isSelected ? 'text-cozy-primary' : 'text-cozy-ink-soft'}`} />
                </div>
              )}
              <div className="text-left">
                <p className={`font-semibold text-base ${isSelected ? 'text-cozy-ink' : 'text-cozy-ink-soft'}`}>
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-sm text-cozy-ink-faint mt-0.5">{option.description}</p>
                )}
              </div>
            </div>

            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
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
        onClick={handleConfirm}
        disabled={selected.length === 0}
        className={`
          w-full mt-6 py-4 rounded-2xl font-semibold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${selected.length > 0
            ? ' bg-cozy-primary text-white shadow-cozy-md '
            : 'bg-cozy-sunk text-cozy-ink-faint cursor-not-allowed'
          }
        `}
        data-testid="button-confirm-selection"
      >
        <span>Continue</span>
        {selected.length > 0 && (
          <div className="w-8 h-8 rounded-full bg-cozy-line flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}
