// Per-character active-lorebook cache. Written on ensureActiveCardForChat;
// read by the macro runtime so {{lorebook}} resolves to real entries.
// Keyed by characterId (all chats of a character share the same world books);
// secondary chatId index for callers that only have a chatId.

import type { LorebookEntry } from "../core/cbs/runtime/context.js";

const byCharacter = new Map<string, readonly LorebookEntry[]>();
const chatToCharacter = new Map<string, string>();

export function setActiveLorebook(
  chatId: string,
  characterId: string,
  entries: readonly LorebookEntry[],
): void {
  byCharacter.set(characterId, entries);
  chatToCharacter.set(chatId, characterId);
}

export function getActiveLorebook(
  chatId: string | null | undefined,
): readonly LorebookEntry[] {
  if (!chatId) return [];
  const characterId = chatToCharacter.get(chatId);
  if (!characterId) return [];
  return byCharacter.get(characterId) ?? [];
}

export function getActiveLorebookByCharacter(
  characterId: string | null | undefined,
): readonly LorebookEntry[] {
  if (!characterId) return [];
  return byCharacter.get(characterId) ?? [];
}

export function hasActiveLorebookForCharacter(characterId: string): boolean {
  return byCharacter.has(characterId);
}

export function clearActiveLorebook(chatId: string): void {
  chatToCharacter.delete(chatId);
}

export function clearActiveLorebookForCharacter(characterId: string): void {
  byCharacter.delete(characterId);
}

export function resetAllActiveLorebook(): void {
  byCharacter.clear();
  chatToCharacter.clear();
}
