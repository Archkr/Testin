// Lazy chat-open migration runner. Fires once per character per worker boot
// when the envelope's translator_schema_version trails the current build.

import { translateFromStoredSource } from '../core/pipeline/translate.js';
import type { CatalogIndex } from '../core/cbs/catalog/loader.js';
import type { SvgRasterTask } from '../core/svg-rasterize.js';
import {
  CURRENT_TRANSLATOR_SCHEMA_VERSION,
  type LumirealmCharacterData,
  type StoredRegexScript,
} from '../payload/types.js';
import { buildLumirealmData } from '../payload/codec.js';

export type MigrationResult =
  | { kind: 'noop'; storedVersion: number }
  | {
      kind: 'migrated';
      from: number;
      to: number;
      regexCount: number;
      modulesReinstalled: number;
    }
  | { kind: 'needs_reimport'; reason: 'no_source'; storedVersion: number }
  | { kind: 'failed'; from: number; to: number; error: string };

export interface MigrationDeps {
  loadCatalog: () => CatalogIndex;
  installCharacterRegexScripts: (
    characterId: string,
    characterName: string,
    scripts: readonly StoredRegexScript[],
  ) => Promise<void>;
  reinstallAttachedModules: (characterId: string) => Promise<number>;
  // Inline `<svg>` blocks in replace_string become placeholders post-translate.
  // FE round-trip rasterizes them, applySvgRasterIndex substitutes the IDs back.
  dispatchSvgRasterize: (
    characterId: string,
    characterName: string,
    svgs: readonly SvgRasterTask[],
  ) => void;
  writeEnvelope: (
    characterId: string,
    data: LumirealmCharacterData,
    userId: string,
  ) => Promise<void>;
  log: {
    info: (s: string) => void;
    warn: (s: string) => void;
    error: (s: string) => void;
  };
  extensionVersion: string;
}

export interface MigrationArgs {
  characterId: string;
  characterName: string;
  userId: string;
  envelope: LumirealmCharacterData;
}

export async function migrateCharacterIfNeeded(
  args: MigrationArgs,
  deps: MigrationDeps,
): Promise<MigrationResult> {
  const stored = args.envelope.translator_schema_version ?? 1;
  const target = CURRENT_TRANSLATOR_SCHEMA_VERSION;
  if (stored >= target) return { kind: 'noop', storedVersion: stored };
  if (!args.envelope.source) {
    return { kind: 'needs_reimport', reason: 'no_source', storedVersion: stored };
  }

  try {
    const t0 = Date.now();
    const newBundle = translateFromStoredSource(
      {
        card: args.envelope.source.card,
        module: args.envelope.source.module,
      },
      {
        sourceId: `migrate:${args.characterId}`,
        mode: 'full',
        catalog: deps.loadCatalog(),
        emitPackScripts: false,
      },
    );
    if (!newBundle.risuPayload) {
      return {
        kind: 'failed',
        from: stored,
        to: target,
        error: 'translator returned no risuPayload',
      };
    }

    const folderLabel = `Risu - ${args.characterName}`.slice(0, 80);
    const newScripts: StoredRegexScript[] = newBundle.regexScripts.map((r) => ({
      name: r.name,
      script_id: r.script_id,
      find_regex: r.find_regex,
      replace_string: r.replace_string,
      flags: r.flags,
      placement: [...r.placement],
      scope: r.scope,
      scope_id: r.scope === 'character' ? args.characterId : r.scope_id,
      target: r.target,
      min_depth: r.min_depth,
      max_depth: r.max_depth,
      trim_strings: [...r.trim_strings],
      run_on_edit: r.run_on_edit,
      substitute_macros: r.substitute_macros,
      disabled: r.disabled,
      sort_order: r.sort_order,
      description: r.description,
      folder: r.folder || folderLabel,
      metadata: { ...r.metadata },
    }));

    // Drawer wipes ALL character-scoped rules in step 1 (including module
    // rows). Step 2 reinstalls module rows so they survive the wipe.
    await deps.installCharacterRegexScripts(
      args.characterId,
      args.characterName,
      newScripts,
    );
    const modulesCount = await deps.reinstallAttachedModules(args.characterId);

    // Re-translation produces fresh placeholders. The FE round-trip lands new
    // image_ids via applySvgRasterIndex, which re-installs regex_scripts.
    if (newBundle.pendingSvgRasters.length > 0) {
      deps.dispatchSvgRasterize(
        args.characterId,
        args.characterName,
        newBundle.pendingSvgRasters,
      );
    }

    const newEnvelope = buildLumirealmData(
      newBundle.risuPayload,
      deps.extensionVersion,
      newScripts,
      args.envelope.asset_index,
      args.envelope.emotion_index,
      args.envelope.imported_at,
      args.envelope.user_overrides,
      args.envelope.source,
      target,
    );
    await deps.writeEnvelope(args.characterId, newEnvelope, args.userId);

    deps.log.info(
      `migrate(${args.characterId}): v${stored}->v${target} ` +
        `regex=${newScripts.length} modules=${modulesCount} ` +
        `elapsed=${Date.now() - t0}ms`,
    );
    return {
      kind: 'migrated',
      from: stored,
      to: target,
      regexCount: newScripts.length,
      modulesReinstalled: modulesCount,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    deps.log.error(
      `migrate(${args.characterId}): v${stored}->v${target} FAILED: ${errMsg}`,
    );
    return { kind: 'failed', from: stored, to: target, error: errMsg };
  }
}
