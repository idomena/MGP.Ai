import { startOfWeek, addDays, addWeeks, format, parse } from 'date-fns';

interface WorkoutCommand {
  action: 'move' | 'schedule' | 'extend' | 'unknown';
  fromDay?: number;
  toDay?: number;
  toDayOfWeek?: string;
  toWeekOffset?: number;
  extendDays?: number;
}

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const dayAbbreviations: Record<string, number> = {
  'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6,
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6
};

export function parseWorkoutCommand(message: string): WorkoutCommand {
  const lowerMessage = message.toLowerCase();

  // Check for extend program command
  const extendMatch = lowerMessage.match(/extend.*?(?:by\s+)?(\d+)\s*(?:days?|weeks?)/i);
  if (extendMatch || lowerMessage.includes('extend program') || lowerMessage.includes('add more days')) {
    let days = 7; // default to 1 week
    if (extendMatch) {
      const number = parseInt(extendMatch[1]);
      days = lowerMessage.includes('week') ? number * 7 : number;
    }
    return { action: 'extend', extendDays: days };
  }

  // Check for move workout command
  const movePatterns = [
    /move.*?(?:from\s+)?(?:day\s+)?(\d+).*?(?:to\s+)?(?:day\s+)?(\d+)/i,
    /move.*?(?:from\s+)?(\w+).*?(?:to\s+)?(?:next\s+)?(\w+)/i,
    /reschedule.*?(?:from\s+)?(?:day\s+)?(\d+).*?(?:to\s+)?(?:day\s+)?(\d+)/i,
    /reschedule.*?(?:from\s+)?(\w+).*?(?:to\s+)?(?:next\s+)?(\w+)/i
  ];

  for (const pattern of movePatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      const fromStr = match[1];
      const toStr = match[2];
      
      // Check if we're dealing with day numbers
      if (!isNaN(Number(fromStr)) && !isNaN(Number(toStr))) {
        return {
          action: 'move',
          fromDay: parseInt(fromStr),
          toDay: parseInt(toStr)
        };
      }
      
      // Check if we're dealing with day names
      const fromDay = dayAbbreviations[fromStr];
      const toDay = dayAbbreviations[toStr];
      
      if (fromDay !== undefined && toDay !== undefined) {
        const weekOffset = lowerMessage.includes('next') ? 1 : 0;
        return {
          action: 'move',
          toDayOfWeek: daysOfWeek[toDay],
          toWeekOffset: weekOffset,
          fromDay: fromDay // current week day of week
        };
      }
    }
  }

  // Check for schedule/add workout command
  const scheduleMatch = lowerMessage.match(/(?:schedule|add).*?(?:on\s+)?(?:day\s+)?(\d+|(?:next\s+)?\w+)/i);
  if (scheduleMatch) {
    const dayStr = scheduleMatch[1];
    if (!isNaN(Number(dayStr))) {
      return { action: 'schedule', toDay: parseInt(dayStr) };
    }
  }

  return { action: 'unknown' };
}

export function formatWorkoutCommandResponse(command: WorkoutCommand, success: boolean): string {
  if (!success) {
    return "I couldn't complete that action. Please try again or use the visual interface.";
  }

  switch (command.action) {
    case 'move':
      if (command.fromDay !== undefined && command.toDay !== undefined) {
        return `Great! I've moved your workout from Day ${command.fromDay} to Day ${command.toDay}. Your schedule has been updated.`;
      }
      return "Workout moved successfully!";
    
    case 'extend':
      return `Perfect! I've extended your program by ${command.extendDays} days. Keep up the great work!`;
    
    case 'schedule':
      return `Workout scheduled successfully for Day ${command.toDay}!`;
    
    default:
      return "I'm not sure what you want me to do. Try saying something like 'move my workout from day 12 to day 15' or 'extend program by 7 days'.";
  }
}
