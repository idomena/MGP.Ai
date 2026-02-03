import { useState } from "react";
import { motion } from "framer-motion";
import { Send, SkipForward, FileText } from "lucide-react";

interface AdditionalInfoProps {
  onSubmit: (text: string) => void;
  onSkip?: () => void;
}

export default function AdditionalInfo({ onSubmit, onSkip }: AdditionalInfoProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 justify-center mb-2">
        <FileText className="w-5 h-5 text-[#7c57ff]" />
        <span className="text-white/60 text-sm">Any additional information?</span>
      </div>

      <div className="bg-white/10 rounded-2xl p-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tell us about any injuries, preferences, or goals you'd like us to know about..."
          className="w-full bg-transparent px-3 py-2 text-white placeholder-white/40 focus:outline-none resize-none text-sm leading-relaxed"
          rows={4}
          data-testid="textarea-additional-info"
        />
      </div>

      <div className="flex gap-3">
        {onSkip && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white/60 font-medium flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
            data-testid="button-skip"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={`
            flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all btn-glow
            ${value.trim()
              ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
          data-testid="button-submit-info"
        >
          <Send className="w-4 h-4" />
          Submit
        </motion.button>
      </div>
    </motion.div>
  );
}
