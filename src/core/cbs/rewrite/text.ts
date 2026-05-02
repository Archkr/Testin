import type { CatalogIndex } from "../catalog/loader.js";
import { parseCbs, normalizeMacroName } from "../parser.js";
import { serialize } from "../serialize.js";
import { renameCollisions, RENAME_PREFIX } from "./rename.js";
import { rewriteBlocks } from "./blocks.js";

export function rewriteText(text: string, catalog: CatalogIndex): string {
  if (text === "" || text == null) return text;
  if (text.indexOf("{{") < 0 && text.indexOf("{#") < 0) return text;
  // {{? expr}} lives in raw arg strings the AST walk never descends into; fix at string level.
  const pre = rewriteArithShortcut(text);
  const parsed = parseCbs(pre);
  const renamed = renameCollisions(parsed, { catalog, prefix: RENAME_PREFIX });
  const blocks = rewriteBlocks(renamed.template);
  const serialized = serialize(blocks.template);
  // Post-pass: rename collision macros inside raw arg strings that the AST walk skips.
  return rewriteCollisionsInArgs(serialized, catalog);
}

function rewriteCollisionsInArgs(text: string, catalog: CatalogIndex): string {
  if (text.indexOf("{{") < 0) return text;
  const incompat = new Set<string>();
  for (const name of catalog.incompatibleNames()) {
    incompat.add(normalizeMacroName(name));
  }
  if (incompat.size === 0) return text;
  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    const at = text.indexOf("{{", i);
    if (at < 0) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, at);
    out += "{{";
    const start = at + 2;
    const c0 = text.charCodeAt(start);
    if (c0 === 0x23 /* # */ || c0 === 0x2f /* / */) {
      i = start;
      continue;
    }
    let end = start;
    while (end < n) {
      const c = text.charCodeAt(end);
      if (
        c === 0x3a /* : */ ||
        c === 0x7d /* } */ ||
        c === 0x20 /* space */ ||
        c === 0x0a /* \n */ ||
        c === 0x09 /* \t */ ||
        c === 0x7b /* { — a nested `{{` starts here */
      ) break;
      end++;
    }
    const name = text.slice(start, end);
    const lower = name.toLowerCase();
    if (lower.startsWith(RENAME_PREFIX)) {
      out += name;
      i = end;
      continue;
    }
    const norm = normalizeMacroName(name);
    if (norm.length > 0 && incompat.has(norm)) {
      out += RENAME_PREFIX + name;
    } else {
      out += name;
    }
    i = end;
  }
  return out;
}

function rewriteArithShortcut(text: string): string {
  if (text.indexOf("{{? ") < 0) return text;
  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    const at = text.indexOf("{{? ", i);
    if (at < 0) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, at);
    let depth = 1;
    let j = at + 4;
    while (j < n) {
      if (text.startsWith("{{", j)) { depth++; j += 2; continue; }
      if (text.startsWith("}}", j)) {
        depth--;
        if (depth === 0) break;
        j += 2;
        continue;
      }
      j++;
    }
    if (j >= n || depth !== 0) {
      out += text.slice(at);
      break;
    }
    const expr = text.slice(at + 4, j);
    out += `{{calc::${expr}}}`;
    i = j + 2;
  }
  return out;
}

export function rewriteTextMany(
  texts: readonly string[],
  catalog: CatalogIndex,
): readonly string[] {
  return texts.map((t) => rewriteText(t, catalog));
}
