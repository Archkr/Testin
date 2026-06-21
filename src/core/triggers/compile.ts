import type { TriggerEffect, TriggerScript } from "../schemas/triggerscript.js";
import type { EmitContext, EmitIssue } from "./types.js";
import { indent, resolveCall } from "./types.js";
import { EMITTERS } from "./opcodes/index.js";


export interface CompileTriggerOptions {
  readonly comment?: string;
  readonly lowLevelAccess?: boolean;
  readonly displayMode?: boolean;
  readonly baseIndent?: number;
}

export interface CompileTriggerResult {
  readonly body: string;
  readonly issues: readonly EmitIssue[];
  readonly unimplementedCounts: Readonly<Record<string, number>>;
  readonly hasConditions: boolean;
}

export function compileTrigger(
  trigger: TriggerScript,
  opts: CompileTriggerOptions = {},
): CompileTriggerResult {
  const issues: EmitIssue[] = [];
  const baseIndent = opts.baseIndent ?? 1;
  const ctx: EmitContext = {
    indent: baseIndent,
    issues,
    lowLevelAccess: Boolean(opts.lowLevelAccess ?? trigger.lowLevelAccess ?? false),
    displayMode: Boolean(opts.displayMode ?? false),
    loopDepth: 0,
  };

  const out: string[] = [];

  const hasConditions = Array.isArray(trigger.conditions) && trigger.conditions.length > 0;
  if (hasConditions) {
    out.push(line(ctx, `if (!__risu.checkConditions(${JSON.stringify(trigger.conditions)})) return;`));
  }

  const effects = (trigger.effect ?? []) as readonly TriggerEffect[];
  const compiled = compileBlock(effects, 0, 0, ctx);
  out.push(compiled.code);

  const unimplementedCounts: Record<string, number> = {};
  for (const issue of issues) {
    if (!issue.message.startsWith("unknown opcode")) continue;
    unimplementedCounts[issue.opcode] = (unimplementedCounts[issue.opcode] ?? 0) + 1;
  }

  return {
    body: out.filter((s) => s.length > 0).join("\n"),
    issues,
    unimplementedCounts,
    hasConditions,
  };
}

function compileBlock(
  effects: readonly TriggerEffect[],
  start: number,
  minIndent: number,
  ctx: EmitContext,
): { nextIndex: number; code: string } {
  const out: string[] = [];
  let i = start;
  while (i < effects.length) {
    const op = effects[i]!;
    const opIndent = readIndent(op);

    if (opIndent < minIndent) break;
    if (
      (op.type === "v2EndIndent" || op.type === "v2Else") &&
      opIndent === minIndent &&
      minIndent > 0
    ) {
      break;
    }

    switch (op.type) {
      case "v2If":
      case "v2IfVar":
      case "v2IfAdvanced": {
        out.push(line(ctx, `if (${emitCondition(op)}) {`));
        const innerCtx = { ...ctx, indent: ctx.indent + 1 };
        const body = compileBlock(effects, i + 1, opIndent + 1, innerCtx);
        out.push(body.code);
        i = body.nextIndex;
        const endOp = effects[i];
        if (endOp && endOp.type === "v2EndIndent" && readIndent(endOp) === opIndent + 1) {
          i++; // consume v2EndIndent
          const elseOp = effects[i];
          if (elseOp && elseOp.type === "v2Else" && readIndent(elseOp) === opIndent) {
            out.push(line(ctx, `} else {`));
            const elseBody = compileBlock(effects, i + 1, opIndent + 1, innerCtx);
            out.push(elseBody.code);
            i = elseBody.nextIndex;
            const elseEnd = effects[i];
            if (elseEnd && elseEnd.type === "v2EndIndent" && readIndent(elseEnd) === opIndent + 1) {
              i++;
            }
          }
          out.push(line(ctx, `}`));
        } else {
          out.push(line(ctx, `}`));
          ctx.issues.push({
            opcode: op.type,
            message: "missing v2EndIndent for v2If",
            severity: "warn",
          });
        }
        break;
      }
      case "v2Loop": {
        out.push(line(ctx, `while (true) {`));
        const innerCtx = { ...ctx, indent: ctx.indent + 1, loopDepth: ctx.loopDepth + 1 };
        out.push(line(innerCtx, `if ((__risu.loopTick() & 0xff) === 0) { await __risu.sleep(1); }`));
        const body = compileBlock(effects, i + 1, opIndent + 1, innerCtx);
        out.push(body.code);
        i = body.nextIndex;
        const endOp = effects[i];
        if (endOp && endOp.type === "v2EndIndent" && readIndent(endOp) === opIndent + 1) {
          i++;
        }
        out.push(line(ctx, `}`));
        break;
      }
      case "v2LoopNTimes": {
        const e = op as unknown as {
          value: string;
          valueType: "var" | "value";
          indent: number;
        };
        const counter = `__risu_n_${i}`;
        const limit = `__risu_lim_${i}`;
        out.push(
          line(
            ctx,
            `{ const ${limit} = Math.max(0, Number(${resolveCall(e.value, e.valueType)}) || 0);`,
          ),
        );
        out.push(line(ctx, `  for (let ${counter} = 0; ${counter} < ${limit}; ${counter}++) {`));
        const innerCtx = { ...ctx, indent: ctx.indent + 2, loopDepth: ctx.loopDepth + 1 };
        const body = compileBlock(effects, i + 1, opIndent + 1, innerCtx);
        out.push(body.code);
        i = body.nextIndex;
        const endOp = effects[i];
        if (endOp && endOp.type === "v2EndIndent" && readIndent(endOp) === opIndent + 1) {
          i++;
        }
        out.push(line(ctx, `  }`));
        out.push(line(ctx, `}`));
        break;
      }
      case "v2BreakLoop": {
        // Risu triggers.ts: outside a loop, breakLoop exits the trigger.
        out.push(line(ctx, ctx.loopDepth > 0 ? `break;` : `return;`));
        i++;
        break;
      }
      case "v2Else":
      case "v2EndIndent":
        ctx.issues.push({
          opcode: op.type,
          message: "orphan structural opcode — no matching opener",
          severity: "warn",
        });
        i++;
        break;
      default: {
        const emitter = EMITTERS[op.type];
        if (!emitter) {
          ctx.issues.push({
            opcode: op.type,
            message: "unknown opcode: likely a newer RisuAI version. Card may not work properly. Contact `amousepad` on Discord if you see this message.",
            severity: "warn",
          });
          out.push(line(ctx, `/* unknown opcode (skipped): ${op.type} */`));
        } else {
          const result = emitter(op, ctx);
          if (result.code.length > 0) out.push(result.code);
        }
        i++;
        break;
      }
    }
  }
  return { nextIndex: i, code: out.join("\n") };
}

function line(ctx: EmitContext, body: string): string {
  return indent(ctx) + body;
}

function readIndent(op: TriggerEffect): number {
  const raw = (op as { indent?: unknown }).indent;
  if (typeof raw === "number" && raw >= 0) return raw;
  return 0;
}

function emitCondition(op: TriggerEffect): string {
  const e = op as unknown as {
    type: "v2If" | "v2IfAdvanced";
    condition: string;
    target: string;
    targetType: "var" | "value";
    source: string;
    sourceType?: "var" | "value";
  };
  // Risu triggers.ts: v2If source is always a var; v2IfAdvanced has a type field.
  const sourceKind = e.type === "v2If" ? "var" : e.sourceType ?? "var";
  return `__risu.compare(${resolveCall(e.source, sourceKind)}, ${resolveCall(e.target, e.targetType)}, ${JSON.stringify(e.condition)})`;
}
