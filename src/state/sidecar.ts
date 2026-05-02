// Stores raw CBS source for resolved messages so re-resolve on state-ticks works.
// `chat_messages.content` is authoritative for display; sidecar is write-only from display's POV.
// `userEdited === true` blocks re-resolve overwriting user changes. Persisted across worker restarts.

declare const spindle: import('lumiverse-spindle-types').SpindleAPI | undefined;

import type { UserStorageLike } from '../payload/installer.js';

export interface SidecarMsg {
  /** Raw CBS source (what we stashed at first ingestion). */
  readonly rawContent: string;
  /** User-edited via Lumi UI — re-resolve must not overwrite. */
  readonly userEdited: boolean;
}

export interface ChatSidecar {
  readonly schema_version: 1;
  readonly chat_id: string;
  readonly msgs: Record<string, SidecarMsg>;
}

const SIDECAR_PREFIX = 'lumirealm/chats/';

export function sidecarPath(chatId: string): string {
  return `${SIDECAR_PREFIX}${chatId}.json`;
}

function logInfo(msg: string): void {
  try { spindle?.log?.info?.(`[lumirealm] sidecar: ${msg}`); } catch { /* ignore */ }
}
function logWarn(msg: string): void {
  try { spindle?.log?.warn?.(`[lumirealm] sidecar: ${msg}`); } catch { /* ignore */ }
}

function emptySidecar(chatId: string): ChatSidecar {
  return { schema_version: 1, chat_id: chatId, msgs: {} };
}

function isSidecar(v: unknown, chatId: string): v is ChatSidecar {
  if (typeof v !== 'object' || v === null) return false;
  const rec = v as { schema_version?: unknown; chat_id?: unknown; msgs?: unknown };
  if (rec.schema_version !== 1) return false;
  if (typeof rec.chat_id !== 'string' || rec.chat_id !== chatId) return false;
  if (typeof rec.msgs !== 'object' || rec.msgs === null) return false;
  return true;
}

export function containsCbs(s: string): boolean {
  return s.indexOf('{{') >= 0;
}

export async function readSidecar(
  storage: UserStorageLike,
  chatId: string,
  userId: string | undefined,
): Promise<ChatSidecar> {
  const path = sidecarPath(chatId);
  const fallback = emptySidecar(chatId);
  try {
    const raw = await storage.getJson<ChatSidecar>(
      path,
      userId === undefined ? { fallback } : { fallback, userId },
    );
    if (isSidecar(raw, chatId)) return raw;
    return fallback; // fallback returned or shape unrecognised
  } catch (err) {
    logWarn(`read ${path} failed (${err instanceof Error ? err.message : String(err)}) — returning empty`);
    return fallback;
  }
}

export async function writeSidecar(
  storage: UserStorageLike,
  sidecar: ChatSidecar,
  userId: string | undefined,
): Promise<void> {
  await storage.setJson(sidecarPath(sidecar.chat_id), sidecar, { userId });
}

/**
 * Insert/update sidecar entries in one round-trip. Used by CHAT_CHANGED
 * catch-up + MESSAGE_SENT ingestion. Preserves `userEdited=true` flags on
 * existing entries (never downgraded by a re-stash).
 */
export async function trackMessagesBatch(
  storage: UserStorageLike,
  chatId: string,
  entries: readonly { msgId: string; rawContent: string }[],
  userId: string | undefined,
): Promise<ChatSidecar> {
  const current = await readSidecar(storage, chatId, userId);
  if (entries.length === 0) return current;
  const msgs = { ...current.msgs };
  let changed = 0;
  for (const { msgId, rawContent } of entries) {
    const existing = msgs[msgId];
    // Never drop userEdited. Skip identical raw to avoid a storage round-trip.
    if (existing?.userEdited) continue;
    if (existing?.rawContent === rawContent) continue;
    msgs[msgId] = { rawContent, userEdited: false };
    changed += 1;
  }
  if (changed === 0) return current;
  const updated: ChatSidecar = { schema_version: 1, chat_id: chatId, msgs };
  await writeSidecar(storage, updated, userId);
  logInfo(`trackMessagesBatch chat=${chatId} wrote=${changed} total_tracked=${Object.keys(msgs).length}`);
  return updated;
}

/**
 * Mark a tracked message as user-edited. Idempotent. If the message
 * wasn't tracked (user edit of a non-CBS message, say), no-op.
 */
export async function markUserEdited(
  storage: UserStorageLike,
  chatId: string,
  msgId: string,
  userId: string | undefined,
): Promise<boolean> {
  const current = await readSidecar(storage, chatId, userId);
  const existing = current.msgs[msgId];
  if (!existing) return false;
  if (existing.userEdited) return false;
  const updated: ChatSidecar = {
    schema_version: 1,
    chat_id: chatId,
    msgs: { ...current.msgs, [msgId]: { ...existing, userEdited: true } },
  };
  await writeSidecar(storage, updated, userId);
  logInfo(`markUserEdited chat=${chatId} msg=${msgId}`);
  return true;
}

export async function setSidecarRaw(
  storage: UserStorageLike,
  chatId: string,
  msgId: string,
  rawContent: string,
  userId: string | undefined,
): Promise<boolean> {
  const current = await readSidecar(storage, chatId, userId);
  const existing = current.msgs[msgId];
  if (existing && existing.rawContent === rawContent && !existing.userEdited) {
    return false;
  }
  const updated: ChatSidecar = {
    schema_version: 1,
    chat_id: chatId,
    msgs: { ...current.msgs, [msgId]: { rawContent, userEdited: false } },
  };
  await writeSidecar(storage, updated, userId);
  logInfo(`setSidecarRaw chat=${chatId} msg=${msgId} content_len=${rawContent.length} cleared_userEdited=${existing?.userEdited === true}`);
  return true;
}

/** Chat deleted → drop the sidecar. Idempotent. */
export async function clearSidecar(
  storage: UserStorageLike,
  chatId: string,
  userId: string | undefined,
): Promise<void> {
  try {
    await storage.delete(sidecarPath(chatId), userId);
    logInfo(`clearSidecar chat=${chatId}`);
  } catch (err) {
    logWarn(`clearSidecar chat=${chatId} swallowed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
