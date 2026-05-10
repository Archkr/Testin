import type { FrontendToBackend } from '../types/messages.js';
import type { LumirealmCharacterData } from '../payload/types.js';
import type { SpindleCharactersApi } from '../state/lumirealm-character.js';
import type { ViewerPushDeps } from '../state/viewer-push.js';
import type { ViewerAssembly } from '../state/viewer-assembly.js';
import { pushViewerData } from '../state/viewer-push.js';
import type { Handler } from './types.js';

type SetTriggerLuaMsg = Extract<FrontendToBackend, { type: 'set_trigger_lua' }>;

export interface ViewerHandlerDeps {
  readonly blockedByRepair: (userId: string, messageType: string) => boolean;
  readonly charactersApi: () => SpindleCharactersApi;
  readonly updateLumirealm: (
    api: SpindleCharactersApi,
    characterId: string,
    userId: string,
    mut: (data: LumirealmCharacterData) => LumirealmCharacterData,
  ) => Promise<LumirealmCharacterData | null>;
  readonly mutateTriggerLua: (msg: SetTriggerLuaMsg, userId: string) => Promise<{ ok: boolean; reason?: string }>;
  readonly viewerAssembly: ViewerAssembly;
  readonly viewerPushDeps: ViewerPushDeps;
  readonly charactersAttachedTo: (moduleId: string, userId: string) => Promise<readonly string[]>;
  readonly invalidateActiveForCharacter: (characterId: string, userId: string) => void;
  readonly log: { readonly info: (m: string) => void };
  readonly errMsg: (e: unknown) => string;
}

export function createViewerHandlers(deps: ViewerHandlerDeps): {
  readonly request_viewer_data: Handler<'request_viewer_data'>;
  readonly set_default_variable: Handler<'set_default_variable'>;
  readonly delete_default_variable: Handler<'delete_default_variable'>;
  readonly set_background_html: Handler<'set_background_html'>;
  readonly set_trigger_lua: Handler<'set_trigger_lua'>;
} {
  return {
    request_viewer_data: async (msg, ctx) => {
      try {
        const data = msg.source.kind === 'character'
          ? await deps.viewerAssembly.assembleCharacter(msg.source.characterId, ctx.userId)
          : await deps.viewerAssembly.assembleModule(msg.source.moduleId, ctx.userId);
        if (data) ctx.send({ type: 'viewer_data_pushed', data }, ctx.userId);
        else ctx.send({
          type: 'error',
          message: msg.source.kind === 'character'
            ? `Viewer: character ${msg.source.characterId} is not a lumirealm card.`
            : `Viewer: module ${msg.source.moduleId} not found in library.`,
        }, ctx.userId);
      } catch (err) {
        ctx.send({ type: 'error', message: `Viewer assembly failed: ${deps.errMsg(err)}` }, ctx.userId);
      }
    },
    set_default_variable: async (msg, ctx) => {
      if (deps.blockedByRepair(ctx.userId, msg.type)) return;
      const updated = await deps.updateLumirealm(deps.charactersApi(), msg.characterId, ctx.userId, (cur) => {
        const overrides = { ...(cur.user_overrides.default_variables_overrides ?? {}) };
        const trimmedName = msg.name.trim();
        if (trimmedName.length === 0) return cur;
        overrides[trimmedName] = String(msg.value);
        return {
          ...cur,
          user_overrides: {
            ...cur.user_overrides,
            ...(Object.keys(overrides).length > 0
              ? { default_variables_overrides: overrides }
              : {}),
          },
        };
      });
      if (!updated) {
        ctx.send({ type: 'error', message: `${msg.type}: not a lumirealm character` }, ctx.userId);
        return;
      }
      await pushViewerData(
        { source: { kind: 'character', characterId: msg.characterId }, context: msg.type, userId: ctx.userId },
        deps.viewerPushDeps,
      );
      deps.invalidateActiveForCharacter(msg.characterId, ctx.userId);
      deps.log.info(`${msg.type}: char=${msg.characterId} name=${msg.name} len=${String(msg.value).length}`);
    },
    delete_default_variable: async (msg, ctx) => {
      if (deps.blockedByRepair(ctx.userId, msg.type)) return;
      const updated = await deps.updateLumirealm(deps.charactersApi(), msg.characterId, ctx.userId, (cur) => {
        const overrides = { ...(cur.user_overrides.default_variables_overrides ?? {}) };
        if (!Object.prototype.hasOwnProperty.call(overrides, msg.name)) return cur;
        delete overrides[msg.name];
        return {
          ...cur,
          user_overrides: {
            ...cur.user_overrides,
            ...(Object.keys(overrides).length > 0
              ? { default_variables_overrides: overrides }
              : {}),
          },
        };
      });
      if (!updated) {
        ctx.send({ type: 'error', message: `${msg.type}: not a lumirealm character` }, ctx.userId);
        return;
      }
      await pushViewerData(
        { source: { kind: 'character', characterId: msg.characterId }, context: msg.type, userId: ctx.userId },
        deps.viewerPushDeps,
      );
      deps.invalidateActiveForCharacter(msg.characterId, ctx.userId);
      deps.log.info(`${msg.type}: char=${msg.characterId} name=${msg.name} (override removed)`);
    },
    set_background_html: async (msg, ctx) => {
      if (deps.blockedByRepair(ctx.userId, msg.type)) return;
      const characterId = msg.characterId;
      const html = typeof msg.html === 'string' && msg.html.length > 0 ? msg.html : null;
      const updated = await deps.updateLumirealm(deps.charactersApi(), characterId, ctx.userId, (cur) => ({
        ...cur,
        payload: { ...cur.payload, background_html: html },
      }));
      if (!updated) {
        ctx.send({ type: 'error', message: 'set_background_html: character is not a lumirealm card' }, ctx.userId);
        return;
      }
      deps.invalidateActiveForCharacter(characterId, ctx.userId);
      await pushViewerData(
        { source: { kind: 'character', characterId }, context: 'set_background_html', userId: ctx.userId },
        deps.viewerPushDeps,
      );
    },
    set_trigger_lua: async (msg, ctx) => {
      if (deps.blockedByRepair(ctx.userId, 'set_trigger_lua')) return;
      const result = await deps.mutateTriggerLua(msg, ctx.userId);
      if (!result.ok) {
        ctx.send({ type: 'error', message: `set_trigger_lua: ${result.reason ?? 'failed'}` }, ctx.userId);
        return;
      }
      await pushViewerData({ source: msg.source, context: 'set_trigger_lua', userId: ctx.userId }, deps.viewerPushDeps);
      if (msg.source.kind === 'module') {
        const attached = await deps.charactersAttachedTo(msg.source.moduleId, ctx.userId);
        for (const charId of attached) deps.invalidateActiveForCharacter(charId, ctx.userId);
      } else {
        deps.invalidateActiveForCharacter(msg.source.characterId, ctx.userId);
      }
    },
  };
}
