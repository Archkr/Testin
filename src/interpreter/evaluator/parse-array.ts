// Risu parser.svelte.ts

export function parseArray(p1: string): unknown[] {
  try {
    const arr = JSON.parse(p1);
    if (Array.isArray(arr)) return arr;
    return p1.split("§");
  } catch {
    return p1.split("§");
  }
}

export function parseDict(p1: string): Record<string, unknown> {
  try {
    const v = JSON.parse(p1);
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}
