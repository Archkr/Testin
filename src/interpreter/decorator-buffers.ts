// Cross-hook buffer for Tier 3 lorebook decorator runtime data. Stages
// per-chat injectAt plans (consumed by the system-message mutator) and
// positionPt content (consumed by {{position::NAME}}). 60s TTL covers
// cancelled generations. Separate module to avoid a circular dep.

export interface InjectAtBufferEntry {
  readonly entryId: string;
  readonly loc: string;
  readonly operation: 'append' | 'prepend' | 'replace';
  readonly content: string;
  readonly param: string;
}

export interface DecoratorBuffers {
  readonly injectAt: readonly InjectAtBufferEntry[];
  readonly positionPt: Readonly<Record<string, string>>;
  readonly ts: number;
}

const TTL_MS = 60_000;

const buffersByChat = new Map<string, DecoratorBuffers>();

export function setDecoratorBuffers(
  chatId: string,
  buffers: { injectAt: readonly InjectAtBufferEntry[]; positionPt: Readonly<Record<string, string>> },
): void {
  buffersByChat.set(chatId, { ...buffers, ts: Date.now() });
}

export function getDecoratorBuffers(chatId: string): DecoratorBuffers | null {
  const buf = buffersByChat.get(chatId);
  if (!buf) return null;
  if (Date.now() - buf.ts > TTL_MS) {
    buffersByChat.delete(chatId);
    return null;
  }
  return buf;
}

export function clearDecoratorBuffers(chatId: string): void {
  buffersByChat.delete(chatId);
}

/** Test/diagnostic only. */
export function decoratorBuffersSize(): number {
  return buffersByChat.size;
}
