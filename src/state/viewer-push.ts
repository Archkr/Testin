import type { ViewerData } from '../types/messages.js';

export type ViewerPushSource =
  | { readonly kind: 'character'; readonly characterId: string }
  | { readonly kind: 'module'; readonly moduleId: string };

export interface ViewerPushDeps {
  readonly assembleCharacter: (characterId: string, userId: string) => Promise<ViewerData | null>;
  readonly assembleModule: (moduleId: string, userId: string) => Promise<ViewerData | null>;
  readonly send: (msg: { type: 'viewer_data_pushed'; data: ViewerData }, userId: string) => void;
  readonly warn: (msg: string) => void;
  readonly errMsg: (err: unknown) => string;
}

export interface PushViewerDataArgs {
  readonly source: ViewerPushSource;
  readonly context: string;
  readonly userId: string;
}

// Mutation handlers re-push viewer data so the open viewer panel reflects the
// change. Re-push is best-effort: throws are logged and swallowed so the
// caller's primary side effect remains observable.
export async function pushViewerData(
  args: PushViewerDataArgs,
  deps: ViewerPushDeps,
): Promise<void> {
  const { source, context, userId } = args;
  try {
    const data = source.kind === 'character'
      ? await deps.assembleCharacter(source.characterId, userId)
      : await deps.assembleModule(source.moduleId, userId);
    if (data) deps.send({ type: 'viewer_data_pushed', data }, userId);
  } catch (err) {
    deps.warn(`${context}: viewer re-push failed: ${deps.errMsg(err)}`);
  }
}
