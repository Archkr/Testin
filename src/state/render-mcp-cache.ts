// Render-MCP no-op cache.
//
// Lumi's `useDisplayRegex` hook bumps a global `displayRegexCacheVersion`
// counter on every CHAT_CHANGED / MESSAGE_* event and re-issues
// `/api/v1/chats/:id/display-preprocess` for every visible bubble. There's
// no batching, no abort, and no per-message gating, so a Cheongwon-grade
// chat with 30 visible messages and a 65 KB editDisplay Lua hook burns
// 50+ seconds of CPU on identical-input → identical-output chains during
// a single streaming session (see `local/docs/architecture.md` §3.35).
//
// Until Lumi gains FE-side abort + per-message cache keying, mitigate
// extension-side: cache the editDisplay chain's result keyed by
// (chatId, msgId, fnv1a(content)). On cv-bump-driven re-issue with the
// same content, we replay the cached result without re-spinning fengari.
//
// Invalidated explicitly on CHAT_CHANGED / MESSAGE_* / CHAT_DELETED so a
// var change that doesn't touch raw content (Lua reads `getChatVar` and
// branches inside the hook) still re-runs the chain. The content-hash
// component handles the common content-edited case directly.
//
// LRU + TTL match the `recent-writes.ts` shape so the eviction code is
// familiar and already exercised. Numbers picked to comfortably hold one
// active chat's worth of bubbles plus a few previously-visited chats.

import { makeSafeLogger } from '../util/safe-log.js';

const log = makeSafeLogger('render-mcp-cache');

const TTL_MS = 5_000;
const MAX_ENTRIES = 500;

type RenderResult =
  | { kind: 'noop' }
  | { kind: 'transformed'; content: string };

interface CacheEntry {
  readonly contentHash: number;
  readonly contentLen: number;
  readonly result: RenderResult;
  readonly ts: number;
}

const cache = new Map<string, CacheEntry>();
let hitCount = 0;
let missCount = 0;

function key(chatId: string, msgId: string): string {
  return `${chatId}::${msgId}`;
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

function evictIfNeeded(now: number): void {
  if (cache.size < MAX_ENTRIES) return;
  for (const [k, v] of cache) {
    if (now - v.ts > TTL_MS) cache.delete(k);
  }
  if (cache.size < MAX_ENTRIES) return;
  let oldestKey: string | null = null;
  let oldestTs = Infinity;
  for (const [k, v] of cache) {
    if (v.ts < oldestTs) {
      oldestTs = v.ts;
      oldestKey = k;
    }
  }
  if (oldestKey) cache.delete(oldestKey);
}

/** Look up a cached render-MCP result. Returns the cached result on a
 *  fresh content-hash match, or `null` to indicate the caller should run
 *  the editDisplay chain and call `cacheRenderMcp` after. */
export function lookupRenderMcp(
  chatId: string,
  msgId: string,
  content: string,
): RenderResult | null {
  const entry = cache.get(key(chatId, msgId));
  if (!entry) {
    missCount += 1;
    return null;
  }
  const now = Date.now();
  if (now - entry.ts > TTL_MS) {
    cache.delete(key(chatId, msgId));
    missCount += 1;
    return null;
  }
  if (entry.contentLen !== content.length) {
    missCount += 1;
    return null;
  }
  if (entry.contentHash !== fnv1a(content)) {
    missCount += 1;
    return null;
  }
  hitCount += 1;
  return entry.result;
}

export function cacheRenderMcp(
  chatId: string,
  msgId: string,
  content: string,
  result: RenderResult,
): void {
  const now = Date.now();
  evictIfNeeded(now);
  cache.set(key(chatId, msgId), {
    contentHash: fnv1a(content),
    contentLen: content.length,
    result,
    ts: now,
  });
}

/** Invalidate every entry for a chat. Wired into CHAT_CHANGED /
 *  CHAT_DELETED so a chat-state mutation invisible to the content hash
 *  (e.g. Lua reads `getChatVar` inside the hook) still re-runs the
 *  chain. */
export function invalidateRenderMcpForChat(chatId: string): void {
  const prefix = `${chatId}::`;
  let removed = 0;
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) {
      cache.delete(k);
      removed += 1;
    }
  }
  if (removed > 0) log.info(`invalidate chat=${chatId} entries=${removed}`);
}

/** Invalidate one specific (chatId, msgId) entry. Wired into MESSAGE_*
 *  so a per-message edit / swipe / delete drops only that bubble's
 *  cache entry without taking down the rest of the chat. */
export function invalidateRenderMcpForMessage(chatId: string, msgId: string): void {
  const k = key(chatId, msgId);
  if (cache.delete(k)) log.info(`invalidate chat=${chatId} msg=${msgId}`);
}

/** Test hook + diagnostic. */
export function resetRenderMcpCache(): void {
  cache.clear();
  hitCount = 0;
  missCount = 0;
}

export function renderMcpCacheStats(): { size: number; hits: number; misses: number } {
  return { size: cache.size, hits: hitCount, misses: missCount };
}

export const RENDER_MCP_CACHE_TTL_MS = TTL_MS;
export const RENDER_MCP_CACHE_MAX = MAX_ENTRIES;
