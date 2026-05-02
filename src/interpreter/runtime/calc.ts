// Risu process/infunctions.ts calcString. Pratt parser.
// Lumi commit a474ef5 freezes Function so new Function() is blocked; we parse instead.
// Operators: + - * / % ** (JS-style, ** right-associative). Returns finite string or 'NaN'.

type BinOp = '+' | '-' | '*' | '/' | '%' | '**';
type Token =
  | { readonly kind: 'num'; readonly value: number }
  | { readonly kind: 'op'; readonly op: BinOp | '(' | ')' };

const PRECEDENCE: Readonly<Record<BinOp, number>> = {
  '+': 1, '-': 1,
  '*': 2, '/': 2, '%': 2,
  '**': 3,
};
// Unary +/- bind tighter than ** so -2**3 === -8.
const UNARY_PREC = 4;
const RIGHT_ASSOC: Readonly<Record<string, true>> = { '**': true };

function tokenize(s: string): Token[] | null {
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
    if (c === '+' || c === '-' || c === '/' || c === '%' || c === '(' || c === ')') {
      out.push({ kind: 'op', op: c }); i++; continue;
    }
    if (c === '*') {
      if (s[i + 1] === '*') { out.push({ kind: 'op', op: '**' }); i += 2; continue; }
      out.push({ kind: 'op', op: '*' }); i++; continue;
    }
    if ((c >= '0' && c <= '9') || c === '.') {
      let j = i;
      let dots = 0;
      while (j < s.length) {
        const cj = s[j]!;
        if (cj >= '0' && cj <= '9') { j++; continue; }
        if (cj === '.') { dots++; if (dots > 1) return null; j++; continue; }
        break;
      }
      const numStr = s.substring(i, j);
      if (numStr === '.') return null;
      const n = Number(numStr);
      if (!Number.isFinite(n)) return null;
      out.push({ kind: 'num', value: n });
      i = j; continue;
    }
    return null;
  }
  return out;
}

interface ParseState { i: number }

function parsePrefix(tokens: readonly Token[], st: ParseState): number {
  if (st.i >= tokens.length) throw new Error('end-of-input');
  const t = tokens[st.i]!;
  if (t.kind === 'num') { st.i++; return t.value; }
  if (t.op === '+') { st.i++; return parseExpr(tokens, UNARY_PREC, st); }
  if (t.op === '-') { st.i++; return -parseExpr(tokens, UNARY_PREC, st); }
  if (t.op === '(') {
    st.i++;
    const v = parseExpr(tokens, 0, st);
    const close = tokens[st.i];
    if (!close || close.kind !== 'op' || close.op !== ')') throw new Error('missing-rparen');
    st.i++;
    return v;
  }
  throw new Error('unexpected');
}

function parseExpr(tokens: readonly Token[], minPrec: number, st: ParseState): number {
  let lhs = parsePrefix(tokens, st);
  while (st.i < tokens.length) {
    const t = tokens[st.i]!;
    if (t.kind !== 'op' || t.op === '(' || t.op === ')') break;
    const op = t.op;
    const prec = PRECEDENCE[op];
    if (prec < minPrec) break;
    st.i++;
    const rhs = parseExpr(tokens, RIGHT_ASSOC[op] ? prec : prec + 1, st);
    switch (op) {
      case '+': lhs = lhs + rhs; break;
      case '-': lhs = lhs - rhs; break;
      case '*': lhs = lhs * rhs; break;
      case '/': lhs = lhs / rhs; break;
      case '%': lhs = lhs % rhs; break;
      case '**': lhs = lhs ** rhs; break;
    }
  }
  return lhs;
}

export function calcString(expr: unknown): string {
  const s = String(expr ?? '');
  if (s.length === 0) return 'NaN';
  const tokens = tokenize(s);
  if (!tokens || tokens.length === 0) return 'NaN';
  try {
    const st: ParseState = { i: 0 };
    const r = parseExpr(tokens, 0, st);
    if (st.i !== tokens.length) return 'NaN';
    return Number.isFinite(r) ? String(r) : 'NaN';
  } catch {
    return 'NaN';
  }
}
