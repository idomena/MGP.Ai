import { useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface EquipmentPreferencesProps {
  onSelect: (equipment: string[], preferences: string[]) => void;
}

const equipmentOptions = [
  { id: 'full_gym', label: 'Full Gym Access', icon: 'Building2' },
  { id: 'dumbbells', label: 'Dumbbells', icon: 'Dumbbell' },
  { id: 'barbell', label: 'Barbell & Weights', icon: 'Dumbbell' },
  { id: 'resistance_bands', label: 'Resistance Bands', icon: 'Cable' },
  { id: 'pullup_bar', label: 'Pull-up Bar', icon: 'ArrowUpFromLine' },
  { id: 'bodyweight', label: 'Bodyweight Only', icon: 'User' },
];

const preferenceOptions = [
  { id: 'morning', label: 'Morning Workouts', icon: 'Sun' },
  { id: 'home', label: 'Home Workouts', icon: 'Home' },
  { id: 'gym', label: 'Gym Workouts', icon: 'Building2' },
  { id: 'quick', label: 'Quick Sessions (20-30min)', icon: 'Timer' },
  { id: 'full_session', label: 'Full Sessions (45-60min+)', icon: 'Clock' },
];

const getIcon = (iconName: string): LucideIcon | null => {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] || null;
};

export default function EquipmentPreferences({ onSelect }: EquipmentPreferencesProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const toggleEquipment = (id: string) => {
    setSelectedEquipment(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const togglePreference = (id: string) => {
    setSelectedPreferences(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedEquipment.length > 0) {
      onSelect(selectedEquipment, selectedPreferences);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-white">What equipment do you have?</h3>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((option, index) => {
            const isSelected = selectedEquipment.includes(option.id);
            const IconComponent = getIcon(option.icon);
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleEquipment(option.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl border
                  transition-all duration-200 min-h-[44px]
                  ${isSelected
                    ? 'bg-[#7c57ff]/20 border-[#7c57ff] text-white'
                    : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/15'
                  }
                `}
                data-testid={`chip-equipment-${option.id}`}
              >
                {IconComponent && <IconComponent className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
            );
          })}
        </div>
        <p className="text-xs text-white/50">
          {selectedEquipment.length} equipment selected
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-white/60">Training style preferences (optional)</h3>
        <div className="flex flex-wrap gap-2">
          {preferenceOptions.map((option, index) => {
            const isSelected = selectedPreferences.includes(option.id);
            const IconComponent = getIcon(option.icon);
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (equipmentOptions.length + index) * 0.05 }}
                onClick={() => togglePreference(option.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl border
                  transition-all duration-200 min-h-[44px]
                  ${isSelected
                    ? 'bg-[#6c4de6]/20 border-[#6c4de6] text-white'
                    : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/15'
                  }
                `}
                data-testid={`chip-preference-${option.id}`}
              >
                {IconComponent && <IconComponent className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
            );
          })}
        </div>
        <p className="text-xs text-white/50">
          {selectedPreferences.length} preferences
        </p>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleContinue}
        disabled={selectedEquipment.length === 0}
        className={`
          w-full py-4 rounded-2xl font-semibold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${selectedEquipment.length > 0
            ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
          }
        `}
        data-testid="button-continue-equipment"
      >
        <span>Continue</span>
        {selectedEquipment.length > 0 && (
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