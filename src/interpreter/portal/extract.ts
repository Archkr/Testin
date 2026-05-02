// Scans an HTML string for top-level `<div data-risu-portal="...">` regions.
// Outer div wins when markers are nested. Uses a string-scan depth counter, not a full AST.

const ATTR_NAME = "data-risu-portal";

export interface PortalRegion {
  readonly outerHTML: string;
  readonly sourceToken: string;
  readonly startIndex: number;
  readonly endIndex: number;
}

export function extractPortalRegions(
  html: string,
  onWarn?: (msg: string) => void,
): readonly PortalRegion[] {
  const out: PortalRegion[] = [];
  if (!html || html.indexOf(ATTR_NAME) < 0) return out;

  let pos = 0;
  while (pos < html.length) {
    // Find the next portal opener at top level.
    const opener = findNextPortalOpener(html, pos);
    if (!opener) break;

    // Find the matching `</div>` by counting depth.
    const closer = findMatchingDivClose(html, opener.endTagIndex);
    if (closer === null) {
      onWarn?.(
        `extractPortalRegions: unbalanced data-risu-portal opener at ${opener.startTagIndex} — skipping rest of input`,
      );
      break;
    }

    const outerHTML = html.slice(opener.startTagIndex, closer);
    out.push({
      outerHTML,
      sourceToken: opener.attrValue,
      startIndex: opener.startTagIndex,
      endIndex: closer,
    });

    pos = closer;
  }

  return out;
}

interface PortalOpener {
  readonly startTagIndex: number;
  readonly endTagIndex: number;
  readonly attrValue: string;
}

function findNextPortalOpener(html: string, fromPos: number): PortalOpener | null {
  let pos = fromPos;
  while (pos < html.length) {
    const i = html.indexOf("<div", pos);
    if (i < 0) return null;
    const after = i + 4;
    const ch = html[after];
    if (ch !== " " && ch !== "\t" && ch !== "\n" && ch !== ">" && ch !== "/") {
      // Not actually `<div`  - could be `<divider`, `<divs`, etc.
      pos = i + 1;
      continue;
    }
    // Real `<div>`. Locate the closing `>` respecting quoted attribute values.
    const tagEnd = findTagClose(html, after);
    if (tagEnd < 0) {
      // Truncated tag; bail.
      return null;
    }
    const tagText = html.slice(i, tagEnd + 1);
    const attrMatch = matchPortalAttr(tagText);
    if (attrMatch === null) {
      pos = tagEnd + 1;
      continue;
    }
    return {
      startTagIndex: i,
      endTagIndex: tagEnd + 1,
      attrValue: attrMatch,
    };
  }
  return null;
}

function findTagClose(html: string, fromPos: number): number {
  let i = fromPos;
  let inQuote: '"' | "'" | null = null;
  while (i < html.length) {
    const c = html[i]!;
    if (inQuote) {
      if (c === inQuote) inQuote = null;
    } else {
      if (c === '"' || c === "'") inQuote = c;
      else if (c === ">") return i;
    }
    i++;
  }
  return -1;
}

function matchPortalAttr(tagText: string): string | null {
  const re = /(?:^|\s)data-risu-portal(?:=("([^"]*)"|'([^']*)'|([^\s>"']+)))?(?=[\s/>])/;
  const m = re.exec(tagText);
  if (!m) return null;
  return (m[2] ?? m[3] ?? m[4] ?? "").trim();
}

function findMatchingDivClose(html: string, fromPos: number): number | null {
  let depth = 1;
  let pos = fromPos;
  while (pos < html.length) {
    // Look for next `<div` or `</div>`.
    const nextOpen = html.indexOf("<div", pos);
    const nextClose = html.indexOf("</div", pos);
    if (nextClose < 0) return null;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      // Verify it's a real `<div` not e.g. `<divider`.
      const after = nextOpen + 4;
      const ch = html[after];
      if (ch === " " || ch === "\t" || ch === "\n" || ch === ">" || ch === "/") {
        const tagEnd = findTagClose(html, after);
        if (tagEnd < 0) return null;
        const tagText = html.slice(nextOpen, tagEnd + 1);
        // Self-closing? `<div ... />`
        if (tagText.endsWith("/>")) {
          pos = tagEnd + 1;
          continue;
        }
        depth++;
        pos = tagEnd + 1;
        continue;
      }
      pos = nextOpen + 1;
      continue;
    }
    const closeTagEnd = findTagClose(html, nextClose + 5);
    if (closeTagEnd < 0) return null;
    depth--;
    if (depth === 0) {
      return closeTagEnd + 1;
    }
    pos = closeTagEnd + 1;
  }
  return null;
}
