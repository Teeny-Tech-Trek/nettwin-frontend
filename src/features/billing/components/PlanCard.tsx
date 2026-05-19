/**
 * PlanCard — single pricing tier card. Shows price, the NetTwin-native
 * feature list, and an UpgradeButton.
 */

import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/razorpay';
import { UpgradeButton } from './UpgradeButton';
import type { Plan } from '../types/billing.types';

interface PlanCardProps {
  plan: Plan;
  currentPlanSlug?: string;
  onUpgradeSuccess?: () => void;
  userEmail?: string;
  userName?: string;
}

const formatLimit = (limit: number, suffix: string) =>
  limit === -1 ? `Unlimited ${suffix}` : `${limit} ${suffix}`;

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  currentPlanSlug,
  onUpgradeSuccess,
  userEmail,
  userName,
}) => {
  const isCurrent = currentPlanSlug?.toLowerCase() === plan.slug.toLowerCase();

  return (
    <div
      className={`relative rounded-2xl border p-6 transition-all ${
        plan.isPopular
          ? 'border-cyan-500/60 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg shadow-cyan-500/10'
          : 'border-slate-700 bg-slate-900/60'
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 text-xs font-semibold text-white">
          <Sparkles className="w-3 h-3" />
          POPULAR
        </div>
      )}
      {isCurrent && (
        <div className="absolute top-3 right-3 rounded-full bg-emerald-500/15 text-emerald-300 text-xs px-2 py-0.5 border border-emerald-500/30">
          Current
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            {plan.price === 0 ? 'Free' : formatCurrency(plan.price, plan.currency)}
          </span>
          {plan.price > 0 && (
            <span className="text-sm text-slate-400">/ month</span>
          )}
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        <li className="flex items-start gap-2 text-sm text-slate-300">
          <Check className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
          {formatLimit(plan.twinsLimit, 'digital twin' + (plan.twinsLimit === 1 ? '' : 's'))}
        </li>
        <li className="flex items-start gap-2 text-sm text-slate-300">
          <Check className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
          {formatLimit(plan.messagesLimit, 'chatbot messages / month')}
        </li>
        <li className="flex items-start gap-2 text-sm text-slate-300">
          <Check className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
          {formatLimit(plan.leadsLimit, 'leads captured')}
        </li>
        {plan.features?.slice(3).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
            <Check className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <UpgradeButton
        planId={plan.id}
        planSlug={plan.slug}
        planName={plan.name}
        currentPlanSlug={currentPlanSlug}
        onUpgradeSuccess={onUpgradeSuccess}
        userEmail={userEmail}
        userName={userName}
        className="w-full"
      />
    </div>
  );
};

export default PlanCard;
