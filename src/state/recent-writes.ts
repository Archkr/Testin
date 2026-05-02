// Content-hash cache to discriminate our own `updateMessage` writes from user edits.
// Metadata-marker approach rejected: Lumi worker-host.ts preserves
// `extra.spindle_metadata` across later updateMessage calls, making it row-scoped
// instead of event-scoped. Content-hash is one-shot.

import { makeSafeLogger } from '../util/safe-log.js';

const log = makeSafeLogger('recent-writes');

const TTL_MS = 60_000;
const MAX_ENTRIES = 100;
const RAPID_CONSUME_MS = 100;

interface RecentWrite {
  readonly content: string;
  readonly ts: number;
}

const cache = new Map<string, RecentWrite>();

function key(chatId: string, msgId: string): string {
  return `${chatId}::${msgId}`;
}

export function rememberOurWrite(chatId: string, msgId: string, content: string): void {
  const now = Date.now();
  if (cache.size >= MAX_ENTRIES) {
    for (const [k, v] of cache) {
      if (now - v.ts > TTL_MS) cache.delete(k);
    }
    // Still over cap? Drop the oldest by ts.
    if (cache.size >= MAX_ENTRIES) {
      let oldestKey: string | null = null;
      let oldestTs = Infinity;
      for (const [k, v] of cache) {
        if (v.ts < oldestTs) { oldestTs = v.ts; oldestKey = k; }
      }
      if (oldestKey) cache.delete(oldestKey);
    }
  }
  cache.set(key(chatId, msgId), { content, ts: now });
}

export function consumeIfOurWrite(chatId: string, msgId: string, content: string): boolean {
  const k = key(chatId, msgId);
  const entry = cache.get(k);
  if (!entry) return false;
  const elapsed = Date.now() - entry.ts;
  if (elapsed > TTL_MS) {
    cache.delete(k);
    return false;
  }
  if (entry.content !== content) return false;
  cache.delete(k); // one-shot
  // Late match may be a false positive (user retyped identical content within TTL).
  if (elapsed >= RAPID_CONSUME_MS) {
    log.info(
      `consumeIfOurWrite: late match chat=${chatId} msg=${msgId} elapsed=${elapsed}ms content_len=${content.length} ` +
        `— normal echoes are <${RAPID_CONSUME_MS}ms; if user reports a "my edit reverted" symptom soon after, suspect false-positive`,
    );
  }
  return true;
}

/** Test hook — wipe everything between unit tests. */
export function resetRecentWrites(): void {
  cache.clear();
}

/** Diagnostic — current entry count. */
export function recentWritesSize(): number {
  return cache.size;
}

// Test-only knobs exported for LRU+TTL spec verification.
export const RECENT_WRITES_TTL_MS = TTL_MS;
export const RECENT_WRITES_MAX = MAX_ENTRIES;
