
const characterImageByChat = new Map<string, string>();
const personaImageByUser = new Map<string, string>();

export function imageUrlFromId(imageId: string | null | undefined): string {
  if (!imageId || typeof imageId !== 'string' || imageId.length === 0) return '';
  return `/api/v1/images/${imageId}`;
}

export function setActiveCharacterImage(chatId: string, imageUrl: string): void {
  characterImageByChat.set(chatId, imageUrl);
}

export function getActiveCharacterImage(chatId: string): string {
  return characterImageByChat.get(chatId) ?? '';
}

export function clearActiveCharacterImage(chatId: string): void {
  characterImageByChat.delete(chatId);
}

export function setActivePersonaImage(userId: string, imageUrl: string): void {
  personaImageByUser.set(userId, imageUrl);
}

export function getActivePersonaImage(userId: string | undefined): string {
  if (userId === undefined) return '';
  return personaImageByUser.get(userId) ?? '';
}
