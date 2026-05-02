
import type { PortalCandidate, StoredRegexScript } from "../payload/types.js";
import { PORTAL_ANALYZER_VERSION } from "../payload/types.js";

export interface PortalSelectors {
  readonly ids: ReadonlySet<string>;
  readonly classes: ReadonlySet<string>;
}

export const EMPTY_PORTAL_SELECTORS: PortalSelectors = {
  ids: new Set(),
  classes: new Set(),
};

export function extractPortalSelectors(css: string): PortalSelectors {
  if (!css || css.indexOf("position") < 0 || css.indexOf("fixed") < 0) {
    return EMPTY_PORTAL_SELECTORS;
  }
  const ids = new Set<string>();
  const classes = new Set<string>();
  walkCss(css, (selectorList, declarations) => {
    if (!declaresPositionFixed(declarations)) return;
    for (const sel of splitSelectorList(selectorList)) {
      collectSubjectIdsAndClasses(sel, ids, classes);
    }
  });
  return { ids, classes };
}

export function replacementNeedsPortal(
  replaceString: string,
  sel: PortalSelectors,
): boolean {
  if (!replaceString) return false;
  const inline = extractInlineStyleSelectors(replaceString);
  const ids = sel.ids.size === 0 ? inline.ids
    : inline.ids.size === 0 ? sel.ids
    : new Set([...sel.ids, ...inline.ids]);
  const classes = sel.classes.size === 0 ? inline.classes
    : inline.classes.size === 0 ? sel.classes
    : new Set([...sel.classes, ...inline.classes]);
  if (ids.size === 0 && classes.size === 0) {
    return hasInlineFixedStyle(replaceString);
  }
  return (
    scanHtmlForPortal(replaceString, { ids, classes })
    || hasInlineFixedStyle(replaceString)
  );
}

export function extractAnchoredPortalSelectors(css: string): PortalSelectors {
  const rules = extractDetailedFixedRules(css);
  if (rules.length === 0) return EMPTY_PORTAL_SELECTORS;
  const ids = new Set<string>();
  const classes = new Set<string>();
  for (const rule of rules) {
    if (rule.position !== "fixed") continue;
    const isAnchored =
      rule.has_explicit_anchor || (rule.z_index !== null && rule.z_index >= 1000);
    if (!isAnchored) continue;
    for (const id of rule.subjects.ids) ids.add(id);
    for (const cls of rule.subjects.classes) classes.add(cls);
  }
  return { ids, classes };
}

export function extractInlineAnchoredStyleSelectors(html: string): PortalSelectors {
  if (!html || html.indexOf("<style") < 0) return EMPTY_PORTAL_SELECTORS;
  const ids = new Set<string>();
  const classes = new Set<string>();
  const len = html.length;
  let i = 0;
  while (i < len) {
    const openStart = html.indexOf("<style", i);
    if (openStart < 0) break;
    const openEnd = html.indexOf(">", openStart);
    if (openEnd < 0) break;
    const closeStart = html.indexOf("</style", openEnd);
    if (closeStart < 0) break;
    const css = html.slice(openEnd + 1, closeStart);
    if (css.length > 0) {
      const partial = extractAnchoredPortalSelectors(css);
      for (const id of partial.ids) ids.add(id);
      for (const cls of partial.classes) classes.add(cls);
    }
    const closeEnd = html.indexOf(">", closeStart);
    i = closeEnd < 0 ? len : closeEnd + 1;
  }
  return { ids, classes };
}

export function extractInlineStyleSelectors(html: string): PortalSelectors {
  if (!html || html.indexOf("<style") < 0) return EMPTY_PORTAL_SELECTORS;
  const ids = new Set<string>();
  const classes = new Set<string>();
  const len = html.length;
  let i = 0;
  while (i < len) {
    const openStart = html.indexOf("<style", i);
    if (openStart < 0) break;
    // Skip attributes on the opening tag (e.g. `<style type="text/css">`).
    const openEnd = html.indexOf(">", openStart);
    if (openEnd < 0) break;
    // Risu card authors don't nest `<style>` tags, so a simple close-tag
    // search is enough. We match `</style` not the full `</style>` so
    // quirks like `</style >` still terminate cleanly.
    const closeStart = html.indexOf("</style", openEnd);
    if (closeStart < 0) break;
    const css = html.slice(openEnd + 1, closeStart);
    if (css.length > 0) {
      const partial = extractPortalSelectors(css);
      for (const id of partial.ids) ids.add(id);
      for (const cls of partial.classes) classes.add(cls);
    }
    const closeEnd = html.indexOf(">", closeStart);
    i = closeEnd < 0 ? len : closeEnd + 1;
  }
  return { ids, classes };
}

export const OUTERMOST_SKIP_TAGS: ReadonlySet<string> = new Set([
  "html", "head", "body", "meta", "link", "style", "script", "title", "template",
]);

export function outermostElementIsFixed(
  html: string,
  selectors: PortalSelectors,
): boolean {
  if (!html) return false;
  const inline = extractInlineStyleSelectors(html);
  const ids = selectors.ids.size === 0 ? inline.ids
    : inline.ids.size === 0 ? selectors.ids
    : new Set([...selectors.ids, ...inline.ids]);
  const classes = selectors.classes.size === 0 ? inline.classes
    : inline.classes.size === 0 ? selectors.classes
    : new Set([...selectors.classes, ...inline.classes]);
  const merged: PortalSelectors = { ids, classes };
  // Walk ALL depth-zero siblings, fixed element may not be first in DOM order.
  for (const openTag of iterateTopLevelOpenTags(html)) {
    if (openTagHasInlineFixed(openTag)) return true;
    if (openTagMatchesSelectors(openTag, merged)) return true;
  }
  return false;
}

function* iterateTopLevelOpenTags(html: string): Generator<string> {
  const len = html.length;
  let i = 0;
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt < 0) return;
    const next = html[lt + 1] ?? "";
    if (next === "!" || next === "?" || next === "/") {
      // doctype / comment / processing instruction / closing tag  - skip.
      const end = html.indexOf(">", lt);
      if (end < 0) return;
      i = end + 1;
      continue;
    }
    // Read tag name.
    let nameEnd = lt + 1;
    while (nameEnd < len && isOuterTagNameChar(html[nameEnd]!)) nameEnd++;
    if (nameEnd === lt + 1) {
      // `<` not followed by name (e.g. literal `<` in text). Skip past it.
      i = lt + 1;
      continue;
    }
    const tagName = html.slice(lt + 1, nameEnd).toLowerCase();
    // Find end of opening tag, respecting attribute string quoting.
    let openEnd = nameEnd;
    let inStr: string | null = null;
    while (openEnd < len) {
      const c = html[openEnd]!;
      if (inStr) {
        if (c === inStr) inStr = null;
      } else {
        if (c === '"' || c === "'") inStr = c;
        else if (c === ">") break;
      }
      openEnd++;
    }
    if (openEnd >= len) return;
    const openTag = html.slice(lt, openEnd + 1);
    if (OUTERMOST_SKIP_TAGS.has(tagName)) {
      // Drill INTO this wrapper's content (don't yield it; its
      // children are the real depth-zero siblings).
      i = openEnd + 1;
      continue;
    }
    yield openTag;
    const isVoid = openTag.endsWith("/>") ||
      VOID_TAGS_FOR_SIBLING_WALK.has(tagName);
    if (isVoid) {
      i = openEnd + 1;
      continue;
    }
    const past = findElementClose(html, openEnd + 1, tagName);
    if (past < 0) return;
    i = past;
  }
}

const VOID_TAGS_FOR_SIBLING_WALK = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "keygen", "link", "meta", "param", "source", "track", "wbr",
]);

function findElementClose(html: string, from: number, tagName: string): number {
  const len = html.length;
  const lname = tagName.toLowerCase();
  let i = from;
  let depth = 1;
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt < 0) return -1;
    const next = html[lt + 1] ?? "";
    if (next === "!" || next === "?") {
      const end = html.indexOf(">", lt);
      if (end < 0) return -1;
      i = end + 1;
      continue;
    }
    const isClose = next === "/";
    const nameStart = isClose ? lt + 2 : lt + 1;
    let nameEnd = nameStart;
    while (nameEnd < len && isOuterTagNameChar(html[nameEnd]!)) nameEnd++;
    const name = html.slice(nameStart, nameEnd).toLowerCase();
    if (name.length === 0) {
      i = lt + 1;
      continue;
    }
    let tagEnd = nameEnd;
    let inStr: string | null = null;
    while (tagEnd < len) {
      const c = html[tagEnd]!;
      if (inStr) {
        if (c === inStr) inStr = null;
      } else {
        if (c === '"' || c === "'") inStr = c;
        else if (c === ">") break;
      }
      tagEnd++;
    }
    if (tagEnd >= len) return -1;
    if (name === lname) {
      if (isClose) {
        depth--;
        if (depth === 0) return tagEnd + 1;
      } else {
        const isSelfClosing = html[tagEnd - 1] === "/"
          || VOID_TAGS_FOR_SIBLING_WALK.has(name);
        if (!isSelfClosing) depth++;
      }
    }
    i = tagEnd + 1;
  }
  return -1;
}

function isOuterTagNameChar(c: string): boolean {
  return (
    (c >= "a" && c <= "z")
    || (c >= "A" && c <= "Z")
    || (c >= "0" && c <= "9")
    || c === "-" || c === "_" || c === ":"
  );
}

export function openTagHasInlineFixed(openTag: string): boolean {
  const m = /\bstyle\s*=\s*(["'])([\s\S]*?)\1/i.exec(openTag);
  if (!m) return false;
  return /\bposition\s*:\s*fixed\b/i.test(m[2] ?? "");
}

export function openTagMatchesSelectors(
  openTag: string,
  selectors: PortalSelectors,
): boolean {
  if (selectors.classes.size > 0) {
    const cm = /\bclass\s*=\s*(["'])([\s\S]*?)\1/i.exec(openTag);
    if (cm) {
      const tokens = (cm[2] ?? "").split(/\s+/);
      for (const t of tokens) {
        if (t.length > 0 && selectors.classes.has(t)) return true;
      }
    }
  }
  if (selectors.ids.size > 0) {
    const im = /\bid\s*=\s*(["'])([\s\S]*?)\1/i.exec(openTag);
    if (im && selectors.ids.has(im[2] ?? "")) return true;
  }
  return false;
}

export function replacementTriggersIslanding(replaceString: string): boolean {
  if (!replaceString) return false;
  if (/<style[\s>]/i.test(replaceString)) return true;
  let count = 0;
  const re = /\bstyle\s*=/gi;
  while (re.exec(replaceString)) {
    if (++count >= 3) return true;
  }
  return false;
}


function walkCss(
  css: string,
  visit: (selectorList: string, declarations: string) => void,
): void {
  const len = css.length;
  let i = 0;
  while (i < len) {
    i = skipWsAndComments(css, i);
    if (i >= len) break;
    if (css[i] === "@") {
      i = handleAtRule(css, i, visit);
      continue;
    }
    // Plain style rule: read selectorList up to unescaped `{`.
    const selStart = i;
    while (i < len && css[i] !== "{") i++;
    if (i >= len) break;
    const selectorList = css.slice(selStart, i).trim();
    i++; // consume `{`
    const blockStart = i;
    i = skipToMatchingBrace(css, i);
    const declarations = css.slice(blockStart, i);
    if (i < len && css[i] === "}") i++; // consume `}`
    if (selectorList.length > 0) visit(selectorList, declarations);
  }
}

const NESTING_AT_RULES = new Set([
  "media",
  "supports",
  "container",
  "document",
  "-moz-document",
  "layer",
  "scope",
  "host",
]);

const KEYFRAMES_AT_RULES = new Set([
  "keyframes",
  "-webkit-keyframes",
  "-moz-keyframes",
  "-o-keyframes",
]);

function handleAtRule(
  css: string,
  start: number,
  visit: (selectorList: string, declarations: string) => void,
): number {
  const len = css.length;
  let i = start + 1; // past `@`
  const nameStart = i;
  while (i < len && /[a-zA-Z0-9_-]/.test(css[i]!)) i++;
  const name = css.slice(nameStart, i).toLowerCase();
  // Prelude = everything until `{` or `;` (whichever first).
  while (i < len && css[i] !== "{" && css[i] !== ";") i++;
  if (i >= len) return len;
  if (css[i] === ";") return i + 1; // at-rule with no block (e.g. @charset)
  i++; // consume `{`
  const blockStart = i;
  const blockEnd = skipToMatchingBrace(css, i);
  if (NESTING_AT_RULES.has(name)) {
    // Recurse through the nested body for more style rules.
    walkCss(css.slice(blockStart, blockEnd), visit);
  }
  if (KEYFRAMES_AT_RULES.has(name)) {
    // fall through
  }
  return blockEnd < len && css[blockEnd] === "}" ? blockEnd + 1 : blockEnd;
}

function skipWsAndComments(css: string, start: number): number {
  let i = start;
  const len = css.length;
  while (i < len) {
    const c = css[i]!;
    if (c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f") {
      i++;
      continue;
    }
    if (c === "/" && css[i + 1] === "*") {
      i += 2;
      while (i < len && !(css[i] === "*" && css[i + 1] === "/")) i++;
      if (i < len) i += 2; // consume `*/`
      continue;
    }
    break;
  }
  return i;
}

function skipToMatchingBrace(css: string, start: number): number {
  let i = start;
  let depth = 1;
  const len = css.length;
  while (i < len && depth > 0) {
    const c = css[i]!;
    if (c === "/" && css[i + 1] === "*") {
      i += 2;
      while (i < len && !(css[i] === "*" && css[i + 1] === "/")) i++;
      if (i < len) i += 2;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < len && css[i] !== quote) {
        if (css[i] === "\\" && i + 1 < len) i++;
        i++;
      }
      if (i < len) i++; // consume closing quote
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return len;
}

function declaresPositionFixed(decls: string): boolean {
  const stripped = stripComments(decls);
  let i = 0;
  const len = stripped.length;
  while (i < len) {
    const start = i;
    while (i < len && stripped[i] !== ";") i++;
    const decl = stripped.slice(start, i);
    if (isPositionFixedDecl(decl)) return true;
    if (i < len) i++; // consume `;`
  }
  return false;
}

function isPositionFixedDecl(decl: string): boolean {
  const colon = decl.indexOf(":");
  if (colon < 0) return false;
  const prop = decl.slice(0, colon).trim().toLowerCase();
  if (prop !== "position") return false;
  const value = decl.slice(colon + 1).toLowerCase();
  for (const tok of value.split(/[\s!]+/)) {
    if (tok === "fixed") return true;
  }
  return false;
}

function stripComments(s: string): string {
  if (s.indexOf("/*") < 0) return s;
  let out = "";
  let i = 0;
  const len = s.length;
  while (i < len) {
    if (s[i] === "/" && s[i + 1] === "*") {
      i += 2;
      while (i < len && !(s[i] === "*" && s[i + 1] === "/")) i++;
      if (i < len) i += 2;
      continue;
    }
    out += s[i];
    i++;
  }
  return out;
}


function splitSelectorList(list: string): string[] {
  const out: string[] = [];
  let depthP = 0;
  let depthB = 0;
  let start = 0;
  let inStr: string | null = null;
  for (let i = 0; i < list.length; i++) {
    const c = list[i]!;
    if (inStr) {
      if (c === "\\" && i + 1 < list.length) { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "(") depthP++;
    else if (c === ")") depthP--;
    else if (c === "[") depthB++;
    else if (c === "]") depthB--;
    else if (c === "," && depthP === 0 && depthB === 0) {
      const seg = list.slice(start, i).trim();
      if (seg.length > 0) out.push(seg);
      start = i + 1;
    }
  }
  const tail = list.slice(start).trim();
  if (tail.length > 0) out.push(tail);
  return out;
}

function collectSubjectIdsAndClasses(
  selector: string,
  ids: Set<string>,
  classes: Set<string>,
): void {
  const subject = rightmostSimpleSelector(selector);
  harvestFromSimpleSelector(subject, ids, classes);
}

function rightmostSimpleSelector(selector: string): string {
  const len = selector.length;
  const safe: boolean[] = new Array(len);
  let depthP = 0;
  let depthB = 0;
  let inStr: string | null = null;
  for (let i = 0; i < len; i++) {
    const c = selector[i]!;
    if (inStr) {
      safe[i] = false;
      if (c === "\\" && i + 1 < len) {
        safe[i + 1] = false;
        i++;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; safe[i] = false; continue; }
    if (c === "(") { depthP++; safe[i] = false; continue; }
    if (c === ")") { safe[i] = false; depthP--; continue; }
    if (c === "[") { depthB++; safe[i] = false; continue; }
    if (c === "]") { safe[i] = false; depthB--; continue; }
    safe[i] = depthP === 0 && depthB === 0;
  }
  for (let i = len - 1; i >= 0; i--) {
    if (!safe[i]) continue;
    const c = selector[i]!;
    if (c === ">" || c === "+" || c === "~" || c === " " || c === "\t" || c === "\n" || c === "\r") {
      return selector.slice(i + 1).trim();
    }
  }
  return selector.trim();
}

function harvestFromSimpleSelector(
  selector: string,
  ids: Set<string>,
  classes: Set<string>,
): void {
  const len = selector.length;
  let i = 0;
  while (i < len) {
    const c = selector[i]!;
    if (c === "#" || c === ".") {
      const marker = c;
      i++;
      const start = i;
      while (i < len) {
        const ch = selector[i]!;
        if (!isIdentChar(ch)) break;
        i++;
      }
      const name = selector.slice(start, i);
      if (name.length > 0) {
        if (marker === "#") ids.add(name);
        else classes.add(name);
      }
      continue;
    }
    if (c === "[") {
      i = skipAttrSelector(selector, i);
      continue;
    }
    if (c === "(") {
      const end = matchParen(selector, i);
      const inner = selector.slice(i + 1, end);
      for (const sub of splitSelectorList(inner)) {
        collectSubjectIdsAndClasses(sub, ids, classes);
      }
      i = end + 1;
      continue;
    }
    i++;
  }
}

function isIdentChar(c: string): boolean {
  return (
    (c >= "a" && c <= "z") ||
    (c >= "A" && c <= "Z") ||
    (c >= "0" && c <= "9") ||
    c === "-" ||
    c === "_" ||
    c === "\\"
  );
}

function skipAttrSelector(s: string, start: number): number {
  let i = start + 1;
  let inStr: string | null = null;
  while (i < s.length) {
    const c = s[i]!;
    if (inStr) {
      if (c === "\\" && i + 1 < s.length) { i += 2; continue; }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; i++; continue; }
    if (c === "]") return i + 1;
    i++;
  }
  return i;
}

function matchParen(s: string, start: number): number {
  let i = start + 1;
  let depth = 1;
  let inStr: string | null = null;
  while (i < s.length && depth > 0) {
    const c = s[i]!;
    if (inStr) {
      if (c === "\\" && i + 1 < s.length) { i += 2; continue; }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; i++; continue; }
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return i;
}


function scanHtmlForPortal(html: string, sel: PortalSelectors): boolean {
  const len = html.length;
  let i = 0;
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt < 0) return false;
    const next = html[lt + 1];
    // Skip closing tags, comments, doctypes, processing instructions, CDATA.
    if (next === "/" || next === "!" || next === "?") {
      i = lt + 1;
      continue;
    }
    // Read tag name first to ensure we're on an element tag.
    let tagEnd = lt + 1;
    while (tagEnd < len && /[a-zA-Z0-9]/.test(html[tagEnd]!)) tagEnd++;
    if (tagEnd === lt + 1) {
      i = lt + 1;
      continue;
    }
    let j = tagEnd;
    while (j < len && html[j] !== ">") {
      while (j < len && (html[j] === " " || html[j] === "\t" || html[j] === "\n" || html[j] === "\r")) j++;
      if (j >= len || html[j] === ">") break;
      if (html[j] === "/") { j++; continue; }
      const attrStart = j;
      while (j < len && html[j] !== "=" && html[j] !== ">" && html[j] !== " " && html[j] !== "\t" && html[j] !== "\n" && html[j] !== "\r" && html[j] !== "/") j++;
      const attrName = html.slice(attrStart, j).toLowerCase();
      while (j < len && (html[j] === " " || html[j] === "\t")) j++;
      if (html[j] !== "=") continue;
      j++; // consume `=`
      while (j < len && (html[j] === " " || html[j] === "\t")) j++;
      let value = "";
      if (html[j] === '"' || html[j] === "'") {
        const quote = html[j]!;
        j++;
        const valStart = j;
        while (j < len && html[j] !== quote) j++;
        value = html.slice(valStart, j);
        if (j < len) j++; // consume closing quote
      } else {
        const valStart = j;
        while (j < len && html[j] !== ">" && html[j] !== " " && html[j] !== "\t" && html[j] !== "\n" && html[j] !== "\r" && html[j] !== "/") j++;
        value = html.slice(valStart, j);
      }
      if (attrName === "id" && sel.ids.has(value.trim())) return true;
      if (attrName === "class") {
        for (const tok of value.split(/\s+/)) {
          if (tok.length > 0 && sel.classes.has(tok)) return true;
        }
      }
    }
    if (j < len && html[j] === ">") j++;
    i = j;
  }
  return false;
}

function hasInlineFixedStyle(html: string): boolean {
  const lower = html.toLowerCase();
  if (lower.indexOf("position") < 0 || lower.indexOf("fixed") < 0) return false;
  const len = lower.length;
  let i = 0;
  while (i < len) {
    const at = lower.indexOf("style", i);
    if (at < 0) return false;
    const prev = at > 0 ? lower[at - 1]! : "<";
    if (prev !== " " && prev !== "\t" && prev !== "\n" && prev !== "\"" && prev !== "'" && prev !== "<") {
      i = at + 5;
      continue;
    }
    let k = at + 5;
    while (k < len && (lower[k] === " " || lower[k] === "\t")) k++;
    if (lower[k] !== "=") { i = k; continue; }
    k++;
    while (k < len && (lower[k] === " " || lower[k] === "\t")) k++;
    const quote = lower[k];
    if (quote !== '"' && quote !== "'") { i = k; continue; }
    k++;
    const valStart = k;
    while (k < len && lower[k] !== quote) k++;
    const value = lower.slice(valStart, k);
    if (declaresPositionFixed(value)) return true;
    i = k + 1;
  }
  return false;
}

export function extractGetvarRefs(replaceString: string): readonly string[] {
  if (!replaceString || replaceString.indexOf("{{") < 0) return [];
  const out = new Set<string>();
  const re = /\{\{\s*(?:risu_)?(?:getvar|getglobalvar|getchatvar)\s*::\s*([^}:]+)/gi;
  let m;
  while ((m = re.exec(replaceString)) !== null) {
    const key = (m[1] ?? "").trim();
    if (key.length > 0) out.add(key);
  }
  return [...out];
}

export interface DetailedFixedRule {
  readonly subjects: PortalSelectors;
  readonly selector_text: string;
  readonly position: "fixed" | "sticky";
  readonly has_explicit_anchor: boolean;
  readonly z_index: number | null;
}

export function extractDetailedFixedRules(css: string): DetailedFixedRule[] {
  if (!css) return [];
  if (
    css.indexOf("position") < 0
    || (css.indexOf("fixed") < 0 && css.indexOf("sticky") < 0)
  ) {
    return [];
  }
  const out: DetailedFixedRule[] = [];
  walkCss(css, (selectorList, declarations) => {
    const stripped = stripComments(declarations);
    const pos = positionValue(stripped);
    if (pos !== "fixed" && pos !== "sticky") return;
    const has_explicit_anchor = hasExplicitAnchor(stripped);
    const z_index = readZIndex(stripped);
    for (const sel of splitSelectorList(selectorList)) {
      const ids = new Set<string>();
      const classes = new Set<string>();
      collectSubjectIdsAndClasses(sel, ids, classes);
      if (ids.size === 0 && classes.size === 0) continue;
      out.push({
        subjects: { ids, classes },
        selector_text: sel,
        position: pos,
        has_explicit_anchor,
        z_index,
      });
    }
  });
  return out;
}

function positionValue(decls: string): "fixed" | "sticky" | "absolute" | "relative" | "static" | "inherit" | "initial" | "unset" | null {
  let result: ReturnType<typeof positionValue> = null;
  let i = 0;
  const len = decls.length;
  while (i < len) {
    const start = i;
    while (i < len && decls[i] !== ";") i++;
    const decl = decls.slice(start, i);
    const colon = decl.indexOf(":");
    if (colon >= 0) {
      const prop = decl.slice(0, colon).trim().toLowerCase();
      if (prop === "position") {
        const value = decl.slice(colon + 1).toLowerCase();
        for (const tok of value.split(/[\s!]+/)) {
          if (tok === "fixed" || tok === "sticky" || tok === "absolute"
            || tok === "relative" || tok === "static" || tok === "inherit"
            || tok === "initial" || tok === "unset") {
            result = tok;
            break;
          }
        }
      }
    }
    if (i < len) i++;
  }
  return result;
}

function hasExplicitAnchor(decls: string): boolean {
  const anchors = new Set(["top", "right", "bottom", "left", "inset"]);
  let i = 0;
  const len = decls.length;
  while (i < len) {
    const start = i;
    while (i < len && decls[i] !== ";") i++;
    const decl = decls.slice(start, i);
    const colon = decl.indexOf(":");
    if (colon >= 0) {
      const prop = decl.slice(0, colon).trim().toLowerCase();
      if (anchors.has(prop)) {
        const value = decl.slice(colon + 1).trim().toLowerCase();
        // Strip `!important`.
        const cleaned = value.replace(/!important\b/, "").trim();
        if (cleaned.length > 0 && cleaned !== "auto") return true;
      }
    }
    if (i < len) i++;
  }
  return false;
}

function readZIndex(decls: string): number | null {
  let result: number | null = null;
  let i = 0;
  const len = decls.length;
  while (i < len) {
    const start = i;
    while (i < len && decls[i] !== ";") i++;
    const decl = decls.slice(start, i);
    const colon = decl.indexOf(":");
    if (colon >= 0) {
      const prop = decl.slice(0, colon).trim().toLowerCase();
      if (prop === "z-index") {
        const value = decl.slice(colon + 1).trim().replace(/!important\b/i, "").trim();
        const n = Number(value);
        if (Number.isFinite(n)) result = n;
      }
    }
    if (i < len) i++;
  }
  return result;
}

interface TopLevelSubtree {
  readonly html: string;
  readonly index: number;
}

function findTopLevelSubtrees(html: string): TopLevelSubtree[] {
  const out: TopLevelSubtree[] = [];
  const len = html.length;
  let i = 0;
  let subtreeIdx = 0;
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt < 0) break;
    const next = html[lt + 1];
    if (next === "/" || next === "!" || next === "?") {
      const end = html.indexOf(">", lt);
      if (end < 0) break;
      i = end + 1;
      continue;
    }
    let nameEnd = lt + 1;
    while (nameEnd < len && /[a-zA-Z0-9]/.test(html[nameEnd]!)) nameEnd++;
    if (nameEnd === lt + 1) {
      i = lt + 1;
      continue;
    }
    const tagName = html.slice(lt + 1, nameEnd).toLowerCase();
    const openTagEnd = findOpenTagEnd(html, nameEnd);
    if (openTagEnd < 0) break;
    let subtreeEnd: number;
    const isSelfClosing = html[openTagEnd - 1] === "/" || VOID_ELEMENTS.has(tagName);
    if (isSelfClosing) {
      subtreeEnd = openTagEnd + 1;
    } else if (RAW_TEXT_ELEMENTS.has(tagName)) {
      subtreeEnd = findRawClose(html, openTagEnd + 1, tagName);
      if (subtreeEnd < 0) subtreeEnd = len;
    } else {
      subtreeEnd = findMatchingClose(html, openTagEnd + 1, tagName);
      if (subtreeEnd < 0) subtreeEnd = len;
    }
    out.push({
      html: html.slice(lt, subtreeEnd),
      index: subtreeIdx++,
    });
    i = subtreeEnd;
  }
  return out;
}

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "source", "track", "wbr",
]);

const RAW_TEXT_ELEMENTS = new Set(["script", "style"]);

function findOpenTagEnd(html: string, fromPos: number): number {
  let i = fromPos;
  let inStr: string | null = null;
  while (i < html.length) {
    const c = html[i]!;
    if (inStr) {
      if (c === inStr) inStr = null;
    } else {
      if (c === '"' || c === "'") inStr = c;
      else if (c === ">") return i + 1;
    }
    i++;
  }
  return -1;
}

function findMatchingClose(html: string, fromPos: number, tagName: string): number {
  let depth = 1;
  let i = fromPos;
  const openMarker = `<${tagName}`;
  const closeMarker = `</${tagName}`;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf(openMarker, i);
    const nextClose = html.indexOf(closeMarker, i);
    if (nextClose < 0) return -1;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      const after = nextOpen + openMarker.length;
      const ch = html[after];
      if (ch === " " || ch === "\t" || ch === "\n" || ch === ">" || ch === "/") {
        const tagEnd = findOpenTagEnd(html, after);
        if (tagEnd < 0) return -1;
        if (html[tagEnd - 2] !== "/") depth++;
        i = tagEnd;
        continue;
      }
      i = nextOpen + 1;
      continue;
    }
    const closeEnd = html.indexOf(">", nextClose);
    if (closeEnd < 0) return -1;
    depth--;
    if (depth === 0) return closeEnd + 1;
    i = closeEnd + 1;
  }
  return -1;
}

function findRawClose(html: string, fromPos: number, tagName: string): number {
  const closeMarker = `</${tagName}`;
  const idx = html.indexOf(closeMarker, fromPos);
  if (idx < 0) return -1;
  const end = html.indexOf(">", idx);
  return end < 0 ? -1 : end + 1;
}

function findMatchingRules(subtreeHtml: string, rules: readonly DetailedFixedRule[]): DetailedFixedRule[] {
  if (rules.length === 0) return [];
  const matches: DetailedFixedRule[] = [];
  for (const rule of rules) {
    if (scanHtmlForPortal(subtreeHtml, rule.subjects)) {
      matches.push(rule);
    }
  }
  return matches;
}


function scoreConfidence(
  matches: readonly DetailedFixedRule[],
  hasInlineFixed: boolean,
): "high-yes" | "ambiguous" | "high-no" {
  if (hasInlineFixed) return "high-yes";
  if (matches.length === 0) return "high-no";
  for (const m of matches) {
    if (m.position === "fixed" && (m.has_explicit_anchor || (m.z_index !== null && m.z_index >= 1000))) {
      return "high-yes";
    }
  }
  return "ambiguous";
}

export function analyzeCardPortalCandidates(input: {
  readonly regexScripts: readonly StoredRegexScript[];
  readonly greetings: readonly string[];
  readonly bgHtmlCss: string;
}): readonly PortalCandidate[] {
  const bgRules = extractDetailedFixedRules(input.bgHtmlCss);
  const out: PortalCandidate[] = [];

  for (const rule of input.regexScripts) {
    const meta = rule.metadata as { _risu?: { is_strip_stub?: unknown } } | undefined;
    if (meta?._risu?.is_strip_stub === true) continue;
    if (rule.target !== "display") continue;
    if (!rule.replace_string) continue;

    const inlineCss = extractInlineCssFromHtml(rule.replace_string);
    const ruleInlineRules = extractDetailedFixedRules(inlineCss);
    const allRules = [...bgRules, ...ruleInlineRules];

    const subtrees = findTopLevelSubtrees(rule.replace_string);
    for (const sub of subtrees) {
      const matches = findMatchingRules(sub.html, allRules);
      const hasInlineFixed = hasInlineFixedStyle(sub.html);
      const confidence = scoreConfidence(matches, hasInlineFixed);
      if (confidence === "high-no") continue;

      const triggering = matches.map((m) => m.selector_text);
      const triggeringSource = inferTriggeringSource(matches, ruleInlineRules, bgRules, hasInlineFixed);
      out.push({
        id: `regex_rule:${rule.sort_order}:${sub.index}`,
        source: {
          kind: "regex_rule",
          sort_order: rule.sort_order,
          find_regex_preview: rule.find_regex.length > 80
            ? rule.find_regex.slice(0, 80) + "…"
            : rule.find_regex,
        },
        subtree_html: sub.html,
        triggering_selectors: triggering,
        triggering_css_source: triggeringSource,
        confidence,
        heuristic_decision: confidence === "high-yes" || confidence === "ambiguous"
          ? "portal"
          : "inline",
        analyzer_version: PORTAL_ANALYZER_VERSION,
      });
    }
  }

  for (let altIdx = 0; altIdx < input.greetings.length; altIdx++) {
    const greeting = input.greetings[altIdx]!;
    if (!greeting) continue;
    const inlineCss = extractInlineCssFromHtml(greeting);
    const greetingInlineRules = extractDetailedFixedRules(inlineCss);
    const allRules = [...bgRules, ...greetingInlineRules];

    const subtrees = findTopLevelSubtrees(greeting);
    for (const sub of subtrees) {
      const matches = findMatchingRules(sub.html, allRules);
      const hasInlineFixed = hasInlineFixedStyle(sub.html);
      const confidence = scoreConfidence(matches, hasInlineFixed);
      if (confidence === "high-no") continue;

      const triggering = matches.map((m) => m.selector_text);
      const triggeringSource = inferTriggeringSource(matches, greetingInlineRules, bgRules, hasInlineFixed);
      out.push({
        id: `greeting:${altIdx}:${sub.index}`,
        source: { kind: "greeting", alt_index: altIdx },
        subtree_html: sub.html,
        triggering_selectors: triggering,
        triggering_css_source: triggeringSource,
        confidence,
        heuristic_decision: "portal",
        analyzer_version: PORTAL_ANALYZER_VERSION,
      });
    }
  }

  return out;
}

export function extractInlineCssFromHtml(html: string): string {
  if (!html || html.indexOf("<style") < 0) return "";
  const parts: string[] = [];
  const len = html.length;
  let i = 0;
  while (i < len) {
    const openStart = html.indexOf("<style", i);
    if (openStart < 0) break;
    const openEnd = html.indexOf(">", openStart);
    if (openEnd < 0) break;
    const closeStart = html.indexOf("</style", openEnd);
    if (closeStart < 0) break;
    parts.push(html.slice(openEnd + 1, closeStart));
    const closeEnd = html.indexOf(">", closeStart);
    i = closeEnd < 0 ? len : closeEnd + 1;
  }
  return parts.join("\n");
}

function inferTriggeringSource(
  matches: readonly DetailedFixedRule[],
  containerInlineRules: readonly DetailedFixedRule[],
  bgRules: readonly DetailedFixedRule[],
  hasInlineFixed: boolean,
): "rule_inline_style" | "bg_html" | "both" | "inline_style_attr" {
  if (matches.length === 0 && hasInlineFixed) return "inline_style_attr";
  const fromInline = matches.some((m) => containerInlineRules.includes(m));
  const fromBg = matches.some((m) => bgRules.includes(m));
  if (fromInline && fromBg) return "both";
  if (fromInline) return "rule_inline_style";
  return "bg_html";
}
