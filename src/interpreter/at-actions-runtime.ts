// @@-actions runtime: applies @@emo / @@repeat_back side-effecting actions per
// phase. @@inject / @@move_top / @@move_bottom are emitted as native Lumi
// regex_script rows by core/mappers/regex.ts and run inside Lumi's pipeline,
// so this module never sees them. Risu source: scripts.ts.

import type { HostApi, HostMessage } from "./host.js";
import { errMsg } from "../util/coerce.js";
import { makeSafeLogger } from "../util/safe-log.js";

const log = makeSafeLogger("atActions.runForPhase");

export type AtAtActionKind = "emo" | "repeat_back";

export type AtAtPhase = "editinput" | "editoutput" | "editdisplay" | "edittrans";

export interface RuntimeAtAtAction {
  readonly action: AtAtActionKind;
  readonly findRegex: string;
  readonly flag: string;
  readonly out: string;
  readonly phase: AtAtPhase;
  readonly order: number;
}

export interface RunAtActionsCtx {
  readonly api: HostApi;
  // Risu frame: -1 for greeting, 0..N for chat.message[i].
  readonly chatIndex: number;
  readonly role?: HostMessage["role"];
}

export async function runAtActionsForPhase(
  actions: readonly RuntimeAtAtAction[],
  phase: AtAtPhase,
  data: string,
  ctx: RunAtActionsCtx,
): Promise<string> {
  const eligible = actions
    .filter((a) => a.phase === phase)
    .slice()
    .sort((a, b) => a.order - b.order);
  if (eligible.length === 0) return data;

  log.info(
    `phase=${phase} eligible=${eligible.length} data_len=${data.length} chatIndex=${ctx.chatIndex}`,
  );

  let current = data;
  for (let i = 0; i < eligible.length; i++) {
    const a = eligible[i]!;
    try {
      current = await applyOne(a, current, ctx);
    } catch (err) {
      log.warn(
        `action[${i}] kind=${a.action} phase=${phase} THREW — ${errMsg(err)}; keeping prior data`,
      );
    }
  }
  return current;
}

async function applyOne(
  a: RuntimeAtAtAction,
  data: string,
  ctx: RunAtActionsCtx,
): Promise<string> {
  let regex: RegExp;
  try {
    regex = new RegExp(a.findRegex, a.flag);
  } catch (err) {
    throw new Error(`atAction ${a.action}: invalid regex /${a.findRegex}/${a.flag} — ${(err as Error).message}`);
  }

  const matched = regex.test(data);
  regex.lastIndex = 0;

  if (matched) {
    if (a.action === "emo") {
      const name = a.out.substring(6).trim();
      if (name && ctx.api.characters.setExpression) {
        await ctx.api.characters.setExpression(name);
      }
    }
    return data;
  }
  if (a.action === "repeat_back") {
    if (ctx.chatIndex === -1) return data; // Risu scripts.ts:252 gate
    return await applyRepeatBack(a, data, regex, ctx);
  }
  return data;
}

async function applyRepeatBack(
  a: RuntimeAtAtAction,
  data: string,
  regex: RegExp,
  ctx: RunAtActionsCtx,
): Promise<string> {
  // Risu scripts.ts: walk back from chatID-1 for same-role message.
  const messages = await ctx.api.chat.getMessages();
  // Risu chatID=-1 is greeting; Lumi includes greeting at index 0, so
  // Risu chatID maps to Lumi index chatID+1.
  const lumiIdx = ctx.chatIndex + 1;
  const targetRole = ctx.role;
  let priorMatch: RegExpMatchArray | null = null;
  for (let i = lumiIdx - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m) continue;
    if (targetRole && m.role !== targetRole) continue;
    const r = m.content.match(regex);
    if (r) {
      priorMatch = r;
      break;
    }
  }
  if (!priorMatch) return data;
  const piece = priorMatch[0];
  const v = a.out.split(/\s+/, 2)[1] ?? "end";
  switch (v) {
    case "start":
      return piece + data;
    case "end":
      return data + piece;
    case "start_nl":
      return piece + "\n" + data;
    case "end_nl":
      return data + "\n" + piece;
    default:
      return data + piece;
  }
}

export function coerceAtActions(raw: readonly unknown[]): RuntimeAtAtAction[] {
  const out: RuntimeAtAtAction[] = [];
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i] as {
      action?: unknown;
      script?: { in?: unknown; out?: unknown };
      flag?: unknown;
      phase?: unknown;
      order?: unknown;
    } | null;
    if (!r || typeof r !== "object") continue;
    const action = r.action as AtAtActionKind | undefined;
    if (action !== "emo" && action !== "repeat_back") continue;
    const findRegex = typeof r.script?.in === "string" ? r.script.in : "";
    const outStr = typeof r.script?.out === "string" ? r.script.out : "";
    if (!findRegex) continue;
    const flag = typeof r.flag === "string" ? r.flag : "g";
    const phase = r.phase as AtAtPhase | undefined;
    if (phase !== "editinput" && phase !== "editoutput" && phase !== "editdisplay" && phase !== "edittrans") continue;
    const order = typeof r.order === "number" ? r.order : i;
    out.push({ action, findRegex, flag, out: outStr, phase, order });
  }
  return out;
}
