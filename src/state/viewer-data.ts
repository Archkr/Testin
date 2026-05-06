// Pure projections from lumirealm character data or module envelope to ViewerData wire shape.

import type {
  ViewerAssetEntry,
  ViewerData,
  ViewerDefaultVariable,
  ViewerLorebookEntry,
  ViewerLorebookGroup,
  ViewerRegexEntry,
  ViewerTriggerEffectSummary,
  ViewerTriggerEntry,
} from '../types/messages.js';
import type { LumirealmCharacterData, StoredRegexScript } from '../payload/types.js';
import type { ModuleEnvelope } from './modules-store.js';
import { imageUrlFromId } from '../interpreter/image-cache.js';
import { summarizeEffect } from './viewer-effects.js';

const imageUrl = (imageId: string) => imageUrlFromId(imageId);


export interface FetchedWorldBook {
  readonly id: string;
  readonly name: string;
  readonly entries: readonly FetchedWorldBookEntry[];
}

export interface FetchedWorldBookEntry {
  readonly id: string;
  readonly key: readonly string[];
  readonly content: string;
  readonly comment?: string;
  readonly disabled?: boolean;
  readonly constant?: boolean;
}

export function buildCharacterViewerData(input: {
  characterId: string;
  characterName: string;
  data: LumirealmCharacterData;
  worldBooks?: readonly FetchedWorldBook[];
  extraCharacterRegex?: readonly LumiSideRegex[];
  fetchWarnings?: readonly string[];
  ts?: number;
}): ViewerData {
  const triggers: ViewerTriggerEntry[] = [];
  const trArr = input.data.payload.triggers;
  const luArr = input.data.payload.lua_scripts;
  for (let i = 0; i < trArr.length; i++) {
    triggers.push(toViewerTrigger(`char-trig-${i}`, trArr[i], luArr[i] ?? '', i));
  }

  const assets: ViewerAssetEntry[] = [];
  for (const [name, entry] of Object.entries(input.data.asset_index)) {
    const ids = entry.imageIds;
    if (ids.length === 0) continue;
    assets.push({
      name,
      url: imageUrl(ids[0]!),
      multi: ids.length > 1,
      ...(entry.ext !== undefined ? { ext: entry.ext } : {}),
    });
  }
  assets.sort((a, b) => a.name.localeCompare(b.name)); // stable order for the UI

  const bgRaw = input.data.payload.background_html;
  const backgroundHtml = typeof bgRaw === 'string' && bgRaw.length > 0
    ? bgRaw
    : null;

  const cardDefaults = input.data.payload.scriptstate_defaults ?? {};
  const overrides = input.data.user_overrides.default_variables_overrides ?? {};
  const defaultVariables: ViewerDefaultVariable[] = [];
  // Union of names: overrides may add new names that weren't in the card.
  const seen = new Set<string>();
  for (const name of Object.keys(cardDefaults)) {
    seen.add(name);
    const cardValue = cardDefaults[name] ?? '';
    const overrideValue = Object.prototype.hasOwnProperty.call(overrides, name)
      ? overrides[name] ?? ''
      : null;
    defaultVariables.push({
      name,
      value: overrideValue ?? cardValue,
      cardDefault: cardValue,
      overridden: overrideValue !== null,
    });
  }
  for (const name of Object.keys(overrides)) {
    if (seen.has(name)) continue;
    defaultVariables.push({
      name,
      value: overrides[name] ?? '',
      cardDefault: '',
      overridden: true,
    });
  }
  defaultVariables.sort((a, b) => a.name.localeCompare(b.name));

  return {
    source: { kind: 'character', characterId: input.characterId, name: input.characterName },
    lorebook: [],
    regex: [],
    triggers,
    assets,
    cjs: null,
    backgroundHtml,
    defaultVariables,
    ts: input.ts ?? Date.now(),
    fetchWarnings: input.fetchWarnings ?? [],
  };
}

export interface LumiSideRegex {
  readonly id: string;
  readonly name?: string;
  readonly find_regex: string;
  readonly replace_string: string;
  readonly placement?: readonly string[];
  readonly target?: string;
  readonly disabled?: boolean;
  readonly metadata?: Record<string, unknown>;
}

function toViewerTrigger(
  fallbackId: string,
  rawTrigger: unknown,
  lua: string,
  idx: number,
): ViewerTriggerEntry {
  const t = (rawTrigger ?? {}) as {
    comment?: unknown;
    type?: unknown;
    effect?: unknown[];
  };
  const name = typeof t.comment === 'string' && t.comment.length > 0
    ? t.comment
    : `trigger #${idx + 1}`;
  const bindingType = typeof t.type === 'string' ? t.type : 'unknown';
  const effects: ViewerTriggerEffectSummary[] = [];
  if (Array.isArray(t.effect)) {
    for (const e of t.effect) {
      if (e && typeof e === 'object' && (e as { type?: unknown }).type === 'triggerlua') continue;
      effects.push(summarizeEffect(e));
    }
  }
  return {
    id: fallbackId,
    name,
    bindingType,
    lua: lua.length > 0 ? lua : null,
    effectCount: Array.isArray(t.effect) ? t.effect.length : 0,
    effects,
  };
}


export function buildModuleViewerData(input: {
  envelope: ModuleEnvelope;
  ts?: number;
}): ViewerData {
  const env = input.envelope;
  const m = env.module as {
    name?: unknown;
    lorebook?: readonly unknown[];
    regex?: readonly unknown[];
    trigger?: readonly unknown[];
    cjs?: unknown;
  };
  const moduleName = typeof m.name === 'string' && m.name.length > 0
    ? m.name
    : env.id;

  const lorebookEntries: ViewerLorebookEntry[] = [];
  if (Array.isArray(m.lorebook)) {
    for (let i = 0; i < m.lorebook.length; i++) {
      const e = m.lorebook[i];
      if (!e || typeof e !== 'object') continue;
      const eo = e as Record<string, unknown>;
      const keyRaw = eo['key'];
      const key = Array.isArray(keyRaw)
        ? keyRaw.filter((x): x is string => typeof x === 'string')
        : typeof keyRaw === 'string'
          ? [keyRaw]
          : [];
      lorebookEntries.push({
        id: `mod-lore-${i}`,
        key,
        content: typeof eo['content'] === 'string' ? eo['content'] : '',
        ...(typeof eo['comment'] === 'string' ? { comment: eo['comment'] } : {}),
        ...(typeof eo['disabled'] === 'boolean' ? { disabled: eo['disabled'] } : {}),
        ...(typeof eo['constant'] === 'boolean' ? { constant: eo['constant'] } : {}),
      });
    }
  }
  const lorebook: ViewerLorebookGroup[] = lorebookEntries.length > 0
    ? [{ groupName: moduleName, groupId: 'module', entries: lorebookEntries }]
    : [];

  // Modules have no stable Lumi-side ids until attach; synthesize per-index ids.
  const regex: ViewerRegexEntry[] = [];
  if (Array.isArray(m.regex)) {
    for (let i = 0; i < m.regex.length; i++) {
      const r = m.regex[i];
      if (!r || typeof r !== 'object') continue;
      const ro = r as Record<string, unknown>;
      const find = typeof ro['in'] === 'string' ? ro['in'] : '';
      const replace = typeof ro['out'] === 'string' ? ro['out'] : '';
      if (find.length === 0) continue;
      const ruleType = typeof ro['type'] === 'string' ? ro['type'] : 'editdisplay';
      regex.push({
        id: `mod-regex-${i}`,
        name: typeof ro['name'] === 'string' && ro['name'].length > 0
          ? ro['name']
          : `rule_${i + 1}`,
        find,
        replace,
        placement: '(see attach)',
        target: ruleType,
        disabled: ruleType === 'disabled',
        moduleId: env.id,
      });
    }
  }

  const triggers: ViewerTriggerEntry[] = [];
  if (Array.isArray(m.trigger)) {
    for (let i = 0; i < m.trigger.length; i++) {
      const t = m.trigger[i];
      const tEff = (t as { effect?: readonly unknown[] }).effect ?? [];
      const luaParts: string[] = [];
      for (const e of tEff) {
        const eo = e as { type?: string; code?: string };
        if (eo.type === 'triggerlua' && typeof eo.code === 'string') {
          luaParts.push(eo.code);
        }
      }
      triggers.push(toViewerTrigger(`mod-trig-${i}`, t, luaParts.join('\n'), i));
    }
  }

  const assets: ViewerAssetEntry[] = [];
  for (const [name, ref] of Object.entries(env.asset_index)) {
    assets.push({
      name,
      url: imageUrl(ref.imageId),
      multi: false,
      ...(ref.ext !== undefined ? { ext: ref.ext } : {}),
    });
  }
  assets.sort((a, b) => a.name.localeCompare(b.name));

  return {
    source: { kind: 'module', moduleId: env.id, name: moduleName },
    lorebook,
    regex,
    triggers,
    assets,
    cjs: typeof m.cjs === 'string' && m.cjs.length > 0 ? m.cjs : null,
    backgroundHtml: null, // modules don't have bg-html
    defaultVariables: [], // modules don't carry scriptstate defaults
    ts: input.ts ?? Date.now(),
    fetchWarnings: [],
  };
}
