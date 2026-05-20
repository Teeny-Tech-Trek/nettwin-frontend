/**
 * Plan-gating domain types.
 *
 * These are the small handful of shapes the plan-gating module exposes to
 * the rest of the app. We DON'T re-export billing.types here — billing
 * types are an implementation detail of how we fetch the underlying data,
 * and consumers of this module should not need to know that.
 */

/** Which capability the caller is gating. Currently only twin creation; */
/** add new gate kinds (e.g. 'sendMessage', 'createLead') as we extend. */
export type GatedFeature = 'createTwin';

/**
 * The verdict for a single gating check.
 *
 * Status interpretation:
 *   - 'loading'   → we don't know yet (billing status still in flight).
 *                   UI should disable the CTA or show a small spinner —
 *                   never let the user proceed under uncertainty.
 *   - 'allowed'   → user is below their plan's limit; allow the action.
 *   - 'upgrade'   → free user at limit. Show the upgrade modal with a
 *                   path to /billing.
 *   - 'paid-cap'  → already on a paid plan but at that plan's limit
 *                   (e.g. 10/10 for pro). No upgrade path — show an
 *                   informational modal only.
 *   - 'error'     → billing status fetch failed. Treat as "deny" by
 *                   default so we never grant access we can't justify;
 *                   caller can offer a retry.
 */
export type GateStatus = 'loading' | 'allowed' | 'upgrade' | 'paid-cap' | 'error';

export interface GateResult {
  status: GateStatus;
  /** True only when status === 'allowed'. Convenience for callers. */
  allowed: boolean;
  /** Current count of the gated resource (e.g. twins owned). */
  current: number;
  /** Plan limit for the gated resource. -1 if unlimited. */
  limit: number;
  /** Plan slug ('free', 'pro', etc.) — useful for analytics + modal copy. */
  planSlug: string;
  /** Human-readable plan name from billing status. */
  planName: string;
  /** Force a re-fetch of billing status (call this after a successful upgrade). */
  refresh: () => Promise<void>;
}
