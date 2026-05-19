/**
 * CurrentPlanCard — shows the user's active plan, renewal date, and usage
 * bars for twins / messages / leads.
 */

import React from 'react';
import { CalendarClock, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/razorpay';
import type { BillingStatus, UsageMetric } from '../types/billing.types';

interface CurrentPlanCardProps {
  status: BillingStatus;
}

const UsageBar: React.FC<{ label: string; metric: UsageMetric }> = ({ label, metric }) => {
  const unlimited = metric.limit === -1;
  const limitLabel = unlimited ? '∞' : metric.limit;
  const percent = unlimited ? 0 : Math.min(100, metric.percent);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">
          {metric.used} / {limitLabel}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-cyan-500'
          }`}
          style={{ width: unlimited ? '100%' : `${percent}%` }}
        />
      </div>
    </div>
  );
};

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({ status }) => {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {status.plan.name} plan
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {status.plan.price === 0
              ? 'No charge — free forever'
              : `${formatCurrency(status.plan.price, status.plan.currency)} per month`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              status.subscription.isActive
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-700/40 text-slate-300 border border-slate-600'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            {status.subscription.isActive ? 'Active' : status.subscription.status}
          </span>
        </div>
      </div>

      {status.subscription.currentPeriodEnd && (
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <CalendarClock className="w-4 h-4" />
          Renews on {formatDate(status.subscription.currentPeriodEnd)}
        </div>
      )}

      <div className="space-y-4">
        <UsageBar label="Digital twins" metric={status.usage.twins} />
        <UsageBar label="Chatbot messages" metric={status.usage.messages} />
        <UsageBar label="Leads captured" metric={status.usage.leads} />
      </div>
    </div>
  );
};

export default CurrentPlanCard;
