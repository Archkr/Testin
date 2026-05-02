// Pending promises for `request_alert` round-trips. The backend dispatch
// for `alert_dismissed` calls resolveAlertDismissal; the spindle-host
// alert() shim awaits via awaitAlertDismissal.

const pending = new Map<string, () => void>();

export function awaitAlertDismissal(requestId: string, timeoutMs = 60_000): Promise<void> {
  return new Promise((resolve) => {
    pending.set(requestId, resolve);
    setTimeout(() => {
      if (pending.delete(requestId)) resolve();
    }, timeoutMs);
  });
}

export function resolveAlertDismissal(requestId: string): void {
  const r = pending.get(requestId);
  if (r) {
    pending.delete(requestId);
    r();
  }
}
