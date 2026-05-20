/**
 * usePlanGate — the single source of truth for "can the current user
 * create one more X?" anywhere in the frontend.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Before this module, plan checks were ad-hoc:
 *   - Dashboard's "Create New" buttons had no client-side check at all.
 *   - The Wizard's "Create Another" button on the success screen had no
 *     check either — clicking it just navigated back to step 1, and if the
 *     user re-completed the form, the backend silently upserted instead of
 *     surfacing the quota error.
 *   - The only enforcement was the canCreateTwin middleware on
 *     POST /api/digital-twin/create, hit after the user had already filled
 *     out an entire 8-step form — terrible UX.
 *
 * Now: every entry point to twin creation calls this hook, gets back a
 * GateResult, and either lets the user proceed or shows the upgrade modal.
 * Backend still enforces (defense in depth) but the user-facing block
 * happens at the click, not after the form.
 *
 * HOW IT KNOWS THE COUNT + LIMIT
 * ──────────────────────────────
 * We hit GET /api/billing/status, which returns
 *   {
 *     plan: { slug, twinsLimit, ... },
 *     usage: { twins: { used, limit, percent }, ... },
 *     subscription: { isActive, ... }
 *   }
 * The `usage.twins` block is computed server-side from a real count of
 * DigitalTwin docs owned by the user — same source the canCreateTwin
 * middleware uses — so the frontend gate and backend gate can never
 * disagree about whether the user is at the limit.
 *
 * WHEN TO REFRESH
 * ───────────────
 * After a successful creation (the count went up) OR after a successful
 * upgrade (the limit went up), the caller must invoke `refresh()` so
 * subsequent gating decisions reflect the new state.
 */

import { useCallback, useEffect, useState } from 'react';
import { billingService } from '@/services/api.service';
import type { BillingStatus } from '@/features/billing/types/billing.types';
import type { GateResult, GatedFeature } from './types';

// Cache the in-flight billing-status promise so multiple components that
// mount at the same time (e.g. Dashboard + a CreateButton in the header)
// don't each fire their own /billing/status request. This is module-level
// on purpose — it's safe to share across all consumers of this hook.
let inflightStatus: Promise<BillingStatus> | null = null;

async function fetchBillingStatus(): Promise<BillingStatus> {
  if (inflightStatus) return inflightStatus;
  inflightStatus = billingService.getBillingStatus().finally(() => {
    inflightStatus = null;
  });
  return inflightStatus;
}

/**
 * Given a fetched billing status, decide the gating verdict for a feature.
 * Pure function — easy to unit-test independently of the React hook.
 */
function evaluate(
  feature: GatedFeature,
  status: BillingStatus | null
): Pick<GateResult, 'status' | 'allowed' | 'current' | 'limit' | 'planSlug' | 'planName'> {
  if (!status) {
    return {
      status: 'loading',
      allowed: false,
      current: 0,
      limit: 0,
      planSlug: 'unknown',
      planName: 'Unknown',
    };
  }

  // Only `createTwin` is gated today; the switch is structured so adding
  // a new feature later is a single case statement, not a rewrite.
  let used = 0;
  let limit = 0;
  switch (feature) {
    case 'createTwin':
      used = status.usage.twins.used;
      limit = status.usage.twins.limit;
      break;
  }

  const planSlug = status.plan?.slug ?? 'free';
  const planName = status.plan?.name ?? 'Free';

  // -1 from the backend means unlimited.
  if (limit === -1) {
    return { status: 'allowed', allowed: true, current: used, limit, planSlug, planName };
  }

  if (used < limit) {
    return { status: 'allowed', allowed: true, current: used, limit, planSlug, planName };
  }

  // At or over the limit. Differentiate free vs paid so the UI can show
  // the right modal: free users see an upgrade CTA; paid users at their
  // ceiling see an informational message (no upsell — they already paid).
  const isFree = planSlug === 'free' || !status.subscription?.isActive;
  return {
    status: isFree ? 'upgrade' : 'paid-cap',
    allowed: false,
    current: used,
    limit,
    planSlug,
    planName,
  };
}

/**
 * Subscribe to gating verdict for a given feature.
 *
 * @example
 *   const gate = usePlanGate('createTwin');
 *   if (gate.status === 'loading') return <Spinner />;
 *   <Button disabled={!gate.allowed} onClick={() => {...}}>
 */
export function usePlanGate(feature: GatedFeature): GateResult {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const status = await fetchBillingStatus();
      setBillingStatus(status);
    } catch (err) {
      console.error('[usePlanGate] billing status fetch failed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Cross-component invalidation. When something elsewhere in the app
  // mutates the count (twin created, twin deleted) it dispatches a window
  // event; every mounted usePlanGate re-fetches so the next render
  // reflects the new usage. Cheaper than wiring a global store, and works
  // even across React boundaries (e.g. modal portals).
  useEffect(() => {
    const onMutation = () => {
      // Clear module cache so the next fetch isn't served the old promise.
      inflightStatus = null;
      void load();
    };
    window.addEventListener('twin:created', onMutation);
    window.addEventListener('twin:deleted', onMutation);
    window.addEventListener('billing:updated', onMutation);
    return () => {
      window.removeEventListener('twin:created', onMutation);
      window.removeEventListener('twin:deleted', onMutation);
      window.removeEventListener('billing:updated', onMutation);
    };
  }, [load]);

  const verdict = evaluate(feature, billingStatus);

  // If fetch errored, override status to 'error' (closed-by-default — never
  // optimistically allow creation we can't verify).
  if (error && verdict.status === 'loading') {
    return {
      ...verdict,
      status: 'error',
      refresh: load,
    };
  }

  return {
    ...verdict,
    refresh: load,
  };
}
