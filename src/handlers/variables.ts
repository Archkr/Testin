import type { ActiveCard } from '../interpreter/dispatch.js';
import type { Handler } from './types.js';

export interface VariablesHandlerDeps {
  readonly writeLocalVariable: (
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
  readonly refreshVariables: (
    active: ActiveCard,
    chatId: string,
    userId: string,
    opts?: { force?: boolean },
  ) => Promise<void>;
}

export function createVariablesHandlers(deps: VariablesHandlerDeps): {
  readonly set_variable: Handler<'set_variable'>;
  readonly delete_variable: Handler<'delete_variable'>;
  readonly request_variables_snapshot: Handler<'request_variables_snapshot'>;
} {
  return {
    set_variable: async (msg, ctx) => {
      if (msg.scope !== 'local') {
        ctx.send({ type: 'error', message: `Only local scope is editable from the Variables tab (got: ${msg.scope})` }, ctx.userId);
        return;
      }
      const result = await deps.writeLocalVariable(msg.chatId, msg.key, msg.value, ctx.userId);
      if (!result.ok) {
        ctx.send({ type: 'error', message: `Set ${msg.key}: ${result.reason ?? 'failed'}` }, ctx.userId);
      }
    },
    delete_variable: async (msg, ctx) => {
      if (msg.scope !== 'local') {
        ctx.send({ type: 'error', message: `Only local scope is editable from the Variables tab (got: ${msg.scope})` }, ctx.userId);
        return;
      }
      const result = await deps.writeLocalVariable(msg.chatId, msg.key, null, ctx.userId);
      if (!result.ok) {
        ctx.send({ type: 'error', message: `Delete ${msg.key}: ${result.reason ?? 'failed'}` }, ctx.userId);
      }
    },
    request_variables_snapshot: async (msg, ctx) => {
      const active = await deps.ensureActiveCardForChat(msg.chatId, null, ctx.userId);
      if (active) {
        await deps.refreshVariables(active, msg.chatId, ctx.userId, { force: true });
      } else {
        ctx.send({
          type: 'set_variables',
          chatId: msg.chatId,
          seq: 1,
          scopes: { local: {}, global: {}, chat: {} },
          defaults: {},
          ts: Date.now(),
        }, ctx.userId);
      }
    },
  };
}
