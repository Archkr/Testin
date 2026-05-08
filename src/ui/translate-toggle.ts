// Header-mounted toggle that flips display between original and browser-
// translated text. Persists via update_settings.translateEnabled.

import type { BackendToFrontend, FrontendToBackend } from '../types/messages.js';
import { isTranslationAvailable, isUsingFallback, subscribeFallbackDisabled } from './browser-translator.js';

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
  const label = document.createElement('span');
  btn.appendChild(label);
  let enabled = lastTranslateEnabled;
  let apiAvailable = isTranslationAvailable();

  function paint(): void {
    label.textContent = `Translate: ${enabled && apiAvailable ? 'On' : 'Off'}`;
    btn.classList.toggle('lr-translate-toggle-on', enabled && apiAvailable);
    btn.classList.toggle('lr-translate-toggle-disabled', !apiAvailable);
    if (!apiAvailable) {
      btn.title = 'Unavaliable. Blame Google Translate.';
    } else if (isUsingFallback()) {
      btn.title = enabled
        ? 'Display module + lorebook names translated via Google Translate.'
        : 'Display original names.';
    } else {
      btn.title = enabled
        ? 'Display module + lorebook names in browser-translated form (English).'
        : 'Display original names.';
    }
  }

  function showToast(message: string): void {
    const t = document.createElement('div');
    t.className = 'lr-translate-toast';
    t.textContent = message;
    Object.assign(t.style, {
      position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(20,20,20,0.92)', color: '#fff', padding: '10px 16px',
      borderRadius: '8px', fontSize: '13px', zIndex: '99999', maxWidth: '90vw',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(t);
    setTimeout(() => { try { t.remove(); } catch { /* */ } }, 5000);
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

  const unsubscribeFallback = subscribeFallbackDisabled((reason) => {
    apiAvailable = false;
    btn.setAttribute('aria-disabled', 'true');
    btn.disabled = true;
    if (enabled) applyEnabled(false, 'click');
    else paint();
    opts.log.warn(`translate-toggle: fallback disabled (${reason})`);
    showToast('Translation rate-limited. Translator turned off.');
  });

  // settings_pushed is source of truth on boot.
  opts.sendToBackend({ type: 'request_settings' });

  function handleBackendMessage(msg: BackendToFrontend): void {
    if (msg.type !== 'settings_pushed') return;
    const settings = msg.settings as { translateEnabled?: unknown };
    if (!('translateEnabled' in settings)) return;
    applyEnabled(settings.translateEnabled === true, 'settings_pushed');
  }

  function destroy(): void {
    try { unsubscribeFallback(); } catch { /* */ }
    try { btn.remove(); } catch { /* */ }
  }

  return { handleBackendMessage, destroy };
}
