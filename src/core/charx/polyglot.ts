
const ZIP_LOCAL_HEADER = [0x50, 0x4b, 0x03, 0x04] as const; // PK\x03\x04
const JPEG_SOI = [0xff, 0xd8, 0xff] as const;
const JPEG_EOI = [0xff, 0xd9] as const;
const POLYGLOT_SCAN_LIMIT = 10 * 1024 * 1024;

function startsWith(buf: Uint8Array, needle: readonly number[], offset = 0): boolean {
  if (buf.length - offset < needle.length) return false;
  for (let i = 0; i < needle.length; i++) if (buf[offset + i] !== needle[i]) return false;
  return true;
}

export function findJpegZipBoundary(data: Uint8Array): number {
  if (data.length < 10 || !startsWith(data, JPEG_SOI)) return -1;
  const limit = Math.min(data.length - (JPEG_EOI.length + ZIP_LOCAL_HEADER.length), POLYGLOT_SCAN_LIMIT);
  for (let i = 2; i < limit; i++) {
    if (
      data[i] === JPEG_EOI[0] &&
      data[i + 1] === JPEG_EOI[1] &&
      data[i + 2] === ZIP_LOCAL_HEADER[0] &&
      data[i + 3] === ZIP_LOCAL_HEADER[1] &&
      data[i + 4] === ZIP_LOCAL_HEADER[2] &&
      data[i + 5] === ZIP_LOCAL_HEADER[3]
    ) {
      return i + 2;
    }
  }
  return -1;
}

export function isZipArchive(data: Uint8Array): boolean {
  return startsWith(data, ZIP_LOCAL_HEADER);
}

export function stripPolyglot(data: Uint8Array): Uint8Array {
  if (isZipArchive(data)) return data;
  const off = findJpegZipBoundary(data);
  if (off < 0) {
    throw new PolyglotNotFoundError(data);
  }
  return data.subarray(off);
}

export class PolyglotNotFoundError extends Error {
  readonly firstBytes: string;
  constructor(data: Uint8Array) {
    const hex = Array.from(data.subarray(0, 8))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    super(`not a ZIP or JPEG+ZIP polyglot (first bytes: ${hex})`);
    this.name = "PolyglotNotFoundError";
    this.firstBytes = hex;
  }
}
