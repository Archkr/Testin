import type { RealmFrontendToBackend, RealmBackendToFrontend } from './messages.js';
import { searchRealm, getRealmInfo, downloadRealmCard } from './api.js';
import { convertToCharx, type ImportFormatConversion } from './import-formats/index.js';

export interface RealmBackendLog {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

export interface RealmBackendDeps {
  readonly send: (msg: RealmBackendToFrontend, userId: string | undefined) => void;
  readonly log: RealmBackendLog;
  readonly importCardFromBytes: (bytesB64: string, fileName: string, userId: string) => Promise<void>;
}

export interface RealmBackendHandle {
  handle(msg: RealmFrontendToBackend, userId: string | undefined): Promise<void>;
  importAnyFormat(bytesB64: string, fileName: string, userId: string): Promise<void>;
}

export function isRealmFrontendMessage(msg: { type: string }): msg is RealmFrontendToBackend {
  return msg.type === 'realm_search' || msg.type === 'realm_info' || msg.type === 'realm_download';
}

export function setupRealmBackend(deps: RealmBackendDeps): RealmBackendHandle {
  const { send, log, importCardFromBytes } = deps;

  async function handle(msg: RealmFrontendToBackend, userId: string | undefined): Promise<void> {
    switch (msg.type) {
      case 'realm_search': {
        log.info(
          `realm_search: req=${msg.requestId} q=${JSON.stringify(msg.search)} page=${msg.page} sort=${msg.sort} nsfw=${msg.nsfw}`,
        );
        try {
          const r = await searchRealm({
            search: msg.search,
            page: msg.page,
            nsfw: msg.nsfw,
            sort: msg.sort,
          });
          log.info(`realm_search: req=${msg.requestId} -> cards=${r.cards.length}`);
          send({
            type: 'realm_search_result',
            requestId: msg.requestId,
            ok: true,
            cards: r.cards,
            ...(r.additionalHTML !== undefined ? { additionalHTML: r.additionalHTML } : {}),
          }, userId);
        } catch (err) {
          const error = errMessage(err);
          log.warn(`realm_search failed req=${msg.requestId}: ${error}`);
          send({
            type: 'realm_search_result',
            requestId: msg.requestId,
            ok: false,
            cards: [],
            error,
          }, userId);
        }
        break;
      }
      case 'realm_info': {
        log.info(`realm_info: req=${msg.requestId} id=${msg.id}`);
        try {
          const info = await getRealmInfo(msg.id);
          send({ type: 'realm_info_result', requestId: msg.requestId, ok: true, info }, userId);
        } catch (err) {
          const error = errMessage(err);
          log.warn(`realm_info failed req=${msg.requestId}: ${error}`);
          send({ type: 'realm_info_result', requestId: msg.requestId, ok: false, error }, userId);
        }
        break;
      }
      case 'realm_download': {
        log.info(`realm_download: req=${msg.requestId} id=${msg.id}`);
        if (userId === undefined) {
          send({
            type: 'realm_download_started',
            requestId: msg.requestId,
            ok: false,
            id: msg.id,
            error: 'realm_download: no userId',
          }, userId);
          break;
        }
        try {
          const dl = await downloadRealmCard(msg.id);
          log.info(
            `realm_download: req=${msg.requestId} id=${msg.id} contentType=${dl.contentType} bytes=${dl.bytes.byteLength} file=${dl.fileName}`,
          );
          let conv: ImportFormatConversion;
          try {
            conv = convertToCharx(dl.bytes, dl.fileName);
          } catch (err) {
            const error = errMessage(err);
            log.error(`realm_download convert failed req=${msg.requestId} id=${msg.id}: ${error}`);
            send({
              type: 'realm_download_started',
              requestId: msg.requestId,
              ok: false,
              id: msg.id,
              error,
            }, userId);
            break;
          }
          for (const note of conv.notes) log.info(`realm_download: ${note}`);
          send({
            type: 'realm_download_started',
            requestId: msg.requestId,
            ok: true,
            id: msg.id,
            fileName: conv.fileName,
            contentType: dl.contentType,
            bytes: conv.bytes.byteLength,
          }, userId);
          const bytesB64 = bytesToBase64(conv.bytes);
          await importCardFromBytes(bytesB64, conv.fileName, userId);
        } catch (err) {
          const error = errMessage(err);
          log.error(`realm_download failed req=${msg.requestId} id=${msg.id}: ${error}`);
          send({
            type: 'realm_download_started',
            requestId: msg.requestId,
            ok: false,
            id: msg.id,
            error,
          }, userId);
        }
        break;
      }
    }
  }

  async function importAnyFormat(bytesB64: string, fileName: string, userId: string): Promise<void> {
    const bytes = base64ToBytes(bytesB64);
    let conv: ImportFormatConversion;
    try {
      conv = convertToCharx(bytes, fileName);
    } catch (err) {
      log.error(`importAnyFormat: format detection failed file=${fileName}: ${errMessage(err)}`);
      throw err;
    }
    for (const note of conv.notes) log.info(`importAnyFormat: ${note}`);
    if (!conv.synthesized) {
      await importCardFromBytes(bytesB64, fileName, userId);
      return;
    }
    log.info(
      `importAnyFormat: converted ${conv.originalFormat} → charx file=${fileName} → ${conv.fileName} bytes=${conv.bytes.byteLength}`,
    );
    const convB64 = bytesToBase64(conv.bytes);
    await importCardFromBytes(convB64, conv.fileName, userId);
  }

  return { handle, importAnyFormat };
}

function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  const g = globalThis as { Buffer?: { from(b: Uint8Array): { toString(enc: string): string } } };
  if (g.Buffer && typeof g.Buffer.from === 'function') {
    return g.Buffer.from(bytes).toString('base64');
  }
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK);
    bin += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const g = globalThis as { Buffer?: { from(s: string, enc: string): Uint8Array } };
  if (g.Buffer && typeof g.Buffer.from === 'function') {
    return new Uint8Array(g.Buffer.from(b64, 'base64'));
  }
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
