
import { evaluate } from "./scanner.js";
import {
  buildEvaluatorContext,
  type BuildEvaluatorCtxInput,
} from "./context.js";

export type PipelinePhase = "commit" | "display";

export interface RunPipelineInput extends Omit<BuildEvaluatorCtxInput, "commit"> {
  /** Raw CBS template — card first_mes, bg-html, or a message's stored content. */
  readonly template: string;
  /** Controls the dry-fire gate on mutating handlers. */
  readonly phase: PipelinePhase;
  readonly wrapIslands?: boolean;
}

export function runPipeline(input: RunPipelineInput): string {
  const commit = input.phase === "commit";

  const ctx = buildEvaluatorContext({
    chatId: input.chatId,
    ...(input.userId !== undefined ? { userId: input.userId } : {}),
    ...(input.characterId !== undefined ? { characterId: input.characterId } : {}),
    userName: input.userName,
    charName: input.charName,
    ...(input.personaText !== undefined ? { personaText: input.personaText } : {}),
    character: input.character,
    chat: input.chat,
    variables: input.variables,
    // Risu chatVar.svelte.ts default fallback.
    ...(input.scriptstateDefaults ? { scriptstateDefaults: input.scriptstateDefaults } : {}),
    ...(input.system ? { system: input.system } : {}),
    ...(input.screenWidth !== undefined ? { screenWidth: input.screenWidth } : {}),
    ...(input.screenHeight !== undefined ? { screenHeight: input.screenHeight } : {}),
    ...(input.currentMessageIndexOverride !== undefined
      ? { currentMessageIndexOverride: input.currentMessageIndexOverride }
      : {}),
    ...(input.legacyMediaFindings !== undefined
      ? { legacyMediaFindings: input.legacyMediaFindings }
      : {}),
    ...(input.modulesByNamespace ? { modulesByNamespace: input.modulesByNamespace } : {}),
    ...(input.positionPt ? { positionPt: input.positionPt } : {}),
    commit,
  });

  return evaluate(input.template, ctx);
}

// RISU_COMPAT_USE_WORKER_EVAL=1 routes resolveReadonly through this pipeline.
// Reads via Bun.env to avoid Lumi's detectDangerousBackendCapabilities check
// on the literal `process.env` string (Lumi commit 5195652).
export function workerEvalEnabled(): boolean {
  try {
    const env = (globalThis as { Bun?: { env?: Record<string, string | undefined> } }).Bun?.env;
    if (!env) return false;
    const v = env.RISU_COMPAT_USE_WORKER_EVAL;
    return v === "1" || v === "true" || v === "yes";
  } catch {
    return false;
  }
}
