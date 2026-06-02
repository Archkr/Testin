const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const DECODE = new Int16Array(256).fill(-1);
for (let i = 0; i < B64_ALPHABET.length; i++) {
  DECODE[B64_ALPHABET.charCodeAt(i)] = i;
}
DECODE["-".charCodeAt(0)] = 62;
DECODE["_".charCodeAt(0)] = 63;

export function base64ToBytes(input: string): Uint8Array {
  const sextets: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const v = DECODE[input.charCodeAt(i)] ?? -1;
    if (v >= 0) sextets.push(v);
  }
  const out = new Uint8Array((sextets.length * 6) >> 3);
  let bitBuf = 0;
  let bitCount = 0;
  let o = 0;
  for (const s of sextets) {
    bitBuf = (bitBuf << 6) | s;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      out[o++] = (bitBuf >> bitCount) & 0xff;
    }
  }
  return out;
}

export function base64ToUtf8(input: string): string {
  return new TextDecoder().decode(base64ToBytes(input));
}
