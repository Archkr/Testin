// Per-character cache of `position: fixed` selector sets for portal-wrap.
// Selectors extracted from background_html and inline <style> blocks in display-regex rules.
// Lazy build per character; invalidated on CHARACTER_DELETED or re-import.

import {
  extractPortalSelectors,
  extractInlineStyleSelectors,
  EMPTY_PORTAL_SELECTORS,
  type PortalSelectors,
} from '../core/mappers/portal-analyze.js';
import type { StoredRisuCard } from '../payload/types.js';

const byCharacter = new Map<string, PortalSelectors>();

export function getOrBuildPortalSelectors(card: StoredRisuCard): PortalSelectors {
  const cid = card.character_id;
  const cached = byCharacter.get(cid);
  if (cached) return cached;

  const bgHtml = card.risuPayload.background_html ?? '';
  let sel: PortalSelectors = EMPTY_PORTAL_SELECTORS;
  if (bgHtml.length > 0) {
    // Try inline-style scanner first (full HTML doc); fall back to direct CSS extraction (fragment).
    sel = extractInlineStyleSelectors(bgHtml);
    if (sel.ids.size === 0 && sel.classes.size === 0) {
      sel = extractPortalSelectors(bgHtml);
    }
  }

  // Also scan inline <style> blocks in display-regex replace_strings.
  const rules = card.regex_scripts ?? [];
  const ids = new Set<string>(sel.ids);
  const classes = new Set<string>(sel.classes);
  for (const r of rules) {
    const replace = String((r as { replace_string?: unknown }).replace_string ?? '');
    if (replace.length === 0 || replace.indexOf('<style') < 0) continue;
    const partial = extractInlineStyleSelectors(replace);
    for (const id of partial.ids) ids.add(id);
    for (const cls of partial.classes) classes.add(cls);
  }
  const merged: PortalSelectors = { ids, classes };
  byCharacter.set(cid, merged);
  return merged;
}

export function clearPortalSelectorsForCard(characterId: string): void {
  byCharacter.delete(characterId);
}

/** Test hook — wipe everything. */
export function resetPortalSelectorsCache(): void {
  byCharacter.clear();
}

/** Diagnostic — entry count. */
export function portalSelectorsCacheSize(): number {
  return byCharacter.size;
}
