import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, SkipForward, FileText } from "lucide-react";

interface AdditionalInfoProps {
  onSubmit: (text: string) => void;
  onSkip?: () => void;
}

export default function AdditionalInfo({ onSubmit, onSkip }: AdditionalInfoProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

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
        <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full">Optional</span>
      </div>

      <div className={focused ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] p-0.5 rounded-2xl' : ''}>
        <div className={focused ? 'bg-[#1a1a2e] rounded-[15px] p-3' : 'bg-white/10 rounded-2xl p-3'}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={500}
            placeholder={"e.g., \nI'm vegetarian\nI prefer compound movements\nI want to focus on strength over size\nI can only train mornings before work\nI'm training for a specific event"}
            className="w-full bg-transparent px-3 py-2 text-white placeholder-white/40 focus:outline-none resize-none text-sm leading-relaxed"
            rows={4}
            data-testid="textarea-additional-info"
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${value.length > 450 ? 'text-amber-400' : 'text-white/40'}`}>
              {value.length}/500
            </span>
          </div>
        </div>
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
            flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
            ${value.trim()
              ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30 animate-pulse'
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
