import type { MacroHandler } from "../../core/cbs/index.js";
import { registry } from "../registry.js";

// Variable accessors. Risu source: cbs.ts.
// `getvar`/`setvar`/`addvar` use scope "local"; `getglobalvar` uses "global"; temp vars use "temp".
// Mutations always run; no dry-parse mode in this model.

function register(name: string, handler: MacroHandler, description: string): void {
  registry.register({ name, handler, description, category: "Risu / Variables", scoped: false });
}

// cbs.ts.
register("risu_getvar", (ctx, a) => ctx.vars.get("local", a[0] ?? ""),
  "Reads a local chat variable. Empty string if unset.");

register("risu_setvar", (ctx, a) => {
  ctx.vars.set("local", a[0] ?? "", a[1] ?? "");
  return "";
}, "Sets a local chat variable.");

register("risu_addvar", (ctx, a) => {
  ctx.vars.add("local", a[0] ?? "", Number(a[1] ?? "0"));
  return "";
}, "Adds delta to a local chat variable (coerces current value to number).");

register("setdefaultvar", (ctx, a) => {
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
register("deletevar", (ctx, a) => {
  ctx.vars.delete("local", a[0] ?? "");
  return "";
}, "Deletes a local chat variable.");
register("flushvar", (ctx, a) => {
  ctx.vars.delete("local", a[0] ?? "");
  return "";
}, "Alias of deletevar.");

// Catalog marks `getchatvar`/`setchatvar` as Lumi collisions; CBS rewriter prefixes them.
// Handler names must match the rewritten `risu_` form.
register("risu_getchatvar", (ctx, a) => ctx.vars.get("local", a[0] ?? ""),
  "Reads a chat-scoped variable (aliased to local in Risu).");
register("risu_setchatvar", (ctx, a) => {
  ctx.vars.set("local", a[0] ?? "", a[1] ?? "");
  return "";
}, "Sets a chat-scoped variable.");

// cbs.ts. Risu sets __force_return__ to stop processing; no equivalent stop here.
register("return", (_c, a) => a[0] ?? "",
  "Risu's {{return::value}} sets __force_return__ flag. We return the value but DO NOT stop further macro resolution — known deviation.");
