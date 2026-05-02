import type { BackendToFrontend, FrontendToBackend } from '../types/messages.js';
import type { FrontendLog } from './drawer.js';

// Diagnostic logging panel. Off by default. Two switches: "Enable logging"
// turns the in-memory ring buffer on, "Include chat data" keeps message/var
// content unredacted. Download produces a structured JSON bundle then disables logging.

interface MountOpts {
  readonly root: HTMLElement;
  readonly sendToBackend: (msg: FrontendToBackend) => void;
  readonly log: FrontendLog;
}

interface LogsPanelHandle {
  handleBackendMessage(msg: BackendToFrontend): void;
  destroy(): void;
}

interface State {
  enabled: boolean;
  includeChatData: boolean;
  eventCount: number;
  bufferBytes: number;
  lastDownloadAt: number | null;
  lastError: string | null;
}

export function mountLogsPanel(opts: MountOpts): LogsPanelHandle {
  const { root, sendToBackend, log } = opts;
  log.info('logs-tab: mounting');

  const state: State = {
    enabled: false,
    includeChatData: false,
    eventCount: 0,
    bufferBytes: 0,
    lastDownloadAt: null,
    lastError: null,
  };

  root.classList.add('lr-logs-panel');

  const wrap = document.createElement('div');
  wrap.className = 'lr-logs';
  root.appendChild(wrap);

  const intro = document.createElement('p');
  intro.className = 'lr-logs-intro';
  intro.textContent = 'Capture diagnostics for a bug report. Download turns logging off.';
  wrap.appendChild(intro);

  const enableRow = makeCheckboxRow({
    id: 'lr-logs-enable',
    label: 'Enable logging',
    title: 'Capture events into a downloadable bundle.',
    onChange: (checked) => {
      sendToBackend({
        type: 'log_set_state',
        enabled: checked,
        includeChatData: state.includeChatData,
      });
    },
  });
  wrap.appendChild(enableRow.row);

  const chatRow = makeCheckboxRow({
    id: 'lr-logs-include-chat',
    label: 'Include chat data',
    title: 'Off: message content and DOM are redacted. On: full chat data captured.',
    onChange: (checked) => {
      sendToBackend({
        type: 'log_set_state',
        enabled: state.enabled,
        includeChatData: checked,
      });
    },
  });
  wrap.appendChild(chatRow.row);

  const status = document.createElement('div');
  status.className = 'lr-logs-status';
  wrap.appendChild(status);

  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.className = 'lr-logs-download';
  downloadBtn.textContent = 'Download';
  downloadBtn.title = 'Save the bundle and turn logging off.';
  downloadBtn.addEventListener('click', () => {
    if (!state.enabled && state.eventCount === 0) {
      flash('Nothing to download. Enable logging first.');
      return;
    }
    log.info('logs-tab: requesting export');
    sendToBackend({ type: 'log_request_export' });
    flash('Preparing bundle…');
  });
  wrap.appendChild(downloadBtn);

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'lr-logs-clear';
  clearBtn.textContent = 'Clear';
  clearBtn.title = 'Drop buffered events.';
  clearBtn.addEventListener('click', () => {
    sendToBackend({ type: 'log_clear' });
  });
  wrap.appendChild(clearBtn);

  const flashEl = document.createElement('div');
  flashEl.className = 'lr-logs-flash';
  wrap.appendChild(flashEl);

  let flashTimer: number | undefined;
  function flash(text: string): void {
    flashEl.textContent = text;
    if (flashTimer !== undefined) window.clearTimeout(flashTimer);
    flashTimer = window.setTimeout(() => { flashEl.textContent = ''; }, 6000);
  }

  function render(): void {
    enableRow.input.checked = state.enabled;
    chatRow.input.checked = state.includeChatData;
    chatRow.input.disabled = !state.enabled;
    chatRow.row.classList.toggle('lr-logs-row-disabled', !state.enabled);

    const kb = (state.bufferBytes / 1024).toFixed(1);
    status.textContent = state.enabled
      ? `${state.eventCount} events, ${kb} KB`
      : `Off. ${state.eventCount} events, ${kb} KB.`;
    if (state.lastError) {
      status.textContent += `  ·  ${state.lastError}`;
    }
  }

  // Ask backend for current state on mount.
  sendToBackend({ type: 'log_request_state' });
  render();

  function handleBackendMessage(msg: BackendToFrontend): void {
    if (msg.type === 'log_state_pushed') {
      state.enabled = msg.enabled;
      state.includeChatData = msg.includeChatData;
      state.eventCount = msg.eventCount;
      state.bufferBytes = msg.bufferBytes;
      render();
    } else if (msg.type === 'log_export_pushed') {
      // Frontend handles the download. Refresh status text and confirm.
      state.lastDownloadAt = Date.now();
      flash('Bundle downloaded. Logging is off.');
    }
  }

  function destroy(): void {
    log.info('logs-tab: destroy');
    if (flashTimer !== undefined) window.clearTimeout(flashTimer);
    while (root.firstChild) root.removeChild(root.firstChild);
  }

  return { handleBackendMessage, destroy };
}

interface CheckboxRowOpts {
  id: string;
  label: string;
  title: string;
  onChange: (checked: boolean) => void;
}
interface CheckboxRow {
  row: HTMLDivElement;
  input: HTMLInputElement;
}

function makeCheckboxRow(opts: CheckboxRowOpts): CheckboxRow {
  const row = document.createElement('div');
  row.className = 'lr-logs-row';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = opts.id;

  const label = document.createElement('label');
  label.htmlFor = opts.id;
  label.textContent = opts.label;
  label.title = opts.title;

  input.addEventListener('change', () => opts.onChange(input.checked));

  row.appendChild(input);
  row.appendChild(label);
  return { row, input };
}
