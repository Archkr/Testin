import type { MacroHandler } from "../../core/cbs/index.js";
import { decodeOpaqueBody } from "../../core/cbs/index.js";
import { registry } from "../registry.js";

// Opaque-block handlers. CBS rewriter output: {{risu_<kind>::[mode]::ENCODED_BODY}}.
// Semantics from parser.svelte.ts. Decode first, then transform.

function parseOpaqueArgs(args: readonly string[]): { mode: string | null; body: string } {
  if (args.length === 0) return { mode: null, body: "" };
  if (args.length === 1) return { mode: null, body: decodeOpaqueBody(args[0]!) };
  const raw = args[args.length - 1]!;
  const mode = args.slice(0, -1).join("::");
  return { mode, body: decodeOpaqueBody(raw) };
}

// parser.svelte.ts.
export const ignoreHandler: MacroHandler = () => "";

registry.register({
  name: "risu_ignore",
  handler: ignoreHandler,
  description: "Discards the block body and returns empty string.",
  category: "Risu / Control",
  scoped: false,
});

// parser.svelte.ts. Inner macros not evaluated; captured as literal before Lumiverse sees them.
export const pureHandler: MacroHandler = (_ctx, args) => {
  const { body } = parseOpaqueArgs(args);
  return body.trim();
};

registry.register({
  name: "risu_pure",
  handler: pureHandler,
  description: "Returns the block body as literal text without evaluating inner macros.",
  category: "Risu / Control",
  scoped: false,
});

// parser.svelte.ts. Backslash-escapes {{ }} to prevent downstream re-parse.
export const pureDisplayHandler: MacroHandler = (_ctx, args) => {
  const { body } = parseOpaqueArgs(args);
  return body.trim().replaceAll("{{", "\\{\\{").replaceAll("}}", "\\}\\}");
};

registry.register({
  name: "risu_pure_display",
  handler: pureDisplayHandler,
  description: "Returns the block body with {{ and }} backslash-escaped so nothing downstream re-parses them.",
  category: "Risu / Control",
  scoped: false,
});

// parser.svelte.ts, 1514-1516. Maps {}() to PUA chars. Honors mode=keep.
function risuEscape(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c === 0x7B) out += "\uE9B8";       // {
    else if (c === 0x7D) out += "\uE9B9";  // }
    else if (c === 0x28) out += "\uE9BA";  // (
    else if (c === 0x29) out += "\uE9BB";  // )
    else out += text[i];
  }
  return out;
}

export const escapeHandler: MacroHandler = (_ctx, args) => {
  const { mode, body } = parseOpaqueArgs(args);
  return risuEscape(mode === "keep" ? body : body.trim());
};

registry.register({
  name: "risu_escape",
  handler: escapeHandler,
  description: "Replaces { } ( ) with Private Use Area characters so they don't parse as macro/function syntax.",
  category: "Risu / Control",
  scoped: false,
});

// parser.svelte.ts.
export const codeHandler: MacroHandler = (_ctx, args) => {
  const { body } = parseOpaqueArgs(args);
  let s = body.trim().replaceAll("\n", "").replaceAll("\t", "");
  s = processUnicodeEscapes(s);
  s = processBackslashEscapes(s);
  return s;
};

registry.register({
  name: "risu_code",
  handler: codeHandler,
  description: "Normalizes a block of code text: trims, removes newlines/tabs, and processes backslash escape sequences.",
  category: "Risu / Control",
  scoped: false,
});

function processUnicodeEscapes(s: string): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && s[i + 1] === "u" && i + 6 <= s.length) {
      const hex = s.slice(i + 2, i + 6);
      if (/^[0-9A-Fa-f]{4}$/.test(hex)) {
        out += String.fromCharCode(parseInt(hex, 16));
        i += 6;
        continue;
      }
    }
    out += s[i];
    i++;
  }
  return out;
}

function processBackslashEscapes(s: string): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && i + 1 < s.length) {
      const next = s[i + 1]!;
      switch (next) {
        case "n": out += "\n"; break;
        case "r": out += "\r"; break;
        case "t": out += "\t"; break;
        case "b": out += "\b"; break;
        case "f": out += "\f"; break;
        case "v": out += "\v"; break;
        case "a": out += "\x07"; break;
        case "x": out += "\x00"; break;
        default: out += next;
      }
      i += 2;
      continue;
    }
    out += s[i];
    i++;
  }
  return out;
}
