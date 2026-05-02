// Per-chat portal snapshot state. Holds last-pushed slot map; emits diffs on applySnapshot.
// Monotonic seq per chat; identical snapshots are no-ops.

import type { PortalSlot } from "../interpreter/portal/resolver.js";

export interface PortalSnapshotEntry {
  /** All slots currently active for this chat. */
  readonly slots: readonly PortalSlot[];
  /** Monotonic per-chat sequence; increments on every push. */
  readonly seq: number;
}

export interface ApplyResult {
  /** True when the snapshot differs from the last-pushed one. */
  readonly changed: boolean;
  readonly entry: PortalSnapshotEntry;
}

export class PortalStateStore {
  #byChat = new Map<string, PortalSnapshotEntry>();

  applySnapshot(chatId: string, newSlots: readonly PortalSlot[]): ApplyResult {
    const existing = this.#byChat.get(chatId);
    if (existing && slotsEquivalent(existing.slots, newSlots)) {
      return { changed: false, entry: existing };
    }
    const seq = (existing?.seq ?? 0) + 1;
    const entry: PortalSnapshotEntry = { slots: [...newSlots], seq };
    this.#byChat.set(chatId, entry);
    return { changed: true, entry };
  }

  clearChat(chatId: string): { seq: number } {
    const existing = this.#byChat.get(chatId);
    this.#byChat.delete(chatId);
    return { seq: (existing?.seq ?? 0) + 1 };
  }

  /** Read-only access for diagnostics + reconnect snapshot replies. */
  current(chatId: string): PortalSnapshotEntry | null {
    return this.#byChat.get(chatId) ?? null;
  }

  /** Drop everything — used when the worker boots fresh (defensive). */
  reset(): void {
    this.#byChat.clear();
  }

  /** Diagnostic only: size + per-chat slot counts. */
  diagnostic(): { chats: number; perChat: ReadonlyMap<string, number> } {
    const perChat = new Map<string, number>();
    for (const [chatId, entry] of this.#byChat) {
      perChat.set(chatId, entry.slots.length);
    }
    return { chats: this.#byChat.size, perChat };
  }
}

function slotsEquivalent(
  a: readonly PortalSlot[],
  b: readonly PortalSlot[],
): boolean {
  if (a.length !== b.length) return false;
  if (a.length === 0) return true;
  const map = new Map<string, string>();
  for (const slot of a) map.set(slot.slotId, slot.signature);
  for (const slot of b) {
    const sig = map.get(slot.slotId);
    if (sig === undefined) return false;
    if (sig !== slot.signature) return false;
  }
  return true;
}
