// Persistent per-user record of legacy-source-less characters we've already
// shown the re-import notice for. Survives worker reboots so the modal fires
// exactly once per character lifetime.

export const LEGACY_REIMPORT_WARNED_PATH = 'lumirealm/legacy-reimport-warned.json';

export interface LegacyReimportWarnedFile {
  readonly schema_version: 1;
  readonly character_ids: readonly string[];
}

export interface UserStorageLike {
  getJson<T = unknown>(
    path: string,
    options?: { fallback?: T; userId?: string },
  ): Promise<T>;
  setJson(
    path: string,
    value: unknown,
    options?: { indent?: number; userId?: string },
  ): Promise<void>;
}

export function parseLegacyReimportWarned(raw: unknown): ReadonlySet<string> {
  if (!raw || typeof raw !== 'object') return new Set();
  const obj = raw as { schema_version?: unknown; character_ids?: unknown };
  if (obj.schema_version !== 1) return new Set();
  if (!Array.isArray(obj.character_ids)) return new Set();
  return new Set(obj.character_ids.filter((x): x is string => typeof x === 'string'));
}

export async function readLegacyReimportWarned(
  storage: UserStorageLike,
  userId: string,
): Promise<ReadonlySet<string>> {
  try {
    const raw = await storage.getJson<unknown>(LEGACY_REIMPORT_WARNED_PATH, { userId });
    return parseLegacyReimportWarned(raw);
  } catch {
    return new Set();
  }
}

// Idempotent: if `characterId` is already in the set, the file is not rewritten.
export async function markLegacyReimportWarned(
  storage: UserStorageLike,
  userId: string,
  characterId: string,
): Promise<{ alreadyWarned: boolean }> {
  const existing = await readLegacyReimportWarned(storage, userId);
  if (existing.has(characterId)) return { alreadyWarned: true };
  const next: LegacyReimportWarnedFile = {
    schema_version: 1,
    character_ids: [...existing, characterId],
  };
  await storage.setJson(LEGACY_REIMPORT_WARNED_PATH, next, { indent: 2, userId });
  return { alreadyWarned: false };
}
