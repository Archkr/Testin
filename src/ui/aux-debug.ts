import type { BackendToFrontend } from '../types/messages.js';
import type { FrontendLog } from './drawer.js';

// Floating panel for aux_debug_capture WS messages. Holds a ring
// buffer (max 50) so heavy-aux cards don't flood the session.

const MAX_ENTRIES = 50;

type CaptureMsg = Extract<BackendToFrontend, { type: 'aux_debug_capture' }>;

interface Entry {
  readonly msg: CaptureMsg;
  readonly el: HTMLElement;
}

export interface AuxDebugHandle {
  handleBackendMessage(msg: BackendToFrontend): void;
  destroy(): void;
}

export function createAuxDebugPanel(log: FrontendLog): AuxDebugHandle {
  log.info('aux-debug: creating panel');

  const host = document.createElement('div');
  host.className = 'risu-aux-debug-host';
  host.hidden = true;
  document.body.appendChild(host);

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'risu-aux-debug-toggle';
  const toggleLabel = document.createElement('span');
  toggleLabel.textContent = 'Aux Debug';
  toggleBtn.title = 'Open the aux-model capture panel.';
  const badge = document.createElement('span');
  badge.className = 'risu-aux-debug-toggle-badge';
  badge.hidden = true;
  toggleBtn.appendChild(toggleLabel);
  toggleBtn.appendChild(badge);
  host.appendChild(toggleBtn);

  const panel = document.createElement('div');
  panel.className = 'risu-aux-debug-panel';
  panel.hidden = true;
  host.appendChild(panel);

  const header = document.createElement('div');
  header.className = 'risu-aux-debug-header';
  const title = document.createElement('div');
  title.className = 'risu-aux-debug-title';
  title.textContent = 'Aux-model captures';
  header.appendChild(title);
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'risu-aux-debug-action';
  clearBtn.textContent = 'Clear';
  clearBtn.title = 'Drop captured entries.';
  header.appendChild(clearBtn);
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'risu-aux-debug-action';
  closeBtn.textContent = 'Close';
  closeBtn.title = 'Close the panel.';
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const listEl = document.createElement('div');
  listEl.className = 'risu-aux-debug-list';
  panel.appendChild(listEl);

  const emptyEl = document.createElement('div');
  emptyEl.className = 'risu-aux-debug-empty';
  emptyEl.textContent = 'No captures. Enable in Settings > Debug capture.';

  const entries: Entry[] = [];
  let unread = 0;
  let panelOpen = false;

  function refreshToggle(): void {
    // Show host whenever we have captures OR the panel is open.
    host.hidden = entries.length === 0 && !panelOpen;
    if (unread > 0) {
      badge.hidden = false;
      badge.textContent = String(unread);
    } else {
      badge.hidden = true;
    }
  }

  function refreshListEmpty(): void {
    if (entries.length === 0) {
      if (!emptyEl.parentNode) listEl.appendChild(emptyEl);
    } else {
      if (emptyEl.parentNode) emptyEl.remove();
    }
  }

  function setPanelOpen(next: boolean): void {
    panelOpen = next;
    panel.hidden = !next;
    if (next) {
      unread = 0;
    }
    refreshToggle();
  }

  toggleBtn.addEventListener('click', () => setPanelOpen(!panelOpen));
  closeBtn.addEventListener('click', () => setPanelOpen(false));
  clearBtn.addEventListener('click', () => {
    while (entries.length > 0) {
      const e = entries.pop()!;
      e.el.remove();
    }
    unread = 0;
    refreshListEmpty();
    refreshToggle();
    log.info('aux-debug: cleared');
  });

  function formatHeader(msg: CaptureMsg): string {
    const ts = new Date(msg.ts);
    const hh = String(ts.getHours()).padStart(2, '0');
    const mm = String(ts.getMinutes()).padStart(2, '0');
    const ss = String(ts.getSeconds()).padStart(2, '0');
    const channel = msg.channel ?? 'aux';
    const conn = msg.auxConnectionId ? msg.auxConnectionId.slice(0, 8) + '…' : '<default>';
    const model = msg.auxModelOverride ?? '<connection>';
    const chat = msg.chatId ? msg.chatId.slice(0, 8) + '…' : '<no-chat>';
    return `${hh}:${mm}:${ss} · ${channel} · conn=${conn} · model=${model} · chat=${chat}`;
  }

  function buildEntry(msg: CaptureMsg): HTMLElement {
    const entryEl = document.createElement('div');
    entryEl.className = 'risu-aux-debug-entry';

    const headerRow = document.createElement('div');
    headerRow.className = 'risu-aux-debug-entry-header';

    const channel = msg.channel ?? 'aux';
    const channelBadge = document.createElement('span');
    channelBadge.className = `risu-aux-debug-channel risu-aux-debug-channel-${channel}`;
    channelBadge.textContent = channel;
    channelBadge.title = channel === 'submodel'
      ? "V2 runLLM(model='submodel') call"
      : "Aux model (axLLMMain / LLMMain) call";
    headerRow.appendChild(channelBadge);

    const kindBadge = document.createElement('span');
    kindBadge.className = `risu-aux-debug-kind risu-aux-debug-kind-${msg.kind}`;
    kindBadge.textContent = msg.kind;
    headerRow.appendChild(kindBadge);

    const meta = document.createElement('span');
    meta.className = 'risu-aux-debug-meta';
    meta.textContent = formatHeader(msg);
    headerRow.appendChild(meta);

    const elapsed = document.createElement('span');
    elapsed.className = 'risu-aux-debug-elapsed';
    elapsed.textContent = msg.elapsedMs === null ? '-' : `${msg.elapsedMs}ms`;
    headerRow.appendChild(elapsed);

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'risu-aux-debug-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const json = formatJson(msg.payload);
      copyToClipboard(json).then((ok) => {
        copyBtn.textContent = ok ? 'Copied!' : 'Failed';
        window.setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
      });
    });
    headerRow.appendChild(copyBtn);

    entryEl.appendChild(headerRow);

    const body = document.createElement('div');
    body.className = 'risu-aux-debug-body';
    const pre = document.createElement('pre');
    pre.className = 'risu-aux-debug-json';
    pre.textContent = formatJson(msg.payload);
    body.appendChild(pre);
    entryEl.appendChild(body);

    headerRow.addEventListener('click', () => {
      entryEl.classList.toggle('is-open');
    });

    return entryEl;
  }

  function addEntry(msg: CaptureMsg): void {
    const el = buildEntry(msg);
    // flex-direction: column-reverse makes append render at the top.
    listEl.appendChild(el);
    entries.push({ msg, el });

    while (entries.length > MAX_ENTRIES) {
      const dropped = entries.shift()!;
      dropped.el.remove();
    }

    if (!panelOpen) unread++;
    refreshListEmpty();
    refreshToggle();
  }

  function handleBackendMessage(msg: BackendToFrontend): void {
    if (msg.type !== 'aux_debug_capture') return;
    log.info(
      `aux-debug: capture id=${msg.id} channel=${msg.channel ?? 'aux'} kind=${msg.kind} ` +
        `chatId=${msg.chatId ?? '<none>'} elapsed=${msg.elapsedMs ?? '—'}ms`,
    );
    addEntry(msg);
  }

  function destroy(): void {
    log.info('aux-debug: destroy');
    try { host.remove(); } catch { /* */ }
    entries.length = 0;
  }

  refreshListEmpty();
  refreshToggle();
  log.info('aux-debug: ready');

  return { handleBackendMessage, destroy };
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    // Circular or non-serialisable fallback.
    try {
      return String(value);
    } catch {
      return '<unserialisable>';
    }
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  // execCommand fallback for non-secure contexts.
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
