import type {
  SpindleDisplayResolver,
  SpindleDisplayBodyArgs,
  SpindleDisplayResolveResult,
  SpindleDisplayTemplatesArgs,
  SpindleDisplayTemplatesResult,
  SpindleDisplayScriptsArgs,
  SpindleDisplayContext,
} from 'lumiverse-spindle-types';
import { runPipeline, type RunPipelineInput } from '../interpreter/evaluator/pipeline.js';
import type { VarReadRecorder } from '../interpreter/evaluator/context.js';
import { makeSafeLogger } from '../util/safe-log.js';
import {
  getDisplaySnapshot,
  getDisplayResolutionMode,
  isDisplayResolutionReady,
  waitForSnapshot,
  type DisplaySnapshot,
} from './snapshot.js';
import {
  compileRegex,
  collectMatches,
  substituteRegexCaptures,
  rebuildFromMatches,
  applyTrimStrings,
  type FeRegexScript,
} from './regex-apply.js';
import { runEditDisplayChain, runEditDisplayAtActions } from './lua-runner.js';
import { markEvent } from './open-timeline.js';

const log = makeSafeLogger('display-resolver');

// Attribution counters: how many times each surface re-resolves the SAME
// message during one chat-open. Risu resolves each message's display once;
// >1 here means a snapshot/var push (or a host re-render) is re-triggering us.
// Keyed `surface:chatId:msgId`. Logged only when the count climbs past 1 so a
// clean open is silent.
const _resolveCounts = new Map<string, number>();
function countResolve(surface: string, chatId: string, msgId: string | undefined): void {
  const key = `${surface}:${chatId}:${msgId ?? '<batch>'}`;
  const n = (_resolveCounts.get(key) ?? 0) + 1;
  _resolveCounts.set(key, n);
  if (n > 1) log.info(`re-resolve #${n} surface=${surface} chat=${chatId} msg=${msgId ?? '<batch>'} (same message resolved ${n}x this session)`);
}

export type DisplayWritebackSink = (chatId: string, vars: Record<string, string>) => void;

const SNAPSHOT_WAIT_MS = 4000;

async function getSnapshotOrWait(chatId: string): Promise<DisplaySnapshot | undefined> {
  const existing = getDisplaySnapshot(chatId);
  if (existing) return existing;
  const ok = await waitForSnapshot(chatId, SNAPSHOT_WAIT_MS);
  if (ok) return getDisplaySnapshot(chatId);
  log.error(
    `[FE-DISPLAY] snapshot did not arrive for owned chat=${chatId} within ${SNAPSHOT_WAIT_MS}ms — ` +
      `failing LOUD (raw content shown). The host must NOT fall back to backend resolution for an owned chat.`,
  );
  return undefined;
}

function buildInput(
  snap: DisplaySnapshot,
  content: string,
  context: SpindleDisplayContext,
): RunPipelineInput {
  const dyn = context.dynamicMacros;
  const chatIndexStr = dyn?.chat_index;
  const idxOverride = typeof chatIndexStr === 'string' && /^-?\d+$/.test(chatIndexStr)
    ? parseInt(chatIndexStr, 10) - 1
    : undefined;
  const role = context.role ?? dyn?.role;
  return {
    template: content,
    phase: 'display',
    chatId: snap.chatId,
    characterId: snap.characterId,
    userName: snap.userName,
    charName: snap.charName,
    personaText: snap.personaText,
    personaImage: snap.personaImage,
    character: snap.character,
    chat: snap.chat,
    variables: snap.vars,
    scriptstateDefaults: snap.scriptstateDefaults,
    screenWidth: snap.screenWidth,
    screenHeight: snap.screenHeight,
    legacyMediaFindings: snap.legacyMediaFindings,
    modulesByNamespace: snap.modulesByNamespace,
    lorebook: snap.lorebook,
    ...(idxOverride !== undefined ? { currentMessageIndexOverride: idxOverride } : {}),
    ...(role ? { currentMessageRoleOverride: role } : {}),
  };
}

function evalTemplate(
  snap: DisplaySnapshot,
  text: string,
  context: SpindleDisplayContext,
  recorder: VarReadRecorder,
): string {
  return runPipeline(buildInput(snap, text, context), { recorder });
}

async function fetchBackendBody(
  chatId: string,
  messageId: string | undefined,
  role: string | undefined,
  content: string,
): Promise<string> {
  try {
    const res = await fetch(`/api/v1/chats/${encodeURIComponent(chatId)}/display-preprocess`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: [{ messageId, role, rawContent: content }] }),
    });
    if (!res.ok) return content;
    const json = (await res.json()) as { items?: Array<{ content?: unknown }> };
    const c = json.items?.[0]?.content;
    return typeof c === 'string' ? c : content;
  } catch {
    return content;
  }
}

async function fetchBackendTemplates(
  templates: Record<string, string>,
  context: SpindleDisplayContext,
): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/v1/macros/resolve-batch', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        templates,
        chat_id: context.chatId,
        character_id: context.characterId,
        persona_id: context.personaId,
      }),
    });
    if (!res.ok) return {};
    const json = (await res.json()) as { resolved?: Record<string, string> };
    return json.resolved ?? {};
  } catch {
    return {};
  }
}

async function fetchBackendApply(args: SpindleDisplayScriptsArgs): Promise<string | null> {
  const ctx = args.context;
  try {
    const res = await fetch('/api/v1/regex-scripts/apply', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        content: args.content,
        scripts: args.scripts,
        resolved_find_patterns: args.resolvedFindPatterns,
        resolved_replacements: args.resolvedReplacements,
        dynamic_macros: ctx.dynamicMacros,
        context: {
          chat_id: ctx.chatId,
          character_id: ctx.characterId,
          persona_id: ctx.personaId,
          is_user: ctx.isUser,
          depth: ctx.depth,
          ...(ctx.messageId ? { message_id: ctx.messageId } : {}),
          ...(typeof ctx.messageIndex === 'number' ? { message_index: ctx.messageIndex } : {}),
          ...(ctx.role ? { role: ctx.role } : {}),
        },
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: unknown };
    return typeof json.result === 'string' ? json.result : null;
  } catch {
    return null;
  }
}

const APPLY_MARKERS = ['★■', '🦶', '★OMEGA★'];
function markersIn(s: string): string {
  const hit = APPLY_MARKERS.filter((m) => s.includes(m));
  return hit.length ? `[${hit.join(',')}]` : '';
}

function runApply(
  snap: DisplaySnapshot,
  args: SpindleDisplayScriptsArgs,
  recorder: VarReadRecorder,
): string {
  const ctx = args.context;
  const placement = ctx.isUser ? 'user_input' : 'ai_output';
  const scripts = args.scripts as readonly FeRegexScript[];
  let result = args.content;
  const tApplyStart = Date.now();
  const trace: string[] = [];
  let skipped = 0;
  const inMarkers = markersIn(result);

  for (const script of scripts) {
    if (script.disabled === true) { skipped += 1; continue; }
    if (!script.placement.includes(placement)) { skipped += 1; continue; }
    if (script.min_depth !== null && ctx.depth < script.min_depth) { skipped += 1; continue; }
    if (script.max_depth !== null && ctx.depth > script.max_depth) { skipped += 1; continue; }

    const tRule = Date.now();
    const before = result;
    let findRegex = script.find_regex;
    const preFind = args.resolvedFindPatterns?.[script.id];
    if (preFind !== undefined) {
      findRegex = preFind;
    } else if (script.substitute_macros !== 'none') {
      findRegex = evalTemplate(snap, findRegex, ctx, recorder);
    }

    const regex = compileRegex(findRegex, script.flags);
    if (!regex) {
      trace.push(`${script.id.slice(0, 8)}:compile-fail`);
      continue;
    }

    try {
      if (script.substitute_macros === 'raw') {
        const matches = collectMatches(result, regex);
        if (matches.length > 0) {
          const replacements = matches.map((m) => {
            const withCaptures = substituteRegexCaptures(
              script.replace_string, m.fullMatch, m.groups, m.index, result, m.namedGroups,
            );
            return evalTemplate(snap, withCaptures, ctx, recorder);
          });
          result = rebuildFromMatches(result, matches, replacements);
        }
      } else if (script.substitute_macros === 'after') {
        const substituted = result.replace(regex, script.replace_string);
        result = evalTemplate(snap, substituted, ctx, recorder);
      } else {
        let replaceString = script.replace_string;
        const preReplace = args.resolvedReplacements?.[script.id];
        if (preReplace !== undefined) {
          replaceString = script.substitute_macros === 'escaped'
            ? preReplace.replace(/\$/g, '$$$$')
            : preReplace;
        } else if (script.substitute_macros !== 'none') {
          const resolved = evalTemplate(snap, replaceString, ctx, recorder);
          replaceString = script.substitute_macros === 'escaped'
            ? resolved.replace(/\$/g, '$$$$')
            : resolved;
        }
        result = result.replace(regex, replaceString);
      }

      result = applyTrimStrings(result, script.trim_strings);
    } catch (err) {
      recorder.volatile = true;
      trace.push(`${script.id.slice(0, 8)}:THREW(${String(err).slice(0, 40)})`);
      continue;
    }
    const ruleMs = Date.now() - tRule;
    const changed = before !== result;
    if (changed || ruleMs >= 20) {
      trace.push(`${script.id.slice(0, 8)}:${script.substitute_macros}:${ruleMs}ms:${changed ? `${before.length}->${result.length}` : 'no-change'}`);
    }
  }

  const outMarkers = markersIn(result);
  if (inMarkers || outMarkers || (Date.now() - tApplyStart) >= 20) {
    log.info(
      `applyScripts.trace chat=${ctx.chatId ?? '?'} msg=${ctx.messageId ?? '?'} placement=${placement} ` +
        `total=${Date.now() - tApplyStart}ms rules=${scripts.length} skipped=${skipped} ` +
        `markersIn=${inMarkers || 'none'} markersOut=${outMarkers || 'none'} ` +
        `applied=[${trace.join(' ')}]`,
    );
  }

  return result;
}

export function createDisplayResolver(writeback?: DisplayWritebackSink): SpindleDisplayResolver {
  return {
    ready(chatId: string): boolean {
      return isDisplayResolutionReady(chatId);
    },
    async resolveBody(args: SpindleDisplayBodyArgs): Promise<SpindleDisplayResolveResult | null> {
      const chatId = args.context.chatId;
      if (!chatId) return null;
      markEvent(chatId, 'first-resolveBody');
      countResolve('body', chatId, args.context.messageId);
      const snap = await getSnapshotOrWait(chatId);
      if (!snap) return null;

      let feContent: string;
      const recorder: VarReadRecorder = { touched: new Set<string>(), volatile: false };
      try {
        let body = args.content;
        if (snap.luaTriggers.length > 0) {
          body = await runEditDisplayChain(
            snap,
            body,
            args.context,
            (t) => Promise.resolve(runPipeline(buildInput(snap, t, args.context), { recorder })),
            (vars) => writeback?.(chatId, vars),
          );
        }
        if (snap.atActions.length > 0) {
          body = await runEditDisplayAtActions(snap, body, args.context);
        }
        feContent = runPipeline(buildInput(snap, body, args.context), { recorder });
      } catch (err) {
        log.warn(`resolveBody: threw chat=${chatId}: ${String(err)}. Deferring to backend.`);
        return null;
      }

      const mode = getDisplayResolutionMode();
      if (mode === 'shadow') {
        const beContent = await fetchBackendBody(
          chatId,
          args.context.messageId,
          args.context.role,
          args.content,
        );
        if (beContent !== feContent) {
          log.warn(
            `[shadow] body mismatch chat=${chatId} msg=${args.context.messageId ?? '?'} ` +
              `feLen=${feContent.length} beLen=${beContent.length} ` +
              `fe[0..160]=${JSON.stringify(feContent.slice(0, 160))} ` +
              `be[0..160]=${JSON.stringify(beContent.slice(0, 160))}`,
          );
        } else {
          log.trace(`[shadow] body match chat=${chatId} msg=${args.context.messageId ?? '?'} len=${feContent.length}`);
        }
        return { content: beContent };
      }

      return {
        content: feContent,
        touchedVars: [...recorder.touched],
        cacheable: !recorder.volatile,
      };
    },
    async resolveTemplates(args: SpindleDisplayTemplatesArgs): Promise<SpindleDisplayTemplatesResult | null> {
      const chatId = args.context.chatId;
      if (!chatId) return null;
      const snap = await getSnapshotOrWait(chatId);
      if (!snap) return null;

      const resolved: Record<string, string> = {};
      const touchedVars: Record<string, string[]> = {};
      const cacheable: Record<string, boolean> = {};
      try {
        for (const [key, template] of Object.entries(args.templates)) {
          const recorder: VarReadRecorder = { touched: new Set<string>(), volatile: false };
          resolved[key] = runPipeline(buildInput(snap, template, args.context), { recorder });
          touchedVars[key] = [...recorder.touched];
          cacheable[key] = !recorder.volatile;
        }
      } catch (err) {
        log.warn(`resolveTemplates: runPipeline threw chat=${chatId}: ${String(err)}. Deferring to backend.`);
        return null;
      }

      const mode = getDisplayResolutionMode();
      if (mode === 'shadow') {
        const be = await fetchBackendTemplates(args.templates, args.context);
        for (const key of Object.keys(args.templates)) {
          const beVal = be[key];
          if (typeof beVal === 'string' && beVal !== resolved[key]) {
            log.warn(
              `[shadow] template mismatch chat=${chatId} key=${key} ` +
                `fe=${JSON.stringify((resolved[key] ?? '').slice(0, 120))} ` +
                `be=${JSON.stringify(beVal.slice(0, 120))}`,
            );
          }
        }
        return { resolved: { ...resolved, ...be } };
      }

      return { resolved, touchedVars, cacheable };
    },
    async applyScripts(args: SpindleDisplayScriptsArgs): Promise<SpindleDisplayResolveResult | null> {
      const chatId = args.context.chatId;
      if (!chatId) return null;
      markEvent(chatId, 'first-applyScripts');
      countResolve('apply', chatId, args.context.messageId);
      const snap = await getSnapshotOrWait(chatId);
      if (!snap) return null;

      let feContent: string;
      const recorder: VarReadRecorder = { touched: new Set<string>(), volatile: false };
      try {
        feContent = runApply(snap, args, recorder);
      } catch (err) {
        log.warn(`applyScripts: threw chat=${chatId}: ${String(err)}. Deferring to backend.`);
        return null;
      }

      const mode = getDisplayResolutionMode();
      if (mode === 'shadow') {
        const beContent = await fetchBackendApply(args);
        if (beContent === null) {
          return { content: feContent, touchedVars: [...recorder.touched], cacheable: !recorder.volatile };
        }
        if (beContent !== feContent) {
          log.warn(
            `[shadow] apply mismatch chat=${chatId} msg=${args.context.messageId ?? '?'} ` +
              `feLen=${feContent.length} beLen=${beContent.length} ` +
              `fe[0..160]=${JSON.stringify(feContent.slice(0, 160))} ` +
              `be[0..160]=${JSON.stringify(beContent.slice(0, 160))}`,
          );
        } else {
          log.trace(`[shadow] apply match chat=${chatId} msg=${args.context.messageId ?? '?'} len=${feContent.length}`);
        }
        return { content: beContent };
      }

      return {
        content: feContent,
        touchedVars: [...recorder.touched],
        cacheable: !recorder.volatile,
      };
    },
  };
}
