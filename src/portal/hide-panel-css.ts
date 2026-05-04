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

function ensureSurfaces(): void {
  if (typeof document === "undefined") return;
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
    }
  }
  if (!constructedSheet) {
    try {
      constructedSheet = new CSSStyleSheet();
    } catch {
      constructedSheet = null;
    }
  }
}

function escapeClass(c: string): string {
  // Prefer CSS.escape when available; fall back to a defensive serialize
  // that handles the chars cards realistically use.
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(c);
  }
  return c.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}

function rebuild(): void {
  ensureSurfaces();
  if (knownClasses.size === 0) {
    if (documentStyleEl) documentStyleEl.textContent = "";
    if (constructedSheet) {
      try { constructedSheet.replaceSync(""); } catch { /* */ }
    }
    return;
  }
  const docRules: string[] = [];
  const shadowRules: string[] = [];
  for (const c of knownClasses) {
    const sel = `.${escapeClass(c)}`;
    // Document rule: scope to chat MessageContent so overlay clones at
    // body level (siblings of MessageContent) stay visible. Only hits
    // light-DOM sources; shadow-DOM sources are handled by the adopted
    // sheet below.
    docRules.push(
      `[data-component="MessageContent"] ${sel} { display: none !important; }`,
    );
    // Adopted-sheet rule: bare class selector. CSS's `:host` doesn't
    // chain with a descendant combinator the way it looks like it should
    // — `:host(...) .x` is NOT a way to scope shadow descendants. Use a
    // bare selector and rely on adoption discipline (the message-portal
    // module filters this sheet out when copying adopted sheets to the
    // overlay wrapper's shadow, so the clone stays visible).
    shadowRules.push(
      `${sel} { display: none !important; }`,
    );
  }
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

/** Drop all known classes. Called on chat switch so a class learned for
 *  card A doesn't bleed over into card B (where the same class name might
 *  refer to a non-fixed panel that should NOT be hidden). */
export function clearHidePanelClasses(): void {
  if (knownClasses.size === 0) return;
  knownClasses.clear();
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
  documentStyleConnected: boolean;
  documentStyleText: string;
  sheetRuleCount: number;
} {
  ensureSurfaces();
  return {
    classes: Array.from(knownClasses),
    documentStyleConnected: documentStyleEl !== null && documentStyleEl.isConnected,
    documentStyleText: documentStyleEl?.textContent ?? "",
    sheetRuleCount: constructedSheet ? constructedSheet.cssRules.length : 0,
  };
}
