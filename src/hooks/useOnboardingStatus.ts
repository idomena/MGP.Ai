import { useState, useEffect } from "react";
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
    function checkOnboardingStatus() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const stored = localStorage.getItem("mgp_workout_preferences");
        
        if (stored) {
          const preferences = JSON.parse(stored);
          if (preferences.trainingDays && preferences.selectedWorkouts && preferences.startDate) {
            setNeedsOnboarding(false);
            setHasWorkoutPlan(true);
          } else {
            setNeedsOnboarding(true);
            setHasWorkoutPlan(false);
          }
        } else {
          setNeedsOnboarding(true);
          setHasWorkoutPlan(false);
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        setNeedsOnboarding(true);
        setHasWorkoutPlan(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [user?.id]);

  return { isLoading, needsOnboarding, hasWorkoutPlan };
}
