import type { ScriptPackEntry, ScriptBindingEntry } from "../pipeline/types.js";
import type { CatalogIndex } from "../cbs/catalog/loader.js";
import { rewriteText } from "../cbs/rewrite/text.js";
import { applyIframePolicy } from "./iframe-policy.js";


const SHORTHAND_MARKER_START = "{";

export interface BuildBackgroundHtmlOptions {
  readonly characterId: string;
  readonly characterName?: string;
  readonly catalog?: CatalogIndex;
  readonly runtimeLibrary?: string;
}

export interface BuildBackgroundHtmlResult {
  readonly file: ScriptPackEntry | null;
  readonly issues: readonly { path: string; message: string }[];
}

export function buildBackgroundHtmlScript(
  html: string | null,
  opts: BuildBackgroundHtmlOptions,
): BuildBackgroundHtmlResult {
  if (typeof html !== "string" || html.length === 0) return { file: null, issues: [] };
  const issues: { path: string; message: string }[] = [];

  const expanded = expandShorthand(html);
  const cbsRewritten = opts.catalog ? rewriteText(expanded, opts.catalog) : expanded;
  // Risu parity: rewrite YouTube `embed/` iframes to a click-through anchor;
  // strip all other iframes. See iframe-policy.ts. Bg-html is rendered into a
  // shadow-DOM mount that is also subject to Lumi's sanitizer + the
  // document-level CSP `frame-src 'self' blob:` (so direct YouTube iframes
  // wouldn't load anyway).
  const rewritten = applyIframePolicy(cbsRewritten).html;

  const bindings: readonly ScriptBindingEntry[] = [
    {
      type: "character",
      characterId: opts.characterId,
      displayName: opts.characterName ?? opts.characterId,
    },
  ];

  const code = renderCode({
    html: rewritten,
    characterId: opts.characterId,
    runtimeLib: opts.runtimeLibrary ?? "risu-compat",
  });

  const entry: ScriptPackEntry = {
    name: "risu-bg-html",
    code,
    type: "trigger",
    triggers: ["CHAT_CHANGED", "ls:startup"],
    bindings,
    folder: "risu/background-html",
    path: "scripts/background-html/risu-bg-html.js",
  };

  return { file: entry, issues };
}

export function expandShorthand(src: string): string {
  const n = src.length;
  const out: string[] = [];
  let i = 0;
  let runStart = 0;
  while (i < n) {
    const c = src.charCodeAt(i);
    if (c === 0x7b /* { */) {
      if (i + 1 < n && src.charCodeAt(i + 1) === 0x7b) {
        i += 2;
        continue;
      }
      let j = i + 1;
      if (j >= n) break;
      const first = src.charCodeAt(j);
      if (!isIdentStart(first)) {
        i++;
        continue;
      }
      j++;
      while (j < n && isIdentCont(src.charCodeAt(j))) j++;
      if (j < n && src.charCodeAt(j) === 0x7d && j - i > 1) {
        out.push(src.slice(runStart, i));
        out.push("{{getvar::", src.slice(i + 1, j), "}}");
        i = j + 1;
        runStart = i;
        continue;
      }
      i = j;
      continue;
    }
    i++;
  }
  out.push(src.slice(runStart, n));
  return out.join("");
}

function isIdentStart(c: number): boolean {
  return (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || c === 0x5f;
}

function isIdentCont(c: number): boolean {
  return isIdentStart(c) || (c >= 0x30 && c <= 0x39);
}

interface RenderArgs {
  readonly html: string;
  readonly characterId: string;
  readonly runtimeLib: string;
}

function renderCode(a: RenderArgs): string {
  void a.runtimeLib;
  const frontmatter = [
    `// @name       risu-bg-html`,
    `// @type       trigger`,
    `// @triggers   CHAT_CHANGED, ls:startup`,
    `// @folder     risu/background-html`,
    `// @description LumiRealm translated backgroundHTML (character ${a.characterId})`,
  ].join("\n");

  return [
    frontmatter,
    ``,
    `const HTML = ${JSON.stringify(a.html)};`,
    ``,
    `let resolved = HTML;`,
    `try {`,
    `  if (api && api.utils && api.utils.template && typeof api.utils.template.render === "function") {`,
    `    resolved = await api.utils.template.render(HTML, {}, { macrosOnly: true });`,
    `  }`,
    `} catch (e) { /* keep raw HTML on failure */ }`,
    ``,
    `try {`,
    `  if (api && api.ui && api.ui.dom && typeof api.ui.dom.setBackgroundHtml === "function") {`,
    `    await api.ui.dom.setBackgroundHtml(resolved);`,
    `  } else if (api && api.broadcast && typeof api.broadcast.emit === "function") {`,
    `    api.broadcast.emit("risu:bg-html", { html: resolved, characterId: ${JSON.stringify(a.characterId)} });`,
    `  }`,
    `} catch (e) { /* swallow — best-effort paint */ }`,
    ``,
  ].join("\n");
}
