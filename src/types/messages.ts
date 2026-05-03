// Frontend ↔ backend wire types.

import type {
  RealmFrontendToBackend,
  RealmBackendToFrontend,
} from '../realm/messages.js';

/** One-entry-per-imported-card summary. Backend composes from `StoredRisuCard`
 *  + `spindle.characters.get` name lookup. UI renders directly. */
export interface CardSummary {
  readonly character_id: string;
  /** `null` when the Lumiverse character row is missing (e.g. deleted before
   *  `CHARACTER_DELETED` was observed). */
  readonly character_name: string | null;
  readonly translator_version: string;
  readonly uses_lua: boolean;
  readonly stored_at: number;
}

/** Phase is a strict union for reliable UI colour/error styling. */
export interface ImportProgress {
  readonly phase:
    | 'decoding'
    | 'translating'
    | 'awaiting_consent'
    | 'creating_character'
    | 'uploading_assets'
    | 'saving_payload'
    | 'done'
    | 'error';
  readonly message: string;
  /** 0..1 fractional progress, or `null` when indeterminate. */
  readonly fraction: number | null;
}

export interface PendingRegexScriptMsg {
  readonly name: string;
  readonly script_id: string;
  readonly find_regex: string;
  readonly replace_string: string;
  readonly flags: string;
  readonly placement: readonly string[];
  readonly scope: 'global' | 'character' | 'chat';
  readonly scope_id: string | null;
  readonly target: 'prompt' | 'response' | 'display';
  readonly min_depth: number | null;
  readonly max_depth: number | null;
  readonly trim_strings: readonly string[];
  readonly run_on_edit: boolean;
  readonly substitute_macros: 'none' | 'raw' | 'escaped';
  readonly disabled: boolean;
  readonly sort_order: number;
  readonly description: string;
  readonly folder: string;
  readonly metadata: Record<string, unknown>;
}

/** Frontend → Backend. */
export type FrontendToBackend =
  | { type: 'get_cards' }
  // Large cards exceed ~1MB WS frame limits; chunked upload avoids close 1006.
  // Send init → N chunks → commit.
  | {
      type: 'import_card_init';
      /** Client-generated uuid tying init/chunks/commit together. */
      sessionId: string;
      /** Display name for UI + logs. */
      fileName: string;
      /** Total raw bytes across all chunks. */
      totalBytes: number;
      /** Number of chunks the frontend will send. */
      totalChunks: number;
    }
  | {
      type: 'import_card_chunk';
      sessionId: string;
      /** Zero-based chunk index. */
      seq: number;
      /** Base64-encoded raw bytes for this chunk only. */
      bytesB64Chunk: string;
    }
  | { type: 'import_card_commit'; sessionId: string }
  | { type: 'import_card_abort'; sessionId: string; reason?: string }
  | {
      type: 'consent_response';
      requestId: string;
      confirmed: boolean;
    }
  | { type: 'delete_card'; characterId: string }
  // Mirrors Risu's Chat.svelte click delegation:
  // `runTrigger(char, 'manual', {manualName: attrValue})` → Lua `onButtonClick(triggerId, triggerName)`.
  | {
      type: 'manual_trigger';
      /** Value of the `risu-trigger` attribute on the clicked element. */
      triggerName: string;
      /** Optional `risu-id` attribute (rarely set). */
      triggerId?: string;
      /** Chat the click came from. Must be active-Risu-card. */
      chatId: string;
    }
  // Cards branch PC vs mobile CSS in bg-html (`{{? {{screen_width}} > 768 }}`).
  // Backend has no viewport; frontend reports once at setup + on debounced resize;
  // backend caches per-user, plumbs into `resolveReadonlyInWorker`.
  // Risu reads window.inner* (cbs.ts).
  | {
      type: 'screen_dims';
      /** `window.innerWidth` at report time. */
      width: number;
      /** `window.innerHeight` at report time. */
      height: number;
    }
  // Backend replies with `set_variables` push. Also fires on every state-tick lifecycle event.
  | {
      type: 'request_variables_snapshot';
      chatId: string;
    }
  // `value` is always a string, Lumi stringifies on write.
  // Lua-state keys (`__name`) need valid JSON from the user; runtime won't re-encode.
  | {
      type: 'set_variable';
      chatId: string;
      scope: 'local';
      key: string;
      value: string;
    }
  | {
      type: 'delete_variable';
      chatId: string;
      scope: 'local';
      key: string;
    }
  // `update_settings` with sanitized patch → persist + echo back `settings_pushed` so all tabs sync.
  // Connection profiles via `request_connections_list` → `connections_list_pushed`;
  // separate because they're a per-user Lumi property, not ours.
  | {
      type: 'request_settings';
    }
  | {
      type: 'update_settings';
      patch: {
        readonly auxConnectionId?: string | null;
        readonly auxModelOverride?: string | null;
        readonly auxSamplers?: AuxSamplersWire;
        // Independent connection/model/sampler trio.
        readonly submodelConnectionId?: string | null;
        readonly submodelModelOverride?: string | null;
        readonly submodelSamplers?: AuxSamplersWire;
        readonly auxDebugCaptureRequest?: boolean;
        readonly auxDebugCaptureResponse?: boolean;
        readonly legacyMediaFindings?: boolean;
      };
    }
  | {
      type: 'request_connections_list';
    }
  | {
      type: 'upload_module_init';
      sessionId: string;
      fileName: string;
      totalBytes: number;
      totalChunks: number;
    }
  | {
      type: 'upload_module_chunk';
      sessionId: string;
      seq: number;
      bytesB64Chunk: string;
    }
  | { type: 'upload_module_commit'; sessionId: string }
  | { type: 'upload_module_abort'; sessionId: string; reason?: string }
  | { type: 'request_modules' }
  | { type: 'delete_module'; moduleId: string }
  | { type: 'attach_module'; characterId: string; moduleId: string }
  | { type: 'detach_module'; characterId: string; moduleId: string }
  | {
      type: 'request_viewer_data';
      source: { kind: 'character'; characterId: string }
        | { kind: 'module'; moduleId: string };
    }
  | {
      type: 'add_asset';
      source: { kind: 'character'; characterId: string }
        | { kind: 'module'; moduleId: string };
      /** Author-cased asset name. CBS macros use it verbatim (`{{img::AssetName}}`). */
      assetName: string;
      /** Lumi image id from `POST /api/v1/images` — FE already uploaded the bytes. */
      imageId: string;
      /** File extension without leading dot (e.g. "png", "mp4"). Drives
       *  `{{asset::NAME}}` video-vs-image branching. */
      ext?: string;
    }
  // Bulk variant of `add_asset`: single envelope write + single viewer re-push
  // regardless of `entries.length`. FE pre-uploads bytes via `/api/v1/images`.
  | {
      type: 'add_assets';
      source: { kind: 'character'; characterId: string }
        | { kind: 'module'; moduleId: string };
      entries: ReadonlyArray<{
        assetName: string;
        imageId: string;
        ext?: string;
      }>;
    }
  | {
      type: 'rename_asset';
      source: { kind: 'character'; characterId: string }
        | { kind: 'module'; moduleId: string };
      oldName: string;
      newName: string;
    }
  | {
      type: 'delete_asset';
      source: { kind: 'character'; characterId: string }
        | { kind: 'module'; moduleId: string };
      assetName: string;
    }
  // `triggerIndex` is position in `ViewerData.triggers[]`. Backend replaces all
  // `triggerlua`-typed entries in the trigger's `effect[]` with a single `triggerlua`
  // carrying the new code. Non-lua effects are preserved in order.
  | {
      type: 'set_trigger_lua';
      source: { kind: 'character'; characterId: string }
        | { kind: 'module'; moduleId: string };
      triggerIndex: number;
      lua: string;
    }
  // Empty string OR null clears. Triggers active-card invalidation so next chat-tick repaints.
  | {
      type: 'set_background_html';
      characterId: string;
      html: string | null;
    }
  // FE executes cookie-auth REST calls to write/delete world_books + regex_scripts
  // (worker can't reach those routes without session cookie). `module_artifacts_installed`
  // carries new resource ids so backend can stash them on user_overrides for clean detach.
  | {
      type: 'module_artifacts_installed';
      characterId: string;
      moduleId: string;
      /** `null` when the module had zero lorebook entries (no book created). */
      worldBookId: string | null;
      /** May be shorter than requested if some scripts were rejected. */
      regexScriptIds: readonly string[];
    }
  | {
      type: 'module_artifacts_uninstalled';
      characterId: string;
      moduleId: string;
      /** True when every targeted artifact was deleted (or already absent; 404 counts as success). */
      ok: boolean;
    }
  // `set_toggle` RMWs `chat.metadata.macro_variables.global["toggle_<key>"]`
  // (Risu storage convention; CBS `{{#when::toggle::X}}` reads here).
  // `value` is the string Risu persists: "1"/"0" for checkboxes, option index for selects,
  // raw text for text/textarea. `null` deletes the key.
  | {
      type: 'request_toggle_definitions';
      chatId: string;
    }
  | {
      type: 'set_toggle';
      chatId: string;
      key: string;
      value: string | null;
    }
  // Sent after FE finishes canvas-rasterizing each non-templated SVG (from a
  // `rasterize_svgs` push) and POSTing each PNG to /api/v1/images. Maps marker
  // index to image_id so backend can substitute `<img data-lumirealm-svg-pending="N">`.
  // Failed rasters report `null`. Backend leaves no src and sanitizer passes through.
  // See `src/core/svg-rasterize.ts` for the full rasterization spec.
  | {
      type: 'register_svg_raster_index';
      characterId: string;
      /** markerN (string-keyed for JSON portability) → Lumi image_id (or null on failure). */
      imageIdByMarker: Readonly<Record<string, string | null>>;
    }
  | { type: 'log_request_state' }
  | { type: 'log_set_state'; enabled: boolean; includeChatData: boolean }
  | { type: 'log_request_export' }
  | { type: 'log_clear' }
  | { type: 'alert_dismissed'; requestId: string }
  | { type: 'pick_resolved'; requestId: string; value: string | null }
  | RealmFrontendToBackend;

/** Backend → Frontend. */
export type BackendToFrontend =
  | { type: 'cards_updated'; cards: readonly CardSummary[] }
  | {
      type: 'import_progress';
      phase: ImportProgress['phase'];
      message: string;
      /** 0..1 fractional progress or null when indeterminate. */
      fraction: number | null;
      /** Filled on phase === 'done'. */
      characterId?: string;
      /** Filled on phase === 'error'. */
      error?: string;
    }
  | {
      // Acks init/chunk/commit so the FE knows the WS is still live.
      // Absent acks within a window signal silent CF/WS drop and let the UI fail fast.
      type: 'import_upload_ack';
      sessionId: string;
      /** -1 for init, N for chunk seq=N, -2 for commit-received. */
      seq: number;
      receivedBytes: number;
    }
  | {
      type: 'consent_prompt';
      requestId: string;
      title: string;
      message: string;
      confirmLabel: string;
      cancelLabel: string;
    }
  // FE POSTs to `/api/v1/regex-scripts/import` (accepts `{scripts:[...]}` or bare array).
  // Only FE has the session cookie. Failures surface as warnings in the drawer status panel.
  | {
      type: 'install_regex_scripts';
      characterId: string;
      characterName: string;
      scripts: readonly PendingRegexScriptMsg[];
    }
  // `risuPayload.background_html` resolved per state tick. FE pipes through Risu-compat
  // rewriter (HTML class prefix + CSS `.chattext` scope + `:host` universals) and paints
  // into a Shadow-DOM host.
  | {
      type: 'render_bg_html';
      chatId: string;
      bgHtml: string;
      crossRuleStyles?: readonly string[];
    }
  | {
      type: 'clear_bg_html';
      chatId: string;
    }
  // Pushed on every state-tick. `defaults` is character-level `defaultVariables`
  // (Risu's `getChatVar` fallback when key unset).
  // `seq` is monotonic per-chat; pushes only when snapshot changes (or on explicit request).
  | {
      type: 'set_variables';
      chatId: string;
      seq: number;
      scopes: VariableScopes;
      /** Character-level `defaultVariables` (Risu fallback on getChatVar miss). */
      defaults: Readonly<Record<string, string>>;
      /** ms-since-epoch when assembled, for "Last update" UX. */
      ts: number;
    }
  | {
      type: 'settings_pushed';
      settings: {
        readonly schema_version: 1;
        readonly auxConnectionId: string | null;
        readonly auxModelOverride: string | null;
        readonly auxSamplers: AuxSamplersWire;
        readonly submodelConnectionId: string | null;
        readonly submodelModelOverride: string | null;
        readonly submodelSamplers: AuxSamplersWire;
        readonly auxDebugCaptureRequest: boolean;
        readonly auxDebugCaptureResponse: boolean;
        readonly legacyMediaFindings: boolean;
      };
    }
  // Emitted when the user enables request/response capture toggles in Settings.
  // Gated server-side by the two boolean flags in `RisuCompatSettings`.
  | {
      type: 'aux_debug_capture';
      /** Server-monotonic; unique per worker boot, used as React key / dedup id. */
      id: number;
      /** ms-since-epoch when generated. */
      ts: number;
      kind: 'request' | 'response' | 'error';
      /** `null` for manual-trigger paths invoked outside chat context. */
      chatId: string | null;
      /** Resolved aux-connection UUID at dispatch time, or `null` for "use user's default". */
      auxConnectionId: string | null;
      /** `null` for "use connection's own model". */
      auxModelOverride: string | null;
      /** `null` for `kind:'request'` (call hasn't completed). Milliseconds. */
      elapsedMs: number | null;
      payload: unknown;
    }
  | {
      type: 'connections_list_pushed';
      connections: readonly {
        readonly id: string;
        readonly name: string;
        readonly provider: string;
        readonly model: string;
        readonly is_default: boolean;
      }[];
    }
  // Module upload ack (seq=-1 init, seq=N chunk, seq=-2 commit).
  // `modules_pushed` is the full library + per-character attachment map.
  // `attached_modules_pushed` is a per-character delta after attach/detach.
  | {
      type: 'module_upload_ack';
      sessionId: string;
      seq: number;
      receivedBytes: number;
    }
  | {
      type: 'modules_pushed';
      modules: readonly ModuleSummary[];
      attached_by_character?: Readonly<Record<string, readonly AttachedModuleSummary[]>>;
    }
  | {
      type: 'attached_modules_pushed';
      characterId: string;
      attached: readonly AttachedModuleSummary[];
    }
  // `source.kind === 'character'` carries id+name; `'module'` carries id+display name.
  // Lorebook for characters is grouped by world_book; for modules it's a flat list.
  | {
      type: 'viewer_data_pushed';
      data: ViewerData;
    }
  | {
      type: 'cleanup_character_artifacts';
      characterId: string;
      worldBookIds: readonly string[];
    }
  // FE executes cookie-auth REST POSTs for world_book + regex_scripts payloads.
  // On completion FE replies with `module_artifacts_installed` carrying new resource ids;
  // backend stashes them on `user_overrides` so detach can find them.
  // `lorebookEntries` mirrors `/api/v1/world-books/:id/entries/import` schema.
  | {
      type: 'install_module_artifacts';
      characterId: string;
      moduleId: string;
      /** FE only creates a world_book when `lorebookEntries.length > 0`. */
      worldBookName: string;
      lorebookEntries: readonly ModuleLorebookEntry[];
      regexScripts: readonly PendingRegexScriptMsg[];
    }
  | {
      type: 'uninstall_module_artifacts';
      characterId: string;
      moduleId: string;
      worldBookId: string | null;
      regexScriptIds: readonly string[];
    }
  // Pushed on chat open / card change / module attach-detach / re-import.
  // Structure only. Values flow through the variables channel (`toggle_<key>` in global scope).
  // `attribution` maps key → contributing module display name.
  | {
      type: 'set_toggle_definitions';
      chatId: string;
      seq: number;
      /** Flat parsed toggles in DSL order, including group/groupEnd/divider/caption markers. */
      toggles: readonly SidebarToggleWire[];
      /** key → "Module display name". Sourced from `module.name` per Risu's RisuModule shape. */
      attribution: Readonly<Record<string, string>>;
      /** ms-since-epoch when assembled. */
      ts: number;
    }
  | { type: 'error'; message: string }
  // Sent at import time when the translated card has non-templated inline SVGs to rasterize.
  // FE canvas-rasterizes each (with theme-color injection for `theme-reactive` ones),
  // POSTs each PNG to `/api/v1/images`, and replies with `register_svg_raster_index`.
  // `phase=done` is deferred until the round-trip completes.
  // Templated SVGs are NOT in this list. Left inline, sanitizer-stripped at render.
  | {
      type: 'rasterize_svgs';
      characterId: string;
      characterName: string;
      svgs: readonly {
        readonly markerN: number;
        readonly svg: string;
        readonly classification: 'simple' | 'theme-reactive' | 'animated';
        readonly width: number;
        readonly height: number;
      }[];
    }
  | {
      type: 'log_state_pushed';
      enabled: boolean;
      includeChatData: boolean;
      eventCount: number;
      bufferBytes: number;
    }
  | {
      type: 'log_export_pushed';
      events: readonly LogEventWire[];
      session: {
        readonly extensionVersion: string;
        readonly userId: string | null;
        readonly activeChatId: string | null;
        readonly activeCharacterId: string | null;
      };
    }
  | {
      type: 'request_alert';
      requestId: string;
      message: string;
      kind?: 'info' | 'error';
    }
  | {
      type: 'request_pick';
      requestId: string;
      title: string;
      options: readonly string[];
    }
  | RealmBackendToFrontend;

export interface LogEventWire {
  readonly ts: number;
  readonly level: 'info' | 'warn' | 'error' | 'debug';
  readonly category: string;
  readonly message: string;
}

/** Wire shape for one parsed toggle row. Mirrors `SidebarToggle` from
 *  `src/core/toggle-syntax.ts`, duplicated here to avoid a dep on `core/`. */
export type SidebarToggleWire =
  | { readonly type: 'group'; readonly key?: string; readonly value?: string }
  | { readonly type: 'groupEnd'; readonly key?: string; readonly value?: string }
  | { readonly type: 'caption'; readonly key?: string; readonly value: string }
  | { readonly type: 'divider'; readonly key?: string; readonly value?: string }
  | {
      readonly type: 'select';
      readonly key: string;
      readonly value: string;
      readonly options: readonly string[];
    }
  | {
      readonly type: 'text' | 'textarea' | 'checkbox';
      readonly key: string;
      readonly value: string;
      readonly options?: readonly string[];
    };

export interface AuxSamplersWire {
  readonly temperature: number | null;
  readonly maxTokens: number | null;
  readonly contextSize: number | null;
  readonly topP: number | null;
  readonly minP: number | null;
  readonly topK: number | null;
  readonly frequencyPenalty: number | null;
  readonly presencePenalty: number | null;
  readonly repetitionPenalty: number | null;
}

export interface VariableScopes {
  readonly local: Readonly<Record<string, string>>;
  readonly global: Readonly<Record<string, string>>;
  readonly chat: Readonly<Record<string, string>>;
}

export interface ModuleSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly filename: string;
  readonly uploaded_at: number;
  readonly lorebook_count: number;
  readonly regex_count: number;
  readonly trigger_count: number;
  readonly asset_count: number;
  /** True if module declares `lowLevelAccess: true`. UI shows a badge. */
  readonly low_level_access: boolean;
  /** True if module has a `cjs` script body (Risu's CommonJS per-module hook). We don't run cjs; surfaces as degraded warning. */
  readonly has_cjs: boolean;
}

export interface ViewerData {
  readonly source:
    | { readonly kind: 'character'; readonly characterId: string; readonly name: string }
    | { readonly kind: 'module'; readonly moduleId: string; readonly name: string };
  readonly lorebook: readonly ViewerLorebookGroup[];
  /** Module-only: characters' regex lives in Lumi's `regex_scripts` table (native UI).
   *  Modules expose regex here for pre-attach inspection. */
  readonly regex: readonly ViewerRegexEntry[];
  /** Both kinds: triggers have no Lumi native UI. */
  readonly triggers: readonly ViewerTriggerEntry[];
  /** Both kinds: assets have no Lumi native viewer. */
  readonly assets: readonly ViewerAssetEntry[];
  /** Module-only (`module.cjs`); always `null` for characters. */
  readonly cjs: string | null;
  readonly backgroundHtml: string | null;
  /** ms-since-epoch when assembled, for "Last refreshed" UX. */
  readonly ts: number;
  /** Fetch issues / cross-tab routing notes for a banner. */
  readonly fetchWarnings: readonly string[];
}

export interface ViewerLorebookGroup {
  /** character: world_book name; module: module name. */
  readonly groupName: string;
  /** world_book uuid for characters, literal "module" for modules. */
  readonly groupId: string;
  readonly entries: readonly ViewerLorebookEntry[];
}

export interface ViewerLorebookEntry {
  readonly key: readonly string[];
  readonly content: string;
  readonly comment?: string;
  readonly disabled?: boolean;
  readonly constant?: boolean;
  /** Lumi entry uuid for characters, array index for modules. */
  readonly id: string;
}

export interface ViewerRegexEntry {
  readonly id: string;
  readonly name: string;
  readonly find: string;
  readonly replace: string;
  /** "ai_output", "user_input", etc. — joined when multiple. */
  readonly placement: string;
  readonly target: string;
  readonly disabled: boolean;
  /** Non-null for module-sourced rules pushed into Lumi's table at attach time. */
  readonly moduleId: string | null;
}

export interface ViewerTriggerEntry {
  readonly id: string;
  /** Author display name (Risu's `comment` field, else "trigger #N"). */
  readonly name: string;
  readonly bindingType: string;
  /** First-effect's `triggerlua.code` if present, else null. */
  readonly lua: string | null;
  readonly effectCount: number;
}

export interface ViewerAssetEntry {
  readonly name: string;
  /** Lumi `/api/v1/images/<id>` URL ready for `<img src>`. Points at the first image id
   *  when multi-source (Risu's getAssetSrc semantics). */
  readonly url: string;
  readonly multi: boolean;
  /** Original ext if known — drives video-vs-image branching. */
  readonly ext?: string;
}

export interface ModuleLorebookEntry {
  readonly key: readonly string[];
  readonly content: string;
  readonly comment?: string;
  readonly constant?: boolean;
  readonly disabled?: boolean;
  readonly position?: string;
  readonly priority?: number;
  readonly order?: number;
  readonly secondary_keys?: readonly string[];
  readonly selective?: boolean;
  /** Carries module id for future cleanup of module-sourced entries. */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Subset of `ModuleSummary` sufficient to render the per-character attached list. */
export interface AttachedModuleSummary {
  readonly id: string;
  readonly name: string;
}

