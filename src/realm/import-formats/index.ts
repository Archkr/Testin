import { isPngBytes } from './png-chunks.js';
import { convertPngCardToCharx } from './png-card.js';
import { convertJsonCardToCharx, isJsonCardBytes } from './json-card.js';

export type ImportFormat =
  | 'charx'
  | 'jpeg-polyglot'
  | 'png-card'
  | 'json-card'
  | 'unknown';

export interface ImportFormatConversion {
  readonly bytes: Uint8Array;
  readonly fileName: string;
  readonly originalFormat: ImportFormat;
  readonly synthesized: boolean;
  readonly notes: readonly string[];
}

const ZIP_SIG = [0x50, 0x4b, 0x03, 0x04] as const;
const JPEG_SIG = [0xff, 0xd8, 0xff] as const;

function startsWith(bytes: Uint8Array, sig: readonly number[]): boolean {
  if (bytes.length < sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return false;
  }
  return true;
}

function findJpegZipBoundary(data: Uint8Array): number {
  if (data.length < 10 || !startsWith(data, JPEG_SIG)) return -1;
  const limit = Math.min(data.length - 6, 10 * 1024 * 1024);
  for (let i = 2; i < limit; i++) {
    if (
      data[i] === 0xff &&
      data[i + 1] === 0xd9 &&
      data[i + 2] === ZIP_SIG[0] &&
      data[i + 3] === ZIP_SIG[1] &&
      data[i + 4] === ZIP_SIG[2] &&
      data[i + 5] === ZIP_SIG[3]
    ) {
      return i + 2;
    }
  }
  return -1;
}

export function detectImportFormat(bytes: Uint8Array): ImportFormat {
  if (startsWith(bytes, ZIP_SIG)) return 'charx';
  if (isPngBytes(bytes)) return 'png-card';
  if (startsWith(bytes, JPEG_SIG) && findJpegZipBoundary(bytes) >= 0) return 'jpeg-polyglot';
  if (isJsonCardBytes(bytes)) return 'json-card';
  return 'unknown';
}

function deriveCharxName(originalName: string): string {
  const lastDot = originalName.lastIndexOf('.');
  const stem = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  return `${stem}.charx`;
}

export function convertToCharx(
  bytes: Uint8Array,
  fileName: string,
): ImportFormatConversion {
  const format = detectImportFormat(bytes);
  switch (format) {
    case 'charx':
    case 'jpeg-polyglot':
      return {
        bytes,
        fileName,
        originalFormat: format,
        synthesized: false,
        notes: [],
      };
    case 'png-card': {
      const result = convertPngCardToCharx(bytes);
      const notes: string[] = [
        `PNG card: spec=${result.spec} assets=${result.assetCount} v3=${result.hasV3 ? 'yes' : 'no'}`,
      ];
      if (result.spec === 'unknown') {
        notes.push('PNG card: unknown spec field; importing as best-effort.');
      }
      return {
        bytes: result.bytes,
        fileName: deriveCharxName(fileName),
        originalFormat: 'png-card',
        synthesized: true,
        notes,
      };
    }
    case 'json-card': {
      const result = convertJsonCardToCharx(bytes);
      const notes: string[] = [`JSON card: spec=${result.spec}`];
      if (result.spec === 'tavern_v1') {
        notes.push('JSON card: legacy Tavern V1 wrapped as chara_card_v2.');
      } else if (result.spec === 'unknown') {
        notes.push('JSON card: unknown spec; importing as best-effort.');
      }
      return {
        bytes: result.bytes,
        fileName: deriveCharxName(fileName),
        originalFormat: 'json-card',
        synthesized: true,
        notes,
      };
    }
    case 'unknown':
    default: {
      const head = Array.from(bytes.subarray(0, 8))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
      throw new Error(
        `Unrecognized character file format. First bytes: ${head}. ` +
          'Supported: .charx, JPEG+ZIP polyglot, PNG with `chara`/`ccv3` chunk, JSON V2/V3.',
      );
    }
  }
}

export { isPngBytes } from './png-chunks.js';
export { isJsonCardBytes } from './json-card.js';
