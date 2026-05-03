// Lorebook decorator parser + Tier-1 Lumi-field mapping.
// Tier 1 maps directly to a LumiWorldBookEntry field. Tier 2/3 (gates that
// need per-prompt evaluation and the inject_* family) are stashed on
// extensions._risu_decorators for a future runtime intercept.

import type { LumiWorldBookEntry } from "../lumiverse/types.js";

/** A single parsed decorator line. */
export interface ParsedDecorator {
  /** Decorator name with prefix stripped. Risu matches case-sensitive. */
  readonly name: string;
  /** Comma-split args after first whitespace, trimmed, empty filtered. */
  readonly args: readonly string[];
  /** True for @@@<name> fallback form (fires only on prior suspend). */
  readonly isFallback: boolean;
  /** Original line index for diagnostics. */
  readonly lineIndex: number;
}

/** Output of `parseDecorators`. */
export interface DecoratorParseResult {
  /** Decorators in source order, after @@@ suspend filter. */
  readonly decorators: readonly ParsedDecorator[];
  /** Remainder of entry content from first non-@@ line, trimmed. */
  readonly remainingContent: string;
}

/**
 * Pure parser. Splits on newline, trims each line, rewrites `@@@end` to
 * `@@end`. @@-prefixed lines are decorators (name up to first space, args
 * comma-split after). First non-@@ line ends the decorator block; rest is
 * content. Caller filters @@@ fallbacks based on which decorators suspended.
 */
export function parseDecorators(content: string): DecoratorParseResult {
  const lines = content.split("\n");
  const decorators: ParsedDecorator[] = [];
  // Keep every @@@ line at parse time, marked isFallback. Caller decides
  // which fired based on which prior decorators suspended.
  for (let i = 0; i < lines.length; i++) {
    let line = (lines[i] ?? "").trim();
    if (line === "@@@end") line = "@@end";
    if (!line.startsWith("@@")) {
      // First non-decorator line, content cutoff.
      const rest = lines.slice(i).join("\n").trim();
      return { decorators, remainingContent: rest };
    }
    const isFallback = line.startsWith("@@@");
    const prefixLen = isFallback ? 3 : 2;
    let spaceIdx = line.indexOf(" ");
    if (spaceIdx === -1) spaceIdx = line.length;
    const name = line.slice(prefixLen, spaceIdx);
    if (name === "") continue; // @@/@@@ with no name silently dropped.
    const argString = line.slice(spaceIdx);
    const args = argString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    decorators.push({ name, args, isFallback, lineIndex: i });
  }
  // All lines were decorators (or blank).
  return { decorators, remainingContent: "" };
}


// Tier-1 decorator names map directly to a Lumi entry field. Everything else
// is stashed on extensions._risu_decorators for a future intercept.
const TIER1_DECORATOR_NAMES: ReadonlySet<string> = new Set([
  "position",
  "depth",
  "reverse_depth",
  "role",
  "scan_depth",
  "priority",
  "probability",
  "ignore_on_max_context",
  "additional_keys",
  "match_full_word",
  "match_partial_word",
  "unrecursive",
  "recursive",
  "no_recursive_search",
  "activate",
  "dont_activate",
  "end",
]);

/** Tier 1 decorators recognised but not applied (bad arg shape, etc.). */
export interface DroppedDecorator {
  readonly decorator: ParsedDecorator;
  readonly reason: string;
}

/** Outcome of applying decorators to a draft entry. */
export interface ApplyDecoratorsResult {
  /** Field-by-field mutations. Merge via {...entry, ...patch}. */
  readonly patch: Partial<LumiWorldBookEntry>;
  readonly applied: readonly ParsedDecorator[];
  /** Tier 2/3 preserved on extensions._risu_decorators. */
  readonly stashed: readonly ParsedDecorator[];
  /** Tier 1 recognised but not applied. */
  readonly dropped: readonly DroppedDecorator[];
}

interface MutableState {
  position?: number;
  depth?: number;
  role?: string;
  scan_depth?: number | null;
  priority?: number;
  probability?: number;
  use_probability?: boolean;
  match_whole_words?: boolean;
  /** prevent_recursion: this entry's content does not feed subsequent recursion passes. */
  prevent_recursion?: boolean;
  /** exclude_recursion: this entry only activates on pass 0, never from recursion content. */
  exclude_recursion?: boolean;
  constant?: boolean;
  disabled?: boolean;
  additional_keys: string[];
  reverse_depth_seen: boolean;
}

/**
 * Apply Tier 1 decorators to a draft entry. Pure: returns patch + lists,
 * does not mutate input. @@@ fallback fires only when the prior decorator
 * suspended (returned false in Risu).
 */
export function applyDecoratorsToEntry(
  entry: Pick<LumiWorldBookEntry, "key" | "extensions">,
  decorators: readonly ParsedDecorator[],
): ApplyDecoratorsResult {
  const state: MutableState = {
    additional_keys: [],
    reverse_depth_seen: false,
  };
  const applied: ParsedDecorator[] = [];
  const stashed: ParsedDecorator[] = [];
  const dropped: DroppedDecorator[] = [];

  // Suspend flag: true after a decorator returned false. The next @@@ line
  // consumes the suspend, the next @@ line clears it.
  let suspended = false;

  for (const dec of decorators) {
    if (dec.isFallback && !suspended) {
      // @@@<name> skipped because previous decorator did NOT suspend.
      continue;
    }
    suspended = false;

    const outcome = applyOne(dec, state);
    if (outcome.kind === "applied") {
      applied.push(dec);
    } else if (outcome.kind === "stashed") {
      stashed.push(dec);
      // Tier 2/3 are recognised by Risu, no suspend.
    } else {
      // Dropped: Risu would have suspended.
      dropped.push({ decorator: dec, reason: outcome.reason });
      suspended = true;
    }
  }

  const patch: Partial<LumiWorldBookEntry> = {};
  if (state.position !== undefined) patch.position = state.position;
  if (state.depth !== undefined) patch.depth = state.depth;
  if (state.role !== undefined) patch.role = state.role;
  if (state.scan_depth !== undefined) patch.scan_depth = state.scan_depth;
  if (state.priority !== undefined) patch.priority = state.priority;
  if (state.probability !== undefined) {
    patch.probability = state.probability;
    patch.use_probability = true;
  }
  if (state.match_whole_words !== undefined) patch.match_whole_words = state.match_whole_words;
  if (state.prevent_recursion !== undefined) patch.prevent_recursion = state.prevent_recursion;
  if (state.exclude_recursion !== undefined) patch.exclude_recursion = state.exclude_recursion;
  if (state.constant !== undefined) patch.constant = state.constant;
  if (state.disabled !== undefined) patch.disabled = state.disabled;
  if (state.additional_keys.length > 0) {
    patch.key = [...entry.key, ...state.additional_keys];
  }

  // Stash Tier 2/3 (and the reverse_depth note) on `extensions._risu_decorators`.
  if (stashed.length > 0 || state.reverse_depth_seen) {
    const ext = { ...entry.extensions };
    const stashedSerial = stashed.map((d) => ({
      name: d.name,
      args: [...d.args],
      ...(d.isFallback ? { fallback: true } : {}),
    }));
    if (state.reverse_depth_seen) {
      stashedSerial.push({ name: "_risu_reverse_depth_note", args: [
        "reverse_depth applied as Lumi position=4 depth=N. The reverse-from-start semantic needs a runtime intercept.",
      ] });
    }
    ext["_risu_decorators"] = stashedSerial;
    patch.extensions = ext;
  }

  return { patch, applied, stashed, dropped };
}


type ApplyOutcome =
  | { kind: "applied" }
  | { kind: "stashed"; reason: string }
  | { kind: "dropped"; reason: string };

function applyOne(dec: ParsedDecorator, state: MutableState): ApplyOutcome {
  const { name, args } = dec;
  switch (name) {
    case "position": {
      const v = args[0];
      if (v === undefined) return { kind: "dropped", reason: "missing position arg" };
      if (v === "before_desc") {
        state.position = 0; // Lumi `before`
        return { kind: "applied" };
      }
      if (v === "after_desc") {
        state.position = 1; // Lumi `after`
        return { kind: "applied" };
      }
      if (v === "personality" || v === "scenario" || v.startsWith("pt_")) {
        return { kind: "stashed", reason: `position=${v} has no Lumi equivalent` };
      }
      return { kind: "dropped", reason: `unknown position value: ${v}` };
    }
    case "depth": {
      const intArg = args[0];
      if (intArg === undefined) return { kind: "dropped", reason: "missing depth arg" };
      const n = parseInt(intArg, 10);
      if (Number.isNaN(n)) return { kind: "dropped", reason: `depth NaN: ${intArg}` };
      state.position = 4; // Lumi `depth`
      state.depth = n;
      return { kind: "applied" };
    }
    case "reverse_depth": {
      const intArg = args[0];
      if (intArg === undefined) return { kind: "dropped", reason: "missing reverse_depth arg" };
      const n = parseInt(intArg, 10);
      if (Number.isNaN(n)) return { kind: "dropped", reason: `reverse_depth NaN: ${intArg}` };
      // Risu reverse_depth counts from chat start, Lumi depth from end.
      // Approximation: keep depth value, flag divergence.
      state.position = 4;
      state.depth = n;
      state.reverse_depth_seen = true;
      return { kind: "applied" };
    }
    case "role": {
      const v = args[0];
      if (v === "user" || v === "assistant" || v === "system") {
        state.role = v;
        return { kind: "applied" };
      }
      return { kind: "dropped", reason: `invalid role: ${v}` };
    }
    case "scan_depth": {
      // NaN propagates as null (Lumi default), matching Risu's no-NaN-check.
      const intArg = args[0];
      if (intArg === undefined) return { kind: "applied" };
      const n = parseInt(intArg, 10);
      if (Number.isNaN(n)) return { kind: "applied" };
      state.scan_depth = n;
      return { kind: "applied" };
    }
    case "priority": {
      const intArg = args[0];
      if (intArg === undefined) return { kind: "dropped", reason: "missing priority arg" };
      const n = parseInt(intArg, 10);
      if (Number.isNaN(n)) return { kind: "dropped", reason: `priority NaN: ${intArg}` };
      state.priority = n;
      return { kind: "applied" };
    }
    case "ignore_on_max_context": {
      state.priority = -1000;
      return { kind: "applied" };
    }
    case "probability": {
      // Both engines use 0-100 scale, map directly.
      const intArg = args[0];
      if (intArg === undefined) return { kind: "dropped", reason: "missing probability arg" };
      const n = parseInt(intArg, 10);
      if (Number.isNaN(n)) return { kind: "dropped", reason: `probability NaN: ${intArg}` };
      state.probability = n;
      return { kind: "applied" };
    }
    case "additional_keys": {
      if (args.length === 0) return { kind: "applied" };
      for (const k of args) state.additional_keys.push(k);
      return { kind: "applied" };
    }
    case "match_full_word": {
      state.match_whole_words = true;
      return { kind: "applied" };
    }
    case "match_partial_word": {
      state.match_whole_words = false;
      return { kind: "applied" };
    }
    case "unrecursive": {
      // Skip recursive-prompt push: this entry's content doesn't propagate
      // into subsequent recursive scan passes.
      state.prevent_recursion = true;
      return { kind: "applied" };
    }
    case "recursive": {
      state.prevent_recursion = false;
      return { kind: "applied" };
    }
    case "no_recursive_search": {
      // Entry's keys are only matched against the original chat messages,
      // never against accumulated lorebook content. Activates only on pass 0.
      state.exclude_recursion = true;
      return { kind: "applied" };
    }
    case "activate": {
      state.constant = true;
      return { kind: "applied" };
    }
    case "dont_activate": {
      state.disabled = true;
      return { kind: "applied" };
    }
    case "end": {
      // No-op. Practical use is closing a @@@ fallback chain.
      return { kind: "applied" };
    }
    default: {
      if (TIER2_DECORATOR_NAMES.has(name)) {
        return { kind: "stashed", reason: `Tier 2: needs runtime intercept` };
      }
      return { kind: "dropped", reason: `unknown decorator: ${name}` };
    }
  }
}

// Recognised by Risu but not yet implemented in Lumi-side mapping.
// Stashed on extensions._risu_decorators for future runtime intercept.
const TIER2_DECORATOR_NAMES: ReadonlySet<string> = new Set([
  "is_greeting",
  "activate_only_after",
  "activate_only_every",
  "keep_activate_after_match",
  "dont_activate_after_match",
  "exclude_keys",
  "exclude_keys_all",
  "disable_ui_prompt",
  "is_user_icon",
  "instruct_depth",
  "reverse_instruct_depth",
  "instruct_scan_depth",
  "inject_lore",
  "inject_at",
  "inject_replace",
  "inject_prepend",
]);

/** Exported for use in the integration mapper + test verification. */
export const TIER1_DECORATORS = TIER1_DECORATOR_NAMES;
export const TIER2_DECORATORS = TIER2_DECORATOR_NAMES;
