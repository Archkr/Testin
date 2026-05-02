
export function extractGlobalFontDeclarations(
  replaceStrings: readonly string[],
): string {
  if (replaceStrings.length === 0) return "";
  const seen = new Set<string>();
  const out: string[] = [];
  for (const html of replaceStrings) {
    if (!html || html.indexOf("<style") < 0) continue;
    if (html.indexOf("@font-face") < 0 && html.indexOf("@import") < 0) continue;
    for (const css of iterateStyleBlocks(html)) {
      for (const rule of iterateGlobalAtRules(css)) {
        const norm = normalizeWhitespace(rule);
        if (seen.has(norm)) continue;
        seen.add(norm);
        out.push(rule);
      }
    }
  }
  return out.join("\n");
}

export function prependCssToBgHtml(
  bgHtml: string | null,
  css: string,
): string | null {
  if (!css || css.length === 0) return bgHtml;
  const trimmed = css.trim();
  if (trimmed.length === 0) return bgHtml;
  const wrap = `<style data-risu-hoisted>${trimmed}</style>`;
  if (!bgHtml || bgHtml.length === 0) return wrap;

  const styleOpen = bgHtml.indexOf("<style");
  if (styleOpen < 0) return `${wrap}\n${bgHtml}`;
  const styleOpenEnd = bgHtml.indexOf(">", styleOpen);
  if (styleOpenEnd < 0) return `${wrap}\n${bgHtml}`;
  const head = bgHtml.slice(0, styleOpenEnd + 1);
  const tail = bgHtml.slice(styleOpenEnd + 1);
  return `${head}\n${trimmed}\n${tail}`;
}


function* iterateStyleBlocks(html: string): Generator<string> {
  const len = html.length;
  let i = 0;
  while (i < len) {
    const openStart = html.indexOf("<style", i);
    if (openStart < 0) return;
    const openEnd = html.indexOf(">", openStart);
    if (openEnd < 0) return;
    const closeStart = html.indexOf("</style", openEnd);
    if (closeStart < 0) return;
    yield html.slice(openEnd + 1, closeStart);
    const closeEnd = html.indexOf(">", closeStart);
    i = closeEnd < 0 ? len : closeEnd + 1;
  }
}

function* iterateGlobalAtRules(css: string): Generator<string> {
  const len = css.length;
  let i = 0;
  while (i < len) {
    i = skipWsAndComments(css, i);
    if (i >= len) return;
    if (css[i] !== "@") {
      i = skipPastNextBlockOrSemi(css, i);
      continue;
    }
    const atStart = i;
    i++; // past '@'
    const nameStart = i;
    while (i < len && isAtNameChar(css[i]!)) i++;
    const name = css.slice(nameStart, i).toLowerCase();
    // Read prelude until `{` or `;`.
    while (i < len && css[i] !== "{" && css[i] !== ";") {
      if (css[i] === '"' || css[i] === "'") {
        i = skipString(css, i);
        continue;
      }
      if (css[i] === "/" && css[i + 1] === "*") {
        i = skipComment(css, i);
        continue;
      }
      i++;
    }
    if (i >= len) return;
    if (css[i] === ";") {
      const end = i + 1;
      if (name === "import") yield css.slice(atStart, end);
      i = end;
      continue;
    }
    i++; // past `{`
    const blockEnd = skipMatchingBrace(css, i);
    const fullEnd = blockEnd < len && css[blockEnd] === "}" ? blockEnd + 1 : blockEnd;
    if (name === "font-face") yield css.slice(atStart, fullEnd);
    i = fullEnd;
  }
}

function isAtNameChar(c: string): boolean {
  return (
    (c >= "a" && c <= "z") ||
    (c >= "A" && c <= "Z") ||
    (c >= "0" && c <= "9") ||
    c === "-" ||
    c === "_"
  );
}

function skipWsAndComments(css: string, start: number): number {
  const len = css.length;
  let i = start;
  while (i < len) {
    const c = css[i]!;
    if (c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f") {
      i++;
      continue;
    }
    if (c === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
      continue;
    }
    break;
  }
  return i;
}

function skipComment(css: string, start: number): number {
  const len = css.length;
  let i = start + 2;
  while (i < len && !(css[i] === "*" && css[i + 1] === "/")) i++;
  return i < len ? i + 2 : len;
}

function skipString(css: string, start: number): number {
  const len = css.length;
  const quote = css[start]!;
  let i = start + 1;
  while (i < len) {
    const c = css[i]!;
    if (c === "\\" && i + 1 < len) {
      i += 2;
      continue;
    }
    if (c === quote) return i + 1;
    i++;
  }
  return len;
}

function skipMatchingBrace(css: string, start: number): number {
  const len = css.length;
  let i = start;
  let depth = 1;
  while (i < len && depth > 0) {
    const c = css[i]!;
    if (c === '"' || c === "'") {
      i = skipString(css, i);
      continue;
    }
    if (c === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
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

function skipPastNextBlockOrSemi(css: string, start: number): number {
  const len = css.length;
  let i = start;
  while (i < len) {
    const c = css[i]!;
    if (c === '"' || c === "'") {
      i = skipString(css, i);
      continue;
    }
    if (c === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
      continue;
    }
    if (c === "{") {
      i = skipMatchingBrace(css, i + 1);
      return i < len && css[i] === "}" ? i + 1 : i;
    }
    if (c === ";") return i + 1;
    i++;
  }
  return len;
}

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
