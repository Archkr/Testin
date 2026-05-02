// Body-level overlay that reconciles backend-pushed `set_portals` snapshots.
// Signature match = no-op (preserves focus / checked state).

import type { Portal } from "../types/messages.js";

interface Log {
  info: (msg: string, ...rest: unknown[]) => void;
  warn: (msg: string, ...rest: unknown[]) => void;
  error: (msg: string, ...rest: unknown[]) => void;
}

const PORTAL_ROOT_ID = "risu-compat-sidebar-portal-root";
const PORTAL_WRAPPER_CLASS = "risu-compat-portal-wrapper";

interface MountedSlot {
  readonly slotId: string;
  readonly signature: string;
  readonly wrapper: HTMLDivElement;
}

export interface SidebarPortal {
  /** Apply a backend-pushed snapshot. Idempotent, dedup'd by signature. */
  applySetPortals(msg: { chatId: string; seq: number; portals: readonly Portal[] }): void;
  /** Tear down everything and forget the active chat. */
  clearAll(): void;
  /** Snapshot for `__riCompat.dumpPortalState()` DevTools hook. */
  diagnostic(): {
    activeChatId: string | null;
    lastSeq: number;
    rootInDom: boolean;
    rootChildCount: number;
    slots: Array<{ slotId: string; msgId: string | null; signature: string; htmlLen: number }>;
  };
  destroy: () => void;
}

export function setupSidebarPortal(flog: Log): SidebarPortal {
  const portalRoot = ensurePortalRoot();
  const mounted = new Map<string, MountedSlot>();
  let activeChatId: string | null = null;
  let lastSeq = 0;

  function clearAll(): void {
    if (mounted.size === 0 && activeChatId === null) return;
    for (const [, slot] of mounted) slot.wrapper.remove();
    mounted.clear();
    activeChatId = null;
    lastSeq = 0;
    flog.info(`sidebar-portal: clearAll`);
  }

  function applySetPortals(msg: {
    chatId: string;
    seq: number;
    portals: readonly Portal[];
  }): void {
    if (msg.chatId !== activeChatId) {
      flog.info(
        `sidebar-portal: chat-switch ${activeChatId ?? "<none>"} → ${msg.chatId} ` +
          `(droppingMounted=${mounted.size}, incoming=${msg.portals.length})`,
      );
      for (const [, slot] of mounted) slot.wrapper.remove();
      mounted.clear();
      activeChatId = msg.chatId;
      lastSeq = 0;
    }

    // Ignore out-of-order or replayed snapshots.
    if (msg.seq <= lastSeq) {
      flog.warn(
        `sidebar-portal: ignoring stale set_portals seq=${msg.seq} lastSeq=${lastSeq} chatId=${msg.chatId}`,
      );
      return;
    }
    lastSeq = msg.seq;

    const incomingIds = new Set(msg.portals.map((p) => p.slotId));

    let removed = 0;
    for (const [id, slot] of mounted) {
      if (!incomingIds.has(id)) {
        slot.wrapper.remove();
        mounted.delete(id);
        removed += 1;
      }
    }

    let added = 0;
    let replaced = 0;
    let unchanged = 0;
    for (const portal of msg.portals) {
      const existing = mounted.get(portal.slotId);
      if (existing && existing.signature === portal.signature) {
        unchanged += 1;
        continue;
      }
      if (existing) {
        existing.wrapper.remove();
        mounted.delete(portal.slotId);
        replaced += 1;
      } else {
        added += 1;
      }
      const wrapper = document.createElement("div");
      wrapper.className = PORTAL_WRAPPER_CLASS;
      wrapper.setAttribute("data-risu-portal-slot", portal.slotId);
      wrapper.setAttribute("data-message-id", portal.msgId);
      wrapper.innerHTML = portal.html;
      portalRoot.appendChild(wrapper);
      mounted.set(portal.slotId, {
        slotId: portal.slotId,
        signature: portal.signature,
        wrapper,
      });
    }

    flog.info(
      `sidebar-portal: applied chatId=${msg.chatId} seq=${msg.seq} ` +
        `incoming=${msg.portals.length} added=${added} replaced=${replaced} ` +
        `unchanged=${unchanged} removed=${removed} total_mounted=${mounted.size}`,
    );
  }

  flog.info(`sidebar-portal: setup complete (root=#${PORTAL_ROOT_ID}, mode=backend-pushed)`);

  function diagnostic(): {
    activeChatId: string | null;
    lastSeq: number;
    rootInDom: boolean;
    rootChildCount: number;
    slots: Array<{ slotId: string; msgId: string | null; signature: string; htmlLen: number }>;
  } {
    const slots: Array<{ slotId: string; msgId: string | null; signature: string; htmlLen: number }> = [];
    for (const [, slot] of mounted) {
      slots.push({
        slotId: slot.slotId,
        msgId: slot.wrapper.getAttribute("data-message-id"),
        signature: slot.signature,
        htmlLen: slot.wrapper.innerHTML.length,
      });
    }
    return {
      activeChatId,
      lastSeq,
      rootInDom: document.body.contains(portalRoot),
      rootChildCount: portalRoot.children.length,
      slots,
    };
  }

  return {
    applySetPortals,
    clearAll,
    diagnostic,
    destroy: () => {
      clearAll();
      portalRoot.remove();
      flog.info("sidebar-portal: destroyed");
    },
  };
}

function ensurePortalRoot(): HTMLDivElement {
  const existing = document.getElementById(PORTAL_ROOT_ID) as HTMLDivElement | null;
  if (existing) return existing;
  const root = document.createElement("div");
  root.id = PORTAL_ROOT_ID;
  // No styling. Wrappers carry `data-message-id` so `[data-message-id] .x-risu-foo` keeps matching descendants.
  document.body.appendChild(root);
  return root;
}
