import type { MacroHandler } from "../../core/cbs/index.js";
import { registry } from "../registry.js";
import { dateTimeFormat, makeArray } from "../risu-helpers.js";

// Small utility macros (Risu parity).

function register(name: string, handler: MacroHandler, description: string): void {
  registry.register({ name, handler, description, category: "Risu / Misc", scoped: false });
}

register("u", (_c, a) => String.fromCharCode(parseInt(a[0] ?? "0", 16)),
  "Returns the character for a hex codepoint.");
register("ue", (_c, a) => String.fromCharCode(parseInt(a[0] ?? "0", 16)),
  "Alias for {{u}}.");

register("unicodeencode", (_c, a) => (a[0] ?? "").charCodeAt(a[1] ? Number(a[1]) : 0).toString(),
  "Returns the Unicode code point of a character at the given index (default 0).");
register("unicodedecode", (_c, a) => String.fromCharCode(Number(a[0] ?? "0")),
  "Converts a Unicode code point back to a character.");

register("fromhex", (_c, a) => Number.parseInt(a[0] ?? "0", 16).toString(),
  "Converts a hex string to decimal.");
register("tohex", (_c, a) => Number.parseInt(a[0] ?? "0").toString(16),
  "Converts a decimal number to hex.");

register("xor", (_c, a) => {
  const bytes = new TextEncoder().encode(a[0] ?? "");
  for (let i = 0; i < bytes.length; i++) bytes[i]! ^= 0xFF;
  return Buffer.from(bytes).toString("base64");
}, "XOR-encrypts a string with 0xFF and base64-encodes.");

register("xordecrypt", (_c, a) => {
  const bytes: Uint8Array = Buffer.from(a[0] ?? "", "base64");
  for (let i = 0; i < bytes.length; i++) bytes[i]! ^= 0xFF;
  return new TextDecoder().decode(bytes);
}, "Decrypts an XOR-encrypted base64 string.");

register("crypt", (_c, a) => {
  let shift = a[1] ? Number(a[1]) : 32768;
  if (isNaN(shift)) shift = 32768;
  const input = a[0] ?? "";
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code > 65535) { result += input[i]; continue; }
    let shifted = code + shift;
    if (shifted > 65535) shifted -= 65536;
    result += String.fromCharCode(shifted);
  }
  return result;
}, "Caesar-style Unicode shift cipher (default shift 32768 which self-inverts).");

register("risu_date", (ctx, a) => {
  if (a.length === 0) {
    const d = new Date(ctx.clock.now());
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  const t = a[1] ? Number(a[1]) : 0;
  return dateTimeFormat(a[0] ?? "", isNaN(t) ? 0 : t);
}, "Formats a date. No args → YYYY-M-D. First arg is format, optional second arg is unix ms.");

register("datetimeformat", (ctx, a) => {
  if (a.length === 0) {
    const d = new Date(ctx.clock.now());
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  const t = a[1] ? Number(a[1]) : 0;
  return dateTimeFormat(a[0] ?? "", isNaN(t) ? 0 : t);
}, "Alias of {{date::fmt}}.");

register("hiddenkey", () => "",
  "A key that activates lorebook entries without being sent to the model.");

// Empty at prompt time. Display renders as <div class="risu-comment">.
register("risu_comment", (ctx, a) => {
  if (ctx.commit) return "";
  // Pre-prefixed to match Risu's `.x-risu-risu-comment` rule (parser
  // double-prefixes since the source class already starts with `risu-`).
  return `<div class="x-risu-risu-comment">${a[0] ?? ""}</div>`;
}, "Comment macro. Empty at prompt time; displays as <div class=\"risu-comment\">…</div> at render time.");

// `//` inline comment.
registry.register({
  name: "//",
  handler: () => "",
  description: "Inline comment. Returns empty string.",
  category: "Risu / Misc",
  scoped: false,
});

// Display-only HTML wrappers.
register("tex", (_c, a) => `$$${a[0] ?? ""}$$`,
  "LaTeX/math block.");
register("ruby", (_c, a) => `<ruby>${a[0] ?? ""}<rp> (</rp><rt>${a[1] ?? ""}</rt><rp>) </rp></ruby>`,
  "Ruby (furigana) HTML wrapper.");
register("codeblock", (_c, a) => {
  const code = (a[a.length - 1] ?? "")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (a.length > 1) return `<pre-hljs-placeholder lang="${a[0]}">${code}</pre-hljs-placeholder>`;
  return `<pre><code>${code}</code></pre>`;
}, "Code-block HTML wrapper. One arg → plain. Two args → highlighted, first is lang.");
register("risu", (_c, a) => {
  const size = a[0] || "45";
  return `<img src="/logo2.png" style="height:${size}px;width:${size}px" />`;
}, "Embeds the RisuAI logo image.");

// Pre-prefixed `x-risu-button-default` to match Risu's compiled stylesheet.
// Macro output skips the class-rewrite parser pass, so emit post-rewrite directly.
const BUTTON_LABEL_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
register("button", (_c, a) => {
  const label = (a[0] ?? "").replace(/[&<>]/g, (c) => BUTTON_LABEL_ESCAPES[c]!);
  const trigger = (a[1] ?? "").replace(/"/g, "&quot;");
  return `<button class="x-risu-button-default" risu-trigger="${trigger}">${label}</button>`;
}, "HTML button that fires the named risu-trigger when clicked.");

// Frontend-reported viewport size. 0 before first report.
register("screenwidth", (ctx) => String(ctx.screenWidth ?? 0),
  "Viewport width in pixels. Read from the frontend-reported value; 0 before the first report.");
register("screenheight", (ctx) => String(ctx.screenHeight ?? 0),
  "Viewport height in pixels. Read from the frontend-reported value; 0 before the first report.");

// Check if a module with the given namespace is attached.
register("moduleenabled", (ctx, a) => {
  const ns = a[0] ?? "";
  if (ns.length === 0) return "0";
  const map = ctx.modulesByNamespace;
  if (map && map[ns]) return "1";
  return "0";
}, "Returns 1 if a module with the specified namespace is attached, 0 otherwise.");

// Filter modules by namespace, return JSON array of asset names.
register("moduleassetlist", (ctx, a) => {
  const ns = a[0] ?? "";
  if (ns.length === 0) return "";
  const map = ctx.modulesByNamespace;
  if (!map) return "";
  const list = map[ns];
  if (!list || list.length === 0) return "";
  return makeArray(list);
}, "Returns a JSON array of asset names for the specified module namespace. Returns empty string if namespace not found.");

// Subset: model fields read from ctx.aiModel, platform fields default to non-native.
register("metadata", (ctx, a) => {
  const key = (a[0] ?? "").toLocaleLowerCase();
  switch (key) {
    case "imateapot": return "🫖";
    case "mobile": case "local": case "node": return "0";
    case "risutype": return "web";
    case "modelname": case "modelshortname": case "modelinternalid": return ctx.aiModel || "";
    default: return `Error: ${a[0]} is not a valid metadata key.`;
  }
}, "Returns host metadata. Subset implemented — model fields read from ctx.aiModel; platform fields default to non-native.");

register("chatindex", (ctx) => {
  // Reads ctx.currentMessageIndex. cbs callers set it to -1.
  const idx = ctx.currentMessageIndex;
  return idx === null ? "" : idx.toString();
}, "Index of the current message being processed. Risu cbs() default returns -1.");

// chat.fmIndex (selected alternate greeting index, -1 = default firstMessage).
register("firstmsgindex", (ctx) => {
  const idx = ctx.character.selectedAlternateGreetingIndex;
  return String(typeof idx === "number" ? idx : -1);
}, "Returns chat.fmIndex (selected alternate greeting index). -1 = default firstMessage.");

