declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

import type { ActiveCard } from '../interpreter/dispatch.js';
import type { BackendToFrontend, SidebarToggleWire } from '../types/messages.js';
import type { LumirealmCharacterData } from '../payload/types.js';
import type { ModuleEnvelope } from './modules-store.js';
import {
  collectModuleToggleDsl,
  extractToggleKeys,
  parseToggleSyntax,
  type SidebarToggle,
} from '../core/toggle-syntax.js';
import { expectChatChange } from './own-chat-change.js';
import { invalidateRenderMcpForChat } from './render-mcp-cache.js';
import type { VariableStateStore } from './variables-state.js';
import type { ToggleStateStore } from './toggle-state.js';

function sanitizeVarMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== 'string') continue;
    if (v === undefined || v === null) {
      out[k] = '';
    } else if (typeof v === 'string') {
      out[k] = v;
    } else {
      try { out[k] = String(v); } catch { out[k] = ''; }
    }
  }
  return out;
}

function toggleToWire(t: SidebarToggle): SidebarToggleWire {
  switch (t.type) {
    case 'group':
    case 'groupEnd':
    case 'divider':
      return {
        type: t.type,
        ...(t.key !== undefined ? { key: t.key } : {}),
        ...(t.value !== undefined ? { value: t.value } : {}),
      };
    case 'caption':
      return {
        type: 'caption',
        ...(t.key !== undefined ? { key: t.key } : {}),
        value: t.value ?? '',
      };
    case 'select':
      return {
        type: 'select',
        key: t.key,
        value: t.value,
        options: [...t.options],
      };
    case undefined:
    case 'text':
    case 'textarea':
      return {
        type: t.type ?? 'checkbox',
        key: t.key,
        value: t.value,
        ...(t.options !== undefined ? { options: [...t.options] } : {}),
      };
  }
}

export interface VariablesTogglesDeps {
  readonly variableState: VariableStateStore;
  readonly toggleState: ToggleStateStore;
  readonly readLumirealm: (
    characterId: string,
    userId: string,
  ) => Promise<{ data: LumirealmCharacterData | null } | null>;
  readonly readAttachedModuleEnvelopes: (
    userId: string,
    attachedIds: readonly string[],
  ) => Promise<readonly ModuleEnvelope[]>;
  readonly ensureActiveCardForChat: (
    chatId: string,
    characterId: string | null,
    userId: string | undefined,
  ) => Promise<ActiveCard | null>;
  readonly refreshBgHtml: (active: ActiveCard, chatId: string, userId: string | undefined) => Promise<void>;
  readonly send: (msg: BackendToFrontend, userId: string | undefined) => void;
  readonly log: {
    readonly info: (m: string) => void;
    readonly warn: (m: string) => void;
    readonly debug: (m: string) => void;
  };
  readonly errMsg: (e: unknown) => string;
}

export interface VariablesTogglesService {
  readonly refreshVariables: (
    active: ActiveCard,
    chatId: string,
    userId: string | undefined,
    opts?: { force?: boolean },
  ) => Promise<void>;
  readonly writeLocalVariable: (
    chatId: string,
    key: string,
    value: string | null,
    userId: string,
  ) => Promise<{ ok: boolean; reason?: string }>;
  readonly refreshToggleDefinitions: (
    active: ActiveCard,
    chatId: string,
    userId: string | undefined,
    opts?: { force?: boolean },
  ) => Promise<void>;
  readonly writeToggleValue: (
    chatId: string,
    key: string,
    value: string | null,
    userId: string,
  ) => Promise<{ ok: boolean; reason?: string }>;
}

export function createVariablesTogglesService(deps: VariablesTogglesDeps): VariablesTogglesService {
  const {
    variableState,
    toggleState,
    readLumirealm,
    readAttachedModuleEnvelopes,
    ensureActiveCardForChat,
    refreshBgHtml,
    send,
    log,
    errMsg,
  } = deps;

  async function refreshVariables(
    active: ActiveCard,
    chatId: string,
    userId: string | undefined,
    opts?: { force?: boolean },
  ): Promise<void> {
    if (userId === undefined) {
      log.debug(`variables.refresh: skip chat=${chatId},userId not yet captured`);
      return;
    }
    let chat: { metadata?: unknown } | null = null;
    try {
      chat = (await spindle.chats.get(chatId, userId)) as { metadata?: unknown } | null;
    } catch (err) {
      log.warn(`variables.refresh: chats.get failed chat=${chatId}: ${errMsg(err)}`);
      return;
    }
    const mv = ((chat?.metadata as { macro_variables?: unknown } | undefined)
      ?.macro_variables ?? {}) as {
        local?: unknown;
        global?: unknown;
        chat?: unknown;
      };
    const scopes = {
      local: sanitizeVarMap(mv.local),
      global: sanitizeVarMap(mv.global),
      chat: sanitizeVarMap(mv.chat),
    };
    // FE Default subtab needs both effective and card-side defaults to flag overridden entries and offer "Reset to card default".
    const cardSide = active.card.risuPayload.scriptstate_defaults ?? {};
    const overrides = active.lumirealm.user_overrides.default_variables_overrides ?? {};
    const defaults: Record<string, string> = { ...cardSide, ...overrides };
    const result = variableState.applySnapshot(chatId, scopes, defaults);
    if (result.changed || opts?.force) {
      send({
        type: 'set_variables',
        chatId,
        seq: result.entry.seq,
        scopes: result.entry.scopes,
        defaults: result.entry.defaults,
        defaultsCardSide: cardSide,
        characterId: active.card.character_id,
        ts: result.entry.ts,
      }, userId);
      const counts =
        `local=${Object.keys(scopes.local).length} ` +
        `global=${Object.keys(scopes.global).length} ` +
        `chat=${Object.keys(scopes.chat).length} ` +
        `defaults=${Object.keys(defaults).length} ` +
        `overrides=${Object.keys(overrides).length}`;
      log.info(
        `variables.refresh: pushed chat=${chatId} seq=${result.entry.seq} ` +
          `${counts} forced=${!!opts?.force}`,
      );
    } else {
      log.debug(`variables.refresh: unchanged chat=${chatId} seq=${result.entry.seq}`);
    }
  }

  async function writeLocalVariable(
    chatId: string,
    key: string,
    value: string | null,
    userId: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    const trimmedKey = key.trim();
    if (trimmedKey.length === 0) {
      return { ok: false, reason: 'variable name cannot be empty' };
    }
    const active = await ensureActiveCardForChat(chatId, null, userId);
    if (!active) {
      return { ok: false, reason: 'not a Risu-imported chat' };
    }

    let chat: { metadata?: unknown } | null;
    try {
      chat = (await spindle.chats.get(chatId, userId)) as { metadata?: unknown } | null;
    } catch (err) {
      return { ok: false, reason: `chats.get failed: ${errMsg(err)}` };
    }
    const meta = (chat?.metadata ?? {}) as Record<string, unknown>;
    const mv = (meta['macro_variables'] && typeof meta['macro_variables'] === 'object'
      ? { ...(meta['macro_variables'] as Record<string, unknown>) }
      : {}) as Record<string, unknown>;
    const local = (mv['local'] && typeof mv['local'] === 'object'
      ? { ...(mv['local'] as Record<string, unknown>) }
      : {}) as Record<string, unknown>;

    if (value === null) {
      if (!Object.prototype.hasOwnProperty.call(local, trimmedKey)) {
        return { ok: true };
      }
      delete local[trimmedKey];
    } else {
      // Coerce to string. Empty string is allowed (matches `setvar X ""`).
      local[trimmedKey] = String(value);
    }
    mv['local'] = local;

    try {
      expectChatChange(chatId);
      await spindle.chats.update(
        chatId,
        { metadata: { ...meta, macro_variables: mv } as never },
        userId,
      );
    } catch (err) {
      return { ok: false, reason: `chats.update failed: ${errMsg(err)}` };
    }

    invalidateRenderMcpForChat(chatId);
    await refreshBgHtml(active, chatId, userId);
    await refreshVariables(active, chatId, userId, { force: true });

    log.info(
      `variables.write: chat=${chatId} key=${trimmedKey} ` +
        (value === null ? 'deleted' : `len=${String(value).length}`),
    );
    return { ok: true };
  }

  async function loadToggleDsl(
    characterId: string,
    userId: string,
  ): Promise<{
    flatToggles: readonly SidebarToggle[];
    attribution: Record<string, string>;
  }> {
    const fetched = await readLumirealm(characterId, userId);
    if (!fetched || !fetched.data) return { flatToggles: [], attribution: {} };
    const attachedIds = fetched.data.user_overrides.attached_module_ids ?? [];
    if (attachedIds.length === 0) return { flatToggles: [], attribution: {} };

    const envelopes = await readAttachedModuleEnvelopes(userId, attachedIds);
    const modulesForToggle = envelopes.map((env) => {
      const m = env.module as { customModuleToggle?: unknown; name?: unknown };
      return {
        customModuleToggle: typeof m.customModuleToggle === 'string' ? m.customModuleToggle : '',
        displayName: typeof m.name === 'string' ? m.name : env.id,
      };
    });

    // Build per-module attribution alongside the concatenated DSL by parsing each module's DSL in isolation, then unioning the keys.
    const attribution: Record<string, string> = {};
    for (const m of modulesForToggle) {
      if (!m.customModuleToggle) continue;
      const localFlat = parseToggleSyntax(m.customModuleToggle);
      for (const k of extractToggleKeys(localFlat)) {
        // First module wins on collision.
        if (!Object.prototype.hasOwnProperty.call(attribution, k)) {
          attribution[k] = m.displayName;
        }
      }
    }

    const concat = collectModuleToggleDsl(modulesForToggle);
    const flatToggles = parseToggleSyntax(concat);
    return { flatToggles, attribution };
  }

  async function refreshToggleDefinitions(
    active: ActiveCard,
    chatId: string,
    userId: string | undefined,
    opts?: { force?: boolean },
  ): Promise<void> {
    if (userId === undefined) {
      log.debug(`toggles.refresh: skip chat=${chatId},userId not yet captured`);
      return;
    }
    const { flatToggles, attribution } = await loadToggleDsl(
      active.card.character_id,
      userId,
    );
    const wire = flatToggles.map(toggleToWire);
    const result = toggleState.applySnapshot(chatId, wire, attribution);
    if (result.changed || opts?.force) {
      send({
        type: 'set_toggle_definitions',
        chatId,
        seq: result.entry.seq,
        toggles: result.entry.toggles,
        attribution: result.entry.attribution,
        ts: result.entry.ts,
      }, userId);
      log.info(
        `toggles.refresh: pushed chat=${chatId} seq=${result.entry.seq} ` +
          `count=${wire.length} keys=${extractToggleKeys(flatToggles).length} forced=${!!opts?.force}`,
      );
    } else {
      log.debug(`toggles.refresh: unchanged chat=${chatId} seq=${result.entry.seq}`);
    }
  }

  async function writeToggleValue(
    chatId: string,
    key: string,
    value: string | null,
    userId: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    const trimmedKey = key.trim();
    if (trimmedKey.length === 0) {
      return { ok: false, reason: 'toggle key cannot be empty' };
    }
    const active = await ensureActiveCardForChat(chatId, null, userId);
    if (!active) {
      return { ok: false, reason: 'not a Risu-imported chat' };
    }

    let chat: { metadata?: unknown } | null;
    try {
      chat = (await spindle.chats.get(chatId, userId)) as { metadata?: unknown } | null;
    } catch (err) {
      return { ok: false, reason: `chats.get failed: ${errMsg(err)}` };
    }
    const meta = (chat?.metadata ?? {}) as Record<string, unknown>;
    const mv = (meta['macro_variables'] && typeof meta['macro_variables'] === 'object'
      ? { ...(meta['macro_variables'] as Record<string, unknown>) }
      : {}) as Record<string, unknown>;
    const global = (mv['global'] && typeof mv['global'] === 'object'
      ? { ...(mv['global'] as Record<string, unknown>) }
      : {}) as Record<string, unknown>;

    const storeKey = `toggle_${trimmedKey}`;
    if (value === null) {
      if (!Object.prototype.hasOwnProperty.call(global, storeKey)) {
        return { ok: true };
      }
      delete global[storeKey];
    } else {
      global[storeKey] = String(value);
    }
    mv['global'] = global;

    try {
      expectChatChange(chatId);
      await spindle.chats.update(
        chatId,
        { metadata: { ...meta, macro_variables: mv } as never },
        userId,
      );
    } catch (err) {
      return { ok: false, reason: `chats.update failed: ${errMsg(err)}` };
    }

    invalidateRenderMcpForChat(chatId);
    await refreshBgHtml(active, chatId, userId);
    await refreshVariables(active, chatId, userId, { force: true });

    log.info(
      `toggles.write: chat=${chatId} key=${storeKey} ` +
        (value === null ? 'deleted' : `len=${String(value).length}`),
    );
    return { ok: true };
  }

  return { refreshVariables, writeLocalVariable, refreshToggleDefinitions, writeToggleValue };
}
