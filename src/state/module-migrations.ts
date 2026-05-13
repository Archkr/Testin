// Per-version module migration registry. Steps walked sequentially, persist
// after each apply for resumability.

import type { ModuleEnvelope } from './modules-store.js';
import { unprefixCssInStyleBlocks } from '../bghtml/rewriter.js';

export interface ModuleMigrationDeps {
  // syncWorldBook re-runs lorebook projection and rewrites the world_book in place.
  syncWorldBook: (env: ModuleEnvelope) => Promise<string | null>;
  reinstallArtifactsForAttached: (moduleId: string) => Promise<number>;
  // refreshArtifactsForAttached: detach + reattach for every attached character,
  // so the new projection (regex names, flags, etc.) replaces the old rows.
  refreshArtifactsForAttached?: (moduleId: string) => Promise<number>;
  // In-place patches per row, scoped to rows whose metadata._risu.module_id
  // matches. Returns null when host lacks regex_scripts.update.
  applyModuleRegexReplaceStringTransform?: (
    moduleId: string,
    transform: (replaceString: string) => string,
  ) => Promise<{ scanned: number; updated: number; failed: number } | null>;
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

// v5: pre-fix uploads projected regex with name='rule_N' (instead of Risu's
// `comment` field), prefixed with [ModuleName], and didn't strip <move_top> /
// <order N> brackets from flag (causing Lumi to reject those rules entirely).
// Detach + reattach every attached character so regex artifacts pick up the
// new projection shape.
async function applyV5RefreshAttachedRegex(
  args: ModuleMigrationStepArgs,
  deps: ModuleMigrationDeps,
): Promise<ModuleMigrationStepResult> {
  const notes: string[] = [];
  if (deps.refreshArtifactsForAttached) {
    try {
      const refreshed = await deps.refreshArtifactsForAttached(args.env.id);
      notes.push(`refreshed ${refreshed} attached char(s)`);
    } catch (err) {
      deps.log.warn(
        `migrate-module(${args.env.id}) v5: refreshArtifactsForAttached threw: ` +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  } else {
    notes.push('refreshArtifactsForAttached dep missing, skipping refresh');
  }
  return { nextEnv: args.env, notes };
}

async function applyV6StripStylePrefixInPlace(
  args: ModuleMigrationStepArgs,
  deps: ModuleMigrationDeps,
): Promise<ModuleMigrationStepResult> {
  // Preserves user disable + edits by patching only replace_string on rows
  // where the transform actually changes the content. Falls back to wholesale
  // refresh on hosts that don't expose regex_scripts.update.
  if (!deps.applyModuleRegexReplaceStringTransform) {
    deps.log.warn(
      `migrate-module(${args.env.id}) v6: regex_scripts.update unavailable, falling back to wholesale refresh (user disable/edit state will be lost)`,
    );
    return applyV5RefreshAttachedRegex(args, deps);
  }
  const result = await deps.applyModuleRegexReplaceStringTransform(
    args.env.id,
    unprefixCssInStyleBlocks,
  );
  if (result === null) {
    deps.log.warn(
      `migrate-module(${args.env.id}) v6: transform dep returned null, falling back to wholesale refresh`,
    );
    return applyV5RefreshAttachedRegex(args, deps);
  }
  return {
    nextEnv: args.env,
    notes: [
      `scanned=${result.scanned}`,
      `updated=${result.updated}`,
      `failed=${result.failed}`,
    ],
  };
}

export const MODULE_MIGRATIONS: readonly ModuleMigrationStep[] = [
  {
    version: 5,
    description:
      'Refresh attached-character regex artifacts to pick up new projection shape (Risu-comment names, no module-name prefix, flag-meta strip, dividers).',
    touches: ['regex_scripts_attached_chars'],
    apply: applyV5RefreshAttachedRegex,
  },
  {
    version: 6,
    description:
      'Strip x-risu- from CSS selectors inside <style> blocks of module-installed regex replace_string content. In-place per row, preserves user disable + edits.',
    touches: ['regex_scripts_attached_chars'],
    apply: applyV6StripStylePrefixInPlace,
  },
];

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
