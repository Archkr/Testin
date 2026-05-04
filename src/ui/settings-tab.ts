import type {
  BackendToFrontend,
  FrontendToBackend,
} from '../types/messages.js';
import type { FrontendLog } from './drawer.js';
import { mountLogsPanel } from './logs-tab.js';

// Settings UI for aux/submodel LLM connections.
// Every change is sent as update_settings; state is reflected back via settings_pushed.

interface ConnectionSummary {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly model: string;
  readonly is_default: boolean;
}

type SamplerKey =
  | 'temperature' | 'maxTokens' | 'contextSize'
  | 'topP' | 'minP' | 'topK'
  | 'frequencyPenalty' | 'presencePenalty' | 'repetitionPenalty';

type SamplerBag = Readonly<Record<SamplerKey, number | null>>;

interface Settings {
  readonly auxConnectionId: string | null;
  readonly auxModelOverride: string | null;
  readonly auxSamplers: SamplerBag;
  readonly submodelConnectionId: string | null;
  readonly submodelModelOverride: string | null;
  readonly submodelSamplers: SamplerBag;
  readonly auxDebugCaptureRequest: boolean;
  readonly auxDebugCaptureResponse: boolean;
  readonly legacyMediaFindings: boolean;
}

type ChannelKey = 'aux' | 'submodel';

interface ChannelDef {
  readonly key: ChannelKey;
  /** Settings field for the connection UUID. */
  readonly connectionField: 'auxConnectionId' | 'submodelConnectionId';
  /** Settings field for the model override. */
  readonly modelField: 'auxModelOverride' | 'submodelModelOverride';
  /** Settings field for the sampler bag. */
  readonly samplerField: 'auxSamplers' | 'submodelSamplers';
  /** Section title shown in the drawer. */
  readonly title: string;
  /** One-line section description. */
  readonly description: string;
  /** Element-id prefix to dodge collisions between the two sections. */
  readonly idPrefix: string;
}

const CHANNEL_DEFS: readonly ChannelDef[] = [
  {
    key: 'aux',
    connectionField: 'auxConnectionId',
    modelField: 'auxModelOverride',
    samplerField: 'auxSamplers',
    title: 'Auxiliary Model (axLLMMain)',
    description:
      "Routes Lua's axLLMMain / axLLM calls through this connection. The model field overrides the connection's default model when set — useful for aggregator providers (OpenRouter, NanoGPT) where one connection can serve many models.",
    idPrefix: 'rs-aux',
  },
  {
    key: 'submodel',
    connectionField: 'submodelConnectionId',
    modelField: 'submodelModelOverride',
    samplerField: 'submodelSamplers',
    title: 'Submodel (V2 runLLM submodel channel)',
    description:
      "Routes V2-effect runLLM(model='submodel') calls through this connection. Cards use this for lightweight classifiers / status updaters separate from the main and aux models. Empty → falls back to Aux above, then to your default.",
    idPrefix: 'rs-submodel',
  },
];

interface SamplerDef {
  readonly key: SamplerKey;
  readonly label: string;
  readonly type: 'int' | 'float';
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly defaultHint: number;
}

const SAMPLER_DEFS: readonly SamplerDef[] = [
  { key: 'temperature',       label: 'Temperature',  type: 'float', min: 0, max: 2,       step: 0.01, defaultHint: 1.0 },
  { key: 'maxTokens',         label: 'Max Response', type: 'int',   min: 1, max: 128000,  step: 1,    defaultHint: 16384 },
  { key: 'contextSize',       label: 'Context Size', type: 'int',   min: 1, max: 2000000, step: 1,    defaultHint: 128000 },
  { key: 'topP',              label: 'Top P',        type: 'float', min: 0, max: 1,       step: 0.01, defaultHint: 0.95 },
  { key: 'minP',              label: 'Min P',        type: 'float', min: 0, max: 1,       step: 0.01, defaultHint: 0 },
  { key: 'topK',              label: 'Top K',        type: 'int',   min: 0, max: 500,     step: 1,    defaultHint: 0 },
  { key: 'frequencyPenalty',  label: 'Freq Penalty', type: 'float', min: 0, max: 2,       step: 0.01, defaultHint: 0 },
  { key: 'presencePenalty',   label: 'Pres Penalty', type: 'float', min: 0, max: 2,       step: 0.01, defaultHint: 0 },
  { key: 'repetitionPenalty', label: 'Rep Penalty',  type: 'float', min: 0, max: 2,       step: 0.01, defaultHint: 0 },
];

export interface SettingsTabHandle {
  handleBackendMessage(msg: BackendToFrontend): void;
  destroy(): void;
}

export interface MountSettingsPanelOptions {
  readonly root: HTMLElement;
  readonly sendToBackend: (msg: FrontendToBackend) => void;
  readonly log: FrontendLog;
}

export function mountSettingsPanel(
  opts: MountSettingsPanelOptions,
): SettingsTabHandle {
  const { sendToBackend, log } = opts;
  log.info('settings-panel: mounting');

  const root = opts.root;
  root.classList.add('risu-settings-drawer');

  let settings: Settings | null = null;
  let connections: readonly ConnectionSummary[] | null = null;
  let lastSavedTs: number = 0;

  // Status pinned at the top so it stays visible across subtabs.
  const status = document.createElement('div');
  status.className = 'rs-status';
  root.appendChild(status);

  // Subtab nav (Auxiliary / Sub / Debug).
  type SettingsSubTabId = 'aux' | 'sub' | 'debug';
  const SUB_TABS: ReadonlyArray<{ id: SettingsSubTabId; label: string; title: string }> = [
    { id: 'aux',   label: 'Auxiliary', title: "Aux model — used by Lua's axLLMMain / axLLM calls." },
    { id: 'sub',   label: 'Sub',       title: "Submodel — used by V2 runLLM(model='submodel'). Falls back to Aux when empty." },
    { id: 'debug', label: 'Debug',     title: 'Capture toggles, parity toggles, and diagnostic logs.' },
  ];
  const subnav = document.createElement('div');
  subnav.className = 'lr-subtabs';
  subnav.setAttribute('role', 'tablist');
  root.appendChild(subnav);
  const subnavBtns = new Map<SettingsSubTabId, HTMLButtonElement>();
  for (const def of SUB_TABS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lr-subtab';
    btn.textContent = def.label;
    btn.title = def.title;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.addEventListener('click', () => activateSubTab(def.id));
    subnav.appendChild(btn);
    subnavBtns.set(def.id, btn);
  }
  let activeSubTab: SettingsSubTabId = 'aux';

  // ---------- Auxiliary subtab body ----------------------------------------
  const auxBody = document.createElement('section');
  auxBody.className = 'lr-settings-tab-body';

  const auxIntro = document.createElement('p');
  auxIntro.className = 'lr-settings-intro';
  auxIntro.textContent = "Routes Lua's axLLMMain / axLLM calls through this connection. Useful for status-window updaters / classifiers separate from the main chat model.";
  auxBody.appendChild(auxIntro);

  const connRow = document.createElement('div');
  connRow.className = 'rs-row';
  const connLabel = document.createElement('label');
  connLabel.className = 'rs-label';
  connLabel.textContent = 'Connection';
  connLabel.htmlFor = 'rs-aux-conn';
  connRow.appendChild(connLabel);
  const connSelect = document.createElement('select');
  connSelect.id = 'rs-aux-conn';
  connSelect.className = 'rs-select';
  connRow.appendChild(connSelect);
  auxBody.appendChild(connRow);

  const modelRow = document.createElement('div');
  modelRow.className = 'rs-row';
  const modelLabel = document.createElement('label');
  modelLabel.className = 'rs-label';
  modelLabel.textContent = 'Model override';
  modelLabel.htmlFor = 'rs-aux-model';
  modelRow.appendChild(modelLabel);
  const modelInput = document.createElement('input');
  modelInput.id = 'rs-aux-model';
  modelInput.type = 'text';
  modelInput.className = 'rs-input';
  modelInput.placeholder = '(use connection default)';
  modelInput.spellcheck = false;
  modelRow.appendChild(modelInput);
  auxBody.appendChild(modelRow);

  const buttonRow = document.createElement('div');
  buttonRow.className = 'rs-row rs-row-buttons';
  const saveModelBtn = document.createElement('button');
  saveModelBtn.type = 'button';
  saveModelBtn.className = 'lrm-btn lrm-btn-primary';
  saveModelBtn.textContent = 'Save';
  saveModelBtn.title = 'Save the model override.';
  buttonRow.appendChild(saveModelBtn);
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'lrm-btn';
  resetBtn.textContent = 'Reset';
  resetBtn.title = 'Clear connection and model.';
  buttonRow.appendChild(resetBtn);
  const refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'lrm-btn';
  refreshBtn.textContent = 'Refresh';
  refreshBtn.title = 'Re-fetch connection list.';
  buttonRow.appendChild(refreshBtn);
  auxBody.appendChild(buttonRow);

  const samplersSection = document.createElement('div');
  samplersSection.className = 'rs-subsection';
  const samplersHeader = document.createElement('div');
  samplersHeader.className = 'rs-subsection-header';
  const samplersTitle = document.createElement('h4');
  samplersTitle.className = 'rs-subsection-title';
  samplersTitle.textContent = 'Samplers';
  samplersTitle.title = 'Drag to set, double-click to reset, empty falls back to connection preset.';
  samplersHeader.appendChild(samplersTitle);
  samplersSection.appendChild(samplersHeader);
  const samplersListEl = document.createElement('div');
  samplersListEl.className = 'rs-samplers-list';
  samplersSection.appendChild(samplersListEl);
  auxBody.appendChild(samplersSection);

  // ---------- Sub subtab body ----------------------------------------------
  const subBody = document.createElement('section');
  subBody.className = 'lr-settings-tab-body';

  const subIntro = document.createElement('p');
  subIntro.className = 'lr-settings-intro';
  subIntro.textContent = "Routes V2-effect runLLM(model='submodel') calls through this connection. Cards use this for lightweight classifiers / status updaters separate from the main and aux models. Empty fields inherit from Aux.";
  subBody.appendChild(subIntro);

  const submodelConnRow = document.createElement('div');
  submodelConnRow.className = 'rs-row';
  const submodelConnLabel = document.createElement('label');
  submodelConnLabel.className = 'rs-label';
  submodelConnLabel.textContent = 'Connection';
  submodelConnLabel.htmlFor = 'rs-submodel-conn';
  submodelConnRow.appendChild(submodelConnLabel);
  const submodelConnSelect = document.createElement('select');
  submodelConnSelect.id = 'rs-submodel-conn';
  submodelConnSelect.className = 'rs-select';
  submodelConnRow.appendChild(submodelConnSelect);
  subBody.appendChild(submodelConnRow);

  const submodelModelRow = document.createElement('div');
  submodelModelRow.className = 'rs-row';
  const submodelModelLabel = document.createElement('label');
  submodelModelLabel.className = 'rs-label';
  submodelModelLabel.textContent = 'Model override';
  submodelModelLabel.htmlFor = 'rs-submodel-model';
  submodelModelRow.appendChild(submodelModelLabel);
  const submodelModelInput = document.createElement('input');
  submodelModelInput.id = 'rs-submodel-model';
  submodelModelInput.type = 'text';
  submodelModelInput.className = 'rs-input';
  submodelModelInput.placeholder = '(use connection default)';
  submodelModelInput.spellcheck = false;
  submodelModelRow.appendChild(submodelModelInput);
  subBody.appendChild(submodelModelRow);

  const submodelButtonRow = document.createElement('div');
  submodelButtonRow.className = 'rs-row rs-row-buttons';
  const submodelSaveModelBtn = document.createElement('button');
  submodelSaveModelBtn.type = 'button';
  submodelSaveModelBtn.className = 'lrm-btn lrm-btn-primary';
  submodelSaveModelBtn.textContent = 'Save';
  submodelSaveModelBtn.title = 'Save the model override.';
  submodelButtonRow.appendChild(submodelSaveModelBtn);
  const submodelResetBtn = document.createElement('button');
  submodelResetBtn.type = 'button';
  submodelResetBtn.className = 'lrm-btn';
  submodelResetBtn.textContent = 'Reset';
  submodelResetBtn.title = 'Clear submodel fields.';
  submodelButtonRow.appendChild(submodelResetBtn);
  subBody.appendChild(submodelButtonRow);

  const submodelSamplersSection = document.createElement('div');
  submodelSamplersSection.className = 'rs-subsection';
  const submodelSamplersHeader = document.createElement('div');
  submodelSamplersHeader.className = 'rs-subsection-header';
  const submodelSamplersTitle = document.createElement('h4');
  submodelSamplersTitle.className = 'rs-subsection-title';
  submodelSamplersTitle.textContent = 'Samplers';
  submodelSamplersTitle.title = 'Drag to set, double-click to reset.';
  submodelSamplersHeader.appendChild(submodelSamplersTitle);
  submodelSamplersSection.appendChild(submodelSamplersHeader);
  const submodelSamplersListEl = document.createElement('div');
  submodelSamplersListEl.className = 'rs-samplers-list';
  submodelSamplersSection.appendChild(submodelSamplersListEl);
  subBody.appendChild(submodelSamplersSection);

  // ---------- Debug subtab body --------------------------------------------
  const debugBody = document.createElement('section');
  debugBody.className = 'lr-settings-tab-body';

  const debugIntro = document.createElement('p');
  debugIntro.className = 'lr-settings-intro';
  debugIntro.textContent = 'Surface aux/submodel call payloads, capture diagnostic logs for bug reports, and tune Risu-parity toggles.';
  debugBody.appendChild(debugIntro);

  const debugCaptureSection = document.createElement('div');
  debugCaptureSection.className = 'rs-subsection';
  const debugCaptureHeader = document.createElement('div');
  debugCaptureHeader.className = 'rs-subsection-header';
  const debugCaptureTitle = document.createElement('h4');
  debugCaptureTitle.className = 'rs-subsection-title';
  debugCaptureTitle.textContent = 'Debug capture';
  debugCaptureTitle.title = 'Surface aux/submodel requests and responses in a corner panel.';
  debugCaptureHeader.appendChild(debugCaptureTitle);
  debugCaptureSection.appendChild(debugCaptureHeader);

  const reqCheckRow = document.createElement('label');
  reqCheckRow.className = 'rs-checkbox-row';
  const reqCheck = document.createElement('input');
  reqCheck.type = 'checkbox';
  reqCheck.className = 'rs-checkbox';
  reqCheck.id = 'rs-aux-debug-req';
  reqCheckRow.htmlFor = 'rs-aux-debug-req';
  const reqText = document.createElement('span');
  reqText.className = 'rs-checkbox-label';
  reqText.textContent = 'Capture requests';
  reqText.title = 'Show outgoing aux/submodel call payloads in the panel.';
  reqCheckRow.appendChild(reqCheck);
  reqCheckRow.appendChild(reqText);
  debugCaptureSection.appendChild(reqCheckRow);

  const resCheckRow = document.createElement('label');
  resCheckRow.className = 'rs-checkbox-row';
  const resCheck = document.createElement('input');
  resCheck.type = 'checkbox';
  resCheck.className = 'rs-checkbox';
  resCheck.id = 'rs-aux-debug-res';
  resCheckRow.htmlFor = 'rs-aux-debug-res';
  const resText = document.createElement('span');
  resText.className = 'rs-checkbox-label';
  resText.textContent = 'Capture responses';
  resText.title = 'Show aux/submodel call responses (and errors) in the panel.';
  resCheckRow.appendChild(resCheck);
  resCheckRow.appendChild(resText);
  debugCaptureSection.appendChild(resCheckRow);
  debugBody.appendChild(debugCaptureSection);

  const paritySectionHost = document.createElement('div');
  paritySectionHost.className = 'rs-subsection';
  const parityHeader = document.createElement('div');
  parityHeader.className = 'rs-subsection-header';
  const parityTitle = document.createElement('h4');
  parityTitle.className = 'rs-subsection-title';
  parityTitle.textContent = 'Parity toggles';
  parityTitle.title = "Behaviour toggles ported from Risu's Advanced Settings. Flip only if a card needs legacy behaviour.";
  parityHeader.appendChild(parityTitle);
  paritySectionHost.appendChild(parityHeader);

  const legacyMediaRow = document.createElement('label');
  legacyMediaRow.className = 'rs-checkbox-row';
  const legacyMediaCheck = document.createElement('input');
  legacyMediaCheck.type = 'checkbox';
  legacyMediaCheck.className = 'rs-checkbox';
  legacyMediaCheck.id = 'rs-legacy-media';
  legacyMediaRow.htmlFor = 'rs-legacy-media';
  const legacyMediaText = document.createElement('span');
  legacyMediaText.className = 'rs-checkbox-label';
  legacyMediaText.textContent = 'Legacy media findings';
  legacyMediaText.title = 'Disable the fuzzy-match fallback for asset macros. On = strict exact-match (Risu legacy).';
  legacyMediaRow.appendChild(legacyMediaCheck);
  legacyMediaRow.appendChild(legacyMediaText);
  paritySectionHost.appendChild(legacyMediaRow);
  debugBody.appendChild(paritySectionHost);

  // Logs panel mounts inline inside the Debug subtab.
  const logsHost = document.createElement('div');
  logsHost.className = 'rs-subsection lr-settings-logs-host';
  const logsHeader = document.createElement('div');
  logsHeader.className = 'rs-subsection-header';
  const logsTitle = document.createElement('h4');
  logsTitle.className = 'rs-subsection-title';
  logsTitle.textContent = 'Logs';
  logsTitle.title = 'Capture diagnostics for a bug report.';
  logsHeader.appendChild(logsTitle);
  logsHost.appendChild(logsHeader);
  const logsMount = document.createElement('div');
  logsHost.appendChild(logsMount);
  debugBody.appendChild(logsHost);
  const logsHandle = mountLogsPanel({ root: logsMount, sendToBackend, log });

  // ---------- Subtab activation -------------------------------------------
  const panelsHost = document.createElement('div');
  panelsHost.className = 'lr-subtab-panels';
  panelsHost.appendChild(auxBody);
  panelsHost.appendChild(subBody);
  panelsHost.appendChild(debugBody);
  root.appendChild(panelsHost);

  function activateSubTab(id: SettingsSubTabId): void {
    activeSubTab = id;
    for (const [k, btn] of subnavBtns) {
      const sel = k === id;
      btn.classList.toggle('lr-subtab-active', sel);
      btn.setAttribute('aria-selected', sel ? 'true' : 'false');
    }
    auxBody.hidden = id !== 'aux';
    subBody.hidden = id !== 'sub';
    debugBody.hidden = id !== 'debug';
  }
  activateSubTab(activeSubTab);

  function renderConnectionSelect(): void {
    connSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = connections === null
      ? 'Loading connections…'
      : connections.length === 0
        ? 'No connections. Set one up in Lumi.'
        : 'Use default connection';
    connSelect.appendChild(defaultOpt);

    if (connections) {
      for (const c of connections) {
        const opt = document.createElement('option');
        opt.value = c.id;
        const modelSuffix = c.model ? ` / ${c.model}` : '';
        const defaultTag = c.is_default ? ' [default]' : '';
        opt.textContent = `${c.name} (${c.provider}${modelSuffix})${defaultTag}`;
        connSelect.appendChild(opt);
      }
    }

    const current = settings?.auxConnectionId ?? '';
    if (current && connections && !connections.find((c) => c.id === current)) {
      // Saved ID no longer exists; surface it so the user knows to repick.
      const opt = document.createElement('option');
      opt.value = current;
      opt.textContent = `${current.slice(0, 8)}… (deleted? unknown)`;
      connSelect.appendChild(opt);
    }
    connSelect.value = current;
  }

  function renderModelInput(): void {
    if (!isModelInputFocused()) {
      modelInput.value = settings?.auxModelOverride ?? '';
    }
  }

  function renderSubmodelConnectionSelect(): void {
    submodelConnSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = connections === null
      ? 'Loading connections…'
      : connections.length === 0
        ? 'No connections. Set one up in Lumi.'
        : 'Inherit from Aux Model';
    submodelConnSelect.appendChild(defaultOpt);

    if (connections) {
      for (const c of connections) {
        const opt = document.createElement('option');
        opt.value = c.id;
        const modelSuffix = c.model ? ` / ${c.model}` : '';
        const defaultTag = c.is_default ? ' [default]' : '';
        opt.textContent = `${c.name} (${c.provider}${modelSuffix})${defaultTag}`;
        submodelConnSelect.appendChild(opt);
      }
    }
    const current = settings?.submodelConnectionId ?? '';
    if (current && connections && !connections.find((c) => c.id === current)) {
      const opt = document.createElement('option');
      opt.value = current;
      opt.textContent = `${current.slice(0, 8)}… (deleted? unknown)`;
      submodelConnSelect.appendChild(opt);
    }
    submodelConnSelect.value = current;
  }

  function renderSubmodelModelInput(): void {
    if (document.activeElement !== submodelModelInput) {
      submodelModelInput.value = settings?.submodelModelOverride ?? '';
    }
  }

  function renderSamplers(): void {
    samplersListEl.innerHTML = '';
    if (!settings) {
      const placeholder = document.createElement('div');
      placeholder.className = 'rs-samplers-placeholder';
      placeholder.textContent = 'Loading…';
      samplersListEl.appendChild(placeholder);
      return;
    }
    for (const def of SAMPLER_DEFS) {
      samplersListEl.appendChild(buildSamplerSlider(def, 'aux'));
    }
  }

  function renderSubmodelSamplers(): void {
    submodelSamplersListEl.innerHTML = '';
    if (!settings) {
      const placeholder = document.createElement('div');
      placeholder.className = 'rs-samplers-placeholder';
      placeholder.textContent = 'Loading…';
      submodelSamplersListEl.appendChild(placeholder);
      return;
    }
    for (const def of SAMPLER_DEFS) {
      submodelSamplersListEl.appendChild(buildSamplerSlider(def, 'submodel'));
    }
  }

  function buildSamplerSlider(def: SamplerDef, channel: ChannelKey): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'rs-slider-row';

    const header = document.createElement('div');
    header.className = 'rs-slider-header';
    const label = document.createElement('span');
    label.className = 'rs-slider-label';
    label.textContent = def.label;
    const numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.className = 'rs-slider-input';
    numInput.min = String(def.min);
    numInput.max = String(def.max);
    numInput.step = String(def.step);
    numInput.placeholder = String(def.defaultHint);
    header.appendChild(label);
    header.appendChild(numInput);

    const track = document.createElement('div');
    track.className = 'rs-slider-track';
    track.title = 'Drag to set, double-click to reset';
    const fill = document.createElement('div');
    fill.className = 'rs-slider-fill';
    const thumb = document.createElement('div');
    thumb.className = 'rs-slider-thumb';
    track.appendChild(fill);
    track.appendChild(thumb);

    row.appendChild(header);
    row.appendChild(track);

    const decimals = (String(def.step).split('.')[1] || '').length;

    const snap = (raw: number): number => {
      const clamped = Math.min(def.max, Math.max(def.min, raw));
      const stepped = Math.round((clamped - def.min) / def.step) * def.step + def.min;
      return def.type === 'int' ? Math.round(stepped) : parseFloat(stepped.toFixed(decimals));
    };
    const posToValue = (clientX: number): number => {
      const rect = track.getBoundingClientRect();
      if (!rect || rect.width === 0) return def.defaultHint;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return snap(def.min + ratio * (def.max - def.min));
    };
    const applyVisual = (displayValue: number, isSet: boolean): void => {
      const range = def.max - def.min;
      const pct = range > 0 ? Math.max(0, Math.min(100, ((displayValue - def.min) / range) * 100)) : 0;
      fill.style.width = `${pct}%`;
      thumb.style.left = `${pct}%`;
      track.classList.toggle('rs-slider-track-set', isSet);
      label.classList.toggle('rs-slider-label-set', isSet);
      numInput.classList.toggle('rs-slider-input-set', isSet);
    };
    const syncFromModel = (): void => {
      const bag = channel === 'aux' ? settings?.auxSamplers : settings?.submodelSamplers;
      const v = bag?.[def.key] ?? null;
      const isSet = v !== null;
      const display = isSet ? v! : def.defaultHint;
      if (document.activeElement !== numInput) numInput.value = isSet ? String(v) : '';
      applyVisual(display, isSet);
    };

    let dragging = false;
    let dragValue: number | null = null;

    track.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dragging = true;
      try { track.setPointerCapture(e.pointerId); } catch { /* */ }
      dragValue = posToValue(e.clientX);
      applyVisual(dragValue, true);
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dragValue = posToValue(e.clientX);
      applyVisual(dragValue, true);
    });
    track.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      try { track.releasePointerCapture(e.pointerId); } catch { /* */ }
      if (dragValue !== null) {
        commitSampler(def.key, dragValue, channel);
      }
      dragValue = null;
    });
    track.addEventListener('dblclick', () => {
      commitSampler(def.key, null, channel);
    });

    const commitInput = (raw: string): void => {
      if (raw === '') {
        commitSampler(def.key, null, channel);
        return;
      }
      const num = def.type === 'int' ? parseInt(raw, 10) : parseFloat(raw);
      if (Number.isFinite(num)) {
        commitSampler(def.key, snap(num), channel);
      }
    };
    numInput.addEventListener('change', () => commitInput(numInput.value));
    numInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') numInput.blur();
      else if (e.key === 'Escape') { numInput.blur(); syncFromModel(); }
    });

    syncFromModel();
    return row;
  }

  function commitSampler(key: SamplerKey, value: number | null, channel: ChannelKey): void {
    if (!settings) return;
    const baseBag = channel === 'aux' ? settings.auxSamplers : settings.submodelSamplers;
    const next: SamplerBag = { ...baseBag, [key]: value };
    log.info(`settings-tab: ${channel} sampler ${key}=${value === null ? '<inherit>' : String(value)}`);
    if (channel === 'aux') {
      sendToBackend({ type: 'update_settings', patch: { auxSamplers: next } });
    } else {
      sendToBackend({ type: 'update_settings', patch: { submodelSamplers: next } });
    }
  }

  function isModelInputFocused(): boolean {
    return document.activeElement === modelInput;
  }

  function renderStatus(): void {
    if (!settings) {
      status.textContent = 'Loading…';
      status.classList.remove('rs-status-ok', 'rs-status-warn');
      return;
    }
    const parts: string[] = [];
    if (settings.auxConnectionId) {
      const conn = connections?.find((c) => c.id === settings!.auxConnectionId);
      parts.push(conn ? `Connection: ${conn.name}` : `Connection: ${settings.auxConnectionId.slice(0, 8)}… (unknown)`);
    } else {
      parts.push('Connection: (default)');
    }
    if (settings.auxModelOverride) {
      parts.push(`Model: ${settings.auxModelOverride}`);
    } else {
      parts.push('Model: (use connection default)');
    }
    if (lastSavedTs > 0) {
      const ts = new Date(lastSavedTs);
      const hh = String(ts.getHours()).padStart(2, '0');
      const mm = String(ts.getMinutes()).padStart(2, '0');
      const ss = String(ts.getSeconds()).padStart(2, '0');
      parts.push(`saved ${hh}:${mm}:${ss}`);
    }
    status.textContent = parts.join(' · ');
    status.classList.add('rs-status-ok');
    status.classList.remove('rs-status-warn');
  }

  function renderDebugChecks(): void {
    reqCheck.checked = settings?.auxDebugCaptureRequest === true;
    resCheck.checked = settings?.auxDebugCaptureResponse === true;
  }

  function renderParityChecks(): void {
    legacyMediaCheck.checked = settings?.legacyMediaFindings === true;
  }

  function render(): void {
    renderConnectionSelect();
    renderModelInput();
    renderSamplers();
    renderSubmodelConnectionSelect();
    renderSubmodelModelInput();
    renderSubmodelSamplers();
    renderDebugChecks();
    renderParityChecks();
    renderStatus();
  }

  connSelect.addEventListener('change', () => {
    const value = connSelect.value;
    log.info(`settings-tab: connection changed to "${value || '<default>'}"`);
    sendToBackend({
      type: 'update_settings',
      patch: { auxConnectionId: value === '' ? null : value },
    });
  });

  saveModelBtn.addEventListener('click', () => {
    const raw = modelInput.value.trim();
    log.info(`settings-tab: model override saved as "${raw}"`);
    sendToBackend({
      type: 'update_settings',
      patch: { auxModelOverride: raw === '' ? null : raw },
    });
  });

  modelInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveModelBtn.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      modelInput.value = settings?.auxModelOverride ?? '';
      modelInput.blur();
    }
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset auxiliary model settings to defaults? Connection, model override, and all samplers will be cleared.')) return;
    log.info('settings-tab: reset to defaults');
    const clearedSamplers: SamplerBag = {
      temperature: null, maxTokens: null, contextSize: null,
      topP: null, minP: null, topK: null,
      frequencyPenalty: null, presencePenalty: null, repetitionPenalty: null,
    };
    sendToBackend({
      type: 'update_settings',
      patch: {
        auxConnectionId: null,
        auxModelOverride: null,
        auxSamplers: clearedSamplers,
      },
    });
  });

  refreshBtn.addEventListener('click', () => {
    log.info('settings-tab: refresh connections clicked');
    connections = null;
    renderConnectionSelect();
    sendToBackend({ type: 'request_connections_list' });
  });

  submodelConnSelect.addEventListener('change', () => {
    const value = submodelConnSelect.value;
    log.info(`settings-tab: submodel connection changed to "${value || '<inherit-aux>'}"`);
    sendToBackend({
      type: 'update_settings',
      patch: { submodelConnectionId: value === '' ? null : value },
    });
  });

  submodelSaveModelBtn.addEventListener('click', () => {
    const raw = submodelModelInput.value.trim();
    log.info(`settings-tab: submodel model override saved as "${raw}"`);
    sendToBackend({
      type: 'update_settings',
      patch: { submodelModelOverride: raw === '' ? null : raw },
    });
  });

  submodelModelInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submodelSaveModelBtn.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      submodelModelInput.value = settings?.submodelModelOverride ?? '';
      submodelModelInput.blur();
    }
  });

  submodelResetBtn.addEventListener('click', () => {
    if (!confirm('Reset submodel settings to defaults? Connection, model override, and all submodel samplers will be cleared (falls back to Aux Model).')) return;
    log.info('settings-tab: submodel reset to defaults');
    const clearedSamplers: SamplerBag = {
      temperature: null, maxTokens: null, contextSize: null,
      topP: null, minP: null, topK: null,
      frequencyPenalty: null, presencePenalty: null, repetitionPenalty: null,
    };
    sendToBackend({
      type: 'update_settings',
      patch: {
        submodelConnectionId: null,
        submodelModelOverride: null,
        submodelSamplers: clearedSamplers,
      },
    });
  });

  reqCheck.addEventListener('change', () => {
    log.info(`settings-tab: auxDebugCaptureRequest=${reqCheck.checked}`);
    sendToBackend({
      type: 'update_settings',
      patch: { auxDebugCaptureRequest: reqCheck.checked },
    });
  });
  resCheck.addEventListener('change', () => {
    log.info(`settings-tab: auxDebugCaptureResponse=${resCheck.checked}`);
    sendToBackend({
      type: 'update_settings',
      patch: { auxDebugCaptureResponse: resCheck.checked },
    });
  });

  legacyMediaCheck.addEventListener('change', () => {
    log.info(`settings-tab: legacyMediaFindings=${legacyMediaCheck.checked}`);
    sendToBackend({
      type: 'update_settings',
      patch: { legacyMediaFindings: legacyMediaCheck.checked },
    });
  });

  sendToBackend({ type: 'request_settings' });
  sendToBackend({ type: 'request_connections_list' });

  function handleBackendMessage(msg: BackendToFrontend): void {
    if (msg.type === 'settings_pushed') {
      const setSamplers = Object.entries(msg.settings.auxSamplers)
        .filter(([, v]) => v !== null)
        .map(([k]) => k);
      log.info(
        `settings-tab: settings_pushed auxConn=${msg.settings.auxConnectionId ?? '<default>'} ` +
          `auxModel=${msg.settings.auxModelOverride ?? '<connection>'} ` +
          `samplersSet=[${setSamplers.join(',')}]`,
      );
      settings = {
        auxConnectionId: msg.settings.auxConnectionId,
        auxModelOverride: msg.settings.auxModelOverride,
        auxSamplers: msg.settings.auxSamplers,
        submodelConnectionId: msg.settings.submodelConnectionId,
        submodelModelOverride: msg.settings.submodelModelOverride,
        submodelSamplers: msg.settings.submodelSamplers,
        auxDebugCaptureRequest: msg.settings.auxDebugCaptureRequest,
        auxDebugCaptureResponse: msg.settings.auxDebugCaptureResponse,
        legacyMediaFindings: msg.settings.legacyMediaFindings,
      };
      lastSavedTs = Date.now();
      render();
      return;
    }
    if (msg.type === 'connections_list_pushed') {
      log.info(`settings-tab: connections_list_pushed count=${msg.connections.length}`);
      connections = msg.connections;
      render();
      return;
    }
    // Forward to the inline logs panel (Debug subtab).
    try { logsHandle.handleBackendMessage(msg); } catch (err) { log.warn('settings-tab: logs panel handler threw:', err); }
  }

  render();
  log.info('settings-panel: ready');

  return {
    handleBackendMessage,
    destroy(): void {
      log.info('settings-panel: destroy');
      try { logsHandle.destroy(); } catch { /* */ }
      try { root.replaceChildren(); } catch { /* */ }
    },
  };
}
