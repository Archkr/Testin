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
      return as.indexOf(bs) >= 0;
    case 'notcontains':
    case '∌':
      return as.indexOf(bs) < 0;
    case 'in':
    case '∈':
      return bs.indexOf(as) >= 0;
    case 'notin':
    case '∉':
      return bs.indexOf(as) < 0;
    case 'approx':
    case '≒':
      return as.toLowerCase() === bs.toLowerCase();
    default:
      return as === bs;
  }
}
