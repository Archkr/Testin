declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

import type { BackendToFrontend, CardSummary } from '../types/messages.js';
import type { PendingImportCompletion } from '../handlers/import.js';
import { computeDepthPromptSeed } from '../state/depth-prompt-seed.js';
import { expectChatChange } from '../state/own-chat-change.js';
import { setActivePersonaImage, imageUrlFromId } from '../interpreter/image-cache.js';

// Force a synchronous GC pass after large uploads. JSC's incremental GC otherwise leaves upload-pipeline garbage rooted for minutes without slack.
export function makeNudgeGc(log: { info(m: string): void; warn(m: string): void }, errMsg: (e: unknown) => string): (reason: string) => void {
  return (reason: string) => {
    const bun = (globalThis as {
      Bun?: { gc?: (sync: boolean) => number | void };
    }).Bun;
    if (!bun?.gc) return;
    const t0 = Date.now();
    try {
      bun.gc(true);
    } catch (err) {
      log.warn(`nudgeGc(${reason}): threw, ${errMsg(err)}`);
      return;
    }
    log.info(`nudgeGc(${reason}): elapsed=${Date.now() - t0}ms`);
  };
}

export interface RefreshPersonaImageDeps {
  readonly log: { readonly debug: (m: string) => void };
  readonly errMsg: (e: unknown) => string;
}

export function makeRefreshPersonaImage(deps: RefreshPersonaImageDeps): (userId: string) => Promise<void> {
  return async (userId) => {
    try {
      const persona = await spindle.personas.getActive(userId).catch(() => null);
      const rawId = (persona as { image_id?: unknown } | null)?.image_id;
      setActivePersonaImage(
        userId,
        imageUrlFromId(typeof rawId === 'string' ? rawId : null) ?? '',
      );
    } catch (err) {
      deps.log.debug(`refreshPersonaImage: ${deps.errMsg(err)}`);
    }
  };
}

export interface SeedAuthorsNoteDeps {
  readonly log: { readonly info: (m: string) => void; readonly warn: (m: string) => void };
  readonly errMsg: (e: unknown) => string;
}

export function makeSeedAuthorsNoteFromDepthPrompt(
  deps: SeedAuthorsNoteDeps,
): (chatId: string, userId: string, characterExtensions: Readonly<Record<string, unknown>>) => Promise<void> {
  return async (chatId, userId, characterExtensions) => {
    let chat: { metadata?: unknown } | null;
    try {
      chat = (await spindle.chats.get(chatId, userId)) as { metadata?: unknown } | null;
    } catch (err) {
      deps.log.warn(`seedAuthorsNoteFromDepthPrompt: chats.get failed chat=${chatId}: ${deps.errMsg(err)}`);
      return;
    }
    const currentMeta = chat?.metadata && typeof chat.metadata === 'object' && !Array.isArray(chat.metadata)
      ? (chat.metadata as Record<string, unknown>)
      : {};
    const decision = computeDepthPromptSeed(characterExtensions, currentMeta);
    if (!decision.shouldWrite) return;
    try {
      expectChatChange(chatId);
      await spindle.chats.update(chatId, { metadata: decision.nextMetadata as never }, userId);
      deps.log.info(
        `seedAuthorsNoteFromDepthPrompt: ${decision.outcome} chat=${chatId} ` +
          `preserved_existing=${decision.preservedExisting}`,
      );
    } catch (err) {
      deps.log.warn(`seedAuthorsNoteFromDepthPrompt: chats.update failed chat=${chatId}: ${deps.errMsg(err)}`);
    }
  };
}

export interface MaybeFinalizeImportDeps {
  readonly pendingImportCompletions: Map<string, PendingImportCompletion>;
  readonly send: (msg: BackendToFrontend, userId: string | undefined) => void;
  readonly listCards: (userId: string | undefined) => Promise<readonly CardSummary[]>;
  readonly pushCards: (cards: readonly CardSummary[], userId: string | undefined) => void;
  readonly log: { readonly info: (m: string) => void; readonly warn: (m: string) => void };
  readonly errMsg: (e: unknown) => string;
}

export function makeMaybeFinalizeImport(deps: MaybeFinalizeImportDeps): (characterId: string) => Promise<void> {
  const { pendingImportCompletions, send, listCards, pushCards, log, errMsg } = deps;
  return async (characterId) => {
    const pending = pendingImportCompletions.get(characterId);
    if (!pending) return;
    if (pending.hasPendingSvgRaster) {
      log.info(
        `import.finalize: char=${characterId} still pending,svg=${pending.hasPendingSvgRaster}`,
      );
      return;
    }
    pendingImportCompletions.delete(characterId);
    log.info(
      `import.finalize: char=${characterId} both async ops complete after ${Date.now() - pending.startedAt}ms,emitting phase=done`,
    );
    send({
      type: 'import_progress',
      phase: 'done',
      message: `Imported ${pending.characterName}`,
      fraction: 1,
      characterId,
    }, pending.ownerUserId);
    try {
      pushCards(await listCards(pending.ownerUserId), pending.ownerUserId);
    } catch (err) {
      log.warn(`import.finalize: pushCards failed: ${errMsg(err)}`);
    }
  };
}
