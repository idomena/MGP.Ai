import { useState } from 'react';
import { motion } from 'framer-motion';

interface TrainingDaysSelectorProps {
  onSelect: (days: string[]) => void;
}

const days = [
  { id: 'Mon', label: 'M', fullName: 'Monday' },
  { id: 'Tue', label: 'T', fullName: 'Tuesday' },
  { id: 'Wed', label: 'W', fullName: 'Wednesday' },
  { id: 'Thu', label: 'T', fullName: 'Thursday' },
  { id: 'Fri', label: 'F', fullName: 'Friday' },
  { id: 'Sat', label: 'S', fullName: 'Saturday' },
  { id: 'Sun', label: 'S', fullName: 'Sunday' },
];

export function TrainingDaysSelector({ onSelect }: TrainingDaysSelectorProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleContinue = () => {
    if (selectedDays.length > 0) {
      onSelect(selectedDays);
    }
  };

  const getSelectedCount = () => {
    const count = selectedDays.length;
    if (count === 0) return 'Select your training days';
    if (count === 1) return '1 day per week';
    if (count === 7) return 'Every day - you beast!';
    return `${count} days per week`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <div className="flex justify-between gap-2">
        {days.map((day, index) => {
          const isSelected = selectedDays.includes(day.id);
          return (
            <motion.button
              key={day.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleDay(day.id)}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center
                font-semibold text-sm transition-all duration-200
                ${isSelected
                  ? 'bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/40'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/20'
                }
              `}
              data-testid={`button-day-${day.id}`}
              aria-label={day.fullName}
            >
              {day.label}
            </motion.button>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-white/60 text-sm"
      >
        {getSelectedCount()}
      </motion.p>

      {selectedDays.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {days.filter(d => selectedDays.includes(d.id)).map(day => (
            <span
              key={day.id}
              className="px-3 py-1 rounded-full bg-[#7c57ff]/20 text-[#a78bfa] text-xs font-medium"
            >
              {day.fullName}
            </span>
          ))}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={selectedDays.length === 0}
        className={`
          w-full py-4 rounded-2xl font-semibold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${selectedDays.length > 0
            ? 'bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white shadow-lg shadow-[#7c57ff]/30'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
          }
        `}
        data-testid="button-continue-days"
      >
        <span>Continue</span>
        {selectedDays.length > 0 && (
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
