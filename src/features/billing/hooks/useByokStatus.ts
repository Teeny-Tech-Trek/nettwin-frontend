/**
 * useByokStatus — resolves whether the current owner's twin is on BYOK
 * (bring-your-own-key) so the billing page can swap platform pricing cards
 * for a "Your API Usage" panel and a key-management card.
 *
 * Flow: load the owner's single twin -> derive tenantId (`twin-<id>`) ->
 * read provider config. Fails soft to "not BYOK" (show platform plans) so a
 * provider-config hiccup never hides the pricing UI for a paying customer.
 */

import { useCallback, useEffect, useState } from 'react';
import { digitalTwinService } from '@/services/api.service';
import { getProviderConfig } from '../services/providerConfig.service';

export interface ByokStatus {
  isByok: boolean;
  provider: string | null; // gemini | openai | anthropic
  keyActive: boolean;
  tenantId: string | null; // twin-<id>, needed to manage the key
  loading: boolean;
  refresh: () => void;
}

export const useByokStatus = (): ByokStatus => {
  const [state, setState] = useState<Omit<ByokStatus, 'refresh'>>({
    isByok: false,
    provider: null,
    keyActive: false,
    tenantId: null,
    loading: true,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const twinRes: any = await digitalTwinService.get();
      const twinId =
        twinRes?.data?._id || twinRes?._id || twinRes?.twin?._id || null;
      if (!twinId) {
        setState({ isByok: false, provider: null, keyActive: false, tenantId: null, loading: false });
        return;
      }
      const tenantId = `twin-${String(twinId).toLowerCase()}`;
      const cfg = await getProviderConfig(tenantId);
      const isByok =
        cfg?.resolved?.providerSource === 'tenant' ||
        Boolean(cfg?.config?.useOwnKey && cfg?.config?.isActive);
      setState({
        isByok,
        provider: cfg?.config?.provider || cfg?.resolved?.provider || null,
        keyActive: Boolean(cfg?.config?.useOwnKey && cfg?.config?.isActive),
        tenantId,
        loading: false,
      });
    } catch {
      // No twin yet, 404, or provider-config error -> treat as platform, but
      // keep any tenantId we already resolved so the key form still works.
      setState((s) => ({ ...s, isByok: false, keyActive: false, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
};

export default useByokStatus;
