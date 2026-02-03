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
            ? 'bg-emerald-500/10 border-emerald-500'
            : 'bg-white/5 border-transparent hover:bg-white/10'
          }
        `}
        data-testid="button-yes"
      >
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${selected === true ? 'bg-emerald-500/20' : 'bg-white/10'}
          `}>
            <Check className={`w-6 h-6 ${selected === true ? 'text-emerald-400' : 'text-white/60'}`} />
          </div>
          <span className={`text-lg font-semibold ${selected === true ? 'text-white' : 'text-white/90'}`}>
            Yes, I have some
          </span>
        </div>

        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${selected === true
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-white/30'
          }
        `}>
          {selected === true && <Check className="w-4 h-4 text-white" />}
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
            ? 'bg-[#7c57ff]/10 border-[#7c57ff]'
            : 'bg-white/5 border-transparent hover:bg-white/10'
          }
        `}
        data-testid="button-no"
      >
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${selected === false ? 'bg-[#7c57ff]/20' : 'bg-white/10'}
          `}>
            <X className={`w-6 h-6 ${selected === false ? 'text-[#7c57ff]' : 'text-white/60'}`} />
          </div>
          <span className={`text-lg font-semibold ${selected === false ? 'text-white' : 'text-white/90'}`}>
            No, I'm injury-free
          </span>
        </div>

        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${selected === false
            ? 'bg-[#7c57ff] border-[#7c57ff]'
            : 'border-white/30'
          }
        `}>
          {selected === false && <Check className="w-4 h-4 text-white" />}
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
            ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
          }
        `}
        data-testid="button-continue-yesno"
      >
        <span>Continue</span>
        {selected !== null && (
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
