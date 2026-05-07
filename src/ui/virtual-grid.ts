// Windowed-virtualization for grid + list views. Mounts only the visible
// row range plus an overscan band, repositions on resize.

export interface VirtualGridMountOpts<T> {
  readonly hostClassName?: string;
  readonly innerClassName?: string;
  readonly rowHeight: number;
  /** Min tile width for auto-column layout. Omit (or Infinity) for single column. */
  readonly minTileWidth?: number;
  readonly overscanRows?: number;
  getItems(): readonly T[];
  renderItem(item: T, index: number): HTMLElement;
  pinnedIndices?(): readonly number[];
}

export interface VirtualGridHandle {
  readonly host: HTMLElement;
  readonly inner: HTMLElement;
  /** Re-derive item count + recompute layout + render window. */
  invalidate(): void;
  /** Force re-mount of every visible node, used when item data changed in place. */
  refresh(): void;
  destroy(): void;
}

interface InternalState {
  columns: number;
  tileW: number;
}

export function createVirtualGrid<T>(opts: VirtualGridMountOpts<T>): VirtualGridHandle {
  const host = document.createElement('div');
  if (opts.hostClassName) host.className = opts.hostClassName;

  const inner = document.createElement('div');
  if (opts.innerClassName) inner.className = opts.innerClassName;
  inner.style.position = 'relative';
  host.appendChild(inner);

  const tileNodes = new Map<number, HTMLElement>();
  const state: InternalState = { columns: 1, tileW: 0 };
  const overscan = opts.overscanRows ?? 2;
  const rowH = opts.rowHeight;

  function recomputeLayout(): void {
    const items = opts.getItems();
    const containerW = host.clientWidth || opts.minTileWidth || 1;
    const minW = opts.minTileWidth ?? Number.POSITIVE_INFINITY;
    state.columns = Math.max(1, Number.isFinite(minW) ? Math.floor(containerW / minW) : 1);
    state.tileW = containerW / state.columns;
    const rows = Math.ceil(items.length / state.columns);
    inner.style.height = `${rows * rowH}px`;
  }

  function placeTile(node: HTMLElement, index: number): void {
    const row = Math.floor(index / state.columns);
    const col = index % state.columns;
    node.style.position = 'absolute';
    node.style.top = `${row * rowH}px`;
    node.style.left = `${col * state.tileW}px`;
    node.style.width = `${state.tileW}px`;
    node.style.height = `${rowH}px`;
    node.style.boxSizing = 'border-box';
  }

  function renderWindow(): void {
    const items = opts.getItems();
    if (items.length === 0) {
      for (const [, node] of tileNodes) node.remove();
      tileNodes.clear();
      return;
    }
    const top = host.scrollTop;
    const bottom = top + (host.clientHeight || 1);
    const totalRows = Math.ceil(items.length / state.columns);
    const startRow = Math.max(0, Math.floor(top / rowH) - overscan);
    const endRow = Math.min(totalRows, Math.ceil(bottom / rowH) + overscan);
    const startIdx = startRow * state.columns;
    const endIdx = Math.min(items.length, endRow * state.columns);

    const wanted = new Set<number>();
    for (let i = startIdx; i < endIdx; i++) wanted.add(i);
    if (opts.pinnedIndices) {
      for (const i of opts.pinnedIndices()) {
        if (i >= 0 && i < items.length) wanted.add(i);
      }
    }

    for (const [i, node] of tileNodes) {
      if (!wanted.has(i)) {
        node.remove();
        tileNodes.delete(i);
      }
    }
    for (const i of wanted) {
      const existing = tileNodes.get(i);
      if (existing) {
        placeTile(existing, i);
        continue;
      }
      const item = items[i];
      if (item === undefined) continue;
      const tile = opts.renderItem(item, i);
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

  let destroyed = false;
  let scrollPending = false;
  let scrollRaf: number | null = null;
  const onScroll = (): void => {
    if (scrollPending) return;
    scrollPending = true;
    scrollRaf = requestAnimationFrame(() => {
      scrollPending = false;
      scrollRaf = null;
      if (destroyed) return;
      renderWindow();
    });
  };
  host.addEventListener('scroll', onScroll);

  let ro: ResizeObserver | null = null;
  let initialRaf: number | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    let firstObservation = true;
    ro = new ResizeObserver(() => {
      if (destroyed) return;
      const prevColumns = state.columns;
      const prevTileW = state.tileW;
      recomputeLayout();
      if (firstObservation || state.columns !== prevColumns || Math.abs(state.tileW - prevTileW) > 0.5) {
        rerenderAll();
        firstObservation = false;
      } else {
        renderWindow();
      }
    });
    ro.observe(host);
  } else {
    initialRaf = requestAnimationFrame(() => {
      initialRaf = null;
      if (destroyed) return;
      recomputeLayout();
      renderWindow();
    });
  }

  function invalidate(): void {
    recomputeLayout();
    renderWindow();
  }

  function refresh(): void {
    rerenderAll();
  }

  function destroy(): void {
    destroyed = true;
    if (initialRaf !== null) cancelAnimationFrame(initialRaf);
    if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
    host.removeEventListener('scroll', onScroll);
    if (ro) ro.disconnect();
    inner.replaceChildren();
    tileNodes.clear();
  }

  return { host, inner, invalidate, refresh, destroy };
}
