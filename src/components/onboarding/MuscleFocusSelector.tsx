import { useState } from 'react';
import { motion } from 'framer-motion';

interface MuscleFocusSelectorProps {
  onSelect: (muscles: string[]) => void;
}

const muscleGroups = [
  { id: 'chest', label: 'Chest' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Biceps & Triceps' },
  { id: 'core', label: 'Abs/Core' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Quads/Hamstrings' },
];

const allMuscleIds = muscleGroups.map(m => m.id);

export default function MuscleFocusSelector({ onSelect }: MuscleFocusSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const isAllSelected = allMuscleIds.every(id => selected.includes(id));

  const toggleMuscle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleFullBody = () => {
    setSelected(prev => (prev.length === allMuscleIds.length ? [] : [...allMuscleIds]));
  };

  const removeMuscle = (id: string) => {
    setSelected(prev => prev.filter(m => m !== id));
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      onSelect(selected);
    }
  };

  const handleZoneKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMuscle(id);
    }
  };

  const getFeedback = () => {
    if (selected.length === 0) return 'Tap the muscle groups you want to focus on';
    if (isAllSelected) return "Full body transformation - let's go!";
    if (selected.length >= 3) return "Great choices! We'll build an amazing program for you!";
    if (selected.length === 1) return '1 muscle group selected';
    return `${selected.length} muscle groups selected`;
  };

  const isSelected = (id: string) => selected.includes(id);

  const zoneClass = (id: string) => {
    const sel = isSelected(id);
    return [
      'cursor-pointer transition-all duration-200',
      sel ? 'stroke-cozy-ink stroke-[1.5]' : 'stroke-cozy-ink-faint stroke-[1] hover:stroke-cozy-ink-soft',
    ].join(' ');
  };

  const zoneFill = (id: string) => (isSelected(id) ? 'url(#muscleGradient)' : 'transparent');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-5"
    >
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        onClick={toggleFullBody}
        className={`
          mx-auto flex items-center gap-2 px-5 py-2.5 rounded-full
          font-semibold text-sm transition-all duration-200 border-2
          ${isAllSelected
            ? 'bg-gradient-to-r from-cozy-primary to-cozy-sky border-transparent text-cozy-ink shadow-cozy-md '
            : 'bg-transparent border-cozy-primary-line text-cozy-ink-soft hover:border-cozy-primary'
          }
        `}
        data-testid="button-full-body"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Full Body
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center items-start gap-2"
      >
        <svg
          viewBox="0 0 200 400"
          className="w-48 h-auto sm:w-56"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7a5bd3" />
              <stop offset="100%" stopColor="#6f9fc4" />
            </linearGradient>
          </defs>

          <ellipse cx="100" cy="30" rx="18" ry="22" fill="none" stroke="#3b2f27" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="100" y1="52" x2="100" y2="65" stroke="#3b2f27" strokeOpacity="0.25" strokeWidth="1" />

          <path
            d="M72,90 Q72,72 100,70 Q128,72 128,90 L128,120 Q100,125 72,120 Z"
            fill={zoneFill('chest')}
            className={zoneClass('chest')}
            onClick={() => toggleMuscle('chest')}
            onKeyDown={(e) => handleZoneKeyDown(e, 'chest')}
            tabIndex={0}
            role="button"
            data-testid="muscle-zone-chest"
            aria-label="Chest"
          />

          <path
            d="M55,72 Q60,65 72,70 L72,95 Q63,90 55,92 Z"
            fill={zoneFill('shoulders')}
            className={zoneClass('shoulders')}
            onClick={() => toggleMuscle('shoulders')}
            onKeyDown={(e) => handleZoneKeyDown(e, 'shoulders')}
            tabIndex={0}
            role="button"
            data-testid="muscle-zone-shoulders"
            aria-label="Shoulders"
          />
          <path
            d="M145,72 Q140,65 128,70 L128,95 Q137,90 145,92 Z"
            fill={zoneFill('shoulders')}
            className={zoneClass('shoulders')}
            onClick={() => toggleMuscle('shoulders')}
            onKeyDown={(e) => handleZoneKeyDown(e, 'shoulders')}
            tabIndex={0}
            role="button"
            aria-label="Shoulders right"
          />

          <path
            d="M55,95 Q48,100 42,130 Q38,150 40,170 L52,170 Q54,150 56,135 Q58,120 55,95 Z"
            fill={zoneFill('arms')}
            className={zoneClass('arms')}
            onClick={() => toggleMuscle('arms')}
            onKeyDown={(e) => handleZoneKeyDown(e, 'arms')}
            tabIndex={0}
            role="button"
            data-testid="muscle-zone-arms"
            aria-label="Arms"
          />
          <path
            d="M145,95 Q152,100 158,130 Q162,150 160,170 L148,170 Q146,150 144,135 Q142,120 145,95 Z"
            fill={zoneFill('arms')}
            className={zoneClass('arms')}
            onClick={() => toggleMuscle('arms')}
            onKeyDown={(e) => handleZoneKeyDown(e, 'arms')}
            tabIndex={0}
            role="button"
            aria-label="Arms right"
          />

          <path
            d="M75,122 Q100,128 125,122 L125,175 Q100,180 75,175 Z"
            fill={zoneFill('core')}
            className={zoneClass('core')}
            onClick={() => toggleMuscle('core')}
            onKeyDown={(e) => handleZoneKeyDown(e, 'core')}
            tabIndex={0}
            role="button"
            data-testid="muscle-zone-core"
            aria-label="Abs and Core"
          />

          <path
            d="M78,180 Q75,220 72,260 Q70,280 65,310 L82,310 Q85,280 90,260 Q95,240 100,220 Q105,240 110,260 Q115,280 118,310 L135,310 Q130,280 128,260 Q125,220 122,180 Q100,185 78,180 Z"
            fill={zoneFill('legs')}
            className={zoneClass('legs')}
            onClick={() => toggleMuscle('legs')}
            onKeyDown={(e) => handleZoneKeyDown(e, 'legs')}
            tabIndex={0}
            role="button"
            data-testid="muscle-zone-legs"
            aria-label="Quads and Hamstrings"
          />

          <line x1="65" y1="310" x2="60" y2="340" stroke="#3b2f27" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="135" y1="310" x2="140" y2="340" stroke="#3b2f27" strokeOpacity="0.25" strokeWidth="1" />
          <ellipse cx="58" cy="345" rx="10" ry="5" fill="none" stroke="#3b2f27" strokeOpacity="0.2" strokeWidth="1" />
          <ellipse cx="142" cy="345" rx="10" ry="5" fill="none" stroke="#3b2f27" strokeOpacity="0.2" strokeWidth="1" />
        </svg>

        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => toggleMuscle('back')}
          onKeyDown={(e) => handleZoneKeyDown(e, 'back')}
          tabIndex={0}
          className={`
            mt-16 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl
            transition-all duration-200 border min-w-[52px]
            ${isSelected('back')
              ? ' bg-cozy-primary border-white/40 text-white shadow-cozy-md '
              : 'bg-cozy-sunk border-cozy-line text-cozy-ink-faint hover:border-cozy-line hover:text-cozy-ink-soft'
            }
          `}
          data-testid="muscle-zone-back"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Back</span>
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-cozy-ink-soft text-sm"
      >
        {getFeedback()}
      </motion.p>

      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {muscleGroups
            .filter(m => selected.includes(m.id))
            .map(muscle => (
              <motion.button
                key={muscle.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => removeMuscle(muscle.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cozy-primary-soft text-cozy-primary text-xs font-medium transition-all hover:bg-cozy-primary-soft"
                data-testid={`pill-muscle-${muscle.id}`}
              >
                {muscle.label}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            ))}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={selected.length === 0}
        className={`
          w-full py-4 rounded-2xl font-semibold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${selected.length > 0
            ? ' bg-cozy-primary text-white shadow-cozy-md '
            : 'bg-cozy-sunk text-cozy-ink-faint cursor-not-allowed'
          }
        `}
        data-testid="button-continue-muscles"
      >
        <span>Continue</span>
        {selected.length > 0 && (
          <div className="w-8 h-8 rounded-full bg-cozy-line flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}
