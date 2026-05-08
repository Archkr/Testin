// Header-mounted toggle that flips display between original and browser-
// translated text. Persists via update_settings.translateEnabled.

import type { BackendToFrontend, FrontendToBackend } from '../types/messages.js';
import { isTranslationAvailable } from './browser-translator.js';

export interface TranslateToggleHandle {
  handleBackendMessage(msg: BackendToFrontend): void;
  destroy(): void;
}

export interface SetupTranslateToggleOpts {
  readonly mountTarget: HTMLElement;
  readonly sendToBackend: (msg: FrontendToBackend) => void;
  readonly log: { info(s: string): void; warn(s: string): void; error(s: string, ...rest: unknown[]): void };
}

let lastTranslateEnabled = true;
const subscribers = new Set<(enabled: boolean) => void>();

export function getTranslateEnabled(): boolean {
  return lastTranslateEnabled;
}

export function subscribeTranslateEnabled(cb: (enabled: boolean) => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function setupTranslateToggle(opts: SetupTranslateToggleOpts): TranslateToggleHandle {
  const btn = document.createElement('button');
  btn.type = 'button';
  // Share the realm-launcher pill geometry verbatim, then add a state-only modifier.
  btn.className = 'lr-realm-launcher lr-translate-toggle';
  let enabled = lastTranslateEnabled;
  const apiAvailable = isTranslationAvailable();

  function paint(): void {
    btn.textContent = `Translate: ${enabled && apiAvailable ? 'On' : 'Off'}`;
    btn.classList.toggle('lr-translate-toggle-on', enabled && apiAvailable);
    btn.classList.toggle('lr-translate-toggle-disabled', !apiAvailable);
    if (!apiAvailable) {
      btn.title = 'Non-Chrome browser support comming soon.';
    } else {
      btn.title = enabled
        ? 'Display module + lorebook names in browser-translated form (English).'
        : 'Display original names.';
    }
  }

  // Idempotent state-update path used by both click and settings_pushed.
  function applyEnabled(next: boolean, source: 'click' | 'settings_pushed'): void {
    if (next === enabled && next === lastTranslateEnabled) return;
    enabled = next;
    lastTranslateEnabled = next;
    paint();
    opts.log.info(`translate-toggle: -> ${enabled ? 'on' : 'off'} (via ${source})`);
    for (const cb of subscribers) {
      try { cb(next); } catch (err) { opts.log.error('translate-toggle: subscriber threw', err); }
    }
  }

  paint();
  btn.addEventListener('click', () => {
    if (!apiAvailable) return;
    applyEnabled(!enabled, 'click');
    opts.sendToBackend({
      type: 'update_settings',
      patch: { translateEnabled: enabled },
    });
  });
  if (!apiAvailable) {
    btn.setAttribute('aria-disabled', 'true');
    btn.disabled = true;
  }
  opts.mountTarget.appendChild(btn);

  // settings_pushed is source of truth on boot.
  opts.sendToBackend({ type: 'request_settings' });

  function handleBackendMessage(msg: BackendToFrontend): void {
    if (msg.type !== 'settings_pushed') return;
    const settings = msg.settings as { translateEnabled?: unknown };
    if (!('translateEnabled' in settings)) return;
    applyEnabled(settings.translateEnabled === true, 'settings_pushed');
  }

  function destroy(): void {
    try { btn.remove(); } catch { /* */ }
  }

  return { handleBackendMessage, destroy };
}
