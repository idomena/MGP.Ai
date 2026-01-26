import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingStatus {
  isLoading: boolean;
  needsOnboarding: boolean;
  hasWorkoutPlan: boolean;
}

export function useOnboardingStatus(): OnboardingStatus {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: workouts, error: workoutsError } = await supabase
          .from("workout_completions")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (workoutsError) {
          console.error("Error checking workout plan:", workoutsError);
          setNeedsOnboarding(true);
          setHasWorkoutPlan(false);
        } else if (workouts && workouts.length > 0) {
          setNeedsOnboarding(false);
          setHasWorkoutPlan(true);
        } else {
          const { data: prefs, error: prefsError } = await supabase
            .from("user_preferences")
            .select("onboarding_completed")
            .eq("user_id", user.id)
            .single();

          if (prefsError || !prefs?.onboarding_completed) {
            setNeedsOnboarding(true);
            setHasWorkoutPlan(false);
          } else {
            setNeedsOnboarding(false);
            setHasWorkoutPlan(false);
          }
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        setNeedsOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [user?.id]);

  return { isLoading, needsOnboarding, hasWorkoutPlan };
}
