// Collapses multiple `triggerlua` entries in `effect[]` into one at the first position.
// Appends if no `triggerlua` existed. Preserves ordering of other effect types.

export interface TriggerEffect {
  readonly type?: string;
  readonly code?: string;
  readonly [k: string]: unknown;
}

export interface TriggerWithEffects {
  readonly type?: unknown;
  readonly comment?: unknown;
  readonly effect?: readonly TriggerEffect[];
  readonly [k: string]: unknown;
}

export interface ReplaceTriggerLuaResult {
  readonly ok: boolean;
  /** When ok=true: the new trigger object with the replaced effect array. */
  readonly trigger?: TriggerWithEffects;
  readonly reason?: string;
}

export function replaceTriggerLua(
  triggerRaw: unknown,
  newCode: string,
): ReplaceTriggerLuaResult {
  if (!triggerRaw || typeof triggerRaw !== 'object') {
    return { ok: false, reason: 'trigger is not an object' };
  }
  const trigger = triggerRaw as TriggerWithEffects;
  const effects = Array.isArray(trigger.effect) ? trigger.effect : [];

  const code = newCode;
  const hasContent = code.length > 0;

  let replacedAtFirst = false;
  const next: TriggerEffect[] = [];
  for (const eff of effects) {
    if (!eff || typeof eff !== 'object') {
      next.push(eff);
      continue;
    }
    if (eff.type === 'triggerlua') {
      if (!replacedAtFirst && hasContent) {
        next.push({ ...eff, type: 'triggerlua', code });
        replacedAtFirst = true;
      }
      continue; // subsequent triggerluas dropped (collapsed)
    }
    next.push(eff);
  }
  if (!replacedAtFirst && hasContent) {
    next.push({ type: 'triggerlua', code }); // no prior triggerlua — append
  }

  return {
    ok: true,
    trigger: { ...trigger, effect: next },
  };
}

/**
 * Replace the lua of `triggers[index]` and return the new array.
 * Pure. Returns `ok: false` when index is OOB.
 */
export function replaceTriggerLuaInArray(
  triggers: readonly unknown[],
  index: number,
  newCode: string,
): { ok: boolean; triggers?: readonly unknown[]; reason?: string } {
  if (!Array.isArray(triggers)) return { ok: false, reason: 'triggers is not an array' };
  if (index < 0 || index >= triggers.length) {
    return { ok: false, reason: `trigger index ${index} out of range (0..${triggers.length - 1})` };
  }
  const r = replaceTriggerLua(triggers[index], newCode);
  if (!r.ok || !r.trigger) {
    return { ok: false, ...(r.reason ? { reason: r.reason } : {}) };
  }
  const next = [...triggers];
  next[index] = r.trigger;
  return { ok: true, triggers: next };
}

export function extractLuaForTrigger(triggerRaw: unknown): string {
  if (!triggerRaw || typeof triggerRaw !== 'object') return '';
  const trigger = triggerRaw as TriggerWithEffects;
  const effects = Array.isArray(trigger.effect) ? trigger.effect : [];
  const parts: string[] = [];
  for (const eff of effects) {
    if (eff && typeof eff === 'object' && eff.type === 'triggerlua' && typeof eff.code === 'string') {
      parts.push(eff.code);
    }
  }
  return parts.join('\n');
}
