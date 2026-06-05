/**
 * UsageAnalyticsSection — lifetime usage insight for the owner's twin, shown
 * on the billing/usage dashboard. Self-fetches from /billing/usage-analytics.
 *
 * Works for both BYOK and platform owners. Renders nothing on hard error so it
 * never breaks the billing page.
 */

import React from 'react';
import {
  MessagesSquare,
  MessageSquare,
  Bot,
  Users,
  TrendingUp,
  ClipboardList,
  UserCheck,
  Loader2,
} from 'lucide-react';
import billingService from '../services/billing.service';
import type { UsageAnalytics } from '../types/billing.types';

interface TileProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const Tile: React.FC<TileProps> = ({ icon, label, value }) => (
  <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-5">
    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
      {icon}
      {label}
    </div>
    <div className="mt-2 text-2xl font-semibold text-white">
      {value.toLocaleString()}
    </div>
  </div>
);

export const UsageAnalyticsSection: React.FC = () => {
  const [data, setData] = React.useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const analytics = await billingService.getUsageAnalytics();
        if (!cancelled) setData(analytics);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-white mb-1">Usage analytics</h2>
      <p className="text-sm text-slate-400 mb-4">
        Lifetime activity across your digital twin.
      </p>

      {loading || !data ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading analytics…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Tile icon={<MessagesSquare className="h-3.5 w-3.5" />} label="Total Conversations" value={data.totalConversations} />
          <Tile icon={<MessageSquare className="h-3.5 w-3.5" />} label="Total Messages" value={data.totalMessages} />
          <Tile icon={<Bot className="h-3.5 w-3.5" />} label="AI Responses" value={data.aiResponsesGenerated} />
          <Tile icon={<TrendingUp className="h-3.5 w-3.5" />} label="Avg Msgs / Visitor" value={data.avgMessagesPerVisitor} />
          <Tile icon={<Users className="h-3.5 w-3.5" />} label="Unique Visitors" value={data.distinctVisitors} />
          <Tile icon={<ClipboardList className="h-3.5 w-3.5" />} label="Profile Analyses" value={data.profileAnalysisCount} />
          <Tile icon={<UserCheck className="h-3.5 w-3.5" />} label="Active Leads" value={data.activeLeads} />
        </div>
      )}
    </div>
  );
};

export default UsageAnalyticsSection;
