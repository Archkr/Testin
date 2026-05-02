// Risu scriptings.ts runLuaEditTrigger.
// Iterates all triggerlua triggers, threading data through each in sequence.

import type { HostApi, DispatchData, ScriptNS } from "./host.js";
import { makeRisuTriggerRuntime } from "./runtime.js";
import { execute as luaExecute } from "./lua-bridge.js";
import { errMsg } from "../util/coerce.js";
import { makeSafeLogger } from "../util/safe-log.js";

const log = makeSafeLogger("listenEdit.runChain");

export type ListenEditMode =
  | "editInput"
  | "editOutput"
  | "editDisplay"
  | "editRequest";

export interface ListenEditTrigger {
  readonly source: { effect?: ReadonlyArray<{ type?: string }> };
  readonly luaCode: string;
}

export interface ListenEditOpts {
  readonly chatId?: string;
  readonly characterId?: string;
}

export async function runListenEditChain<T>(
  triggers: readonly ListenEditTrigger[],
  mode: ListenEditMode,
  value: T,
  meta: Record<string, unknown>,
  api: HostApi,
  data: DispatchData,
  scriptNS: ScriptNS,
  opts: ListenEditOpts = {},
): Promise<T> {
  // Risu scriptings.ts: skip non-triggerlua effect kinds.
  const eligible = triggers.filter((t) => {
    const luaTrigger = t.source.effect?.[0]?.type === "triggerlua";
    return luaTrigger && t.luaCode.length > 0;
  });
  if (eligible.length === 0) return value;

  log.info(
    `mode=${mode} eligible=${eligible.length}/${triggers.length} ` +
      `chatId=${opts.chatId ?? "<none>"} characterId=${opts.characterId ?? "<none>"}`,
  );

  // Risu scriptings.ts uses a generator; character id is stable enough.
  const accessKey = opts.characterId ?? "edit-trigger";

  let current = value;

  for (let i = 0; i < eligible.length; i++) {
    const t = eligible[i]!;
    const tStart = Date.now();
    try {
      // Risu scriptings.ts: lowLevelAccess false; edit hooks are text transforms.
      const runtime = await makeRisuTriggerRuntime(
        api,
        data,
        scriptNS,
        {
          binding: "manual",
          lowLevelAccess: false,
          ...(opts.chatId !== undefined ? { chatId: opts.chatId } : {}),
          ...(opts.characterId !== undefined ? { characterId: opts.characterId } : {}),
        },
      );
      const valueJson = JSON.stringify(current);
      const metaJson = JSON.stringify(meta ?? {});
      const result = await runtime.runLua(t.luaCode, {
        entry: "callListenMain",
        args: [mode, accessKey, valueJson, metaJson],
      });
      if (typeof result === "string") {
        try {
          const parsed = JSON.parse(result) as T;
          current = parsed;
        } catch (err) {
          log.warn(
            `trigger[${i}] returned non-JSON, keeping prior value — ${errMsg(err)}`,
          );
        }
      } else if (result === undefined) {
        // No callListenMain defined; skip silently.
      } else {
        log.warn(
          `trigger[${i}] returned unexpected type=${typeof result}; keeping prior value`,
        );
      }
      log.info(`trigger[${i}] mode=${mode} elapsed=${Date.now() - tStart}ms`);
    } catch (err) {
      // Risu scriptings.ts: on throw, keep prior value and continue.
      log.warn(
        `trigger[${i}] mode=${mode} elapsed=${Date.now() - tStart}ms THREW — ${errMsg(err)}; keeping prior value`,
      );
    }
  }

  return current;
}
