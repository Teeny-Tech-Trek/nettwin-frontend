/**
 * ByokKeyCard — self-service "Bring Your Own API Key" management.
 *
 * Lets the owner enter a Gemini / OpenAI / Anthropic key, validate it with a
 * live test call, then enable BYOK (key encrypted + stored in the existing
 * TenantProviderConfig schema). When BYOK is already active it shows status +
 * a "switch back to platform" action. Reuses the existing /provider-config
 * backend — no new schema or system.
 */

import React from 'react';
import { KeyRound, Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  testProviderKey,
  enableByok,
  disableByok,
} from '../services/providerConfig.service';
import type { ByokStatus } from '../hooks/useByokStatus';

const PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic Claude' },
];

interface ByokKeyCardProps {
  byok: ByokStatus;
}

export const ByokKeyCard: React.FC<ByokKeyCardProps> = ({ byok }) => {
  const [provider, setProvider] = React.useState('gemini');
  const [apiKey, setApiKey] = React.useState('');
  const [testing, setTesting] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [tested, setTested] = React.useState<null | boolean>(null);

  const tenantId = byok.tenantId;
  const disabled = !tenantId || !apiKey.trim();

  const handleTest = async () => {
    if (disabled) return;
    setTesting(true);
    setTested(null);
    try {
      const res = await testProviderKey({ tenantId: tenantId!, provider, apiKey: apiKey.trim() });
      setTested(Boolean(res.success));
      if (res.success) toast.success('API key is valid');
      else toast.error(res.message || 'Key validation failed');
    } catch (err: any) {
      setTested(false);
      toast.error(err?.response?.data?.message || 'Key validation failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (disabled) return;
    setSaving(true);
    try {
      await enableByok({ tenantId: tenantId!, provider, apiKey: apiKey.trim() });
      toast.success('Your API key is now active');
      setApiKey('');
      setTested(null);
      byok.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not enable BYOK');
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await disableByok(tenantId);
      toast.success('Switched back to NetTwin-managed AI');
      byok.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not disable BYOK');
    } finally {
      setSaving(false);
    }
  };

  if (!tenantId) {
    return (
      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-6 text-sm text-slate-400">
        Create your digital twin first to connect your own API key.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-300">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Provide your API key</h2>
          <p className="mt-1 text-sm text-slate-400">
            Bring your own LLM key — you pay your provider directly and aren&apos;t
            billed for AI by NetTwin. Keys are validated and stored encrypted.
          </p>
        </div>
      </div>

      {byok.isByok && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-200">
            BYOK active — {PROVIDERS.find((p) => p.value === byok.provider)?.label || byok.provider}
            {byok.keyActive ? ' (key active)' : ''}
          </span>
          <button
            onClick={handleDisable}
            disabled={saving}
            className="ml-auto rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Switch back to platform AI
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-[180px_1fr]">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => { setProvider(e.target.value); setTested(null); }}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
            {byok.isByok ? 'Update API key' : 'API key'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTested(null); }}
              placeholder="Paste your API key"
              autoComplete="off"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
            {tested === true && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
            {tested === false && <XCircle className="h-5 w-5 shrink-0 text-red-400" />}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={handleTest}
          disabled={disabled || testing}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        >
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          Validate key
        </button>
        <button
          onClick={handleSave}
          disabled={disabled || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {byok.isByok ? 'Update key' : 'Enable BYOK'}
        </button>
      </div>
    </div>
  );
};

export default ByokKeyCard;
