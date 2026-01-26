import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User } from "lucide-react";

interface NameInputProps {
  onSubmit: (name: string) => void;
  placeholder?: string;
}

export default function NameInput({ onSubmit, placeholder = "Enter your name..." }: NameInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 justify-center mb-2">
        <User className="w-5 h-5 text-[#7c57ff]" />
        <span className="text-white/60 text-sm">What should we call you?</span>
      </div>

      <div className="flex gap-2 bg-white/10 rounded-2xl p-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:outline-none text-lg"
          autoFocus
          data-testid="input-name"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={`
            p-3 rounded-xl transition-all
            ${value.trim()
              ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
              : 'bg-white/10 text-white/40'
            }
          `}
          data-testid="button-submit-name"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
