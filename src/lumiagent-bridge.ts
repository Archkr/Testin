// LumiAgent surface-provider bridge.
//
// This file is the LumiRealm side of the `lumiagent.*` cross-extension protocol.
// Any extension that wants the agent in LumiAgent to read/write its data implements
// the same two rpcPool endpoints under its own extension prefix:
//
//   <extId>.lumiagent.describe   (sync — static SurfaceManifest)
//   <extId>.lumiagent.execute    (handle — dispatches a request envelope)
//
// The caller publishes its request envelope at `<callerExtId>.agent_request_envelope`
// before reading `execute`. This is the workaround for rpcPool being pull-only:
// the handler reads the requester's pending-request slot synchronously inside the
// execute call. Within an agent turn LumiAgent issues one tool at a time so there's
// no concurrency on the request slot.
//
// LumiAgent has zero LumiRealm-specific code; it discovers this manifest by reading
// `lumirealm.lumiagent.describe` and routes generic tool calls through `execute`.

import type { SpindleAPI } from 'lumiverse-spindle-types';
import { readEnvelope, writeEnvelope, listModules, type ModuleEnvelope, type UserStorageLike } from './state/modules-store.js';

interface SurfaceField {
  path: string;
  label: string;
  description?: string;
  type: 'string' | 'array' | 'object' | 'any';
  editable: boolean;
  large?: boolean;
}

interface SurfaceDescriptor {
  id: string;
  label: string;
  description: string;
  scope: { kind: 'global' | 'per_character' };
  item_kind: string;
  fields: SurfaceField[];
}

interface SurfaceManifest {
  extension: { id: string; name: string; version: string };
  surfaces: SurfaceDescriptor[];
}

const MANIFEST: SurfaceManifest = {
  extension: { id: 'lumirealm', name: 'LumiRealm', version: '0.1.0' },
  surfaces: [
    {
      id: 'module_envelope',
      label: 'Risu modules',
      item_kind: 'module envelope',
      description:
        'Pre-translate Risu module envelopes. Each module carries its own triggers, lua scripts, background HTML, regex projection, and asset indexes. ' +
        'The lorebook + regex_scripts of an ATTACHED module are also installed as Lumi-level entities (character world books / regex scripts) and editable through the normal LumiAgent tools — this surface gives you access to the source-of-truth envelope, which survives translator schema migrations.',
      scope: { kind: 'per_character' },
      fields: [
        { path: 'filename', label: 'Filename', type: 'string', editable: false },
        { path: 'module.name', label: 'Name', type: 'string', editable: true },
        { path: 'module.description', label: 'Description', type: 'string', editable: true, large: true },
        { path: 'module.backgroundEmbedding', label: 'Background HTML', description: 'Module-level UI HTML/CSS rendered at chat time after macro substitution. Edits propagate to every attached character.', type: 'string', editable: true, large: true },
        { path: 'module.namespace', label: 'Namespace', description: 'Stable identifier for module aliasing (re-uploaded modules can declare a prior namespace to inherit attachments).', type: 'string', editable: false },
        { path: 'module.trigger', label: 'Triggers (V2 effects + Lua)', description: 'V2 effect array. Each trigger may carry a triggerlua effect at effect[0]. String-bearing leaves are translatable; do not change opcode structure.', type: 'array', editable: true },
        { path: 'module.customModuleToggle', label: 'Custom toggles DSL', description: 'Newline-separated DSL defining user-facing toggles (group / select / text / checkbox / divider / caption). Values feed CBS toggle / tis / tisnot macros.', type: 'string', editable: true, large: true },
        { path: 'module.lorebook', label: 'Lorebook (envelope copy)', description: 'Pre-translation source. The INSTALLED copy is editable via edit_world_book_entry; only edit here when migration-safety matters.', type: 'array', editable: true },
        { path: 'module.regex', label: 'Regex scripts (envelope copy)', description: 'Pre-projection source. The INSTALLED copy is editable via edit_regex_script_field; only edit here when migration-safety matters.', type: 'array', editable: true },
        { path: 'module.lowLevelAccess', label: 'Low-level access flag', description: 'When true, module triggers may invoke LLMMain / axLLMMain / runLLM. Granted at upload time; cannot be flipped post-install.', type: 'any', editable: false },
        { path: 'translator_schema_version', label: 'Translator schema version', type: 'any', editable: false },
      ],
    },
  ],
};

// ─── Path navigation (dot/bracket) ──────────────────────────────────────
type PathSeg = { kind: 'key'; value: string } | { kind: 'index'; value: number };

function parsePath(path: string): PathSeg[] {
  const segments: PathSeg[] = [];
  let i = 0;
  while (i < path.length) {
    const ch = path[i]!;
    if (ch === '.') { i++; continue; }
    if (ch === '[') {
      const end = path.indexOf(']', i);
      if (end < 0) throw new Error(`unclosed bracket in path at index ${i}`);
      const inner = path.slice(i + 1, end);
      if (/^\d+$/.test(inner)) {
        segments.push({ kind: 'index', value: parseInt(inner, 10) });
      } else if ((inner.startsWith("'") && inner.endsWith("'") && inner.length >= 2) ||
                 (inner.startsWith('"') && inner.endsWith('"') && inner.length >= 2)) {
        segments.push({ kind: 'key', value: inner.slice(1, -1) });
      } else {
        throw new Error(`bracket contents must be a number or quoted string: [${inner}]`);
      }
      i = end + 1;
      continue;
    }
    let j = i;
    while (j < path.length && path[j] !== '.' && path[j] !== '[') j++;
    const key = path.slice(i, j);
    if (key.length === 0) throw new Error(`empty key at index ${i}`);
    segments.push({ kind: 'key', value: key });
    i = j;
  }
  return segments;
}

function getAtPath(obj: unknown, segments: readonly PathSeg[]): unknown {
  let cur: unknown = obj;
  for (const seg of segments) {
    if (cur === null || cur === undefined) return undefined;
    if (seg.kind === 'key') {
      if (typeof cur !== 'object' || Array.isArray(cur)) return undefined;
      cur = (cur as Record<string, unknown>)[seg.value];
    } else {
      if (!Array.isArray(cur)) return undefined;
      cur = cur[seg.value];
    }
  }
  return cur;
}

function setAtPath(root: unknown, segments: readonly PathSeg[], value: unknown): unknown {
  if (segments.length === 0) return value;
  const [head, ...rest] = segments;
  if (head!.kind === 'index') {
    const arr = Array.isArray(root) ? [...root] : [];
    arr[head!.value] = setAtPath(arr[head!.value], rest, value);
    return arr;
  }
  const obj = (root && typeof root === 'object' && !Array.isArray(root)) ? { ...(root as Record<string, unknown>) } : {};
  obj[head!.value] = setAtPath(obj[head!.value], rest, value);
  return obj;
}

// ─── Surface implementation: modules ────────────────────────────────────

async function getAttachedModuleIdsForCharacter(spindle: SpindleAPI, userId: string, characterId: string): Promise<string[]> {
  try {
    const c = await spindle.characters.get(characterId, userId);
    const lumi = (c?.extensions as Record<string, unknown> | undefined)?.['lumirealm'] as Record<string, unknown> | undefined;
    const overrides = lumi?.['user_overrides'] as Record<string, unknown> | undefined;
    const ids = overrides?.['attached_module_ids'];
    if (Array.isArray(ids)) return ids.filter((x): x is string => typeof x === 'string');
    return [];
  } catch {
    return [];
  }
}

interface ExternalRequestBase {
  callId?: string;
  userId: string;
}

interface ListItemsRequest extends ExternalRequestBase {
  op: 'list_items';
  surfaceId: string;
  characterId?: string;
}

interface ReadItemRequest extends ExternalRequestBase {
  op: 'read_item';
  surfaceId: string;
  itemId: string;
  field?: string;
}

interface WriteFieldRequest extends ExternalRequestBase {
  op: 'write_field';
  surfaceId: string;
  itemId: string;
  field: string;
  value: unknown;
}

type ExternalRequest = ListItemsRequest | ReadItemRequest | WriteFieldRequest;

// Fires after a successful write_field. Callers use this to invalidate caches
// and refresh attached characters' active chats so envelope edits land live.
export type OnModuleEnvelopeWritten = (env: ModuleEnvelope, userId: string) => Promise<void> | void;

async function dispatchRequest(
  spindle: SpindleAPI,
  moduleStorage: () => UserStorageLike,
  req: ExternalRequest,
  onWritten: OnModuleEnvelopeWritten | undefined,
  log: (msg: string) => void,
): Promise<unknown> {
  if (req.surfaceId !== 'module_envelope') {
    throw new Error(`unknown surface: ${req.surfaceId}`);
  }
  if (req.op === 'list_items') {
    let allowed: Set<string> | null = null;
    if (req.characterId) {
      const attached = await getAttachedModuleIdsForCharacter(spindle, req.userId, req.characterId);
      allowed = new Set(attached);
    }
    const summaries = await listModules(moduleStorage(), req.userId);
    const filtered = allowed === null ? [...summaries] : summaries.filter((s) => allowed!.has(s.id));
    const items = filtered.map((s) => ({
      id: s.id,
      label: s.name || s.filename,
      brief: {
        filename: s.filename,
        lorebook_count: s.lorebook_count,
        regex_count: s.regex_count,
        trigger_count: s.trigger_count,
        asset_count: s.asset_count,
        low_level_access: s.low_level_access,
        has_cjs: s.has_cjs,
      },
    }));
    return { items, total: items.length };
  }
  if (req.op === 'read_item') {
    const env = await readEnvelope(moduleStorage(), req.userId, req.itemId);
    if (!env) throw new Error(`module ${req.itemId} not found`);
    if (!req.field) return { value: env };
    const segs = parsePath(req.field);
    return { value: getAtPath(env, segs) };
  }
  if (req.op === 'write_field') {
    const env = await readEnvelope(moduleStorage(), req.userId, req.itemId);
    if (!env) throw new Error(`module ${req.itemId} not found`);
    const segs = parsePath(req.field);
    const next = setAtPath(env, segs, req.value) as ModuleEnvelope;
    if (next.schema_version !== env.schema_version) {
      throw new Error('cannot change schema_version via lumiagent.write_field');
    }
    if (next.id !== env.id) {
      throw new Error('cannot change module id via lumiagent.write_field');
    }
    await writeEnvelope(moduleStorage(), req.userId, next);
    if (onWritten) {
      try {
        await onWritten(next, req.userId);
      } catch (err) {
        log(`lumiagent-bridge: onModuleEnvelopeWritten threw for module=${next.id}: ${(err as Error).message}`);
      }
    }
    return { ok: true };
  }
  throw new Error(`unknown op: ${(req as { op?: string }).op}`);
}

// Whitelist of extension IDs allowed to invoke `lumiagent.execute`. Spindle's
// `rpcPool` is free-tier and has no permission gate — without this, any
// installed operator-scoped extension could publish a request envelope under
// its own prefix and read it back through us. This doesn't fix the deeper
// userId-spoofing issue (the host doesn't attach a verified user identity to
// rpcPool calls), but it does shut out random other extensions probing for
// module data. Add ids here as new well-known callers integrate.
const ALLOWED_CALLERS: ReadonlySet<string> = new Set(['lumiagent']);

export function registerLumiagentBridge(
  spindle: SpindleAPI,
  moduleStorage: () => UserStorageLike,
  log: (msg: string) => void = () => {},
  onModuleEnvelopeWritten?: OnModuleEnvelopeWritten,
): void {
  // Static manifest — readers fetch this on session start.
  // describe is intentionally NOT gated: any extension may discover that we
  // exist. Only execute is gated because it touches data.
  spindle.rpcPool.sync('lumiagent.describe', MANIFEST);

  // Single dispatch endpoint. The caller publishes its request envelope at
  // `<callerExtId>.agent_request_envelope` before reading this endpoint;
  // we fetch it via rpcPool.read using the requester's id.
  spindle.rpcPool.handle('lumiagent.execute', async (rctx) => {
    const requesterId = rctx.requesterExtensionId;
    if (!requesterId) throw new Error('requester extension id missing');
    if (!ALLOWED_CALLERS.has(requesterId)) {
      // Don't echo back the rejected id in case the caller is probing.
      log(`lumiagent-bridge: rejected call from unauthorised extension "${requesterId}"`);
      throw new Error('not authorised');
    }
    let req: ExternalRequest;
    try {
      req = await spindle.rpcPool.read<ExternalRequest>(`${requesterId}.agent_request_envelope`);
    } catch (err) {
      throw new Error(`could not read pending request from ${requesterId}: ${(err as Error).message}`);
    }
    if (!req || typeof req !== 'object') throw new Error('malformed request');
    if (!req.userId) throw new Error('request missing userId');
    return dispatchRequest(spindle, moduleStorage, req, onModuleEnvelopeWritten, log);
  });

  log('lumiagent surface bridge ready (modules)');
}
