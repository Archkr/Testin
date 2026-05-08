// Per-version migration registry. Steps are walked sequentially, persisting
// after each apply for resumability across worker restarts.

import { translateFromStoredSource } from '../core/pipeline/translate.js';
import type { CatalogIndex } from '../core/cbs/catalog/loader.js';
import type { LumiBundle } from '../core/pipeline/index.js';
import type { SvgRasterTask } from '../core/svg-rasterize.js';
import {
  type AssetIndexEntry,
  type LumirealmCharacterData,
  type StoredRegexScript,
} from '../payload/types.js';
import { buildAssetIndexes } from '../payload/import.js';

export interface MigrationDeps {
  loadCatalog: () => CatalogIndex;
  installCharacterRegexScripts: (
    characterId: string,
    characterName: string,
    scripts: readonly StoredRegexScript[],
  ) => Promise<void>;
  reinstallAttachedModules: (characterId: string) => Promise<number>;
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
  // For `ccdefault:` URI resolution during asset_index rebuild.
  getAvatarImageId: (characterId: string, userId: string) => Promise<string | null>;
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

export interface CharacterMigrationStepArgs {
  readonly envelope: LumirealmCharacterData;
  readonly characterId: string;
  readonly characterName: string;
  readonly userId: string;
  readonly newBundle: LumiBundle;
}

export interface CharacterMigrationStepResult {
  readonly nextEnvelope: LumirealmCharacterData;
  readonly notes: readonly string[];
}

export interface CharacterMigrationStep {
  readonly version: number;
  readonly description: string;
  // Surfaces this step touches. Documentation only, not enforced.
  readonly touches: readonly (
    | 'asset_index'
    | 'emotion_index'
    | 'regex_scripts'
    | 'world_book_entries'
    | 'svg_raster'
    | 'payload.additional_assets'
    | 'payload.emotion_images'
    | 'payload.background_html'
    | 'payload.triggers'
    | 'payload.lua_scripts'
    | 'attached_modules'
  )[];
  readonly apply: (
    args: CharacterMigrationStepArgs,
    deps: MigrationDeps,
  ) => Promise<CharacterMigrationStepResult>;
}

export type MigrationResult =
  | { kind: 'noop'; storedVersion: number }
  | {
      kind: 'migrated';
      from: number;
      to: number;
      stepsApplied: ReadonlyArray<{ version: number; notes: readonly string[] }>;
    }
  | { kind: 'needs_reimport'; reason: 'no_source'; storedVersion: number }
  | { kind: 'failed'; from: number; to: number; error: string; partialAt?: number };

async function applyV5AssetIndexRebuild(
  args: CharacterMigrationStepArgs,
  deps: MigrationDeps,
): Promise<CharacterMigrationStepResult> {
  const source = args.envelope.source;
  if (!source) throw new Error('v5 requires envelope.source');
  const pathToImageId = source.path_to_image_id ?? {};

  // Empty path_to_image_id means we have no way to resolve translator-output
  // asset paths to image_ids. Preserve the stored indexes rather than wipe.
  if (Object.keys(pathToImageId).length === 0) {
    return {
      nextEnvelope: {
        ...args.envelope,
        payload: {
          ...args.envelope.payload,
          additional_assets: args.newBundle.risuPayload!.additional_assets,
          emotion_images: args.newBundle.risuPayload!.emotion_images,
        },
      },
      notes: ['skipped: source.path_to_image_id is empty'],
    };
  }

  let avatarImageId: string | null = null;
  try {
    avatarImageId = await deps.getAvatarImageId(args.characterId, args.userId);
  } catch (err) {
    deps.log.warn(
      `migrate(${args.characterId}) v5: getAvatarImageId failed: ` +
        (err instanceof Error ? err.message : String(err)),
    );
  }
  const rebuilt = buildAssetIndexes(
    {
      additional_assets: args.newBundle.risuPayload!.additional_assets,
      emotion_images: args.newBundle.risuPayload!.emotion_images,
    },
    pathToImageId,
    avatarImageId,
  );
  const nextEnvelope: LumirealmCharacterData = {
    ...args.envelope,
    asset_index: rebuilt.assetIndex as Readonly<Record<string, AssetIndexEntry>>,
    emotion_index: rebuilt.emotionIndex as Readonly<Record<string, AssetIndexEntry>>,
    payload: {
      ...args.envelope.payload,
      additional_assets: args.newBundle.risuPayload!.additional_assets,
      emotion_images: args.newBundle.risuPayload!.emotion_images,
    },
  };
  return {
    nextEnvelope,
    notes: [
      `assets=${Object.keys(rebuilt.assetIndex).length}`,
      `emotions=${Object.keys(rebuilt.emotionIndex).length}`,
    ],
  };
}

export const CHARACTER_MIGRATIONS: readonly CharacterMigrationStep[] = [
  {
    version: 5,
    description:
      'Rebuild asset_index/emotion_index for new URI handling.',
    touches: [
      'asset_index',
      'emotion_index',
      'payload.additional_assets',
      'payload.emotion_images',
    ],
    apply: applyV5AssetIndexRebuild,
  },
];

export const CURRENT_CHARACTER_SCHEMA_VERSION: number =
  CHARACTER_MIGRATIONS.length > 0
    ? Math.max(...CHARACTER_MIGRATIONS.map((m) => m.version))
    : 1;

export async function migrateCharacterIfNeeded(
  args: MigrationArgs,
  deps: MigrationDeps,
): Promise<MigrationResult> {
  const stored = args.envelope.translator_schema_version ?? 1;
  const target = CURRENT_CHARACTER_SCHEMA_VERSION;
  if (stored >= target) return { kind: 'noop', storedVersion: stored };
  if (!args.envelope.source) {
    return { kind: 'needs_reimport', reason: 'no_source', storedVersion: stored };
  }

  const pending = CHARACTER_MIGRATIONS.filter(
    (m) => m.version > stored && m.version <= target,
  );

  let newBundle: LumiBundle;
  try {
    newBundle = translateFromStoredSource(
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
  } catch (err) {
    return {
      kind: 'failed',
      from: stored,
      to: target,
      error: err instanceof Error ? err.message : String(err),
    };
  }
  if (!newBundle.risuPayload) {
    return {
      kind: 'failed',
      from: stored,
      to: target,
      error: 'translator returned no risuPayload',
    };
  }

  let current = args.envelope;
  const stepsApplied: { version: number; notes: readonly string[] }[] = [];
  const t0 = Date.now();

  for (const step of pending) {
    try {
      const result = await step.apply(
        {
          envelope: current,
          characterId: args.characterId,
          characterName: args.characterName,
          userId: args.userId,
          newBundle,
        },
        deps,
      );
      const stamped = stampEnvelope(
        result.nextEnvelope,
        deps.extensionVersion,
        step.version,
      );
      await deps.writeEnvelope(args.characterId, stamped, args.userId);
      current = stamped;
      stepsApplied.push({ version: step.version, notes: result.notes });
      deps.log.info(
        `migrate(${args.characterId}): step v${step.version} done , ${result.notes.join(', ')}`,
      );
    } catch (err) {
      const errStr = err instanceof Error ? err.message : String(err);
      deps.log.error(
        `migrate(${args.characterId}): step v${step.version} FAILED: ${errStr}`,
      );
      return {
        kind: 'failed',
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
    // CURRENT bumped without writing a step. Just stamp version forward.
    const stamped = stampEnvelope(current, deps.extensionVersion, target);
    await deps.writeEnvelope(args.characterId, stamped, args.userId);
  }

  deps.log.info(
    `migrate(${args.characterId}): v${stored}->v${target} done ` +
      `steps=[${stepsApplied.map((s) => `v${s.version}`).join(',')}] ` +
      `elapsed=${Date.now() - t0}ms`,
  );
  return { kind: 'migrated', from: stored, to: target, stepsApplied };
}

function stampEnvelope(
  envelope: LumirealmCharacterData,
  extensionVersion: string,
  version: number,
): LumirealmCharacterData {
  return {
    ...envelope,
    extension_version: extensionVersion,
    translator_schema_version: version,
  };
}
