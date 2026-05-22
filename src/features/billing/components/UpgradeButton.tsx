/**
 * UpgradeButton — orchestrates the create-order → Razorpay checkout → verify
 * flow for a single plan. Mirrors NexEstate's UpgradeButton with NetTwin
 * branding and plan terminology.
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import billingService from '../services/billing.service';
import { getRazorpayKey, openRazorpayCheckout } from '../utils/razorpay';
import type { RazorpayPaymentResponse } from '../types/billing.types';
import { isPaymentsDisabledError } from '@/config/paymentToggle';
import PaymentsDisabledModal from './PaymentsDisabledModal';

interface UpgradeButtonProps {
  planId: string;
  planSlug: string;
  planName: string;
  currentPlanSlug?: string;
  onUpgradeSuccess?: () => void;
  className?: string;
  disabled?: boolean;
  userEmail?: string;
  userName?: string;
  // True for Enterprise tier — no Razorpay flow; opens a mailto to sales.
  isContactOnly?: boolean;
}

// Read from Vite env at build time; fall back to a sensible default so the
// button always has something to mailto. Override in the frontend .env via
// VITE_SUPPORT_EMAIL for white-label deployments.
const SUPPORT_EMAIL =
  (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) ||
  'sales@nettwin.techtrekkers.ai';

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  planId,
  planSlug,
  planName,
  currentPlanSlug,
  onUpgradeSuccess,
  className = '',
  disabled = false,
  userEmail,
  userName,
  isContactOnly = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsDisabledOpen, setPaymentsDisabledOpen] = useState(false);

  const isCurrent = currentPlanSlug?.toLowerCase() === planSlug.toLowerCase();
  const isFreePlan = planSlug.toLowerCase() === 'free';

  const handlePaymentSuccess = async (
    paymentResponse: RazorpayPaymentResponse,
    orderId: string
  ) => {
    try {
      const verifyResult = await billingService.verifyPayment(
        paymentResponse.razorpay_order_id || orderId,
        paymentResponse.razorpay_payment_id,
        paymentResponse.razorpay_signature
      );
      if (verifyResult.success) {
        toast.success(`Successfully upgraded to ${planName} plan`);
        onUpgradeSuccess?.();
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('[UpgradeButton] Verification error:', error);
      // The activation webhook from TTT is the authoritative state-update
      // path — if the polling verify call hasn't seen the capture yet, the
      // webhook will still update state shortly. Surface a soft message.
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Payment was received but verification is still pending. Please refresh in a moment.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeClick = async () => {
    if (isCurrent) {
      toast.info(`You are already on the ${planName} plan`);
      return;
    }
    if (isFreePlan) {
      // Free plan has no Razorpay flow — nothing to purchase.
      toast.info('Free plan is active by default');
      return;
    }
    if (isContactOnly) {
      // Enterprise — open the user's mail client pre-filled with a sales
      // enquiry. No Razorpay; the sales team handles activation manually.
      const subject = encodeURIComponent('NetTwin Enterprise enquiry');
      const body = encodeURIComponent(
        `Hi NetTwin team,\n\nI'd like to discuss the Enterprise plan.\n\nName: ${userName || ''}\nEmail: ${userEmail || ''}\n\n— Tell us about your needs:\n`,
      );
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
      return;
    }

    // No preemptive frontend check for the global payments kill-switch —
    // the backend is the sole authority. If payments are off, the
    // create-order call below returns 503 PAYMENTS_DISABLED and the catch
    // block opens the modal. Backend env (PAYMENTS_ENABLED) is the only
    // place you flip this.

    setIsLoading(true);
    try {
      const order = await billingService.createOrder(planId);
      if (!order?.orderId) {
        throw new Error('Failed to create order - no order id received');
      }

      const checkoutOptions = {
        // Prefer the env-locked key; fall back to the value TTT echoed in
        // the order response so misconfigured envs still flow through dev.
        key: (() => {
          try {
            return getRazorpayKey();
          } catch {
            return order.razorpayKey;
          }
        })(),
        order_id: order.orderId,
        name: 'NetTwin',
        description: `Upgrade to ${planName} Plan`,
        amount: order.amount,
        currency: order.currency || 'INR',
        prefill: {
          name: userName || '',
          email: userEmail || '',
        },
        theme: { color: '#0ea5e9' },
      };

      await openRazorpayCheckout(
        checkoutOptions,
        (response) => handlePaymentSuccess(response, order.orderId),
        (error: any) => {
          toast.error(
            error?.error?.description ||
              error?.message ||
              'Payment was not completed. Please try again.'
          );
          setIsLoading(false);
        }
      );
    } catch (error: any) {
      console.error('[UpgradeButton] Upgrade error:', error);
      // Backend says payments are off — surface the same Contact us modal
      // even if the frontend toggle was misaligned. Backend is authoritative.
      if (isPaymentsDisabledError(error)) {
        setPaymentsDisabledOpen(true);
        setIsLoading(false);
        return;
      }
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to initiate upgrade'
      );
      setIsLoading(false);
    }
  };

  return (
    <>
    <PaymentsDisabledModal
      open={paymentsDisabledOpen}
      onClose={() => setPaymentsDisabledOpen(false)}
      planName={planName}
    />
    <button
      onClick={handleUpgradeClick}
      disabled={disabled || isLoading || isCurrent}
      className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
        disabled || isLoading || isCurrent
          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/40'
      } ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing…
        </span>
      ) : isCurrent ? (
        'Current Plan'
      ) : isFreePlan ? (
        'Free Plan'
      ) : isContactOnly ? (
        'Contact sales'
      ) : (
        'Upgrade'
      )}
    </button>
    </>
  );
};

export default UpgradeButton;
