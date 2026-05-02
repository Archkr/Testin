// Persists trigger variables to chat.metadata.macro_variables.local.
// Risu uses chat.scriptstate['$'+key]; we mirror to macro_variables.local so Lumi's
// native {{getvar}} reads from the same store.

import { toStr } from '../../util/coerce.js';
import type { HostApi } from '../host.js';

export const META_ROOT = 'macro_variables';
export const META_SUB = 'local';

export async function loadVars(api: HostApi): Promise<Record<string, string>> {
  try {
    const raw = await api.chat.getMetadata(META_ROOT);
    if (!raw || typeof raw !== 'object') return {};
    const localMap = (raw as { local?: unknown }).local;
    if (!localMap || typeof localMap !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(localMap as Record<string, unknown>)) {
      out['$' + k] = toStr(v);
    }
    return out;
  } catch {
    return {};
  }
}

export async function saveVars(api: HostApi, vars: Record<string, string>): Promise<void> {
  try {
    const existing = await api.chat.getMetadata(META_ROOT);
    const base: Record<string, unknown> = (existing && typeof existing === 'object')
      ? { ...(existing as Record<string, unknown>) }
      : {};
    const bareLocal: Record<string, string> = {};
    for (const [k, v] of Object.entries(vars)) {
      const bare = k.startsWith('$') ? k.slice(1) : k;
      bareLocal[bare] = v;
    }
    base[META_SUB] = bareLocal;
    await api.chat.setMetadata(META_ROOT, base);
  } catch { /* ignore — chat-metadata write may not be permitted */ }
}
