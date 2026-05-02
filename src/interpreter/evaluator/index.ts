
export { evaluate } from "./scanner.js";
export { buildEvaluatorContext, clearVarOverlay } from "./context.js";
export { registeredCount, lookup, ensureInitialised } from "./dispatch.js";
export type {
  EvaluatorCtx,
  EvaluatorOptions,
  BlockMatch,
  BlockKind,
  MacroHandler,
} from "./types.js";
export type { BuildEvaluatorCtxInput } from "./context.js";
