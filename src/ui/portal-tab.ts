import type {
  BackendToFrontend,
  CardSummary,
  FrontendToBackend,
  PortalCandidateMsg,
} from '../types/messages.js';
import { substituteForPreview } from '../core/preview/substitute.js';
import type { FrontendLog } from './drawer.js';

// Per-card review for portal vs inline rendering decisions.
// Mounts into a host element provided by ui/sidebar.ts.

const HIGH_YES_LABEL = 'high confidence';
const AMBIGUOUS_LABEL = 'mid confidence';
const HIGH_NO_LABEL = 'low confidence';

interface CardSnapshot {
  readonly characterId: string;
  readonly candidates: readonly PortalCandidateMsg[];
  readonly decisions: Readonly<Record<string, 'portal' | 'inline'>>;
  readonly ts: number;
}

export interface PortalTabHandle {
  handleBackendMessage(msg: BackendToFrontend): void;
  destroy(): void;
}

export interface MountPersistentUisPanelOptions {
  readonly root: HTMLElement;
  readonly sendToBackend: (msg: FrontendToBackend) => void;
  readonly log: FrontendLog;
}

export function mountPersistentUisPanel(
  opts: MountPersistentUisPanelOptions,
): PortalTabHandle {
  const { sendToBackend, log } = opts;
  log.info('persistent-uis-panel: mounting');

  const root = opts.root;
  root.classList.add('lr-portal-drawer');


  let cards: readonly CardSummary[] = [];
  let selectedCardId: string | null = null;
  const snapshots = new Map<string, CardSnapshot>();
  const pendingDecisions = new Set<string>();


  const intro = document.createElement('p');
  intro.className = 'lrp-intro';
  intro.textContent = 'Configure UI elements lifted out of the message.';
  root.appendChild(intro);

  const toolbar = document.createElement('div');
  toolbar.className = 'lrp-toolbar';

  const cardLabel = document.createElement('label');
  cardLabel.className = 'lrp-card-label';
  cardLabel.textContent = 'Card:';
  toolbar.appendChild(cardLabel);

  const cardSelect = document.createElement('select');
  cardSelect.className = 'lrp-card-select';
  toolbar.appendChild(cardSelect);

  const refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'lrm-btn';
  refreshBtn.textContent = 'Refresh';
  refreshBtn.title = 'Re-fetch candidates.';
  toolbar.appendChild(refreshBtn);

  root.appendChild(toolbar);

  const status = document.createElement('div');
  status.className = 'lrp-status';
  root.appendChild(status);

  const sectionsHost = document.createElement('div');
  sectionsHost.className = 'lrp-sections';
  root.appendChild(sectionsHost);

  setStatus('Loading cards…');


  function setStatus(msg: string, isError = false): void {
    status.textContent = msg;
    status.classList.toggle('lrp-status-error', isError);
  }

  function pendingKey(characterId: string, candidateId: string): string {
    return `${characterId}|${candidateId}`;
  }


  function rebuildCardSelect(): void {
    cardSelect.innerHTML = '';
    if (cards.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '(no Risu cards imported)';
      opt.disabled = true;
      cardSelect.appendChild(opt);
      cardSelect.disabled = true;
      return;
    }
    cardSelect.disabled = false;
    for (const c of cards) {
      const opt = document.createElement('option');
      opt.value = c.character_id;
      opt.textContent = c.character_name ?? c.character_id;
      cardSelect.appendChild(opt);
    }
    if (selectedCardId !== null && cards.some((c) => c.character_id === selectedCardId)) {
      cardSelect.value = selectedCardId;
    } else {
      selectedCardId = cards[0]!.character_id;
      cardSelect.value = selectedCardId;
      requestCandidates(selectedCardId);
    }
  }

  cardSelect.addEventListener('change', () => {
    const next = cardSelect.value;
    if (!next || next === selectedCardId) return;
    selectedCardId = next;
    requestCandidates(next);
  });

  refreshBtn.addEventListener('click', () => {
    if (selectedCardId !== null) requestCandidates(selectedCardId);
  });

  function requestCandidates(characterId: string): void {
    setStatus('Loading…');
    sendToBackend({ type: 'request_portal_candidates', characterId });
  }


  function renderForSelectedCard(): void {
    sectionsHost.innerHTML = '';
    if (selectedCardId === null) {
      setStatus('Pick a card to review.');
      return;
    }
    const snap = snapshots.get(selectedCardId);
    if (!snap) {
      setStatus('Loading…');
      return;
    }
    const characterName = cards.find((c) => c.character_id === snap.characterId)?.character_name ?? snap.characterId;
    if (snap.candidates.length === 0) {
      setStatus(`"${characterName}" — no portal candidates flagged. The translator's heuristic decided every rule on its own.`);
      return;
    }
    const ambiguous = snap.candidates.filter((c) => c.confidence === 'ambiguous');
    const highYes = snap.candidates.filter((c) => c.confidence === 'high-yes');
    const highNo = snap.candidates.filter((c) => c.confidence === 'high-no');
    const total = ambiguous.length + highYes.length + highNo.length;
    setStatus(
      `"${characterName}" — ${total} candidate(s): `
      + `${highYes.length} high · ${ambiguous.length} mid · ${highNo.length} low`,
    );
    if (highYes.length > 0) {
      sectionsHost.appendChild(renderSection({
        title: `High confidence (${highYes.length})`,
        subtitle: 'Auto-promoted to Persistent UI — heuristic is confident. Expand to override.',
        candidates: highYes,
        snapshot: snap,
        defaultOpen: false,
      }));
    }
    if (ambiguous.length > 0) {
      sectionsHost.appendChild(renderSection({
        title: `Mid confidence (${ambiguous.length})`,
        subtitle: 'Heuristic confidence is mixed — your call. Sometimes these need to be required.',
        candidates: ambiguous,
        snapshot: snap,
        defaultOpen: true,
      }));
    }
    if (highNo.length > 0) {
      sectionsHost.appendChild(renderSection({
        title: `Low confidence (${highNo.length})`,
        subtitle: 'Heuristic recommends inline rendering. Expand to force into the overlay if needed.',
        candidates: highNo,
        snapshot: snap,
        defaultOpen: false,
      }));
    }
  }

  function renderSection(opts: {
    title: string;
    subtitle: string;
    candidates: readonly PortalCandidateMsg[];
    snapshot: CardSnapshot;
    defaultOpen: boolean;
  }): HTMLDetailsElement {
    const det = document.createElement('details');
    det.className = 'lrp-section';
    if (opts.defaultOpen) det.open = true;
    const summary = document.createElement('summary');
    summary.className = 'lrp-section-summary';
    const titleEl = document.createElement('span');
    titleEl.className = 'lrp-section-title';
    titleEl.textContent = opts.title;
    const subEl = document.createElement('span');
    subEl.className = 'lrp-section-sub';
    subEl.textContent = opts.subtitle;
    summary.appendChild(titleEl);
    summary.appendChild(subEl);
    det.appendChild(summary);
    for (const c of opts.candidates) {
      det.appendChild(renderCandidate(c, opts.snapshot));
    }
    return det;
  }

  function renderCandidate(c: PortalCandidateMsg, snap: CardSnapshot): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'lrp-candidate';
    const isPending = pendingDecisions.has(pendingKey(snap.characterId, c.id));
    if (isPending) row.classList.add('lrp-candidate-pending');

    const head = document.createElement('div');
    head.className = 'lrp-candidate-head';

    const sourceLabel = document.createElement('span');
    sourceLabel.className = 'lrp-source';
    if (c.source.kind === 'regex_rule') {
      sourceLabel.textContent = `Rule #${c.source.sort_order}`;
      sourceLabel.title = `Find pattern: ${c.source.find_regex_preview}`;
    } else {
      sourceLabel.textContent = c.source.alt_index === 0
        ? 'Greeting (first message)'
        : `Greeting (alternate ${c.source.alt_index})`;
    }
    head.appendChild(sourceLabel);

    const confBadge = document.createElement('span');
    confBadge.className = `lrp-conf lrp-conf-${c.confidence}`;
    confBadge.textContent = c.confidence === 'high-yes'
      ? HIGH_YES_LABEL
      : c.confidence === 'ambiguous'
        ? AMBIGUOUS_LABEL
        : HIGH_NO_LABEL;
    head.appendChild(confBadge);

    const decisionWrap = document.createElement('div');
    decisionWrap.className = 'lrp-decision';
    const select = document.createElement('select');
    select.className = 'lrp-decision-select';
    const opts: Array<['', string]
      | ['portal', string]
      | ['inline', string]> = [
      ['', `Auto (${c.heuristic_decision === 'portal' ? 'persistent UI' : 'inline'})`],
      ['portal', 'Persistent UI (overlay)'],
      ['inline', 'Inline (in bubble)'],
    ];
    for (const [val, label] of opts) {
      const o = document.createElement('option');
      o.value = val;
      o.textContent = label;
      select.appendChild(o);
    }
    const currentDecision = snap.decisions[c.id];
    select.value = currentDecision ?? '';
    select.disabled = isPending;
    select.addEventListener('change', () => {
      const next = select.value as '' | 'portal' | 'inline';
      const decision: 'portal' | 'inline' | null = next === '' ? null : next;
      pendingDecisions.add(pendingKey(snap.characterId, c.id));
      log.info(`portal-tab: set_portal_decision char=${snap.characterId} id=${c.id} decision=${decision ?? '<auto>'}`);
      sendToBackend({
        type: 'set_portal_decision',
        characterId: snap.characterId,
        candidateId: c.id,
        decision,
      });
      renderForSelectedCard();
    });
    decisionWrap.appendChild(select);
    head.appendChild(decisionWrap);

    row.appendChild(head);

    if (c.triggering_selectors.length > 0) {
      const hint = document.createElement('div');
      hint.className = 'lrp-trigger-hint';
      const sourceText = c.triggering_css_source === 'both'
        ? 'bg-html + rule\'s own <style>'
        : c.triggering_css_source === 'rule_inline_style'
          ? 'rule\'s own <style>'
          : c.triggering_css_source === 'bg_html'
            ? 'bg-html'
            : 'inline style="…" attribute';
      hint.textContent = `Matched ${c.triggering_selectors.length} selector(s) in ${sourceText}: `;
      const code = document.createElement('code');
      code.textContent = c.triggering_selectors.slice(0, 4).join(', ')
        + (c.triggering_selectors.length > 4 ? `, +${c.triggering_selectors.length - 4} more` : '');
      hint.appendChild(code);
      row.appendChild(hint);
    } else if (c.triggering_css_source === 'inline_style_attr') {
      const hint = document.createElement('div');
      hint.className = 'lrp-trigger-hint';
      hint.textContent = 'Matched inline style="position: fixed" attribute on a subtree element.';
      row.appendChild(hint);
    }

    const previewDetails = document.createElement('details');
    previewDetails.className = 'lrp-preview';
    const previewSummary = document.createElement('summary');
    previewSummary.textContent = 'Preview';
    previewDetails.appendChild(previewSummary);

    const previewBody = document.createElement('div');
    previewBody.className = 'lrp-preview-body';
    // Lazy mount to avoid building dozens of shadow DOMs up front.
    let mounted = false;
    previewDetails.addEventListener('toggle', () => {
      if (!previewDetails.open || mounted) return;
      mountShadowPreview(previewBody, c, snap, cards.find((cc) => cc.character_id === snap.characterId)?.character_name ?? null);
      mounted = true;
    });
    previewDetails.appendChild(previewBody);
    row.appendChild(previewDetails);

    return row;
  }

  function mountShadowPreview(
    host: HTMLDivElement,
    c: PortalCandidateMsg,
    _snap: CardSnapshot,
    characterName: string | null,
  ): void {
    // Unknown vars are left verbatim so the user sees what's unresolved.
    const substituted = substituteForPreview(c.subtree_html, {
      userName: 'You',
      charName: characterName ?? 'Character',
    });

    const shadowHost = document.createElement('div');
    shadowHost.className = 'lrp-preview-shadow-host';
    shadowHost.title = `Portal candidate ${c.id} preview`;
    host.appendChild(shadowHost);

    let root: ShadowRoot;
    try {
      root = shadowHost.attachShadow({ mode: 'open' });
    } catch (err) {
      // Shadow DOM unavailable; CSS will leak but content is still visible.
      log.warn('portal-tab: shadow attach failed, falling back to inline', err);
      shadowHost.innerHTML = substituted;
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        max-height: 600px;
        overflow: auto;
        background: #1c1c1f;
        color: #ddd;
        font-family: system-ui, sans-serif;
        font-size: 13px;
        line-height: 1.45;
        padding: 8px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        box-sizing: border-box;
      }
      img, video {
        max-width: 100%;
        height: auto;
      }
      * { max-width: 100%; box-sizing: border-box; }
    `;
    root.appendChild(style);

    const slot = document.createElement('div');
    slot.innerHTML = substituted;
    root.appendChild(slot);

    const rawDetails = document.createElement('details');
    rawDetails.className = 'lrp-raw';
    const rawSummary = document.createElement('summary');
    rawSummary.textContent = 'Raw template';
    rawDetails.appendChild(rawSummary);
    const pre = document.createElement('pre');
    pre.className = 'lrp-raw-pre';
    pre.textContent = c.subtree_html;
    rawDetails.appendChild(pre);
    host.appendChild(rawDetails);
  }


  function handleBackendMessage(msg: BackendToFrontend): void {
    if (msg.type === 'cards_updated') {
      cards = msg.cards;
      rebuildCardSelect();
      if (selectedCardId !== null) requestCandidates(selectedCardId);
    } else if (msg.type === 'portal_candidates_pushed') {
      snapshots.set(msg.characterId, {
        characterId: msg.characterId,
        candidates: msg.candidates,
        decisions: msg.decisions,
        ts: msg.ts,
      });
      for (const key of [...pendingDecisions]) {
        if (key.startsWith(`${msg.characterId}|`)) pendingDecisions.delete(key);
      }
      if (selectedCardId === msg.characterId) {
        renderForSelectedCard();
      }
    } else if (msg.type === 'error') {
      setStatus(`Backend error: ${msg.message}`, true);
    }
  }

  function destroy(): void {
    log.info('persistent-uis-panel: destroy');
    try { root.replaceChildren(); } catch { /* ignore */ }
  }

  sendToBackend({ type: 'get_cards' });

  return { handleBackendMessage, destroy };
}
