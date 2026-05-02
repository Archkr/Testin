
import {
  type PortalSelectors,
  EMPTY_PORTAL_SELECTORS,
  OUTERMOST_SKIP_TAGS,
  openTagHasInlineFixed,
  openTagMatchesSelectors,
  replacementNeedsPortal,
  extractInlineStyleSelectors,
  extractInlineAnchoredStyleSelectors,
} from "./portal-analyze.js";

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "keygen", "link", "meta", "param", "source", "track", "wbr",
]);

const RAW_TEXT_ELEMENTS = new Set(["script", "style", "textarea", "title"]);

export function wrapFixedPositionRegions(
  html: string,
  selectors: PortalSelectors,
  source: string = "lua",
): string {
  if (!html || html.length === 0) return html;
  if (!replacementNeedsPortal(html, selectors)) return html;
  const inline = extractInlineStyleSelectors(html);
  const sel: PortalSelectors = {
    ids: unionSet(selectors.ids, inline.ids),
    classes: unionSet(selectors.classes, inline.classes),
  };

  const tagAttr = sanitizeSourceToken(source);
  const wrapOpen = `<div data-risu-portal="${tagAttr}">`;
  const wrapClose = `</div>`;

  const out: string[] = [];
  const len = html.length;
  let i = 0;
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt < 0) {
      out.push(html.slice(i));
      break;
    }
    if (lt > i) out.push(html.slice(i, lt));

    const next = html[lt + 1];
    if (next === "/" || next === "!" || next === "?") {
      const end = html.indexOf(">", lt);
      if (end < 0) {
        out.push(html.slice(lt));
        i = len;
        break;
      }
      out.push(html.slice(lt, end + 1));
      i = end + 1;
      continue;
    }

    let nameEnd = lt + 1;
    while (nameEnd < len && isTagNameChar(html[nameEnd]!)) nameEnd++;
    if (nameEnd === lt + 1) {
      out.push("<");
      i = lt + 1;
      continue;
    }
    const tagName = html.slice(lt + 1, nameEnd).toLowerCase();

    const openTagEnd = findOpenTagEnd(html, nameEnd);
    if (openTagEnd < 0) {
      out.push(html.slice(lt));
      i = len;
      break;
    }
    const isSelfClosing = html[openTagEnd - 1] === "/" || VOID_ELEMENTS.has(tagName);
    const subtreeStart = lt;
    let subtreeEnd: number;
    if (isSelfClosing) {
      subtreeEnd = openTagEnd + 1;
    } else if (RAW_TEXT_ELEMENTS.has(tagName)) {
      const closeIdx = findRawClose(html, openTagEnd + 1, tagName);
      subtreeEnd = closeIdx >= 0 ? closeIdx : len;
    } else {
      subtreeEnd = findMatchingClose(html, openTagEnd + 1, tagName);
      if (subtreeEnd < 0) subtreeEnd = len;
    }

    const subtree = html.slice(subtreeStart, subtreeEnd);

    const alreadyWrapped = isPortalWrapper(html, lt, openTagEnd);

    if (!alreadyWrapped && replacementNeedsPortal(subtree, sel)) {
      out.push(wrapOpen);
      out.push(subtree);
      out.push(wrapClose);
    } else {
      out.push(subtree);
    }
    i = subtreeEnd;
  }
  return out.join("");
}


function isTagNameChar(c: string): boolean {
  return (
    (c >= "a" && c <= "z") ||
    (c >= "A" && c <= "Z") ||
    (c >= "0" && c <= "9") ||
    c === "-" ||
    c === "_" ||
    c === ":"
  );
}

function findOpenTagEnd(html: string, from: number): number {
  const len = html.length;
  let i = from;
  let inStr: string | null = null;
  while (i < len) {
    const c = html[i]!;
    if (inStr) {
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = c;
      i++;
      continue;
    }
    if (c === ">") return i;
    i++;
  }
  return -1;
}

function findMatchingClose(html: string, from: number, name: string): number {
  const len = html.length;
  const lname = name.toLowerCase();
  let i = from;
  let depth = 1;
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt < 0) return -1;
    const next = html[lt + 1];
    if (next === "!" || next === "?") {
      const end = html.indexOf(">", lt);
      if (end < 0) return -1;
      i = end + 1;
      continue;
    }
    let isClose = false;
    let nameStart = lt + 1;
    if (next === "/") {
      isClose = true;
      nameStart = lt + 2;
    }
    let nameEnd = nameStart;
    while (nameEnd < len && isTagNameChar(html[nameEnd]!)) nameEnd++;
    const tagName = html.slice(nameStart, nameEnd).toLowerCase();
    if (tagName.length === 0) {
      i = lt + 1;
      continue;
    }
    const tagEnd = findOpenTagEnd(html, nameEnd);
    if (tagEnd < 0) return -1;

    if (tagName === lname) {
      if (isClose) {
        depth--;
        if (depth === 0) return tagEnd + 1;
      } else {
        // Same-name open.
        const isSelfClosing =
          html[tagEnd - 1] === "/" || VOID_ELEMENTS.has(tagName);
        if (!isSelfClosing) depth++;
      }
    } else if (!isClose) {
      if (RAW_TEXT_ELEMENTS.has(tagName)) {
        const rawClose = findRawClose(html, tagEnd + 1, tagName);
        i = rawClose >= 0 ? rawClose : len;
        continue;
      }
    }
    i = tagEnd + 1;
  }
  return -1;
}

function findRawClose(html: string, from: number, name: string): number {
  const lname = name.toLowerCase();
  const target = "</" + lname;
  const len = html.length;
  let i = from;
  while (i < len) {
    const idx = html.toLowerCase().indexOf(target, i);
    if (idx < 0) return -1;
    const after = html[idx + target.length] ?? "";
    if (after === ">" || after === " " || after === "\t" || after === "\n" || after === "\r") {
      const end = html.indexOf(">", idx + target.length);
      if (end < 0) return -1;
      return end + 1;
    }
    i = idx + target.length;
  }
  return -1;
}

function isPortalWrapper(html: string, ltStart: number, openTagEnd: number): boolean {
  return html.slice(ltStart, openTagEnd + 1).indexOf("data-risu-portal") >= 0;
}

function unionSet<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T> {
  if (a.size === 0) return b;
  if (b.size === 0) return a;
  const out = new Set<T>(a);
  for (const v of b) out.add(v);
  return out;
}

function sanitizeSourceToken(source: string): string {
  const cleaned = source.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned.length > 0 ? cleaned : "auto";
}

export function wrapFixedElementsRecursive(
  html: string,
  selectors: PortalSelectors,
  source: string = "auto",
): string {
  if (!html || html.length === 0) return html;

  // Only wrap elements with explicit anchor or high z-index. Transform-only
  // descendants must stay inline (lose parent context if extracted).
  const inline = extractInlineAnchoredStyleSelectors(html);
  const sel: PortalSelectors = {
    ids: unionSet(selectors.ids, inline.ids),
    classes: unionSet(selectors.classes, inline.classes),
  };
  if (sel.ids.size === 0 && sel.classes.size === 0
      && !replacementNeedsPortal(html, selectors)) {
    return html;
  }

  const tagAttr = sanitizeSourceToken(source);
  const wrapOpen = `<div data-risu-portal="${tagAttr}">`;
  const wrapClose = `</div>`;

  return walkRecursive(html, sel, wrapOpen, wrapClose);
}

function walkRecursive(
  html: string,
  sel: PortalSelectors,
  wrapOpen: string,
  wrapClose: string,
): string {
  const out: string[] = [];
  const len = html.length;
  let i = 0;
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt < 0) {
      out.push(html.slice(i));
      break;
    }
    if (lt > i) out.push(html.slice(i, lt));

    const next = html[lt + 1] ?? "";
    if (next === "/" || next === "!" || next === "?") {
      const end = html.indexOf(">", lt);
      if (end < 0) {
        out.push(html.slice(lt));
        i = len;
        break;
      }
      out.push(html.slice(lt, end + 1));
      i = end + 1;
      continue;
    }

    let nameEnd = lt + 1;
    while (nameEnd < len && isTagNameChar(html[nameEnd]!)) nameEnd++;
    if (nameEnd === lt + 1) {
      out.push("<");
      i = lt + 1;
      continue;
    }
    const tagName = html.slice(lt + 1, nameEnd).toLowerCase();

    const openTagEnd = findOpenTagEnd(html, nameEnd);
    if (openTagEnd < 0) {
      out.push(html.slice(lt));
      i = len;
      break;
    }

    const openTag = html.slice(lt, openTagEnd + 1);
    const isVoid = html[openTagEnd - 1] === "/" || VOID_ELEMENTS.has(tagName);

    let subtreeEnd: number;
    let innerStart: number;
    let innerEnd: number;
    if (isVoid) {
      subtreeEnd = openTagEnd + 1;
      innerStart = subtreeEnd;
      innerEnd = subtreeEnd;
    } else if (RAW_TEXT_ELEMENTS.has(tagName)) {
      const rc = findRawClose(html, openTagEnd + 1, tagName);
      subtreeEnd = rc >= 0 ? rc : len;
      innerStart = openTagEnd + 1;
      innerEnd = subtreeEnd;
    } else {
      subtreeEnd = findMatchingClose(html, openTagEnd + 1, tagName);
      if (subtreeEnd < 0) {
        subtreeEnd = len;
        innerStart = openTagEnd + 1;
        innerEnd = subtreeEnd;
      } else {
        innerStart = openTagEnd + 1;
        // innerEnd = position of the `<` opening the matching close tag.
        // Scan backward from the `>` to the nearest `<`. Safe because nesting
        // is already balanced and the close tag has no literal `<` inside.
        let scan = subtreeEnd - 1;
        while (scan > innerStart && html[scan] !== "<") scan--;
        innerEnd = scan;
      }
    }

    const subtree = html.slice(lt, subtreeEnd);

    if (openTag.indexOf("data-risu-portal") >= 0) {
      out.push(subtree);
      i = subtreeEnd;
      continue;
    }

    if (
      OUTERMOST_SKIP_TAGS.has(tagName)
      && !isVoid
      && !RAW_TEXT_ELEMENTS.has(tagName)
    ) {
      const inner = html.slice(innerStart, innerEnd);
      const recursed = walkRecursive(inner, sel, wrapOpen, wrapClose);
      out.push(html.slice(lt, innerStart));
      out.push(recursed);
      out.push(html.slice(innerEnd, subtreeEnd));
      i = subtreeEnd;
      continue;
    }

    if (OUTERMOST_SKIP_TAGS.has(tagName)) {
      out.push(subtree);
      i = subtreeEnd;
      continue;
    }

    const isItselfFixed =
      openTagHasInlineFixed(openTag) || openTagMatchesSelectors(openTag, sel);
    if (isItselfFixed) {
      out.push(wrapOpen);
      out.push(subtree);
      out.push(wrapClose);
      i = subtreeEnd;
      continue;
    }

    if (isVoid || RAW_TEXT_ELEMENTS.has(tagName)) {
      out.push(subtree);
      i = subtreeEnd;
      continue;
    }

    const inner = html.slice(innerStart, innerEnd);
    if (replacementNeedsPortal(inner, sel)) {
      const recursed = walkRecursive(inner, sel, wrapOpen, wrapClose);
      out.push(openTag);
      out.push(recursed);
      out.push(html.slice(innerEnd, subtreeEnd));
    } else {
      out.push(subtree);
    }
    i = subtreeEnd;
  }
  return out.join("");
}

export { EMPTY_PORTAL_SELECTORS };
