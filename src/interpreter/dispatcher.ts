
import type { TriggerScript } from '../core/schemas/index.js';
import { compileTriggers } from '../core/mappers/index.js';
import type { RisuPayload } from '../core/payload/index.js';
import {
  makeRisuTriggerRuntime,
  makeRisuRegexRuntime,
} from './runtime.js';
import { execute as luaExecute } from './lua-bridge.js';
import type { HostApi, DispatchData, ScriptNS, TriggerRuntimeOpts } from './host.js';
import type { RisuBinding } from './runtime.js';
import { makeSafeLogger } from '../util/safe-log.js';

const AsyncFunctionCtor =
  Object.getPrototypeOf(async function () {}).constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>;

export interface DispatcherScriptNS extends ScriptNS {
  /** Manual triggers registered by name — v2RunTrigger resolves through here. */
  registerManual(name: string, runner: (ctx: { api: HostApi; data: DispatchData }) => Promise<void>): void;
}

export function makeDispatcherScriptNS(): DispatcherScriptNS {
  const nlog = makeSafeLogger('scriptNS').info;
  const manuals = new Map<string, { run: (ctx: unknown) => Promise<unknown> }>();
  const risuCompat = { makeRisuTriggerRuntime, makeRisuRegexRuntime };
  const risuCompatLua = { execute: luaExecute };
  return {
    async require(name: string): Promise<unknown> {
      if (name === 'risu-compat') { nlog(`require('risu-compat') → OK`); return risuCompat; }
      if (name === 'risu-compat-lua') { nlog(`require('risu-compat-lua') → OK`); return risuCompatLua; }
      if (manuals.has(name)) { nlog(`require('${name}') → manual OK`); return manuals.get(name); }
      const stripped = name.replace(/^risu-manual-/, '');
      if (manuals.has(stripped)) { nlog(`require('${name}') → manual(stripped='${stripped}') OK`); return manuals.get(stripped); }
      nlog(`require('${name}') → NULL (not found; manuals=${JSON.stringify([...manuals.keys()])})`);
      return null;
    },
    registerManual(name: string, runner) {
      manuals.set('risu-manual-' + name, { run: async (ctx) => runner(ctx as { api: HostApi; data: DispatchData }) });
      manuals.set(name, { run: async (ctx) => runner(ctx as { api: HostApi; data: DispatchData }) });
    },
  };
}

export interface CompiledTriggerEntry {
  readonly name: string;
  readonly code: string;
  readonly type: 'trigger' | 'library';
  readonly triggers: readonly string[];
  readonly binding: RisuBinding;
  readonly source: TriggerScript;
}

export function prepareTriggers(
  payload: RisuPayload,
  characterId: string,
): readonly CompiledTriggerEntry[] {
  const rawTriggers = payload.triggers as readonly TriggerScript[];
  const compiled = compileTriggers(rawTriggers, { characterId });
  const out: CompiledTriggerEntry[] = [];
  for (let i = 0; i < compiled.files.length; i++) {
    const f = compiled.files[i]!;
    const sourceTrigger = rawTriggers[i];
    if (!sourceTrigger) continue;
    out.push({
      name: f.name,
      code: f.code,
      type: f.type,
      triggers: f.triggers ?? [],
      binding: sourceTrigger.type as RisuBinding,
      source: sourceTrigger,
    });
  }
  return out;
}

export const GENERATION_ENDED_EXTRA: readonly RisuBinding[] = ['display'];

export interface DispatchCtx {
  readonly compiledTriggers: readonly CompiledTriggerEntry[];
  readonly api: HostApi;
  readonly data: DispatchData;
  readonly scriptNS: DispatcherScriptNS;
  readonly opts: TriggerRuntimeOpts;
}

export function triggerMatchesBinding(
  t: CompiledTriggerEntry,
  binding: RisuBinding,
): boolean {
  if (t.type !== 'trigger') return false;
  const firstEffect = t.source?.effect?.[0];
  const isLuaOrCode = firstEffect?.type === 'triggerlua' || firstEffect?.type === 'triggercode';
  if (isLuaOrCode) return true;
  return t.binding === binding;
}

export async function dispatchBinding(
  ctx: DispatchCtx,
  binding: RisuBinding,
  onError?: (err: unknown, triggerName: string) => void,
): Promise<void> {
  const dlog = makeSafeLogger('dispatcher').info;
  const matches = ctx.compiledTriggers.filter((t) => triggerMatchesBinding(t, binding));
  dlog(`dispatchBinding: binding=${binding} matches=${matches.length}/${ctx.compiledTriggers.length} data=${JSON.stringify(ctx.data).slice(0, 200)}`);
  for (const entry of matches) {
    const tStart = Date.now();
    dlog(`→ trigger START name=${entry.name} binding=${entry.binding} triggers=${JSON.stringify(entry.triggers)} code_len=${entry.code.length}`);
    try {
      await runCompiledTrigger(entry, ctx);
      dlog(`← trigger DONE name=${entry.name} elapsed=${Date.now() - tStart}ms`);
    } catch (err) {
      dlog(`× trigger ERROR name=${entry.name} elapsed=${Date.now() - tStart}ms msg=${(err as Error).message}`);
      if (onError) onError(err, entry.name);
      else throw err;
    }
  }
}

async function runCompiledTrigger(
  entry: CompiledTriggerEntry,
  ctx: DispatchCtx,
): Promise<void> {
  const rLog = makeSafeLogger(`runCompiledTrigger[${entry.name}]`);
  const rlog = rLog.info;
  const rerr = rLog.error;
  // Mirror console.* to spindle.log.
  const mirroredConsole = {
    log: (...a: unknown[]) => rlog(`console.log: ${a.map((x) => { try { return typeof x === 'string' ? x : JSON.stringify(x); } catch { return String(x); } }).join(' ').slice(0, 600)}`),
    warn: (...a: unknown[]) => rlog(`console.warn: ${a.map((x) => { try { return typeof x === 'string' ? x : JSON.stringify(x); } catch { return String(x); } }).join(' ').slice(0, 600)}`),
    error: (...a: unknown[]) => rerr(`console.error: ${a.map((x) => { try { return typeof x === 'string' ? x : JSON.stringify(x); } catch { return String(x); } }).join(' ').slice(0, 600)}`),
    info: (...a: unknown[]) => rlog(`console.info: ${a.map((x) => { try { return typeof x === 'string' ? x : JSON.stringify(x); } catch { return String(x); } }).join(' ').slice(0, 600)}`),
  };
  rlog(`COMPILE AsyncFunction code_len=${entry.code.length}`);
  const fn = new AsyncFunctionCtor(
    'api', 'data', 'script', '__console', 'z', 'fetch', 'Bun', 'process',
    '"use strict";\nconst console = __console;\n' + entry.code + '\n',
  );
  rlog(`INVOKE AsyncFunction`);
  const t0 = Date.now();
  try {
    await fn(
      ctx.api,
      ctx.data,
      ctx.scriptNS,
      mirroredConsole,
      undefined, undefined, undefined, undefined,
    );
    rlog(`RETURN OK elapsed=${Date.now() - t0}ms`);
  } catch (err) {
    rerr(`THREW elapsed=${Date.now() - t0}ms — ${(err as Error).message}\n${(err as Error).stack ?? ''}`);
    throw err;
  }
}

export async function dispatchByManualName(
  ctx: DispatchCtx,
  manualName: string,
  onError?: (err: unknown, triggerName: string) => void,
): Promise<number> {
  const dlog = makeSafeLogger('dispatcher').info;
  // Risu filter: comment exact-match on non-triggerlua triggers.
  // triggerlua/triggercode excluded; backend.ts handles those separately.
  const matches = ctx.compiledTriggers.filter((t) => {
    const firstEffect = t.source?.effect?.[0];
    const isLuaOrCode = firstEffect?.type === 'triggerlua' || firstEffect?.type === 'triggercode';
    if (isLuaOrCode) return false;
    return t.source?.comment === manualName;
  });
  dlog(`dispatchByManualName: name="${manualName}" matches=${matches.length}/${ctx.compiledTriggers.length}`);
  let fired = 0;
  for (const entry of matches) {
    try {
      if (entry.type === 'library') {
        const lib = (await ctx.scriptNS.require(entry.name)) as
          | { run?: (c: unknown) => Promise<void> }
          | null;
        if (lib && typeof lib.run === 'function') {
          await lib.run({ api: ctx.api, data: ctx.data, script: ctx.scriptNS });
          fired++;
          dlog(`dispatchByManualName: fired library entry name=${entry.name}`);
        } else {
          dlog(`dispatchByManualName: library entry name=${entry.name} has no run() — skip`);
        }
      } else {
        await runCompiledTrigger(entry, ctx);
        fired++;
        dlog(`dispatchByManualName: fired trigger entry name=${entry.name} binding=${entry.binding}`);
      }
    } catch (err) {
      onError?.(err, entry.name);
    }
  }
  return fired;
}

export function registerManualTriggers(
  scriptNS: DispatcherScriptNS,
  compiled: readonly CompiledTriggerEntry[],
  api: HostApi,
): void {
  for (const entry of compiled) {
    if (entry.type !== 'library') continue;
    scriptNS.registerManual(entry.name, async (ctx) => {
      const silentConsole = { log: () => {}, warn: () => {}, error: () => {}, info: () => {} };
      const exportsObj: Record<string, unknown> = {};
      const moduleObj = { exports: exportsObj };
      const fn = new AsyncFunctionCtor(
        'api', 'data', 'script', '__console', 'exports', 'module', 'fetch', 'Bun', 'process',
        '"use strict";\nconst console = __console;\n' + entry.code + '\n',
      );
      await fn(api, ctx.data, scriptNS, silentConsole, exportsObj, moduleObj, undefined, undefined, undefined);
      const mod = moduleObj.exports as { run?: (c: unknown) => Promise<void> };
      if (mod && typeof mod.run === 'function') await mod.run(ctx);
    });
  }
}
