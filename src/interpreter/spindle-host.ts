// Spindle -> HostApi adapter. Thin remapping; no interpreter logic.

declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

import type {
  HostApi,
  HostMessage,
  HostCharacter,
  HostPersona,
  HostWorldInfoEntry,
  InjectOpts,
} from './host.js';
import { expectChatChange } from '../state/own-chat-change.js';
import { expectCharacterEdit } from '../state/own-character-edit.js';
import { makeSafeLogger } from '../util/safe-log.js';
import { awaitAlertDismissal } from './alert-bridge.js';
import { awaitPickResolution } from './pick-bridge.js';

const log = makeSafeLogger('spindle-host.llm.generate');

export interface SpindleHostCtx {
  readonly chatId: string;
  readonly characterId: string;
  readonly userId: string | undefined;
}

export function makeSpindleHost(ctx: SpindleHostCtx): HostApi {
  const { chatId, characterId, userId } = ctx;
  const uid = userId ?? undefined;

  async function getMessages(): Promise<readonly HostMessage[]> {
    const msgs = await spindle.chat.getMessages(chatId);
    return msgs.map((m) => ({
      id: m.id,
      content: typeof m.content === 'string' ? m.content : '',
      role: m.role,
    }));
  }

  async function sendMessage(content: string, opts?: { role?: string }): Promise<{ id: string }> {
    // Defensive: accept Risu aliases ('char'/'bot' → assistant, 'sys' → system)
    // alongside Lumi shape so internal callers can't silently land on the wrong role.
    const roleRaw = opts?.role ?? 'user';
    const role: 'system' | 'user' | 'assistant' =
      roleRaw === 'system' || roleRaw === 'sys' ? 'system'
      : roleRaw === 'assistant' || roleRaw === 'char' || roleRaw === 'bot' ? 'assistant'
      : 'user';
    const created = await spindle.chat.appendMessage(chatId, { role, content });
    return { id: created.id };
  }

  async function editMessage(id: string, content: string): Promise<void> {
    await spindle.chat.updateMessage(chatId, id, { content });
  }

  async function deleteMessage(id: string): Promise<void> {
    await spindle.chat.deleteMessage(chatId, id);
  }

  async function getMetadata(key: string): Promise<unknown> {
    const chat = await spindle.chats.get(chatId, uid);
    const meta = (chat?.metadata ?? {}) as Record<string, unknown>;
    return meta[key];
  }

  async function setMetadata(key: string, value: unknown): Promise<void> {
    const chat = await spindle.chats.get(chatId, uid);
    const currentMeta = (chat?.metadata ?? {}) as Record<string, unknown>;
    expectChatChange(chatId);
    await spindle.chats.update(chatId, {
      metadata: { ...currentMeta, [key]: value },
    }, uid);
  }

  async function inject(id: string, content: string, opts?: InjectOpts): Promise<void> {
    const anySpindle = spindle as unknown as {
      chats?: { inject?: (chatId: string, id: string, content: string, opts?: unknown, uid?: string) => Promise<void> };
    };
    if (anySpindle.chats?.inject) {
      await anySpindle.chats.inject(chatId, id, content, opts, uid);
      return;
    }
    const chat = await spindle.chats.get(chatId, uid);
    const meta = (chat?.metadata ?? {}) as Record<string, unknown>;
    const pending = Array.isArray(meta['_risu_pending_injections'])
      ? [...(meta['_risu_pending_injections'] as unknown[])]
      : [];
    pending.push({ id, content, opts });
    expectChatChange(chatId);
    await spindle.chats.update(chatId, {
      metadata: { ...meta, _risu_pending_injections: pending },
    }, uid);
  }

  async function charGet(id: string): Promise<HostCharacter> {
    const ch = await spindle.characters.get(id, uid) as Record<string, unknown> | null;
    if (!ch) return { id, description: '' };
    const rawImageId = ch['image_id'];
    return {
      id,
      description: typeof ch['description'] === 'string' ? ch['description'] as string : '',
      worldBookIds: Array.isArray(ch['world_book_ids']) ? ch['world_book_ids'] as string[] : [],
      imageId: typeof rawImageId === 'string' && rawImageId.length > 0 ? rawImageId : null,
    };
  }

  async function charUpdate(id: string, patch: Partial<HostCharacter>): Promise<void> {
    const p: Record<string, unknown> = {};
    if (typeof patch.description === 'string') p['description'] = patch.description;
    // Suppress CHARACTER_EDITED echo; dispatch does its own fan-out at end.
    expectCharacterEdit(id);
    await spindle.characters.update(id, p, uid);
  }

  const anySpindle = spindle as unknown as {
    worldInfo?: {
      entries: {
        list: (bookId: string, opts?: { limit?: number }, uid?: string) => Promise<{ data: readonly HostWorldInfoEntry[] }>;
        create: (bookId: string, entry: Partial<HostWorldInfoEntry>, uid?: string) => Promise<HostWorldInfoEntry>;
        update: (id: string, patch: Partial<HostWorldInfoEntry>, uid?: string) => Promise<HostWorldInfoEntry>;
        delete: (id: string, uid?: string) => Promise<void>;
      };
    };
    personas?: {
      getActive: (uid?: string) => Promise<HostPersona | null>;
      update: (id: string, patch: Partial<HostPersona>, uid?: string) => Promise<void>;
    };
    toast?: {
      info: (msg: string, opts?: { title?: string }) => void;
      success: (msg: string, opts?: { title?: string }) => void;
      warning: (msg: string, opts?: { title?: string }) => void;
      error: (msg: string, opts?: { title?: string }) => void;
    };
    prompt?: {
      input: (o: { title: string; message?: string; placeholder?: string; defaultValue?: string; multiline?: boolean; userId?: string }) => Promise<{ value: string | null; cancelled: boolean }>;
    };
    modal?: {
      confirm: (o: { title: string; message: string; variant?: string; confirmLabel?: string; cancelLabel?: string; userId?: string }) => Promise<{ confirmed: boolean }>;
    };
    sendToFrontend?: (msg: unknown, targetUserId?: string) => void;
  };

  const worldInfo = anySpindle.worldInfo
    ? {
        entries: {
          list: (bookId: string, opts?: { limit?: number }) => anySpindle.worldInfo!.entries.list(bookId, opts, uid),
          create: (bookId: string, entry: Partial<HostWorldInfoEntry>) => anySpindle.worldInfo!.entries.create(bookId, entry, uid),
          update: (id: string, patch: Partial<HostWorldInfoEntry>) => anySpindle.worldInfo!.entries.update(id, patch, uid),
          delete: (id: string) => anySpindle.worldInfo!.entries.delete(id, uid),
        },
      }
    : undefined;

  const personas = anySpindle.personas
    ? {
        getActive: async (): Promise<HostPersona | null> => {
          const p = await anySpindle.personas!.getActive(uid) as Record<string, unknown> | null;
          if (!p) return null;
          const rawId = p['id'];
          if (typeof rawId !== 'string') return null;
          const rawImageId = p['image_id'];
          const rawDesc = p['description'];
          return {
            ...p,
            id: rawId,
            description: typeof rawDesc === 'string' ? rawDesc : undefined,
            imageId: typeof rawImageId === 'string' && rawImageId.length > 0 ? rawImageId : null,
          } as HostPersona;
        },
        update: (id: string, patch: Partial<HostPersona>) => anySpindle.personas!.update(id, patch, uid),
      }
    : undefined;

  const host: HostApi = {
    chat: {
      getChatId: () => chatId,
      getMessages,
      sendMessage,
      editMessage,
      deleteMessage,
      getMetadata,
      setMetadata,
      inject,
    },
    characters: {
      get: charGet,
      update: charUpdate,
    },
    ui: {
      toast: (msg: string, kind?: 'info' | 'error' | 'warning' | 'success') => {
        const t = anySpindle.toast;
        if (!t) return;
        const k = kind ?? 'info';
        if (k === 'error') t.error(msg);
        else if (k === 'warning') t.warning(msg);
        else if (k === 'success') t.success(msg);
        else t.info(msg);
      },
      prompt: async (message: string, defaultValue?: string): Promise<string | null> => {
        const p = anySpindle.prompt;
        if (!p?.input) return null;
        try {
          const res = await p.input({
            title: message.slice(0, 80),
            ...(message.length > 80 ? { message } : {}),
            ...(defaultValue !== undefined ? { defaultValue } : {}),
            ...(userId !== undefined ? { userId } : {}),
          });
          return (res?.cancelled || res?.value == null) ? null : String(res.value);
        } catch { return null; }
      },
      confirm: async (message: string): Promise<boolean> => {
        const m = anySpindle.modal;
        if (!m?.confirm) return false;
        try {
          const res = await m.confirm({
            title: 'Confirm',
            message,
            ...(userId !== undefined ? { userId } : {}),
          });
          return !!res?.confirmed;
        } catch { return false; }
      },
      // Risu scriptings.ts alertNormal/alertError. Frontend owns the modal
      // (just message + OK button). Backend awaits `alert_dismissed`.
      alert: async (message: string, kind?: 'info' | 'error' | 'warning' | 'success'): Promise<void> => {
        const sf = anySpindle.sendToFrontend;
        if (typeof sf !== 'function') {
          const t = anySpindle.toast;
          t?.info?.(message);
          return;
        }
        const requestId = (globalThis.crypto?.randomUUID?.() ?? `alert-${Date.now()}-${Math.random()}`);
        const wireKind: 'info' | 'error' = kind === 'error' ? 'error' : 'info';
        try {
          sf({ type: 'request_alert', requestId, message, kind: wireKind }, userId);
          await awaitAlertDismissal(requestId);
        } catch { /* swallow */ }
      },
      pick: async (title: string, options: readonly string[]): Promise<string | null> => {
        const sf = anySpindle.sendToFrontend;
        if (typeof sf !== 'function' || options.length === 0) {
          log.warn(`pick: no sendToFrontend or empty options (n=${options.length}) — returning null`);
          return null;
        }
        const requestId = (globalThis.crypto?.randomUUID?.() ?? `pick-${Date.now()}-${Math.random()}`);
        log.info(`pick: requestId=${requestId} title=${JSON.stringify(title.slice(0, 80))} options=${options.length}`);
        try {
          sf({ type: 'request_pick', requestId, title, options }, userId);
          const v = await awaitPickResolution(requestId);
          log.info(`pick: requestId=${requestId} resolved value=${JSON.stringify(v)}`);
          return v;
        } catch (err) {
          log.error(`pick: requestId=${requestId} threw ${err instanceof Error ? err.message : String(err)}`);
          return null;
        }
      },
    },
  };
  if (worldInfo) (host as { worldInfo?: typeof worldInfo }).worldInfo = worldInfo;
  if (personas) (host as { personas?: typeof personas }).personas = personas;

  const generateApi = (anySpindle as {
    generate?: {
      raw?: (input: {
        type: 'raw' | 'quiet' | 'batch';
        messages?: readonly { role: string; content: string }[];
        connection_id?: string;
        provider?: string;
        model?: string;
        parameters?: Record<string, unknown>;
        userId?: string;
      }) => Promise<unknown>;
    };
  }).generate;
  type ConnectionDTO = {
    id: string; name: string; provider: string; model: string;
    is_default: boolean; has_api_key: boolean;
  };
  const connectionsApi = (anySpindle as {
    connections?: {
      list?: (uid?: string) => Promise<readonly ConnectionDTO[]>;
      get?: (id: string, uid?: string) => Promise<ConnectionDTO | null>;
    };
  }).connections;
  if (generateApi?.raw) {
    // spindle.generate.raw requires connection_id and model at top level; resolve before dispatch.
    type Resolution =
      | { ok: true; value: { id: string; model: string | undefined; provider: string } }
      | { ok: false; error: string };

    async function resolveConnection(explicitId: string | undefined): Promise<Resolution> {
      if (!connectionsApi) {
        return { ok: false, error: 'spindle.connections API not available on this Lumi build' };
      }
      try {
        if (explicitId) {
          if (!connectionsApi.get) {
            return { ok: false, error: 'spindle.connections.get not available on this Lumi build' };
          }
          const conn = await connectionsApi.get(explicitId, uid);
          if (!conn) {
            return {
              ok: false,
              error: `Connection profile "${explicitId.slice(0, 8)}…" not found. Pick a different one in Risu Settings → Auxiliary Model.`,
            };
          }
          return {
            ok: true,
            value: { id: conn.id, model: conn.model || undefined, provider: conn.provider || '' },
          };
        }
        if (!connectionsApi.list) {
          return { ok: false, error: 'spindle.connections.list not available on this Lumi build' };
        }
        const list = await connectionsApi.list(uid);
        if (!list || list.length === 0) {
          return {
            ok: false,
            error: 'No connection profiles configured. Set up a connection in Lumiverse Settings → Connections, then pick it (or mark it default).',
          };
        }
        const conn = list.find((c) => c.is_default) ?? list[0]!;
        return {
          ok: true,
          value: { id: conn.id, model: conn.model || undefined, provider: conn.provider || '' },
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Connection resolution failed: ${msg}` };
      }
    }
    (host as { llm?: HostApi['llm'] }).llm = {
      async generate(req): Promise<{ content: string }> {
        const resolution = await resolveConnection(req.connectionId);
        if (!resolution.ok) {
          log.warn(resolution.error);
          throw new Error(resolution.error);
        }
        const resolved = resolution.value;
        const effectiveModel = req.model || resolved.model || '';
        const parameters: Record<string, unknown> = { ...(req.parameters ?? {}) };
        if (effectiveModel) parameters.model = effectiveModel;
        const provider = req.provider || resolved.provider;
        const input: {
          type: 'raw' | 'quiet' | 'batch';
          messages: readonly { role: string; content: string }[];
          connection_id: string;
          provider?: string;
          model?: string;
          parameters?: Record<string, unknown>;
          userId?: string;
        } = {
          type: 'raw',
          // Coerce Risu role aliases ('sys' / 'bot' / 'char') to OpenAI shape.
          // Coerce Risu role aliases to OpenAI shape.
          messages: req.messages.map((m) => ({
            role:
              m.role === 'sys' ? 'system'
              : m.role === 'bot' || m.role === 'char' ? 'assistant'
              : (m.role === 'system' || m.role === 'user' || m.role === 'assistant') ? m.role
              : 'user',
            content: m.content,
          })),
          connection_id: resolved.id,
          ...(provider ? { provider } : {}),
          ...(effectiveModel ? { model: effectiveModel } : {}),
          ...(Object.keys(parameters).length > 0 ? { parameters } : {}),
          ...(uid !== undefined ? { userId: uid } : {}),
        };
        log.info(
          `dispatching connection_id=${resolved.id.slice(0, 8)}… ` +
            `model="${effectiveModel || '<connection-default>'}" ` +
            `provider="${provider || '<connection-default>'}" ` +
            `msgs=${req.messages.length}`,
        );
        const result = await generateApi.raw!(input);
        const r = result as { content?: unknown } | undefined;
        return { content: typeof r?.content === 'string' ? r.content : '' };
      },
      ...(connectionsApi?.list
        ? {
            async listConnections(): Promise<readonly {
              id: string; name: string; provider: string; model: string; is_default: boolean;
            }[]> {
              const list = await connectionsApi.list!(uid);
              return list.map((c) => ({
                id: c.id,
                name: c.name,
                provider: c.provider,
                model: c.model,
                is_default: c.is_default,
              }));
            },
          }
        : {}),
    };
  }

  const tokensApi = (anySpindle as {
    tokens?: {
      countText?: (text: string, options?: unknown) => Promise<{ total_tokens?: number }>;
    };
  }).tokens;
  if (tokensApi?.countText) {
    (host as { tokens?: HostApi['tokens'] }).tokens = {
      async count(text: string): Promise<number> {
        try {
          const r = await tokensApi.countText!(text, uid !== undefined ? { userId: uid } : undefined);
          const n = (r as { total_tokens?: number }).total_tokens;
          return typeof n === 'number' && Number.isFinite(n) ? n : Math.ceil(text.length / 4);
        } catch {
          return Math.ceil(text.length / 4);
        }
      },
    };
  }

  void characterId; // surfaced via ctx for future expansion
  return host;
}
