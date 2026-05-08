import type { LumiCharacter } from "../lumiverse/types.js";
import { newUuid, nowMs } from "./util.js";
import { TranslationError } from "../errors.js";


export interface MapCardOptions {
  readonly uuid?: () => string;
  readonly now?: () => number;
  readonly sourceId?: string;
}

export interface MappedCharacter {
  readonly character: LumiCharacter;
  readonly issues: readonly { path: string; message: string }[];
  readonly extracted: {
    readonly characterBook: unknown | null;
    readonly backgroundHTML: string | null;
    readonly customScripts: readonly unknown[];
    readonly triggerScripts: readonly unknown[];
    readonly virtualScript: string | null;
    readonly defaultVariables: string | null;
    readonly assets: readonly unknown[];
    readonly depthPrompt: unknown | null;
    readonly utilityBot: boolean;
    readonly additionalText: string | null;
  };
}

function extractData(card: unknown): { data: Record<string, unknown>; spec: string; specVersion: string } {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new TranslationError("card/not_object", "card.json payload is not a JSON object");
  }
  const c = card as Record<string, unknown>;
  const spec = typeof c["spec"] === "string" ? (c["spec"] as string) : "";
  const specVersion = typeof c["spec_version"] === "string" ? (c["spec_version"] as string) : "";
  if ((spec === "chara_card_v2" || spec === "chara_card_v3") && c["data"] && typeof c["data"] === "object") {
    return { data: c["data"] as Record<string, unknown>, spec, specVersion };
  }
  return { data: c, spec: "v1", specVersion: "1.0" };
}

function strField(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

function stringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => strField(x));
}

function unknownArray(v: unknown): readonly unknown[] {
  if (!Array.isArray(v)) return [];
  return v;
}

// Normalize CCSv2 `[name, src, fileName?]` tuples to v3 `{type, name, uri, ext?}` shape.
function risuV2AdditionalAssetsAsV3(risuai: Record<string, unknown>): readonly unknown[] {
  const raw = risuai["additionalAssets"];
  if (!Array.isArray(raw)) return [];
  const out: unknown[] = [];
  for (const t of raw as unknown[]) {
    if (!Array.isArray(t)) continue;
    const name = typeof t[0] === "string" ? (t[0] as string) : "";
    const uri = typeof t[1] === "string" ? (t[1] as string) : "";
    if (!name || !uri) continue;
    const fileName = typeof t[2] === "string" ? (t[2] as string) : "";
    let ext: string | undefined;
    if (fileName.length > 0) {
      const dot = fileName.lastIndexOf(".");
      if (dot >= 0 && dot < fileName.length - 1) {
        const candidate = fileName.slice(dot + 1).toLowerCase();
        if (/^[a-z0-9]{1,6}$/.test(candidate)) ext = candidate;
      }
    }
    out.push({ type: "x-risu-asset", name, uri, ...(ext ? { ext } : {}) });
  }
  return out;
}

function buildExtensions(
  data: Record<string, unknown>,
  spec: string,
  specVersion: string,
  sourceId: string | undefined,
  translationNotes: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const ext = data["extensions"];
  if (ext && typeof ext === "object" && !Array.isArray(ext)) {
    Object.assign(out, ext as Record<string, unknown>);
  }
  if (data["character_book"] !== undefined) out["character_book"] = data["character_book"];
  if (data["character_version"] !== undefined) out["character_version"] = data["character_version"];
  if (data["nickname"] !== undefined) out["nickname"] = data["nickname"];
  if (data["group_only_greetings"] !== undefined) out["group_only_greetings"] = data["group_only_greetings"];
  if (data["creation_date"] !== undefined) out["ccv3_creation_date"] = data["creation_date"];
  if (data["modification_date"] !== undefined) out["ccv3_modification_date"] = data["modification_date"];
  if (data["source"] !== undefined) out["ccv3_source"] = data["source"];
  // Translation provenance.
  out["_lumirealm"] = {
    source: sourceId ?? null,
    spec,
    spec_version: specVersion,
    translated_at: nowMs(),
    translation_notes: translationNotes,
  };
  return out;
}

export function mapCharacter(card: unknown, opts: MapCardOptions = {}): MappedCharacter {
  const uuid = opts.uuid ?? newUuid;
  const now = (opts.now ?? nowMs)();
  const issues: { path: string; message: string }[] = [];
  const translationNotes: string[] = [];

  const { data, spec, specVersion } = extractData(card);

  const name = strField(data["name"]);
  if (name.trim() === "") {
    throw new TranslationError(
      "card/missing_name",
      "character card is missing required 'name' field",
    );
  }

  const description = strField(data["description"]);
  const personality = strField(data["personality"]);
  const scenario = strField(data["scenario"]);
  const first_mes = strField(data["first_mes"]);
  const mes_example = strField(data["mes_example"]);
  const creator = strField(data["creator"]);
  const creator_notes = strField(data["creator_notes"]);
  const system_prompt = strField(data["system_prompt"]);
  const post_history_instructions = strField(data["post_history_instructions"]);

  const alternate_greetings = stringArray(data["alternate_greetings"]);
  const tags = stringArray(data["tags"]);

  if (spec !== "chara_card_v3") {
    translationNotes.push(`source card is ${spec || "unknown"} / ${specVersion}; translator validated on v3.`);
  }

  const extensions = buildExtensions(data, spec, specVersion, opts.sourceId, translationNotes);

  const risuai =
    extensions["risuai"] && typeof extensions["risuai"] === "object" && !Array.isArray(extensions["risuai"])
      ? (extensions["risuai"] as Record<string, unknown>)
      : {};

  const extracted: MappedCharacter["extracted"] = {
    characterBook: data["character_book"] ?? null,
    backgroundHTML: typeof risuai["backgroundHTML"] === "string" ? (risuai["backgroundHTML"] as string) : null,
    customScripts: unknownArray(risuai["customScripts"]),
    triggerScripts: unknownArray(risuai["triggerscript"]),
    virtualScript: typeof risuai["virtualscript"] === "string" ? (risuai["virtualscript"] as string) : null,
    defaultVariables: typeof risuai["defaultVariables"] === "string" ? (risuai["defaultVariables"] as string) : null,
    assets: [
      ...unknownArray(data["assets"]),
      ...risuV2AdditionalAssetsAsV3(risuai),
    ],
    depthPrompt: extensions["depth_prompt"] ?? null,
    utilityBot: risuai["utilityBot"] === true,
    additionalText:
      typeof risuai["additionalText"] === "string" && (risuai["additionalText"] as string).length > 0
        ? (risuai["additionalText"] as string)
        : null,
  };

  if (extracted.customScripts.length > 0) {
    issues.push({
      path: "data.extensions.risuai.customScripts",
      message: `${extracted.customScripts.length} char-level regex script(s) present — unusual for charx export; will be translated like module-level regex`,
    });
  }
  if (extracted.triggerScripts.length > 0) {
    issues.push({
      path: "data.extensions.risuai.triggerscript",
      message: `${extracted.triggerScripts.length} char-level trigger(s) present — unusual for charx export; will be translated like module-level triggers`,
    });
  }
  if (extracted.utilityBot) {
    issues.push({
      path: "data.extensions.risuai.utilityBot",
      message: "utilityBot flag is set. Not supported: no per-character prompt-template override. Character will generate with the user's default preset, which may produce unwanted RP scaffolding.",
    });
  }
  if (extracted.additionalText) {
    issues.push({
      path: "data.extensions.risuai.additionalText",
      message:
        "Risu's Additional Description is set, NOT translated. " +
        "Lumiverse's Memory Cortex provides similar long-term-memory " + "functionality out of the box; consider migrating this content.",
    });
  }

  const character: LumiCharacter = {
    id: uuid(),
    name,
    avatar_path: null,
    image_id: null,
    description,
    personality,
    scenario,
    first_mes,
    mes_example,
    creator,
    creator_notes,
    system_prompt,
    post_history_instructions,
    tags,
    alternate_greetings,
    extensions,
    created_at: now,
    updated_at: now,
  };

  return { character, issues, extracted };
}
