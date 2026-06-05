/**
 * ApiUsageCard — shown on the billing page INSTEAD of platform pricing cards
 * when the owner is on BYOK (they bring their own LLM key and pay their own
 * AI cost, so platform AI plans are irrelevant to them).
 *
 * Pure presentational. Usage numbers come from the existing /billing/status
 * response; BYOK twins are exempt from the AI message cap (see billing
 * middleware), so "Messages Remaining" is shown as Unlimited.
 */

import React from 'react';
import { KeyRound, MessageSquare, Infinity as InfinityIcon, Users, Cpu, ShieldCheck } from 'lucide-react';
import type { BillingStatus } from '../types/billing.types';
import type { ByokStatus } from '../hooks/useByokStatus';

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
};

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}

const Metric: React.FC<MetricProps> = ({ icon, label, value, hint }) => (
  <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-5">
    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
      {icon}
      {label}
    </div>
    <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
  </div>
);

interface ApiUsageCardProps {
  byok: ByokStatus;
  status: BillingStatus | null;
}

export const ApiUsageCard: React.FC<ApiUsageCardProps> = ({ byok, status }) => {
  const messagesUsed = status?.usage?.messages?.used ?? 0;
  const leadsUsed = status?.usage?.leads?.used ?? 0;
  const providerLabel = byok.provider
    ? PROVIDER_LABELS[byok.provider.toLowerCase()] || byok.provider
    : '—';

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-300">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Your API Usage</h2>
          <p className="mt-1 text-sm text-slate-400">
            You&apos;re using your own API key, so NetTwin isn&apos;t billing you for AI.
            Platform message plans don&apos;t apply — you only pay your provider directly.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Metric
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label="Messages Used"
          value={messagesUsed.toLocaleString()}
          hint="This billing period"
        />
        <Metric
          icon={<InfinityIcon className="h-3.5 w-3.5" />}
          label="Messages Remaining"
          value="Unlimited"
          hint="Metered on your own key"
        />
        <Metric
          icon={<Users className="h-3.5 w-3.5" />}
          label="Leads Captured"
          value={leadsUsed.toLocaleString()}
          hint="This billing period"
        />
        <Metric
          icon={<Cpu className="h-3.5 w-3.5" />}
          label="API Provider"
          value={providerLabel}
        />
        <Metric
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="API Key Status"
          value={
            <span className={byok.keyActive ? 'text-emerald-400' : 'text-amber-400'}>
              <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                style={{ backgroundColor: byok.keyActive ? '#34d399' : '#fbbf24' }} />
              {byok.keyActive ? 'Active' : 'Inactive'}
            </span>
          }
        />
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Want NetTwin to handle the AI for you instead? Remove your API key in provider
        settings to switch back to a platform plan.
      </p>
    </div>
  );
};

export default ApiUsageCard;
