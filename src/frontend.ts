import type { SpindleFrontendContext } from 'lumiverse-spindle-types';
import type { BackendToFrontend, FrontendToBackend } from './types/messages.js';
import { STYLES } from './ui/styles.js';
import { createSidebar } from './ui/sidebar.js';
import { createAuxDebugPanel } from './ui/aux-debug.js';
import { setupBgHtmlRenderer } from './bghtml/render.js';
import { setupIslandStyles } from './bghtml/island-styles.js';
// Risu compiled CSS (Tailwind v4 + theme vars). GPL-3.0 output; reason LumiRealm is GPL-3.0.
import risuEnvironmentCss from './bghtml/risu-environment.css' with { type: 'text' };
import { setupMessagePortal } from './portal/message-portal.js';
import { dumpHidePanelState } from './portal/hide-panel-css.js';
import { setupImportOverlay } from './ui/import-overlay.js';
import { setupBgmPlayer } from './audio/bgm.js';
import { setupSvgRasterizer } from './svg-raster.js';
import { setupRealmModal, isRealmBackendMessage } from './realm/frontend.js';
import { setupAlertModal } from './ui/alert-modal.js';
import { setupPickModal } from './ui/pick-modal.js';
import { logStore } from './log/store.js';
import {
  installConsoleCapture,
  removeConsoleCapture,
  buildBundle,
  downloadBundle,
} from './log/frontend-capture.js';

const HANDSHAKE_RETRY_MS = 3000;

export const flog = {
  info(msg: string, ...rest: unknown[]): void {
    if (logStore.isEnabled()) console.log('[lumirealm]', msg, ...rest);
    logStore.push('info', 'frontend', formatLine(msg, rest));
  },
  warn(msg: string, ...rest: unknown[]): void {
    if (logStore.isEnabled()) console.warn('[lumirealm]', msg, ...rest);
    logStore.push('warn', 'frontend', formatLine(msg, rest));
  },
  error(msg: string, ...rest: unknown[]): void {
    console.error('[lumirealm]', msg, ...rest);
    logStore.push('error', 'frontend', formatLine(msg, rest));
  },
};

function formatLine(msg: string, rest: readonly unknown[]): string {
  if (rest.length === 0) return msg;
  const tail = rest.map((r) => {
    if (r instanceof Error) return `${r.name}: ${r.message}`;
    if (typeof r === 'string') return r;
    try { return JSON.stringify(r); } catch { return String(r); }
  }).join(' ');
  return `${msg} ${tail}`;
}

const LOG_STATE_LS_KEY = 'lumirealm/log-state-v1';

function hydrateLogStateFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(LOG_STATE_LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { enabled?: unknown; includeChatData?: unknown };
    if (typeof parsed.enabled === 'boolean' && typeof parsed.includeChatData === 'boolean') {
      logStore.setState({ enabled: parsed.enabled, includeChatData: parsed.includeChatData });
    }
  } catch { /* */ }
}

function persistLogStateToLocalStorage(state: { enabled: boolean; includeChatData: boolean }): void {
  try {
    localStorage.setItem(LOG_STATE_LS_KEY, JSON.stringify(state));
  } catch { /* */ }
}

export function setup(ctx: SpindleFrontendContext): () => void {
  hydrateLogStateFromLocalStorage();
  flog.info('frontend setup: begin');
  const cleanups: (() => void)[] = [];

  const originalFetch = window.fetch.bind(window);
  const taggedFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const isResolveBatch = typeof url === 'string' && url.includes('/api/v1/macros/resolve-batch');
    if (!isResolveBatch) return originalFetch(input, init);
    const t0 = performance.now();
    let reqPreview: string = '';
    try {
      const body = init?.body;
      if (typeof body === 'string') {
        const parsed = JSON.parse(body) as { templates?: Record<string, string>; chat_id?: string; character_id?: string };
        const keys = Object.keys(parsed.templates ?? {});
        const firstKey = keys[0];
        const firstTmpl = firstKey ? parsed.templates?.[firstKey] : undefined;
        reqPreview = `templates=${keys.length} chat_id=${parsed.chat_id ?? '?'} character_id=${parsed.character_id ?? '?'} first_template[0..200]=${JSON.stringify((firstTmpl ?? '').slice(0, 200))}`;
      }
    } catch { /* */ }
    flog.info(`[macro-tap] → POST resolve-batch ${reqPreview}`);
    const resp = await originalFetch(input, init);
    try {
      const clone = resp.clone();
      const text = await clone.text();
      const parsed = (() => { try { return JSON.parse(text) as { resolved?: Record<string, string> }; } catch { return null; } })();
      if (parsed?.resolved) {
        const entries = Object.entries(parsed.resolved);
        const leaksRaw = entries.filter(([, v]) => /\{\{/.test(v));
        const emptyKeys = entries.filter(([, v]) => v.length === 0).length;
        flog.info(`[macro-tap] ← resolve-batch 200 in ${Math.round(performance.now() - t0)}ms keys=${entries.length} leaks_with_raw_macros=${leaksRaw.length} empty_keys=${emptyKeys}`);
        if (leaksRaw.length > 0) {
          for (const [k, v] of leaksRaw.slice(0, 3)) {
            flog.warn(`[macro-tap]   leak id=${k} resolved[0..300]=${JSON.stringify(v.slice(0, 300))}`);
          }
        }
        for (const [k, v] of entries) {
          flog.info(`[macro-tap]   id=${k} len=${v.length} resolved[0..200]=${JSON.stringify(v.slice(0, 200))}`);
        }
      } else {
        flog.warn(`[macro-tap] ← resolve-batch HTTP ${resp.status} in ${Math.round(performance.now() - t0)}ms (body not JSON)`);
      }
    } catch (err) {
      flog.warn('[macro-tap] clone/parse failed:', err);
    }
    return resp;
  };
  Object.assign(taggedFetch, originalFetch);
  (window as unknown as { fetch: typeof fetch }).fetch = taggedFetch as typeof fetch;
  cleanups.push(() => {
    (window as unknown as { fetch: typeof fetch }).fetch = originalFetch as typeof fetch;
  });

  const dumpBubble = (): unknown => {
    const out: unknown[] = [];
    const bubbles = document.querySelectorAll('[data-message-id]');
    for (const b of bubbles) {
      const msgId = b.getAttribute('data-message-id') || '?';
      const islands: unknown[] = [];
      const islandEls = b.querySelectorAll('[class*="_htmlIsland_"]');
      for (const ie of islandEls) {
        const sr = (ie as Element).shadowRoot;
        islands.push({
          cls: ie.className,
          hasShadow: sr !== null,
          shadowMode: sr?.mode ?? null,
          shadowChildren: sr ? sr.childElementCount : null,
          shadowHasStyle: sr ? sr.querySelectorAll('style').length : null,
          shadowAdoptedSheets: sr ? sr.adoptedStyleSheets.length : null,
          lightInnerLen: ie.innerHTML.length,
          shadowInnerLen: sr ? Array.from(sr.children).map((c) => c.outerHTML).join('').length : null,
        });
      }
      out.push({ msgId: msgId.slice(0, 8), bubbleHtmlLen: b.innerHTML.length, islandCount: islandEls.length, islands });
    }
    console.log('[lumirealm] [BUBBLE-DUMP]', JSON.stringify(out, null, 2));
    return out;
  };

  const dumpStyleScope = (): unknown => {
    const chatScope = document.getElementById('risu-compat-chat-scope-css');
    const islandSheets = (() => {
      const out: { adoptedSheetCount: number; cssRulesCount: number }[] = [];
      const shadows = document.querySelectorAll('[class*="_htmlIsland_"]');
      for (const s of shadows) {
        const sr = (s as Element).shadowRoot;
        if (!sr) continue;
        const adopted = sr.adoptedStyleSheets ?? [];
        let totalRules = 0;
        for (const sh of adopted) {
          try { totalRules += sh.cssRules.length; } catch { /* */ }
        }
        out.push({ adoptedSheetCount: adopted.length, cssRulesCount: totalRules });
      }
      return out;
    })();
    const result = {
      chatScopeBytes: chatScope?.textContent?.length ?? null,
      bgHtmlHostExists: document.querySelector('[data-risu-bg-host]') !== null,
      messagePortalRootExists: document.querySelector('.lumi-message-portal-root') !== null,
      islandShadows: islandSheets,
    };
    console.log('[lumirealm] [STYLE-SCOPE]', JSON.stringify(result, null, 2));
    return result;
  };

  // Per-bubble height + tall-descendant snapshot, focused on the
  // streaming-balloon investigation (handoff-2026-05-04-streaming-flicker.md
  // §3). Run `__riCompatDump.balloon()` at the moment the bubble grows;
  // the result enumerates per-bubble `bubbleHeight` + tallest descendants
  // (light DOM AND open shadow roots) with classes + position +
  // outerHTML head — enough to identify the culprit element without
  // walking the DOM by hand.
  function dumpBalloon(): unknown {
    return messagePortal.dumpBalloonState();
  }

  // Hide-panel CSS dump — verifies the source-hiding stylesheet is built
  // and the document-level <style> is connected. Surfaces:
  //   - classes: list of classes we've added to the hide-set
  //   - documentStyleConnected: true when our <style> is in document.head
  //   - documentStyleText: the literal CSS body — paste into a sheet and
  //     try `document.querySelectorAll('.<class>')` to verify selector match
  //   - sheetRuleCount: rules in the constructed sheet adopted into shadows
  function dumpHidePanel(): unknown {
    return dumpHidePanelState();
  }

  (window as unknown as { __riCompatDump?: {
    bubble: () => unknown;
    styleScope: () => unknown;
    balloon: () => unknown;
    hidePanel: () => unknown;
  } }).__riCompatDump = {
    bubble: dumpBubble,
    styleScope: dumpStyleScope,
    balloon: dumpBalloon,
    hidePanel: dumpHidePanel,
  };
  cleanups.push(() => {
    try { delete (window as unknown as Record<string, unknown>).__riCompatDump; } catch { /* */ }
  });


  cleanups.push(ctx.dom.addStyle(STYLES));
  flog.info('frontend setup: styles injected');

  // Mute high-frequency chunk types from the send log.
  const QUIET_SEND_TYPES = new Set<string>([
    'import_card_chunk',
    'upload_module_chunk',
  ]);
  const sendToBackend = (msg: FrontendToBackend): void => {
    if (!QUIET_SEND_TYPES.has(msg.type)) {
      flog.info(`frontend send: ${msg.type}`, msg);
    }
    ctx.sendToBackend(msg);
  };

  // Blocking import-progress overlay shown from picker-click and realm-Import
  // through phase=done. Locks UI to prevent mid-import navigation. Created
  // before the sidebar so notifyImportStart wires into the cards-panel picker.
  const importOverlay = setupImportOverlay(flog, sendToBackend);
  cleanups.push(() => importOverlay.destroy());

  let sidebar: ReturnType<typeof createSidebar> | null = null;
  try {
    sidebar = createSidebar({
      ctx,
      sendToBackend,
      log: flog,
      onImportStart: (fileName, onCancel, totalBytes) =>
        importOverlay.notifyImportStart(fileName, 'drawer', onCancel, totalBytes),
      onModuleImportStart: (fileName, onCancel, totalBytes) =>
        importOverlay.notifyImportStart(fileName, 'module', onCancel, totalBytes),
    });
    cleanups.push(() => sidebar?.destroy());
    flog.info('frontend setup: unified sidebar registered');
  } catch (err) {
    flog.error('createSidebar failed:', err);
    return () => {
      for (const fn of cleanups) { try { fn(); } catch { /* ignore */ } }
    };
  }

  // Runtime DOM lifter: walks chat-message subtrees, finds position:fixed
  // elements, reparents them into a body-level overlay to escape Lumi's
  // row-transform containing block. Ground truth via getComputedStyle.
  const messagePortal = setupMessagePortal(ctx, flog);
  cleanups.push(() => messagePortal.destroy());

  // Island-styles before the bg-html renderer so the sheet exists when the
  // first render_bg_html arrives. Adopting a sheet that flips computed position
  // to fixed doesn't fire a DOM mutation, so the lifter wouldn't see it. The
  // styles-updated callback triggers a sweep.
  const islandStyles = setupIslandStyles(flog, {
    riskuEnvironmentCss: risuEnvironmentCss,
    onStylesUpdated: () => messagePortal.sweep('island-styles-updated'),
  });
  cleanups.push(() => islandStyles.destroy());

  const bgRenderer = setupBgHtmlRenderer(ctx, flog, islandStyles);
  cleanups.push(() => bgRenderer.destroy());

  // BGM player: singleton <audio> driven by `risu-ctrl="bgm___volume___url"` markers.
  // Risu observer.svelte.ts
  const bgmPlayer = setupBgmPlayer(flog);
  cleanups.push(() => bgmPlayer.destroy());

  let auxDebug: ReturnType<typeof createAuxDebugPanel> | null = null;
  try {
    auxDebug = createAuxDebugPanel(flog);
    cleanups.push(() => auxDebug?.destroy());
  } catch (err) {
    flog.error('createAuxDebugPanel failed:', err);
  }

  const alertModal = setupAlertModal({ ctx, sendToBackend, log: flog });
  cleanups.push(() => alertModal.destroy());

  const pickModal = setupPickModal({ ctx, sendToBackend, log: flog });
  cleanups.push(() => pickModal.destroy());

  let realm: ReturnType<typeof setupRealmModal> | null = null;
  try {
    if (!sidebar) throw new Error('realm: sidebar required');
    realm = setupRealmModal({
      ctx,
      sendToBackend,
      log: flog,
      mountTarget: sidebar.headerRoot,
      onImportStart: (label) => importOverlay.notifyImportStart(label, 'realm'),
    });
    cleanups.push(() => realm?.destroy());
    flog.info('frontend setup: realm modal registered');
  } catch (err) {
    flog.error('setupRealmModal failed:', err);
  }

  const svgRasterizer = setupSvgRasterizer({ log: flog, sendToBackend });

  // Risu Chat.svelte:206-231: clicks on [risu-trigger] call runTrigger(char,'manual',{manualName}).
  // Capture phase to beat Lumi handlers. risu-trigger/risu-btn/risu-id survive Lumi's sanitizer
  // (richHtmlSanitizer.ts db9ef7c isAllowedCustomAttributeName).
  let activeRisuChatId: string | null = null;
  const onClickCapture = (e: Event): void => {
    const path = typeof (e as Event & { composedPath?: () => EventTarget[] }).composedPath === 'function'
      ? (e as Event & { composedPath: () => EventTarget[] }).composedPath()
      : [];
    const t = (path[0] as HTMLElement | undefined) ?? (e.target as HTMLElement | null);
    if (!t || typeof t.closest !== 'function') return;
    const el = t.closest('[risu-trigger], [risu-btn]') as HTMLElement | null;
    if (!el) return;
    const triggerName = el.getAttribute('risu-trigger');
    if (!triggerName) return; // risu-btn without risu-trigger is a Lua-ctrl case; not wired yet
    const triggerId = el.getAttribute('risu-id') ?? undefined;
    const chatId = activeRisuChatId;
    if (!chatId) {
      flog.warn(`manual-trigger click: no active Risu chat, ignoring triggerName=${triggerName}`);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    flog.info(`manual-trigger click: triggerName=${triggerName} triggerId=${triggerId ?? '<none>'} chatId=${chatId}`);
    sendToBackend({
      type: 'manual_trigger',
      triggerName,
      ...(triggerId !== undefined ? { triggerId } : {}),
      chatId,
    });
  };
  document.addEventListener('click', onClickCapture, /* capture */ true);
  cleanups.push(() => document.removeEventListener('click', onClickCapture, /* capture */ true));

  // window.__riCompat.fire(triggerName, triggerId?): console entry point for manual triggers.
  // Non-enumerable so it stays out of auto-complete on unrelated objects.
  const debugHook = {
    get activeChatId(): string | null { return activeRisuChatId; },
    fire(triggerName: string, triggerId?: string): boolean {
      const chatId = activeRisuChatId;
      if (!chatId) {
        flog.warn(`__riCompat.fire: no active Risu chat; open one first. triggerName=${triggerName}`);
        return false;
      }
      if (typeof triggerName !== 'string' || triggerName.length === 0) {
        flog.warn('__riCompat.fire: triggerName must be a non-empty string');
        return false;
      }
      sendToBackend({
        type: 'manual_trigger',
        triggerName,
        ...(triggerId !== undefined ? { triggerId } : {}),
        chatId,
      });
      return true;
    },
    dumpPortalState(): {
      activeRisuChatId: string | null;
      portal: ReturnType<typeof messagePortal.diagnostic>;
    } {
      return {
        activeRisuChatId,
        portal: messagePortal.diagnostic(),
      };
    },
    sweepPortals(): void {
      messagePortal.sweep('manual');
    },
    setDiagAllSweeps(on: boolean): void {
      messagePortal.setDiagAllSweeps(on === true);
      flog.info(`__riCompat.setDiagAllSweeps: ${on === true ? 'ON' : 'OFF'}`);
    },
    setDiagPortalTrace(on: boolean): void {
      messagePortal.setDiagPortalTrace(on === true);
      flog.info(`__riCompat.setDiagPortalTrace: ${on === true ? 'ON' : 'OFF'}`);
    },
    setDiagBalloonTrace(on: boolean): void {
      messagePortal.setDiagBalloonTrace(on === true);
      flog.info(`__riCompat.setDiagBalloonTrace: ${on === true ? 'ON' : 'OFF'}`);
    },
    /** Synchronous one-shot: returns per-bubble height + tallest
     *  descendants (light + open shadow). Use this from DevTools at the
     *  exact moment the bubble balloons to identify the culprit element. */
    dumpBalloonState(): unknown {
      return messagePortal.dumpBalloonState();
    },
    /** Toggles a per-clear log line for the runtime min-height clearer
     *  (the runtime fix for the streaming-balloon mismeasurement). Off
     *  by default. Counter is always tracked — call `minHeightClears()`
     *  to read it without enabling the log. */
    setDiagMinHeightClear(on: boolean): void {
      messagePortal.setDiagMinHeightClear(on === true);
      flog.info(`__riCompat.setDiagMinHeightClear: ${on === true ? 'ON' : 'OFF'}`);
    },
    /** Cumulative count of min-height clears since extension mount.
     *  Non-zero confirms the runtime fix engaged at least once. */
    minHeightClears(): number {
      return messagePortal.minHeightClears();
    },
    requestVariablesSnapshot(): boolean {
      if (!activeRisuChatId) {
        flog.warn('__riCompat.requestVariablesSnapshot: no active Risu chat');
        return false;
      }
      sendToBackend({ type: 'request_variables_snapshot', chatId: activeRisuChatId });
      flog.info(`__riCompat.requestVariablesSnapshot: requested for chatId=${activeRisuChatId}`);
      return true;
    },
  };
  try {
    Object.defineProperty(window, '__riCompat', {
      value: debugHook,
      writable: false,
      configurable: true,
      enumerable: false,
    });
    cleanups.push(() => {
      try { delete (window as unknown as Record<string, unknown>).__riCompat; } catch { /* */ }
    });
  } catch (err) {
    flog.warn(`__riCompat install failed: ${(err as Error).message}`);
  }

  // Risu {{screen_width}}/{{screen_height}} macros need real viewport dims; the backend has none.
  // Sent on: every handshake retry (backend may not be up yet), resize (250ms debounce),
  // and first cards_updated (re-seed after backend restart).
  let lastSentW = -1;
  let lastSentH = -1;
  const reportDims = (reason: string, force = false): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (!force && w === lastSentW && h === lastSentH) return;
    lastSentW = w;
    lastSentH = h;
    flog.info(`screen_dims: reporting reason=${reason} w=${w} h=${h}`);
    sendToBackend({ type: 'screen_dims', width: w, height: h });
  };
  let resizeTimer: number | undefined;
  const onResize = (): void => {
    if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => reportDims('resize'), 250);
  };
  window.addEventListener('resize', onResize);
  cleanups.push(() => {
    window.removeEventListener('resize', onResize);
    if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
  });

  // Retry handshake until backend responds; cold worker or WS hiccup can delay first reply.
  let ready = false;

  // Mute high-frequency chunk acks from the recv log.
  const QUIET_RECV_TYPES = new Set<string>([
    'import_upload_ack',
    'module_upload_ack',
  ]);
  const unsub = ctx.onBackendMessage((raw) => {
    const msg = raw as BackendToFrontend;
    if (!QUIET_RECV_TYPES.has(msg.type)) {
      flog.info(`frontend recv: ${msg.type}`, msg);
    }
    if (msg.type === 'log_state_pushed') {
      logStore.setState({ enabled: msg.enabled, includeChatData: msg.includeChatData });
      persistLogStateToLocalStorage({ enabled: msg.enabled, includeChatData: msg.includeChatData });
      if (msg.enabled) installConsoleCapture();
      else removeConsoleCapture();
      // Fall through to sidebar broadcast; the Logs panel needs it.
    }
    if (msg.type === 'log_export_pushed') {
      try {
        const bundle = buildBundle({
          backendEvents: msg.events,
          session: {
            extensionVersion: msg.session.extensionVersion,
            userId: msg.session.userId,
            activeChatId: msg.session.activeChatId ?? activeRisuChatId,
            activeCharacterId: msg.session.activeCharacterId,
          },
          includeChatData: logStore.getState().includeChatData,
        });
        downloadBundle(bundle);
      } catch (err) {
        flog.error('log_export_pushed: bundle/download failed', err);
      }
      // Auto-disable per spec.
      sendToBackend({ type: 'log_set_state', enabled: false, includeChatData: false });
      // Fall through so the Logs panel can show "Downloaded".
    }
    if (msg.type === 'cards_updated') {
      if (!ready) {
        flog.info('handshake complete on first cards_updated');
        // Force resend: screen_dims sent before backend was ready may have been dropped.
        reportDims('cards_updated', /* force */ true);
      }
      ready = true;
    }
    if (msg.type === 'render_bg_html' || msg.type === 'clear_bg_html') {
      try {
        bgRenderer.handleMessage(msg);
      } catch (err) {
        flog.error('bg-html dispatch failed:', err);
      }
      // Any clear_bg_html means leaving Risu UI; null unconditionally to avoid stale chatId dispatch.
      const prevChatId = activeRisuChatId;
      if (msg.type === 'render_bg_html') activeRisuChatId = msg.chatId;
      else if (msg.type === 'clear_bg_html') activeRisuChatId = null;
      // Lifter overlay is per-chat. Drop everything on chat switch.
      // The new chat's bg-html arrives next and the lifter re-detects.
      if (activeRisuChatId !== prevChatId) {
        messagePortal.clearAll(msg.type === 'clear_bg_html' ? 'clear_bg_html' : 'chat-switch');
      }
      if (sidebar && activeRisuChatId !== prevChatId) {
        sidebar.setActiveChatId(activeRisuChatId);
      }
      return;
    }
    if (msg.type === 'rasterize_svgs') {
      svgRasterizer.handleRasterizeSvgsMessage(msg);
      return;
    }
    if (msg.type === 'generation_state') {
      // Streaming gate — backend tracks `generationsInFlight[chatId]`
      // and fires this on 0↔N transitions. The portal lifter uses it
      // to suppress sweeps for the duration of streaming, eliminating
      // the per-chunk drop+re-clone cycle that produced visible
      // 20Hz flicker.
      try {
        messagePortal.setStreamingActive(msg.chatId, msg.active === true);
      } catch (err) {
        flog.warn('generation_state dispatch failed:', err);
      }
      return;
    }
    if (msg.type === 'aux_debug_capture') {
      auxDebug?.handleBackendMessage(msg);
      return;
    }
    if (msg.type === 'request_alert') {
      alertModal.handleBackendMessage(msg);
      return;
    }
    if (msg.type === 'request_pick') {
      pickModal.handleBackendMessage(msg);
      return;
    }
    if (isRealmBackendMessage(msg)) {
      realm?.handleBackendMessage(msg);
      // Realm replies feed the overlay too (download-started ack, etc.)
      try { importOverlay.handleBackendMessage(msg as unknown as BackendToFrontend); } catch (err) { flog.warn('importOverlay realm dispatch threw:', err); }
      return;
    }
    // Import-related backend messages drive the blocking overlay (start /
    // phase / asset upload / done / error). Fire BEFORE the sidebar fan-out
    // so the overlay state stays consistent with the cards-panel status UI.
    try { importOverlay.handleBackendMessage(msg); } catch (err) { flog.warn('importOverlay dispatch threw:', err); }
    // All other messages fan out to sidebar panels; each panel filters by msg.type.
    sidebar?.handleBackendMessage(msg);
  });
  cleanups.push(unsub);

  function handshake(): void {
    flog.info('handshake: sending get_cards + screen_dims + log_request_state');
    sendToBackend({ type: 'get_cards' });
    sendToBackend({ type: 'log_request_state' });
    reportDims('handshake', /* force */ true);
  }

  handshake();
  const retry = window.setInterval(() => {
    if (ready) {
      window.clearInterval(retry);
      return;
    }
    flog.info(`handshake retry (ready=${ready})`);
    handshake();
  }, HANDSHAKE_RETRY_MS);
  cleanups.push(() => window.clearInterval(retry));

  flog.info('frontend setup: done');
  return () => {
    flog.info('frontend teardown');
    for (const fn of cleanups) { try { fn(); } catch { /* ignore */ } }
  };
}
