import type {
  AttachedModuleSummary,
  BackendToFrontend,
  CardSummary,
  FrontendToBackend,
  ModuleSummary,
  ViewerAssetEntry,
  ViewerData,
  ViewerLorebookGroup,
  ViewerRegexEntry,
  ViewerTriggerEntry,
} from '../types/messages.js';
import type { FrontendLog } from './drawer.js';

// Viewer for both characters and standalone .risum modules.
// Mounts into a host element provided by ui/sidebar.ts.

// Matches Lumi /api/v1/images route cap and Risu's MAX_ASSET_SIZE_BYTES.
const MAX_ASSET_MB = 50;
const MAX_ASSET_BYTES = MAX_ASSET_MB * 1024 * 1024;

export interface ViewerPanelHandle {
  handleBackendMessage(msg: BackendToFrontend): void;
  destroy(): void;
}

export interface MountViewerPanelOptions {
  readonly root: HTMLElement;
  readonly sendToBackend: (msg: FrontendToBackend) => void;
  readonly log: FrontendLog;
}

interface SourceOption {
  readonly kind: 'character' | 'module';
  readonly id: string;
  readonly label: string;
}

export function mountViewerPanel(opts: MountViewerPanelOptions): ViewerPanelHandle {
  const { sendToBackend, log } = opts;
  log.info('viewer-panel: mounting');

  const root = opts.root;
  root.classList.add('lr-viewer-drawer');

  let cards: readonly CardSummary[] = [];
  let modules: readonly ModuleSummary[] = [];
  let selectedSourceKey: string | null = null;
  let viewerData: ViewerData | null = null;
  let loading = false;
  let lastError: string | null = null;
  // Active sub-tab inside the viewer panel. Persists across re-renders within
  // a session; switching the source resets to 'assets'. Default vars moved
  // to State → Variables → Default in Phase B; lorebook import moved to
  // Import → Lorebooks in Phase E. The 'defaults' subtab no longer renders
  // here , `_risu_decorators` lookups still go through the viewer-data API
  // for character introspection, but the editor is gone.
  type ViewerSubTab = 'assets' | 'triggers' | 'lorebook' | 'regex' | 'background' | 'cjs';
  let activeSubTab: ViewerSubTab = 'assets';
  // Asset virtualization , only the visible window of tiles is mounted at any
  // time. Module-grade asset counts (Cheongwon ships 1500+) used to require
  // pagination; now scrolling reveals tiles on demand without DOM blowup.
  // Tile dimensions are fixed so absolute positioning works.
  const ASSET_TILE_MIN_W = 140;
  const ASSET_TILE_H = 220;
  const ASSET_OVERSCAN_ROWS = 2;
  // Search persists across re-renders (asset rename/delete/upload).
  let assetSearchTerm = '';
  // Pagination is dead , kept the variable name elsewhere for now to minimise
  // diff churn; ignored in the new windowed renderer.
  let assetPagesShown = 1; void assetPagesShown;
  const attachedByCharacter = new Map<string, readonly AttachedModuleSummary[]>();
  // Cleared on the next viewer_data_pushed (backend re-push = success signal).
  let assetUploadStatus: { kind: 'info' | 'error'; message: string } | null = null;
  let renamingAssetName: string | null = null;
  let editingTriggerIndex: number | null = null;
  let editingTriggerLua = '';
  let editingBackgroundHtml = false;
  let editingBackgroundHtmlBuffer = '';

  const intro = document.createElement('p');
  intro.className = 'lrv-intro';
  intro.textContent = 'Inspect, HTML, triggers, and assets for a character or module.';
  root.appendChild(intro);

  const toolbar = document.createElement('div');
  toolbar.className = 'lrv-toolbar';

  const sourceLabel = document.createElement('label');
  sourceLabel.className = 'lrv-source-label';
  sourceLabel.textContent = 'Source:';
  toolbar.appendChild(sourceLabel);

  const sourceSelect = document.createElement('select');
  sourceSelect.className = 'lrv-source-select';
  sourceLabel.htmlFor = 'lrv-source-select';
  sourceSelect.id = 'lrv-source-select';
  toolbar.appendChild(sourceSelect);

  const refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'lrm-btn';
  refreshBtn.textContent = 'Refresh';
  refreshBtn.title = 'Re-fetch the selected source.';
  toolbar.appendChild(refreshBtn);

  root.appendChild(toolbar);

  const status = document.createElement('div');
  status.className = 'lrv-status';
  root.appendChild(status);

  const surfaceHost = document.createElement('div');
  surfaceHost.className = 'lrv-surfaces';
  root.appendChild(surfaceHost);

  function rebuildSourceSelect(): void {
    const prev = selectedSourceKey;
    sourceSelect.replaceChildren();
    const options: SourceOption[] = [];
    for (const c of cards) {
      const attached = attachedByCharacter.get(c.character_id) ?? [];
      const suffix = attached.length > 0 ? ` (+${attached.length} module${attached.length === 1 ? '' : 's'})` : '';
      options.push({
        kind: 'character',
        id: c.character_id,
        label: `[Character] ${c.character_name ?? '(missing)'}${suffix}`,
      });
    }
    for (const m of modules) {
      options.push({
        kind: 'module',
        id: m.id,
        label: `[Module] ${m.name || '(unnamed)'}`,
      });
    }
    if (options.length === 0) {
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '(no characters or modules)';
      empty.disabled = true;
      sourceSelect.appendChild(empty);
      sourceSelect.disabled = true;
      return;
    }
    sourceSelect.disabled = false;
    for (const o of options) {
      const el = document.createElement('option');
      el.value = sourceKey(o);
      el.textContent = o.label;
      sourceSelect.appendChild(el);
    }
    if (prev && options.some((o) => sourceKey(o) === prev)) {
      sourceSelect.value = prev;
    } else {
      const first = options[0]!;
      selectedSourceKey = sourceKey(first);
      sourceSelect.value = selectedSourceKey;
      requestForSelection(first);
    }
  }

  function sourceKey(o: SourceOption): string {
    return `${o.kind}::${o.id}`;
  }

  function parseSourceKey(key: string): SourceOption | null {
    const idx = key.indexOf('::');
    if (idx < 0) return null;
    const kind = key.slice(0, idx);
    const id = key.slice(idx + 2);
    if (kind !== 'character' && kind !== 'module') return null;
    if (id.length === 0) return null;
    // Find the label from current state.
    if (kind === 'character') {
      const c = cards.find((x) => x.character_id === id);
      return c ? { kind, id, label: c.character_name ?? id } : { kind, id, label: id };
    }
    const m = modules.find((x) => x.id === id);
    return m ? { kind, id, label: m.name } : { kind, id, label: id };
  }

  function requestForSelection(o: SourceOption): void {
    loading = true;
    viewerData = null;
    lastError = null;
    activeSubTab = 'assets';
    assetPagesShown = 1;
    renderStatus();
    renderSurfaces();
    log.info(`viewer-panel: request data kind=${o.kind} id=${o.id}`);
    sendToBackend({
      type: 'request_viewer_data',
      source: o.kind === 'character'
        ? { kind: 'character', characterId: o.id }
        : { kind: 'module', moduleId: o.id },
    });
  }

  function renderStatus(): void {
    if (lastError) {
      status.style.display = '';
      status.textContent = lastError;
      status.classList.add('lrv-status-error');
      return;
    }
    status.classList.remove('lrv-status-error');
    if (loading) {
      status.style.display = '';
      status.textContent = 'Loading…';
      return;
    }
    if (!viewerData) {
      status.style.display = '';
      status.textContent = cards.length + modules.length === 0
        ? 'Import a character or upload a .risum module first.'
        : 'Pick a source above.';
      return;
    }
    status.style.display = 'none';
    status.textContent = '';
  }

  interface SubTabSpec {
    readonly id: ViewerSubTab;
    readonly label: string;
    /** Optional count badge (e.g. "Triggers · 4"). */
    readonly count?: number;
    readonly render: () => HTMLElement;
  }

  function buildSubTabs(d: import('../types/messages.js').ViewerData): readonly SubTabSpec[] {
    const isCharacter = d.source.kind === 'character';
    const tabs: SubTabSpec[] = [];
    tabs.push({
      id: 'assets',
      label: 'Assets',
      count: d.assets.length,
      render: () => renderAssetsSection(d.assets),
    });
    // Default vars editor moved to State → Variables → Default (Phase B).
    tabs.push({
      id: 'triggers',
      label: 'Triggers',
      count: d.triggers.length,
      render: () => renderTriggersSection(d.triggers),
    });
    if (d.backgroundHtml) {
      tabs.push({
        id: 'background',
        label: 'Background HTML',
        render: () => renderBackgroundHtmlSection(d.backgroundHtml ?? ''),
      });
    }
    if (isCharacter) {
      tabs.push({
        id: 'lorebook',
        label: 'Lorebook',
        render: () => renderLumiverseRedirect(),
      });
    } else {
      tabs.push({
        id: 'regex',
        label: 'Regex',
        count: d.regex.length,
        render: () => renderRegexSection(d.regex),
      });
      tabs.push({
        id: 'lorebook',
        label: 'Lorebook',
        count: d.lorebook.reduce((s, g) => s + g.entries.length, 0),
        render: () => renderLorebookSection(d.lorebook),
      });
    }
    if (d.cjs) {
      tabs.push({
        id: 'cjs',
        label: 'CJS',
        render: () => renderCjsSection(d.cjs ?? ''),
      });
    }
    return tabs;
  }

  function renderSubTabBar(tabs: readonly SubTabSpec[]): HTMLDivElement {
    const bar = document.createElement('div');
    bar.className = 'lrv-subtab-bar';
    for (const t of tabs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lrv-subtab';
      if (t.id === activeSubTab) btn.classList.add('lrv-subtab-active');
      btn.textContent = typeof t.count === 'number' ? `${t.label} · ${t.count}` : t.label;
      btn.addEventListener('click', () => {
        if (activeSubTab === t.id) return;
        activeSubTab = t.id;
        if (t.id !== 'assets') assetPagesShown = 1; // reset pagination on tab leave
        render();
      });
      bar.appendChild(btn);
    }
    return bar;
  }

  function renderSurfaces(): void {
    surfaceHost.replaceChildren();
    if (loading) return;
    if (!viewerData) return;
    const d = viewerData;

    if (d.fetchWarnings.length > 0) {
      const wb = document.createElement('div');
      wb.className = 'lrv-warning';
      wb.textContent = d.fetchWarnings.join(' ');
      surfaceHost.appendChild(wb);
    }

    const tabs = buildSubTabs(d);
    if (tabs.length === 0) return;
    if (!tabs.some((t) => t.id === activeSubTab)) {
      activeSubTab = tabs[0]!.id;
    }
    surfaceHost.appendChild(renderSubTabBar(tabs));

    const active = tabs.find((t) => t.id === activeSubTab) ?? tabs[0]!;
    surfaceHost.appendChild(active.render());
  }

  function renderBackgroundHtmlSection(html: string): HTMLElement {
    const det = document.createElement('section');
    const note = document.createElement('div');
    note.className = 'lrv-warning';
    note.textContent =
      'Painted into chats via the shadow-DOM mount; class names + CSS selectors are rewritten at render time.';
    det.appendChild(note);
    if (editingBackgroundHtml) {
      const editor = document.createElement('div');
      editor.className = 'lrv-trigger-editor';
      const ta = document.createElement('textarea');
      ta.className = 'lrv-trigger-textarea';
      ta.spellcheck = false;
      ta.value = editingBackgroundHtmlBuffer;
      ta.rows = Math.max(12, Math.min(30, editingBackgroundHtmlBuffer.split('\n').length + 2));
      ta.addEventListener('input', () => {
        editingBackgroundHtmlBuffer = ta.value;
      });
      ta.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          commitBackgroundHtmlEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          editingBackgroundHtml = false;
          editingBackgroundHtmlBuffer = '';
          render();
        }
      });
      editor.appendChild(ta);
      const actions = document.createElement('div');
      actions.className = 'lrv-trigger-edit-actions';
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'lrv-asset-action lrv-asset-action-primary';
      saveBtn.textContent = 'Save';
      saveBtn.title = 'Save (Ctrl+Enter)';
      saveBtn.addEventListener('click', () => commitBackgroundHtmlEdit());
      actions.appendChild(saveBtn);
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'lrv-asset-action lrv-asset-action-danger';
      clearBtn.textContent = 'Clear';
      clearBtn.title = 'Clear background HTML.';
      clearBtn.addEventListener('click', () => {
        if (!window.confirm('Clear background HTML?')) return;
        editingBackgroundHtmlBuffer = '';
        commitBackgroundHtmlEdit();
      });
      actions.appendChild(clearBtn);
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'lrv-asset-action';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.title = 'Cancel (Esc)';
      cancelBtn.addEventListener('click', () => {
        editingBackgroundHtml = false;
        editingBackgroundHtmlBuffer = '';
        render();
      });
      actions.appendChild(cancelBtn);
      editor.appendChild(actions);
      det.appendChild(editor);
      queueMicrotask(() => { ta.focus(); });
    } else {
      const pre = document.createElement('pre');
      pre.className = 'lrv-pre';
      pre.textContent = html;
      det.appendChild(pre);
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'lrv-asset-action';
      editBtn.textContent = 'Edit bg-html';
      editBtn.style.margin = '6px 12px 10px 12px';
      editBtn.addEventListener('click', () => {
        editingBackgroundHtml = true;
        editingBackgroundHtmlBuffer = html;
        render();
      });
      det.appendChild(editBtn);
    }
    return det;
  }

  function commitBackgroundHtmlEdit(): void {
    if (!viewerData || viewerData.source.kind !== 'character') return;
    const html = editingBackgroundHtmlBuffer.length > 0 ? editingBackgroundHtmlBuffer : null;
    log.info(`viewer-panel: set_background_html charId=${viewerData.source.characterId} len=${editingBackgroundHtmlBuffer.length}`);
    sendToBackend({
      type: 'set_background_html',
      characterId: viewerData.source.characterId,
      html,
    });
    editingBackgroundHtml = false;
    editingBackgroundHtmlBuffer = '';
  }

  function renderLumiverseRedirect(): HTMLDivElement {
    const wrap = document.createElement('div');
    wrap.className = 'lrv-section lrv-section-redirect';
    const head = document.createElement('div');
    head.className = 'lrv-section-summary';
    head.textContent = 'Lorebook · Regex';
    wrap.appendChild(head);
    const body = document.createElement('div');
    body.className = 'lrv-redirect-body';
    body.textContent =
      "Edit and view this character's lorebook + regex rules through Lumiverse's native UI. " +
      'To import a standalone lorebook file, use the Import → Lorebooks tab.';
    wrap.appendChild(body);
    return wrap;
  }

  // Default-variable editor moved to State → Variables → Default in Phase B.
  // The wire shape (`set_default_variable`/`delete_default_variable`,
  // `ViewerDefaultVariable` etc.) is still exported on the data; the editor UI
  // for it just lives in a different tab now.

  function renderAssetsSection(assets: readonly ViewerAssetEntry[]): HTMLElement {
    const det = document.createElement('section');

    const toolbar = document.createElement('div');
    toolbar.className = 'lrv-asset-toolbar';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'lrv-btn lrv-btn-primary';
    addBtn.textContent = '+ Add asset';
    addBtn.addEventListener('click', () => { void onAddAssetClicked(); });
    toolbar.appendChild(addBtn);
    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'lrv-asset-search';
    search.placeholder = `Search ${assets.length} asset${assets.length === 1 ? '' : 's'}…`;
    search.value = assetSearchTerm;
    search.spellcheck = false;
    toolbar.appendChild(search);
    const filterCount = document.createElement('span');
    filterCount.className = 'lrv-asset-filter-count';
    toolbar.appendChild(filterCount);
    if (assetUploadStatus !== null) {
      const status = document.createElement('span');
      status.className = 'lrv-asset-upload-status';
      if (assetUploadStatus.kind === 'error') {
        status.classList.add('lrv-asset-upload-status-error');
      }
      status.textContent = assetUploadStatus.message;
      toolbar.appendChild(status);
    }
    det.appendChild(toolbar);

    // Filter (case-insensitive substring match on asset name).
    const term = assetSearchTerm.trim().toLowerCase();
    const filtered = term
      ? assets.filter((a) => a.name.toLowerCase().includes(term))
      : assets;
    filterCount.textContent = term ? `${filtered.length} of ${assets.length}` : '';

    if (assets.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lrv-empty';
      empty.textContent = 'No assets.';
      det.appendChild(empty);
      return det;
    }
    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lrv-empty';
      empty.textContent = `No matches for "${assetSearchTerm}".`;
      det.appendChild(empty);
      // Search input still wired below.
    }

    // Windowed virtualization. Mounts only the visible row range (+ overscan)
    // plus the inline-edited tile if any. Scroll/resize trigger re-renders.
    const scrollHost = document.createElement('div');
    scrollHost.className = 'lrv-asset-virt-host';
    const inner = document.createElement('div');
    inner.className = 'lrv-asset-virt-inner';
    scrollHost.appendChild(inner);
    if (filtered.length > 0) det.appendChild(scrollHost);

    let columns = 1;
    let tileW = ASSET_TILE_MIN_W;
    let containerW = ASSET_TILE_MIN_W;
    const tileNodes = new Map<number, HTMLElement>();

    function recomputeLayout(): void {
      containerW = scrollHost.clientWidth || ASSET_TILE_MIN_W;
      columns = Math.max(1, Math.floor(containerW / ASSET_TILE_MIN_W));
      tileW = containerW / columns;
      const rows = Math.ceil(filtered.length / columns);
      inner.style.height = `${rows * ASSET_TILE_H}px`;
    }

    function placeTile(node: HTMLElement, idx: number): void {
      const row = Math.floor(idx / columns);
      const col = idx % columns;
      node.style.position = 'absolute';
      node.style.top = `${row * ASSET_TILE_H}px`;
      node.style.left = `${col * tileW}px`;
      node.style.width = `${tileW}px`;
      node.style.height = `${ASSET_TILE_H}px`;
    }

    function renderWindow(): void {
      if (filtered.length === 0) return;
      const top = scrollHost.scrollTop;
      const bottom = top + (scrollHost.clientHeight || 1);
      const totalRows = Math.ceil(filtered.length / columns);
      const startRow = Math.max(0, Math.floor(top / ASSET_TILE_H) - ASSET_OVERSCAN_ROWS);
      const endRow = Math.min(totalRows, Math.ceil(bottom / ASSET_TILE_H) + ASSET_OVERSCAN_ROWS);
      const startIdx = startRow * columns;
      const endIdx = Math.min(filtered.length, endRow * columns);

      const wanted = new Set<number>();
      for (let i = startIdx; i < endIdx; i++) wanted.add(i);
      // Pin the inline-edit tile in the DOM regardless of scroll position so
      // the user's input doesn't lose focus when they accidentally scroll.
      if (renamingAssetName !== null) {
        const idx = filtered.findIndex((a) => a.name === renamingAssetName);
        if (idx >= 0) wanted.add(idx);
      }

      for (const [i, node] of tileNodes) {
        if (!wanted.has(i)) {
          node.remove();
          tileNodes.delete(i);
        }
      }
      for (const i of wanted) {
        if (tileNodes.has(i)) {
          // Reposition in case columns/tileW changed.
          placeTile(tileNodes.get(i)!, i);
          continue;
        }
        const a = filtered[i];
        if (!a) continue;
        const tile = renderAssetTile(a);
        placeTile(tile, i);
        inner.appendChild(tile);
        tileNodes.set(i, tile);
      }
    }

    function rerenderAll(): void {
      inner.replaceChildren();
      tileNodes.clear();
      recomputeLayout();
      renderWindow();
    }

    let scrollPending = false;
    scrollHost.addEventListener('scroll', () => {
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(() => {
        scrollPending = false;
        renderWindow();
      });
    });

    if (typeof ResizeObserver !== 'undefined') {
      let firstObservation = true;
      const ro = new ResizeObserver(() => {
        const prevColumns = columns;
        const prevTileW = tileW;
        recomputeLayout();
        if (firstObservation || columns !== prevColumns || Math.abs(tileW - prevTileW) > 0.5) {
          rerenderAll();
          firstObservation = false;
        } else {
          renderWindow();
        }
      });
      ro.observe(scrollHost);
    } else {
      // Fallback: layout once on next frame after mount.
      requestAnimationFrame(() => {
        recomputeLayout();
        renderWindow();
      });
    }

    // Search wiring , debounce + full re-render of the subtab so the new
    // filter is consumed by the re-mounted virtualized grid.
    let searchTimer: number | undefined;
    search.addEventListener('input', () => {
      if (searchTimer !== undefined) window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        assetSearchTerm = search.value;
        render();
      }, 80);
    });

    return det;
  }

  function renderAssetTile(a: ViewerAssetEntry): HTMLDivElement {
    const tile = document.createElement('div');
    tile.className = 'lrv-asset-tile';
    const isVideo = a.ext === 'mp4' || a.ext === 'webm' || a.ext === 'mov';
    if (isVideo) {
      const vid = document.createElement('video');
      vid.src = a.url;
      vid.controls = true;
      vid.preload = 'metadata';
      vid.className = 'lrv-asset-media';
      tile.appendChild(vid);
    } else {
      const img = document.createElement('img');
      img.src = a.url;
      img.alt = a.name;
      img.loading = 'lazy';
      img.className = 'lrv-asset-media';
      tile.appendChild(img);
    }

    const cap = document.createElement('div');
    cap.className = 'lrv-asset-caption';

    if (renamingAssetName === a.name) {
      // Inline editor.
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'lrv-asset-rename-input';
      input.value = a.name;
      input.spellcheck = false;
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); commitRename(a.name, input.value); }
        else if (e.key === 'Escape') { e.preventDefault(); renamingAssetName = null; render(); }
      });
      cap.appendChild(input);
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'lrv-asset-action lrv-asset-action-primary';
      saveBtn.textContent = 'Save';
      saveBtn.addEventListener('click', () => commitRename(a.name, input.value));
      cap.appendChild(saveBtn);
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'lrv-asset-action';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => { renamingAssetName = null; render(); });
      cap.appendChild(cancelBtn);
      queueMicrotask(() => { input.focus(); input.select(); });
    } else {
      const nameEl = document.createElement('span');
      nameEl.className = 'lrv-asset-name';
      nameEl.textContent = a.name;
      nameEl.title = a.name;
      cap.appendChild(nameEl);
      const meta = document.createElement('span');
      meta.className = 'lrv-asset-meta';
      const parts: string[] = [];
      if (a.ext) parts.push(a.ext);
      if (a.multi) parts.push('multi');
      meta.textContent = parts.join(' · ');
      cap.appendChild(meta);
      const actions = document.createElement('div');
      actions.className = 'lrv-asset-actions';
      const renameBtn = document.createElement('button');
      renameBtn.type = 'button';
      renameBtn.className = 'lrv-asset-action';
      renameBtn.textContent = 'Rename';
      renameBtn.title = `Rename "${a.name}"`;
      renameBtn.addEventListener('click', () => {
        renamingAssetName = a.name;
        render();
      });
      actions.appendChild(renameBtn);
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'lrv-asset-action lrv-asset-action-danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.title = `Remove "${a.name}" from the asset list.`;
      deleteBtn.addEventListener('click', () => {
        if (!window.confirm(`Remove asset "${a.name}"?`)) return;
        sendCurrentSourceMutation({ type: 'delete_asset', assetName: a.name });
      });
      actions.appendChild(deleteBtn);
      cap.appendChild(actions);
    }

    tile.appendChild(cap);
    return tile;
  }

  function commitRename(oldName: string, newNameRaw: string): void {
    const newName = newNameRaw.trim();
    if (newName.length === 0 || newName === oldName) {
      renamingAssetName = null;
      render();
      return;
    }
    sendCurrentSourceMutation({
      type: 'rename_asset',
      oldName,
      newName,
    });
    renamingAssetName = null;
  }

  function sendCurrentSourceMutation(
    partial:
      | { type: 'add_asset'; assetName: string; imageId: string; ext?: string }
      | {
          type: 'add_assets';
          entries: ReadonlyArray<{ assetName: string; imageId: string; ext?: string }>;
        }
      | { type: 'rename_asset'; oldName: string; newName: string }
      | { type: 'delete_asset'; assetName: string },
  ): void {
    if (!viewerData) return;
    const source = viewerData.source.kind === 'character'
      ? { kind: 'character' as const, characterId: viewerData.source.characterId }
      : { kind: 'module' as const, moduleId: viewerData.source.moduleId };
    log.info(`viewer-panel: ${partial.type} via current source kind=${source.kind}`);
    sendToBackend({ ...partial, source } as FrontendToBackend);
  }

  async function onAddAssetClicked(): Promise<void> {
    if (!viewerData) return;
    let files: File[];
    try {
      files = await pickFiles();
    } catch (err) {
      log.error('viewer-panel: file pick threw', err);
      assetUploadStatus = { kind: 'error', message: `File pick failed: ${errMsg(err)}` };
      render();
      return;
    }
    if (files.length === 0) return;
    await uploadAssetsBatch(files);
  }

  // Mirrors payload/import.ts asset uploader: 6-worker pool, count-based progress.
  // Single backend mutation at the end → one envelope write + one viewer re-push.
  async function uploadAssetsBatch(files: readonly File[]): Promise<void> {
    if (!viewerData) return;
    // Snapshot the source at upload-start so a mid-upload source switch
    // doesn't redirect the mutation to the wrong character/module.
    const startSource = viewerData.source.kind === 'character'
      ? { kind: 'character' as const, characterId: viewerData.source.characterId }
      : { kind: 'module' as const, moduleId: viewerData.source.moduleId };
    const existingNames = new Set(viewerData.assets.map((a) => a.name));
    const planned: Array<{ file: File; assetName: string; ext: string | undefined }> = [];
    const failures: Array<{ filename: string; reason: string }> = [];
    for (const f of files) {
      if (f.size > MAX_ASSET_BYTES) {
        failures.push({ filename: f.name, reason: `${formatMB(f.size)} > ${MAX_ASSET_MB} MB` });
        continue;
      }
      const { baseName, ext } = splitName(f.name);
      const assetName = disambiguateName(baseName, existingNames);
      existingNames.add(assetName);
      planned.push({ file: f, assetName, ext });
    }

    const total = planned.length;
    if (total === 0) {
      assetUploadStatus = {
        kind: 'error',
        message: `${failures.length} file${failures.length === 1 ? '' : 's'} skipped — all exceeded ${MAX_ASSET_MB} MB. ${formatFailureList(failures)}`,
      };
      render();
      return;
    }
    let processed = 0;
    const results: Array<{ assetName: string; imageId: string; ext?: string }> = [];
    assetUploadStatus = { kind: 'info', message: `Uploading 0/${total}…` };
    render();

    const concurrency = Math.min(6, total);
    let nextIndex = 0;
    const worker = async (): Promise<void> => {
      while (true) {
        const i = nextIndex++;
        if (i >= total) break;
        const p = planned[i]!;
        try {
          const imageId = await uploadOne(p.file);
          results.push({
            assetName: p.assetName,
            imageId,
            ...(p.ext !== undefined ? { ext: p.ext } : {}),
          });
        } catch (err) {
          const reason = errMsg(err);
          failures.push({ filename: p.file.name, reason });
          log.warn(`viewer-panel: batch upload failed name="${p.assetName}" file="${p.file.name}": ${reason}`);
        }
        processed += 1;
        if (processed === total || processed % Math.max(1, Math.floor(total / 20)) === 0) {
          const tail = failures.length > 0 ? ` (${failures.length} failed)` : '';
          assetUploadStatus = { kind: 'info', message: `Uploading ${processed}/${total}${tail}…` };
          render();
        }
      }
    };
    const workers: Promise<void>[] = [];
    for (let w = 0; w < concurrency; w++) workers.push(worker());
    await Promise.all(workers);

    if (results.length === 0) {
      assetUploadStatus = {
        kind: 'error',
        message: `All ${files.length} upload(s) failed. ${formatFailureList(failures)}`,
      };
      render();
      return;
    }
    const tail = failures.length > 0
      ? ` (${failures.length} failed — ${formatFailureList(failures)})`
      : '';
    assetUploadStatus = {
      kind: failures.length > 0 ? 'error' : 'info',
      message: `Saving ${results.length} asset${results.length === 1 ? '' : 's'}${tail}…`,
    };
    render();
    log.info(`viewer-panel: add_assets via snapshot source kind=${startSource.kind} entries=${results.length}`);
    sendToBackend({ type: 'add_assets', source: startSource, entries: results } as FrontendToBackend);
  }

  function formatFailureList(failures: ReadonlyArray<{ filename: string; reason: string }>): string {
    if (failures.length === 0) return '';
    const max = 3;
    const shown = failures.slice(0, max).map((f) => `"${f.filename}" (${f.reason})`).join(', ');
    if (failures.length <= max) return shown + '.';
    return `${shown}, +${failures.length - max} more — see console.`;
  }

  function formatMB(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function uploadOne(file: File): Promise<string> {
    const fd = new FormData();
    fd.set('image', file, file.name);
    const resp = await fetch('/api/v1/images', {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    if (!resp.ok) {
      let detail = '';
      try { detail = ` — ${(await resp.text()).slice(0, 200)}`; } catch { /* */ }
      throw new Error(`HTTP ${resp.status}${detail}`);
    }
    const body = (await resp.json()) as { id?: string };
    if (typeof body?.id !== 'string' || body.id.length === 0) {
      throw new Error('upload response missing id');
    }
    return body.id;
  }

  function splitName(filename: string): { baseName: string; ext: string | undefined } {
    const lastDot = filename.lastIndexOf('.');
    const baseName = lastDot > 0 ? filename.slice(0, lastDot) : filename;
    const ext = lastDot > 0 ? filename.slice(lastDot + 1).toLowerCase() : undefined;
    return { baseName, ext };
  }

  function disambiguateName(base: string, taken: ReadonlySet<string>): string {
    if (!taken.has(base)) return base;
    for (let n = 2; n < 10_000; n++) {
      const candidate = `${base} (${n})`;
      if (!taken.has(candidate)) return candidate;
    }
    return `${base} (${Date.now()})`;
  }

  function pickFiles(): Promise<File[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*,audio/*';
      input.multiple = true;
      input.style.display = 'none';
      document.body.appendChild(input);
      let settled = false;
      const done = (result: File[], err?: Error): void => {
        if (settled) return;
        settled = true;
        try { document.body.removeChild(input); } catch { /* */ }
        if (err) reject(err);
        else resolve(result);
      };
      input.addEventListener('change', () => {
        const list = input.files;
        const out: File[] = [];
        if (list) for (let i = 0; i < list.length; i++) out.push(list.item(i)!);
        done(out);
      });
      input.addEventListener('cancel', () => done([]));
      input.click();
    });
  }

  function errMsg(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }

  function renderTriggersSection(triggers: readonly ViewerTriggerEntry[]): HTMLElement {
    const det = document.createElement('section');
    if (triggers.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lrv-empty';
      empty.textContent = 'No triggers.';
      det.appendChild(empty);
      return det;
    }
    for (let i = 0; i < triggers.length; i++) {
      det.appendChild(renderTriggerRow(triggers[i]!, i));
    }
    return det;
  }

  function renderTriggerRow(t: ViewerTriggerEntry, index: number): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'lrv-trigger-row';
    const head = document.createElement('div');
    head.className = 'lrv-trigger-head';
    const name = document.createElement('span');
    name.className = 'lrv-trigger-name';
    name.textContent = t.name;
    const tag = document.createElement('span');
    tag.className = 'lrv-trigger-tag';
    tag.textContent = `${t.bindingType} · ${t.effectCount} effect${t.effectCount === 1 ? '' : 's'}`;
    head.appendChild(name);
    head.appendChild(tag);
    row.appendChild(head);

    if (editingTriggerIndex === index) {
      // Inline editor.
      const editor = document.createElement('div');
      editor.className = 'lrv-trigger-editor';
      const ta = document.createElement('textarea');
      ta.className = 'lrv-trigger-textarea';
      ta.spellcheck = false;
      ta.value = editingTriggerLua;
      ta.rows = Math.max(8, Math.min(24, editingTriggerLua.split('\n').length + 2));
      ta.addEventListener('input', () => {
        editingTriggerLua = ta.value;
        const lines = ta.value.split('\n').length;
        ta.rows = Math.max(8, Math.min(24, lines + 2));
      });
      ta.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          commitTriggerLuaEdit(index);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          editingTriggerIndex = null;
          editingTriggerLua = '';
          render();
        }
      });
      editor.appendChild(ta);
      const actions = document.createElement('div');
      actions.className = 'lrv-trigger-edit-actions';
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'lrv-asset-action lrv-asset-action-primary';
      saveBtn.textContent = 'Save';
      saveBtn.title = 'Save (Ctrl+Enter)';
      saveBtn.addEventListener('click', () => commitTriggerLuaEdit(index));
      actions.appendChild(saveBtn);
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'lrv-asset-action';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.title = 'Cancel (Esc)';
      cancelBtn.addEventListener('click', () => {
        editingTriggerIndex = null;
        editingTriggerLua = '';
        render();
      });
      actions.appendChild(cancelBtn);
      editor.appendChild(actions);
      row.appendChild(editor);
      queueMicrotask(() => { ta.focus(); });
    } else {
      const luaDet = document.createElement('details');
      luaDet.className = 'lrv-trigger-lua';
      const luaSum = document.createElement('summary');
      const effectsLabel = t.effects.length > 0
        ? ` · ${t.effects.length} V2 effect${t.effects.length === 1 ? '' : 's'}`
        : '';
      const luaLabel = t.lua
        ? `Lua (${t.lua.length} chars)`
        : (t.effects.length > 0 ? 'Lua (none)' : 'Lua (empty)');
      luaSum.textContent = luaLabel + effectsLabel;
      luaDet.appendChild(luaSum);
      luaDet.open = !t.lua && t.effects.length > 0;
      if (t.lua) {
        const pre = document.createElement('pre');
        pre.className = 'lrv-pre';
        pre.textContent = t.lua;
        luaDet.appendChild(pre);
      }
      if (t.effects.length > 0) {
        const pre = document.createElement('pre');
        pre.className = 'lrv-pre';
        pre.textContent = t.effects
          .map((e) => `${'  '.repeat(Math.min(e.indent, 12))}${e.summary}`)
          .join('\n');
        luaDet.appendChild(pre);
      }
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'lrv-asset-action';
      editBtn.textContent = t.lua ? 'Edit lua' : 'Add lua';
      editBtn.style.margin = '4px 0 0 0';
      editBtn.addEventListener('click', () => {
        editingTriggerIndex = index;
        editingTriggerLua = t.lua ?? '';
        render();
      });
      luaDet.appendChild(editBtn);
      row.appendChild(luaDet);
    }
    return row;
  }

  function commitTriggerLuaEdit(index: number): void {
    if (!viewerData) return;
    const source = viewerData.source.kind === 'character'
      ? { kind: 'character' as const, characterId: viewerData.source.characterId }
      : { kind: 'module' as const, moduleId: viewerData.source.moduleId };
    log.info(`viewer-panel: set_trigger_lua index=${index} kind=${source.kind} luaLen=${editingTriggerLua.length}`);
    sendToBackend({
      type: 'set_trigger_lua',
      source,
      triggerIndex: index,
      lua: editingTriggerLua,
    });
    editingTriggerIndex = null;
    editingTriggerLua = '';
  }

  function renderRegexSection(regex: readonly ViewerRegexEntry[]): HTMLElement {
    const det = document.createElement('section');
    det.className = 'lrv-section';
    const sum = document.createElement('div');
    sum.className = 'lrv-section-summary';
    sum.textContent = `Regex · ${regex.length}`;
    det.appendChild(sum);
    if (regex.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lrv-empty';
      empty.textContent = 'No regex rules.';
      det.appendChild(empty);
      return det;
    }
    for (const r of regex) {
      const row = document.createElement('div');
      row.className = 'lrv-regex-row';
      if (r.disabled) row.classList.add('lrv-regex-row-disabled');
      const head = document.createElement('div');
      head.className = 'lrv-regex-head';
      const name = document.createElement('span');
      name.className = 'lrv-regex-name';
      name.textContent = r.name;
      head.appendChild(name);
      const tag = document.createElement('span');
      tag.className = 'lrv-regex-tag';
      const tagParts = [r.target, r.placement].filter((p) => p && p.length > 0);
      tag.textContent = tagParts.join(' · ');
      head.appendChild(tag);
      if (r.moduleId) {
        const modBadge = document.createElement('span');
        modBadge.className = 'lrv-regex-module';
        modBadge.textContent = `from module: ${r.moduleId.slice(0, 8)}…`;
        modBadge.title = `Module id: ${r.moduleId}`;
        head.appendChild(modBadge);
      }
      row.appendChild(head);
      const find = document.createElement('div');
      find.className = 'lrv-regex-line';
      const findLabel = document.createElement('span');
      findLabel.className = 'lrv-regex-line-label';
      findLabel.textContent = 'find:';
      find.appendChild(findLabel);
      const findCode = document.createElement('code');
      findCode.textContent = r.find;
      find.appendChild(findCode);
      row.appendChild(find);
      const repl = document.createElement('div');
      repl.className = 'lrv-regex-line';
      const replLabel = document.createElement('span');
      replLabel.className = 'lrv-regex-line-label';
      replLabel.textContent = 'replace:';
      repl.appendChild(replLabel);
      const replCode = document.createElement('code');
      replCode.textContent = r.replace.length > 200 ? r.replace.slice(0, 200) + '…' : r.replace;
      repl.appendChild(replCode);
      row.appendChild(repl);
      det.appendChild(row);
    }
    return det;
  }

  function renderLorebookSection(groups: readonly ViewerLorebookGroup[]): HTMLElement {
    const det = document.createElement('section');
    det.className = 'lrv-section';
    const sum = document.createElement('div');
    sum.className = 'lrv-section-summary';
    const totalEntries = groups.reduce((acc, g) => acc + g.entries.length, 0);
    sum.textContent = `Lorebook · ${groups.length} group${groups.length === 1 ? '' : 's'} · ${totalEntries} entr${totalEntries === 1 ? 'y' : 'ies'}`;
    det.appendChild(sum);
    if (groups.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lrv-empty';
      empty.textContent = 'No lorebook entries available here.';
      det.appendChild(empty);
      return det;
    }
    for (const g of groups) {
      const grpDet = document.createElement('details');
      grpDet.className = 'lrv-lorebook-group';
      grpDet.open = true;
      const grpSum = document.createElement('summary');
      grpSum.textContent = `${g.groupName} · ${g.entries.length}`;
      grpDet.appendChild(grpSum);
      for (const e of g.entries) {
        const row = document.createElement('div');
        row.className = 'lrv-lorebook-row';
        if (e.disabled) row.classList.add('lrv-lorebook-row-disabled');
        const keyEl = document.createElement('div');
        keyEl.className = 'lrv-lorebook-keys';
        keyEl.textContent = e.key.length > 0 ? e.key.join(', ') : '(no keys)';
        row.appendChild(keyEl);
        if (e.comment) {
          const com = document.createElement('div');
          com.className = 'lrv-lorebook-comment';
          com.textContent = e.comment;
          row.appendChild(com);
        }
        const body = document.createElement('div');
        body.className = 'lrv-lorebook-content';
        body.textContent = e.content.length > 400 ? e.content.slice(0, 400) + '…' : e.content;
        row.appendChild(body);
        grpDet.appendChild(row);
      }
      det.appendChild(grpDet);
    }
    return det;
  }

  function renderCjsSection(cjs: string): HTMLElement {
    const det = document.createElement('section');
    det.className = 'lrv-section';
    const sum = document.createElement('div');
    sum.className = 'lrv-section-summary';
    sum.textContent = `CJS module body · ${cjs.length} chars`;
    det.appendChild(sum);
    const note = document.createElement('div');
    note.className = 'lrv-warning';
    note.textContent = 'LumiRealm does not execute module CJS.';
    det.appendChild(note);
    const pre = document.createElement('pre');
    pre.className = 'lrv-pre';
    pre.textContent = cjs;
    det.appendChild(pre);
    return det;
  }

  function render(): void {
    renderStatus();
    renderSurfaces();
  }

  sourceSelect.addEventListener('change', () => {
    selectedSourceKey = sourceSelect.value;
    const o = parseSourceKey(selectedSourceKey);
    if (o) requestForSelection(o);
  });

  refreshBtn.addEventListener('click', () => {
    if (!selectedSourceKey) return;
    const o = parseSourceKey(selectedSourceKey);
    if (o) requestForSelection(o);
  });

  function handleBackendMessage(msg: BackendToFrontend): void {
    switch (msg.type) {
      case 'cards_updated':
        cards = msg.cards;
        rebuildSourceSelect();
        render();
        break;
      case 'modules_pushed':
        modules = msg.modules;
        if (msg.attached_by_character) {
          for (const [charId, list] of Object.entries(msg.attached_by_character)) {
            attachedByCharacter.set(charId, list);
          }
        }
        rebuildSourceSelect();
        render();
        break;
      case 'attached_modules_pushed':
        attachedByCharacter.set(msg.characterId, msg.attached);
        rebuildSourceSelect();
        render();
        break;
      case 'viewer_data_pushed': {
        const d = msg.data;
        const expectedKey = sourceKey(
          d.source.kind === 'character'
            ? { kind: 'character', id: d.source.characterId, label: d.source.name }
            : { kind: 'module', id: d.source.moduleId, label: d.source.name },
        );
        if (selectedSourceKey !== null && selectedSourceKey !== expectedKey) {
          log.info(`viewer-panel: ignoring stale push for ${expectedKey} (selected=${selectedSourceKey})`);
          return;
        }
        viewerData = d;
        loading = false;
        lastError = null;
        if (assetUploadStatus !== null && assetUploadStatus.kind === 'info') {
          assetUploadStatus = null;
        }
        render();
        break;
      }
      // `lorebook_import_result` is consumed by the Import → Lorebooks tab
      // (Phase E) for standalone imports. Per-character imports no longer
      // surface UI here either , moved to that tab.
      case 'error':
        if (loading) {
          loading = false;
          lastError = msg.message;
          render();
        } else if (assetUploadStatus !== null) {
          assetUploadStatus = { kind: 'error', message: msg.message };
          render();
        }
        break;
    }
  }

  function destroy(): void {
    log.info('viewer-panel: destroy');
    try { root.replaceChildren(); } catch { /* */ }
  }

  sendToBackend({ type: 'get_cards' });
  sendToBackend({ type: 'request_modules' });

  render();
  log.info('viewer-panel: ready');

  return { handleBackendMessage, destroy };
}
