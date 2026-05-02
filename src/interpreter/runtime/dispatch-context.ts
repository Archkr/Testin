// Side-channel for non-serialisable dispatch values (Functions, Sets) that
// can't ride in compiled triggers' JSON-frozen rtOpts. Set before invoking
// each trigger, cleared via try/finally on return. Single-threaded JS
// event loop guarantees no races.

import type { PortalSelectors } from '../../core/mappers/portal-analyze.js';

export interface DispatchContext {
  chatId?: string;
  portalSelectors?: PortalSelectors;
  rememberOurWrite?: (chatId: string, msgId: string, content: string) => void;
  binding?: string;
  stateChanged?: () => void;
  /** Aux model routing for Lua's `axLLMMain`. Null → default connection. */
  auxConnectionId?: string | null;
  auxModelOverride?: string | null;
  /** Per-sampler overrides on top of the resolved connection's preset. */
  auxSamplers?: {
    temperature: number | null;
    maxTokens: number | null;
    contextSize: number | null;
    topP: number | null;
    minP: number | null;
    topK: number | null;
    frequencyPenalty: number | null;
    presencePenalty: number | null;
    repetitionPenalty: number | null;
  };
  /** Submodel routing for V2 `runLLM(model='submodel')`. */
  submodelConnectionId?: string | null;
  submodelModelOverride?: string | null;
  submodelSamplers?: {
    temperature: number | null;
    maxTokens: number | null;
    contextSize: number | null;
    topP: number | null;
    minP: number | null;
    topK: number | null;
    frequencyPenalty: number | null;
    presencePenalty: number | null;
    repetitionPenalty: number | null;
  };
  auxDebugCapture?: (event: AuxDebugCaptureEvent) => void;
  trackSidecarWrite?: (msgId: string, rawContent: string) => void;
}

export interface AuxDebugCaptureEvent {
  readonly kind: 'request' | 'response' | 'error';
  readonly auxConnectionId: string | null;
  readonly auxModelOverride: string | null;
  /** Milliseconds since dispatch start. `null` for `kind:'request'`. */
  readonly elapsedMs: number | null;
  /** Kind-specific payload: `request` = generate args, `response` = `{content}`, `error` = `{message}`. */
  readonly payload: unknown;
}

let currentDispatchContext: DispatchContext | null = null;

/** Set the per-dispatch context. Clear with try/finally. Returns prior value. */
export function setDispatchContext(ctx: DispatchContext | null): DispatchContext | null {
  const prior = currentDispatchContext;
  currentDispatchContext = ctx;
  return prior;
}

export function getDispatchContext(): DispatchContext | null {
  return currentDispatchContext;
}
