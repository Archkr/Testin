import type { TriggerScript } from "../schemas/triggerscript.js";
import type { MappedCharacter } from "../mappers/character.js";
import type { AtAtAction } from "../mappers/regex.js";
import type {
  RisuAsset,
  RisuPayload,
  RisuRequires,
  UntranslatedCounters,
} from "../payload/types.js";


export interface BuildRisuPayloadInput {
  readonly translatorVersion: string;
  readonly risuSpecVersion: string;
  readonly triggers: readonly TriggerScript[];
  readonly atActions: readonly AtAtAction[];
  readonly extracted: MappedCharacter["extracted"];
  readonly characterExtensions: Readonly<Record<string, unknown>>;
  readonly requires: RisuRequires;
  readonly untranslated?: UntranslatedCounters;
}

const KNOWN_RISUAI_FIELDS = new Set<string>([
  "backgroundHTML",
  "customScripts",
  "triggerscript",
  "virtualscript",
  "defaultVariables",
  "utilityBot",
  "emotions",
]);

const EMBEDED_PREFIX = "embeded://";
const ASSET_PREFIX = "__asset:";

// PNG-export cards use `__asset:N`, .charx ZIP-export uses `embeded://`.
function stripAssetUriPrefix(uri: string): string {
  if (uri.startsWith(EMBEDED_PREFIX)) return uri.slice(EMBEDED_PREFIX.length);
  if (uri.startsWith(ASSET_PREFIX)) return uri.slice(ASSET_PREFIX.length);
  return uri;
}

function extFromPath(path: string): string | undefined {
  const dot = path.lastIndexOf(".");
  if (dot < 0 || dot === path.length - 1) return undefined;
  const ext = path.slice(dot + 1).toLowerCase();
  if (!/^[a-z0-9]{1,6}$/.test(ext)) return undefined;
  return ext;
}

export function extractAdditionalAssets(
  assets: readonly unknown[],
): RisuAsset[] {
  const out: RisuAsset[] = [];
  for (const raw of assets) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const a = raw as Record<string, unknown>;
    if (a["type"] !== "x-risu-asset") continue;
    const name = typeof a["name"] === "string" ? (a["name"] as string) : "";
    const uri = typeof a["uri"] === "string" ? (a["uri"] as string) : "";
    if (!name || !uri) continue;
    const path = stripAssetUriPrefix(uri);
    const explicitExt = typeof a["ext"] === "string" ? (a["ext"] as string).toLowerCase() : undefined;
    const ext = explicitExt ?? extFromPath(path);
    out.push({ name, path, ...(ext ? { ext } : {}) });
  }
  return out;
}

// CCSv3 cards put emotion images inline in `data.assets[]` with `type:emotion`.
// Risu's reader emits these into the same emotion store as v2's risuai.emotions.
export function extractV3EmotionAssets(
  assets: readonly unknown[],
): RisuAsset[] {
  const out: RisuAsset[] = [];
  for (const raw of assets) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const a = raw as Record<string, unknown>;
    if (a["type"] !== "emotion") continue;
    const name = typeof a["name"] === "string" ? (a["name"] as string) : "";
    const uri = typeof a["uri"] === "string" ? (a["uri"] as string) : "";
    if (!name || !uri) continue;
    const path = stripAssetUriPrefix(uri);
    const explicitExt = typeof a["ext"] === "string" ? (a["ext"] as string).toLowerCase() : undefined;
    const ext = explicitExt ?? extFromPath(path);
    out.push({ name, path, ...(ext ? { ext } : {}) });
  }
  return out;
}

export function extractEmotionImages(
  extensions: Readonly<Record<string, unknown>>,
): RisuAsset[] {
  const risuai = extensions["risuai"];
  if (!risuai || typeof risuai !== "object" || Array.isArray(risuai)) return [];
  const emotions = (risuai as Record<string, unknown>)["emotions"];
  if (!Array.isArray(emotions)) return [];
  const out: RisuAsset[] = [];
  for (const raw of emotions as unknown[]) {
    if (Array.isArray(raw)) {
      // Risu rpack.ts legacy tuple form [name, src, ext?]
      const [n, s, e] = raw as unknown[];
      const name = typeof n === "string" ? n : "";
      const rawSrc = typeof s === "string" ? s : "";
      const path = stripAssetUriPrefix(rawSrc);
      const ext = typeof e === "string" ? e.toLowerCase() : undefined;
      if (!name || !path) continue;
      out.push({ name, path, ...(ext ?? extFromPath(path) ? { ext: ext ?? extFromPath(path)! } : {}) });
    } else if (raw && typeof raw === "object") {
      const o = raw as Record<string, unknown>;
      const name = typeof o["name"] === "string" ? (o["name"] as string) : "";
      const rawPath =
        typeof o["path"] === "string"
          ? (o["path"] as string)
          : typeof o["src"] === "string"
            ? (o["src"] as string)
            : "";
      const path = stripAssetUriPrefix(rawPath);
      const explicitExt = typeof o["ext"] === "string" ? (o["ext"] as string).toLowerCase() : undefined;
      if (!name || !path) continue;
      const ext = explicitExt ?? extFromPath(path);
      out.push({ name, path, ...(ext ? { ext } : {}) });
    }
  }
  return out;
}

export function parseScriptstateDefaults(
  text: string | null,
): Record<string, string> {
  if (!text || typeof text !== "string") return {};
  const out: Record<string, string> = {};
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trimStart();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let value = line.slice(eq + 1);
    if (value.endsWith("\r")) value = value.slice(0, -1);
    out[key] = value;
  }
  return out;
}

export function extractLuaScripts(
  triggers: readonly TriggerScript[],
): string[] {
  return triggers.map((t) => {
    const parts: string[] = [];
    for (const e of t.effect ?? []) {
      const eo = e as { type?: string; code?: string };
      if (eo.type === "triggerlua" && typeof eo.code === "string") {
        parts.push(eo.code);
      }
    }
    return parts.join("\n");
  });
}

export function extractRisuaiExtra(
  extensions: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const risuai = extensions["risuai"];
  if (!risuai || typeof risuai !== "object" || Array.isArray(risuai)) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(risuai as Record<string, unknown>)) {
    if (KNOWN_RISUAI_FIELDS.has(k)) continue;
    out[k] = v;
  }
  return out;
}

export function buildRisuPayload(input: BuildRisuPayloadInput): RisuPayload {
  // Seed background_html_source at import so the agent's authoring surface is
  // never missing. Without this, _source is undefined until the user clicks
  // save in Viewer -> HTML, and agent path-edits to _source silently land on a
  // non-existent leaf.
  const bgHtml = input.extracted.backgroundHTML;
  const payload: RisuPayload = {
    triggers: input.triggers,
    lua_scripts: extractLuaScripts(input.triggers),
    at_actions: input.atActions,
    background_html: bgHtml,
    ...(typeof bgHtml === "string" && bgHtml.length > 0
      ? { background_html_source: bgHtml }
      : {}),
    virtualscript: input.extracted.virtualScript,
    utility_bot: input.extracted.utilityBot,
    scriptstate_defaults: parseScriptstateDefaults(
      input.extracted.defaultVariables,
    ),
    additional_assets: extractAdditionalAssets(input.extracted.assets),
    emotion_images: [
      ...extractEmotionImages(input.characterExtensions),
      ...extractV3EmotionAssets(input.extracted.assets),
    ],
    extra: extractRisuaiExtra(input.characterExtensions),
    translator_version: input.translatorVersion,
    risu_spec_version: input.risuSpecVersion,
    requires: input.requires,
    ...(input.untranslated ? { untranslated: input.untranslated } : {}),
  };
  return payload;
}
