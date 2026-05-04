// Risu triggers.ts, scriptings.ts. V2 runLLM opcode + Lua prompt-arg parser.

import { toStr } from '../../util/coerce.js';
import { makeSafeLogger } from '../../util/safe-log.js';
import type { HostApi } from '../host.js';
import type { AuxDebugCaptureEvent } from './dispatch-context.js';

const _log = makeSafeLogger('runtime.runLLM');

export interface SubmodelRouting {
  readonly submodelConnectionId: string | null;
  readonly submodelModelOverride: string | null;
  readonly submodelParamsWire: Record<string, number> | null;
  /** Optional debug-capture sink. When set + Settings → Debug → Capture
   *  toggles enabled, the V2 submodel path emits request/response/error
   *  events tagged `channel: 'submodel'`. (Aux channel is wired separately
   *  in runtime.ts axLLMMain.) */
  readonly auxDebugCapture?: ((event: AuxDebugCaptureEvent) => void) | undefined;
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
  // Only the submodel path participates in `channel: 'submodel'` capture; the
  // 'model' / default branch routes through aux config and is captured by
  // the axLLMMain wiring instead.
  const captureChannel: 'submodel' | null = useSubmodel ? 'submodel' : null;
  const tStart = Date.now();
  if (captureChannel && routing.auxDebugCapture) {
    try {
      routing.auxDebugCapture({
        kind: 'request',
        channel: captureChannel,
        auxConnectionId: connId,
        auxModelOverride: modelOverride,
        elapsedMs: null,
        payload: req,
      });
    } catch { /* never crash trigger work for diagnostic plumbing */ }
  }
  try {
    const result = await api.llm.generate(req);
    const content = toStr(result && result.content);
    if (captureChannel && routing.auxDebugCapture) {
      try {
        routing.auxDebugCapture({
          kind: 'response',
          channel: captureChannel,
          auxConnectionId: connId,
          auxModelOverride: modelOverride,
          elapsedMs: Date.now() - tStart,
          payload: { content },
        });
      } catch { /* */ }
    }
    return content;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (captureChannel && routing.auxDebugCapture) {
      try {
        routing.auxDebugCapture({
          kind: 'error',
          channel: captureChannel,
          auxConnectionId: connId,
          auxModelOverride: modelOverride,
          elapsedMs: Date.now() - tStart,
          payload: { message },
        });
      } catch { /* */ }
    }
    return 'Error: ' + message;
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
