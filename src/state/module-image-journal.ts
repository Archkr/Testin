import type {
  ImageJournalStatus,
  JournalStorage,
  JournalStorageBasic,
} from './image-journal.js';

const JOURNAL_DIR = 'lumirealm/module_image_journal';
const SCHEMA_VERSION = 1;

export interface ModuleImageJournalFile {
  schema_version: 1;
  moduleId: string;
  imageIds: readonly string[];
  status: ImageJournalStatus;
  updated_at: number;
}

function journalPath(moduleId: string): string {
  return `${JOURNAL_DIR}/${moduleId}.json`;
}

function isJournalFile(v: unknown): v is ModuleImageJournalFile {
  if (!v || typeof v !== 'object') return false;
  const f = v as Partial<ModuleImageJournalFile>;
  return (
    f.schema_version === SCHEMA_VERSION &&
    typeof f.moduleId === 'string' &&
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
  file: ModuleImageJournalFile,
): Promise<void> {
  await storage.setJson(journalPath(file.moduleId), file, userIdOpts(userId));
}

export async function readModuleImageJournalFile(
  storage: JournalStorageBasic,
  userId: string | undefined,
  moduleId: string,
): Promise<ModuleImageJournalFile | null> {
  const file = await storage.getJson<ModuleImageJournalFile | null>(
    journalPath(moduleId),
    { fallback: null, ...userIdOpts(userId) },
  );
  return isJournalFile(file) ? file : null;
}

export async function appendModuleImageIdsToJournal(
  storage: JournalStorageBasic,
  userId: string | undefined,
  moduleId: string,
  newIds: readonly string[],
): Promise<void> {
  const cleanIds = newIds.filter((id) => typeof id === 'string' && id.length > 0);
  if (cleanIds.length === 0) return;
  const existing = await readModuleImageJournalFile(storage, userId, moduleId);
  if (existing && existing.status === 'pending_delete') return;
  const curIds = existing ? existing.imageIds : [];
  const merged = Array.from(new Set([...curIds, ...cleanIds]));
  if (existing && merged.length === curIds.length) return;
  await writeJournalFile(storage, userId, {
    schema_version: SCHEMA_VERSION,
    moduleId,
    imageIds: merged,
    status: 'active',
    updated_at: Date.now(),
  });
}

export async function markModuleJournalPendingDelete(
  storage: JournalStorageBasic,
  userId: string | undefined,
  moduleId: string,
): Promise<readonly string[]> {
  const existing = await readModuleImageJournalFile(storage, userId, moduleId);
  if (!existing) return [];
  if (existing.status === 'pending_delete') return existing.imageIds;
  await writeJournalFile(storage, userId, {
    ...existing,
    status: 'pending_delete',
    updated_at: Date.now(),
  });
  return existing.imageIds;
}

export async function clearModuleImageJournal(
  storage: JournalStorageBasic,
  userId: string | undefined,
  moduleId: string,
): Promise<void> {
  try {
    await storage.delete(journalPath(moduleId), userId);
  } catch {
    // Already gone.
  }
}

export async function listModuleImageJournalIds(
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
