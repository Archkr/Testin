import { makeSafeLogger } from '../util/safe-log.js';
import jsonLuaSource from '../interpreter/lua-json.lua' with { type: 'text' };
import { GLUE_WASM_DATA_URI } from './_glue-wasm-b64.js';

const log = makeSafeLogger('wasmoon-probe');

export async function runWasmoonProbe(): Promise<void> {
  const t0 = Date.now();
  try {
    const mod = (await import('wasmoon')) as unknown as {
      LuaFactory: new (uri?: string) => {
        mountFile: (p: string, c: string) => Promise<void>;
        createEngine: (o?: { injectObjects?: boolean }) => Promise<{
          global: { set: (n: string, v: unknown) => void; get: (n: string) => unknown; close: () => void };
          doString: (s: string) => Promise<unknown>;
        }>;
      };
    };
    const tImport = Date.now() - t0;

    const tFactory = Date.now();
    const factory = new mod.LuaFactory(GLUE_WASM_DATA_URI);
    await factory.mountFile('json.lua', jsonLuaSource);
    const engine = await factory.createEngine({ injectObjects: true });
    const factoryMs = Date.now() - tFactory;

    engine.global.set('jsAdd', (a: number, b: number) => a + b);
    const tRun = Date.now();
    const r = await engine.doString("json = require 'json'\nreturn jsAdd(1, 1)");
    const runMs = Date.now() - tRun;

    const tWork = Date.now();
    const big = 'x'.repeat(15000);
    engine.global.set('bigInput', big);
    await engine.doString(`
local s = bigInput
for i = 1, 50 do
  s = s:gsub('x', 'y'):gsub('y', 'x')
end
return #s
`);
    const workMs = Date.now() - tWork;

    engine.global.close();
    log.info(
      `WASMOON OK result=${String(r)} importMs=${tImport} factoryMs=${factoryMs} ` +
        `runMs=${runMs} gsubWorkMs=${workMs} (compare fengari editDisplay ~50-90ms/call)`,
    );
  } catch (err) {
    log.error(`WASMOON FAILED after ${Date.now() - t0}ms — ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
  }
}
