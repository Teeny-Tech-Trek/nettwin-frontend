/**
 * Razorpay helpers — dynamic script loading + checkout popup. Mirrors the
 * NexEstate implementation so the integration contract stays product-agnostic.
 */

import type {
  RazorpayCheckoutOptions,
  RazorpayPaymentResponse,
} from '../types/billing.types';

declare global {
  interface Window {
    // Razorpay's JS bundle attaches a global constructor at runtime.
    Razorpay: any;
  }
}

/**
 * Load the Razorpay checkout script on demand. Resolves with `true` if
 * already loaded or successfully fetched, `false` if the network failed.
 */
export const initializeRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = async (
  options: RazorpayCheckoutOptions,
  onSuccess: (response: RazorpayPaymentResponse) => void,
  onError: (error: unknown) => void
): Promise<void> => {
  try {
    const loaded = await initializeRazorpay();
    if (!loaded) {
      throw new Error('Failed to initialize Razorpay');
    }
    const razorpay = new window.Razorpay({
      ...options,
      handler: (response: RazorpayPaymentResponse) => onSuccess(response),
    });
    razorpay.on('payment.failed', (error: unknown) => onError(error));
    razorpay.open();
  } catch (error) {
    onError(error);
  }
};

/**
 * Read the Razorpay public key from Vite env. The backend ALSO returns this
 * via the create-order response (TTT echoes it); we prefer the env var so
 * the key is locked at deploy time and not subject to a man-in-the-middle
 * swap from a compromised backend.
 */
export const getRazorpayKey = (): string => {
  const key = import.meta.env.VITE_RAZORPAY_KEY;
  if (!key) {
    throw new Error('VITE_RAZORPAY_KEY environment variable is not set');
  }
  return key;
};

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format((amount || 0) / 100);
};
