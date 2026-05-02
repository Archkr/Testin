import { writeStoredZip } from './zip-writer.js';

export interface JsonCardConversionResult {
  readonly bytes: Uint8Array;
  readonly spec: 'chara_card_v3' | 'chara_card_v2' | 'tavern_v1' | 'unknown';
}

function looksLikeJson(bytes: Uint8Array): boolean {
  for (let i = 0; i < Math.min(bytes.length, 64); i++) {
    const c = bytes[i] ?? 0;
    if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d) continue;
    if (c === 0x7b || c === 0x5b) return true;
    if (c === 0xef && bytes[i + 1] === 0xbb && bytes[i + 2] === 0xbf) {
      i += 2;
      continue;
    }
    return false;
  }
  return false;
}

export function isJsonCardBytes(bytes: Uint8Array): boolean {
  return looksLikeJson(bytes);
}

function detectSpec(card: unknown): JsonCardConversionResult['spec'] {
  if (!card || typeof card !== 'object') return 'unknown';
  const obj = card as { spec?: unknown; name?: unknown; description?: unknown };
  if (obj.spec === 'chara_card_v3') return 'chara_card_v3';
  if (obj.spec === 'chara_card_v2') return 'chara_card_v2';
  if (typeof obj.name === 'string' && typeof obj.description === 'string') {
    return 'tavern_v1';
  }
  return 'unknown';
}

function wrapTavernV1(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: typeof raw['name'] === 'string' ? raw['name'] : '',
      description: typeof raw['description'] === 'string' ? raw['description'] : '',
      personality: typeof raw['personality'] === 'string' ? raw['personality'] : '',
      scenario: typeof raw['scenario'] === 'string' ? raw['scenario'] : '',
      first_mes: typeof raw['first_mes'] === 'string' ? raw['first_mes'] : '',
      mes_example: typeof raw['mes_example'] === 'string' ? raw['mes_example'] : '',
      creator_notes: typeof raw['creator_notes'] === 'string' ? raw['creator_notes'] : '',
      system_prompt: typeof raw['system_prompt'] === 'string' ? raw['system_prompt'] : '',
      post_history_instructions:
        typeof raw['post_history_instructions'] === 'string'
          ? raw['post_history_instructions']
          : '',
      alternate_greetings: Array.isArray(raw['alternate_greetings'])
        ? raw['alternate_greetings']
        : [],
      tags: Array.isArray(raw['tags']) ? raw['tags'] : [],
      creator: typeof raw['creator'] === 'string' ? raw['creator'] : '',
      character_version:
        typeof raw['character_version'] === 'string' ? raw['character_version'] : '1.0',
      extensions: typeof raw['extensions'] === 'object' && raw['extensions'] ? raw['extensions'] : {},
    },
  };
}

export function convertJsonCardToCharx(bytes: Uint8Array): JsonCardConversionResult {
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch (err) {
    throw new Error(`JSON card: failed to decode UTF-8 (${(err as Error).message})`);
  }
  let card: unknown;
  try {
    card = JSON.parse(text);
  } catch (err) {
    throw new Error(`JSON card: not valid JSON (${(err as Error).message})`);
  }
  const spec = detectSpec(card);
  if (spec === 'unknown') {
    throw new Error('JSON card: unrecognized character card schema');
  }

  let normalized: unknown = card;
  if (spec === 'tavern_v1') {
    normalized = wrapTavernV1(card as Record<string, unknown>);
  } else {
    const obj = card as { data?: { character_version?: unknown } };
    if (obj.data && typeof obj.data.character_version === 'number') {
      obj.data.character_version = String(obj.data.character_version);
    }
  }

  const cardJsonBytes = new TextEncoder().encode(JSON.stringify(normalized));
  const zip = writeStoredZip([{ name: 'card.json', data: cardJsonBytes }]);
  return { bytes: zip, spec };
}
