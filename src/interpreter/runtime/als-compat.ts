import { AsyncLocalStorage } from 'node:async_hooks';

export function createAls<T>(): AsyncLocalStorage<T> {
  if (typeof AsyncLocalStorage === 'function') return new AsyncLocalStorage<T>();
  const shim = {
    getStore: (): T | undefined => undefined,
    run: <R>(_store: T, fn: (...args: unknown[]) => R, ...args: unknown[]): R => fn(...args),
    enterWith: (_store: T): void => undefined,
    disable: (): void => undefined,
    exit: <R>(fn: (...args: unknown[]) => R, ...args: unknown[]): R => fn(...args),
  };
  return shim as unknown as AsyncLocalStorage<T>;
}
