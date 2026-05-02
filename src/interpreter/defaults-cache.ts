// Per-character scriptstate defaults cache. Written by backend.ts on
// ensureActiveCardForChat; read by macro + trigger runtime.
// Keyed by characterId; secondary index by chatId for callers that only have chatId.
// Risu chatVar.svelte.ts consults these on getChatVar miss before returning "null".

const byCharacter = new Map<string, Readonly<Record<string, string>>>();
const chatToCharacter = new Map<string, string>();

export function setActiveScriptstateDefaults(
  chatId: string,
  characterId: string,
  defaults: Readonly<Record<string, string>>,
): void {
  byCharacter.set(characterId, defaults);
  chatToCharacter.set(chatId, characterId);
}

export function clearActiveScriptstateDefaults(chatId: string): void {
  chatToCharacter.delete(chatId);
}

export function getActiveScriptstateDefaults(
  chatId: string | null | undefined,
): Readonly<Record<string, string>> | null {
  if (!chatId) return null;
  const characterId = chatToCharacter.get(chatId);
  if (!characterId) return null;
  return byCharacter.get(characterId) ?? null;
}

export function getScriptstateDefaultsByCharacter(
  characterId: string | null | undefined,
): Readonly<Record<string, string>> | null {
  if (!characterId) return null;
  return byCharacter.get(characterId) ?? null;
}

export function getCharacterIdForChat(
  chatId: string | null | undefined,
): string | null {
  if (!chatId) return null;
  return chatToCharacter.get(chatId) ?? null;
}

export function resetAllScriptstateDefaults(): void {
  byCharacter.clear();
  chatToCharacter.clear();
}
