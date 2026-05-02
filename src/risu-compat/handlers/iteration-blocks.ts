import type { MacroHandler } from "../../core/cbs/index.js";
import { decodeOpaqueBody } from "../../core/cbs/index.js";
import { registry } from "../registry.js";

// Iteration/function blocks. Emitted as LEAF macros with the body Unicode-encoded (core/cbs/rewrite/blocks.ts).
// Known deviation: inner macros in the substituted output are not re-evaluated by Lumiverse.

// parser.svelte.ts.
function parseArray(s: string): unknown[] {
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return arr;
  } catch { /* fall through */ }
  return s.split("§");
}

function stringify(v: unknown): string {
  return typeof v === "string" ? v : JSON.stringify(v);
}

// parser.svelte.ts.
export const eachHandler: MacroHandler = (_ctx, args) => {
  if (args.length < 2) return "";
  const rawHeader = args[0]!;
  const encodedBody = args[args.length - 1]!;
  const body = decodeOpaqueBody(encodedBody);

  let header = rawHeader.trim();
  let mode: "normal" | "keep" = "normal";
  if (header.startsWith("::keep ")) {
    mode = "keep";
    header = header.substring(7).trim();
  } else if (header.startsWith("keep ")) {
    mode = "keep";
    header = header.substring(5).trim();
  }
  if (header.startsWith("as ")) header = header.substring(3).trim();

  let sub: string;
  let arrayExpr: string;
  const asIdx = header.lastIndexOf(" as ");
  if (asIdx !== -1) {
    sub = header.substring(asIdx + 4).trim();
    arrayExpr = header.substring(0, asIdx);
  } else {
    const spaceIdx = header.lastIndexOf(" ");
    if (spaceIdx === -1) return "";
    sub = header.substring(spaceIdx + 1).trim();
    arrayExpr = header.substring(0, spaceIdx);
  }

  const array = parseArray(arrayExpr);
  const needle = "{{slot::" + sub + "}}";
  let out = "";
  for (let i = 0; i < array.length; i++) {
    out += body.replaceAll(needle, stringify(array[i]));
  }
  return mode === "keep" ? out : out.trim();
};

registry.register({
  name: "risu_each",
  handler: eachHandler,
  description: "Iterates over a JSON or §-delimited array, substituting {{slot::name}} per iteration. Known deviation: inner macros are not re-evaluated per iteration.",
  category: "Risu / Control",
  scoped: false,
});

// parser.svelte.ts.
export const funcHandler: MacroHandler = (ctx, args) => {
  if (args.length < 2) return "";
  const header = args[0]!;
  const encodedBody = args[args.length - 1]!;
  const body = decodeOpaqueBody(encodedBody);
  const parts = header.trim().split(" ").filter((p) => p.length > 0);
  if (parts.length === 0) return "";
  const name = parts[0]!;
  const argNames = parts.slice(1);
  ctx.functions.define(name, body, argNames);
  return "";
};

registry.register({
  name: "risu_func",
  handler: funcHandler,
  description: "Defines a reusable function; later invoked via {{call::name::arg0::arg1}}. Arguments referenced in the body as {{arg::0}}, {{arg::1}}, etc.",
  category: "Risu / Control",
  scoped: false,
});

// Undefined function falls through to matcher() which emits {{...}} verbatim.
export const callHandler: MacroHandler = (ctx, args, raw) => {
  if (args.length === 0) return `{{${raw}}}`;
  const funcName = args[0]!;
  const fn = ctx.functions.get(funcName);
  if (!fn) return `{{${raw}}}`;
  let out = fn.body;
  for (let i = 0; i < args.length - 1; i++) {
    out = out.replaceAll("{{arg::" + i + "}}", args[i + 1] ?? "");
  }
  for (let i = args.length - 1; i < fn.argNames.length + 10; i++) {
    out = out.replaceAll("{{arg::" + i + "}}", "");
  }
  return out;
};

registry.register({
  name: "call",
  handler: callHandler,
  description: "Invokes a function previously defined by #func. Arguments are passed as additional :: tokens and referenced inside the function body as {{arg::0}}, {{arg::1}}, …",
  category: "Risu / Control",
  scoped: false,
});

// parser.svelte.ts. Only 'if' supported in legacy form. Emits a modern risu_if
// scoped block so the scanner's OPAQUE_TRAMPOLINE re-scan resolves CBS in cond
// (e.g. `{{equal::{{getvar::bahasa}}::0}}`) before the truthy check.
export const legacyHandler: MacroHandler = (_ctx, args) => {
  if (args.length === 0) return "";
  const raw = decodeOpaqueBody(args[0]!);
  const nl = raw.indexOf("\n");
  if (nl === -1) return "";
  const logic = raw.substring(0, nl);
  const content = raw.substring(nl + 1);
  const [keyword, condRaw] = splitOnce(logic, " ");
  if (keyword !== "if") return "";
  const cond = (condRaw ?? "").trim();
  if (cond.length === 0) return "";
  return `{{#risu_if::${cond}}}${content}{{/risu_if}}`;
};

registry.register({
  name: "risu_legacy",
  handler: legacyHandler,
  description: "Legacy {#if cond\\ncontent#} form. Returns trimmed content if cond is not '', '0', or '-1'.",
  category: "Risu / Control",
  scoped: false,
});

function splitOnce(s: string, sep: string): [string, string | null] {
  const idx = s.indexOf(sep);
  if (idx === -1) return [s, null];
  return [s.substring(0, idx), s.substring(idx + sep.length)];
}
