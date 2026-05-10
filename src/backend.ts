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
  eventToBinding,
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
import {
  getRegisterMessageContentProcessor,
  getRegisterMacroInterceptor,
  getRegisterInterceptor,
  getRegisterWorldInfoInterceptor,
  getModalConfirmApi,
  getRegexScriptsApi,
  getConnectionsListFn,
  type LlmMessage,
  type InterceptorContext,
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
  MODULE_SCHEMA_VERSION,
  deleteModule as deleteModuleFromStore,
  envelopePath as moduleEnvelopePath,
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

let diagInterceptorCall = 0;

registerAllMacros();

// Pre-write content processor: resolves CBS before the route handler commits
// the row. Feature-detected via spindle-extras adapter.
const registerMessageContentProcessor = getRegisterMessageContentProcessor();

// Macro interceptor: per-template bulk in-worker CBS resolve, replaces N
// __macro_invoke__ RPCs with one. Feature-detected via spindle-extras.
const registerMacroInterceptor = getRegisterMacroInterceptor();

if (typeof registerMacroInterceptor === 'function') {
  registerMacroInterceptor((ctx) => withMaybeUser(ctx.userId, async () => {
    const callId = ++diagInterceptorCall;
    const t0 = Date.now();
    const chatId = typeof ctx.env.chat?.id === 'string' ? (ctx.env.chat.id as string) : null;
    const activeBefore = chatId ? activeCardByChat.has(chatId) : false;
    const templateHead = ctx.template.slice(0, 120);
    const hasMarker = /★[A-Z_]+★|###[A-Z_]+###/.test(ctx.template);
    const chatEnv = ctx.env.chat as { id?: string; messageCount?: number; lastMessageId?: number };
    log.trace(
      `macroInterceptor.enter #${callId} chat=${chatId ?? '<none>'} active_present=${activeBefore} ` +
        `commit=${ctx.commit} phase=${ctx.phase} userId=${ctx.userId ?? '<none>'} ` +
        `tmpl_len=${ctx.template.length} has_marker=${hasMarker} ` +
        `lumi_messageCount=${chatEnv?.messageCount ?? '?'} lumi_lastMessageId=${chatEnv?.lastMessageId ?? '?'} ` +
        `tmpl_head=${JSON.stringify(templateHead)}`,
    );

    if (!ctx.template.includes('{{')) {
      log.trace(`macroInterceptor.exit #${callId} path=no_cbs elapsed=${Date.now() - t0}ms`);
      return;
    }

    captureUserId(ctx.userId, 'macroInterceptor');

    if (!chatId) {
      log.trace(`macroInterceptor.exit #${callId} path=no_chat_id elapsed=${Date.now() - t0}ms`);
      return;
    }
    const active = activeCardByChat.get(chatId);
    if (!active) {
      log.warn(
        `macroInterceptor.exit #${callId} path=no_active_card chat=${chatId} ` +
          `elapsed=${Date.now() - t0}ms ⚠ falling back to Lumi native eval. ` +
          `activeCardByChat keys=[${[...activeCardByChat.keys()].map((k) => k.slice(0, 8)).join(',')}]`,
      );
      return;
    }
    if (ctx.userId && active.ownerUserId !== ctx.userId) {
      log.warn(
        `macroInterceptor.exit #${callId} path=owner_mismatch chat=${chatId} ` +
          `cached=${active.ownerUserId} ctx=${ctx.userId} elapsed=${Date.now() - t0}ms`,
      );
      return;
    }

    const charCard = ctx.env.character as {
      name?: string;
      description?: string;
      personality?: string;
      scenario?: string;
      mesExamples?: string;
      mesExamplesRaw?: string;
      systemPrompt?: string;
      postHistoryInstructions?: string;
      creatorNotes?: string;
      persona?: string;
      firstMessage?: string;
    };
    const envChat = ctx.env.chat as {
      id?: string;
      messageCount?: number;
      lastMessage?: string;
      lastUserMessage?: string;
      lastCharMessage?: string;
      lastMessageId?: number;
    };
    const namesEnv = ctx.env.names as { user?: string; char?: string };

    const assetIndexes = getActiveAssetIndexes(chatId);
    const scriptstateDefaults = active.card.risuPayload.scriptstate_defaults;
    const screenDims = getScreenDims(ctx.userId);
    const charImage = getActiveCharacterImage(chatId);
    const personaImage = getActivePersonaImage(ctx.userId);

    const dynChatIndex = (ctx.env as { dynamicMacros?: Record<string, string> }).dynamicMacros?.chat_index;
    const dynChatIndexNum = typeof dynChatIndex === 'string' && /^-?\d+$/.test(dynChatIndex)
      ? parseInt(dynChatIndex, 10) - 1
      : undefined;

    let resolved: string;
    try {
      resolved = runPipeline({
        template: ctx.template,
        phase: ctx.commit ? 'commit' : 'display',
        chatId,
        ...(ctx.userId !== undefined ? { userId: ctx.userId } : {}),
        ...(dynChatIndexNum !== undefined ? { currentMessageIndexOverride: dynChatIndexNum } : {}),
        characterId: active.card.character_id,
        userName: namesEnv.user ?? '',
        charName: namesEnv.char ?? charCard.name ?? '',
        ...(charCard.persona ? { personaText: charCard.persona } : {}),
        ...(personaImage ? { personaImage } : {}),
        character: {
          description: charCard.description ?? '',
          personality: charCard.personality ?? '',
          scenario: charCard.scenario ?? '',
          exampleDialogue: charCard.mesExamples ?? charCard.mesExamplesRaw ?? '',
          mainPrompt: charCard.systemPrompt ?? '',
          postHistoryInstructions: charCard.postHistoryInstructions ?? '',
          creatorNotes: charCard.creatorNotes ?? '',
          firstMessage: charCard.firstMessage ?? '',
          ...(assetIndexes?.assets ? { additionalAssets: assetIndexes.assets } : {}),
          ...(assetIndexes?.emotions ? { emotionImages: assetIndexes.emotions } : {}),
          ...(charImage ? { image: charImage } : {}),
        },
        chat: {
          ...(typeof envChat.messageCount === 'number' ? { messageCount: envChat.messageCount } : {}),
          ...(typeof envChat.lastMessage === 'string' ? { lastMessage: envChat.lastMessage } : {}),
          ...(typeof envChat.lastUserMessage === 'string' ? { lastUserMessage: envChat.lastUserMessage } : {}),
          ...(typeof envChat.lastCharMessage === 'string' ? { lastCharMessage: envChat.lastCharMessage } : {}),
          ...(typeof envChat.lastMessageId === 'number' ? { lastMessageId: envChat.lastMessageId } : {}),
        },
        variables: {
          local: ctx.env.variables.local,
          global: ctx.env.variables.global,
          chat: ctx.env.variables.chat,
        },
        ...(scriptstateDefaults && Object.keys(scriptstateDefaults).length > 0
          ? { scriptstateDefaults }
          : {}),
        ...(screenDims ? { screenWidth: screenDims.width, screenHeight: screenDims.height } : {}),
        legacyMediaFindings: getCachedSettingsSync(ctx.userId).legacyMediaFindings,
        ...(modulesByNamespaceFromCard(active.card) ? { modulesByNamespace: modulesByNamespaceFromCard(active.card)! } : {}),
        ...(readDecoratorBuffers(chatId)?.positionPt
          ? { positionPt: readDecoratorBuffers(chatId)!.positionPt }
          : {}),
      });
    } catch (err) {
      log.warn(`macroInterceptor: runPipeline threw chat=${chatId} phase=${ctx.phase}: ${errMsg(err)}. Passing through.`);
      return;
    }

    const resolvedMarker = /★[A-Z_]+★|###[A-Z_]+###/.exec(resolved)?.[0] ?? null;
    const stillHasRaw = resolved.includes('{{risu_') || resolved.includes('{{getvar::') || resolved.includes('{{#risu_');

    // listenEdit('editDisplay') hooks fire on the display-phase pass (commit=false).
    // Risu: `runLuaEditTrigger(char, 'editDisplay', data)` at scripts.ts.
    //
    // ⚠ Gate: this fallback fires editDisplay for ANY commit:false template
    // resolve, including bg-html resolution and cross-rule CSS bundles
    // (refreshBgHtml runs `resolveReadonly` on bg + 88KB CSS). Risu's
    // editDisplay only runs on message bodies (processScriptFull, scripts.ts
    // mode='editDisplay'); firing it on CSS is a parity violation AND the
    // dominant source of chat-open lag on listenEdit-heavy cards (Mortal
    // Realm: ~12s per refreshBgHtml because the 88KB CSS feeds 16 Lua VMs).
    //
    // Lumi 0.9.6+ ships the messageContentProcessor 'render' origin that
    // fires editDisplay on the actual message body with proper messageIndex
    // context , that's the load-bearing path. We only need this fallback
    // when 'render' isn't available (very old Lumi builds).
    const mcpRenderAvailable = typeof registerMessageContentProcessor === 'function';
    if (!ctx.commit && !mcpRenderAvailable) {
      const triggers = active.card.risuPayload.triggers as ReadonlyArray<{
        effect?: ReadonlyArray<{ type?: string }>;
      }>;
      const luaScripts = active.card.risuPayload.lua_scripts;
      const hasLuaTrigger = triggers.some(
        (t) => t.effect?.[0]?.type === 'triggerlua',
      );
      if (hasLuaTrigger && ctx.userId !== undefined) {
        const editChain = triggers.map((t, i) => ({
          source: t,
          luaCode: luaScripts[i] ?? '',
        }));
        try {
          const editApi = makeSpindleHost({
            chatId,
            characterId: active.card.character_id,
            userId: ctx.userId,
          });
          const editScriptNS = makeDispatcherScriptNS();
          resolved = await runListenEditChain(
            editChain,
            'editDisplay',
            resolved,
            { index: typeof envChat.lastMessageId === 'number' ? envChat.lastMessageId : -1 },
            editApi,
            { characterId: active.card.character_id },
            editScriptNS,
            {
              chatId,
              characterId: active.card.character_id,
              resolveTemplate: (text: string) => resolveReadonly(text, chatId, active.card.character_id, ctx.userId, { cbsContext: true }),
            },
          );
        } catch (err) {
          log.warn(`macroInterceptor: listenEdit chain threw: ${errMsg(err)}. Continuing with pre-hook resolved.`);
        }
      }

      // @@emo / @@repeat_back fire from the messageContentProcessor 'render'
      // origin (editdisplay) and runBinding('output') (editoutput). The
      // macroInterceptor would over-trigger setExpression on every template
      // eval, so we deliberately do not run at-actions here.
    }

    if (resolved === ctx.template) {
      log.trace(
        `macroInterceptor.exit #${callId} path=unchanged_passthrough elapsed=${Date.now() - t0}ms ` +
          `tmpl_len=${ctx.template.length} marker=${resolvedMarker ?? 'none'}`,
      );
      return;
    }
    // Doc-boundary normalize is not applied here: macroInterceptor fires for
    // both replace_string templates and find_regex patterns. Wrapping a
    // find_regex would break regex compilation.
    log.trace(
      `macroInterceptor.exit #${callId} path=resolved elapsed=${Date.now() - t0}ms ` +
        `in_len=${ctx.template.length} out_len=${resolved.length} ` +
        `marker=${resolvedMarker ?? 'none'} still_has_raw_cbs=${stillHasRaw} ` +
        `out_head=${JSON.stringify(resolved.slice(0, 120))}`,
    );
    // Panel-shape diagnostics , verifies handoff hypothesis H1 / H10
    // (panel HTML accumulating across streaming chunks) and H2 (per-chunk
    // CBS drift inside the panel body). When the resolved output contains
    // anything that LOOKS like the panel , `<div class="…sys-…` style
    // wrappers we've seen in the Alternate Hunters V2 card , emit a count
    // + first-50/last-50 fingerprint so we can correlate against the
    // portal-trace log.
    if (resolved.length > 200) {
      const panelMatches = resolved.match(/<div[^>]*class="[^"]*(?:sys-backdrop|sys-panel|status-?panel)[^"]*"/g);
      if (panelMatches && panelMatches.length > 0) {
        log.info(
          `[panel-shape] callId=${callId} commit=${ctx.commit} count=${panelMatches.length} ` +
            `out_len=${resolved.length} ` +
            `head=${JSON.stringify(resolved.slice(0, 60))} ` +
            `tail=${JSON.stringify(resolved.slice(-60))}`,
        );
      }
    }
    return resolved;
  }), 100);
  log.info('macroInterceptor: registered at priority=100');
} else {
  log.warn('macroInterceptor: NOT AVAILABLE on this Lumi build, extension macros will resolve via per-call RPC (slow for iteration-heavy cards, and FRAME-SHIFT UNRELIABLE without preprocessor coherence)');
}

if (typeof registerMessageContentProcessor === 'function') {
  let mcpInFlight = 0;
  let mcpEnterSeq = 0;
  // Periodic render-MCP cache stats. Surfaces hit-rate so we can confirm
  // the cv-bump-cascade mitigation is engaging (high-hit on Cheongwon-grade
  // streams) without spamming. Cadence matches macros' [invoke-summary].
  let lastCacheStatsAt = 0;
  function maybeEmitCacheStats(): void {
    const stats = renderMcpCacheStats();
    const lookups = stats.hits + stats.misses;
    if (lookups < 200) return;
    const now = Date.now();
    if (now - lastCacheStatsAt < 5_000) return;
    lastCacheStatsAt = now;
    const ratio = lookups > 0 ? Math.round((stats.hits / lookups) * 100) : 0;
    log.info(
      `[render-mcp-cache] size=${stats.size} hits=${stats.hits} misses=${stats.misses} ratio=${ratio}%`,
    );
  }
  registerMessageContentProcessor((ctx) => withMaybeUser(ctx.userId, async () => {
    // Gate only on "is this a Risu-imported chat?". Earlier containsCbs gate
    // excluded display-regex rules that lack `{{…}}` markers, causing
    // Lua-emitted sentinels to land raw. Risu's semantic: run the pipeline
    // always; `resolved === ctx.content` short-circuits the write.
    const tStart = Date.now();
    const seq = ++mcpEnterSeq;
    const enteredAt = ++mcpInFlight;
    log.trace(
      `messageContentProcessor.enter #${seq} chat=${ctx.chatId} origin=${ctx.origin} msg=${ctx.messageId ?? '<new>'} raw_len=${ctx.content.length} inflight=${enteredAt}`,
    );
    try {
      captureUserId(ctx.userId, 'messageContentProcessor');
      const tA = Date.now();
      const active = await ensureActiveCardForChat(ctx.chatId, null, ctx.userId);
      const tB = Date.now();
      if (!active) {
        log.trace(
          `messageContentProcessor.exit #${seq} path=skip-not-lumirealm chat=${ctx.chatId} ensure=${tB - tA}ms total=${Date.now() - tStart}ms`,
        );
        return;
      }

      if (ctx.origin === 'render') {
        const triggers = active.card.risuPayload.triggers as ReadonlyArray<{
          effect?: ReadonlyArray<{ type?: string }>;
        }>;
        const luaScripts = active.card.risuPayload.lua_scripts;
        const hasLuaTrigger = triggers.some(
          (t) => t.effect?.[0]?.type === 'triggerlua',
        );
        const renderAtActions = coerceAtActions(active.card.risuPayload.at_actions);
        const rawIdx = ctx.extra?.['messageIndex'];
        const messageIndex = typeof rawIdx === 'number' ? rawIdx : 0;
        const risuChatIdx = Math.max(-1, messageIndex - 1);

        // No-op cache lookup. The render path runs on every visible message
        // per cv-bump (CHAT_CHANGED / MESSAGE_*); cache by content hash so
        // identical inputs replay instantly. Invalidated explicitly on var
        // changes so `{{getvar::X}}` re-resolves with fresh state.
        if (ctx.messageId) {
          const cached = lookupRenderMcp(ctx.chatId, ctx.messageId, ctx.content);
          maybeEmitCacheStats();
          if (cached) {
            const totalMs = Date.now() - tStart;
            if (cached.kind === 'noop') {
              log.trace(
                `messageContentProcessor.exit #${seq} path=render-cache-noop chat=${ctx.chatId} msg=${ctx.messageId} idx=${messageIndex} total=${totalMs}ms`,
              );
              return;
            }
            log.trace(
              `messageContentProcessor.exit #${seq} path=render-cache-hit chat=${ctx.chatId} msg=${ctx.messageId} idx=${messageIndex} before_len=${ctx.content.length} after_len=${cached.content.length} total=${totalMs}ms`,
            );
            return { content: cached.content };
          }
        }

        const editChain = triggers.map((t, i) => ({
          source: t,
          luaCode: luaScripts[i] ?? '',
        }));
        try {
          const editApi = makeSpindleHost({
            chatId: ctx.chatId,
            characterId: active.card.character_id,
            userId: ctx.userId,
          });
          const editScriptNS = makeDispatcherScriptNS();
          let transformed = ctx.content;
          let chainMs = 0;
          if (hasLuaTrigger) {
            const tChain = Date.now();
            transformed = await runListenEditChain<string>(
              editChain,
              'editDisplay',
              transformed,
              { index: risuChatIdx },
              editApi,
              { characterId: active.card.character_id, content: ctx.content },
              editScriptNS,
              {
                chatId: ctx.chatId,
                characterId: active.card.character_id,
                resolveTemplate: (text: string) => resolveReadonly(text, ctx.chatId, active.card.character_id, ctx.userId, { cbsContext: true }),
              },
            );
            chainMs = Date.now() - tChain;
            log.trace(
              `messageContentProcessor.render chain.elapsed #${seq} chain=${chainMs}ms (mcp_total_so_far=${Date.now() - tStart}ms)`,
            );
          }
          let atActionsMs = 0;
          if (renderAtActions.length > 0) {
            const tAt = Date.now();
            try {
              transformed = await runAtActionsForPhase(renderAtActions, 'editdisplay', transformed, {
                api: editApi,
                chatIndex: risuChatIdx,
                role: 'assistant',
              });
            } catch (err) {
              log.warn(
                `messageContentProcessor.render at-actions threw: ${errMsg(err)}. Continuing with prior content.`,
              );
            }
            atActionsMs = Date.now() - tAt;
          }

          // Risu parity: run the body through the CBS evaluator with
          // commit:false (= rmVar:true),body-level setvars are stripped,
          // everything else (`{{getvar}}`, `{{#risu_if}}`, `{{time}}`, etc.)
          // resolves against current chat state. Lumi's display-regex still
          // runs after this with commit:true, so card-authored regex
          // outScripts CAN commit setvars. The `{{user}}/{{char}}/etc.` set
          // is PUA-protected so Lumi's FE `resolveDisplayMacros` resolves it
          // against current persona context per render (the render-MCP and
          // displayPreprocess caches don't key on personaId).
          let resolveMs = 0;
          if (transformed.indexOf('{{') >= 0) {
            const tResolve = Date.now();
            try {
              const enc = puaEncodeFeMacros(transformed);
              const resolved = await resolveReadonly(
                enc.text,
                ctx.chatId,
                active.card.character_id,
                ctx.userId,
              );
              transformed = puaDecodeFeMacros(resolved, enc.tokens);
            } catch (err) {
              log.warn(
                `messageContentProcessor.render body-resolve threw: ${errMsg(err)}. Returning pre-resolve content.`,
              );
            }
            resolveMs = Date.now() - tResolve;
          }

          const totalMs = Date.now() - tStart;
          const otherOverhead = totalMs - chainMs - atActionsMs - resolveMs - (tB - tA);
          if (transformed === ctx.content) {
            if (ctx.messageId) {
              cacheRenderMcp(ctx.chatId, ctx.messageId, ctx.content, { kind: 'noop' });
            }
            log.trace(
              `messageContentProcessor.exit #${seq} path=render-noop chat=${ctx.chatId} msg=${ctx.messageId ?? '<?>'} idx=${messageIndex} total=${totalMs}ms (chain=${chainMs}ms at_actions=${atActionsMs}ms resolve=${resolveMs}ms ensure=${tB - tA}ms other=${otherOverhead}ms)`,
            );
            return;
          }
          if (ctx.messageId) {
            cacheRenderMcp(ctx.chatId, ctx.messageId, ctx.content, { kind: 'transformed', content: transformed });
          }
          log.trace(
            `messageContentProcessor.exit #${seq} path=render-transformed chat=${ctx.chatId} msg=${ctx.messageId ?? '<?>'} idx=${messageIndex} before_len=${ctx.content.length} after_len=${transformed.length} total=${totalMs}ms (chain=${chainMs}ms at_actions=${atActionsMs}ms resolve=${resolveMs}ms ensure=${tB - tA}ms other=${otherOverhead}ms)`,
          );
          return { content: transformed };
        } catch (err) {
          log.warn(
            `messageContentProcessor.exit #${seq} path=render-threw chat=${ctx.chatId} msg=${ctx.messageId ?? '<?>'} err=${errMsg(err)} total=${Date.now() - tStart}ms`,
          );
          return;
        }
      }

      // Write-time origins (create / update / swipe_add / swipe_update / greeting).
      // Storage holds RAW post-unbake,no resolveReadonly here. Body-level
      // macros resolve at render time via the 'render' origin above.
      // We still run `editoutput`-phase @@-actions (for `@@emo` side-effects
      // + `@@repeat_back` content concatenation; both fire on the raw body
      // since they match by literal markers, not by resolved values) and
      // run the doc-boundary normalize so DOMPurify doesn't drop leading
      // `<style>` blocks in HTML-document-shaped Lua/LLM output.
      const isUserMessage = ctx.extra?.['is_user'] === true; // best-effort; may be undefined
      const isGreeting = ctx.extra?.['greeting'] === true;
      const atActions = coerceAtActions(active.card.risuPayload.at_actions);
      let working = ctx.content;
      if (atActions.length > 0 && !isUserMessage) {
        try {
          const atApi = makeSpindleHost({
            chatId: ctx.chatId,
            characterId: active.card.character_id,
            userId: ctx.userId,
          });
          working = await runAtActionsForPhase(atActions, 'editoutput', working, {
            api: atApi,
            chatIndex: isGreeting ? -1 : 0,
            role: 'assistant',
          });
        } catch (err) {
          log.warn(
            `messageContentProcessor: at-actions editoutput threw: ${errMsg(err)}. ` +
              `Continuing with pre-action content.`,
          );
        }
      }

      const finalContent = normalizeReplaceStringForSanitizer(working);

      if (finalContent === ctx.content) {
        log.trace(
          `messageContentProcessor.exit #${seq} path=noop chat=${ctx.chatId} origin=${ctx.origin} msg=${ctx.messageId ?? '<new>'} ensure=${tB - tA}ms total=${Date.now() - tStart}ms`,
        );
        return;
      }
      if (ctx.messageId) rememberOurWrite(ctx.chatId, ctx.messageId, finalContent);
      log.trace(
        `messageContentProcessor.exit #${seq} path=transformed chat=${ctx.chatId} origin=${ctx.origin} msg=${ctx.messageId ?? '<new>'} raw_len=${ctx.content.length} final_len=${finalContent.length} doc_normalized=${finalContent !== working} ensure=${tB - tA}ms total=${Date.now() - tStart}ms`,
      );
      return { content: finalContent };
    } finally {
      mcpInFlight--;
    }
  }), 100);
  log.info('messageContentProcessor: registered');
} else {
  log.info('messageContentProcessor: not available on this Lumi build, falling back to reactive MESSAGE_EDITED resolve');
}

// listenEdit('editInput') + 'editRequest' chains via Lumi interceptor hook.
const registerInterceptor = getRegisterInterceptor();

if (typeof registerInterceptor === 'function') {
  registerInterceptor(async (messages, contextRaw) => {
    const ctx = (contextRaw ?? {}) as InterceptorContext;
    const chatId = typeof ctx.chatId === 'string' ? ctx.chatId : null;
    if (!chatId) return messages;
    // Lumi's interceptor ctx doesn't expose userId, so attribute via the
    // chat → owner stamp from activeCardByChat (populated at chat-open).
    let activeCandidate: ActiveCard | null | undefined = activeCardByChat.get(chatId);
    let userId: string | undefined = activeCandidate?.ownerUserId;
    if (!activeCandidate) {
      // Cold-cache: Lumi fires this only for the user's active chat, so
      // lastActiveChatByUser holds the mapping for cases that bypass MESSAGE_SENT.
      for (const [uid, lastChat] of lastActiveChatByUser) {
        if (lastChat === chatId) { userId = uid; break; }
      }
      if (!userId) return messages;
      activeCandidate = await ensureActiveCardForChat(chatId, null, userId);
      if (!activeCandidate) return messages;
    }
    const active: ActiveCard = activeCandidate;
    const resolvedUserId = userId!;

    return userIdAls.run(resolvedUserId, async () => {
    let out: LlmMessage[] = messages;

    // ─── Tier 3: inject_at slot injection (Risu index.svelte.ts:520-585) ───
    // Pulls injection plans staged by worldInfoInterceptor, applies them to
    // system messages by content match against character.{description,
    // system_prompt, post_history_instructions} / persona.description /
    // chat.metadata.authors_note.content. Mirrors Risu's positionParser
    // behaviour: append/prepend/replace operations on the slot's text.
    const buffers = readDecoratorBuffers(chatId);
    if (buffers && buffers.injectAt.length > 0) {
      const character = await spindle.characters
        .get(active.card.character_id, userId)
        .catch(() => null);
      const persona = await spindle.personas.getActive(userId).catch(() => null);
      const authorsNote = (() => {
        const meta = active.card.risuPayload.extra as
          | { authors_note?: { content?: unknown } }
          | undefined;
        const c = meta?.authors_note?.content;
        return typeof c === 'string' ? c : '';
      })();
      // Map of Risu loc to identifier text expected inside a system message.
      // Imperfect anchors since Lumi merges multiple sources into one block.
      const slotText: Record<string, string> = {};
      const charDesc = (character as { description?: unknown } | null)?.description;
      if (typeof charDesc === 'string' && charDesc.length > 0) slotText['description'] = charDesc;
      const charPersona = (character as { persona?: unknown } | null)?.persona;
      if (typeof charPersona === 'string' && charPersona.length > 0) slotText['persona'] = charPersona;
      const charScenario = (character as { scenario?: unknown } | null)?.scenario;
      if (typeof charScenario === 'string' && charScenario.length > 0) slotText['scenario'] = charScenario;
      const charSysPrompt = (character as { system_prompt?: unknown } | null)?.system_prompt;
      if (typeof charSysPrompt === 'string' && charSysPrompt.length > 0) slotText['main'] = charSysPrompt;
      const charPostHist = (character as { post_history_instructions?: unknown } | null)?.post_history_instructions;
      if (typeof charPostHist === 'string' && charPostHist.length > 0) {
        slotText['globalNote'] = charPostHist;
        // Risu's `jailbreak` / `cot` cards both consume globalNote-like content.
        slotText['jailbreak'] = charPostHist;
        slotText['cot'] = charPostHist;
      }
      const personaDesc = (persona as { description?: unknown } | null)?.description;
      if (typeof personaDesc === 'string' && personaDesc.length > 0 && !slotText['persona']) {
        slotText['persona'] = personaDesc;
      }
      if (authorsNote.length > 0) slotText['authornote'] = authorsNote;

      const { applyInjectAtToMessages } = await import(
        './payload/lorebook-decorator-runtime.js'
      );
      const applyResult = applyInjectAtToMessages(out, buffers.injectAt, slotText);
      out = applyResult.messages.slice();
      if (
        applyResult.mutationCount > 0 ||
        applyResult.synthesizedCount > 0 ||
        applyResult.fallbackAppendCount > 0
      ) {
        log.info(
          `[decorators] injectAt applied chat=${chatId} ` +
            `mutations=${applyResult.mutationCount}/${buffers.injectAt.length} ` +
            `synthesized=${applyResult.synthesizedCount} ` +
            `fallback_append=${applyResult.fallbackAppendCount}`,
        );
      }
      // Drop the buffer: this is its single point of consumption per generation.
      clearDecoratorBuffer(chatId);
    }

    const triggers = active.card.risuPayload.triggers as ReadonlyArray<{
      effect?: ReadonlyArray<{ type?: string }>;
    }>;
    const luaScripts = active.card.risuPayload.lua_scripts;
    const hasLuaTrigger = triggers.some((t) => t.effect?.[0]?.type === 'triggerlua');
    if (!hasLuaTrigger) return out;

    const editApi = makeSpindleHost({
      chatId,
      characterId: active.card.character_id,
      userId,
    });
    const editScriptNS = makeDispatcherScriptNS();
    const editChain = triggers.map((t, i) => ({
      source: t,
      luaCode: luaScripts[i] ?? '',
    }));

    // editInput: only on actual user typing (not regenerate/swipe/continue).
    if (ctx.generationType === 'normal') {
      let userIdx = -1;
      for (let i = out.length - 1; i >= 0; i--) {
        if (out[i]?.role === 'user') { userIdx = i; break; }
      }
      if (userIdx >= 0) {
        const orig = out[userIdx]!.content;
        try {
          const mutated = await runListenEditChain<string>(
            editChain,
            'editInput',
            orig,
            { index: userIdx - 1 }, // Risu chat index excludes greeting
            editApi,
            { characterId: active.card.character_id, content: orig },
            editScriptNS,
            {
              chatId,
              characterId: active.card.character_id,
              resolveTemplate: (text: string) => resolveReadonly(text, chatId, active.card.character_id, userId, { cbsContext: true }),
            },
          );
          if (mutated !== orig) {
            log.info(
              `interceptor.editInput: chat=${chatId} userIdx=${userIdx} ` +
                `before_len=${orig.length} after_len=${mutated.length}`,
            );
            out = out.slice();
            out[userIdx] = { ...out[userIdx]!, content: mutated };
          }
        } catch (err) {
          log.warn(`interceptor.editInput threw: ${errMsg(err)}. Continuing with original.`);
        }
      }
    }

    try {
      const mutated = await runListenEditChain<LlmMessage[]>(
        editChain,
        'editRequest',
        out,
        { generationType: ctx.generationType ?? 'normal' },
        editApi,
        { characterId: active.card.character_id, content: '' },
        editScriptNS,
        {
          chatId,
          characterId: active.card.character_id,
          resolveTemplate: (text: string) => resolveReadonly(text, chatId, active.card.character_id, userId, { cbsContext: true }),
        },
      );
      if (Array.isArray(mutated)) {
        if (mutated.length !== out.length) {
          log.info(
            `interceptor.editRequest: chat=${chatId} array length changed ` +
              `before=${out.length} after=${mutated.length}`,
          );
        }
        out = mutated;
      }
    } catch (err) {
      log.warn(`interceptor.editRequest threw: ${errMsg(err)}. Continuing with prior array.`);
    }

    return out;
    });
  }, 100);
  log.info('interceptor: registered (editInput + editRequest)');
} else {
  log.info('interceptor: not available on this Lumi build, listenEdit editInput/editRequest will not fire');
}

const registerWorldInfoInterceptor = getRegisterWorldInfoInterceptor();

if (registerWorldInfoInterceptor) {
  // log.always , bypasses the user's runtime-log toggle. The decorator
  // pipeline runs invisibly to the user otherwise.
  log.info(`[decorators] registerWorldInfoInterceptor wired at boot`);
  registerWorldInfoInterceptor((ctx) => withMaybeUser(ctx.userId, async () => {
    log.info(
      `[decorators] worldInfoInterceptor ENTER chat=${ctx.chatId} entries=${ctx.entries.length}`,
    );
    const verbose = (() => {
      try {
        const env = (globalThis as { Bun?: { env?: Record<string, string | undefined> } }).Bun?.env;
        return env?.RISU_COMPAT_VERBOSE === '1';
      } catch { return false; }
    })();
    const { runWorldInfoInterceptor } = await import('./payload/lorebook-decorator-runtime.js');
    const verboseFn = verbose ? (m: string) => log.info(`[decorators] ${m}`) : undefined;
    // Risu loreDepth default (lorebook.svelte.ts:83). Lumi exposes neither
    // per-entry scan_depth nor the chat-level default in the interceptor view,
    // so we use Risu's shipped default. Cards that need a different window
    // would have to express it via on-entry scan_depth which is currently
    // not surfaced through this hook.
    const RISU_DEFAULT_LORE_DEPTH = 4;
    // Pre-pass diagnostics: count entries that look like decorator carriers so
    // we can emit a single line ALWAYS (not gated on RISU_COMPAT_VERBOSE) when
    // any are present. Useful for spotting "decorators silently invisible to
    // the runtime" without flooding the log on quiet generations.
    let stashedDecCount = 0;
    let inlineDecCount = 0;
    for (const e of ctx.entries) {
      const stash = e.extensions?.['_risu_decorators'];
      if (Array.isArray(stash) && stash.length > 0) {
        stashedDecCount += 1;
      } else if (typeof e.content === 'string' && e.content.startsWith('@@')) {
        inlineDecCount += 1;
      }
    }
    const outcome = runWorldInfoInterceptor(
      {
        entries: ctx.entries.map((e) => ({
          id: e.id,
          disabled: e.disabled,
          comment: typeof e.comment === 'string' ? e.comment : '',
          key: Array.isArray(e.key) ? e.key : [],
          keysecondary: Array.isArray(e.keysecondary) ? e.keysecondary : [],
          content: typeof e.content === 'string' ? e.content : '',
          priority: typeof e.priority === 'number' ? e.priority : 0,
          extensions: e.extensions,
        })),
        messages: ctx.messages.map((m) => ({
          role: m.role,
          content: m.content,
          is_user: m.is_user,
          is_greeting: m.is_greeting,
          ...(m.greeting_index !== undefined ? { greeting_index: m.greeting_index } : {}),
        })),
        chatTurn: ctx.chatTurn,
        chatMetadata: ctx.chatMetadata,
        defaultScanDepth: RISU_DEFAULT_LORE_DEPTH,
      },
      verboseFn,
    );
    if (stashedDecCount + inlineDecCount > 0 || outcome.positionPt.length > 0 || outcome.injectAt.length > 0) {
      const ptNames = outcome.positionPt.map((p) => `${p.name}(${p.content.length})`).join(',');
      const injAtLocs = outcome.injectAt.map((p) => `${p.loc}/${p.operation}`).join(',');
      // log.always: bypass the user's runtime-log toggle. This is the
      // load-bearing pipeline-state line for triaging "decorator silently
      // not firing" without forcing the user to flip their toggle.
      log.info(
        `[decorators] worldInfoInterceptor chat=${ctx.chatId} ` +
          `entries_in=${ctx.entries.length} ` +
          `dec_carriers=stashed:${stashedDecCount}+inline:${inlineDecCount} ` +
          `outcome: disabled=${outcome.disabled.length} forced=${outcome.forced.length} ` +
          `mutated=${outcome.mutated.length} stickyWrites=${outcome.stickyWrites.length} ` +
          `positionPt=[${ptNames}] injectAt=[${injAtLocs}]`,
      );
    }

    // Persist sticky var writes (keep_activate_after_match / dont_activate_after_match).
    // The runtime returned WHICH writes to perform; we apply them via a single
    // chats.update RMW. expectChatChange suppresses the resulting CHAT_CHANGED echo.
    if (outcome.stickyWrites.length > 0 && ctx.userId) {
      try {
        const chat = await spindle.chats.get(ctx.chatId, ctx.userId);
        const meta = (chat?.metadata ?? {}) as Record<string, unknown>;
        const mv = (meta['macro_variables'] && typeof meta['macro_variables'] === 'object'
          ? { ...(meta['macro_variables'] as Record<string, unknown>) }
          : {}) as Record<string, unknown>;
        const local = (mv['local'] && typeof mv['local'] === 'object'
          ? { ...(mv['local'] as Record<string, unknown>) }
          : {}) as Record<string, unknown>;
        let changed = 0;
        for (const w of outcome.stickyWrites) {
          if (local[w.varName] === w.value) continue;
          local[w.varName] = w.value;
          changed += 1;
        }
        if (changed > 0) {
          mv['local'] = local;
          expectChatChange(ctx.chatId);
          await spindle.chats.update(
            ctx.chatId,
            { metadata: { ...meta, macro_variables: mv } as never },
            ctx.userId,
          );
          log.info(
            `[decorators] sticky_writes chat=${ctx.chatId} count=${changed}/${outcome.stickyWrites.length} ` +
              `keys=[${outcome.stickyWrites.slice(0, 3).map((w) => w.varName).join(',')}${outcome.stickyWrites.length > 3 ? ',…' : ''}]`,
          );
        }
      } catch (err) {
        log.warn(`[decorators] sticky_writes failed chat=${ctx.chatId}: ${errMsg(err)}`);
      }
    }

    // Stash Tier 3 cross-hook data: injectAt buffer for registerInterceptor,
    // positionPt buffer for the {{position::NAME}} macro evaluator. Each
    // generation overwrites. Consumer hooks clear, 60s TTL as safety net.
    if (outcome.injectAt.length > 0 || outcome.positionPt.length > 0) {
      const positionPt: Record<string, string> = {};
      for (const p of outcome.positionPt) positionPt[p.name] = p.content;
      setDecoratorBuffers(ctx.chatId, {
        injectAt: outcome.injectAt,
        positionPt,
      });
      log.info(
        `[decorators] tier3_buffer chat=${ctx.chatId} ` +
          `injectAt=${outcome.injectAt.length} ` +
          `positionPt=${outcome.positionPt.length}`,
      );
    } else {
      // No Tier 3 plans this turn. Drop stale buffer so post-assembly
      // doesn't apply ghosts.
      clearDecoratorBuffer(ctx.chatId);
    }

    if (outcome.disabled.length > 0 || outcome.forced.length > 0 || outcome.mutated.length > 0) {
      const reasons = Object.entries(outcome.reasons)
        .map(([n, c]) => `${n}:${c}`)
        .join(',');
      log.info(
        `[decorators] chat=${ctx.chatId} entries=${ctx.entries.length} ` +
          `disabled=${outcome.disabled.length} forced=${outcome.forced.length} ` +
          `mutated=${outcome.mutated.length} sticky_writes=${outcome.stickyWrites.length} ` +
          `reasons=[${reasons}]`,
      );
    }
    if (
      outcome.disabled.length === 0 &&
      outcome.forced.length === 0 &&
      outcome.mutated.length === 0
    ) return;
    const result: {
      disabled?: readonly string[];
      forced?: readonly string[];
      mutated?: readonly { id: string; content: string }[];
    } = {};
    if (outcome.disabled.length > 0) result.disabled = outcome.disabled;
    if (outcome.forced.length > 0) result.forced = outcome.forced;
    if (outcome.mutated.length > 0) {
      result.mutated = outcome.mutated.map((m) => ({ id: m.entryId, content: m.content }));
    }
    return result;
  }), 100);
  log.info('worldInfoInterceptor: registered');
} else {
  log.info('worldInfoInterceptor: not available on this Lumi build, Tier 2 lorebook decorators will not gate');
}

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
const settingsByUser = new Map<string, RisuCompatSettings>();

async function getSettingsForUser(userId: string): Promise<RisuCompatSettings> {
  const cached = settingsByUser.get(userId);
  if (cached) return cached;
  const loaded = await loadSettings(userStorage(), userId);
  settingsByUser.set(userId, loaded);
  log.info(
    `settings: loaded for user=${userId} ` +
      `auxConn=${loaded.auxConnectionId ?? '<default>'} ` +
      `auxModel=${loaded.auxModelOverride ?? '<connection>'}`,
  );
  return loaded;
}

function getCachedSettingsSync(userId: string | undefined): RisuCompatSettings {
  if (userId === undefined) return DEFAULT_SETTINGS;
  return settingsByUser.get(userId) ?? DEFAULT_SETTINGS;
}

async function applySettingsPatch(
  userId: string,
  patch: Partial<RisuCompatSettings>,
): Promise<RisuCompatSettings> {
  const current = await getSettingsForUser(userId);
  const merged = mergeSettings(current, patch);
  await saveSettings(userStorage(), merged, userId);
  settingsByUser.set(userId, merged);
  log.info(
    `settings: saved for user=${userId} ` +
      `auxConn=${merged.auxConnectionId ?? '<default>'} ` +
      `auxModel=${merged.auxModelOverride ?? '<connection>'} ` +
      `dbgReq=${merged.auxDebugCaptureRequest} dbgRes=${merged.auxDebugCaptureResponse}`,
  );
  return merged;
}

let auxDebugCounter = 0;

function makeAuxDebugCapture(
  chatId: string | null,
  settings: RisuCompatSettings,
  userId: string | undefined,
): ((event: import('./interpreter/runtime.js').AuxDebugCaptureEvent) => void) | undefined {
  if (!settings.auxDebugCaptureRequest && !settings.auxDebugCaptureResponse) {
    return undefined;
  }
  if (userId === undefined) return undefined;
  return (event) => {
    const allowReq = settings.auxDebugCaptureRequest && event.kind === 'request';
    const allowRes = settings.auxDebugCaptureResponse && (event.kind === 'response' || event.kind === 'error');
    if (!allowReq && !allowRes) return;
    try {
      send({
        type: 'aux_debug_capture',
        id: ++auxDebugCounter,
        ts: Date.now(),
        kind: event.kind,
        channel: event.channel,
        chatId,
        auxConnectionId: event.auxConnectionId,
        auxModelOverride: event.auxModelOverride,
        elapsedMs: event.elapsedMs,
        payload: event.payload,
      }, userId);
    } catch (err) {
      log.warn(`aux_debug_capture send failed: ${errMsg(err)}`);
    }
  };
}

interface SafeConnectionDTO {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly model: string;
  readonly is_default: boolean;
}

async function listConnectionsForUser(userId: string): Promise<readonly SafeConnectionDTO[]> {
  const listFn = getConnectionsListFn();
  if (!listFn) {
    log.warn('listConnectionsForUser: spindle.connections.list not available on this Lumi build');
    return [];
  }
  try {
    const raw = await listFn(userId);
    return raw.map((c) => ({
      id: c.id,
      name: c.name,
      provider: c.provider,
      model: c.model,
      is_default: c.is_default,
    }));
  } catch (err) {
    log.warn(`listConnectionsForUser: list threw: ${errMsg(err)}`);
    return [];
  }
}

// Tracks which userIds have already been bootstrapped by `captureUserId`,
// so the settings preload + orphan-review prompt fire once per session.
const capturedUserIds = new Set<string>();
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

const orphanReviewPromptedFor = new Set<string>();
async function promptOrphanReviewIfAny(userId: string): Promise<void> {
  if (orphanReviewPromptedFor.has(userId)) return;
  orphanReviewPromptedFor.add(userId);
  const tStart = Date.now();
  const detected = await detectDeletedWhileOff(userId);
  const charCount = detected.characterIds.length;
  const moduleCount = detected.moduleIds.length;
  if (charCount + moduleCount === 0) {
    log.info(`orphan-review: nothing detected elapsed=${Date.now() - tStart}ms`);
    return;
  }
  // Surface the actual IDs at info level so the user can verify what's
  // flagged. Truncate long lists to keep the line readable.
  const charPreview = detected.characterIds.slice(0, 8).join(',');
  const charPreviewSuffix = detected.characterIds.length > 8 ? `…(+${detected.characterIds.length - 8})` : '';
  const modulePreview = detected.moduleIds.slice(0, 8).join(',');
  const modulePreviewSuffix = detected.moduleIds.length > 8 ? `…(+${detected.moduleIds.length - 8})` : '';
  log.info(
    `orphan-review: detected chars=${charCount} modules=${moduleCount} ` +
      `elapsed=${Date.now() - tStart}ms ` +
      `charIds=[${charPreview}${charPreviewSuffix}] ` +
      `moduleIds=[${modulePreview}${modulePreviewSuffix}]`,
  );
  const parts: string[] = [];
  if (charCount > 0) parts.push(`${charCount} character${charCount === 1 ? '' : 's'}`);
  if (moduleCount > 0) parts.push(`${moduleCount} module${moduleCount === 1 ? '' : 's'}`);
  const summarySubject = parts.join(' and ');
  const message =
    `Found leftover image journals for ${summarySubject} whose Lumi entries ` +
    `are gone. This includes anything deleted while LumiRealm wasn't running ` +
    `and incomplete cleanups from earlier sessions. Open Cleanup to review ` +
    `the actual image assets?`;
  log.info(`orphan-review: opening confirm modal`);
  const queued = await queueModalConfirm(userId, {
    title: 'Leftover RisuAI image entries detected',
    message,
    variant: 'info',
    confirmLabel: 'Review',
    cancelLabel: 'Dismiss',
  });
  let result: { confirmed: boolean } | null = queued;
  if (queued === null) {
    log.warn(`orphan-review: spindle.modal.confirm unavailable, falling back to toast`);
  }
  // Toast fallback when the modal API is unavailable or threw. The user still
  // sees something, the journal still gets cleared, and they can scan
  // manually via Settings to Cleanup.
  if (result === null) {
    try {
      toastFor(userId, 'warning',
        `Found leftover image journals for ${summarySubject}. ` +
          `Open Settings, Cleanup to review orphaned image assets.`,
        { title: 'lumirealm: leftover image entries' },
      );
    } catch (err) {
      log.warn(`orphan-review: toast fallback threw: ${errMsg(err)}`);
    }
    result = { confirmed: false };
  }
  // Drop the journals either way so the same set never re-prompts. Orphan
  // images themselves stay in Lumi storage and remain findable via Cleanup.
  for (const characterId of detected.characterIds) {
    await clearImageJournal(journalStorage(), userId, characterId).catch((err) => {
      log.warn(`orphan-review: clearImageJournal threw char=${characterId}: ${errMsg(err)}`);
    });
  }
  for (const moduleId of detected.moduleIds) {
    await clearModuleImageJournal(journalStorage(), userId, moduleId).catch((err) => {
      log.warn(`orphan-review: clearModuleImageJournal threw module=${moduleId}: ${errMsg(err)}`);
    });
  }
  log.info(
    `orphan-review: confirmed=${result.confirmed} cleared chars=${charCount} modules=${moduleCount}`,
  );
  if (result.confirmed) {
    send({ type: 'open_settings_cleanup' }, userId);
  }
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

interface ForceRetranslateResult {
  readonly retranslated: number;
  readonly skippedLegacy: number;
  readonly modulesReattached: number;
  readonly modulesScrubbed: number;
}

interface ForceRetranslateOpts {
  readonly onProgress?: (processed: number, total: number, currentName: string) => void;
}

// Walks every lumirealm character, resets translator_schema_version, runs
// migration end-to-end sequentially.
async function forceRetranslateAll(
  userId: string,
  opts: ForceRetranslateOpts = {},
): Promise<ForceRetranslateResult> {
  let entries: Awaited<ReturnType<typeof listLumirealmCharacters>>;
  try {
    entries = await listLumirealmCharacters(charactersApi(), userId, { paginate: true });
  } catch (err) {
    log.warn(`forceRetranslateAll: listLumirealmCharacters failed: ${errMsg(err)}`);
    return { retranslated: 0, skippedLegacy: 0, modulesReattached: 0, modulesScrubbed: 0 };
  }
  let retranslated = 0;
  let skippedLegacy = 0;
  let modulesReattached = 0;
  let modulesScrubbed = 0;
  let processed = 0;
  const total = entries.length;
  for (const entry of entries) {
    if (!entry.data) {
      processed++;
      continue;
    }
    const charId = entry.character.id;
    const charName = entry.character.name ?? '(unnamed)';
    opts.onProgress?.(processed, total, charName);
    // Pre-0.3 cards don't carry envelope.source, so re-translation is impossible.
    // Resetting their version would brick them at v0 forever, requiring re-import.
    if (entry.data.source === undefined) {
      skippedLegacy++;
      processed++;
      continue;
    }
    translatorMigrationChecked.delete(charId);
    const reset: typeof entry.data = { ...entry.data, translator_schema_version: 0 };
    try {
      await writeLumirealm(charactersApi(), charId, reset, userId);
    } catch (err) {
      log.warn(`forceRetranslateAll: writeLumirealm(${charId}) failed: ${errMsg(err)}`);
      processed++;
      continue;
    }
    try {
      const kind = await runCharacterMigration(charId, charName, userId, reset, { silent: true });
      if (kind === 'migrated') retranslated++;
    } catch (err) {
      log.warn(`forceRetranslateAll: runCharacterMigration(${charId}) failed: ${errMsg(err)}`);
    }
    // Re-fetch post-migration to read the current attached_module_ids.
    let postFetch: Awaited<ReturnType<typeof readLumirealm>>;
    try {
      postFetch = await readLumirealm(charactersApi(), charId, userId);
    } catch (err) {
      log.warn(`forceRetranslateAll: readLumirealm(${charId}) post-migrate failed: ${errMsg(err)}`);
      processed++;
      continue;
    }
    if (!postFetch?.data) {
      processed++;
      continue;
    }
    const attachedIds = postFetch.data.user_overrides.attached_module_ids ?? [];
    if (attachedIds.length === 0) {
      processed++;
      continue;
    }
    const danglingIds: string[] = [];
    for (const moduleId of attachedIds) {
      let env: Awaited<ReturnType<typeof readModuleEnvelope>>;
      try {
        env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
      } catch (err) {
        log.warn(`forceRetranslateAll: readModuleEnvelope(${moduleId}) char=${charId} threw: ${errMsg(err)}`);
        env = null;
      }
      if (!env) {
        danglingIds.push(moduleId);
        continue;
      }
      try {
        await refreshAttachedModule(charId, env, userId);
        modulesReattached++;
      } catch (err) {
        log.warn(`forceRetranslateAll: refreshAttachedModule(${charId}, ${moduleId}) failed: ${errMsg(err)}`);
      }
    }
    if (danglingIds.length > 0) {
      try {
        await scrubDanglingModuleRefs(charId, danglingIds, userId);
        modulesScrubbed += danglingIds.length;
      } catch (err) {
        log.warn(`forceRetranslateAll: scrubDanglingModuleRefs(${charId}) failed: ${errMsg(err)}`);
      }
    }
    processed++;
  }
  return { retranslated, skippedLegacy, modulesReattached, modulesScrubbed };
}

// Removes dangling moduleIds from the char's user_overrides + fires
// uninstall_module_artifacts so leftover DB rows get metadata-keyed sweep.
async function scrubDanglingModuleRefs(
  characterId: string,
  danglingIds: readonly string[],
  userId: string,
): Promise<void> {
  if (danglingIds.length === 0) return;
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  if (!fetched?.data) return;
  const oldWb = fetched.data.user_overrides.attached_module_world_books ?? {};
  const oldRx = fetched.data.user_overrides.attached_module_regex_script_ids ?? {};
  const perModuleRx: Array<{ moduleId: string; wbId: string | null; regexIds: readonly string[] }> = [];
  for (const moduleId of danglingIds) {
    const wbId = typeof oldWb[moduleId] === 'string' ? oldWb[moduleId] : null;
    const regexIds = Array.isArray(oldRx[moduleId]) ? oldRx[moduleId] : [];
    perModuleRx.push({ moduleId, wbId, regexIds });
  }
  await updateLumirealm(charactersApi(), characterId, userId, (cur) => ({
    ...cur,
    user_overrides: mergeUserOverrides(
      cur.user_overrides,
      buildDetachModulesPatch(cur.user_overrides, danglingIds),
    ),
  }));
  for (const m of perModuleRx) {
    if (!m.wbId && m.regexIds.length === 0) continue;
    send({
      type: 'uninstall_module_artifacts',
      characterId,
      moduleId: m.moduleId,
      worldBookId: m.wbId,
      regexScriptIds: m.regexIds,
    }, userId);
  }
  log.info(`scrubDanglingModuleRefs: char=${characterId} scrubbed=${danglingIds.length}`);
}

const scanRepairTargets = (userId: string) => orphanOrchestrator.scanRepairTargets(userId);

async function applyRepair(
  userId: string,
  options: import('./types/messages.js').RepairApplyOptions,
): Promise<import('./types/messages.js').RepairApplyResult> {
  const t0 = Date.now();
  let staleCharRegexDeleted = 0;
  let staleModuleRegexDeleted = 0;
  let deadJournalsCleared = 0;
  let charactersRetranslated = 0;
  let charactersSkippedLegacy = 0;
  let modulesReattached = 0;
  let modulesScrubbed = 0;
  const opId = `repair-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const opTitle = 'Repairing extension state';
  emitOperationProgress(userId, opId, 'started', opTitle, 'Sweeping stale rows…', 0);
  if (options.applyStaleCharRegex) {
    try {
      emitOperationProgress(userId, opId, 'progress', opTitle, 'Sweeping stale character regex…', 0.05);
      const ids = await listStaleCharRegexIds(userId);
      staleCharRegexDeleted = await deleteRegexIds(userId, ids);
      log.info(`applyRepair: deleted ${staleCharRegexDeleted}/${ids.length} stale char regex`);
    } catch (err) {
      log.warn(`applyRepair: stale char regex sweep failed: ${errMsg(err)}`);
    }
  }
  if (options.applyStaleModuleRegex) {
    try {
      emitOperationProgress(userId, opId, 'progress', opTitle, 'Sweeping stale module regex…', 0.15);
      staleModuleRegexDeleted = await sweepOrphanModuleRegex(userId);
    } catch (err) {
      log.warn(`applyRepair: stale module regex sweep failed: ${errMsg(err)}`);
    }
  }
  if (options.applyDeadJournals) {
    try {
      emitOperationProgress(userId, opId, 'progress', opTitle, 'Clearing dead journals…', 0.25);
      deadJournalsCleared = await clearDeadJournals(userId);
    } catch (err) {
      log.warn(`applyRepair: dead journal clear failed: ${errMsg(err)}`);
    }
  }
  if (options.applyForceRetranslate) {
    try {
      const r = await forceRetranslateAll(userId, {
        onProgress: (processed, total, name) => {
          if (total <= 0) return;
          // 0.3..0.95 reserved for retranslate so the rest of the bar fits above.
          const frac = 0.3 + (processed / total) * 0.65;
          emitOperationProgress(
            userId,
            opId,
            'progress',
            opTitle,
            `Re-translating ${processed + 1}/${total}: ${name}`,
            frac,
          );
        },
      });
      charactersRetranslated = r.retranslated;
      charactersSkippedLegacy = r.skippedLegacy;
      modulesReattached = r.modulesReattached;
      modulesScrubbed = r.modulesScrubbed;
    } catch (err) {
      log.warn(`applyRepair: force retranslate failed: ${errMsg(err)}`);
    }
  }
  emitOperationProgress(userId, opId, 'done', opTitle, 'Repair complete.', 1);
  return {
    staleCharRegexDeleted,
    staleModuleRegexDeleted,
    deadJournalsCleared,
    charactersRetranslated,
    charactersSkippedLegacy,
    modulesReattached,
    modulesScrubbed,
    elapsedMs: Date.now() - t0,
  };
}

// JSC's incremental GC leaves upload-pipeline garbage (handoff, decoded
// Uint8Arrays, IPC payloads) rooted for minutes without slack. Force a
// synchronous full collect after large uploads, ~50-200ms on multi-GiB
// heaps, no-op when Bun.gc is unavailable.
function nudgeGc(reason: string): void {
  const bun = (globalThis as {
    Bun?: { gc?: (sync: boolean) => number | void };
  }).Bun;
  if (!bun?.gc) return;
  const t0 = Date.now();
  try {
    bun.gc(true);
  } catch (err) {
    log.warn(`nudgeGc(${reason}): threw, ${errMsg(err)}`);
    return;
  }
  log.info(`nudgeGc(${reason}): elapsed=${Date.now() - t0}ms`);
}

const pendingImportCompletions = new Map<string, PendingImportCompletion>();

// Tracks asset-upload-bearing operations (card import, module upload). Cleanup
// scan refuses to run while non-zero so an in-flight upload's not-yet-journaled
// IDs cannot be deleted as orphans.
let assetUploadsInFlight = 0;

// True while applyRepair is running. Module attach/detach + drawer mutations
// gate against this so the snapshot-then-write loop in forceRetranslateAll
// can't be raced into silent data loss on user_overrides.
const repairInFlightByUser = new Set<string>();

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

async function applySvgRasterIndex(args: {
  characterId: string;
  imageIdByMarker: Readonly<Record<string, string | null>>;
  userId: string;
}): Promise<void> {
  const { characterId, imageIdByMarker, userId } = args;

  // Wire format uses string keys; marker-substitution helper expects numeric.
  const markerToImageId: Record<number, string | null> = {};
  for (const [k, v] of Object.entries(imageIdByMarker)) {
    const n = Number.parseInt(k, 10);
    if (Number.isFinite(n)) markerToImageId[n] = v;
  }

  const { substituteSvgMarkers } = await import('./core/svg-rasterize.js');
  let regexScriptsAfterSubstitution: readonly unknown[] = [];
  const updated = await updateLumirealm(charactersApi(), characterId, userId, (cur) => {
    const newRegex = cur.regex_scripts.map((r) => {
      const before = (r as { replace_string?: string }).replace_string ?? '';
      if (!before) return r;
      const after = substituteSvgMarkers(before, markerToImageId);
      if (after === before) return r;
      return { ...r, replace_string: after };
    });
    const beforeBg = cur.payload.background_html ?? '';
    const afterBg = beforeBg ? substituteSvgMarkers(beforeBg, markerToImageId) : beforeBg;
    regexScriptsAfterSubstitution = newRegex;
    return {
      ...cur,
      regex_scripts: newRegex,
      ...(afterBg !== beforeBg
        ? { payload: { ...cur.payload, background_html: afterBg } }
        : {}),
    };
  });
  if (!updated) {
    log.warn(
      `applySvgRasterIndex: updateLumirealm failed char=${characterId},character may not be a lumirealm card`,
    );
    return;
  }

  // Re-install all rules. Runtime DOM lifter handles fixed-position content
  // post-render, so there's no extension-managed partition to filter on.
  const lumiManaged = regexScriptsAfterSubstitution;
  if (lumiManaged.length > 0) {
    let characterName = characterId;
    try {
      const ch = await spindle.characters.get(characterId, userId);
      if (ch && typeof (ch as { name?: unknown }).name === 'string') {
        characterName = (ch as { name: string }).name;
      }
    } catch { /* falls back to id */ }
    log.info(
      `applySvgRasterIndex: re-dispatching install_regex_scripts char=${characterId} ` +
        `count=${lumiManaged.length} (post-SVG-substitution)`,
    );
    send({
      type: 'install_regex_scripts',
      characterId,
      characterName,
      scripts: lumiManaged.map((r) => ({
        name: (r as { name?: string }).name ?? '',
        script_id: (r as { script_id?: string }).script_id ?? '',
        find_regex: (r as { find_regex?: string }).find_regex ?? '',
        replace_string: (r as { replace_string?: string }).replace_string ?? '',
        flags: (r as { flags?: string }).flags ?? '',
        placement: (r as { placement?: readonly string[] }).placement ?? [],
        scope: (r as { scope?: string }).scope ?? 'character',
        scope_id: (r as { scope_id?: string }).scope_id ?? characterId,
        target: (r as { target?: string }).target ?? 'display',
        min_depth: (r as { min_depth?: number | null }).min_depth ?? null,
        max_depth: (r as { max_depth?: number | null }).max_depth ?? null,
        trim_strings: (r as { trim_strings?: readonly string[] }).trim_strings ?? [],
        run_on_edit: (r as { run_on_edit?: boolean }).run_on_edit ?? false,
        substitute_macros: (r as { substitute_macros?: string }).substitute_macros ?? 'none',
        disabled: (r as { disabled?: boolean }).disabled ?? false,
        sort_order: (r as { sort_order?: number }).sort_order ?? 0,
        description: (r as { description?: string }).description ?? '',
        folder: (r as { folder?: string }).folder ?? '',
        metadata: { ...((r as { metadata?: Record<string, unknown> }).metadata ?? {}) },
      })) as never,
    }, userId);
  }

  const newSvgImageIds = Object.values(markerToImageId).filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );
  if (newSvgImageIds.length > 0) {
    try {
      await appendImageIdsToJournal(journalStorage(), userId, characterId, newSvgImageIds);
      log.info(
        `applySvgRasterIndex: journaled char=${characterId} added=${newSvgImageIds.length}`,
      );
    } catch (err) {
      log.warn(`applySvgRasterIndex: journal append failed char=${characterId}: ${errMsg(err)}`);
    }
  }

  const evictedChatIds: string[] = [];
  for (const [chatId, active] of activeCardByChat) {
    if (active.card.character_id === characterId) {
      activeCardByChat.delete(chatId);
      evictedChatIds.push(chatId);
    }
  }
  if (evictedChatIds.length > 0) {
    log.info(
      `applySvgRasterIndex: invalidated ${evictedChatIds.length} active-card entries for char=${characterId}`,
    );
    for (const chatId of evictedChatIds) {
      try {
        const reloaded = await ensureActiveCardForChat(chatId, null, userId);
        if (reloaded) {
          invalidateRenderMcpForChat(chatId);
          await refreshBgHtml(reloaded, chatId, userId);
        }
      } catch (err) {
        log.warn(`applySvgRasterIndex: refresh chat=${chatId} threw: ${errMsg(err)}`);
      }
    }
  }
}

async function maybeFinalizeImport(characterId: string): Promise<void> {
  const pending = pendingImportCompletions.get(characterId);
  if (!pending) return;
  if (pending.hasPendingSvgRaster) {
    log.info(
      `import.finalize: char=${characterId} still pending,svg=${pending.hasPendingSvgRaster}`,
    );
    return;
  }
  pendingImportCompletions.delete(characterId);
  log.info(
    `import.finalize: char=${characterId} both async ops complete after ${Date.now() - pending.startedAt}ms,emitting phase=done`,
  );
  send({
    type: 'import_progress',
    phase: 'done',
    message: `Imported ${pending.characterName}`,
    fraction: 1,
    characterId,
  }, pending.ownerUserId);
  try {
    pushCards(await listCards(pending.ownerUserId), pending.ownerUserId);
  } catch (err) {
    log.warn(`import.finalize: pushCards failed: ${errMsg(err)}`);
  }
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

async function importCardFromBytes(
  bytesB64: string,
  fileName: string,
  userId: string,
): Promise<void> {
  const tStart = Date.now();
  log.info(`importCardFromBytes: start file=${fileName} b64-bytes=${bytesB64.length} (~${Math.round(bytesB64.length * 0.75)}B decoded) userId=${userId}`);

  const hasSetAvatar = typeof (spindle.characters as { setAvatar?: unknown }).setAvatar === 'function';
  if (!spindle.images?.upload) {
    throw new Error(
      'spindle.images.upload is unavailable,Lumi 0.9.6+ required.',
    );
  }
  const spindleImagesApi = spindle.images;
  const spindleImportApi: SpindleImportApi = {
    characters: {
      create: (input, uid) => {
        log.info(`spindle.characters.create name=${(input as { name?: string }).name ?? '?'}`);
        return spindle.characters.create(input as never, uid).then((c) => {
          log.info(`spindle.characters.create -> id=${c.id}`);
          return { id: c.id };
        });
      },
      get: (characterId, uid) => spindle.characters.get(characterId, uid),
      update: (characterId, input, uid) =>
        spindle.characters.update(characterId, input as never, uid),
      // characters.list is options-bag for userId (spindle-api.ts)  -
      // not positional. Importer doesn't actually call list itself but
      // it's kept to satisfy the SpindleImportApi shape.
      list: (options) =>
        spindle.characters.list(options) as unknown as Promise<{
          data: readonly unknown[];
          total: number;
        }>,
      ...(hasSetAvatar
        ? {
            setAvatar: (characterId, avatar, uid) => {
              log.info(`spindle.characters.setAvatar characterId=${characterId} filename=${avatar.filename ?? '?'} bytes=${avatar.data.byteLength}`);
              return (spindle.characters as unknown as {
                setAvatar(
                  id: string,
                  avatar: { data: Uint8Array; filename?: string; mime_type?: string },
                  userId?: string,
                ): Promise<{ id: string; image_id?: string | null }>;
              }).setAvatar(characterId, avatar, uid).then((c) => ({
                id: c.id,
                image_id: typeof c.image_id === 'string' ? c.image_id : null,
              }));
            },
          }
        : {}),
    },
    world_books: spindle.world_books
      ? {
          create: (input, uid) => {
            log.info(`spindle.world_books.create name=${(input as { name?: string }).name ?? '?'}`);
            return spindle.world_books.create(input as never, uid).then((w) => {
              log.info(`spindle.world_books.create -> id=${w.id}`);
              return { id: w.id };
            });
          },
          update: (bookId, input, uid) =>
            spindle.world_books.update(bookId, input as never, uid),
          entries: {
            create: (bookId, input, uid) =>
              spindle.world_books.entries.create(bookId, input as never, uid).then((e) => ({ id: e.id })),
          },
        }
      : undefined,
    images: {
      upload: (input, uid) =>
        spindleImagesApi.upload(input, uid).then((img) => ({ id: img.id })),
      ...(typeof spindleImagesApi.uploadMany === 'function'
        ? {
            uploadMany: (items, options) =>
              spindleImagesApi.uploadMany(items as never, options),
          }
        : {}),
    },
    requestConsent: (opts) => requestConsent(opts, userId),
  };
  if (!spindle.world_books) log.warn(`spindle.world_books unavailable, lorebook entries will be skipped`);

  assetUploadsInFlight++;
  try {
    const result = await importCard({
      bytesB64,
      fileName,
      extensionVersion: EXTENSION_VERSION,
      userId,
      spindle: spindleImportApi,
      userStorage: userStorage(),
      onProgress: (phase, message, fraction) => {
        log.info(`import.progress phase=${phase} frac=${fraction ?? '?'} msg=${message}`);
        send({
          type: 'import_progress',
          phase: phase as 'decoding' | 'translating' | 'awaiting_consent' | 'creating_character' | 'uploading_assets' | 'saving_payload' | 'done' | 'error',
          message,
          fraction,
        }, userId);
      },
    });
    log.info(
      `importCard: returned characterId=${result.characterId} name=${result.characterName} ` +
        `imageIds=${result.imageIds.length} warnings=${result.warnings.length} elapsed=${Date.now() - tStart}ms`,
    );
    nudgeGc('card-import');

    // Pre-seed worldBookIdsByCharacter so CHARACTER_DELETED before any chat
    // open still has the world_book id for cleanup.
    if (result.createdWorldBookIds.length > 0) {
      const existing = worldBookIdsByCharacter.get(result.characterId) ?? [];
      const merged = [...existing];
      for (const wbId of result.createdWorldBookIds) {
        if (!merged.includes(wbId)) merged.push(wbId);
      }
      worldBookIdsByCharacter.set(result.characterId, merged);
    }

    await refreshRisuAssetMap(result.characterId, userId).catch((err) => {
      log.warn(`importCardFromBytes: refreshRisuAssetMap threw char=${result.characterId}: ${errMsg(err)}`);
    });

    const scriptsToInstall = result.pendingRegexScripts;
    const byTarget = new Map<string, number>();
    for (const s of scriptsToInstall) byTarget.set(s.target, (byTarget.get(s.target) ?? 0) + 1);
    const targetSummary = [...byTarget.entries()].map(([t, n]) => `${t}=${n}`).join(',') || 'none';
    log.info(
      `install_regex_scripts: push=${scriptsToInstall.length} ` +
        `targets=[${targetSummary}] char=${result.characterId}`,
    );
    send({
      type: 'install_regex_scripts',
      characterId: result.characterId,
      characterName: result.characterName,
      scripts: scriptsToInstall,
    }, userId);

    const hasPendingSvgRaster = result.pendingSvgRasters.length > 0;
    if (hasPendingSvgRaster) {
      log.info(
        `rasterize_svgs: handing off ${result.pendingSvgRasters.length} unique SVG(s) to frontend for char=${result.characterId} ` +
          `(simple+theme-reactive+animated; templated skipped per manifest)`,
      );
      send({
        type: 'rasterize_svgs',
        characterId: result.characterId,
        characterName: result.characterName,
        svgs: result.pendingSvgRasters
          .filter((t) => t.classification !== 'templated')
          .map((t) => ({
            markerN: t.markerN,
            svg: t.svg,
            classification: t.classification as 'simple' | 'theme-reactive' | 'animated',
            width: t.width,
            height: t.height,
          })),
      }, userId);
    }

    if (hasPendingSvgRaster) {
      pendingImportCompletions.set(result.characterId, {
        hasPendingSvgRaster,
        characterName: result.characterName,
        startedAt: Date.now(),
        ownerUserId: userId,
      });
      log.info(
        `importCardFromBytes: deferring phase=done for char=${result.characterId} ` +
          `(pending: svg=${hasPendingSvgRaster})`,
      );
    } else {
      log.info(`import done: no pending async ops, sending phase=done`);
      send({
        type: 'import_progress',
        phase: 'done',
        message: `Imported ${result.characterName}`,
        fraction: 1,
        characterId: result.characterId,
      }, userId);
      pushCards(await listCards(userId), userId);
    }
    for (const warning of result.warnings) {
      log.warn(`import warning surfaced: ${warning}`);
      toastFor(userId, 'warning', warning, { title: 'lumirealm' });
    }
    log.info(`importCardFromBytes: done file=${fileName} total-elapsed=${Date.now() - tStart}ms`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (err instanceof RisuConsentDeclinedError) {
      log.info(`import cancelled by user (consent declined) after ${Date.now() - tStart}ms`);
      send({
        type: 'import_progress',
        phase: 'error',
        message: `Import cancelled, low-level access declined`,
        fraction: null,
        error: message,
      }, userId);
      return;
    }
    log.error(`import failed after ${Date.now() - tStart}ms: ${message}`);
    send({
      type: 'import_progress',
      phase: 'error',
      message: `Import of ${fileName} failed`,
      fraction: null,
      error: message,
    }, userId);
  } finally {
    assetUploadsInFlight--;
  }
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

async function ensureActiveCardForChat(
  chatId: string,
  characterId: string | null,
  userId: string | undefined,
): Promise<ActiveCard | null> {
  const tEnter = Date.now();
  if (userId === undefined) {
    log.info(`ensureActiveCardForChat: userId not yet captured for chatId=${chatId},will retry on next event`);
    return null;
  }
  const cached = activeCardByChat.get(chatId);
  if (cached) {
    if (cached.ownerUserId !== userId) {
      log.warn(`ensureActiveCardForChat: cache-hit owner mismatch chatId=${chatId} cachedOwner=${cached.ownerUserId} requester=${userId},refusing`);
      return null;
    }
    log.debug(`ensureActiveCardForChat: cache hit chatId=${chatId} characterId=${cached.card.character_id}`);
    return cached;
  }
  let tChatsGet = 0;
  if (!characterId) {
    const tChatGet0 = Date.now();
    try {
      const chat = await spindle.chats.get(chatId, userId);
      tChatsGet = Date.now() - tChatGet0;
      const resolved = chat?.character_id ?? null;
      if (resolved) {
        log.info(`ensureActiveCardForChat: resolved characterId=${resolved} via chats.get for chatId=${chatId} chats_get=${tChatsGet}ms`);
        characterId = resolved;
      }
    } catch (err) {
      tChatsGet = Date.now() - tChatGet0;
      log.warn(`ensureActiveCardForChat: chats.get(${chatId}) failed chats_get=${tChatsGet}ms: ${errMsg(err)}`);
    }
  }
  if (!characterId) {
    log.info(`ensureActiveCardForChat: no characterId for chatId=${chatId} (chat may be group/deleted),skip`);
    return null;
  }
  log.info(`ensureActiveCardForChat: cache miss chatId=${chatId} characterId=${characterId},fetching extensions`);
  const tReadLumi0 = Date.now();
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  const tReadLumi = Date.now() - tReadLumi0;
  if (!fetched) {
    log.info(`ensureActiveCardForChat: character not found id=${characterId} (group chat or deleted)`);
    return null;
  }
  if (!fetched.data) {
    log.info(`ensureActiveCardForChat: character ${characterId} is not a lumirealm card (no extensions.lumirealm or soft-removed)`);
    return null;
  }
  const tValidate0 = Date.now();
  const check = preValidateRequires(fetched.data.payload.requires);
  const tValidate = Date.now() - tValidate0;
  if (!check.ok) {
    const err = new RisuCompatVersionError(check.missing, EXTENSION_VERSION);
    log.error(err.message);
    toastFor(userId, 'error', err.message, { title: 'lumirealm' });
    return null;
  }
  if (check.degraded.length > 0) {
    log.warn(`ensureActiveCardForChat: degraded features=[${check.degraded.join(', ')}]`);
    toastFor(userId, 'warning',
      `Card uses degraded features: ${check.degraded.join(', ')}.`,
      { title: 'lumirealm' },
    );
  }
  const attachedIds = fetched.data.user_overrides.attached_module_ids ?? [];
  const tModules0 = Date.now();
  const attachedForRuntime = attachedIds.length > 0
    ? await loadAttachedModulesForRuntime(userId, attachedIds)
    : [];
  const tModules = Date.now() - tModules0;
  const tBuild0 = Date.now();
  const card = buildSyntheticStoredCard(
    characterId,
    fetched.data,
    fetched.risuai,
    attachedForRuntime,
  );
  const tBuild = Date.now() - tBuild0;
  log.info(
    `ensureActiveCardForChat: loaded char=${characterId} translator=${card.risuPayload.translator_version} ` +
    `triggers=${card.risuPayload.triggers.length} lua_scripts=${card.risuPayload.lua_scripts.length} ` +
    `regex=${card.regex_scripts?.length ?? 0} assets=${Object.keys(card.asset_index).length} ` +
    `bg_html_len=${card.risuPayload.background_html?.length ?? 0} ` +
    `utility_bot=${card.risuPayload.utility_bot} ` +
    `defaults=${Object.keys(card.risuPayload.scriptstate_defaults).length} ` +
    `modules=${attachedForRuntime.length}` +
    (attachedForRuntime.length > 0
      ? ` (${attachedForRuntime.map((m) => `${m.id}:t${m.triggers.length}/a${Object.keys(m.asset_index).length}`).join(',')})`
      : '') +
    ` chats_get=${tChatsGet}ms readLumi=${tReadLumi}ms validate=${tValidate}ms modules=${tModules}ms build=${tBuild}ms`,
  );
  const active: ActiveCard = { card, chatId, ownerUserId: userId, lumirealm: fetched.data };
  activeCardByChat.set(chatId, active);
  const allWbIds = (fetched.character.world_book_ids ?? []).filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  );
  const moduleWbIdSet = new Set(
    Object.values(fetched.data.user_overrides.attached_module_world_books ?? {})
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  );
  const characterOwnedWbIds = allWbIds.filter((id) => !moduleWbIdSet.has(id));
  worldBookIdsByCharacter.set(characterId, characterOwnedWbIds);
  void backfillImageJournalIfMissing(characterId, fetched.character.image_id ?? null, card, userId);
  setActiveAssetIndexes(chatId, {
    assets: card.asset_index,
    emotions: card.emotion_index,
  });
  setActiveScriptstateDefaults(
    chatId,
    card.character_id,
    card.risuPayload.scriptstate_defaults ?? {},
  );
  const mbnForActive = modulesByNamespaceFromCard(card);
  if (mbnForActive) setActiveModulesByNamespace(chatId, card.character_id, mbnForActive);
  else clearActiveModulesByNamespace(chatId);
  setActiveCharacterImage(
    chatId,
    imageUrlFromId(fetched.character.image_id ?? null),
  );
  void refreshPersonaImage(userId);
  // One-time seed of authors_note from CCSv3 depth_prompt on first open.
  void seedAuthorsNoteFromDepthPrompt(chatId, userId, fetched.character.extensions ?? {});
  void maybeMigrateCharacterTranslator(characterId, fetched.character.name, userId, fetched.data);
  log.info(
    `ensureActiveCardForChat: DONE chatId=${chatId} characterId=${characterId} total=${Date.now() - tEnter}ms`,
  );
  return active;
}

// Dedupe per-character per-worker-boot. Set on first migration check fire.
const translatorMigrationChecked = new Set<string>();
// Per-userId per-boot dedupe so the mass walk runs once per worker boot.
const massModuleMigrationStartedThisBoot = new Set<string>();
const massCharacterMigrationStartedThisBoot = new Set<string>();

function maybeMigrateCharacterTranslator(
  characterId: string,
  characterName: string,
  userId: string,
  envelope: import('./payload/types.js').LumirealmCharacterData,
): void {
  if (translatorMigrationChecked.has(characterId)) return;
  // forceRetranslateAll deletes the dedupe flag + writes v=0 + runs migration
  // sequentially. A chat-open mid-loop would re-fire the migration concurrently.
  if (repairInFlightByUser.has(userId)) return;
  const stored = envelope.translator_schema_version ?? 1;
  if (stored >= CURRENT_CHARACTER_SCHEMA_VERSION) {
    translatorMigrationChecked.add(characterId);
    return;
  }
  translatorMigrationChecked.add(characterId);
  void runCharacterMigration(characterId, characterName, userId, envelope, {
    firePromptOnNeedsReimport: true,
  });
}

async function runCharacterMigration(
  characterId: string,
  characterName: string,
  userId: string,
  envelope: import('./payload/types.js').LumirealmCharacterData,
  opts?: { firePromptOnNeedsReimport?: boolean; silent?: boolean },
): Promise<import('./state/translator-migrations.js').MigrationResult['kind']> {
  const deps: MigrationDeps = {
    loadCatalog,
    extensionVersion: EXTENSION_VERSION,
    log,
    installCharacterRegexScripts: async (charId, charName, scripts) => {
      send({
        type: 'install_regex_scripts',
        characterId: charId,
        characterName: charName,
        scripts: scripts.map((s) => ({ ...s, metadata: { ...(s.metadata ?? {}) } })),
      }, userId);
    },
    reinstallAttachedModules: async (charId) => {
      const ids = envelope.user_overrides.attached_module_ids ?? [];
      let count = 0;
      for (const moduleId of ids) {
        try {
          const env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
          if (!env) continue;
          await dispatchModuleArtifactInstall(charId, env, userId);
          count++;
        } catch (err) {
          log.warn(
            `runCharacterMigration: reinstall module=${moduleId} char=${charId} threw: ${errMsg(err)}`,
          );
        }
      }
      return count;
    },
    dispatchSvgRasterize: (charId, charName, svgs) => {
      const filtered = svgs.filter((t) => t.classification !== 'templated');
      if (filtered.length === 0) return;
      log.info(
        `runCharacterMigration: dispatching rasterize_svgs char=${charId} count=${filtered.length}`,
      );
      send({
        type: 'rasterize_svgs',
        characterId: charId,
        characterName: charName,
        svgs: filtered.map((t) => ({
          markerN: t.markerN,
          svg: t.svg,
          classification: t.classification as 'simple' | 'theme-reactive' | 'animated',
          width: t.width,
          height: t.height,
        })),
      }, userId);
    },
    writeEnvelope: async (charId, data, uid) => {
      await writeLumirealm(charactersApi(), charId, data, uid);
    },
    getAvatarImageId: async (charId, uid) => {
      try {
        const ch = await spindle.characters.get(charId, uid) as { image_id?: unknown };
        return typeof ch?.image_id === 'string' && ch.image_id.length > 0
          ? ch.image_id
          : null;
      } catch {
        return null;
      }
    },
    getCharacterWorldBookIds: async (charId, uid) => {
      try {
        const ch = await spindle.characters.get(charId, uid) as { world_book_ids?: unknown };
        if (!Array.isArray(ch?.world_book_ids)) return [];
        return ch.world_book_ids.filter((x): x is string => typeof x === 'string');
      } catch {
        return [];
      }
    },
    listWorldBookEntries: async (wbId, uid) => {
      const out: { id: string; extensions: Record<string, unknown> | null }[] = [];
      let offset = 0;
      while (true) {
        const page = await spindle.world_books.entries.list(wbId, { limit: 200, offset, userId: uid });
        for (const e of page.data) {
          const ee = e as { id?: unknown; extensions?: unknown };
          const id = typeof ee.id === 'string' ? ee.id : null;
          if (id === null) continue;
          const ext = ee.extensions && typeof ee.extensions === 'object' && !Array.isArray(ee.extensions)
            ? ee.extensions as Record<string, unknown>
            : null;
          out.push({ id, extensions: ext });
        }
        if (page.data.length < 200) break;
        offset += 200;
      }
      return out;
    },
    updateWorldBookEntryExtensions: async (entryId, extensions, uid) => {
      await spindle.world_books.entries.update(entryId, { extensions } as never, uid);
    },
  };
  const result = await migrateCharacterIfNeeded(
    { characterId, characterName, userId, envelope },
    deps,
  );
  if (result.kind === 'migrated') {
    invalidateActiveForCharacter(characterId, userId);
    if (!opts?.silent) {
      toastFor(userId, 'success',
        `Updated ${characterName} for the latest LumiRealm fixes.`,
        { title: 'lumirealm' },
      );
    }
  } else if (result.kind === 'needs_reimport') {
    if (opts?.firePromptOnNeedsReimport !== true) return result.kind;
    const { alreadyWarned } = await markLegacyReimportWarned(
      spindle.userStorage,
      userId,
      characterId,
    );
    if (alreadyWarned) return result.kind;
    send({
      type: 'notify_legacy_card_needs_reimport',
      characterId,
      characterName,
    }, userId);
  } else if (result.kind === 'failed') {
    log.error(
      `migration failed char=${characterId}: ${result.error} (will retry next boot)`,
    );
    translatorMigrationChecked.delete(characterId);
  }
  return result.kind;
}

async function runModuleMigration(
  moduleId: string,
  userId: string,
): Promise<{ ok: boolean }> {
  const env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
  if (!env) return { ok: true };
  const stored = env.translator_schema_version ?? 1;
  if (stored >= CURRENT_MODULE_SCHEMA_VERSION) return { ok: true };
  let archiveWbId: string | null = null;
  const deps: ModuleMigrationDeps = {
    syncWorldBook: async (e) => {
      archiveWbId = await archiveModuleWorldBookBeforeMigration(e, userId);
      return syncModuleWorldBook(e, userId);
    },
    reinstallArtifactsForAttached: async (mid) => {
      const charIds = await charactersAttachedTo(mid, userId);
      let count = 0;
      for (const charId of charIds) {
        try {
          await dispatchModuleArtifactInstall(charId, env, userId);
          count++;
        } catch (err) {
          log.warn(
            `runModuleMigration: reinstall char=${charId} module=${mid} threw: ${errMsg(err)}`,
          );
        }
      }
      return count;
    },
    refreshArtifactsForAttached: async (mid) => {
      const charIds = await charactersAttachedTo(mid, userId);
      let count = 0;
      for (const charId of charIds) {
        try {
          await refreshAttachedModule(charId, env, userId);
          count++;
        } catch (err) {
          log.warn(
            `runModuleMigration: refresh char=${charId} module=${mid} threw: ${errMsg(err)}`,
          );
        }
      }
      return count;
    },
    writeEnvelope: async (next) => {
      await writeModuleEnvelope(moduleStorage(), userId, next);
    },
    log,
  };
  const result = await migrateModuleIfNeeded(env, deps);
  if (result.kind === 'migrated') {
    const charIds = await charactersAttachedTo(moduleId, userId);
    for (const charId of charIds) invalidateActiveForCharacter(charId, userId);
    if (archiveWbId) {
      const m = env.module as { name?: unknown };
      const moduleName = typeof m.name === 'string' && m.name.length > 0 ? m.name : env.id;
      notifyLorebookMigrationArchive(`Module: ${moduleName}`, archiveWbId, userId);
    }
    return { ok: true };
  }
  if (result.kind === 'failed') return { ok: false };
  return { ok: true };
}


async function runMassModuleMigrationIfNeeded(userId: string): Promise<void> {
  if (massModuleMigrationStartedThisBoot.has(userId)) return;
  massModuleMigrationStartedThisBoot.add(userId);
  const state = await readMigrationState(spindle.userStorage, userId);
  if (state.last_swept_modules >= CURRENT_MODULE_SCHEMA_VERSION) {
    log.info(`mass-migration(modules): user=${userId} already swept to v${state.last_swept_modules}, skipping`);
    return;
  }
  const allModules = await listModuleStore(moduleStorage(), userId);
  const candidates: string[] = [];
  for (const m of allModules) {
    const env = await readModuleEnvelope(moduleStorage(), userId, m.id);
    if (!env) continue;
    if ((env.translator_schema_version ?? 1) < CURRENT_MODULE_SCHEMA_VERSION) {
      candidates.push(m.id);
    }
  }
  if (candidates.length === 0) {
    await writeMigrationState(spindle.userStorage, userId, {
      ...state,
      last_swept_modules: CURRENT_MODULE_SCHEMA_VERSION,
    });
    log.info(`mass-migration(modules): user=${userId} no modules below v${CURRENT_MODULE_SCHEMA_VERSION}, sweep marker bumped`);
    return;
  }
  const opId = `mass-migration-modules-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const opTitle = 'Updating module lorebooks';
  emitOperationProgress(
    userId,
    opId,
    'started',
    opTitle,
    `Updating ${candidates.length} module${candidates.length === 1 ? '' : 's'}…`,
    0,
  );
  log.info(`mass-migration(modules): user=${userId} starting count=${candidates.length} opId=${opId}`);
  let processed = 0;
  let failed = 0;
  for (const moduleId of candidates) {
    try {
      const r = await runModuleMigration(moduleId, userId);
      if (!r.ok) failed++;
    } catch (err) {
      failed++;
      log.warn(`mass-migration(modules): module=${moduleId} threw: ${errMsg(err)}`);
    }
    processed++;
    emitOperationProgress(
      userId,
      opId,
      'progress',
      opTitle,
      `Updated ${processed}/${candidates.length} module${candidates.length === 1 ? '' : 's'}`,
      processed / candidates.length,
    );
  }
  if (failed === 0) {
    const after = await readMigrationState(spindle.userStorage, userId);
    await writeMigrationState(spindle.userStorage, userId, {
      ...after,
      last_swept_modules: CURRENT_MODULE_SCHEMA_VERSION,
    });
    log.info(`mass-migration(modules): user=${userId} done processed=${processed} opId=${opId}`);
  } else {
    log.warn(
      `mass-migration(modules): user=${userId} done with failures processed=${processed} failed=${failed} ` +
        `(sweep marker NOT bumped, will retry next boot)`,
    );
  }
  emitOperationProgress(
    userId,
    opId,
    'done',
    opTitle,
    failed === 0
      ? `Updated ${processed} module${processed === 1 ? '' : 's'}`
      : `Updated ${processed - failed}/${processed} (${failed} failed, will retry next start)`,
    1,
  );
  const existingTimer = archiveFlushTimerByUser.get(userId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    archiveFlushTimerByUser.delete(userId);
  }
  await flushLorebookMigrationArchives(userId);
}

async function runMassCharacterMigrationIfNeeded(userId: string): Promise<void> {
  if (massCharacterMigrationStartedThisBoot.has(userId)) return;
  massCharacterMigrationStartedThisBoot.add(userId);
  const state = await readMigrationState(spindle.userStorage, userId);
  if (state.last_swept_characters >= CURRENT_CHARACTER_SCHEMA_VERSION) {
    log.info(`mass-migration(characters): user=${userId} already swept to v${state.last_swept_characters}, skipping`);
    return;
  }
  const all = await listLumirealmCharacters(charactersApi(), userId, { paginate: true });
  const candidates: { id: string; name: string; data: import('./payload/types.js').LumirealmCharacterData }[] = [];
  for (const entry of all) {
    if ((entry.data.translator_schema_version ?? 1) < CURRENT_CHARACTER_SCHEMA_VERSION) {
      candidates.push({ id: entry.character.id, name: entry.character.name ?? '(unnamed)', data: entry.data });
    }
  }
  if (candidates.length === 0) {
    await writeMigrationState(spindle.userStorage, userId, {
      ...state,
      last_swept_characters: CURRENT_CHARACTER_SCHEMA_VERSION,
    });
    log.info(`mass-migration(characters): user=${userId} no characters below v${CURRENT_CHARACTER_SCHEMA_VERSION}, sweep marker bumped`);
    return;
  }
  const opId = `mass-migration-characters-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const opTitle = 'Updating Risu cards';
  emitOperationProgress(
    userId,
    opId,
    'started',
    opTitle,
    `Updating ${candidates.length} card${candidates.length === 1 ? '' : 's'}…`,
    0,
  );
  log.info(`mass-migration(characters): user=${userId} starting count=${candidates.length} opId=${opId}`);
  let processed = 0;
  let failed = 0;
  for (const c of candidates) {
    // Per-character per-boot dedupe in `translatorMigrationChecked` would
    // otherwise short-circuit if the chat opened first. Mark + run inline so
    // both paths agree on completion ordering.
    if (translatorMigrationChecked.has(c.id)) {
      processed++;
      continue;
    }
    translatorMigrationChecked.add(c.id);
    try {
      await runCharacterMigration(c.id, c.name, userId, c.data);
    } catch (err) {
      failed++;
      translatorMigrationChecked.delete(c.id);
      log.warn(`mass-migration(characters): character=${c.id} threw: ${errMsg(err)}`);
    }
    processed++;
    emitOperationProgress(
      userId,
      opId,
      'progress',
      opTitle,
      `Updated ${processed}/${candidates.length} card${candidates.length === 1 ? '' : 's'}`,
      processed / candidates.length,
    );
  }
  if (failed === 0) {
    const after = await readMigrationState(spindle.userStorage, userId);
    await writeMigrationState(spindle.userStorage, userId, {
      ...after,
      last_swept_characters: CURRENT_CHARACTER_SCHEMA_VERSION,
    });
    log.info(`mass-migration(characters): user=${userId} done processed=${processed} opId=${opId}`);
  } else {
    log.warn(
      `mass-migration(characters): user=${userId} done with failures processed=${processed} failed=${failed} ` +
        `(sweep marker NOT bumped, will retry next boot)`,
    );
  }
  emitOperationProgress(
    userId,
    opId,
    'done',
    opTitle,
    failed === 0
      ? `Updated ${processed} card${processed === 1 ? '' : 's'}`
      : `Updated ${processed - failed}/${processed} (${failed} failed, will retry next start)`,
    1,
  );
}

interface PendingArchiveNotification {
  readonly subjectLabel: string;
  readonly archiveWbId: string;
}
const pendingArchivesByUser = new Map<string, PendingArchiveNotification[]>();
const archiveFlushTimerByUser = new Map<string, ReturnType<typeof setTimeout>>();
const ARCHIVE_BATCH_DELAY_MS = 2000;

function notifyLorebookMigrationArchive(
  subjectLabel: string,
  archiveWbId: string,
  userId: string,
): void {
  const list = pendingArchivesByUser.get(userId) ?? [];
  list.push({ subjectLabel, archiveWbId });
  pendingArchivesByUser.set(userId, list);
  const existing = archiveFlushTimerByUser.get(userId);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    archiveFlushTimerByUser.delete(userId);
    void flushLorebookMigrationArchives(userId);
  }, ARCHIVE_BATCH_DELAY_MS);
  if (typeof (timer as { unref?: () => void }).unref === 'function') {
    (timer as { unref: () => void }).unref();
  }
  archiveFlushTimerByUser.set(userId, timer);
}

async function flushLorebookMigrationArchives(userId: string): Promise<void> {
  const pending = pendingArchivesByUser.get(userId);
  if (!pending || pending.length === 0) return;
  pendingArchivesByUser.delete(userId);
  const items: { subjectLabel: string; archiveName: string | null }[] = [];
  for (const p of pending) {
    let archiveName: string | null = null;
    try {
      const wb = await spindle.world_books.get(p.archiveWbId, userId);
      archiveName = (wb as { name?: string })?.name ?? null;
    } catch (err) {
      log.warn(`flushLorebookMigrationArchives: world_books.get(${p.archiveWbId}) failed: ${errMsg(err)}`);
    }
    items.push({ subjectLabel: p.subjectLabel, archiveName });
  }
  const count = items.length;
  const MAX_LIST = 10;
  const listed = items.slice(0, MAX_LIST);
  const overflow = count - listed.length;
  const bullets = listed
    .map((i) => i.archiveName ? `• ${i.archiveName}` : `• ${i.subjectLabel} (backup)`)
    .join('\n');
  const overflowSuffix = overflow > 0 ? `\n…and ${overflow} more` : '';
  const title = count === 1 ? 'Lorebook updated' : `${count} lorebooks updated`;
  const message =
    `${count} lorebook${count === 1 ? ' was' : 's were'} updated to apply the latest LumiRealm fixes. ` +
    `Your manual edits were saved as separate backup lorebooks in the Lorebook tab:\n\n` +
    `${bullets}${overflowSuffix}\n\n` +
    `Copy any edits from these backups into the updated lorebooks if you want to keep them.`;
  const result = await queueModalConfirm(userId, {
    title,
    message,
    variant: 'info',
    confirmLabel: 'Got it',
    cancelLabel: 'Dismiss',
  });
  if (result === null) {
    toastFor(userId, 'info', message, { title });
  }
}

async function seedAuthorsNoteFromDepthPrompt(
  chatId: string,
  userId: string,
  characterExtensions: Readonly<Record<string, unknown>>,
): Promise<void> {
  let chat: { metadata?: unknown } | null;
  try {
    chat = (await spindle.chats.get(chatId, userId)) as { metadata?: unknown } | null;
  } catch (err) {
    log.warn(`seedAuthorsNoteFromDepthPrompt: chats.get failed chat=${chatId}: ${errMsg(err)}`);
    return;
  }
  const currentMeta = chat?.metadata && typeof chat.metadata === 'object' && !Array.isArray(chat.metadata)
    ? (chat.metadata as Record<string, unknown>)
    : {};
  const decision = computeDepthPromptSeed(characterExtensions, currentMeta);
  if (!decision.shouldWrite) return;
  try {
    expectChatChange(chatId);
    await spindle.chats.update(chatId, { metadata: decision.nextMetadata as never }, userId);
    log.info(
      `seedAuthorsNoteFromDepthPrompt: ${decision.outcome} chat=${chatId} ` +
        `preserved_existing=${decision.preservedExisting}`,
    );
  } catch (err) {
    log.warn(`seedAuthorsNoteFromDepthPrompt: chats.update failed chat=${chatId}: ${errMsg(err)}`);
  }
}

async function refreshPersonaImage(userId: string): Promise<void> {
  try {
    const persona = await spindle.personas.getActive(userId).catch(() => null);
    const rawId = (persona as { image_id?: unknown } | null)?.image_id;
    setActivePersonaImage(
      userId,
      imageUrlFromId(typeof rawId === 'string' ? rawId : null),
    );
  } catch (err) {
    log.debug(`refreshPersonaImage: ${errMsg(err)}`);
  }
}

async function runBinding(
  active: ActiveCard,
  chatId: string,
  binding: RisuBinding,
  userId: string | undefined,
): Promise<void> {
  const characterId = active.card.character_id;
  const tBind = Date.now();
  let compiled = compiledByCharacter.get(characterId);
  if (!compiled) {
    try {
      const tCompile = Date.now();
      compiled = prepareTriggers(active.card.risuPayload, characterId);
      compiledByCharacter.set(characterId, compiled);
      log.info(`runBinding: compiled ${compiled.length} triggers for character=${characterId} in ${Date.now() - tCompile}ms`);
    } catch (err) {
      log.error(
        `compileTriggers failed for character=${characterId}: ` +
          (err instanceof Error ? err.message : String(err)),
      );
      return;
    }
  }
  if (compiled.length === 0) {
    log.info(`runBinding: no triggers on character=${characterId}, skip binding=${binding}`);
    return;
  }
  log.info(`runBinding: start binding=${binding} chatId=${chatId} characterId=${characterId} triggers=${compiled.length}`);
  const api = makeSpindleHost({ chatId, characterId, userId });
  const scriptNS = makeDispatcherScriptNS();
  registerManualTriggers(scriptNS, compiled, api);
  const settings = getCachedSettingsSync(userId);
  const seams = buildDispatchSeams({
    chatId,
    binding,
    settings,
    rememberOurWrite,
    stateChanged: makeStateChangedCallback(chatId, userId),
    auxDebugCapture: makeAuxDebugCapture(chatId, settings, userId),
    resolveTemplate: (text) => resolveReadonly(text, chatId, characterId, userId, { cbsContext: true }),
  });
  await withDispatchContext(seams, async () => {
    await dispatchBinding(
      {
        compiledTriggers: compiled,
        api,
        data: { characterId },
        scriptNS,
        opts: { characterId, binding },
      },
      binding,
      (err, name) => {
        const msg = err instanceof Error ? err.message : String(err);
        log.error(`trigger "${name}" failed on ${binding}: ${msg}`);
        toastFor(userId, 'error', `lumirealm: ${name},${msg}`, { title: 'lumirealm trigger error' });
      },
    );
  });

  // listenEdit('editOutput') + at-actions(editoutput) run after `output`
  // binding dispatch. Risu: scripts.ts+. listenEdit runs first; if the
  // value changes, one write at the end.
  if (binding === 'output') {
    const triggers = active.card.risuPayload.triggers as ReadonlyArray<{
      effect?: ReadonlyArray<{ type?: string }>;
    }>;
    const luaScripts = active.card.risuPayload.lua_scripts;
    const hasLuaTrigger = triggers.some(
      (t) => t.effect?.[0]?.type === 'triggerlua',
    );
    // editoutput / edittrans @@emo / @@repeat_back fire here, after the
    // LLM stream and any editOutput listenEdit chain. Mutations persist via
    // api.chat.editMessage below.
    const atActions = coerceAtActions(active.card.risuPayload.at_actions);
    const hasOutputAtActions = atActions.some(
      (a) => a.phase === 'editoutput' || a.phase === 'edittrans',
    );
    if (hasLuaTrigger || hasOutputAtActions) {
      try {
        const messages = await api.chat.getMessages();
        const latestAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
        if (latestAssistant) {
          const idx = messages.indexOf(latestAssistant); // 0-based Lumi frame
          const risuChatIdx = Math.max(-1, idx - 1); // Risu frame: greeting=-1
          let mutated = latestAssistant.content;

          if (hasLuaTrigger) {
            const editChain = triggers.map((t, i) => ({
              source: t,
              luaCode: luaScripts[i] ?? '',
            }));
            try {
              mutated = await runListenEditChain(
                editChain,
                'editOutput',
                mutated,
                { index: risuChatIdx },
                api,
                { characterId, content: mutated },
                scriptNS,
                {
                  chatId,
                  characterId,
                  resolveTemplate: (text: string) => resolveReadonly(text, chatId, characterId, userId, { cbsContext: true }),
                },
              );
            } catch (err) {
              log.warn(`runBinding: listenEdit editOutput chain threw: ${errMsg(err)}. Continuing.`);
            }
          }
          if (hasOutputAtActions) {
            try {
              for (const phase of ['editoutput', 'edittrans'] as const) {
                mutated = await runAtActionsForPhase(atActions, phase, mutated, {
                  api,
                  chatIndex: risuChatIdx,
                  role: 'assistant',
                });
              }
            } catch (err) {
              log.warn(`runBinding: at-actions output threw: ${errMsg(err)}. Continuing.`);
            }
          }

          if (mutated !== latestAssistant.content) {
            log.info(
              `runBinding: edit hooks mutated message content ` +
                `chat=${chatId} msg=${latestAssistant.id} ` +
                `before_len=${latestAssistant.content.length} after_len=${mutated.length}`,
            );
            rememberOurWrite(chatId, latestAssistant.id, mutated);
            await api.chat.editMessage(latestAssistant.id, mutated);
          }
        }
      } catch (err) {
        log.warn(`runBinding: edit-hooks output threw: ${errMsg(err)}. Continuing.`);
      }
    }
  }

  log.info(`runBinding: done binding=${binding} elapsed=${Date.now() - tBind}ms`);
}

async function dispatchManualTrigger(
  chatId: string,
  triggerName: string,
  triggerId: string | undefined,
  userId: string | undefined,
): Promise<void> {
  const active = await ensureActiveCardForChat(chatId, null, userId);
  if (!active) {
    log.warn(`dispatchManualTrigger: no active card for chatId=${chatId},skip`);
    return;
  }
  const characterId = active.card.character_id;
  interface LuaTrigger {
    effect: readonly { type: string; code?: string }[];
    type?: string;
    comment?: string;
  }
  const triggers = (active.card.risuPayload.triggers ?? []) as unknown as readonly LuaTrigger[];
  const luaTriggers = triggers.filter(
    (t) => Array.isArray(t.effect) && t.effect[0] && t.effect[0].type === 'triggerlua',
  );
  // Risu dispatches buttons via two paths: (1) triggerlua (mode=manualName),
  // (2) non-Lua triggers with comment===manualName. Both run.
  // Risu: triggers.ts.
  const commentMatchedTriggers = triggers.filter(
    (t) =>
      Array.isArray(t.effect) &&
      t.effect[0] &&
      t.effect[0].type !== 'triggerlua' &&
      t.effect[0].type !== 'triggercode' &&
      t.comment === triggerName,
  );
  if (luaTriggers.length === 0 && commentMatchedTriggers.length === 0) {
    log.warn(
      `dispatchManualTrigger: no matching triggers on character=${characterId} ` +
        `(no triggerlua and no comment="${triggerName}"),Risu would no-op here too`,
    );
    return;
  }
  log.info(
    `dispatchManualTrigger: name="${triggerName}" lua=${luaTriggers.length} ` +
      `commentMatched=${commentMatchedTriggers.length} chatId=${chatId}`,
  );
  const api = makeSpindleHost({ chatId, characterId, userId });
  const scriptNS = makeDispatcherScriptNS();
  const effectiveTriggerId = triggerId ?? String(Math.random()).slice(2, 10);
  const t0 = Date.now();
  for (const trigger of luaTriggers) {
    const firstEffect = trigger.effect[0];
    if (!firstEffect) continue;
    const luaCode = String(firstEffect.code ?? '');
    if (luaCode.length === 0) continue;
    try {
      const settings = getCachedSettingsSync(userId);
      const seams = buildDispatchSeams({
        chatId,
        binding: 'manual',
        settings,
        rememberOurWrite,
        stateChanged: makeStateChangedCallback(chatId, userId),
        auxDebugCapture: makeAuxDebugCapture(chatId, settings, userId),
        resolveTemplate: (text) => resolveReadonly(text, chatId, characterId, userId, { cbsContext: true }),
      });
      const runtime = await makeRisuTriggerRuntime(api, { characterId }, scriptNS, {
        ...seams,
        characterId,
      });
      // Risu: triggers.ts sets mode=buttonName; scriptings.ts
      // calls the Lua global by that name. Falls back to onButtonClick.
      log.info(
        `dispatchManualTrigger: invoking Lua entry=${triggerName} args=[${effectiveTriggerId}] chatId=${chatId}`,
      );
      await runtime.runLua(luaCode, {
        entry: triggerName,
        args: [effectiveTriggerId],
      });
      // Flush any vars the button-click handler wrote back to chat metadata
      // so `{{getvar::...}}` in display regex sees them on next resolve.
      // Access via the runtime's public flush()  - part of RisuTriggerRuntime.
      await (runtime as unknown as { flush?: () => Promise<void> }).flush?.();
    } catch (err) {
      log.error(`dispatchManualTrigger: Lua failed triggerName=${triggerName}: ${errMsg(err)}`);
    }
  }

  if (commentMatchedTriggers.length > 0) {
    try {
      const compiled = prepareTriggers(active.card.risuPayload, characterId);
      registerManualTriggers(scriptNS, compiled, api);
      const settings = getCachedSettingsSync(userId);
      const seams = buildDispatchSeams({
        chatId,
        binding: 'manual',
        settings,
        rememberOurWrite,
        stateChanged: makeStateChangedCallback(chatId, userId),
        auxDebugCapture: makeAuxDebugCapture(chatId, settings, userId),
        resolveTemplate: (text) => resolveReadonly(text, chatId, characterId, userId, { cbsContext: true }),
      });
      await withDispatchContext(seams, async () => {
        const fired = await dispatchByManualName(
          {
            compiledTriggers: compiled,
            api,
            data: { characterId, manualName: triggerName },
            scriptNS,
            opts: { characterId, binding: 'manual', lowLevelAccess: false },
          },
          triggerName,
          (err, name) => {
            const msg = err instanceof Error ? err.message : String(err);
            log.error(`dispatchManualTrigger: comment-matched trigger "${name}" threw: ${msg}`);
            toastFor(userId, 'error', `lumirealm: ${name},${msg}`, { title: 'lumirealm trigger error' });
          },
        );
        log.info(`dispatchManualTrigger: comment-matched dispatch fired=${fired}/${commentMatchedTriggers.length}`);
      });
    } catch (err) {
      log.error(`dispatchManualTrigger: comment-matched dispatch threw: ${errMsg(err)}`);
    }
  }

  log.info(`dispatchManualTrigger: done triggerName=${triggerName} elapsed=${Date.now() - t0}ms`);
  // State may have mutated → invalidate render-MCP cache so visible bubbles
  // re-resolve with fresh var state on the next cv-bumped re-fetch.
  invalidateRenderMcpForChat(chatId);
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId);
}

// Risu's runLuaButtonTrigger: iterates every triggerlua, runs onButtonClick(id, btn).
// Distinct from manual_trigger which targets a single named Lua function.
async function dispatchButtonClick(
  chatId: string,
  btn: string,
  btnId: string | undefined,
  userId: string | undefined,
): Promise<void> {
  const active = await ensureActiveCardForChat(chatId, null, userId);
  if (!active) {
    log.warn(`dispatchButtonClick: no active card for chatId=${chatId},skip`);
    return;
  }
  const characterId = active.card.character_id;
  interface LuaTrigger {
    effect: readonly { type: string; code?: string }[];
    type?: string;
    comment?: string;
  }
  const triggers = (active.card.risuPayload.triggers ?? []) as unknown as readonly LuaTrigger[];
  const luaTriggers = triggers.filter(
    (t) => Array.isArray(t.effect) && t.effect[0] && t.effect[0].type === 'triggerlua',
  );
  if (luaTriggers.length === 0) {
    log.warn(
      `dispatchButtonClick: no triggerlua on character=${characterId},Risu would no-op`,
    );
    return;
  }
  log.info(
    `dispatchButtonClick: btn="${btn}" btnId=${btnId ?? '<none>'} lua=${luaTriggers.length} chatId=${chatId}`,
  );
  const api = makeSpindleHost({ chatId, characterId, userId });
  const scriptNS = makeDispatcherScriptNS();
  const effectiveId = btnId ?? String(Math.random()).slice(2, 10);
  const t0 = Date.now();
  for (const trigger of luaTriggers) {
    const firstEffect = trigger.effect[0];
    if (!firstEffect) continue;
    const luaCode = String(firstEffect.code ?? '');
    if (luaCode.length === 0) continue;
    try {
      const settings = getCachedSettingsSync(userId);
      const seams = buildDispatchSeams({
        chatId,
        binding: 'manual',
        settings,
        rememberOurWrite,
        stateChanged: makeStateChangedCallback(chatId, userId),
        auxDebugCapture: makeAuxDebugCapture(chatId, settings, userId),
        resolveTemplate: (text) => resolveReadonly(text, chatId, characterId, userId, { cbsContext: true }),
      });
      const runtime = await makeRisuTriggerRuntime(api, { characterId }, scriptNS, {
        ...seams,
        characterId,
      });
      log.info(
        `dispatchButtonClick: invoking onButtonClick args=[${effectiveId}, ${btn}] chatId=${chatId}`,
      );
      await runtime.runLua(luaCode, {
        entry: 'onButtonClick',
        args: [effectiveId, btn],
      });
      await (runtime as unknown as { flush?: () => Promise<void> }).flush?.();
    } catch (err) {
      log.error(`dispatchButtonClick: Lua failed btn="${btn}": ${errMsg(err)}`);
    }
  }
  log.info(`dispatchButtonClick: done btn="${btn}" elapsed=${Date.now() - t0}ms`);
  invalidateRenderMcpForChat(chatId);
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId);
}

async function refreshVariables(
  active: ActiveCard,
  chatId: string,
  userId: string | undefined,
  opts?: { force?: boolean },
): Promise<void> {
  if (userId === undefined) {
    log.debug(`variables.refresh: skip chat=${chatId},userId not yet captured`);
    return;
  }
  let chat: { metadata?: unknown } | null = null;
  try {
    chat = (await spindle.chats.get(chatId, userId)) as { metadata?: unknown } | null;
  } catch (err) {
    log.warn(`variables.refresh: chats.get failed chat=${chatId}: ${errMsg(err)}`);
    return;
  }
  const mv = ((chat?.metadata as { macro_variables?: unknown } | undefined)
    ?.macro_variables ?? {}) as {
      local?: unknown;
      global?: unknown;
      chat?: unknown;
    };
  const scopes = {
    local: sanitizeVarMap(mv.local),
    global: sanitizeVarMap(mv.global),
    chat: sanitizeVarMap(mv.chat),
  };
  // `defaults` is the effective merged map (cardSide + overrides). FE Default
  // subtab needs both to flag overridden entries and offer "Reset to card default".
  const cardSide = active.card.risuPayload.scriptstate_defaults ?? {};
  const overrides = active.lumirealm.user_overrides.default_variables_overrides ?? {};
  const defaults: Record<string, string> = { ...cardSide, ...overrides };
  const result = variableState.applySnapshot(chatId, scopes, defaults);
  if (result.changed || opts?.force) {
    send({
      type: 'set_variables',
      chatId,
      seq: result.entry.seq,
      scopes: result.entry.scopes,
      defaults: result.entry.defaults,
      defaultsCardSide: cardSide,
      characterId: active.card.character_id,
      ts: result.entry.ts,
    }, userId);
    const counts =
      `local=${Object.keys(scopes.local).length} ` +
      `global=${Object.keys(scopes.global).length} ` +
      `chat=${Object.keys(scopes.chat).length} ` +
      `defaults=${Object.keys(defaults).length} ` +
      `overrides=${Object.keys(overrides).length}`;
    log.info(
      `variables.refresh: pushed chat=${chatId} seq=${result.entry.seq} ` +
        `${counts} forced=${!!opts?.force}`,
    );
  } else {
    log.debug(`variables.refresh: unchanged chat=${chatId} seq=${result.entry.seq}`);
  }
}

async function writeLocalVariable(
  chatId: string,
  key: string,
  value: string | null,
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const trimmedKey = key.trim();
  if (trimmedKey.length === 0) {
    return { ok: false, reason: 'variable name cannot be empty' };
  }
  const active = await ensureActiveCardForChat(chatId, null, userId);
  if (!active) {
    return { ok: false, reason: 'not a Risu-imported chat' };
  }

  let chat: { metadata?: unknown } | null;
  try {
    chat = (await spindle.chats.get(chatId, userId)) as { metadata?: unknown } | null;
  } catch (err) {
    return { ok: false, reason: `chats.get failed: ${errMsg(err)}` };
  }
  const meta = (chat?.metadata ?? {}) as Record<string, unknown>;
  const mv = (meta['macro_variables'] && typeof meta['macro_variables'] === 'object'
    ? { ...(meta['macro_variables'] as Record<string, unknown>) }
    : {}) as Record<string, unknown>;
  const local = (mv['local'] && typeof mv['local'] === 'object'
    ? { ...(mv['local'] as Record<string, unknown>) }
    : {}) as Record<string, unknown>;

  if (value === null) {
    if (!Object.prototype.hasOwnProperty.call(local, trimmedKey)) {
      return { ok: true }; // already absent,idempotent no-op
    }
    delete local[trimmedKey];
  } else {
    // Coerce to string. Empty string is allowed (matches `setvar X ""`).
    local[trimmedKey] = String(value);
  }
  mv['local'] = local;

  try {
    expectChatChange(chatId);
    await spindle.chats.update(
      chatId,
      { metadata: { ...meta, macro_variables: mv } as never },
      userId,
    );
  } catch (err) {
    return { ok: false, reason: `chats.update failed: ${errMsg(err)}` };
  }

  invalidateRenderMcpForChat(chatId);
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId, { force: true });

  log.info(
    `variables.write: chat=${chatId} key=${trimmedKey} ` +
      (value === null ? 'deleted' : `len=${String(value).length}`),
  );
  return { ok: true };
}


function toggleToWire(t: SidebarToggle): SidebarToggleWire {
  switch (t.type) {
    case 'group':
    case 'groupEnd':
    case 'divider':
      return {
        type: t.type,
        ...(t.key !== undefined ? { key: t.key } : {}),
        ...(t.value !== undefined ? { value: t.value } : {}),
      };
    case 'caption':
      return {
        type: 'caption',
        ...(t.key !== undefined ? { key: t.key } : {}),
        value: t.value ?? '',
      };
    case 'select':
      return {
        type: 'select',
        key: t.key,
        value: t.value,
        options: [...t.options],
      };
    case undefined:
    case 'text':
    case 'textarea':
      return {
        type: t.type ?? 'checkbox',
        key: t.key,
        value: t.value,
        ...(t.options !== undefined ? { options: [...t.options] } : {}),
      };
  }
}

async function loadToggleDsl(
  characterId: string,
  userId: string,
): Promise<{
  flatToggles: readonly SidebarToggle[];
  attribution: Record<string, string>;
}> {
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  if (!fetched || !fetched.data) return { flatToggles: [], attribution: {} };
  const attachedIds = fetched.data.user_overrides.attached_module_ids ?? [];
  if (attachedIds.length === 0) return { flatToggles: [], attribution: {} };

  const envelopes = await readAttachedModuleEnvelopes(userId, attachedIds);
  const modulesForToggle = envelopes.map((env) => {
    const m = env.module as { customModuleToggle?: unknown; name?: unknown };
    return {
      customModuleToggle: typeof m.customModuleToggle === 'string' ? m.customModuleToggle : '',
      displayName: typeof m.name === 'string' ? m.name : env.id,
    };
  });

  // Build per-module attribution alongside the concatenated DSL by
  // parsing each module's DSL in isolation, then unioning the keys.
  const attribution: Record<string, string> = {};
  for (const m of modulesForToggle) {
    if (!m.customModuleToggle) continue;
    const localFlat = parseToggleSyntax(m.customModuleToggle);
    for (const k of extractToggleKeys(localFlat)) {
      // First module wins on collision.
      if (!Object.prototype.hasOwnProperty.call(attribution, k)) {
        attribution[k] = m.displayName;
      }
    }
  }

  const concat = collectModuleToggleDsl(modulesForToggle);
  const flatToggles = parseToggleSyntax(concat);
  return { flatToggles, attribution };
}

async function refreshToggleDefinitions(
  active: ActiveCard,
  chatId: string,
  userId: string | undefined,
  opts?: { force?: boolean },
): Promise<void> {
  if (userId === undefined) {
    log.debug(`toggles.refresh: skip chat=${chatId},userId not yet captured`);
    return;
  }
  const { flatToggles, attribution } = await loadToggleDsl(
    active.card.character_id,
    userId,
  );
  const wire = flatToggles.map(toggleToWire);
  const result = toggleState.applySnapshot(chatId, wire, attribution);
  if (result.changed || opts?.force) {
    send({
      type: 'set_toggle_definitions',
      chatId,
      seq: result.entry.seq,
      toggles: result.entry.toggles,
      attribution: result.entry.attribution,
      ts: result.entry.ts,
    }, userId);
    log.info(
      `toggles.refresh: pushed chat=${chatId} seq=${result.entry.seq} ` +
        `count=${wire.length} keys=${extractToggleKeys(flatToggles).length} forced=${!!opts?.force}`,
    );
  } else {
    log.debug(`toggles.refresh: unchanged chat=${chatId} seq=${result.entry.seq}`);
  }
}

async function writeToggleValue(
  chatId: string,
  key: string,
  value: string | null,
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const trimmedKey = key.trim();
  if (trimmedKey.length === 0) {
    return { ok: false, reason: 'toggle key cannot be empty' };
  }
  const active = await ensureActiveCardForChat(chatId, null, userId);
  if (!active) {
    return { ok: false, reason: 'not a Risu-imported chat' };
  }

  let chat: { metadata?: unknown } | null;
  try {
    chat = (await spindle.chats.get(chatId, userId)) as { metadata?: unknown } | null;
  } catch (err) {
    return { ok: false, reason: `chats.get failed: ${errMsg(err)}` };
  }
  const meta = (chat?.metadata ?? {}) as Record<string, unknown>;
  const mv = (meta['macro_variables'] && typeof meta['macro_variables'] === 'object'
    ? { ...(meta['macro_variables'] as Record<string, unknown>) }
    : {}) as Record<string, unknown>;
  const global = (mv['global'] && typeof mv['global'] === 'object'
    ? { ...(mv['global'] as Record<string, unknown>) }
    : {}) as Record<string, unknown>;

  const storeKey = `toggle_${trimmedKey}`;
  if (value === null) {
    if (!Object.prototype.hasOwnProperty.call(global, storeKey)) {
      return { ok: true };
    }
    delete global[storeKey];
  } else {
    global[storeKey] = String(value);
  }
  mv['global'] = global;

  try {
    expectChatChange(chatId);
    await spindle.chats.update(
      chatId,
      { metadata: { ...meta, macro_variables: mv } as never },
      userId,
    );
  } catch (err) {
    return { ok: false, reason: `chats.update failed: ${errMsg(err)}` };
  }

  invalidateRenderMcpForChat(chatId);
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId, { force: true });

  log.info(
    `toggles.write: chat=${chatId} key=${storeKey} ` +
      (value === null ? 'deleted' : `len=${String(value).length}`),
  );
  return { ok: true };
}

function sanitizeVarMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== 'string') continue;
    if (v === undefined || v === null) {
      out[k] = '';
    } else if (typeof v === 'string') {
      out[k] = v;
    } else {
      try { out[k] = String(v); } catch { out[k] = ''; }
    }
  }
  return out;
}

function extractStyleBlocks(template: string): string[] {
  if (!template || template.indexOf('<style') < 0) return [];
  const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = STYLE_RE.exec(template)) !== null) {
    const inner = (m[1] ?? '').trim();
    if (inner.length === 0) continue;
    if (/\$\d|\$&|\$<[a-zA-Z_]/.test(inner)) continue;
    out.push(inner);
  }
  return out;
}

// Bulk-resolve rule templates then extract <style> blocks for cross-rule CSS sharing.
async function extractCrossRuleStyleParts(
  rules: readonly { replace_string?: string }[] | undefined,
  atActions: readonly unknown[] | undefined,
  chatId: string,
  characterId: string,
  userId: string | undefined,
): Promise<readonly string[]> {
  const candidates: string[] = [];
  if (rules) {
    for (const r of rules) {
      const t = r.replace_string ?? '';
      if (t.indexOf('<style') >= 0) candidates.push(t);
    }
  }
  if (atActions) {
    for (const a of atActions) {
      const action = a as { out?: unknown; script?: { out?: unknown } };
      const t = typeof action?.out === 'string'
        ? action.out
        : typeof action?.script?.out === 'string'
          ? action.script.out
          : '';
      if (t.indexOf('<style') >= 0) candidates.push(t);
    }
  }
  if (candidates.length === 0) return [];

  const SEP = '\n__RISU_TEMPLATE_SEP_a3f9b__\n';
  const joined = candidates.join(SEP);
  let resolved: string;
  try {
    resolved = await resolveReadonly(joined, chatId, characterId, userId);
  } catch (err) {
    log.warn(
      `extractCrossRuleStyleParts: resolve failed (${errMsg(err)}). ` +
        `Falling back to top-level-only heuristic for ${candidates.length} candidate(s).`,
    );
    const out: string[] = [];
    for (const t of candidates) out.push(...extractStyleBlocksTopLevelFallback(t));
    return out;
  }

  const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
  const parts = resolved.split(SEP);
  const out: string[] = [];
  for (const p of parts) {
    STYLE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = STYLE_RE.exec(p)) !== null) {
      const inner = (m[1] ?? '').trim();
      if (inner.length === 0) continue;
      // Skip rules with $1/$&/$<name> capture refs (resolved per-match later).
      if (/\$\d|\$&|\$<[a-zA-Z_]/.test(inner)) continue;
      out.push(inner);
    }
  }
  return out;
}

// Fallback for resolve-failure: extract only depth-zero (unconditional) <style> blocks.
function extractStyleBlocksTopLevelFallback(template: string): string[] {
  if (!template || template.indexOf('<style') < 0) return [];
  const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = STYLE_RE.exec(template)) !== null) {
    let opens = 0, closes = 0, i = 0;
    while (i < m.index - 2) {
      if (template.charCodeAt(i) === 0x7b && template.charCodeAt(i + 1) === 0x7b) {
        const ch = template.charCodeAt(i + 2);
        if (ch === 0x23 /* # */) { opens++; i += 3; continue; }
        if (ch === 0x2f /* / */) { closes++; i += 3; continue; }
      }
      i++;
    }
    if (opens !== closes) continue;
    const inner = (m[1] ?? '').trim();
    if (inner.length === 0) continue;
    if (/\$\d|\$&|\$<[a-zA-Z_]/.test(inner)) continue;
    out.push(inner);
  }
  return out;
}

// Per-chat memo of the last bg-html signature we sent to the FE. Mortal
// Realm fires bg-html refresh ~3× on chat-open (SETTINGS_UPDATED +
// CHAT_CHANGED + GENERATION_*) for byte-identical content. Each redundant
// send forces the FE to re-parse 88KB of CSS and re-adopt into ~35 live
// shadow roots , that was the dominant chat-open lag after the listenEdit
// fix. Skip when the resolved output matches the prior send.
const lastSentBgHtmlByChat = new Map<string, string>();

async function refreshBgHtml(active: ActiveCard, chatId: string, userId: string | undefined): Promise<void> {
  const bgRaw = active.card.risuPayload.background_html;
  const moduleBg = active.card.risuPayload.module_background_embedding ?? '';
  const bgCombined = (bgRaw ?? '') + (moduleBg.length > 0 ? '\n' + moduleBg : '');
  const characterId = active.card.character_id;

  log.debug(
    `refreshBgHtml: START chatId=${chatId} bgRaw_len=${bgRaw?.length ?? 0} ` +
      `moduleBg_len=${moduleBg.length} bgCombined_len=${bgCombined.length}`,
  );

  const tResolve = Date.now();
  let resolvedBg = '';
  let crossRuleStyles: readonly string[] = [];
  try {
    const [bgOut, csOut] = await Promise.all([
      bgCombined.length > 0
        ? resolveReadonly(bgCombined, chatId, characterId, userId)
        : Promise.resolve(''),
      extractCrossRuleStyleParts(
        active.card.regex_scripts,
        active.card.risuPayload.at_actions,
        chatId,
        characterId,
        userId,
      ),
    ]);
    resolvedBg = bgOut;
    crossRuleStyles = csOut;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`refreshBgHtml: resolve failed chatId=${chatId}: ${msg}`);
    return;
  }
  const elapsed = Date.now() - tResolve;

  if (resolvedBg.length === 0 && crossRuleStyles.length === 0) {
    log.debug(`refreshBgHtml: no bg_html and no cross-rule styles, sending clear_bg_html`);
    try {
      send({ type: 'clear_bg_html', chatId }, userId);
    } catch (err) {
      log.warn(`refreshBgHtml: clear send failed: ${(err as Error).message}`);
    }
    return;
  }

  log.info(
    `refreshBgHtml: resolved chatId=${chatId} bg_in=${bgCombined.length} ` +
      `bg_out=${resolvedBg.length} crossRuleParts=${crossRuleStyles.length} ` +
      `crossRule_total=${crossRuleStyles.reduce((a, p) => a + p.length, 0)} elapsed=${elapsed}ms`,
  );
  // Signature includes both bg + cross-rule parts. Use a sentinel separator
  // unlikely to appear in CSS so we don't false-match. Skip the send when
  // signature matches what we last sent for this chat.
  const sig = resolvedBg + '\x1f' + crossRuleStyles.join('\x1e');
  const prior = lastSentBgHtmlByChat.get(chatId);
  if (prior === sig) {
    log.info(
      `refreshBgHtml: skip redundant send chatId=${chatId} (signature matches prior) ` +
        `bg_out=${resolvedBg.length} crossRule_total=${crossRuleStyles.reduce((a, p) => a + p.length, 0)}`,
    );
    return;
  }
  lastSentBgHtmlByChat.set(chatId, sig);
  try {
    send({
      type: 'render_bg_html',
      chatId,
      bgHtml: resolvedBg,
      ...(crossRuleStyles.length > 0 ? { crossRuleStyles } : {}),
    } as never, userId);
    log.debug(`refreshBgHtml: sendToFrontend render_bg_html OK chatId=${chatId}`);
  } catch (err) {
    log.warn(`refreshBgHtml: send failed: ${(err as Error).message}`);
  }
}

const EDITED_BY_MARKER = 'lumirealm';

interface ChatMessage {
  readonly id: string;
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

async function resolveReadonly(
  template: string,
  chatId: string,
  characterId: string,
  userId: string | undefined,
  opts?: { cbsContext?: boolean },
): Promise<string> {
  const cbsContext = opts?.cbsContext === true;
  const t0 = Date.now();
  log.debug(
    `resolveReadonly: START chat=${chatId} char=${characterId} userId=${userId ?? '<none>'} cbs=${cbsContext} template_len=${template.length} ` +
      `template[0..200]=${JSON.stringify(template.slice(0, 200))}`,
  );
  // cbs always forces worker-eval, the Lumi-native fallback can't propagate cbsContext through spindle.macros.resolve and would produce wrong semantics.
  if (cbsContext) {
    if (userId === undefined) {
      log.warn(`resolveReadonly: cbs called before userId captured chat=${chatId},returning template verbatim`);
      return template;
    }
    try {
      const out = await resolveReadonlyInWorker(template, chatId, characterId, userId, true);
      log.debug(
        `resolveReadonly: DONE (cbs worker-eval) chat=${chatId} elapsed=${Date.now() - t0}ms out_len=${out.length} ` +
          `out[0..200]=${JSON.stringify(out.slice(0, 200))}`,
      );
      return out;
    } catch (err) {
      log.error(`resolveReadonly: cbs worker-eval threw chat=${chatId}: ${(err as Error).message}. Returning template verbatim.`);
      return template;
    }
  }
  if (workerEvalEnabled()) {
    // Operator-scoped Spindle APIs (chats.get / characters.get / personas.getActive)
    // require a userId. If we don't have one yet (captureUserId hasn't fired),
    // skip worker-eval entirely rather than slamming three IPC calls with
    // `undefined as string`. The legacy spindle.macros.resolve path tolerates
    // a missing userId better (it has its own fallback).
    if (userId === undefined) {
      log.info(`resolveReadonly: worker-eval skipped chat=${chatId},userId not yet captured; using legacy path`);
    } else {
      try {
        const out = await resolveReadonlyInWorker(template, chatId, characterId, userId, cbsContext);
        log.debug(
          `resolveReadonly: DONE (worker-eval) chat=${chatId} elapsed=${Date.now() - t0}ms out_len=${out.length} ` +
            `out[0..200]=${JSON.stringify(out.slice(0, 200))}`,
        );
        return out;
      } catch (err) {
        log.error(`resolveReadonly: worker-eval threw chat=${chatId}: ${(err as Error).message}. Falling back to legacy path.`);
      }
    }
  }
  try {
    const result = await (spindle.macros as unknown as {
      resolve: (
        template: string,
        options?: { chatId?: string; characterId?: string; userId?: string; commit?: boolean },
      ) => Promise<{ text: string; diagnostics: unknown[] }>;
    }).resolve(template, {
      chatId,
      characterId,
      commit: false,
      ...(userId === undefined ? {} : { userId }),
    });
    log.debug(
      `resolveReadonly: DONE chat=${chatId} elapsed=${Date.now() - t0}ms out_len=${result.text.length} ` +
        `diagnostics=${(result.diagnostics ?? []).length} out[0..200]=${JSON.stringify(result.text.slice(0, 200))}`,
    );
    return result.text;
  } catch (err) {
    log.error(`resolveReadonly: THREW chat=${chatId} elapsed=${Date.now() - t0}ms: ${(err as Error).message}`);
    throw err;
  }
}

// In-worker resolution path. Fetches chat + character ONCE (2 IPC
// round-trips), then the CBS scanner runs in-process  - no per-macro
// round-trip, so cards with {{#each}} over 1000-element arrays finish
// in milliseconds rather than seconds.
async function resolveReadonlyInWorker(
  template: string,
  chatId: string,
  characterId: string,
  userId: string,
  cbsContext = false,
): Promise<string> {
  const [chat, character, messages, persona] = await Promise.all([
    spindle.chats.get(chatId, userId),
    spindle.characters.get(characterId, userId),
    fetchChatMessages(chatId),
    spindle.personas.getActive(userId).catch(() => null),
  ]);

  const metadata = (chat?.metadata ?? {}) as {
    macro_variables?: {
      local?: Record<string, string>;
      global?: Record<string, string>;
      chat?: Record<string, string>;
    };
  };
  const mv = metadata.macro_variables ?? {};

  const lastMessageId = messages.length === 0 ? -1 : messages.length - 1;
  const assistantTail = [...messages].reverse().find((m) => m.role === 'assistant');
  const userTail = [...messages].reverse().find((m) => m.role === 'user');
  const assetIndexes = getActiveAssetIndexes(chatId);
  const activeCard = activeCardByChat.get(chatId)?.card;
  const scriptstateDefaults = activeCard?.risuPayload.scriptstate_defaults;
  const screenDims = getScreenDims(userId);

  const charImageUrl = imageUrlFromId(
    (character as { image_id?: unknown } | null | undefined)?.image_id as string | null | undefined,
  );
  const personaImageUrl = imageUrlFromId(
    (persona as { image_id?: unknown } | null | undefined)?.image_id as string | null | undefined,
  );

  return runPipeline({
    template,
    phase: 'display',
    chatId,
    ...(userId !== undefined ? { userId } : {}),
    characterId,
    ...(cbsContext ? { cbsContext: true, currentMessageIndexOverride: -1 } : {}),
    ...(scriptstateDefaults && Object.keys(scriptstateDefaults).length > 0
      ? { scriptstateDefaults }
      : {}),
    // screenDims: forwarded from last frontend `screen_dims` message; omitted until first report.
    ...(screenDims ? { screenWidth: screenDims.width, screenHeight: screenDims.height } : {}),
    userName: persona?.name ?? '',
    charName: character?.name ?? '',
    ...(persona?.description ? { personaText: persona.description } : {}),
    ...(personaImageUrl ? { personaImage: personaImageUrl } : {}),
    character: {
      description: character?.description ?? '',
      personality: character?.personality ?? '',
      scenario: character?.scenario ?? '',
      exampleDialogue: character?.mes_example ?? '',
      mainPrompt: character?.system_prompt ?? '',
      postHistoryInstructions: character?.post_history_instructions ?? '',
      creatorNotes: character?.creator_notes ?? '',
      firstMessage: character?.first_mes ?? '',
      alternateGreetings: character?.alternate_greetings ?? [],
      ...(assetIndexes ? { additionalAssets: assetIndexes.assets } : {}),
      ...(assetIndexes ? { emotionImages: assetIndexes.emotions } : {}),
      ...(charImageUrl ? { image: charImageUrl } : {}),
    },
    chat: {
      messageCount: messages.length,
      lastMessageId,
      lastMessage: messages[messages.length - 1]?.content ?? '',
      lastCharMessage: assistantTail?.content ?? '',
      lastUserMessage: userTail?.content ?? '',
    },
    variables: {
      ...(mv.local ? { local: mv.local } : {}),
      ...(mv.global ? { global: mv.global } : {}),
      ...(mv.chat ? { chat: mv.chat } : {}),
    },
    legacyMediaFindings: getCachedSettingsSync(userId).legacyMediaFindings,
    wrapIslands: false,
    ...(activeCard && modulesByNamespaceFromCard(activeCard) ? { modulesByNamespace: modulesByNamespaceFromCard(activeCard)! } : {}),
    ...(readDecoratorBuffers(chatId)?.positionPt
      ? { positionPt: readDecoratorBuffers(chatId)!.positionPt }
      : {}),
  });
}

async function fetchChatMessages(chatId: string): Promise<readonly ChatMessage[]> {
  try {
    const msgs = await spindle.chat.getMessages(chatId);
    // Narrow to what we need; rest of the row is irrelevant here.
    return msgs.map((m) => ({ id: m.id, role: m.role, content: m.content }));
  } catch (err) {
    log.error(`fetchChatMessages chat=${chatId} failed: ${errMsg(err)}`);
    return [];
  }
}

// `rememberOurWrite` / `consumeIfOurWrite` extracted to
// `src/state/recent-writes.ts` (LRU + TTL cache, directly unit-testable).
//
// Body content is no longer baked at write time. Storage holds raw `{{...}}`
// and the macro evaluator runs at render time inside the `'render'` MCP
// origin handler (architecture §2.10.3). The bake-and-refresh path
// (`resolveAndPersist` + `refreshResolvedContent` + sidecar) was deleted
// in the unbake refactor,Lumi's display-regex cv-mitigation now handles
// per-touchedVars invalidation, replacing what the sidecar was for.

function dumpPayload(raw: unknown): string {
  try { return JSON.stringify(raw).slice(0, 400); } catch { return '<unstringifiable>'; }
}

// Capture userId from every event callback so operator-scoped Spindle calls
// succeed before any frontend message arrives.
function captureUserId(userId: string | undefined, where: string): void {
  if (!userId || capturedUserIds.has(userId)) return;
  capturedUserIds.add(userId);
  log.info(`captureUserId: bootstrap from ${where} userId=${userId}`);
  void getSettingsForUser(userId).catch((err) => {
    log.warn(`captureUserId: settings preload failed for user=${userId}: ${errMsg(err)}`);
  });
  // Deferred so orphan-review doesn't compete with chat-open work.
  setTimeout(() => {
    void promptOrphanReviewIfAny(userId).catch((err) => {
      log.warn(`captureUserId: orphan-review prompt failed: ${errMsg(err)}`);
    });
  }, 3000);
  // Modules first since characters attach to them, then characters.
  setTimeout(() => {
    void (async () => {
      try {
        await runMassModuleMigrationIfNeeded(userId);
      } catch (err) {
        log.warn(`captureUserId: mass module migration failed: ${errMsg(err)}`);
      }
      try {
        await runMassCharacterMigrationIfNeeded(userId);
      } catch (err) {
        log.warn(`captureUserId: mass character migration failed: ${errMsg(err)}`);
      }
    })();
  }, 3000);
}

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

// SETTINGS_UPDATED key='activeChatId' fires on chat navigation. Warms the
// active-card cache and renders bg-html. Does NOT fire `start` binding (Risu
// fires `start` only inside sendChat, not on chat open).
spindle.on('SETTINGS_UPDATED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'SETTINGS_UPDATED');
  const p = raw as { key?: string; value?: unknown; keys?: string[] };
  if (p.key !== 'activeChatId') return;
  const chatId = typeof p.value === 'string' && p.value.length > 0 ? p.value : null;
  log.info(`event SETTINGS_UPDATED activeChatId=${chatId ?? '<cleared>'} payload=${dumpPayload(raw)}`);
  const prevChat = userId ? lastActiveChatByUser.get(userId) : undefined;
  // FE dismounts on any render/clear for a different chat, so both prev and new memos are stale at the moment of transition.
  if (prevChat !== chatId) {
    if (prevChat) lastSentBgHtmlByChat.delete(prevChat);
    if (chatId) lastSentBgHtmlByChat.delete(chatId);
  }
  // When chatId clears (ChatView unmount), fire clear_bg_html for the last
  // mounted chat so fixed-positioned bg widgets don't bleed onto other pages.
  if (!chatId) {
    sendSetActiveChat(null, null, userId);
    const lastChat = userId ? lastActiveChatByUser.get(userId) : undefined;
    if (lastChat) {
      log.info(
        `SETTINGS_UPDATED activeChatId cleared, dismounting bg-host for last chat=${lastChat}`,
      );
      try { send({ type: 'clear_bg_html', chatId: lastChat }, userId); }
      catch (err) { log.warn(`SETTINGS_UPDATED clear_bg_html: ${(err as Error).message}`); }
      if (userId) lastActiveChatByUser.delete(userId);
    } else {
      log.info(`SETTINGS_UPDATED activeChatId cleared, no last chat to dismount`);
    }
    return;
  }
  if (userId) lastActiveChatByUser.set(userId, chatId);
  let characterId: string | undefined;
  try {
    const chat = await spindle.chats.get(chatId, userId);
    if (chat?.character_id) characterId = chat.character_id;
  } catch (err) {
    log.warn(`SETTINGS_UPDATED activeChatId: chats.get failed: ${(err as Error).message}`);
  }
  const active = await ensureActiveCardForChat(chatId, characterId ?? null, userId);
  log.info(`SETTINGS_UPDATED activeChatId: active=${active ? `characterId=${active.card.character_id} hasBgHtml=${!!active.card.risuPayload.background_html} triggers=${active.card.risuPayload.triggers?.length ?? 0}` : '<none>'}`);
  // Activation precedes paint: lifter clearAll fires on this edge.
  sendSetActiveChat(active ? chatId : null, active ? active.card.character_id : null, userId);
  if (!active) {
    try { send({ type: 'clear_bg_html', chatId }, userId); } catch { /* */ }
    return;
  }
  invalidateRenderMcpForChat(chatId);
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId, { force: true });
  // Force toggle definitions on chat open; toggle values travel via the variables push above.
  await refreshToggleDefinitions(active, chatId, userId, { force: true });
  log.info(`SETTINGS_UPDATED activeChatId: ALL DONE chatId=${chatId}`);
}));

const chatChangedDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const chatChangedCoalescedCount = new Map<string, number>();
// Accumulates the union of `changedFields` across all events coalesced into
// a single debounced refresh. Sentinel `'unknown'` means at least one event
// in the burst had no `changedFields` (e.g. persona reattribution emit at
// chats.service.ts:977 sends a non-typed payload) , treat as safe-on-unknown
// and run the full fan-out.
const chatChangedCoalescedFields = new Map<string, Set<string> | 'unknown'>();
const CHAT_CHANGED_DEBOUNCE_MS = 50;

// Allow-list of `changedFields` dot-path prefixes that warrant a refresh.
// Only paths in here cause `refreshResolvedContent` / `refreshBgHtml` /
// `refreshVariables` to fire on external CHAT_CHANGED. Everything else is
// admin-only metadata (chat name, avatar, council results, group config,
// deferred WI state, impersonation preset cleanup, etc.) and is skipped.
//
// Audit basis: every `risu-compat/handlers/*.ts` reads from `ctx.vars.get`
// (which maps to `metadata.macro_variables.{local,global,chat}`) or from
// `metadata.chat_variables` (Lumi-native chat-scope bag). No handler reads
// any other `chat.metadata.X` path directly. Character-side fields
// (`ctx.character.*`, `ctx.identity.*`, `ctx.lorebook`, `ctx.messages.*`)
// flow through CHARACTER_EDITED / MESSAGE_* events, not CHAT_CHANGED.
//
// Future-proofing: if a new handler starts reading from a new chat metadata
// path, add the prefix here. Allow-list (vs deny-list) is intentional ,
// errs toward minimum work for the common case; the tradeoff is "we must
// remember to update this list when adding a handler that reads new chat
// metadata." That tradeoff is acceptable because adding such a handler is
// a deliberate code change, easy to spot in review.
const REFRESH_FIELD_PREFIXES = [
  'metadata.macro_variables',
  'metadata.chat_variables',
] as const;

function changedFieldsRequireRefresh(fields: Set<string> | 'unknown'): boolean {
  if (fields === 'unknown') return true;
  for (const f of fields) {
    for (const prefix of REFRESH_FIELD_PREFIXES) {
      if (f === prefix || f.startsWith(`${prefix}.`)) return true;
    }
  }
  return false;
}

function scheduleChatChangedRefresh(
  chatId: string,
  characterId: string | null,
  changedFields: readonly string[] | undefined,
  userId: string | undefined,
): void {
  chatChangedCoalescedCount.set(chatId, (chatChangedCoalescedCount.get(chatId) ?? 0) + 1);

  // Accumulate the union of changedFields across this burst. A single
  // 'unknown' contaminates the rest , once anything in the burst lacked
  // a typed payload, we MUST run everything (safe-on-unknown).
  const prev = chatChangedCoalescedFields.get(chatId);
  if (changedFields === undefined) {
    chatChangedCoalescedFields.set(chatId, 'unknown');
  } else if (prev !== 'unknown') {
    const merged = (prev instanceof Set) ? prev : new Set<string>();
    for (const f of changedFields) merged.add(f);
    chatChangedCoalescedFields.set(chatId, merged);
  }

  if (chatChangedDebounceTimers.has(chatId)) return;
  const timer = setTimeout(async () => {
    chatChangedDebounceTimers.delete(chatId);
    const coalesced = chatChangedCoalescedCount.get(chatId) ?? 1;
    chatChangedCoalescedCount.delete(chatId);
    const accumulatedFields = chatChangedCoalescedFields.get(chatId) ?? 'unknown';
    chatChangedCoalescedFields.delete(chatId);
    const requiresRefresh = changedFieldsRequireRefresh(accumulatedFields);
    try {
      const active = await ensureActiveCardForChat(chatId, characterId, userId);
      const fieldsSummary = accumulatedFields === 'unknown'
        ? 'unknown'
        : (accumulatedFields.size === 0 ? 'empty' : `[${[...accumulatedFields].slice(0, 6).join(',')}${accumulatedFields.size > 6 ? `,+${accumulatedFields.size - 6}` : ''}]`);
      log.info(
        `CHAT_CHANGED (external, debounced): coalesced=${coalesced} ` +
          `fields=${fieldsSummary} requiresRefresh=${requiresRefresh} ` +
          `active=${active ? `char=${active.card.character_id}` : '<none>'}`,
      );
      if (!active) {
        try { send({ type: 'clear_bg_html', chatId }, userId); }
        catch (err) { log.warn(`CHAT_CHANGED clear_bg_html: ${(err as Error).message}`); }
        return;
      }
      if (!requiresRefresh) return;
      await refreshBgHtml(active, chatId, userId);
      await refreshVariables(active, chatId, userId, { force: true });
    } catch (err) {
      log.error(`scheduleChatChangedRefresh: chat=${chatId} threw: ${errMsg(err)}`);
    }
  }, CHAT_CHANGED_DEBOUNCE_MS);
  if (typeof (timer as { unref?: () => void }).unref === 'function') {
    (timer as { unref: () => void }).unref();
  }
  chatChangedDebounceTimers.set(chatId, timer);
}

spindle.on('CHAT_CHANGED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'CHAT_CHANGED');
  const { chatId, characterId } = extractIds(raw);
  if (!chatId) { log.warn('CHAT_CHANGED: missing chatId , aborting'); return; }

  // Typed payload (spindle-types 0.4.62+): `chat: {id, ...}, changedFields?: string[]`.
  // Absent on emits from sources that don't compute the diff , currently
  // chats.service.ts:977 (bulk persona name reattribution), which sends
  // `{chatId, reattributedUserMessages}` instead. Treat undefined as
  // safe-on-unknown , the gating defaults to running everything in that case.
  const changedFields = (raw as { changedFields?: readonly string[] }).changedFields;
  const requiresRefresh = changedFieldsRequireRefresh(
    changedFields === undefined ? 'unknown' : new Set(changedFields),
  );

  // Cache invalidations are gated on the same predicate. The listenEdit
  // preload + render-MCP no-op caches both index by content state that's
  // only affected by var-relevant chat metadata changes; non-var writes
  // (chat name/avatar edits, council cache, etc.) don't dirty either.
  if (requiresRefresh) {
    invalidateListenEditPreload(chatId);
    invalidateRenderMcpForChat(chatId);
  }

  const wasOwn = consumeOwnChatChange(chatId);
  const fieldsPreview = changedFields === undefined
    ? 'undefined'
    : (changedFields.length === 0 ? 'empty' : `[${changedFields.slice(0, 4).join(',')}${changedFields.length > 4 ? `,+${changedFields.length - 4}` : ''}]`);
  log.info(
    `event CHAT_CHANGED chatId=${chatId} characterId=${characterId ?? '?'} ` +
      `ownWrite=${wasOwn} fields=${fieldsPreview} requiresRefresh=${requiresRefresh}`,
  );
  if (wasOwn) {
    await ensureActiveCardForChat(chatId, characterId, userId);
    return;
  }
  scheduleChatChangedRefresh(chatId, characterId, changedFields, userId);
}));

// MESSAGE_SENT: editInput is wired via registerInterceptor.
// Body resolution happens at render time (post-unbake), so we don't need to
// re-bake here,just refresh the variables snapshot for the drawer in case
// the new message references vars that the user wants to inspect.
spindle.on('MESSAGE_SENT', userScoped(async (raw, userId) => {
  captureUserId(userId, 'MESSAGE_SENT');
  const { chatId, characterId } = extractIds(raw);
  log.info(`event MESSAGE_SENT chatId=${chatId ?? '?'} characterId=${characterId ?? '?'} payload=${dumpPayload(raw)}`);
  if (!chatId) return;
  invalidateListenEditPreload(chatId);
  const active = await ensureActiveCardForChat(chatId, characterId, userId);
  if (!active) { log.info(`MESSAGE_SENT: no active card , skip`); return; }
  await refreshVariables(active, chatId, userId);
}));

const generationsInFlight = new Map<string, number>();
function isGenerationInFlight(chatId: string): boolean {
  return (generationsInFlight.get(chatId) ?? 0) > 0;
}

/** Record an in-flight generation start. Returns true on the 0→1
 *  transition so the caller can emit the streaming-active signal to
 *  the frontend exactly once. */
function markGenerationStart(chatId: string): boolean {
  const prev = generationsInFlight.get(chatId) ?? 0;
  generationsInFlight.set(chatId, prev + 1);
  return prev === 0;
}

/** Record an in-flight generation end. Returns true on the N→0
 *  transition so the caller can emit the streaming-inactive signal
 *  exactly once even when multiple GENERATION_ENDED events stack
 *  (re-runs, swipes, etc.). */
function markGenerationEnd(chatId: string): boolean {
  const prev = generationsInFlight.get(chatId) ?? 0;
  if (prev <= 1) {
    generationsInFlight.delete(chatId);
    return prev === 1;
  }
  generationsInFlight.set(chatId, prev - 1);
  return false;
}

spindle.on('GENERATION_STARTED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'GENERATION_STARTED');
  const { chatId, characterId } = extractIds(raw);
  log.info(`event GENERATION_STARTED chatId=${chatId ?? '?'} characterId=${characterId ?? '?'} payload=${dumpPayload(raw)}`);
  if (!chatId) return;
  if (markGenerationStart(chatId)) {
    // 0→1 transition. Tell the frontend portal lifter to pause sweeps
    // for this chat. The flicker fix at quirks §3.7x: per-chunk Lumi
    // re-renders briefly toggle the panel between light-DOM-text and
    // shadow-DOM-text states; our sig flips → drop+re-clone cycle →
    // user sees 20Hz flicker. Pausing sweeps eliminates the cycle;
    // post-stream we resume with one clean lift.
    send({ type: 'generation_state', chatId, active: true }, userId);
  }
  const active = await ensureActiveCardForChat(chatId, characterId, userId);
  if (!active) return;
  log.info(`GENERATION_STARTED: → runBinding(start)`);
  await runBinding(active, chatId, 'start', userId);
  log.info(`GENERATION_STARTED: → runBinding(request)`);
  await runBinding(active, chatId, 'request', userId);
  invalidateRenderMcpForChat(chatId);
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId);
}));

spindle.on('GENERATION_ENDED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'GENERATION_ENDED');
  const { chatId, characterId } = extractIds(raw);
  log.info(`event GENERATION_ENDED chatId=${chatId ?? '?'} characterId=${characterId ?? '?'} payload=${dumpPayload(raw)}`);
  if (!chatId) return;
  const wentIdle = markGenerationEnd(chatId);
  if (wentIdle) {
    // N→0 transition. Resume frontend sweeps; one final sweep will
    // lift the post-stream panel state cleanly.
    send({ type: 'generation_state', chatId, active: false }, userId);
  }
  const active = await ensureActiveCardForChat(chatId, characterId, userId);
  if (!active) return;
  for (const binding of GENERATION_ENDED_BINDINGS) {
    await runBinding(active, chatId, binding, userId);
  }
  invalidateRenderMcpForChat(chatId);
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId);
}));

// User-clicked the abort button (or generation otherwise stopped via
// AbortController). Lumi emits GENERATION_STOPPED in this path INSTEAD OF
// GENERATION_ENDED , see g:/mousepad_git/Lumiverse/src/services/generate.service.ts:2197,
// 2698, 2793, 3153. Without this handler, `generationsInFlight` for the
// chat stays >0 forever, the FE streaming gate never releases, and the
// post-stream sweep that would stash the stale source panel never runs.
// The handoff at handoff-2026-05-04-streaming-flicker.md §11.5 ("Observation A")
// pins this as the load-bearing missing piece.
spindle.on('GENERATION_STOPPED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'GENERATION_STOPPED');
  const { chatId, characterId } = extractIds(raw);
  log.info(`event GENERATION_STOPPED chatId=${chatId ?? '?'} characterId=${characterId ?? '?'} payload=${dumpPayload(raw)}`);
  if (!chatId) return;
  const wentIdle = markGenerationEnd(chatId);
  if (wentIdle) {
    send({ type: 'generation_state', chatId, active: false }, userId);
  }
  // No trigger bindings fire on stop (Risu's `output`/`display` bindings
  // are inside its sendChat, which we already mirror via GENERATION_ENDED
  // for the success path; abort = no LLM output, no triggers to fire).
  const active = await ensureActiveCardForChat(chatId, characterId, userId);
  if (!active) return;
  invalidateRenderMcpForChat(chatId);
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId);
}));

// MESSAGE_SWIPED  - fires when user swipes to an alternate greeting/response
// (chats.service.ts). The new swipe's content lands in chat_messages.content
// raw; the render-MCP cache for this msgId is invalidated so the next render
// resolves with fresh state. No bake walk (post-unbake).
spindle.on('MESSAGE_SWIPED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'MESSAGE_SWIPED');
  const p = raw as {
    chatId?: string;
    message?: { id?: string; chat_id?: string; content?: string };
    action?: string;
  };
  const chatId = p.chatId ?? p.message?.chat_id ?? null;
  const msgId = p.message?.id ?? null;
  log.info(`event MESSAGE_SWIPED chatId=${chatId ?? '?'} msgId=${msgId ?? '?'} action=${p.action ?? '?'}`);
  if (!chatId || !msgId) return;
  invalidateListenEditPreload(chatId);
  invalidateRenderMcpForMessage(chatId, msgId);
  const active = await ensureActiveCardForChat(chatId, null, userId);
  if (!active) return;
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId);
  // No output/display bindings here. Risu's output trigger fires inside
  // sendChat (index.svelte.ts,1679), not on the swipe primitive.
  // For fresh regenerate, GENERATION_ENDED is the correct fire point.
}));

// Payload shape (chats.service.ts): `{ chatId, message }`.
// spindle_metadata is stored under extra.spindle_metadata (worker-host.ts).
interface MessageEditedPayload {
  readonly chatId?: string;
  readonly message?: {
    readonly id?: string;
    readonly chat_id?: string;
    readonly content?: string;
    readonly extra?: { readonly spindle_metadata?: { readonly edited_by?: unknown } };
    readonly metadata?: { readonly edited_by?: unknown };
  };
}

function readEditedBy(payload: MessageEditedPayload): string | null {
  const fromExtra = payload.message?.extra?.spindle_metadata?.edited_by;
  if (typeof fromExtra === 'string') return fromExtra;
  const fromMeta = payload.message?.metadata?.edited_by;
  if (typeof fromMeta === 'string') return fromMeta;
  return null;
}

spindle.on('MESSAGE_EDITED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'MESSAGE_EDITED');
  const p = raw as MessageEditedPayload;
  const chatId = p.chatId ?? p.message?.chat_id ?? null;
  const msgId = p.message?.id ?? null;
  if (chatId) invalidateListenEditPreload(chatId);
  if (!chatId || !msgId) {
    log.warn(`event MESSAGE_EDITED: missing chatId/msgId payload=${JSON.stringify(raw).slice(0, 200)}`);
    return;
  }
  invalidateRenderMcpForMessage(chatId, msgId);
  // Self-echo detection. Content cache is one-shot, consumed on match. Our
  // own writes (Lua setChat, editOutput listenEdit writeback) call
  // `rememberOurWrite` before `editMessage`; we filter the echo here.
  const newContent = String(p.message?.content ?? '');
  if (consumeIfOurWrite(chatId, msgId, newContent)) return;
  const editedBy = readEditedBy(p);
  log.info(`event MESSAGE_EDITED (external) chatId=${chatId} msgId=${msgId} editedBy=${editedBy ?? '<none>'} len=${newContent.length}`);
  // External edit (user typed, streaming finalize, etc.). Storage is raw
  // post-unbake; render-MCP cache is already invalidated above so the next
  // render resolves with fresh state. No bake walk.
}));

// MESSAGE_DELETED: refresh portals against the smaller message list.
spindle.on('MESSAGE_DELETED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'MESSAGE_DELETED');
  const p = raw as { chatId?: string; messageId?: string; message?: { id?: string; chat_id?: string } };
  const chatId = p.chatId ?? p.message?.chat_id ?? null;
  const msgId = p.messageId ?? p.message?.id ?? null;
  log.info(`event MESSAGE_DELETED chatId=${chatId ?? '?'} msgId=${msgId ?? '?'}`);
  if (!chatId) return;
  invalidateListenEditPreload(chatId);
  if (msgId) invalidateRenderMcpForMessage(chatId, msgId);
  const active = await ensureActiveCardForChat(chatId, null, userId);
  if (!active) return;
  // No output/display bindings: Risu has no binding-firing analogue for deletes.
  await refreshBgHtml(active, chatId, userId);
  await refreshVariables(active, chatId, userId);
}));

spindle.on('CHAT_DELETED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'CHAT_DELETED');
  const p = raw as { id?: string; chatId?: string };
  const chatId = p.chatId ?? p.id ?? null;
  log.info(`event CHAT_DELETED chatId=${chatId ?? '?'}`);
  if (!chatId) return;
  invalidateListenEditPreload(chatId);
  invalidateRenderMcpForChat(chatId);
  lastSentBgHtmlByChat.delete(chatId);
  activeCardByChat.delete(chatId);
  clearActiveAssetIndexes(chatId);
  clearActiveCharacterImage(chatId);
  clearActiveScriptstateDefaults(chatId);
  clearVarOverlay(chatId);
  variableState.clearChat(chatId);
  toggleState.clearChat(chatId);
}));

spindle.on('CHARACTER_DELETED', userScoped(async (raw, uid) => {
  captureUserId(uid, 'CHARACTER_DELETED');
  const characterId =
    (raw as { id?: string }).id
    ?? extractIds(raw).characterId
    ?? null;
  log.info(`event CHARACTER_DELETED characterId=${characterId ?? '?'}`);
  if (!characterId) return;
  compiledByCharacter.delete(characterId);
  const cachedWorldBookIds = worldBookIdsByCharacter.get(characterId) ?? [];
  worldBookIdsByCharacter.delete(characterId);
  await deleteCardByChar(characterId, uid, 'cascade');

  // Re-evaluate: deleted char may be the active one.
  if (uid) {
    const lastChat = lastActiveChatByUser.get(uid);
    if (lastChat) {
      const stillActive = await ensureActiveCardForChat(lastChat, null, uid).catch(() => null);
      if (!stillActive) sendSetActiveChat(null, null, uid);
    }
  }

  if (uid) {
    const opId = `delete-char-${characterId}-${Date.now()}`;
    const opTitle = `Cleaning up deleted character`;
    emitOperationProgress(uid, opId, 'started', opTitle, 'Reading image journal…', null);
    try {
      const journalFile = await readImageJournalFile(journalStorage(), uid, characterId);
      const journalImageIds = journalFile?.imageIds ?? [];
      let imageStats = { deleted: 0, absent: 0, failed: 0, skipped: 0 };
      if (journalImageIds.length === 0) {
        log.info(`CHARACTER_DELETED: no journal for char=${characterId}, nothing to clean`);
      } else {
        emitOperationProgress(
          uid, opId, 'progress', opTitle,
          `Checking ${journalImageIds.length} asset${journalImageIds.length === 1 ? '' : 's'} against live references…`,
          0.3,
        );
        // Lumi fires CHARACTER_DELETED BEFORE the row is removed, so the
        // doomed character still passes through listLumirealmCharacters.
        // Exclude it explicitly so its asset_index doesn't shield its own IDs.
        const live = await buildLiveImageIdSet(buildOrphanDetectDepsExcluding(uid, characterId));
        const safeIds: string[] = [];
        let skipped = 0;
        for (const id of journalImageIds) {
          if (typeof id !== 'string' || id.length === 0) continue;
          if (live.liveIds.has(id)) {
            skipped++;
            continue;
          }
          safeIds.push(id);
        }
        if (skipped > 0) {
          log.info(
            `CHARACTER_DELETED: ${skipped}/${journalImageIds.length} asset(s) shielded by other live refs ` +
              `(likely a Lumi-side duplicate), deleting only ${safeIds.length} character-owned asset(s)`,
          );
        }
        if (safeIds.length > 0) {
          emitOperationProgress(
            uid, opId, 'progress', opTitle,
            `Deleting 0 of ${safeIds.length} asset${safeIds.length === 1 ? '' : 's'}…`,
            0.4,
          );
          const stats = await deleteImageIds(
            safeIds, uid, `CHARACTER_DELETED(${characterId})`,
            (processed, total) => {
              const frac = total > 0 ? 0.4 + (processed / total) * 0.55 : 0.4;
              emitOperationProgress(
                uid, opId, 'progress', opTitle,
                `Deleting ${processed} of ${total} asset${total === 1 ? '' : 's'}…`,
                frac,
              );
            },
          );
          imageStats = { ...stats, skipped };
        } else {
          imageStats = { deleted: 0, absent: 0, failed: 0, skipped };
        }
      }
      await clearImageJournal(journalStorage(), uid, characterId).catch((err) => {
        log.warn(`CHARACTER_DELETED: clearImageJournal threw char=${characterId}: ${errMsg(err)}`);
      });
      log.info(
        `CHARACTER_DELETED cleanup: char=${characterId} ` +
          `imageDelete=deleted:${imageStats.deleted} absent:${imageStats.absent} ` +
          `failed:${imageStats.failed} skipped:${imageStats.skipped}`,
      );
      const summaryLine = journalImageIds.length === 0
        ? 'No image assets to clean'
        : imageStats.skipped > 0
          ? `${imageStats.deleted} asset${imageStats.deleted === 1 ? '' : 's'} deleted (${imageStats.skipped} kept, still referenced)`
          : `${imageStats.deleted} asset${imageStats.deleted === 1 ? '' : 's'} deleted`;
      emitOperationProgress(uid, opId, 'done', opTitle, summaryLine, 1);
    } catch (err) {
      log.warn(`CHARACTER_DELETED cleanup threw char=${characterId}: ${errMsg(err)}`);
      emitOperationProgress(uid, opId, 'error', opTitle, '', null, errMsg(err));
      // Best-effort journal clear so the boot detector doesn't keep flagging.
      await clearImageJournal(journalStorage(), uid, characterId).catch(() => { /* */ });
    }
  }

  send({
    type: 'cleanup_character_artifacts',
    characterId,
    worldBookIds: cachedWorldBookIds,
  }, uid);
}));

// CHARACTER_CREATED: refresh drawer. Covers duplication and external imports.
spindle.on('CHARACTER_CREATED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'CHARACTER_CREATED');
  const characterId =
    (raw as { id?: string }).id
    ?? extractIds(raw).characterId
    ?? null;
  log.info(`event CHARACTER_CREATED characterId=${characterId ?? '?'}`);
  try {
    pushCards(await listCards(userId), userId);
  } catch (err) {
    log.warn(`CHARACTER_CREATED: pushCards failed: ${errMsg(err)}`);
  }
}));

// CHARACTER_EDITED: own writes are tracked via expectCharacterEdit() and skipped.
// External writes invalidate caches and refresh the drawer.
spindle.on('CHARACTER_EDITED', userScoped(async (raw, userId) => {
  captureUserId(userId, 'CHARACTER_EDITED');
  const characterId =
    (raw as { id?: string }).id
    ?? extractIds(raw).characterId
    ?? null;
  if (!characterId) {
    log.warn(`event CHARACTER_EDITED: missing id payload=${dumpPayload(raw)}`);
    return;
  }
  const wasOwn = consumeOwnCharacterEdit(characterId);
  log.info(`event CHARACTER_EDITED characterId=${characterId} ownWrite=${wasOwn}`);
  if (wasOwn) {
    return;
  }
  invalidateActiveForCharacter(characterId, userId);
  try {
    pushCards(await listCards(userId), userId);
  } catch (err) {
    log.warn(`CHARACTER_EDITED: pushCards failed: ${errMsg(err)}`);
  }
}));

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


function summarizeModule(env: ModuleEnvelope): ModuleSummary {
  const m = env.module;
  return {
    id: env.id,
    name: typeof m.name === 'string' ? m.name : '(unnamed)',
    description: typeof m.description === 'string' ? m.description : '',
    filename: env.filename,
    uploaded_at: env.uploaded_at,
    lorebook_count: Array.isArray(m.lorebook) ? m.lorebook.length : 0,
    regex_count: Array.isArray(m.regex) ? m.regex.length : 0,
    trigger_count: Array.isArray(m.trigger) ? m.trigger.length : 0,
    asset_count: Object.keys(env.asset_index).length,
    low_level_access: m.lowLevelAccess === true,
    has_cjs: typeof m.cjs === 'string' && m.cjs.length > 0,
  };
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

