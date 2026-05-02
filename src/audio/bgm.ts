// Frontend BGM player (Risu parity). Singleton audio element: new markers
// ignored while one plays, slot frees on ended. Recurses into open shadow
// roots since Lumi shadow-wraps styled HTML blocks.

const BGM_POLL_MS = 100;

export function parseBgmCtrl(ctrl: string): { volume: number; url: string } | null {
  if (!ctrl.startsWith("bgm___")) return null;
  const split = ctrl.split("___");
  if (split.length < 3) return null;
  const url = split[2] ?? "";
  if (!url) return null;
  const volumeRaw = split[1];
  const parsed = volumeRaw === "auto" ? 0.5 : Number.parseFloat(volumeRaw ?? "0.5");
  const safe = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0.5;
  return { volume: safe, url };
}

interface BgmHandle {
  destroy(): void;
}

interface BgmLog {
  info(msg: string, ...rest: unknown[]): void;
  warn(msg: string, ...rest: unknown[]): void;
}

export function setupBgmPlayer(log: BgmLog): BgmHandle {
  let bgmElement: HTMLAudioElement | null = null;
  let currentUrl: string | null = null;
  let pollHandle: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function tryPlayMarker(node: HTMLElement): void {
    // Lumi's sanitizer allows hyphenated custom attributes, so risu-ctrl survives.
    const ctrl = node.getAttribute("risu-ctrl");
    if (!ctrl) return;
    const parsed = parseBgmCtrl(ctrl);
    if (!parsed) return;
    if (bgmElement) return; // singleton: ignore while one is playing
    const { volume: safeVolume, url } = parsed;
    log.info(`bgm: starting url=${url.slice(0, 60)}... volume=${safeVolume}`);
    try {
      const audio = new Audio(url);
      audio.volume = safeVolume;
      audio.addEventListener("ended", () => {
        try { audio.remove(); } catch { /* */ }
        if (bgmElement === audio) {
          bgmElement = null;
          currentUrl = null;
        }
      });
      audio.addEventListener("error", (e) => {
        log.warn(`bgm: audio error url=${url.slice(0, 60)}... event=${String(e)}`);
        if (bgmElement === audio) {
          bgmElement = null;
          currentUrl = null;
        }
      });
      bgmElement = audio;
      currentUrl = url;
      // Capture autoplay-blocked rejection to avoid unhandled-rejection.
      audio.play().catch((err) => {
        log.warn(`bgm: play() rejected — ${(err as Error).message}. ` +
          `Browser autoplay policy may require user gesture.`);
        if (bgmElement === audio) {
          bgmElement = null;
          currentUrl = null;
        }
      });
    } catch (err) {
      log.warn(`bgm: setup failed url=${url.slice(0, 60)}... — ${(err as Error).message}`);
    }
  }

  function walkSubtree(root: Node): void {
    if (stopped || bgmElement) return;
    if (root.nodeType !== Node.ELEMENT_NODE
      && root.nodeType !== Node.DOCUMENT_NODE
      && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    if (root instanceof HTMLElement && root.matches?.('[risu-ctrl^="bgm___"]')) {
      tryPlayMarker(root);
      if (bgmElement) return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let cur: Node | null = walker.nextNode();
    while (cur) {
      if (cur instanceof HTMLElement) {
        if (cur.matches('[risu-ctrl^="bgm___"]')) {
          tryPlayMarker(cur);
          if (bgmElement) return;
        }
        if (cur.shadowRoot && cur.shadowRoot.mode === 'open') { // TreeWalker only walks light DOM
          walkSubtree(cur.shadowRoot);
          if (bgmElement) return;
        }
      }
      cur = walker.nextNode();
    }
  }

  function scanRoot(): void {
    if (stopped) return;
    try {
      walkSubtree(document.body);
    } catch (err) {
      log.warn(`bgm: scanRoot threw — ${(err as Error).message}`);
    }
  }

  // MutationObserver for dynamically-added nodes. Risu observer.svelte.ts.
  // Declarative shadow roots are parsed with the host, so we catch the host
  // insertion and walk inside. Mutations inside existing shadows hit the poll.
  let observer: MutationObserver | null = null;
  try {
    observer = new MutationObserver((mutations) => {
      if (stopped || bgmElement) return;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE
            && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) continue;
          walkSubtree(node);
          if (bgmElement) return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (err) {
    log.warn(`bgm: MutationObserver setup failed — ${(err as Error).message}`);
  }

  // 100ms poll: catches markers that predate the observer or missed mutations.
  function poll(): void {
    if (stopped) return;
    scanRoot();
    pollHandle = setTimeout(poll, BGM_POLL_MS);
  }
  poll();
  log.info("bgm: setup ok (singleton observer + 100ms poll)");

  return {
    destroy(): void {
      stopped = true;
      if (pollHandle !== null) {
        clearTimeout(pollHandle);
        pollHandle = null;
      }
      try { observer?.disconnect(); } catch { /* */ }
      if (bgmElement) {
        try { bgmElement.pause(); bgmElement.remove(); } catch { /* */ }
        bgmElement = null;
      }
      currentUrl = null;
      void currentUrl; // suppress unused-var; useful debug hook
      log.info("bgm: destroyed");
    },
  };
}
