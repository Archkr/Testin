// Converts camelCase sampler keys to snake_case wire format.
// Returns null when nothing is set so callers can omit `parameters` entirely.
// SAMPLER_WIRE_KEYS is exhaustively typed against AuxSamplerOverrides;
// adding a field without a wire entry is a compile error.

import { SAMPLER_KEYS, type AuxSamplerOverrides } from '../state/settings-store.js';

const SAMPLER_WIRE_KEYS: Readonly<Record<keyof AuxSamplerOverrides, string>> = {
  temperature: 'temperature',
  maxTokens: 'max_tokens',
  contextSize: 'max_context_length',
  topP: 'top_p',
  minP: 'min_p',
  topK: 'top_k',
  frequencyPenalty: 'frequency_penalty',
  presencePenalty: 'presence_penalty',
  repetitionPenalty: 'repetition_penalty',
};

export function samplersToWire(
  samplers: AuxSamplerOverrides | null | undefined,
): Record<string, number> | null {
  if (!samplers) return null;
  const out: Record<string, number> = {};
  for (const k of SAMPLER_KEYS) {
    const v = samplers[k];
    if (v !== null) out[SAMPLER_WIRE_KEYS[k]] = v;
  }
  return Object.keys(out).length === 0 ? null : out;
}

const ALL_SAMPLER_WIRE_KEYS: ReadonlySet<string> = new Set(Object.values(SAMPLER_WIRE_KEYS));

const BASE_SAMPLER_KEYS: ReadonlySet<string> = new Set([
  'temperature', 'max_tokens', 'max_context_length', 'top_p', 'top_k',
]);

function allowedSamplerKeysForProvider(provider: string | undefined): ReadonlySet<string> {
  const p = (provider ?? '').toLowerCase();
  if (p === 'anthropic' || p === 'google' || p === 'google-vertex' || p === 'vertex') {
    return BASE_SAMPLER_KEYS;
  }
  const out = new Set(BASE_SAMPLER_KEYS);
  out.add('frequency_penalty');
  out.add('presence_penalty');
  if (p !== 'openai') {
    out.add('min_p');
    out.add('repetition_penalty');
  }
  return out;
}

export function filterSamplerParamsForProvider(
  parameters: Record<string, unknown>,
  provider: string | undefined,
): Record<string, unknown> {
  const allowed = allowedSamplerKeysForProvider(provider);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parameters)) {
    if (ALL_SAMPLER_WIRE_KEYS.has(k) && !allowed.has(k)) continue;
    out[k] = v;
  }
  return out;
}
