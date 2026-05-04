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
import {
  addHidePanelClasses,
  clearHidePanelClasses,
  getHidePanelSheet,
} from "./hide-panel-css.js";

interface Flog {
  info: (msg: string, ...rest: unknown[]) => void;
  warn: (msg: string, ...rest: unknown[]) => void;
  error: (msg: string, ...rest: unknown[]) => void;
}

const PORTAL_WRAPPER_CLASS = "lumi-message-portal-wrapper";
const KEY_DELIMITER = "\x1f";
const SWEEP_THROTTLE_MS = 50;
// Cleanup grace: don't drop a lift on the first sweep that misses its source.
// Transient causes: stylesheet not reattached, React unmount/remount, mid-stream
// chunk. 200ms covers the common cases without delaying genuine deletes much.
const CLEANUP_GRACE_MS = 200;

interface LiftedRecord {
  readonly msgId: string;
  readonly signature: string;
  readonly wrapper: HTMLDivElement;
  /** Source elements captured at lift time. Hidden via the hide-panel-css
   *  reactive sheet (class-based), not by mutating their inline style. */
  readonly sources: readonly HTMLElement[];
  readonly inShadow: boolean;
  /** Most recent sweep that observed this exact (msgId,sig). Updated on
   *  every hit; consulted by the cleanup grace period. */
  lastSeenAt: number;
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
  /** Per-sweep deep trace — logs the full key set diff (added/dropped/kept)
   *  and a sample sig-head for each, so a streaming-time thrash shows the
   *  exact outerHTML drift between consecutive sweeps. Heavy log volume —
   *  enable only while reproducing a specific bug. */
  setDiagPortalTrace: (on: boolean) => void;
  /** Streaming gate. While `active === true` for a chat, sweeps are
   *  suppressed for that chat (Lumi React re-renders the bubble per
   *  streaming chunk and our sig would oscillate per chunk → flicker).
   *  Driven by backend `generation_state` WS messages on
   *  `generationsInFlight` 0↔N transitions. On `active: false` we
   *  schedule a final sweep so the post-stream panel state lifts
   *  cleanly. */
  setStreamingActive: (chatId: string, active: boolean) => void;
  /** Per-bubble height tracer — diagnoses the streaming-time bubble
   *  balloon. While on, every MutationObserver firing emits a structured
   *  log: per-bubble computed height + the tallest descendants (light DOM
   *  AND open shadow roots) above a configurable threshold. Throttled to
   *  ≤4 emissions/second to keep the log readable. The log marker
   *  `[balloon]` makes the data easy to grep + filter from a console
   *  dump. Pair with `dumpBalloonState()` for an on-demand snapshot. */
  setDiagBalloonTrace: (on: boolean) => void;
  /** One-shot snapshot of every bubble's height + tall descendants.
   *  Returns the same shape `setDiagBalloonTrace` emits as logs, useful
   *  to call from DevTools at a specific moment ("the bubble just
   *  ballooned — what's tall right now?"). */
  dumpBalloonState: () => readonly BalloonBubbleSample[];
  /** Toggle a per-clear log emission for the runtime min-height clearer.
   *  When on, every time we strip `min-height` from a `_content_*`
   *  inline style we log `[min-height-clear]` with the prior+next style
   *  values. Off by default; enabled while validating the fix landed. */
  setDiagMinHeightClear: (on: boolean) => void;
  /** Read-only counter of how many times the runtime min-height
   *  clearer has fired since mount. Useful for "did the fix engage at
   *  all?" without log spam. */
  minHeightClears: () => number;
  destroy: () => void;
}

export interface BalloonBubbleSample {
  readonly msgId: string;
  /** Computed height of the `[data-message-id]` element in CSS pixels. */
  readonly bubbleHeight: number;
  /** Tallest descendants (>= TALL_THRESHOLD_PX), light DOM AND open
   *  shadow descendants, capped at 8 entries per bubble. */
  readonly tall: readonly BalloonTallEntry[];
  /** Whether at least one shadow root was visited (signals island
   *  extraction is active for this bubble). */
  readonly shadowVisited: boolean;
  /** Number of descendants whose computed `display` is `none` — i.e.
   *  hidden via the hide-panel-css adopted sheet. Non-zero confirms the
   *  CSS-based source-hiding is engaged for this bubble. */
  readonly cssHidden: number;
}

export interface BalloonTallEntry {
  readonly tag: string;
  readonly className: string;
  readonly height: number;
  /** "light" or "shadow" — where the element lives relative to the
   *  bubble. Shadow entries imply Lumi's `extractHtmlIslands` extracted
   *  the content (and our sync-stash needed the shadow walk fix). */
  readonly origin: "light" | "shadow";
  /** Computed `position` value. Anything other than `static` /
   *  `relative` matters for layout reasoning. */
  readonly position: string;
  /** Outer-HTML head, ≤120 chars. The actual culprit content is usually
   *  recognisable in this preview. */
  readonly head: string;
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

  // Source-hiding moved to hide-panel-css.ts. The lifter publishes class
  // names from each lifted set; the CSS module rebuilds a document <style>
  // and a constructed CSSStyleSheet (adopted into chat-message shadows)
  // that `display: none`s any matching descendant inside `[data-component=
  // "MessageContent"]` (light DOM) or any non-overlay-wrapper shadow host.
  // CSS is declarative, applies pre-paint, doesn't race React commits.

  let throttleTimer: number | null = null;
  let pendingReason: string | null = null;
  let lastSweep: SweepStats | null = null;

  function scheduleSweep(reason: string): void {
    // Streaming gate. While ANY chat is generating, suppress sweeps
    // entirely — Lumi React re-renders the bubble per chunk + briefly
    // toggles the panel between light-DOM-text and shadow-DOM-text
    // states, so our sig oscillates → drop+re-clone cycle → user sees
    // 20Hz flicker. Pausing eliminates the cycle. The 'stream-end'
    // sweep scheduled by `setStreamingActive(chatId, false)` is the
    // canonical resume — it runs once after the final chunk lands.
    // Manual / external sweeps (`'manual'`, `'island-styles-updated'`,
    // `'fonts-ready'`) are also suppressed because they'd race with
    // the per-chunk re-renders. `clearAll` (chat switch) bypasses
    // this — see frontend.ts where it fires on `clear_bg_html`.
    if (streamingChats.size > 0) {
      return;
    }
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
  let diagPortalTrace = false;
  let traceSweepNum = 0;

  // Set of chatIds currently streaming. Populated by `setStreamingActive`
  // from backend `generation_state` WS messages. While ANY chat in this
  // set is active, sweeps short-circuit. The user only sees one chat at
  // a time so a single set + "any active = pause" rule is sufficient.
  // Per-chat tracking lets us survive concurrent streams without
  // race-y N→0 collapses.
  const streamingChats = new Set<string>();

  // Balloon-trace diagnostic. The streaming gate eliminated the panel
  // duplicate, but the user still reports the bubble grows during
  // streaming. Theories in handoff-2026-05-04-streaming-flicker.md §3:
  //   - cv-miss fallback briefly renders raw markup as text (markdown
  //     turns 4-space-indented panel HTML into <pre><code>);
  //   - TanStack Virtual's measureElement latches the highest height it
  //     ever observed;
  //   - shadow-root content has intrinsic height larger than visible.
  // Without DOM evidence we can't pick. This trace dumps per-bubble
  // heights + the tallest descendants so the next iteration knows
  // exactly which element is taking the height.
  const TALL_THRESHOLD_PX = 50;
  const BALLOON_THROTTLE_MS = 250; // ≤4 emits/sec
  const MAX_TALL_PER_BUBBLE = 8;
  const HEAD_LEN = 120;
  let diagBalloonTrace = false;
  let lastBalloonEmit = 0;
  let balloonSeq = 0;

  // Runtime min-height clearer. Lumi's React sets an inline style with
  // a `min-height: <px>` declaration on `[data-component=MessageContent]`
  // during streaming to prevent layout shift. The mismeasurement
  // captured by the balloon trace is: Lumi briefly renders the panel
  // HTML inline (markdown's 4-space-indent rule turns it into a
  // <pre><code> block, ~8KB tall), measures THAT height, then extracts
  // the panel into a shadow root. The min-height stays latched at the
  // mismeasured value for the rest of the stream.
  //
  // We can't fix Lumi's rendering race from the extension. We CAN
  // reactively clear the latched declaration once we know extraction
  // happened (the bubble has at least one populated `_htmlIsland_*`
  // shadow). Strip JUST the `min-height` declaration; leave other
  // inline styles intact (Lumi may set positioning, contain, etc. for
  // legitimate reasons).
  //
  // Match `min-height` (and only that) inside an inline style declaration.
  // Captures: leading separator (`;` or start), the declaration itself.
  // Leaves any surrounding declarations intact.
  const MIN_HEIGHT_DECL_RE = /(^|;)\s*min-height\s*:[^;]+;?/gi;
  let diagMinHeightClear = false;
  let minHeightClearCount = 0;

  function maybeClearLatchedMinHeight(target: EventTarget | Node | null): void {
    if (!(target instanceof HTMLElement)) return;
    if (target.getAttribute("data-component") !== "MessageContent") return;
    const bubble = target.closest("[data-message-id]") as HTMLElement | null;
    if (!bubble) return;
    const style = target.getAttribute("style") ?? "";
    if (style.indexOf("min-height") < 0) return;

    // Gate on "bubble has an island shadow with content" — confirms the
    // streaming-balloon pattern (panel extracted to shadow, but Lumi's
    // pre-extraction measurement latched the inline min-height). Without
    // this gate we'd be fighting Lumi's legitimate min-height for plain
    // markdown chats where the latch is doing the right thing.
    let hasIslandShadow = false;
    const islands = bubble.querySelectorAll('[class*="_htmlIsland_"]');
    for (const el of Array.from(islands)) {
      if (!(el instanceof HTMLElement)) continue;
      const sr = el.shadowRoot;
      if (sr && sr.mode === "open" && sr.childNodes.length > 0) {
        hasIslandShadow = true;
        break;
      }
    }
    if (!hasIslandShadow) return;

    // Strip ONLY the `min-height` declaration; preserve everything else.
    // The leading-`;` capture preserves separator semantics: `(?:^|;)\s*min-height: …(;?)`
    // → if the matched chunk started with `;`, replace with `;`; if it
    // started at position 0, replace with empty. Net: surrounding decls
    // stay valid CSS.
    const next = style
      .replace(MIN_HEIGHT_DECL_RE, (_match, sep: string) => {
        // The replacer captured the whole `[sep]\s*min-height:...;?`. We
        // keep just the leading separator (or empty for start-of-string)
        // so the remaining declarations stay semicolon-separated and
        // valid CSS.
        return sep;
      })
      // After the strip, the surviving string can have:
      //   - a leading "; " if min-height was the FIRST decl (sep="" but
      //     a stale `;` from the next decl) — trim handles that;
      //   - a trailing ";" if min-height was the LAST decl and we kept
      //     its leading separator;
      //   - both, if min-height was the only decl.
      // Normalize: drop any leading semicolon and any trailing semicolon
      // around the trim.
      .replace(/^\s*;\s*/, "")
      .replace(/\s*;\s*$/, "")
      .trim();

    if (next === style) return;
    if (next === "") {
      target.removeAttribute("style");
    } else {
      target.setAttribute("style", next);
    }
    minHeightClearCount += 1;
    if (diagMinHeightClear) {
      const msgId = (bubble.getAttribute("data-message-id") ?? "").slice(0, 8);
      flog.info(
        `[min-height-clear #${minHeightClearCount}] msg=${msgId} ` +
          `prev=${JSON.stringify(style.slice(0, 200))} next=${JSON.stringify(next.slice(0, 200))}`,
      );
    }
  }

  // Dedicated MutationObserver for `style`-attribute changes anywhere
  // under document.body. Filtering happens inside the callback — cheap
  // for the common case (non-MessageContent elements bail at the first
  // `getAttribute` check).
  const minHeightMo = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type !== "attributes" || r.attributeName !== "style") continue;
      try {
        maybeClearLatchedMinHeight(r.target);
      } catch (err) {
        flog.warn("message-portal: maybeClearLatchedMinHeight threw", err);
      }
    }
  });
  try {
    minHeightMo.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
  } catch (err) {
    flog.warn("message-portal: min-height MO observe failed", err);
  }

  // Tracks the (key → fullSig) of every lift that survived the prior sweep.
  // Diff'd against the current sweep to log added/dropped/kept transitions
  // AND to compute the exact first-diff byte offset between consecutive
  // versions of the same msgId's lift. Storing the full sig (not a
  // truncated head) is necessary because real-world drifts can land far
  // past any reasonable truncation — the chunkFade-strip fix unblocked
  // offset-36 drift but a follow-up streaming bug surfaced where ADD/DROP
  // share the same first 200 chars.
  // Only populated when diagPortalTrace is on.
  const prevSweepSigs = new Map<string, string>();

  function sigHead(sig: string): string {
    // Strip whitespace runs so consecutive renders' "<div\n  class=…>"
    // formatting drift doesn't drown the meaningful diff in indent noise.
    // Bumped from 200 → 600 chars after the chunkFade fix unmasked a
    // further-in-sig drift.
    const compact = sig.replace(/\s+/g, " ").slice(0, 600);
    return compact;
  }

  function sweep(reason: string): void {
    const t0 = performance.now();
    let walked = 0;
    let groupsLifted = 0;
    let elementsLifted = 0;
    let hidden = 0;
    let stale = 0;

    const presentKeys = new Set<string>();
    const visibleMsgIds = new Set<string>();
    // Per-sweep trace state. Populated only when diagPortalTrace is on so
    // the hot path stays cheap. The `currentKeys` map captures (key → fullSig)
    // so we can diff against `prevSweepSigs` at the bottom of the function
    // and compute the exact first-diff byte offset between consecutive
    // versions of the same msgId's lift.
    const currentKeys = diagPortalTrace ? new Map<string, string>() : null;
    // Per-bubble fixed-element counters for the trace summary.
    const traceBubbles: Array<{ msgId: string; fixedCount: number; groupCount: number }>
      = diagPortalTrace ? [] : [];

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

      if (fixed.length === 0) {
        if (traceBubbles) traceBubbles.push({ msgId, fixedCount: 0, groupCount: 0 });
        continue;
      }

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
      if (traceBubbles) {
        traceBubbles.push({ msgId, fixedCount: fixed.length, groupCount: groupsByParent.size });
      }

      for (const [parent, fixedChildren] of groupsByParent) {
        const liftSet = expandLiftSet(parent, fixedChildren);
        if (liftSet.length === 0) continue;

        // Sig outerHTML, normalised to ignore streaming chunk-fade wrappers.
        const sig = computeSig(liftSet);
        const key = msgId + KEY_DELIMITER + sig;
        presentKeys.add(key);
        // Stash the FULL sig so the diff at the end of the sweep can find
        // drifts past sigHead's truncation point. sigHead is computed only
        // at log-emit time.
        if (currentKeys) currentKeys.set(key, sig);

        const existing = lifted.get(key);
        if (existing) {
          // Same widget group: refresh lastSeenAt so cleanup grace restarts.
          // Source-hiding is handled by hide-panel-css, not source DOM mutation.
          existing.lastSeenAt = performance.now();
          hidden += liftSet.length;
        } else {
          // New widget group: clone, mount, register class fingerprint.
          const inShadow = (parent.getRootNode() instanceof ShadowRoot);
          const sourceShadow = inShadow ? parent.getRootNode() as ShadowRoot : null;

          const wrapper = document.createElement("div");
          wrapper.className = PORTAL_WRAPPER_CLASS;
          if (msgId) wrapper.setAttribute("data-message-id", msgId);

          if (sourceShadow) {
            // Group inside a shadow. Attach a fresh shadow on the wrapper
            // and copy adoptedStyleSheets by reference, excluding the hide-panel
            // sheet (singleton, would hide the clone too).
            const wrapperShadow = wrapper.attachShadow({ mode: "open" });
            const hidePanel = getHidePanelSheet();
            try {
              wrapperShadow.adoptedStyleSheets = [
                ...sourceShadow.adoptedStyleSheets,
              ].filter((s) => s !== hidePanel);
            } catch (err) {
              flog.warn("message-portal: adoptedStyleSheets copy failed", err);
            }
            for (const el of liftSet) {
              wrapperShadow.appendChild(el.cloneNode(true));
            }
          } else {
            // Light DOM. Clone sits at body level outside MessageContent,
            // so the document-level hide-panel rule doesn't match the clone.
            for (const el of liftSet) {
              wrapper.appendChild(el.cloneNode(true));
            }
          }

          overlayRoot.appendChild(wrapper);
          lifted.set(key, {
            msgId, signature: sig, wrapper,
            sources: liftSet, inShadow,
            lastSeenAt: performance.now(),
          });

          // Reactive CSS source-hiding. Capture every class on every
          // element in the lift set; hide-panel-css updates the document
          // <style> + the constructed sheet adopted into chat-message
          // shadows. The next time Lumi mounts a node carrying any of
          // these classes inside `[data-component="MessageContent"]` (or a
          // shadow whose host matches), it's hidden BEFORE paint — no
          // sync-stash race, no streaming-time duplicate.
          const classes: string[] = [];
          for (const el of liftSet) {
            for (const c of Array.from(el.classList)) classes.push(c);
          }
          if (classes.length > 0) addHidePanelClasses(classes);

          groupsLifted++;
          elementsLifted += liftSet.length;
        }
      }
    }

    // Drop lifted records whose signature is absent AND lastSeenAt older than
    // CLEANUP_GRACE_MS. Grace covers transient sweep misses (stylesheet
    // reattach, image reflow, React remount) so a single bad sweep doesn't
    // flicker the overlay; sustained absence still drops cleanly.
    void visibleMsgIds;
    const now = performance.now();
    for (const [key, rec] of lifted) {
      if (presentKeys.has(key)) continue;
      if (now - rec.lastSeenAt < CLEANUP_GRACE_MS) continue;
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

    // Per-sweep deep trace — toggled via __riCompat.setDiagPortalTrace(true).
    // Logs: bubble walk summary, key-set diff vs the prior sweep (added/
    // dropped/kept) with sigHead samples + a full-sig diff line whenever
    // ADD/DROP land on the same msgId. The full sig is hashed AFTER the
    // sigHead so we can compute the exact first-diff byte even when both
    // sigHeads look identical (drift past 600 chars).
    if (diagPortalTrace && currentKeys) {
      traceSweepNum += 1;
      const bubbleSummary = (traceBubbles ?? [])
        .filter((b) => b.fixedCount > 0)
        .map((b) => `${b.msgId.slice(0, 8)}:fix=${b.fixedCount}/grp=${b.groupCount}`)
        .join(",") || "<no fixed>";
      flog.info(
        `[portal-trace #${traceSweepNum}] reason=${reason} bubbles_with_fixed=${bubbleSummary} ` +
          `prev_keys=${prevSweepSigs.size} curr_keys=${currentKeys.size}`,
      );
      // Diff prevSweepSigs ↔ currentKeys. The map values are FULL sigs;
      // we extract sigHeads only at log-emit time.
      const added: Array<[string, string]> = [];
      const dropped: Array<[string, string]> = [];
      let kept = 0;
      for (const [key, fullSig] of currentKeys) {
        if (prevSweepSigs.has(key)) kept += 1;
        else added.push([key, fullSig]);
      }
      for (const [key, fullSig] of prevSweepSigs) {
        if (!currentKeys.has(key)) dropped.push([key, fullSig]);
      }
      flog.info(
        `[portal-trace #${traceSweepNum}] kept=${kept} added=${added.length} dropped=${dropped.length}`,
      );
      // Cap at 3 each to keep log volume bounded; that's enough to see
      // the drifting bytes in the panel HTML.
      for (const [key, fullSig] of added.slice(0, 3)) {
        const msgIdShort = key.split(KEY_DELIMITER)[0]?.slice(0, 8) ?? "?";
        flog.info(
          `[portal-trace #${traceSweepNum}]   +ADD msg=${msgIdShort} len=${fullSig.length} ` +
            `sigHead=${JSON.stringify(sigHead(fullSig))}`,
        );
      }
      for (const [key, fullSig] of dropped.slice(0, 3)) {
        const msgIdShort = key.split(KEY_DELIMITER)[0]?.slice(0, 8) ?? "?";
        flog.info(
          `[portal-trace #${traceSweepNum}]   -DROP msg=${msgIdShort} len=${fullSig.length} ` +
            `sigHead=${JSON.stringify(sigHead(fullSig))}`,
        );
      }
      // If both an add and a drop on the same msgId, log a per-byte hint
      // showing the first divergent character — the smoking gun for "what
      // changed inside the panel between renders". Operates on FULL sigs
      // so drift past sigHead's 600-char window is still caught.
      for (const [aKey, aFull] of added) {
        const aMsg = aKey.split(KEY_DELIMITER)[0];
        const sibling = dropped.find((d) => d[0].split(KEY_DELIMITER)[0] === aMsg);
        if (!sibling) continue;
        const [, dFull] = sibling;
        let diffAt = -1;
        const len = Math.min(aFull.length, dFull.length);
        for (let i = 0; i < len; i++) {
          if (aFull.charCodeAt(i) !== dFull.charCodeAt(i)) { diffAt = i; break; }
        }
        if (diffAt === -1 && aFull.length !== dFull.length) diffAt = len;
        if (diffAt >= 0) {
          const window = (s: string): string =>
            JSON.stringify(s.slice(Math.max(0, diffAt - 30), diffAt + 60).replace(/\s+/g, " "));
          flog.info(
            `[portal-trace #${traceSweepNum}]   ↻DRIFT msg=${(aMsg ?? '?').slice(0, 8)} firstDiffAt=${diffAt} ` +
              `prev_len=${dFull.length} curr_len=${aFull.length} ` +
              `prev=${window(dFull)} curr=${window(aFull)}`,
          );
        }
      }
      // Snapshot for next sweep's diff. Stores FULL sigs.
      prevSweepSigs.clear();
      for (const [key, fullSig] of currentKeys) prevSweepSigs.set(key, fullSig);
    }
  }

  function collectBalloonState(): BalloonBubbleSample[] {
    const out: BalloonBubbleSample[] = [];
    const containers = document.querySelectorAll("[data-message-id]");
    for (const c of Array.from(containers)) {
      if (!(c instanceof HTMLElement)) continue;
      // Don't dump our own overlay clones.
      if (c.closest(`.${PORTAL_WRAPPER_CLASS}`)) continue;
      const msgId = c.getAttribute("data-message-id") ?? "";
      const rect = c.getBoundingClientRect();
      const bubbleHeight = Math.round(rect.height);
      const tall: BalloonTallEntry[] = [];
      let shadowVisited = false;
      // CSS-hidden via hide-panel-css.ts: the diag counts how many tracked
      // panel descendants are present in the bubble (visible = the count
      // excluded from the tall list). Surfaced as `cssHidden` in the dump
      // so balloon traces can confirm the source IS being suppressed.
      let cssHidden = 0;

      const recordTall = (
        el: HTMLElement,
        origin: "light" | "shadow",
      ): void => {
        if (tall.length >= MAX_TALL_PER_BUBBLE) return;
        const h = el.getBoundingClientRect().height;
        if (h < TALL_THRESHOLD_PX) return;
        const cs = getComputedStyle(el);
        const head = el.outerHTML.slice(0, HEAD_LEN).replace(/\s+/g, " ");
        const className = el.className && typeof el.className === "string"
          ? (el.className as string).slice(0, 80)
          : "";
        tall.push({
          tag: el.tagName,
          className,
          height: Math.round(h),
          origin,
          position: cs.position,
          head,
        });
      };

      const visit = (
        start: ParentNode,
        origin: "light" | "shadow",
      ): void => {
        const all = (start as { querySelectorAll?: (s: string) => NodeListOf<Element> })
          .querySelectorAll
          ? (start as Element).querySelectorAll("*")
          : null;
        if (!all) return;
        for (const el of Array.from(all)) {
          if (!(el instanceof HTMLElement)) continue;
          if (el.closest(`.${PORTAL_WRAPPER_CLASS}`)) continue;
          // Don't recordTall for elements the hide-panel CSS is suppressing.
          // `display: none !important` collapses computed display to 'none';
          // they take zero layout, so they CAN'T be tall, but we still skip
          // explicitly to keep the diag list focused on what's visibly tall.
          if (getComputedStyle(el).display === "none") {
            cssHidden += 1;
            continue;
          }
          recordTall(el, origin);
          if (el.shadowRoot && el.shadowRoot.mode === "open") {
            shadowVisited = true;
            visit(el.shadowRoot, "shadow");
          }
        }
      };
      visit(c, "light");
      // Sort tall descending by height so the worst offender is first.
      tall.sort((a, b) => b.height - a.height);
      out.push({
        msgId,
        bubbleHeight,
        tall: tall.slice(0, MAX_TALL_PER_BUBBLE),
        shadowVisited,
        cssHidden,
      });
    }
    return out;
  }

  function maybeEmitBalloonTrace(reason: string): void {
    if (!diagBalloonTrace) return;
    const now = (typeof performance !== "undefined" ? performance.now() : Date.now());
    if (now - lastBalloonEmit < BALLOON_THROTTLE_MS) return;
    lastBalloonEmit = now;
    const samples = collectBalloonState();
    // Only emit bubbles that are interesting: tall children present OR
    // bubble itself is large (>250px). Cuts log volume.
    const interesting = samples.filter(
      (s) => s.tall.length > 0 || s.bubbleHeight > 250,
    );
    if (interesting.length === 0) return;
    const seq = ++balloonSeq;
    const streaming = streamingChats.size > 0;
    flog.info(
      `[balloon #${seq}] reason=${reason} streaming=${streaming} ` +
        `bubbles=${interesting.length}/${samples.length}`,
    );
    for (const s of interesting) {
      flog.info(
        `[balloon #${seq}]   bubble msg=${s.msgId.slice(0, 8)} h=${s.bubbleHeight}px ` +
          `cssHidden=${s.cssHidden} shadow=${s.shadowVisited} tall=${s.tall.length}`,
      );
      for (const t of s.tall.slice(0, 5)) {
        flog.info(
          `[balloon #${seq}]     ${t.origin}/${t.tag} h=${t.height}px pos=${t.position} ` +
            `cls=${JSON.stringify(t.className.slice(0, 50))} ` +
            `head=${JSON.stringify(t.head)}`,
        );
      }
    }
  }

  function clearAll(reason: string): void {
    if (lifted.size === 0) return;
    for (const [, rec] of lifted) {
      try { rec.wrapper.remove(); } catch { /* */ }
    }
    const n = lifted.size;
    lifted.clear();
    // Drop CSS hide-rules so a class learned for card A doesn't bleed
    // into card B (where the same class might refer to non-fixed content).
    clearHidePanelClasses();
    flog.info(`message-portal: clearAll reason=${reason} cleared=${n}`);
  }

  const mo = new MutationObserver(() => {
    // Source-hiding is now declarative via hide-panel-css.ts — no per-
    // mutation sync-stash needed. The throttled sweep below still runs
    // for full accounting (lift state + cleanup + diagnostics).
    try { maybeEmitBalloonTrace("mutation"); } catch { /* */ }
    scheduleSweep("mutation");
  });
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
    setDiagPortalTrace: (on: boolean) => {
      diagPortalTrace = on;
      if (!on) prevSweepSigs.clear();
    },
    setStreamingActive: (chatId: string, active: boolean) => {
      const wasStreaming = streamingChats.size > 0;
      if (active) {
        streamingChats.add(chatId);
      } else {
        streamingChats.delete(chatId);
      }
      const isStreaming = streamingChats.size > 0;
      flog.info(
        `message-portal: setStreamingActive chat=${chatId.slice(0, 8)} active=${active} ` +
          `streaming_count=${streamingChats.size}`,
      );
      // Edge transition: streaming just ended → schedule one catch-up
      // sweep so the post-stream panel state lifts cleanly. The
      // throttle path is gated above; we bypass by clearing the gate
      // first (already done via streamingChats.delete) and calling
      // scheduleSweep directly.
      if (wasStreaming && !isStreaming) {
        scheduleSweep("stream-end");
      }
      // Force one balloon-trace dump at every streaming edge so the
      // log captures "bubble at stream start" + "bubble at stream end"
      // even when intermediate mutations didn't trip the throttle.
      if (diagBalloonTrace) {
        lastBalloonEmit = 0;
        try { maybeEmitBalloonTrace(active ? "stream-start" : "stream-end"); } catch { /* */ }
      }
    },
    setDiagBalloonTrace: (on: boolean) => {
      diagBalloonTrace = on;
      lastBalloonEmit = 0;
      flog.info(`message-portal: setDiagBalloonTrace = ${on}`);
      // Emit one immediate sample so the user sees current state without
      // having to wait for the next mutation.
      if (on) {
        try { maybeEmitBalloonTrace("toggle-on"); } catch { /* */ }
      }
    },
    dumpBalloonState: () => collectBalloonState(),
    setDiagMinHeightClear: (on: boolean) => {
      diagMinHeightClear = on;
      flog.info(
        `message-portal: setDiagMinHeightClear = ${on} (cumulative_clears=${minHeightClearCount})`,
      );
    },
    minHeightClears: () => minHeightClearCount,
    destroy: () => {
      try { mo.disconnect(); } catch { /* */ }
      try { minHeightMo.disconnect(); } catch { /* */ }
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

// Sig normalisation. outerHTML drifts per render: streamed-text fade-in spans
// (_chunkFade_*) come and go on a 180ms cycle, and inter-element whitespace
// nodes drift between light-DOM and shadow-DOM parse paths. Strip both for
// identity. Element text content is preserved since dynamic values
// ("Turn: 5" -> "Turn: 6") are legitimate identity changes.
const CHUNK_FADE_RE = /<span class="_chunkFade_[^"]*">[\s\S]*?<\/span>/g;
const INTER_TAG_WS_RE = />\s+</g;

function normalizeSig(html: string): string {
  let out = html;
  if (out.indexOf("_chunkFade_") >= 0) {
    out = out.replace(CHUNK_FADE_RE, "");
  }
  out = out.replace(INTER_TAG_WS_RE, "><");
  return out;
}

function computeSig(liftSet: readonly HTMLElement[]): string {
  let acc = "";
  for (const el of liftSet) acc += normalizeSig(el.outerHTML);
  return acc;
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
