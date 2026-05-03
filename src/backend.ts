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
  updateLumirealm,
  clearLumirealm,
  listLumirealmCharacters,
  buildSyntheticStoredCard,
  type SpindleCharactersApi,
} from './state/lumirealm-character.js';
import {
  appendImageIdsToJournal,
  clearImageJournal,
  listImageJournalCharacterIds,
  markJournalPendingDelete,
  readImageJournalFile,
  type JournalStorage,
} from './state/image-journal.js';
import {
  appendModuleImageIdsToJournal,
  clearModuleImageJournal,
  listModuleImageJournalIds,
  markModuleJournalPendingDelete,
  readModuleImageJournalFile,
} from './state/module-image-journal.js';
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
import { makeRisuTriggerRuntime, setDispatchContext } from './interpreter/runtime.js';
import type { RisuBinding } from './interpreter/runtime.js';
import { importCard, type SpindleImportApi } from './payload/import.js';
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
import {
  runAtActionsForPhase,
  coerceAtActions,
  type RuntimeAtAtAction,
} from './interpreter/at-actions-runtime.js';
import { getActiveAssetIndexes } from './interpreter/asset-cache.js';
import { setScreenDims, getScreenDims } from './interpreter/screen-dims-cache.js';
import {
  containsCbs,
  clearSidecar,
  markUserEdited,
  readSidecar,
  setSidecarRaw,
  trackMessagesBatch,
  type ChatSidecar,
} from './state/sidecar.js';
import { VariableStateStore } from './state/variables-state.js';
import { ToggleStateStore } from './state/toggle-state.js';
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
import { scheduleStateChangedRefresh as scheduleDebouncedRefresh } from './state/state-changed-debouncer.js';
import { computeDepthPromptSeed } from './state/depth-prompt-seed.js';
import { normalizeReplaceStringForSanitizer } from './util/sanitizer-doc-shape.js';
import {
  logStore,
  loadPersistedLogState,
  persistLogState,
  type LogState,
  type LogStateSnapshot,
} from './log/store.js';
import { resolveAlertDismissal } from './interpreter/alert-bridge.js';
import { resolvePickResolution } from './interpreter/pick-bridge.js';

const EXTENSION_VERSION = '0.1.0';

const log = {
  info(msg: string): void {
    if (logStore.isEnabled()) spindle.log.info(`[lumirealm] ${msg}`);
    logStore.push('info', 'backend', msg);
  },
  warn(msg: string): void {
    if (logStore.isEnabled()) spindle.log.warn(`[lumirealm] ${msg}`);
    logStore.push('warn', 'backend', msg);
  },
  error(msg: string): void {
    spindle.log.error(`[lumirealm] ${msg}`);
    logStore.push('error', 'backend', msg);
  },
  verbose(msg: string): void {
    if (logStore.isEnabled()) spindle.log.info(`[lumirealm] ${msg}`);
    logStore.push('debug', 'backend', msg);
  },
};

log.info(`backend boot: version=${EXTENSION_VERSION}`);

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
// the row. Feature-detected: Lumi builds without the hook leave
// `registerMessageContentProcessor` undefined; falls back to reactive path.
interface MessageContentProcessorCtx {
  readonly chatId: string;
  readonly messageId?: string;
  readonly content: string;
  readonly extra?: Record<string, unknown>;
  readonly origin: 'create' | 'update' | 'swipe_add' | 'swipe_update' | 'render';
  readonly swipeIndex?: number;
  readonly userId: string;
}
interface MessageContentProcessorPatch {
  content?: string;
  extra?: Record<string, unknown>;
}
const registerMessageContentProcessor = (spindle as unknown as {
  registerMessageContentProcessor?: (
    handler: (
      ctx: MessageContentProcessorCtx,
    ) => Promise<MessageContentProcessorPatch | void>,
    priority?: number,
  ) => void;
}).registerMessageContentProcessor;

// Macro interceptor: fires at the top of Lumi's MacroEvaluator.evaluate()
// for every template, allowing one bulk in-worker CBS resolve per template
// instead of one __macro_invoke__ RPC per macro occurrence.
// Feature-detected. Only fires for chats belonging to a Risu-imported
// character; returns void for all others.
interface MacroInterceptorSnapshotEnv {
  readonly commit: boolean;
  readonly names: Record<string, string>;
  readonly character: Record<string, unknown>;
  readonly chat: Record<string, unknown>;
  readonly system: Record<string, unknown>;
  readonly variables: {
    readonly local: Record<string, string>;
    readonly global: Record<string, string>;
    readonly chat: Record<string, string>;
  };
  readonly extra: Record<string, unknown>;
}
interface MacroInterceptorCtx {
  readonly template: string;
  readonly env: MacroInterceptorSnapshotEnv;
  readonly commit: boolean;
  readonly phase: 'prompt' | 'display' | 'response' | 'other';
  readonly sourceHint?: string;
  readonly userId?: string;
}
const registerMacroInterceptor = (spindle as unknown as {
  registerMacroInterceptor?: (
    handler: (ctx: MacroInterceptorCtx) => Promise<string | void>,
    priority?: number,
  ) => void;
}).registerMacroInterceptor;

if (typeof registerMacroInterceptor === 'function') {
  registerMacroInterceptor(async (ctx) => {
    const callId = ++diagInterceptorCall;
    const t0 = Date.now();
    const chatId = typeof ctx.env.chat?.id === 'string' ? (ctx.env.chat.id as string) : null;
    const activeBefore = chatId ? activeCardByChat.has(chatId) : false;
    const templateHead = ctx.template.slice(0, 120);
    const hasMarker = /★[A-Z_]+★|###[A-Z_]+###/.test(ctx.template);
    const chatEnv = ctx.env.chat as { id?: string; messageCount?: number; lastMessageId?: number };
    log.info(
      `macroInterceptor.enter #${callId} chat=${chatId ?? '<none>'} active_present=${activeBefore} ` +
        `commit=${ctx.commit} phase=${ctx.phase} userId=${ctx.userId ?? '<none>'} ` +
        `tmpl_len=${ctx.template.length} has_marker=${hasMarker} ` +
        `lumi_messageCount=${chatEnv?.messageCount ?? '?'} lumi_lastMessageId=${chatEnv?.lastMessageId ?? '?'} ` +
        `tmpl_head=${JSON.stringify(templateHead)}`,
    );

    if (!ctx.template.includes('{{')) {
      log.info(`macroInterceptor.exit #${callId} path=no_cbs elapsed=${Date.now() - t0}ms`);
      return;
    }

    captureUserId(ctx.userId, 'macroInterceptor');

    if (!chatId) {
      log.info(`macroInterceptor.exit #${callId} path=no_chat_id elapsed=${Date.now() - t0}ms`);
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
      });
    } catch (err) {
      log.warn(`macroInterceptor: runPipeline threw chat=${chatId} phase=${ctx.phase} — ${errMsg(err)}. Passing through.`);
      return;
    }

    const resolvedMarker = /★[A-Z_]+★|###[A-Z_]+###/.exec(resolved)?.[0] ?? null;
    const stillHasRaw = resolved.includes('{{risu_') || resolved.includes('{{getvar::') || resolved.includes('{{#risu_');

    // listenEdit('editDisplay') hooks fire on the display-phase pass (commit=false).
    // Risu: `runLuaEditTrigger(char, 'editDisplay', data)` at scripts.ts.
    if (!ctx.commit) {
      const triggers = active.card.risuPayload.triggers as ReadonlyArray<{
        effect?: ReadonlyArray<{ type?: string }>;
      }>;
      const luaScripts = active.card.risuPayload.lua_scripts;
      const hasLuaTrigger = triggers.some(
        (t) => t.effect?.[0]?.type === 'triggerlua',
      );
      if (hasLuaTrigger) {
        const editChain = triggers.map((t, i) => ({
          source: t,
          luaCode: luaScripts[i] ?? '',
        }));
        try {
          const editApi = makeSpindleHost({
            chatId,
            characterId: active.card.character_id,
            userId: ctx.userId ?? '',
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
            },
          );
        } catch (err) {
          log.warn(`macroInterceptor: listenEdit chain threw — ${errMsg(err)}. Continuing with pre-hook resolved.`);
        }
      }

      // Scaffolding: @@-action support is removed; at_actions is always empty
      // and this branch never runs. Kept for the eventual reimplementation.
      const atActions = coerceAtActions(active.card.risuPayload.at_actions);
      if (atActions.length > 0) {
        try {
          const atApi = makeSpindleHost({
            chatId,
            characterId: active.card.character_id,
            userId: ctx.userId ?? '',
          });
          resolved = await runAtActionsForPhase(atActions, 'editdisplay', resolved, {
            api: atApi,
            chatIndex: typeof envChat.lastMessageId === 'number' ? envChat.lastMessageId : -1,
          });
        } catch (err) {
          log.warn(`macroInterceptor: at-actions editdisplay threw — ${errMsg(err)}. Continuing.`);
        }
      }
    }

    if (resolved === ctx.template) {
      log.info(
        `macroInterceptor.exit #${callId} path=unchanged_passthrough elapsed=${Date.now() - t0}ms ` +
          `tmpl_len=${ctx.template.length} marker=${resolvedMarker ?? 'none'}`,
      );
      return;
    }
    // Doc-boundary normalize is not applied here: macroInterceptor fires for
    // both replace_string templates and find_regex patterns. Wrapping a
    // find_regex would break regex compilation.
    log.info(
      `macroInterceptor.exit #${callId} path=resolved elapsed=${Date.now() - t0}ms ` +
        `in_len=${ctx.template.length} out_len=${resolved.length} ` +
        `marker=${resolvedMarker ?? 'none'} still_has_raw_cbs=${stillHasRaw} ` +
        `out_head=${JSON.stringify(resolved.slice(0, 120))}`,
    );
    return resolved;
  }, 100);
  log.info('macroInterceptor: registered at priority=100');
} else {
  log.warn('macroInterceptor: NOT AVAILABLE on this Lumi build — extension macros will resolve via per-call RPC (slow for iteration-heavy cards, and FRAME-SHIFT UNRELIABLE without preprocessor coherence)');
}

if (typeof registerMessageContentProcessor === 'function') {
  let mcpInFlight = 0;
  let mcpEnterSeq = 0;
  registerMessageContentProcessor(async (ctx) => {
    // Gate only on "is this a Risu-imported chat?". Earlier containsCbs gate
    // excluded display-regex rules that lack `{{…}}` markers, causing
    // Lua-emitted sentinels to land raw. Risu's semantic: run the pipeline
    // always; `resolved === ctx.content` short-circuits the write.
    const tStart = Date.now();
    const seq = ++mcpEnterSeq;
    const enteredAt = ++mcpInFlight;
    log.info(
      `messageContentProcessor.enter #${seq} chat=${ctx.chatId} origin=${ctx.origin} msg=${ctx.messageId ?? '<new>'} raw_len=${ctx.content.length} inflight=${enteredAt}`,
    );
    try {
      captureUserId(ctx.userId, 'messageContentProcessor');
      const tA = Date.now();
      const active = await ensureActiveCardForChat(ctx.chatId, null);
      const tB = Date.now();
      if (!active) {
        log.info(
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
        if (!hasLuaTrigger) {
          log.info(
            `messageContentProcessor.exit #${seq} path=render-no-lua chat=${ctx.chatId} ensure=${tB - tA}ms total=${Date.now() - tStart}ms`,
          );
          return;
        }
        const rawIdx = ctx.extra?.['messageIndex'];
        const messageIndex = typeof rawIdx === 'number' ? rawIdx : 0;
        const risuChatIdx = Math.max(-1, messageIndex - 1);
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
          const transformed = await runListenEditChain<string>(
            editChain,
            'editDisplay',
            ctx.content,
            { index: risuChatIdx },
            editApi,
            { characterId: active.card.character_id, content: ctx.content },
            editScriptNS,
            { chatId: ctx.chatId, characterId: active.card.character_id },
          );
          if (transformed === ctx.content) {
            log.info(
              `messageContentProcessor.exit #${seq} path=render-noop chat=${ctx.chatId} msg=${ctx.messageId ?? '<?>'} idx=${messageIndex} total=${Date.now() - tStart}ms`,
            );
            return;
          }
          log.info(
            `messageContentProcessor.exit #${seq} path=render-transformed chat=${ctx.chatId} msg=${ctx.messageId ?? '<?>'} idx=${messageIndex} before_len=${ctx.content.length} after_len=${transformed.length} total=${Date.now() - tStart}ms`,
          );
          return { content: transformed };
        } catch (err) {
          log.warn(
            `messageContentProcessor.exit #${seq} path=render-threw chat=${ctx.chatId} msg=${ctx.messageId ?? '<?>'} err=${errMsg(err)} total=${Date.now() - tStart}ms`,
          );
          return;
        }
      }

      let resolved: string;
      try {
        resolved = await resolveReadonly(ctx.content, ctx.chatId, active.card.character_id);
      } catch (err) {
        log.error(
          `messageContentProcessor.exit #${seq} path=resolve-failed chat=${ctx.chatId} origin=${ctx.origin} ensure=${tB - tA}ms total=${Date.now() - tStart}ms: ${errMsg(err)}`,
        );
        return;
      }
      const tC = Date.now();

      // Scaffolding: @@-action support is removed; at_actions is always empty
      // and this branch never runs. Kept for the eventual reimplementation.
      const isUserMessage = ctx.extra?.['is_user'] === true; // best-effort; may be undefined
      const isGreeting = ctx.extra?.['greeting'] === true;
      const atActions = coerceAtActions(active.card.risuPayload.at_actions);
      let afterAt = resolved;
      if (atActions.length > 0 && !isUserMessage) {
        try {
          const atApi = makeSpindleHost({
            chatId: ctx.chatId,
            characterId: active.card.character_id,
            userId: ctx.userId,
          });
          afterAt = await runAtActionsForPhase(atActions, 'editdisplay', resolved, {
            api: atApi,
            chatIndex: isGreeting ? -1 : 0, // best-effort — @@move_top/bottom don't gate on this
            role: 'assistant',
          });
          if (afterAt !== resolved) {
            log.info(
              `messageContentProcessor: at-actions transformed chat=${ctx.chatId} ` +
                `origin=${ctx.origin} greeting=${isGreeting} ` +
                `resolve_len=${resolved.length} after_at_len=${afterAt.length}`,
            );
            // @@-action OUT templates can emit CBS macros (e.g. `{{raw::$1}}`
            // after capture substitution). Re-resolve once to expand them.
            try {
              afterAt = await resolveReadonly(afterAt, ctx.chatId, active.card.character_id);
            } catch (err) {
              log.warn(
                `messageContentProcessor: post-@@-action CBS re-resolve threw — ${errMsg(err)}. ` +
                  `Continuing with unresolved @@-action output.`,
              );
            }
          }
        } catch (err) {
          log.warn(
            `messageContentProcessor: at-actions editdisplay threw — ${errMsg(err)}. ` +
              `Continuing with pre-action content.`,
          );
        }
      }

      // Doc-boundary normalize at the MCP write boundary. Greetings stored
      // raw, LLM HTML output, and Lua-emitted docs need this so DOMPurify
      // doesn't discard leading `<style>` in fragment mode. Idempotent.
      const finalContent = normalizeReplaceStringForSanitizer(afterAt);

      if (finalContent === ctx.content) {
        log.info(
          `messageContentProcessor.exit #${seq} path=noop chat=${ctx.chatId} origin=${ctx.origin} msg=${ctx.messageId ?? '<new>'} ensure=${tB - tA}ms resolve=${tC - tB}ms total=${Date.now() - tStart}ms`,
        );
        return;
      }
      if (ctx.messageId) rememberOurWrite(ctx.chatId, ctx.messageId, finalContent);
      log.info(
        `messageContentProcessor.exit #${seq} path=baked chat=${ctx.chatId} origin=${ctx.origin} msg=${ctx.messageId ?? '<new>'} raw_len=${ctx.content.length} resolved_len=${resolved.length} after_at_len=${afterAt.length} final_len=${finalContent.length} doc_normalized=${finalContent !== afterAt} ensure=${tB - tA}ms resolve=${tC - tB}ms total=${Date.now() - tStart}ms`,
      );
      return { content: finalContent };
    } finally {
      mcpInFlight--;
    }
  }, 100);
  log.info('messageContentProcessor: registered');
} else {
  log.info('messageContentProcessor: not available on this Lumi build — falling back to reactive MESSAGE_EDITED resolve');
}

// listenEdit('editInput') + 'editRequest' chains via Lumi interceptor hook.
interface InterceptorContext {
  chatId?: string;
  connectionId?: string;
  personaId?: string;
  generationType?: 'normal' | 'continue' | 'regenerate' | 'swipe' | 'impersonate';
}
interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}
const registerInterceptor = (spindle as unknown as {
  registerInterceptor?: (
    handler: (
      messages: LlmMessage[],
      context: unknown,
    ) => Promise<LlmMessage[] | { messages: LlmMessage[]; parameters?: Record<string, unknown> }>,
    priority?: number,
  ) => void;
}).registerInterceptor;

if (typeof registerInterceptor === 'function') {
  registerInterceptor(async (messages, contextRaw) => {
    const ctx = (contextRaw ?? {}) as InterceptorContext;
    const chatId = typeof ctx.chatId === 'string' ? ctx.chatId : null;
    if (!chatId) return messages;
    const userId = getUserId();
    if (!userId) return messages;

    const active = await ensureActiveCardForChat(chatId, null);
    if (!active) return messages;

    const triggers = active.card.risuPayload.triggers as ReadonlyArray<{
      effect?: ReadonlyArray<{ type?: string }>;
    }>;
    const luaScripts = active.card.risuPayload.lua_scripts;
    const hasLuaTrigger = triggers.some((t) => t.effect?.[0]?.type === 'triggerlua');
    if (!hasLuaTrigger) return messages;

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

    let out: LlmMessage[] = messages;

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
            { chatId, characterId: active.card.character_id },
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
          log.warn(`interceptor.editInput threw — ${errMsg(err)}. Continuing with original.`);
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
        { chatId, characterId: active.card.character_id },
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
      log.warn(`interceptor.editRequest threw — ${errMsg(err)}. Continuing with prior array.`);
    }

    return out;
  }, 100);
  log.info('interceptor: registered (editInput + editRequest)');
} else {
  log.info('interceptor: not available on this Lumi build — listenEdit editInput/editRequest will not fire');
}

const variableState = new VariableStateStore();

const toggleState = new ToggleStateStore();

function scheduleStateChangedRefresh(chatId: string): void {
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
      await refreshResolvedContent(active, chatId);
      await refreshBgHtml(active, chatId);
      await refreshVariables(active, chatId);
      log.info(`scheduleStateChangedRefresh: completed chat=${chatId} elapsed=${Date.now() - t0}ms`);
    },
    (err) => log.error(`scheduleStateChangedRefresh: refresh threw chat=${chatId}: ${errMsg(err)}`),
  );
}

function makeStateChangedCallback(chatId: string): () => void {
  return () => scheduleStateChangedRefresh(chatId);
}

function makeTrackSidecarWrite(chatId: string): (msgId: string, rawContent: string) => void {
  return (msgId, rawContent) => {
    void (async () => {
      try {
        await setSidecarRaw(userStorage(), chatId, msgId, rawContent, getUserId());
      } catch (err) {
        log.warn(`trackSidecarWrite: setSidecarRaw failed chat=${chatId} msg=${msgId}: ${errMsg(err)}`);
      }
    })();
  };
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
): ((event: import('./interpreter/runtime.js').AuxDebugCaptureEvent) => void) | undefined {
  if (!settings.auxDebugCaptureRequest && !settings.auxDebugCaptureResponse) {
    return undefined;
  }
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
        chatId,
        auxConnectionId: event.auxConnectionId,
        auxModelOverride: event.auxModelOverride,
        elapsedMs: event.elapsedMs,
        payload: event.payload,
      });
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
  const anySpindle = spindle as unknown as {
    connections?: {
      list?: (uid?: string) => Promise<readonly {
        id: string; name: string; provider: string; model: string; is_default: boolean;
      }[]>;
    };
  };
  const listFn = anySpindle.connections?.list;
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
    log.warn(`listConnectionsForUser: list threw — ${errMsg(err)}`);
    return [];
  }
}

let activeUserId: string | null = null;
const activeCardByChat = new Map<string, ActiveCard>();
// Tracks the last chat each user opened so a page-refresh (SETTINGS_UPDATED
// dedup'd on same value) can repaint bg-html + portal state.
const lastActiveChatByUser = new Map<string, string>();
const compiledByCharacter = new Map<string, readonly CompiledTriggerEntry[]>();

// Snapshot of world_book_ids at active-card-load time. Lumi has no FK
// cascade on character delete; without this, world_books orphan on delete.
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
): Promise<{ deleted: number; absent: number; failed: number }> {
  let deleted = 0;
  let absent = 0;
  let failed = 0;
  const del = spindleImagesDelete();
  if (!del) {
    log.warn(`${context}: spindle.images.delete unavailable — ${imageIds.length} image(s) leaked`);
    return { deleted, absent, failed: imageIds.length };
  }
  let nextIndex = 0;
  const concurrency = Math.min(6, imageIds.length);
  const worker = async (): Promise<void> => {
    while (true) {
      const i = nextIndex++;
      if (i >= imageIds.length) break;
      const id = imageIds[i];
      if (!id) continue;
      try {
        const ok = await del(id, userId);
        if (ok) deleted++; else absent++;
      } catch (err) {
        failed++;
        log.warn(`${context}: image delete threw id=${id}: ${errMsg(err)}`);
      }
    }
  };
  const workers: Promise<void>[] = [];
  for (let w = 0; w < concurrency; w++) workers.push(worker());
  await Promise.all(workers);
  return { deleted, absent, failed };
}

async function runImageCleanupForCharacter(
  characterId: string,
  userId: string,
): Promise<void> {
  const ids = await markJournalPendingDelete(journalStorage(), userId, characterId);
  if (ids.length === 0) {
    await clearImageJournal(journalStorage(), userId, characterId);
    return;
  }
  const tStart = Date.now();
  const stats = await deleteImageIds(ids, userId, `image-cleanup char=${characterId}`);
  log.info(
    `image-cleanup: char=${characterId} deleted=${stats.deleted} absent=${stats.absent} ` +
      `failed=${stats.failed} total=${ids.length} elapsed=${Date.now() - tStart}ms`,
  );
  await clearImageJournal(journalStorage(), userId, characterId);
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
): Promise<void> {
  const userId = activeUserId;
  if (!userId) return;
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

let imageOrphanReaperRan = false;
async function runImageOrphanReaper(userId: string): Promise<void> {
  if (imageOrphanReaperRan) return;
  imageOrphanReaperRan = true;
  const tStart = Date.now();
  try {
    const journalIds = await listImageJournalCharacterIds(journalStorage(), userId);
    let resumed = 0;
    let orphaned = 0;
    for (const characterId of journalIds) {
      const file = await readImageJournalFile(journalStorage(), userId, characterId);
      if (!file) continue;
      if (file.status === 'pending_delete') {
        log.info(`image-journal reaper: resuming pending_delete char=${characterId} ids=${file.imageIds.length}`);
        await runImageCleanupForCharacter(characterId, userId);
        resumed++;
        continue;
      }
      let character: unknown = null;
      try {
        character = await spindle.characters.get(characterId, userId);
      } catch (err) {
        log.warn(`image-journal reaper: characters.get(${characterId}) threw: ${errMsg(err)}`);
        continue;
      }
      if (character !== null) continue;
      log.info(`image-journal reaper: orphan char=${characterId} ids=${file.imageIds.length} (character row missing)`);
      await runImageCleanupForCharacter(characterId, userId);
      orphaned++;
    }
    log.info(
      `image-journal reaper: done resumed=${resumed} orphans=${orphaned} ` +
        `total=${journalIds.length} elapsed=${Date.now() - tStart}ms`,
    );
  } catch (err) {
    log.warn(`image-journal reaper: failed: ${errMsg(err)}`);
  }
  await runModuleImageOrphanReaper(userId);
}

async function runModuleImageCleanup(moduleId: string, userId: string): Promise<void> {
  const ids = await markModuleJournalPendingDelete(journalStorage(), userId, moduleId);
  if (ids.length === 0) {
    await clearModuleImageJournal(journalStorage(), userId, moduleId);
    return;
  }
  const tStart = Date.now();
  const stats = await deleteImageIds(ids, userId, `module-image-cleanup module=${moduleId}`);
  log.info(
    `module-image-cleanup: module=${moduleId} deleted=${stats.deleted} absent=${stats.absent} ` +
      `failed=${stats.failed} total=${ids.length} elapsed=${Date.now() - tStart}ms`,
  );
  await clearModuleImageJournal(journalStorage(), userId, moduleId);
}

async function runModuleImageOrphanReaper(userId: string): Promise<void> {
  const tStart = Date.now();
  try {
    const journalIds = await listModuleImageJournalIds(journalStorage(), userId);
    let resumed = 0;
    let orphaned = 0;
    for (const moduleId of journalIds) {
      const file = await readModuleImageJournalFile(journalStorage(), userId, moduleId);
      if (!file) continue;
      if (file.status === 'pending_delete') {
        log.info(`module-image-journal reaper: resuming pending_delete module=${moduleId} ids=${file.imageIds.length}`);
        await runModuleImageCleanup(moduleId, userId);
        resumed++;
        continue;
      }
      const env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
      if (env !== null) continue;
      log.info(`module-image-journal reaper: orphan module=${moduleId} ids=${file.imageIds.length} (envelope missing)`);
      await runModuleImageCleanup(moduleId, userId);
      orphaned++;
    }
    log.info(
      `module-image-journal reaper: done resumed=${resumed} orphans=${orphaned} ` +
        `total=${journalIds.length} elapsed=${Date.now() - tStart}ms`,
    );
  } catch (err) {
    log.warn(`module-image-journal reaper: failed: ${errMsg(err)}`);
  }
}

interface PendingImportCompletion {
  hasPendingSvgRaster: boolean;
  characterName: string;
  startedAt: number;
}
const pendingImportCompletions = new Map<string, PendingImportCompletion>();

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
      `applySvgRasterIndex: updateLumirealm failed char=${characterId} — character may not be a lumirealm card`,
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
    });
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
        const reloaded = await ensureActiveCardForChat(chatId, null);
        if (reloaded) {
          await refreshResolvedContent(reloaded, chatId);
          await refreshBgHtml(reloaded, chatId);
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
      `import.finalize: char=${characterId} still pending — svg=${pending.hasPendingSvgRaster}`,
    );
    return;
  }
  pendingImportCompletions.delete(characterId);
  log.info(
    `import.finalize: char=${characterId} both async ops complete after ${Date.now() - pending.startedAt}ms — emitting phase=done`,
  );
  send({
    type: 'import_progress',
    phase: 'done',
    message: `Imported ${pending.characterName}`,
    fraction: 1,
    characterId,
  });
  try {
    pushCards(await listCards());
  } catch (err) {
    log.warn(`import.finalize: pushCards failed — ${errMsg(err)}`);
  }
}

// Chunked .charx upload: accumulate chunks by sessionId, assemble on commit.
// Stale sessions are GC'd after IMPORT_SESSION_TIMEOUT_MS.
interface ImportSession {
  readonly fileName: string;
  readonly totalBytes: number;
  readonly totalChunks: number;
  readonly buffer: (Uint8Array | null)[];
  receivedBytes: number;
  receivedChunks: number;
  startedAt: number;
  lastActivity: number;
}
const importSessions = new Map<string, ImportSession>();
const IMPORT_SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 min

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

function getUserId(): string | undefined {
  return activeUserId ?? undefined;
}

function userStorage(): UserStorageLike {
  return spindle.userStorage as unknown as UserStorageLike;
}

function send(msg: BackendToFrontend): void {
  spindle.sendToFrontend(msg);
}

const pendingConsents = new Map<string, (confirmed: boolean) => void>();
let consentChain: Promise<unknown> = Promise.resolve();
function requestConsent(opts: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}): Promise<{ confirmed: boolean }> {
  const run = (): Promise<{ confirmed: boolean }> =>
    new Promise((resolve) => {
      const requestId = crypto.randomUUID();
      pendingConsents.set(requestId, (confirmed) => {
        resolve({ confirmed });
      });
      send({
        type: 'consent_prompt',
        requestId,
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel,
        cancelLabel: opts.cancelLabel,
      });
      log.info(`requestConsent: dispatched requestId=${requestId} title="${opts.title}"`);
    });
  const result = consentChain.then(run, run);
  consentChain = result.catch(() => undefined);
  return result;
}

let logStateLoaded = false;
async function ensureLogStateLoaded(userId: string): Promise<void> {
  if (logStateLoaded) return;
  await loadPersistedLogState(userStorage(), userId);
  logStateLoaded = true;
}
function sendLogState(): void {
  const s: LogStateSnapshot = logStore.getState();
  send({
    type: 'log_state_pushed',
    enabled: s.enabled,
    includeChatData: s.includeChatData,
    eventCount: s.eventCount,
    bufferBytes: s.bufferBytes,
  });
}


async function listCards(): Promise<readonly CardSummary[]> {
  const userId = getUserId();
  const t0 = Date.now();
  log.info(`listCards: start userId=${userId ?? '<none>'}`);
  if (userId === undefined) {
    log.info(`listCards: userId not yet captured — returning empty`);
    return [];
  }
  const entries = await listLumirealmCharacters(charactersApi(), userId, {
    paginate: true,
  });
  const summaries: CardSummary[] = entries.map((e) => ({
    character_id: e.character.id,
    character_name: e.character.name,
    translator_version: e.data.translator_version,
    uses_lua: e.data.payload.requires.lua,
    stored_at: e.data.imported_at,
  }));
  summaries.sort((a, b) => b.stored_at - a.stored_at);
  log.info(`listCards: done count=${summaries.length} elapsed=${Date.now() - t0}ms`);
  return summaries;
}

function pushCards(cards: readonly CardSummary[]): void {
  send({ type: 'cards_updated', cards });
}

async function importCardFromBytes(
  bytesB64: string,
  fileName: string,
): Promise<void> {
  const tStart = Date.now();
  const userId = getUserId();
  log.info(`importCardFromBytes: start file=${fileName} b64-bytes=${bytesB64.length} (~${Math.round(bytesB64.length * 0.75)}B decoded) userId=${userId ?? '<none>'}`);

  const hasSetAvatar = typeof (spindle.characters as { setAvatar?: unknown }).setAvatar === 'function';
  if (!spindle.images?.upload) {
    throw new Error(
      'spindle.images.upload is unavailable — Lumi 0.9.6+ required.',
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
          entries: {
            create: (bookId, input, uid) =>
              spindle.world_books.entries.create(bookId, input as never, uid).then((e) => ({ id: e.id })),
          },
        }
      : undefined,
    images: {
      upload: (input, uid) =>
        spindleImagesApi.upload(input, uid).then((img) => ({ id: img.id })),
    },
    requestConsent,
  };
  if (!spindle.world_books) log.warn(`spindle.world_books unavailable — lorebook entries will be skipped`);

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
        });
      },
    });
    log.info(
      `importCard: returned characterId=${result.characterId} name=${result.characterName} ` +
        `imageIds=${result.imageIds.length} warnings=${result.warnings.length} elapsed=${Date.now() - tStart}ms`,
    );

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

    if (userId) {
      await refreshRisuAssetMap(result.characterId, userId).catch((err) => {
        log.warn(`importCardFromBytes: refreshRisuAssetMap threw char=${result.characterId}: ${errMsg(err)}`);
      });
    }

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
    });

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
      });
    }

    if (hasPendingSvgRaster) {
      pendingImportCompletions.set(result.characterId, {
        hasPendingSvgRaster,
        characterName: result.characterName,
        startedAt: Date.now(),
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
      });
      pushCards(await listCards());
    }
    for (const warning of result.warnings) {
      log.warn(`import warning surfaced: ${warning}`);
      spindle.toast.warning(warning, { title: 'lumirealm' });
    }
    log.info(`importCardFromBytes: done file=${fileName} total-elapsed=${Date.now() - tStart}ms`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (err instanceof RisuConsentDeclinedError) {
      log.info(`import cancelled by user (consent declined) after ${Date.now() - tStart}ms`);
      send({
        type: 'import_progress',
        phase: 'error',
        message: `Import cancelled — low-level access declined`,
        fraction: null,
        error: message,
      });
      return;
    }
    log.error(`import failed after ${Date.now() - tStart}ms: ${message}`);
    send({
      type: 'import_progress',
      phase: 'error',
      message: `Import of ${fileName} failed`,
      fraction: null,
      error: message,
    });
  }
}

async function deleteCardByChar(
  characterId: string,
  mode: 'soft' | 'cascade' = 'cascade',
): Promise<void> {
  log.info(`deleteCardByChar: start characterId=${characterId} mode=${mode}`);
  if (mode === 'soft') {
    const userId = getUserId();
    if (userId !== undefined) {
      const ok = await clearLumirealm(charactersApi(), characterId, userId);
      log.info(`deleteCardByChar: clearLumirealm ok=${ok}`);
    } else {
      log.warn(`deleteCardByChar: soft remove skipped — userId not yet captured for char=${characterId}`);
    }
  }
  // Invalidate any cached active-card entries that pointed at this character.
  let evictedChats = 0;
  for (const [chatId, active] of activeCardByChat) {
    if (active.card.character_id === characterId) {
      activeCardByChat.delete(chatId);
      clearActiveAssetIndexes(chatId);
      clearActiveCharacterImage(chatId);
      variableState.clearChat(chatId);
      toggleState.clearChat(chatId);
      evictedChats += 1;
    }
  }
  const compiledEvicted = compiledByCharacter.delete(characterId);
  log.info(`deleteCardByChar: evicted activeCard entries=${evictedChats} compiled=${compiledEvicted}`);
  // CHARACTER_DELETED fires before the row is removed; filter defensively.
  const fresh = await listCards();
  const filtered = fresh.filter((c) => c.character_id !== characterId);
  pushCards(filtered);
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
): Promise<ActiveCard | null> {
  const tEnter = Date.now();
  const cached = activeCardByChat.get(chatId);
  if (cached) {
    log.verbose(`ensureActiveCardForChat: cache hit chatId=${chatId} characterId=${cached.card.character_id}`);
    return cached;
  }
  const userId = getUserId();
  if (userId === undefined) {
    log.info(`ensureActiveCardForChat: userId not yet captured for chatId=${chatId} — will retry on next event`);
    return null;
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
    log.info(`ensureActiveCardForChat: no characterId for chatId=${chatId} (chat may be group/deleted) — skip`);
    return null;
  }
  log.info(`ensureActiveCardForChat: cache miss chatId=${chatId} characterId=${characterId} — fetching extensions`);
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
    spindle.toast.error(err.message, { title: 'lumirealm' });
    return null;
  }
  if (check.degraded.length > 0) {
    log.warn(`ensureActiveCardForChat: degraded features=[${check.degraded.join(', ')}]`);
    spindle.toast.warning(
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
  const active: ActiveCard = { card, chatId };
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
  void backfillImageJournalIfMissing(characterId, fetched.character.image_id ?? null, card);
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
  log.info(
    `ensureActiveCardForChat: DONE chatId=${chatId} characterId=${characterId} total=${Date.now() - tEnter}ms`,
  );
  return active;
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
    log.verbose(`refreshPersonaImage: ${errMsg(err)}`);
  }
}

async function runBinding(
  active: ActiveCard,
  chatId: string,
  binding: RisuBinding,
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
  const api = makeSpindleHost({ chatId, characterId, userId: getUserId() });
  const scriptNS = makeDispatcherScriptNS();
  registerManualTriggers(scriptNS, compiled, api);
  const stateChanged = makeStateChangedCallback(chatId);
  const trackSidecarWrite = makeTrackSidecarWrite(chatId);
  const settings = getCachedSettingsSync(getUserId());
  const auxDebugCapture = makeAuxDebugCapture(chatId, settings);
  const prior = setDispatchContext({
    chatId,
    rememberOurWrite,
    binding,
    stateChanged,
    trackSidecarWrite,
    auxConnectionId: settings.auxConnectionId,
    auxModelOverride: settings.auxModelOverride,
    auxSamplers: settings.auxSamplers,
    submodelConnectionId: settings.submodelConnectionId,
    submodelModelOverride: settings.submodelModelOverride,
    submodelSamplers: settings.submodelSamplers,
    ...(auxDebugCapture ? { auxDebugCapture } : {}),
  });
  try {
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
        spindle.toast.error(`lumirealm: ${name} — ${msg}`, { title: 'lumirealm trigger error' });
      },
    );
  } finally {
    setDispatchContext(prior);
  }

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
    // Scaffolding: @@-action support is removed; at_actions is always empty
    // and hasOutputAtActions is always false. Kept for the eventual reimplementation.
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
                { chatId, characterId },
              );
            } catch (err) {
              log.warn(`runBinding: listenEdit editOutput chain threw — ${errMsg(err)}. Continuing.`);
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
              log.warn(`runBinding: at-actions output threw — ${errMsg(err)}. Continuing.`);
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
        log.warn(`runBinding: edit-hooks output threw — ${errMsg(err)}. Continuing.`);
      }
    }
  }

  log.info(`runBinding: done binding=${binding} elapsed=${Date.now() - tBind}ms`);
}

async function dispatchManualTrigger(
  chatId: string,
  triggerName: string,
  triggerId?: string,
): Promise<void> {
  const active = await ensureActiveCardForChat(chatId, null);
  if (!active) {
    log.warn(`dispatchManualTrigger: no active card for chatId=${chatId} — skip`);
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
        `(no triggerlua and no comment="${triggerName}") — Risu would no-op here too`,
    );
    return;
  }
  log.info(
    `dispatchManualTrigger: name="${triggerName}" lua=${luaTriggers.length} ` +
      `commentMatched=${commentMatchedTriggers.length} chatId=${chatId}`,
  );
  const api = makeSpindleHost({ chatId, characterId, userId: getUserId() });
  const scriptNS = makeDispatcherScriptNS();
  const effectiveTriggerId = triggerId ?? String(Math.random()).slice(2, 10);
  const t0 = Date.now();
  for (const trigger of luaTriggers) {
    const firstEffect = trigger.effect[0];
    if (!firstEffect) continue;
    const luaCode = String(firstEffect.code ?? '');
    if (luaCode.length === 0) continue;
    try {
      const settings = getCachedSettingsSync(getUserId());
      const auxDebugCapture = makeAuxDebugCapture(chatId, settings);
      const runtime = await makeRisuTriggerRuntime(api, { characterId }, scriptNS, {
        characterId,
        binding: 'manual',
        chatId,
        rememberOurWrite,
        stateChanged: makeStateChangedCallback(chatId),
        trackSidecarWrite: makeTrackSidecarWrite(chatId),
        auxConnectionId: settings.auxConnectionId,
        auxModelOverride: settings.auxModelOverride,
        auxSamplers: settings.auxSamplers,
        submodelConnectionId: settings.submodelConnectionId,
        submodelModelOverride: settings.submodelModelOverride,
        submodelSamplers: settings.submodelSamplers,
        ...(auxDebugCapture ? { auxDebugCapture } : {}),
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
      const settings = getCachedSettingsSync(getUserId());
      const auxDebugCapture = makeAuxDebugCapture(chatId, settings);
      const stateChanged = makeStateChangedCallback(chatId);
      const trackSidecarWrite = makeTrackSidecarWrite(chatId);
      const prior = setDispatchContext({
        chatId,
        rememberOurWrite,
        binding: 'manual',
        stateChanged,
        trackSidecarWrite,
        auxConnectionId: settings.auxConnectionId,
        auxModelOverride: settings.auxModelOverride,
        auxSamplers: settings.auxSamplers,
        submodelConnectionId: settings.submodelConnectionId,
        submodelModelOverride: settings.submodelModelOverride,
        submodelSamplers: settings.submodelSamplers,
        ...(auxDebugCapture ? { auxDebugCapture } : {}),
      });
      try {
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
            spindle.toast.error(`lumirealm: ${name} — ${msg}`, { title: 'lumirealm trigger error' });
          },
        );
        log.info(`dispatchManualTrigger: comment-matched dispatch fired=${fired}/${commentMatchedTriggers.length}`);
      } finally {
        setDispatchContext(prior);
      }
    } catch (err) {
      log.error(`dispatchManualTrigger: comment-matched dispatch threw: ${errMsg(err)}`);
    }
  }

  log.info(`dispatchManualTrigger: done triggerName=${triggerName} elapsed=${Date.now() - t0}ms`);
  // State may have mutated → re-resolve every tracked message + repaint bg
  await refreshResolvedContent(active, chatId);
  await refreshBgHtml(active, chatId);
  await refreshVariables(active, chatId);
}

async function refreshVariables(
  active: ActiveCard,
  chatId: string,
  opts?: { force?: boolean },
): Promise<void> {
  const userId = getUserId();
  if (userId === undefined) {
    log.verbose(`variables.refresh: skip chat=${chatId} — userId not yet captured`);
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
  const defaults = active.card.risuPayload.scriptstate_defaults ?? {};
  const result = variableState.applySnapshot(chatId, scopes, defaults);
  if (result.changed || opts?.force) {
    send({
      type: 'set_variables',
      chatId,
      seq: result.entry.seq,
      scopes: result.entry.scopes,
      defaults: result.entry.defaults,
      ts: result.entry.ts,
    });
    const counts =
      `local=${Object.keys(scopes.local).length} ` +
      `global=${Object.keys(scopes.global).length} ` +
      `chat=${Object.keys(scopes.chat).length} ` +
      `defaults=${Object.keys(defaults).length}`;
    log.info(
      `variables.refresh: pushed chat=${chatId} seq=${result.entry.seq} ` +
        `${counts} forced=${!!opts?.force}`,
    );
  } else {
    log.verbose(`variables.refresh: unchanged chat=${chatId} seq=${result.entry.seq}`);
  }
}

async function writeLocalVariable(
  chatId: string,
  key: string,
  value: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  const userId = getUserId();
  if (userId === undefined) {
    return { ok: false, reason: 'userId not yet captured (open a chat first)' };
  }
  const trimmedKey = key.trim();
  if (trimmedKey.length === 0) {
    return { ok: false, reason: 'variable name cannot be empty' };
  }
  const active = await ensureActiveCardForChat(chatId, null);
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
      return { ok: true }; // already absent — idempotent no-op
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

  await refreshResolvedContent(active, chatId);
  await refreshBgHtml(active, chatId);
  await refreshVariables(active, chatId, { force: true });

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
  opts?: { force?: boolean },
): Promise<void> {
  const userId = getUserId();
  if (userId === undefined) {
    log.verbose(`toggles.refresh: skip chat=${chatId} — userId not yet captured`);
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
    });
    log.info(
      `toggles.refresh: pushed chat=${chatId} seq=${result.entry.seq} ` +
        `count=${wire.length} keys=${extractToggleKeys(flatToggles).length} forced=${!!opts?.force}`,
    );
  } else {
    log.verbose(`toggles.refresh: unchanged chat=${chatId} seq=${result.entry.seq}`);
  }
}

async function writeToggleValue(
  chatId: string,
  key: string,
  value: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  const userId = getUserId();
  if (userId === undefined) {
    return { ok: false, reason: 'userId not yet captured (open a chat first)' };
  }
  const trimmedKey = key.trim();
  if (trimmedKey.length === 0) {
    return { ok: false, reason: 'toggle key cannot be empty' };
  }
  const active = await ensureActiveCardForChat(chatId, null);
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

  await refreshResolvedContent(active, chatId);
  await refreshBgHtml(active, chatId);
  await refreshVariables(active, chatId, { force: true });

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
    resolved = await resolveReadonly(joined, chatId, characterId);
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

async function refreshBgHtml(active: ActiveCard, chatId: string): Promise<void> {
  const bgRaw = active.card.risuPayload.background_html;
  const moduleBg = active.card.risuPayload.module_background_embedding ?? '';
  const bgCombined = (bgRaw ?? '') + (moduleBg.length > 0 ? '\n' + moduleBg : '');
  const characterId = active.card.character_id;

  log.verbose(
    `refreshBgHtml: START chatId=${chatId} bgRaw_len=${bgRaw?.length ?? 0} ` +
      `moduleBg_len=${moduleBg.length} bgCombined_len=${bgCombined.length}`,
  );

  const tResolve = Date.now();
  let resolvedBg = '';
  let crossRuleStyles: readonly string[] = [];
  try {
    const [bgOut, csOut] = await Promise.all([
      bgCombined.length > 0
        ? resolveReadonly(bgCombined, chatId, characterId)
        : Promise.resolve(''),
      extractCrossRuleStyleParts(
        active.card.regex_scripts,
        active.card.risuPayload.at_actions,
        chatId,
        characterId,
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
    log.verbose(`refreshBgHtml: no bg_html and no cross-rule styles — sending clear_bg_html`);
    try {
      spindle.sendToFrontend({ type: 'clear_bg_html', chatId });
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
  try {
    spindle.sendToFrontend({
      type: 'render_bg_html',
      chatId,
      bgHtml: resolvedBg,
      ...(crossRuleStyles.length > 0 ? { crossRuleStyles } : {}),
    } as never);
    log.verbose(`refreshBgHtml: sendToFrontend render_bg_html OK chatId=${chatId}`);
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
): Promise<string> {
  const userId = getUserId();
  const t0 = Date.now();
  log.verbose(
    `resolveReadonly: START chat=${chatId} char=${characterId} userId=${userId ?? '<none>'} template_len=${template.length} ` +
      `template[0..200]=${JSON.stringify(template.slice(0, 200))}`,
  );
  if (workerEvalEnabled()) {
    // Operator-scoped Spindle APIs (chats.get / characters.get / personas.getActive)
    // require a userId. If we don't have one yet (captureUserId hasn't fired),
    // skip worker-eval entirely rather than slamming three IPC calls with
    // `undefined as string`. The legacy spindle.macros.resolve path tolerates
    // a missing userId better (it has its own fallback).
    if (userId === undefined) {
      log.info(`resolveReadonly: worker-eval skipped chat=${chatId} — userId not yet captured; using legacy path`);
    } else {
      try {
        const out = await resolveReadonlyInWorker(template, chatId, characterId, userId);
        log.info(
          `resolveReadonly: DONE (worker-eval) chat=${chatId} elapsed=${Date.now() - t0}ms out_len=${out.length} ` +
            `out[0..200]=${JSON.stringify(out.slice(0, 200))}`,
        );
        return out;
      } catch (err) {
        log.error(`resolveReadonly: worker-eval threw chat=${chatId} — ${(err as Error).message}. Falling back to legacy path.`);
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
    log.info(
      `resolveReadonly: DONE chat=${chatId} elapsed=${Date.now() - t0}ms out_len=${result.text.length} ` +
        `diagnostics=${(result.diagnostics ?? []).length} out[0..200]=${JSON.stringify(result.text.slice(0, 200))}`,
    );
    return result.text;
  } catch (err) {
    log.error(`resolveReadonly: THREW chat=${chatId} elapsed=${Date.now() - t0}ms — ${(err as Error).message}`);
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
async function resolveAndPersist(
  chatId: string,
  msgId: string,
  characterId: string,
  rawContent: string,
  currentContent: string,
  atActions: readonly RuntimeAtAtAction[] = [],
  chatIndex = 0,
): Promise<boolean> {
  let resolved: string;
  try {
    resolved = await resolveReadonly(rawContent, chatId, characterId);
  } catch (err) {
    log.error(`resolveAndPersist: resolve failed chat=${chatId} msg=${msgId}: ${errMsg(err)}`);
    return false;
  }

  // Scaffolding: @@-action support is removed; at_actions is always empty
  // and this branch never runs. Kept for the eventual reimplementation.
  if (atActions.length > 0) {
    try {
      const atApi = makeSpindleHost({
        chatId,
        characterId,
        userId: getUserId() ?? '',
      });
      const beforeAt = resolved;
      resolved = await runAtActionsForPhase(atActions, 'editdisplay', resolved, {
        api: atApi,
        chatIndex,
        role: 'assistant',
      });
      const atChanged = resolved !== beforeAt;
      log.info(
        `resolveAndPersist.atActions: chat=${chatId} msg=${msgId} count=${atActions.length} ` +
          `phase=editdisplay chatIndex=${chatIndex} before_len=${beforeAt.length} after_len=${resolved.length} ` +
          `changed=${atChanged}`,
      );
      if (atChanged) {
        try {
          resolved = await resolveReadonly(resolved, chatId, characterId);
        } catch (err) {
          log.warn(
            `resolveAndPersist: post-@@-action CBS re-resolve threw chat=${chatId} msg=${msgId}: ${errMsg(err)} — keeping unresolved @@-action output`,
          );
        }
      }
    } catch (err) {
      log.warn(
        `resolveAndPersist: at-actions editdisplay threw chat=${chatId} msg=${msgId}: ${errMsg(err)} — keeping pre-action content`,
      );
    }
  } else {
    log.verbose(
      `resolveAndPersist.atActions: chat=${chatId} msg=${msgId} count=0 — atActions array empty (re-import card to populate?)`,
    );
  }

  // Normalize before write; last chokepoint for cards with HTML-doc-shaped content.
  resolved = normalizeReplaceStringForSanitizer(resolved);

  if (resolved === currentContent) {
    return true;
  }
  try {
    rememberOurWrite(chatId, msgId, resolved);
    await spindle.chat.updateMessage(chatId, msgId, {
      content: resolved,
      metadata: { edited_by: EDITED_BY_MARKER },
    });
    log.info(
      `resolveAndPersist: chat=${chatId} msg=${msgId} raw=${rawContent.length} resolved=${resolved.length} (prev=${currentContent.length})`,
    );
    log.info(`resolveAndPersist: raw[0..400]=${JSON.stringify(rawContent.slice(0, 400))}`);
    log.info(`resolveAndPersist: resolved=${JSON.stringify(resolved.slice(0, 400))}`);
    return true;
  } catch (err) {
    log.error(`resolveAndPersist: updateMessage failed chat=${chatId} msg=${msgId}: ${errMsg(err)}`);
    return false;
  }
}

async function refreshResolvedContent(active: ActiveCard, chatId: string): Promise<void> {
  const t0 = Date.now();
  const characterId = active.card.character_id;
  const uid = getUserId();
  const storage = userStorage();

  const messages = await fetchChatMessages(chatId);
  if (messages.length === 0) return;

  let sidecar: ChatSidecar;
  try {
    sidecar = await readSidecar(storage, chatId, uid);
  } catch (err) {
    log.error(`refreshResolvedContent: readSidecar failed chat=${chatId}: ${errMsg(err)}`);
    return;
  }

  const toStash: { msgId: string; rawContent: string }[] = [];
  for (const m of messages) {
    if (m.role === 'user') continue;
    if (sidecar.msgs[m.id]) continue;
    // Track all non-user messages, not just CBS-bearing ones. Display-regex
    // sentinels also need re-resolve. Per-message pipeline short-circuits
    // when output is unchanged.
    toStash.push({ msgId: m.id, rawContent: m.content });
  }
  if (toStash.length > 0) {
    try {
      sidecar = await trackMessagesBatch(storage, chatId, toStash, uid);
    } catch (err) {
      log.error(`refreshResolvedContent: trackMessagesBatch failed chat=${chatId}: ${errMsg(err)}`);
      return;
    }
  }

  const contentByMsgId = new Map<string, string>();
  for (const m of messages) contentByMsgId.set(m.id, m.content);

  const atActions = coerceAtActions(active.card.risuPayload.at_actions);

  // Risu frame: greeting=-1, post-greeting messages 0..N. Shift Lumi's 0-based index by -1.
  const msgIdToRisuIndex = new Map<string, number>();
  let riskuIdx = -1; // first non-user message becomes -1 (greeting)
  for (const m of messages) {
    if (m.role === 'user') continue;
    msgIdToRisuIndex.set(m.id, riskuIdx);
    riskuIdx += 1;
  }

  let persisted = 0;
  let skipped = 0;
  for (const [msgId, entry] of Object.entries(sidecar.msgs)) {
    if (entry.userEdited) { skipped += 1; continue; }
    const current = contentByMsgId.get(msgId);
    if (current === undefined) {
      continue;
    }
    const chatIndex = msgIdToRisuIndex.get(msgId) ?? 0;
    const ok = await resolveAndPersist(
      chatId, msgId, characterId, entry.rawContent, current,
      atActions, chatIndex,
    );
    if (ok) persisted += 1;
  }

  const total = Object.keys(sidecar.msgs).length;
  log.info(
    `refreshResolvedContent: chat=${chatId} tracked=${total} stashed_new=${toStash.length} ` +
      `resolved=${persisted} skipped_userEdited=${skipped} elapsed=${Date.now() - t0}ms`,
  );
}

function dumpPayload(raw: unknown): string {
  try { return JSON.stringify(raw).slice(0, 400); } catch { return '<unstringifiable>'; }
}

// Capture userId from every event callback so operator-scoped Spindle calls
// succeed before any frontend message arrives.
function captureUserId(userId: string | undefined, where: string): void {
  if (userId && activeUserId !== userId) {
    activeUserId = userId;
    log.info(`captureUserId: set from ${where} userId=${userId}`);
    void getSettingsForUser(userId).catch((err) => {
      log.warn(`captureUserId: settings preload failed for user=${userId}: ${errMsg(err)}`);
    });
    void runImageOrphanReaper(userId).catch((err) => {
      log.warn(`captureUserId: image orphan reaper failed for user=${userId}: ${errMsg(err)}`);
    });
  }
}

// SETTINGS_UPDATED key='activeChatId' fires on chat navigation. Warms the
// active-card cache and renders bg-html. Does NOT fire `start` binding (Risu
// fires `start` only inside sendChat, not on chat open).
spindle.on('SETTINGS_UPDATED', async (raw, userId) => {
  captureUserId(userId, 'SETTINGS_UPDATED');
  const p = raw as { key?: string; value?: unknown; keys?: string[] };
  if (p.key !== 'activeChatId') return;
  const chatId = typeof p.value === 'string' && p.value.length > 0 ? p.value : null;
  log.info(`event SETTINGS_UPDATED activeChatId=${chatId ?? '<cleared>'} payload=${dumpPayload(raw)}`);
  // When chatId clears (ChatView unmount), fire clear_bg_html for the last
  // mounted chat so fixed-positioned bg widgets don't bleed onto other pages.
  if (!chatId) {
    const lastChat = userId ? lastActiveChatByUser.get(userId) : undefined;
    if (lastChat) {
      log.info(
        `SETTINGS_UPDATED activeChatId cleared, dismounting bg-host for last chat=${lastChat}`,
      );
      try { spindle.sendToFrontend({ type: 'clear_bg_html', chatId: lastChat }); }
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
    log.warn(`SETTINGS_UPDATED activeChatId: chats.get failed — ${(err as Error).message}`);
  }
  const active = await ensureActiveCardForChat(chatId, characterId ?? null);
  log.info(`SETTINGS_UPDATED activeChatId: active=${active ? `characterId=${active.card.character_id} hasBgHtml=${!!active.card.risuPayload.background_html} triggers=${active.card.risuPayload.triggers?.length ?? 0}` : '<none>'}`);
  if (!active) {
    try { spindle.sendToFrontend({ type: 'clear_bg_html', chatId }); } catch { /* */ }
    return;
  }
  await refreshResolvedContent(active, chatId);
  await refreshBgHtml(active, chatId);
  await refreshVariables(active, chatId, { force: true });
  // Force toggle definitions on chat open; toggle values travel via the variables push above.
  await refreshToggleDefinitions(active, chatId, { force: true });
  log.info(`SETTINGS_UPDATED activeChatId: ALL DONE chatId=${chatId}`);
});

const chatChangedDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const chatChangedCoalescedCount = new Map<string, number>();
const CHAT_CHANGED_DEBOUNCE_MS = 50;

function scheduleChatChangedRefresh(chatId: string, characterId: string | null): void {
  chatChangedCoalescedCount.set(chatId, (chatChangedCoalescedCount.get(chatId) ?? 0) + 1);
  if (chatChangedDebounceTimers.has(chatId)) return;
  const timer = setTimeout(async () => {
    chatChangedDebounceTimers.delete(chatId);
    const coalesced = chatChangedCoalescedCount.get(chatId) ?? 1;
    chatChangedCoalescedCount.delete(chatId);
    try {
      const active = await ensureActiveCardForChat(chatId, characterId);
      log.info(`CHAT_CHANGED (external, debounced): coalesced=${coalesced} active=${active ? `char=${active.card.character_id}` : '<none>'}`);
      if (!active) {
        try { spindle.sendToFrontend({ type: 'clear_bg_html', chatId }); }
        catch (err) { log.warn(`CHAT_CHANGED clear_bg_html: ${(err as Error).message}`); }
        return;
      }
      await refreshResolvedContent(active, chatId);
      await refreshBgHtml(active, chatId);
      await refreshVariables(active, chatId, { force: true });
    } catch (err) {
      log.error(`scheduleChatChangedRefresh: chat=${chatId} threw: ${errMsg(err)}`);
    }
  }, CHAT_CHANGED_DEBOUNCE_MS);
  if (typeof (timer as { unref?: () => void }).unref === 'function') {
    (timer as { unref: () => void }).unref();
  }
  chatChangedDebounceTimers.set(chatId, timer);
}

spindle.on('CHAT_CHANGED', async (raw, userId) => {
  captureUserId(userId, 'CHAT_CHANGED');
  const { chatId, characterId } = extractIds(raw);
  if (!chatId) { log.warn('CHAT_CHANGED: missing chatId — aborting'); return; }
  const wasOwn = consumeOwnChatChange(chatId);
  log.info(`event CHAT_CHANGED chatId=${chatId} characterId=${characterId ?? '?'} ownWrite=${wasOwn}`);
  if (wasOwn) {
    await ensureActiveCardForChat(chatId, characterId);
    return;
  }
  scheduleChatChangedRefresh(chatId, characterId);
});

// MESSAGE_SENT: editInput is wired via registerInterceptor; sidecar only here.
spindle.on('MESSAGE_SENT', async (raw, userId) => {
  captureUserId(userId, 'MESSAGE_SENT');
  const { chatId, characterId } = extractIds(raw);
  log.info(`event MESSAGE_SENT chatId=${chatId ?? '?'} characterId=${characterId ?? '?'} payload=${dumpPayload(raw)}`);
  if (!chatId) return;
  const active = await ensureActiveCardForChat(chatId, characterId);
  if (!active) { log.info(`MESSAGE_SENT: no active card — skip`); return; }

  log.info(`MESSAGE_SENT: → refreshResolvedContent (no binding — Risu parity)`);
  await refreshResolvedContent(active, chatId);
  await refreshVariables(active, chatId);
});

const generationsInFlight = new Map<string, number>();
function isGenerationInFlight(chatId: string): boolean {
  return (generationsInFlight.get(chatId) ?? 0) > 0;
}

spindle.on('GENERATION_STARTED', async (raw, userId) => {
  captureUserId(userId, 'GENERATION_STARTED');
  const { chatId, characterId } = extractIds(raw);
  log.info(`event GENERATION_STARTED chatId=${chatId ?? '?'} characterId=${characterId ?? '?'} payload=${dumpPayload(raw)}`);
  if (!chatId) return;
  generationsInFlight.set(chatId, (generationsInFlight.get(chatId) ?? 0) + 1);
  const active = await ensureActiveCardForChat(chatId, characterId);
  if (!active) return;
  log.info(`GENERATION_STARTED: → runBinding(start)`);
  await runBinding(active, chatId, 'start');
  log.info(`GENERATION_STARTED: → runBinding(request)`);
  await runBinding(active, chatId, 'request');
  await refreshResolvedContent(active, chatId);
  await refreshBgHtml(active, chatId);
  await refreshVariables(active, chatId);
});

spindle.on('GENERATION_ENDED', async (raw, userId) => {
  captureUserId(userId, 'GENERATION_ENDED');
  const { chatId, characterId } = extractIds(raw);
  log.info(`event GENERATION_ENDED chatId=${chatId ?? '?'} characterId=${characterId ?? '?'} payload=${dumpPayload(raw)}`);
  if (!chatId) return;
  const n = generationsInFlight.get(chatId) ?? 0;
  if (n <= 1) generationsInFlight.delete(chatId);
  else generationsInFlight.set(chatId, n - 1);
  const active = await ensureActiveCardForChat(chatId, characterId);
  if (!active) return;
  for (const binding of GENERATION_ENDED_BINDINGS) {
    await runBinding(active, chatId, binding);
  }
  await refreshResolvedContent(active, chatId);
  await refreshBgHtml(active, chatId);
  await refreshVariables(active, chatId);
});

// MESSAGE_SWIPED  - fires when user swipes to an alternate greeting/response
// (chats.service.ts). The message's `content` changes to the new
// swipe's text, but our sidecar still has the previous swipe's raw CBS.
// Drop the stale sidecar entry + re-run ingestion so the new swipe's raw
// content gets stashed + resolved. Applies to both "swipe greeting" (user
// cycles through first_mes alternates) and "swipe response" (regenerate).
spindle.on('MESSAGE_SWIPED', async (raw, userId) => {
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
  const active = await ensureActiveCardForChat(chatId, null);
  if (!active) return;
  // Drop the stale sidecar entry so refreshResolvedContent re-stashes the
  // new swipe's raw. Safe: markUserEdited semantics don't carry across
  // swipes (each swipe is effectively a different message-body).
  try {
    const sidecar = await readSidecar(userStorage(), chatId, getUserId());
    if (sidecar.msgs[msgId]) {
      delete (sidecar.msgs as Record<string, unknown>)[msgId];
      const storage = userStorage();
      const uid = getUserId();
      await (storage as unknown as {
        setJson: (path: string, val: unknown, opts?: { userId?: string }) => Promise<void>;
      }).setJson(
        `lumirealm/chats/${chatId}.json`,
        sidecar,
        uid === undefined ? {} : { userId: uid },
      );
      log.info(`MESSAGE_SWIPED: cleared stale sidecar entry chat=${chatId} msg=${msgId}`);
    }
  } catch (err) {
    log.warn(`MESSAGE_SWIPED: sidecar clear failed chat=${chatId}: ${errMsg(err)}`);
  }
  await refreshResolvedContent(active, chatId);
  await refreshBgHtml(active, chatId);
  await refreshVariables(active, chatId);
  // No output/display bindings here. Risu's output trigger fires inside
  // sendChat (index.svelte.ts,1679), not on the swipe primitive.
  // For fresh regenerate, GENERATION_ENDED is the correct fire point.
});

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

spindle.on('MESSAGE_EDITED', async (raw, userId) => {
  captureUserId(userId, 'MESSAGE_EDITED');
  const p = raw as MessageEditedPayload;
  const chatId = p.chatId ?? p.message?.chat_id ?? null;
  const msgId = p.message?.id ?? null;
  if (!chatId || !msgId) {
    log.warn(`event MESSAGE_EDITED: missing chatId/msgId payload=${JSON.stringify(raw).slice(0, 200)}`);
    return;
  }
  // Self-echo detection. Content cache is one-shot, consumed on match. The
  // stored edited_by marker is unreliable: Lumi carries it across subsequent
  // updates, so user writes can inherit it.
  const newContent = String(p.message?.content ?? '');
  if (consumeIfOurWrite(chatId, msgId, newContent)) {
    // Our own resolveAndPersist echo. Not a user action.
    return;
  }
  const editedBy = readEditedBy(p);
  void editedBy;
  const inFlight = isGenerationInFlight(chatId);
  const isAssistant = (p.message as { is_user?: unknown } | undefined)?.is_user === false;
  const looksLikeContentReset = containsCbs(newContent) || (inFlight && isAssistant);
  if (looksLikeContentReset) {
    if (inFlight && isAssistant && !containsCbs(newContent)) {
      log.info(`event MESSAGE_EDITED (streaming-finalize, re-resolving) chatId=${chatId} msgId=${msgId} content_len=${newContent.length} inFlight=true`);
    }
    log.info(`event MESSAGE_EDITED (content-reset, re-resolving) chatId=${chatId} msgId=${msgId} content_len=${newContent.length}`);
    try {
      const sidecar = await readSidecar(userStorage(), chatId, getUserId());
      if (sidecar.msgs[msgId]) {
        delete (sidecar.msgs as Record<string, unknown>)[msgId];
        const uid = getUserId();
        await (userStorage() as unknown as {
          setJson: (path: string, val: unknown, opts?: { userId?: string }) => Promise<void>;
        }).setJson(
          `lumirealm/chats/${chatId}.json`,
          sidecar,
          uid === undefined ? {} : { userId: uid },
        );
      }
      const active = await ensureActiveCardForChat(chatId, null);
      if (active) {
        await refreshResolvedContent(active, chatId);
        await refreshBgHtml(active, chatId);
              await refreshVariables(active, chatId);
      }
    } catch (err) {
      log.warn(`MESSAGE_EDITED content-reset: reconcile failed chat=${chatId}: ${errMsg(err)}`);
    }
    return;
  }
  log.info(`event MESSAGE_EDITED (user) chatId=${chatId} msgId=${msgId} editedBy=${editedBy ?? '<none>'}`);
  try {
    const flipped = await markUserEdited(userStorage(), chatId, msgId, getUserId());
    if (flipped) log.info(`MESSAGE_EDITED: userEdited flag set chat=${chatId} msg=${msgId}`);
  } catch (err) {
    log.error(`MESSAGE_EDITED: markUserEdited failed chat=${chatId} msg=${msgId}: ${errMsg(err)}`);
  }
});

// MESSAGE_DELETED: refresh portals against the smaller message list.
spindle.on('MESSAGE_DELETED', async (raw, userId) => {
  captureUserId(userId, 'MESSAGE_DELETED');
  const p = raw as { chatId?: string; messageId?: string; message?: { id?: string; chat_id?: string } };
  const chatId = p.chatId ?? p.message?.chat_id ?? null;
  const msgId = p.messageId ?? p.message?.id ?? null;
  log.info(`event MESSAGE_DELETED chatId=${chatId ?? '?'} msgId=${msgId ?? '?'}`);
  if (!chatId) return;
  if (msgId) {
    try {
      const sidecar = await readSidecar(userStorage(), chatId, getUserId());
      if (sidecar.msgs[msgId]) {
        delete (sidecar.msgs as Record<string, unknown>)[msgId];
        const uid = getUserId();
        await (userStorage() as unknown as {
          setJson: (path: string, val: unknown, opts?: { userId?: string }) => Promise<void>;
        }).setJson(
          `lumirealm/chats/${chatId}.json`,
          sidecar,
          uid === undefined ? {} : { userId: uid },
        );
        log.info(`MESSAGE_DELETED: cleared sidecar entry chat=${chatId} msg=${msgId}`);
      }
    } catch (err) {
      log.warn(`MESSAGE_DELETED: sidecar cleanup failed chat=${chatId}: ${errMsg(err)}`);
    }
  }
  const active = await ensureActiveCardForChat(chatId, null);
  if (!active) return;
  // No output/display bindings: Risu has no binding-firing analogue for deletes.
  await refreshResolvedContent(active, chatId);
  await refreshBgHtml(active, chatId);
  await refreshVariables(active, chatId);
});

spindle.on('CHAT_DELETED', async (raw, userId) => {
  captureUserId(userId, 'CHAT_DELETED');
  const p = raw as { id?: string; chatId?: string };
  const chatId = p.chatId ?? p.id ?? null;
  log.info(`event CHAT_DELETED chatId=${chatId ?? '?'}`);
  if (!chatId) return;
  activeCardByChat.delete(chatId);
  clearActiveAssetIndexes(chatId);
  clearActiveCharacterImage(chatId);
  clearActiveScriptstateDefaults(chatId);
  clearVarOverlay(chatId);
  variableState.clearChat(chatId);
  toggleState.clearChat(chatId);
  try {
    await clearSidecar(userStorage(), chatId, getUserId());
  } catch (err) {
    log.warn(`CHAT_DELETED: clearSidecar failed chat=${chatId}: ${errMsg(err)}`);
  }
});

spindle.on('CHARACTER_DELETED', async (raw, uid) => {
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
  await deleteCardByChar(characterId, 'cascade');

  if (uid) {
    await runImageCleanupForCharacter(characterId, uid).catch((err) => {
      log.warn(`CHARACTER_DELETED: image cleanup threw char=${characterId}: ${errMsg(err)}`);
    });
  }

  send({
    type: 'cleanup_character_artifacts',
    characterId,
    worldBookIds: cachedWorldBookIds,
  });
});

// CHARACTER_CREATED: refresh drawer. Covers duplication and external imports.
spindle.on('CHARACTER_CREATED', async (raw, userId) => {
  captureUserId(userId, 'CHARACTER_CREATED');
  const characterId =
    (raw as { id?: string }).id
    ?? extractIds(raw).characterId
    ?? null;
  log.info(`event CHARACTER_CREATED characterId=${characterId ?? '?'}`);
  try {
    pushCards(await listCards());
  } catch (err) {
    log.warn(`CHARACTER_CREATED: pushCards failed — ${errMsg(err)}`);
  }
});

// CHARACTER_EDITED: own writes are tracked via expectCharacterEdit() and skipped.
// External writes invalidate caches and refresh the drawer.
spindle.on('CHARACTER_EDITED', async (raw, userId) => {
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
  invalidateActiveForCharacter(characterId);
  try {
    pushCards(await listCards());
  } catch (err) {
    log.warn(`CHARACTER_EDITED: pushCards failed — ${errMsg(err)}`);
  }
});

// CHARACTER_DUPLICATED: Lumi currently emits CHARACTER_CREATED for duplicates.
// This subscription is defensive in case Lumi adds a distinct event later.
spindle.on('CHARACTER_DUPLICATED', async (raw, userId) => {
  captureUserId(userId, 'CHARACTER_DUPLICATED');
  const characterId =
    (raw as { id?: string }).id
    ?? extractIds(raw).characterId
    ?? null;
  log.info(`event CHARACTER_DUPLICATED characterId=${characterId ?? '?'} (Lumi 0.4.31+ emits CHARACTER_CREATED instead; this handler is defensive)`);
  try {
    pushCards(await listCards());
  } catch (err) {
    log.warn(`CHARACTER_DUPLICATED: pushCards failed — ${errMsg(err)}`);
  }
});

import { decodeRisum } from './core/risum/index.js';
import { risuModuleSchema } from './core/schemas/module.js';
import { guessMimeType } from './payload/import.js';
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
import {
  projectModuleLorebookEntries,
  projectModuleRegexEntries,
} from './state/module-artifact-project.js';
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

interface ModuleUploadSession {
  readonly fileName: string;
  readonly totalBytes: number;
  readonly totalChunks: number;
  readonly buffer: (Uint8Array | null)[];
  receivedBytes: number;
  receivedChunks: number;
  startedAt: number;
  lastActivity: number;
}
const moduleUploadSessions = new Map<string, ModuleUploadSession>();

function moduleStorage(): import('./state/modules-store.js').UserStorageLike {
  return spindle.userStorage as unknown as import('./state/modules-store.js').UserStorageLike;
}

async function processModuleUpload(
  bytes: Uint8Array,
  fileName: string,
  userId: string,
): Promise<{ envelope: ModuleEnvelope }> {
  const t0 = Date.now();
  log.info(
    `processModuleUpload: file=${fileName} bytes=${bytes.byteLength} userId=${userId}`,
  );
  const decoded = decodeRisum(bytes);
  const parsed = risuModuleSchema.safeParse(decoded.module);
  if (!parsed.success) {
    throw new Error(
      `decoded module failed schema validation — ${parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    );
  }
  const moduleBody = parsed.data;
  if (typeof moduleBody.id !== 'string' || moduleBody.id.length === 0) {
    throw new Error('module is missing an `id` — cannot store');
  }
  const previousEnvelope = await readModuleEnvelope(moduleStorage(), userId, moduleBody.id);

  // Risu modules.ts: prompt consent for lowLevelAccess modules.
  if (moduleBody.lowLevelAccess === true) {
    log.info(
      `processModuleUpload: lowLevelAccess=true for module=${moduleBody.id} ` +
        `name="${moduleBody.name ?? '<unnamed>'}" — prompting consent`,
    );
    let confirmed = false;
    try {
      const res = await requestConsent({
        title: `Module "${moduleBody.name ?? moduleBody.id}" requests low-level access`,
        message:
          `This module declares low-level access: its triggers can call runLLM, ` +
          `runImgGen, request, and other privileged APIs that consume tokens, ` +
          `hit external services, and read your chat state.\n\n` +
          `Only accept if you trust the source of this module.\n\n` +
          `Decline to refuse the upload — the module will not be added to your library.`,
        confirmLabel: 'Grant access',
        cancelLabel: 'Decline',
      });
      confirmed = !!res?.confirmed;
    } catch (err) {
      log.warn(
        `processModuleUpload: consent prompt threw: ${(err as Error).message} — treating as decline`,
      );
      confirmed = false;
    }
    if (!confirmed) {
      log.info(`processModuleUpload: consent declined for module=${moduleBody.id} — aborting upload`);
      throw new Error(
        `Module "${moduleBody.name ?? moduleBody.id}" requires low-level access; consent declined.`,
      );
    }
    log.info(`processModuleUpload: low-level access consent granted for module=${moduleBody.id}`);
  }

  if (!spindle.images?.upload) {
    throw new Error(
      'spindle.images.upload is unavailable — Lumi 0.9.6+ required.',
    );
  }
  const spindleImagesApi = spindle.images;

  const moduleAssetIndex: Record<string, { imageId: string; ext?: string }> = {};
  let assetUploadFailures = 0;
  if (decoded.assets.length > 0) {
    const moduleAssets = (moduleBody.assets ?? []) as readonly (readonly [string, string, string])[];
    const pending = pairModuleAssetsForUpload(
      moduleAssets,
      decoded.assets,
      () => '',
      guessMimeType,
    );
    if (pending.length < decoded.assets.length) {
      log.warn(
        `processModuleUpload: ${decoded.assets.length - pending.length} asset(s) ` +
          `couldn't be paired with a module.assets[] name — dropped. ` +
          `(decoded.assets index out of bounds vs module.assets list.)`,
      );
    }

    log.info(
      `processModuleUpload: uploading ${pending.length} asset(s) via spindle.images.upload ` +
        `(module=${moduleBody.id})`,
    );
    const tUpload = Date.now();
    const uploadConcurrency = 6;
    const totalCount = pending.length;
    const progressEvery = Math.max(1, Math.min(25, Math.floor(totalCount / 20) || 1));
    const PROGRESS_BASE = 0.35;
    const PROGRESS_END = 0.92;
    let processed = 0;
    let nextIndex = 0;
    const moduleNameForProgress = typeof moduleBody.name === 'string' && moduleBody.name.length > 0
      ? moduleBody.name
      : moduleBody.id;
    const journalBuffer: string[] = [];
    let journalChain: Promise<void> = Promise.resolve();
    const flushModuleJournal = (): void => {
      if (journalBuffer.length === 0) return;
      const ids = journalBuffer.splice(0);
      journalChain = journalChain.then(async () => {
        try {
          await appendModuleImageIdsToJournal(journalStorage(), userId, moduleBody.id, ids);
        } catch (err) {
          journalBuffer.unshift(...ids);
          log.warn(`processModuleUpload: journal flush failed module=${moduleBody.id}: ${errMsg(err)}`);
        }
      });
    };
    const uploadWorker = async (): Promise<void> => {
      while (true) {
        const i = nextIndex++;
        if (i >= pending.length) break;
        const meta = pending[i];
        const bytes = decoded.assets[i];
        if (!meta || !bytes) continue;
        const fileName = meta.path;
        try {
          const result = await spindleImagesApi.upload(
            { data: bytes, mime_type: meta.mimeType, filename: fileName },
            userId,
          );
          if (typeof result?.id !== 'string' || result.id.length === 0) {
            throw new Error('upload returned without an image id');
          }
          const lastDot = fileName.lastIndexOf('.');
          const ext = lastDot > 0 ? fileName.slice(lastDot + 1).toLowerCase() : undefined;
          moduleAssetIndex[fileName] = ext !== undefined
            ? { imageId: result.id, ext }
            : { imageId: result.id };
          journalBuffer.push(result.id);
        } catch (err) {
          assetUploadFailures += 1;
          const errMessage = err instanceof Error ? err.message : String(err);
          log.warn(`processModuleUpload: upload failed name=${fileName}: ${errMessage}`);
        }
        processed += 1;
        if (processed % progressEvery === 0 || processed === totalCount) {
          flushModuleJournal();
          const frac = totalCount === 0
            ? PROGRESS_END
            : PROGRESS_BASE + (PROGRESS_END - PROGRESS_BASE) * (processed / totalCount);
          send({
            type: 'import_progress',
            phase: 'uploading_assets',
            message: `Uploading module assets for ${moduleNameForProgress} (${processed}/${totalCount})…`,
            fraction: frac,
          });
        }
      }
    };
    if (pending.length > 0) {
      const workers: Promise<void>[] = [];
      for (let w = 0; w < Math.min(uploadConcurrency, pending.length); w++) {
        workers.push(uploadWorker());
      }
      await Promise.all(workers);
    }
    flushModuleJournal();
    await journalChain;
    log.info(
      `processModuleUpload: uploaded ${Object.keys(moduleAssetIndex).length}/${pending.length} ` +
        `failed=${assetUploadFailures} elapsed=${Date.now() - tUpload}ms`,
    );
  }

  const baseEnvelope: ModuleEnvelope = {
    schema_version: MODULE_SCHEMA_VERSION,
    id: moduleBody.id,
    filename: fileName,
    uploaded_at: Date.now(),
    module: moduleBody,
    asset_index: moduleAssetIndex,
    ...(previousEnvelope?.installed_world_book_id
      ? { installed_world_book_id: previousEnvelope.installed_world_book_id }
      : {}),
  };
  const wbId = await syncModuleWorldBook(baseEnvelope, userId).catch((err) => {
    log.warn(`processModuleUpload: syncModuleWorldBook failed module=${moduleBody.id}: ${errMsg(err)}`);
    return previousEnvelope?.installed_world_book_id ?? null;
  });
  const envelope: ModuleEnvelope = {
    schema_version: baseEnvelope.schema_version,
    id: baseEnvelope.id,
    filename: baseEnvelope.filename,
    uploaded_at: baseEnvelope.uploaded_at,
    module: baseEnvelope.module,
    asset_index: baseEnvelope.asset_index,
    ...(wbId ? { installed_world_book_id: wbId } : {}),
  };
  await writeModuleEnvelope(moduleStorage(), userId, envelope);
  log.info(
    `processModuleUpload: ok id=${envelope.id} name=${moduleBody.name} ` +
      `lore=${(moduleBody.lorebook ?? []).length} ` +
      `regex=${(moduleBody.regex ?? []).length} ` +
      `triggers=${(moduleBody.trigger ?? []).length} ` +
      `assets=${decoded.assets.length} ` +
      `assetUploadFailures=${assetUploadFailures} ` +
      `wb=${envelope.installed_world_book_id ?? '-'} ` +
      `elapsed=${Date.now() - t0}ms`,
  );
  return { envelope };
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
        list.push({ id: sum.id, name: sum.name });
      } else {
        // Module was deleted from the library while still referenced.
        // Surface so the user can see + clean up.
        list.push({ id, name: '(missing — module deleted from library)' });
      }
    }
    out[e.character.id] = list;
  }
  return out;
}

async function pushModules(userId: string): Promise<void> {
  const indexEntries = await listModuleStore(moduleStorage(), userId);
  const wire: ModuleSummary[] = indexEntries.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    filename: e.filename,
    uploaded_at: e.uploaded_at,
    lorebook_count: e.lorebook_count,
    regex_count: e.regex_count,
    trigger_count: e.trigger_count,
    asset_count: e.asset_count,
    low_level_access: e.low_level_access,
    has_cjs: e.has_cjs,
  }));
  const byId = new Map(wire.map((w) => [w.id, w]));
  const attached = await buildAttachedByCharacter(userId, byId);
  send({ type: 'modules_pushed', modules: wire, attached_by_character: attached });
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
    });
    return;
  }
  const ids = fetched.data.user_overrides.attached_module_ids ?? [];
  const indexEntries = await listModuleStore(moduleStorage(), userId);
  const byId = new Map(indexEntries.map((e) => [e.id, e]));
  const list: AttachedModuleSummary[] = ids.map((id) => {
    const e = byId.get(id);
    return e ? { id, name: e.name } : { id, name: '(missing — module deleted from library)' };
  });
  send({ type: 'attached_modules_pushed', characterId, attached: list });
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
    const nextWb = { ...(cur.user_overrides.attached_module_world_books ?? {}) };
    if (env.installed_world_book_id) nextWb[moduleId] = env.installed_world_book_id;
    return {
      ...cur,
      user_overrides: {
        ...cur.user_overrides,
        attached_module_ids: [...ids, moduleId],
        ...(Object.keys(nextWb).length > 0
          ? { attached_module_world_books: nextWb }
          : {}),
      },
    };
  });
  if (!updated) return { ok: false, reason: 'character is not a lumirealm card' };
  if (env.installed_world_book_id) {
    await addWorldBookToCharacter(characterId, env.installed_world_book_id, userId).catch((err) => {
      log.warn(`attachModuleToCharacter: addWorldBookToCharacter failed char=${characterId} module=${moduleId}: ${errMsg(err)}`);
    });
  }
  invalidateActiveForCharacter(characterId);
  await dispatchModuleArtifactInstall(characterId, env);
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
    const nextWb = { ...(cur.user_overrides.attached_module_world_books ?? {}) };
    delete nextWb[moduleId];
    const nextRx = { ...(cur.user_overrides.attached_module_regex_script_ids ?? {}) };
    delete nextRx[moduleId];
    return {
      ...cur,
      user_overrides: {
        ...cur.user_overrides,
        attached_module_ids: ids.filter((id) => id !== moduleId),
        ...(Object.keys(nextWb).length > 0
          ? { attached_module_world_books: nextWb }
          : {}),
        ...(Object.keys(nextRx).length > 0
          ? { attached_module_regex_script_ids: nextRx }
          : {}),
      },
    };
  });
  if (!updated) return { ok: false, reason: 'character is not a lumirealm card' };
  invalidateActiveForCharacter(characterId);
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
    send({ type: 'uninstall_module_artifacts', characterId, moduleId, worldBookId: null, regexScriptIds: regexIds });
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
    log.info(`refreshRisuAssetMap: char=${characterId} entries=${Object.keys(map).length}`);
  } catch (err) {
    log.warn(`refreshRisuAssetMap: char=${characterId} update failed: ${errMsg(err)}`);
  }
}

function buildModuleWorldBookEntryInput(raw: unknown, moduleId: string): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const eo = raw as Record<string, unknown>;
  const keyRaw = eo['key'];
  const key = Array.isArray(keyRaw)
    ? keyRaw.filter((x): x is string => typeof x === 'string')
    : typeof keyRaw === 'string' ? [keyRaw] : [];
  const content = typeof eo['content'] === 'string' ? eo['content'] : '';
  if (key.length === 0 && content.length === 0) return null;
  const input: Record<string, unknown> = {
    key,
    content,
    metadata: { _risu: { module_id: moduleId } },
  };
  if (typeof eo['comment'] === 'string') input['comment'] = eo['comment'];
  if (typeof eo['constant'] === 'boolean') input['constant'] = eo['constant'];
  if (typeof eo['disabled'] === 'boolean') input['disabled'] = eo['disabled'];
  if (typeof eo['position'] === 'string') input['position'] = eo['position'];
  if (typeof eo['priority'] === 'number') input['priority'] = eo['priority'];
  if (typeof eo['order'] === 'number') input['order_value'] = eo['order'];
  if (Array.isArray(eo['secondary_keys'])) {
    input['keysecondary'] = eo['secondary_keys'].filter((x): x is string => typeof x === 'string');
  }
  if (typeof eo['selective'] === 'boolean') input['selective'] = eo['selective'];
  return input;
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
      for (const raw of lorebook) {
        const input = buildModuleWorldBookEntryInput(raw, env.id);
        if (input) await spindle.world_books.entries.create(existingId, input as never, userId);
      }
      log.info(`syncModuleWorldBook: refreshed module=${env.id} wb=${existingId} entries=${lorebook.length}`);
      return existingId;
    } catch (err) {
      log.warn(`syncModuleWorldBook: refresh failed module=${env.id} wb=${existingId}: ${errMsg(err)} — recreating`);
      await deleteModuleWorldBookEverywhere(env.id, existingId, userId);
    }
  }
  const wb = await spindle.world_books.create({ name: `Module: ${moduleName}` }, userId);
  for (const raw of lorebook) {
    const input = buildModuleWorldBookEntryInput(raw, env.id);
    if (input) await spindle.world_books.entries.create(wb.id, input as never, userId);
  }
  log.info(`syncModuleWorldBook: created module=${env.id} wb=${wb.id} entries=${lorebook.length}`);
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
  });
}

function cryptoUuidLocal(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `mod-rx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function invalidateActiveForCharacter(characterId: string): void {
  let evicted = 0;
  const evictedChats: string[] = [];
  for (const [chatId, active] of activeCardByChat) {
    if (active.card.character_id === characterId) {
      activeCardByChat.delete(chatId);
      clearActiveAssetIndexes(chatId);
      clearActiveCharacterImage(chatId);
      variableState.clearChat(chatId);
      toggleState.clearChat(chatId);
      evictedChats.push(chatId);
      evicted += 1;
    }
  }
  compiledByCharacter.delete(characterId);
  log.info(`invalidateActiveForCharacter: char=${characterId} evictedChats=${evicted}`);
  for (const chatId of evictedChats) {
    void (async () => {
      const reactivated = await ensureActiveCardForChat(chatId, null);
      if (reactivated) {
        await refreshToggleDefinitions(reactivated, chatId, { force: true });
        await refreshBgHtml(reactivated, chatId);
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

async function refreshAttachedModule(
  characterId: string,
  env: ModuleEnvelope,
  userId: string,
): Promise<void> {
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  if (!fetched || !fetched.data) return;
  const wbId = fetched.data.user_overrides.attached_module_world_books?.[env.id] ?? null;
  const regexIds =
    fetched.data.user_overrides.attached_module_regex_script_ids?.[env.id] ?? [];
  await updateLumirealm(charactersApi(), characterId, userId, (cur) => {
    const wb = { ...(cur.user_overrides.attached_module_world_books ?? {}) };
    delete wb[env.id];
    const rx = { ...(cur.user_overrides.attached_module_regex_script_ids ?? {}) };
    delete rx[env.id];
    return {
      ...cur,
      user_overrides: {
        ...cur.user_overrides,
        ...(Object.keys(wb).length > 0 ? { attached_module_world_books: wb } : {}),
        ...(Object.keys(rx).length > 0 ? { attached_module_regex_script_ids: rx } : {}),
      },
    };
  });
  if (wbId || regexIds.length > 0) {
    send({
      type: 'uninstall_module_artifacts',
      characterId,
      moduleId: env.id,
      worldBookId: wbId,
      regexScriptIds: regexIds,
    });
  }
  await dispatchModuleArtifactInstall(characterId, env);
  invalidateActiveForCharacter(characterId);
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
    await updateLumirealm(charactersApi(), e.character.id, userId, (cur) => {
      const wb = { ...(cur.user_overrides.attached_module_world_books ?? {}) };
      delete wb[moduleId];
      const rx = { ...(cur.user_overrides.attached_module_regex_script_ids ?? {}) };
      delete rx[moduleId];
      return {
        ...cur,
        user_overrides: {
          ...cur.user_overrides,
          attached_module_ids: (cur.user_overrides.attached_module_ids ?? []).filter(
            (id) => id !== moduleId,
          ),
          ...(Object.keys(wb).length > 0
            ? { attached_module_world_books: wb }
            : {}),
          ...(Object.keys(rx).length > 0
            ? { attached_module_regex_script_ids: rx }
            : {}),
        },
      };
    });
    invalidateActiveForCharacter(e.character.id);
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
      });
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
          else log.warn(`add_assets (character ${characterId}): "${e.assetName}" skipped — ${r.reason}`);
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
          `mutateAssetIndex (character ${characterId}): ${msg.type} failed — ${result.reason}`,
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
      else log.warn(`add_assets (module ${moduleId}): "${e.assetName}" skipped — ${r.reason}`);
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

async function assembleCharacterViewerData(
  characterId: string,
  userId: string,
): Promise<import('./types/messages.js').ViewerData | null> {
  const fetched = await readLumirealm(charactersApi(), characterId, userId);
  if (!fetched || !fetched.data) return null;
  const fetchWarnings: string[] = [];
  return buildCharacterViewerData({
    characterId,
    characterName: fetched.character.name,
    data: fetched.data,
    fetchWarnings,
  });
}

async function assembleModuleViewerData(
  moduleId: string,
  userId: string,
): Promise<import('./types/messages.js').ViewerData | null> {
  const env = await readModuleEnvelope(moduleStorage(), userId, moduleId);
  if (!env) return null;
  return buildModuleViewerData({ envelope: env });
}

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
        `readAttachedModuleEnvelopes: namespace match — handle="${ns}" → module id=${env.id} ` +
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
        `readAttachedModuleEnvelopes: handle "${h}" did not resolve via id or namespace — skipping`,
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
  send: (msg: RealmBackendToFrontend) => send(msg),
  log: {
    info: (m: string) => log.info(m),
    warn: (m: string) => log.warn(m),
    error: (m: string) => log.error(m),
  },
  importCardFromBytes: (bytesB64: string, fileName: string) =>
    importCardFromBytes(bytesB64, fileName),
});

spindle.onFrontendMessage(async (raw, userId) => {
  activeUserId = userId;
  const msg = raw as FrontendToBackend;
  log.info(`frontend msg type=${msg.type} userId=${userId ?? '<none>'}`);
  try {
    if (isRealmFrontendMessage(msg)) {
      await realmHandle.handle(msg);
      return;
    }
    switch (msg.type) {
      case 'get_cards': {
        pushCards(await listCards());
        const lastChat = userId ? lastActiveChatByUser.get(userId) : undefined;
        if (lastChat) {
          log.info(`get_cards: re-painting bg+scope-css for lastChat=${lastChat} userId=${userId}`);
          try {
            const active = await ensureActiveCardForChat(lastChat, null);
            if (active) {
              await refreshBgHtml(active, lastChat);
              await refreshResolvedContent(active, lastChat);
              await refreshVariables(active, lastChat, { force: true });
            }
          } catch (err) {
            log.warn(`get_cards: rehydrate failed chat=${lastChat}: ${errMsg(err)}`);
          }
        }
        break;
      }
      case 'import_card_init': {
        log.info(
          `import_card_init: sessionId=${msg.sessionId} file=${msg.fileName} ` +
            `totalBytes=${msg.totalBytes} totalChunks=${msg.totalChunks}`,
        );
        if (importSessions.has(msg.sessionId)) {
          log.warn(`import_card_init: replacing existing session ${msg.sessionId}`);
        }
        importSessions.set(msg.sessionId, {
          fileName: msg.fileName,
          totalBytes: msg.totalBytes,
          totalChunks: msg.totalChunks,
          buffer: new Array(msg.totalChunks).fill(null),
          receivedBytes: 0,
          receivedChunks: 0,
          startedAt: Date.now(),
          lastActivity: Date.now(),
        });
        send({ type: 'import_upload_ack', sessionId: msg.sessionId, seq: -1, receivedBytes: 0 });
        break;
      }
      case 'import_card_chunk': {
        const session = importSessions.get(msg.sessionId);
        if (!session) {
          log.warn(`import_card_chunk: unknown sessionId=${msg.sessionId} seq=${msg.seq} — dropping`);
          send({ type: 'error', message: `Unknown upload session ${msg.sessionId}. Re-import the card.` });
          break;
        }
        if (msg.seq < 0 || msg.seq >= session.totalChunks) {
          log.warn(`import_card_chunk: seq=${msg.seq} out of range (total=${session.totalChunks})`);
          break;
        }
        if (session.buffer[msg.seq] !== null) {
          log.warn(`import_card_chunk: duplicate seq=${msg.seq} on session ${msg.sessionId} — overwriting`);
        }
        const chunkBytes = new Uint8Array(Buffer.from(msg.bytesB64Chunk, 'base64'));
        session.buffer[msg.seq] = chunkBytes;
        session.receivedBytes += chunkBytes.byteLength;
        session.receivedChunks += 1;
        session.lastActivity = Date.now();
        send({
          type: 'import_upload_ack',
          sessionId: msg.sessionId,
          seq: msg.seq,
          receivedBytes: session.receivedBytes,
        });
        break;
      }
      case 'import_card_commit': {
        const session = importSessions.get(msg.sessionId);
        if (!session) {
          log.warn(`import_card_commit: unknown sessionId=${msg.sessionId}`);
          send({ type: 'error', message: `Unknown upload session ${msg.sessionId}. Re-import the card.` });
          break;
        }
        log.info(
          `import_card_commit: sessionId=${msg.sessionId} received=${session.receivedChunks}/${session.totalChunks} ` +
            `bytes=${session.receivedBytes}/${session.totalBytes} elapsed=${Date.now() - session.startedAt}ms`,
        );
        if (session.receivedChunks !== session.totalChunks) {
          const missing: number[] = [];
          for (let i = 0; i < session.totalChunks; i++) {
            if (session.buffer[i] === null) missing.push(i);
          }
          importSessions.delete(msg.sessionId);
          const missingList = missing.length > 12 ? `${missing.slice(0, 12).join(',')}…(+${missing.length - 12})` : missing.join(',');
          log.error(`import_card_commit: missing chunks=[${missingList}] — aborting`);
          send({
            type: 'import_progress',
            phase: 'error',
            message: `Upload incomplete: ${missing.length} of ${session.totalChunks} chunks missing`,
            fraction: null,
            error: `Missing chunks: ${missingList}`,
          });
          break;
        }
        if (session.receivedBytes !== session.totalBytes) {
          log.warn(`import_card_commit: byte count mismatch received=${session.receivedBytes} expected=${session.totalBytes} — proceeding anyway`);
        }
        const assembled = new Uint8Array(session.receivedBytes);
        let offset = 0;
        for (const chunk of session.buffer) {
          if (!chunk) continue;
          assembled.set(chunk, offset);
          offset += chunk.byteLength;
        }
        const fileName = session.fileName;
        importSessions.delete(msg.sessionId);
        send({ type: 'import_upload_ack', sessionId: msg.sessionId, seq: -2, receivedBytes: session.receivedBytes });
        log.info(`import_card_commit: assembled ${assembled.byteLength} bytes, running importCard`);
        const bytesB64 = Buffer.from(assembled).toString('base64');
        await realmHandle.importAnyFormat(bytesB64, fileName);
        break;
      }
      case 'import_card_abort': {
        const existed = importSessions.delete(msg.sessionId);
        log.info(`import_card_abort: sessionId=${msg.sessionId} existed=${existed} reason=${msg.reason ?? '<none>'}`);
        break;
      }
      case 'register_svg_raster_index': {
        if (!userId) {
          send({ type: 'error', message: 'register_svg_raster_index: no userId' });
          break;
        }
        const total = Object.keys(msg.imageIdByMarker).length;
        const successful = Object.values(msg.imageIdByMarker).filter(
          (v) => typeof v === 'string' && v.length > 0,
        ).length;
        const failed = total - successful;
        log.info(
          `register_svg_raster_index: char=${msg.characterId} total=${total} successful=${successful} failed=${failed}`,
        );
        await applySvgRasterIndex({
          characterId: msg.characterId,
          imageIdByMarker: msg.imageIdByMarker,
          userId,
        });
        const pendingForSvg = pendingImportCompletions.get(msg.characterId);
        if (pendingForSvg) {
          pendingForSvg.hasPendingSvgRaster = false;
          log.info(
            `register_svg_raster_index: cleared svg-pending flag char=${msg.characterId}`,
          );
          await maybeFinalizeImport(msg.characterId);
        } else {
          log.info(
            `register_svg_raster_index: no tracker entry for char=${msg.characterId} — direct push`,
          );
          pushCards(await listCards());
        }
        break;
      }
      case 'delete_card': {
        await deleteCardByChar(msg.characterId, 'soft');
        break;
      }
      case 'consent_response': {
        const resolver = pendingConsents.get(msg.requestId);
        if (resolver) {
          pendingConsents.delete(msg.requestId);
          log.info(`consent_response: requestId=${msg.requestId} confirmed=${msg.confirmed}`);
          resolver(msg.confirmed);
        } else {
          log.warn(`consent_response: no pending request for requestId=${msg.requestId}`);
        }
        break;
      }
      case 'manual_trigger': {
        log.info(`manual_trigger: triggerName=${msg.triggerName} triggerId=${msg.triggerId ?? '<none>'} chatId=${msg.chatId}`);
        await dispatchManualTrigger(msg.chatId, msg.triggerName, msg.triggerId);
        break;
      }
      case 'set_variable': {
        if (msg.scope !== 'local') {
          send({ type: 'error', message: `Only local scope is editable from the Variables tab (got: ${msg.scope})` });
          break;
        }
        const result = await writeLocalVariable(msg.chatId, msg.key, msg.value);
        if (!result.ok) {
          send({ type: 'error', message: `Set ${msg.key}: ${result.reason ?? 'failed'}` });
        }
        break;
      }
      case 'delete_variable': {
        if (msg.scope !== 'local') {
          send({ type: 'error', message: `Only local scope is editable from the Variables tab (got: ${msg.scope})` });
          break;
        }
        const result = await writeLocalVariable(msg.chatId, msg.key, null);
        if (!result.ok) {
          send({ type: 'error', message: `Delete ${msg.key}: ${result.reason ?? 'failed'}` });
        }
        break;
      }
      case 'request_settings': {
        if (!userId) {
          send({ type: 'error', message: 'request_settings: no userId' });
          break;
        }
        const settings = await getSettingsForUser(userId);
        send({
          type: 'settings_pushed',
          settings: {
            schema_version: 1,
            auxConnectionId: settings.auxConnectionId,
            auxModelOverride: settings.auxModelOverride,
            auxSamplers: settings.auxSamplers,
            submodelConnectionId: settings.submodelConnectionId,
            submodelModelOverride: settings.submodelModelOverride,
            submodelSamplers: settings.submodelSamplers,
            auxDebugCaptureRequest: settings.auxDebugCaptureRequest,
            auxDebugCaptureResponse: settings.auxDebugCaptureResponse,
            legacyMediaFindings: settings.legacyMediaFindings,
          },
        });
        break;
      }
      case 'update_settings': {
        if (!userId) {
          send({ type: 'error', message: 'update_settings: no userId' });
          break;
        }
        const patch = normalizeSettingsPatch(msg.patch);
        const merged = await applySettingsPatch(userId, patch);
        send({
          type: 'settings_pushed',
          settings: {
            schema_version: 1,
            auxConnectionId: merged.auxConnectionId,
            auxModelOverride: merged.auxModelOverride,
            auxSamplers: merged.auxSamplers,
            submodelConnectionId: merged.submodelConnectionId,
            submodelModelOverride: merged.submodelModelOverride,
            submodelSamplers: merged.submodelSamplers,
            auxDebugCaptureRequest: merged.auxDebugCaptureRequest,
            auxDebugCaptureResponse: merged.auxDebugCaptureResponse,
            legacyMediaFindings: merged.legacyMediaFindings,
          },
        });
        break;
      }
      case 'request_connections_list': {
        if (!userId) {
          send({ type: 'error', message: 'request_connections_list: no userId' });
          break;
        }
        const connections = await listConnectionsForUser(userId);
        log.info(`request_connections_list: returning ${connections.length} connection(s) for user=${userId}`);
        send({
          type: 'connections_list_pushed',
          connections,
        });
        break;
      }
      case 'request_variables_snapshot': {
        const active = await ensureActiveCardForChat(msg.chatId, null);
        if (active) {
          await refreshVariables(active, msg.chatId, { force: true });
        } else {
          send({
            type: 'set_variables',
            chatId: msg.chatId,
            seq: 1,
            scopes: { local: {}, global: {}, chat: {} },
            defaults: {},
            ts: Date.now(),
          });
        }
        break;
      }
      case 'request_toggle_definitions': {
        const active = await ensureActiveCardForChat(msg.chatId, null);
        if (active) {
          await refreshToggleDefinitions(active, msg.chatId, { force: true });
        } else {
          send({
            type: 'set_toggle_definitions',
            chatId: msg.chatId,
            seq: 1,
            toggles: [],
            attribution: {},
            ts: Date.now(),
          });
        }
        break;
      }
      case 'set_toggle': {
        const result = await writeToggleValue(msg.chatId, msg.key, msg.value);
        if (!result.ok) {
          log.warn(`set_toggle failed: ${result.reason ?? 'unknown'}`);
          send({ type: 'error', message: `set toggle failed: ${result.reason ?? 'unknown'}` });
        }
        break;
      }
      case 'upload_module_init': {
        if (!userId) {
          send({ type: 'error', message: 'upload_module_init: no userId' });
          break;
        }
        log.info(
          `upload_module_init: sessionId=${msg.sessionId} file=${msg.fileName} ` +
            `totalBytes=${msg.totalBytes} totalChunks=${msg.totalChunks}`,
        );
        moduleUploadSessions.set(msg.sessionId, {
          fileName: msg.fileName,
          totalBytes: msg.totalBytes,
          totalChunks: msg.totalChunks,
          buffer: new Array(msg.totalChunks).fill(null),
          receivedBytes: 0,
          receivedChunks: 0,
          startedAt: Date.now(),
          lastActivity: Date.now(),
        });
        send({
          type: 'module_upload_ack',
          sessionId: msg.sessionId,
          seq: -1,
          receivedBytes: 0,
        });
        break;
      }
      case 'upload_module_chunk': {
        const session = moduleUploadSessions.get(msg.sessionId);
        if (!session) {
          send({ type: 'error', message: `upload_module_chunk: unknown sessionId ${msg.sessionId}` });
          break;
        }
        if (msg.seq < 0 || msg.seq >= session.totalChunks) break;
        const chunkBytes = new Uint8Array(Buffer.from(msg.bytesB64Chunk, 'base64'));
        if (session.buffer[msg.seq] === null) {
          session.receivedChunks += 1;
        }
        session.buffer[msg.seq] = chunkBytes;
        session.receivedBytes += chunkBytes.byteLength;
        session.lastActivity = Date.now();
        send({
          type: 'module_upload_ack',
          sessionId: msg.sessionId,
          seq: msg.seq,
          receivedBytes: session.receivedBytes,
        });
        break;
      }
      case 'upload_module_commit': {
        const session = moduleUploadSessions.get(msg.sessionId);
        if (!session) {
          send({ type: 'error', message: `upload_module_commit: unknown sessionId ${msg.sessionId}` });
          break;
        }
        if (!userId) {
          send({ type: 'error', message: 'upload_module_commit: no userId' });
          break;
        }
        if (session.receivedChunks !== session.totalChunks) {
          const missing = [];
          for (let i = 0; i < session.totalChunks; i++) {
            if (session.buffer[i] === null) missing.push(i);
          }
          send({
            type: 'error',
            message: `upload_module_commit: missing ${missing.length} chunk(s) [${missing.slice(0, 5).join(',')}…]`,
          });
          moduleUploadSessions.delete(msg.sessionId);
          break;
        }
        // Concatenate. Use Buffer.concat (Node-compatible in Bun) to
        // avoid manually computing offsets.
        const totalBytes = session.receivedBytes;
        const buffers: Uint8Array[] = [];
        for (let i = 0; i < session.totalChunks; i++) {
          const c = session.buffer[i]!;
          buffers.push(c);
        }
        const combined = new Uint8Array(totalBytes);
        let offset = 0;
        for (const b of buffers) {
          combined.set(b, offset);
          offset += b.byteLength;
        }
        const fileName = session.fileName;
        moduleUploadSessions.delete(msg.sessionId);
        send({
          type: 'module_upload_ack',
          sessionId: msg.sessionId,
          seq: -2,
          receivedBytes: session.receivedBytes,
        });
        send({
          type: 'import_progress',
          phase: 'translating',
          message: `Translating ${fileName}…`,
          fraction: 0.3,
        });
        try {
          const { envelope: env } = await processModuleUpload(
            combined,
            fileName,
            userId,
          );
          const moduleName = typeof env.module.name === 'string' && env.module.name.length > 0
            ? env.module.name
            : env.id;
          send({
            type: 'import_progress',
            phase: 'saving_payload',
            message: `Saved ${moduleName}`,
            fraction: 0.95,
          });
          const attachedBefore = await charactersAttachedTo(env.id, userId);
          await pushModules(userId);
          if (attachedBefore.length > 0) {
            log.info(
              `upload_module_commit: auto-refreshing ${attachedBefore.length} character(s) ` +
                `attached to module ${env.id}`,
            );
            for (const charId of attachedBefore) {
              await refreshAttachedModule(charId, env, userId);
            }
          }
          send({
            type: 'import_progress',
            phase: 'done',
            message: `Imported ${moduleName}`,
            fraction: 1,
          });
        } catch (err) {
          send({
            type: 'import_progress',
            phase: 'error',
            message: 'Module upload failed',
            fraction: null,
            error: errMsg(err),
          });
          send({
            type: 'error',
            message: `Module decode/save failed: ${errMsg(err)}`,
          });
        }
        break;
      }
      case 'upload_module_abort': {
        const existed = moduleUploadSessions.delete(msg.sessionId);
        log.info(
          `upload_module_abort: sessionId=${msg.sessionId} existed=${existed} reason=${msg.reason ?? '<none>'}`,
        );
        break;
      }
      case 'request_modules': {
        if (!userId) {
          send({ type: 'error', message: 'request_modules: no userId' });
          break;
        }
        await pushModules(userId);
        break;
      }
      case 'delete_module': {
        if (!userId) {
          send({ type: 'error', message: 'delete_module: no userId' });
          break;
        }
        const envelopeForDelete = await readModuleEnvelope(moduleStorage(), userId, msg.moduleId);
        const sharedWbId = envelopeForDelete?.installed_world_book_id ?? null;
        const touched = await detachModuleFromAllCharacters(msg.moduleId, userId);
        if (sharedWbId) {
          try {
            await spindle.world_books.delete(sharedWbId, userId);
            log.info(`delete_module: deleted shared world_book wb=${sharedWbId} module=${msg.moduleId}`);
          } catch (err) {
            log.warn(`delete_module: shared world_book delete failed wb=${sharedWbId}: ${errMsg(err)}`);
          }
        }
        await runModuleImageCleanup(msg.moduleId, userId).catch((err) => {
          log.warn(`delete_module: image cleanup threw module=${msg.moduleId}: ${errMsg(err)}`);
        });
        await deleteModuleFromStore(moduleStorage(), userId, msg.moduleId);
        log.info(
          `delete_module: id=${msg.moduleId} detachedFromChars=${touched.length}`,
        );
        await pushModules(userId);
        for (const charId of touched) {
          await pushAttachedForCharacter(charId, userId);
        }
        break;
      }
      case 'attach_module': {
        if (!userId) {
          send({ type: 'error', message: 'attach_module: no userId' });
          break;
        }
        const result = await attachModuleToCharacter(
          msg.characterId,
          msg.moduleId,
          userId,
        );
        if (!result.ok) {
          send({ type: 'error', message: `attach_module: ${result.reason ?? 'failed'}` });
          break;
        }
        await pushAttachedForCharacter(msg.characterId, userId);
        await pushModules(userId);
        break;
      }
      case 'detach_module': {
        if (!userId) {
          send({ type: 'error', message: 'detach_module: no userId' });
          break;
        }
        const result = await detachModuleFromCharacter(
          msg.characterId,
          msg.moduleId,
          userId,
        );
        if (!result.ok) {
          send({ type: 'error', message: `detach_module: ${result.reason ?? 'failed'}` });
          break;
        }
        await pushAttachedForCharacter(msg.characterId, userId);
        await pushModules(userId);
        break;
      }
      case 'module_artifacts_installed': {
        // Frontend finished its cookie-auth POSTs; stash the resulting
        // resource ids on the character's user_overrides so future
        // detach can find + delete them. Also re-invalidate the
        // active-card cache so the next chat-tick re-synthesizes
        // (the merged card already includes the module's
        // triggers/lua/assets via attached_module_ids; the world_book
        // / regex are written into Lumi's own tables and don't pass
        // through synthesize, so this invalidation is defensive).
        if (!userId) {
          send({ type: 'error', message: 'module_artifacts_installed: no userId' });
          break;
        }
        await updateLumirealm(charactersApi(), msg.characterId, userId, (cur) => {
          const wb = { ...(cur.user_overrides.attached_module_world_books ?? {}) };
          if (msg.worldBookId) wb[msg.moduleId] = msg.worldBookId;
          else delete wb[msg.moduleId];
          const rx = { ...(cur.user_overrides.attached_module_regex_script_ids ?? {}) };
          if (msg.regexScriptIds.length > 0) rx[msg.moduleId] = msg.regexScriptIds;
          else delete rx[msg.moduleId];
          return {
            ...cur,
            user_overrides: {
              ...cur.user_overrides,
              ...(Object.keys(wb).length > 0 ? { attached_module_world_books: wb } : {}),
              ...(Object.keys(rx).length > 0 ? { attached_module_regex_script_ids: rx } : {}),
            },
          };
        });
        if (msg.worldBookId) {
          const existing = worldBookIdsByCharacter.get(msg.characterId) ?? [];
          if (!existing.includes(msg.worldBookId)) {
            worldBookIdsByCharacter.set(msg.characterId, [...existing, msg.worldBookId]);
          }
        }
        invalidateActiveForCharacter(msg.characterId);
        log.info(
          `module_artifacts_installed: char=${msg.characterId} module=${msg.moduleId} ` +
            `worldBookId=${msg.worldBookId ?? 'null'} regex=${msg.regexScriptIds.length}`,
        );
        break;
      }
      case 'module_artifacts_uninstalled': {
        log.info(
          `module_artifacts_uninstalled: char=${msg.characterId} module=${msg.moduleId} ok=${msg.ok}`,
        );
        break;
      }
      case 'add_asset':
      case 'add_assets':
      case 'rename_asset':
      case 'delete_asset': {
        if (!userId) {
          send({ type: 'error', message: `${msg.type}: no userId` });
          break;
        }
        const result = await mutateAssetIndex(msg, userId);
        if (!result.ok) {
          send({ type: 'error', message: `${msg.type}: ${result.reason ?? 'failed'}` });
          break;
        }
        try {
          const data = msg.source.kind === 'character'
            ? await assembleCharacterViewerData(msg.source.characterId, userId)
            : await assembleModuleViewerData(msg.source.moduleId, userId);
          if (data) send({ type: 'viewer_data_pushed', data });
        } catch (err) {
          log.warn(`${msg.type}: viewer re-push failed: ${errMsg(err)}`);
        }
        if (msg.source.kind === 'module') {
          const attached = await charactersAttachedTo(msg.source.moduleId, userId);
          for (const charId of attached) {
            invalidateActiveForCharacter(charId);
          }
          if (attached.length > 0) {
            log.info(
              `${msg.type}: invalidated ${attached.length} attached character(s) for module ${msg.source.moduleId}`,
            );
          }
        } else {
          invalidateActiveForCharacter(msg.source.characterId);
        }
        break;
      }
      case 'set_trigger_lua': {
        if (!userId) {
          send({ type: 'error', message: 'set_trigger_lua: no userId' });
          break;
        }
        const result = await mutateTriggerLua(msg, userId);
        if (!result.ok) {
          send({ type: 'error', message: `set_trigger_lua: ${result.reason ?? 'failed'}` });
          break;
        }
        try {
          const data = msg.source.kind === 'character'
            ? await assembleCharacterViewerData(msg.source.characterId, userId)
            : await assembleModuleViewerData(msg.source.moduleId, userId);
          if (data) send({ type: 'viewer_data_pushed', data });
        } catch (err) {
          log.warn(`set_trigger_lua: viewer re-push failed: ${errMsg(err)}`);
        }
        if (msg.source.kind === 'module') {
          const attached = await charactersAttachedTo(msg.source.moduleId, userId);
          for (const charId of attached) invalidateActiveForCharacter(charId);
        } else {
          invalidateActiveForCharacter(msg.source.characterId);
        }
        break;
      }
      case 'set_background_html': {
        if (!userId) {
          send({ type: 'error', message: 'set_background_html: no userId' });
          break;
        }
        const characterId = msg.characterId;
        const html = typeof msg.html === 'string' && msg.html.length > 0 ? msg.html : null;
        const updated = await updateLumirealm(charactersApi(), characterId, userId, (cur) => ({
          ...cur,
          payload: { ...cur.payload, background_html: html },
        }));
        if (!updated) {
          send({ type: 'error', message: 'set_background_html: character is not a lumirealm card' });
          break;
        }
        invalidateActiveForCharacter(characterId);
        try {
          const data = await assembleCharacterViewerData(characterId, userId);
          if (data) send({ type: 'viewer_data_pushed', data });
        } catch (err) {
          log.warn(`set_background_html: viewer re-push failed: ${errMsg(err)}`);
        }
        break;
      }
      case 'request_viewer_data': {
        if (!userId) {
          send({ type: 'error', message: 'request_viewer_data: no userId' });
          break;
        }
        try {
          const data = msg.source.kind === 'character'
            ? await assembleCharacterViewerData(msg.source.characterId, userId)
            : await assembleModuleViewerData(msg.source.moduleId, userId);
          if (data) send({ type: 'viewer_data_pushed', data });
          else send({
            type: 'error',
            message: msg.source.kind === 'character'
              ? `Viewer: character ${msg.source.characterId} is not a lumirealm card.`
              : `Viewer: module ${msg.source.moduleId} not found in library.`,
          });
        } catch (err) {
          send({ type: 'error', message: `Viewer assembly failed: ${errMsg(err)}` });
        }
        break;
      }
      case 'screen_dims': {
        if (userId) {
          setScreenDims(userId, { width: Number(msg.width) || 0, height: Number(msg.height) || 0 });
          log.info(`screen_dims: user=${userId} w=${msg.width} h=${msg.height}`);
        } else {
          log.warn(`screen_dims: received but userId is empty — cache not updated`);
        }
        break;
      }
      case 'log_request_state': {
        if (userId) await ensureLogStateLoaded(userId);
        sendLogState();
        break;
      }
      case 'log_set_state': {
        const next: LogState = { enabled: !!msg.enabled, includeChatData: !!msg.includeChatData };
        logStore.setState(next);
        if (userId) await persistLogState(userStorage(), userId);
        sendLogState();
        break;
      }
      case 'log_request_export': {
        const snap = logStore.snapshot();
        send({
          type: 'log_export_pushed',
          events: snap.events,
          session: {
            extensionVersion: EXTENSION_VERSION,
            userId: userId ?? null,
            activeChatId: lastActiveChatByUser.get(userId ?? '') ?? null,
            activeCharacterId: null,
          },
        });
        break;
      }
      case 'log_clear': {
        logStore.clear();
        sendLogState();
        break;
      }
      case 'alert_dismissed': {
        resolveAlertDismissal(msg.requestId);
        break;
      }
      case 'pick_resolved': {
        resolvePickResolution(msg.requestId, msg.value);
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Frontend message handler error (type=${(msg as { type?: string }).type ?? '?'}): ${message}`);
    send({ type: 'error', message });
  }
});

