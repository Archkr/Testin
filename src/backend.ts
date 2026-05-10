declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

import type { FrontendToBackend, BackendToFrontend, CardSummary } from './types/messages.js';
import { errMsg } from './util/coerce.js';
import {
  setupRealmBackend,
  isRealmFrontendMessage,
  type RealmBackendHandle,
} from './realm/backend.js';
import type { RealmBackendToFrontend } from './realm/messages.js';
import type { AssetIndexEntry, StoredRisuCard } from './payload/types.js';
import { CURRENT_CHARACTER_SCHEMA_VERSION } from './state/translator-migrations.js';
import { CURRENT_MODULE_SCHEMA_VERSION } from './state/module-migrations.js';
import {
  type UserStorageLike,
} from './payload/installer.js';
import {
  preValidateRequires,
  RisuCompatVersionError,
  RisuConsentDeclinedError,
} from './payload/codec.js';
import {
  readLumirealm,
  writeLumirealm,
  updateLumirealm,
  clearLumirealm,
  listLumirealmCharacters,
  buildSyntheticStoredCard,
  mergeUserOverrides,
  buildAttachModulePatch,
  buildDetachModulesPatch,
  type SpindleCharactersApi,
} from './state/lumirealm-character.js';
import {
  migrateCharacterIfNeeded,
  type MigrationDeps,
} from './state/translator-migrations.js';
import {
  readMigrationState,
  writeMigrationState,
} from './state/migration-state.js';
import { markLegacyReimportWarned } from './state/legacy-reimport-warnings.js';
import {
  migrateModuleIfNeeded,
  type ModuleMigrationDeps,
} from './state/module-migrations.js';
import {
  appendImageIdsToJournal,
  clearImageJournal,
  listImageJournalCharacterIds,
  readImageJournalFile,
  type JournalStorage,
} from './state/image-journal.js';
import {
  appendModuleImageIdsToJournal,
  clearModuleImageJournal,
  listModuleImageJournalIds,
  readModuleImageJournalFile,
} from './state/module-image-journal.js';
import {
  buildLiveImageIdSet,
  type OrphanDetectDeps,
} from './state/orphan-detect.js';
import {
  GENERATION_ENDED_BINDINGS,
  type ActiveCard,
} from './interpreter/dispatch.js';
import {
  prepareTriggers,
  dispatchBinding,
  dispatchByManualName,
  makeDispatcherScriptNS,
  registerManualTriggers,
  type CompiledTriggerEntry,
} from './interpreter/dispatcher.js';
import { makeSpindleHost } from './interpreter/spindle-host.js';
import { makeRisuTriggerRuntime, withDispatchContext } from './interpreter/runtime.js';
import type { RisuBinding } from './interpreter/runtime.js';
import { importCard, loadCatalog, type SpindleImportApi } from './payload/import.js';
import { parseDirectLorebook } from './payload/lorebook-direct-import.js';
import { mapLoreBook, hasUserEditedAnyEntry } from './core/mappers/lorebook.js';
import { loreBookSchema, type LoreBook } from './core/schemas/lorebook.js';
import { registerAll as registerAllMacros } from './interpreter/macros.js';
import { setActiveAssetIndexes, clearActiveAssetIndexes } from './interpreter/asset-cache.js';
import {
  setActiveCharacterImage,
  setActivePersonaImage,
  getActiveCharacterImage,
  getActivePersonaImage,
  clearActiveCharacterImage,
  imageUrlFromId,
} from './interpreter/image-cache.js';
import {
  setActiveScriptstateDefaults,
  clearActiveScriptstateDefaults,
} from './interpreter/defaults-cache.js';
import {
  setActiveModulesByNamespace,
  clearActiveModulesByNamespace,
} from './interpreter/modules-by-namespace-cache.js';
import { runPipeline, workerEvalEnabled } from './interpreter/evaluator/pipeline.js';
import { clearVarOverlay } from './interpreter/evaluator/context.js';
import { runListenEditChain } from './interpreter/listen-edit.js';
import { invalidateListenEditPreload } from './interpreter/listenedit-preload.js';
import {
  runAtActionsForPhase,
  coerceAtActions,
} from './interpreter/at-actions-runtime.js';
import { getActiveAssetIndexes } from './interpreter/asset-cache.js';
import { setScreenDims, getScreenDims } from './interpreter/screen-dims-cache.js';
import { puaEncodeFeMacros, puaDecodeFeMacros } from './util/pua-roundtrip.js';
import { VariableStateStore } from './state/variables-state.js';
import { ToggleStateStore } from './state/toggle-state.js';
import {
  initPermissions,
  getMissingPermissions,
  subscribeToMissingChanges,
  PERMISSION_PURPOSE,
} from './state/permissions.js';
import { buildDispatchSeams } from './state/dispatch-seams.js';
import type { ViewerPushDeps } from './state/viewer-push.js';
import { createViewerAssembly } from './state/viewer-assembly.js';
import { mergeLangBlock } from './state/translation-merge.js';
import { createLorebookImporter } from './state/lorebook-import.js';
import { createModuleUploader } from './state/module-upload.js';
import { createOrphanOrchestrator } from './state/orphan-orchestrator.js';
import type { Handler, HandlerCallCtx, HandlerRegistry } from './handlers/types.js';
import { createScreenHandlers } from './handlers/screen.js';
import { createConsentHandlers } from './handlers/consent.js';
import { createConnectionsHandlers } from './handlers/connections.js';
import { createLogHandlers } from './handlers/log.js';
import { createSettingsHandlers } from './handlers/settings.js';
import { createTranslationsHandlers } from './handlers/translations.js';
import { createVariablesHandlers } from './handlers/variables.js';
import { createTogglesHandlers } from './handlers/toggles.js';
import { createDispatchHandlers } from './handlers/dispatch.js';
import { createLorebookHandlers } from './handlers/lorebook.js';
import { createAssetsHandlers } from './handlers/assets.js';
import { createViewerHandlers } from './handlers/viewer.js';
import { createModuleHandlers } from './handlers/module.js';
import {
  createImportHandlers,
  type ImportSession,
  type PendingImportCompletion,
} from './handlers/import.js';
import { createOrphanHandlers } from './handlers/orphan.js';
import { createRepairHandlers } from './handlers/repair.js';
import { createLifecycleEventHandlers } from './events/lifecycle.js';
import { createLumiInterceptors } from './interceptors/lumi-hooks.js';
import { createReadonlyResolver } from './state/readonly-resolver.js';
import { createBgHtmlRefresher } from './state/bg-html.js';
import { createTriggerDispatcher } from './state/trigger-dispatch.js';
import { createRepairOrchestrator } from './state/repair-orchestrator.js';
import { createMigrationsRunner } from './state/migrations.js';
import { createMassMigrationsRunner } from './boot/mass-migrations.js';
import { createActiveCardLoader } from './state/active-card.js';
import { createApplySvgRasterIndex } from './boot/svg-raster-apply.js';
import {
  makeNudgeGc,
  makeRefreshPersonaImage,
  makeSeedAuthorsNoteFromDepthPrompt,
  makeMaybeFinalizeImport,
} from './boot/misc.js';
import { makePromptOrphanReviewIfAny } from './boot/orphan-review.js';
import { createVariablesTogglesService } from './state/variables-toggles.js';
import { createSettingsService } from './state/settings-service.js';
import { makeCaptureUserId } from './boot/capture-user.js';
import { createImportCardOrchestrator } from './boot/import-card.js';
import {
  getModalConfirmApi,
  getRegexScriptsApi,
  getConnectionsListFn,
  type ModalConfirmOptions,
} from './adapters/spindle-extras.js';
import {
  collectModuleToggleDsl,
  extractToggleKeys,
  parseToggleSyntax,
  type SidebarToggle,
} from './core/toggle-syntax.js';
import type { SidebarToggleWire } from './types/messages.js';
import {
  type RisuCompatSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  mergeSettings,
  normalizeSettingsPatch,
} from './state/settings-store.js';
import {
  expectChatChange,
  consumeOwnChatChange,
} from './state/own-chat-change.js';
import { consumeOwnCharacterEdit, expectCharacterEdit } from './state/own-character-edit.js';
import {
  rememberOurWrite,
  consumeIfOurWrite,
} from './state/recent-writes.js';
import {
  lookupRenderMcp,
  cacheRenderMcp,
  invalidateRenderMcpForChat,
  invalidateRenderMcpForMessage,
  renderMcpCacheStats,
} from './state/render-mcp-cache.js';
import { scheduleStateChangedRefresh as scheduleDebouncedRefresh } from './state/state-changed-debouncer.js';
import { computeDepthPromptSeed } from './state/depth-prompt-seed.js';
import { normalizeReplaceStringForSanitizer } from './util/sanitizer-doc-shape.js';
import {
  logStore,
  loadPersistedLogState,
  persistLogState,
  isLogThreshold,
} from './log/store.js';
import { resolveAlertDismissal } from './interpreter/alert-bridge.js';
import { resolvePickResolution } from './interpreter/pick-bridge.js';
import { userIdAls, currentUserId } from './interpreter/runtime/als.js';
import { checkHostVersion, type HostVersionCheckResult } from './util/version-check.js';
import {
  getDecoratorBuffers as readDecoratorBuffers,
  setDecoratorBuffers,
  clearDecoratorBuffers as clearDecoratorBuffer,
} from './interpreter/decorator-buffers.js';
import { decodeRisum } from './core/risum/index.js';
import { risuModuleSchema } from './core/schemas/module.js';
import { guessMimeType, sniffImageMime } from './payload/import.js';
import {
  type ModuleEnvelope,
  type ModuleIndexEntry,
  deleteModule as deleteModuleFromStore,
  listModules as listModuleStore,
  pairModuleAssetsForUpload,
  readEnvelope as readModuleEnvelope,
  writeEnvelope as writeModuleEnvelope,
} from './state/modules-store.js';
import type {
  AttachedModuleSummary,
  ModuleSummary,
} from './types/messages.js';
import { projectModuleRegexEntries } from './state/module-artifact-project.js';
import {
  buildCharacterViewerData,
  buildModuleViewerData,
  type FetchedWorldBook,
  type LumiSideRegex,
} from './state/viewer-data.js';
import {
  addAssetToCharacterIndex,
  addAssetToModuleIndex,
  deleteCharacterAsset,
  deleteModuleAsset,
  renameCharacterAsset,
  renameModuleAsset,
} from './state/asset-index-mutate.js';
import {
  extractLuaForTrigger,
  replaceTriggerLuaInArray,
} from './state/trigger-lua-mutate.js';

const EXTENSION_VERSION = '0.1.0';

// Mirrored from `spindle.json minimum_lumiverse_version`. Lumi may not enforce
// the manifest field at load time, so we re-check at runtime and nag the user.
const MINIMUM_LUMIVERSE_VERSION = '0.9.7';

// ALS-backed user attribution: each event handler runs its body inside a
// `userIdAls.run(userId, ...)` frame, so `currentUserId()` returns the firing
// event's user across awaits without losing it to concurrent peer dispatches.
// No fallback to module-global `activeUserId`: outside an ALS frame the log
// entry is system-tagged (null) rather than mis-attributed to the last user.
function logUid(): string | null {
  return currentUserId() ?? null;
}

// Wraps a Spindle event handler so its body executes under the firing user's
// ALS frame. System events without a userId run unwrapped (currentUserId
// stays null, so log entries get tagged null = system).
function userScoped(
  handler: (raw: unknown, userId: string | undefined) => Promise<void>,
): (raw: unknown, userId: string | undefined) => Promise<void> {
  return (raw, userId) =>
    userId
      ? userIdAls.run(userId, () => handler(raw, userId))
      : handler(raw, userId);
}

// Same idea for Lumi callbacks (macro/MCP/worldInfo) whose ctx already
// carries userId. When undefined, runs unwrapped (system-tagged).
function withMaybeUser<T>(
  userId: string | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  return userId !== undefined ? (userIdAls.run(userId, fn) as Promise<T>) : fn();
}

const log = {
  error(msg: string): void {
    spindle.log.error(`[lumirealm] ${msg}`);
    logStore.push('error', 'backend', msg, logUid());
  },
  warn(msg: string): void {
    if (logStore.shouldEmit('warn')) spindle.log.warn(`[lumirealm] ${msg}`);
    logStore.push('warn', 'backend', msg, logUid());
  },
  info(msg: string): void {
    if (logStore.shouldEmit('info')) spindle.log.info(`[lumirealm] ${msg}`);
    logStore.push('info', 'backend', msg, logUid());
  },
  debug(msg: string): void {
    if (logStore.shouldEmit('debug')) spindle.log.info(`[lumirealm] ${msg}`);
    logStore.push('debug', 'backend', msg, logUid());
  },
  trace(msg: string): void {
    if (logStore.shouldEmit('trace')) spindle.log.info(`[lumirealm] ${msg}`);
    logStore.push('trace', 'backend', msg, logUid());
  },
  /** @deprecated Alias for `debug`. */
  verbose(msg: string): void {
    if (logStore.shouldEmit('debug')) spindle.log.info(`[lumirealm] ${msg}`);
    logStore.push('debug', 'backend', msg, logUid());
  },
  /** @deprecated Alias for `info`. */
  always(msg: string): void {
    if (logStore.shouldEmit('info')) spindle.log.info(`[lumirealm] ${msg}`);
    logStore.push('info', 'backend', msg, logUid());
  },
};

log.info(`backend boot: version=${EXTENSION_VERSION}`);

// Lumi may not enforce manifest minimum_lumiverse_version, so we re-check at
// runtime and nag via get_cards handshake (mirrors Hone's pattern).
let hostVersionCheck: HostVersionCheckResult | null = null;
void (async () => {
  let backend: string | null = null;
  let frontend: string | null = null;
  try {
    backend = await spindle.version.getBackend();
  } catch (err) {
    log.warn(`spindle.version.getBackend() failed: ${errMsg(err)}`);
  }
  try {
    frontend = await spindle.version.getFrontend();
  } catch (err) {
    log.warn(`spindle.version.getFrontend() failed: ${errMsg(err)}`);
  }
  hostVersionCheck = checkHostVersion(backend, MINIMUM_LUMIVERSE_VERSION);
  const tag = hostVersionCheck.needsUpdate ? 'WARN' : 'ok';
  log.info(
    `host-version: lumiverse backend=${backend ?? 'unknown'} frontend=${frontend ?? 'unknown'} min=${MINIMUM_LUMIVERSE_VERSION} ${tag}`,
  );
  if (hostVersionCheck.needsUpdate) log.warn(hostVersionCheck.message);
})();

void initPermissions(log);

subscribeToMissingChanges((missing) => {
  const purposes: Record<string, string> = {};
  for (const p of missing) purposes[p] = PERMISSION_PURPOSE[p] ?? p;
  for (const userId of capturedUserIds) {
    try {
      spindle.sendToFrontend({
        type: 'notify_missing_permissions',
        missing,
        purposes,
      }, userId);
    } catch (err) {
      log.warn(`permissions.changed: sendToFrontend failed userId=${userId}: ${errMsg(err)}`);
    }
  }
  if (missing.length > 0) {
    log.warn(`permissions.changed: broadcast notify_missing_permissions to ${capturedUserIds.size} user(s) missing=[${missing.join(',')}]`);
  } else {
    log.info(`permissions.changed: all required perms granted, broadcast empty set to ${capturedUserIds.size} user(s) to auto-dismiss`);
  }
});

// Without this guard any rejection from a card's Lua bridge call kills the worker.
{
  const proc: { on?: (ev: string, cb: (...a: unknown[]) => void) => void } | undefined =
    (globalThis as { process?: { on?: (ev: string, cb: (...a: unknown[]) => void) => void } }).process;
  // Route to spindle.log only, not logStore: these fire outside any ALS frame
  // so the message would be tagged null (visible in every user's export). The
  // operator sees the error via Lumi server logs.
  proc?.on?.('unhandledRejection', (reason: unknown) => {
    const msg = reason instanceof Error ? (reason.stack ?? reason.message) : String(reason);
    try { spindle.log.error(`[lumirealm] unhandledRejection (suppressed): ${msg.slice(0, 1200)}`); } catch { /* */ }
  });
  proc?.on?.('uncaughtException', (err: unknown) => {
    const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
    try { spindle.log.error(`[lumirealm] uncaughtException (suppressed): ${msg.slice(0, 1200)}`); } catch { /* */ }
  });
}

function modulesByNamespaceFromCard(card: StoredRisuCard): Readonly<Record<string, readonly string[]>> | null {
  const extra = card.risuPayload.extra as { modules_by_namespace?: unknown } | undefined;
  const raw = extra?.modules_by_namespace;
  if (!raw || typeof raw !== 'object') return null;
  const out: Record<string, readonly string[]> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(v) && v.every((s) => typeof s === 'string')) {
      out[k] = v as readonly string[];
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

registerAllMacros();

const variableState = new VariableStateStore();

const toggleState = new ToggleStateStore();

function scheduleStateChangedRefresh(chatId: string, userId: string | undefined): void {
  log.info(`scheduleStateChangedRefresh: scheduling for chat=${chatId}`);
  scheduleDebouncedRefresh(
    chatId,
    async () => {
      const active = activeCardByChat.get(chatId);
      if (!active) {
        log.info(`scheduleStateChangedRefresh: skipped (no active card) chat=${chatId}`);
        return;
      }
      const t0 = Date.now();
      // Body content resolves at render time via the 'render' MCP origin.
      // Var changes invalidate the render-MCP cache (per CHAT_CHANGED) and
      // Lumi's per-touchedVars displayRegexContentCache, which together
      // re-fetch only the affected bubbles. No bake walk here.
      invalidateRenderMcpForChat(chatId);
      await refreshBgHtml(active, chatId, userId);
      await refreshVariables(active, chatId, userId);
      log.info(`scheduleStateChangedRefresh: completed chat=${chatId} elapsed=${Date.now() - t0}ms`);
    },
    (err) => log.error(`scheduleStateChangedRefresh: refresh threw chat=${chatId}: ${errMsg(err)}`),
  );
}

function makeStateChangedCallback(chatId: string, userId: string | undefined): () => void {
  return () => scheduleStateChangedRefresh(chatId, userId);
}

// Per-user settings cache. Defaults to DEFAULT_SETTINGS until first read,
// so Lua dispatches before `request_settings` arrives fall back gracefully.



// Tracks which userIds have already been bootstrapped by `captureUserId`,
// so the settings preload + orphan-review prompt fire once per session.
const capturedUserIds = new Set<string>();

const settingsService = createSettingsService({ userStorage, send, log, errMsg });
const getSettingsForUser = settingsService.getSettingsForUser;
const getCachedSettingsSync = settingsService.getCachedSettingsSync;
const applySettingsPatch = settingsService.applySettingsPatch;
const makeAuxDebugCapture = settingsService.makeAuxDebugCapture;
const listConnectionsForUser = settingsService.listConnectionsForUser;
const activeCardByChat = new Map<string, ActiveCard>();
// Tracks the last chat each user opened so a page-refresh (SETTINGS_UPDATED
// dedup'd on same value) can repaint bg-html + portal state.
const lastActiveChatByUser = new Map<string, string>();
// characterIds are Lumi-wide unique UUIDs, so these maps don't need an
// ownerUserId stamp. Their entries cache server-side derived data (compiled
// trigger AsyncFunction bodies, world-book-id snapshots for the cascade).
const compiledByCharacter = new Map<string, readonly CompiledTriggerEntry[]>();
const worldBookIdsByCharacter = new Map<string, readonly string[]>();

function journalStorage(): JournalStorage {
  return spindle.userStorage as unknown as JournalStorage;
}

function spindleImagesDelete(): ((id: string, userId?: string) => Promise<boolean>) | null {
  return spindle.images?.delete ? spindle.images.delete.bind(spindle.images) : null;
}

async function deleteImageIds(
  imageIds: readonly string[],
  userId: string,
  context: string,
  onProgress?: (processed: number, total: number) => void,
): Promise<{ deleted: number; absent: number; failed: number }> {
  let deleted = 0;
  let absent = 0;
  let failed = 0;
  const del = spindleImagesDelete();
  if (!del) {
    log.warn(`${context}: spindle.images.delete unavailable,${imageIds.length} image(s) leaked`);
    return { deleted, absent, failed: imageIds.length };
  }
  let nextIndex = 0;
  let processed = 0;
  const total = imageIds.length;
  const concurrency = Math.min(6, total);
  // Throttle progress emission so 10k-image deletes don't spam WS at 6Hz.
  const progressEvery = Math.max(10, Math.floor(total / 100));
  const worker = async (): Promise<void> => {
    while (true) {
      const i = nextIndex++;
      if (i >= total) break;
      const id = imageIds[i];
      if (!id) {
        processed++;
        continue;
      }
      try {
        const ok = await del(id, userId);
        if (ok) deleted++; else absent++;
      } catch (err) {
        failed++;
        log.warn(`${context}: image delete threw id=${id}: ${errMsg(err)}`);
      }
      processed++;
      if (onProgress && (processed % progressEvery === 0 || processed === total)) {
        try {
          onProgress(processed, total);
        } catch (err) {
          log.warn(`${context}: onProgress threw: ${errMsg(err)}`);
        }
      }
    }
  };
  const workers: Promise<void>[] = [];
  for (let w = 0; w < concurrency; w++) workers.push(worker());
  await Promise.all(workers);
  return { deleted, absent, failed };
}


function collectStoredCardImageIds(
  avatarId: string | null,
  card: { asset_index: Readonly<Record<string, AssetIndexEntry>>; emotion_index: Readonly<Record<string, AssetIndexEntry>> },
): readonly string[] {
  const ids: string[] = [];
  if (typeof avatarId === 'string' && avatarId.length > 0) ids.push(avatarId);
  const collect = (idx: Readonly<Record<string, AssetIndexEntry>>): void => {
    for (const entry of Object.values(idx)) {
      for (const id of entry.imageIds) {
        if (typeof id === 'string' && id.length > 0) ids.push(id);
      }
    }
  };
  collect(card.asset_index);
  collect(card.emotion_index);
  return ids;
}

async function backfillImageJournalIfMissing(
  characterId: string,
  avatarId: string | null,
  card: { asset_index: Readonly<Record<string, AssetIndexEntry>>; emotion_index: Readonly<Record<string, AssetIndexEntry>> },
  userId: string,
): Promise<void> {
  try {
    const existing = await readImageJournalFile(journalStorage(), userId, characterId);
    if (existing) return;
    const ids = collectStoredCardImageIds(avatarId, card);
    if (ids.length === 0) return;
    await appendImageIdsToJournal(journalStorage(), userId, characterId, ids);
    log.info(
      `image-journal: backfilled legacy char=${characterId} ids=${ids.length}`,
    );
  } catch (err) {
    log.warn(`image-journal: backfill failed char=${characterId}: ${errMsg(err)}`);
  }
}

// Lumi caps each extension at 2 concurrent modals, two boot-time prompts can
// race (orphan review, lorebook archive). Serialize per-user.
const modalChainByUser = new Map<string, Promise<unknown>>();
function queueModalConfirm(
  userId: string,
  options: Omit<ModalConfirmOptions, 'userId'>,
): Promise<{ confirmed: boolean } | null> {
  const modalApi = getModalConfirmApi();
  if (!modalApi) return Promise.resolve(null);
  const run = (): Promise<{ confirmed: boolean } | null> =>
    modalApi.confirm({ ...options, userId }).catch((err) => {
      log.warn(`queueModalConfirm: modal.confirm threw: ${errMsg(err)}`);
      return null;
    });
  const prior = modalChainByUser.get(userId) ?? Promise.resolve();
  const next = prior.then(run, run);
  modalChainByUser.set(userId, next.catch(() => undefined));
  return next;
}


function buildOrphanDetectDeps(userId: string): OrphanDetectDeps {
  return {
    listLumirealmCharacters: async () => {
      const entries = await listLumirealmCharacters(charactersApi(), userId, {
        paginate: true,
      });
      return entries.map(({ character, data }) => ({
        id: character.id,
        image_id: character.image_id ?? null,
        asset_index: data.asset_index,
        emotion_index: data.emotion_index,
        regex_replace_strings: data.regex_scripts.map((r) => r.replace_string),
        background_html: data.payload?.background_html ?? null,
      }));
    },
    listModules: async () => {
      const summaries = await listModuleStore(moduleStorage(), userId);
      const out: Array<{ id: string; asset_imageIds: readonly string[] }> = [];
      for (const summary of summaries) {
        const env = await readModuleEnvelope(moduleStorage(), userId, summary.id);
        if (!env) continue;
        const ids: string[] = [];
        for (const ref of Object.values(env.asset_index ?? {})) {
          if (typeof ref.imageId === 'string' && ref.imageId.length > 0) {
            ids.push(ref.imageId);
          }
        }
        out.push({ id: summary.id, asset_imageIds: ids });
      }
      return out;
    },
    listActiveCharacterJournals: async () => {
      const ids = await listImageJournalCharacterIds(journalStorage(), userId);
      const out: Array<NonNullable<Awaited<ReturnType<typeof readImageJournalFile>>>> = [];
      for (const id of ids) {
        const f = await readImageJournalFile(journalStorage(), userId, id);
        if (f && f.status === 'active') out.push(f);
      }
      return out;
    },
    listActiveModuleJournals: async () => {
      const ids = await listModuleImageJournalIds(journalStorage(), userId);
      const out: Array<NonNullable<Awaited<ReturnType<typeof readModuleImageJournalFile>>>> = [];
      for (const id of ids) {
        const f = await readModuleImageJournalFile(journalStorage(), userId, id);
        if (f && f.status === 'active') out.push(f);
      }
      return out;
    },
    characterExists: async (id) => {
      try {
        const c = await spindle.characters.get(id, userId);
        return c !== null;
      } catch (err) {
        log.warn(`orphan-detect: characters.get(${id}) threw: ${errMsg(err)}`);
        return false;
      }
    },
    moduleExists: async (id) => {
      try {
        const env = await readModuleEnvelope(moduleStorage(), userId, id);
        return env !== null;
      } catch {
        return false;
      }
    },
  };
}

// Wraps buildOrphanDetectDeps to treat one character ID as already-removed.
// Used by CHARACTER_DELETED, where Lumi fires the event BEFORE the row is
// removed and our list calls would otherwise still see the doomed character.
function buildOrphanDetectDepsExcluding(
  userId: string,
  excludeCharacterId: string,
): OrphanDetectDeps {
  const base = buildOrphanDetectDeps(userId);
  return {
    ...base,
    listLumirealmCharacters: async () => {
      const all = await base.listLumirealmCharacters();
      return all.filter((c) => c.id !== excludeCharacterId);
    },
    characterExists: async (id) => {
      if (id === excludeCharacterId) return false;
      return base.characterExists(id);
    },
  };
}

const orphanOrchestrator = createOrphanOrchestrator({
  imagesApi: spindle.images
    ? { list: (opts) => spindle.images.list(opts as never) as never }
    : null,
  regexApi: getRegexScriptsApi(),
  listLumirealmCharacterIds: async (userId) => {
    const entries = await listLumirealmCharacters(charactersApi(), userId, { paginate: true });
    return entries.filter((e) => e.data !== null).map((e) => e.character.id);
  },
  listModuleIds: async (userId) => {
    const ms = await listModuleStore(moduleStorage(), userId);
    return ms.map((m) => m.id);
  },
  characterExists: async (userId, id) => {
    try {
      const c = await spindle.characters.get(id, userId);
      return c !== null;
    } catch {
      return false;
    }
  },
  moduleExists: async (userId, id) => {
    try {
      const env = await readModuleEnvelope(moduleStorage(), userId, id);
      return env !== null;
    } catch {
      return false;
    }
  },
  listImageJournalCharacterIds: (userId) => listImageJournalCharacterIds(journalStorage(), userId),
  readImageJournalFile: (userId, characterId) => readImageJournalFile(journalStorage(), userId, characterId),
  listModuleImageJournalIds: (userId) => listModuleImageJournalIds(journalStorage(), userId),
  readModuleImageJournalFile: (userId, moduleId) => readModuleImageJournalFile(journalStorage(), userId, moduleId),
  clearImageJournal: async (userId, characterId) => { await clearImageJournal(journalStorage(), userId, characterId); },
  clearModuleImageJournal: async (userId, moduleId) => { await clearModuleImageJournal(journalStorage(), userId, moduleId); },
  buildOrphanDetectDeps,
  countCharacterRepair: async (userId) => {
    const entries = await listLumirealmCharacters(charactersApi(), userId, { paginate: true });
    const liveModuleIds = new Set((await listModuleStore(moduleStorage(), userId)).map((m) => m.id));
    let charactersToRetranslate = 0;
    let modulesToReattach = 0;
    let danglingModuleRefs = 0;
    for (const e of entries) {
      if (!e.data) continue;
      charactersToRetranslate += 1;
      const ids = e.data.user_overrides.attached_module_ids ?? [];
      for (const id of ids) {
        if (liveModuleIds.has(id)) modulesToReattach++;
        else danglingModuleRefs++;
      }
    }
    return { charactersToRetranslate, modulesToReattach, danglingModuleRefs };
  },
  log,
  errMsg,
});

const detectDeletedWhileOff = (userId: string) => orphanOrchestrator.detectDeletedWhileOff(userId);
const scanOrphanedImages = (userId: string) => orphanOrchestrator.scanOrphanedImages(userId);
const sweepOrphanModuleRegex = (userId: string) => orphanOrchestrator.sweepOrphanModuleRegex(userId);
const listStaleCharRegexIds = (userId: string) => orphanOrchestrator.listStaleCharRegexIds(userId);
const deleteRegexIds = (userId: string, ids: readonly string[]) => orphanOrchestrator.deleteRegexIds(userId, ids);
const clearDeadJournals = (userId: string) => orphanOrchestrator.clearDeadJournals(userId);

const promptOrphanReviewIfAny = makePromptOrphanReviewIfAny({
  detectDeletedWhileOff,
  journalStorage,
  clearImageJournal,
  clearModuleImageJournal,
  queueModalConfirm,
  toastFor,
  send,
  log,
  errMsg,
});

const captureUserId = makeCaptureUserId({
  capturedUserIds,
  getSettingsForUser,
  promptOrphanReviewIfAny,
  // Trampolines: massMigrations is declared further down, this closure resolves it at call time.
  runMassModuleMigrationIfNeeded: (uid) => massMigrations.runMassModuleMigrationIfNeeded(uid),
  runMassCharacterMigrationIfNeeded: (uid) => massMigrations.runMassCharacterMigrationIfNeeded(uid),
  log,
  errMsg,
});


const scanRepairTargets = (userId: string) => orphanOrchestrator.scanRepairTargets(userId);


// JSC's incremental GC leaves upload-pipeline garbage (handoff, decoded
// Uint8Arrays, IPC payloads) rooted for minutes without slack. Force a
// synchronous full collect after large uploads, ~50-200ms on multi-GiB
// heaps, no-op when Bun.gc is unavailable.

const pendingImportCompletions = new Map<string, PendingImportCompletion>();

// Tracks asset-upload-bearing operations (card import, module upload). Cleanup
// scan refuses to run while non-zero so an in-flight upload's not-yet-journaled
// IDs cannot be deleted as orphans.
let assetUploadsInFlight = 0;

const importCardOrchestrator = createImportCardOrchestrator({
  extensionVersion: EXTENSION_VERSION,
  userStorage,
  requestConsent,
  worldBookIdsByCharacter,
  pendingImportCompletions,
  enterAssetUpload: () => { assetUploadsInFlight++; },
  exitAssetUpload: () => { assetUploadsInFlight--; },
  // Trampolines for wiring declared further down.
  nudgeGc: (reason) => nudgeGc(reason),
  refreshRisuAssetMap: (charId, userId) => refreshRisuAssetMap(charId, userId),
  send,
  listCards,
  pushCards,
  toastFor,
  log,
  errMsg,
});
const importCardFromBytes = importCardOrchestrator.importCardFromBytes;

// True while applyRepair is running. Module attach/detach + drawer mutations
// gate against this so the snapshot-then-write loop in forceRetranslateAll
// can't be raced into silent data loss on user_overrides.
const repairInFlightByUser = new Set<string>();

// Per-character per-worker-boot dedupe, set on first migration check fire.
const translatorMigrationChecked = new Set<string>();

// Returns true and surfaces an error toast if a repair is in flight, so
// the caller should bail. Returns false if it's safe to proceed.
function blockedByRepair(userId: string | undefined, messageType: string): boolean {
  if (userId === undefined) return false;
  if (!repairInFlightByUser.has(userId)) return false;
  log.info(`${messageType}: blocked by in-flight repair for user=${userId}`);
  toastFor(
    userId,
    'warning',
    'A repair is in progress. Try again once it finishes.',
    { title: 'lumirealm' },
  );
  return true;
}

type OperationPhase = 'started' | 'progress' | 'done' | 'error';
function emitOperationProgress(
  userId: string,
  operationId: string,
  phase: OperationPhase,
  title: string,
  message: string,
  fraction: number | null,
  error?: string,
): void {
  send({
    type: 'operation_progress',
    operationId,
    phase,
    title,
    message,
    fraction,
    ...(error !== undefined ? { error } : {}),
  }, userId);
}



// Chunked .charx upload: accumulate chunks by sessionId, assemble on commit.
// Stale sessions are GC'd after IMPORT_SESSION_TIMEOUT_MS.
const importSessions = new Map<string, ImportSession>();
const IMPORT_SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 min

// Bound FE-supplied counts so a malicious init can't OOM the worker via
// `new Array(totalChunks).fill(null)`. 250k slots is ~2MB of Array storage.
const MAX_UPLOAD_CHUNKS = 250_000;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 * 1024; // 8 GB

function validateUploadShape(
  totalBytes: unknown,
  totalChunks: unknown,
): { ok: true } | { ok: false; reason: string } {
  if (typeof totalBytes !== 'number' || !Number.isInteger(totalBytes) || totalBytes < 0 || totalBytes > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: `totalBytes out of range (max ${MAX_UPLOAD_BYTES})` };
  }
  if (typeof totalChunks !== 'number' || !Number.isInteger(totalChunks) || totalChunks < 1 || totalChunks > MAX_UPLOAD_CHUNKS) {
    return { ok: false, reason: `totalChunks out of range (max ${MAX_UPLOAD_CHUNKS})` };
  }
  return { ok: true };
}

function sweepStaleSessions(): void {
  const now = Date.now();
  let dropped = 0;
  for (const [sid, s] of importSessions) {
    if (now - s.lastActivity > IMPORT_SESSION_TIMEOUT_MS) {
      importSessions.delete(sid);
      dropped += 1;
      log.warn(`import session ${sid} expired (inactive ${Math.round((now - s.lastActivity) / 1000)}s); dropping ${s.receivedChunks}/${s.totalChunks} chunks`);
    }
  }
  if (dropped > 0) log.info(`sweepStaleSessions: dropped ${dropped} expired session(s)`);
}
const sweepTimer = setInterval(sweepStaleSessions, 60_000);
if (typeof (sweepTimer as { unref?: () => void }).unref === 'function') {
  (sweepTimer as { unref: () => void }).unref();
}

function userStorage(): UserStorageLike {
  return spindle.userStorage as unknown as UserStorageLike;
}

function send(msg: BackendToFrontend, userId: string | undefined): void {
  // Refuse broadcast on undefined: operator-scoped sendToFrontend without a
  // userId fans out to every connected user, leaking a single user's reply.
  if (userId === undefined) {
    log.error(`send: refusing to broadcast type=${msg.type} (no userId)`);
    return;
  }
  spindle.sendToFrontend(msg, userId);
}

function toastFor(
  userId: string | undefined,
  kind: 'success' | 'warning' | 'error' | 'info',
  message: string,
  options?: { title?: string; duration?: number },
): void {
  const t = spindle.toast as unknown as
    | Record<typeof kind, (m: string, o: { title?: string; duration?: number; userId?: string }) => void>
    | undefined;
  if (!t) return;
  if (userId === undefined) {
    log.warn(`toastFor(broadcast): no userId for kind=${kind}, fanning out to all users`);
    t[kind](message, options ?? {});
    return;
  }
  t[kind](message, { ...(options ?? {}), userId });
}

interface PendingConsent {
  readonly ownerUserId: string;
  readonly resolver: (confirmed: boolean) => void;
}
const pendingConsents = new Map<string, PendingConsent>();
// Per-user serialization: user A's consent prompt must not block user B's.
const consentChainByUser = new Map<string, Promise<unknown>>();
// Self-heal window for stuck FE: a disconnected client never replies, so
// without this the consent chain for that user blocks every later prompt.
const CONSENT_TIMEOUT_MS = 5 * 60_000;

function requestConsent(opts: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}, userId: string): Promise<{ confirmed: boolean }> {
  const run = (): Promise<{ confirmed: boolean }> =>
    new Promise((resolve) => {
      const requestId = crypto.randomUUID();
      const timeoutHandle = setTimeout(() => {
        if (!pendingConsents.has(requestId)) return;
        pendingConsents.delete(requestId);
        log.warn(`requestConsent: timed out requestId=${requestId} userId=${userId} (auto-decline)`);
        resolve({ confirmed: false });
      }, CONSENT_TIMEOUT_MS);
      if (typeof (timeoutHandle as { unref?: () => void }).unref === 'function') {
        (timeoutHandle as { unref: () => void }).unref();
      }
      pendingConsents.set(requestId, {
        ownerUserId: userId,
        resolver: (confirmed) => {
          clearTimeout(timeoutHandle);
          resolve({ confirmed });
        },
      });
      send({
        type: 'consent_prompt',
        requestId,
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel,
        cancelLabel: opts.cancelLabel,
      }, userId);
      log.info(`requestConsent: dispatched requestId=${requestId} userId=${userId} title="${opts.title}"`);
    });
  const prior = consentChainByUser.get(userId) ?? Promise.resolve();
  const result = prior.then(run, run);
  consentChainByUser.set(userId, result.catch(() => undefined));
  return result;
}

const logStateLoadedFor = new Set<string>();
async function ensureLogStateLoaded(userId: string): Promise<void> {
  if (logStateLoadedFor.has(userId)) return;
  await loadPersistedLogState(userStorage(), userId);
  logStateLoadedFor.add(userId);
}
async function listCards(userId: string | undefined): Promise<readonly CardSummary[]> {
  const t0 = Date.now();
  log.info(`listCards: start userId=${userId ?? '<none>'}`);
  if (userId === undefined) {
    log.info(`listCards: userId not yet captured, returning empty`);
    return [];
  }
  const entries = await listLumirealmCharacters(charactersApi(), userId, {
    paginate: true,
  });
  const lang = TRANSLATE_TARGET_LANG;
  const summaries: CardSummary[] = entries.map((e) => {
    const tx = e.data.translations?.[lang]?.name;
    return {
      character_id: e.character.id,
      character_name: e.character.name,
      ...(tx !== undefined ? { translated_character_name: tx } : {}),
      translator_version: e.data.translator_version,
      uses_lua: e.data.payload.requires.lua,
      stored_at: e.data.imported_at,
    };
  });
  summaries.sort((a, b) => b.stored_at - a.stored_at);
  log.info(`listCards: done count=${summaries.length} elapsed=${Date.now() - t0}ms`);
  return summaries;
}

function pushCards(cards: readonly CardSummary[], userId: string | undefined): void {
  send({ type: 'cards_updated', cards }, userId);
}


async function deleteCardByChar(
  characterId: string,
  userId: string | undefined,
  mode: 'soft' | 'cascade' = 'cascade',
): Promise<void> {
  // userId may be a mode-string from a stale caller (TS doesn't catch when both args are string).
  // Reject obvious mismatches to surface that bug at runtime instead of silently mis-routing.
  if (userId === 'soft' || userId === 'cascade') {
    throw new Error(`deleteCardByChar: userId="${userId}" looks like a mode value; caller likely passed args in old order`);
  }
  log.info(`deleteCardByChar: start characterId=${characterId} mode=${mode}`);
  if (mode === 'soft') {
    if (userId !== undefined) {
      const ok = await clearLumirealm(charactersApi(), characterId, userId);
      log.info(`deleteCardByChar: clearLumirealm ok=${ok}`);
    } else {
      log.warn(`deleteCardByChar: soft remove skipped,userId not yet captured for char=${characterId}`);
    }
  }
  // Invalidate cached active-card entries owned by the same user only, so
  // user B's delete cannot wipe user A's cache. Skip when userId unknown.
  let evictedChats = 0;
  if (userId !== undefined) {
    for (const [chatId, active] of activeCardByChat) {
      if (active.card.character_id === characterId && active.ownerUserId === userId) {
        activeCardByChat.delete(chatId);
        clearActiveAssetIndexes(chatId);
        clearActiveCharacterImage(chatId);
        variableState.clearChat(chatId);
        toggleState.clearChat(chatId);
        evictedChats += 1;
      }
    }
  }
  // characterIds are Lumi-wide unique UUIDs, so the compiled-trigger cache
  // is safe to evict from any context (no cross-user collision possible).
  const compiledEvicted = compiledByCharacter.delete(characterId);
  log.info(`deleteCardByChar: evicted activeCard entries=${evictedChats} compiled=${compiledEvicted}`);
  // CHARACTER_DELETED fires before the row is removed; filter defensively.
  const fresh = await listCards(userId);
  const filtered = fresh.filter((c) => c.character_id !== characterId);
  pushCards(filtered, userId);
}

// spindle.on(event, handler) survives syncTriggers() reloads and receives
// every event fired via eventBus.emit(type, payload, userId) for this user.

interface LifecycleEventPayload {
  readonly chatId?: string;
  readonly chat?: { readonly id?: string; readonly character_id?: string };
  readonly characterId?: string;
  readonly character_id?: string;
}

function extractIds(payload: unknown): {
  chatId: string | null;
  characterId: string | null;
} {
  const p = payload as LifecycleEventPayload;
  const chatId = p.chatId ?? p.chat?.id ?? null;
  const characterId = p.characterId ?? p.character_id ?? p.chat?.character_id ?? null;
  return { chatId, characterId };
}

function charactersApi(): SpindleCharactersApi {
  return spindle.characters as unknown as SpindleCharactersApi;
}










// Per-chat memo of the last bg-html signature, dedupes redundant sends across the SETTINGS_UPDATED + CHAT_CHANGED + GENERATION_* fan-out on chat-open.
const lastSentBgHtmlByChat = new Map<string, string>();


function dumpPayload(raw: unknown): string {
  try { return JSON.stringify(raw).slice(0, 400); } catch { return '<unstringifiable>'; }
}

// Capture userId from every event callback so operator-scoped Spindle calls
// succeed before any frontend message arrives.

// Decoupled from bg-html paint so empty-bg cards activate.
function sendSetActiveChat(
  activeChatId: string | null,
  activeCharacterId: string | null,
  userId: string | undefined,
): void {
  try {
    send({ type: 'set_active_chat', chatId: activeChatId, characterId: activeCharacterId }, userId);
  } catch (err) {
    log.warn(`sendSetActiveChat: ${(err as Error).message}`);
  }
}

const nudgeGc = makeNudgeGc(log, errMsg);
const refreshPersonaImage = makeRefreshPersonaImage({ log, errMsg });
const seedAuthorsNoteFromDepthPrompt = makeSeedAuthorsNoteFromDepthPrompt({ log, errMsg });
const maybeFinalizeImport = makeMaybeFinalizeImport({
  pendingImportCompletions,
  send,
  listCards,
  pushCards,
  log,
  errMsg,
});

const activeCardLoader = createActiveCardLoader({
  extensionVersion: EXTENSION_VERSION,
  currentCharacterSchemaVersion: CURRENT_CHARACTER_SCHEMA_VERSION,
  activeCardByChat,
  worldBookIdsByCharacter,
  translatorMigrationChecked,
  repairInFlightByUser,
  readLumirealm: (characterId, userId) => readLumirealm(charactersApi(), characterId, userId),
  preValidateRequires,
  buildVersionError: (missing) => new RisuCompatVersionError(missing, EXTENSION_VERSION),
  loadAttachedModulesForRuntime: (userId, ids) => loadAttachedModulesForRuntime(userId, ids),
  buildSyntheticStoredCard,
  modulesByNamespaceFromCard,
  setActiveAssetIndexes,
  setActiveScriptstateDefaults,
  setActiveModulesByNamespace,
  clearActiveModulesByNamespace,
  setActiveCharacterImage: (chatId, url) => setActiveCharacterImage(chatId, url ?? ''),
  imageUrlFromId,
  backfillImageJournalIfMissing: (charId, avatarId, card, userId) =>
    backfillImageJournalIfMissing(charId, avatarId, card, userId),
  refreshPersonaImage: (userId) => refreshPersonaImage(userId),
  seedAuthorsNoteFromDepthPrompt: (chatId, userId, ext) =>
    seedAuthorsNoteFromDepthPrompt(chatId, userId, ext),
  // Forward-bound: migrationsRunner is wired below, this trampoline calls into it once available.
  runCharacterMigration: (charId, charName, userId, env, opts) =>
    migrationsRunner.runCharacterMigration(charId, charName, userId, env, opts),
  toastFor,
  log,
  errMsg,
});
const ensureActiveCardForChat = activeCardLoader.ensureActiveCardForChat;

const readonlyResolver = createReadonlyResolver({
  activeCardByChat,
  getCachedSettingsSync,
  modulesByNamespaceFromCard,
  log,
  errMsg,
});
const resolveReadonly = readonlyResolver.resolve;

const bgHtmlRefresher = createBgHtmlRefresher({
  resolveReadonly,
  lastSentBgHtmlByChat,
  send,
  log,
  errMsg,
});
const refreshBgHtml = bgHtmlRefresher.refresh;

const applySvgRasterIndex = createApplySvgRasterIndex({
  updateLumirealm: (charId, userId, fn) => updateLumirealm(charactersApi(), charId, userId, fn),
  send,
  appendImageIdsToJournal: (userId, charId, ids) => appendImageIdsToJournal(journalStorage(), userId, charId, ids),
  activeCardByChat,
  ensureActiveCardForChat,
  invalidateRenderMcpForChat,
  refreshBgHtml,
  log,
  errMsg,
});

const variablesTogglesService = createVariablesTogglesService({
  variableState,
  toggleState,
  readLumirealm: (charId, userId) => readLumirealm(charactersApi(), charId, userId),
  readAttachedModuleEnvelopes: (userId, ids) => readAttachedModuleEnvelopes(userId, ids),
  ensureActiveCardForChat,
  refreshBgHtml,
  send,
  log,
  errMsg,
});
const refreshVariables = variablesTogglesService.refreshVariables;
const writeLocalVariable = variablesTogglesService.writeLocalVariable;
const refreshToggleDefinitions = variablesTogglesService.refreshToggleDefinitions;
const writeToggleValue = variablesTogglesService.writeToggleValue;

const triggerDispatcher = createTriggerDispatcher({
  compiledByCharacter,
  getCachedSettingsSync,
  makeStateChangedCallback,
  makeAuxDebugCapture,
  resolveReadonly,
  ensureActiveCardForChat,
  refreshBgHtml,
  refreshVariables,
  toastFor,
  log,
  errMsg,
});
const runBinding = triggerDispatcher.runBinding;
const dispatchManualTrigger = triggerDispatcher.dispatchManualTrigger;
const dispatchButtonClick = triggerDispatcher.dispatchButtonClick;

createLumiInterceptors({
  activeCardByChat,
  lastActiveChatByUser,
  captureUserId,
  ensureActiveCardForChat,
  getCachedSettingsSync,
  modulesByNamespaceFromCard,
  resolveReadonly,
  log,
  errMsg,
}).registerAll();

// SETTINGS_UPDATED activeChatId fires on chat navigation. Warms the active-card cache and renders bg-html.
const lifecycleHandlers = createLifecycleEventHandlers({
  captureUserId,
  extractIds,
  dumpPayload,
  activeCardByChat,
  lastActiveChatByUser,
  lastSentBgHtmlByChat,
  compiledByCharacter,
  worldBookIdsByCharacter,
  variableState,
  toggleState,
  ensureActiveCardForChat,
  invalidateActiveForCharacter,
  invalidateRenderMcpForChat,
  invalidateRenderMcpForMessage,
  invalidateListenEditPreload,
  clearActiveAssetIndexes,
  clearActiveCharacterImage,
  clearActiveScriptstateDefaults,
  clearVarOverlay,
  refreshBgHtml,
  refreshVariables,
  refreshToggleDefinitions,
  runBinding,
  generationEndedBindings: GENERATION_ENDED_BINDINGS,
  consumeOwnChatChange,
  consumeOwnCharacterEdit,
  consumeIfOurWrite,
  send,
  sendSetActiveChat,
  listCards,
  pushCards,
  deleteCardByChar,
  journalStorage,
  readImageJournalFile,
  clearImageJournal,
  buildLiveImageIdSet,
  buildOrphanDetectDepsExcluding,
  deleteImageIds,
  emitOperationProgress,
  chatsGet: (chatId, userId) => spindle.chats.get(chatId, userId) as Promise<{ character_id?: string } | null>,
  log,
  errMsg,
});

spindle.on('SETTINGS_UPDATED', userScoped(lifecycleHandlers.SETTINGS_UPDATED));
spindle.on('CHAT_CHANGED', userScoped(lifecycleHandlers.CHAT_CHANGED));
spindle.on('MESSAGE_SENT', userScoped(lifecycleHandlers.MESSAGE_SENT));
spindle.on('GENERATION_STARTED', userScoped(lifecycleHandlers.GENERATION_STARTED));
spindle.on('GENERATION_ENDED', userScoped(lifecycleHandlers.GENERATION_ENDED));
spindle.on('GENERATION_STOPPED', userScoped(lifecycleHandlers.GENERATION_STOPPED));
spindle.on('MESSAGE_SWIPED', userScoped(lifecycleHandlers.MESSAGE_SWIPED));
spindle.on('MESSAGE_EDITED', userScoped(lifecycleHandlers.MESSAGE_EDITED));
spindle.on('MESSAGE_DELETED', userScoped(lifecycleHandlers.MESSAGE_DELETED));
spindle.on('CHAT_DELETED', userScoped(lifecycleHandlers.CHAT_DELETED));
spindle.on('CHARACTER_DELETED', userScoped(lifecycleHandlers.CHARACTER_DELETED));
spindle.on('CHARACTER_CREATED', userScoped(lifecycleHandlers.CHARACTER_CREATED));
spindle.on('CHARACTER_EDITED', userScoped(lifecycleHandlers.CHARACTER_EDITED));

interface ModuleUploadSession {
  readonly fileName: string;
  readonly totalBytes: number;
  readonly totalChunks: number;
  readonly buffer: (Uint8Array | null)[];
  readonly ownerUserId: string;
  receivedBytes: number;
  receivedChunks: number;
  startedAt: number;
  lastActivity: number;
}
const moduleUploadSessions = new Map<string, ModuleUploadSession>();

function moduleStorage(): import('./state/modules-store.js').UserStorageLike {
  return spindle.userStorage as unknown as import('./state/modules-store.js').UserStorageLike;
}

const moduleUploader = createModuleUploader({
  decodeRisum,
  parseSchema: (data) => risuModuleSchema.safeParse(data) as never,
  newUuid: () => crypto.randomUUID(),
  requestConsent: (opts, userId) => requestConsent(opts, userId),
  pairAssets: pairModuleAssetsForUpload,
  guessMimeType,
  sniffImageMime,
  uploadImageOne: (input, userId) => {
    if (!spindle.images?.upload) {
      throw new Error('spindle.images.upload is unavailable,Lumi 0.9.6+ required.');
    }
    return spindle.images.upload(input, userId);
  },
  ...(typeof spindle.images?.uploadMany === 'function'
    ? {
        uploadImageMany: (items, opts) =>
          spindle.images.uploadMany(items as never, opts),
      }
    : {}),
  appendToJournal: (uid, moduleId, ids) =>
    appendModuleImageIdsToJournal(journalStorage(), uid, moduleId, ids),
  syncWorldBook: (env, uid) => syncModuleWorldBook(env, uid),
  writeEnvelope: async (uid, env) => { await writeModuleEnvelope(moduleStorage(), uid, env); },
  emitProgress: (frame, userId) => send(frame, userId),
  currentTranslatorSchemaVersion: CURRENT_MODULE_SCHEMA_VERSION,
  log,
  errMsg,
});

async function processModuleUpload(
  bytesIn: Uint8Array,
  fileName: string,
  userId: string,
): Promise<{ envelope: ModuleEnvelope }> {
  assetUploadsInFlight++;
  try {
    return await moduleUploader.upload(bytesIn, fileName, userId);
  } finally {
    assetUploadsInFlight--;
  }
}


async function buildAttachedByCharacter(
  userId: string,
  libraryById: ReadonlyMap<string, ModuleSummary>,
): Promise<Record<string, readonly AttachedModuleSummary[]>> {
  const out: Record<string, AttachedModuleSummary[]> = {};
  const entries = await listLumirealmCharacters(charactersApi(), userId, {
    paginate: true,
  });
  for (const e of entries) {
    const ids = e.data.user_overrides.attached_module_ids ?? [];
    if (ids.length === 0) {
      out[e.character.id] = [];
      continue;
    }
    const list: AttachedModuleSummary[] = [];
    for (const id of ids) {
      const sum = libraryById.get(id);
      if (sum) {
        list.push({
          id: sum.id,
          name: sum.name,
          ...(sum.translatedName !== undefined ? { translatedName: sum.translatedName } : {}),
        });
      } else {
        // Module was deleted from the library while still referenced.
        // Surface so the user can see + clean up.
        list.push({ id, name: '(missing, module deleted from library)' });
      }
    }
    out[e.character.id] = list;
  }
  return out;
}

async function pushModules(userId: string): Promise<void> {
  const indexEntries = await listModuleStore(moduleStorage(), userId);
  const lang = TRANSLATE_TARGET_LANG;
  const wire: ModuleSummary[] = indexEntries.map((e) => {
    const translatedName = e.translatedName?.[lang];
    const translatedDescription = e.translatedDescription?.[lang];
    return {
      id: e.id,
      name: e.name,
      description: e.description,
      ...(translatedName !== undefined ? { translatedName } : {}),
      ...(translatedDescription !== undefined ? { translatedDescription } : {}),
      filename: e.filename,
      uploaded_at: e.uploaded_at,
      lorebook_count: e.lorebook_count,
      regex_count: e.regex_count,
      trigger_count: e.trigger_count,
      asset_count: e.asset_count,
      low_level_access: e.low_level_access,
      has_cjs: e.has_cjs,
    };
  });
  const byId = new Map(wire.map((w) => [w.id, w]));
  const attached = await buildAttachedByCharacter(userId, byId);
  send({ type: 'modules_pushed', modules: wire, attached_by_character: attached }, userId);
}

const TRANSLATE_TARGET_LANG = 'en';

const viewerAssembly = createViewerAssembly({
  readLumirealm: (characterId, userId) => readLumirealm(charactersApi(), characterId, userId),
  readModule: async (moduleId, userId) =>
    readModuleEnvelope(moduleStorage(), userId, moduleId) as unknown as Awaited<ReturnType<typeof readModuleEnvelope>> as never,
  fetchCharacter: async (characterId, userId) =>
    spindle.characters.get(characterId, userId) as unknown as { world_book_ids?: unknown } | null,
  fetchWorldBookMeta: async (wbId, userId) =>
    spindle.world_books.get(wbId, userId) as unknown as { name?: unknown } | null,
  listWorldBookEntries: (wbId, opts) => spindle.world_books.entries.list(wbId, opts),
  translateLang: TRANSLATE_TARGET_LANG,
  log,
  errMsg,
});

async function persistModuleTranslation(
  userId: string,
  msg: Extract<import('./types/messages.js').FrontendToBackend, { type: 'cache_module_translation' }>,
): Promise<void> {
  const env = await readModuleEnvelope(moduleStorage(), userId, msg.moduleId);
  if (!env) {
    log.warn(`cache_module_translation: module=${msg.moduleId} not found`);
    return;
  }
  const lang = msg.lang || TRANSLATE_TARGET_LANG;
  const nextLang = mergeLangBlock({
    existing: env.translations?.[lang] ?? {},
    ...(msg.name !== undefined ? { name: msg.name } : {}),
    ...(msg.description !== undefined ? { description: msg.description } : {}),
    ...(msg.lorebook !== undefined ? { lorebookItems: msg.lorebook } : {}),
  });
  const next: typeof env = {
    ...env,
    translations: { ...(env.translations ?? {}), [lang]: nextLang },
  };
  await writeModuleEnvelope(moduleStorage(), userId, next);
  await pushModules(userId);
}

async function persistCharacterTranslation(
  userId: string,
  msg: Extract<import('./types/messages.js').FrontendToBackend, { type: 'cache_character_translation' }>,
): Promise<void> {
  const fetched = await readLumirealm(charactersApi(), msg.characterId, userId);
  if (!fetched || !fetched.data) {
    log.warn(`cache_character_translation: character=${msg.characterId} not lumirealm`);
    return;
  }
  const lang = msg.lang || TRANSLATE_TARGET_LANG;
  const existing = fetched.data.translations?.[lang] ?? {};
  const nameChanged = msg.name !== undefined && msg.name !== existing.name;
  const nextLang = mergeLangBlock({
    existing,
    ...(msg.name !== undefined ? { name: msg.name } : {}),
    ...(msg.lorebook !== undefined ? { lorebookItems: msg.lorebook } : {}),
  });
  const nextData = {
    ...fetched.data,
    translations: {
      ...(fetched.data.translations ?? {}),
      [lang]: nextLang,
    },
  };
  expectCharacterEdit(msg.characterId);
  await writeLumirealm(charactersApi(), msg.characterId, nextData, userId);
  if (nameChanged) {
    pushCards(await listCards(userId), userId);
  }
}

async function pushAttachedForCharacter(
  characterId: string,
  userId: string,
): Promise<void> {
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  if (!fetched || !fetched.data) {
    send({
      type: 'attached_modules_pushed',
      characterId,
      attached: [],
    }, userId);
    return;
  }
  const ids = fetched.data.user_overrides.attached_module_ids ?? [];
  const indexEntries = await listModuleStore(moduleStorage(), userId);
  const byId = new Map(indexEntries.map((e) => [e.id, e]));
  const lang = TRANSLATE_TARGET_LANG;
  const list: AttachedModuleSummary[] = ids.map((id) => {
    const e = byId.get(id);
    if (!e) return { id, name: '(missing, module deleted from library)' };
    const tx = e.translatedName?.[lang];
    return { id, name: e.name, ...(tx !== undefined ? { translatedName: tx } : {}) };
  });
  send({ type: 'attached_modules_pushed', characterId, attached: list }, userId);
}

async function attachModuleToCharacter(
  characterId: string,
  moduleId: string,
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
  if (!env) return { ok: false, reason: `module ${moduleId} not in library` };
  const updated = await updateLumirealm(charactersApi(), characterId, userId, (cur) => {
    const ids = cur.user_overrides.attached_module_ids ?? [];
    if (ids.includes(moduleId)) return cur;
    return {
      ...cur,
      user_overrides: mergeUserOverrides(
        cur.user_overrides,
        buildAttachModulePatch(cur.user_overrides, moduleId, env.installed_world_book_id ?? null),
      ),
    };
  });
  if (!updated) return { ok: false, reason: 'character is not a lumirealm card' };
  if (env.installed_world_book_id) {
    await addWorldBookToCharacter(characterId, env.installed_world_book_id, userId).catch((err) => {
      log.warn(`attachModuleToCharacter: addWorldBookToCharacter failed char=${characterId} module=${moduleId}: ${errMsg(err)}`);
    });
  }
  invalidateActiveForCharacter(characterId, userId);
  await dispatchModuleArtifactInstall(characterId, env, userId);
  await refreshRisuAssetMap(characterId, userId);
  return { ok: true };
}

async function detachModuleFromCharacter(
  characterId: string,
  moduleId: string,
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  if (!fetched || !fetched.data) {
    return { ok: false, reason: 'character is not a lumirealm card' };
  }
  const wbId = fetched.data.user_overrides.attached_module_world_books?.[moduleId] ?? null;
  const regexIds =
    fetched.data.user_overrides.attached_module_regex_script_ids?.[moduleId] ?? [];
  const updated = await updateLumirealm(charactersApi(), characterId, userId, (cur) => {
    const ids = cur.user_overrides.attached_module_ids ?? [];
    if (!ids.includes(moduleId)) return cur;
    return {
      ...cur,
      user_overrides: mergeUserOverrides(
        cur.user_overrides,
        buildDetachModulesPatch(cur.user_overrides, [moduleId]),
      ),
    };
  });
  if (!updated) return { ok: false, reason: 'character is not a lumirealm card' };
  invalidateActiveForCharacter(characterId, userId);
  if (wbId) {
    await removeWorldBookFromCharacter(characterId, wbId, userId).catch((err) => {
      log.warn(`detachModuleFromCharacter: removeWorldBookFromCharacter failed char=${characterId}: ${errMsg(err)}`);
    });
    const env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
    if (env && env.installed_world_book_id !== wbId) {
      try {
        await spindle.world_books.delete(wbId, userId);
        log.info(`detachModuleFromCharacter: deleted legacy per-char world_book wb=${wbId}`);
      } catch (err) {
        log.warn(`detachModuleFromCharacter: legacy world_book delete failed wb=${wbId}: ${errMsg(err)}`);
      }
    }
  }
  if (regexIds.length > 0) {
    send({ type: 'uninstall_module_artifacts', characterId, moduleId, worldBookId: null, regexScriptIds: regexIds }, userId);
  }
  await refreshRisuAssetMap(characterId, userId);
  return { ok: true };
}

function assetStem(name: string): string {
  const base = name.split('/').pop() || name;
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(0, dot) : base;
}

function setMapKey(map: Record<string, string>, name: string, id: string): void {
  if (!id) return;
  map[name] = id;
  const stem = assetStem(name);
  if (stem !== name && !(stem in map)) map[stem] = id;
}

async function refreshRisuAssetMap(characterId: string, userId: string): Promise<void> {
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  if (!fetched || !fetched.data) return;
  const data = fetched.data;
  const map: Record<string, string> = {};
  const moduleIds = data.user_overrides.attached_module_ids ?? [];
  for (const modId of moduleIds) {
    const env = await readModuleEnvelope(moduleStorage(), userId, modId);
    if (!env) continue;
    for (const [name, ref] of Object.entries(env.asset_index)) {
      if (typeof ref?.imageId === 'string' && ref.imageId.length > 0) {
        setMapKey(map, name, ref.imageId);
      }
    }
  }
  for (const [name, entry] of Object.entries(data.asset_index)) {
    const id = entry.imageIds[0];
    if (typeof id === 'string' && id.length > 0) setMapKey(map, name, id);
  }
  for (const [name, entry] of Object.entries(data.emotion_index)) {
    const id = entry.imageIds[0];
    if (typeof id === 'string' && id.length > 0) setMapKey(map, name, id);
  }
  expectCharacterEdit(characterId);
  try {
    await spindle.characters.update(
      characterId,
      { extensions: { risu_asset_map: map } } as never,
      userId,
    );
    const ids = Object.values(map);
    const dist: Record<string, number> = {};
    for (const id of ids) dist[id] = (dist[id] ?? 0) + 1;
    const top = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 3);
    log.trace(
      `refreshRisuAssetMap: char=${characterId} entries=${ids.length} ` +
        `unique_image_ids=${new Set(ids).size} ` +
        `top3=${top.map(([id, n]) => `${id.slice(0, 8)}…(${n})`).join(',')}`,
    );
  } catch (err) {
    log.warn(`refreshRisuAssetMap: char=${characterId} update failed: ${errMsg(err)}`);
  }
}

const lorebookImporter = createLorebookImporter({
  readLumirealm: (characterId, userId) => readLumirealm(charactersApi(), characterId, userId),
  createWorldBook: (input, userId) => spindle.world_books.create(input, userId),
  updateCharacterWorldBookIds: async (characterId, ids, userId) => {
    expectCharacterEdit(characterId);
    await spindle.characters.update(
      characterId,
      { world_book_ids: ids } as never,
      userId,
    );
  },
  createWorldBookEntry: (bookId, input, userId) =>
    spindle.world_books.entries.create(bookId, input as never, userId),
  send,
  log,
  errMsg,
  parseDirectLorebook,
  mapLoreBook,
});

function projectModuleLorebookForCreate(
  rawLorebook: readonly unknown[],
  moduleId: string,
  worldBookId: string,
): readonly Record<string, unknown>[] {
  const valid: LoreBook[] = [];
  for (const raw of rawLorebook) {
    const parsed = loreBookSchema.safeParse(raw);
    if (!parsed.success) continue;
    const lb = parsed.data;
    if (lb.key.length === 0 && lb.content.length === 0) continue;
    valid.push(lb);
  }
  const entries = mapLoreBook(valid, { worldBookId });
  return entries.map((e) => ({
    ...e,
    extensions: { ...(e.extensions ?? {}), _risu_module_id: moduleId },
  }));
}

// Snapshot a wb's entries into a detached, clearly-labeled standalone wb so
// user edits survive a destructive in-place migration. Returns the archive wb
// id, or null when nothing to archive (empty source or no detected edits).
async function archiveWorldBookIfEdited(
  sourceWbId: string,
  archiveName: string,
  userId: string,
  context: string,
): Promise<string | null> {
  const allEntries: unknown[] = [];
  let offset = 0;
  while (true) {
    const page = await spindle.world_books.entries.list(sourceWbId, { limit: 200, offset, userId });
    if (page.data.length === 0) break;
    allEntries.push(...page.data);
    if (page.data.length < 200) break;
    offset += 200;
  }
  if (allEntries.length === 0) return null;
  if (!hasUserEditedAnyEntry(allEntries)) {
    log.info(`archive(${context}): skip,no user edits detected across ${allEntries.length} entries`);
    return null;
  }
  const archive = await spindle.world_books.create({ name: archiveName }, userId);
  let copied = 0;
  for (const e of allEntries) {
    const { id: _id, world_book_id: _wbId, ...rest } = e as Record<string, unknown>;
    void _id;
    void _wbId;
    try {
      await spindle.world_books.entries.create(archive.id, rest as never, userId);
      copied++;
    } catch (err) {
      log.warn(`archive(${context}): copy entry failed: ${errMsg(err)}`);
    }
  }
  log.info(
    `archive(${context}): archived=${copied}/${allEntries.length} ` +
      `wb=${archive.id} name="${archive.name}"`,
  );
  return archive.id;
}

async function archiveModuleWorldBookBeforeMigration(
  env: ModuleEnvelope,
  userId: string,
): Promise<string | null> {
  const wbId = env.installed_world_book_id;
  if (!wbId) return null;
  const m = env.module as { name?: unknown };
  const moduleName = typeof m.name === 'string' && m.name.length > 0 ? m.name : env.id;
  const stamp = new Date().toISOString().slice(0, 10);
  return archiveWorldBookIfEdited(
    wbId,
    `[LumiRealm Backup ${stamp}] Module: ${moduleName}`,
    userId,
    `module=${env.id}`,
  );
}

async function syncModuleWorldBook(
  env: ModuleEnvelope,
  userId: string,
): Promise<string | null> {
  const m = env.module as { name?: unknown; lorebook?: readonly unknown[] };
  const lorebook = Array.isArray(m.lorebook) ? m.lorebook : [];
  const existingId = env.installed_world_book_id;
  if (lorebook.length === 0) {
    if (existingId) {
      await deleteModuleWorldBookEverywhere(env.id, existingId, userId);
    }
    return null;
  }
  const moduleName = typeof m.name === 'string' && m.name.length > 0 ? m.name : env.id;
  if (existingId) {
    try {
      let offset = 0;
      while (true) {
        const page = await spindle.world_books.entries.list(existingId, { limit: 200, offset, userId });
        if (page.data.length === 0) break;
        for (const e of page.data) {
          await spindle.world_books.entries.delete(e.id, userId).catch(() => undefined);
        }
        if (page.data.length < 200) break;
      }
      await spindle.world_books.update(existingId, { name: `Module: ${moduleName}` }, userId).catch(() => undefined);
      const projected = projectModuleLorebookForCreate(lorebook, env.id, existingId);
      for (const entry of projected) {
        await spindle.world_books.entries.create(existingId, entry as never, userId);
      }
      log.info(`syncModuleWorldBook: refreshed module=${env.id} wb=${existingId} entries=${projected.length}/${lorebook.length}`);
      return existingId;
    } catch (err) {
      log.warn(`syncModuleWorldBook: refresh failed module=${env.id} wb=${existingId}: ${errMsg(err)},recreating`);
      await deleteModuleWorldBookEverywhere(env.id, existingId, userId);
    }
  }
  const wb = await spindle.world_books.create({ name: `Module: ${moduleName}` }, userId);
  const projected = projectModuleLorebookForCreate(lorebook, env.id, wb.id);
  for (const entry of projected) {
    await spindle.world_books.entries.create(wb.id, entry as never, userId);
  }
  log.info(`syncModuleWorldBook: created module=${env.id} wb=${wb.id} entries=${projected.length}/${lorebook.length}`);
  return wb.id;
}

async function deleteModuleWorldBookEverywhere(
  moduleId: string,
  worldBookId: string,
  userId: string,
): Promise<void> {
  const attached = await charactersAttachedTo(moduleId, userId);
  for (const charId of attached) {
    await removeWorldBookFromCharacter(charId, worldBookId, userId);
  }
  try {
    await spindle.world_books.delete(worldBookId, userId);
  } catch (err) {
    log.warn(`deleteModuleWorldBookEverywhere: delete wb=${worldBookId} failed: ${errMsg(err)}`);
  }
}

async function addWorldBookToCharacter(
  characterId: string,
  worldBookId: string,
  userId: string,
): Promise<void> {
  const c = await spindle.characters.get(characterId, userId);
  if (!c) return;
  const ids = (c.world_book_ids ?? []).filter((x): x is string => typeof x === 'string');
  if (ids.includes(worldBookId)) return;
  expectCharacterEdit(characterId);
  await spindle.characters.update(
    characterId,
    { world_book_ids: [...ids, worldBookId] } as never,
    userId,
  );
}

async function removeWorldBookFromCharacter(
  characterId: string,
  worldBookId: string,
  userId: string,
): Promise<void> {
  const c = await spindle.characters.get(characterId, userId);
  if (!c) return;
  const ids = (c.world_book_ids ?? []).filter((x): x is string => typeof x === 'string');
  if (!ids.includes(worldBookId)) return;
  expectCharacterEdit(characterId);
  await spindle.characters.update(
    characterId,
    { world_book_ids: ids.filter((id) => id !== worldBookId) } as never,
    userId,
  );
}

async function dispatchModuleArtifactInstall(
  characterId: string,
  env: ModuleEnvelope,
  userId: string | undefined,
): Promise<void> {
  const m = env.module as {
    name?: unknown;
    regex?: readonly unknown[];
  };
  const moduleName = typeof m.name === 'string' && m.name.length > 0
    ? m.name
    : env.id;
  const regexScripts = projectModuleRegexEntries(
    env.id,
    moduleName,
    characterId,
    m.regex,
    () => cryptoUuidLocal(),
  );
  if (regexScripts.length === 0) {
    log.info(
      `dispatchModuleArtifactInstall: module=${env.id} char=${characterId} no regex to install`,
    );
    return;
  }
  const lorebookEntries: never[] = [];
  log.info(
    `dispatchModuleArtifactInstall: module=${env.id} char=${characterId} ` +
      `lorebookEntries=${lorebookEntries.length} regexScripts=${regexScripts.length}`,
  );
  send({
    type: 'install_module_artifacts',
    characterId,
    moduleId: env.id,
    worldBookName: `Module: ${moduleName}`,
    lorebookEntries,
    regexScripts,
  }, userId);
}

function cryptoUuidLocal(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `mod-rx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function invalidateActiveForCharacter(characterId: string, userId: string | undefined): void {
  // Only evict entries owned by the same user, so user B's invalidation can't
  // wipe user A's cache. Without a userId we can't attribute, so skip.
  if (userId === undefined) {
    log.warn(`invalidateActiveForCharacter: skipped char=${characterId} (no userId)`);
    return;
  }
  let evicted = 0;
  const evictedChats: string[] = [];
  for (const [chatId, active] of activeCardByChat) {
    if (active.card.character_id === characterId && active.ownerUserId === userId) {
      activeCardByChat.delete(chatId);
      clearActiveAssetIndexes(chatId);
      clearActiveCharacterImage(chatId);
      variableState.clearChat(chatId);
      toggleState.clearChat(chatId);
      lastSentBgHtmlByChat.delete(chatId);
      evictedChats.push(chatId);
      evicted += 1;
    }
  }
  compiledByCharacter.delete(characterId);
  log.info(`invalidateActiveForCharacter: char=${characterId} evictedChats=${evicted}`);
  for (const chatId of evictedChats) {
    void (async () => {
      const reactivated = await ensureActiveCardForChat(chatId, null, userId);
      if (reactivated) {
        await refreshToggleDefinitions(reactivated, chatId, userId, { force: true });
        await refreshBgHtml(reactivated, chatId, userId);
      }
    })();
  }
}

/** Returns IDs of characters that attach `moduleId`. */
async function charactersAttachedTo(
  moduleId: string,
  userId: string,
): Promise<readonly string[]> {
  const entries = await listLumirealmCharacters(charactersApi(), userId, {
    paginate: true,
  });
  const out: string[] = [];
  for (const e of entries) {
    const ids = e.data.user_overrides.attached_module_ids ?? [];
    if (ids.includes(moduleId)) out.push(e.character.id);
  }
  return out;
}

// MUST NOT delete the module's world_book: it is shared across every
// character attached to the module, so dropping it here destroys lore.
async function refreshAttachedModule(
  characterId: string,
  env: ModuleEnvelope,
  userId: string,
): Promise<void> {
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  if (!fetched || !fetched.data) return;
  const regexIds =
    fetched.data.user_overrides.attached_module_regex_script_ids?.[env.id] ?? [];
  await updateLumirealm(charactersApi(), characterId, userId, (cur) => {
    const rx = { ...(cur.user_overrides.attached_module_regex_script_ids ?? {}) };
    delete rx[env.id];
    return {
      ...cur,
      user_overrides: mergeUserOverrides(cur.user_overrides, {
        attached_module_regex_script_ids: Object.keys(rx).length > 0 ? rx : null,
      }),
    };
  });
  if (regexIds.length > 0) {
    send({
      type: 'uninstall_module_artifacts',
      characterId,
      moduleId: env.id,
      worldBookId: null,
      regexScriptIds: regexIds,
    }, userId);
  }
  await dispatchModuleArtifactInstall(characterId, env, userId);
  invalidateActiveForCharacter(characterId, userId);
  await refreshRisuAssetMap(characterId, userId);
}

const migrationsRunner = createMigrationsRunner({
  extensionVersion: EXTENSION_VERSION,
  currentModuleSchemaVersion: CURRENT_MODULE_SCHEMA_VERSION,
  translatorMigrationChecked,
  send,
  readModuleEnvelope: (userId, moduleId) => readModuleEnvelope(moduleStorage(), userId, moduleId),
  writeModuleEnvelope: async (userId, env) => { await writeModuleEnvelope(moduleStorage(), userId, env); },
  dispatchModuleArtifactInstall: (charId, env, userId) => dispatchModuleArtifactInstall(charId, env, userId),
  writeLumirealm: (charId, data, userId) => writeLumirealm(charactersApi(), charId, data, userId),
  invalidateActiveForCharacter,
  toastFor,
  archiveModuleWorldBookBeforeMigration: (env, userId) => archiveModuleWorldBookBeforeMigration(env, userId),
  syncModuleWorldBook: (env, userId) => syncModuleWorldBook(env, userId),
  charactersAttachedTo: (moduleId, userId) => charactersAttachedTo(moduleId, userId),
  refreshAttachedModule: (charId, env, userId) => refreshAttachedModule(charId, env, userId),
  // Forward-bound: massMigrations supplies the actual archive notifier below, this trampoline calls into it once wired.
  notifyLorebookMigrationArchive: (label, wbId, uid) => massMigrations.notifyLorebookMigrationArchive(label, wbId, uid),
  log,
  errMsg,
});
const runCharacterMigration = migrationsRunner.runCharacterMigration;
const runModuleMigration = migrationsRunner.runModuleMigration;

const massMigrations = createMassMigrationsRunner({
  currentCharacterSchemaVersion: CURRENT_CHARACTER_SCHEMA_VERSION,
  currentModuleSchemaVersion: CURRENT_MODULE_SCHEMA_VERSION,
  translatorMigrationChecked,
  moduleStorage,
  listModules: (userId) => listModuleStore(moduleStorage(), userId),
  readModuleEnvelope: (userId, moduleId) => readModuleEnvelope(moduleStorage(), userId, moduleId),
  listLumirealmCharacters: async (userId) => {
    const all = await listLumirealmCharacters(charactersApi(), userId, { paginate: true });
    return all.map((e) => ({
      character: { id: e.character.id, name: e.character.name ?? null },
      data: e.data,
    }));
  },
  runModuleMigration,
  runCharacterMigration,
  emitOperationProgress,
  queueModalConfirm,
  toastFor,
  log,
  errMsg,
});

const repairOrchestrator = createRepairOrchestrator({
  listLumirealmCharacters: async (userId) => {
    const entries = await listLumirealmCharacters(charactersApi(), userId, { paginate: true });
    return entries.map((e) => ({
      character: { id: e.character.id, name: e.character.name ?? undefined },
      data: e.data,
    }));
  },
  writeLumirealm: (characterId, data, userId) => writeLumirealm(charactersApi(), characterId, data, userId),
  readLumirealm: (characterId, userId) => readLumirealm(charactersApi(), characterId, userId),
  updateLumirealm: (characterId, userId, fn) => updateLumirealm(charactersApi(), characterId, userId, fn),
  mergeUserOverrides: (base, patch) => mergeUserOverrides(base, patch as never),
  buildDetachModulesPatch: (base, ids) => buildDetachModulesPatch(base, ids) as never,
  runCharacterMigration: (charId, charName, userId, env, opts) =>
    runCharacterMigration(charId, charName, userId, env, opts),
  readModuleEnvelope: (userId, moduleId) => readModuleEnvelope(moduleStorage(), userId, moduleId),
  refreshAttachedModule: (charId, env, userId) => refreshAttachedModule(charId, env, userId),
  translatorMigrationChecked,
  listStaleCharRegexIds,
  deleteRegexIds,
  sweepOrphanModuleRegex,
  clearDeadJournals,
  send,
  emitOperationProgress,
  log,
  errMsg,
});
void repairOrchestrator.forceRetranslateAll;
void repairOrchestrator.scrubDanglingModuleRefs;
const applyRepair = repairOrchestrator.applyRepair;

async function detachModuleFromAllCharacters(
  moduleId: string,
  userId: string,
): Promise<readonly string[]> {
  const entries = await listLumirealmCharacters(charactersApi(), userId, {
    paginate: true,
  });
  const touched: string[] = [];
  for (const e of entries) {
    const ids = e.data.user_overrides.attached_module_ids ?? [];
    if (!ids.includes(moduleId)) continue;
      const wbId =
      e.data.user_overrides.attached_module_world_books?.[moduleId] ?? null;
    const regexIds =
      e.data.user_overrides.attached_module_regex_script_ids?.[moduleId] ?? [];
    await updateLumirealm(charactersApi(), e.character.id, userId, (cur) => ({
      ...cur,
      user_overrides: mergeUserOverrides(
        cur.user_overrides,
        buildDetachModulesPatch(cur.user_overrides, [moduleId]),
      ),
    }));
    invalidateActiveForCharacter(e.character.id, userId);
    if (wbId) {
      await removeWorldBookFromCharacter(e.character.id, wbId, userId).catch((err) => {
        log.warn(`detachModuleFromAllCharacters: removeWorldBookFromCharacter failed char=${e.character.id}: ${errMsg(err)}`);
      });
    }
    if (regexIds.length > 0) {
      send({
        type: 'uninstall_module_artifacts',
        characterId: e.character.id,
        moduleId,
        worldBookId: null,
        regexScriptIds: regexIds,
      }, userId);
    }
    touched.push(e.character.id);
  }
  return touched;
}

type AssetMutationMessage =
  | Extract<FrontendToBackend, { type: 'add_asset' }>
  | Extract<FrontendToBackend, { type: 'add_assets' }>
  | Extract<FrontendToBackend, { type: 'rename_asset' }>
  | Extract<FrontendToBackend, { type: 'delete_asset' }>;

async function mutateAssetIndex(
  msg: AssetMutationMessage,
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (msg.source.kind === 'character') {
    const characterId = msg.source.characterId;
    const updated = await updateLumirealm(charactersApi(), characterId, userId, (cur) => {
      const before = cur.asset_index;
      if (msg.type === 'add_assets') {
        let working = before;
        for (const e of msg.entries) {
          const r = addAssetToCharacterIndex(working, e.assetName, e.imageId, e.ext);
          if (r.ok) working = r.index;
          else log.warn(`add_assets (character ${characterId}): "${e.assetName}" skipped,${r.reason}`);
        }
        return { ...cur, asset_index: working };
      }
      let result;
      switch (msg.type) {
        case 'add_asset':
          result = addAssetToCharacterIndex(before, msg.assetName, msg.imageId, msg.ext);
          break;
        case 'rename_asset':
          result = renameCharacterAsset(before, msg.oldName, msg.newName);
          break;
        case 'delete_asset':
          result = deleteCharacterAsset(before, msg.assetName);
          break;
      }
      if (!result.ok) {
        log.warn(
          `mutateAssetIndex (character ${characterId}): ${msg.type} failed,${result.reason}`,
        );
        return cur;
      }
      return { ...cur, asset_index: result.index };
    });
    if (!updated) return { ok: false, reason: 'character is not a lumirealm card' };
    return { ok: true };
  }

  const moduleId = msg.source.moduleId;
  const env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
  if (!env) return { ok: false, reason: `module ${moduleId} not in library` };
  if (msg.type === 'add_assets') {
    let working = env.asset_index;
    for (const e of msg.entries) {
      const r = addAssetToModuleIndex(working, e.assetName, e.imageId, e.ext);
      if (r.ok) working = r.index;
      else log.warn(`add_assets (module ${moduleId}): "${e.assetName}" skipped,${r.reason}`);
    }
    const nextEnv = { ...env, asset_index: working };
    await writeModuleEnvelope(moduleStorage(), userId, nextEnv);
    await pushModules(userId);
    return { ok: true };
  }
  let result;
  switch (msg.type) {
    case 'add_asset':
      result = addAssetToModuleIndex(env.asset_index, msg.assetName, msg.imageId, msg.ext);
      break;
    case 'rename_asset':
      result = renameModuleAsset(env.asset_index, msg.oldName, msg.newName);
      break;
    case 'delete_asset':
      result = deleteModuleAsset(env.asset_index, msg.assetName);
      break;
  }
  if (!result.ok) {
    return { ok: false, ...(result.reason !== undefined ? { reason: result.reason } : {}) };
  }
  const nextEnv = { ...env, asset_index: result.index };
  await writeModuleEnvelope(moduleStorage(), userId, nextEnv);
  // Push fresh modules list (asset_count summary changes).
  await pushModules(userId);
  return { ok: true };
}


async function mutateTriggerLua(
  msg: Extract<FrontendToBackend, { type: 'set_trigger_lua' }>,
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (msg.source.kind === 'character') {
    const characterId = msg.source.characterId;
    let outcome: { ok: boolean; reason?: string } = { ok: true };
    const updated = await updateLumirealm(charactersApi(), characterId, userId, (cur) => {
      const r = replaceTriggerLuaInArray(cur.payload.triggers, msg.triggerIndex, msg.lua);
      if (!r.ok || !r.triggers) {
        outcome = { ok: false, ...(r.reason ? { reason: r.reason } : {}) };
        return cur;
      }
      // Keep `lua_scripts[i]` in sync  - runtime reads it by trigger
      // index. Re-derive only the affected entry; others stay
      // verbatim.
      const newLua = extractLuaForTrigger(r.triggers[msg.triggerIndex]);
      const nextLuaScripts = [...cur.payload.lua_scripts];
      while (nextLuaScripts.length <= msg.triggerIndex) nextLuaScripts.push('');
      nextLuaScripts[msg.triggerIndex] = newLua;
      // requires.lua becomes the OR of "any non-empty lua_script".
      // Recompute defensively after mutation.
      const requiresLua = nextLuaScripts.some((s) => s.length > 0);
      return {
        ...cur,
        payload: {
          ...cur.payload,
          triggers: r.triggers,
          lua_scripts: nextLuaScripts,
          requires: { ...cur.payload.requires, lua: requiresLua },
        },
      };
    });
    if (!updated) {
      return outcome.ok
        ? { ok: false, reason: 'character is not a lumirealm card' }
        : outcome;
    }
    return outcome;
  }

  const moduleId = msg.source.moduleId;
  const env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
  if (!env) return { ok: false, reason: `module ${moduleId} not in library` };
  const moduleBody = env.module as { trigger?: readonly unknown[] };
  const r = replaceTriggerLuaInArray(
    moduleBody.trigger ?? [],
    msg.triggerIndex,
    msg.lua,
  );
  if (!r.ok || !r.triggers) {
    return { ok: false, ...(r.reason ? { reason: r.reason } : {}) };
  }
  const nextEnv = {
    ...env,
    module: {
      ...(env.module as Record<string, unknown>),
      trigger: r.triggers,
    } as typeof env.module,
  };
  await writeModuleEnvelope(moduleStorage(), userId, nextEnv);
  await pushModules(userId);
  return { ok: true };
}

const viewerPushDeps: ViewerPushDeps = {
  assembleCharacter: (characterId, userId) => viewerAssembly.assembleCharacter(characterId, userId),
  assembleModule: (moduleId, userId) => viewerAssembly.assembleModule(moduleId, userId),
  send,
  warn: (m) => log.warn(m),
  errMsg,
};

export async function readAttachedModuleEnvelopes(
  userId: string,
  attachedIds: readonly string[],
): Promise<readonly ModuleEnvelope[]> {
  if (attachedIds.length === 0) return [];

  const directHits: ModuleEnvelope[] = [];
  const seenIds = new Set<string>();
  const missingHandles: string[] = [];
  for (const id of attachedIds) {
    const env = await readModuleEnvelope(moduleStorage(), userId, id);
    if (env && !seenIds.has(env.id)) {
      directHits.push(env);
      seenIds.add(env.id);
    } else if (!env) {
      missingHandles.push(id);
    }
  }

  if (missingHandles.length === 0) return directHits;

  // Namespace fallback: Risu modules.ts. Re-uploaded module with
  // namespace="<old-id>" resolves transparently without re-attach.
  let library: readonly ModuleIndexEntry[] = [];
  try {
    library = await listModuleStore(moduleStorage(), userId);
  } catch (err) {
    log.warn(
      `readAttachedModuleEnvelopes: namespace fallback list failed: ${(err as Error).message}`,
    );
    return directHits;
  }

  const missingSet = new Set(missingHandles);
  const fallback: ModuleEnvelope[] = [];
  for (const summary of library) {
    if (seenIds.has(summary.id)) continue;
    const env = await readModuleEnvelope(moduleStorage(), userId, summary.id);
    if (!env) continue;
    const ns = (env.module as { namespace?: unknown }).namespace;
    if (typeof ns === 'string' && ns.length > 0 && missingSet.has(ns)) {
      fallback.push(env);
      seenIds.add(env.id);
      log.info(
        `readAttachedModuleEnvelopes: namespace match,handle="${ns}" → module id=${env.id} ` +
          `(transparent replacement / aliasing)`,
      );
    }
  }

  for (const h of missingHandles) {
    const matched = fallback.some((env) => {
      const ns = (env.module as { namespace?: unknown }).namespace;
      return typeof ns === 'string' && ns === h;
    });
    if (!matched) {
      log.warn(
        `readAttachedModuleEnvelopes: handle "${h}" did not resolve via id or namespace,skipping`,
      );
    }
  }

  return [...directHits, ...fallback];
}

async function loadAttachedModulesForRuntime(
  userId: string,
  attachedIds: readonly string[],
): Promise<readonly import('./state/lumirealm-character.js').AttachedModuleForRuntime[]> {
  const envelopes = await readAttachedModuleEnvelopes(userId, attachedIds);
  return envelopes.map((env) => {
    const m = env.module as {
      trigger?: readonly unknown[];
      lowLevelAccess?: unknown;
      customModuleToggle?: unknown;
      name?: unknown;
      backgroundEmbedding?: unknown;
      namespace?: unknown;
    };
    const triggers = Array.isArray(m.trigger) ? (m.trigger as readonly unknown[]) : [];
    const lua_scripts = triggers.map((t) => {
      const tEff = (t as { effect?: readonly unknown[] }).effect ?? [];
      const parts: string[] = [];
      for (const e of tEff) {
        const eo = e as { type?: string; code?: string };
        if (eo.type === 'triggerlua' && typeof eo.code === 'string') {
          parts.push(eo.code);
        }
      }
      return parts.join('\n');
    });
    const runtimeAssetIndex: Record<string, AssetIndexEntry> = {};
    for (const [name, ref] of Object.entries(env.asset_index)) {
      runtimeAssetIndex[name] = {
        imageIds: [ref.imageId],
        ...(ref.ext !== undefined ? { ext: ref.ext } : {}),
      };
    }
    return {
      id: env.id,
      triggers,
      lua_scripts,
      asset_index: runtimeAssetIndex,
      low_level_access: m.lowLevelAccess === true,
      ...(typeof m.customModuleToggle === 'string' && m.customModuleToggle.length > 0
        ? { custom_module_toggle: m.customModuleToggle }
        : {}),
      ...(typeof m.name === 'string' && m.name.length > 0
        ? { display_name: m.name }
        : {}),
      ...(typeof m.backgroundEmbedding === 'string' && m.backgroundEmbedding.length > 0
        ? { background_embedding: m.backgroundEmbedding }
        : {}),
      ...(typeof m.namespace === 'string' && m.namespace.length > 0
        ? { namespace: m.namespace }
        : {}),
    };
  });
}


const realmHandle: RealmBackendHandle = setupRealmBackend({
  send: (msg: RealmBackendToFrontend, userId: string | undefined) => send(msg, userId),
  log: {
    info: (m: string) => log.info(m),
    warn: (m: string) => log.warn(m),
    error: (m: string) => log.error(m),
  },
  importCardFromBytes: (bytesB64: string, fileName: string, userId: string) =>
    importCardFromBytes(bytesB64, fileName, userId),
});

const HIGH_VOLUME_FRONTEND_MSG_TYPES: ReadonlySet<string> = new Set([
  'import_card_chunk',
  'upload_module_chunk',
]);

const screenHandlers = createScreenHandlers({ setScreenDims, log });
const consentHandlers = createConsentHandlers({
  pendingConsents,
  resolveAlertDismissal,
  resolvePickResolution,
  log,
});
const connectionsHandlers = createConnectionsHandlers({ listConnectionsForUser, log });
const logHandlers = createLogHandlers({
  extensionVersion: EXTENSION_VERSION,
  logStore,
  isLogThreshold,
  ensureLogStateLoaded,
  persistLogState,
  userStorage,
  lastActiveChatByUser,
});
const settingsHandlers = createSettingsHandlers({
  getSettingsForUser,
  applySettingsPatch,
  normalizeSettingsPatch,
});
const translationsHandlers = createTranslationsHandlers({
  persistModuleTranslation,
  persistCharacterTranslation,
});
const variablesHandlers = createVariablesHandlers({
  writeLocalVariable,
  ensureActiveCardForChat,
  refreshVariables,
});
const togglesHandlers = createTogglesHandlers({
  writeToggleValue,
  ensureActiveCardForChat,
  refreshToggleDefinitions,
  log,
});
const dispatchHandlers = createDispatchHandlers({
  dispatchManualTrigger,
  dispatchButtonClick,
  log,
});
const lorebookHandlers = createLorebookHandlers({ lorebookImporter });
const assetsHandlers = createAssetsHandlers({
  blockedByRepair,
  mutateAssetIndex,
  viewerPushDeps,
  charactersAttachedTo,
  invalidateActiveForCharacter,
  refreshRisuAssetMap,
  log,
  errMsg,
});
const viewerHandlers = createViewerHandlers({
  blockedByRepair,
  charactersApi,
  updateLumirealm,
  mutateTriggerLua,
  viewerAssembly,
  viewerPushDeps,
  charactersAttachedTo,
  invalidateActiveForCharacter,
  log,
  errMsg,
});
const importHandlers = createImportHandlers({
  importSessions,
  pendingImportCompletions,
  lastSentBgHtmlByChat,
  activeCardByChat,
  lastActiveChatByUser,
  hostVersionCheckRef: { get current() { return hostVersionCheck; } } as { current: HostVersionCheckResult | null },
  getMissingPermissions,
  permissionPurpose: PERMISSION_PURPOSE,
  validateUploadShape,
  listCards: async (uid) => listCards(uid),
  pushCards,
  ensureActiveCardForChat,
  sendSetActiveChat,
  invalidateRenderMcpForChat,
  refreshBgHtml,
  refreshVariables,
  importAnyFormat: (b64, name, uid) => realmHandle.importAnyFormat(b64, name, uid),
  applySvgRasterIndex,
  maybeFinalizeImport,
  characterGet: async (cid, uid) => {
    try {
      const c = await spindle.characters.get(cid, uid);
      return c ? { ...(c.name ? { name: c.name } : {}) } : null;
    } catch { return null; }
  },
  deleteCardByChar: (cid, uid, mode) => deleteCardByChar(cid, uid, mode),
  emitOperationProgress,
  notifyHostVersionOutdated: (msg, uid) => spindle.sendToFrontend(msg as never, uid),
  notifyMissingPermissions: (msg, uid) => spindle.sendToFrontend(msg as never, uid),
  log,
  errMsg,
});
const orphanHandlers = createOrphanHandlers({
  assetUploadsInFlightRef: { get current() { return assetUploadsInFlight; } } as { current: number },
  scanOrphanedImages,
  buildOrphanDetectDeps,
  deleteImageIds,
  emitOperationProgress,
  log,
  errMsg,
});
const repairHandlers = createRepairHandlers({
  assetUploadsInFlightRef: { get current() { return assetUploadsInFlight; } } as { current: number },
  repairInFlightByUser,
  scanRepairTargets,
  applyRepair,
  log,
  errMsg,
});
const moduleHandlers = createModuleHandlers({
  moduleUploadSessions,
  worldBookIdsByCharacter,
  validateUploadShape,
  processModuleUpload,
  nudgeGc,
  readModuleEnvelope: (uid, moduleId) => readModuleEnvelope(moduleStorage(), uid, moduleId),
  readModuleImageJournalImageIds: async (uid, moduleId) => {
    const file = await readModuleImageJournalFile(journalStorage(), uid, moduleId);
    return file?.imageIds ?? [];
  },
  clearModuleImageJournal: (uid, moduleId) => clearModuleImageJournal(journalStorage(), uid, moduleId),
  deleteModuleFromStore: (uid, moduleId) => deleteModuleFromStore(moduleStorage(), uid, moduleId),
  deleteSharedWorldBook: (wbId, uid) => spindle.world_books.delete(wbId, uid).then(() => undefined),
  buildOrphanDetectDeps,
  deleteImageIds,
  detachModuleFromAllCharacters,
  attachModuleToCharacter,
  detachModuleFromCharacter,
  charactersAttachedTo,
  refreshAttachedModule,
  pushModules,
  pushAttachedForCharacter,
  charactersApi,
  updateLumirealm,
  mergeUserOverrides,
  invalidateActiveForCharacter,
  emitOperationProgress,
  blockedByRepair,
  log,
  errMsg,
});

// Typed exhaustive registry: any new FrontendToBackend variant without a
// handler entry here trips a compile-time error.
const handlerRegistry: HandlerRegistry = {
  ...importHandlers,
  ...consentHandlers,
  ...dispatchHandlers,
  ...variablesHandlers,
  ...settingsHandlers,
  ...translationsHandlers,
  ...connectionsHandlers,
  ...togglesHandlers,
  ...moduleHandlers,
  ...assetsHandlers,
  ...viewerHandlers,
  ...lorebookHandlers,
  ...screenHandlers,
  ...logHandlers,
  ...orphanHandlers,
  ...repairHandlers,
};

spindle.onFrontendMessage(userScoped(async (raw, userId) => {
  captureUserId(userId, 'frontend-message');
  const msg = raw as FrontendToBackend;
  if (!HIGH_VOLUME_FRONTEND_MSG_TYPES.has(msg.type)) {
    log.trace(`frontend msg type=${msg.type} userId=${userId ?? '<none>'}`);
  }
  // Operator-scoped extension contract: every FE WS arrives with a real userId
  // from BetterAuth. An undefined userId means the message bypassed auth and
  // any reply we send would broadcast to all connected users.
  if (!userId) {
    log.warn(`frontend msg type=${msg.type} dropped: no userId`);
    return;
  }
  const ctx: HandlerCallCtx = { userId, send, log, errMsg };
  try {
    if (isRealmFrontendMessage(msg)) {
      await realmHandle.handle(msg, userId);
      return;
    }
    const handler = handlerRegistry[msg.type] as Handler<typeof msg.type>;
    await handler(msg as never, ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Frontend message handler error (type=${(msg as { type?: string }).type ?? '?'}): ${message}`);
    send({ type: 'error', message }, userId);
  }
}));

