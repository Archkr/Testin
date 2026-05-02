// Pure mutations for name → asset-id maps.
// Characters use multi-source entries (imageIds[]); modules use single-source (imageId).
// Character add appends to imageIds; module add replaces. Rename and delete are idempotent.

import type { AssetIndexEntry } from '../payload/types.js';

/** Module-side asset entry shape (single-source per Risu module). */
export interface ModuleAssetRef {
  readonly imageId: string;
  readonly ext?: string;
  readonly bytes?: number;
}

export type CharacterAssetIndex = Readonly<Record<string, AssetIndexEntry>>;
export type ModuleAssetIndex = Readonly<Record<string, ModuleAssetRef>>;

export interface AssetMutationResult<I> {
  readonly ok: boolean;
  readonly index: I;
  /** Set when `ok === false`. */
  readonly reason?: string;
}


export function addAssetToCharacterIndex(
  index: CharacterAssetIndex,
  name: string,
  imageId: string,
  ext: string | undefined,
): AssetMutationResult<CharacterAssetIndex> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, index, reason: 'asset name is empty' };
  }
  if (typeof imageId !== 'string' || imageId.length === 0) {
    return { ok: false, index, reason: 'imageId is empty' };
  }
  const next: Record<string, AssetIndexEntry> = { ...index };
  const existing = index[trimmed];
  if (existing) {
    // Multi-source: append, de-dup.
    if (existing.imageIds.includes(imageId)) {
      return { ok: false, index, reason: `image already attached to ${trimmed}` };
    }
    next[trimmed] = {
      imageIds: [...existing.imageIds, imageId],
      // Keep the first-seen ext; later entries don't override.
      ...(existing.ext !== undefined ? { ext: existing.ext } : {}),
    };
  } else {
    next[trimmed] = {
      imageIds: [imageId],
      ...(ext !== undefined ? { ext } : {}),
    };
  }
  return { ok: true, index: next };
}

export function renameCharacterAsset(
  index: CharacterAssetIndex,
  oldName: string,
  newName: string,
): AssetMutationResult<CharacterAssetIndex> {
  const newTrim = newName.trim();
  if (newTrim.length === 0) {
    return { ok: false, index, reason: 'new name is empty' };
  }
  if (oldName === newTrim) {
    return { ok: false, index, reason: 'new name is identical to old name' };
  }
  const entry = index[oldName];
  if (!entry) {
    return { ok: false, index, reason: `asset "${oldName}" not found` };
  }
  if (Object.prototype.hasOwnProperty.call(index, newTrim)) {
    return { ok: false, index, reason: `asset "${newTrim}" already exists` };
  }
  const next: Record<string, AssetIndexEntry> = {};
  for (const [k, v] of Object.entries(index)) {
    if (k === oldName) next[newTrim] = v;
    else next[k] = v;
  }
  return { ok: true, index: next };
}

export function deleteCharacterAsset(
  index: CharacterAssetIndex,
  name: string,
): AssetMutationResult<CharacterAssetIndex> {
  if (!Object.prototype.hasOwnProperty.call(index, name)) {
    return { ok: true, index }; // idempotent
  }
  const next: Record<string, AssetIndexEntry> = { ...index };
  delete next[name];
  return { ok: true, index: next };
}


export function addAssetToModuleIndex(
  index: ModuleAssetIndex,
  name: string,
  imageId: string,
  ext: string | undefined,
): AssetMutationResult<ModuleAssetIndex> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, index, reason: 'asset name is empty' };
  }
  if (typeof imageId !== 'string' || imageId.length === 0) {
    return { ok: false, index, reason: 'imageId is empty' };
  }
  // Modules are single-source: replace on existing name.
  const next: Record<string, ModuleAssetRef> = { ...index };
  next[trimmed] = {
    imageId,
    ...(ext !== undefined ? { ext } : {}),
  };
  return { ok: true, index: next };
}

export function renameModuleAsset(
  index: ModuleAssetIndex,
  oldName: string,
  newName: string,
): AssetMutationResult<ModuleAssetIndex> {
  const newTrim = newName.trim();
  if (newTrim.length === 0) {
    return { ok: false, index, reason: 'new name is empty' };
  }
  if (oldName === newTrim) {
    return { ok: false, index, reason: 'new name is identical to old name' };
  }
  const entry = index[oldName];
  if (!entry) {
    return { ok: false, index, reason: `asset "${oldName}" not found` };
  }
  if (Object.prototype.hasOwnProperty.call(index, newTrim)) {
    return { ok: false, index, reason: `asset "${newTrim}" already exists` };
  }
  const next: Record<string, ModuleAssetRef> = {};
  for (const [k, v] of Object.entries(index)) {
    if (k === oldName) next[newTrim] = v;
    else next[k] = v;
  }
  return { ok: true, index: next };
}

export function deleteModuleAsset(
  index: ModuleAssetIndex,
  name: string,
): AssetMutationResult<ModuleAssetIndex> {
  if (!Object.prototype.hasOwnProperty.call(index, name)) {
    return { ok: true, index };
  }
  const next: Record<string, ModuleAssetRef> = { ...index };
  delete next[name];
  return { ok: true, index: next };
}
