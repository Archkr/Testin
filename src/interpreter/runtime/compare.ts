// Risu triggers.ts.

import { toStr } from '../../util/coerce.js';

export function compareValues(a: unknown, b: unknown, op: string): boolean {
  const as = toStr(a);
  const bs = toStr(b);
  switch (op) {
    case '=':
    case '==':
      return as === bs;
    case '!=':
    case '≠':
      return as !== bs;
    case '>':
      return Number(a) > Number(b);
    case '<':
      return Number(a) < Number(b);
    case '>=':
    case '≥':
      return Number(a) >= Number(b);
    case '<=':
    case '≤':
      return Number(a) <= Number(b);
    case 'null':
      return as === '' || as === 'null' || as === 'undefined' || a === null || a === undefined;
    case 'true':
    case 'truthy':
      return as !== '' && as !== '0' && as !== 'false' && as !== 'null' && as !== 'undefined';
    case 'contains':
    case '∋':
      try { return (JSON.parse(as) as unknown[]).includes(bs); } catch { return false; }
    case 'notcontains':
    case '∌':
      try { return !(JSON.parse(as) as unknown[]).includes(bs); } catch { return true; }
    case 'in':
    case '∈':
      try { return (JSON.parse(bs) as unknown[]).includes(as); } catch { return false; }
    case 'notin':
    case '∉':
      try { return !(JSON.parse(bs) as unknown[]).includes(as); } catch { return true; }
    case 'approx':
    case '≒': {
      const n1 = Number(as), n2 = Number(bs);
      if (Number.isNaN(n1) || Number.isNaN(n2)) return as.toLowerCase().replace(/ /g, '') === bs.toLowerCase().replace(/ /g, '');
      return Math.abs(n1 - n2) < 0.0001;
    }
    default:
      return as === bs;
  }
}
