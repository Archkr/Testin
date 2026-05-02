const byCharacter = new Map<string, Readonly<Record<string, readonly string[]>>>();
const chatToCharacter = new Map<string, string>();

export function setActiveModulesByNamespace(
  chatId: string,
  characterId: string,
  modulesByNamespace: Readonly<Record<string, readonly string[]>>,
): void {
  byCharacter.set(characterId, modulesByNamespace);
  chatToCharacter.set(chatId, characterId);
}

export function clearActiveModulesByNamespace(chatId: string): void {
  chatToCharacter.delete(chatId);
}

export function getActiveModulesByNamespace(
  chatId: string | null | undefined,
): Readonly<Record<string, readonly string[]>> | null {
  if (!chatId) return null;
  const characterId = chatToCharacter.get(chatId);
  if (!characterId) return null;
  return byCharacter.get(characterId) ?? null;
}

export function resetAllModulesByNamespace(): void {
  byCharacter.clear();
  chatToCharacter.clear();
}
