import type { Handler } from './types.js';

export interface PendingConsent {
  readonly ownerUserId: string;
  readonly resolver: (confirmed: boolean) => void;
}

export interface ConsentHandlerDeps {
  readonly pendingConsents: Map<string, PendingConsent>;
  readonly resolveAlertDismissal: (requestId: string, userId: string) => { ok: boolean; reason?: string };
  readonly resolvePickResolution: (requestId: string, userId: string, value: string | null) => { ok: boolean; reason?: string };
  readonly log: { readonly info: (m: string) => void; readonly warn: (m: string) => void };
}

export function createConsentHandlers(deps: ConsentHandlerDeps): {
  readonly consent_response: Handler<'consent_response'>;
  readonly alert_dismissed: Handler<'alert_dismissed'>;
  readonly pick_resolved: Handler<'pick_resolved'>;
} {
  return {
    consent_response: async (msg, ctx) => {
      const pending = deps.pendingConsents.get(msg.requestId);
      if (!pending) {
        deps.log.warn(`consent_response: no pending request for requestId=${msg.requestId}`);
        ctx.send({ type: 'error', message: `consent: unknown request` }, ctx.userId);
        return;
      }
      if (pending.ownerUserId !== ctx.userId) {
        deps.log.warn(`consent_response: ownership mismatch requestId=${msg.requestId} owner=${pending.ownerUserId} responder=${ctx.userId ?? '<none>'}`);
        ctx.send({ type: 'error', message: `consent: unknown request` }, ctx.userId);
        return;
      }
      deps.pendingConsents.delete(msg.requestId);
      deps.log.info(`consent_response: requestId=${msg.requestId} confirmed=${msg.confirmed}`);
      pending.resolver(msg.confirmed);
    },
    alert_dismissed: async (msg, ctx) => {
      const r = deps.resolveAlertDismissal(msg.requestId, ctx.userId);
      if (!r.ok) {
        deps.log.warn(`alert_dismissed: ${r.reason} requestId=${msg.requestId} responder=${ctx.userId ?? '<none>'}`);
        ctx.send({ type: 'error', message: `alert: ${r.reason ?? 'failed'}` }, ctx.userId);
      }
    },
    pick_resolved: async (msg, ctx) => {
      const r = deps.resolvePickResolution(msg.requestId, ctx.userId, msg.value);
      if (!r.ok) {
        deps.log.warn(`pick_resolved: ${r.reason} requestId=${msg.requestId} responder=${ctx.userId ?? '<none>'}`);
        ctx.send({ type: 'error', message: `pick: ${r.reason ?? 'failed'}` }, ctx.userId);
      }
    },
  };
}
