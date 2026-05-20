/**
 * CreateTwinGuard — drop-in click guard for any "Create Digital Twin" CTA.
 *
 * Wrap your existing CTA (button, link, fancy gradient card — anything that
 * has an onClick or a destination) in this component. The guard:
 *   1. Subscribes to the plan-gate verdict via usePlanGate('createTwin').
 *   2. On click, checks the verdict synchronously.
 *      • allowed → calls the wrapped `onAllow` callback (navigate, open
 *        wizard, etc.) and fires the `twin_creation_allowed` analytics.
 *      • upgrade / paid-cap → suppresses the action, fires
 *        `avatar_creation_blocked` + `upgrade_modal_opened`, opens the
 *        upgrade modal.
 *      • loading / error → suppresses the action and shows a brief inline
 *        notice via the toast hook (we don't render a modal for a
 *        not-ready state — that's confusing).
 *   3. Renders the upgrade modal as a sibling so it sits outside the CTA
 *      and doesn't inherit any of the CTA's styling.
 *
 * Why a render-prop / "children" API instead of forcing a Button shape?
 *   - The dashboard's CTA is a full Link card with a gradient and an icon.
 *   - The wizard success screen's CTA is a plain Button with text.
 *   - The header might one day use a small icon-only button.
 *   We can't force a single visual shape. Instead, we pass a `disabled`
 *   prop and an `onClick` down to whatever the consumer renders, and let
 *   them style as they like. This keeps the gating logic 100% centralized
 *   while the UI stays per-consumer.
 *
 * USAGE
 * ─────
 *   <CreateTwinGuard onAllow={() => navigate('/wizard')}>
 *     {({ onClick, disabled, gate }) => (
 *       <button onClick={onClick} disabled={disabled}>
 *         New Digital Twin {gate.limit !== -1 && `(${gate.current}/${gate.limit})`}
 *       </button>
 *     )}
 *   </CreateTwinGuard>
 */

import { useState, useCallback, type ReactNode, type MouseEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePlanGate } from './usePlanGate';
import { UpgradeRequiredModal } from './UpgradeRequiredModal';
import { trackPlanGateEvent } from './analytics';
import type { GateResult } from './types';

interface CreateTwinGuardRenderProps {
  /** Wire this to your CTA's onClick — the guard decides what happens. */
  onClick: (event?: MouseEvent) => void;
  /** True while the gate is loading or in error. Forward to your button. */
  disabled: boolean;
  /** Current verdict — useful for showing "(1/1)" usage hints in the CTA. */
  gate: GateResult;
}

interface CreateTwinGuardProps {
  /** Called only when the gate verdict is `allowed`. */
  onAllow: () => void;
  /** Render-prop for the CTA itself. */
  children: (props: CreateTwinGuardRenderProps) => ReactNode;
  /**
   * Resource label passed through to the modal copy. Defaults are good for
   * 99% of cases; override only if you're gating something other than
   * Digital Twin Avatars (currently nothing else, but the gate is generic).
   */
  resourceLabel?: string;
}

export function CreateTwinGuard({
  onAllow,
  children,
  resourceLabel,
}: CreateTwinGuardProps) {
  const gate = usePlanGate('createTwin');
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const handleClick = useCallback(
    (event?: MouseEvent) => {
      // Prevent default navigation on <Link> wrappers — the guard decides
      // whether navigation actually happens.
      event?.preventDefault?.();

      switch (gate.status) {
        case 'allowed': {
          onAllow();
          return;
        }
        case 'upgrade':
        case 'paid-cap': {
          // Fire analytics BEFORE opening the modal so we don't lose the
          // event if the user clicks away before render commits.
          trackPlanGateEvent('avatar_creation_blocked', {
            plan: gate.planSlug,
            current: gate.current,
            limit: gate.limit,
            reason: gate.status,
          });
          trackPlanGateEvent('upgrade_modal_opened', {
            plan: gate.planSlug,
            current: gate.current,
            limit: gate.limit,
          });
          setModalOpen(true);
          return;
        }
        case 'loading': {
          // We genuinely don't know yet. Don't optimistically allow — show
          // a hint so the user doesn't think the button is broken.
          toast({
            title: 'Checking your plan…',
            description: 'One moment while we verify your subscription.',
          });
          return;
        }
        case 'error': {
          toast({
            title: 'Could not verify your plan',
            description:
              'Please refresh and try again. If the problem persists, contact support.',
            variant: 'destructive',
          });
          // Best-effort retry the underlying fetch so the next click might
          // succeed without a full page reload.
          void gate.refresh();
          return;
        }
      }
    },
    [gate, onAllow, toast]
  );

  // `disabled` only blocks the visual affordance — `handleClick` still runs
  // through the switch above. Keeping these in sync means consumers can
  // either use the disabled flag for visual feedback OR let clicks through
  // and see the modal/toast.
  const disabled =
    gate.status === 'loading' || gate.status === 'error';

  return (
    <>
      {children({ onClick: handleClick, disabled, gate })}
      <UpgradeRequiredModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        gate={gate}
        resourceLabel={resourceLabel}
      />
    </>
  );
}

export default CreateTwinGuard;
