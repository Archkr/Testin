export interface SearchableSelectItem {
  readonly value: string;
  readonly label: string;
  readonly secondary?: string;
  readonly group?: string;
  readonly disabled?: boolean;
  readonly title?: string;
  /** Extra strings the filter matches against beyond label/secondary/group/value.
   *  Use for synonyms or alternate-language forms that aren't always rendered. */
  readonly searchTerms?: readonly string[];
}

export interface SearchableSelectOptions {
  readonly items: readonly SearchableSelectItem[];
  readonly value?: string | null;
  readonly placeholder?: string;
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;
  readonly className?: string;
  readonly id?: string;
  readonly onChange: (value: string | null, item: SearchableSelectItem | null) => void;
}

export interface SearchableSelectHandle {
  readonly root: HTMLElement;
  setItems(items: readonly SearchableSelectItem[]): void;
  setValue(value: string | null): void;
  getValue(): string | null;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

const PANEL_GAP = 4;
const PANEL_MAX_HEIGHT = 320;

let nextId = 0;

export function createSearchableSelect(opts: SearchableSelectOptions): SearchableSelectHandle {
  const componentId = `lr-ss-${++nextId}`;
  let items = opts.items.slice();
  let value: string | null = opts.value ?? null;
  let disabled = false;
  let isOpen = false;
  let activeIndex = -1;
  let searchQuery = '';
  let filtered: SearchableSelectItem[] = items.slice();
  let destroyed = false;

  const root = document.createElement('button');
  root.type = 'button';
  root.className = 'lr-ss-trigger' + (opts.className ? ' ' + opts.className : '');
  root.setAttribute('aria-haspopup', 'listbox');
  root.setAttribute('aria-expanded', 'false');
  root.setAttribute('aria-controls', componentId + '-panel');
  if (opts.id) root.id = opts.id;

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'lr-ss-trigger-label';
  root.appendChild(triggerLabel);

  const chevron = document.createElement('span');
  chevron.className = 'lr-ss-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.textContent = '▾';
  root.appendChild(chevron);

  const panel = document.createElement('div');
  panel.className = 'lr-ss-panel';
  panel.id = componentId + '-panel';
  panel.style.display = 'none';
  panel.setAttribute('role', 'dialog');

  const searchWrap = document.createElement('div');
  searchWrap.className = 'lr-ss-search-wrap';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'lr-ss-search';
  searchInput.placeholder = opts.searchPlaceholder ?? 'Search…';
  searchInput.autocomplete = 'off';
  searchInput.spellcheck = false;
  searchInput.setAttribute('role', 'combobox');
  searchInput.setAttribute('aria-autocomplete', 'list');
  searchInput.setAttribute('aria-controls', componentId + '-list');
  searchWrap.appendChild(searchInput);
  panel.appendChild(searchWrap);

  const listEl = document.createElement('ul');
  listEl.className = 'lr-ss-list';
  listEl.id = componentId + '-list';
  listEl.setAttribute('role', 'listbox');
  panel.appendChild(listEl);

  document.body.appendChild(panel);

  function selectedItem(): SearchableSelectItem | null {
    if (value === null) return null;
    return items.find((it) => it.value === value) ?? null;
  }

  function renderTrigger(): void {
    const sel = selectedItem();
    if (sel) {
      triggerLabel.textContent = sel.label;
      triggerLabel.classList.remove('lr-ss-placeholder');
      if (sel.title) root.title = sel.title;
      else root.removeAttribute('title');
    } else {
      triggerLabel.textContent = opts.placeholder ?? 'Select…';
      triggerLabel.classList.add('lr-ss-placeholder');
      root.removeAttribute('title');
    }
  }

  function applyFilter(): void {
    const q = searchQuery.trim().toLocaleLowerCase();
    if (q.length === 0) {
      filtered = items.slice();
    } else {
      filtered = items.filter((it) => {
        if (it.label.toLocaleLowerCase().includes(q)) return true;
        if (it.secondary && it.secondary.toLocaleLowerCase().includes(q)) return true;
        if (it.group && it.group.toLocaleLowerCase().includes(q)) return true;
        if (it.value.toLocaleLowerCase().includes(q)) return true;
        if (it.searchTerms) {
          for (const t of it.searchTerms) {
            if (t.toLocaleLowerCase().includes(q)) return true;
          }
        }
        return false;
      });
    }
    activeIndex = filtered.length > 0 ? 0 : -1;
  }

  function renderList(): void {
    listEl.replaceChildren();
    if (filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'lr-ss-empty';
      empty.textContent = opts.emptyMessage ?? 'No matches';
      listEl.appendChild(empty);
      return;
    }
    let lastGroup: string | undefined;
    for (let i = 0; i < filtered.length; i++) {
      const it = filtered[i]!;
      if (it.group !== undefined && it.group !== lastGroup) {
        const header = document.createElement('li');
        header.className = 'lr-ss-group';
        header.setAttribute('role', 'presentation');
        header.textContent = it.group;
        listEl.appendChild(header);
        lastGroup = it.group;
      }
      const li = document.createElement('li');
      li.className = 'lr-ss-option';
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', it.value);
      li.setAttribute('data-index', String(i));
      if (it.disabled) li.setAttribute('aria-disabled', 'true');
      if (it.value === value) {
        li.classList.add('lr-ss-option-selected');
        li.setAttribute('aria-selected', 'true');
      }
      if (i === activeIndex) li.classList.add('lr-ss-option-active');
      if (it.title) li.title = it.title;
      const labelEl = document.createElement('span');
      labelEl.className = 'lr-ss-option-label';
      labelEl.textContent = it.label;
      li.appendChild(labelEl);
      if (it.secondary) {
        const sec = document.createElement('span');
        sec.className = 'lr-ss-option-secondary';
        sec.textContent = it.secondary;
        li.appendChild(sec);
      }
      li.addEventListener('mouseenter', () => {
        if (!it.disabled) {
          activeIndex = i;
          updateActiveHighlight();
        }
      });
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      li.addEventListener('click', () => {
        if (it.disabled) return;
        commitSelection(i);
      });
      listEl.appendChild(li);
    }
  }

  function updateActiveHighlight(): void {
    const options = listEl.querySelectorAll<HTMLLIElement>('.lr-ss-option');
    options.forEach((el) => {
      const idx = Number(el.getAttribute('data-index'));
      el.classList.toggle('lr-ss-option-active', idx === activeIndex);
    });
    if (activeIndex >= 0) {
      const target = listEl.querySelector<HTMLLIElement>(`.lr-ss-option[data-index="${activeIndex}"]`);
      if (target) {
        const lt = target.offsetTop;
        const lb = lt + target.offsetHeight;
        if (lt < listEl.scrollTop) listEl.scrollTop = lt;
        else if (lb > listEl.scrollTop + listEl.clientHeight) listEl.scrollTop = lb - listEl.clientHeight;
      }
    }
  }

  function commitSelection(idx: number): void {
    const it = filtered[idx];
    if (!it || it.disabled) return;
    value = it.value;
    renderTrigger();
    close();
    opts.onChange(value, it);
  }

  function moveActive(delta: number): void {
    if (filtered.length === 0) return;
    let i = activeIndex < 0 ? 0 : activeIndex + delta;
    if (i < 0) i = filtered.length - 1;
    if (i >= filtered.length) i = 0;
    while (filtered[i] && filtered[i]!.disabled) {
      i = (i + (delta >= 0 ? 1 : -1) + filtered.length) % filtered.length;
      if (i === activeIndex) break;
    }
    activeIndex = i;
    updateActiveHighlight();
  }

  function positionPanel(): void {
    const r = root.getBoundingClientRect();
    const vh = window.innerHeight;
    const desiredTop = r.bottom + PANEL_GAP;
    const spaceBelow = vh - desiredTop - 8;
    const spaceAbove = r.top - PANEL_GAP - 8;
    const maxH = Math.min(PANEL_MAX_HEIGHT, Math.max(spaceBelow, spaceAbove));
    panel.style.maxHeight = `${maxH}px`;
    panel.style.minWidth = `${r.width}px`;
    panel.style.left = `${r.left}px`;
    if (spaceBelow >= PANEL_MAX_HEIGHT || spaceBelow >= spaceAbove) {
      panel.style.top = `${desiredTop}px`;
      panel.style.bottom = '';
    } else {
      panel.style.top = '';
      panel.style.bottom = `${vh - r.top + PANEL_GAP}px`;
    }
  }

  function open(): void {
    if (isOpen || disabled) return;
    isOpen = true;
    root.setAttribute('aria-expanded', 'true');
    searchQuery = '';
    searchInput.value = '';
    applyFilter();
    if (value !== null) {
      const idx = filtered.findIndex((it) => it.value === value);
      if (idx >= 0) activeIndex = idx;
    }
    renderList();
    panel.style.display = 'flex';
    positionPanel();
    requestAnimationFrame(() => {
      searchInput.focus();
      updateActiveHighlight();
    });
    window.addEventListener('resize', positionPanel, true);
    window.addEventListener('scroll', positionPanel, true);
    document.addEventListener('mousedown', onOutsidePointer, true);
    document.addEventListener('keydown', onDocKeydown, true);
  }

  function close(): void {
    if (!isOpen) return;
    isOpen = false;
    root.setAttribute('aria-expanded', 'false');
    panel.style.display = 'none';
    window.removeEventListener('resize', positionPanel, true);
    window.removeEventListener('scroll', positionPanel, true);
    document.removeEventListener('mousedown', onOutsidePointer, true);
    document.removeEventListener('keydown', onDocKeydown, true);
    if (document.activeElement === searchInput) root.focus({ preventScroll: true });
  }

  function onOutsidePointer(e: MouseEvent): void {
    const target = e.target as Node | null;
    if (!target) return;
    if (panel.contains(target) || root.contains(target)) return;
    close();
  }

  function onDocKeydown(e: KeyboardEvent): void {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    applyFilter();
    renderList();
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex < 0 && filtered.length > 0) activeIndex = 0;
      if (activeIndex >= 0) commitSelection(activeIndex);
    } else if (e.key === 'Tab') {
      close();
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (filtered.length > 0) {
        activeIndex = 0;
        updateActiveHighlight();
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      if (filtered.length > 0) {
        activeIndex = filtered.length - 1;
        updateActiveHighlight();
      }
    }
  });

  root.addEventListener('click', (e) => {
    e.preventDefault();
    if (isOpen) close();
    else open();
  });
  root.addEventListener('keydown', (e) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  renderTrigger();

  return {
    root,
    setItems(next) {
      items = next.slice();
      if (value !== null && !items.some((it) => it.value === value)) value = null;
      renderTrigger();
      if (isOpen) {
        applyFilter();
        renderList();
      }
    },
    setValue(next) {
      value = next ?? null;
      if (value !== null && !items.some((it) => it.value === value)) value = null;
      renderTrigger();
      if (isOpen) renderList();
    },
    getValue() {
      return value;
    },
    setDisabled(d) {
      disabled = d;
      if (d && isOpen) close();
      root.toggleAttribute('disabled', d);
      root.setAttribute('aria-disabled', d ? 'true' : 'false');
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      close();
      panel.remove();
    },
  };
}
