/**
 * Provider-config API client. Reads the tenant's LLM provider configuration
 * (BYOK vs platform) from NetTwin's `/api/provider-config` surface.
 *
 * Used by the billing page to decide whether to show platform pricing cards
 * (platform-key users) or a "Your API Usage" panel (BYOK users who pay their
 * own AI cost). The backend never returns the actual API key.
 */

import axiosInstance from '@/axios.config';

export interface ProviderConfig {
  provider: string; // "gemini" | "anthropic" | "openai"
  useOwnKey: boolean;
  fallbackProviders: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderConfigResponse {
  success: boolean;
  config: ProviderConfig | null;
  resolved: {
    provider: string;
    providerSource: 'tenant' | 'platform';
    fallbackProviders?: string[];
  };
}

export const getProviderConfig = async (
  tenantId: string
): Promise<ProviderConfigResponse> => {
  const response = await axiosInstance.get<ProviderConfigResponse>(
    '/provider-config',
    { params: { tenantId } }
  );
  return response.data;
};

export interface TestKeyResult {
  success: boolean;
  message: string;
  result?: { provider: string; valid: boolean; responseSnippet?: string };
}

/** Validate a provider key without saving it (lightweight live call). */
export const testProviderKey = async (params: {
  tenantId: string;
  provider: string;
  apiKey: string;
}): Promise<TestKeyResult> => {
  const response = await axiosInstance.post<TestKeyResult>('/provider-config/test', params);
  return response.data;
};

/** Enable BYOK — encrypts + stores the key in the existing TenantProviderConfig. */
export const enableByok = async (params: {
  tenantId: string;
  provider: string;
  apiKey: string;
}): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post('/provider-config/enable-byok', params);
  return response.data;
};

/** Disable BYOK — revert to the platform default provider. */
export const disableByok = async (
  tenantId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post('/provider-config/disable-byok', { tenantId });
  return response.data;
};

export default { getProviderConfig, testProviderKey, enableByok, disableByok };
