export interface RealmCard {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly img: string;
  readonly tags: readonly string[];
  readonly download: number;
  readonly hot: number;
  readonly hasLore: boolean;
  readonly hasEmotion: boolean;
  readonly hasAsset: boolean;
  readonly creator?: string;
  readonly creatorName?: string;
  readonly authorname?: string;
  readonly original?: string;
  readonly type: string;
  readonly viewScreen: string;
  readonly license: string;
  readonly hidden?: boolean;
}

export type RealmSort = '' | 'recommended' | 'trending' | 'downloads' | 'random';

export type RealmFrontendToBackend =
  | {
      type: 'realm_search';
      requestId: string;
      search: string;
      page: number;
      nsfw: boolean;
      sort: RealmSort;
    }
  | { type: 'realm_info'; requestId: string; id: string }
  | { type: 'realm_download'; requestId: string; id: string };

export type RealmBackendToFrontend =
  | {
      type: 'realm_search_result';
      requestId: string;
      ok: boolean;
      cards: readonly RealmCard[];
      additionalHTML?: string;
      error?: string;
    }
  | {
      type: 'realm_info_result';
      requestId: string;
      ok: boolean;
      info?: RealmCard;
      error?: string;
    }
  | {
      type: 'realm_download_started';
      requestId: string;
      ok: boolean;
      id: string;
      fileName?: string;
      contentType?: string;
      bytes?: number;
      error?: string;
    };

export const REALM_HUB_API_URL = 'https://sv.risuai.xyz';
export const REALM_DOWNLOAD_URL = 'https://realm.risuai.net';

export function realmResourceUrl(img: string): string {
  return `${REALM_HUB_API_URL}/resource/${img}`;
}

export function realmShareUrl(id: string): string {
  return `${REALM_DOWNLOAD_URL}/character/${id}`;
}
