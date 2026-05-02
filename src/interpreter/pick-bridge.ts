// Pending promises for `request_pick` round-trips. Mirrors alert-bridge.
// Backend dispatch for `pick_resolved` calls resolvePickResolution; the
// spindle-host pick() shim awaits via awaitPickResolution.

const pending = new Map<string, (value: string | null) => void>();

export function awaitPickResolution(
  requestId: string,
  timeoutMs = 120_000,
): Promise<string | null> {
  return new Promise((resolve) => {
    pending.set(requestId, resolve);
    setTimeout(() => {
      if (pending.delete(requestId)) resolve(null);
    }, timeoutMs);
  });
}

export function resolvePickResolution(requestId: string, value: string | null): void {
  const r = pending.get(requestId);
  if (r) {
    pending.delete(requestId);
    r(value);
  }
}
