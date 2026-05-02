// Per-chat toggle-definition snapshot store. Twin of variables-state.ts.
// Deduplicates `set_toggle_definitions` pushes via signature. Toggle values
// flow through `set_variables` separately.

import type { SidebarToggleWire } from '../types/messages.js';

export interface ToggleSnapshotEntry {
  readonly toggles: readonly SidebarToggleWire[];
  readonly attribution: Readonly<Record<string, string>>;
  readonly seq: number;
  readonly ts: number;
}

export interface ToggleApplyResult {
  readonly changed: boolean;
  readonly entry: ToggleSnapshotEntry;
}

export class ToggleStateStore {
  #byChat = new Map<string, ToggleSnapshotEntry>();
  #signatureByChat = new Map<string, string>();

  applySnapshot(
    chatId: string,
    toggles: readonly SidebarToggleWire[],
    attribution: Readonly<Record<string, string>>,
  ): ToggleApplyResult {
    const sig = signature(toggles, attribution);
    const existing = this.#byChat.get(chatId);
    if (existing && this.#signatureByChat.get(chatId) === sig) {
      return { changed: false, entry: existing };
    }
    const seq = (existing?.seq ?? 0) + 1;
    const entry: ToggleSnapshotEntry = {
      toggles: toggles.map(cloneToggle),
      attribution: { ...attribution },
      seq,
      ts: Date.now(),
    };
    this.#byChat.set(chatId, entry);
    this.#signatureByChat.set(chatId, sig);
    return { changed: true, entry };
  }

  current(chatId: string): ToggleSnapshotEntry | null {
    return this.#byChat.get(chatId) ?? null;
  }

  clearChat(chatId: string): void {
    this.#byChat.delete(chatId);
    this.#signatureByChat.delete(chatId);
  }

  reset(): void {
    this.#byChat.clear();
    this.#signatureByChat.clear();
  }
}

function cloneToggle(t: SidebarToggleWire): SidebarToggleWire {
  switch (t.type) {
    case 'group':
    case 'groupEnd':
    case 'divider':
      return {
        type: t.type,
        ...(t.key !== undefined ? { key: t.key } : {}),
        ...(t.value !== undefined ? { value: t.value } : {}),
      };
    case 'caption':
      return {
        type: 'caption',
        ...(t.key !== undefined ? { key: t.key } : {}),
        value: t.value,
      };
    case 'select':
      return {
        type: 'select',
        key: t.key,
        value: t.value,
        options: [...t.options],
      };
    case 'text':
    case 'textarea':
    case 'checkbox':
      return {
        type: t.type,
        key: t.key,
        value: t.value,
        ...(t.options !== undefined ? { options: [...t.options] } : {}),
      };
  }
}

function signature(
  toggles: readonly SidebarToggleWire[],
  attribution: Readonly<Record<string, string>>,
): string {
  // Toggles are order-sensitive (DSL group nesting). Attribution keys sorted for stability.
  const attrKeys = Object.keys(attribution).sort();
  return JSON.stringify({
    t: toggles,
    a: attrKeys.map((k) => [k, attribution[k] ?? '']),
  });
}
