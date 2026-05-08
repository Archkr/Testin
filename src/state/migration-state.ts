// Two-domain sweep markers for the translator-schema mass migrations.
// Legacy single-marker files are read as modules-only.

export const MIGRATION_STATE_PATH = 'lumirealm/migration-state.json';

export interface MigrationState {
  readonly schema_version: 1;
  readonly last_swept_modules: number;
  readonly last_swept_characters: number;
}

export const EMPTY_MIGRATION_STATE: MigrationState = {
  schema_version: 1,
  last_swept_modules: 0,
  last_swept_characters: 0,
};

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

export function parseMigrationState(raw: unknown): MigrationState {
  if (!raw || typeof raw !== 'object') return EMPTY_MIGRATION_STATE;
  const obj = raw as {
    schema_version?: unknown;
    last_swept_modules?: unknown;
    last_swept_characters?: unknown;
    last_swept_translator_version?: unknown;
  };
  if (obj.schema_version !== 1) return EMPTY_MIGRATION_STATE;
  const legacy =
    typeof obj.last_swept_translator_version === 'number'
      ? obj.last_swept_translator_version
      : 0;
  return {
    schema_version: 1,
    last_swept_modules:
      typeof obj.last_swept_modules === 'number' ? obj.last_swept_modules : legacy,
    last_swept_characters:
      typeof obj.last_swept_characters === 'number' ? obj.last_swept_characters : 0,
  };
}

export async function readMigrationState(
  storage: UserStorageLike,
  userId: string,
): Promise<MigrationState> {
  try {
    const raw = await storage.getJson<unknown>(MIGRATION_STATE_PATH, { userId });
    return parseMigrationState(raw);
  } catch {
    return EMPTY_MIGRATION_STATE;
  }
}

export async function writeMigrationState(
  storage: UserStorageLike,
  userId: string,
  state: MigrationState,
): Promise<void> {
  const out: MigrationState = {
    schema_version: 1,
    last_swept_modules: state.last_swept_modules,
    last_swept_characters: state.last_swept_characters,
  };
  await storage.setJson(MIGRATION_STATE_PATH, out, { indent: 2, userId });
}
