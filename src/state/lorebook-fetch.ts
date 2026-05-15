declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

import type { WorldBookEntryDTO } from "lumiverse-spindle-types";
import type { LorebookEntry } from "../core/cbs/runtime/context.js";

// Risu's loreBook shape (storage/database.svelte.ts): key/secondkey are single
// comma-joined strings, not arrays. {{lorebook}} JSON.stringifies each entry and
// cards read lore.key as a string, so join here at the boundary.
//
// Flat shape only (no nested objects). {{lorebook}} entries get injected into
// other macros' args via {{element::{{slot::lore}}::key}}; the CBS scanner
// detects macro close on any `}}`, so a nested object whose JSON ends in `}}`
// (e.g. Lumi's extensions blob) truncates the {{element::...}} macro and the
// whole {{#each}} collapses. Risu's loreBook serialization for these entries is
// flat too; the Lumi extensions blob is internal and not part of {{lorebook}}.
export function lumiEntryToRisuLore(e: WorldBookEntryDTO): LorebookEntry {
  const keyStr = (e.key ?? []).join(",");
  const secondStr = (e.keysecondary ?? []).join(",");
  return {
    key: keyStr,
    secondkey: secondStr,
    secondKey: secondStr,
    content: e.content ?? "",
    comment: e.comment ?? "",
    insertorder: e.order_value ?? 0,
    alwaysActive: e.constant === true,
    selective: e.selective === true,
    mode: e.constant ? "constant" : "normal",
  };
}

// Mirrors {{lorebook}} = characterLore.concat(chatLore, moduleLore): the raw
// entry list with no disabled/activation filtering (Risu cbs.ts).
export async function fetchLorebookForCharacter(
  worldBookIds: readonly string[],
  userId: string,
): Promise<readonly LorebookEntry[]> {
  if (worldBookIds.length === 0) return [];
  const out: LorebookEntry[] = [];
  for (const bid of worldBookIds) {
    let offset = 0;
    for (;;) {
      const page = await spindle.world_books.entries.list(bid, { limit: 200, offset, userId });
      const rows = page?.data ?? [];
      for (const row of rows) out.push(lumiEntryToRisuLore(row));
      if (rows.length < 200) break;
      offset += rows.length;
    }
  }
  return out;
}
