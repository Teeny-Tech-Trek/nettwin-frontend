import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { DASHBOARD_TOUR_CONFIG, TourStep } from '@/components/ProductTour/tourSteps';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type TourPhase = 'idle' | 'welcome' | 'touring' | 'completing';

export interface UseTourReturn {
  /** Current phase of the tour */
  phase: TourPhase;
  /** Whether the tour is in any active phase */
  isTourActive: boolean;
  /** Current step index */
  currentStepIndex: number;
  /** Current step data */
  currentStep: TourStep | null;
  /** Total number of visible steps */
  totalSteps: number;
  /** Progress fraction 0-1 */
  progress: number;
  /** All visible steps (after condition filtering) */
  visibleSteps: TourStep[];
  /** Whether the tour should auto-start */
  shouldAutoStart: boolean;
  /** Start the tour (shows welcome modal) */
  startTour: () => void;
  /** Begin the actual step-by-step tour (called from welcome modal) */
  beginTouring: () => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  prevStep: () => void;
  /** Skip the tour entirely */
  skipTour: () => void;
  /** Complete the tour (called on last step) */
  completeTour: () => void;
  /** Dismiss the completion screen */
  dismissCompletion: () => void;
  /** Restart the tour (clears localStorage, navigates to dashboard) */
  restartTour: () => void;
  /** Whether this user has completed the tour */
  hasCompleted: boolean;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getTourStorageKey(tourId: string, userId?: string): string {
  return userId ? `${tourId}_${userId}` : tourId;
}

function isTourCompleted(tourId: string, userId?: string): boolean {
  try {
    const key = getTourStorageKey(tourId, userId);
    return localStorage.getItem(key) === 'completed';
  } catch {
    return false;
  }
}

function markTourCompleted(tourId: string, userId?: string): void {
  try {
    const key = getTourStorageKey(tourId, userId);
    localStorage.setItem(key, 'completed');
  } catch {
    // localStorage might be unavailable
  }
}

function clearTourCompleted(tourId: string, userId?: string): void {
  try {
    const key = getTourStorageKey(tourId, userId);
    localStorage.removeItem(key);
  } catch {
    // localStorage might be unavailable
  }
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useProductTour(): UseTourReturn {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const config = DASHBOARD_TOUR_CONFIG;
  const userId = user?.id || user?._id;

  // Filter steps by condition
  const visibleSteps = config.steps.filter(
    (step) => !step.condition || step.condition()
  );

  const [phase, setPhase] = useState<TourPhase>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const autoStartTriggered = useRef(false);

  const hasCompleted = isTourCompleted(config.tourId, userId);
  const isOnDashboard = location.pathname === '/dashboard';
  const isAuthenticated = !!user && !isLoading;

  // Should auto-start: authenticated + on dashboard + not completed + not already active
  const shouldAutoStart =
    isAuthenticated && isOnDashboard && !hasCompleted && phase === 'idle';

  // Auto-start timer
  useEffect(() => {
    if (!shouldAutoStart || autoStartTriggered.current) return;

    const timer = setTimeout(() => {
      autoStartTriggered.current = true;
      setPhase('welcome');
    }, config.autoStartDelay || 1500);

    return () => clearTimeout(timer);
  }, [shouldAutoStart, config.autoStartDelay]);

  // Lock body scroll when tour is active
  useEffect(() => {
    if (phase !== 'idle') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [phase]);

  const startTour = useCallback(() => {
    setPhase('welcome');
    setCurrentStepIndex(0);
  }, []);

  const beginTouring = useCallback(() => {
    setCurrentStepIndex(0);
    setPhase('touring');
  }, []);

  const nextStep = useCallback(() => {
    const current = visibleSteps[currentStepIndex];
    if (current?.onAfterStep) {
      Promise.resolve(current.onAfterStep());
    }

    if (currentStepIndex < visibleSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStep = visibleSteps[nextIdx];

      if (nextStep?.onBeforeStep) {
        Promise.resolve(nextStep.onBeforeStep());
      }
      setCurrentStepIndex(nextIdx);
    } else {
      completeTour();
    }
  }, [currentStepIndex, visibleSteps]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prevStep = visibleSteps[prevIdx];

      if (prevStep?.onBeforeStep) {
        Promise.resolve(prevStep.onBeforeStep());
      }
      setCurrentStepIndex(prevIdx);
    }
  }, [currentStepIndex, visibleSteps]);

  const skipTour = useCallback(() => {
    setPhase('idle');
    markTourCompleted(config.tourId, userId);
  }, [config.tourId, userId]);

  const completeTour = useCallback(() => {
    setPhase('completing');
    markTourCompleted(config.tourId, userId);
  }, [config.tourId, userId]);

  const dismissCompletion = useCallback(() => {
    setPhase('idle');
  }, []);

  const restartTour = useCallback(() => {
    clearTourCompleted(config.tourId, userId);
    setPhase('idle');
    setCurrentStepIndex(0);
    autoStartTriggered.current = false;
    navigate('/dashboard');
  }, [config.tourId, userId, navigate]);

  const currentStep = visibleSteps[currentStepIndex] || null;
  const isTourActive = phase !== 'idle';
  const progress = visibleSteps.length > 0 ? (currentStepIndex + 1) / visibleSteps.length : 0;

  return {
    phase,
    isTourActive,
    currentStepIndex,
    currentStep,
    totalSteps: visibleSteps.length,
    progress,
    visibleSteps,
    shouldAutoStart,
    startTour,
    beginTouring,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    dismissCompletion,
    restartTour,
    hasCompleted,
  };
}
