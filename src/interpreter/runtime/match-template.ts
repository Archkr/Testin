// Risu match-template substitution ($0..$99, $&, $<name>) mirroring
// ECMAScript GetSubstitution. `$NN` maps to capture NN when NN is in range,
// else degrades to `$N` + literal second digit (needed for 10+ capture groups).

export function applyMatchTemplate(template: string, match: RegExpMatchArray | null): string {
  if (!match) return template;
  let out = '';
  for (let i = 0; i < template.length; i++) {
    const c = template[i]!;
    if (c !== '$') { out += c; continue; }
    const next = template[i + 1];
    if (next === '&') { out += match[0] ?? ''; i++; continue; }
    if (next === '$') { out += '$'; i++; continue; }
    if (next !== undefined && next >= '0' && next <= '9') {
      // Greedy two-digit reference: valid when twoDigit <= capture count.
      const next2 = template[i + 2];
      if (next2 !== undefined && next2 >= '0' && next2 <= '9') {
        const twoDigit = Number(next + next2);
        if (twoDigit >= 1 && twoDigit <= match.length - 1) {
          out += match[twoDigit] ?? '';
          i += 2;
          continue;
        }
      }
      const idx = Number(next);
      out += match[idx] ?? '';
      i++;
      continue;
    }
    if (next === '<') {
      const close = template.indexOf('>', i + 2);
      if (close > 0 && match.groups) {
        const name = template.slice(i + 2, close);
        out += match.groups[name] ?? '';
        i = close;
        continue;
      }
    }
    out += c;
  }
  return out;
}
