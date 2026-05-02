declare const spindle: import('lumiverse-spindle-types').SpindleAPI | undefined;

import { cardStoragePath, type StoredRisuCard } from './types.js';

export interface UserStorageLike {
  getJson<T>(
    path: string,
    opts?: { fallback?: T; userId?: string | undefined },
  ): Promise<T>;
  setJson(
    path: string,
    value: unknown,
    opts?: { userId?: string | undefined },
  ): Promise<void>;
  delete(path: string, userId?: string): Promise<void>;
}

// No-op when spindle is absent (unit tests); logs in the live extension.
function logInfo(msg: string): void {
  try { spindle?.log?.info?.(`[lumirealm] ${msg}`); } catch { /* ignore */ }
}
function logWarn(msg: string): void {
  try { spindle?.log?.warn?.(`[lumirealm] ${msg}`); } catch { /* ignore */ }
}

export async function saveCard(
  storage: UserStorageLike,
  card: StoredRisuCard,
  userId: string | undefined,
): Promise<void> {
  const path = cardStoragePath(card.character_id);
  const t0 = Date.now();
  logInfo(`saveCard: start path=${path} userId=${userId ?? '<none>'} schema=${card.schema_version}`);
  await storage.setJson(path, card, { userId });
  logInfo(`saveCard: done path=${path} elapsed=${Date.now() - t0}ms`);
}

export async function loadCard(
  storage: UserStorageLike,
  characterId: string,
  userId: string | undefined,
): Promise<StoredRisuCard | null> {
  const path = cardStoragePath(characterId);
  logInfo(`loadCard: start path=${path} userId=${userId ?? '<none>'}`);
  const empty = {} as StoredRisuCard;
  const raw = await storage.getJson<StoredRisuCard>(
    path,
    userId === undefined ? { fallback: empty } : { fallback: empty, userId },
  );
  const schemaVersion = (raw as { schema_version?: unknown })?.schema_version;
  if (!raw || schemaVersion !== 1) {
    logInfo(`loadCard: miss path=${path} schema_version=${String(schemaVersion)}`);
    return null;
  }
  logInfo(`loadCard: hit path=${path} characterId=${raw.character_id}`);
  return raw;
}

export async function deleteCard(
  storage: UserStorageLike,
  characterId: string,
  userId: string | undefined,
): Promise<void> {
  const path = cardStoragePath(characterId);
  logInfo(`deleteCard: start path=${path} userId=${userId ?? '<none>'}`);
  try {
    // Positional userId; options-object form silently dropped deletes on the host.
    await storage.delete(path, userId);
    logInfo(`deleteCard: done path=${path}`);
  } catch (err) {
    // Swallow; most common cause is "file didn't exist".
    logWarn(`deleteCard: swallowed error path=${path}: ${err instanceof Error ? err.message : String(err)}`);
  }
}
