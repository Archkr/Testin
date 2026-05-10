// Pure orphan-detection logic. Tests inject mocks via OrphanDetectDeps,
// backend wires the real Spindle / userStorage layer.

import type { ImageJournalFile } from './image-journal.js';
import type { ModuleImageJournalFile } from './module-image-journal.js';

export interface CharacterRecordView {
  readonly id: string;
  readonly image_id?: string | null;
  readonly asset_index?: Readonly<Record<string, { imageIds?: readonly string[] }>>;
  readonly emotion_index?: Readonly<Record<string, { imageIds?: readonly string[] }>>;
  readonly regex_replace_strings?: readonly string[];
  readonly background_html?: string | null;
}

export interface ModuleRecordView {
  readonly id: string;
  readonly asset_imageIds: readonly string[];
}

export interface OrphanDetectDeps {
  /** Lumirealm-managed live characters (filtered already). */
  listLumirealmCharacters(): Promise<readonly CharacterRecordView[]>;
  /** Live module envelopes. */
  listModules(): Promise<readonly ModuleRecordView[]>;
  /** Active journals only (status === 'active'). Pending_delete is the caller's filter. */
  listActiveCharacterJournals(): Promise<readonly ImageJournalFile[]>;
  listActiveModuleJournals(): Promise<readonly ModuleImageJournalFile[]>;
  /** Returns true if the character row still exists at the host. */
  characterExists(id: string): Promise<boolean>;
  /** Returns true if the module envelope still exists locally. */
  moduleExists(id: string): Promise<boolean>;
}

export interface LiveSetReport {
  readonly liveIds: ReadonlySet<string>;
  readonly liveCharacterRefs: number;
  readonly liveModuleRefs: number;
  readonly liveJournalRefs: number;
  readonly charactersScanned: number;
  readonly modulesScanned: number;
  readonly skippedJournalCharacters: readonly string[];
  readonly skippedJournalModules: readonly string[];
}

const IMAGE_URL_RE = /\/api\/v1\/images\/([A-Za-z0-9_\-]+)/g;

export function extractImageUrlIds(text: string | null | undefined): readonly string[] {
  if (typeof text !== 'string' || text.length === 0) return [];
  const out: string[] = [];
  IMAGE_URL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = IMAGE_URL_RE.exec(text)) !== null) {
    if (m[1] && m[1].length > 0) out.push(m[1]);
  }
  return out;
}

/**
 * Build the set of image IDs that live characters, live modules, and
 * still-attached journals reference. A journal whose owner (character or
 * module) is gone is intentionally NOT counted as "live", those IDs are
 * orphan candidates, not safety-net entries.
 */
export async function buildLiveImageIdSet(
  deps: OrphanDetectDeps,
): Promise<LiveSetReport> {
  const liveIds = new Set<string>();
  let liveCharacterRefs = 0;
  let liveModuleRefs = 0;
  let liveJournalRefs = 0;

  const addId = (id: unknown, bumpKind: 'char' | 'module' | 'journal'): void => {
    if (typeof id !== 'string' || id.length === 0) return;
    if (liveIds.has(id)) return;
    liveIds.add(id);
    if (bumpKind === 'char') liveCharacterRefs++;
    else if (bumpKind === 'module') liveModuleRefs++;
    else liveJournalRefs++;
  };

  const characters = await deps.listLumirealmCharacters();
  for (const c of characters) {
    addId(c.image_id, 'char');
    for (const entry of Object.values(c.asset_index ?? {})) {
      for (const id of entry.imageIds ?? []) addId(id, 'char');
    }
    for (const entry of Object.values(c.emotion_index ?? {})) {
      for (const id of entry.imageIds ?? []) addId(id, 'char');
    }
    for (const replace of c.regex_replace_strings ?? []) {
      for (const id of extractImageUrlIds(replace)) addId(id, 'char');
    }
    for (const id of extractImageUrlIds(c.background_html)) addId(id, 'char');
  }

  const modules = await deps.listModules();
  for (const m of modules) {
    for (const id of m.asset_imageIds) addId(id, 'module');
  }

  // Journals shield only when the owner still exists. A journal whose owner
  // is gone is the deleted-while-off signal, its IDs are orphan candidates.
  const skippedJournalCharacters: string[] = [];
  const skippedJournalModules: string[] = [];
  const charJournals = await deps.listActiveCharacterJournals();
  for (const j of charJournals) {
    // Transient throw treated as absent: cleanup scan must not shield IDs we couldn't verify, matches pre-refactor inline behavior.
    let exists = false;
    try { exists = await deps.characterExists(j.characterId); } catch { exists = false; }
    if (!exists) {
      skippedJournalCharacters.push(j.characterId);
      continue;
    }
    for (const id of j.imageIds) addId(id, 'journal');
  }
  const moduleJournals = await deps.listActiveModuleJournals();
  for (const j of moduleJournals) {
    let exists = false;
    try { exists = await deps.moduleExists(j.moduleId); } catch { exists = false; }
    if (!exists) {
      skippedJournalModules.push(j.moduleId);
      continue;
    }
    for (const id of j.imageIds) addId(id, 'journal');
  }

  return {
    liveIds,
    liveCharacterRefs,
    liveModuleRefs,
    liveJournalRefs,
    charactersScanned: characters.length,
    modulesScanned: modules.length,
    skippedJournalCharacters,
    skippedJournalModules,
  };
}
