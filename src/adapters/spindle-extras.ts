declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

// Lumi's pre-write content processor hook. Feature-detected:
// older Lumi builds leave this undefined.
export interface MessageContentProcessorCtx {
  readonly chatId: string;
  readonly messageId?: string;
  readonly content: string;
  readonly extra?: Record<string, unknown>;
  readonly origin: 'create' | 'update' | 'swipe_add' | 'swipe_update' | 'render';
  readonly swipeIndex?: number;
  readonly userId: string;
}
export interface MessageContentProcessorPatch {
  content?: string;
  extra?: Record<string, unknown>;
}
export type MessageContentProcessorHandler = (
  ctx: MessageContentProcessorCtx,
) => Promise<MessageContentProcessorPatch | void>;
export type RegisterMessageContentProcessor = (
  handler: MessageContentProcessorHandler,
  priority?: number,
) => void;

export function getRegisterMessageContentProcessor(): RegisterMessageContentProcessor | undefined {
  return (spindle as unknown as {
    registerMessageContentProcessor?: RegisterMessageContentProcessor;
  }).registerMessageContentProcessor;
}

// Macro interceptor: fires at the top of MacroEvaluator.evaluate.
export interface MacroInterceptorSnapshotEnv {
  readonly commit: boolean;
  readonly names: Record<string, string>;
  readonly character: Record<string, unknown>;
  readonly chat: Record<string, unknown>;
  readonly system: Record<string, unknown>;
  readonly variables: {
    readonly local: Record<string, string>;
    readonly global: Record<string, string>;
    readonly chat: Record<string, string>;
  };
  readonly extra: Record<string, unknown>;
}
export interface MacroInterceptorCtx {
  readonly template: string;
  readonly env: MacroInterceptorSnapshotEnv;
  readonly commit: boolean;
  readonly phase: 'prompt' | 'display' | 'response' | 'other';
  readonly sourceHint?: string;
  readonly userId?: string;
}
export type MacroInterceptorHandler = (ctx: MacroInterceptorCtx) => Promise<string | void>;
export type RegisterMacroInterceptor = (
  handler: MacroInterceptorHandler,
  priority?: number,
) => void;

export function getRegisterMacroInterceptor(): RegisterMacroInterceptor | undefined {
  return (spindle as unknown as {
    registerMacroInterceptor?: RegisterMacroInterceptor;
  }).registerMacroInterceptor;
}

// Prompt-assembly interceptor (editInput / editRequest hook chain entry).
export interface InterceptorContext {
  chatId?: string;
  connectionId?: string;
  personaId?: string;
  generationType?: 'normal' | 'continue' | 'regenerate' | 'swipe' | 'impersonate';
}
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}
export type InterceptorHandler = (
  messages: LlmMessage[],
  context: unknown,
) => Promise<LlmMessage[] | { messages: LlmMessage[]; parameters?: Record<string, unknown> }>;
export type RegisterInterceptor = (handler: InterceptorHandler, priority?: number) => void;

export function getRegisterInterceptor(): RegisterInterceptor | undefined {
  return (spindle as unknown as {
    registerInterceptor?: RegisterInterceptor;
  }).registerInterceptor;
}

// World-info interceptor (Tier 2 lorebook decorator gates).
export function getRegisterWorldInfoInterceptor():
  | typeof spindle.registerWorldInfoInterceptor
  | null {
  const fn = (spindle as unknown as { registerWorldInfoInterceptor?: unknown }).registerWorldInfoInterceptor;
  return typeof fn === 'function'
    ? (spindle.registerWorldInfoInterceptor.bind(spindle) as typeof spindle.registerWorldInfoInterceptor)
    : null;
}

// Modal confirm dialog. Optional on older Lumi builds.
export interface ModalConfirmOptions {
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  userId?: string;
}
export interface ModalConfirmApi {
  readonly confirm: (options: ModalConfirmOptions) => Promise<{ confirmed: boolean }>;
}

export function getModalConfirmApi(): ModalConfirmApi | null {
  const m = (spindle as unknown as { modal?: { confirm?: ModalConfirmApi['confirm'] } }).modal;
  return m?.confirm ? { confirm: m.confirm } : null;
}

// Regex scripts list/delete. Optional.
export interface RegexScriptsApi {
  readonly list: (
    opts: { userId?: string; limit?: number; offset?: number },
  ) => Promise<{ data: readonly unknown[]; total: number }>;
  readonly delete: (id: string, userId?: string) => Promise<boolean>;
}

export function getRegexScriptsApi(): RegexScriptsApi | null {
  const api = (spindle as unknown as {
    regex_scripts?: {
      list?: RegexScriptsApi['list'];
      delete?: RegexScriptsApi['delete'];
    };
  }).regex_scripts;
  if (!api?.list || !api?.delete) return null;
  return { list: api.list, delete: api.delete };
}

// Connections list with extension-side typing.
export interface ConnectionDTOLike {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly model: string;
  readonly is_default: boolean;
}
export type ConnectionsListFn = (uid?: string) => Promise<readonly ConnectionDTOLike[]>;

export function getConnectionsListFn(): ConnectionsListFn | null {
  const fn = (spindle as unknown as {
    connections?: { list?: ConnectionsListFn };
  }).connections?.list;
  return fn ?? null;
}
