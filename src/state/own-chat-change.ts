// Per-chat counter for own `spindle.chats.update` writes.
// CHAT_CHANGED handler decrements and skips refresh when > 0; refreshes on 0 (external write).
// Imprecise on interleaved writes; both over/under-count recover on the next tick.

const expecting = new Map<string, number>();

export function expectChatChange(chatId: string): void {
  expecting.set(chatId, (expecting.get(chatId) ?? 0) + 1);
}

export function consumeOwnChatChange(chatId: string): boolean {
  const n = expecting.get(chatId) ?? 0;
  if (n <= 0) {
    expecting.delete(chatId);
    return false;
  }
  if (n === 1) expecting.delete(chatId);
  else expecting.set(chatId, n - 1);
  return true;
}

/** Test hook - wipe all counters. */
export function resetOwnChatChangeTracking(): void {
  expecting.clear();
}

/** Diagnostic only — current pending count for a chat. */
export function pendingOwnChatChanges(chatId: string): number {
  return expecting.get(chatId) ?? 0;
}
