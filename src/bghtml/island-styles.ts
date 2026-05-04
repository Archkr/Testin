// Lumi shadow-wraps styled HTML; doc-level CSS doesn't pierce shadow boundaries.
// Adopt a constructed CSSStyleSheet into each chat-message shadow via MutationObserver.
// replaceSync propagates live to all adopters with one sheet shared by reference.

import { getHidePanelSheet } from '../portal/hide-panel-css.js';

// Late-binding accessor — `getHidePanelSheet()` lazily ensures the sheet
// exists; calling it AT injection time rather than at boot keeps the
// import pure (no side effects on module load) and lets the test harness
// reset module state without coupling to setupIslandStyles' boot path.
function getHidePanelSheetForIsland(): CSSStyleSheet | null {
  return getHidePanelSheet();
}

interface Flog {
  info(msg: string, ...rest: unknown[]): void;
  warn(msg: string, ...rest: unknown[]): void;
  error(msg: string, ...rest: unknown[]): void;
}

export interface IslandStyles {
  setStylesheet(css: string): void;
  setCrossRuleSheets(cssParts: readonly string[]): void;
  clear(): void;
  destroy(): void;
}

export interface SetupIslandStylesOptions {
  readonly riskuEnvironmentCss?: string;
  /** Invoked after every setStylesheet / setCrossRuleSheets call. Used by
   *  the portal lifter to re-sweep when card CSS changes (which can flip
   *  computed `position: fixed` without firing a DOM mutation). */
  readonly onStylesUpdated?: () => void;
}

export function setupIslandStyles(flog: Flog, opts: SetupIslandStylesOptions = {}): IslandStyles {
  let sheet: CSSStyleSheet | null = null;
  let envSheet: CSSStyleSheet | null = null;
  const allOwnedSheets = new WeakSet<CSSStyleSheet>();
  try {
    sheet = new CSSStyleSheet();
    allOwnedSheets.add(sheet);
  } catch (err) {
    flog.error('island-styles: CSSStyleSheet constructor unavailable (browser predates 2023)', err);
    return {
      setStylesheet: () => { /* no-op */ },
      setCrossRuleSheets: () => { /* no-op */ },
      clear: () => { /* no-op */ },
      destroy: () => { /* no-op */ },
    };
  }

  let crossRuleSheets: CSSStyleSheet[] = [];

  if (opts.riskuEnvironmentCss && opts.riskuEnvironmentCss.length > 0) {
    try {
      const rescoped = rescopeRisuEnvironment(opts.riskuEnvironmentCss);
      envSheet = new CSSStyleSheet();
      allOwnedSheets.add(envSheet);
      envSheet.replaceSync(rescoped.css);
      flog.info(
        `island-styles: Risu environment sheet built ${opts.riskuEnvironmentCss.length}->${rescoped.css.length} bytes, ` +
          `${envSheet.cssRules.length} top-level rules ` +
          `(rewrites: :root=${rescoped.rootHits} .prose=${rescoped.proseHits} ` +
          `.prose-invert=${rescoped.proseInvertHits} .chattext=${rescoped.chattextHits} ` +
          `.chat-width=${rescoped.chatWidthHits})`,
      );
    } catch (err) {
      flog.error(
        'island-styles: Risu environment sheet construction failed (falling back to per-card sheet only)',
        err,
      );
      envSheet = null;
    }
  }

  // WeakSet for adopt-once dedup, WeakRef array for iteration + GC pruning.
  const adopted = new WeakSet<ShadowRoot>();
  const adoptedRefs: WeakRef<ShadowRoot>[] = [];

  // outsideChatShadowCount surging indicates Lumi started shadow-wrapping
  // non-chat surfaces (extractHtmlIslands drift).
  let adoptionCount = 0;
  let chatShadowCount = 0;
  let outsideChatShadowCount = 0;
  const ADOPT_LOG_STRIDE = 50;

  function injectInto(shadow: ShadowRoot): void {
    if (adopted.has(shadow)) return;
    if (!sheet) return;
    try {
      const append: CSSStyleSheet[] = [];
      if (envSheet) append.push(envSheet);
      if (sheet) append.push(sheet);
      for (const s of crossRuleSheets) append.push(s);
      // Hide-panel sheet: shipped empty initially, populated reactively as
      // the lifter discovers panel classes. The constructed sheet's
      // replaceSync propagates to all already-adopted shadows so re-adoption
      // isn't needed when classes are added later.
      const hideSheet = getHidePanelSheetForIsland();
      if (hideSheet) {
        append.push(hideSheet);
        allOwnedSheets.add(hideSheet);
      }
      const next = [...shadow.adoptedStyleSheets, ...append];
      shadow.adoptedStyleSheets = next;
      adopted.add(shadow);
      adoptedRefs.push(new WeakRef(shadow));

      // Lumi's ISLAND_BASE_CSS applies a different prose baseline that conflicts.
      if (shadow.host instanceof Element) {
        shadow.host.classList.add('not-island-prose');
      }
      const initialBase = shadow.querySelector('style[data-lumi-island-base]');
      if (initialBase) initialBase.remove();

      adoptionCount++;
      if (adoptionCount <= 8) {
        const host = shadow.host;
        const hostTag = host instanceof Element ? host.tagName.toLowerCase() : '?';
        const hostClass = host instanceof Element ? host.className : '';
        const childCount = shadow.childElementCount;
        const sheetRules = sheet.cssRules.length;
        const envRules = envSheet ? envSheet.cssRules.length : 0;
        flog.info(
          `island-styles: adopted #${adoptionCount} into <${hostTag} class="${hostClass}"> ` +
            `(shadow has ${childCount} top-level children; envSheet ${envRules} rules + perCardSheet ${sheetRules} rules)`,
        );
      } else if (adoptionCount % ADOPT_LOG_STRIDE === 0) {
        flog.info(
          `island-styles: adopted=${adoptionCount} (chat shadows visited=${chatShadowCount}, outside-chat shadows visited=${outsideChatShadowCount})`,
        );
      }
    } catch (err) {
      flog.warn('island-styles: adoptedStyleSheets append failed', err);
    }
  }

  function visit(el: Element): void {
    // Only inject into open shadows inside [data-message-id] chat bubbles.
    const root = el.shadowRoot;
    if (!root || root.mode !== 'open') return;
    // Skip overlay portal wrappers — their shadows host the visible
    // CLONE; adopting the hide-panel sheet into them would make the
    // clone disappear right after the lift. The wrapper has
    // `data-message-id` (so closest() below would match) and an open
    // shadow (so this visit() fires), so we MUST exclude it explicitly.
    // The wrapper is body-level, so it ALSO matches closest('[data-message-id]')
    // via itself when the host has the attribute set.
    if (el.classList.contains('lumi-message-portal-wrapper')
        || el.closest('.lumi-message-portal-wrapper')) {
      return;
    }
    if (el.closest('[data-message-id]')) {
      chatShadowCount++;
      injectInto(root);
    } else {
      outsideChatShadowCount++;
    }
  }

  function walkSubtree(root: Node): void {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    if (root instanceof Element) visit(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let cur: Node | null = walker.nextNode();
    while (cur) {
      if (cur instanceof Element) {
        visit(cur);
        if (cur.shadowRoot && cur.shadowRoot.mode === 'open') {
          walkSubtree(cur.shadowRoot);
        }
      }
      cur = walker.nextNode();
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof Element) walkSubtree(node);
      }
    }
  });

  // TODO: tighten to a stable chat container if MutationObserver shows up in profiling.
  try {
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (err) {
    flog.error('island-styles: observer.observe failed', err);
  }

  // Scan shadows that already exist at setup time (page refresh on active chat).
  try {
    walkSubtree(document.body);
  } catch (err) {
    flog.warn('island-styles: initial walk failed', err);
  }

  flog.info('island-styles: setup complete (adopting into Lumi message-island shadows)');

  function nudgeAdopters(reason: string): void {
    if (adoptedRefs.length === 0) return;
    let nudged = 0;
    let dead = 0;
    for (let i = adoptedRefs.length - 1; i >= 0; i--) {
      const shadow = adoptedRefs[i]!.deref();
      if (!shadow) {
        adoptedRefs.splice(i, 1);
        dead++;
        continue;
      }
      try {
        // adoptedStyleSheets is a live proxy, snapshot via Array.from.
        const current = Array.from(shadow.adoptedStyleSheets);
        shadow.adoptedStyleSheets = [];
        shadow.adoptedStyleSheets = current;
        nudged++;
      } catch {
        /* */
      }
    }
    if (nudged > 0 || dead > 0) {
      flog.info(
        `island-styles: nudged adopters reason=${reason} ` +
          `nudged=${nudged} dead_refs_pruned=${dead} live=${adoptedRefs.length}`,
      );
    }
  }

  function reAdoptAll(): void {
    for (let i = adoptedRefs.length - 1; i >= 0; i--) {
      const shadow = adoptedRefs[i]!.deref();
      if (!shadow) {
        adoptedRefs.splice(i, 1);
        continue;
      }
      try {
        const append: CSSStyleSheet[] = [];
        if (envSheet) append.push(envSheet);
        if (sheet) append.push(sheet);
        for (const s of crossRuleSheets) append.push(s);
        // The hide-panel sheet is owned by the portal-lifter module but
        // adopted into chat-message shadows here. It MUST be re-included
        // in reAdoptAll's rebuild — `existing.filter(!allOwnedSheets)`
        // strips it (we add it to allOwnedSheets in injectInto so the
        // filter knows about it), but without re-adding it here every
        // setCrossRuleSheets call would silently strip it from the
        // shadow, and the source-hiding stops working until the next
        // injectInto for this shadow (which only fires on first mount).
        const hidePanel = getHidePanelSheetForIsland();
        if (hidePanel) append.push(hidePanel);
        const existing = Array.from(shadow.adoptedStyleSheets);
        const filtered = existing.filter((s) => !allOwnedSheets.has(s));
        shadow.adoptedStyleSheets = [...filtered, ...append];
      } catch (err) {
        flog.warn('island-styles: re-adopt failed', err);
      }
    }
  }

  function fireUpdated(): void {
    const cb = opts.onStylesUpdated;
    if (!cb) return;
    try { cb(); } catch (err) { flog.warn('island-styles: onStylesUpdated callback threw', err); }
  }

  return {
    setStylesheet(css: string): void {
      if (!sheet) return;
      try {
        sheet.replaceSync(css);
        nudgeAdopters('setStylesheet');
      } catch (err) {
        flog.error('island-styles: replaceSync failed', err);
      }
      fireUpdated();
    },
    setCrossRuleSheets(cssParts: readonly string[]): void {
      const next: CSSStyleSheet[] = [];
      let okCount = 0;
      let failCount = 0;
      for (let i = 0; i < cssParts.length; i++) {
        const part = cssParts[i] ?? '';
        if (part.trim().length === 0) continue;
        try {
          const s = new CSSStyleSheet();
          allOwnedSheets.add(s);
          s.replaceSync(part);
          next.push(s);
          okCount++;
        } catch (err) {
          failCount++;
          flog.warn(
            `island-styles: cross-rule sheet ${i} parse failed (skipped): ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
      crossRuleSheets = next;
      reAdoptAll();
      flog.info(
        `island-styles: cross-rule sheets set ok=${okCount} failed=${failCount} total_parts=${cssParts.length}`,
      );
      fireUpdated();
    },
    clear(): void {
      if (!sheet) return;
      try {
        sheet.replaceSync('');
        nudgeAdopters('clear');
      } catch { /* */ }
    },
    destroy(): void {
      try { observer.disconnect(); } catch { /* */ }
      if (sheet) {
        try { sheet.replaceSync(''); } catch { /* */ }
      }
      sheet = null;
      envSheet = null;
    },
  };
}

// Risu CSS assumes a chat-shell ancestor (.chattext/.prose/.prose-invert/.chat-width).
// Those ancestors don't exist inside the extractHtmlIslands shadow, so rewrite
// them to :host. Rewrite order matters: .prose-invert before .prose. Also rewrites
// :root to :root,:host (CSS vars absent inside shadow). Appends a :host baseline
// mirroring chat-shell default font/line-height.

interface RescopeResult {
  readonly css: string;
  readonly rootHits: number;
  readonly proseHits: number;
  readonly proseInvertHits: number;
  readonly chattextHits: number;
  readonly chatWidthHits: number;
}

export function rescopeRisuEnvironment(input: string): RescopeResult {
  let css = input;
  // .prose-invert must run before .prose rewrite
  const proseInvertHits = (css.match(/\.prose-invert\b/g) ?? []).length;
  css = css.replaceAll(/\.prose-invert\b/g, ':host');
  const proseHits = (css.match(/\.prose\b(?!-)/g) ?? []).length;
  css = css.replaceAll(/\.prose\b(?!-)/g, ':host');
  const chattextHits = (css.match(/\.chattext\b/g) ?? []).length;
  css = css.replaceAll(/\.chattext\b/g, ':host');
  const chatWidthHits = (css.match(/\.chat-width\b/g) ?? []).length;
  css = css.replaceAll(/\.chat-width\b/g, ':host');
  // (?!,) skips already-paired :root,:host (Tailwind v4 @theme output)
  const rootHits = (css.match(/:root\b(?!,)/g) ?? []).length;
  css = css.replaceAll(/:root\b(?!,)/g, ':root,:host');
  // overflow:visible overrides Lumi's _htmlIsland_* host class (overflow:hidden),
  // needed for hover popups.
  css +=
    '\n/* Risu chat-shell baseline plus host overflow. */\n' +
    ':host{font-size:0.875rem !important;line-height:1.25rem !important;overflow:visible !important}\n';

  return {
    css,
    rootHits,
    proseHits,
    proseInvertHits,
    chattextHits,
    chatWidthHits,
  };
}
