import { motion } from 'framer-motion';
import { User, UserCircle, Users, ShieldQuestion } from 'lucide-react';

interface GenderOption {
  id: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  label: string;
  icon: typeof User;
}

const genderOptions: GenderOption[] = [
  { id: 'male', label: 'Male', icon: User },
  { id: 'female', label: 'Female', icon: UserCircle },
  { id: 'other', label: 'Other', icon: Users },
  { id: 'prefer_not_to_say', label: 'Prefer not to say', icon: ShieldQuestion },
];

interface GenderSelectorProps {
  onSelect: (gender: 'male' | 'female' | 'other' | 'prefer_not_to_say') => void;
}

export function GenderSelector({ onSelect }: GenderSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto"
    >
      {genderOptions.map((option, index) => {
        const Icon = option.icon;
        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(option.id)}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#7c57ff]/20 hover:border-[#7c57ff]/50 transition-all duration-200"
            data-testid={`button-gender-${option.id}`}
          >
            <Icon className="w-6 h-6 text-[#7c57ff]" />
            <span className="text-sm font-medium text-white">{option.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
