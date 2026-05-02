export interface PngChunk {
  readonly type: string;
  readonly key?: string;
  readonly value?: Uint8Array;
  readonly raw: Uint8Array;
}

export const PNG_SIGNATURE: readonly number[] = [
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
];

export function isPngBytes(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIGNATURE.length) return false;
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return false;
  }
  return true;
}

function readU32BE(bytes: Uint8Array, pos: number): number {
  return (
    ((bytes[pos] ?? 0) * 0x1000000 +
      ((bytes[pos + 1] ?? 0) << 16) +
      ((bytes[pos + 2] ?? 0) << 8) +
      (bytes[pos + 3] ?? 0)) >>>
    0
  );
}

function decodeText(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

export function readPngChunks(bytes: Uint8Array): PngChunk[] {
  if (!isPngBytes(bytes)) {
    throw new Error('not a PNG file');
  }
  const out: PngChunk[] = [];
  let pos = 8;
  while (pos + 8 <= bytes.length) {
    const len = readU32BE(bytes, pos);
    const typeBytes = bytes.subarray(pos + 4, pos + 8);
    const type = decodeText(typeBytes);
    const dataStart = pos + 8;
    const dataEnd = dataStart + len;
    if (dataEnd + 4 > bytes.length) break;
    const data = bytes.subarray(dataStart, dataEnd);
    if (type === 'tEXt') {
      let nullIdx = -1;
      for (let i = 0; i < data.length && i < 79; i++) {
        if (data[i] === 0) {
          nullIdx = i;
          break;
        }
      }
      if (nullIdx >= 0) {
        const key = decodeText(data.subarray(0, nullIdx));
        const value = data.subarray(nullIdx + 1);
        out.push({ type, key, value, raw: data });
      } else {
        out.push({ type, raw: data });
      }
    } else if (type === 'zTXt') {
      let nullIdx = -1;
      for (let i = 0; i < data.length && i < 79; i++) {
        if (data[i] === 0) {
          nullIdx = i;
          break;
        }
      }
      if (nullIdx >= 0) {
        const key = decodeText(data.subarray(0, nullIdx));
        out.push({ type, key, raw: data });
      } else {
        out.push({ type, raw: data });
      }
    } else {
      out.push({ type, raw: data });
    }
    pos = dataEnd + 4;
    if (type === 'IEND') break;
  }
  return out;
}

export interface ExtractedTextChunk {
  readonly key: string;
  readonly text: string;
}

export function extractPngTextChunks(bytes: Uint8Array): ExtractedTextChunk[] {
  const chunks = readPngChunks(bytes);
  const out: ExtractedTextChunk[] = [];
  for (const c of chunks) {
    if (c.type !== 'tEXt') continue;
    if (!c.key || !c.value) continue;
    out.push({ key: c.key, text: decodeText(c.value) });
  }
  return out;
}
