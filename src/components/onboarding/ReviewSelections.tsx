import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  User, 
  Scale, 
  Target, 
  Calendar,
  Dumbbell,
  Bot,
  FileText
} from "lucide-react";

interface SelectionField {
  key: string;
  label: string;
  value: string | string[] | number | boolean | undefined;
  icon: React.ReactNode;
}

interface ReviewSelectionsProps {
  selections: Record<string, unknown>;
  onConfirm: () => void;
  onEdit: (field: string) => void;
}

const fieldConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  coachName: { label: 'Coach Name', icon: <Bot className="w-4 h-4" /> },
  name: { label: 'Your Name', icon: <User className="w-4 h-4" /> },
  assistant: { label: 'Coaching Style', icon: <Bot className="w-4 h-4" /> },
  weight: { label: 'Weight', icon: <Scale className="w-4 h-4" /> },
  goals: { label: 'Goals', icon: <Target className="w-4 h-4" /> },
  experience: { label: 'Experience', icon: <Target className="w-4 h-4" /> },
  trainingDays: { label: 'Training Days', icon: <Calendar className="w-4 h-4" /> },
  workoutTypes: { label: 'Workout Types', icon: <Dumbbell className="w-4 h-4" /> },
  injuries: { label: 'Injuries', icon: <FileText className="w-4 h-4" /> },
  additionalInfo: { label: 'Additional Info', icon: <FileText className="w-4 h-4" /> },
};

export default function ReviewSelections({ selections, onConfirm, onEdit }: ReviewSelectionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ') || 'None selected';
    return String(value);
  };

  const fields: SelectionField[] = Object.entries(selections)
    .filter(([key]) => fieldConfig[key])
    .map(([key, value]) => ({
      key,
      label: fieldConfig[key]?.label || key,
      value: value as string | string[] | number | boolean | undefined,
      icon: fieldConfig[key]?.icon || <User className="w-4 h-4" />,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-all"
        data-testid="button-toggle-summary"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">Your Profile Summary</h3>
            <p className="text-xs text-white/60">{fields.length} items configured</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white/60" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/60" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {fields.map((field, index) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-[#7c57ff]">
                    {field.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/50">{field.label}</p>
                    <p className="text-sm text-white font-medium truncate">
                      {formatValue(field.value)}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(field.key)}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                  data-testid={`button-edit-${field.key}`}
                >
                  <Edit2 className="w-4 h-4 text-white/60" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onConfirm}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white font-semibold shadow-lg shadow-[#7c57ff]/30 hover:shadow-[#7c57ff]/50 transition-all flex items-center justify-center gap-2"
        data-testid="button-confirm-all"
      >
        <Check className="w-5 h-5" />
        Confirm & Start
      </motion.button>
    </motion.div>
  );
}
