/**
 * src/features/plan-gating
 * ────────────────────────
 *
 * Centralized plan-gating module. All client-side checks for "can this
 * user create another digital twin?" go through here so the rule lives
 * in exactly ONE place.
 *
 * File map:
 *
 *   types.ts                  → GatedFeature + GateResult shapes.
 *   usePlanGate.ts            → React hook returning a GateResult.
 *                               Fetches /api/billing/status (cached in
 *                               module scope across consumers) and
 *                               evaluates the verdict.
 *   UpgradeRequiredModal.tsx  → The actual modal UI. Two variants:
 *                               • free user → "Upgrade Plan" CTA → /billing
 *                               • paid user at ceiling → "Got it"
 *   CreateTwinGuard.tsx       → Render-prop wrapper. Drop around any
 *                               "Create New Twin" CTA and it will
 *                               intercept the click and show the modal
 *                               when needed.
 *   analytics.ts              → Vendor-agnostic event shim. Fires
 *                               upgrade_modal_opened, avatar_creation_blocked,
 *                               avatar_created, upgrade_cta_clicked.
 *
 * Where the rules are enforced:
 *
 *   Frontend gate ........... CreateTwinGuard (click intercept)
 *                              + usePlanGate (verdict)
 *   Backend enforcement ..... canCreateTwin middleware on
 *                              POST /api/digital-twin/create
 *                              (digital_twin_backend/src/modules/billing/
 *                               billing.middleware.js)
 *
 * Where the modal triggers:
 *
 *   The modal is owned by CreateTwinGuard. Consumers don't open it
 *   directly — they just wrap their CTA with the guard.
 *
 * Where the upgrade redirect happens:
 *
 *   UpgradeRequiredModal's primary CTA calls `navigate('/billing')`. The
 *   /billing route renders src/features/billing/components/BillingPage.tsx.
 *
 * Where the avatar count comes from:
 *
 *   Server-side, GET /api/billing/status returns `usage.twins.used` which
 *   is `DigitalTwin.countDocuments({ user: userId })`. We never count
 *   client-side from a cached list — the backend is the source of truth.
 *
 * Public exports below ↓
 */

export { usePlanGate } from './usePlanGate';
export { CreateTwinGuard } from './CreateTwinGuard';
export { UpgradeRequiredModal } from './UpgradeRequiredModal';
export { trackPlanGateEvent } from './analytics';
export type { GateResult, GateStatus, GatedFeature } from './types';
