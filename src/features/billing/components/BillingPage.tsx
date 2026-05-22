/**
 * BillingPage — top-level page composing CurrentPlanCard + PlanCard grid.
 * This is mounted at /billing inside a ProtectedRoute.
 */

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import billingService from '../services/billing.service';
import { useBilling } from '../hooks/useBilling';
import CurrentPlanCard from './CurrentPlanCard';
import PlanCard from './PlanCard';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const { billingStatus, plans, isLoading, error, refresh, currentPlanSlug } =
    useBilling();

  const [isSyncing, setIsSyncing] = React.useState(false);
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await billingService.syncSubscription();
      await refresh();
      toast.success('Subscription synced');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading billing…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white">Billing</h1>
            <p className="text-slate-400 mt-1">
              Manage your NetTwin plan, usage, and payment history.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {billingStatus && (
          <div className="mb-10">
            <CurrentPlanCard status={billingStatus} />
          </div>
        )}

        <h2 className="text-xl font-semibold text-white mb-4">Available plans</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlanSlug={currentPlanSlug}
              onUpgradeSuccess={refresh}
              userEmail={user?.email}
              userName={user?.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
