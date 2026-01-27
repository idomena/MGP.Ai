import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Edit2,
  User,
  Users,
  Scale,
  Target,
  Calendar,
  Dumbbell,
  Bot,
  FileText,
  Sparkles,
  ArrowRight
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

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: string[];
}

const sections: SectionConfig[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: <User className="w-5 h-5" />,
    fields: ['coachName', 'name', 'gender'],
  },
  {
    id: 'fitness',
    title: 'Fitness Goals',
    icon: <Target className="w-5 h-5" />,
    fields: ['weight', 'goals', 'experience'],
  },
  {
    id: 'training',
    title: 'Training Preferences',
    icon: <Dumbbell className="w-5 h-5" />,
    fields: ['assistant', 'trainingDays', 'workoutTypes', 'injuries', 'additionalInfo'],
  },
];

const fieldConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  coachName: { label: 'Coach Name', icon: <Bot className="w-4 h-4" /> },
  name: { label: 'Your Name', icon: <User className="w-4 h-4" /> },
  gender: { label: 'Gender', icon: <Users className="w-4 h-4" /> },
  assistant: { label: 'Coaching Style', icon: <Sparkles className="w-4 h-4" /> },
  weight: { label: 'Weight', icon: <Scale className="w-4 h-4" /> },
  goals: { label: 'Goals', icon: <Target className="w-4 h-4" /> },
  experience: { label: 'Experience', icon: <Target className="w-4 h-4" /> },
  trainingDays: { label: 'Training Days', icon: <Calendar className="w-4 h-4" /> },
  workoutTypes: { label: 'Workout Types', icon: <Dumbbell className="w-4 h-4" /> },
  injuries: { label: 'Injuries', icon: <FileText className="w-4 h-4" /> },
  additionalInfo: { label: 'Additional Info', icon: <FileText className="w-4 h-4" /> },
};

export default function ReviewSelections({ selections, onConfirm, onEdit }: ReviewSelectionsProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null || value === '') return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ') || 'None selected';
    return String(value);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getFieldsForSection = (section: SectionConfig): SelectionField[] => {
    return section.fields
      .filter(key => selections[key] !== undefined && fieldConfig[key])
      .map(key => ({
        key,
        label: fieldConfig[key].label,
        value: selections[key] as string | string[] | number | boolean | undefined,
        icon: fieldConfig[key].icon,
      }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-4"
    >
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#7c57ff]/20 to-[#60a5fa]/20 border border-[#7c57ff]/30 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Profile Summary</h3>
            <p className="text-xs text-white/60">Review your selections below</p>
          </div>
        </div>
      </div>

      {sections.map((section, sectionIndex) => {
        const isExpanded = expandedSections.includes(section.id);
        const fields = getFieldsForSection(section);

        if (fields.length === 0) return null;

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              data-testid={`button-toggle-${section.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#7c57ff]">
                  {section.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white">{section.title}</h4>
                  <p className="text-xs text-white/50">{fields.length} items</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5 text-white/50" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {fields.map((field) => (
                      <div
                        key={field.key}
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
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onConfirm}
        className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] text-white font-semibold text-lg shadow-lg shadow-[#7c57ff]/30 hover:shadow-[#7c57ff]/50 transition-all flex items-center justify-center gap-3"
        data-testid="button-confirm-all"
      >
        <ArrowRight className="w-5 h-5" />
        <span>Confirm and Continue</span>
      </motion.button>
    </motion.div>
  );
}
