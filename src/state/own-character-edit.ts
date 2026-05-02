// Per-character counter for own `spindle.characters.update` writes.
// CHARACTER_EDITED handler decrements and skips invalidate when > 0;
// refreshes on 0 (external write). Same pattern as own-chat-change.ts.
// Imprecise on interleaved writes; both over/under-count recover on the next tick.

const expecting = new Map<string, number>();

export function expectCharacterEdit(characterId: string): void {
  expecting.set(characterId, (expecting.get(characterId) ?? 0) + 1);
}

export function consumeOwnCharacterEdit(characterId: string): boolean {
  const n = expecting.get(characterId) ?? 0;
  if (n <= 0) {
    expecting.delete(characterId);
    return false;
  }
  if (n === 1) expecting.delete(characterId);
  else expecting.set(characterId, n - 1);
  return true;
}

/** Test hook - wipe all counters. */
export function resetOwnCharacterEditTracking(): void {
  expecting.clear();
}

/** Diagnostic only — current pending count for a character. */
export function pendingOwnCharacterEdits(characterId: string): number {
  return expecting.get(characterId) ?? 0;
}
