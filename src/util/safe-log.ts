import { logStore, type LogLevel } from '../log/store.js';

type LogFn = (msg: string) => void;

export interface SafeLogger {
  error: LogFn;
  warn: LogFn;
  info: LogFn;
  debug: LogFn;
  trace: LogFn;
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

function spindleChannel(level: LogLevel): 'info' | 'warn' | 'error' {
  if (level === 'error') return 'error';
  if (level === 'warn')  return 'warn';
  return 'info';
}

export function makeSafeLogger(prefix: string): SafeLogger {
  function emit(level: LogLevel, msg: string): void {
    const line = `[lumirealm] ${prefix}: ${msg}`;
    const consoleEmit = level === 'error' || logStore.shouldEmit(level);
    if (consoleEmit) {
      const ch = spindleChannel(level);
      const sp = getSpindle();
      const fn = sp?.log?.[ch];
      if (fn) {
        try { fn(line); } catch { consoleFor(ch)(line); }
      } else {
        consoleFor(ch)(line);
      }
    }
    logStore.push(level, prefix, msg);
  }
  return {
    error: (m) => emit('error', m),
    warn:  (m) => emit('warn',  m),
    info:  (m) => emit('info',  m),
    debug: (m) => emit('debug', m),
    trace: (m) => emit('trace', m),
  };
}
