// Per-version module migration registry. Steps walked sequentially, persist
// after each apply for resumability.

import type { ModuleEnvelope } from './modules-store.js';

export interface ModuleMigrationDeps {
  // syncWorldBook re-runs lorebook projection and rewrites the world_book in place.
  syncWorldBook: (env: ModuleEnvelope) => Promise<string | null>;
  reinstallArtifactsForAttached: (moduleId: string) => Promise<number>;
  writeEnvelope: (env: ModuleEnvelope) => Promise<void>;
  log: {
    info: (s: string) => void;
    warn: (s: string) => void;
    error: (s: string) => void;
  };
}

export interface ModuleMigrationStepArgs {
  readonly env: ModuleEnvelope;
}

export interface ModuleMigrationStepResult {
  readonly nextEnv: ModuleEnvelope;
  readonly notes: readonly string[];
}

export interface ModuleMigrationStep {
  readonly version: number;
  readonly description: string;
  readonly touches: readonly (
    | 'world_book_entries'
    | 'regex_scripts_attached_chars'
    | 'asset_index'
    | 'envelope_metadata'
  )[];
  readonly apply: (
    args: ModuleMigrationStepArgs,
    deps: ModuleMigrationDeps,
  ) => Promise<ModuleMigrationStepResult>;
}

export type ModuleMigrationResult =
  | { kind: 'noop'; storedVersion: number }
  | {
      kind: 'migrated';
      moduleId: string;
      from: number;
      to: number;
      stepsApplied: ReadonlyArray<{ version: number; notes: readonly string[] }>;
    }
  | { kind: 'failed'; moduleId: string; from: number; to: number; error: string; partialAt?: number };

// No module-side data changes warrant a migration step yet.
export const MODULE_MIGRATIONS: readonly ModuleMigrationStep[] = [];

// Bumping requires writing a step or the walker silently no-ops.
export const CURRENT_MODULE_SCHEMA_VERSION: number =
  MODULE_MIGRATIONS.length > 0
    ? Math.max(...MODULE_MIGRATIONS.map((m) => m.version))
    : 4;

export async function migrateModuleIfNeeded(
  env: ModuleEnvelope,
  deps: ModuleMigrationDeps,
): Promise<ModuleMigrationResult> {
  const stored = env.translator_schema_version ?? 1;
  const target = CURRENT_MODULE_SCHEMA_VERSION;
  if (stored >= target) return { kind: 'noop', storedVersion: stored };

  const pending = MODULE_MIGRATIONS.filter(
    (m) => m.version > stored && m.version <= target,
  );

  let current = env;
  const stepsApplied: { version: number; notes: readonly string[] }[] = [];
  const t0 = Date.now();

  for (const step of pending) {
    try {
      const result = await step.apply({ env: current }, deps);
      const stamped: ModuleEnvelope = {
        ...result.nextEnv,
        translator_schema_version: step.version,
      };
      await deps.writeEnvelope(stamped);
      current = stamped;
      stepsApplied.push({ version: step.version, notes: result.notes });
      deps.log.info(
        `migrate-module(${env.id}): step v${step.version} done , ${result.notes.join(', ')}`,
      );
    } catch (err) {
      const errStr = err instanceof Error ? err.message : String(err);
      deps.log.error(
        `migrate-module(${env.id}): step v${step.version} FAILED: ${errStr}`,
      );
      return {
        kind: 'failed',
        moduleId: env.id,
        from: stored,
        to: target,
        error: errStr,
        partialAt: stepsApplied.length > 0
          ? stepsApplied[stepsApplied.length - 1]!.version
          : stored,
      };
    }
  }

  if (stepsApplied.length === 0 && stored < target) {
    const stamped: ModuleEnvelope = { ...current, translator_schema_version: target };
    await deps.writeEnvelope(stamped);
  }

  deps.log.info(
    `migrate-module(${env.id}): v${stored}->v${target} done ` +
      `steps=[${stepsApplied.map((s) => `v${s.version}`).join(',')}] ` +
      `elapsed=${Date.now() - t0}ms`,
  );
  return { kind: 'migrated', moduleId: env.id, from: stored, to: target, stepsApplied };
}
