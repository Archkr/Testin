// Pure decision helper: seeds Lumi `authors_note` from CCSv3 `depth_prompt` on first chat-open.
// Seeds once via a metadata flag; user owns the slot afterwards.

export interface DepthPromptSeedDecision {
  /** False = caller skips the metadata IPC write. */
  readonly shouldWrite: boolean;
  readonly nextMetadata: Readonly<Record<string, unknown>>;
  /** True when a pre-existing `authors_note.content` was preserved. */
  readonly preservedExisting: boolean;
  readonly outcome: 'already_seeded' | 'no_depth_prompt' | 'seeded';
}

export function computeDepthPromptSeed(
  characterExtensions: Readonly<Record<string, unknown>>,
  currentMetadata: Readonly<Record<string, unknown>> | null | undefined,
): DepthPromptSeedDecision {
  const meta: Record<string, unknown> = currentMetadata && typeof currentMetadata === 'object'
    ? { ...currentMetadata }
    : {};

  if (meta['_lumirealm_authors_note_seeded'] === true) {
    return { shouldWrite: false, nextMetadata: meta, preservedExisting: false, outcome: 'already_seeded' };
  }

  const dp = characterExtensions['depth_prompt'];
  if (!dp || typeof dp !== 'object' || Array.isArray(dp)) {
    return { shouldWrite: false, nextMetadata: meta, preservedExisting: false, outcome: 'no_depth_prompt' };
  }
  const obj = dp as Record<string, unknown>;
  const prompt = typeof obj['prompt'] === 'string' ? (obj['prompt'] as string) : '';
  if (!prompt.trim()) {
    return { shouldWrite: false, nextMetadata: meta, preservedExisting: false, outcome: 'no_depth_prompt' };
  }

  const depth = typeof obj['depth'] === 'number' && Number.isFinite(obj['depth'])
    ? Math.max(0, Math.floor(obj['depth'] as number))
    : 4;
  const rawRole = typeof obj['role'] === 'string' ? (obj['role'] as string) : 'system';
  const role: 'system' | 'user' | 'assistant' =
    rawRole === 'user' || rawRole === 'assistant' ? rawRole : 'system';

  meta['_lumirealm_authors_note_seeded'] = true;
  const existing = meta['authors_note'];
  const hasExisting = !!existing && typeof existing === 'object' && !Array.isArray(existing) &&
    typeof (existing as Record<string, unknown>)['content'] === 'string' &&
    ((existing as Record<string, unknown>)['content'] as string).trim().length > 0;
  if (!hasExisting) {
    meta['authors_note'] = { content: prompt, depth, role, position: 0 };
  }

  return {
    shouldWrite: true,
    nextMetadata: meta,
    preservedExisting: hasExisting,
    outcome: 'seeded',
  };
}
