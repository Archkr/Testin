// Async-context-pinned alternatives to module-global mutable state, so
// concurrent dispatches for different users do not clobber each other.

import { AsyncLocalStorage } from 'node:async_hooks';

export const userIdAls = new AsyncLocalStorage<string>();

export function currentUserId(): string | null {
  return userIdAls.getStore() ?? null;
}

export const inheritedVarsAls = new AsyncLocalStorage<Record<string, string>>();

export function withUserId<T>(userId: string, fn: () => Promise<T> | T): Promise<T> | T {
  return userIdAls.run(userId, fn) as Promise<T> | T;
}

export function withInheritedVarsCache<T>(
  varsCache: Record<string, string>,
  fn: () => Promise<T> | T,
): Promise<T> | T {
  return inheritedVarsAls.run(varsCache, fn) as Promise<T> | T;
}
