// Risu triggers.ts+ array/dict opcodes.
// Storage: __risuArr__<name> / __risuDict__<name> as JSON in varsCache.

import { toStr } from '../../util/coerce.js';
import type { VarsApi } from './vars.js';

export interface ArraysDictsApi {
  makeArrayVar(name: string): void;
  arrayLength(name: string): number;
  arrayGet(name: string, i: unknown): string;
  arraySet(name: string, i: unknown, v: unknown): void;
  arrayPush(name: string, v: unknown): void;
  arrayPop(name: string): string;
  arrayShift(name: string): string;
  arrayUnshift(name: string, v: unknown): void;
  arraySplice(name: string, start: unknown, item: unknown): void;
  arraySlice(name: string, start: unknown, end: unknown): string;
  arrayJoin(name: string, delim: unknown): string;
  arrayIndexOf(name: string, v: unknown): number;
  arrayRemoveIndex(name: string, i: unknown): void;
  makeDictVar(name: string): void;
  dictGet(name: string, k: unknown): string;
  dictSet(name: string, k: unknown, v: unknown): void;
  dictDelete(name: string, k: unknown): void;
  dictHasKey(name: string, k: unknown): boolean;
  dictClear(name: string): void;
  dictSize(name: string): number;
  dictKeys(name: string): string[];
  dictValues(name: string): unknown[];
}

export function makeArraysDictsApi(vars: VarsApi): ArraysDictsApi {
  function readArray(name: string): unknown[] {
    const raw = vars.getVar('__risuArr__' + name);
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  }
  function writeArray(name: string, arr: unknown[]): void {
    vars.setVar('__risuArr__' + name, JSON.stringify(arr));
  }
  function readDict(name: string): Record<string, unknown> {
    const raw = vars.getVar('__risuDict__' + name);
    try {
      const v = JSON.parse(raw);
      return v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
    } catch { return {}; }
  }
  function writeDict(name: string, dict: Record<string, unknown>): void {
    vars.setVar('__risuDict__' + name, JSON.stringify(dict));
  }

  return {
    makeArrayVar:    (name) => writeArray(name, []),
    arrayLength:     (name) => readArray(name).length,
    arrayGet:        (name, i) => toStr(readArray(name)[Number(i)] ?? ''),
    arraySet:        (name, i, v) => { const a = readArray(name); a[Number(i)] = toStr(v); writeArray(name, a); },
    arrayPush:       (name, v) => { const a = readArray(name); a.push(toStr(v)); writeArray(name, a); },
    arrayPop:        (name) => { const a = readArray(name); const r = a.pop(); writeArray(name, a); return toStr(r ?? ''); },
    arrayShift:      (name) => { const a = readArray(name); const r = a.shift(); writeArray(name, a); return toStr(r ?? ''); },
    arrayUnshift:    (name, v) => { const a = readArray(name); a.unshift(toStr(v)); writeArray(name, a); },
    arraySplice:     (name, start, item) => { const a = readArray(name); a.splice(Number(start), 0, toStr(item)); writeArray(name, a); },
    arraySlice:      (name, start, end) => readArray(name).slice(Number(start), Number(end)).join(','),
    arrayJoin:       (name, delim) => readArray(name).join(toStr(delim)),
    arrayIndexOf:    (name, v) => readArray(name).indexOf(toStr(v)),
    arrayRemoveIndex:(name, i) => { const a = readArray(name); a.splice(Number(i), 1); writeArray(name, a); },

    makeDictVar:     (name) => writeDict(name, {}),
    dictGet:         (name, k) => toStr(readDict(name)[toStr(k)] ?? ''),
    dictSet:         (name, k, v) => { const d = readDict(name); d[toStr(k)] = toStr(v); writeDict(name, d); },
    dictDelete:      (name, k) => { const d = readDict(name); delete d[toStr(k)]; writeDict(name, d); },
    dictHasKey:      (name, k) => Object.prototype.hasOwnProperty.call(readDict(name), toStr(k)),
    dictClear:       (name) => writeDict(name, {}),
    dictSize:        (name) => Object.keys(readDict(name)).length,
    dictKeys:        (name) => Object.keys(readDict(name)),
    dictValues:      (name) => Object.values(readDict(name)),
  };
}
