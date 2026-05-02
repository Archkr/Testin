import type {
  AttachedModuleSummary,
  BackendToFrontend,
  CardSummary,
  FrontendToBackend,
  ModuleSummary,
} from '../types/messages.js';
import type { FrontendLog } from './drawer.js';
import { errMsg } from '../util/coerce.js';

// Mounts into a host element provided by ui/sidebar.ts.

// 40 KB raw per chunk, stays under Lumi's 64 KB inbound guard.
const CHUNK_BYTES = 40 * 1024;
const CHUNK_WIRE_WARN_BYTES = 60_000;
const INIT_ACK_TIMEOUT_MS = 15_000;
const CHUNK_ACK_TIMEOUT_MS = 20_000;
const COMMIT_FIRST_PROGRESS_TIMEOUT_MS = 60_000;
const UPLOAD_WINDOW_SIZE = 30;

const ACCEPT_EXTENSIONS = ['.risum'];

interface PendingAck {
  resolve: () => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface UploadSession {
  readonly sessionId: string;
  lastAckSeq: number;
  receivedBytesOnBackend: number;
  pendingAcks: Map<number, PendingAck>;
  aborted: boolean;
}

export interface ModulesPanelHandle {
  handleBackendMessage(msg: BackendToFrontend): void;
  destroy(): void;
}

export interface MountModulesPanelOptions {
  readonly root: HTMLElement;
  readonly sendToBackend: (msg: FrontendToBackend) => void;
  readonly log: FrontendLog;
  /** Optional slot mounted at the top of the Characters section.
   *  Used by the Import tab to inject the cards-panel (Upload card button +
   *  status/progress) inside the Characters dropdown. */
  readonly mountCharactersHeader?: (root: HTMLElement) => {
    readonly handleBackendMessage: (msg: BackendToFrontend) => void;
    readonly destroy: () => void;
  };
  readonly onImportStart?: (label: string, onCancel?: () => void, totalBytes?: number) => void;
}

export function mountModulesPanel(opts: MountModulesPanelOptions): ModulesPanelHandle {
  const { sendToBackend, log } = opts;
  log.info('modules-panel: mounting');

  const root = opts.root;
  root.classList.add('lr-modules-drawer');

  let modules: readonly ModuleSummary[] | null = null;
  let cards: readonly CardSummary[] = [];
  const attachedByCharacter = new Map<string, readonly AttachedModuleSummary[]>();
  let activeUpload: UploadSession | null = null;
  const expandedCharacters = new Set<string>();
  const expandedModules = new Set<string>();
  let lastError: string | null = null;

  const intro = document.createElement('p');
  intro.className = 'lrm-intro';
  intro.textContent =
    'Upload .risum modules to your library, then attach them to characters. Attached modules layer their lorebook, regex, Lua, and assets onto the character at runtime.';
  root.appendChild(intro);

  const libSection = document.createElement('details');
  libSection.className = 'lrm-section';
  libSection.open = true;
  const libSummary = document.createElement('summary');
  libSummary.className = 'lrm-section-header';
  const libTitle = document.createElement('h3');
  libTitle.className = 'lrm-section-title';
  libTitle.textContent = 'Module library';
  libSummary.appendChild(libTitle);
  libSection.appendChild(libSummary);

  const libBody = document.createElement('div');
  libBody.className = 'lrm-section-body';
  libSection.appendChild(libBody);

  const libDesc = document.createElement('div');
  libDesc.className = 'lrm-section-desc';
  libDesc.textContent = 'Upload .risum modules and attach them to characters.';
  libBody.appendChild(libDesc);

  const libToolbar = document.createElement('div');
  libToolbar.className = 'lrm-toolbar';
  const uploadBtn = document.createElement('button');
  uploadBtn.type = 'button';
  uploadBtn.className = 'lrm-btn lrm-btn-primary';
  uploadBtn.textContent = 'Upload .risum';
  uploadBtn.title = 'Pick a .risum module file.';
  libToolbar.appendChild(uploadBtn);
  const refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'lrm-btn';
  refreshBtn.textContent = 'Refresh';
  refreshBtn.title = 'Re-fetch the module list.';
  libToolbar.appendChild(refreshBtn);
  libBody.appendChild(libToolbar);

  const libList = document.createElement('div');
  libList.className = 'lrm-modules-list';
  libBody.appendChild(libList);

  const charSection = document.createElement('details');
  charSection.className = 'lrm-section';
  charSection.open = true;
  const charSummary = document.createElement('summary');
  charSummary.className = 'lrm-section-header';
  const charTitle = document.createElement('h3');
  charTitle.className = 'lrm-section-title';
  charTitle.textContent = 'Characters';
  charSummary.appendChild(charTitle);
  charSection.appendChild(charSummary);

  const charBody = document.createElement('div');
  charBody.className = 'lrm-section-body';
  charSection.appendChild(charBody);

  const charHeaderSlot = document.createElement('div');
  charHeaderSlot.className = 'lrm-character-header-slot';
  charBody.appendChild(charHeaderSlot);
  const charHeaderHandle = opts.mountCharactersHeader
    ? opts.mountCharactersHeader(charHeaderSlot)
    : null;

  const charDesc = document.createElement('div');
  charDesc.className = 'lrm-section-desc';
  charDesc.textContent = 'Note: delete characters through Lumiverse.';
  charBody.appendChild(charDesc);

  const charList = document.createElement('div');
  charList.className = 'lrm-characters-list';
  charBody.appendChild(charList);

  root.appendChild(charSection);
  root.appendChild(libSection);

  function setStatus(_msg: string | null, _isError = false): void { /* no-op */ }

  function renderModuleList(): void {
    libList.replaceChildren();
    if (modules === null) {
      const loading = document.createElement('div');
      loading.className = 'lrm-empty';
      loading.textContent = 'Loading…';
      libList.appendChild(loading);
      return;
    }
    if (modules.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lrm-empty';
      empty.textContent = 'No modules uploaded yet.';
      libList.appendChild(empty);
      return;
    }
    for (const m of modules) {
      libList.appendChild(renderModuleRow(m));
    }
  }

  function renderModuleRow(m: ModuleSummary): HTMLDetailsElement {
    const det = document.createElement('details');
    det.className = 'lrm-module';
    det.open = expandedModules.has(m.id);
    det.addEventListener('toggle', () => {
      if (det.open) expandedModules.add(m.id);
      else expandedModules.delete(m.id);
    });

    const sum = document.createElement('summary');
    sum.className = 'lrm-module-summary';
    const nameEl = document.createElement('span');
    nameEl.className = 'lrm-module-name';
    nameEl.textContent = m.name || '(unnamed)';
    nameEl.title = `${m.name}\nid: ${m.id}\nfilename: ${m.filename}`;
    sum.appendChild(nameEl);
    const attachedTo = countAttachments(m.id);
    if (attachedTo > 0) {
      const badge = document.createElement('span');
      badge.className = 'lrm-module-attached-badge';
      badge.textContent = `${attachedTo} attached`;
      sum.appendChild(badge);
    }
    det.appendChild(sum);

    const body = document.createElement('div');
    body.className = 'lrm-module-body';

    const sub = document.createElement('div');
    sub.className = 'lrm-module-sub';
    const parts: string[] = [];
    if (m.lorebook_count > 0) parts.push(`${m.lorebook_count} lore`);
    if (m.regex_count > 0) parts.push(`${m.regex_count} regex`);
    if (m.trigger_count > 0) parts.push(`${m.trigger_count} trigger`);
    if (m.asset_count > 0) parts.push(`${m.asset_count} asset`);
    sub.textContent = parts.join(' · ') || '(empty)';
    body.appendChild(sub);

    if (m.description) {
      const desc = document.createElement('div');
      desc.className = 'lrm-module-desc';
      desc.textContent = m.description;
      body.appendChild(desc);
    }

    const actions = document.createElement('div');
    actions.className = 'lrm-module-actions';
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'lrm-btn lrm-btn-danger';
    del.textContent = 'Delete';
    del.title = `Remove "${m.name}" and detach from all characters.`;
    del.addEventListener('click', () => {
      if (!window.confirm(`Delete module "${m.name}"?`)) return;
      log.info(`modules-panel: delete_module id=${m.id}`);
      sendToBackend({ type: 'delete_module', moduleId: m.id });
    });
    actions.appendChild(del);
    body.appendChild(actions);
    det.appendChild(body);

    return det;
  }

  function countAttachments(moduleId: string): number {
    let n = 0;
    for (const list of attachedByCharacter.values()) {
      if (list.some((a) => a.id === moduleId)) n += 1;
    }
    return n;
  }

  function renderCharacterList(): void {
    charList.replaceChildren();
    if (cards.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lrm-empty';
      empty.textContent = 'No Risu cards imported yet.';
      charList.appendChild(empty);
      return;
    }
    for (const c of cards) {
      charList.appendChild(renderCharacterRow(c));
    }
  }

  function renderCharacterRow(card: CardSummary): HTMLDetailsElement {
    const det = document.createElement('details');
    det.className = 'lrm-character';
    det.open = expandedCharacters.has(card.character_id);
    det.addEventListener('toggle', () => {
      if (det.open) expandedCharacters.add(card.character_id);
      else expandedCharacters.delete(card.character_id);
    });

    const summary = document.createElement('summary');
    summary.className = 'lrm-character-summary';
    const summaryName = document.createElement('span');
    summaryName.className = 'lrm-character-name';
    summaryName.textContent = card.character_name ?? '(character missing)';
    summary.appendChild(summaryName);
    const attachedList = attachedByCharacter.get(card.character_id) ?? [];
    const summaryCount = document.createElement('span');
    summaryCount.className = 'lrm-character-count';
    summaryCount.textContent = `${attachedList.length} attached`;
    summary.appendChild(summaryCount);
    det.appendChild(summary);

    const body = document.createElement('div');
    body.className = 'lrm-character-body';

    if (attachedList.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lrm-character-empty';
      empty.textContent = 'No modules attached to this character.';
      body.appendChild(empty);
    } else {
      const ul = document.createElement('ul');
      ul.className = 'lrm-attached-list';
      for (const a of attachedList) {
        const li = document.createElement('li');
        li.className = 'lrm-attached-row';
        const label = document.createElement('span');
        label.className = 'lrm-attached-name';
        label.textContent = a.name || a.id;
        li.appendChild(label);
        const detach = document.createElement('button');
        detach.type = 'button';
        detach.className = 'lrm-btn-mini lrm-btn-danger';
        detach.textContent = 'Detach';
        detach.title = `Detach "${a.name}" from this character.`;
        detach.addEventListener('click', () => {
          log.info(`modules-panel: detach_module char=${card.character_id} module=${a.id}`);
          sendToBackend({
            type: 'detach_module',
            characterId: card.character_id,
            moduleId: a.id,
          });
        });
        li.appendChild(detach);
        ul.appendChild(li);
      }
      body.appendChild(ul);
    }

    const attachable = (modules ?? []).filter((m) => !attachedList.some((a) => a.id === m.id));
    if (attachable.length > 0) {
      const attachWrap = document.createElement('div');
      attachWrap.className = 'lrm-attach-wrap';
      const label = document.createElement('span');
      label.className = 'lrm-attach-label';
      label.textContent = 'Attach module:';
      attachWrap.appendChild(label);
      // Per-character id prevents datalist collisions (datalist is global by id).
      const listId = `lrm-attach-list-${card.character_id}`;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'lrm-attach-input';
      input.placeholder = 'Search modules…';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('list', listId);
      const datalist = document.createElement('datalist');
      datalist.id = listId;
      for (const m of attachable) {
        const o = document.createElement('option');
        o.value = m.name || m.id;
        o.label = m.id;
        o.setAttribute('data-module-id', m.id);
        datalist.appendChild(o);
      }
      attachWrap.appendChild(input);
      attachWrap.appendChild(datalist);
      const attachBtn = document.createElement('button');
      attachBtn.type = 'button';
      attachBtn.className = 'lrm-btn-mini lrm-btn-primary';
      attachBtn.textContent = 'Attach';
      attachBtn.title = 'Attach the selected module.';
      attachBtn.disabled = true;
      const resolveModuleId = (typed: string): string | null => {
        const t = typed.trim();
        if (t.length === 0) return null;
        const byId = attachable.find((m) => m.id === t);
        if (byId) return byId.id;
        const lower = t.toLowerCase();
        const byName = attachable.find((m) => (m.name || '').toLowerCase() === lower);
        if (byName) return byName.id;
        return null;
      };
      const refreshButton = (): void => {
        attachBtn.disabled = resolveModuleId(input.value) === null;
      };
      input.addEventListener('input', refreshButton);
      input.addEventListener('change', refreshButton);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !attachBtn.disabled) {
          e.preventDefault();
          attachBtn.click();
        }
      });
      attachBtn.addEventListener('click', () => {
        const moduleId = resolveModuleId(input.value);
        if (moduleId === null) return;
        log.info(`modules-panel: attach_module char=${card.character_id} module=${moduleId}`);
        sendToBackend({
          type: 'attach_module',
          characterId: card.character_id,
          moduleId,
        });
        input.value = '';
        attachBtn.disabled = true;
      });
      attachWrap.appendChild(attachBtn);
      body.appendChild(attachWrap);
    } else if ((modules ?? []).length > 0) {
      const all = document.createElement('div');
      all.className = 'lrm-character-empty';
      all.textContent = 'Every available module is already attached.';
      body.appendChild(all);
    }

    det.appendChild(body);
    return det;
  }

  function render(): void {
    renderModuleList();
    renderCharacterList();
    if (lastError) setStatus(lastError, true);
  }

  uploadBtn.addEventListener('click', () => { void onUploadClicked(); });
  refreshBtn.addEventListener('click', () => {
    log.info('modules-panel: refresh clicked');
    sendToBackend({ type: 'request_modules' });
  });

  async function onUploadClicked(): Promise<void> {
    if (uploadBtn.disabled) return;
    log.info('modules-panel: upload clicked');
    let file: { name: string; bytes: Uint8Array } | null = null;
    try {
      file = await pickViaInput();
    } catch (err) {
      log.error('modules-panel: file pick failed', err);
      lastError = `File pick failed: ${errMsg(err)}`;
      render();
      return;
    }
    if (!file) {
      log.info('modules-panel: pick dismissed');
      return;
    }

    lastError = null;
    setStatus(`Uploading ${file.name}…`);
    uploadBtn.disabled = true;

    const sessionId = generateSessionId();
    const totalBytes = file.bytes.byteLength;
    const totalChunks = Math.max(1, Math.ceil(totalBytes / CHUNK_BYTES));
    log.info(`modules-panel: upload session=${sessionId} file=${file.name} bytes=${totalBytes} chunks=${totalChunks}`);

    activeUpload = {
      sessionId,
      lastAckSeq: -999,
      receivedBytesOnBackend: 0,
      pendingAcks: new Map(),
      aborted: false,
    };
    const session = activeUpload;
    opts.onImportStart?.(file.name, () => {
      if (!session.aborted) {
        session.aborted = true;
        log.info(`modules-panel: cancel requested session=${sessionId}`);
        rejectAllPending(session, new Error('upload cancelled'));
      }
    }, totalBytes);

    try {
      sendToBackend({
        type: 'upload_module_init',
        sessionId,
        fileName: file.name,
        totalBytes,
        totalChunks,
      });
      await trackAck(session, -1, INIT_ACK_TIMEOUT_MS, 'init');

      let completed = 0;
      let nextSeq = 0;
      const errors: Error[] = [];

      const sendOne = async (): Promise<void> => {
        while (true) {
          if (session.aborted || errors.length > 0) return;
          const seq = nextSeq++;
          if (seq >= totalChunks) return;
          const start = seq * CHUNK_BYTES;
          const end = Math.min(start + CHUNK_BYTES, totalBytes);
          const slice = file.bytes.subarray(start, end);
          const b64 = bytesToBase64(slice);
          const chunkMsg: FrontendToBackend = {
            type: 'upload_module_chunk',
            sessionId,
            seq,
            bytesB64Chunk: b64,
          };
          const wireSize = JSON.stringify(chunkMsg).length;
          if (wireSize > CHUNK_WIRE_WARN_BYTES) {
            log.warn(
              `modules-panel: chunk wire size ${wireSize}B approaches Lumi's 64KB inbound guard ` +
                `(seq=${seq} of ${totalChunks}, raw_chunk=${slice.byteLength}B, b64=${b64.length}B).`,
            );
          }
          const ack = trackAck(session, seq, CHUNK_ACK_TIMEOUT_MS, `chunk ${seq}`);
          sendToBackend(chunkMsg);
          try {
            await ack;
          } catch (err) {
            errors.push(err as Error);
            return;
          }
          completed += 1;
          setStatus(`Uploading ${file.name}… (${completed}/${totalChunks})`);
        }
      };

      const workers: Promise<void>[] = [];
      for (let w = 0; w < Math.min(UPLOAD_WINDOW_SIZE, totalChunks); w++) {
        workers.push(sendOne());
      }
      await Promise.all(workers);
      if (errors.length > 0) throw errors[0];
      if (session.aborted) throw new Error('upload aborted');

      setStatus('Processing on server…');
      sendToBackend({ type: 'upload_module_commit', sessionId });
      await trackAck(session, -2, COMMIT_FIRST_PROGRESS_TIMEOUT_MS, 'commit');
      setStatus(null);
    } catch (err) {
      log.error('modules-panel: upload failed', err);
      try {
        sendToBackend({ type: 'upload_module_abort', sessionId, reason: errMsg(err) });
      } catch { /* ignore */ }
      lastError = `Upload failed: ${errMsg(err)}`;
      setStatus(lastError, true);
    } finally {
      rejectAllPending(session, new Error('session ended'));
      if (activeUpload?.sessionId === sessionId) activeUpload = null;
      uploadBtn.disabled = false;
    }
  }

  function trackAck(
    session: UploadSession,
    seq: number,
    timeoutMs: number,
    label: string,
  ): Promise<void> {
    if (session.lastAckSeq === seq) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (session.pendingAcks.delete(seq)) {
          session.aborted = true;
          reject(new Error(`timeout waiting for ${label} ack after ${timeoutMs}ms`));
        }
      }, timeoutMs);
      session.pendingAcks.set(seq, { resolve, reject, timer });
    });
  }

  function rejectAllPending(session: UploadSession, err: Error): void {
    for (const [seq, p] of session.pendingAcks) {
      clearTimeout(p.timer);
      p.reject(err);
      session.pendingAcks.delete(seq);
    }
  }

  function onUploadAck(sessionId: string, seq: number, receivedBytes: number): void {
    const session = activeUpload;
    if (!session || session.sessionId !== sessionId) return;
    session.lastAckSeq = seq;
    session.receivedBytesOnBackend = receivedBytes;
    const p = session.pendingAcks.get(seq);
    if (p) {
      session.pendingAcks.delete(seq);
      clearTimeout(p.timer);
      p.resolve();
    }
  }

  function handleBackendMessage(msg: BackendToFrontend): void {
    if (charHeaderHandle) {
      try { charHeaderHandle.handleBackendMessage(msg); } catch (err) { log.warn('characters header handler threw:', err); }
    }
    switch (msg.type) {
      case 'cards_updated':
        cards = msg.cards;
        render();
        break;
      case 'modules_pushed':
        modules = msg.modules;
        if (msg.attached_by_character) {
          for (const [charId, list] of Object.entries(msg.attached_by_character)) {
            attachedByCharacter.set(charId, list);
          }
        }
        render();
        break;
      case 'attached_modules_pushed':
        attachedByCharacter.set(msg.characterId, msg.attached);
        render();
        break;
      case 'module_upload_ack':
        onUploadAck(msg.sessionId, msg.seq, msg.receivedBytes);
        break;
      case 'error':
        if (lastError === null) {
          lastError = msg.message;
          setStatus(lastError, true);
        }
        break;
    }
  }

  function destroy(): void {
    log.info('modules-panel: destroy');
    if (charHeaderHandle) {
      try { charHeaderHandle.destroy(); } catch { void 0; }
    }
    try { root.replaceChildren(); } catch { /* ignore */ }
  }

  sendToBackend({ type: 'get_cards' });
  sendToBackend({ type: 'request_modules' });

  render();
  log.info('modules-panel: ready');

  return { handleBackendMessage, destroy };
}


function pickViaInput(): Promise<{ name: string; bytes: Uint8Array } | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPT_EXTENSIONS.join(',');
    input.style.display = 'none';
    document.body.appendChild(input);
    let settled = false;
    const done = (result: { name: string; bytes: Uint8Array } | null, err?: Error): void => {
      if (settled) return;
      settled = true;
      try { document.body.removeChild(input); } catch { /* */ }
      if (err) reject(err);
      else resolve(result);
    };
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return done(null);
      file.arrayBuffer().then(
        (ab) => done({ name: file.name, bytes: new Uint8Array(ab) }),
        (err) => done(null, err as Error),
      );
    });
    input.addEventListener('cancel', () => done(null));
    input.click();
  });
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBlob(b64: string, mimeType: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes as BlobPart], { type: mimeType });
}

function generateSessionId(): string {
  const c = typeof globalThis !== 'undefined'
    ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
    : undefined;
  if (c?.randomUUID) return c.randomUUID();
  return `mod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
