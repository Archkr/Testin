// Deprecated `{#if cond\nbody#}` block form (Risu parity).

export function legacyBlockMatcher(p1: string): string | null {
  const bn = p1.indexOf("\n");
  if (bn === -1) return null;

  const logic = p1.substring(0, bn);
  const content = p1.substring(bn + 1);
  const statement = logic.split(" ", 2);

  if (statement[0] === "if") {
    if (["", "0", "-1"].includes(statement[1] ?? "")) return "";
    return content.trim();
  }
  return null;
}
