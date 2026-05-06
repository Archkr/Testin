export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type LogThreshold = 'silent' | LogLevel;

export const LEVEL_RANK: Readonly<Record<LogThreshold, number>> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export const DEFAULT_LOG_LEVEL: LogThreshold = 'info';

export const LOG_LEVEL_VALUES: readonly LogThreshold[] = [
  'silent', 'error', 'warn', 'info', 'debug', 'trace',
];

export function isLogThreshold(v: unknown): v is LogThreshold {
  return typeof v === 'string' && (LOG_LEVEL_VALUES as readonly string[]).includes(v);
}

export function meetsThreshold(call: LogLevel, threshold: LogThreshold): boolean {
  return LEVEL_RANK[call] <= LEVEL_RANK[threshold];
}

export interface LogEvent {
  ts: number;
  level: LogLevel;
  category: string;
  message: string;
}

export interface LogState {
  enabled: boolean;
  includeChatData: boolean;
  level: LogThreshold;
}

export interface LogStateSnapshot extends LogState {
  eventCount: number;
  bufferBytes: number;
}

const MAX_BYTES = 5 * 1024 * 1024;

const STATE_STORAGE_KEY = 'lumirealm/log-state.json';

class LogStore {
  private events: LogEvent[] = [];
  private bytes = 0;
  private state: LogState = { enabled: false, includeChatData: false, level: DEFAULT_LOG_LEVEL };

  isEnabled(): boolean { return this.state.enabled; }
  shouldRedact(): boolean { return !this.state.includeChatData; }
  getLevel(): LogThreshold { return this.state.level; }

  shouldEmit(level: LogLevel): boolean {
    if (!this.state.enabled) return false;
    return meetsThreshold(level, this.state.level);
  }

  push(level: LogLevel, category: string, message: string): void {
    if (!this.shouldEmit(level)) return;
    const text = this.shouldRedact() ? redact(message) : message;
    const ev: LogEvent = { ts: Date.now(), level, category, message: text };
    const size = approxBytes(ev);
    this.events.push(ev);
    this.bytes += size;
    while (this.bytes > MAX_BYTES && this.events.length > 1) {
      const dropped = this.events.shift();
      if (dropped) this.bytes -= approxBytes(dropped);
    }
  }

  snapshot(): { events: readonly LogEvent[] } {
    return { events: this.events.slice() };
  }

  clear(): void {
    this.events = [];
    this.bytes = 0;
  }

  getState(): LogStateSnapshot {
    return { ...this.state, eventCount: this.events.length, bufferBytes: this.bytes };
  }

  setState(next: Partial<LogState>): LogStateSnapshot {
    const before = this.state.enabled;
    const merged: LogState = {
      enabled: next.enabled ?? this.state.enabled,
      includeChatData: next.includeChatData ?? this.state.includeChatData,
      level: isLogThreshold(next.level) ? next.level : this.state.level,
    };
    this.state = merged;
    if (!this.state.enabled && before) this.clear();
    return this.getState();
  }
}

export const logStore = new LogStore();

function approxBytes(ev: LogEvent): number {
  return ev.message.length + ev.category.length + 32;
}

const REDACT_PATTERNS: readonly { re: RegExp; to: string }[] = [
  { re: /Bearer\s+[A-Za-z0-9\-_.~+/]+=*/gi, to: 'Bearer [REDACTED]' },
  { re: /\bsk-[A-Za-z0-9_-]{20,}/g, to: 'sk-[REDACTED]' },
  { re: /\b(api[_-]?key|secret|password|token)\s*[=:]\s*[^\s,;}]+/gi, to: '$1=[REDACTED]' },
  { re: /\b(content|content_preview|message|message_preview|text|text_preview|raw|raw_preview|template|prompt|response|reply)\s*=\s*"[^"]*"/gi, to: '$1="[REDACTED]"' },
  { re: /\b(content|content_preview|message|message_preview|text|text_preview|raw|raw_preview|template|prompt|response|reply)\s*=\s*'[^']*'/gi, to: "$1='[REDACTED]'" },
  { re: /"[^"\n]{80,}"/g, to: '"[CONTENT_REDACTED]"' },
  { re: /'[^'\n]{80,}'/g, to: "'[CONTENT_REDACTED]'" },
];

export function redact(input: string): string {
  let out = input;
  for (const { re, to } of REDACT_PATTERNS) out = out.replace(re, to);
  return out;
}

interface StorageGetJson {
  getJson<T>(path: string, opts?: { fallback?: T; userId?: string | undefined }): Promise<T>;
}
interface StorageSetJson {
  setJson(path: string, value: unknown, opts?: { userId?: string | undefined }): Promise<void>;
}

interface PersistedShape {
  enabled?: boolean;
  includeChatData?: boolean;
  level?: LogThreshold;
}

export async function loadPersistedLogState(storage: StorageGetJson, userId: string): Promise<void> {
  try {
    const fallback: PersistedShape = { enabled: false, includeChatData: false, level: DEFAULT_LOG_LEVEL };
    const got = await storage.getJson<PersistedShape>(STATE_STORAGE_KEY, { fallback, userId });
    logStore.setState({
      enabled: got.enabled === true,
      includeChatData: got.includeChatData === true,
      level: isLogThreshold(got.level) ? got.level : DEFAULT_LOG_LEVEL,
    });
  } catch { /* keep defaults */ }
}

export async function persistLogState(storage: StorageSetJson, userId: string): Promise<void> {
  try {
    const s = logStore.getState();
    const payload: PersistedShape = { enabled: s.enabled, includeChatData: s.includeChatData, level: s.level };
    await storage.setJson(STATE_STORAGE_KEY, payload, { userId });
  } catch { /* swallow */ }
}
