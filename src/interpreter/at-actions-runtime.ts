// @@-actions runtime: applies @@emo / @@inject / @@move_top / @@move_bottom /
// @@repeat_back post-regex actions per phase.
// Risu source: scripts.ts.

import type { HostApi, HostMessage } from "./host.js";
import { applyMatchTemplate } from "./runtime.js";
import { errMsg } from "../util/coerce.js";
import { makeSafeLogger } from "../util/safe-log.js";

const log = makeSafeLogger("atActions.runForPhase");

export type AtAtActionKind = "emo" | "inject" | "move_top" | "move_bottom" | "repeat_back";

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
  // Risu strips 'g' for move_top/bottom (scripts.ts "temperary fix").
  let flag = a.flag;
  if ((a.action === "move_top" || a.action === "move_bottom") && flag.includes("g")) {
    flag = flag.replace(/g/g, "");
  }

  let regex: RegExp;
  try {
    regex = new RegExp(a.findRegex, flag);
  } catch (err) {
    throw new Error(`atAction ${a.action}: invalid regex /${a.findRegex}/${flag} — ${(err as Error).message}`);
  }

  const matched = regex.test(data);
  // Reset lastIndex after .test (sticky for /g/) so subsequent .exec
  // doesn't skip ahead.
  regex.lastIndex = 0;

  if (matched) {
    switch (a.action) {
      case "emo": {
        // Risu strips the `@@emo ` prefix at scripts.ts.
        const name = a.out.substring(6).trim();
        if (name && ctx.api.characters.setExpression) {
          await ctx.api.characters.setExpression(name);
        }
        return data;
      }
      case "inject": {
        // Risu scripts.ts: persists to chat.message[chatID].data then
        // strips from data. We strip only; persist is a no-op (no per-message
        // write path at edit-time).
        if (ctx.chatIndex === -1) return data; // gate matches Risu :207
        return data.replace(regex, "");
      }
      case "move_top":
      case "move_bottom": {
        const stripped = a.out
          .replace(/^@@move_top\s+/, "")
          .replace(/^@@move_bottom\s+/, "");
        const m = data.match(regex);
        if (!m) return data;
        const cleaned = data.replace(regex, "");
        const rendered = applyMatchTemplate(stripped, m);
        if (a.action === "move_top") {
          return rendered + "\n" + cleaned;
        }
        return cleaned + "\n" + rendered;
      }
      case "repeat_back": {
        // repeat_back fires only on no-match (scripts.ts).
        return data;
      }
      default:
        return data;
    }
  } else {
    if (a.action === "repeat_back") {
      if (ctx.chatIndex === -1) return data; // gate matches Risu :252
      return await applyRepeatBack(a, data, regex, ctx);
    }
    return data;
  }
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
    if (action !== "emo" && action !== "inject" && action !== "move_top" && action !== "move_bottom" && action !== "repeat_back") continue;
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
