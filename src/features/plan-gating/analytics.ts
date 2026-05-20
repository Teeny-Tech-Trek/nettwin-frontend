/**
 * Tiny analytics shim for plan-gating events.
 *
 * Why a shim and not direct calls to a vendor SDK:
 *   - Vendors swap (PostHog → Mixpanel → Segment) more often than we
 *     refactor product code. Keeping the call sites generic insulates
 *     the gating module.
 *   - In dev we want to see what fires without setting up any vendor.
 *     This shim console.logs in DEV, no-ops in PROD when no global
 *     analytics object is present.
 *   - When window.analytics (Segment-style) or window.posthog is
 *     defined, we forward to it. No-op otherwise.
 *
 * Events we emit from the plan-gating module:
 *   - 'upgrade_modal_opened'    — gated CTA clicked, modal shown
 *   - 'avatar_creation_blocked' — quota check rejected creation
 *   - 'avatar_created'          — successful POST /digital-twin/create
 *   - 'upgrade_cta_clicked'     — user clicked the modal's primary CTA
 */

type EventName =
  | 'upgrade_modal_opened'
  | 'avatar_creation_blocked'
  | 'avatar_created'
  | 'upgrade_cta_clicked';

type EventProps = Record<string, string | number | boolean | null | undefined>;

interface WindowWithAnalytics extends Window {
  analytics?: { track?: (event: string, props?: EventProps) => void };
  posthog?: { capture?: (event: string, props?: EventProps) => void };
}

export function trackPlanGateEvent(event: EventName, props?: EventProps): void {
  const w = window as WindowWithAnalytics;

  // Forward to whichever provider is available, in order of preference.
  try {
    if (w.analytics?.track) {
      w.analytics.track(event, props);
    } else if (w.posthog?.capture) {
      w.posthog.capture(event, props);
    }
  } catch (err) {
    // Never let analytics break product code. Swallow.
    if (import.meta.env.DEV) {
      console.warn('[plan-gating analytics] track failed:', err);
    }
  }

  if (import.meta.env.DEV) {
    // Visible in dev console so engineers can verify event shape without
    // wiring up a vendor. Keep this AFTER the forward so the log shows the
    // same payload the vendor sees.
    console.log(`[plan-gating] ${event}`, props ?? {});
  }
}
