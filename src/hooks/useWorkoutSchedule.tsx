import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { startOfWeek, addWeeks, format } from 'date-fns';

interface WorkoutDetails {
  name: string;
  muscles: string;
  time: string;
  exercises: number;
  focus: string;
  dayNumber: number;
}

export function useWorkoutSchedule(userId: string | undefined) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [workouts, setWorkouts] = useState<Record<number, WorkoutDetails>>({});
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const defaultWorkouts: Record<number, Omit<WorkoutDetails, 'dayNumber'>> = {
    0: { name: "Chest & Triceps", muscles: "Chest, Triceps", time: "35 min", exercises: 5, focus: "Chest" },
    1: { name: "Back & Biceps", muscles: "Back, Biceps", time: "40 min", exercises: 4, focus: "Back" },
    2: { name: "Legs", muscles: "Quads, Hamstrings", time: "45 min", exercises: 6, focus: "Legs" },
    3: { name: "Shoulders & Core", muscles: "Shoulders, Abs", time: "30 min", exercises: 4, focus: "Shoulders" },
    4: { name: "Back + Front hand", muscles: "Back, Biceps, Forearms", time: "28 min", exercises: 3, focus: "Back" },
    5: { name: "Rest Day", muscles: "Recovery", time: "0 min", exercises: 0, focus: "Rest" },
    6: { name: "Active Recovery", muscles: "Full Body", time: "20 min", exercises: 2, focus: "Mobility" },
  };

  const getCurrentWeekDays = () => {
    const baseDay = currentWeekOffset * 7;
    return Array.from({ length: 7 }, (_, i) => baseDay + i);
  };

  const fetchData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Fetch completions
      const { data: completionsData, error: completionsError } = await supabase
        .from('workout_completions')
        .select('day_number')
        .eq('user_id', userId);

      if (completionsError) throw completionsError;
      
      setCompletedDays(new Set(completionsData.map(c => c.day_number)));

      // Fetch custom schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('workout_schedule')
        .select('*')
        .eq('user_id', userId);

      if (scheduleError) throw scheduleError;

      const workoutMap: Record<number, WorkoutDetails> = {};
      
      // Add default workouts for all weeks
      for (let week = 0; week <= currentWeekOffset + 2; week++) {
        for (let day = 0; day < 7; day++) {
          const dayNumber = week * 7 + day;
          const defaultWorkout = defaultWorkouts[day];
          if (defaultWorkout) {
            workoutMap[dayNumber] = {
              ...defaultWorkout,
              dayNumber
            };
          }
        }
      }

      // Override with custom schedule
      scheduleData.forEach(item => {
        workoutMap[item.day_number] = {
          name: item.workout_name,
          muscles: workoutMap[item.day_number]?.muscles || "Various",
          time: item.duration,
          exercises: item.exercises,
          focus: item.focus,
          dayNumber: item.day_number
        };
      });

      setWorkouts(workoutMap);
    } catch (error) {
      console.error('Error fetching workout data:', error);
      toast.error('Failed to load workout data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!userId) return;

    const channel = supabase
      .channel('workout_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_completions',
          filter: `user_id=eq.${userId}`
        },
        fetchData
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_schedule',
          filter: `user_id=eq.${userId}`
        },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentWeekOffset]);

  const moveWorkout = async (fromDay: number, toDay: number) => {
    if (!userId || fromDay === toDay) return false;

    const workoutToMove = workouts[fromDay];
    if (!workoutToMove) return false;

    try {
      const { error } = await supabase
        .from('workout_schedule')
        .upsert({
          user_id: userId,
          day_number: toDay,
          workout_name: workoutToMove.name,
          exercises: workoutToMove.exercises,
          duration: workoutToMove.time,
          focus: workoutToMove.focus
        }, {
          onConflict: 'user_id,day_number'
        });

      if (error) throw error;

      toast.success(`Workout moved from Day ${fromDay} to Day ${toDay}`);
      return true;
    } catch (error) {
      console.error('Error moving workout:', error);
      toast.error('Failed to move workout');
      return false;
    }
  };

  const extendProgram = async (additionalDays: number) => {
    if (!userId || additionalDays <= 0) return false;

    try {
      // Find the highest day number
      const maxDay = Math.max(...Object.keys(workouts).map(Number), 0);
      const newWorkouts = [];

      // Create new workout schedule entries
      for (let i = 1; i <= additionalDays; i++) {
        const newDayNumber = maxDay + i;
        const dayOfWeek = newDayNumber % 7;
        const defaultWorkout = defaultWorkouts[dayOfWeek];

        if (defaultWorkout) {
          newWorkouts.push({
            user_id: userId,
            day_number: newDayNumber,
            workout_name: defaultWorkout.name,
            exercises: defaultWorkout.exercises,
            duration: defaultWorkout.time,
            focus: defaultWorkout.focus
          });
        }
      }

      if (newWorkouts.length > 0) {
        const { error } = await supabase
          .from('workout_schedule')
          .insert(newWorkouts);

        if (error) throw error;
      }

      toast.success(`Program extended by ${additionalDays} days!`);
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error extending program:', error);
      toast.error('Failed to extend program');
      return false;
    }
  };

  return {
    workouts,
    completedDays,
    loading,
    currentWeekOffset,
    setCurrentWeekOffset,
    getCurrentWeekDays,
    moveWorkout,
    extendProgram,
    refreshData: fetchData
  };
}
