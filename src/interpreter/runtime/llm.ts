// Risu triggers.ts, scriptings.ts. V2 runLLM opcode + Lua prompt-arg parser.

import { toStr } from '../../util/coerce.js';
import { makeSafeLogger } from '../../util/safe-log.js';
import type { HostApi } from '../host.js';

const _log = makeSafeLogger('runtime.runLLM');

export interface SubmodelRouting {
  readonly submodelConnectionId: string | null;
  readonly submodelModelOverride: string | null;
  readonly submodelParamsWire: Record<string, number> | null;
}

// model is a CHANNEL keyword ('model' | 'submodel'), not a model name.
export async function runLLM(
  api: HostApi,
  routing: SubmodelRouting,
  value: unknown,
  model: string,
  _streaming?: boolean,
): Promise<string> {
  void _streaming;
  try {
    if (!api.llm) return 'Error: api.llm not available';
    const useSubmodel = model === 'submodel';
    const connId = useSubmodel ? routing.submodelConnectionId : null;
    const modelOverride = useSubmodel ? routing.submodelModelOverride : null;
    const paramsWire = useSubmodel ? routing.submodelParamsWire : null;
    const req: {
      messages: readonly { role: string; content: string }[];
      connectionId?: string;
      model?: string;
      parameters?: Record<string, number>;
    } = {
      messages: [{ role: 'user', content: toStr(value) }],
      ...(connId ? { connectionId: connId } : {}),
      ...(modelOverride ? { model: modelOverride } : {}),
      ...(paramsWire ? { parameters: paramsWire } : {}),
    };
    _log.info(
      `channel=${model} useSubmodel=${useSubmodel} ` +
        `submodelConn=${routing.submodelConnectionId ?? '<inherit-aux>'} ` +
        `submodelModel=${routing.submodelModelOverride ?? '<connection>'}`,
    );
    const result = await api.llm.generate(req);
    return toStr(result && result.content);
  } catch (e) {
    return 'Error: ' + (e instanceof Error ? e.message : String(e));
  }
}

export function parseLuaPromptArg(promptStr: unknown): { role: string; content: string }[] {
  let parsed: unknown;
  try { parsed = JSON.parse(toStr(promptStr)); }
  catch { parsed = toStr(promptStr); }
  if (typeof parsed === 'string') {
    return [{ role: 'user', content: parsed }];
  }
  if (Array.isArray(parsed)) {
    return parsed.map((m) => {
      const o = m as { role?: unknown; content?: unknown };
      return {
        role: typeof o.role === 'string' ? o.role : 'user',
        content: typeof o.content === 'string' ? o.content : '',
      };
    });
  }
  return [{ role: 'user', content: JSON.stringify(parsed) }];
}
