/**
 * UpgradeRequiredModal — the single modal shown when a user hits a plan
 * limit anywhere in the app.
 *
 * Two visual variants driven by the gate verdict's `status` field:
 *
 *   • 'upgrade' (free user at limit):
 *       Title:   "You've reached the limit of 1 Digital Twin Avatar on the
 *                 Free Plan."
 *       Body:    "Upgrade your plan to create more Digital Twins."
 *       Actions: [Upgrade Plan]  [Maybe Later]
 *       Upgrade button navigates to /billing.
 *
 *   • 'paid-cap' (paid user at THEIR plan's ceiling):
 *       Title:   "You've reached your maximum limit of N Digital Twin Avatars."
 *       Body:    No upsell — they already pay. Just acknowledge + close.
 *       Actions: [Got it]
 *
 * Anything else ('allowed', 'loading', 'error') → the modal shouldn't be
 * open at all; the parent controls open state and only opens it after a
 * blocked click.
 */

import { useNavigate } from 'react-router-dom';
import { Sparkles, Crown, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { GateResult } from './types';
import { trackPlanGateEvent } from './analytics';

interface UpgradeRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gate: GateResult;
  /**
   * What the user was trying to do, used in copy AND analytics.
   * Default is generic — pass something like "Digital Twin Avatar" to
   * make the copy specific.
   */
  resourceLabel?: string;
}

export function UpgradeRequiredModal({
  open,
  onOpenChange,
  gate,
  resourceLabel = 'Digital Twin Avatar',
}: UpgradeRequiredModalProps) {
  const navigate = useNavigate();

  // Build copy from gate state so the modal is reusable across features
  // without duplicating string templates everywhere.
  const isUpgradePath = gate.status === 'upgrade';
  const isPaidCap = gate.status === 'paid-cap';

  const title = isUpgradePath
    ? `You've reached the limit of ${gate.limit} ${resourceLabel}${gate.limit === 1 ? '' : 's'} on the ${gate.planName} Plan.`
    : `You've reached your maximum limit of ${gate.limit} ${resourceLabel}s.`;

  const description = isUpgradePath
    ? `Upgrade your plan to create more ${resourceLabel}s.`
    : `You're using all the ${resourceLabel}s included in your current plan. Delete an existing one to free up space, or reach out if you need more.`;

  const handlePrimary = () => {
    if (isUpgradePath) {
      trackPlanGateEvent('upgrade_cta_clicked', {
        plan: gate.planSlug,
        current: gate.current,
        limit: gate.limit,
      });
      onOpenChange(false);
      navigate('/billing');
    } else {
      // paid-cap: primary CTA is just dismiss.
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Icon block — sparkle for upgrade path, crown for paid users at ceiling. */}
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-400/20 ring-1 ring-cyan-400/40">
            {isUpgradePath ? (
              <Sparkles className="h-6 w-6 text-cyan-400" aria-hidden />
            ) : (
              <Crown className="h-6 w-6 text-cyan-400" aria-hidden />
            )}
          </div>
          <DialogTitle className="text-center text-balance text-lg sm:text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-balance">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Compact usage indicator so the user immediately sees the math: 1/1, 10/10, etc. */}
        <div className="mt-2 rounded-lg border bg-muted/40 px-4 py-3 text-center text-sm">
          <span className="text-muted-foreground">Current usage</span>{' '}
          <span className="font-semibold tabular-nums">
            {gate.current} / {gate.limit === -1 ? '∞' : gate.limit}
          </span>
        </div>

        <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          {isUpgradePath && (
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="sm:flex-1"
            >
              Maybe Later
            </Button>
          )}
          <Button
            onClick={handlePrimary}
            className={`sm:flex-1 ${isUpgradePath ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-white hover:from-cyan-600 hover:to-teal-500' : ''}`}
          >
            {isUpgradePath ? (
              <>
                Upgrade Plan
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </>
            ) : (
              'Got it'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeRequiredModal;
