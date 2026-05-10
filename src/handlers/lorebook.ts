import type { LorebookImporter } from '../state/lorebook-import.js';
import type { Handler } from './types.js';

export interface LorebookHandlerDeps {
  readonly lorebookImporter: LorebookImporter;
}

export function createLorebookHandlers(deps: LorebookHandlerDeps): {
  readonly import_lorebook: Handler<'import_lorebook'>;
} {
  return {
    import_lorebook: async (msg, ctx) => {
      await deps.lorebookImporter.handle(msg, ctx.userId);
    },
  };
}
