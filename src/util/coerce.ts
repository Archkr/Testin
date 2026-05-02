
export function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function toStr(v: unknown): string {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') return v;
  try { return String(v); } catch { return ''; }
}
