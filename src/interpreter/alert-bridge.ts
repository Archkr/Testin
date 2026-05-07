interface PendingAlert {
  readonly ownerUserId: string;
  readonly resolve: () => void;
}

const pending = new Map<string, PendingAlert>();

export function awaitAlertDismissal(
  requestId: string,
  ownerUserId: string,
  timeoutMs = 60_000,
): Promise<void> {
  return new Promise((resolve) => {
    pending.set(requestId, { ownerUserId, resolve });
    setTimeout(() => {
      const cur = pending.get(requestId);
      if (cur && cur.ownerUserId === ownerUserId) {
        pending.delete(requestId);
        resolve();
      }
    }, timeoutMs);
  });
}

export interface ResolveAlertResult {
  readonly ok: boolean;
  readonly reason?: 'unknown_request' | 'ownership_mismatch';
}

export function resolveAlertDismissal(
  requestId: string,
  responderUserId: string | undefined,
): ResolveAlertResult {
  const rec = pending.get(requestId);
  if (!rec) return { ok: false, reason: 'unknown_request' };
  if (responderUserId === undefined || rec.ownerUserId !== responderUserId) {
    return { ok: false, reason: 'ownership_mismatch' };
  }
  pending.delete(requestId);
  rec.resolve();
  return { ok: true };
}
