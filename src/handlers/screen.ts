import type { Handler } from './types.js';

export interface ScreenHandlerDeps {
  readonly setScreenDims: (userId: string, dims: { width: number; height: number }) => void;
  readonly log: { readonly debug: (m: string) => void; readonly warn: (m: string) => void };
}

export function createScreenHandlers(deps: ScreenHandlerDeps): {
  readonly screen_dims: Handler<'screen_dims'>;
} {
  return {
    screen_dims: async (msg, ctx) => {
      if (ctx.userId) {
        deps.setScreenDims(ctx.userId, { width: Number(msg.width) || 0, height: Number(msg.height) || 0 });
        deps.log.debug(`screen_dims: user=${ctx.userId} w=${msg.width} h=${msg.height}`);
      } else {
        deps.log.warn(`screen_dims: received but userId is empty, cache not updated`);
      }
    },
  };
}
