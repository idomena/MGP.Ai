interface MuscleAnatomyDiagramProps {
  targetedMuscles: string[];
}

const muscleMapping: Record<string, string[]> = {
  'chest': ['chest-front'],
  'pectorals': ['chest-front'],
  'pecs': ['chest-front'],
  'back': ['back-upper', 'back-lower', 'lats-back'],
  'lats': ['lats-back'],
  'traps': ['traps-back'],
  'upper back': ['back-upper', 'traps-back'],
  'lower back': ['back-lower'],
  'shoulders': ['shoulders-front', 'shoulders-back'],
  'delts': ['shoulders-front', 'shoulders-back'],
  'deltoids': ['shoulders-front', 'shoulders-back'],
  'biceps': ['biceps-front'],
  'triceps': ['triceps-back'],
  'arms': ['biceps-front', 'triceps-back', 'forearms-front'],
  'forearms': ['forearms-front'],
  'core': ['abs-front', 'obliques-front'],
  'abs': ['abs-front'],
  'abdominals': ['abs-front'],
  'obliques': ['obliques-front'],
  'glutes': ['glutes-back'],
  'quads': ['quads-front'],
  'quadriceps': ['quads-front'],
  'hamstrings': ['hamstrings-back'],
  'legs': ['quads-front', 'hamstrings-back', 'calves-back'],
  'calves': ['calves-back'],
  'hip flexors': ['hip-front'],
  'full body': ['chest-front', 'back-upper', 'shoulders-front', 'abs-front', 'quads-front', 'hamstrings-back'],
};

export default function MuscleAnatomyDiagram({ targetedMuscles }: MuscleAnatomyDiagramProps) {
  const activeMuscles = new Set<string>();
  
  targetedMuscles.forEach(muscle => {
    const lowerMuscle = muscle.toLowerCase().trim();
    Object.entries(muscleMapping).forEach(([key, regions]) => {
      if (lowerMuscle.includes(key) || key.includes(lowerMuscle)) {
        regions.forEach(region => activeMuscles.add(region));
      }
    });
  });

  const getMuscleColor = (muscleId: string) => {
    return activeMuscles.has(muscleId) ? '#ef4444' : '#4a5568';
  };

  const getMuscleOpacity = (muscleId: string) => {
    return activeMuscles.has(muscleId) ? 1 : 0.4;
  };

  return (
    <div className="flex justify-center gap-4 py-4">
      {/* Front View */}
      <div className="relative">
        <svg width="120" height="200" viewBox="0 0 120 200">
          {/* Head */}
          <ellipse cx="60" cy="18" rx="14" ry="16" fill="#6b7280" opacity="0.5" />
          
          {/* Neck */}
          <rect x="54" y="32" width="12" height="10" fill="#6b7280" opacity="0.5" />
          
          {/* Shoulders Front */}
          <ellipse id="shoulders-front" cx="32" cy="48" rx="12" ry="8" 
            fill={getMuscleColor('shoulders-front')} opacity={getMuscleOpacity('shoulders-front')} />
          <ellipse cx="88" cy="48" rx="12" ry="8" 
            fill={getMuscleColor('shoulders-front')} opacity={getMuscleOpacity('shoulders-front')} />
          
          {/* Chest */}
          <path id="chest-front" d="M38 50 Q60 45 82 50 Q85 65 82 75 Q60 80 38 75 Q35 65 38 50" 
            fill={getMuscleColor('chest-front')} opacity={getMuscleOpacity('chest-front')} />
          
          {/* Abs */}
          <rect id="abs-front" x="45" y="78" width="30" height="35" rx="4" 
            fill={getMuscleColor('abs-front')} opacity={getMuscleOpacity('abs-front')} />
          
          {/* Obliques */}
          <path id="obliques-front" d="M38 78 L45 78 L45 113 L38 108 Z" 
            fill={getMuscleColor('obliques-front')} opacity={getMuscleOpacity('obliques-front')} />
          <path d="M82 78 L75 78 L75 113 L82 108 Z" 
            fill={getMuscleColor('obliques-front')} opacity={getMuscleOpacity('obliques-front')} />
          
          {/* Hip */}
          <ellipse id="hip-front" cx="60" cy="120" rx="20" ry="8" fill="#6b7280" opacity="0.4" />
          
          {/* Biceps */}
          <ellipse id="biceps-front" cx="26" cy="70" rx="6" ry="18" 
            fill={getMuscleColor('biceps-front')} opacity={getMuscleOpacity('biceps-front')} />
          <ellipse cx="94" cy="70" rx="6" ry="18" 
            fill={getMuscleColor('biceps-front')} opacity={getMuscleOpacity('biceps-front')} />
          
          {/* Forearms */}
          <ellipse id="forearms-front" cx="22" cy="100" rx="5" ry="14" 
            fill={getMuscleColor('forearms-front')} opacity={getMuscleOpacity('forearms-front')} />
          <ellipse cx="98" cy="100" rx="5" ry="14" 
            fill={getMuscleColor('forearms-front')} opacity={getMuscleOpacity('forearms-front')} />
          
          {/* Quads */}
          <ellipse id="quads-front" cx="48" cy="150" rx="10" ry="28" 
            fill={getMuscleColor('quads-front')} opacity={getMuscleOpacity('quads-front')} />
          <ellipse cx="72" cy="150" rx="10" ry="28" 
            fill={getMuscleColor('quads-front')} opacity={getMuscleOpacity('quads-front')} />
          
          {/* Lower Legs Front */}
          <ellipse cx="46" cy="190" rx="6" ry="12" fill="#6b7280" opacity="0.4" />
          <ellipse cx="74" cy="190" rx="6" ry="12" fill="#6b7280" opacity="0.4" />
        </svg>
        <p className="text-center text-white/50 text-xs mt-1">Front</p>
      </div>

      {/* Back View */}
      <div className="relative">
        <svg width="120" height="200" viewBox="0 0 120 200">
          {/* Head */}
          <ellipse cx="60" cy="18" rx="14" ry="16" fill="#6b7280" opacity="0.5" />
          
          {/* Neck */}
          <rect x="54" y="32" width="12" height="10" fill="#6b7280" opacity="0.5" />
          
          {/* Traps */}
          <path id="traps-back" d="M40 40 Q60 35 80 40 L75 55 Q60 50 45 55 Z" 
            fill={getMuscleColor('traps-back')} opacity={getMuscleOpacity('traps-back')} />
          
          {/* Shoulders Back */}
          <ellipse id="shoulders-back" cx="32" cy="48" rx="12" ry="8" 
            fill={getMuscleColor('shoulders-back')} opacity={getMuscleOpacity('shoulders-back')} />
          <ellipse cx="88" cy="48" rx="12" ry="8" 
            fill={getMuscleColor('shoulders-back')} opacity={getMuscleOpacity('shoulders-back')} />
          
          {/* Upper Back */}
          <path id="back-upper" d="M42 55 Q60 50 78 55 Q80 72 78 80 Q60 85 42 80 Q40 72 42 55" 
            fill={getMuscleColor('back-upper')} opacity={getMuscleOpacity('back-upper')} />
          
          {/* Lats */}
          <path id="lats-back" d="M35 60 L42 55 L42 85 L38 90 Z" 
            fill={getMuscleColor('lats-back')} opacity={getMuscleOpacity('lats-back')} />
          <path d="M85 60 L78 55 L78 85 L82 90 Z" 
            fill={getMuscleColor('lats-back')} opacity={getMuscleOpacity('lats-back')} />
          
          {/* Lower Back */}
          <rect id="back-lower" x="45" y="85" width="30" height="25" rx="4" 
            fill={getMuscleColor('back-lower')} opacity={getMuscleOpacity('back-lower')} />
          
          {/* Triceps */}
          <ellipse id="triceps-back" cx="26" cy="70" rx="6" ry="18" 
            fill={getMuscleColor('triceps-back')} opacity={getMuscleOpacity('triceps-back')} />
          <ellipse cx="94" cy="70" rx="6" ry="18" 
            fill={getMuscleColor('triceps-back')} opacity={getMuscleOpacity('triceps-back')} />
          
          {/* Forearms Back */}
          <ellipse cx="22" cy="100" rx="5" ry="14" fill="#6b7280" opacity="0.4" />
          <ellipse cx="98" cy="100" rx="5" ry="14" fill="#6b7280" opacity="0.4" />
          
          {/* Glutes */}
          <ellipse id="glutes-back" cx="50" cy="122" rx="12" ry="10" 
            fill={getMuscleColor('glutes-back')} opacity={getMuscleOpacity('glutes-back')} />
          <ellipse cx="70" cy="122" rx="12" ry="10" 
            fill={getMuscleColor('glutes-back')} opacity={getMuscleOpacity('glutes-back')} />
          
          {/* Hamstrings */}
          <ellipse id="hamstrings-back" cx="48" cy="155" rx="10" ry="24" 
            fill={getMuscleColor('hamstrings-back')} opacity={getMuscleOpacity('hamstrings-back')} />
          <ellipse cx="72" cy="155" rx="10" ry="24" 
            fill={getMuscleColor('hamstrings-back')} opacity={getMuscleOpacity('hamstrings-back')} />
          
          {/* Calves */}
          <ellipse id="calves-back" cx="46" cy="188" rx="6" ry="12" 
            fill={getMuscleColor('calves-back')} opacity={getMuscleOpacity('calves-back')} />
          <ellipse cx="74" cy="188" rx="6" ry="12" 
            fill={getMuscleColor('calves-back')} opacity={getMuscleOpacity('calves-back')} />
        </svg>
        <p className="text-center text-white/50 text-xs mt-1">Back</p>
      </div>
    </div>
  );
}
