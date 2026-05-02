// Lorebook read/write helpers. Preloaded at runtime construction; mutations kept in sync.

import { toStr } from '../../util/coerce.js';
import type { HostApi, HostWorldInfoEntry } from '../host.js';

export interface LorebookCache {
  entries: (HostWorldInfoEntry & { worldBookId?: string })[];
  primaryBookId: string | null;
}

export interface LorebookApi {
  getLorebookCount(): number;
  getLorebookEntry(index: unknown): string;
  getLorebookByIndex(index: unknown): string;
  getLorebookByKey(target: unknown): string;
  getLorebookIndexViaName(name: unknown): number;
  getAllLorebooks(): string[];
  getLorebookByName(name: unknown): number[];
  modifyLorebook(target: unknown, value: unknown): Promise<void>;
  modifyLorebookByIndex(index: unknown, name: unknown, key: unknown, content: unknown, order: unknown): Promise<void>;
  createLorebook(name: unknown, key: unknown, content: unknown, order: unknown): Promise<void>;
  deleteLorebookByIndex(index: unknown): Promise<void>;
  setLorebookActivation(index: unknown, value: boolean): Promise<void>;
  setLorebookAlwaysActive(index: unknown, value: boolean): Promise<void>;
}

function keyToArray(k: unknown): string[] {
  if (Array.isArray(k)) return k.map(toStr).filter(Boolean);
  const s = toStr(k);
  return s ? s.split(',').map((p) => p.trim()).filter(Boolean) : [];
}

export function makeLorebookApi(api: HostApi, lorebook: LorebookCache): LorebookApi {
  return {
    getLorebookCount(): number { return lorebook.entries.length; },

    getLorebookEntry(index: unknown): string {
      const e = lorebook.entries[Number(index)];
      return e ? toStr(e.content) : '';
    },
    getLorebookByIndex(index: unknown): string {
      const e = lorebook.entries[Number(index)];
      return e ? toStr(e.content) : '';
    },

    getLorebookByKey(target: unknown): string {
      const needle = toStr(target).toLowerCase();
      for (const e of lorebook.entries) {
        const keys = keyToArray(e.key);
        if (keys.some((k) => k.toLowerCase() === needle)) return toStr(e.content);
      }
      return '';
    },

    getLorebookIndexViaName(name: unknown): number {
      const needle = toStr(name);
      for (let i = 0; i < lorebook.entries.length; i++) {
        if (toStr(lorebook.entries[i]!.comment) === needle) return i;
      }
      return -1;
    },

    getAllLorebooks(): string[] {
      return lorebook.entries.map((e) => toStr(e.comment));
    },

    getLorebookByName(name: unknown): number[] {
      const needle = toStr(name);
      const out: number[] = [];
      for (let i = 0; i < lorebook.entries.length; i++) {
        if (toStr(lorebook.entries[i]!.comment) === needle) out.push(i);
      }
      return out;
    },

    async modifyLorebook(target: unknown, value: unknown): Promise<void> {
      if (!api.worldInfo?.entries) return;
      const needle = toStr(target).toLowerCase();
      for (let i = 0; i < lorebook.entries.length; i++) {
        const e = lorebook.entries[i]!;
        const keys = keyToArray(e.key);
        if (keys.some((k) => k.toLowerCase() === needle)) {
          try {
            const updated = await api.worldInfo.entries.update(e.id, {
              key: keys, content: toStr(value), comment: toStr(e.comment),
            });
            lorebook.entries[i] = { ...e, ...updated };
          } catch { /* */ }
          return;
        }
      }
    },

    async modifyLorebookByIndex(index: unknown, name: unknown, key: unknown, content: unknown, order: unknown): Promise<void> {
      const e = lorebook.entries[Number(index)];
      if (!e || !api.worldInfo?.entries) return;
      try {
        const updated = await api.worldInfo.entries.update(e.id, {
          comment: toStr(name), key: keyToArray(key), content: toStr(content), orderValue: Number(order) || 0,
        });
        lorebook.entries[Number(index)] = { ...e, ...updated };
      } catch { /* */ }
    },

    async createLorebook(name: unknown, key: unknown, content: unknown, order: unknown): Promise<void> {
      if (!lorebook.primaryBookId || !api.worldInfo?.entries) return;
      try {
        const created = await api.worldInfo.entries.create(lorebook.primaryBookId, {
          comment: toStr(name), key: keyToArray(key), content: toStr(content), orderValue: Number(order) || 0,
        });
        lorebook.entries.push({ ...created, worldBookId: lorebook.primaryBookId });
        lorebook.entries.sort((a, b) => Number(b.orderValue || 0) - Number(a.orderValue || 0));
      } catch { /* */ }
    },

    async deleteLorebookByIndex(index: unknown): Promise<void> {
      const e = lorebook.entries[Number(index)];
      if (!e || !api.worldInfo?.entries) return;
      try {
        await api.worldInfo.entries.delete(e.id);
        lorebook.entries.splice(Number(index), 1);
      } catch { /* */ }
    },

    async setLorebookActivation(index: unknown, value: boolean): Promise<void> {
      const e = lorebook.entries[Number(index)];
      if (!e || !api.worldInfo?.entries) return;
      try {
        const updated = await api.worldInfo.entries.update(e.id, {
          key: keyToArray(e.key), content: toStr(e.content), comment: toStr(e.comment), disabled: !value,
        });
        lorebook.entries[Number(index)] = { ...e, ...updated };
      } catch { /* */ }
    },

    async setLorebookAlwaysActive(index: unknown, value: boolean): Promise<void> {
      const e = lorebook.entries[Number(index)];
      if (!e || !api.worldInfo?.entries) return;
      try {
        const updated = await api.worldInfo.entries.update(e.id, {
          key: keyToArray(e.key), content: toStr(e.content), comment: toStr(e.comment), constant: !!value,
        });
        lorebook.entries[Number(index)] = { ...e, ...updated };
      } catch { /* */ }
    },
  };
}
