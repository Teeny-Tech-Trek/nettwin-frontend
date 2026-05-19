/**
 * Billing domain types for NetTwin.
 *
 * Shape mirrors NexEstate's billing types so frontend developers moving
 * between products see the same primitives, but the feature-limit fields
 * are NetTwin-native (twins / messages / leads instead of agents / properties).
 */

// ── Plan & Pricing ──────────────────────────────────────────────────────
export interface Plan {
  id: string;
  slug: string;
  name: string;
  price: number; // paise
  currency: string;
  durationDays?: number;
  twinsLimit: number;
  messagesLimit: number; // -1 means unlimited
  leadsLimit: number;
  features: string[];
  isPopular?: boolean;
}

// ── Subscription ────────────────────────────────────────────────────────
export type SubscriptionStatus =
  | 'inactive'
  | 'active'
  | 'trial'
  | 'expired'
  | 'cancelled'
  | 'payment_failed';

export interface Subscription {
  status: SubscriptionStatus;
  isActive: boolean;
  centralCustomerId: string | null;
  currentPeriodEnd: string | null;
  lastSyncedAt: string | null;
  planId: string | null;
}

// ── Usage ───────────────────────────────────────────────────────────────
export interface UsageMetric {
  used: number;
  limit: number; // -1 means unlimited
  percent: number;
}

export interface Usage {
  twins: UsageMetric;
  messages: UsageMetric;
  leads: UsageMetric;
}

// ── Billing Status (the /api/billing/status response) ───────────────────
export interface BillingStatus {
  success: boolean;
  plan: {
    slug: string;
    name: string;
    price: number;
    currency: string;
    twinsLimit: number;
    messagesLimit: number;
    leadsLimit: number;
  };
  subscription: Subscription;
  usage: Usage;
}

// ── Order (the response from /api/billing/create-order) ─────────────────
export interface Order {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  razorpayKey: string;
  planId: string;
  planSlug: string;
  planName: string;
  customerId: string;
  metadata?: Record<string, unknown>;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  subscription?: Subscription;
  plan?: BillingStatus['plan'];
  subscription_status?: SubscriptionStatus;
  payment?: unknown;
}

// ── Razorpay Checkout ───────────────────────────────────────────────────
export interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  image?: string;
  handler?: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
