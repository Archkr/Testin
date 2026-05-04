// Risu parity for `<iframe>` embeds.
//
// Risu's parser at parser.svelte.ts:46-52 allows iframes whose src starts with
// `https://www.youtube.com/embed/`; everything else is removed.
//
// Lumi's MessageContent.tsx ships a `TrustedYouTubeEmbed` React component
// (Lumiverse staging commit 29c3568) that detects iframes pointing at
// `https://www.youtube-nocookie.com/embed/<id>` in chat content, replaces them
// with a sandboxed <iframe>, and Lumi's CSP allowlists that origin under
// `frame-src`. ANYTHING ELSE is still stripped by `richHtmlSanitizer.ts`
// `BASE_FORBID_TAGS`.
//
// Translate-time policy: rewrite Risu-style YouTube iframes to match Lumi's
// validator exactly, so they survive sanitization and Lumi's component picks
// them up. Other iframes are stripped (Risu does the same).
//
// Lumi's validator at MessageContent.tsx:993-1019 enforces:
//   - origin === 'https://www.youtube-nocookie.com'
//   - path matches /^\/embed\/[A-Za-z0-9_-]{6,}$/
//   - no hash
//   - query params restricted to a small allowlist with type checks:
//       boolean (`autoplay`/`controls`/`loop`/`mute`/`playsinline`/`rel`) → '0'|'1'
//       numeric (`start`/`end`) → \d{1,6}
//       token   (`si`)          → [A-Za-z0-9_-]{1,128}
//   - body parses to exactly one <iframe> child, no surrounding text

// Single-pass regex matching both paired and self-closing iframe forms:
//   - `<iframe ...>...</iframe>` (alternation branch 1, captures attrs in
//     group 1)
//   - `<iframe .../>` (alternation branch 2, captures attrs in group 2)
// Single regex avoids the two-pass pitfall where the second pass would
// re-match the iframe we just emitted (doubling the output).
const IFRAME_RE = /<iframe\b([^>]*)>[\s\S]*?<\/iframe\s*>|<iframe\b([^>]*?)\/?\s*>/gi;
const SRC_ATTR_RE = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
// Accepts both youtube.com (Risu's authored form) and youtube-nocookie.com.
const YOUTUBE_EMBED_RE =
  /^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,})(?:[/?#]|$)/i;

const BOOL_PARAMS = new Set(['autoplay', 'controls', 'loop', 'mute', 'playsinline', 'rel']);
const NUMBER_PARAMS = new Set(['end', 'start']);
const TOKEN_PARAMS = new Set(['si']);
const ALLOWED_QUERY_PARAMS = new Set([...BOOL_PARAMS, ...NUMBER_PARAMS, ...TOKEN_PARAMS]);

interface ParsedYoutube {
  readonly videoId: string;
  readonly query: string;
}

/** Parse a Risu-authored YouTube iframe src. Returns the canonical
 *  `youtube-nocookie.com`-form `videoId` + filtered query string when the
 *  URL passes Lumi's validator; null otherwise. */
function parseYoutubeSrc(rawSrc: string | null | undefined): ParsedYoutube | null {
  if (!rawSrc) return null;
  const trimmed = rawSrc.trim();
  const m = YOUTUBE_EMBED_RE.exec(trimmed);
  if (!m || !m[1]) return null;
  const videoId = m[1];
  // Reject hashes — Lumi's validator does too.
  const hashIdx = trimmed.indexOf('#');
  if (hashIdx !== -1) return null;
  // Pull query params, filter, and re-validate per Lumi's rules.
  const qIdx = trimmed.indexOf('?');
  const params = new URLSearchParams();
  if (qIdx !== -1) {
    let raw = trimmed.slice(qIdx + 1);
    // Strip any path-like trailing junk after a slash that shouldn't be there.
    if (raw.includes('/')) raw = raw.slice(0, raw.indexOf('/'));
    let source: URLSearchParams;
    try {
      source = new URLSearchParams(raw);
    } catch {
      return null;
    }
    for (const [key, value] of source) {
      if (!ALLOWED_QUERY_PARAMS.has(key)) {
        // Lumi REJECTS the whole iframe on unknown param. Drop the param to
        // give the user a chance — emitting the iframe without the bad param
        // still works; emitting it WITH the bad param means Lumi strips the
        // iframe entirely. Defensive: skip unknown.
        continue;
      }
      if (BOOL_PARAMS.has(key)) {
        if (value !== '0' && value !== '1') continue;
      } else if (NUMBER_PARAMS.has(key)) {
        if (!/^\d{1,6}$/.test(value)) continue;
      } else if (TOKEN_PARAMS.has(key)) {
        if (!/^[A-Za-z0-9_-]{1,128}$/.test(value)) continue;
      }
      params.append(key, value);
    }
  }
  return { videoId, query: params.toString() };
}

function getSrcFromAttrs(attrs: string): string | null {
  const m = SRC_ATTR_RE.exec(attrs);
  if (!m) return null;
  return m[1] ?? m[2] ?? m[3] ?? null;
}

/** Emit the Lumi-validator-compliant iframe. Plain element, no surrounding
 *  text — `extractTrustedYouTubeEmbed` requires the iframe to be the sole
 *  child of its DOMParser body. */
function trustedIframeMarkup(parsed: ParsedYoutube): string {
  const path = `/embed/${parsed.videoId}`;
  const url = parsed.query.length > 0
    ? `https://www.youtube-nocookie.com${path}?${parsed.query}`
    : `https://www.youtube-nocookie.com${path}`;
  return `<iframe src="${url}" title="YouTube video"></iframe>`;
}

export interface IframePolicyResult {
  readonly html: string;
  readonly youtubeReplaced: number;
  readonly stripped: number;
}

/**
 * Apply Risu-parity iframe policy to HTML at translate time.
 *
 * - `youtube.com/embed/<id>` and `youtube-nocookie.com/embed/<id>` iframes →
 *   rewritten to the canonical `youtube-nocookie.com` form Lumi's
 *   `TrustedYouTubeEmbed` component recognizes. Allowed query params
 *   (`autoplay`, `start`, etc.) are filtered through Lumi's validator
 *   rules; disallowed params are silently dropped to keep the embed
 *   alive (vs. Lumi's "reject whole iframe" behavior).
 * - Any other iframe → stripped entirely (matches Risu's removeChild
 *   behavior at parser.svelte.ts:50).
 *
 * Idempotent: rewriting an already-canonical youtube-nocookie.com iframe
 * produces the same output.
 */
export function applyIframePolicy(html: string): IframePolicyResult {
  if (!html || html.indexOf('<iframe') < 0) {
    return { html, youtubeReplaced: 0, stripped: 0 };
  }
  let youtubeReplaced = 0;
  let stripped = 0;

  const out = html.replace(IFRAME_RE, (_match, pairedAttrs: string | undefined, selfAttrs: string | undefined) => {
    const attrs = pairedAttrs ?? selfAttrs ?? '';
    const src = getSrcFromAttrs(attrs);
    const parsed = parseYoutubeSrc(src);
    if (parsed) {
      youtubeReplaced += 1;
      return trustedIframeMarkup(parsed);
    }
    stripped += 1;
    return '';
  });

  return { html: out, youtubeReplaced, stripped };
}
