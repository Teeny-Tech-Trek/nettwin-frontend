/**
 * Billing API client. Hits NetTwin's backend `/api/billing/*` surface,
 * which in turn proxies to the centralized TTT Payment Service.
 *
 * Endpoint contract intentionally mirrors NexEstate's billing service so a
 * single mental model covers both products.
 */

import axiosInstance from '@/axios.config';
import type {
  BillingStatus,
  CreateOrderResponse,
  Order,
  Plan,
  VerifyPaymentResponse,
} from '../types/billing.types';

export const getPlans = async (): Promise<Plan[]> => {
  const response = await axiosInstance.get<{ success: boolean; plans: Plan[] }>(
    '/billing/plans'
  );
  return response.data.plans;
};

export const getBillingStatus = async (): Promise<BillingStatus> => {
  const response = await axiosInstance.get<BillingStatus>('/billing/status');
  return response.data;
};

export const initializeBilling = async (): Promise<{
  success: boolean;
  customerId: string;
}> => {
  const response = await axiosInstance.post<{ success: boolean; customerId: string }>(
    '/billing/initialize',
    {}
  );
  return response.data;
};

export const createOrder = async (planId: string): Promise<Order> => {
  const response = await axiosInstance.post<CreateOrderResponse>(
    '/billing/create-order',
    { planId }
  );
  if (!response.data.success) {
    throw new Error('Failed to create order');
  }
  return response.data.order;
};

export const verifyPayment = async (
  orderId: string,
  paymentId: string,
  signature: string
): Promise<VerifyPaymentResponse> => {
  const response = await axiosInstance.post<VerifyPaymentResponse>(
    '/billing/verify-payment',
    { orderId, paymentId, signature }
  );
  return response.data;
};

export const syncSubscription = async (): Promise<VerifyPaymentResponse> => {
  const response = await axiosInstance.post<VerifyPaymentResponse>(
    '/billing/sync-subscription',
    {}
  );
  return response.data;
};

export const billingService = {
  getPlans,
  getBillingStatus,
  initializeBilling,
  createOrder,
  verifyPayment,
  syncSubscription,
};

export default billingService;
