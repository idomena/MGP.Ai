import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface YesNoSelectorProps {
  onSelect: (value: boolean) => void;
}

export default function YesNoSelector({ onSelect }: YesNoSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 justify-center"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(true)}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/50 hover:border-emerald-400 transition-all group"
        data-testid="button-yes"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
          <Check className="w-5 h-5 text-emerald-400" />
        </div>
        <span className="text-lg font-semibold text-emerald-300">Yes</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(false)}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/50 hover:border-red-400 transition-all group"
        data-testid="button-no"
      >
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
          <X className="w-5 h-5 text-red-400" />
        </div>
        <span className="text-lg font-semibold text-red-300">No</span>
      </motion.button>
    </motion.div>
  );
}
