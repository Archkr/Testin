// Routes to spindle.log when available, console as fallback.
// Errors always emit; info/warn gate on logStore.isEnabled().
// Both flow into the in-memory log store for export.

import { logStore, type LogLevel } from '../log/store.js';

type LogFn = (msg: string) => void;

export interface SafeLogger {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

interface SpindleLogShape {
  log?: Partial<Record<'info' | 'warn' | 'error', LogFn>>;
}

function getSpindle(): SpindleLogShape | undefined {
  try { return (globalThis as { spindle?: SpindleLogShape }).spindle; } catch { return undefined; }
}

function consoleFor(level: 'info' | 'warn' | 'error'): LogFn {
  if (level === 'error') return (m) => { try { console.error(m); } catch { /* */ } };
  if (level === 'warn')  return (m) => { try { console.warn(m); }  catch { /* */ } };
  return (m) => { try { console.log(m); } catch { /* */ } };
}

export function makeSafeLogger(prefix: string): SafeLogger {
  function emit(level: 'info' | 'warn' | 'error', msg: string): void {
    const line = `[lumirealm] ${prefix}: ${msg}`;
    const enabled = logStore.isEnabled();
    if (level === 'error' || enabled) {
      const sp = getSpindle();
      const fn = sp?.log?.[level];
      if (fn) {
        try { fn(line); } catch { consoleFor(level)(line); }
      } else {
        consoleFor(level)(line);
      }
    }
    logStore.push(level as LogLevel, prefix, msg);
  }
  return {
    info:  (m) => emit('info',  m),
    warn:  (m) => emit('warn',  m),
    error: (m) => emit('error', m),
  };
}
