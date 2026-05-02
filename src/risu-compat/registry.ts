import type { MacroHandler } from "../core/cbs/index.js";

export interface HandlerRegistration {
  readonly name: string;
  readonly handler: MacroHandler;
  readonly description: string;
  readonly category: string;
  readonly scoped: boolean;
}

export class HandlerRegistry {
  private readonly byName = new Map<string, HandlerRegistration>();

  register(reg: HandlerRegistration): void {
    if (this.byName.has(reg.name)) {
      throw new Error(
        `risu-compat: duplicate handler registration for "${reg.name}". ` +
        `Each macro may be registered by exactly one module.`,
      );
    }
    this.byName.set(reg.name, reg);
  }

  get(name: string): HandlerRegistration | null {
    return this.byName.get(name) ?? null;
  }

  entries(): readonly HandlerRegistration[] {
    return Array.from(this.byName.values());
  }

  /** Count of registered handlers. */
  size(): number {
    return this.byName.size;
  }
}

/** Singleton registry. Construct a fresh instance in tests to avoid cross-test contamination. */
export const registry = new HandlerRegistry();
