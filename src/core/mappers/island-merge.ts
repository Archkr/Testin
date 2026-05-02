
const BLOCK_ELEMENT_RE =
  /^<(div|section|article|aside|nav|main|header|footer|form|fieldset|figure|details)\b/i;
const STYLE_TAG_RE = /<style[\s>]/i;
const INLINE_STYLE_ATTR_RE = /\bstyle\s*=/gi;
const NO_MERGE_ATTR_RE = /\bdata-no-island-merge\b/i;

export function countIslandingTopLevelBlocks(raw: string): number {
  if (!raw) return 0;
  if (!STYLE_TAG_RE.test(raw) && !/\bstyle\s*=/i.test(raw)) return 0;
  const lines = raw.split("\n");
  let i = 0;
  let count = 0;
  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    const blockMatch = trimmed.match(BLOCK_ELEMENT_RE);
    if (blockMatch) {
      const blockLines: string[] = [];
      const tag = blockMatch[1]!.toLowerCase();
      const openRe = new RegExp(`<${tag}\\b`, "gi");
      const closeRe = new RegExp(`</${tag}\\b`, "gi");
      let depth = 0;
      while (i < lines.length) {
        const line = lines[i]!;
        blockLines.push(line);
        depth +=
          (line.match(openRe) || []).length - (line.match(closeRe) || []).length;
        i++;
        if (depth <= 0) break;
      }
      const blockContent = blockLines.join("\n");
      const openingTag = blockContent.split(">")[0] ?? "";
      if (/\bdata-no-island\b/i.test(openingTag)) {
        continue;
      }
      if (
        depth <= 0 &&
        (STYLE_TAG_RE.test(blockContent) ||
          countInlineStyles(blockContent) >= 3)
      ) {
        count++;
      }
      continue;
    }
    // Standalone <style> at top level  - Lumi's strategy 2 captures it
    // (plus following sibling HTML) as ONE island.
    if (/^\s*<style[\s>]/i.test(trimmed)) {
      count++;
      while (i < lines.length) {
        if (/<\/style\s*>/i.test(lines[i]!)) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    i++;
  }
  return count;
}

function countInlineStyles(html: string): number {
  INLINE_STYLE_ATTR_RE.lastIndex = 0;
  let n = 0;
  while (INLINE_STYLE_ATTR_RE.exec(html)) {
    n++;
    if (n >= 3) return n;
  }
  return n;
}

export function wrapIslandMergeIfNeeded(html: string): string {
  if (!html || html.length === 0) return html;
  // Per-rule opt-out: card author can mark their rule's outermost
  // element with `data-no-island-merge` to bypass the wrap entirely.
  // a code change.
  if (NO_MERGE_ATTR_RE.test(html.split(">")[0] ?? "")) return html;
  // Idempotency: don't re-wrap if the translator already wrapped (e.g.
  // re-translation, or chained transforms).
  if (/^\s*<div\s+[^>]*data-risu-island-merge/i.test(html)) return html;
  const blockCount = countIslandingTopLevelBlocks(html);
  if (blockCount < 2) return html;
  return (
    `<div data-risu-island-merge style="display:contents">` +
    html +
    `</div>`
  );
}
