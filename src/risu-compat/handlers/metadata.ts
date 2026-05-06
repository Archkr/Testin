import type { MacroHandler } from "../../core/cbs/index.js";
import { registry } from "../registry.js";
import { makeArray } from "../risu-helpers.js";

// Metadata and declare-style macros. Risu citations inline.

function register(name: string, handler: MacroHandler, description: string): void {
  registry.register({ name, handler, description, category: "Risu / Metadata", scoped: false });
}

// cbs.ts. Backed via temp scope so {{declared::NAME}} can read it in the same evaluation.
register("declare", (ctx, a) => {
  ctx.vars.set("temp", `__declared_${a[0] ?? ""}__`, "1");
  return "";
}, "Declares a marker; {{declared::NAME}} reads it. Backed by the temp-scope store.");

register("declared", (ctx, a) => {
  return ctx.vars.get("temp", `__declared_${a[0] ?? ""}__`) === "1" ? "1" : "0";
}, "Reads a declaration marker set by {{declare::NAME}}.");

// cbs.ts.
register("emotionlist", (ctx) => {
  return makeArray(ctx.character.emotionImages.map((e) => e.name));
}, "JSON array of emotion image names for the current character.");

// cbs.ts.
register("assetlist", (ctx) => {
  if (ctx.character.type === "group") return "";
  return makeArray(ctx.character.additionalAssets.map((a) => a.name));
}, "JSON array of additional asset names. '' for group characters.");

// cbs.ts.
register("prefillsupported", (ctx) => {
  return ctx.aiModel.startsWith("claude") ? "1" : "0";
}, "'1' if the current AI model id starts with 'claude' (Claude supports prefill).");

// cbs and prompt-assembly decode base64. Display path renders HTML.
register("file", (ctx, a) => {
  const decode = ctx.cbsContext || ctx.commit;
  if (!decode) return `<br><div class="x-risu-risu-file">${a[0] ?? ""}</div><br>`;
  const content = a[1] ?? "";
  try {
    return Buffer.from(content, "base64").toString("utf-8");
  } catch {
    return "";
  }
}, "Decodes base64 file content to UTF-8 (prompt and cbs paths); renders <div class=\"risu-file\">…</div> in display path.");

// cbs.ts.
register("chardisplayasset", (ctx) => {
  if (!ctx.character.prebuiltAssetCommand) return makeArray([]);
  const excludes = ctx.character.prebuiltAssetExclude;
  const list = ctx.character.additionalAssets
    .filter((a) => !excludes.includes(a.src))
    .map((a) => a.name);
  return makeArray(list);
}, "JSON array of character display assets, minus the excluded set. Empty array if prebuiltAssetCommand is off.");
