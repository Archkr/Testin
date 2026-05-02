import { crc32Concat } from './crc32.js';

export interface ZipWriterEntry {
  readonly name: string;
  readonly data: Uint8Array;
}

const SIG_LOCAL = [0x50, 0x4b, 0x03, 0x04] as const;
const SIG_CENTRAL = [0x50, 0x4b, 0x01, 0x02] as const;
const SIG_EOCD = [0x50, 0x4b, 0x05, 0x06] as const;

function writeU16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value & 0xffff, true);
}

function writeU32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

interface PreparedEntry {
  readonly nameBytes: Uint8Array;
  readonly data: Uint8Array;
  readonly crc: number;
  readonly localOffset: number;
}

function encodeName(name: string): Uint8Array {
  return new TextEncoder().encode(name);
}

export function writeStoredZip(entries: readonly ZipWriterEntry[]): Uint8Array {
  const prepared: PreparedEntry[] = [];
  let totalLocal = 0;
  for (const entry of entries) {
    const nameBytes = encodeName(entry.name);
    const crc = crc32Concat([entry.data]);
    prepared.push({
      nameBytes,
      data: entry.data,
      crc,
      localOffset: totalLocal,
    });
    totalLocal += 30 + nameBytes.length + entry.data.length;
  }

  let totalCentral = 0;
  for (const e of prepared) {
    totalCentral += 46 + e.nameBytes.length;
  }
  const totalSize = totalLocal + totalCentral + 22;
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);

  let pos = 0;
  for (const e of prepared) {
    out[pos] = SIG_LOCAL[0];
    out[pos + 1] = SIG_LOCAL[1];
    out[pos + 2] = SIG_LOCAL[2];
    out[pos + 3] = SIG_LOCAL[3];
    writeU16(view, pos + 4, 20);
    writeU16(view, pos + 6, 0x0800);
    writeU16(view, pos + 8, 0);
    writeU16(view, pos + 10, 0);
    writeU16(view, pos + 12, 0);
    writeU32(view, pos + 14, e.crc);
    writeU32(view, pos + 18, e.data.length);
    writeU32(view, pos + 22, e.data.length);
    writeU16(view, pos + 26, e.nameBytes.length);
    writeU16(view, pos + 28, 0);
    out.set(e.nameBytes, pos + 30);
    out.set(e.data, pos + 30 + e.nameBytes.length);
    pos += 30 + e.nameBytes.length + e.data.length;
  }

  const cdStart = pos;
  for (const e of prepared) {
    out[pos] = SIG_CENTRAL[0];
    out[pos + 1] = SIG_CENTRAL[1];
    out[pos + 2] = SIG_CENTRAL[2];
    out[pos + 3] = SIG_CENTRAL[3];
    writeU16(view, pos + 4, 0x031e);
    writeU16(view, pos + 6, 20);
    writeU16(view, pos + 8, 0x0800);
    writeU16(view, pos + 10, 0);
    writeU16(view, pos + 12, 0);
    writeU16(view, pos + 14, 0);
    writeU32(view, pos + 16, e.crc);
    writeU32(view, pos + 20, e.data.length);
    writeU32(view, pos + 24, e.data.length);
    writeU16(view, pos + 28, e.nameBytes.length);
    writeU16(view, pos + 30, 0);
    writeU16(view, pos + 32, 0);
    writeU16(view, pos + 34, 0);
    writeU16(view, pos + 36, 0);
    writeU32(view, pos + 38, 0);
    writeU32(view, pos + 42, e.localOffset);
    out.set(e.nameBytes, pos + 46);
    pos += 46 + e.nameBytes.length;
  }

  out[pos] = SIG_EOCD[0];
  out[pos + 1] = SIG_EOCD[1];
  out[pos + 2] = SIG_EOCD[2];
  out[pos + 3] = SIG_EOCD[3];
  writeU16(view, pos + 4, 0);
  writeU16(view, pos + 6, 0);
  writeU16(view, pos + 8, prepared.length);
  writeU16(view, pos + 10, prepared.length);
  writeU32(view, pos + 12, totalCentral);
  writeU32(view, pos + 16, cdStart);
  writeU16(view, pos + 20, 0);

  return out;
}
