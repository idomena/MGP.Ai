import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface YesNoSelectorProps {
  onSelect: (value: boolean) => void;
}

export default function YesNoSelector({ onSelect }: YesNoSelectorProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (value: boolean) => {
    setSelected(value);
  };

  const handleContinue = () => {
    if (selected !== null) {
      onSelect(selected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-3"
    >
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0 }}
        onClick={() => handleSelect(true)}
        className={`
          w-full flex items-center justify-between p-4 rounded-2xl
          transition-all duration-200 border-2
          ${selected === true
            ? 'bg-cozy-sage-soft border-cozy-sage'
            : 'bg-cozy-sunk border-transparent hover:bg-cozy-sunk'
          }
        `}
        data-testid="button-yes"
      >
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${selected === true ? 'bg-cozy-sage-soft' : 'bg-cozy-sunk'}
          `}>
            <Check className={`w-6 h-6 ${selected === true ? 'text-cozy-sage-deep' : 'text-cozy-ink-soft'}`} />
          </div>
          <span className={`text-lg font-semibold ${selected === true ? 'text-cozy-ink' : 'text-cozy-ink-soft'}`}>
            Yes, I have some
          </span>
        </div>

        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${selected === true
            ? 'bg-cozy-sage border-cozy-sage'
            : 'border-cozy-line'
          }
        `}>
          {selected === true && <Check className="w-4 h-4 text-cozy-ink" />}
        </div>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => handleSelect(false)}
        className={`
          w-full flex items-center justify-between p-4 rounded-2xl
          transition-all duration-200 border-2
          ${selected === false
            ? 'bg-cozy-primary-soft border-cozy-primary'
            : 'bg-cozy-sunk border-transparent hover:bg-cozy-sunk'
          }
        `}
        data-testid="button-no"
      >
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${selected === false ? 'bg-cozy-primary-soft' : 'bg-cozy-sunk'}
          `}>
            <X className={`w-6 h-6 ${selected === false ? 'text-cozy-primary' : 'text-cozy-ink-soft'}`} />
          </div>
          <span className={`text-lg font-semibold ${selected === false ? 'text-cozy-ink' : 'text-cozy-ink-soft'}`}>
            No, I'm injury-free
          </span>
        </div>

        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${selected === false
            ? 'bg-cozy-primary border-cozy-primary'
            : 'border-cozy-line'
          }
        `}>
          {selected === false && <Check className="w-4 h-4 text-cozy-ink" />}
        </div>
      </motion.button>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleContinue}
        disabled={selected === null}
        className={`
          w-full mt-6 py-4 rounded-2xl font-semibold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${selected !== null
            ? ' bg-cozy-primary text-white shadow-cozy-md '
            : 'bg-cozy-sunk text-cozy-ink-faint cursor-not-allowed'
          }
        `}
        data-testid="button-continue-yesno"
      >
        <span>Continue</span>
        {selected !== null && (
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
