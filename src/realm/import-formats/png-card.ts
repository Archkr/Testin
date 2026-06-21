import { extractPngTextChunks, isPngBytes } from './png-chunks.js';
import { base64ToBytes } from '../../util/base64.js';
import { writeStoredZip } from './zip-writer.js';
import type { ZipWriterEntry } from './zip-writer.js';

export interface PngCardConversionResult {
  readonly bytes: Uint8Array;
  readonly assetCount: number;
  readonly spec: 'chara_card_v3' | 'chara_card_v2' | 'unknown';
  readonly hasV3: boolean;
}

const ASSET_KEY_PREFIX = 'chara-ext-asset_';

interface DecodedAsset {
  readonly key: string;
  readonly bytes: Uint8Array;
}

function base64Decode(str: string): Uint8Array {
  return base64ToBytes(str);
}

function decodeBase64Json(text: string): unknown {
  const bytes = base64Decode(text);
  const decoded = new TextDecoder('utf-8').decode(bytes);
  return JSON.parse(decoded);
}

function normalizeAssetKey(rawKey: string): string {
  let key = rawKey.startsWith(ASSET_KEY_PREFIX) ? rawKey.slice(ASSET_KEY_PREFIX.length) : rawKey;
  if (key.startsWith(':')) key = key.slice(1);
  return key;
}

export function convertPngCardToCharx(bytes: Uint8Array): PngCardConversionResult {
  if (!isPngBytes(bytes)) {
    throw new Error('not a PNG file');
  }

  const chunks = extractPngTextChunks(bytes);
  if (chunks.length === 0) {
    throw new Error('PNG has no text chunks: not a Risu/Tavern card');
  }

  let charaText = '';
  let ccv3Text = '';
  const assets: DecodedAsset[] = [];

  for (const c of chunks) {
    if (c.key === 'chara') {
      if (charaText.length === 0 && c.text.length < 5 * 1024 * 1024) {
        charaText = c.text;
      }
      continue;
    }
    if (c.key === 'ccv3') {
      if (ccv3Text.length === 0 && c.text.length < 5 * 1024 * 1024) {
        ccv3Text = c.text;
      }
      continue;
    }
    if (c.key.startsWith(ASSET_KEY_PREFIX)) {
      try {
        const assetBytes = base64Decode(c.text);
        const id = normalizeAssetKey(c.key);
        assets.push({ key: id, bytes: assetBytes });
      } catch {
        void 0;
      }
    }
  }

  if (!charaText && !ccv3Text) {
    throw new Error('PNG has no `chara` or `ccv3` chunk: not a character card');
  }

  const sourceText = ccv3Text || charaText;
  let card: unknown;
  try {
    card = decodeBase64Json(sourceText);
  } catch (err) {
    throw new Error(`failed to decode card chunk: ${(err as Error).message}`);
  }

  const obj = card as { spec?: unknown; data?: { character_version?: unknown } };
  if (obj.data && typeof obj.data.character_version === 'number') {
    obj.data.character_version = String(obj.data.character_version);
  }

  let spec: 'chara_card_v3' | 'chara_card_v2' | 'unknown' = 'unknown';
  if (obj.spec === 'chara_card_v3') spec = 'chara_card_v3';
  else if (obj.spec === 'chara_card_v2') spec = 'chara_card_v2';

  const cardJsonText = JSON.stringify(card);
  const cardJsonBytes = new TextEncoder().encode(cardJsonText);

  const entries: ZipWriterEntry[] = [
    { name: 'card.json', data: cardJsonBytes },
    // PNG itself is the canonical avatar (CCv2/v3); pickAvatar finds it here.
    { name: 'assets/icon/main.png', data: bytes },
  ];

  for (const a of assets) {
    entries.push({ name: a.key, data: a.bytes });
  }

  const zip = writeStoredZip(entries);
  return {
    bytes: zip,
    assetCount: assets.length,
    spec,
    hasV3: ccv3Text.length > 0,
  };
}
