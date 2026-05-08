// Coordinates browser-side translation + batched cache writeback to BE.
// Display-only, never alters originals.

import type { FrontendToBackend } from '../types/messages.js';
import { getTranslator } from './browser-translator.js';

export interface TranslateOrchestratorOpts {
  readonly sendToBackend: (msg: FrontendToBackend) => void;
  readonly log: { info(s: string): void; warn(s: string): void; error(s: string, ...rest: unknown[]): void };
}

interface ModuleScope {
  kind: 'module';
  moduleId: string;
}
interface CharacterScope {
  kind: 'character';
  characterId: string;
}
type Scope = ModuleScope | CharacterScope;

const FLUSH_INTERVAL_MS = 250;

export interface TranslateOrchestrator {
  // Returns `original` if browser translator is unavailable or text is empty.
  request(scope: Scope, key: string, original: string, kind: 'name' | 'description' | 'comment'): Promise<string>;
  // Pin a source language for a scope. Skips per-string detection inside the scope.
  setScopeLang(scope: Scope, lang: string | null): void;
  flush(): void;
  destroy(): void;
}

let singleton: TranslateOrchestrator | null = null;

export function initTranslateOrchestrator(opts: TranslateOrchestratorOpts): TranslateOrchestrator {
  if (singleton !== null) return singleton;
  singleton = setupTranslateOrchestrator(opts);
  return singleton;
}

export function getTranslateOrchestrator(): TranslateOrchestrator | null {
  return singleton;
}

// Convenience helpers used by render paths. No-op when orchestrator absent.
export async function translateModuleName(moduleId: string, name: string): Promise<string> {
  return singleton?.request({ kind: 'module', moduleId }, 'name', name, 'name') ?? name;
}

export async function translateModuleDescription(moduleId: string, desc: string): Promise<string> {
  return singleton?.request({ kind: 'module', moduleId }, 'description', desc, 'description') ?? desc;
}

export async function translateLorebookComment(
  scope: { kind: 'module'; moduleId: string } | { kind: 'character'; characterId: string },
  sourceHash: string,
  comment: string,
): Promise<string> {
  return singleton?.request(scope, sourceHash, comment, 'comment') ?? comment;
}

// `lang === null` means the scope is already in the target language, skip translation.
// `lang === undefined` resets the scope so the next request falls back to per-string detection.
export function setModuleScopeLang(moduleId: string, lang: string | null): void {
  singleton?.setScopeLang({ kind: 'module', moduleId }, lang);
}

export function setCharacterScopeLang(characterId: string, lang: string | null): void {
  singleton?.setScopeLang({ kind: 'character', characterId }, lang);
}

export function setupTranslateOrchestrator(opts: TranslateOrchestratorOpts): TranslateOrchestrator {
  const inFlight = new Map<string, Promise<string>>();
  const scopeLangs = new Map<string, string | null>();
  const moduleBatches = new Map<string, {
    name?: { translated: string };
    description?: { translated: string };
    lorebook: Map<string, string>;
  }>();
  const characterBatches = new Map<string, {
    lorebook: Map<string, string>;
  }>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  function scopeBatchKey(scope: Scope): string {
    return scope.kind === 'module' ? `m:${scope.moduleId}` : `c:${scope.characterId}`;
  }

  function inFlightKey(scope: Scope, key: string, original: string): string {
    return `${scopeBatchKey(scope)}|${key}|${original}`;
  }

  function setScopeLang(scope: Scope, lang: string | null): void {
    scopeLangs.set(scopeBatchKey(scope), lang);
  }

  function scheduleFlush(): void {
    if (destroyed) return;
    if (timer !== null) return;
    timer = setTimeout(flush, FLUSH_INTERVAL_MS);
  }

  function flush(): void {
    if (timer !== null) { clearTimeout(timer); timer = null; }
    for (const [moduleId, batch] of moduleBatches.entries()) {
      const lorebook: Array<{ sourceHash: string; comment?: string }> = [];
      for (const [hash, comment] of batch.lorebook.entries()) {
        lorebook.push({ sourceHash: hash, comment });
      }
      const msg: FrontendToBackend = {
        type: 'cache_module_translation',
        moduleId,
        lang: 'en',
        ...(batch.name !== undefined ? { name: batch.name.translated } : {}),
        ...(batch.description !== undefined ? { description: batch.description.translated } : {}),
        ...(lorebook.length > 0 ? { lorebook } : {}),
      };
      opts.sendToBackend(msg);
    }
    moduleBatches.clear();
    for (const [characterId, batch] of characterBatches.entries()) {
      if (batch.lorebook.size === 0) continue;
      const lorebook: Array<{ sourceHash: string; comment?: string }> = [];
      for (const [hash, comment] of batch.lorebook.entries()) {
        lorebook.push({ sourceHash: hash, comment });
      }
      opts.sendToBackend({
        type: 'cache_character_translation',
        characterId,
        lang: 'en',
        lorebook,
      });
    }
    characterBatches.clear();
  }

  function enqueue(scope: Scope, key: string, kind: 'name' | 'description' | 'comment', translated: string): void {
    if (scope.kind === 'module') {
      let batch = moduleBatches.get(scope.moduleId);
      if (!batch) {
        batch = { lorebook: new Map() };
        moduleBatches.set(scope.moduleId, batch);
      }
      if (kind === 'name') batch.name = { translated };
      else if (kind === 'description') batch.description = { translated };
      else batch.lorebook.set(key, translated);
    } else {
      let batch = characterBatches.get(scope.characterId);
      if (!batch) {
        batch = { lorebook: new Map() };
        characterBatches.set(scope.characterId, batch);
      }
      batch.lorebook.set(key, translated);
    }
    scheduleFlush();
  }

  async function request(
    scope: Scope,
    key: string,
    original: string,
    kind: 'name' | 'description' | 'comment',
  ): Promise<string> {
    if (!original || original.trim().length === 0) return original;
    const flightKey = inFlightKey(scope, key, original);
    const existing = inFlight.get(flightKey);
    if (existing) return existing;
    const translator = getTranslator();
    if (!translator) return original;
    const scopeLang = scopeLangs.get(scopeBatchKey(scope));
    // Scope was classified as already-target-language, skip translation.
    if (scopeLang === null) return original;
    const promise = (async () => {
      try {
        const translated = await translator.translateOne(original, scopeLang ?? undefined);
        if (translated && translated !== original) {
          enqueue(scope, key, kind, translated);
        }
        return translated;
      } catch (err) {
        opts.log.warn(`translate-orchestrator: ${kind} ${flightKey} threw: ${err instanceof Error ? err.message : String(err)}`);
        return original;
      }
    })();
    inFlight.set(flightKey, promise);
    return promise;
  }

  return {
    request,
    setScopeLang,
    flush,
    destroy: () => {
      destroyed = true;
      if (timer !== null) { clearTimeout(timer); timer = null; }
      flush();
      inFlight.clear();
      scopeLangs.clear();
    },
  };
}
