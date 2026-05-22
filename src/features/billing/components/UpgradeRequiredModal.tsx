/**
 * UpgradeRequiredModal — surfaces when the twin owner has exhausted their
 * monthly chat-message quota. Public visitors hitting a paused twin see the
 * inline banner in Chatbot.tsx; this modal is for the OWNER, shown on the
 * Dashboard so they can upgrade in one click.
 *
 * Self-contained: takes `open`, `onClose`, and the current usage numbers.
 * Renders a CTA that navigates to /billing — the existing PlanCards there
 * drive the Razorpay flow.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UpgradeRequiredModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  used: number;
  limit: number;
  periodEnd?: string | null;
}

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
};

export const UpgradeRequiredModal: React.FC<UpgradeRequiredModalProps> = ({
  open,
  onClose,
  planName,
  used,
  limit,
  periodEnd,
}) => {
  const navigate = useNavigate();
  const renewsOn = formatDate(periodEnd);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-amber-500/30 text-slate-100">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30">
            <AlertTriangle className="h-6 w-6 text-amber-300" />
          </div>
          <DialogTitle className="text-center text-xl text-white">
            Your digital twin has paused
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300">
            Your <span className="font-semibold text-white">{planName}</span> plan
            includes {limit} chat messages per month, and you've now used all of
            them ({used} / {limit}).
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300 space-y-2">
          <p>
            Until you upgrade
            {renewsOn ? <> or your quota renews on <span className="text-white font-medium">{renewsOn}</span></> : null},
            visitors to your twin will see a "currently not available" message.
          </p>
          <p className="text-slate-400">
            Upgrade in a few seconds — your twin resumes the moment payment clears.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Not now
          </Button>
          <Button
            onClick={() => {
              onClose();
              navigate('/billing');
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/30"
          >
            Upgrade now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeRequiredModal;
