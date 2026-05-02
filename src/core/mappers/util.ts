export function splitKeywords(s: string | null | undefined): string[] {
  if (s == null || s.length === 0) return [];
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i <= s.length; i++) {
    if (i === s.length || s[i] === "," || s[i] === ";") {
      const seg = trim(s.slice(start, i));
      if (seg.length > 0) out.push(seg);
      start = i + 1;
    }
  }
  return out;
}

function trim(s: string): string {
  let a = 0;
  let b = s.length;
  while (a < b && isSpace(s.charCodeAt(a))) a++;
  while (b > a && isSpace(s.charCodeAt(b - 1))) b--;
  return s.slice(a, b);
}

function isSpace(c: number): boolean {
  return c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d || c === 0x0b || c === 0x0c || c === 0xa0;
}

export function newUuid(): string {
  return crypto.randomUUID();
}

export function nowMs(): number {
  return Date.now();
}
