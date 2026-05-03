// Lumi-native macro mirrors for names not already claimed by risu-compat handlers.

import type { MacroHandler } from "./types.js";

type RegisterFn = (name: string, handler: MacroHandler, scoped: boolean) => void;

function parseUTCOffset(s: string): number | null {
  // Matches Lumi temporal.ts parseUTCOffset (grep for it if nuance drifts).
  const m = /^UTC\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/i.exec(s.trim());
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  const h = parseInt(m[2]!, 10);
  const mm = m[3] ? parseInt(m[3]!, 10) : 0;
  return sign * (h + mm / 60);
}

export function registerBuiltins(register: RegisterFn): void {
  register("bot", (ctx) => ctx.identity.charName, false);

  register("newline", () => "\n", false);
  register("nl", () => "\n", false);
  register("n", () => "\n", false);
  register("space", () => " ", false);
  register("noop", () => "", false);
  register("//", () => "", false);
  register("comment", () => "", false);
  register("note", () => "", false);

  // trim/reverse covered by risu-compat handlers.
  register("upper", (_ctx, a) => (a[0] ?? "").toUpperCase(), false);
  register("uppercase", (_ctx, a) => (a[0] ?? "").toUpperCase(), false);
  register("toupper", (_ctx, a) => (a[0] ?? "").toUpperCase(), false);
  register("lower", (_ctx, a) => (a[0] ?? "").toLowerCase(), false);
  register("lowercase", (_ctx, a) => (a[0] ?? "").toLowerCase(), false);
  register("tolower", (_ctx, a) => (a[0] ?? "").toLowerCase(), false);

  register("random", (ctx, a) => {
    if (a.length === 0) return String(Math.round(ctx.rng.random()));
    const allNumeric = a.length <= 2 && a.every((x) => x.trim() !== "" && !isNaN(Number(x)));
    if (allNumeric) {
      const min = parseInt(a[0] ?? "", 10) || 0;
      const max = parseInt(a[1] ?? "", 10) || 1;
      if (max < min) return String(min);
      return String(Math.floor(ctx.rng.random() * (max - min + 1)) + min);
    }
    const idx = Math.floor(ctx.rng.random() * a.length);
    return a[idx] ?? "";
  }, false);
  register("roll", (ctx, a) => {
    const notation = a[0] ?? "1d6";
    const match = /^(\d+)d(\d+)$/i.exec(notation);
    if (!match) return "0";
    const count = Math.min(parseInt(match[1]!, 10), 100);
    const sides = parseInt(match[2]!, 10);
    if (sides < 1 || count < 1) return "0";
    let total = 0;
    for (let i = 0; i < count; i++) total += Math.floor(ctx.rng.random() * sides) + 1;
    return String(total);
  }, false);

  register("time", (ctx, a) => {
    const offset = a[0];
    const now = new Date(ctx.clock.now());
    if (offset) {
      const parsed = parseUTCOffset(offset);
      if (parsed !== null) {
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const shifted = new Date(utc + parsed * 3600000);
        return shifted.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      }
    }
    return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  }, false);

  register("jailbreak", (ctx) => ctx.character.jailbreakPrompt ?? "", false);
  register("charjailbreak", (ctx) => ctx.character.jailbreakPrompt ?? "", false);
}
