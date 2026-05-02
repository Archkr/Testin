import type { MacroHandler } from "../../core/cbs/index.js";
import { registry } from "../registry.js";

// Structural block handlers: `risu_if`, `risu_when`, `risu_unknown`.
// Emitted as Lumiverse SCOPED macros. Inner macros including {{else}} are pre-evaluated.
// Side effects in a false branch DO fire in Lumiverse; known deviation from Risu.

// Lumiverse src/macros/definitions/primitives.ts.
const ELSE_MARKER = "\x00ELSE_MARKER\x00";

function splitOnElse(body: string): { truthy: string; falsy: string } {
  const idx = body.indexOf(ELSE_MARKER);
  if (idx < 0) return { truthy: body, falsy: "" };
  return { truthy: body.substring(0, idx), falsy: body.substring(idx + ELSE_MARKER.length) };
}

// Risu strips whitespace on scoped-macro args; Lumi does not.
// Trimming before truthiness check prevents catastrophic zero-width-regex blowup.
const isTruthy = (s: string): boolean => {
  const t = s.trim();
  return t === "true" || t === "1";
};

// parser.svelte.ts. Stack-based evaluator, pops from the right.
interface WhenResult { truthy: boolean; mode: "normal" | "keep" | "legacy" }
function evaluateWhen(statement: string[], readVar: (name: string) => string, readToggle: (name: string) => string): WhenResult {
  const stack = [...statement];
  let mode: WhenResult["mode"] = "normal";
  while (stack.length > 1) {
    const condition = stack.pop()!;
    const operator = stack.pop()!;
    switch (operator) {
      case "not": stack.push(isTruthy(condition) ? "0" : "1"); break;
      case "keep": mode = "keep"; stack.push(condition); break;
      case "legacy": mode = "legacy"; stack.push(condition); break;
      case "and": {
        const c2 = stack.pop()!;
        stack.push(isTruthy(condition) && isTruthy(c2) ? "1" : "0");
        break;
      }
      case "or": {
        const c2 = stack.pop()!;
        stack.push(isTruthy(condition) || isTruthy(c2) ? "1" : "0");
        break;
      }
      case "is": {
        const c2 = stack.pop()!;
        stack.push(condition === c2 ? "1" : "0");
        break;
      }
      case "isnot": {
        const c2 = stack.pop()!;
        stack.push(condition !== c2 ? "1" : "0");
        break;
      }
      case "var": {
        stack.push(isTruthy(readVar(condition)) ? "1" : "0");
        break;
      }
      case "toggle": {
        stack.push(isTruthy(readToggle(condition)) ? "1" : "0");
        break;
      }
      case "vis": {
        const name = stack.pop()!;
        stack.push(readVar(name) === condition ? "1" : "0");
        break;
      }
      case "visnot": {
        const name = stack.pop()!;
        stack.push(readVar(name) !== condition ? "1" : "0");
        break;
      }
      case "tis": {
        const name = stack.pop()!;
        stack.push(readToggle(name) === condition ? "1" : "0");
        break;
      }
      case "tisnot": {
        const name = stack.pop()!;
        stack.push(readToggle(name) !== condition ? "1" : "0");
        break;
      }
      case ">": {
        const c2 = stack.pop()!;
        stack.push(parseFloat(c2) > parseFloat(condition) ? "1" : "0");
        break;
      }
      case "<": {
        const c2 = stack.pop()!;
        stack.push(parseFloat(c2) < parseFloat(condition) ? "1" : "0");
        break;
      }
      case ">=": {
        const c2 = stack.pop()!;
        stack.push(parseFloat(c2) >= parseFloat(condition) ? "1" : "0");
        break;
      }
      case "<=": {
        const c2 = stack.pop()!;
        stack.push(parseFloat(c2) <= parseFloat(condition) ? "1" : "0");
        break;
      }
      default:
        stack.push(isTruthy(condition) ? "1" : "0");
    }
  }
  return { truthy: isTruthy(stack[0] ?? "0"), mode };
}

// parser.svelte.ts, 1425-1426. args=[cond, body].
export const ifHandler: MacroHandler = (_ctx, args) => {
  if (args.length < 1) return "";
  const cond = args[0]!;
  const body = args.length >= 2 ? args[args.length - 1]! : "";
  const branches = splitOnElse(body);
  return isTruthy(cond) ? trimLines(branches.truthy) : trimLines(branches.falsy);
};

registry.register({
  name: "risu_if",
  handler: ifHandler,
  description: "Conditional block. Returns body if the condition argument is truthy ('1' or 'true'), else empty (or the {{else}} branch).",
  category: "Risu / Control",
  scoped: true,
});

// parser.svelte.ts.
export const whenHandler: MacroHandler = (ctx, args) => {
  if (args.length < 1) return "";
  const body = args[args.length - 1]!;
  const statement = args.slice(0, -1);
  const readVar = (name: string): string => ctx.vars.get("local", name);
  const readToggle = (name: string): string => ctx.vars.get("global", "toggle_" + name);
  // Single-arg form: just a bare condition, no operators.
  if (statement.length <= 1) {
    const state = statement[0] ?? "";
    const branches = splitOnElse(body);
    return isTruthy(state) ? branches.truthy : branches.falsy;
  }
  const result = evaluateWhen(statement, readVar, readToggle);
  const branches = splitOnElse(body);
  if (result.truthy) {
    // keep: preserve whitespace. legacy: trim like deprecated #if. normal: trimLines.
    if (result.mode === "keep") return branches.truthy;
    if (result.mode === "legacy") return branches.truthy;
    return trimLines(branches.truthy);
  }
  if (result.mode === "keep") return branches.falsy;
  if (result.mode === "legacy") return branches.falsy;
  return trimLines(branches.falsy);
};

registry.register({
  name: "risu_when",
  handler: whenHandler,
  description: "Conditional block with operator chain. Supports and/or/is/isnot/not/var/vis/visnot/toggle/tis/tisnot/>/</>=/<= and whitespace modes (keep, legacy).",
  category: "Risu / Control",
  scoped: true,
});

// Unrecognized block kinds. Risu behavior for unknowns: emit body as-is (parser.svelte.ts).
export const unknownHandler: MacroHandler = (_ctx, args) => {
  return args.length > 0 ? (args[args.length - 1] ?? "") : "";
};

registry.register({
  name: "risu_unknown",
  handler: unknownHandler,
  description: "Fallback for unknown block constructs. Emits the body as-is without interpretation.",
  category: "Risu / Control",
  scoped: true,
});

// parser.svelte.ts.
function trimLines(s: string): string {
  const lines = s.split("\n");
  while (lines.length > 0 && lines[0]!.trim() === "") lines.shift();
  while (lines.length > 0 && lines[lines.length - 1]!.trim() === "") lines.pop();
  return lines.join("\n");
}
