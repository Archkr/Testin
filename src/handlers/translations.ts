import type { FrontendToBackend } from '../types/messages.js';
import type { Handler } from './types.js';

type CacheModuleMsg = Extract<FrontendToBackend, { type: 'cache_module_translation' }>;
type CacheCharMsg = Extract<FrontendToBackend, { type: 'cache_character_translation' }>;

export interface TranslationsHandlerDeps {
  readonly persistModuleTranslation: (userId: string, msg: CacheModuleMsg) => Promise<void>;
  readonly persistCharacterTranslation: (userId: string, msg: CacheCharMsg) => Promise<void>;
}

export function createTranslationsHandlers(deps: TranslationsHandlerDeps): {
  readonly cache_module_translation: Handler<'cache_module_translation'>;
  readonly cache_character_translation: Handler<'cache_character_translation'>;
} {
  return {
    cache_module_translation: async (msg, ctx) => {
      await deps.persistModuleTranslation(ctx.userId, msg);
    },
    cache_character_translation: async (msg, ctx) => {
      await deps.persistCharacterTranslation(ctx.userId, msg);
    },
  };
}
