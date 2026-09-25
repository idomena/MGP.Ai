/**
 * Journey window utility.
 *
 * The journey is unlimited — we never render all days at once.
 * This function returns a slice of dayStatuses centered on the current day,
 * so the JourneyPath component always renders a manageable number of nodes.
 *
 * IMPORTANT: The window size is a rendering detail only — not a product concept.
 * The upcoming illustrated Journey UI will decide the exact visual count.
 * Adjust WINDOW_BEFORE / WINDOW_AFTER here without touching any other files.
 */

export interface DayStatus {
  day: number;
  status: "completed" | "active" | "locked" | "skipped";
  title: string;
  workoutType: string;
  date: string;
}

// How many completed/past days to show behind today
const WINDOW_BEFORE = 5;
// How many upcoming days to show ahead of today
const WINDOW_AFTER = 14;

export function getJourneyWindow(
  dayStatuses: DayStatus[],
  currentDay: number,
  windowBefore = WINDOW_BEFORE,
  windowAfter = WINDOW_AFTER
): DayStatus[] {
  if (dayStatuses.length === 0) return [];

  const currentIndex = dayStatuses.findIndex(d => d.day === currentDay);

  if (currentIndex === -1) {
    // Current day not in array — show the start of whatever is available
    return dayStatuses.slice(0, windowBefore + 1 + windowAfter);
  }

  const start = Math.max(0, currentIndex - windowBefore);
  const end = Math.min(dayStatuses.length, currentIndex + windowAfter + 1);
  return dayStatuses.slice(start, end);
}
