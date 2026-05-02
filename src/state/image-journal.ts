export interface JournalStorageBasic {
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

export interface JournalStorage extends JournalStorageBasic {
  list(prefix: string, userId?: string): Promise<readonly string[]>;
}

const JOURNAL_DIR = 'lumirealm/image_journal';
const SCHEMA_VERSION = 1;

export type ImageJournalStatus = 'active' | 'pending_delete';

export interface ImageJournalFile {
  schema_version: 1;
  characterId: string;
  imageIds: readonly string[];
  status: ImageJournalStatus;
  updated_at: number;
}

function journalPath(characterId: string): string {
  return `${JOURNAL_DIR}/${characterId}.json`;
}

function isJournalFile(v: unknown): v is ImageJournalFile {
  if (!v || typeof v !== 'object') return false;
  const f = v as Partial<ImageJournalFile>;
  return (
    f.schema_version === SCHEMA_VERSION &&
    typeof f.characterId === 'string' &&
    Array.isArray(f.imageIds) &&
    (f.status === 'active' || f.status === 'pending_delete')
  );
}

function userIdOpts(userId: string | undefined): { userId?: string } {
  return userId !== undefined ? { userId } : {};
}

async function writeJournalFile(
  storage: JournalStorageBasic,
  userId: string | undefined,
  file: ImageJournalFile,
): Promise<void> {
  await storage.setJson(journalPath(file.characterId), file, userIdOpts(userId));
}

export async function readImageJournalFile(
  storage: JournalStorageBasic,
  userId: string | undefined,
  characterId: string,
): Promise<ImageJournalFile | null> {
  const file = await storage.getJson<ImageJournalFile | null>(
    journalPath(characterId),
    { fallback: null, ...userIdOpts(userId) },
  );
  return isJournalFile(file) ? file : null;
}

export async function readImageJournalIds(
  storage: JournalStorageBasic,
  userId: string | undefined,
  characterId: string,
): Promise<readonly string[]> {
  const file = await readImageJournalFile(storage, userId, characterId);
  if (!file) return [];
  return file.imageIds.filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export async function appendImageIdsToJournal(
  storage: JournalStorageBasic,
  userId: string | undefined,
  characterId: string,
  newIds: readonly string[],
): Promise<void> {
  const cleanIds = newIds.filter((id) => typeof id === 'string' && id.length > 0);
  if (cleanIds.length === 0) return;
  const existing = await readImageJournalFile(storage, userId, characterId);
  if (existing && existing.status === 'pending_delete') {
    return;
  }
  const curIds = existing ? existing.imageIds : [];
  const merged = Array.from(new Set([...curIds, ...cleanIds]));
  if (existing && merged.length === curIds.length) return;
  await writeJournalFile(storage, userId, {
    schema_version: SCHEMA_VERSION,
    characterId,
    imageIds: merged,
    status: 'active',
    updated_at: Date.now(),
  });
}

export async function markJournalPendingDelete(
  storage: JournalStorageBasic,
  userId: string | undefined,
  characterId: string,
): Promise<readonly string[]> {
  const existing = await readImageJournalFile(storage, userId, characterId);
  if (!existing) return [];
  if (existing.status === 'pending_delete') return existing.imageIds;
  await writeJournalFile(storage, userId, {
    ...existing,
    status: 'pending_delete',
    updated_at: Date.now(),
  });
  return existing.imageIds;
}

export async function clearImageJournal(
  storage: JournalStorageBasic,
  userId: string | undefined,
  characterId: string,
): Promise<void> {
  try {
    await storage.delete(journalPath(characterId), userId);
  } catch {
    // Already gone, same outcome.
  }
}

export async function listImageJournalCharacterIds(
  storage: JournalStorage,
  userId: string | undefined,
): Promise<readonly string[]> {
  let names: readonly string[];
  try {
    names = await storage.list(JOURNAL_DIR, userId);
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const name of names) {
    if (!name.endsWith('.json')) continue;
    out.push(name.replace(/\.json$/i, ''));
  }
  return out;
}
