interface PendingPick {
  readonly ownerUserId: string;
  readonly resolve: (value: string | null) => void;
}

const pending = new Map<string, PendingPick>();

export function awaitPickResolution(
  requestId: string,
  ownerUserId: string,
  timeoutMs = 120_000,
): Promise<string | null> {
  return new Promise((resolve) => {
    pending.set(requestId, { ownerUserId, resolve });
    setTimeout(() => {
      const cur = pending.get(requestId);
      if (cur && cur.ownerUserId === ownerUserId) {
        pending.delete(requestId);
        resolve(null);
      }
    }, timeoutMs);
  });
}

export interface ResolvePickResult {
  readonly ok: boolean;
  readonly reason?: 'unknown_request' | 'ownership_mismatch';
}

export function resolvePickResolution(
  requestId: string,
  responderUserId: string | undefined,
  value: string | null,
): ResolvePickResult {
  const rec = pending.get(requestId);
  if (!rec) return { ok: false, reason: 'unknown_request' };
  if (responderUserId === undefined || rec.ownerUserId !== responderUserId) {
    return { ok: false, reason: 'ownership_mismatch' };
  }
  pending.delete(requestId);
  rec.resolve(value);
  return { ok: true };
}
