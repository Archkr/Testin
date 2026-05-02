// Risu triggers.ts. In-memory scriptstate; loaded at dispatch entry, flushed at exit.
// User var keys are $-prefixed (triggers.ts).

export const RISU_SCRIPTSTATE_KEY = 'risu_scriptstate';

export const RESERVED_KEYS = {
  authorNote: '__risu_author_note__',
  globalNote: '__risu_global_note__',
  charDesc: '__risu_char_desc__',
} as const;

export class ScriptstateCache {
  #data: Record<string, string>;
  #dirty = false;

  constructor(initial: Readonly<Record<string, string>>) {
    this.#data = { ...initial };
  }

  get(key: string): string {
    return this.#data[key] ?? '';
  }

  has(key: string): boolean {
    return Object.hasOwn(this.#data, key);
  }

  set(key: string, value: string): void {
    if (this.#data[key] === value) return;
    this.#data[key] = value;
    this.#dirty = true;
  }

  delete(key: string): void {
    if (!Object.hasOwn(this.#data, key)) return;
    delete this.#data[key];
    this.#dirty = true;
  }

  keys(): string[] {
    return Object.keys(this.#data);
  }

  get dirty(): boolean {
    return this.#dirty;
  }

  snapshot(): Record<string, string> {
    return { ...this.#data };
  }

  markClean(): void {
    this.#dirty = false;
  }
}
