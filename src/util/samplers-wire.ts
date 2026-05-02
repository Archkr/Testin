// Converts camelCase sampler keys to snake_case wire format.
// Returns null when nothing is set so callers can omit `parameters` entirely.
// SAMPLER_WIRE_KEYS is exhaustively typed against AuxSamplerOverrides;
// adding a field without a wire entry is a compile error.

import { SAMPLER_KEYS, type AuxSamplerOverrides } from '../state/settings-store.js';

const SAMPLER_WIRE_KEYS: Readonly<Record<keyof AuxSamplerOverrides, string>> = {
  temperature: 'temperature',
  maxTokens: 'max_tokens',
  contextSize: 'context_size',
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
