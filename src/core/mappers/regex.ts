import type { CustomScript } from "../schemas/customscript.js";
import type {
  LumiRegexScript,
  LumiRegexPlacement,
  LumiRegexTarget,
  LumiRegexMacroMode,
} from "../lumiverse/types.js";
import type { CatalogIndex } from "../cbs/catalog/loader.js";
import { rewriteText } from "../cbs/rewrite/text.js";
import {
  extractGetvarRefs,
  outermostElementIsFixed,
  replacementNeedsPortal,
  EMPTY_PORTAL_SELECTORS,
  type PortalSelectors,
} from "./portal-analyze.js";
import { wrapFixedElementsRecursive } from "./portal-wrap.js";
import { wrapIslandMergeIfNeeded } from "./island-merge.js";
import { newUuid, nowMs } from "./util.js";
import { normalizeReplaceStringForSanitizer } from "../../util/sanitizer-doc-shape.js";


// Risu scripts.ts+
const AT_ACTION_PREFIXES = [
  "@@emo",
  "@@inject",
  "@@move_top",
  "@@move_bottom",
  "@@repeat_back",
] as const;

// Risu scripts.ts
const ALLOWED_FLAG_LETTERS = "dgimsuvy";

export interface AtAtAction {
  readonly index: number;
  readonly action: "emo" | "inject" | "move_top" | "move_bottom" | "repeat_back";
  readonly script: CustomScript;
  readonly flag: string;
  readonly phase: string;
  readonly actions: readonly string[];
  readonly order: number;
}

export interface MapRegexOptions {
  readonly characterId: string;
  readonly now?: () => number;
  readonly uuid?: () => string;
  readonly userId?: string;
  readonly origin?: "character" | "module";
  readonly catalog?: CatalogIndex;
  readonly portalSelectors?: PortalSelectors;
  readonly anchoredPortalSelectors?: PortalSelectors;
}

export interface MapRegexResult {
  readonly rows: readonly LumiRegexScript[];
  readonly skipped: readonly AtAtAction[];
  readonly issues: readonly { path: string; message: string }[];
}

export function mapRegex(
  scripts: readonly CustomScript[],
  opts: MapRegexOptions,
): MapRegexResult {
  const now = (opts.now ?? nowMs)();
  const uuid = opts.uuid ?? newUuid;
  const origin = opts.origin ?? "character";

  const rows: LumiRegexScript[] = [];
  const skipped: AtAtAction[] = [];
  const issues: { path: string; message: string }[] = [];

  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i]!;
    const path = `${origin === "character" ? "customscript" : "module.regex"}[${i}]`;

    if (typeof s.in !== "string" || s.in.length === 0) {
      issues.push({ path, message: "empty `in` field, skipped" });
      continue;
    }
    if (typeof s.out !== "string") {
      issues.push({ path, message: "non-string `out` field, skipped" });
      continue;
    }

    const phase = RISU_PHASE_MAP[s.type];
    if (!phase) {
      issues.push({
        path,
        message: `unknown Risu regex phase \`${s.type}\`, entry preserved as disabled display-target`,
      });
    }
    const effectivePhase = phase ?? UNKNOWN_PHASE_FALLBACK;

    const normalised = normaliseFlag(s, i);
    let outNormalised = s.out.replaceAll("$n", "\n");
    const action = detectAtAction(outNormalised);
    if (action) {
      const prefix = `@@${action}`;
      const trimmed = outNormalised.slice(prefix.length).replace(/^\s+/, "");
      if (action === "move_top" || action === "move_bottom") {
        outNormalised = trimmed;
      } else {
        outNormalised = "";
      }
    }

    const hasNoEndNl = normalised.actions.includes("no_end_nl");

    let replaceString = outNormalised;
    if (replaceString.endsWith(">") && !hasNoEndNl) replaceString += "\n";

    if (opts.catalog && replaceString.indexOf("{{") >= 0) {
      try {
        replaceString = rewriteText(replaceString, opts.catalog);
      } catch (err) {
        issues.push({
          path,
          message: `CBS rewrite of replace_string failed (keeping raw): ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }


    // Wrap fixed-position HTML so Lumi's row transform doesn't trap it.
    // Outer fixed: whole-string wrap + extension_managed. Subtree fixed: recursive sub-wrap.
    let needsPortal = false;
    if (effectivePhase.target === "display" && opts.portalSelectors) {
      const hasFixedAnywhere = replacementNeedsPortal(
        replaceString,
        opts.portalSelectors,
      );
      if (hasFixedAnywhere) {
        const outerFixed = outermostElementIsFixed(
          replaceString,
          opts.portalSelectors,
        );
        if (outerFixed) {
          needsPortal = true;
          replaceString = `<div data-risu-portal="auto">${replaceString}</div>`;
        } else {
          // Wrap each individually-fixed sub-element.
          // Anchored selectors (explicit top/right/bottom/left or z-index>=1000)
          // avoid extracting transform-only decoratives that need parent context.
          replaceString = wrapFixedElementsRecursive(
            replaceString,
            opts.anchoredPortalSelectors ?? EMPTY_PORTAL_SELECTORS,
            "auto",
          );
        }
      }
    }

    if (effectivePhase.target === "display") {
      replaceString = wrapIslandMergeIfNeeded(replaceString);
    }

    // Strip doc-boundary tags and lift <style> blocks so DOMPurify keeps CSS.
    // Must run after portal/island wraps.
    replaceString = normalizeReplaceStringForSanitizer(replaceString);

    let findPattern = String(s.in ?? "");
    if (opts.catalog && findPattern.indexOf("{{") >= 0) {
      try {
        findPattern = rewriteText(findPattern, opts.catalog);
      } catch (err) {
        issues.push({
          path,
          message: `CBS rewrite of find_regex failed (keeping raw): ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // Simplify state-conditional anchor idiom for Lumi-managed rules.
    // Portal-managed rules resolve find_regex per-message via backend resolver, skip simplification.
    if (!needsPortal) {
      findPattern = simplifyStateConditionalAnchor(findPattern);
    }

    const hasMacros =
      replaceString.indexOf("{{") >= 0 || findPattern.indexOf("{{") >= 0;

    // Drop `u` when find_regex has CBS: `{{` is invalid in Unicode mode. Lumi pre-resolves it.
    const findHasCbs = findPattern.indexOf("{{") >= 0;
    const emittedFlags = findHasCbs ? normalised.flag.replace(/u/g, "") : normalised.flag;

    // Static scan for var_refs (used by backend portal resolver's per-message cache key).
    const varRefs = extractGetvarRefs(replaceString);

    const row: LumiRegexScript = {
      id: uuid(),
      user_id: opts.userId ?? "",
      name: nonEmpty(s.comment, `risu_${effectivePhase.target}_${i}`),
      script_id: uuid(),
      find_regex: findPattern,
      replace_string: replaceString,
      flags: emittedFlags,
      placement: effectivePhase.placement,
      scope: "character",
      scope_id: opts.characterId,
      target: effectivePhase.target,
      min_depth: null,
      max_depth: effectivePhase.maxDepth ?? null,
      trim_strings: [],
      run_on_edit: false,
      substitute_macros: (hasMacros ? "raw" : "none") as LumiRegexMacroMode,
      disabled: effectivePhase.disabled,
      sort_order: normalised.order ?? i,
      description: s.comment ?? "",
      folder: "",
      pack_id: null,
      metadata: {
        _risu: {
          phase: s.type,
          origin,
          order_index: i,
          has_meta: normalised.actions.length > 0,
          ...(needsPortal ? { extension_managed: true } : {}),
          ...(varRefs.length > 0 ? { var_refs: varRefs } : {}),
        },
      },
      created_at: now,
      updated_at: now,
    };
    rows.push(row);

    // Strip-stub: erases the marker text from Lumi's rendered bubbles.
    // Portal resolver handles the actual HTML injection.
    if (needsPortal) {
      const stubFindRegex = simplifyStateConditionalAnchor(findPattern);
      const stubFindHasCbs = stubFindRegex.indexOf("{{") >= 0;
      const stubSubstituteMacros: LumiRegexMacroMode =
        stubFindHasCbs ? row.substitute_macros : "none";
      const stubRow: LumiRegexScript = {
        ...row,
        id: uuid(),
        script_id: uuid(),
        name: `${row.name} (strip)`,
        find_regex: stubFindRegex,
        replace_string: "",
        substitute_macros: stubSubstituteMacros,
        trim_strings: [],
        metadata: {
          _risu: {
            phase: s.type,
            origin,
            order_index: i,
            has_meta: false,
            is_strip_stub: true,
            stub_for: row.script_id,
          },
        },
      };
      rows.push(stubRow);
    }
  }

  return { rows, skipped, issues };
}


interface PhaseMapEntry {
  readonly placement: readonly LumiRegexPlacement[];
  readonly target: LumiRegexTarget;
  readonly disabled: boolean;
  readonly maxDepth?: number | null;
}

const RISU_PHASE_MAP: Readonly<Record<string, PhaseMapEntry>> = {
  editinput: { placement: ["user_input"], target: "prompt", disabled: false, maxDepth: 0 },
  editprocess: { placement: ["user_input", "ai_output", "world_info"], target: "prompt", disabled: false },
  editoutput: { placement: ["ai_output"], target: "response", disabled: false },
  editdisplay: { placement: ["ai_output", "user_input"], target: "display", disabled: false },
  edittrans: { placement: ["ai_output"], target: "response", disabled: false },
  disabled: { placement: ["ai_output", "user_input"], target: "display", disabled: true },
};

const UNKNOWN_PHASE_FALLBACK: PhaseMapEntry = {
  placement: ["ai_output"],
  target: "display",
  disabled: true,
};


interface NormalisedFlag {
  readonly flag: string;
  readonly actions: readonly string[];
  readonly order?: number;
}

function normaliseFlag(s: CustomScript, index: number): NormalisedFlag {
  let raw = s.ableFlag ? (s.flag ?? "g") : "g";
  const actions: string[] = [];
  let order: number | undefined;

  if (s.ableFlag && raw.indexOf("<") >= 0) {
    const acc: string[] = [];
    let i = 0;
    while (i < raw.length) {
      const ch = raw.charCodeAt(i);
      if (ch === 0x3c /* < */) {
        const close = raw.indexOf(">", i + 1);
        if (close < 0) break;
        const inner = raw.slice(i + 1, close);
        for (const meta of splitCommaTrim(inner)) {
          if (meta.startsWith("order ")) {
            const n = Number.parseInt(meta.slice(6), 10);
            if (!Number.isNaN(n)) order = n;
          } else if (meta.length > 0) {
            actions.push(meta);
          }
        }
        i = close + 1;
      } else {
        acc.push(raw[i]!);
        i++;
      }
    }
    raw = acc.join("");
  }

  const seen = new Set<string>();
  let flag = "";
  for (const ch of raw.trim()) {
    if (ALLOWED_FLAG_LETTERS.indexOf(ch) < 0) continue;
    if (seen.has(ch)) continue;
    seen.add(ch);
    flag += ch;
  }
  if (flag.length === 0) flag = "u";

  // move_top/move_bottom strip g flag (Risu parity).
  if (actions.includes("move_top") || actions.includes("move_bottom")) {
    flag = flag.replace("g", "");
    if (flag.length === 0) flag = "u";
  }

  void index;
  return { flag, actions, ...(order !== undefined ? { order } : {}) };
}

function splitCommaTrim(s: string): string[] {
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i <= s.length; i++) {
    if (i === s.length || s[i] === ",") {
      const seg = s.slice(start, i).trim();
      if (seg.length > 0) out.push(seg);
      start = i + 1;
    }
  }
  return out;
}

function nonEmpty(s: string | undefined | null, fallback: string): string {
  if (typeof s === "string" && s.length > 0) return s;
  return fallback;
}

function detectAtAction(out: string): AtAtAction["action"] | null {
  for (const prefix of AT_ACTION_PREFIXES) {
    if (out.startsWith(prefix)) {
      return prefix.slice(2) as AtAtAction["action"];
    }
  }
  return null;
}

function simplifyStateConditionalAnchor(findPattern: string): string {
  const re = /^\s*\{\{#risu_if::((?:[^{}]|\{\{(?:[^{}]|\{\{[^{}]*\}\})*\}\})*)\}\}([^{}]*)\{\{\/risu_if\}\}\s*\{\{#risu_if::((?:[^{}]|\{\{(?:[^{}]|\{\{[^{}]*\}\})*\}\})*)\}\}([^{}]*)\{\{\/risu_if\}\}\s*$/;
  const m = re.exec(findPattern);
  if (!m) return findPattern;
  const body1 = m[2] ?? "";
  const body2 = m[4] ?? "";
  const isAnchorOnly = (s: string): boolean => {
    const t = s.trim();
    return t.length > 0 && /^[$^]+$/.test(t);
  };
  const hasOrdinaryChar = (s: string): boolean => {
    return /[^\s$^.*+?()|\[\]\\]/.test(s);
  };
  if (isAnchorOnly(body1) && hasOrdinaryChar(body2)) return body2.trim();
  if (isAnchorOnly(body2) && hasOrdinaryChar(body1)) return body1.trim();
  return findPattern;
}
