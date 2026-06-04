declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

import type { Handler } from './types.js';
import { expectChatChange } from '../state/own-chat-change.js';
import { invalidateRecentFlush } from '../state/recent-flush-cache.js';

export function createDisplayWritebackHandlers(): { display_writeback: Handler<'display_writeback'> } {
  return {
    display_writeback: async (msg, ctx): Promise<void> => {
      const { chatId, vars } = msg;
      if (!chatId || !vars || Object.keys(vars).length === 0) return;
      try {
        const chat = await spindle.chats.get(chatId, ctx.userId);
        const meta = (chat?.metadata ?? {}) as Record<string, unknown>;
        const mv = (meta['macro_variables'] && typeof meta['macro_variables'] === 'object'
          ? { ...(meta['macro_variables'] as Record<string, unknown>) }
          : {}) as Record<string, unknown>;
        const local = (mv['local'] && typeof mv['local'] === 'object'
          ? { ...(mv['local'] as Record<string, unknown>) }
          : {}) as Record<string, unknown>;
        let changed = 0;
        for (const [k, v] of Object.entries(vars)) {
          if (local[k] === v) continue;
          local[k] = v;
          changed += 1;
        }
        if (changed === 0) return;
        mv['local'] = local;
        expectChatChange(chatId);
        await spindle.chats.update(chatId, { metadata: { ...meta, macro_variables: mv } as never }, ctx.userId);
        invalidateRecentFlush(chatId);
        ctx.log.info(`display_writeback chat=${chatId} changed=${changed}`);
      } catch (err) {
        ctx.log.warn(`display_writeback failed chat=${chatId}: ${ctx.errMsg(err)}`);
      }
    },
  };
}
