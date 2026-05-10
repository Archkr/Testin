import type { ActiveCard } from '../interpreter/dispatch.js';
import type { Handler } from './types.js';

export interface TogglesHandlerDeps {
  readonly writeToggleValue: (
    chatId: string,
    key: string,
    value: string | null,
    userId: string,
  ) => Promise<{ ok: boolean; reason?: string }>;
  readonly ensureActiveCardForChat: (
    chatId: string,
    characterId: string | null,
    userId: string,
  ) => Promise<ActiveCard | null>;
  readonly refreshToggleDefinitions: (
    active: ActiveCard,
    chatId: string,
    userId: string,
    opts?: { force?: boolean },
  ) => Promise<void>;
  readonly log: { readonly warn: (m: string) => void };
}

export function createTogglesHandlers(deps: TogglesHandlerDeps): {
  readonly request_toggle_definitions: Handler<'request_toggle_definitions'>;
  readonly set_toggle: Handler<'set_toggle'>;
} {
  return {
    request_toggle_definitions: async (msg, ctx) => {
      const active = await deps.ensureActiveCardForChat(msg.chatId, null, ctx.userId);
      if (active) {
        await deps.refreshToggleDefinitions(active, msg.chatId, ctx.userId, { force: true });
      } else {
        ctx.send({
          type: 'set_toggle_definitions',
          chatId: msg.chatId,
          seq: 1,
          toggles: [],
          attribution: {},
          ts: Date.now(),
        }, ctx.userId);
      }
    },
    set_toggle: async (msg, ctx) => {
      const result = await deps.writeToggleValue(msg.chatId, msg.key, msg.value, ctx.userId);
      if (!result.ok) {
        deps.log.warn(`set_toggle failed: ${result.reason ?? 'unknown'}`);
        ctx.send({ type: 'error', message: `set toggle failed: ${result.reason ?? 'unknown'}` }, ctx.userId);
      }
    },
  };
}
