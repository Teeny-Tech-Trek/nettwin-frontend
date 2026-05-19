/**
 * useBilling — co-locates billing status + plan fetching with the loading
 * and refresh primitives the Billing page needs.
 */

import { useCallback, useEffect, useState } from 'react';
import billingService from '../services/billing.service';
import type { BillingStatus, Plan } from '../types/billing.types';

export const useBilling = () => {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [status, planList] = await Promise.all([
        billingService.getBillingStatus(),
        billingService.getPlans(),
      ]);
      setBillingStatus(status);
      setPlans(planList);
    } catch (err: any) {
      console.error('[useBilling] load failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load billing');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    billingStatus,
    plans,
    isLoading,
    error,
    refresh: loadAll,
    currentPlanSlug: billingStatus?.plan?.slug || 'free',
    isActive: billingStatus?.subscription?.isActive || false,
  };
};
