import type { LoreBook } from "../schemas/lorebook.js";
import type { LumiWorldBookEntry } from "../lumiverse/types.js";
import { newUuid, nowMs, splitKeywords } from "./util.js";


export interface MapLorebookOptions {
  readonly worldBookId: string;
  readonly now?: () => number;
  readonly uuid?: () => string;
}

function buildFolderIndex(entries: readonly LoreBook[]): Map<string, string> {
  const byId = new Map<string, string>();
  for (const e of entries) {
    if (e.mode === "folder" && e.id) {
      byId.set(e.id, e.comment || "");
    }
  }
  return byId;
}

function resolveFolderName(entry: LoreBook, folders: Map<string, string>): string {
  const f = entry.folder;
  if (!f) return "";
  const idx = f.indexOf(":");
  const uuid = idx >= 0 ? f.slice(idx + 1) : f;
  return folders.get(uuid) ?? "";
}

function mapMode(e: LoreBook): { constant: boolean; disabled: boolean; position: number } {
  if (e.mode === "folder") {
    return { constant: false, disabled: true, position: 0 };
  }
  const constant = e.mode === "constant" || !!e.alwaysActive;
  return { constant, disabled: false, position: 0 };
}

function buildExtensions(e: LoreBook): Record<string, unknown> {
  const ext: Record<string, unknown> = {};
  // Risu spells it "extentions", preserve as-is.
  if (e.extentions !== undefined) ext["risu_extentions"] = e.extentions;
  if (e.loreCache !== undefined) ext["risu_lore_cache"] = e.loreCache;
  if (e.bookVersion !== undefined) ext["risu_book_version"] = e.bookVersion;
  if (e.mode !== undefined) ext["risu_mode"] = e.mode;
  if (e.folder !== undefined) ext["risu_folder"] = e.folder;
  if (e.id !== undefined) ext["risu_entry_id"] = e.id;
  return ext;
}

export function mapLoreBookEntry(
  entry: LoreBook,
  worldBookId: string,
  folders: Map<string, string>,
  now: number,
  uuid: () => string,
): LumiWorldBookEntry {
  const { constant, disabled, position } = mapMode(entry);
  const groupName = resolveFolderName(entry, folders);

  const probability =
    entry.activationPercent !== undefined && entry.activationPercent !== null
      ? entry.activationPercent
      : 100;

  const caseSensitive = entry.extentions?.risu_case_sensitive === true;

  return {
    id: uuid(),
    world_book_id: worldBookId,
    uid: entry.id ?? uuid(),
    key: splitKeywords(entry.key),
    keysecondary: splitKeywords(entry.secondkey),

    content: entry.content,
    comment: entry.comment,

    position,
    depth: 0,
    role: null,
    order_value: entry.insertorder,

    selective: entry.selective,
    constant,
    disabled,

    group_name: groupName,
    group_override: false,
    group_weight: 1,

    probability,
    scan_depth: null,

    case_sensitive: caseSensitive,
    match_whole_words: false,
    automation_id: null,
    use_regex: entry.useRegex === true,

    prevent_recursion: false,
    exclude_recursion: false,
    delay_until_recursion: false,
    priority: 0,
    sticky: 0,
    cooldown: 0,
    delay: 0,
    selective_logic: 0,
    use_probability: entry.activationPercent !== undefined && entry.activationPercent !== null,

    vectorized: false,
    vector_index_status: "not_enabled",
    vector_indexed_at: null,
    vector_index_error: null,

    extensions: buildExtensions(entry),
    created_at: now,
    updated_at: now,
  };
}

export function mapLoreBook(
  entries: readonly LoreBook[],
  opts: MapLorebookOptions,
): LumiWorldBookEntry[] {
  const now = (opts.now ?? nowMs)();
  const uuid = opts.uuid ?? newUuid;
  const folders = buildFolderIndex(entries);
  const out: LumiWorldBookEntry[] = new Array(entries.length);
  for (let i = 0; i < entries.length; i++) {
    out[i] = mapLoreBookEntry(entries[i]!, opts.worldBookId, folders, now, uuid);
  }
  return out;
}
