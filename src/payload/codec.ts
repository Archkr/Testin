import type {
  AssetIndexEntry,
  LumirealmCharacterData,
  LumirealmUserOverrides,
  PortalCandidate,
  RisuPayload,
  StoredRegexScript,
  StoredRisuCard,
} from './types.js';

export class RisuCompatUnsupportedError extends Error {
  override readonly name = 'RisuCompatUnsupportedError';
  constructor(
    readonly feature: string,
    readonly reason: string,
  ) {
    super(`risu-compat: ${feature} is unsupported (${reason})`);
  }
}

export class RisuCompatVersionError extends Error {
  override readonly name = 'RisuCompatVersionError';
  constructor(
    readonly missing: readonly string[],
    readonly extensionVersion: string,
  ) {
    super(
      `risu-compat v${extensionVersion} is missing required capabilities: ${missing.join(', ')}. Please update the extension.`,
    );
  }
}

export class RisuConsentDeclinedError extends Error {
  override readonly name = 'RisuConsentDeclinedError';
  constructor(readonly characterName: string) {
    super(
      `risu-compat: import of "${characterName}" cancelled — low-level access consent declined.`,
    );
  }
}

/** Capabilities this extension version is confirmed to handle faithfully. */
export const SUPPORTED_HOST_FEATURES = new Set<string>([
  'alertSelect',
]);

// Card asks for these; warn but still load.
export const DEGRADED_HOST_FEATURES = new Set<string>([
  'utilityBot',
  'displayTriggerSemantics',
]);

export interface PreValidateResult {
  readonly ok: boolean;
  readonly missing: readonly string[];
  readonly degraded: readonly string[];
}

export function preValidateRequires(
  requires: RisuPayload['requires'],
): PreValidateResult {
  const missing: string[] = [];
  const degraded: string[] = [];
  for (const feature of requires.hostFeatures) {
    if (SUPPORTED_HOST_FEATURES.has(feature)) continue;
    if (DEGRADED_HOST_FEATURES.has(feature)) {
      degraded.push(feature);
      continue;
    }
    missing.push(feature);
  }
  return { ok: missing.length === 0, missing, degraded };
}

export function makeStoredCard(
  characterId: string,
  extensionVersion: string,
  payload: RisuPayload,
  assetIndex: Record<string, AssetIndexEntry>,
  emotionIndex: Record<string, AssetIndexEntry> = {},
  regexScripts?: readonly StoredRegexScript[],
): StoredRisuCard {
  return {
    schema_version: 1,
    character_id: characterId,
    stored_at: Date.now(),
    extension_version: extensionVersion,
    risuPayload: payload,
    asset_index: assetIndex,
    emotion_index: emotionIndex,
    ...(regexScripts && regexScripts.length > 0 ? { regex_scripts: regexScripts } : {}),
  };
}

export function buildLumirealmData(
  payload: RisuPayload,
  extensionVersion: string,
  regexScripts: readonly StoredRegexScript[] = [],
  assetIndex: Readonly<Record<string, AssetIndexEntry>> = {},
  emotionIndex: Readonly<Record<string, AssetIndexEntry>> = {},
  importedAt: number = Date.now(),
  userOverrides: LumirealmUserOverrides = {},
  portalCandidates: readonly PortalCandidate[] = [],
): LumirealmCharacterData {
  return {
    schema_version: 1,
    imported_at: importedAt,
    extension_version: extensionVersion,
    translator_version: payload.translator_version,
    payload: {
      triggers: payload.triggers,
      lua_scripts: payload.lua_scripts,
      at_actions: payload.at_actions,
      additional_assets: payload.additional_assets,
      emotion_images: payload.emotion_images,
      // Restored after refactor regression; see core/payload/types.ts LumirealmCharacterData.payload.
      background_html: payload.background_html,
      utility_bot: payload.utility_bot,
      scriptstate_defaults: payload.scriptstate_defaults,
      requires: payload.requires,
      ...(payload.untranslated ? { untranslated: payload.untranslated } : {}),
    },
    asset_index: assetIndex,
    emotion_index: emotionIndex,
    regex_scripts: regexScripts,
    // Omit field when empty; `candidates === undefined` means "nothing to review".
    ...(portalCandidates.length > 0 ? { portal_candidates: portalCandidates } : {}),
    user_overrides: userOverrides,
  };
}

export function isLumirealmData(value: unknown): value is LumirealmCharacterData {
  if (value === null || typeof value !== 'object') return false;
  const v = value as { schema_version?: unknown };
  return v.schema_version === 1;
}

export function decideRulePartitionWithOverrides(
  ruleCandidateIds: readonly string[],
  portalDecisions: Readonly<Record<string, 'portal' | 'inline'>>,
  translatorFlag: boolean,
): boolean {
  if (ruleCandidateIds.length > 0) {
    let allInline = true;
    for (const id of ruleCandidateIds) {
      const decision = portalDecisions[id];
      if (decision === 'portal') return true;
      if (decision !== 'inline') allInline = false;
    }
    if (allInline) return false;
  }
  return translatorFlag;
}

export function synthesizeStripStub(
  parent: StoredRegexScript,
  idGen: () => string,
): StoredRegexScript {
  const meta = (parent.metadata ?? {}) as { _risu?: Record<string, unknown> };
  const parentRisu = (meta._risu ?? {}) as Record<string, unknown>;
  return {
    name: `${parent.name} (strip)`,
    script_id: idGen(),
    find_regex: parent.find_regex,
    replace_string: '',
    flags: parent.flags,
    placement: parent.placement,
    scope: parent.scope,
    scope_id: parent.scope_id,
    target: parent.target,
    min_depth: parent.min_depth,
    max_depth: parent.max_depth,
    trim_strings: [],
    run_on_edit: parent.run_on_edit,
    // Inherit substitute_macros when find_regex contains CBS so Lumi pre-resolves
    // the pattern before RegExp compile (useDisplayRegex.ts). Stubs with no
    // CBS stay "none"; the empty replace_string has nothing to resolve.
    substitute_macros: parent.find_regex.indexOf('{{') >= 0
      ? parent.substitute_macros
      : 'none',
    disabled: parent.disabled,
    sort_order: parent.sort_order,
    description: parent.description,
    folder: parent.folder,
    metadata: {
      _risu: {
        ...parentRisu,
        has_meta: false,
        is_strip_stub: true,
        stub_for: parent.script_id,
        extension_managed: false,
        // Clear var_refs; stubs have no replace_string so they don't read vars.
        var_refs: [],
      },
    },
  };
}

export function isStripStub(rule: StoredRegexScript): boolean {
  const meta = rule.metadata as { _risu?: { is_strip_stub?: unknown } } | undefined;
  return meta?._risu?.is_strip_stub === true;
}

export function stripStubParentScriptId(rule: StoredRegexScript): string | null {
  const meta = rule.metadata as { _risu?: { stub_for?: unknown } } | undefined;
  const v = meta?._risu?.stub_for;
  return typeof v === 'string' ? v : null;
}

export function ensurePortalWrap(replaceString: string, wrap: boolean): string {
  const OPEN_RE = /^<div\s+data-risu-portal="([^"]*)">/;
  const openMatch = OPEN_RE.exec(replaceString);
  const isWrapped =
    openMatch !== null
    && replaceString.endsWith('</div>')
    // Belt-and-braces: confirm the closing </div> is the top-level wrap's.
    && replaceString.length > openMatch[0].length + '</div>'.length;
  if (wrap) {
    if (isWrapped) return replaceString;
    return `<div data-risu-portal="auto">${replaceString}</div>`;
  }
  if (!isWrapped) return replaceString;
  // Strip the wrap: remove the opening <div ...> and trailing </div>.
  return replaceString.slice(openMatch![0].length, replaceString.length - '</div>'.length);
}

export function partitionRulesForLumi(
  rules: readonly StoredRegexScript[],
  isManaged: (r: StoredRegexScript) => boolean,
): readonly StoredRegexScript[] {
  const managedScriptIds = new Set<string>();
  for (const r of rules) {
    if (isStripStub(r)) continue;
    if (isManaged(r)) managedScriptIds.add(r.script_id);
  }
  const out: StoredRegexScript[] = [];
  for (const r of rules) {
    if (isStripStub(r)) {
      const parent = stripStubParentScriptId(r);
      if (parent !== null && managedScriptIds.has(parent)) out.push(r);
    } else {
      if (!isManaged(r)) out.push(r);
    }
  }
  return out;
}
