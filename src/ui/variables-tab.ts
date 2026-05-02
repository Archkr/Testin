import type {
  BackendToFrontend,
  FrontendToBackend,
  VariableScopes,
} from '../types/messages.js';
import type { FrontendLog } from './drawer.js';

// Live view of chat.metadata.macro_variables + defaultVariables.
// Mounts into a host element provided by ui/sidebar.ts.

interface Snapshot {
  readonly chatId: string;
  readonly seq: number;
  readonly scopes: VariableScopes;
  readonly defaults: Readonly<Record<string, string>>;
  readonly ts: number;
}

export interface VariablesTabHandle {
  handleBackendMessage(msg: BackendToFrontend): void;
  setActiveChatId(chatId: string | null): void;
  destroy(): void;
}

export interface MountVariablesPanelOptions {
  readonly root: HTMLElement;
  readonly sendToBackend: (msg: FrontendToBackend) => void;
  readonly log: FrontendLog;
}

export function mountVariablesPanel(
  opts: MountVariablesPanelOptions,
): VariablesTabHandle {
  const { sendToBackend, log } = opts;
  log.info('variables-panel: mounting');

  const root = opts.root;
  root.classList.add('risu-vars-drawer');

  const intro = document.createElement('p');
  intro.className = 'rv-intro';
  intro.textContent = 'Live macro variables for the active chat.';
  root.appendChild(intro);

  const toolbar = document.createElement('div');
  toolbar.className = 'rv-toolbar';

  const filterInput = document.createElement('input');
  filterInput.type = 'text';
  filterInput.className = 'rv-filter';
  filterInput.placeholder = 'Filter by key or value…';
  filterInput.spellcheck = false;
  toolbar.appendChild(filterInput);

  const refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'lrm-btn';
  refreshBtn.textContent = 'Refresh';
  refreshBtn.title = 'Re-fetch the snapshot.';
  toolbar.appendChild(refreshBtn);

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'lrm-btn';
  copyBtn.textContent = 'Copy JSON';
  copyBtn.title = 'Copy snapshot to clipboard.';
  toolbar.appendChild(copyBtn);

  root.appendChild(toolbar);

  const status = document.createElement('div');
  status.className = 'rv-status';
  root.appendChild(status);

  const sectionsHost = document.createElement('div');
  sectionsHost.className = 'rv-sections';
  root.appendChild(sectionsHost);

  let activeChatId: string | null = null;
  let snapshot: Snapshot | null = null;
  let filterTerm = '';
  let editingKey: string | null = null;
  let addingNew = false;
  // Edit buffers survive backend re-renders mid-edit.
  let editBuffer = '';
  let addBufferKey = '';
  let addBufferValue = '';

  function renderStatus(): void {
    if (!activeChatId) {
      status.textContent = 'Open a Risu chat to see variables.';
      status.classList.remove('rv-status-error');
      return;
    }
    if (!snapshot) {
      status.textContent = `Loading variables for chat ${shortId(activeChatId)}…`;
      status.classList.remove('rv-status-error');
      return;
    }
    if (snapshot.chatId !== activeChatId) {
      // Snapshot is for a different chat (we sent a request, response
      // hasn't landed yet). Show loading.
      status.textContent = `Loading variables for chat ${shortId(activeChatId)}…`;
      status.classList.remove('rv-status-error');
      return;
    }
    const totals = countTotals(snapshot);
    const ts = formatTime(snapshot.ts);
    status.textContent =
      `chat ${shortId(snapshot.chatId)} · seq ${snapshot.seq} · ` +
      `local=${totals.local} global=${totals.global} chat=${totals.chat} defaults=${totals.defaults} · ` +
      `updated ${ts}`;
    status.classList.remove('rv-status-error');
  }

  function renderSections(): void {
    sectionsHost.innerHTML = '';
    if (!activeChatId || !snapshot || snapshot.chatId !== activeChatId) {
      const empty = document.createElement('div');
      empty.className = 'rv-empty';
      empty.textContent = activeChatId
        ? 'Waiting for backend…'
        : 'No active Risu chat.';
      sectionsHost.appendChild(empty);
      return;
    }
    const term = filterTerm.toLowerCase();
    const sections: Array<{
      title: string;
      desc: string;
      entries: Array<[string, string]>;
      kind: 'local' | 'global' | 'chat' | 'defaults';
    }> = [
      {
        title: 'Local (chat-scoped)',
        desc: 'Main store. setvar / setChatVar / Lua setState write here.',
        entries: sortedEntries(snapshot.scopes.local),
        kind: 'local',
      },
      {
        title: 'Defaults (character)',
        desc: 'Character-level defaults. getChatVar falls back here when a key is unset.',
        entries: sortedEntries(snapshot.defaults),
        kind: 'defaults',
      },
      {
        title: 'Global',
        desc: 'Lumi-native global scope (rarely used by Risu cards).',
        entries: sortedEntries(snapshot.scopes.global),
        kind: 'global',
      },
      {
        title: 'Chat',
        desc: 'Lumi-native chat scope (rarely used by Risu cards).',
        entries: sortedEntries(snapshot.scopes.chat),
        kind: 'chat',
      },
    ];

    let hadAnyVisible = false;
    for (const sec of sections) {
      const filtered = term
        ? sec.entries.filter(
            ([k, v]) => k.toLowerCase().includes(term) || v.toLowerCase().includes(term),
          )
        : sec.entries;
      const sectionEl = document.createElement('section');
      sectionEl.className = 'rv-section';
      sectionEl.dataset['kind'] = sec.kind;
      const header = document.createElement('div');
      header.className = 'rv-section-header';
      const titleEl = document.createElement('h3');
      titleEl.className = 'rv-section-title';
      titleEl.textContent = `${sec.title}  ·  ${filtered.length}${term ? ` of ${sec.entries.length}` : ''}`;
      header.appendChild(titleEl);
      const descEl = document.createElement('span');
      descEl.className = 'rv-section-desc';
      descEl.textContent = sec.desc;
      header.appendChild(descEl);
      sectionEl.appendChild(header);

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'rv-section-empty';
        empty.textContent = term ? 'No matches.' : '(empty)';
        sectionEl.appendChild(empty);
      } else {
        hadAnyVisible = true;
        const list = document.createElement('div');
        list.className = 'rv-list';
        for (const [k, v] of filtered) {
          list.appendChild(buildRow(k, v, sec.kind, snapshot));
        }
        sectionEl.appendChild(list);
      }

      // Only the local scope is editable; defaults/global/chat are read-only.
      if (sec.kind === 'local') {
        sectionEl.appendChild(buildLocalAddRow());
      }
      sectionsHost.appendChild(sectionEl);
    }

    if (!hadAnyVisible && term) {
      const note = document.createElement('div');
      note.className = 'rv-empty';
      note.textContent = `No variables match "${filterTerm}".`;
      sectionsHost.appendChild(note);
    }
  }

  function render(): void {
    renderStatus();
    renderSections();
  }

  function buildRow(
    key: string,
    value: string,
    kind: 'local' | 'global' | 'chat' | 'defaults',
    snap: Snapshot,
  ): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'rv-row';
    row.dataset['kind'] = kind;

    if (kind === 'local' && editingKey === key) {
      row.classList.add('rv-row-editing');
      buildLocalEditor(row, key, value);
      return row;
    }

    const head = document.createElement('div');
    head.className = 'rv-row-head';

    const keyEl = document.createElement('span');
    keyEl.className = 'rv-key';
    keyEl.textContent = key;
    keyEl.title = key;
    head.appendChild(keyEl);

    if (kind === 'local' && Object.prototype.hasOwnProperty.call(snap.defaults, key)) {
      const flag = document.createElement('span');
      flag.className = 'rv-flag';
      flag.textContent = 'override';
      flag.title = `Default: ${snap.defaults[key]}`;
      head.appendChild(flag);
    }
    // Risu uses __name keys for JSON-encoded Lua state.
    if (kind === 'local' && key.startsWith('__')) {
      const flag = document.createElement('span');
      flag.className = 'rv-flag rv-flag-lua';
      flag.textContent = 'lua';
      flag.title = 'Lua state. Value is JSON-encoded.';
      head.appendChild(flag);
    }

    if (kind === 'local') {
      const actions = document.createElement('span');
      actions.className = 'rv-row-actions';
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'rv-row-btn';
      editBtn.textContent = 'Edit';
      editBtn.title = 'Edit this variable';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingKey = key;
        editBuffer = value;
        addingNew = false;
        renderSections();
      });
      actions.appendChild(editBtn);
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'rv-row-btn rv-row-btn-danger';
      delBtn.textContent = '×';
      delBtn.title = 'Delete this variable';
      delBtn.setAttribute('aria-label', `Delete ${key}`);
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeChatId) return;
        if (!confirm(`Delete variable "${key}"?\n\nIf the character has a default for this key, getChatVar will fall back to it. Otherwise reads return the literal string "null".`)) return;
        log.info(`variables-tab: delete chatId=${activeChatId} key=${key}`);
        sendToBackend({
          type: 'delete_variable',
          chatId: activeChatId,
          scope: 'local',
          key,
        });
      });
      actions.appendChild(delBtn);
      head.appendChild(actions);
    }
    row.appendChild(head);

    const valEl = document.createElement('div');
    valEl.className = 'rv-value';
    const isLong = value.length > 200 || value.includes('\n');
    if (!isLong) {
      valEl.textContent = value;
      valEl.title = value;
    } else {
      valEl.textContent = value.slice(0, 200) + '…';
      valEl.title = 'Click to expand';
      valEl.classList.add('rv-value-long');
      valEl.addEventListener('click', () => {
        if (valEl.classList.contains('rv-value-expanded')) {
          valEl.textContent = value.slice(0, 200) + '…';
          valEl.classList.remove('rv-value-expanded');
        } else {
          valEl.textContent = value;
          valEl.classList.add('rv-value-expanded');
        }
      });
    }
    row.appendChild(valEl);

    return row;
  }

  function buildLocalEditor(row: HTMLDivElement, key: string, originalValue: string): void {
    const head = document.createElement('div');
    head.className = 'rv-row-head';

    const keyEl = document.createElement('span');
    keyEl.className = 'rv-key';
    keyEl.textContent = key;
    keyEl.title = key;
    head.appendChild(keyEl);

    const actions = document.createElement('span');
    actions.className = 'rv-edit-actions';
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'rv-row-btn rv-row-btn-primary';
    saveBtn.textContent = 'Save';
    saveBtn.title = 'Save (Ctrl+Enter)';
    saveBtn.addEventListener('click', commit);
    actions.appendChild(saveBtn);
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'rv-row-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.title = 'Cancel (Esc)';
    cancelBtn.addEventListener('click', cancel);
    actions.appendChild(cancelBtn);
    head.appendChild(actions);

    row.appendChild(head);

    const textarea = document.createElement('textarea');
    textarea.className = 'rv-edit-input';
    textarea.spellcheck = false;
    textarea.value = editBuffer;
    textarea.rows = Math.max(2, Math.min(12, editBuffer.split('\n').length + 1));
    textarea.addEventListener('input', () => {
      editBuffer = textarea.value;
      const lines = editBuffer.split('\n').length;
      textarea.rows = Math.max(2, Math.min(12, lines + 1));
    });
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    });
    row.appendChild(textarea);

    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });

    function commit(): void {
      if (!activeChatId) return;
      const newValue = editBuffer;
      if (newValue === originalValue) {
        cancel();
        return;
      }
      log.info(
        `variables-tab: set chatId=${activeChatId} key=${key} ` +
          `oldLen=${originalValue.length} newLen=${newValue.length}`,
      );
      sendToBackend({
        type: 'set_variable',
        chatId: activeChatId,
        scope: 'local',
        key,
        value: newValue,
      });
      editingKey = null;
      editBuffer = '';
      renderSections();
    }

    function cancel(): void {
      editingKey = null;
      editBuffer = '';
      renderSections();
    }
  }

  function buildLocalAddRow(): HTMLDivElement {
    const wrap = document.createElement('div');
    wrap.className = 'rv-add-wrap';
    if (!addingNew) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rv-row-btn rv-add-btn';
      btn.textContent = '+ Add variable';
      btn.addEventListener('click', () => {
        addingNew = true;
        editingKey = null;
        addBufferKey = '';
        addBufferValue = '';
        renderSections();
      });
      wrap.appendChild(btn);
      return wrap;
    }
    wrap.classList.add('rv-add-form');
    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'rv-edit-input rv-add-key';
    keyInput.placeholder = 'variable_name';
    keyInput.value = addBufferKey;
    keyInput.spellcheck = false;
    keyInput.addEventListener('input', () => { addBufferKey = keyInput.value; });
    keyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); valInput.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); cancelAdd(); }
    });
    wrap.appendChild(keyInput);

    const valInput = document.createElement('textarea');
    valInput.className = 'rv-edit-input rv-add-value';
    valInput.placeholder = 'value';
    valInput.value = addBufferValue;
    valInput.spellcheck = false;
    valInput.rows = 1;
    valInput.addEventListener('input', () => {
      addBufferValue = valInput.value;
      const lines = addBufferValue.split('\n').length;
      valInput.rows = Math.max(1, Math.min(10, lines));
    });
    valInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); commitAdd(); }
      else if (e.key === 'Escape') { e.preventDefault(); cancelAdd(); }
    });
    wrap.appendChild(valInput);

    const actions = document.createElement('span');
    actions.className = 'rv-edit-actions';
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'rv-row-btn rv-row-btn-primary';
    saveBtn.textContent = 'Add';
    saveBtn.addEventListener('click', commitAdd);
    actions.appendChild(saveBtn);
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'rv-row-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', cancelAdd);
    actions.appendChild(cancelBtn);
    wrap.appendChild(actions);

    queueMicrotask(() => keyInput.focus());

    return wrap;

    function commitAdd(): void {
      if (!activeChatId) return;
      const k = addBufferKey.trim();
      if (k.length === 0) {
        keyInput.focus();
        return;
      }
      log.info(
        `variables-tab: add chatId=${activeChatId} key=${k} valueLen=${addBufferValue.length}`,
      );
      sendToBackend({
        type: 'set_variable',
        chatId: activeChatId,
        scope: 'local',
        key: k,
        value: addBufferValue,
      });
      addingNew = false;
      addBufferKey = '';
      addBufferValue = '';
      renderSections();
    }

    function cancelAdd(): void {
      addingNew = false;
      addBufferKey = '';
      addBufferValue = '';
      renderSections();
    }
  }

  let filterTimer: number | undefined;
  filterInput.addEventListener('input', () => {
    if (filterTimer !== undefined) window.clearTimeout(filterTimer);
    filterTimer = window.setTimeout(() => {
      filterTerm = filterInput.value.trim();
      renderSections();
    }, 60);
  });

  refreshBtn.addEventListener('click', () => {
    if (!activeChatId) {
      log.info('variables-tab: refresh clicked but no active chat');
      return;
    }
    log.info(`variables-tab: refresh clicked, requesting chatId=${activeChatId}`);
    sendToBackend({ type: 'request_variables_snapshot', chatId: activeChatId });
  });

  copyBtn.addEventListener('click', () => {
    if (!snapshot) return;
    const payload = JSON.stringify(
      {
        chatId: snapshot.chatId,
        seq: snapshot.seq,
        ts: snapshot.ts,
        scopes: snapshot.scopes,
        defaults: snapshot.defaults,
      },
      null,
      2,
    );
    void navigator.clipboard?.writeText(payload).then(
      () => {
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        window.setTimeout(() => { copyBtn.textContent = original; }, 1200);
      },
      (err) => log.warn('variables-tab: copy failed', err),
    );
  });

  function handleBackendMessage(msg: BackendToFrontend): void {
    if (msg.type !== 'set_variables') return;
    log.info(`variables-tab.set_variables: chatId=${msg.chatId} seq=${msg.seq} ts=${msg.ts}`);
    // snapshot requests can race with state-tick pushes; drop stale ones.
    if (snapshot && snapshot.chatId === msg.chatId && snapshot.seq > msg.seq) {
      log.info(
        `variables-tab: ignoring older snapshot seq=${msg.seq} (have=${snapshot.seq})`,
      );
      return;
    }
    snapshot = {
      chatId: msg.chatId,
      seq: msg.seq,
      scopes: msg.scopes,
      defaults: msg.defaults,
      ts: msg.ts,
    };
    render();
  }

  function setActiveChatId(chatId: string | null): void {
    if (activeChatId === chatId) return;
    log.info(`variables-tab.setActiveChatId: ${activeChatId ?? 'null'} -> ${chatId ?? 'null'}`);
    activeChatId = chatId;
    if (chatId) {
      if (snapshot && snapshot.chatId !== chatId) {
        snapshot = null;
      }
      sendToBackend({ type: 'request_variables_snapshot', chatId });
    } else {
      snapshot = null;
    }
    render();
  }

  render();
  log.info('variables-panel: ready');

  return {
    handleBackendMessage,
    setActiveChatId,
    destroy(): void {
      log.info('variables-panel: destroy');
      try { root.replaceChildren(); } catch { /* ignore */ }
    },
  };
}


function sortedEntries(rec: Readonly<Record<string, string>>): Array<[string, string]> {
  return Object.keys(rec).sort((a, b) => a.localeCompare(b)).map((k) => [k, rec[k] ?? ''] as [string, string]);
}

function shortId(id: string): string {
  return id.length > 12 ? id.slice(0, 8) + '…' : id;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function countTotals(snap: Snapshot): {
  local: number;
  global: number;
  chat: number;
  defaults: number;
} {
  return {
    local: Object.keys(snap.scopes.local).length,
    global: Object.keys(snap.scopes.global).length,
    chat: Object.keys(snap.scopes.chat).length,
    defaults: Object.keys(snap.defaults).length,
  };
}
