import React from 'react';
import { BillingPage } from '@/features/billing/components/BillingPage';

/**
 * Route entry for /billing. The actual layout + data wiring lives in
 * features/billing/components/BillingPage so the page module stays a thin
 * shell — matches the convention of other pages in this codebase.
 */
const Billing: React.FC = () => <BillingPage />;

export default Billing;
