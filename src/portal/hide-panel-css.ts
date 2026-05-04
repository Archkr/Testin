// Reactive CSS source-of-truth for hiding card-authored "fixed" panels in
// their original bubble position. Replaces the prior class-fingerprint
// sync-stash mechanism: instead of racing a MutationObserver to set
// `display:none` on freshly-mounted source DOM, we maintain a CSS rule that
// hides anything with a known panel class inside chat bubbles. CSS is
// declarative — applies before paint, doesn't race React commits, doesn't
// need a streaming gate to suppress per-chunk source visibility.
//
// Two emission surfaces:
//
//  1. A `<style id="lumirealm-portal-hide-panels">` element in
//     `document.head`, scoped to `[data-component="MessageContent"] .className`
//     so it covers light-DOM sources inside chat bubbles WITHOUT touching
//     our overlay clones (which live at body level outside MessageContent).
//
//  2. A constructed `CSSStyleSheet` that `island-styles.ts` adopts into
//     every chat-message shadow root. Inside a shadow tree the document
//     selector can't reach, so we ship a separate variant that uses
//     `:host(:not(.lumi-message-portal-wrapper)) .className` to scope to
//     the bubble's shadow but EXCLUDE shadows whose host is our overlay
//     wrapper (the visible clone copy). The exclusion is what keeps the
//     clone visible while the source hides.
//
// Both surfaces are driven by the same Set of class names. Calling
// `addHidePanelClasses(classes)` appends + reactively rewrites both. The
// constructed sheet's `replaceSync` propagates to every shadow that's
// already adopted it — no re-adoption needed.

const HIDE_STYLE_ID = "lumirealm-portal-hide-panels";

let documentStyleEl: HTMLStyleElement | null = null;
let constructedSheet: CSSStyleSheet | null = null;
const knownClasses = new Set<string>();
// IDs are an independent selector space — cards like Subject Iteration
// style fixed widgets via `#dg-float-btn` etc. with no class hook. Same
// reactive rebuild path as classes; rules emit `#<id>` instead of `.<cls>`.
const knownIds = new Set<string>();

function ensureSurfaces(): void {
  if (typeof document === "undefined") return;
  let createdSheet = false;
  // Drop stale handles when the host document changed (test re-init or
  // chat-host re-mount in unusual cases).
  if (documentStyleEl && documentStyleEl.ownerDocument !== document) {
    documentStyleEl = null;
  }
  if (!documentStyleEl) {
    const existing = document.getElementById(HIDE_STYLE_ID);
    if (existing && existing.tagName === "STYLE") {
      documentStyleEl = existing as HTMLStyleElement;
    } else {
      documentStyleEl = document.createElement("style");
      documentStyleEl.id = HIDE_STYLE_ID;
      document.head.appendChild(documentStyleEl);
      createdSheet = true;
    }
  }
  if (!constructedSheet) {
    try {
      constructedSheet = new CSSStyleSheet();
      createdSheet = true;
    } catch {
      constructedSheet = null;
    }
  }
  // First-time setup → emit the inline-style baseline rule immediately so
  // shadows that adopt this sheet at boot get the rule before any class
  // is learned. Re-entrant safe: rebuild() is idempotent.
  if (createdSheet) rebuildBaseline();
}

// Internal-only re-entry point used by ensureSurfaces. Forwards to
// rebuild() but guards against the case where rebuild() itself called
// ensureSurfaces() (it does — for first-time sheet creation).
let inRebuild = false;
function rebuildBaseline(): void {
  if (inRebuild) return;
  inRebuild = true;
  try { rebuild(); } finally { inRebuild = false; }
}

function escapeIdent(c: string): string {
  // Prefer CSS.escape when available; fall back to a defensive serialize
  // that handles the chars cards realistically use.
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(c);
  }
  return c.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}

// Inline-style baseline: catches `<div style="position:fixed">` cases where
// the author bypasses class/id selectors entirely. Always emitted (no
// per-lift registration needed) since the substring match is shape-
// agnostic. Two selector variants cover both common author formattings
// (`position: fixed` with space and `position:fixed` without).
//
// `:not([popover]):not(dialog)` excludes browser-managed top-layer
// surfaces — popovers and dialogs are intentionally skipped by the
// lifter (since they're already overlaid by the browser), so we mustn't
// hide them either. CSS-only `:has()`-based CB-trap detection isn't
// practical, so a CB-trapped inline-styled fixed element WILL be
// caught by this rule and hidden — known-but-rare gap (Lumi's row
// transform creates a CB ancestor at runtime; cards that intend
// viewport-fixed and are accidentally trapped lose their inline-styled
// content here. Re-author with class/id to opt out.)
const INLINE_STYLE_SELECTORS = [
  '[style*="position: fixed"]:not([popover]):not(dialog)',
  '[style*="position:fixed"]:not([popover]):not(dialog)',
];

function rebuild(): void {
  ensureSurfaces();
  const docRules: string[] = [];
  const shadowRules: string[] = [];
  const emit = (sel: string): void => {
    // Document rule: scope to chat MessageContent so overlay clones at
    // body level (siblings of MessageContent) stay visible. Only hits
    // light-DOM sources; shadow-DOM sources are handled by the adopted
    // sheet below.
    docRules.push(
      `[data-component="MessageContent"] ${sel} { display: none !important; }`,
    );
    // Adopted-sheet rule: bare selector. CSS's `:host` doesn't chain
    // with a descendant combinator the way it looks like it should —
    // `:host(...) .x` is NOT a way to scope shadow descendants. Use a
    // bare selector and rely on adoption discipline (the message-portal
    // module filters this sheet out when copying adopted sheets to the
    // overlay wrapper's shadow, so the clone stays visible).
    shadowRules.push(
      `${sel} { display: none !important; }`,
    );
  };
  for (const c of knownClasses) emit(`.${escapeIdent(c)}`);
  for (const id of knownIds) emit(`#${escapeIdent(id)}`);
  // Static inline-style baseline — always emitted, even when no
  // class/id has been learned yet. Cheap (two selectors).
  for (const sel of INLINE_STYLE_SELECTORS) emit(sel);
  if (documentStyleEl) {
    documentStyleEl.textContent = docRules.join("\n");
  }
  if (constructedSheet) {
    try {
      constructedSheet.replaceSync(shadowRules.join("\n"));
    } catch {
      // replaceSync rejects on @import etc. but our rules are plain
      // selectors — defensive only.
    }
  }
}

// Class tokens we never want to add to the hide-set. `null` shows up when
// a card writes `class="X {{getvar::Y}}"` and `Y` isn't set — Risu's getvar
// returns the literal string `"null"` (chatVar.svelte.ts:36-37). Using
// `.null { display: none !important }` would hide every other element on
// the page whose author also literally wrote `class="null"`. Cards that
// abuse `null` as an actual className are vanishingly rare; we'd rather
// drop the over-broad selector than risk it.
const POISON_CLASSES = new Set(["null", "undefined", ""]);

/** Add panel classes to the hide-set. Returns true when at least one
 *  class was new (caller may want to log). Idempotent for known classes. */
export function addHidePanelClasses(classes: Iterable<string>): boolean {
  let added = false;
  const newClasses: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (POISON_CLASSES.has(c)) continue;
    if (!knownClasses.has(c)) {
      knownClasses.add(c);
      newClasses.push(c);
      added = true;
    }
  }
  if (added) {
    rebuild();
    // Diagnostic so the agent can verify what was added + the actual
    // emitted CSS. Cheap because adds are rare (per-card panel-class set
    // stabilises after one or two lifts).
    try {
      const docCss = documentStyleEl?.textContent ?? "";
      const sheetRules = constructedSheet ? constructedSheet.cssRules.length : 0;
      const sheetAdopted = constructedSheet
        ? Array.from((document.adoptedStyleSheets ?? []) as CSSStyleSheet[]).includes(constructedSheet)
        : false;
      // eslint-disable-next-line no-console
      console.info(
        `[lumirealm] hide-panel-css: added ${JSON.stringify(newClasses)}; ` +
          `total=${knownClasses.size} doc_chars=${docCss.length} ` +
          `sheet_rules=${sheetRules} sheet_doc_adopted=${sheetAdopted}`,
      );
    } catch { /* */ }
  }
  return added;
}

/** Add panel IDs to the hide-set. Subject Iteration and similar cards
 *  style fixed widgets via `#dg-float-btn` etc. — no class hook. */
export function addHidePanelIds(ids: Iterable<string>): boolean {
  let added = false;
  const newIds: string[] = [];
  for (const id of ids) {
    if (!id) continue;
    if (POISON_CLASSES.has(id)) continue;
    if (!knownIds.has(id)) {
      knownIds.add(id);
      newIds.push(id);
      added = true;
    }
  }
  if (added) {
    rebuild();
    try {
      const docCss = documentStyleEl?.textContent ?? "";
      const sheetRules = constructedSheet ? constructedSheet.cssRules.length : 0;
      console.info(
        `[lumirealm] hide-panel-css: added ids=${JSON.stringify(newIds)}; ` +
          `total_classes=${knownClasses.size} total_ids=${knownIds.size} ` +
          `doc_chars=${docCss.length} sheet_rules=${sheetRules}`,
      );
    } catch { /* */ }
  }
  return added;
}

/** Drop all known classes + ids. Called on chat switch so what's learned
 *  for card A doesn't bleed over into card B (where the same class/id
 *  name might refer to a non-fixed element that should NOT be hidden). */
export function clearHidePanelClasses(): void {
  if (knownClasses.size === 0 && knownIds.size === 0) return;
  knownClasses.clear();
  knownIds.clear();
  rebuild();
}

/** Adopt-target for `island-styles.ts`. Returns null when CSSStyleSheet
 *  is unavailable (very old browsers — same fallback path as island-styles). */
export function getHidePanelSheet(): CSSStyleSheet | null {
  ensureSurfaces();
  return constructedSheet;
}

/** Diagnostic accessor — exposed via __riCompat for live debugging. */
export function getHidePanelClassCount(): number {
  return knownClasses.size;
}

/** Full diagnostic state. Call from DevTools to verify hiding is wired
 *  correctly:
 *    - `classes` — what we've ever added.
 *    - `documentStyleConnected` — confirms the document-head <style> is
 *      attached and visible to the cascade.
 *    - `documentStyleText` — the literal CSS body.
 *    - `sheetRuleCount` — confirms the constructed sheet has rules.
 *    - `sheetAdoptedCount` — how many shadow roots in the document have
 *      adopted our sheet (counts via island-styles' adoption MO; matches
 *      the chat-message shadows' count). */
export function dumpHidePanelState(): {
  classes: string[];
  ids: string[];
  documentStyleConnected: boolean;
  documentStyleText: string;
  sheetRuleCount: number;
} {
  ensureSurfaces();
  return {
    classes: Array.from(knownClasses),
    ids: Array.from(knownIds),
    documentStyleConnected: documentStyleEl !== null && documentStyleEl.isConnected,
    documentStyleText: documentStyleEl?.textContent ?? "",
    sheetRuleCount: constructedSheet ? constructedSheet.cssRules.length : 0,
  };
}
