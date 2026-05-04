// Runtime DOM lifter: post-cascade detection, group-by-parent lifting.
// Walks rendered chat-message subtrees, finds position:fixed elements, groups
// by immediate parent, and CLONES each group into a body-level overlay so they
// escape Lumi's row transform containing block. Sources stay in place (React
// happy) but get display:none.
//
// Cloning instead of moving: React owns the bubble DOM and moves break it.
//
// Group-by-parent (not lift-shadow-host): some patterns put fixed siblings
// under one wrapper (group lifts together so `:checked ~ .panel` keeps
// working); others put fixed children inside a position:relative parent
// (lifting the shadow drags the relative wrapper, breaking layout, so we
// lift only the fixed children).
//
// Lift-span backward extension: contiguous span from first to last fixed
// sibling, extended backward to include any preceding sibling whose `id` is
// referenced by a `for=` attribute on something in the span. Covers the
// hidden-input/label/panel toggle pattern where the input isn't fixed but
// is required for `:checked ~` to work.
//
// Wrapper inside a shadow: gets its own attached shadow with adoptedStyleSheets
// copied by reference. replaceSync updates propagate to both source and overlay.
//
// Lifecycle: clones survive virtualization. Same content remount keys on
// (msgId, sig). Content change cleans old + clones new. Chat switch is an
// explicit clearAll().

import type { SpindleFrontendContext } from "lumiverse-spindle-types";

interface Flog {
  info: (msg: string, ...rest: unknown[]) => void;
  warn: (msg: string, ...rest: unknown[]) => void;
  error: (msg: string, ...rest: unknown[]) => void;
}

const PORTAL_WRAPPER_CLASS = "lumi-message-portal-wrapper";
const STASHED_ATTR = "data-lumi-portal-stashed";
const ORIG_DISPLAY_ATTR = "data-lumi-portal-orig-display";
const KEY_DELIMITER = "\x1f";
const SWEEP_THROTTLE_MS = 50;

// Hide a source element after lifting. Records the author's original inline
// display so we can restore it on unstash and distinguish our hide from
// author-set display:none.
function stashSource(el: HTMLElement): void {
  if (el.hasAttribute(STASHED_ATTR)) return;
  const origDisplay = el.style.display;
  el.setAttribute(ORIG_DISPLAY_ATTR, origDisplay);
  el.setAttribute(STASHED_ATTR, "1");
  el.style.display = "none";
}

// Restore the author's original display. Idempotent: no-op if not stashed
// by us. Used to clean source for sig computation and to clone in author
// state so the clone reflects the author's intended display.
function unstashSource(el: HTMLElement): void {
  if (!el.hasAttribute(STASHED_ATTR)) return;
  const orig = el.getAttribute(ORIG_DISPLAY_ATTR) ?? "";
  if (orig === "") {
    el.style.removeProperty("display");
  } else {
    el.style.display = orig;
  }
  el.removeAttribute(ORIG_DISPLAY_ATTR);
  el.removeAttribute(STASHED_ATTR);
  if (el.getAttribute("style") === "") el.removeAttribute("style");
}

interface LiftedRecord {
  readonly msgId: string;
  readonly signature: string;
  readonly wrapper: HTMLDivElement;
  /** Source elements that were stashed (display:none) for this lift. */
  readonly sources: readonly HTMLElement[];
  readonly inShadow: boolean;
}

interface SweepStats {
  readonly reason: string;
  readonly durationMs: number;
  readonly walked: number;
  readonly groupsLifted: number;
  readonly elementsLifted: number;
  readonly hidden: number;
  readonly stale: number;
}

export interface MessagePortal {
  sweep: (reason: string) => void;
  clearAll: (reason: string) => void;
  diagnostic: () => {
    overlayChildCount: number;
    liftedCount: number;
    lastSweep: SweepStats | null;
  };
  setDiagAllSweeps: (on: boolean) => void;
  destroy: () => void;
}

export function setupMessagePortal(ctx: SpindleFrontendContext, flog: Flog): MessagePortal {
  let overlayHandle: { root: HTMLElement; destroy: () => void };
  try {
    const handle = ctx.ui.mountApp({ position: "end", className: "lumi-message-portal-root" });
    overlayHandle = {
      root: handle.root,
      destroy: () => { try { handle.destroy(); } catch { /* */ } },
    };
    flog.info("message-portal: mountApp acquired overlay root");
  } catch (err) {
    flog.warn("message-portal: mountApp failed; using document.body fallback", err);
    const root = document.createElement("div");
    root.className = "lumi-message-portal-root";
    document.body.appendChild(root);
    overlayHandle = { root, destroy: () => { try { root.remove(); } catch { /* */ } } };
  }
  const overlayRoot = overlayHandle.root;

  const lifted = new Map<string, LiftedRecord>();

  let throttleTimer: number | null = null;
  let pendingReason: string | null = null;
  let lastSweep: SweepStats | null = null;

  function scheduleSweep(reason: string): void {
    if (throttleTimer !== null) {
      if (!pendingReason) pendingReason = reason;
      return;
    }
    pendingReason = reason;
    throttleTimer = window.setTimeout(() => {
      throttleTimer = null;
      const r = pendingReason ?? "?";
      pendingReason = null;
      sweep(r);
    }, SWEEP_THROTTLE_MS);
  }

  let diagAllSweeps = false;

  function sweep(reason: string): void {
    const t0 = performance.now();
    let walked = 0;
    let groupsLifted = 0;
    let elementsLifted = 0;
    let hidden = 0;
    let stale = 0;

    const presentKeys = new Set<string>();
    const visibleMsgIds = new Set<string>();

    const containers = document.querySelectorAll("[data-message-id]");
    for (const containerEl of containers) {
      const container = containerEl as HTMLElement;
      if (container.closest(`.${PORTAL_WRAPPER_CLASS}`)) continue;
      const msgId = container.getAttribute("data-message-id") ?? "";
      visibleMsgIds.add(msgId);

      const fixed: HTMLElement[] = [];
      function visit(node: ParentNode): void {
        const childrenList = (node as { children?: HTMLCollection }).children;
        if (!childrenList) return;
        for (const child of Array.from(childrenList)) {
          walked++;
          if (!(child instanceof HTMLElement)) continue;
          if (child.closest(`.${PORTAL_WRAPPER_CLASS}`)) continue;
          if (child.hasAttribute("popover") || child.tagName === "DIALOG") continue;
          let isFixed = false;
          try { isFixed = window.getComputedStyle(child).position === "fixed"; } catch { /* */ }
          if (isFixed) {
            if (hasCbAncestorBetween(child, container)) continue;
            fixed.push(child);
            continue;
          }
          visit(child);
          if (child.shadowRoot && child.shadowRoot.mode === "open") visit(child.shadowRoot);
        }
      }
      visit(container);
      if (container.shadowRoot && container.shadowRoot.mode === "open") visit(container.shadowRoot);

      if (fixed.length === 0) continue;

      // Group by immediate parent. Right granularity for both the
      // sibling-widget shape and the child-decorative-under-relative-panel shape.
      const groupsByParent = new Map<ParentNode, HTMLElement[]>();
      for (const el of fixed) {
        const p = el.parentNode;
        if (!p) continue;
        if (p.nodeType !== Node.ELEMENT_NODE && p.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) continue;
        const arr = groupsByParent.get(p) ?? [];
        arr.push(el);
        groupsByParent.set(p, arr);
      }

      for (const [parent, fixedChildren] of groupsByParent) {
        const liftSet = expandLiftSet(parent, fixedChildren);
        if (liftSet.length === 0) continue;

        // Restore sources to author state before sig and cloning. Without
        // this, our display:none changes outerHTML so sigs churn, and the
        // clone inherits the hide. unstashSource is idempotent.
        for (const el of liftSet) unstashSource(el);

        const sig = liftSet.map((el) => el.outerHTML).join("");
        const key = msgId + KEY_DELIMITER + sig;
        presentKeys.add(key);

        if (lifted.has(key)) {
          // Same widget group: re-stash sources (covers re-mount with fresh DOM).
          for (const el of liftSet) stashSource(el);
          hidden += liftSet.length;
        } else {
          // New widget group: clone in author state, mount, stash sources.
          const inShadow = (parent.getRootNode() instanceof ShadowRoot);
          const sourceShadow = inShadow ? parent.getRootNode() as ShadowRoot : null;

          const wrapper = document.createElement("div");
          wrapper.className = PORTAL_WRAPPER_CLASS;
          if (msgId) wrapper.setAttribute("data-message-id", msgId);

          if (sourceShadow) {
            // Group inside a shadow. Attach a fresh shadow on the wrapper
            // and copy adoptedStyleSheets by reference so updates propagate.
            const wrapperShadow = wrapper.attachShadow({ mode: "open" });
            try {
              wrapperShadow.adoptedStyleSheets = [
                ...sourceShadow.adoptedStyleSheets,
              ];
            } catch (err) {
              flog.warn("message-portal: adoptedStyleSheets copy failed", err);
            }
            for (const el of liftSet) {
              wrapperShadow.appendChild(el.cloneNode(true));
            }
          } else {
            // Light DOM. Cross-rule CSS reaches via the chat-scope style
            // injected in document.head with [data-message-id] prefix.
            for (const el of liftSet) {
              wrapper.appendChild(el.cloneNode(true));
            }
          }

          for (const el of liftSet) stashSource(el);
          overlayRoot.appendChild(wrapper);
          lifted.set(key, {
            msgId, signature: sig, wrapper,
            sources: liftSet, inShadow,
          });
          groupsLifted++;
          elementsLifted += liftSet.length;
        }
      }
    }

    // Drop lifted records whose signature is absent from this sweep. Covers
    // state-change replacement (fresh sig already lifted as separate entry)
    // and bubble unmount (delete or virtualization). Trade-off: virtualization
    // remount loses DOM-only state and re-clones from source, but avoids
    // permanent orphans on genuine deletes.
    void visibleMsgIds;
    for (const [key, rec] of lifted) {
      if (presentKeys.has(key)) continue;
      try { rec.wrapper.remove(); } catch { /* */ }
      lifted.delete(key);
      stale++;
    }

    const dt = performance.now() - t0;
    const stats: SweepStats = {
      reason, durationMs: dt, walked,
      groupsLifted, elementsLifted, hidden, stale,
    };
    lastSweep = stats;
    if (groupsLifted > 0 || hidden > 0 || stale > 0 || dt > 10 || diagAllSweeps) {
      flog.info(
        `message-portal: sweep reason=${reason} walked=${walked} bubbles=${visibleMsgIds.size} ` +
          `groups=${groupsLifted} elements=${elementsLifted} hidden=${hidden} stale=${stale} ` +
          `${dt.toFixed(1)}ms total_overlay=${lifted.size}`,
      );
    }
  }

  function clearAll(reason: string): void {
    if (lifted.size === 0) return;
    for (const [, rec] of lifted) {
      try { rec.wrapper.remove(); } catch { /* */ }
    }
    const n = lifted.size;
    lifted.clear();
    flog.info(`message-portal: clearAll reason=${reason} cleared=${n}`);
  }

  const mo = new MutationObserver(() => scheduleSweep("mutation"));
  try {
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (err) {
    flog.error("message-portal: MutationObserver.observe failed", err);
  }

  scheduleSweep("init");

  let resizeTimer: number | null = null;
  function onResize(): void {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeTimer = null;
      scheduleSweep("resize");
    }, 250);
  }
  window.addEventListener("resize", onResize);

  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready
      .then(() => scheduleSweep("fonts-ready"))
      .catch(() => { /* */ });
  }

  flog.info("message-portal: setup complete (mode=runtime-DOM-clone-lifter, lift-unit=group-by-parent)");

  return {
    sweep: scheduleSweep,
    clearAll,
    diagnostic: () => ({
      overlayChildCount: overlayRoot.childElementCount,
      liftedCount: lifted.size,
      lastSweep,
    }),
    setDiagAllSweeps: (on: boolean) => { diagAllSweeps = on; },
    destroy: () => {
      try { mo.disconnect(); } catch { /* */ }
      window.removeEventListener("resize", onResize);
      if (throttleTimer !== null) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
        resizeTimer = null;
      }
      for (const [, rec] of lifted) {
        try { rec.wrapper.remove(); } catch { /* */ }
      }
      lifted.clear();
      overlayHandle.destroy();
      flog.info("message-portal: destroyed");
    },
  };
}

// Returns the contiguous span to lift given a parent and its fixed direct
// children. Includes every sibling between first and last fixed child
// (preserves :nth-* and sibling combinators), plus preceding siblings whose
// id is referenced by a for= in the span (covers the hidden-checkbox toggle
// pattern where the input is display:none but the panel needs `:checked ~`).
function expandLiftSet(
  parent: ParentNode,
  fixedDirectChildren: readonly HTMLElement[],
): HTMLElement[] {
  const allChildren = Array.from(parent.children) as HTMLElement[];
  const fixedSet = new Set<HTMLElement>(fixedDirectChildren);
  let start = -1;
  let end = -1;
  for (let i = 0; i < allChildren.length; i++) {
    const c = allChildren[i];
    if (c !== undefined && fixedSet.has(c)) {
      if (start === -1) start = i;
      end = i;
    }
  }
  if (start === -1) return [];

  // Collect for= references inside the current span.
  const refIds = new Set<string>();
  for (let i = start; i <= end; i++) {
    const c = allChildren[i]!;
    const forAttr = c.getAttribute("for");
    if (forAttr) refIds.add(forAttr);
    for (const labelLike of c.querySelectorAll("[for]")) {
      const f = labelLike.getAttribute("for");
      if (f) refIds.add(f);
    }
  }

  // Expand start backward through preceding siblings whose id is referenced.
  // Stop at the first non-matching sibling.
  for (let i = start - 1; i >= 0; i--) {
    const c = allChildren[i]!;
    if (c.id && refIds.has(c.id)) {
      start = i;
      continue;
    }
    break;
  }

  return allChildren.slice(start, end + 1);
}

function hasCbAncestorBetween(el: HTMLElement, bubble: HTMLElement): boolean {
  let cur: Node | null = el.parentNode;
  while (cur) {
    if (cur instanceof ShadowRoot) {
      cur = cur.host;
      continue;
    }
    if (!(cur instanceof HTMLElement)) return false;
    if (cur === bubble) return false;
    const cs = window.getComputedStyle(cur);
    if (cs.transform !== "none") return true;
    if (cs.filter !== "none") return true;
    if (cs.perspective !== "none") return true;
    if (cs.backdropFilter && cs.backdropFilter !== "none") return true;
    const contain = cs.contain;
    if (contain && contain !== "none" && /\b(?:paint|layout|strict|content)\b/.test(contain)) return true;
    const wc = cs.willChange;
    if (wc && /\b(?:transform|filter|perspective)\b/.test(wc)) return true;
    cur = cur.parentNode;
  }
  return false;
}
