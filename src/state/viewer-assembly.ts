import type { ViewerData } from '../types/messages.js';
import type { LumirealmCharacterData } from '../payload/types.js';
import {
  buildCharacterViewerData,
  buildModuleViewerData,
  type FetchedWorldBook,
  type FetchedWorldBookEntry,
} from './viewer-data.js';
import type { LumirealmFetchResult } from './lumirealm-character.js';

interface AssemblyModuleEnvelope {
  readonly module: { readonly name?: unknown };
  readonly translations?: Readonly<Record<string, {
    readonly name?: string;
    readonly lorebook?: Readonly<Record<string, { readonly comment?: string }>>;
  }>>;
}

interface AssemblyCharacterDTO {
  readonly world_book_ids?: unknown;
}

export interface ViewerAssemblyDeps {
  readonly readLumirealm: (
    characterId: string,
    userId: string,
  ) => Promise<LumirealmFetchResult | null>;
  readonly readModule: (moduleId: string, userId: string) => Promise<AssemblyModuleEnvelope | null>;
  readonly fetchCharacter: (characterId: string, userId: string) => Promise<AssemblyCharacterDTO | null>;
  readonly fetchWorldBookMeta: (wbId: string, userId: string) => Promise<{ readonly name?: unknown } | null>;
  readonly listWorldBookEntries: (
    wbId: string,
    opts: { readonly limit: number; readonly offset: number; readonly userId: string },
  ) => Promise<{ readonly data: readonly unknown[] }>;
  readonly translateLang: string;
  readonly log: { readonly warn: (msg: string) => void };
  readonly errMsg: (err: unknown) => string;
}

export interface ViewerAssembly {
  assembleCharacter(characterId: string, userId: string): Promise<ViewerData | null>;
  assembleModule(moduleId: string, userId: string): Promise<ViewerData | null>;
}

export function createViewerAssembly(deps: ViewerAssemblyDeps): ViewerAssembly {
  async function buildTranslatedGroupNameByWbId(
    characterName: string,
    data: LumirealmCharacterData,
    worldBooks: readonly FetchedWorldBook[],
    userId: string,
  ): Promise<ReadonlyMap<string, string>> {
    const out = new Map<string, string>();
    const moduleWbMap = data.user_overrides.attached_module_world_books ?? {};
    const wbIdToModuleId = new Map<string, string>();
    for (const [moduleId, wbId] of Object.entries(moduleWbMap)) {
      if (typeof wbId === 'string') wbIdToModuleId.set(wbId, moduleId);
    }
    const txCharName = data.translations?.[deps.translateLang]?.name;
    for (const wb of worldBooks) {
      const moduleId = wbIdToModuleId.get(wb.id);
      if (moduleId !== undefined) {
        try {
          const env = await deps.readModule(moduleId, userId);
          const txMod = env?.translations?.[deps.translateLang]?.name;
          const origMod = (env?.module as { name?: unknown } | undefined)?.name;
          if (txMod !== undefined && typeof origMod === 'string' && origMod.length > 0 && origMod !== txMod) {
            out.set(wb.id, wb.name.includes(origMod) ? wb.name.replace(origMod, txMod) : txMod);
          }
        } catch (err) {
          deps.log.warn(`buildTranslatedGroupNameByWbId: module=${moduleId} read failed: ${deps.errMsg(err)}`);
        }
        continue;
      }
      if (txCharName !== undefined && txCharName !== characterName) {
        out.set(
          wb.id,
          wb.name.includes(characterName) ? wb.name.replace(characterName, txCharName) : txCharName,
        );
      }
    }
    return out;
  }

  // Merge character + attached-module translation maps for the active language.
  async function collectTranslationsForCharacter(
    data: LumirealmCharacterData,
    userId: string,
  ): Promise<ReadonlyMap<string, string>> {
    const out = new Map<string, string>();
    const charLore = data.translations?.[deps.translateLang]?.lorebook;
    if (charLore) {
      for (const [hash, t] of Object.entries(charLore)) {
        if (typeof t?.comment === 'string') out.set(hash, t.comment);
      }
    }
    const attachedIds = data.user_overrides.attached_module_ids ?? [];
    for (const moduleId of attachedIds) {
      try {
        const env = await deps.readModule(moduleId, userId);
        const modLore = env?.translations?.[deps.translateLang]?.lorebook;
        if (!modLore) continue;
        for (const [hash, t] of Object.entries(modLore)) {
          if (typeof t?.comment === 'string') out.set(hash, t.comment);
        }
      } catch (err) {
        deps.log.warn(`collectTranslationsForCharacter: module=${moduleId} read failed: ${deps.errMsg(err)}`);
      }
    }
    return out;
  }

  async function fetchWorldBooks(
    characterId: string,
    userId: string,
    warnings: string[],
  ): Promise<readonly FetchedWorldBook[]> {
    let wbIds: readonly string[];
    try {
      const ch = await deps.fetchCharacter(characterId, userId);
      wbIds = Array.isArray(ch?.world_book_ids)
        ? ch.world_book_ids.filter((x): x is string => typeof x === 'string')
        : [];
    } catch (err) {
      warnings.push(`Could not fetch world_book_ids: ${deps.errMsg(err)}`);
      return [];
    }
    if (wbIds.length === 0) return [];
    const out: FetchedWorldBook[] = [];
    for (const wbId of wbIds) {
      try {
        const meta = await deps.fetchWorldBookMeta(wbId, userId);
        const name = typeof meta?.name === 'string' && meta.name.length > 0 ? meta.name : wbId;
        const entries: FetchedWorldBookEntry[] = [];
        let offset = 0;
        while (true) {
          const page = await deps.listWorldBookEntries(wbId, { limit: 200, offset, userId });
          for (const e of page.data) {
            const ee = e as unknown as Record<string, unknown>;
            const id = typeof ee['id'] === 'string' ? ee['id'] : null;
            if (id === null) continue;
            const keyRaw = ee['key'];
            const key = Array.isArray(keyRaw)
              ? keyRaw.filter((x): x is string => typeof x === 'string')
              : typeof keyRaw === 'string' ? [keyRaw] : [];
            const ext = ee['extensions'] && typeof ee['extensions'] === 'object' && !Array.isArray(ee['extensions'])
              ? ee['extensions'] as Record<string, unknown>
              : null;
            entries.push({
              id,
              key,
              content: typeof ee['content'] === 'string' ? ee['content'] : '',
              ...(typeof ee['comment'] === 'string' ? { comment: ee['comment'] } : {}),
              ...(typeof ee['disabled'] === 'boolean' ? { disabled: ee['disabled'] } : {}),
              ...(typeof ee['constant'] === 'boolean' ? { constant: ee['constant'] } : {}),
              ...(typeof ee['order_value'] === 'number' ? { orderValue: ee['order_value'] } : {}),
              ...(typeof ee['priority'] === 'number' ? { priority: ee['priority'] } : {}),
              ...(typeof ee['position'] === 'number' ? { position: ee['position'] } : {}),
              ...(typeof ee['depth'] === 'number' ? { depth: ee['depth'] } : {}),
              extensions: ext,
            });
          }
          if (page.data.length < 200) break;
          offset += 200;
        }
        out.push({ id: wbId, name, entries });
      } catch (err) {
        warnings.push(`world_book ${wbId}: ${deps.errMsg(err)}`);
      }
    }
    return out;
  }

  async function assembleCharacter(characterId: string, userId: string): Promise<ViewerData | null> {
    const fetched = await deps.readLumirealm(characterId, userId);
    if (!fetched || !fetched.data) return null;
    const fetchWarnings: string[] = [];
    const worldBooks = await fetchWorldBooks(characterId, userId, fetchWarnings);
    const translatedCommentBySourceHash = await collectTranslationsForCharacter(fetched.data, userId);
    const translatedGroupNameByWbId = await buildTranslatedGroupNameByWbId(
      fetched.character.name,
      fetched.data,
      worldBooks,
      userId,
    );
    const moduleIdByWbId = new Map<string, string>();
    const wbMap = fetched.data.user_overrides.attached_module_world_books ?? {};
    for (const [moduleId, wbId] of Object.entries(wbMap)) {
      if (typeof wbId === 'string') moduleIdByWbId.set(wbId, moduleId);
    }
    return buildCharacterViewerData({
      characterId,
      characterName: fetched.character.name,
      data: fetched.data,
      creatorNotes: fetched.character.creator_notes ?? '',
      worldBooks,
      fetchWarnings,
      translatedCommentBySourceHash,
      translatedGroupNameByWbId,
      moduleIdByWbId,
    });
  }

  async function assembleModule(moduleId: string, userId: string): Promise<ViewerData | null> {
    const env = await deps.readModule(moduleId, userId);
    if (!env) return null;
    return buildModuleViewerData({ envelope: env as never });
  }

  return { assembleCharacter, assembleModule };
}
