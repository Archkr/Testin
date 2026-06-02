// Opt-in performance instrumentation for the LumiRealm worker side.
//
// Enable with RISU_COMPAT_PERF=1 (passed through buildRestrictedEnv to the
// spindle worker, like RISU_COMPAT_VERBOSE). When disabled, every entry point
// is a single boolean check.
//
// Mirrors Lumiverse's src/utils/regex-perf.ts. The headline metric this answers:
// how many fresh Lua VMs get created per chat-open / render and how much
// wall-clock they burn — the prime suspect behind the "~12s per chat-open on
// listenEdit-heavy cards" note.
//
// Output goes through spindle.log.info — the worker→host bridge that the host
// prints UNCONDITIONALLY as `[Spindle:lumirealm] ...` (worker-host handleLog).
// A worker's raw console.log is NOT forwarded to the server console, so we must
// not use it here. This path also bypasses makeSafeLogger/logStore, so
// RISU_COMPAT_PERF=1 is the ONLY switch needed — you do NOT have to enable
// LumiRealm logging. Perf lines contain only counts/timings, never chat content.

const ENABLED: boolean = (() => {
  try {
    return (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env?.RISU_COMPAT_PERF === "1";
  } catch {
    return false;
  }
})();

function emitLine(line: string): void {
  try {
    const sp = (globalThis as { spindle?: { log?: { info?: (m: string) => void } } }).spindle;
    if (sp?.log?.info) { sp.log.info(line); return; }
  } catch { /* fall through */ }
  try { console.log(line); } catch { /* */ }
}

// Boot marker: prints once at worker startup IFF the env var reached this
// process. If you set RISU_COMPAT_PERF=1 and DON'T see this line, the backend
// was not restarted (browser refresh doesn't reload worker env) — or the var
// isn't propagating. If you DO see it but no `lua.*`/`mcp.*` rows follow, the
// cost center genuinely isn't being hit (e.g. no Lua triggers on this card).
if (ENABLED) {
  emitLine("[lumirealm perf] instrumentation ENABLED (RISU_COMPAT_PERF=1)");
}

interface Bucket {
  count: number;
  totalMs: number;
  subs: Record<string, number>;
}

const buckets = new Map<string, Bucket>();
let startedAt = 0;
let dirty = false;
let flushTimer: ReturnType<typeof setInterval> | null = null;
const FLUSH_INTERVAL_MS = 5_000;

export function perfEnabled(): boolean {
  return ENABLED;
}

function ensureTimer(): void {
  if (flushTimer) return;
  startedAt = Date.now();
  flushTimer = setInterval(() => {
    if (dirty) flushNow();
  }, FLUSH_INTERVAL_MS);
  (flushTimer as { unref?: () => void }).unref?.();
}

function getBucket(name: string): Bucket {
  let b = buckets.get(name);
  if (!b) {
    b = { count: 0, totalMs: 0, subs: {} };
    buckets.set(name, b);
  }
  return b;
}

export function perfRecord(name: string, ms: number, subs?: Record<string, number>): void {
  if (!ENABLED) return;
  ensureTimer();
  const b = getBucket(name);
  b.count += 1;
  b.totalMs += ms;
  if (subs) for (const k in subs) b.subs[k] = (b.subs[k] ?? 0) + subs[k]!;
  dirty = true;
}

export function perfBump(name: string, subs?: Record<string, number>): void {
  if (!ENABLED) return;
  ensureTimer();
  const b = getBucket(name);
  b.count += 1;
  if (subs) for (const k in subs) b.subs[k] = (b.subs[k] ?? 0) + subs[k]!;
  dirty = true;
}

const PANEL_TRACE: boolean = (() => {
  try {
    return (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env?.LUMIVERSE_PANEL_TRACE === "1";
  } catch {
    return false;
  }
})();

const PANEL_MARKERS = ["★■", "🦶", "★OMEGA★", "data-lr-style-wrap", "data-risu-island", "sys-panel", "status-panel"];

export function panelTrace(stage: string, content: string): void {
  if (!PANEL_TRACE) return;
  const found: string[] = [];
  let firstIdx = -1;
  for (const m of PANEL_MARKERS) {
    const i = content.indexOf(m);
    if (i >= 0) {
      found.push(m);
      if (firstIdx < 0 || i < firstIdx) firstIdx = i;
    }
  }
  const slice = firstIdx >= 0
    ? content.slice(Math.max(0, firstIdx - 50), firstIdx + 140)
    : content.slice(0, 140);
  emitLine(`[panel-trace] ${stage} len=${content.length} markers=[${found.join(",")}] slice=${JSON.stringify(slice)}`);
}

export function flushNow(): void {
  if (!ENABLED || buckets.size === 0) return;
  dirty = false;
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  const rows = [...buckets.entries()].sort((a, b) => b[1].totalMs - a[1].totalMs);
  const lines = rows.map(([name, b]) => {
    const avg = b.count > 0 ? (b.totalMs / b.count).toFixed(2) : "0";
    const subStr = Object.keys(b.subs).length
      ? "  " + Object.entries(b.subs).map(([k, v]) => `${k}=${v}`).join(" ")
      : "";
    return `    ${name.padEnd(28)} n=${b.count} total=${Math.round(b.totalMs)}ms avg=${avg}ms${subStr}`;
  });
  emitLine(`[lumirealm perf] +${elapsed}s — LumiRealm cost centers (by total ms):\n${lines.join("\n")}`);
}
