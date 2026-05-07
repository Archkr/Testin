// Lazy migration runner for module envelopes. Fires once per module per worker
// boot when env.translator_schema_version trails the current build.

import { CURRENT_TRANSLATOR_SCHEMA_VERSION } from '../core/payload/types.js';
import type { ModuleEnvelope } from './modules-store.js';

export type ModuleMigrationResult =
  | { kind: 'noop'; storedVersion: number }
  | {
      kind: 'migrated';
      moduleId: string;
      from: number;
      to: number;
      worldBookId: string | null;
      regexReinstalledChars: number;
    }
  | { kind: 'failed'; moduleId: string; from: number; to: number; error: string };

export interface ModuleMigrationDeps {
  // syncWorldBook re-runs the lorebook projection from raw env.module.lorebook
  // and rewrites the existing world_book in place. dispatchModuleArtifactInstall
  // only handles regex_scripts, so this is the only path that refreshes wb entries.
  syncWorldBook: (env: ModuleEnvelope) => Promise<string | null>;
  reinstallArtifactsForAttached: (moduleId: string) => Promise<number>;
  writeEnvelope: (env: ModuleEnvelope) => Promise<void>;
  log: {
    info: (s: string) => void;
    warn: (s: string) => void;
    error: (s: string) => void;
  };
}

export async function migrateModuleIfNeeded(
  env: ModuleEnvelope,
  deps: ModuleMigrationDeps,
): Promise<ModuleMigrationResult> {
  const stored = env.translator_schema_version ?? 1;
  const target = CURRENT_TRANSLATOR_SCHEMA_VERSION;
  if (stored >= target) return { kind: 'noop', storedVersion: stored };

  try {
    const t0 = Date.now();
    const wbId = await deps.syncWorldBook(env);
    const charCount = await deps.reinstallArtifactsForAttached(env.id);
    const next: ModuleEnvelope = {
      ...env,
      ...(wbId ? { installed_world_book_id: wbId } : {}),
      translator_schema_version: target,
    };
    await deps.writeEnvelope(next);
    deps.log.info(
      `migrate-module(${env.id}): v${stored}->v${target} ` +
        `wb=${wbId ?? 'none'} chars_refreshed=${charCount} ` +
        `elapsed=${Date.now() - t0}ms`,
    );
    return {
      kind: 'migrated',
      moduleId: env.id,
      from: stored,
      to: target,
      worldBookId: wbId,
      regexReinstalledChars: charCount,
    };
  } catch (err) {
    const errStr = err instanceof Error ? err.message : String(err);
    deps.log.error(
      `migrate-module(${env.id}): v${stored}->v${target} FAILED: ${errStr}`,
    );
    return { kind: 'failed', moduleId: env.id, from: stored, to: target, error: errStr };
  }
}
