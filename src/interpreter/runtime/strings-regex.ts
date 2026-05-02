// Pure string, regex, and arithmetic helpers.

import { toStr } from '../../util/coerce.js';
import { applyMatchTemplate } from './match-template.js';
import { calcString } from './calc.js';

export function extractRegex(value: unknown, regex: unknown, flags: unknown, result: unknown): string {
  try {
    const m = toStr(value).match(new RegExp(toStr(regex), toStr(flags)));
    return m ? applyMatchTemplate(toStr(result), m) : '';
  } catch { return ''; }
}

export function regexTest(value: unknown, regex: unknown, flags: unknown): boolean {
  try { return new RegExp(toStr(regex), toStr(flags)).test(toStr(value)); }
  catch { return false; }
}

export function replaceString(
  source: unknown, regex: unknown, result: unknown, replacement: unknown, flags: unknown,
): string {
  try {
    const reg = new RegExp(toStr(regex), toStr(flags));
    const str = toStr(source);
    return str.replace(reg, (m) => applyMatchTemplate(
      toStr(replacement) || toStr(result),
      [m] as unknown as RegExpMatchArray,
    ));
  } catch { return toStr(source); }
}

export function random(min: unknown, max: unknown): number {
  const a = Number(min) || 0;
  const b = Number(max) || 0;
  if (a === b) return a;
  return Math.floor(a + Math.random() * (b - a + 1));
}

export function setCharAt(source: unknown, index: unknown, value: unknown): string {
  const s = toStr(source);
  const i = Number(index) || 0;
  const v = toStr(value);
  if (i < 0 || i >= s.length) return s;
  return s.slice(0, i) + v + s.slice(i + 1);
}

export function calculate(expr: unknown): string { return calcString(toStr(expr)); }

export function splitString(source: unknown, delimiter: unknown, kind?: string): readonly string[] {
  const d = kind === 'regex' ? new RegExp(toStr(delimiter)) : toStr(delimiter);
  return toStr(source).split(d);
}
