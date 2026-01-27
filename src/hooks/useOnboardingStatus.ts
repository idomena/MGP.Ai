import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { checkUserHasWorkoutPlan } from "@/services/workoutPlanService";

interface OnboardingStatus {
  isLoading: boolean;
  needsOnboarding: boolean;
  hasWorkoutPlan: boolean;
  refetch: () => Promise<void>;
}

export function useOnboardingStatus(): OnboardingStatus {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState(false);

  async function checkStatus() {
    if (!user?.id) {
      setIsLoading(false);
      setNeedsOnboarding(true);
      setHasWorkoutPlan(false);
      return;
    }

    setIsLoading(true);

    try {
      const hasPlan = await checkUserHasWorkoutPlan(user.id);
      
      if (hasPlan) {
        setNeedsOnboarding(false);
        setHasWorkoutPlan(true);
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

  useEffect(() => {
    checkStatus();
  }, [user?.id]);

  return { 
    isLoading, 
    needsOnboarding, 
    hasWorkoutPlan,
    refetch: checkStatus,
  };
}
