// Risu cbs.ts,1375 screen_width / screen_height cache.
// Keyed by userId; populated from screen_dims WS messages. Null before first report.

export interface ScreenDims {
  readonly width: number;
  readonly height: number;
}

const byUser = new Map<string, ScreenDims>();

export function setScreenDims(userId: string, dims: ScreenDims): void {
  byUser.set(userId, dims);
}

export function clearScreenDims(userId: string): void {
  byUser.delete(userId);
}

export function getScreenDims(userId: string | null | undefined): ScreenDims | null {
  if (!userId) return null;
  return byUser.get(userId) ?? null;
}

export function resetAllScreenDims(): void {
  byUser.clear();
}
