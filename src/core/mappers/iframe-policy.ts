// Risu parity: cards may embed `<iframe src="https://www.youtube.com/embed/<id>">`
// (Risu DOMPurify hook at parser.svelte.ts:46-52 removes any iframe whose src
// doesn't start with that prefix). Lumi's richHtmlSanitizer.ts strips ALL iframes
// (BASE_FORBID_TAGS includes 'iframe'), AND the document-level CSP
// `frame-src 'self' blob:` blocks the YouTube domain anyway — so a real iframe
// can't render Lumi-side regardless of how it's authored.
//
// Best practical parity: at translate time, replace whitelisted YouTube embeds
// with a click-to-open thumbnail anchor (uses YouTube's public thumbnail CDN —
// img.youtube.com — which is on a different host than the embed but allowed
// under Lumi's `img-src` since it's https://). Non-YouTube iframes are stripped
// entirely (matches Risu's policy: anything else is removed).

const IFRAME_OPEN_RE = /<iframe\b([^>]*)>([\s\S]*?)<\/iframe\s*>/gi;
const IFRAME_SELF_CLOSE_RE = /<iframe\b([^>]*)\/?\s*>/gi;
const SRC_ATTR_RE = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const YOUTUBE_EMBED_RE = /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{6,32})(?:[/?#]|$)/i;

/** Extracts the YouTube video ID from a `youtube.com/embed/<id>` URL, or null. */
function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = YOUTUBE_EMBED_RE.exec(url.trim());
  return m && m[1] ? m[1] : null;
}

function getSrcFromAttrs(attrs: string): string | null {
  const m = SRC_ATTR_RE.exec(attrs);
  if (!m) return null;
  return m[1] ?? m[2] ?? m[3] ?? null;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function youtubeFallbackMarkup(videoId: string): string {
  const safeId = videoId.replace(/[^A-Za-z0-9_-]/g, '');
  if (safeId.length === 0) return '';
  const watchUrl = `https://www.youtube.com/watch?v=${safeId}`;
  const thumbUrl = `https://img.youtube.com/vi/${safeId}/hqdefault.jpg`;
  // Inline-styled so it survives Lumi sanitization without needing external CSS.
  // The play-button overlay is a Unicode glyph for portability.
  return (
    `<a href="${escapeAttr(watchUrl)}" target="_blank" rel="noopener noreferrer"` +
    ` class="lumirealm-youtube-embed"` +
    ` data-lumirealm-youtube-id="${escapeAttr(safeId)}"` +
    ` style="position:relative;display:inline-block;max-width:480px;width:100%;` +
    `aspect-ratio:16/9;background:#000;border-radius:8px;overflow:hidden;text-decoration:none;">` +
    `<img src="${escapeAttr(thumbUrl)}" alt="YouTube video"` +
    ` style="width:100%;height:100%;object-fit:cover;display:block;border:0;">` +
    `<span aria-hidden="true"` +
    ` style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;` +
    `font-size:48px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.6);` +
    `pointer-events:none;">▶</span>` +
    `</a>`
  );
}

export interface IframePolicyResult {
  readonly html: string;
  readonly youtubeReplaced: number;
  readonly stripped: number;
}

/**
 * Apply Risu-parity iframe policy to HTML at translate time.
 *
 * - YouTube `embed/` iframes → click-through thumbnail anchor.
 * - Any other iframe → stripped entirely (matches Risu's removeChild behavior).
 *
 * Idempotent on input without iframes.
 */
export function applyIframePolicy(html: string): IframePolicyResult {
  if (!html || html.indexOf('<iframe') < 0) {
    return { html, youtubeReplaced: 0, stripped: 0 };
  }
  let youtubeReplaced = 0;
  let stripped = 0;

  // First pass: paired-form `<iframe ...>...</iframe>`.
  let out = html.replace(IFRAME_OPEN_RE, (_match, attrs: string) => {
    const src = getSrcFromAttrs(attrs);
    const ytId = extractYoutubeId(src);
    if (ytId) {
      youtubeReplaced += 1;
      return youtubeFallbackMarkup(ytId);
    }
    stripped += 1;
    return '';
  });

  // Second pass: self-closing or standalone `<iframe ...>` without a closer.
  // The first pass consumed paired forms; remaining matches are bare opens.
  out = out.replace(IFRAME_SELF_CLOSE_RE, (_match, attrs: string) => {
    const src = getSrcFromAttrs(attrs);
    const ytId = extractYoutubeId(src);
    if (ytId) {
      youtubeReplaced += 1;
      return youtubeFallbackMarkup(ytId);
    }
    stripped += 1;
    return '';
  });

  return { html: out, youtubeReplaced, stripped };
}
