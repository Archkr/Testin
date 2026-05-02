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

function stripEmbededPrefix(uri: string): string {
  if (uri.startsWith(EMBEDED_PREFIX)) return uri.slice(EMBEDED_PREFIX.length);
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
    const path = stripEmbededPrefix(uri);
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
      const path = typeof s === "string" ? s : "";
      const ext = typeof e === "string" ? e.toLowerCase() : undefined;
      if (!name || !path) continue;
      out.push({ name, path, ...(ext ?? extFromPath(path) ? { ext: ext ?? extFromPath(path)! } : {}) });
    } else if (raw && typeof raw === "object") {
      const o = raw as Record<string, unknown>;
      const name = typeof o["name"] === "string" ? (o["name"] as string) : "";
      const path =
        typeof o["path"] === "string"
          ? (o["path"] as string)
          : typeof o["src"] === "string"
            ? (o["src"] as string)
            : "";
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
  const payload: RisuPayload = {
    triggers: input.triggers,
    lua_scripts: extractLuaScripts(input.triggers),
    at_actions: input.atActions,
    background_html: input.extracted.backgroundHTML,
    virtualscript: input.extracted.virtualScript,
    utility_bot: input.extracted.utilityBot,
    scriptstate_defaults: parseScriptstateDefaults(
      input.extracted.defaultVariables,
    ),
    additional_assets: extractAdditionalAssets(input.extracted.assets),
    emotion_images: extractEmotionImages(input.characterExtensions),
    extra: extractRisuaiExtra(input.characterExtensions),
    translator_version: input.translatorVersion,
    risu_spec_version: input.risuSpecVersion,
    requires: input.requires,
    ...(input.untranslated ? { untranslated: input.untranslated } : {}),
  };
  return payload;
}
