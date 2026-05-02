// Backend portal extraction (Risu processScriptFull port). Runs display-regex
// rules in-worker so portal HTML stays current independent of DOM mount state.

import type { StoredRegexScript } from "../../core/payload/index.js";
import { applyMatchTemplate } from "../runtime.js";
import { runPipeline, type RunPipelineInput } from "../evaluator/pipeline.js";
import { extractPortalRegions, type PortalRegion } from "./extract.js";
import { errMsg } from "../../util/coerce.js";

// Cache key: cardId|chatID|rulesShapeHash|contentHash|varsHash. varsHash
// covers only vars referenced by matching rules so unrelated setvar writes
// don't invalidate. Rules without var_refs metadata fall back to global hash.
// Cap 1000 entries, evict oldest on overflow.

interface CacheEntry {
  readonly html: string;
  readonly insertedAt: number;
}

const ruleOutputCache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 1000;
let cacheInsertionCounter = 0;

function cacheGet(key: string): string | null {
  const entry = ruleOutputCache.get(key);
  return entry ? entry.html : null;
}

function cacheSet(key: string, html: string): void {
  if (ruleOutputCache.size >= MAX_CACHE_ENTRIES) {
    let oldestKey: string | null = null;
    let oldestInserted = Infinity;
    for (const [k, e] of ruleOutputCache) {
      if (e.insertedAt < oldestInserted) {
        oldestInserted = e.insertedAt;
        oldestKey = k;
      }
    }
    if (oldestKey !== null) ruleOutputCache.delete(oldestKey);
  }
  ruleOutputCache.set(key, { html, insertedAt: ++cacheInsertionCounter });
}

export function clearPortalCacheForCard(cardId: string): void {
  const prefix = `${cardId}|`;
  for (const k of ruleOutputCache.keys()) {
    if (k.startsWith(prefix)) ruleOutputCache.delete(k);
  }
}

export function clearPortalCache(): void {
  ruleOutputCache.clear();
  cacheInsertionCounter = 0;
}

export function portalCacheSize(): number {
  return ruleOutputCache.size;
}

function computeRulesShapeHash(rules: readonly StoredRegexScript[]): string {
  let hash = 0x811c9dc5;
  const fields = (r: StoredRegexScript): string =>
    `${r.script_id}|${r.find_regex}|${r.replace_string}|${r.flags}|` +
    `${r.target}|${r.sort_order}|${r.trim_strings.join(",")}|` +
    `${r.substitute_macros}|${r.disabled ? 1 : 0}|` +
    `${r.min_depth ?? "n"}|${r.max_depth ?? "n"}`;
  for (const r of rules) {
    const s = fields(r);
    for (let i = 0; i < s.length; i++) {
      hash ^= s.charCodeAt(i);
      hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
    }
  }
  return hash.toString(16).padStart(8, "0");
}

function computeContentHash(content: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

type VarsBag = {
  local?: Record<string, string>;
  global?: Record<string, string>;
  chat?: Record<string, string>;
};

interface RuleVarDeps {
  readonly varRefs: readonly string[];
  // null if compile threw; treated as "may match"
  readonly findRe: RegExp | null;
  readonly hasMetadata: boolean;
  readonly minDepth: number | null;
  readonly maxDepth: number | null;
}

function buildRuleVarDeps(applicable: readonly StoredRegexScript[]): RuleVarDeps[] {
  const out: RuleVarDeps[] = [];
  for (const rule of applicable) {
    const meta = rule.metadata as { _risu?: { var_refs?: unknown } } | undefined;
    const rawRefs = meta?._risu?.var_refs;
    const hasMetadata = Array.isArray(rawRefs);
    const varRefs = hasMetadata
      ? (rawRefs as unknown[]).filter((v): v is string => typeof v === "string")
      : [];
    let findRe: RegExp | null = null;
    try {
      const findHasCbs = /\{\{/.test(rule.find_regex);
      const flags = normalizeFlags(rule.flags, findHasCbs);
      findRe = new RegExp(rule.find_regex, flags);
    } catch {
      findRe = null;
    }
    out.push({
      varRefs,
      findRe,
      hasMetadata,
      minDepth: rule.min_depth,
      maxDepth: rule.max_depth,
    });
  }
  return out;
}

function computeVarsHashForMessage(
  msgContent: string,
  ruleDeps: readonly RuleVarDeps[],
  depthFromLatest: number,
  vars: VarsBag | undefined,
): string {
  if (!vars) return "00000000";

  // Any rule missing metadata forces the global hash to avoid under-invalidation.
  for (const dep of ruleDeps) {
    if (dep.minDepth !== null && depthFromLatest < dep.minDepth) continue;
    if (dep.maxDepth !== null && depthFromLatest > dep.maxDepth) continue;
    if (!dep.hasMetadata) return computeGlobalVarsHash(vars);
  }

  const referencedVars = new Set<string>();
  for (const dep of ruleDeps) {
    if (dep.varRefs.length === 0) continue;
    if (dep.minDepth !== null && depthFromLatest < dep.minDepth) continue;
    if (dep.maxDepth !== null && depthFromLatest > dep.maxDepth) continue;
    let matches: boolean;
    if (dep.findRe === null) {
      // Compile failed; assume may match.
      matches = true;
    } else {
      // /g/ regex is stateful; reset before test.
      dep.findRe.lastIndex = 0;
      matches = dep.findRe.test(msgContent);
    }
    if (!matches) continue;
    for (const v of dep.varRefs) referencedVars.add(v);
  }

  if (referencedVars.size === 0) {
    return "00000000";
  }
  let hash = 0x811c9dc5;
  const sortedKeys = [...referencedVars].sort();
  for (const k of sortedKeys) {
    for (const scope of [vars.local, vars.global, vars.chat] as const) {
      if (!scope) continue;
      const v = scope[k];
      if (typeof v === "string") {
        const piece = `${k}=${v}|`;
        for (let i = 0; i < piece.length; i++) {
          hash ^= piece.charCodeAt(i);
          hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
        }
      }
    }
  }
  return hash.toString(16).padStart(8, "0");
}

function computeGlobalVarsHash(vars: VarsBag | undefined): string {
  if (!vars) return "00000000";
  let hash = 0x811c9dc5;
  const fold = (label: string, scope: Record<string, string> | undefined): void => {
    hash ^= label.charCodeAt(0);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
    if (!scope) return;
    const keys = Object.keys(scope).sort();
    for (const k of keys) {
      const piece = `${k}=${String(scope[k])}`;
      for (let i = 0; i < piece.length; i++) {
        hash ^= piece.charCodeAt(i);
        hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
      }
    }
  };
  fold("L", vars.local);
  fold("G", vars.global);
  fold("C", vars.chat);
  return hash.toString(16).padStart(8, "0");
}


export interface PortalResolveCtx {
  readonly chatId: string;
  readonly userId?: string;
  readonly cardId: string;
  // -1 for greeting, 0..N for chat.message[i].
  readonly currentMessageIndex: number;
  readonly pipelineCtx: Omit<RunPipelineInput, "template" | "phase" | "currentMessageIndexOverride">;
}

export interface ResolverMessage {
  readonly id: string;
  readonly content: string;
}

export interface PortalSlot {
  readonly slotId: string;
  readonly msgId: string;
  readonly matchIdx: number;
  readonly html: string;
  readonly signature: string;
  readonly sourceToken: string;
}

export interface ResolverWarn {
  readonly stage: "cbs_resolve" | "rule_apply" | "extract";
  readonly msgId: string;
  readonly ruleId?: string;
  readonly message: string;
}

export interface ResolveOutcome {
  readonly slots: readonly PortalSlot[];
  readonly warnings: readonly ResolverWarn[];
  readonly perMessageMs: ReadonlyMap<string, number>;
  readonly cacheHits: number;
  readonly cacheMisses: number;
}


export function resolvePortalsForChat(
  messages: readonly ResolverMessage[],
  rules: readonly StoredRegexScript[],
  ctxBase: Omit<PortalResolveCtx, "currentMessageIndex">,
): ResolveOutcome {
  const slots: PortalSlot[] = [];
  const warnings: ResolverWarn[] = [];
  const perMessageMs = new Map<string, number>();
  let cacheHits = 0;
  let cacheMisses = 0;

  // Skip strip-stubs. They erase portal markers and must not run before the
  // portal-producing rule emits them.
  const applicable = rules
    .filter((r) => r.target === "display" && !r.disabled && !isStripStub(r))
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  const rulesShapeHash = computeRulesShapeHash(applicable);
  const ruleVarDeps = buildRuleVarDeps(applicable);
  const variables = (ctxBase.pipelineCtx as { variables?: VarsBag }).variables;

  for (let lumiIdx = 0; lumiIdx < messages.length; lumiIdx++) {
    const msg = messages[lumiIdx]!;
    const t0 = Date.now();
    const risuIdx = lumiIdx - 1; // greeting = -1, chat[0] = 0, ...

    const perMsgCtx: PortalResolveCtx = {
      ...ctxBase,
      currentMessageIndex: risuIdx,
    };

    // Resolve CBS before hashing so var mutations invalidate naturally.
    const depthFromLatest = messages.length - 1 - lumiIdx;
    let resolvedContent: string;
    try {
      resolvedContent = runPipeline({
        ...perMsgCtx.pipelineCtx,
        template: msg.content,
        phase: "display",
        currentMessageIndexOverride: risuIdx,
      });
    } catch (err) {
      warnings.push({
        stage: "cbs_resolve",
        msgId: msg.id,
        message: errMsg(err),
      });
      perMessageMs.set(msg.id, Date.now() - t0);
      continue;
    }

    const contentHash = computeContentHash(resolvedContent);
    const varsHash = computeVarsHashForMessage(
      resolvedContent,
      ruleVarDeps,
      depthFromLatest,
      variables,
    );
    const cacheKey =
      `${ctxBase.cardId}|${risuIdx}|${rulesShapeHash}|${contentHash}|${varsHash}`;
    const cached = cacheGet(cacheKey);

    let html: string;
    if (cached !== null) {
      html = cached;
      cacheHits++;
    } else {
      cacheMisses++;
      html = resolvedContent;

      for (const rule of applicable) {
        if (rule.min_depth !== null && depthFromLatest < rule.min_depth) continue;
        if (rule.max_depth !== null && depthFromLatest > rule.max_depth) continue;

        try {
          html = applyOneRule(html, rule, perMsgCtx);
        } catch (err) {
          warnings.push({
            stage: "rule_apply",
            msgId: msg.id,
            ruleId: rule.script_id,
            message: errMsg(err),
          });
        }
      }

      cacheSet(cacheKey, html);
    }

    let regions: readonly PortalRegion[];
    try {
      regions = extractPortalRegions(html, (m) =>
        warnings.push({ stage: "extract", msgId: msg.id, message: m }),
      );
    } catch (err) {
      warnings.push({
        stage: "extract",
        msgId: msg.id,
        message: errMsg(err),
      });
      regions = [];
    }

    for (let m = 0; m < regions.length; m++) {
      const region = regions[m]!;
      // Rename data-risu-portal -> data-risu-portal-extracted so the bubble
      // hide rule doesn't fire on overlay copies. Idempotent via negative lookahead.
      const overlayHtml = renameForOverlay(region.outerHTML);
      slots.push({
        slotId: `${msg.id}::${m}`,
        msgId: msg.id,
        matchIdx: m,
        html: overlayHtml,
        signature: signatureOf(overlayHtml),
        sourceToken: region.sourceToken,
      });
    }

    perMessageMs.set(msg.id, Date.now() - t0);
  }

  return { slots, warnings, perMessageMs, cacheHits, cacheMisses };
}

export function applyOneRule(
  html: string,
  rule: StoredRegexScript,
  ctx: PortalResolveCtx,
): string {
  let findRegex = rule.find_regex;
  const subMacros = rule.substitute_macros;

  // Pre-resolve find_regex CBS if applicable.
  if (subMacros !== "none" && /\{\{/.test(findRegex)) {
    try {
      findRegex = runPipeline({
        ...ctx.pipelineCtx,
        template: findRegex,
        phase: "display",
        currentMessageIndexOverride: ctx.currentMessageIndex,
      });
    } catch {
      // Pre-resolve fail: fall through with original. Compile error caught upstream.
    }
  }

  const flags = normalizeFlags(rule.flags, /\{\{/.test(findRegex));
  const re = new RegExp(findRegex, flags);

  let result = html.replace(re, (...args: unknown[]) => {
      const last = args[args.length - 1];
    const hasGroups = typeof last === "object" && last !== null;
    const groups = hasGroups ? (last as Record<string, string>) : undefined;
    const tailLen = hasGroups ? 3 : 2;
    const matchAndCaps = args.slice(0, args.length - tailLen);
    const matchStr = String(matchAndCaps[0] ?? "");
    const caps = matchAndCaps.slice(1).map((c) => (c == null ? "" : String(c)));

    const matchArr = [matchStr, ...caps] as unknown as RegExpMatchArray;
    if (groups) (matchArr as { groups?: Record<string, string> }).groups = groups;

    let replaced = applyMatchTemplate(rule.replace_string, matchArr);

    if (subMacros !== "none" && /\{\{/.test(replaced)) {
      try {
        replaced = runPipeline({
          ...ctx.pipelineCtx,
          template: replaced,
          phase: "display",
          currentMessageIndexOverride: ctx.currentMessageIndex,
        });
      } catch {
        // Keep unresolved replacement on CBS error.
      }
    }
    return replaced;
  });

  // trim_strings post-pass.
  for (const trim of rule.trim_strings) {
    if (trim.length === 0) continue;
    while (result.includes(trim)) result = result.replaceAll(trim, "");
  }

  return result;
}


function normalizeFlags(raw: string, findHasCbs: boolean): string {
  const allowed = "dgimsuvy";
  const seen = new Set<string>();
  let out = "";
  for (const c of raw) {
    if (allowed.includes(c) && !seen.has(c)) {
      seen.add(c);
      out += c;
    }
  }
  if (out.length === 0) out = "u";
  if (findHasCbs) out = out.replace(/u/g, "");
  if (!out.includes("g")) out += "g";
  return out;
}

function signatureOf(html: string): string {
  const trimmed = html.trim();
  let hash = 0x811c9dc5;
  for (let i = 0; i < trimmed.length; i++) {
    hash ^= trimmed.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}


function renameForOverlay(html: string): string {
  return html.replace(/data-risu-portal(?!-)/g, "data-risu-portal-extracted");
}

function isStripStub(rule: StoredRegexScript): boolean {
  const meta = rule.metadata as { _risu?: { is_strip_stub?: unknown } } | undefined;
  return meta?._risu?.is_strip_stub === true;
}
