let CRC_TABLE: Uint32Array | null = null;

function getTable(): Uint32Array {
  if (CRC_TABLE) return CRC_TABLE;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  CRC_TABLE = table;
  return table;
}

export function crc32(bytes: Uint8Array, seed = 0): number {
  const table = getTable();
  let c = (seed ^ 0xffffffff) >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    const v = (c ^ (bytes[i] ?? 0)) & 0xff;
    const t = table[v] ?? 0;
    c = (t ^ (c >>> 8)) >>> 0;
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function crc32Concat(parts: readonly Uint8Array[]): number {
  let c = 0xffffffff;
  const table = getTable();
  for (const p of parts) {
    for (let i = 0; i < p.length; i++) {
      const v = (c ^ (p[i] ?? 0)) & 0xff;
      const t = table[v] ?? 0;
      c = (t ^ (c >>> 8)) >>> 0;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}
