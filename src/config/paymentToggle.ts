// src/config/paymentToggle.ts
//
// FRONTEND-SIDE PAYMENT TOGGLE HELPERS
//
// IMPORTANT: the frontend does NOT decide whether payments are enabled.
// That decision is owned exclusively by the backend, via the
// PAYMENTS_ENABLED env var in digital_twin_backend/.env. See
// digital_twin_backend/src/config/paymentToggle.js.
//
// This file just exposes:
//   1) SUPPORT_CONTACT_EMAIL  — the address shown in the "payments paused"
//      modal. Hardcoded so flipping it never requires a frontend env change.
//   2) isPaymentsDisabledError — recognises the backend's 503 PAYMENTS_DISABLED
//      response so callers can open the "Contact us" modal as a graceful
//      fallback when the user clicks Upgrade while payments are off.
//
// How the UX actually works:
//   • User clicks Upgrade
//   • Frontend calls POST /api/billing/create-order
//   • If backend has PAYMENTS_ENABLED=true → Razorpay popup opens as normal
//   • If backend has PAYMENTS_ENABLED=false → backend returns 503
//     → UpgradeButton catch-block detects via isPaymentsDisabledError
//     → PaymentsDisabledModal opens immediately (no perceptible delay)
//
// To flip the toggle, edit ONE place: the backend's .env file.
// No frontend env change. No rebuild required for the frontend.

export const SUPPORT_CONTACT_EMAIL = "ttt.teenytechtrek@gmail.com";

/**
 * Recognise the backend's 503 PAYMENTS_DISABLED response so callers can
 * open the "Contact us" modal in their error handler.
 */
export const isPaymentsDisabledError = (error: unknown): boolean => {
  const e = error as { response?: { status?: number; data?: { error?: string } } };
  return (
    e?.response?.status === 503 && e?.response?.data?.error === "PAYMENTS_DISABLED"
  );
};
