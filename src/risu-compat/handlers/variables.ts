import type { MacroHandler } from "../../core/cbs/index.js";
import { registry } from "../registry.js";

// Variable accessors. Risu source: cbs.ts.
// `getvar`/`setvar`/`addvar` use scope "local"; `getglobalvar` uses "global"; temp vars use "temp".
// Mutations always run; no dry-parse mode in this model.

function register(name: string, handler: MacroHandler, description: string): void {
  registry.register({ name, handler, description, category: "Risu / Variables", scoped: false });
}

// Risu's setvar family executes ONLY when runVar is true (cbs.ts:827-836). The
// display pass (our !commit) and the inline prompt-regex/editprocess pass (our
// promptRegexLiteralVars — Risu's editprocess runs risuChatParser without runVar)
// both leave runVar unset, so the macro returns null and the parser re-emits it
// LITERAL (parser.svelte.ts:1764). Only the real generation commit pass executes.
function leaveVarLiteral(ctx: { commit: boolean; promptRegexLiteralVars?: boolean }): boolean {
  return !ctx.commit || ctx.promptRegexLiteralVars === true;
}

// cbs.ts.
register("risu_getvar", (ctx, a) => ctx.vars.get("local", a[0] ?? ""),
  "Reads a local chat variable. Empty string if unset.");

// In cbs (rmVar:false, runVar:false) Risu returns null and the parser emits
// the macro literal. Match on !commit.
register("risu_setvar", (ctx, a) => {
  if (leaveVarLiteral(ctx)) return `{{setvar::${(a[0] ?? "")}::${(a[1] ?? "")}}}`;
  ctx.vars.set("local", a[0] ?? "", a[1] ?? "");
  return "";
}, "Sets a local chat variable.");

register("risu_addvar", (ctx, a) => {
  if (leaveVarLiteral(ctx)) return `{{addvar::${(a[0] ?? "")}::${(a[1] ?? "")}}}`;
  ctx.vars.add("local", a[0] ?? "", Number(a[1] ?? "0"));
  return "";
}, "Adds delta to a local chat variable (coerces current value to number).");

register("setdefaultvar", (ctx, a) => {
  if (leaveVarLiteral(ctx)) return `{{setdefaultvar::${(a[0] ?? "")}::${(a[1] ?? "")}}}`;
  // cbs.ts. Falsy check; unset and empty both match.
  const name = a[0] ?? "";
  if (!ctx.vars.get("local", name)) {
    ctx.vars.set("local", name, a[1] ?? "");
  }
  return "";
}, "Sets a local chat variable only if its current value is falsy (unset or empty).");

// cbs.ts.
register("getglobalvar", (ctx, a) => ctx.vars.get("global", a[0] ?? ""),
  "Reads a global chat variable.");

// cbs.ts. Per-parser-run scope in Risu; backed by "temp" scope here.
register("tempvar", (ctx, a) => ctx.vars.get("temp", a[0] ?? ""),
  "Reads a temporary variable (per-evaluation scope).");

register("settempvar", (ctx, a) => {
  ctx.vars.set("temp", a[0] ?? "", a[1] ?? "");
  return "";
}, "Sets a temporary variable.");

// Risu exposes flushvar mainly via triggers; registering here for parity.
// Not in Risu cbs.ts → matcher returns null in cbs context → emit literal.
register("deletevar", (ctx, a) => {
  if (leaveVarLiteral(ctx)) return `{{deletevar::${(a[0] ?? "")}}}`;
  ctx.vars.delete("local", a[0] ?? "");
  return "";
}, "Deletes a local chat variable.");
register("flushvar", (ctx, a) => {
  if (leaveVarLiteral(ctx)) return `{{flushvar::${(a[0] ?? "")}}}`;
  ctx.vars.delete("local", a[0] ?? "");
  return "";
}, "Alias of deletevar.");

// Catalog marks `getchatvar`/`setchatvar` as Lumi collisions; CBS rewriter prefixes them.
// Handler names must match the rewritten `risu_` form.
register("risu_getchatvar", (ctx, a) => ctx.vars.get("local", a[0] ?? ""),
  "Reads a chat-scoped variable (aliased to local in Risu).");
register("risu_setchatvar", (ctx, a) => {
  if (leaveVarLiteral(ctx)) return `{{setchatvar::${(a[0] ?? "")}::${(a[1] ?? "")}}}`;
  ctx.vars.set("local", a[0] ?? "", a[1] ?? "");
  return "";
}, "Sets a chat-scoped variable.");

// Risu cbs.ts: writes __force_return__/__return__ to tempvar so parser short-circuits on next macro. Scanner check at leaf-dispatch site mirrors parser.svelte.ts.
register("return", (ctx, a) => {
  ctx.vars.set("temp", "__force_return__", "1");
  ctx.vars.set("temp", "__return__", a[0] ?? "");
  return "";
}, "Halts further macro resolution, returns the given value as the entire parser output (Risu parity).");
