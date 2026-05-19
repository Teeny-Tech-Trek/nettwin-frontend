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
}

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
}) => {
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to initiate upgrade'
      );
      setIsLoading(false);
    }
  };

  return (
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
      ) : (
        'Upgrade'
      )}
    </button>
  );
};

export default UpgradeButton;
