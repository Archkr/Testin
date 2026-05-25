// src/ui/styles.css
var styles_default = `.risu-compat-drawer {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 16px;\r
  padding: 16px;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 14px;\r
  line-height: 1.45;\r
}\r
\r
.risu-compat-drawer .rc-intro {\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
  margin: 0;\r
}\r
\r
.risu-compat-drawer .rc-row {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  flex-wrap: wrap;\r
}\r
\r
.risu-compat-drawer .rc-btn {\r
  appearance: none;\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.05));\r
  color: var(--lumiverse-text, inherit);\r
  padding: 8px 14px;\r
  border-radius: 6px;\r
  cursor: pointer;\r
  font: inherit;\r
  transition: background 120ms, border-color 120ms;\r
}\r
.risu-compat-drawer .rc-btn:hover:not([disabled]) {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.6));\r
}\r
.risu-compat-drawer .rc-btn[disabled] {\r
  opacity: 0.6;\r
  cursor: wait;\r
}\r
.risu-compat-drawer .rc-btn.rc-btn-danger {\r
  border-color: var(--lumiverse-danger, rgba(255, 120, 120, 0.5));\r
  color: var(--lumiverse-danger, rgba(255, 120, 120, 1));\r
}\r
\r
.risu-compat-drawer .rc-status {\r
  padding: 10px 12px;\r
  border-radius: 6px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.1));\r
  font-size: 13px;\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
}\r
.risu-compat-drawer .rc-status.rc-status-error {\r
  border-color: var(--lumiverse-danger, rgba(255, 120, 120, 0.6));\r
  color: var(--lumiverse-danger, rgba(255, 120, 120, 1));\r
}\r
.risu-compat-drawer .rc-status.rc-status-warn {\r
  border-color: var(--lumiverse-warning, rgba(255, 200, 100, 0.6));\r
}\r
\r
.risu-compat-drawer .rc-progress-bar {\r
  height: 4px;\r
  background: var(--lumiverse-border, rgba(255, 255, 255, 0.1));\r
  border-radius: 2px;\r
  overflow: hidden;\r
  margin-top: 6px;\r
}\r
.risu-compat-drawer .rc-progress-fill {\r
  height: 100%;\r
  background: var(--lumiverse-primary, #6c9cff);\r
  transition: width 200ms;\r
}\r
\r
.risu-compat-drawer h3.rc-section-title {\r
  margin: 0;\r
  font-size: 13px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.6));\r
}\r
\r
.risu-compat-drawer .rc-cards-empty {\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  font-style: italic;\r
}\r
.risu-compat-drawer .rc-cards-note {\r
  font-size: 12px;\r
  font-style: italic;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  padding: 6px 10px;\r
  margin-bottom: 4px;\r
  border-left: 2px solid var(--lumiverse-primary, rgba(120, 160, 255, 0.4));\r
  background: var(--lumiverse-fill-subtle, rgba(120, 160, 255, 0.05));\r
  border-radius: 0 4px 4px 0;\r
}\r
\r
.risu-compat-drawer .rc-cards-list {\r
  list-style: none;\r
  padding: 0;\r
  margin: 0;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
}\r
.risu-compat-drawer .rc-card-item {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  justify-content: space-between;\r
  padding: 8px 10px;\r
  border-radius: 6px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.03));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
}\r
.risu-compat-drawer .rc-card-meta {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 2px;\r
  min-width: 0;\r
}\r
.risu-compat-drawer .rc-card-name {\r
  font-weight: 500;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  white-space: nowrap;\r
}\r
.risu-compat-drawer .rc-card-sub {\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
\r
.risu-compat-drawer .rc-card-delete {\r
  appearance: none;\r
  background: transparent;\r
  border: none;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  cursor: pointer;\r
  padding: 4px 8px;\r
  border-radius: 4px;\r
  font: inherit;\r
  font-size: 12px;\r
}\r
.risu-compat-drawer .rc-card-delete:hover {\r
  color: var(--lumiverse-danger, rgba(255, 120, 120, 1));\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.06));\r
}\r
\r
.risu-compat-drawer .rc-footer {\r
  margin-top: auto;\r
  padding-top: 12px;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.4));\r
  font-size: 12px;\r
}\r
\r
/* Native text-input cosmetics. Selects across the drawer use the\r
 * searchable-select component below, not native <select>. */\r
.risu-settings-drawer .rs-input,\r
.lr-modules-drawer .lrm-attach-input {\r
  appearance: none;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.05));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  color: var(--lumiverse-text, inherit);\r
  border-radius: 4px;\r
  font: inherit;\r
  min-width: 0;\r
  transition: background 120ms, border-color 120ms;\r
}\r
.risu-settings-drawer .rs-input:focus,\r
.lr-modules-drawer .lrm-attach-input:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.7));\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
}\r
\r
/* Shared searchable-select component. Trigger sits in-flow, panel is\r
 * portaled to <body> with position:fixed. */\r
.lr-ss-trigger {\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  gap: 8px;\r
  appearance: none;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.05));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  color: var(--lumiverse-text, inherit);\r
  border-radius: 4px;\r
  padding: 5px 8px;\r
  font: inherit;\r
  font-size: 12px;\r
  min-width: 0;\r
  cursor: pointer;\r
  text-align: left;\r
  transition: background 120ms, border-color 120ms;\r
}\r
.lr-ss-trigger:hover:not([disabled]) {\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.45));\r
}\r
.lr-ss-trigger:focus,\r
.lr-ss-trigger[aria-expanded="true"] {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.7));\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
}\r
.lr-ss-trigger[disabled] {\r
  opacity: 0.55;\r
  cursor: not-allowed;\r
}\r
.lr-ss-trigger-label {\r
  flex: 1 1 auto;\r
  min-width: 0;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
.lr-ss-trigger-label.lr-ss-placeholder {\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
.lr-ss-chevron {\r
  flex: 0 0 auto;\r
  font-size: 10px;\r
  opacity: 0.7;\r
  pointer-events: none;\r
}\r
\r
.lr-ss-panel {\r
  position: fixed;\r
  z-index: 9000;\r
  display: none;\r
  flex-direction: column;\r
  min-width: 200px;\r
  max-width: min(480px, 90vw);\r
  background: var(--lumiverse-bg-elevated, #1f1f23);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.18));\r
  border-radius: 6px;\r
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);\r
  font: inherit;\r
  font-size: 12px;\r
  color: var(--lumiverse-text, inherit);\r
  overflow: hidden;\r
}\r
.lr-ss-search-wrap {\r
  flex: 0 0 auto;\r
  padding: 6px;\r
  border-bottom: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
}\r
.lr-ss-search {\r
  width: 100%;\r
  appearance: none;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  border-radius: 4px;\r
  padding: 5px 8px;\r
  font: inherit;\r
  font-size: 12px;\r
  color: inherit;\r
  min-width: 0;\r
}\r
.lr-ss-search:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.7));\r
}\r
.lr-ss-list {\r
  flex: 1 1 auto;\r
  margin: 0;\r
  padding: 4px 0;\r
  list-style: none;\r
  overflow-y: auto;\r
  scrollbar-width: thin;\r
}\r
.lr-ss-empty {\r
  padding: 8px 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-style: italic;\r
}\r
.lr-ss-group {\r
  padding: 6px 12px 2px 12px;\r
  font-size: 10.5px;\r
  text-transform: uppercase;\r
  letter-spacing: 0.04em;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.45));\r
}\r
.lr-ss-option {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 2px;\r
  padding: 6px 12px;\r
  cursor: pointer;\r
  border-left: 2px solid transparent;\r
}\r
.lr-ss-option[aria-disabled="true"] {\r
  opacity: 0.45;\r
  cursor: not-allowed;\r
}\r
.lr-ss-option-active:not([aria-disabled="true"]) {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.07));\r
}\r
.lr-ss-option-selected {\r
  border-left-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.7));\r
}\r
.lr-ss-option-label {\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
.lr-ss-option-secondary {\r
  font-size: 10.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
\r
/* ─── Variables tab ───────────────────────────────────────────────────── */\r
\r
.risu-vars-drawer {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 28px;\r
  padding: 10px 8px 24px 8px;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 13px;\r
  line-height: 1.4;\r
  min-width: 0;\r
}\r
.risu-vars-drawer .rv-intro {\r
  margin: 0 0 8px 0;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
}\r
.risu-vars-drawer .rv-status {\r
  margin-top: 8px;\r
}\r
.risu-vars-drawer .rv-toolbar {\r
  display: flex;\r
  gap: 6px;\r
  align-items: center;\r
  flex-wrap: wrap;\r
}\r
.risu-vars-drawer .rv-toolbar .rv-filter {\r
  flex: 1 1 100%;\r
  min-width: 0;\r
}\r
.risu-vars-drawer .rv-filter {\r
  flex: 1 1 auto;\r
  min-width: 0;\r
  appearance: none;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.05));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  color: var(--lumiverse-text, inherit);\r
  border-radius: 6px;\r
  padding: 6px 10px;\r
  font: inherit;\r
  font-size: 12.5px;\r
}\r
.risu-vars-drawer .rv-filter:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.7));\r
}\r
.risu-vars-drawer .rv-btn {\r
  appearance: none;\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  color: var(--lumiverse-text, inherit);\r
  padding: 6px 10px;\r
  border-radius: 6px;\r
  cursor: pointer;\r
  font: inherit;\r
  font-size: 12px;\r
  flex: 0 0 auto;\r
}\r
.risu-vars-drawer .rv-btn:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.6));\r
}\r
.risu-vars-drawer .rv-status {\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  padding: 6px 8px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.03));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 4px;\r
  white-space: nowrap;\r
  overflow-x: auto;\r
}\r
.risu-vars-drawer .rv-status-error {\r
  color: var(--lumiverse-danger, rgba(255, 120, 120, 0.95));\r
  border-color: var(--lumiverse-danger, rgba(255, 120, 120, 0.5));\r
}\r
\r
.risu-vars-drawer .rv-sections {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 14px;\r
}\r
.risu-vars-drawer .rv-section {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  padding: 8px 8px 10px 8px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.025));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.07));\r
  border-radius: 6px;\r
  min-width: 0;\r
}\r
.risu-vars-drawer .rv-section-header {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 2px;\r
  margin-bottom: 4px;\r
}\r
.risu-vars-drawer .rv-section-title {\r
  margin: 0;\r
  font-size: 12px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.5px;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.risu-vars-drawer .rv-section-desc {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.45));\r
}\r
.risu-vars-drawer .rv-section-empty {\r
  padding: 4px 0;\r
  font-size: 11.5px;\r
  font-style: italic;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.4));\r
}\r
\r
.risu-vars-drawer .rv-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  font-size: 12px;\r
}\r
/* Each row stacks vertically: key/flags/actions on top, value full-width\r
 * below. The drawer is narrow (~250-350px in practice), so cramming key,\r
 * value, and buttons into one line gives every column ~20-30% width and\r
 * truncates everything. Stacking trades a bit of vertical space for\r
 * actually-readable values. */\r
.risu-vars-drawer .rv-row {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  padding: 6px 8px;\r
  border-radius: 4px;\r
  background: rgba(255, 255, 255, 0.02);\r
}\r
.risu-vars-drawer .rv-row:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.05));\r
}\r
.risu-vars-drawer .rv-row-head {\r
  display: flex;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
  align-items: center;\r
  min-width: 0;\r
}\r
.risu-vars-drawer .rv-row[data-kind="local"] .rv-row-actions {\r
  margin-left: auto;\r
  opacity: 0.4;\r
  transition: opacity 80ms;\r
}\r
.risu-vars-drawer .rv-row[data-kind="local"]:hover .rv-row-actions,\r
.risu-vars-drawer .rv-row[data-kind="local"]:focus-within .rv-row-actions {\r
  opacity: 1;\r
}\r
.risu-vars-drawer .rv-row-editing {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.07)) !important;\r
  outline: 1px solid var(--lumiverse-primary, rgba(120, 160, 255, 0.45));\r
}\r
.risu-vars-drawer .rv-row:nth-child(odd) {\r
  background: rgba(255, 255, 255, 0.02);\r
}\r
.risu-vars-drawer .rv-row:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.05));\r
}\r
.risu-vars-drawer .rv-key {\r
  color: var(--lumiverse-primary, #8fb6ff);\r
  font-weight: 500;\r
  word-break: break-all;\r
  flex: 1 1 auto;\r
  min-width: 0;\r
}\r
.risu-vars-drawer .rv-flag {\r
  font-size: 10px;\r
  padding: 0 5px;\r
  border-radius: 3px;\r
  background: rgba(140, 180, 255, 0.12);\r
  color: rgba(140, 180, 255, 0.85);\r
  text-transform: lowercase;\r
  letter-spacing: 0.3px;\r
  white-space: nowrap;\r
}\r
.risu-vars-drawer .rv-flag-lua {\r
  background: rgba(255, 200, 100, 0.12);\r
  color: rgba(255, 200, 100, 0.85);\r
}\r
.risu-vars-drawer .rv-value {\r
  display: block;\r
  color: var(--lumiverse-text, rgba(255, 255, 255, 0.85));\r
  white-space: pre-wrap;\r
  word-break: break-word;\r
  font-family: inherit;\r
  padding: 4px 6px;\r
  background: rgba(0, 0, 0, 0.18);\r
  border-radius: 3px;\r
  border: 1px solid rgba(255, 255, 255, 0.04);\r
  font-size: 11.5px;\r
  line-height: 1.45;\r
}\r
.risu-vars-drawer .rv-value-long {\r
  cursor: pointer;\r
}\r
.risu-vars-drawer .rv-value-long::after {\r
  content: ' ↳';\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.4));\r
}\r
.risu-vars-drawer .rv-value-long.rv-value-expanded::after {\r
  content: ' ↰';\r
}\r
\r
.risu-vars-drawer .rv-empty {\r
  padding: 12px;\r
  font-size: 12px;\r
  font-style: italic;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  text-align: center;\r
}\r
\r
/* ─── Editable local rows ──────────────────────────────────────────── */\r
\r
.risu-vars-drawer .rv-row-actions,\r
.risu-vars-drawer .rv-edit-actions {\r
  display: flex;\r
  gap: 4px;\r
  align-items: center;\r
}\r
.risu-vars-drawer .rv-row-btn {\r
  appearance: none;\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
  padding: 2px 7px;\r
  border-radius: 3px;\r
  cursor: pointer;\r
  font: inherit;\r
  font-size: 11px;\r
  line-height: 1.4;\r
}\r
.risu-vars-drawer .rv-row-btn:hover {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.55));\r
}\r
.risu-vars-drawer .rv-row-btn-primary {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.25));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.6));\r
  color: var(--lumiverse-text, inherit);\r
}\r
.risu-vars-drawer .rv-row-btn-primary:hover {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.4));\r
}\r
.risu-vars-drawer .rv-row-btn-danger:hover {\r
  color: var(--lumiverse-danger, rgba(255, 120, 120, 1));\r
  border-color: var(--lumiverse-danger, rgba(255, 120, 120, 0.6));\r
  background: rgba(255, 120, 120, 0.08);\r
}\r
\r
.risu-vars-drawer .rv-edit-input {\r
  appearance: none;\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  font-size: 12px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.05));\r
  border: 1px solid var(--lumiverse-primary, rgba(120, 160, 255, 0.55));\r
  color: var(--lumiverse-text, inherit);\r
  border-radius: 3px;\r
  padding: 4px 6px;\r
  width: 100%;\r
  resize: vertical;\r
  line-height: 1.4;\r
  word-break: break-word;\r
}\r
.risu-vars-drawer textarea.rv-edit-input {\r
  min-height: 22px;\r
}\r
.risu-vars-drawer .rv-edit-input:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.85));\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
}\r
\r
.risu-vars-drawer .rv-add-wrap {\r
  margin-top: 6px;\r
  padding-top: 6px;\r
  border-top: 1px dashed var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
}\r
.risu-vars-drawer .rv-add-btn {\r
  width: 100%;\r
  text-align: center;\r
  font-style: italic;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
.risu-vars-drawer .rv-add-btn:hover {\r
  font-style: normal;\r
}\r
.risu-vars-drawer .rv-add-form {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  padding: 8px;\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.04));\r
  border-radius: 4px;\r
  outline: 1px solid var(--lumiverse-primary, rgba(120, 160, 255, 0.4));\r
}\r
.risu-vars-drawer .rv-add-form .rv-edit-actions {\r
  justify-content: flex-end;\r
}\r
\r
/* Inline variable row — shared between Default/Local subtabs (and viewer Default\r
   editor in Phase F). Layout: name+flags | value-input | actions, all on one\r
   line. Mirrors the Default-vars look the user prefers. */\r
.lr-vars-body {\r
  display: flex;\r
  flex-direction: column;\r
  min-width: 0;\r
}\r
.lr-var-section {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  min-width: 0;\r
}\r
.lr-var-section + .lr-var-section {\r
  margin-top: 18px;\r
}\r
.lr-var-note {\r
  margin: 0 0 4px 0;\r
  font-size: 11px;\r
  line-height: 1.45;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
.lr-var-subsection {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  min-width: 0;\r
}\r
.lr-var-subsection + .lr-var-subsection {\r
  margin-top: 14px;\r
}\r
.lr-var-subsection-title {\r
  margin: 0;\r
  font-size: 12px;\r
  font-weight: 600;\r
  letter-spacing: 0.2px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
  text-transform: uppercase;\r
  border-bottom: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  padding-bottom: 4px;\r
}\r
.lr-var-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  min-width: 0;\r
}\r
.lr-var-row {\r
  display: grid;\r
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;\r
  align-items: center;\r
  gap: 8px;\r
  padding: 4px 8px;\r
  border-radius: 4px;\r
}\r
.lr-var-row:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.03));\r
}\r
.lr-var-row-overridden {\r
  background: var(--lumiverse-fill, rgba(120, 160, 255, 0.05));\r
}\r
.lr-var-row-readonly {\r
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);\r
}\r
.lr-var-row-add {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.04));\r
  outline: 1px solid var(--lumiverse-primary, rgba(120, 160, 255, 0.4));\r
  padding: 6px 8px;\r
}\r
.lr-var-head {\r
  display: flex;\r
  align-items: center;\r
  gap: 4px;\r
  min-width: 0;\r
}\r
.lr-var-name {\r
  font-family: var(--lumiverse-mono, ui-monospace, SFMono-Regular, Menlo, monospace);\r
  font-size: 12px;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.lr-var-flag {\r
  font-size: 9px;\r
  text-transform: uppercase;\r
  letter-spacing: 0.4px;\r
  padding: 1px 5px;\r
  border-radius: 3px;\r
  background: var(--lumiverse-fill, rgba(120, 160, 255, 0.15));\r
  color: var(--lumiverse-text-muted, rgba(160, 200, 255, 0.85));\r
  flex-shrink: 0;\r
}\r
.lr-var-flag-lua {\r
  background: var(--lumiverse-fill, rgba(140, 100, 220, 0.18));\r
  color: rgba(200, 180, 240, 0.9);\r
}\r
.lr-var-input,\r
.lr-var-name-input {\r
  appearance: none;\r
  background: var(--lumiverse-bg-input, rgba(0, 0, 0, 0.25));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  color: var(--lumiverse-text, inherit);\r
  font: inherit;\r
  font-size: 12px;\r
  font-family: var(--lumiverse-mono, ui-monospace, SFMono-Regular, Menlo, monospace);\r
  padding: 4px 6px;\r
  border-radius: 4px;\r
  min-width: 0;\r
}\r
.lr-var-input:focus,\r
.lr-var-name-input:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, #6c9cff);\r
  background: var(--lumiverse-bg-input-focus, rgba(0, 0, 0, 0.35));\r
}\r
.lr-var-value-readonly {\r
  font-family: var(--lumiverse-mono, ui-monospace, SFMono-Regular, Menlo, monospace);\r
  font-size: 12px;\r
  color: var(--lumiverse-text, inherit);\r
  word-break: break-word;\r
  overflow-wrap: anywhere;\r
  white-space: pre-wrap;\r
  padding: 4px 6px;\r
  background: var(--lumiverse-bg-input, rgba(0, 0, 0, 0.18));\r
  border-radius: 4px;\r
}\r
.lr-var-value-long {\r
  cursor: pointer;\r
}\r
.lr-var-value-long::after {\r
  content: ' (click to expand)';\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.45));\r
  font-size: 10px;\r
}\r
.lr-var-value-long.lr-var-value-expanded::after {\r
  content: ' (click to collapse)';\r
}\r
.lr-var-actions {\r
  display: flex;\r
  align-items: center;\r
  gap: 4px;\r
  flex-shrink: 0;\r
}\r
.lr-var-action {\r
  appearance: none;\r
  background: transparent;\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.1));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
  font: inherit;\r
  font-size: 11px;\r
  padding: 3px 8px;\r
  border-radius: 3px;\r
  cursor: pointer;\r
  transition: background 80ms, color 80ms, border-color 80ms;\r
}\r
.lr-var-action:hover {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.06));\r
  border-color: var(--lumiverse-border, rgba(255, 255, 255, 0.2));\r
}\r
.lr-var-action-primary {\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.5));\r
  color: var(--lumiverse-primary, #b6cdff);\r
}\r
.lr-var-action-primary:hover {\r
  background: var(--lumiverse-fill, rgba(120, 160, 255, 0.12));\r
}\r
.lr-var-action-danger:hover {\r
  border-color: rgba(220, 100, 100, 0.4);\r
  color: rgba(255, 160, 160, 0.95);\r
}\r
.lr-var-add-btn {\r
  align-self: flex-start;\r
  margin-top: 4px;\r
  font-size: 12px;\r
}\r
\r
/* ─── Settings tab ────────────────────────────────────────────────────── */\r
\r
.risu-settings-drawer {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  padding: 10px 8px 24px 8px;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 13px;\r
  line-height: 1.45;\r
  min-width: 0;\r
}\r
\r
.risu-settings-drawer > .rs-section + .rs-section {\r
  margin-top: 12px;\r
}\r
\r
/* Settings subtab body — no outer chrome, just stacked rows + samplers.\r
   The legacy \`.rs-section\` outer-box style still exists in case anything\r
   else references it, but the live settings panel uses these instead. */\r
.lr-settings-tab-body {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 14px;\r
  padding: 0;\r
  background: transparent;\r
  border: none;\r
  min-width: 0;\r
}\r
.lr-settings-tab-body[hidden] { display: none; }\r
.lr-settings-intro {\r
  margin: 0 0 4px 0;\r
  font-size: 11px;\r
  line-height: 1.45;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
/* Inline-logs host inside the Debug subtab. */\r
.lr-settings-logs-host .lr-logs {\r
  background: transparent;\r
  border: none;\r
  padding: 0;\r
}\r
\r
/* Canonical subtab bar — shared across State/Variables/Settings/Import/Viewer.\r
   Pill-style: rounded top corners, transparent background, light bottom rule\r
   spans the bar. Active tab gets an elevated fill + bordered outline. The\r
   \`.lrv-subtab-*\` rules below mirror these for backwards compat with\r
   viewer-tab.ts; both class trees produce identical visuals. */\r
.lr-subtabs,\r
.lr-subnav {\r
  display: flex;\r
  gap: 2px;\r
  padding: 6px 10px 0;\r
  border-bottom: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  flex-wrap: wrap;\r
  margin-bottom: 8px;\r
}\r
.lr-subtab,\r
.lr-subnav-btn {\r
  appearance: none;\r
  background: transparent;\r
  border: 1px solid transparent;\r
  border-bottom: none;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font: inherit;\r
  font-size: 12px;\r
  padding: 5px 10px 6px;\r
  border-radius: 5px 5px 0 0;\r
  cursor: pointer;\r
  transition: background 80ms, color 80ms, border-color 80ms;\r
}\r
.lr-subtab:hover,\r
.lr-subnav-btn:hover {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-bg-elevated, rgba(255, 255, 255, 0.04));\r
}\r
.lr-subtab-active,\r
.lr-subnav-btn-active {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-bg-elevated, rgba(255, 255, 255, 0.06));\r
  border-color: var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
}\r
.lr-subnav-panels,\r
.lr-subtab-panels { min-width: 0; }\r
.lr-subnav-panel,\r
.lr-subtab-panel {\r
  display: block;\r
  min-width: 0;\r
}\r
.lr-subnav-panel[hidden],\r
.lr-subtab-panel[hidden] {\r
  display: none;\r
}\r
.risu-settings-drawer .rs-intro {\r
  margin: 0;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
}\r
.risu-settings-drawer .rs-section {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  padding: 10px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.025));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.07));\r
  border-radius: 6px;\r
  min-width: 0;\r
}\r
.risu-settings-drawer .rs-section-header {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  margin-bottom: 4px;\r
}\r
.risu-settings-drawer .rs-section-title {\r
  margin: 0;\r
  font-size: 12px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.5px;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.risu-settings-drawer .rs-section-desc {\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  line-height: 1.4;\r
}\r
\r
.risu-settings-drawer .rs-row {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  min-width: 0;\r
}\r
.risu-settings-drawer .rs-row-buttons {\r
  flex-direction: row;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
  margin-top: 4px;\r
}\r
.risu-settings-drawer .rs-label {\r
  font-size: 11.5px;\r
  font-weight: 500;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
}\r
.risu-settings-drawer .rs-input {\r
  width: 100%;\r
  padding: 6px 8px;\r
  font-size: 12px;\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
}\r
.risu-settings-drawer .rs-trigger {\r
  width: 100%;\r
  padding: 6px 8px;\r
  font-size: 12px;\r
}\r
\r
.risu-settings-drawer .rs-btn {\r
  appearance: none;\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.8));\r
  padding: 5px 10px;\r
  border-radius: 4px;\r
  cursor: pointer;\r
  font: inherit;\r
  font-size: 12px;\r
}\r
.risu-settings-drawer .rs-btn:hover {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.55));\r
}\r
.risu-settings-drawer .rs-btn-primary {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.25));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.6));\r
  color: var(--lumiverse-text, inherit);\r
}\r
.risu-settings-drawer .rs-btn-primary:hover {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.4));\r
}\r
\r
.risu-settings-drawer .rs-status {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  padding: 5px 7px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.03));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 3px;\r
  margin-top: 2px;\r
}\r
.risu-settings-drawer .rs-status-ok { color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65)); }\r
.risu-settings-drawer .rs-status-warn {\r
  border-color: var(--lumiverse-warning, rgba(255, 200, 100, 0.5));\r
  color: var(--lumiverse-warning, rgba(255, 200, 100, 0.9));\r
}\r
\r
/* ─── Subsection (Samplers, etc.) ─────────────────────────────────────── */\r
\r
.risu-settings-drawer .rs-subsection {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  padding: 8px;\r
  margin-top: 4px;\r
  background: rgba(255, 255, 255, 0.02);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 4px;\r
}\r
.risu-settings-drawer .rs-subsection-header {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 3px;\r
  margin-bottom: 4px;\r
}\r
.risu-settings-drawer .rs-subsection-title {\r
  margin: 0;\r
  font-size: 11.5px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.4px;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.risu-settings-drawer .rs-subsection-desc {\r
  margin: 0;\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  line-height: 1.4;\r
}\r
.risu-settings-drawer .rs-samplers-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  margin-top: 4px;\r
}\r
.risu-settings-drawer .rs-samplers-placeholder {\r
  font-size: 11px;\r
  font-style: italic;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
}\r
\r
/* ─── Sampler slider widget ────────────────────────────────────────── */\r
\r
.risu-settings-drawer .rs-slider-row {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
}\r
.risu-settings-drawer .rs-slider-header {\r
  display: flex;\r
  align-items: center;\r
  gap: 8px;\r
  min-width: 0;\r
}\r
.risu-settings-drawer .rs-slider-label {\r
  flex: 1 1 auto;\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  min-width: 0;\r
}\r
.risu-settings-drawer .rs-slider-label-set {\r
  color: var(--lumiverse-text, inherit);\r
}\r
.risu-settings-drawer .rs-slider-input {\r
  flex: 0 0 80px;\r
  width: 80px;\r
  appearance: none;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  border-radius: 3px;\r
  padding: 3px 6px;\r
  font: inherit;\r
  font-size: 11.5px;\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  text-align: right;\r
}\r
.risu-settings-drawer .rs-slider-input::-webkit-outer-spin-button,\r
.risu-settings-drawer .rs-slider-input::-webkit-inner-spin-button {\r
  -webkit-appearance: none;\r
  margin: 0;\r
}\r
.risu-settings-drawer .rs-slider-input[type=number] { -moz-appearance: textfield; }\r
.risu-settings-drawer .rs-slider-input-set {\r
  color: var(--lumiverse-text, inherit);\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.5));\r
}\r
.risu-settings-drawer .rs-slider-input:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.85));\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
}\r
.risu-settings-drawer .rs-slider-track {\r
  position: relative;\r
  height: 14px;\r
  background: rgba(255, 255, 255, 0.06);\r
  border-radius: 7px;\r
  cursor: pointer;\r
  opacity: 0.6;\r
  user-select: none;\r
  touch-action: none;\r
}\r
.risu-settings-drawer .rs-slider-track-set {\r
  opacity: 1;\r
}\r
.risu-settings-drawer .rs-slider-fill {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  bottom: 0;\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.5));\r
  border-radius: 7px 0 0 7px;\r
  pointer-events: none;\r
  width: 0%;\r
}\r
.risu-settings-drawer .rs-slider-thumb {\r
  position: absolute;\r
  top: 50%;\r
  left: 0%;\r
  transform: translate(-50%, -50%);\r
  width: 14px;\r
  height: 14px;\r
  border-radius: 50%;\r
  background: var(--lumiverse-primary, #6c9cff);\r
  border: 2px solid var(--lumiverse-bg, rgba(20, 20, 25, 1));\r
  pointer-events: none;\r
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);\r
}\r
.risu-settings-drawer .rs-slider-track:hover {\r
  opacity: 1;\r
}\r
\r
/* ─── Settings tab — debug-capture checkboxes ────────────────────────── */\r
\r
.risu-settings-drawer .rs-checkbox-row {\r
  display: grid;\r
  grid-template-columns: auto 1fr;\r
  grid-template-rows: auto auto;\r
  gap: 2px 10px;\r
  padding: 6px 0;\r
  cursor: pointer;\r
  align-items: start;\r
}\r
.risu-settings-drawer .rs-checkbox {\r
  grid-row: 1 / span 2;\r
  margin-top: 2px;\r
  width: 16px;\r
  height: 16px;\r
  cursor: pointer;\r
  accent-color: var(--lumiverse-primary, #6c9cff);\r
}\r
.risu-settings-drawer .rs-checkbox-label {\r
  grid-column: 2;\r
  grid-row: 1;\r
  font-weight: 500;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.risu-settings-drawer .rs-checkbox-hint {\r
  grid-column: 2;\r
  grid-row: 2;\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  line-height: 1.4;\r
}\r
\r
.risu-settings-drawer .rs-cleanup-summary {\r
  margin: 8px 0 6px;\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
}\r
\r
.risu-settings-drawer .rs-repair-section {\r
  margin-top: 24px;\r
  padding-top: 16px;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
}\r
.risu-settings-drawer .rs-repair-header {\r
  font-size: 14px;\r
  font-weight: 600;\r
  margin: 0 0 6px;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.risu-settings-drawer .rs-repair-result {\r
  margin-top: 12px;\r
  padding: 10px 12px;\r
  background: rgba(0, 0, 0, 0.18);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 4px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
}\r
.risu-settings-drawer .rs-repair-summary {\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
}\r
.risu-settings-drawer .rs-repair-error {\r
  color: var(--lumiverse-danger, rgba(255, 130, 130, 0.95));\r
}\r
.risu-settings-drawer .rs-repair-row {\r
  display: grid;\r
  grid-template-columns: 20px 1fr auto;\r
  gap: 8px;\r
  align-items: center;\r
  font-size: 12px;\r
  padding: 4px 0;\r
}\r
.risu-settings-drawer .rs-repair-row-empty {\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.4));\r
}\r
.risu-settings-drawer .rs-repair-row-danger {\r
  color: var(--lumiverse-warning, rgba(255, 200, 120, 0.9));\r
}\r
.risu-settings-drawer .rs-repair-count {\r
  font-variant-numeric: tabular-nums;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-size: 11px;\r
}\r
.risu-settings-drawer .rs-cleanup-list {\r
  max-height: 60vh;\r
  overflow-y: auto;\r
  padding: 4px;\r
  background: rgba(0, 0, 0, 0.18);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 4px;\r
}\r
.risu-settings-drawer .rs-cleanup-list-inner {\r
  position: relative;\r
}\r
.risu-settings-drawer .rs-cleanup-row {\r
  display: grid;\r
  grid-template-columns: 24px 64px 1fr;\r
  gap: 10px;\r
  align-items: center;\r
  padding: 6px 8px;\r
  background: rgba(255, 255, 255, 0.02);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 4px;\r
  cursor: pointer;\r
}\r
.risu-settings-drawer .rs-cleanup-row:hover {\r
  background: rgba(255, 255, 255, 0.04);\r
}\r
.risu-settings-drawer .rs-cleanup-check {\r
  margin: 0;\r
}\r
.risu-settings-drawer .rs-cleanup-thumb {\r
  width: 64px;\r
  height: 64px;\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  background: rgba(0, 0, 0, 0.3);\r
  border-radius: 3px;\r
  overflow: hidden;\r
}\r
.risu-settings-drawer .rs-cleanup-thumb img {\r
  width: 100%;\r
  height: 100%;\r
  object-fit: cover;\r
}\r
.risu-settings-drawer .rs-cleanup-thumb-placeholder {\r
  font-size: 10px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  text-align: center;\r
  padding: 4px;\r
  word-break: break-all;\r
}\r
.risu-settings-drawer .rs-cleanup-meta {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 2px;\r
  min-width: 0;\r
}\r
.risu-settings-drawer .rs-cleanup-name {\r
  font-size: 12px;\r
  color: var(--lumiverse-text, inherit);\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
.risu-settings-drawer .rs-cleanup-sub,\r
.risu-settings-drawer .rs-cleanup-id {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
.risu-settings-drawer .rs-cleanup-id {\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
}\r
\r
/* ─── Aux-model debug capture panel (floating) ─────────────────────── */\r
/* A bottom-right floating panel listing recent aux-model calls.\r
   Hidden when no captures and the user hasn't pinned it open. Each\r
   entry is collapsible JSON with a copy button. */\r
\r
.risu-aux-debug-host {\r
  position: fixed;\r
  right: 16px;\r
  bottom: 16px;\r
  z-index: 999999;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  pointer-events: auto;\r
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\r
  font-size: 13px;\r
  color: var(--lumiverse-text, #f0f0f5);\r
}\r
.risu-aux-debug-host[hidden] { display: none; }\r
\r
.risu-aux-debug-toggle {\r
  align-self: flex-end;\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 6px;\r
  padding: 6px 10px;\r
  background: rgba(20, 20, 28, 0.92);\r
  border: 1px solid rgba(255, 255, 255, 0.18);\r
  border-radius: 8px;\r
  color: inherit;\r
  cursor: pointer;\r
  user-select: none;\r
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);\r
}\r
.risu-aux-debug-toggle:hover {\r
  border-color: rgba(255, 255, 255, 0.35);\r
}\r
.risu-aux-debug-toggle-badge {\r
  background: var(--lumiverse-primary, #6c9cff);\r
  color: #fff;\r
  border-radius: 10px;\r
  padding: 1px 7px;\r
  font-size: 11px;\r
  font-weight: 600;\r
  min-width: 18px;\r
  text-align: center;\r
}\r
.risu-aux-debug-toggle-badge[hidden] { display: none; }\r
\r
.risu-aux-debug-panel {\r
  width: min(560px, calc(100vw - 32px));\r
  max-height: min(70vh, 800px);\r
  background: rgba(15, 15, 22, 0.97);\r
  border: 1px solid rgba(255, 255, 255, 0.18);\r
  border-radius: 10px;\r
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);\r
  display: flex;\r
  flex-direction: column;\r
  overflow: hidden;\r
}\r
.risu-aux-debug-panel[hidden] { display: none; }\r
\r
.risu-aux-debug-header {\r
  display: flex;\r
  align-items: center;\r
  gap: 10px;\r
  padding: 10px 12px;\r
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\r
  background: rgba(255, 255, 255, 0.04);\r
}\r
.risu-aux-debug-title {\r
  flex: 1;\r
  font-weight: 600;\r
  font-size: 13px;\r
}\r
.risu-aux-debug-action {\r
  background: transparent;\r
  border: 1px solid rgba(255, 255, 255, 0.18);\r
  border-radius: 6px;\r
  padding: 3px 8px;\r
  font-size: 12px;\r
  color: inherit;\r
  cursor: pointer;\r
}\r
.risu-aux-debug-action:hover {\r
  border-color: rgba(255, 255, 255, 0.4);\r
  background: rgba(255, 255, 255, 0.06);\r
}\r
\r
.risu-aux-debug-list {\r
  flex: 1;\r
  overflow-y: auto;\r
  padding: 6px;\r
  display: flex;\r
  flex-direction: column-reverse;\r
  gap: 6px;\r
}\r
.risu-aux-debug-empty {\r
  padding: 24px 12px;\r
  text-align: center;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  font-size: 12px;\r
}\r
\r
.risu-aux-debug-entry {\r
  border: 1px solid rgba(255, 255, 255, 0.1);\r
  border-radius: 6px;\r
  background: rgba(255, 255, 255, 0.025);\r
  overflow: hidden;\r
}\r
.risu-aux-debug-entry-header {\r
  display: grid;\r
  grid-template-columns: auto 1fr auto auto;\r
  gap: 8px;\r
  align-items: center;\r
  padding: 6px 10px;\r
  cursor: pointer;\r
  user-select: none;\r
  font-size: 12px;\r
}\r
.risu-aux-debug-entry-header:hover {\r
  background: rgba(255, 255, 255, 0.04);\r
}\r
.risu-aux-debug-kind {\r
  display: inline-block;\r
  padding: 1px 6px;\r
  border-radius: 4px;\r
  font-size: 10px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.05em;\r
}\r
.risu-aux-debug-kind-request {\r
  background: rgba(120, 160, 255, 0.2);\r
  color: #a8c0ff;\r
}\r
.risu-aux-debug-kind-response {\r
  background: rgba(120, 220, 140, 0.2);\r
  color: #a8e0b0;\r
}\r
.risu-aux-debug-kind-error {\r
  background: rgba(255, 110, 110, 0.2);\r
  color: #ffb0b0;\r
}\r
.risu-aux-debug-channel {\r
  display: inline-block;\r
  padding: 1px 6px;\r
  border-radius: 4px;\r
  font-size: 10px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.05em;\r
  margin-right: 4px;\r
}\r
.risu-aux-debug-channel-aux {\r
  background: rgba(180, 140, 220, 0.2);\r
  color: #d4b8e8;\r
}\r
.risu-aux-debug-channel-submodel {\r
  background: rgba(220, 180, 120, 0.2);\r
  color: #e8d0a0;\r
}\r
.risu-aux-debug-meta {\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-size: 11px;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
.risu-aux-debug-elapsed {\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-size: 11px;\r
  font-variant-numeric: tabular-nums;\r
}\r
.risu-aux-debug-copy {\r
  background: transparent;\r
  border: 1px solid rgba(255, 255, 255, 0.18);\r
  border-radius: 4px;\r
  padding: 2px 6px;\r
  font-size: 11px;\r
  color: inherit;\r
  cursor: pointer;\r
}\r
.risu-aux-debug-copy:hover {\r
  border-color: rgba(255, 255, 255, 0.4);\r
  background: rgba(255, 255, 255, 0.06);\r
}\r
.risu-aux-debug-body {\r
  display: none;\r
  padding: 8px 10px 10px;\r
  border-top: 1px solid rgba(255, 255, 255, 0.06);\r
  background: rgba(0, 0, 0, 0.25);\r
}\r
.risu-aux-debug-entry.is-open .risu-aux-debug-body {\r
  display: block;\r
}\r
.risu-aux-debug-json {\r
  margin: 0;\r
  font-family: 'Consolas', 'Menlo', 'Monaco', monospace;\r
  font-size: 11px;\r
  line-height: 1.5;\r
  color: #e0e0ea;\r
  white-space: pre-wrap;\r
  word-break: break-word;\r
  max-height: 320px;\r
  overflow-y: auto;\r
}\r
\r
/* ─── Portal decisions tab ─────────────────────────────────────────────── */\r
.lr-portal-drawer {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  padding: 12px;\r
  font-size: 13px;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.lr-portal-drawer .lrp-intro {\r
  margin: 0;\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, #aaa);\r
  line-height: 1.5;\r
}\r
.lr-portal-drawer .lrp-toolbar {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  flex-wrap: wrap;\r
}\r
.lr-portal-drawer .lrp-card-label {\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, #aaa);\r
}\r
.lr-portal-drawer .lrp-card-select {\r
  flex: 1 1 200px;\r
  background: rgba(255, 255, 255, 0.05);\r
  border: 1px solid rgba(255, 255, 255, 0.15);\r
  border-radius: 4px;\r
  color: inherit;\r
  padding: 4px 8px;\r
  font-size: 13px;\r
}\r
.lr-portal-drawer .lrp-card-select:focus {\r
  border-color: rgba(255, 255, 255, 0.4);\r
  outline: none;\r
}\r
.lr-portal-drawer .lrp-card-select:disabled {\r
  opacity: 0.5;\r
}\r
.lr-portal-drawer .lrp-btn {\r
  background: rgba(255, 255, 255, 0.05);\r
  border: 1px solid rgba(255, 255, 255, 0.15);\r
  border-radius: 4px;\r
  padding: 4px 10px;\r
  font-size: 12px;\r
  color: inherit;\r
  cursor: pointer;\r
}\r
.lr-portal-drawer .lrp-btn:hover {\r
  border-color: rgba(255, 255, 255, 0.4);\r
  background: rgba(255, 255, 255, 0.08);\r
}\r
.lr-portal-drawer .lrp-status {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, #888);\r
  padding: 4px 0;\r
}\r
.lr-portal-drawer .lrp-status-error {\r
  color: rgb(255, 130, 130);\r
}\r
.lr-portal-drawer .lrp-sections {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
}\r
.lr-portal-drawer .lrp-section {\r
  border: 1px solid rgba(255, 255, 255, 0.1);\r
  border-radius: 6px;\r
  background: rgba(255, 255, 255, 0.02);\r
}\r
.lr-portal-drawer .lrp-section[open] {\r
  background: rgba(255, 255, 255, 0.04);\r
}\r
.lr-portal-drawer .lrp-section-summary {\r
  cursor: pointer;\r
  padding: 8px 12px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 2px;\r
  list-style: none;\r
}\r
.lr-portal-drawer .lrp-section-summary::-webkit-details-marker { display: none; }\r
.lr-portal-drawer .lrp-section-summary::before {\r
  content: '▶';\r
  font-size: 9px;\r
  color: #888;\r
  margin-right: 8px;\r
}\r
.lr-portal-drawer .lrp-section[open] > .lrp-section-summary::before {\r
  content: '▼';\r
}\r
.lr-portal-drawer .lrp-section-title {\r
  font-size: 13px;\r
  font-weight: 600;\r
}\r
.lr-portal-drawer .lrp-section-sub {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, #888);\r
}\r
.lr-portal-drawer .lrp-candidate {\r
  border-top: 1px solid rgba(255, 255, 255, 0.06);\r
  padding: 10px 12px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
}\r
.lr-portal-drawer .lrp-candidate-pending {\r
  opacity: 0.5;\r
  pointer-events: none;\r
}\r
.lr-portal-drawer .lrp-candidate-head {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  flex-wrap: wrap;\r
}\r
.lr-portal-drawer .lrp-source {\r
  font-weight: 600;\r
  font-size: 12px;\r
}\r
.lr-portal-drawer .lrp-conf {\r
  font-size: 10px;\r
  text-transform: uppercase;\r
  padding: 2px 6px;\r
  border-radius: 3px;\r
  letter-spacing: 0.04em;\r
  font-weight: 600;\r
}\r
.lr-portal-drawer .lrp-conf-high-yes {\r
  background: rgba(80, 200, 120, 0.15);\r
  color: rgb(120, 220, 160);\r
  border: 1px solid rgba(80, 200, 120, 0.4);\r
}\r
.lr-portal-drawer .lrp-conf-ambiguous {\r
  background: rgba(220, 170, 80, 0.15);\r
  color: rgb(240, 195, 100);\r
  border: 1px solid rgba(220, 170, 80, 0.4);\r
}\r
.lr-portal-drawer .lrp-conf-high-no {\r
  background: rgba(120, 120, 120, 0.15);\r
  color: var(--lumiverse-text-muted, #aaa);\r
  border: 1px solid rgba(120, 120, 120, 0.4);\r
}\r
.lr-portal-drawer .lrp-decision {\r
  margin-left: auto;\r
}\r
.lr-portal-drawer .lrp-decision-select {\r
  background: rgba(255, 255, 255, 0.05);\r
  border: 1px solid rgba(255, 255, 255, 0.15);\r
  border-radius: 4px;\r
  color: inherit;\r
  padding: 3px 6px;\r
  font-size: 12px;\r
}\r
.lr-portal-drawer .lrp-decision-select:disabled {\r
  opacity: 0.5;\r
}\r
.lr-portal-drawer .lrp-trigger-hint {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, #999);\r
}\r
.lr-portal-drawer .lrp-trigger-hint code {\r
  background: rgba(255, 255, 255, 0.06);\r
  padding: 1px 4px;\r
  border-radius: 3px;\r
  font-family: 'Consolas', 'Menlo', monospace;\r
  font-size: 11px;\r
  color: #c9d4dd;\r
}\r
.lr-portal-drawer .lrp-preview {\r
  font-size: 12px;\r
}\r
.lr-portal-drawer .lrp-preview > summary {\r
  cursor: pointer;\r
  color: var(--lumiverse-text-muted, #aaa);\r
  font-size: 11px;\r
  list-style: none;\r
}\r
.lr-portal-drawer .lrp-preview > summary::-webkit-details-marker { display: none; }\r
.lr-portal-drawer .lrp-preview > summary::before {\r
  content: '▶';\r
  font-size: 9px;\r
  margin-right: 6px;\r
}\r
.lr-portal-drawer .lrp-preview[open] > summary::before {\r
  content: '▼';\r
}\r
.lr-portal-drawer .lrp-preview-body {\r
  margin-top: 6px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
}\r
.lr-portal-drawer .lrp-preview-shadow-host {\r
  /* The shadow root carries its own UA-reset + box; the host element\r
   * just needs to be a block-level container. CSS inside the shadow\r
   * tree controls everything visible. Lumiverse blocks iframes, so we\r
   * use shadow DOM for style isolation instead. */\r
  display: block;\r
  width: 100%;\r
  min-height: 40px;\r
}\r
.lr-portal-drawer .lrp-raw {\r
  font-size: 11px;\r
}\r
.lr-portal-drawer .lrp-raw > summary {\r
  cursor: pointer;\r
  color: var(--lumiverse-text-muted, #888);\r
  font-size: 11px;\r
  list-style: none;\r
}\r
.lr-portal-drawer .lrp-raw > summary::-webkit-details-marker { display: none; }\r
.lr-portal-drawer .lrp-raw > summary::before {\r
  content: '▶';\r
  font-size: 9px;\r
  margin-right: 6px;\r
}\r
.lr-portal-drawer .lrp-raw[open] > summary::before {\r
  content: '▼';\r
}\r
.lr-portal-drawer .lrp-raw-pre {\r
  margin: 6px 0 0;\r
  padding: 8px;\r
  background: rgba(0, 0, 0, 0.3);\r
  border-radius: 4px;\r
  font-family: 'Consolas', 'Menlo', monospace;\r
  font-size: 11px;\r
  line-height: 1.4;\r
  color: #c9d4dd;\r
  white-space: pre-wrap;\r
  word-break: break-word;\r
  max-height: 240px;\r
  overflow-y: auto;\r
}\r
\r
/* ─── Unified sidebar — sub-tab nav + panel hosts ───────────────────── */\r
\r
.lr-sidebar {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 0;\r
  padding: 0;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 13px;\r
  min-width: 0;\r
  height: 100%;\r
}\r
.lr-sidebar-nav {\r
  display: flex;\r
  flex-wrap: wrap;\r
  gap: 2px;\r
  padding: 8px 8px 0 8px;\r
  border-bottom: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.02));\r
  flex: 0 0 auto;\r
}\r
.lr-sidebar-nav-btn {\r
  appearance: none;\r
  background: transparent;\r
  border: none;\r
  border-bottom: 2px solid transparent;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.6));\r
  cursor: pointer;\r
  padding: 8px 12px;\r
  font: inherit;\r
  font-size: 12px;\r
  font-weight: 500;\r
  border-radius: 4px 4px 0 0;\r
  transition: color 100ms, background 100ms, border-color 100ms;\r
}\r
.lr-sidebar-nav-btn:hover {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.04));\r
}\r
.lr-sidebar-nav-btn-active {\r
  color: var(--lumiverse-text, inherit);\r
  border-bottom-color: var(--lumiverse-primary, #6c9cff);\r
  background: var(--lumiverse-fill, rgba(120, 160, 255, 0.08));\r
}\r
.lr-sidebar-panels {\r
  flex: 1 1 auto;\r
  min-height: 0;\r
  overflow-y: auto;\r
}\r
.lr-sidebar-panel {\r
  display: block;\r
}\r
.lr-sidebar-panel[hidden] {\r
  display: none;\r
}\r
\r
/* ─── Modules panel ──────────────────────────────────────────────────── */\r
\r
.lr-modules-drawer {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 0;\r
  padding: 4px 8px 24px 8px;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 13px;\r
  min-width: 0;\r
}\r
.lr-modules-drawer .lrm-intro {\r
  margin: 0;\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
  line-height: 1.5;\r
}\r
.lr-modules-drawer .lrm-section {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  padding: 10px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.02));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.07));\r
  border-radius: 6px;\r
  min-width: 0;\r
}\r
.lr-modules-drawer .lrm-section-header {\r
  display: flex;\r
  flex-direction: row;\r
  align-items: center;\r
  gap: 8px;\r
  margin-bottom: 4px;\r
  cursor: pointer;\r
  user-select: none;\r
  list-style: none;\r
}\r
.lr-modules-drawer .lrm-section-header::-webkit-details-marker { display: none; }\r
.lr-modules-drawer .lrm-section-header::before {\r
  content: '\\25B6';\r
  font-size: 9px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  flex: 0 0 auto;\r
}\r
.lr-modules-drawer .lrm-section[open] > .lrm-section-header::before {\r
  content: '\\25BC';\r
}\r
.lr-modules-drawer .lrm-section-header:hover .lrm-section-title {\r
  color: var(--lumiverse-text, inherit);\r
  opacity: 0.85;\r
}\r
.lr-modules-drawer .lrm-section[open] > .lrm-section-header {\r
  margin-bottom: 4px;\r
}\r
.lr-modules-drawer .lrm-section:not([open]) > .lrm-section-header {\r
  margin-bottom: 0;\r
}\r
.lr-modules-drawer .lrm-section-body {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  min-width: 0;\r
}\r
/* Subtab body — same as section-body but no inherited dropdown chrome. */\r
.lr-modules-drawer .lrm-tab-body {\r
  padding: 6px 0 0 0;\r
}\r
.lr-modules-drawer .lrm-tab-body[hidden] { display: none; }\r
.lr-modules-drawer .lrm-lorebook-status {\r
  margin-top: 8px;\r
  padding: 8px 10px;\r
  font-size: 12px;\r
  border-radius: 4px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.025));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
  min-height: 1em;\r
}\r
.lr-modules-drawer .lrm-lorebook-status:empty {\r
  background: transparent;\r
  padding: 0;\r
  min-height: 0;\r
}\r
.lr-modules-drawer .lrm-lorebook-status-error {\r
  background: rgba(255, 110, 110, 0.12);\r
  color: rgba(255, 180, 180, 0.95);\r
}\r
.lr-modules-drawer .lrm-section-title {\r
  margin: 0;\r
  font-size: 12px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.5px;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.lr-modules-drawer .lrm-section-desc {\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
}\r
.lr-modules-drawer .lrm-toolbar {\r
  display: flex;\r
  gap: 6px;\r
  align-items: center;\r
  flex-wrap: wrap;\r
}\r
.lr-modules-drawer .lrm-list-filter {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  padding: 6px 0 4px 0;\r
}\r
.lr-modules-drawer .lrm-list-search {\r
  flex: 1 1 auto;\r
  appearance: none;\r
  background: var(--lumiverse-bg-input, rgba(0, 0, 0, 0.25));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  color: var(--lumiverse-text, inherit);\r
  font: inherit;\r
  font-size: 12px;\r
  padding: 4px 8px;\r
  border-radius: 4px;\r
  min-width: 100px;\r
}\r
.lr-modules-drawer .lrm-list-search:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, #6c9cff);\r
  background: var(--lumiverse-bg-input-focus, rgba(0, 0, 0, 0.35));\r
}\r
.lr-modules-drawer .lrm-list-filter-count {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-variant-numeric: tabular-nums;\r
}\r
.lrm-btn,\r
.lrm-btn-mini {\r
  appearance: none;\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.85));\r
  border-radius: 4px;\r
  cursor: pointer;\r
  font: inherit;\r
}\r
.lrm-btn { padding: 6px 10px; font-size: 12px; }\r
.lrm-btn-mini { padding: 3px 7px; font-size: 11px; }\r
.lrm-btn:hover,\r
.lrm-btn-mini:hover {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.55));\r
}\r
.lrm-btn:disabled,\r
.lrm-btn-mini:disabled {\r
  opacity: 0.5;\r
  cursor: not-allowed;\r
}\r
.lrm-btn-primary,\r
.lrm-btn-mini.lrm-btn-primary {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.25));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.6));\r
  color: var(--lumiverse-text, inherit);\r
}\r
.lrm-btn-primary:hover {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.4));\r
}\r
.lrm-btn-danger,\r
.lrm-btn-mini.lrm-btn-danger {\r
  border-color: var(--lumiverse-danger, rgba(255, 120, 120, 0.4));\r
  color: var(--lumiverse-danger, rgba(255, 130, 130, 0.95));\r
}\r
.lrm-btn-danger:hover,\r
.lrm-btn-mini.lrm-btn-danger:hover {\r
  background: rgba(255, 120, 120, 0.12);\r
  border-color: var(--lumiverse-danger, rgba(255, 120, 120, 0.7));\r
}\r
.lr-modules-drawer .lrm-status {\r
  font-size: 11px;\r
  padding: 6px 8px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.03));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 3px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
}\r
.lr-modules-drawer .lrm-status-error {\r
  color: var(--lumiverse-danger, rgba(255, 130, 130, 0.95));\r
  border-color: var(--lumiverse-danger, rgba(255, 120, 120, 0.5));\r
}\r
.lr-modules-drawer .lrm-empty {\r
  padding: 8px 4px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.45));\r
  font-style: italic;\r
  font-size: 12px;\r
}\r
.lr-modules-drawer .lrm-modules-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
}\r
.lr-modules-drawer .lrm-module {\r
  background: rgba(255, 255, 255, 0.02);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 4px;\r
  min-width: 0;\r
}\r
.lr-modules-drawer .lrm-module[open] {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.04));\r
}\r
.lr-modules-drawer .lrm-module-summary {\r
  cursor: pointer;\r
  padding: 8px 10px;\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  list-style: none;\r
  font-size: 12.5px;\r
}\r
.lr-modules-drawer .lrm-module-summary::-webkit-details-marker { display: none; }\r
.lr-modules-drawer .lrm-module-summary::before {\r
  content: '\\25B6';\r
  font-size: 8px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
}\r
.lr-modules-drawer .lrm-module[open] > .lrm-module-summary::before {\r
  content: '\\25BC';\r
}\r
.lr-modules-drawer .lrm-module-name {\r
  flex: 1 1 auto;\r
  font-weight: 600;\r
  color: var(--lumiverse-text, inherit);\r
  word-break: break-word;\r
}\r
.lr-modules-drawer .lrm-module-attached-badge {\r
  font-size: 10.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.6));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  white-space: nowrap;\r
  background: rgba(120, 160, 255, 0.12);\r
  border-radius: 3px;\r
  padding: 1px 6px;\r
}\r
.lr-modules-drawer .lrm-module-body {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  padding: 6px 10px 10px 10px;\r
}\r
.lr-modules-drawer .lrm-module-sub {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
}\r
.lr-modules-drawer .lrm-module-desc {\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
  line-height: 1.4;\r
}\r
.lr-modules-drawer .lrm-module-actions {\r
  display: flex;\r
  gap: 4px;\r
  align-items: center;\r
  margin-top: 4px;\r
}\r
.lr-modules-drawer .lrm-characters-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
}\r
.lr-modules-drawer .lrm-character {\r
  background: rgba(255, 255, 255, 0.02);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 4px;\r
}\r
.lr-modules-drawer .lrm-character[open] {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.04));\r
}\r
.lr-modules-drawer .lrm-character-summary {\r
  cursor: pointer;\r
  padding: 8px 10px;\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  list-style: none;\r
  font-size: 12.5px;\r
}\r
.lr-modules-drawer .lrm-character-summary::-webkit-details-marker { display: none; }\r
.lr-modules-drawer .lrm-character-summary::before {\r
  content: '\\25B6';\r
  font-size: 8px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
}\r
.lr-modules-drawer .lrm-character[open] > .lrm-character-summary::before {\r
  content: '\\25BC';\r
}\r
.lr-modules-drawer .lrm-character-name {\r
  flex: 1 1 auto;\r
  font-weight: 500;\r
  color: var(--lumiverse-text, inherit);\r
  word-break: break-word;\r
}\r
.lr-modules-drawer .lrm-character-count {\r
  font-size: 10.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  white-space: nowrap;\r
}\r
.lr-modules-drawer .lrm-character-body {\r
  padding: 6px 10px 10px 10px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
}\r
.lr-modules-drawer .lrm-character-empty {\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  font-style: italic;\r
  padding: 4px 0;\r
}\r
.lr-modules-drawer .lrm-attached-list {\r
  list-style: none;\r
  margin: 0;\r
  padding: 0;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
}\r
.lr-modules-drawer .lrm-attached-row {\r
  display: flex;\r
  gap: 6px;\r
  align-items: center;\r
  justify-content: space-between;\r
  padding: 4px 8px;\r
  background: rgba(255, 255, 255, 0.02);\r
  border-radius: 3px;\r
}\r
.lr-modules-drawer .lrm-attached-name {\r
  font-size: 12px;\r
  color: var(--lumiverse-text, inherit);\r
  flex: 1 1 auto;\r
  word-break: break-word;\r
}\r
.lr-modules-drawer .lrm-attach-wrap {\r
  display: flex;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
  align-items: center;\r
  padding: 6px 0 0 0;\r
  border-top: 1px dashed var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
}\r
.lr-modules-drawer .lrm-attach-label {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
.lr-modules-drawer .lrm-attach-input,\r
.lr-modules-drawer .lrm-attach-trigger {\r
  flex: 1 1 160px;\r
  padding: 5px 8px;\r
  font-size: 12px;\r
}\r
\r
/* ─── Viewer panel ───────────────────────────────────────────────────── */\r
\r
.lr-viewer-drawer {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  padding: 12px 8px 24px 8px;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 13px;\r
  min-width: 0;\r
}\r
.lr-viewer-drawer .lrv-intro {\r
  margin: 0;\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
  line-height: 1.5;\r
}\r
.lr-viewer-drawer .lrv-toolbar {\r
  display: flex;\r
  gap: 6px;\r
  align-items: center;\r
  flex-wrap: wrap;\r
}\r
.lr-viewer-drawer .lrv-source-label {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
}\r
.lr-viewer-drawer .lrv-source-trigger {\r
  flex: 1 1 200px;\r
  padding: 4px 8px;\r
  font-size: 12px;\r
}\r
.lr-viewer-drawer .lrv-btn {\r
  appearance: none;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  color: inherit;\r
  border-radius: 4px;\r
  padding: 4px 10px;\r
  font-size: 12px;\r
  cursor: pointer;\r
}\r
.lr-viewer-drawer .lrv-btn:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.55));\r
}\r
.lr-viewer-drawer .lrv-current-btn {\r
  appearance: none;\r
  border: 0;\r
  background: var(--lumiverse-primary, #5b8cff);\r
  color: #ffffff;\r
  border-radius: 4px;\r
  padding: 6px 10px;\r
  font: inherit;\r
  font-size: 12px;\r
  font-weight: 600;\r
  cursor: pointer;\r
}\r
.lr-viewer-drawer .lrv-current-btn:hover:not(:disabled) {\r
  filter: brightness(1.1);\r
}\r
.lr-viewer-drawer .lrv-current-btn:disabled {\r
  opacity: 0.5;\r
  cursor: not-allowed;\r
}\r
.lr-viewer-drawer .lrv-notes {\r
  padding: 4px 12px 12px;\r
}\r
.lr-viewer-drawer .lrv-notes-body {\r
  font-size: 13px;\r
  line-height: 1.55;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.lr-viewer-drawer .lrv-notes-body p { margin: 0 0 0.7em; }\r
.lr-viewer-drawer .lrv-notes-body p:last-child { margin-bottom: 0; }\r
.lr-viewer-drawer .lrv-notes-body h1,\r
.lr-viewer-drawer .lrv-notes-body h2,\r
.lr-viewer-drawer .lrv-notes-body h3,\r
.lr-viewer-drawer .lrv-notes-body h4,\r
.lr-viewer-drawer .lrv-notes-body h5,\r
.lr-viewer-drawer .lrv-notes-body h6 {\r
  margin: 0.9em 0 0.4em;\r
  font-weight: 600;\r
  line-height: 1.3;\r
}\r
.lr-viewer-drawer .lrv-notes-body h1 { font-size: 1.35em; }\r
.lr-viewer-drawer .lrv-notes-body h2 { font-size: 1.2em; }\r
.lr-viewer-drawer .lrv-notes-body h3 { font-size: 1.08em; }\r
.lr-viewer-drawer .lrv-notes-body h4,\r
.lr-viewer-drawer .lrv-notes-body h5,\r
.lr-viewer-drawer .lrv-notes-body h6 { font-size: 1em; }\r
.lr-viewer-drawer .lrv-notes-body ul,\r
.lr-viewer-drawer .lrv-notes-body ol { margin: 0 0 0.7em 1.4em; padding: 0; }\r
.lr-viewer-drawer .lrv-notes-body li { margin: 0.15em 0; }\r
.lr-viewer-drawer .lrv-notes-body code {\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.06));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  border-radius: 3px;\r
  padding: 1px 4px;\r
  font-size: 0.9em;\r
}\r
.lr-viewer-drawer .lrv-notes-body blockquote {\r
  margin: 0 0 0.7em;\r
  padding: 4px 10px;\r
  border-left: 3px solid var(--lumiverse-primary, rgba(120, 160, 255, 0.4));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.03));\r
  border-radius: 0 4px 4px 0;\r
}\r
.lr-viewer-drawer .lrv-notes-body a {\r
  color: var(--lumiverse-primary, #5b8cff);\r
  text-decoration: underline;\r
}\r
.lr-viewer-drawer .lrv-notes-body img {\r
  max-width: 100%;\r
  height: auto;\r
  border-radius: 4px;\r
}\r
.lr-viewer-drawer .lrv-notes-body hr {\r
  border: 0;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.1));\r
  margin: 1em 0;\r
}\r
.lr-viewer-drawer .lrv-status {\r
  font-size: 11px;\r
  padding: 6px 8px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.03));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  border-radius: 3px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
}\r
.lr-viewer-drawer .lrv-status-error {\r
  color: var(--lumiverse-danger, rgba(255, 130, 130, 0.95));\r
  border-color: var(--lumiverse-danger, rgba(255, 120, 120, 0.5));\r
}\r
.lr-viewer-drawer .lrv-warning {\r
  font-size: 11px;\r
  padding: 6px 8px;\r
  background: rgba(255, 200, 100, 0.08);\r
  border: 1px solid var(--lumiverse-warning, rgba(255, 200, 100, 0.4));\r
  border-radius: 3px;\r
  color: var(--lumiverse-warning, rgba(255, 200, 100, 0.9));\r
}\r
.lr-viewer-drawer .lrv-empty {\r
  padding: 8px;\r
  font-style: italic;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.45));\r
  font-size: 11.5px;\r
}\r
.lr-viewer-drawer .lrv-surfaces {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 10px;\r
}\r
.lr-viewer-drawer .lrv-section {\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.07));\r
  border-radius: 6px;\r
  background: rgba(255, 255, 255, 0.02);\r
}\r
.lr-viewer-drawer .lrv-section[open] {\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
}\r
.lr-viewer-drawer .lrv-section-summary {\r
  cursor: pointer;\r
  padding: 8px 12px;\r
  font-weight: 600;\r
  font-size: 12px;\r
  list-style: none;\r
  text-transform: uppercase;\r
  letter-spacing: 0.4px;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.lr-viewer-drawer .lrv-section-summary::-webkit-details-marker { display: none; }\r
.lr-viewer-drawer .lrv-section-summary::before {\r
  content: '\\25B6';\r
  font-size: 8px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  margin-right: 6px;\r
}\r
.lr-viewer-drawer .lrv-section[open] > .lrv-section-summary::before {\r
  content: '\\25BC';\r
}\r
\r
.lr-viewer-drawer .lrv-redirect-actions {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  padding: 8px 10px 10px;\r
  flex-wrap: wrap;\r
}\r
\r
/* Sub-tab bar inside the viewer panel — picks one section to render at a time. */\r
.lr-viewer-drawer .lrv-subtab-bar {\r
  display: flex;\r
  gap: 2px;\r
  padding: 6px 10px 0;\r
  border-bottom: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  flex-wrap: wrap;\r
  margin-bottom: 8px;\r
}\r
.lr-viewer-drawer .lrv-subtab {\r
  background: transparent;\r
  border: 1px solid transparent;\r
  border-bottom: none;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-size: 12px;\r
  padding: 5px 10px 6px;\r
  border-radius: 5px 5px 0 0;\r
  cursor: pointer;\r
  transition: background 80ms, color 80ms;\r
}\r
.lr-viewer-drawer .lrv-subtab:hover {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-bg-elevated, rgba(255, 255, 255, 0.04));\r
}\r
.lr-viewer-drawer .lrv-subtab-active {\r
  color: var(--lumiverse-text, inherit);\r
  background: var(--lumiverse-bg-elevated, rgba(255, 255, 255, 0.06));\r
  border-color: var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
}\r
\r
/* "Show more" pagination button under the asset grid. */\r
.lr-viewer-drawer .lrv-asset-show-more {\r
  display: block;\r
  margin: 8px auto;\r
}\r
\r
/* Default-variables section: name → value rows with optional Reset button. */\r
.lr-viewer-drawer .lrv-section-note {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.6));\r
  margin: 4px 10px 8px;\r
  line-height: 1.45;\r
}\r
.lr-viewer-drawer .lrv-defvar-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  padding: 4px 10px 8px;\r
}\r
.lr-viewer-drawer .lrv-defvar-row {\r
  display: grid;\r
  grid-template-columns: minmax(120px, 1fr) minmax(160px, 2fr) auto;\r
  gap: 8px;\r
  align-items: center;\r
}\r
.lr-viewer-drawer .lrv-defvar-row-overridden .lrv-defvar-input {\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.5));\r
}\r
.lr-viewer-drawer .lrv-defvar-name {\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  font-size: 12px;\r
  color: var(--lumiverse-text, inherit);\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  white-space: nowrap;\r
}\r
.lr-viewer-drawer .lrv-defvar-input,\r
.lr-viewer-drawer .lrv-defvar-name-input {\r
  background: var(--lumiverse-bg-elevated, rgba(255, 255, 255, 0.04));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.1));\r
  color: var(--lumiverse-text, inherit);\r
  padding: 4px 6px;\r
  border-radius: 4px;\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  font-size: 12px;\r
  min-width: 0;\r
}\r
.lr-viewer-drawer .lrv-defvar-spacer {\r
  display: inline-block;\r
  min-width: 56px;\r
}\r
.lr-viewer-drawer .lrv-defvar-row-new {\r
  border: 1px dashed var(--lumiverse-border, rgba(255, 255, 255, 0.15));\r
  border-radius: 4px;\r
  padding: 4px;\r
  grid-template-columns: minmax(120px, 1fr) minmax(160px, 2fr) auto auto;\r
}\r
\r
/* Asset toolbar (Add asset button + upload status) */\r
.lr-viewer-drawer .lrv-asset-toolbar {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  padding: 6px 10px;\r
  border-bottom: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.05));\r
  flex-wrap: wrap;\r
}\r
.lr-viewer-drawer .lrv-btn-primary {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.25));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.6));\r
  color: var(--lumiverse-text, inherit);\r
}\r
.lr-viewer-drawer .lrv-btn-primary:hover {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.4));\r
}\r
.lr-viewer-drawer .lrv-asset-upload-status {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
}\r
.lr-viewer-drawer .lrv-asset-upload-status-error {\r
  color: var(--lumiverse-danger, rgba(255, 130, 130, 0.95));\r
}\r
\r
/* Asset action buttons (per-tile rename/delete) */\r
.lr-viewer-drawer .lrv-asset-actions {\r
  display: flex;\r
  gap: 4px;\r
  margin-top: 4px;\r
  opacity: 0.55;\r
  transition: opacity 100ms;\r
}\r
.lr-viewer-drawer .lrv-asset-tile:hover .lrv-asset-actions,\r
.lr-viewer-drawer .lrv-asset-tile:focus-within .lrv-asset-actions {\r
  opacity: 1;\r
}\r
.lr-viewer-drawer .lrv-asset-action {\r
  appearance: none;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.05));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.75));\r
  border-radius: 3px;\r
  padding: 2px 6px;\r
  font-size: 10px;\r
  cursor: pointer;\r
  flex: 1 1 auto;\r
  text-decoration: none;\r
  text-align: center;\r
  display: inline-block;\r
}\r
.lr-viewer-drawer .lrv-asset-action:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
  color: var(--lumiverse-text, inherit);\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.55));\r
}\r
.lr-viewer-drawer .lrv-asset-action-primary {\r
  background: var(--lumiverse-primary, rgba(120, 160, 255, 0.3));\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.6));\r
}\r
.lr-viewer-drawer .lrv-asset-action-danger:hover {\r
  color: var(--lumiverse-danger, rgba(255, 130, 130, 0.95));\r
  border-color: var(--lumiverse-danger, rgba(255, 130, 130, 0.5));\r
  background: rgba(255, 130, 130, 0.08);\r
}\r
.lr-viewer-drawer .lrv-asset-rename-input {\r
  appearance: none;\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
  border: 1px solid var(--lumiverse-primary, rgba(120, 160, 255, 0.6));\r
  color: var(--lumiverse-text, inherit);\r
  border-radius: 3px;\r
  padding: 2px 6px;\r
  font-size: 11px;\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  width: 100%;\r
  min-width: 0;\r
}\r
\r
/* Asset grid */\r
.lr-viewer-drawer .lrv-asset-grid {\r
  display: grid;\r
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));\r
  gap: 8px;\r
  padding: 8px;\r
}\r
/* Windowed asset list — only the visible row range is mounted at any time.\r
   Scrollable host + absolute-positioned tiles inside an explicit-height\r
   spacer. Mirrors tanstack-virtual's principle in vanilla DOM. */\r
.lr-viewer-drawer .lrv-asset-virt-host {\r
  position: relative;\r
  overflow-y: auto;\r
  max-height: 60vh;\r
  min-height: 240px;\r
  background: rgba(0, 0, 0, 0.12);\r
  border-radius: 4px;\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.06));\r
  margin: 8px 10px;\r
}\r
.lr-viewer-drawer .lrv-asset-virt-inner {\r
  position: relative;\r
  width: 100%;\r
}\r
/* Tiles rendered inside the virt-inner host get absolute positioning by JS;\r
   neutralise any flex-related defaults from the legacy \`.lrv-asset-tile\`\r
   rules so the JS-set top/left/width/height take effect cleanly. */\r
.lr-viewer-drawer .lrv-asset-virt-inner > .lrv-asset-tile {\r
  position: absolute;\r
  margin: 0;\r
  box-sizing: border-box;\r
}\r
.lr-viewer-drawer .lrv-asset-search {\r
  appearance: none;\r
  background: var(--lumiverse-bg-input, rgba(0, 0, 0, 0.25));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  color: var(--lumiverse-text, inherit);\r
  font: inherit;\r
  font-size: 12px;\r
  padding: 4px 8px;\r
  border-radius: 4px;\r
  flex: 1 1 auto;\r
  min-width: 100px;\r
}\r
.lr-viewer-drawer .lrv-asset-search:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, #6c9cff);\r
  background: var(--lumiverse-bg-input-focus, rgba(0, 0, 0, 0.35));\r
}\r
.lr-viewer-drawer .lrv-asset-tile {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  background: rgba(0, 0, 0, 0.25);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  border-radius: 4px;\r
  padding: 4px;\r
  min-width: 0;\r
}\r
.lr-viewer-drawer .lrv-asset-media {\r
  width: 100%;\r
  flex: 1 1 auto;\r
  min-height: 0;\r
  object-fit: cover;\r
  background: rgba(255, 255, 255, 0.04);\r
  border-radius: 3px;\r
}\r
.lr-viewer-drawer .lrv-asset-media-video {\r
  object-fit: contain;\r
  background: rgba(0, 0, 0, 0.45);\r
}\r
.lr-viewer-drawer .lrv-asset-media-audio {\r
  height: 38px;\r
  flex: 0 0 auto;\r
  background: rgba(0, 0, 0, 0.45);\r
}\r
\r
.lr-viewer-drawer .lrv-defaults-section {\r
  padding: 10px 12px 12px 12px;\r
}\r
.lr-viewer-drawer .lrv-defaults-note {\r
  margin: 0 0 8px 0;\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
}\r
.lr-viewer-drawer .lrv-defaults-textarea {\r
  appearance: none;\r
  display: block;\r
  width: 100%;\r
  box-sizing: border-box;\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.04));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  border-radius: 4px;\r
  color: var(--lumiverse-text, inherit);\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  font-size: 12px;\r
  line-height: 1.5;\r
  padding: 8px 10px;\r
  resize: vertical;\r
}\r
.lr-viewer-drawer .lrv-defaults-textarea:focus {\r
  outline: none;\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.7));\r
}\r
.lr-viewer-drawer .lrv-defaults-actions {\r
  display: flex;\r
  gap: 6px;\r
  align-items: center;\r
  margin-top: 8px;\r
  flex-wrap: wrap;\r
}\r
.lr-viewer-drawer .lrv-defaults-status {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  margin-right: auto;\r
}\r
.lr-viewer-drawer .lrv-defaults-status-dirty {\r
  color: var(--lumiverse-primary, rgba(120, 160, 255, 0.85));\r
}\r
.lr-viewer-drawer .lrv-asset-caption {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 1px;\r
  min-width: 0;\r
}\r
.lr-viewer-drawer .lrv-asset-name {\r
  font-size: 11px;\r
  color: var(--lumiverse-text, inherit);\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
}\r
.lr-viewer-drawer .lrv-asset-meta {\r
  font-size: 10px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
}\r
\r
/* Trigger rows */\r
.lr-viewer-drawer .lrv-trigger-row {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  padding: 6px 12px;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.05));\r
}\r
.lr-viewer-drawer .lrv-trigger-head {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
}\r
.lr-viewer-drawer .lrv-trigger-name {\r
  font-weight: 500;\r
  flex: 1 1 auto;\r
  min-width: 0;\r
}\r
.lr-viewer-drawer .lrv-trigger-tag {\r
  font-size: 10px;\r
  text-transform: uppercase;\r
  letter-spacing: 0.3px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
}\r
.lr-viewer-drawer .lrv-trigger-lua > summary {\r
  cursor: pointer;\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.6));\r
}\r
\r
/* Regex rows */\r
.lr-viewer-drawer .lrv-regex-row {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 3px;\r
  padding: 6px 12px;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.05));\r
}\r
.lr-viewer-drawer .lrv-regex-row-disabled { opacity: 0.55; }\r
.lr-viewer-drawer .lrv-regex-head {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  flex-wrap: wrap;\r
}\r
.lr-viewer-drawer .lrv-regex-name {\r
  font-weight: 500;\r
  flex: 1 1 auto;\r
  min-width: 0;\r
  word-break: break-word;\r
}\r
.lr-viewer-drawer .lrv-regex-tag {\r
  font-size: 10px;\r
  text-transform: uppercase;\r
  letter-spacing: 0.3px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
.lr-viewer-drawer .lrv-regex-module {\r
  font-size: 10px;\r
  padding: 1px 6px;\r
  border-radius: 3px;\r
  background: rgba(120, 160, 255, 0.12);\r
  color: rgba(140, 180, 255, 0.85);\r
}\r
.lr-viewer-drawer .lrv-regex-line {\r
  display: flex;\r
  gap: 6px;\r
  align-items: baseline;\r
  font-size: 11px;\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  min-width: 0;\r
}\r
.lr-viewer-drawer .lrv-regex-line-label {\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  flex: 0 0 auto;\r
}\r
.lr-viewer-drawer .lrv-regex-line code {\r
  background: rgba(0, 0, 0, 0.3);\r
  padding: 1px 4px;\r
  border-radius: 3px;\r
  color: #c9d4dd;\r
  white-space: pre-wrap;\r
  word-break: break-all;\r
  flex: 1 1 auto;\r
  min-width: 0;\r
}\r
.lr-viewer-drawer .lrv-regex-divider {\r
  display: flex;\r
  align-items: center;\r
  padding: 10px 12px 6px;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.05));\r
}\r
.lr-viewer-drawer .lrv-regex-divider-label {\r
  font-size: 10px;\r
  text-transform: uppercase;\r
  letter-spacing: 0.6px;\r
  font-weight: 600;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  flex: 0 0 auto;\r
  padding-right: 8px;\r
}\r
.lr-viewer-drawer .lrv-regex-divider::after {\r
  content: '';\r
  flex: 1 1 auto;\r
  height: 1px;\r
  background: var(--lumiverse-border, rgba(255, 255, 255, 0.1));\r
}\r
\r
/* Lorebook */\r
.lr-viewer-drawer .lrv-lorebook-group {\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.05));\r
}\r
.lr-viewer-drawer .lrv-lorebook-group > summary {\r
  cursor: pointer;\r
  padding: 6px 12px;\r
  font-size: 12px;\r
  font-weight: 500;\r
}\r
.lr-viewer-drawer .lrv-lorebook-row {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 3px;\r
  padding: 6px 16px;\r
  border-top: 1px dashed var(--lumiverse-border, rgba(255, 255, 255, 0.04));\r
}\r
.lr-viewer-drawer .lrv-lorebook-row-disabled { opacity: 0.5; }\r
.lr-viewer-drawer .lrv-lorebook-keys {\r
  font-size: 11px;\r
  color: var(--lumiverse-primary, #8fb6ff);\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
}\r
.lr-viewer-drawer .lrv-lorebook-comment {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.6));\r
  font-style: italic;\r
}\r
.lr-viewer-drawer .lrv-lorebook-content {\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text, inherit);\r
  white-space: pre-wrap;\r
  word-break: break-word;\r
  line-height: 1.45;\r
}\r
\r
/* Risu-faithful lorebook viewer: one line per entry, expand for read-only detail. */\r
.lr-viewer-drawer .lrv-lb-section {\r
  padding: 0;\r
}\r
.lr-viewer-drawer .lrv-lb-group {\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.05));\r
}\r
.lr-viewer-drawer .lrv-lb-group-summary {\r
  cursor: pointer;\r
  padding: 6px 12px;\r
  font-size: 12px;\r
  font-weight: 500;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
}\r
.lr-viewer-drawer .lrv-lb-group-summary::-webkit-details-marker { display: none; }\r
.lr-viewer-drawer .lrv-lb-group-summary::marker { content: ''; }\r
.lr-viewer-drawer .lrv-lb-group-summary::before {\r
  content: '▸';\r
  display: inline-block;\r
  width: 1em;\r
  margin-right: 2px;\r
  font-size: 10px;\r
  transition: transform 0.1s;\r
}\r
.lr-viewer-drawer .lrv-lb-group[open] > .lrv-lb-group-summary::before {\r
  transform: rotate(90deg);\r
}\r
\r
.lr-viewer-drawer .lrv-lb-row {\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.04));\r
}\r
.lr-viewer-drawer .lrv-lb-row:first-of-type {\r
  border-top: none;\r
}\r
.lr-viewer-drawer .lrv-lb-row-summary {\r
  cursor: pointer;\r
  padding: 4px 16px;\r
  display: flex;\r
  align-items: center;\r
  gap: 8px;\r
  font-size: 12px;\r
  list-style: none;\r
}\r
.lr-viewer-drawer .lrv-lb-row-summary::-webkit-details-marker { display: none; }\r
.lr-viewer-drawer .lrv-lb-row-summary::marker { content: ''; }\r
.lr-viewer-drawer .lrv-lb-row-summary:hover {\r
  background: var(--lumiverse-surface-2, rgba(255, 255, 255, 0.03));\r
}\r
.lr-viewer-drawer .lrv-lb-row-disabled .lrv-lb-row-summary { opacity: 0.45; }\r
.lr-viewer-drawer .lrv-lb-status {\r
  flex: 0 0 auto;\r
  width: 8px;\r
  height: 8px;\r
  border-radius: 50%;\r
  display: inline-block;\r
}\r
.lr-viewer-drawer .lrv-lb-status-always {\r
  background: #f5b73a;\r
}\r
.lr-viewer-drawer .lrv-lb-status-keyed {\r
  background: transparent;\r
  border: 1px solid var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
  width: 7px;\r
  height: 7px;\r
}\r
.lr-viewer-drawer .lrv-lb-name {\r
  flex: 1 1 auto;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  color: var(--lumiverse-text, inherit);\r
}\r
\r
.lr-viewer-drawer .lrv-lb-body {\r
  padding: 6px 16px 10px 32px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  font-size: 11.5px;\r
}\r
.lr-viewer-drawer .lrv-lb-field {\r
  display: flex;\r
  gap: 6px;\r
}\r
.lr-viewer-drawer .lrv-lb-field-label {\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.6));\r
  text-transform: uppercase;\r
  font-size: 10px;\r
  letter-spacing: 0.4px;\r
  padding-top: 1px;\r
}\r
.lr-viewer-drawer .lrv-lb-field > .lrv-lb-field-label {\r
  flex: 0 0 100px;\r
}\r
.lr-viewer-drawer .lrv-lb-field-value {\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  word-break: break-word;\r
}\r
.lr-viewer-drawer .lrv-lb-content {\r
  margin: 0;\r
  padding: 6px 8px;\r
  background: var(--lumiverse-surface-2, rgba(255, 255, 255, 0.04));\r
  border-radius: 3px;\r
  white-space: pre-wrap;\r
  word-break: break-word;\r
  line-height: 1.45;\r
  font-family: inherit;\r
  max-height: 300px;\r
  overflow: auto;\r
}\r
\r
.lr-viewer-drawer .lrv-lb-useradds-head {\r
  padding: 10px 16px 4px;\r
  font-size: 10px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  border-top: 1px dashed var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  margin-top: 4px;\r
}\r
\r
.lr-viewer-drawer .lrv-lb-legacy {\r
  padding: 16px;\r
  font-size: 12px;\r
  line-height: 1.5;\r
}\r
\r
.lr-translate-toggle.lr-translate-toggle-on {\r
  border-color: var(--lumiverse-primary, #5b8cff);\r
  color: var(--lumiverse-primary, #5b8cff);\r
}\r
.lr-translate-toggle.lr-translate-toggle-disabled,\r
.lr-translate-toggle.lr-translate-toggle-disabled:hover {\r
  cursor: not-allowed;\r
  opacity: 0.45;\r
  transform: none;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  border-color: var(--lumiverse-border, #2a2a2a);\r
}\r
\r
/* Folder group: collapsible <details> wrapping its children. */\r
.lr-viewer-drawer .lrv-lb-folder-group {\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
}\r
.lr-viewer-drawer .lrv-lb-folder-summary {\r
  cursor: pointer;\r
  display: flex;\r
  align-items: center;\r
  gap: 6px;\r
  padding: 6px 16px;\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
  list-style: none;\r
}\r
.lr-viewer-drawer .lrv-lb-folder-summary::-webkit-details-marker { display: none; }\r
.lr-viewer-drawer .lrv-lb-folder-summary::marker { content: ''; }\r
.lr-viewer-drawer .lrv-lb-folder-summary::before {\r
  content: '▸';\r
  display: inline-block;\r
  width: 1em;\r
  margin-right: 2px;\r
  font-size: 10px;\r
  transition: transform 0.1s;\r
}\r
.lr-viewer-drawer .lrv-lb-folder-group[open] > .lrv-lb-folder-summary::before {\r
  transform: rotate(90deg);\r
}\r
.lr-viewer-drawer .lrv-lb-folder-summary:hover {\r
  background: var(--lumiverse-surface-2, rgba(255, 255, 255, 0.03));\r
}\r
.lr-viewer-drawer .lrv-lb-folder-name {\r
  flex: 1 1 auto;\r
  font-weight: 500;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  color: var(--lumiverse-text, inherit);\r
}\r
.lr-viewer-drawer .lrv-lb-folder-count {\r
  flex: 0 0 auto;\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.5));\r
}\r
.lr-viewer-drawer .lrv-lb-folder-body {\r
  padding-left: 14px;\r
  border-left: 1px dashed var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  margin-left: 22px;\r
}\r
\r
/* Fallback: standalone folder row when no children are present in the list. */\r
.lr-viewer-drawer .lrv-lb-folder {\r
  display: flex;\r
  align-items: center;\r
  gap: 6px;\r
  padding: 6px 16px;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
.lr-viewer-drawer .lrv-lb-row + .lrv-lb-folder {\r
  margin-top: 4px;\r
}\r
.lr-viewer-drawer .lrv-lb-folder-icon {\r
  display: inline-block;\r
  width: 10px;\r
  height: 8px;\r
  background: currentColor;\r
  border-radius: 1px;\r
  position: relative;\r
  opacity: 0.7;\r
}\r
.lr-viewer-drawer .lrv-lb-folder-icon::before {\r
  content: '';\r
  position: absolute;\r
  left: 0;\r
  top: -3px;\r
  width: 5px;\r
  height: 3px;\r
  background: currentColor;\r
  border-radius: 1px 1px 0 0;\r
}\r
\r
/* Child link row: an entry that lives elsewhere, linked into this list. */\r
.lr-viewer-drawer .lrv-lb-child {\r
  padding: 4px 16px 4px 28px;\r
  font-size: 11.5px;\r
  font-style: italic;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
}\r
\r
/* "Lumiverse handles this" redirect block */\r
.lr-viewer-drawer .lrv-section-redirect {\r
  padding: 0;\r
}\r
.lr-viewer-drawer .lrv-section-redirect .lrv-section-summary {\r
  cursor: default;\r
  padding: 8px 12px;\r
}\r
.lr-viewer-drawer .lrv-section-redirect .lrv-section-summary::before {\r
  content: '';\r
  margin-right: 0;\r
}\r
.lr-viewer-drawer .lrv-redirect-body {\r
  padding: 0 12px 10px 12px;\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
  line-height: 1.5;\r
}\r
\r
/* Trigger / bg-html inline editor */\r
.lr-viewer-drawer .lrv-trigger-editor {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  padding: 6px 12px 10px 12px;\r
}\r
.lr-viewer-drawer .lrv-trigger-textarea {\r
  appearance: none;\r
  background: rgba(0, 0, 0, 0.32);\r
  border: 1px solid var(--lumiverse-primary, rgba(120, 160, 255, 0.5));\r
  color: #c9d4dd;\r
  border-radius: 4px;\r
  padding: 8px 10px;\r
  font-family: 'Consolas', 'Menlo', monospace;\r
  font-size: 11.5px;\r
  line-height: 1.45;\r
  resize: vertical;\r
  min-height: 120px;\r
  width: 100%;\r
  box-sizing: border-box;\r
  outline: none;\r
}\r
.lr-viewer-drawer .lrv-trigger-textarea:focus {\r
  border-color: var(--lumiverse-primary, rgba(120, 160, 255, 0.85));\r
  background: rgba(0, 0, 0, 0.42);\r
}\r
.lr-viewer-drawer .lrv-trigger-edit-actions {\r
  display: flex;\r
  gap: 6px;\r
  align-items: center;\r
}\r
\r
/* Pre block (CJS, Lua) */\r
.lr-viewer-drawer .lrv-pre {\r
  margin: 0;\r
  padding: 8px 12px;\r
  background: rgba(0, 0, 0, 0.32);\r
  border-radius: 0 0 4px 4px;\r
  font-family: 'Consolas', 'Menlo', monospace;\r
  font-size: 11px;\r
  line-height: 1.45;\r
  color: #c9d4dd;\r
  white-space: pre-wrap;\r
  word-break: break-word;\r
  max-height: 400px;\r
  overflow-y: auto;\r
}\r
\r
/* ─── Custom Toggles tab ─────────────────────────────────────────── */\r
\r
.lr-toggles-drawer {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  padding: 8px;\r
}\r
\r
.lr-toggles-intro {\r
  margin: 0;\r
  font-size: 11px;\r
  color: #99a4ad;\r
  line-height: 1.45;\r
}\r
\r
.lr-toggles-status {\r
  font-size: 11px;\r
  color: #7d8a93;\r
  font-style: italic;\r
}\r
\r
.lr-toggles-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
}\r
\r
.lr-toggle-row {\r
  display: flex;\r
  align-items: center;\r
  gap: 8px;\r
  padding: 4px 6px;\r
  border-radius: 4px;\r
  background: rgba(255, 255, 255, 0.02);\r
}\r
\r
.lr-toggle-row-stacked {\r
  flex-direction: column;\r
  align-items: stretch;\r
}\r
\r
.lr-toggle-label {\r
  flex: 1;\r
  display: flex;\r
  align-items: center;\r
  gap: 6px;\r
  cursor: pointer;\r
  font-size: 12px;\r
  color: #d3dce3;\r
}\r
\r
.lr-toggle-label-text {\r
  flex: 1;\r
}\r
\r
.lr-toggle-attribution {\r
  font-size: 10px;\r
  color: #7d8a93;\r
  font-style: italic;\r
  padding: 0 8px 6px;\r
  white-space: normal;\r
  overflow-wrap: anywhere;\r
  word-break: break-word;\r
  line-height: 1.35;\r
}\r
\r
.lr-toggle-checkbox {\r
  margin: 0;\r
  cursor: pointer;\r
}\r
\r
.lr-toggle-select,\r
.lr-toggle-text,\r
.lr-toggle-textarea {\r
  background: rgba(0, 0, 0, 0.32);\r
  border: 1px solid rgba(255, 255, 255, 0.08);\r
  border-radius: 3px;\r
  color: #d3dce3;\r
  font-size: 12px;\r
  padding: 3px 6px;\r
  font-family: inherit;\r
}\r
\r
.lr-toggle-select {\r
  min-width: 100px;\r
}\r
\r
.lr-toggle-text {\r
  min-width: 120px;\r
  max-width: 180px;\r
}\r
\r
.lr-toggle-textarea {\r
  width: 100%;\r
  resize: vertical;\r
  min-height: 50px;\r
  font-family: 'Consolas', 'Menlo', monospace;\r
}\r
\r
.lr-toggle-caption {\r
  font-size: 10px;\r
  color: #7d8a93;\r
  padding: 2px 6px;\r
  font-style: italic;\r
}\r
\r
.lr-toggle-divider {\r
  display: flex;\r
  align-items: center;\r
  gap: 8px;\r
  margin: 4px 0;\r
}\r
\r
.lr-toggle-divider-label {\r
  font-size: 10px;\r
  color: #7d8a93;\r
  text-transform: uppercase;\r
  letter-spacing: 0.05em;\r
  white-space: nowrap;\r
}\r
\r
.lr-toggle-divider hr {\r
  flex: 1;\r
  border: none;\r
  border-top: 1px solid rgba(255, 255, 255, 0.08);\r
  margin: 0;\r
}\r
\r
.lr-toggle-group {\r
  border: 1px solid rgba(255, 255, 255, 0.06);\r
  border-radius: 4px;\r
  background: rgba(255, 255, 255, 0.015);\r
  padding: 0;\r
}\r
\r
.lr-toggle-group-summary {\r
  cursor: pointer;\r
  padding: 6px 8px;\r
  font-size: 12px;\r
  color: #d3dce3;\r
  font-weight: 500;\r
  user-select: none;\r
}\r
\r
.lr-toggle-group-body {\r
  padding: 4px 8px 6px 8px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  border-top: 1px solid rgba(255, 255, 255, 0.04);\r
}\r
\r
/* ─── Logs panel ─────────────────────────────────────────────────────── */\r
\r
.lr-logs {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  padding: 10px;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 13px;\r
  min-width: 0;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.025));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.07));\r
  border-radius: 6px;\r
}\r
.lr-logs-intro {\r
  margin: 0;\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
  line-height: 1.5;\r
}\r
.lr-logs-row {\r
  display: flex;\r
  align-items: center;\r
  gap: 8px;\r
}\r
.lr-logs-row label {\r
  cursor: pointer;\r
  user-select: none;\r
}\r
.lr-logs-row-disabled label {\r
  opacity: 0.5;\r
  cursor: not-allowed;\r
}\r
.lr-logs-trigger {\r
  flex: 1;\r
  padding: 4px 8px;\r
  font-size: 12px;\r
}\r
.lr-logs-status {\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.65));\r
  padding: 6px 0;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.07));\r
}\r
.lr-logs-download,\r
.lr-logs-clear {\r
  align-self: flex-start;\r
  padding: 6px 12px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.05));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  border-radius: 4px;\r
  color: inherit;\r
  font-size: 12px;\r
  cursor: pointer;\r
}\r
.lr-logs-download:hover,\r
.lr-logs-clear:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.08));\r
}\r
.lr-logs-flash {\r
  font-size: 12px;\r
  color: var(--lumiverse-primary, #7fbfff);\r
  min-height: 1.4em;\r
}\r
\r
.lr-import-overlay {\r
  position: fixed;\r
  inset: 0;\r
  z-index: 2147483700;\r
  background: var(--lumiverse-bg-deep, rgba(8, 10, 14, 0.92));\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  padding: 24px;\r
  -webkit-tap-highlight-color: transparent;\r
  overscroll-behavior: contain;\r
}\r
.lr-import-overlay[hidden] {\r
  display: none;\r
}\r
.lr-import-card {\r
  background: var(--lumiverse-fill, #1c1f24);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.1));\r
  border-radius: 10px;\r
  padding: 22px 24px;\r
  width: min(440px, 100%);\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);\r
  color: var(--lumiverse-text, #e6e6e6);\r
  font-family: inherit;\r
}\r
.lr-import-title {\r
  font-size: 16px;\r
  font-weight: 700;\r
  word-break: break-word;\r
}\r
.lr-import-phase {\r
  font-size: 11px;\r
  font-weight: 600;\r
  text-transform: uppercase;\r
  letter-spacing: 0.6px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
}\r
.lr-import-message {\r
  font-size: 13px;\r
  color: var(--lumiverse-text, #e6e6e6);\r
  word-break: break-word;\r
  min-height: 1.4em;\r
}\r
.lr-import-progress {\r
  height: 6px;\r
  border-radius: 3px;\r
  background: rgba(255, 255, 255, 0.08);\r
  overflow: hidden;\r
  position: relative;\r
}\r
.lr-import-progress-fill {\r
  height: 100%;\r
  width: 0%;\r
  background: var(--lumiverse-primary, #6c9cff);\r
  transition: width 200ms ease;\r
  border-radius: inherit;\r
}\r
.lr-import-progress.lr-import-progress-error .lr-import-progress-fill {\r
  background: var(--lumiverse-danger, #ff7878);\r
}\r
.lr-import-progress.lr-import-progress-indeterminate .lr-import-progress-fill {\r
  animation: lr-import-marquee 1.6s linear infinite;\r
}\r
@keyframes lr-import-marquee {\r
  0% { transform: translateX(-110%); }\r
  100% { transform: translateX(310%); }\r
}\r
.lr-import-note {\r
  font-size: 11.5px;\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.55));\r
  line-height: 1.45;\r
}\r
.lr-import-card .lrm-btn {\r
  align-self: flex-end;\r
  margin-top: 4px;\r
}\r
.lr-import-consent {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  padding: 12px 14px;\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  border-radius: 8px;\r
  background: rgba(255, 255, 255, 0.03);\r
}\r
.lr-import-consent[hidden] {\r
  display: none;\r
}\r
.lr-import-consent-message {\r
  font-size: 13px;\r
  line-height: 1.5;\r
  color: var(--lumiverse-text, #e6e6e6);\r
  white-space: pre-wrap;\r
  word-break: break-word;\r
}\r
.lr-import-consent-buttons {\r
  display: flex;\r
  gap: 8px;\r
  justify-content: flex-end;\r
}\r
.lr-import-consent-buttons .lrm-btn {\r
  align-self: auto;\r
  margin-top: 0;\r
}\r
\r
.lr-alert-modal {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 14px;\r
  padding: 18px 20px 16px 20px;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 14px;\r
}\r
.lr-alert-message {\r
  margin: 0;\r
  line-height: 1.5;\r
  white-space: pre-wrap;\r
  word-break: break-word;\r
}\r
.lr-alert-error .lr-alert-message {\r
  color: var(--lumiverse-danger, #f47272);\r
}\r
.lr-alert-actions {\r
  display: flex;\r
  justify-content: flex-start;\r
}\r
.lr-alert-ok {\r
  padding: 7px 18px;\r
  background: var(--lumiverse-primary, #9370db);\r
  border: none;\r
  border-radius: 6px;\r
  color: #fff;\r
  font-size: 13px;\r
  font-weight: 500;\r
  cursor: pointer;\r
}\r
.lr-alert-ok:hover {\r
  filter: brightness(1.08);\r
}\r
.lr-alert-ok:focus-visible {\r
  outline: 2px solid var(--lumiverse-primary, #9370db);\r
  outline-offset: 2px;\r
}\r
\r
.lr-alert-lead {\r
  margin: 0;\r
  font-size: 15px;\r
  font-weight: 600;\r
  line-height: 1.45;\r
}\r
.lr-alert-card-name {\r
  font-weight: 600;\r
  color: var(--lumiverse-primary, #9370db);\r
}\r
.lr-alert-note {\r
  margin: 4px 0 0 0;\r
  padding: 10px 12px;\r
  background: var(--lumiverse-surface-alt, rgba(147, 112, 219, 0.08));\r
  border-left: 3px solid var(--lumiverse-primary, #9370db);\r
  border-radius: 4px;\r
  font-size: 13px;\r
  line-height: 1.5;\r
  color: var(--lumiverse-text-muted, inherit);\r
}\r
.lr-alert-note-label {\r
  font-weight: 600;\r
  margin-right: 4px;\r
}\r
.lr-alert-perm-list {\r
  margin: 0;\r
  padding: 0 0 0 18px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  font-size: 13px;\r
  line-height: 1.5;\r
}\r
.lr-alert-perm-list li {\r
  list-style: disc;\r
}\r
.lr-alert-emphasize {\r
  display: inline-block;\r
  padding: 1px 7px;\r
  background: var(--lumiverse-warning, #f5a623);\r
  color: #1a1a1a;\r
  border-radius: 4px;\r
  font-weight: 700;\r
  text-transform: uppercase;\r
  letter-spacing: 0.3px;\r
  font-size: 0.95em;\r
}\r
\r
.lr-pick-modal {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  padding: 16px 18px 14px 18px;\r
  color: var(--lumiverse-text, inherit);\r
  font-size: 14px;\r
}\r
.lr-pick-list {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  max-height: 60vh;\r
  overflow-y: auto;\r
}\r
.lr-pick-option {\r
  display: block;\r
  width: 100%;\r
  text-align: left;\r
  padding: 10px 14px;\r
  background: var(--lumiverse-fill-medium, #2a2a2a);\r
  color: var(--lumiverse-text, #eee);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  border-radius: 6px;\r
  cursor: pointer;\r
  font: inherit;\r
}\r
.lr-pick-option:hover {\r
  background: var(--lumiverse-fill-heavy, #333);\r
  border-color: var(--lumiverse-primary, #9370db);\r
}\r
.lr-pick-option:focus-visible {\r
  outline: 2px solid var(--lumiverse-primary, #9370db);\r
  outline-offset: 2px;\r
}\r
.lr-pick-actions {\r
  display: flex;\r
  justify-content: flex-end;\r
}\r
.lr-pick-cancel {\r
  padding: 6px 14px;\r
  background: transparent;\r
  color: var(--lumiverse-text-muted, #888);\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  border-radius: 6px;\r
  cursor: pointer;\r
  font: inherit;\r
  font-size: 13px;\r
}\r
.lr-pick-cancel:hover {\r
  color: var(--lumiverse-text, #eee);\r
}\r
`;

// src/ui/styles.ts
var STYLES = styles_default;

// src/util/coerce.ts
function errMsg(err) {
  return err instanceof Error ? err.message : String(err);
}

// src/ui/drawer.ts
var ACCEPT_EXTENSIONS = [".charx", ".png", ".json", ".jpg", ".jpeg"];
var CHUNK_BYTES = 2500 * 1024;
var CHUNK_WIRE_WARN_BYTES = 3800000;
var INIT_ACK_TIMEOUT_MS = 15000;
var CHUNK_ACK_TIMEOUT_MS = 20000;
var COMMIT_FIRST_PROGRESS_TIMEOUT_MS = 60000;
var UPLOAD_WINDOW_SIZE = 30;
function mountCardsPanel(opts) {
  const { ctx, sendToBackend, log } = opts;
  log.info("cards-panel: mounting");
  const root = opts.root;
  const actionRow = document.createElement("div");
  actionRow.className = "lrm-toolbar";
  const importBtn = document.createElement("button");
  importBtn.type = "button";
  importBtn.className = "lrm-btn lrm-btn-primary";
  importBtn.textContent = "Upload card";
  importBtn.title = "Pick a .charx, .png, .json, or .jpg/.jpeg character file.";
  actionRow.appendChild(importBtn);
  root.appendChild(actionRow);
  const state = {
    cards: null,
    progress: null,
    notices: [],
    optimistic: false
  };
  let activeUpload = null;
  function render() {}
  async function onImportClicked() {
    if (importBtn.disabled)
      return;
    log.info("drawer: Import button clicked — opening file picker");
    let file = null;
    try {
      const [picked] = await ctx.uploads.pickFile({ accept: ACCEPT_EXTENSIONS });
      if (!picked) {
        log.info("drawer: picker dismissed without selection");
        return;
      }
      file = { name: picked.name, bytes: picked.bytes };
      log.info(`drawer: picked file=${picked.name} size=${picked.bytes.byteLength} mime=${picked.mimeType}`);
    } catch (err) {
      log.error("drawer: pickFile threw", err);
      state.notices = [`File picker failed: ${errMsg(err)}`];
      render();
      return;
    }
    state.optimistic = true;
    state.notices = [];
    importBtn.disabled = true;
    render();
    const sessionId = generateSessionId();
    const totalBytes = file.bytes.byteLength;
    const totalChunks = Math.max(1, Math.ceil(totalBytes / CHUNK_BYTES));
    log.info(`drawer: upload session=${sessionId} file=${file.name} bytes=${totalBytes} chunks=${totalChunks} chunkSize=${CHUNK_BYTES}`);
    activeUpload = {
      sessionId,
      lastAckSeq: -999,
      receivedBytesOnBackend: 0,
      pendingAcks: new Map,
      aborted: false
    };
    const session = activeUpload;
    opts.onImportStart?.(file.name, () => {
      if (!session.aborted) {
        session.aborted = true;
        log.info(`drawer: cancel requested session=${sessionId}`);
        rejectAllPending(session, new Error("upload cancelled"));
      }
    }, totalBytes);
    try {
      state.progress = { phase: "decoding", message: `Starting upload (0/${totalChunks})…`, fraction: 0 };
      render();
      const tInit = performance.now();
      sendToBackend({
        type: "import_card_init",
        sessionId,
        fileName: file.name,
        totalBytes,
        totalChunks
      });
      await trackAck(session, -1, INIT_ACK_TIMEOUT_MS, "init");
      log.info(`drawer: init acked in ${Math.round(performance.now() - tInit)}ms`);
      const tAllChunks = performance.now();
      let completed = 0;
      let nextSeq = 0;
      const errors = [];
      const sendOne = async () => {
        while (true) {
          if (session.aborted || errors.length > 0)
            return;
          const seq = nextSeq++;
          if (seq >= totalChunks)
            return;
          const start = seq * CHUNK_BYTES;
          const end = Math.min(start + CHUNK_BYTES, totalBytes);
          const slice = file.bytes.subarray(start, end);
          const b64 = bytesToBase64(slice);
          const chunkMsg = {
            type: "import_card_chunk",
            sessionId,
            seq,
            bytesB64Chunk: b64
          };
          const wireSize = JSON.stringify(chunkMsg).length;
          if (wireSize > CHUNK_WIRE_WARN_BYTES) {
            log.warn(`drawer: chunk wire size ${wireSize}B approaches Lumi's 64KB inbound guard ` + `(seq=${seq} of ${totalChunks}, raw_chunk=${slice.byteLength}B, b64=${b64.length}B). ` + `Reduce CHUNK_BYTES if this happens.`);
          }
          const ack = trackAck(session, seq, CHUNK_ACK_TIMEOUT_MS, `chunk ${seq}`);
          sendToBackend(chunkMsg);
          try {
            await ack;
          } catch (err) {
            errors.push(err);
            return;
          }
          completed += 1;
          state.progress = {
            phase: "decoding",
            message: `Uploading (${completed}/${totalChunks})…`,
            fraction: completed / totalChunks
          };
          render();
        }
      };
      const workers = [];
      for (let w = 0;w < Math.min(UPLOAD_WINDOW_SIZE, totalChunks); w++) {
        workers.push(sendOne());
      }
      await Promise.all(workers);
      if (errors.length > 0)
        throw errors[0];
      if (session.aborted)
        throw new Error("upload aborted");
      log.info(`drawer: all ${totalChunks} chunks acked in ${Math.round(performance.now() - tAllChunks)}ms`);
      state.progress = { phase: "translating", message: "Processing on server…", fraction: null };
      render();
      const tCommit = performance.now();
      sendToBackend({ type: "import_card_commit", sessionId });
      await trackAck(session, -2, CHUNK_ACK_TIMEOUT_MS, "commit-ack");
      log.info(`drawer: commit acked in ${Math.round(performance.now() - tCommit)}ms — awaiting import_progress`);
      armNoProgressTimeout(session, COMMIT_FIRST_PROGRESS_TIMEOUT_MS);
    } catch (err) {
      log.error("drawer: upload failed", err);
      try {
        sendToBackend({ type: "import_card_abort", sessionId, reason: errMsg(err) });
      } catch {}
      rejectAllPending(session, err instanceof Error ? err : new Error(String(err)));
      if (activeUpload?.sessionId === sessionId)
        activeUpload = null;
      state.optimistic = false;
      state.progress = {
        phase: "error",
        message: `Upload failed: ${errMsg(err)}`,
        fraction: null
      };
      state.notices = [errMsg(err)];
      importBtn.disabled = false;
      render();
    }
  }
  function trackAck(session, seq, timeoutMs, label) {
    if (session.lastAckSeq === seq)
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (session.pendingAcks.delete(seq)) {
          session.aborted = true;
          reject(new Error(`timeout waiting for ${label} ack after ${timeoutMs}ms`));
        }
      }, timeoutMs);
      session.pendingAcks.set(seq, { resolve, reject, timer });
    });
  }
  function rejectAllPending(session, err) {
    for (const [seq, p] of session.pendingAcks) {
      clearTimeout(p.timer);
      p.reject(err);
      session.pendingAcks.delete(seq);
    }
  }
  let noProgressTimer;
  function clearAckTimer(_session) {
    if (noProgressTimer) {
      clearTimeout(noProgressTimer);
      noProgressTimer = undefined;
    }
  }
  function armNoProgressTimeout(session, timeoutMs) {
    clearAckTimer(session);
    noProgressTimer = setTimeout(() => {
      if (activeUpload !== session)
        return;
      log.error(`drawer: no import_progress within ${timeoutMs}ms after commit — failing`);
      session.aborted = true;
      activeUpload = null;
      state.progress = {
        phase: "error",
        message: `Server didn't respond within ${Math.round(timeoutMs / 1000)}s after upload. The backend may have crashed.`,
        fraction: null
      };
      importBtn.disabled = false;
      render();
    }, timeoutMs);
  }
  function onUploadAck(sessionId, seq, receivedBytes) {
    const session = activeUpload;
    if (!session || session.sessionId !== sessionId) {
      log.warn(`drawer: stray upload ack session=${sessionId} seq=${seq} — ignoring`);
      return;
    }
    session.lastAckSeq = seq;
    session.receivedBytesOnBackend = receivedBytes;
    const p = session.pendingAcks.get(seq);
    if (p) {
      session.pendingAcks.delete(seq);
      clearTimeout(p.timer);
      p.resolve();
    }
  }
  importBtn.addEventListener("click", () => {
    onImportClicked();
  });
  async function onInstallRegexScripts(msg) {
    log.info(`drawer: install_regex_scripts characterId=${msg.characterId} name=${msg.characterName} count=${msg.scripts.length}`);
    const sampleDisplay = msg.scripts.find((s) => s.target === "display");
    if (sampleDisplay) {
      log.info(`drawer: first display rule name=${sampleDisplay.name} ` + `scope=${sampleDisplay.scope} scope_id=${sampleDisplay.scope_id} ` + `sub_macros=${sampleDisplay.substitute_macros} find=${JSON.stringify(sampleDisplay.find_regex).slice(0, 100)} ` + `replace[0..400]=${JSON.stringify(sampleDisplay.replace_string).slice(0, 400)}`);
    }
    const t0 = performance.now();
    try {
      const existingResp = await fetch(`/api/v1/regex-scripts?scope=character&character_id=${encodeURIComponent(msg.characterId)}&limit=1000`, { credentials: "include" });
      if (existingResp.ok) {
        const body = await existingResp.json();
        const existingIds = (body.data ?? []).filter((r) => r.scope === "character" && r.scope_id === msg.characterId && !r.metadata?._risu?.module_id).map((r) => r.id);
        if (existingIds.length > 0) {
          log.info(`drawer: pre-clean removing ${existingIds.length} existing character-scoped rule(s) for char=${msg.characterId}`);
          const delResp = await fetch("/api/v1/regex-scripts/bulk-delete", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ids: existingIds }),
            credentials: "include"
          });
          if (!delResp.ok) {
            log.warn(`drawer: pre-clean bulk-delete HTTP ${delResp.status} — proceeding with install anyway (will accumulate)`);
          } else {
            const delBody = await delResp.json();
            log.info(`drawer: pre-clean deleted=${delBody?.count ?? "?"}`);
          }
        } else {
          log.info(`drawer: pre-clean no existing character-scoped rules for char=${msg.characterId}`);
        }
      } else {
        log.warn(`drawer: pre-clean list fetch HTTP ${existingResp.status} — proceeding without pre-clean`);
      }
    } catch (err) {
      log.warn(`drawer: pre-clean threw — proceeding with install`, err);
    }
    if (msg.scripts.length === 0) {
      log.info(`drawer: install_regex_scripts done (cleanup-only, nothing to install) for char=${msg.characterId}`);
      return;
    }
    try {
      const resp = await fetch("/api/v1/regex-scripts/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scripts: msg.scripts }),
        credentials: "include"
      });
      if (!resp.ok) {
        let detail = "";
        try {
          detail = " — " + (await resp.text()).slice(0, 200);
        } catch {}
        throw new Error(`HTTP ${resp.status}${detail}`);
      }
      const body = await resp.json();
      const imported = body?.imported ?? 0;
      const skipped = body?.skipped ?? 0;
      const errors = Array.isArray(body?.errors) ? body.errors : [];
      log.info(`drawer: regex import response imported=${imported} skipped=${skipped} errors=${errors.length} ` + `httpStatus=${resp.status} elapsed=${Math.round(performance.now() - t0)}ms ` + `expected=${msg.scripts.length}`);
      if (errors.length > 0) {
        for (const e of errors)
          log.warn(`drawer: regex error — ${e}`);
      }
      if (imported !== msg.scripts.length) {
        log.warn(`drawer: regex install count mismatch — sent ${msg.scripts.length}, Lumi accepted ${imported}. ` + `Display-target rules may be incomplete for this character.`);
      }
      if (skipped > 0 || errors.length > 0) {
        const notices = [...state.notices];
        notices.push(`${skipped} regex rule(s) were skipped by Lumiverse (${imported} installed).`);
        for (const e of errors.slice(0, 3))
          notices.push(`  • ${e}`);
        if (errors.length > 3)
          notices.push(`  • …and ${errors.length - 3} more`);
        state.notices = notices;
        render();
      }
    } catch (err) {
      log.error(`drawer: regex import failed`, err);
      const notices = [...state.notices];
      notices.push(`Failed to install ${msg.scripts.length} regex rule(s): ${errMsg(err)}`);
      state.notices = notices;
      render();
    }
  }
  async function cleanupCharacterArtifacts(characterId, worldBookIds) {
    log.info(`drawer.cleanup: characterId=${characterId} worldBookCount=${worldBookIds.length}`);
    try {
      const listResp = await fetch(`/api/v1/regex-scripts?scope=character&character_id=${encodeURIComponent(characterId)}&limit=2000`, { credentials: "include" });
      if (listResp.ok) {
        const body = await listResp.json();
        const ids = (body.data ?? []).filter((r) => r.scope === "character" && r.scope_id === characterId).map((r) => r.id);
        if (ids.length > 0) {
          const delResp = await fetch("/api/v1/regex-scripts/bulk-delete", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ids }),
            credentials: "include"
          });
          if (delResp.ok) {
            const delBody = await delResp.json();
            log.info(`drawer.cleanup: regex deleted=${delBody?.count ?? "?"} (sent ${ids.length})`);
          } else {
            log.warn(`drawer.cleanup: regex bulk-delete HTTP ${delResp.status}`);
          }
        } else {
          log.info(`drawer.cleanup: no character-scoped regex to remove for ${characterId}`);
        }
      } else {
        log.warn(`drawer.cleanup: regex list HTTP ${listResp.status}`);
      }
    } catch (err) {
      log.warn(`drawer.cleanup: regex cleanup threw`, err);
    }
    for (const wbId of worldBookIds) {
      try {
        const resp = await fetch(`/api/v1/world-books/${encodeURIComponent(wbId)}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (resp.ok) {
          log.info(`drawer.cleanup: world_book deleted id=${wbId}`);
        } else if (resp.status === 404) {
          log.info(`drawer.cleanup: world_book ${wbId} already absent`);
        } else {
          log.warn(`drawer.cleanup: world_book delete HTTP ${resp.status} id=${wbId}`);
        }
      } catch (err) {
        log.warn(`drawer.cleanup: world_book delete threw id=${wbId}`, err);
      }
    }
  }
  async function installModuleArtifacts(msg) {
    log.info(`drawer.installModuleArtifacts: char=${msg.characterId} module=${msg.moduleId} ` + `lorebookEntries=${msg.lorebookEntries.length} regexScripts=${msg.regexScripts.length}`);
    let worldBookId = null;
    const regexScriptIds = [];
    if (msg.lorebookEntries.length > 0) {
      try {
        const createResp = await fetch("/api/v1/world-books", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: msg.worldBookName }),
          credentials: "include"
        });
        if (createResp.ok) {
          const body = await createResp.json();
          if (typeof body?.id === "string") {
            worldBookId = body.id;
            const importResp = await fetch(`/api/v1/world-books/${encodeURIComponent(worldBookId)}/entries/import`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ entries: msg.lorebookEntries }),
              credentials: "include"
            });
            if (!importResp.ok) {
              log.warn(`drawer.installModuleArtifacts: world_book entries import HTTP ${importResp.status} ` + `for module=${msg.moduleId} — book created but entries may be missing`);
            }
            const charResp = await fetch(`/api/v1/characters/${encodeURIComponent(msg.characterId)}`, { credentials: "include" });
            if (charResp.ok) {
              const cur = await charResp.json();
              const existing = Array.isArray(cur.world_book_ids) ? cur.world_book_ids.filter((x) => typeof x === "string") : [];
              if (!existing.includes(worldBookId)) {
                const updResp = await fetch(`/api/v1/characters/${encodeURIComponent(msg.characterId)}`, {
                  method: "PUT",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    world_book_ids: [...existing, worldBookId]
                  }),
                  credentials: "include"
                });
                if (!updResp.ok) {
                  log.warn(`drawer.installModuleArtifacts: character world_book_ids update HTTP ${updResp.status} ` + `for module=${msg.moduleId} — book exists but isn't attached`);
                }
              }
            }
          }
        } else {
          log.warn(`drawer.installModuleArtifacts: world_book create HTTP ${createResp.status} for module=${msg.moduleId}`);
        }
      } catch (err) {
        log.warn(`drawer.installModuleArtifacts: world_book pipeline threw`, err);
      }
    }
    if (msg.regexScripts.length > 0) {
      try {
        const resp = await fetch("/api/v1/regex-scripts/import", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ scripts: msg.regexScripts }),
          credentials: "include"
        });
        if (resp.ok) {
          const body = await resp.json();
          if (Array.isArray(body.imported_ids)) {
            for (const id of body.imported_ids) {
              if (typeof id === "string")
                regexScriptIds.push(id);
            }
          } else {
            try {
              const listResp = await fetch(`/api/v1/regex-scripts?scope=character&character_id=${encodeURIComponent(msg.characterId)}&limit=2000`, { credentials: "include" });
              if (listResp.ok) {
                const listBody = await listResp.json();
                for (const r of listBody.data ?? []) {
                  if (r.metadata?._risu?.module_id === msg.moduleId) {
                    regexScriptIds.push(r.id);
                  }
                }
              }
            } catch (err) {
              log.warn(`drawer.installModuleArtifacts: id-recovery list fetch threw`, err);
            }
          }
        } else {
          log.warn(`drawer.installModuleArtifacts: regex import HTTP ${resp.status} for module=${msg.moduleId}`);
        }
      } catch (err) {
        log.warn(`drawer.installModuleArtifacts: regex pipeline threw`, err);
      }
    }
    sendToBackend({
      type: "module_artifacts_installed",
      characterId: msg.characterId,
      moduleId: msg.moduleId,
      worldBookId,
      regexScriptIds
    });
  }
  async function uninstallModuleArtifacts(msg) {
    log.info(`drawer.uninstallModuleArtifacts: char=${msg.characterId} module=${msg.moduleId} ` + `worldBookId=${msg.worldBookId ?? "null"} regex=${msg.regexScriptIds.length}`);
    let ok = true;
    if (msg.worldBookId) {
      try {
        const charResp = await fetch(`/api/v1/characters/${encodeURIComponent(msg.characterId)}`, { credentials: "include" });
        if (charResp.ok) {
          const cur = await charResp.json();
          const existing = Array.isArray(cur.world_book_ids) ? cur.world_book_ids.filter((x) => typeof x === "string") : [];
          if (existing.includes(msg.worldBookId)) {
            await fetch(`/api/v1/characters/${encodeURIComponent(msg.characterId)}`, {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                world_book_ids: existing.filter((id) => id !== msg.worldBookId)
              }),
              credentials: "include"
            });
          }
        }
        const delResp = await fetch(`/api/v1/world-books/${encodeURIComponent(msg.worldBookId)}`, { method: "DELETE", credentials: "include" });
        if (!delResp.ok && delResp.status !== 404) {
          ok = false;
          log.warn(`drawer.uninstallModuleArtifacts: world_book delete HTTP ${delResp.status} id=${msg.worldBookId}`);
        }
      } catch (err) {
        ok = false;
        log.warn(`drawer.uninstallModuleArtifacts: world_book pipeline threw`, err);
      }
    }
    const idsToDelete = new Set(msg.regexScriptIds);
    try {
      const listResp = await fetch(`/api/v1/regex-scripts?scope=character&character_id=${encodeURIComponent(msg.characterId)}&limit=2000`, { credentials: "include" });
      if (listResp.ok) {
        const body = await listResp.json();
        for (const r of body.data ?? []) {
          if (r.scope === "character" && r.scope_id === msg.characterId && r.metadata?._risu?.module_id === msg.moduleId) {
            idsToDelete.add(r.id);
          }
        }
      } else {
        log.warn(`drawer.uninstallModuleArtifacts: list HTTP ${listResp.status}, falling back to stashed IDs only`);
      }
    } catch (err) {
      log.warn(`drawer.uninstallModuleArtifacts: list threw, falling back to stashed IDs only`, err);
    }
    if (idsToDelete.size > 0) {
      try {
        const resp = await fetch("/api/v1/regex-scripts/bulk-delete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ids: [...idsToDelete] }),
          credentials: "include"
        });
        if (!resp.ok) {
          ok = false;
          log.warn(`drawer.uninstallModuleArtifacts: regex bulk-delete HTTP ${resp.status} (sent ${idsToDelete.size})`);
        } else {
          log.info(`drawer.uninstallModuleArtifacts: regex bulk-deleted ${idsToDelete.size} (stashed=${msg.regexScriptIds.length})`);
        }
      } catch (err) {
        ok = false;
        log.warn(`drawer.uninstallModuleArtifacts: regex pipeline threw`, err);
      }
    }
    sendToBackend({
      type: "module_artifacts_uninstalled",
      characterId: msg.characterId,
      moduleId: msg.moduleId,
      ok
    });
  }
  function handleBackendMessage(msg) {
    if (msg.type !== "import_upload_ack" && msg.type !== "module_upload_ack") {
      log.info(`drawer.handle: ${msg.type}`);
    }
    switch (msg.type) {
      case "cards_updated":
        log.info(`drawer.cards_updated: count=${msg.cards.length}`);
        state.cards = msg.cards;
        render();
        break;
      case "cleanup_character_artifacts":
        cleanupCharacterArtifacts(msg.characterId, msg.worldBookIds);
        break;
      case "install_module_artifacts":
        installModuleArtifacts(msg);
        break;
      case "uninstall_module_artifacts":
        uninstallModuleArtifacts(msg);
        break;
      case "import_upload_ack":
        onUploadAck(msg.sessionId, msg.seq, msg.receivedBytes);
        break;
      case "import_progress":
        log.info(`drawer.import_progress: phase=${msg.phase} frac=${msg.fraction ?? "?"}`);
        if (activeUpload) {
          clearAckTimer(activeUpload);
          if (msg.phase === "done" || msg.phase === "error")
            activeUpload = null;
        }
        state.progress = {
          phase: msg.phase,
          message: msg.message,
          fraction: msg.fraction ?? null
        };
        state.optimistic = false;
        if (msg.phase === "done") {
          importBtn.disabled = false;
        } else if (msg.phase === "error") {
          importBtn.disabled = false;
          if (msg.error)
            state.notices = [msg.error];
          log.warn(`drawer: import error surfaced: ${msg.error ?? "(no detail)"}`);
        }
        render();
        break;
      case "install_regex_scripts":
        onInstallRegexScripts(msg);
        break;
      case "notify_legacy_card_needs_reimport":
        break;
      case "error":
        log.error(`drawer.error: ${msg.message}`);
        if (activeUpload && msg.sessionId === activeUpload.sessionId) {
          rejectAllPending(activeUpload, new Error(msg.message));
        }
        state.progress = {
          phase: "error",
          message: msg.message,
          fraction: null
        };
        state.optimistic = false;
        importBtn.disabled = false;
        render();
        break;
    }
  }
  render();
  log.info("cards-panel: ready");
  return {
    handleBackendMessage,
    destroy() {
      log.info("cards-panel: destroy");
      try {
        root.replaceChildren();
      } catch {}
    }
  };
}
function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 32768;
  for (let i = 0;i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
function generateSessionId() {
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (c?.randomUUID)
    return c.randomUUID();
  return `rc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// src/ui/variables-tab.ts
var SUB_TABS = [
  { id: "local", label: "Local", title: "Chat-scoped variables. setvar / setChatVar / Lua setState write here." },
  { id: "lumi", label: "Lumi", title: "Lumi-native global + chat scopes. Read-only, Risu cards do not use these." }
];
function mountVariablesPanel(opts) {
  const { sendToBackend, log } = opts;
  log.info("variables-panel: mounting");
  const root = opts.root;
  root.classList.add("risu-vars-drawer");
  const intro = document.createElement("p");
  intro.className = "rv-intro";
  intro.textContent = "Live macro variables for the active chat.";
  root.appendChild(intro);
  const toolbar = document.createElement("div");
  toolbar.className = "rv-toolbar";
  const filterInput = document.createElement("input");
  filterInput.type = "text";
  filterInput.className = "rv-filter";
  filterInput.placeholder = "Filter by key or value…";
  filterInput.spellcheck = false;
  toolbar.appendChild(filterInput);
  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "lrm-btn";
  refreshBtn.textContent = "Refresh";
  refreshBtn.title = "Re-fetch the snapshot.";
  toolbar.appendChild(refreshBtn);
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "lrm-btn";
  copyBtn.textContent = "Copy JSON";
  copyBtn.title = "Copy snapshot to clipboard.";
  toolbar.appendChild(copyBtn);
  root.appendChild(toolbar);
  const status = document.createElement("div");
  status.className = "rv-status";
  root.appendChild(status);
  const subnav = document.createElement("div");
  subnav.className = "lr-subtabs";
  subnav.setAttribute("role", "tablist");
  root.appendChild(subnav);
  const subnavBtns = new Map;
  for (const def of SUB_TABS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lr-subtab";
    btn.textContent = def.label;
    btn.title = def.title;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.addEventListener("click", () => activateSubTab(def.id));
    subnav.appendChild(btn);
    subnavBtns.set(def.id, btn);
  }
  const body = document.createElement("div");
  body.className = "lr-vars-body";
  root.appendChild(body);
  let activeChatId = null;
  let snapshot = null;
  let filterTerm = "";
  let activeSubTab = "local";
  const editBuffers = new Map;
  const addRow = {
    local: { open: false, name: "", value: "" },
    lumi: { open: false, name: "", value: "" }
  };
  function activateSubTab(id) {
    if (activeSubTab === id)
      return;
    activeSubTab = id;
    log.info(`variables-tab: subtab → ${id}`);
    render();
  }
  function renderSubnav() {
    for (const [id, btn] of subnavBtns) {
      const sel = id === activeSubTab;
      btn.classList.toggle("lr-subtab-active", sel);
      btn.setAttribute("aria-selected", sel ? "true" : "false");
    }
  }
  function renderStatus() {
    if (!activeChatId) {
      status.textContent = "Open a Risu chat to see variables.";
      status.classList.remove("rv-status-error");
      return;
    }
    if (!snapshot || snapshot.chatId !== activeChatId) {
      status.textContent = `Loading variables for chat ${shortId(activeChatId)}…`;
      status.classList.remove("rv-status-error");
      return;
    }
    const t = countTotals(snapshot);
    const ts = formatTime(snapshot.ts);
    status.textContent = `chat ${shortId(snapshot.chatId)} · seq ${snapshot.seq} · ` + `local=${t.local} lumi=${t.global + t.chat} · ` + `updated ${ts}`;
    status.classList.remove("rv-status-error");
  }
  function renderBody() {
    body.replaceChildren();
    if (!activeChatId || !snapshot || snapshot.chatId !== activeChatId) {
      const empty = document.createElement("div");
      empty.className = "rv-empty";
      empty.textContent = activeChatId ? "Waiting for backend…" : "No active Risu chat.";
      body.appendChild(empty);
      return;
    }
    switch (activeSubTab) {
      case "local":
        body.appendChild(renderLocalPanel());
        break;
      case "lumi":
        body.appendChild(renderLumiPanel());
        break;
    }
  }
  function renderLocalPanel() {
    const wrap = document.createElement("section");
    wrap.className = "lr-var-section";
    const note = document.createElement("p");
    note.className = "lr-var-note";
    note.textContent = "Chat-scoped variables. Risu setvar / setChatVar / Lua setState write here. " + "Lua state keys (__name) are JSON-encoded.";
    wrap.appendChild(note);
    const term = filterTerm.toLowerCase();
    const local = snapshot.scopes.local;
    const rows = sortedKeys(local).filter((name) => {
      if (!term)
        return true;
      const v = local[name] ?? "";
      return name.toLowerCase().includes(term) || v.toLowerCase().includes(term);
    });
    const list = document.createElement("div");
    list.className = "lr-var-list";
    if (rows.length === 0 && !addRow.local.open) {
      const empty = document.createElement("div");
      empty.className = "rv-empty";
      empty.textContent = term ? `No matches for "${filterTerm}".` : "(empty)";
      list.appendChild(empty);
    } else {
      for (const name of rows) {
        const value = local[name] ?? "";
        list.appendChild(renderEditableRow({
          subtab: "local",
          name,
          value,
          isLuaState: name.startsWith("__"),
          onCommit: (next) => sendSetLocal(name, next),
          onReset: null,
          allowDelete: true,
          onDelete: () => sendDeleteLocal(name)
        }));
      }
    }
    if (addRow.local.open)
      list.appendChild(renderAddRow("local"));
    wrap.appendChild(list);
    if (!addRow.local.open) {
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "lrm-btn lr-var-add-btn";
      addBtn.textContent = "+ Add variable";
      addBtn.addEventListener("click", () => {
        addRow.local = { open: true, name: "", value: "" };
        render();
      });
      wrap.appendChild(addBtn);
    }
    return wrap;
  }
  function renderLumiPanel() {
    const wrap = document.createElement("section");
    wrap.className = "lr-var-section";
    const note = document.createElement("p");
    note.className = "lr-var-note";
    note.textContent = "Lumi-native scopes (read-only). Most Risu cards don't touch these; " + "surfaced for diagnostics and Lumi-native card interop.";
    wrap.appendChild(note);
    const term = filterTerm.toLowerCase();
    let any = false;
    for (const [label, rec] of [
      ["Global", snapshot.scopes.global],
      ["Chat", snapshot.scopes.chat]
    ]) {
      const keys = sortedKeys(rec).filter((name) => {
        if (!term)
          return true;
        const v = rec[name] ?? "";
        return name.toLowerCase().includes(term) || v.toLowerCase().includes(term);
      });
      const sec = document.createElement("div");
      sec.className = "lr-var-subsection";
      const head = document.createElement("h4");
      head.className = "lr-var-subsection-title";
      head.textContent = `${label} · ${keys.length}${term ? ` of ${Object.keys(rec).length}` : ""}`;
      sec.appendChild(head);
      const list = document.createElement("div");
      list.className = "lr-var-list";
      if (keys.length === 0) {
        const empty = document.createElement("div");
        empty.className = "rv-empty";
        empty.textContent = term ? "(no matches)" : "(empty)";
        list.appendChild(empty);
      } else {
        any = true;
        for (const name of keys) {
          list.appendChild(renderReadonlyRow(name, rec[name] ?? ""));
        }
      }
      sec.appendChild(list);
      wrap.appendChild(sec);
    }
    if (!any && !term) {
      const note2 = document.createElement("div");
      note2.className = "rv-empty";
      note2.textContent = "Both Lumi-native scopes are empty for this chat.";
      wrap.appendChild(note2);
    }
    return wrap;
  }
  function renderEditableRow(o) {
    const row = document.createElement("div");
    row.className = "lr-var-row";
    if (o.isOverride)
      row.classList.add("lr-var-row-overridden");
    const head = document.createElement("div");
    head.className = "lr-var-head";
    const nameEl = document.createElement("span");
    nameEl.className = "lr-var-name";
    nameEl.textContent = o.name;
    nameEl.title = o.name;
    head.appendChild(nameEl);
    if (o.isOverride) {
      const flag = document.createElement("span");
      flag.className = "lr-var-flag";
      flag.textContent = "override";
      flag.title = o.originalValue !== undefined ? `Card default: ${o.originalValue}` : "No card default — override-only.";
      head.appendChild(flag);
    }
    if (o.isLuaState) {
      const flag = document.createElement("span");
      flag.className = "lr-var-flag lr-var-flag-lua";
      flag.textContent = "lua";
      flag.title = "Lua state. Value is JSON-encoded.";
      head.appendChild(flag);
    }
    row.appendChild(head);
    const bufKey = `${o.subtab}:${o.name}`;
    const buffered = editBuffers.get(bufKey);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "lr-var-input";
    input.value = buffered ?? o.value;
    input.spellcheck = false;
    input.addEventListener("input", () => {
      editBuffers.set(bufKey, input.value);
    });
    input.addEventListener("change", commit);
    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
        input.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        input.value = o.value;
        editBuffers.delete(bufKey);
        input.blur();
      }
    });
    row.appendChild(input);
    const actions = document.createElement("span");
    actions.className = "lr-var-actions";
    if (o.onReset) {
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "lr-var-action";
      reset.textContent = "Reset";
      reset.title = o.originalValue !== undefined ? `Restore card default: "${o.originalValue}"` : "Remove this override.";
      reset.addEventListener("click", (e) => {
        e.stopPropagation();
        editBuffers.delete(bufKey);
        o.onReset?.();
      });
      actions.appendChild(reset);
    }
    if (o.allowDelete && o.onDelete) {
      const del = document.createElement("button");
      del.type = "button";
      del.className = "lr-var-action lr-var-action-danger";
      del.textContent = "×";
      del.title = `Delete "${o.name}"`;
      del.setAttribute("aria-label", `Delete ${o.name}`);
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete variable "${o.name}"?

If the character has a default for this key, getChatVar will fall back to it. Otherwise reads return the literal string "null".`))
          return;
        editBuffers.delete(bufKey);
        o.onDelete?.();
      });
      actions.appendChild(del);
    }
    row.appendChild(actions);
    return row;
    function commit() {
      const next = input.value;
      editBuffers.delete(bufKey);
      if (next !== o.value)
        o.onCommit(next);
    }
  }
  function renderReadonlyRow(name, value) {
    const row = document.createElement("div");
    row.className = "lr-var-row lr-var-row-readonly";
    const head = document.createElement("div");
    head.className = "lr-var-head";
    const nameEl = document.createElement("span");
    nameEl.className = "lr-var-name";
    nameEl.textContent = name;
    nameEl.title = name;
    head.appendChild(nameEl);
    row.appendChild(head);
    const valEl = document.createElement("div");
    valEl.className = "lr-var-value-readonly";
    const isLong = value.length > 200 || value.includes(`
`);
    if (!isLong) {
      valEl.textContent = value;
      valEl.title = value;
    } else {
      valEl.textContent = value.slice(0, 200) + "…";
      valEl.title = "Click to expand";
      valEl.classList.add("lr-var-value-long");
      valEl.addEventListener("click", () => {
        if (valEl.classList.contains("lr-var-value-expanded")) {
          valEl.textContent = value.slice(0, 200) + "…";
          valEl.classList.remove("lr-var-value-expanded");
        } else {
          valEl.textContent = value;
          valEl.classList.add("lr-var-value-expanded");
        }
      });
    }
    row.appendChild(valEl);
    return row;
  }
  function renderAddRow(subtab) {
    const wrap = document.createElement("div");
    wrap.className = "lr-var-row lr-var-row-add";
    const buf = addRow[subtab];
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "lr-var-name-input";
    nameInput.placeholder = "name";
    nameInput.value = buf.name;
    nameInput.spellcheck = false;
    nameInput.addEventListener("input", () => {
      buf.name = nameInput.value;
    });
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        valueInput.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    });
    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className = "lr-var-input";
    valueInput.placeholder = "value";
    valueInput.value = buf.value;
    valueInput.spellcheck = false;
    valueInput.addEventListener("input", () => {
      buf.value = valueInput.value;
    });
    valueInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    });
    const actions = document.createElement("span");
    actions.className = "lr-var-actions";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "lr-var-action lr-var-action-primary";
    saveBtn.textContent = "Add";
    saveBtn.addEventListener("click", commit);
    actions.appendChild(saveBtn);
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "lr-var-action";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", cancel);
    actions.appendChild(cancelBtn);
    wrap.appendChild(nameInput);
    wrap.appendChild(valueInput);
    wrap.appendChild(actions);
    queueMicrotask(() => nameInput.focus());
    return wrap;
    function commit() {
      const name = buf.name.trim();
      if (name.length === 0) {
        nameInput.focus();
        return;
      }
      if (subtab === "local")
        sendSetLocal(name, buf.value);
      addRow[subtab] = { open: false, name: "", value: "" };
      render();
    }
    function cancel() {
      addRow[subtab] = { open: false, name: "", value: "" };
      render();
    }
  }
  function sendSetLocal(key, value) {
    if (!activeChatId)
      return;
    log.info(`variables-tab: set_variable chat=${activeChatId} key=${key} len=${value.length}`);
    sendToBackend({
      type: "set_variable",
      chatId: activeChatId,
      scope: "local",
      key,
      value
    });
  }
  function sendDeleteLocal(key) {
    if (!activeChatId)
      return;
    log.info(`variables-tab: delete_variable chat=${activeChatId} key=${key}`);
    sendToBackend({
      type: "delete_variable",
      chatId: activeChatId,
      scope: "local",
      key
    });
  }
  function render() {
    renderSubnav();
    renderStatus();
    renderBody();
  }
  let filterTimer;
  filterInput.addEventListener("input", () => {
    if (filterTimer !== undefined)
      window.clearTimeout(filterTimer);
    filterTimer = window.setTimeout(() => {
      filterTerm = filterInput.value.trim();
      renderBody();
    }, 60);
  });
  refreshBtn.addEventListener("click", () => {
    if (!activeChatId) {
      log.info("variables-tab: refresh clicked but no active chat");
      return;
    }
    log.info(`variables-tab: refresh chat=${activeChatId}`);
    sendToBackend({ type: "request_variables_snapshot", chatId: activeChatId });
  });
  copyBtn.addEventListener("click", () => {
    if (!snapshot)
      return;
    const payload = JSON.stringify(snapshot, null, 2);
    navigator.clipboard?.writeText(payload).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      window.setTimeout(() => {
        copyBtn.textContent = original;
      }, 1200);
    }, (err) => log.warn("variables-tab: copy failed", err));
  });
  function handleBackendMessage(msg) {
    if (msg.type !== "set_variables")
      return;
    log.info(`variables-tab.set_variables: chatId=${msg.chatId} seq=${msg.seq} ts=${msg.ts}`);
    if (snapshot && snapshot.chatId === msg.chatId && snapshot.seq > msg.seq) {
      log.info(`variables-tab: ignoring older snapshot seq=${msg.seq} (have=${snapshot.seq})`);
      return;
    }
    snapshot = {
      chatId: msg.chatId,
      seq: msg.seq,
      scopes: msg.scopes,
      defaults: msg.defaults,
      defaultsCardSide: msg.defaultsCardSide ?? msg.defaults,
      characterId: msg.characterId ?? null,
      ts: msg.ts
    };
    render();
  }
  function setActiveChatId(chatId) {
    if (activeChatId === chatId)
      return;
    log.info(`variables-tab.setActiveChatId: ${activeChatId ?? "null"} -> ${chatId ?? "null"}`);
    activeChatId = chatId;
    editBuffers.clear();
    addRow.local = { open: false, name: "", value: "" };
    if (chatId) {
      if (snapshot && snapshot.chatId !== chatId)
        snapshot = null;
      sendToBackend({ type: "request_variables_snapshot", chatId });
    } else {
      snapshot = null;
    }
    render();
  }
  render();
  log.info("variables-panel: ready");
  return {
    handleBackendMessage,
    setActiveChatId,
    destroy() {
      log.info("variables-panel: destroy");
      try {
        root.replaceChildren();
      } catch {}
    }
  };
}
function sortedKeys(rec) {
  return Object.keys(rec).sort((a, b) => a.localeCompare(b));
}
function shortId(id) {
  return id.length > 12 ? id.slice(0, 8) + "…" : id;
}
function formatTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
function countTotals(snap) {
  return {
    local: Object.keys(snap.scopes.local).length,
    global: Object.keys(snap.scopes.global).length,
    chat: Object.keys(snap.scopes.chat).length
  };
}

// src/ui/searchable-select.ts
var PANEL_GAP = 4;
var PANEL_MAX_HEIGHT = 320;
var nextId = 0;
function createSearchableSelect(opts) {
  const componentId = `lr-ss-${++nextId}`;
  let items = opts.items.slice();
  let value = opts.value ?? null;
  let disabled = false;
  let isOpen = false;
  let activeIndex = -1;
  let searchQuery = "";
  let filtered = items.slice();
  let destroyed = false;
  const root = document.createElement("button");
  root.type = "button";
  root.className = "lr-ss-trigger" + (opts.className ? " " + opts.className : "");
  root.setAttribute("aria-haspopup", "listbox");
  root.setAttribute("aria-expanded", "false");
  root.setAttribute("aria-controls", componentId + "-panel");
  if (opts.id)
    root.id = opts.id;
  const triggerLabel = document.createElement("span");
  triggerLabel.className = "lr-ss-trigger-label";
  root.appendChild(triggerLabel);
  const chevron = document.createElement("span");
  chevron.className = "lr-ss-chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "▾";
  root.appendChild(chevron);
  const panel = document.createElement("div");
  panel.className = "lr-ss-panel";
  panel.id = componentId + "-panel";
  panel.style.display = "none";
  panel.setAttribute("role", "dialog");
  const searchWrap = document.createElement("div");
  searchWrap.className = "lr-ss-search-wrap";
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "lr-ss-search";
  searchInput.placeholder = opts.searchPlaceholder ?? "Search…";
  searchInput.autocomplete = "off";
  searchInput.spellcheck = false;
  searchInput.setAttribute("role", "combobox");
  searchInput.setAttribute("aria-autocomplete", "list");
  searchInput.setAttribute("aria-controls", componentId + "-list");
  searchWrap.appendChild(searchInput);
  panel.appendChild(searchWrap);
  const listEl = document.createElement("ul");
  listEl.className = "lr-ss-list";
  listEl.id = componentId + "-list";
  listEl.setAttribute("role", "listbox");
  panel.appendChild(listEl);
  document.body.appendChild(panel);
  function selectedItem() {
    if (value === null)
      return null;
    return items.find((it) => it.value === value) ?? null;
  }
  function renderTrigger() {
    const sel = selectedItem();
    if (sel) {
      triggerLabel.textContent = sel.label;
      triggerLabel.classList.remove("lr-ss-placeholder");
      if (sel.title)
        root.title = sel.title;
      else
        root.removeAttribute("title");
    } else {
      triggerLabel.textContent = opts.placeholder ?? "Select…";
      triggerLabel.classList.add("lr-ss-placeholder");
      root.removeAttribute("title");
    }
  }
  function applyFilter() {
    const q = searchQuery.trim().toLocaleLowerCase();
    if (q.length === 0) {
      filtered = items.slice();
    } else {
      filtered = items.filter((it) => {
        if (it.label.toLocaleLowerCase().includes(q))
          return true;
        if (it.secondary && it.secondary.toLocaleLowerCase().includes(q))
          return true;
        if (it.group && it.group.toLocaleLowerCase().includes(q))
          return true;
        if (it.value.toLocaleLowerCase().includes(q))
          return true;
        if (it.searchTerms) {
          for (const t of it.searchTerms) {
            if (t.toLocaleLowerCase().includes(q))
              return true;
          }
        }
        return false;
      });
    }
    activeIndex = filtered.length > 0 ? 0 : -1;
  }
  function renderList() {
    listEl.replaceChildren();
    if (filtered.length === 0) {
      const empty = document.createElement("li");
      empty.className = "lr-ss-empty";
      empty.textContent = opts.emptyMessage ?? "No matches";
      listEl.appendChild(empty);
      return;
    }
    let lastGroup;
    for (let i = 0;i < filtered.length; i++) {
      const it = filtered[i];
      if (it.group !== undefined && it.group !== lastGroup) {
        const header = document.createElement("li");
        header.className = "lr-ss-group";
        header.setAttribute("role", "presentation");
        header.textContent = it.group;
        listEl.appendChild(header);
        lastGroup = it.group;
      }
      const li = document.createElement("li");
      li.className = "lr-ss-option";
      li.setAttribute("role", "option");
      li.setAttribute("data-value", it.value);
      li.setAttribute("data-index", String(i));
      if (it.disabled)
        li.setAttribute("aria-disabled", "true");
      if (it.value === value) {
        li.classList.add("lr-ss-option-selected");
        li.setAttribute("aria-selected", "true");
      }
      if (i === activeIndex)
        li.classList.add("lr-ss-option-active");
      if (it.title)
        li.title = it.title;
      const labelEl = document.createElement("span");
      labelEl.className = "lr-ss-option-label";
      labelEl.textContent = it.label;
      li.appendChild(labelEl);
      if (it.secondary) {
        const sec = document.createElement("span");
        sec.className = "lr-ss-option-secondary";
        sec.textContent = it.secondary;
        li.appendChild(sec);
      }
      li.addEventListener("mouseenter", () => {
        if (!it.disabled) {
          activeIndex = i;
          updateActiveHighlight();
        }
      });
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      li.addEventListener("click", () => {
        if (it.disabled)
          return;
        commitSelection(i);
      });
      listEl.appendChild(li);
    }
  }
  function updateActiveHighlight() {
    const options = listEl.querySelectorAll(".lr-ss-option");
    options.forEach((el) => {
      const idx = Number(el.getAttribute("data-index"));
      el.classList.toggle("lr-ss-option-active", idx === activeIndex);
    });
    if (activeIndex >= 0) {
      const target = listEl.querySelector(`.lr-ss-option[data-index="${activeIndex}"]`);
      if (target) {
        const lt = target.offsetTop;
        const lb = lt + target.offsetHeight;
        if (lt < listEl.scrollTop)
          listEl.scrollTop = lt;
        else if (lb > listEl.scrollTop + listEl.clientHeight)
          listEl.scrollTop = lb - listEl.clientHeight;
      }
    }
  }
  function commitSelection(idx) {
    const it = filtered[idx];
    if (!it || it.disabled)
      return;
    value = it.value;
    renderTrigger();
    close();
    opts.onChange(value, it);
  }
  function moveActive(delta) {
    if (filtered.length === 0)
      return;
    let i = activeIndex < 0 ? 0 : activeIndex + delta;
    if (i < 0)
      i = filtered.length - 1;
    if (i >= filtered.length)
      i = 0;
    while (filtered[i] && filtered[i].disabled) {
      i = (i + (delta >= 0 ? 1 : -1) + filtered.length) % filtered.length;
      if (i === activeIndex)
        break;
    }
    activeIndex = i;
    updateActiveHighlight();
  }
  function positionPanel() {
    const r = root.getBoundingClientRect();
    const vh = window.innerHeight;
    const desiredTop = r.bottom + PANEL_GAP;
    const spaceBelow = vh - desiredTop - 8;
    const spaceAbove = r.top - PANEL_GAP - 8;
    const maxH = Math.min(PANEL_MAX_HEIGHT, Math.max(spaceBelow, spaceAbove));
    panel.style.maxHeight = `${maxH}px`;
    panel.style.minWidth = `${r.width}px`;
    panel.style.left = `${r.left}px`;
    if (spaceBelow >= PANEL_MAX_HEIGHT || spaceBelow >= spaceAbove) {
      panel.style.top = `${desiredTop}px`;
      panel.style.bottom = "";
    } else {
      panel.style.top = "";
      panel.style.bottom = `${vh - r.top + PANEL_GAP}px`;
    }
  }
  function open() {
    if (isOpen || disabled)
      return;
    isOpen = true;
    root.setAttribute("aria-expanded", "true");
    searchQuery = "";
    searchInput.value = "";
    applyFilter();
    if (value !== null) {
      const idx = filtered.findIndex((it) => it.value === value);
      if (idx >= 0)
        activeIndex = idx;
    }
    renderList();
    panel.style.display = "flex";
    positionPanel();
    requestAnimationFrame(() => {
      searchInput.focus();
      updateActiveHighlight();
    });
    window.addEventListener("resize", positionPanel, true);
    window.addEventListener("scroll", positionPanel, true);
    document.addEventListener("mousedown", onOutsidePointer, true);
    document.addEventListener("keydown", onDocKeydown, true);
  }
  function close() {
    if (!isOpen)
      return;
    isOpen = false;
    root.setAttribute("aria-expanded", "false");
    panel.style.display = "none";
    window.removeEventListener("resize", positionPanel, true);
    window.removeEventListener("scroll", positionPanel, true);
    document.removeEventListener("mousedown", onOutsidePointer, true);
    document.removeEventListener("keydown", onDocKeydown, true);
    if (document.activeElement === searchInput)
      root.focus({ preventScroll: true });
  }
  function onOutsidePointer(e) {
    const target = e.target;
    if (!target)
      return;
    if (panel.contains(target) || root.contains(target))
      return;
    close();
  }
  function onDocKeydown(e) {
    if (!isOpen)
      return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    applyFilter();
    renderList();
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex < 0 && filtered.length > 0)
        activeIndex = 0;
      if (activeIndex >= 0)
        commitSelection(activeIndex);
    } else if (e.key === "Tab") {
      close();
    } else if (e.key === "Home") {
      e.preventDefault();
      if (filtered.length > 0) {
        activeIndex = 0;
        updateActiveHighlight();
      }
    } else if (e.key === "End") {
      e.preventDefault();
      if (filtered.length > 0) {
        activeIndex = filtered.length - 1;
        updateActiveHighlight();
      }
    }
  });
  root.addEventListener("click", (e) => {
    e.preventDefault();
    if (isOpen)
      close();
    else
      open();
  });
  root.addEventListener("keydown", (e) => {
    if (disabled)
      return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
  renderTrigger();
  return {
    root,
    setItems(next) {
      items = next.slice();
      if (value !== null && !items.some((it) => it.value === value))
        value = null;
      renderTrigger();
      if (isOpen) {
        applyFilter();
        renderList();
      }
    },
    setValue(next) {
      value = next ?? null;
      if (value !== null && !items.some((it) => it.value === value))
        value = null;
      renderTrigger();
      if (isOpen)
        renderList();
    },
    getValue() {
      return value;
    },
    setDisabled(d) {
      disabled = d;
      if (d && isOpen)
        close();
      root.toggleAttribute("disabled", d);
      root.setAttribute("aria-disabled", d ? "true" : "false");
    },
    destroy() {
      if (destroyed)
        return;
      destroyed = true;
      close();
      panel.remove();
    }
  };
}

// src/ui/logs-tab.ts
var LEVEL_OPTIONS = [
  { value: "silent", label: "Silent", title: "Drop everything, including errors. Same as logging off but the master switch stays on." },
  { value: "error", label: "Error", title: "Errors only." },
  { value: "warn", label: "Warn", title: "Errors + warnings." },
  { value: "info", label: "Info (default)", title: "Lifecycle events: chat open/close, import phases, generation start/end, button clicks." },
  { value: "debug", label: "Debug", title: "Per-call internals: resolveReadonly, ensureActiveCardForChat, refreshBgHtml, macroInterceptor enter/exit." },
  { value: "trace", label: "Trace", title: "Everything: WS frame traffic, [macro-tap], per-Lua-call ctx, periodic summaries. Very noisy." }
];
function mountLogsPanel(opts) {
  const { root, sendToBackend, log } = opts;
  log.info("logs-tab: mounting");
  const state = {
    enabled: false,
    includeChatData: false,
    level: "info",
    eventCount: 0,
    bufferBytes: 0,
    lastDownloadAt: null,
    lastError: null
  };
  root.classList.add("lr-logs-panel");
  const wrap = document.createElement("div");
  wrap.className = "lr-logs";
  root.appendChild(wrap);
  const intro = document.createElement("p");
  intro.className = "lr-logs-intro";
  intro.textContent = "Capture diagnostics for a bug report. Download turns logging off.";
  wrap.appendChild(intro);
  const enableRow = makeCheckboxRow({
    id: "lr-logs-enable",
    label: "Enable logging",
    title: "Capture events into a downloadable bundle.",
    onChange: (checked) => {
      sendToBackend({
        type: "log_set_state",
        enabled: checked,
        includeChatData: state.includeChatData,
        level: state.level
      });
    }
  });
  wrap.appendChild(enableRow.row);
  const chatRow = makeCheckboxRow({
    id: "lr-logs-include-chat",
    label: "Include chat data",
    title: "Off: message content and DOM are redacted. On: full chat data captured.",
    onChange: (checked) => {
      sendToBackend({
        type: "log_set_state",
        enabled: state.enabled,
        includeChatData: checked,
        level: state.level
      });
    }
  });
  wrap.appendChild(chatRow.row);
  const levelRow = document.createElement("div");
  levelRow.className = "lr-logs-row";
  const levelLabel = document.createElement("label");
  levelLabel.htmlFor = "lr-logs-level";
  levelLabel.textContent = "Verbosity";
  levelLabel.title = "Threshold for which logs are recorded. Higher levels include lower ones.";
  const levelSelect = createSearchableSelect({
    id: "lr-logs-level",
    className: "lr-logs-trigger",
    placeholder: "Verbosity",
    searchPlaceholder: "Search levels…",
    items: LEVEL_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.label,
      title: opt.title,
      secondary: opt.title
    })),
    onChange(value) {
      if (value === null)
        return;
      const next = value;
      log.info(`logs-tab: level set to ${next}`);
      sendToBackend({
        type: "log_set_state",
        enabled: state.enabled,
        includeChatData: state.includeChatData,
        level: next
      });
    }
  });
  levelRow.appendChild(levelLabel);
  levelRow.appendChild(levelSelect.root);
  wrap.appendChild(levelRow);
  const status = document.createElement("div");
  status.className = "lr-logs-status";
  wrap.appendChild(status);
  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.className = "lr-logs-download";
  downloadBtn.textContent = "Download";
  downloadBtn.title = "Save the bundle and turn logging off.";
  downloadBtn.addEventListener("click", () => {
    if (!state.enabled && state.eventCount === 0) {
      flash("Nothing to download. Enable logging first.");
      return;
    }
    log.info("logs-tab: requesting export");
    sendToBackend({ type: "log_request_export" });
    flash("Preparing bundle…");
  });
  wrap.appendChild(downloadBtn);
  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "lr-logs-clear";
  clearBtn.textContent = "Clear";
  clearBtn.title = "Drop buffered events.";
  clearBtn.addEventListener("click", () => {
    sendToBackend({ type: "log_clear" });
  });
  wrap.appendChild(clearBtn);
  const flashEl = document.createElement("div");
  flashEl.className = "lr-logs-flash";
  wrap.appendChild(flashEl);
  let flashTimer;
  function flash(text) {
    flashEl.textContent = text;
    if (flashTimer !== undefined)
      window.clearTimeout(flashTimer);
    flashTimer = window.setTimeout(() => {
      flashEl.textContent = "";
    }, 6000);
  }
  function render() {
    enableRow.input.checked = state.enabled;
    chatRow.input.checked = state.includeChatData;
    chatRow.input.disabled = !state.enabled;
    chatRow.row.classList.toggle("lr-logs-row-disabled", !state.enabled);
    if (levelSelect.getValue() !== state.level)
      levelSelect.setValue(state.level);
    const kb = (state.bufferBytes / 1024).toFixed(1);
    const levelTxt = `level=${state.level}`;
    status.textContent = state.enabled ? `${state.eventCount} events, ${kb} KB · ${levelTxt}` : `Off. ${state.eventCount} events, ${kb} KB · ${levelTxt}.`;
    if (state.lastError) {
      status.textContent += `  ·  ${state.lastError}`;
    }
  }
  sendToBackend({ type: "log_request_state" });
  render();
  function handleBackendMessage(msg) {
    if (msg.type === "log_state_pushed") {
      state.enabled = msg.enabled;
      state.includeChatData = msg.includeChatData;
      if (msg.level !== undefined)
        state.level = msg.level;
      state.eventCount = msg.eventCount;
      state.bufferBytes = msg.bufferBytes;
      render();
    } else if (msg.type === "log_export_pushed") {
      state.lastDownloadAt = Date.now();
      flash("Bundle downloaded. Logging is off.");
    }
  }
  function destroy() {
    log.info("logs-tab: destroy");
    if (flashTimer !== undefined)
      window.clearTimeout(flashTimer);
    levelSelect.destroy();
    while (root.firstChild)
      root.removeChild(root.firstChild);
  }
  return { handleBackendMessage, destroy };
}
function makeCheckboxRow(opts) {
  const row = document.createElement("div");
  row.className = "lr-logs-row";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = opts.id;
  const label = document.createElement("label");
  label.htmlFor = opts.id;
  label.textContent = opts.label;
  label.title = opts.title;
  input.addEventListener("change", () => opts.onChange(input.checked));
  row.appendChild(input);
  row.appendChild(label);
  return { row, input };
}

// src/ui/virtual-grid.ts
function createVirtualGrid(opts) {
  const host = document.createElement("div");
  if (opts.hostClassName)
    host.className = opts.hostClassName;
  const inner = document.createElement("div");
  if (opts.innerClassName)
    inner.className = opts.innerClassName;
  inner.style.position = "relative";
  host.appendChild(inner);
  const tileNodes = new Map;
  const state = { columns: 1, tileW: 0 };
  const overscan = opts.overscanRows ?? 2;
  const rowH = opts.rowHeight;
  function recomputeLayout() {
    const items = opts.getItems();
    const containerW = host.clientWidth || opts.minTileWidth || 1;
    const minW = opts.minTileWidth ?? Number.POSITIVE_INFINITY;
    state.columns = Math.max(1, Number.isFinite(minW) ? Math.floor(containerW / minW) : 1);
    state.tileW = containerW / state.columns;
    const rows = Math.ceil(items.length / state.columns);
    inner.style.height = `${rows * rowH}px`;
  }
  function placeTile(node, index) {
    const row = Math.floor(index / state.columns);
    const col = index % state.columns;
    node.style.position = "absolute";
    node.style.top = `${row * rowH}px`;
    node.style.left = `${col * state.tileW}px`;
    node.style.width = `${state.tileW}px`;
    node.style.height = `${rowH}px`;
    node.style.boxSizing = "border-box";
  }
  function renderWindow() {
    const items = opts.getItems();
    if (items.length === 0) {
      for (const [, node] of tileNodes)
        node.remove();
      tileNodes.clear();
      return;
    }
    const top = host.scrollTop;
    const bottom = top + (host.clientHeight || 1);
    const totalRows = Math.ceil(items.length / state.columns);
    const startRow = Math.max(0, Math.floor(top / rowH) - overscan);
    const endRow = Math.min(totalRows, Math.ceil(bottom / rowH) + overscan);
    const startIdx = startRow * state.columns;
    const endIdx = Math.min(items.length, endRow * state.columns);
    const wanted = new Set;
    for (let i = startIdx;i < endIdx; i++)
      wanted.add(i);
    if (opts.pinnedIndices) {
      for (const i of opts.pinnedIndices()) {
        if (i >= 0 && i < items.length)
          wanted.add(i);
      }
    }
    for (const [i, node] of tileNodes) {
      if (!wanted.has(i)) {
        node.remove();
        tileNodes.delete(i);
      }
    }
    for (const i of wanted) {
      const existing = tileNodes.get(i);
      if (existing) {
        placeTile(existing, i);
        continue;
      }
      const item = items[i];
      if (item === undefined)
        continue;
      const tile = opts.renderItem(item, i);
      placeTile(tile, i);
      inner.appendChild(tile);
      tileNodes.set(i, tile);
    }
  }
  function rerenderAll() {
    inner.replaceChildren();
    tileNodes.clear();
    recomputeLayout();
    renderWindow();
  }
  let destroyed = false;
  let scrollPending = false;
  let scrollRaf = null;
  const onScroll = () => {
    if (scrollPending)
      return;
    scrollPending = true;
    scrollRaf = requestAnimationFrame(() => {
      scrollPending = false;
      scrollRaf = null;
      if (destroyed)
        return;
      renderWindow();
    });
  };
  host.addEventListener("scroll", onScroll);
  let ro = null;
  let initialRaf = null;
  if (typeof ResizeObserver !== "undefined") {
    let firstObservation = true;
    ro = new ResizeObserver(() => {
      if (destroyed)
        return;
      const prevColumns = state.columns;
      const prevTileW = state.tileW;
      recomputeLayout();
      if (firstObservation || state.columns !== prevColumns || Math.abs(state.tileW - prevTileW) > 0.5) {
        rerenderAll();
        firstObservation = false;
      } else {
        renderWindow();
      }
    });
    ro.observe(host);
  } else {
    initialRaf = requestAnimationFrame(() => {
      initialRaf = null;
      if (destroyed)
        return;
      recomputeLayout();
      renderWindow();
    });
  }
  function invalidate() {
    recomputeLayout();
    renderWindow();
  }
  function refresh() {
    rerenderAll();
  }
  function destroy() {
    destroyed = true;
    if (initialRaf !== null)
      cancelAnimationFrame(initialRaf);
    if (scrollRaf !== null)
      cancelAnimationFrame(scrollRaf);
    host.removeEventListener("scroll", onScroll);
    if (ro)
      ro.disconnect();
    inner.replaceChildren();
    tileNodes.clear();
  }
  return { host, inner, invalidate, refresh, destroy };
}

// src/ui/settings-tab.ts
var SAMPLER_DEFS = [
  { key: "temperature", label: "Temperature", type: "float", min: 0, max: 2, step: 0.01, defaultHint: 1 },
  { key: "maxTokens", label: "Max Response", type: "int", min: 1, max: 128000, step: 1, defaultHint: 16384 },
  { key: "contextSize", label: "Context Size", type: "int", min: 1, max: 2000000, step: 1, defaultHint: 128000 },
  { key: "topP", label: "Top P", type: "float", min: 0, max: 1, step: 0.01, defaultHint: 0.95 },
  { key: "minP", label: "Min P", type: "float", min: 0, max: 1, step: 0.01, defaultHint: 0 },
  { key: "topK", label: "Top K", type: "int", min: 0, max: 500, step: 1, defaultHint: 0 },
  { key: "frequencyPenalty", label: "Freq Penalty", type: "float", min: 0, max: 2, step: 0.01, defaultHint: 0 },
  { key: "presencePenalty", label: "Pres Penalty", type: "float", min: 0, max: 2, step: 0.01, defaultHint: 0 },
  { key: "repetitionPenalty", label: "Rep Penalty", type: "float", min: 0, max: 2, step: 0.01, defaultHint: 0 }
];
function mountSettingsPanel(opts) {
  const { sendToBackend, log } = opts;
  log.info("settings-panel: mounting");
  const root = opts.root;
  root.classList.add("risu-settings-drawer");
  let settings = null;
  let connections = null;
  let lastSavedTs = 0;
  const status = document.createElement("div");
  status.className = "rs-status";
  root.appendChild(status);
  const SUB_TABS2 = [
    { id: "aux", label: "Auxiliary", title: "Aux model, used by Lua's axLLMMain / axLLM calls." },
    { id: "sub", label: "Sub", title: "Submodel, used by V2 runLLM(model='submodel'). Falls back to Aux when empty." },
    { id: "debug", label: "Debug", title: "Capture toggles, parity toggles, and diagnostic logs." },
    { id: "cleanup", label: "Cleanup", title: "Find and delete orphaned image assets that no live character or module references." }
  ];
  const subnav = document.createElement("div");
  subnav.className = "lr-subtabs";
  subnav.setAttribute("role", "tablist");
  root.appendChild(subnav);
  const subnavBtns = new Map;
  for (const def of SUB_TABS2) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lr-subtab";
    btn.textContent = def.label;
    btn.title = def.title;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.addEventListener("click", () => activateSubTab(def.id));
    subnav.appendChild(btn);
    subnavBtns.set(def.id, btn);
  }
  let activeSubTab = "aux";
  const auxBody = document.createElement("section");
  auxBody.className = "lr-settings-tab-body";
  const auxIntro = document.createElement("p");
  auxIntro.className = "lr-settings-intro";
  auxIntro.textContent = "Routes Lua's axLLMMain / axLLM calls through this connection. Useful for status-window updaters / classifiers separate from the main chat model.";
  auxBody.appendChild(auxIntro);
  const connRow = document.createElement("div");
  connRow.className = "rs-row";
  const connLabel = document.createElement("label");
  connLabel.className = "rs-label";
  connLabel.textContent = "Connection";
  connLabel.htmlFor = "rs-aux-conn";
  connRow.appendChild(connLabel);
  const connSelect = createSearchableSelect({
    id: "rs-aux-conn",
    className: "rs-trigger",
    placeholder: "Loading connections…",
    searchPlaceholder: "Search connections…",
    emptyMessage: "No matching connections",
    items: [],
    onChange(value) {
      log.info(`settings-tab: connection changed to "${value ?? "<default>"}"`);
      sendToBackend({
        type: "update_settings",
        patch: { auxConnectionId: value }
      });
    }
  });
  connRow.appendChild(connSelect.root);
  auxBody.appendChild(connRow);
  const modelRow = document.createElement("div");
  modelRow.className = "rs-row";
  const modelLabel = document.createElement("label");
  modelLabel.className = "rs-label";
  modelLabel.textContent = "Model override";
  modelLabel.htmlFor = "rs-aux-model";
  modelRow.appendChild(modelLabel);
  const modelInput = document.createElement("input");
  modelInput.id = "rs-aux-model";
  modelInput.type = "text";
  modelInput.className = "rs-input";
  modelInput.placeholder = "(use connection default)";
  modelInput.spellcheck = false;
  modelRow.appendChild(modelInput);
  auxBody.appendChild(modelRow);
  const buttonRow = document.createElement("div");
  buttonRow.className = "rs-row rs-row-buttons";
  const saveModelBtn = document.createElement("button");
  saveModelBtn.type = "button";
  saveModelBtn.className = "lrm-btn lrm-btn-primary";
  saveModelBtn.textContent = "Save";
  saveModelBtn.title = "Save the model override.";
  buttonRow.appendChild(saveModelBtn);
  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "lrm-btn";
  resetBtn.textContent = "Reset";
  resetBtn.title = "Clear connection and model.";
  buttonRow.appendChild(resetBtn);
  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "lrm-btn";
  refreshBtn.textContent = "Refresh";
  refreshBtn.title = "Re-fetch connection list.";
  buttonRow.appendChild(refreshBtn);
  auxBody.appendChild(buttonRow);
  const samplersSection = document.createElement("div");
  samplersSection.className = "rs-subsection";
  const samplersHeader = document.createElement("div");
  samplersHeader.className = "rs-subsection-header";
  const samplersTitle = document.createElement("h4");
  samplersTitle.className = "rs-subsection-title";
  samplersTitle.textContent = "Samplers";
  samplersTitle.title = "Drag to set, double-click to reset, empty falls back to connection preset.";
  samplersHeader.appendChild(samplersTitle);
  samplersSection.appendChild(samplersHeader);
  const samplersListEl = document.createElement("div");
  samplersListEl.className = "rs-samplers-list";
  samplersSection.appendChild(samplersListEl);
  auxBody.appendChild(samplersSection);
  const subBody = document.createElement("section");
  subBody.className = "lr-settings-tab-body";
  const subIntro = document.createElement("p");
  subIntro.className = "lr-settings-intro";
  subIntro.textContent = "Routes V2-effect runLLM(model='submodel') calls through this connection. Cards use this for lightweight classifiers / status updaters separate from the main and aux models. Empty fields inherit from Aux.";
  subBody.appendChild(subIntro);
  const submodelConnRow = document.createElement("div");
  submodelConnRow.className = "rs-row";
  const submodelConnLabel = document.createElement("label");
  submodelConnLabel.className = "rs-label";
  submodelConnLabel.textContent = "Connection";
  submodelConnLabel.htmlFor = "rs-submodel-conn";
  submodelConnRow.appendChild(submodelConnLabel);
  const submodelConnSelect = createSearchableSelect({
    id: "rs-submodel-conn",
    className: "rs-trigger",
    placeholder: "Loading connections…",
    searchPlaceholder: "Search connections…",
    emptyMessage: "No matching connections",
    items: [],
    onChange(value) {
      log.info(`settings-tab: submodel connection changed to "${value ?? "<inherit-aux>"}"`);
      sendToBackend({
        type: "update_settings",
        patch: { submodelConnectionId: value }
      });
    }
  });
  submodelConnRow.appendChild(submodelConnSelect.root);
  subBody.appendChild(submodelConnRow);
  const submodelModelRow = document.createElement("div");
  submodelModelRow.className = "rs-row";
  const submodelModelLabel = document.createElement("label");
  submodelModelLabel.className = "rs-label";
  submodelModelLabel.textContent = "Model override";
  submodelModelLabel.htmlFor = "rs-submodel-model";
  submodelModelRow.appendChild(submodelModelLabel);
  const submodelModelInput = document.createElement("input");
  submodelModelInput.id = "rs-submodel-model";
  submodelModelInput.type = "text";
  submodelModelInput.className = "rs-input";
  submodelModelInput.placeholder = "(use connection default)";
  submodelModelInput.spellcheck = false;
  submodelModelRow.appendChild(submodelModelInput);
  subBody.appendChild(submodelModelRow);
  const submodelButtonRow = document.createElement("div");
  submodelButtonRow.className = "rs-row rs-row-buttons";
  const submodelSaveModelBtn = document.createElement("button");
  submodelSaveModelBtn.type = "button";
  submodelSaveModelBtn.className = "lrm-btn lrm-btn-primary";
  submodelSaveModelBtn.textContent = "Save";
  submodelSaveModelBtn.title = "Save the model override.";
  submodelButtonRow.appendChild(submodelSaveModelBtn);
  const submodelResetBtn = document.createElement("button");
  submodelResetBtn.type = "button";
  submodelResetBtn.className = "lrm-btn";
  submodelResetBtn.textContent = "Reset";
  submodelResetBtn.title = "Clear submodel fields.";
  submodelButtonRow.appendChild(submodelResetBtn);
  subBody.appendChild(submodelButtonRow);
  const submodelSamplersSection = document.createElement("div");
  submodelSamplersSection.className = "rs-subsection";
  const submodelSamplersHeader = document.createElement("div");
  submodelSamplersHeader.className = "rs-subsection-header";
  const submodelSamplersTitle = document.createElement("h4");
  submodelSamplersTitle.className = "rs-subsection-title";
  submodelSamplersTitle.textContent = "Samplers";
  submodelSamplersTitle.title = "Drag to set, double-click to reset.";
  submodelSamplersHeader.appendChild(submodelSamplersTitle);
  submodelSamplersSection.appendChild(submodelSamplersHeader);
  const submodelSamplersListEl = document.createElement("div");
  submodelSamplersListEl.className = "rs-samplers-list";
  submodelSamplersSection.appendChild(submodelSamplersListEl);
  subBody.appendChild(submodelSamplersSection);
  const debugBody = document.createElement("section");
  debugBody.className = "lr-settings-tab-body";
  const debugIntro = document.createElement("p");
  debugIntro.className = "lr-settings-intro";
  debugIntro.textContent = "Surface aux/submodel call payloads, capture diagnostic logs for bug reports, and tune Risu-parity toggles.";
  debugBody.appendChild(debugIntro);
  const debugCaptureSection = document.createElement("div");
  debugCaptureSection.className = "rs-subsection";
  const debugCaptureHeader = document.createElement("div");
  debugCaptureHeader.className = "rs-subsection-header";
  const debugCaptureTitle = document.createElement("h4");
  debugCaptureTitle.className = "rs-subsection-title";
  debugCaptureTitle.textContent = "Aux/Sub Debug Capture";
  debugCaptureTitle.title = "Surface aux/submodel requests and responses in a corner panel.";
  debugCaptureHeader.appendChild(debugCaptureTitle);
  debugCaptureSection.appendChild(debugCaptureHeader);
  const reqCheckRow = document.createElement("label");
  reqCheckRow.className = "rs-checkbox-row";
  const reqCheck = document.createElement("input");
  reqCheck.type = "checkbox";
  reqCheck.className = "rs-checkbox";
  reqCheck.id = "rs-aux-debug-req";
  reqCheckRow.htmlFor = "rs-aux-debug-req";
  const reqText = document.createElement("span");
  reqText.className = "rs-checkbox-label";
  reqText.textContent = "Capture requests";
  reqText.title = "Show outgoing aux/submodel call payloads in the panel.";
  reqCheckRow.appendChild(reqCheck);
  reqCheckRow.appendChild(reqText);
  debugCaptureSection.appendChild(reqCheckRow);
  const resCheckRow = document.createElement("label");
  resCheckRow.className = "rs-checkbox-row";
  const resCheck = document.createElement("input");
  resCheck.type = "checkbox";
  resCheck.className = "rs-checkbox";
  resCheck.id = "rs-aux-debug-res";
  resCheckRow.htmlFor = "rs-aux-debug-res";
  const resText = document.createElement("span");
  resText.className = "rs-checkbox-label";
  resText.textContent = "Capture responses";
  resText.title = "Show aux/submodel call responses (and errors) in the panel.";
  resCheckRow.appendChild(resCheck);
  resCheckRow.appendChild(resText);
  debugCaptureSection.appendChild(resCheckRow);
  debugBody.appendChild(debugCaptureSection);
  const paritySectionHost = document.createElement("div");
  paritySectionHost.className = "rs-subsection";
  const parityHeader = document.createElement("div");
  parityHeader.className = "rs-subsection-header";
  const parityTitle = document.createElement("h4");
  parityTitle.className = "rs-subsection-title";
  parityTitle.textContent = "Parity toggles";
  parityTitle.title = "Behaviour toggles ported from Risu's Advanced Settings. Flip only if a card needs legacy behaviour.";
  parityHeader.appendChild(parityTitle);
  paritySectionHost.appendChild(parityHeader);
  const legacyMediaRow = document.createElement("label");
  legacyMediaRow.className = "rs-checkbox-row";
  const legacyMediaCheck = document.createElement("input");
  legacyMediaCheck.type = "checkbox";
  legacyMediaCheck.className = "rs-checkbox";
  legacyMediaCheck.id = "rs-legacy-media";
  legacyMediaRow.htmlFor = "rs-legacy-media";
  const legacyMediaText = document.createElement("span");
  legacyMediaText.className = "rs-checkbox-label";
  legacyMediaText.textContent = "Legacy media findings";
  legacyMediaText.title = "Disable the fuzzy-match fallback for asset macros. On = strict exact-match (Risu legacy).";
  legacyMediaRow.appendChild(legacyMediaCheck);
  legacyMediaRow.appendChild(legacyMediaText);
  paritySectionHost.appendChild(legacyMediaRow);
  debugBody.appendChild(paritySectionHost);
  const logsHost = document.createElement("div");
  logsHost.className = "rs-subsection lr-settings-logs-host";
  const logsHeader = document.createElement("div");
  logsHeader.className = "rs-subsection-header";
  const logsTitle = document.createElement("h4");
  logsTitle.className = "rs-subsection-title";
  logsTitle.textContent = "Logs";
  logsTitle.title = "Capture diagnostics for a bug report.";
  logsHeader.appendChild(logsTitle);
  logsHost.appendChild(logsHeader);
  const logsMount = document.createElement("div");
  logsHost.appendChild(logsMount);
  debugBody.appendChild(logsHost);
  const logsHandle = mountLogsPanel({ root: logsMount, sendToBackend, log });
  const cleanupBody = document.createElement("section");
  cleanupBody.className = "lr-settings-tab-body";
  const cleanupIntro = document.createElement("p");
  cleanupIntro.className = "lr-settings-intro";
  cleanupIntro.textContent = "Find image assets owned by LumiRealm that no live character or module references. Orphans typically come from deleting a card while the extension was off, or from interrupted imports.";
  cleanupBody.appendChild(cleanupIntro);
  const cleanupActions = document.createElement("div");
  cleanupActions.className = "rs-row rs-row-buttons";
  const scanBtn = document.createElement("button");
  scanBtn.type = "button";
  scanBtn.className = "lrm-btn lrm-btn-primary";
  scanBtn.textContent = "Scan for orphans";
  scanBtn.title = "Cross-checks every image we own against live characters, modules, and active journals.";
  cleanupActions.appendChild(scanBtn);
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "lrm-btn lrm-btn-danger";
  deleteBtn.textContent = "Delete selected (0)";
  deleteBtn.disabled = true;
  cleanupActions.appendChild(deleteBtn);
  const selectAllBtn = document.createElement("button");
  selectAllBtn.type = "button";
  selectAllBtn.className = "lrm-btn";
  selectAllBtn.textContent = "Select all";
  selectAllBtn.disabled = true;
  cleanupActions.appendChild(selectAllBtn);
  const selectNoneBtn = document.createElement("button");
  selectNoneBtn.type = "button";
  selectNoneBtn.className = "lrm-btn";
  selectNoneBtn.textContent = "Select none";
  selectNoneBtn.disabled = true;
  cleanupActions.appendChild(selectNoneBtn);
  cleanupBody.appendChild(cleanupActions);
  const cleanupSummary = document.createElement("div");
  cleanupSummary.className = "rs-cleanup-summary";
  cleanupSummary.textContent = "No scan run yet.";
  cleanupBody.appendChild(cleanupSummary);
  let cleanupOrphans = [];
  const cleanupSelected = new Set;
  let cleanupScanning = false;
  let cleanupDeleting = false;
  const CLEANUP_ROW_H = 80;
  let cleanupGrid = null;
  function refreshCleanupActionState() {
    const sel = cleanupSelected.size;
    const repairBlocking = repairScanning || repairApplying;
    deleteBtn.textContent = `Delete selected (${sel})`;
    deleteBtn.disabled = sel === 0 || cleanupDeleting || cleanupScanning || repairBlocking;
    selectAllBtn.disabled = cleanupOrphans.length === 0 || cleanupScanning || cleanupDeleting || repairBlocking;
    selectNoneBtn.disabled = sel === 0 || cleanupScanning || cleanupDeleting || repairBlocking;
    scanBtn.disabled = cleanupScanning || cleanupDeleting || repairBlocking;
    scanBtn.textContent = cleanupScanning ? "Scanning…" : "Scan for orphans";
  }
  function renderCleanupRow(o) {
    const row = document.createElement("label");
    row.className = "rs-cleanup-row";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "rs-cleanup-check";
    cb.checked = cleanupSelected.has(o.id);
    cb.addEventListener("change", () => {
      if (cb.checked)
        cleanupSelected.add(o.id);
      else
        cleanupSelected.delete(o.id);
      refreshCleanupActionState();
    });
    row.appendChild(cb);
    const thumb = document.createElement("div");
    thumb.className = "rs-cleanup-thumb";
    if (o.url && (o.mime.startsWith("image/") || o.mime === "")) {
      const img = document.createElement("img");
      img.src = o.url;
      img.alt = o.filename || o.id;
      img.loading = "lazy";
      thumb.appendChild(img);
    } else {
      const ph = document.createElement("span");
      ph.className = "rs-cleanup-thumb-placeholder";
      ph.textContent = o.mime || "?";
      thumb.appendChild(ph);
    }
    row.appendChild(thumb);
    const meta = document.createElement("div");
    meta.className = "rs-cleanup-meta";
    const name = document.createElement("div");
    name.className = "rs-cleanup-name";
    name.textContent = o.filename || "(no filename)";
    name.title = o.filename;
    meta.appendChild(name);
    const sub = document.createElement("div");
    sub.className = "rs-cleanup-sub";
    const subParts = [];
    if (o.mime)
      subParts.push(o.mime);
    if (typeof o.width === "number" && typeof o.height === "number") {
      subParts.push(`${o.width}x${o.height}`);
    }
    if (o.createdAt > 0) {
      const ts = new Date(o.createdAt);
      subParts.push(ts.toLocaleString());
    }
    sub.textContent = subParts.join(" · ");
    meta.appendChild(sub);
    const idLine = document.createElement("div");
    idLine.className = "rs-cleanup-id";
    const ownerHint = o.ownerCharacterId ? `was tagged for character ${o.ownerCharacterId.slice(0, 8)}…` : "no owner tag";
    idLine.textContent = `${o.id.slice(0, 8)}… · ${ownerHint}`;
    idLine.title = `${o.id}${o.ownerCharacterId ? `
owner: ${o.ownerCharacterId}` : ""}`;
    meta.appendChild(idLine);
    row.appendChild(meta);
    return row;
  }
  function ensureCleanupGrid() {
    if (cleanupGrid)
      return cleanupGrid;
    cleanupGrid = createVirtualGrid({
      hostClassName: "rs-cleanup-list",
      innerClassName: "rs-cleanup-list-inner",
      rowHeight: CLEANUP_ROW_H,
      overscanRows: 3,
      getItems: () => cleanupOrphans,
      renderItem: renderCleanupRow
    });
    cleanupBody.appendChild(cleanupGrid.host);
    return cleanupGrid;
  }
  function renderCleanupList() {
    const grid = ensureCleanupGrid();
    grid.refresh();
  }
  function renderCleanupSummary(extra) {
    if (cleanupOrphans.length === 0) {
      cleanupSummary.textContent = extra ?? "No orphans found.";
      return;
    }
    const head = `${cleanupOrphans.length} orphan${cleanupOrphans.length === 1 ? "" : "s"} found.`;
    cleanupSummary.textContent = extra ? `${head} ${extra}` : head;
  }
  scanBtn.addEventListener("click", () => {
    if (cleanupScanning)
      return;
    log.info("settings-tab: orphan scan requested");
    cleanupScanning = true;
    cleanupOrphans = [];
    cleanupSelected.clear();
    cleanupSummary.textContent = "Scanning…";
    if (cleanupGrid)
      cleanupGrid.invalidate();
    refreshCleanupActionState();
    sendToBackend({ type: "request_orphan_scan" });
  });
  selectAllBtn.addEventListener("click", () => {
    for (const o of cleanupOrphans)
      cleanupSelected.add(o.id);
    renderCleanupList();
    refreshCleanupActionState();
  });
  selectNoneBtn.addEventListener("click", () => {
    cleanupSelected.clear();
    renderCleanupList();
    refreshCleanupActionState();
  });
  deleteBtn.addEventListener("click", () => {
    if (cleanupSelected.size === 0 || cleanupDeleting)
      return;
    const count = cleanupSelected.size;
    if (!confirm(`Delete ${count} orphan asset${count === 1 ? "" : "s"}? This cannot be undone.`))
      return;
    log.info(`settings-tab: orphan delete count=${count}`);
    cleanupDeleting = true;
    cleanupSummary.textContent = `Deleting ${count} asset${count === 1 ? "" : "s"}…`;
    refreshCleanupActionState();
    sendToBackend({
      type: "delete_orphan_assets",
      imageIds: Array.from(cleanupSelected)
    });
  });
  const repairSection = document.createElement("div");
  repairSection.className = "rs-repair-section";
  const repairHeader = document.createElement("h3");
  repairHeader.className = "rs-repair-header";
  repairHeader.textContent = "Repair extension state";
  repairSection.appendChild(repairHeader);
  const repairIntro = document.createElement("p");
  repairIntro.className = "lr-settings-intro";
  repairIntro.textContent = "Reconciles regex_scripts rows + image journals + lumirealm envelopes against each other. Use after reinstalling the extension or if cards stop loading correctly.";
  repairSection.appendChild(repairIntro);
  const repairScanBtn = document.createElement("button");
  repairScanBtn.type = "button";
  repairScanBtn.className = "lrm-btn lrm-btn-primary";
  repairScanBtn.textContent = "Scan for problems";
  repairSection.appendChild(repairScanBtn);
  const repairResultBox = document.createElement("div");
  repairResultBox.className = "rs-repair-result";
  repairResultBox.style.display = "none";
  repairSection.appendChild(repairResultBox);
  cleanupBody.appendChild(repairSection);
  const repairChecked = {
    staleCharRegex: true,
    staleModuleRegex: true,
    deadJournals: true,
    forceRetranslate: false
  };
  let repairScanning = false;
  let repairApplying = false;
  let repairLastSummary = null;
  function refreshRepairUi() {
    repairScanBtn.disabled = repairScanning || repairApplying || cleanupScanning || cleanupDeleting;
    repairScanBtn.textContent = repairScanning ? "Scanning…" : "Scan for problems";
    refreshCleanupActionState();
  }
  function renderRepairResult() {
    repairResultBox.replaceChildren();
    const s = repairLastSummary;
    if (!s) {
      repairResultBox.style.display = "none";
      return;
    }
    repairResultBox.style.display = "";
    const total = s.staleCharRegex + s.staleModuleRegex + s.deadJournals;
    const summaryLine = document.createElement("div");
    summaryLine.className = "rs-repair-summary";
    summaryLine.textContent = total === 0 && s.charactersToRetranslate === 0 ? "No issues detected." : `Scan complete (${s.elapsedMs}ms). Pick what to apply:`;
    repairResultBox.appendChild(summaryLine);
    const retranslateLabel = s.charactersToRetranslate === 0 ? "Force re-translate every lumirealm character" : (() => {
      const parts = [`${s.charactersToRetranslate} char${s.charactersToRetranslate === 1 ? "" : "s"}`];
      if (s.modulesToReattach > 0)
        parts.push(`${s.modulesToReattach} module reattach${s.modulesToReattach === 1 ? "" : "es"}`);
      if (s.danglingModuleRefs > 0)
        parts.push(`${s.danglingModuleRefs} dangling ref${s.danglingModuleRefs === 1 ? "" : "s"} to scrub`);
      return `Force re-translate (${parts.join(", ")})`;
    })();
    const rows = [
      { key: "staleCharRegex", label: "Stale character regex rows (envelope gone)", count: s.staleCharRegex, danger: false },
      { key: "staleModuleRegex", label: "Stale module regex rows (module envelope gone)", count: s.staleModuleRegex, danger: false },
      { key: "deadJournals", label: "Dead image journals (owner gone)", count: s.deadJournals, danger: false },
      { key: "forceRetranslate", label: retranslateLabel, count: s.charactersToRetranslate, danger: true }
    ];
    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.className = "lrm-btn lrm-btn-danger";
    applyBtn.textContent = repairApplying ? "Applying…" : "Apply repair";
    const hasApplicableSelection = () => repairChecked.staleCharRegex && s.staleCharRegex > 0 || repairChecked.staleModuleRegex && s.staleModuleRegex > 0 || repairChecked.deadJournals && s.deadJournals > 0 || repairChecked.forceRetranslate && s.charactersToRetranslate > 0;
    const refreshApplyBtn = () => {
      applyBtn.disabled = repairApplying || !hasApplicableSelection();
    };
    for (const r of rows) {
      const row = document.createElement("label");
      row.className = "rs-repair-row";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = repairChecked[r.key];
      cb.disabled = r.count === 0;
      cb.addEventListener("change", () => {
        repairChecked[r.key] = cb.checked;
        refreshApplyBtn();
      });
      row.appendChild(cb);
      const labelText = document.createElement("span");
      labelText.textContent = r.label;
      if (r.count === 0)
        labelText.classList.add("rs-repair-row-empty");
      if (r.danger)
        labelText.classList.add("rs-repair-row-danger");
      row.appendChild(labelText);
      const countSpan = document.createElement("span");
      countSpan.className = "rs-repair-count";
      countSpan.textContent = r.key === "forceRetranslate" ? r.count === 0 ? "—" : `${r.count} chars` : r.count === 0 ? "0" : String(r.count);
      row.appendChild(countSpan);
      repairResultBox.appendChild(row);
    }
    refreshApplyBtn();
    applyBtn.addEventListener("click", () => {
      if (!hasApplicableSelection())
        return;
      const willRetranslate = repairChecked.forceRetranslate && s.charactersToRetranslate > 0;
      const willDeleteRows = repairChecked.staleCharRegex && s.staleCharRegex > 0 || repairChecked.staleModuleRegex && s.staleModuleRegex > 0;
      const parts = [];
      if (repairChecked.staleCharRegex && s.staleCharRegex > 0) {
        parts.push(`delete ${s.staleCharRegex} stale character regex row(s)`);
      }
      if (repairChecked.staleModuleRegex && s.staleModuleRegex > 0) {
        parts.push(`delete ${s.staleModuleRegex} stale module regex row(s)`);
      }
      if (repairChecked.deadJournals && s.deadJournals > 0) {
        parts.push(`clear ${s.deadJournals} dead journal(s)`);
      }
      if (willRetranslate) {
        const retransParts = [`re-translate ${s.charactersToRetranslate} character(s)`];
        if (s.modulesToReattach > 0)
          retransParts.push(`reattach ${s.modulesToReattach} module(s)`);
        if (s.danglingModuleRefs > 0)
          retransParts.push(`scrub ${s.danglingModuleRefs} dangling ref(s)`);
        parts.push(retransParts.join(" + ") + " (slow)");
      }
      if (!confirm(`Apply repair? This will:

• ${parts.join(`
• `)}

${willDeleteRows ? "Deleted rows cannot be recovered. " : ""}${willRetranslate ? "Re-translation may take a while for large libraries." : ""}`)) {
        return;
      }
      log.info(`settings-tab: repair apply ${JSON.stringify(repairChecked)}`);
      repairApplying = true;
      applyBtn.disabled = true;
      applyBtn.textContent = "Applying…";
      sendToBackend({
        type: "apply_repair",
        options: {
          applyStaleCharRegex: repairChecked.staleCharRegex,
          applyStaleModuleRegex: repairChecked.staleModuleRegex,
          applyDeadJournals: repairChecked.deadJournals,
          applyForceRetranslate: repairChecked.forceRetranslate
        }
      });
    });
    repairResultBox.appendChild(applyBtn);
  }
  repairScanBtn.addEventListener("click", () => {
    if (repairScanning || repairApplying)
      return;
    log.info("settings-tab: repair scan requested");
    repairScanning = true;
    repairLastSummary = null;
    repairResultBox.style.display = "none";
    refreshRepairUi();
    sendToBackend({ type: "request_repair_scan" });
  });
  const panelsHost = document.createElement("div");
  panelsHost.className = "lr-subtab-panels";
  panelsHost.appendChild(auxBody);
  panelsHost.appendChild(subBody);
  panelsHost.appendChild(debugBody);
  panelsHost.appendChild(cleanupBody);
  root.appendChild(panelsHost);
  function activateSubTab(id) {
    activeSubTab = id;
    for (const [k, btn] of subnavBtns) {
      const sel = k === id;
      btn.classList.toggle("lr-subtab-active", sel);
      btn.setAttribute("aria-selected", sel ? "true" : "false");
    }
    auxBody.hidden = id !== "aux";
    subBody.hidden = id !== "sub";
    debugBody.hidden = id !== "debug";
    cleanupBody.hidden = id !== "cleanup";
  }
  activateSubTab(activeSubTab);
  function buildConnectionItems(inheritLabel) {
    const items = [];
    items.push({
      value: "",
      label: connections === null ? "Loading connections…" : connections.length === 0 ? "No connections. Set one up in Lumi." : inheritLabel,
      disabled: connections === null || connections.length === 0
    });
    if (connections) {
      for (const c of connections) {
        const modelSuffix = c.model ? ` / ${c.model}` : "";
        const defaultTag = c.is_default ? " [default]" : "";
        items.push({
          value: c.id,
          label: `${c.name}${defaultTag}`,
          secondary: `${c.provider}${modelSuffix}`,
          searchTerms: [c.provider, c.model].filter((s) => !!s)
        });
      }
    }
    return items;
  }
  function renderConnectionSelect() {
    const items = buildConnectionItems("Use default connection");
    const current = settings?.auxConnectionId ?? "";
    if (current && connections && !connections.find((c) => c.id === current)) {
      items.push({
        value: current,
        label: `${current.slice(0, 8)}… (deleted? unknown)`
      });
    }
    connSelect.setItems(items);
    connSelect.setValue(current);
  }
  function renderModelInput() {
    if (!isModelInputFocused()) {
      modelInput.value = settings?.auxModelOverride ?? "";
    }
  }
  function renderSubmodelConnectionSelect() {
    const items = buildConnectionItems("Inherit from Aux Model");
    const current = settings?.submodelConnectionId ?? "";
    if (current && connections && !connections.find((c) => c.id === current)) {
      items.push({
        value: current,
        label: `${current.slice(0, 8)}… (deleted? unknown)`
      });
    }
    submodelConnSelect.setItems(items);
    submodelConnSelect.setValue(current);
  }
  function renderSubmodelModelInput() {
    if (document.activeElement !== submodelModelInput) {
      submodelModelInput.value = settings?.submodelModelOverride ?? "";
    }
  }
  function renderSamplers() {
    samplersListEl.innerHTML = "";
    if (!settings) {
      const placeholder = document.createElement("div");
      placeholder.className = "rs-samplers-placeholder";
      placeholder.textContent = "Loading…";
      samplersListEl.appendChild(placeholder);
      return;
    }
    for (const def of SAMPLER_DEFS) {
      samplersListEl.appendChild(buildSamplerSlider(def, "aux"));
    }
  }
  function renderSubmodelSamplers() {
    submodelSamplersListEl.innerHTML = "";
    if (!settings) {
      const placeholder = document.createElement("div");
      placeholder.className = "rs-samplers-placeholder";
      placeholder.textContent = "Loading…";
      submodelSamplersListEl.appendChild(placeholder);
      return;
    }
    for (const def of SAMPLER_DEFS) {
      submodelSamplersListEl.appendChild(buildSamplerSlider(def, "submodel"));
    }
  }
  function buildSamplerSlider(def, channel) {
    const row = document.createElement("div");
    row.className = "rs-slider-row";
    const header = document.createElement("div");
    header.className = "rs-slider-header";
    const label = document.createElement("span");
    label.className = "rs-slider-label";
    label.textContent = def.label;
    const numInput = document.createElement("input");
    numInput.type = "number";
    numInput.className = "rs-slider-input";
    numInput.min = String(def.min);
    numInput.max = String(def.max);
    numInput.step = String(def.step);
    numInput.placeholder = String(def.defaultHint);
    header.appendChild(label);
    header.appendChild(numInput);
    const track = document.createElement("div");
    track.className = "rs-slider-track";
    track.title = "Drag to set, double-click to reset";
    const fill = document.createElement("div");
    fill.className = "rs-slider-fill";
    const thumb = document.createElement("div");
    thumb.className = "rs-slider-thumb";
    track.appendChild(fill);
    track.appendChild(thumb);
    row.appendChild(header);
    row.appendChild(track);
    const decimals = (String(def.step).split(".")[1] || "").length;
    const snap = (raw) => {
      const clamped = Math.min(def.max, Math.max(def.min, raw));
      const stepped = Math.round((clamped - def.min) / def.step) * def.step + def.min;
      return def.type === "int" ? Math.round(stepped) : parseFloat(stepped.toFixed(decimals));
    };
    const posToValue = (clientX) => {
      const rect = track.getBoundingClientRect();
      if (!rect || rect.width === 0)
        return def.defaultHint;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return snap(def.min + ratio * (def.max - def.min));
    };
    const applyVisual = (displayValue, isSet) => {
      const range = def.max - def.min;
      const pct = range > 0 ? Math.max(0, Math.min(100, (displayValue - def.min) / range * 100)) : 0;
      fill.style.width = `${pct}%`;
      thumb.style.left = `${pct}%`;
      track.classList.toggle("rs-slider-track-set", isSet);
      label.classList.toggle("rs-slider-label-set", isSet);
      numInput.classList.toggle("rs-slider-input-set", isSet);
    };
    const syncFromModel = () => {
      const bag = channel === "aux" ? settings?.auxSamplers : settings?.submodelSamplers;
      const v = bag?.[def.key] ?? null;
      const isSet = v !== null;
      const display = isSet ? v : def.defaultHint;
      if (document.activeElement !== numInput)
        numInput.value = isSet ? String(v) : "";
      applyVisual(display, isSet);
    };
    let dragging = false;
    let dragValue = null;
    track.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      dragging = true;
      try {
        track.setPointerCapture(e.pointerId);
      } catch {}
      dragValue = posToValue(e.clientX);
      applyVisual(dragValue, true);
    });
    track.addEventListener("pointermove", (e) => {
      if (!dragging)
        return;
      dragValue = posToValue(e.clientX);
      applyVisual(dragValue, true);
    });
    track.addEventListener("pointerup", (e) => {
      if (!dragging)
        return;
      dragging = false;
      try {
        track.releasePointerCapture(e.pointerId);
      } catch {}
      if (dragValue !== null) {
        commitSampler(def.key, dragValue, channel);
      }
      dragValue = null;
    });
    track.addEventListener("dblclick", () => {
      commitSampler(def.key, null, channel);
    });
    const commitInput = (raw) => {
      if (raw === "") {
        commitSampler(def.key, null, channel);
        return;
      }
      const num = def.type === "int" ? parseInt(raw, 10) : parseFloat(raw);
      if (Number.isFinite(num)) {
        commitSampler(def.key, snap(num), channel);
      }
    };
    numInput.addEventListener("change", () => commitInput(numInput.value));
    numInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        numInput.blur();
      else if (e.key === "Escape") {
        numInput.blur();
        syncFromModel();
      }
    });
    syncFromModel();
    return row;
  }
  function commitSampler(key, value, channel) {
    if (!settings)
      return;
    const baseBag = channel === "aux" ? settings.auxSamplers : settings.submodelSamplers;
    const next = { ...baseBag, [key]: value };
    log.info(`settings-tab: ${channel} sampler ${key}=${value === null ? "<inherit>" : String(value)}`);
    if (channel === "aux") {
      sendToBackend({ type: "update_settings", patch: { auxSamplers: next } });
    } else {
      sendToBackend({ type: "update_settings", patch: { submodelSamplers: next } });
    }
  }
  function isModelInputFocused() {
    return document.activeElement === modelInput;
  }
  function renderStatus() {
    if (!settings) {
      status.textContent = "Loading…";
      status.classList.remove("rs-status-ok", "rs-status-warn");
      return;
    }
    const parts = [];
    if (settings.auxConnectionId) {
      const conn = connections?.find((c) => c.id === settings.auxConnectionId);
      parts.push(conn ? `Connection: ${conn.name}` : `Connection: ${settings.auxConnectionId.slice(0, 8)}… (unknown)`);
    } else {
      parts.push("Connection: (default)");
    }
    if (settings.auxModelOverride) {
      parts.push(`Model: ${settings.auxModelOverride}`);
    } else {
      parts.push("Model: (use connection default)");
    }
    status.textContent = parts.join(`
`);
    status.classList.add("rs-status-ok");
    status.classList.remove("rs-status-warn");
  }
  function renderDebugChecks() {
    reqCheck.checked = settings?.auxDebugCaptureRequest === true;
    resCheck.checked = settings?.auxDebugCaptureResponse === true;
  }
  function renderParityChecks() {
    legacyMediaCheck.checked = settings?.legacyMediaFindings === true;
  }
  function render() {
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
  saveModelBtn.addEventListener("click", () => {
    const raw = modelInput.value.trim();
    log.info(`settings-tab: model override saved as "${raw}"`);
    sendToBackend({
      type: "update_settings",
      patch: { auxModelOverride: raw === "" ? null : raw }
    });
  });
  modelInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveModelBtn.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      modelInput.value = settings?.auxModelOverride ?? "";
      modelInput.blur();
    }
  });
  resetBtn.addEventListener("click", () => {
    if (!confirm("Reset auxiliary model settings to defaults? Connection, model override, and all samplers will be cleared."))
      return;
    log.info("settings-tab: reset to defaults");
    const clearedSamplers = {
      temperature: null,
      maxTokens: null,
      contextSize: null,
      topP: null,
      minP: null,
      topK: null,
      frequencyPenalty: null,
      presencePenalty: null,
      repetitionPenalty: null
    };
    sendToBackend({
      type: "update_settings",
      patch: {
        auxConnectionId: null,
        auxModelOverride: null,
        auxSamplers: clearedSamplers
      }
    });
  });
  refreshBtn.addEventListener("click", () => {
    log.info("settings-tab: refresh connections clicked");
    connections = null;
    renderConnectionSelect();
    sendToBackend({ type: "request_connections_list" });
  });
  submodelSaveModelBtn.addEventListener("click", () => {
    const raw = submodelModelInput.value.trim();
    log.info(`settings-tab: submodel model override saved as "${raw}"`);
    sendToBackend({
      type: "update_settings",
      patch: { submodelModelOverride: raw === "" ? null : raw }
    });
  });
  submodelModelInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submodelSaveModelBtn.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      submodelModelInput.value = settings?.submodelModelOverride ?? "";
      submodelModelInput.blur();
    }
  });
  submodelResetBtn.addEventListener("click", () => {
    if (!confirm("Reset submodel settings to defaults? Connection, model override, and all submodel samplers will be cleared (falls back to Aux Model)."))
      return;
    log.info("settings-tab: submodel reset to defaults");
    const clearedSamplers = {
      temperature: null,
      maxTokens: null,
      contextSize: null,
      topP: null,
      minP: null,
      topK: null,
      frequencyPenalty: null,
      presencePenalty: null,
      repetitionPenalty: null
    };
    sendToBackend({
      type: "update_settings",
      patch: {
        submodelConnectionId: null,
        submodelModelOverride: null,
        submodelSamplers: clearedSamplers
      }
    });
  });
  reqCheck.addEventListener("change", () => {
    log.info(`settings-tab: auxDebugCaptureRequest=${reqCheck.checked}`);
    sendToBackend({
      type: "update_settings",
      patch: { auxDebugCaptureRequest: reqCheck.checked }
    });
  });
  resCheck.addEventListener("change", () => {
    log.info(`settings-tab: auxDebugCaptureResponse=${resCheck.checked}`);
    sendToBackend({
      type: "update_settings",
      patch: { auxDebugCaptureResponse: resCheck.checked }
    });
  });
  legacyMediaCheck.addEventListener("change", () => {
    log.info(`settings-tab: legacyMediaFindings=${legacyMediaCheck.checked}`);
    sendToBackend({
      type: "update_settings",
      patch: { legacyMediaFindings: legacyMediaCheck.checked }
    });
  });
  sendToBackend({ type: "request_settings" });
  sendToBackend({ type: "request_connections_list" });
  function handleBackendMessage(msg) {
    if (msg.type === "settings_pushed") {
      const setSamplers = Object.entries(msg.settings.auxSamplers).filter(([, v]) => v !== null).map(([k]) => k);
      log.info(`settings-tab: settings_pushed auxConn=${msg.settings.auxConnectionId ?? "<default>"} ` + `auxModel=${msg.settings.auxModelOverride ?? "<connection>"} ` + `samplersSet=[${setSamplers.join(",")}]`);
      settings = {
        auxConnectionId: msg.settings.auxConnectionId,
        auxModelOverride: msg.settings.auxModelOverride,
        auxSamplers: msg.settings.auxSamplers,
        submodelConnectionId: msg.settings.submodelConnectionId,
        submodelModelOverride: msg.settings.submodelModelOverride,
        submodelSamplers: msg.settings.submodelSamplers,
        auxDebugCaptureRequest: msg.settings.auxDebugCaptureRequest,
        auxDebugCaptureResponse: msg.settings.auxDebugCaptureResponse,
        legacyMediaFindings: msg.settings.legacyMediaFindings
      };
      lastSavedTs = Date.now();
      render();
      return;
    }
    if (msg.type === "connections_list_pushed") {
      log.info(`settings-tab: connections_list_pushed count=${msg.connections.length}`);
      connections = msg.connections;
      render();
      return;
    }
    if (msg.type === "open_settings_cleanup") {
      activateSubTab("cleanup");
      if (!cleanupScanning && !cleanupDeleting) {
        log.info("settings-tab: open_settings_cleanup, auto-firing scan");
        cleanupScanning = true;
        cleanupOrphans = [];
        cleanupSelected.clear();
        cleanupSummary.textContent = "Scanning…";
        if (cleanupGrid)
          cleanupGrid.invalidate();
        refreshCleanupActionState();
        sendToBackend({ type: "request_orphan_scan" });
      }
      return;
    }
    if (msg.type === "orphan_scan_started") {
      cleanupScanning = true;
      refreshCleanupActionState();
      return;
    }
    if (msg.type === "orphan_scan_result") {
      cleanupScanning = false;
      cleanupOrphans = msg.orphans;
      cleanupSelected.clear();
      if (msg.error) {
        cleanupSummary.textContent = `Scan failed: ${msg.error}`;
      } else {
        const s = msg.summary;
        const liveTotal = s.liveCharacterRefs + s.liveModuleRefs + s.liveJournalRefs;
        const tail = `Scanned ${s.scannedTotal} owned image${s.scannedTotal === 1 ? "" : "s"} ` + `against ${liveTotal} live ref${liveTotal === 1 ? "" : "s"} ` + `(${s.charactersScanned} char${s.charactersScanned === 1 ? "" : "s"}, ` + `${s.modulesScanned} module${s.modulesScanned === 1 ? "" : "s"}) ` + `in ${s.elapsedMs}ms.`;
        const trunc = s.truncated ? ` Showing the newest ${msg.orphans.length} of ${s.totalOrphans}, delete this batch and re-scan to see the rest.` : "";
        renderCleanupSummary(tail + trunc);
      }
      renderCleanupList();
      refreshCleanupActionState();
      log.info(`settings-tab: orphan_scan_result orphans=${msg.orphans.length} ` + `total=${msg.summary.totalOrphans} truncated=${msg.summary.truncated} ` + `error=${msg.error ?? "<none>"}`);
      return;
    }
    if (msg.type === "orphan_delete_result") {
      cleanupDeleting = false;
      let removedCount = 0;
      if (!msg.error) {
        const skippedSet = new Set(msg.skippedIds);
        const remaining = [];
        for (const o of cleanupOrphans) {
          if (cleanupSelected.has(o.id) && !skippedSet.has(o.id)) {
            removedCount++;
            continue;
          }
          remaining.push(o);
        }
        cleanupOrphans = remaining;
      }
      cleanupSelected.clear();
      const parts = [];
      parts.push(`Requested ${msg.requested}`);
      parts.push(`deleted ${msg.deleted}`);
      if (msg.absent > 0)
        parts.push(`absent ${msg.absent}`);
      if (msg.failed > 0)
        parts.push(`failed ${msg.failed}`);
      if (msg.skipped > 0)
        parts.push(`skipped ${msg.skipped} (became live)`);
      if (msg.error) {
        cleanupSummary.textContent = `Delete failed: ${msg.error} (${parts.join(", ")}).`;
      } else {
        renderCleanupSummary(`${parts.join(", ")}.`);
      }
      renderCleanupList();
      refreshCleanupActionState();
      log.info(`settings-tab: orphan_delete_result removed=${removedCount} ` + `failed=${msg.failed} skipped=${msg.skipped} error=${msg.error ?? "<none>"}`);
      return;
    }
    if (msg.type === "repair_scan_result") {
      repairScanning = false;
      if (msg.error) {
        repairLastSummary = null;
        repairResultBox.style.display = "";
        repairResultBox.replaceChildren();
        const errLine = document.createElement("div");
        errLine.className = "rs-repair-summary rs-repair-error";
        errLine.textContent = `Scan failed: ${msg.error}`;
        repairResultBox.appendChild(errLine);
      } else {
        repairLastSummary = msg.summary;
        renderRepairResult();
      }
      refreshRepairUi();
      log.info(`settings-tab: repair_scan_result ${JSON.stringify(msg.summary)} error=${msg.error ?? "<none>"}`);
      return;
    }
    if (msg.type === "repair_apply_result") {
      repairApplying = false;
      const r = msg.result;
      const parts = [];
      if (r.staleCharRegexDeleted > 0)
        parts.push(`${r.staleCharRegexDeleted} char regex deleted`);
      if (r.staleModuleRegexDeleted > 0)
        parts.push(`${r.staleModuleRegexDeleted} module regex deleted`);
      if (r.deadJournalsCleared > 0)
        parts.push(`${r.deadJournalsCleared} journals cleared`);
      if (r.charactersRetranslated > 0)
        parts.push(`${r.charactersRetranslated} characters re-translated`);
      if (r.charactersSkippedLegacy > 0)
        parts.push(`${r.charactersSkippedLegacy} pre-0.3 cards skipped (need re-import)`);
      if (r.modulesReattached > 0)
        parts.push(`${r.modulesReattached} modules reattached`);
      if (r.modulesScrubbed > 0)
        parts.push(`${r.modulesScrubbed} dangling refs scrubbed`);
      const summary = parts.length === 0 ? "Nothing to repair." : parts.join(", ") + ".";
      repairResultBox.replaceChildren();
      repairResultBox.style.display = "";
      const line = document.createElement("div");
      line.className = msg.error ? "rs-repair-summary rs-repair-error" : "rs-repair-summary";
      line.textContent = msg.error ? `Repair failed: ${msg.error}. ${summary}` : `Repair complete (${r.elapsedMs}ms): ${summary}`;
      repairResultBox.appendChild(line);
      const rescanBtn = document.createElement("button");
      rescanBtn.type = "button";
      rescanBtn.className = "lrm-btn";
      rescanBtn.textContent = "Re-scan";
      rescanBtn.addEventListener("click", () => {
        log.info("settings-tab: repair re-scan after apply");
        repairScanning = true;
        repairLastSummary = null;
        repairResultBox.style.display = "none";
        refreshRepairUi();
        sendToBackend({ type: "request_repair_scan" });
      });
      repairResultBox.appendChild(rescanBtn);
      refreshRepairUi();
      log.info(`settings-tab: repair_apply_result ${JSON.stringify(r)} error=${msg.error ?? "<none>"}`);
      return;
    }
    try {
      logsHandle.handleBackendMessage(msg);
    } catch (err) {
      log.warn("settings-tab: logs panel handler threw:", err);
    }
  }
  render();
  log.info("settings-panel: ready");
  return {
    handleBackendMessage,
    destroy() {
      log.info("settings-panel: destroy");
      try {
        connSelect.destroy();
      } catch {}
      try {
        submodelConnSelect.destroy();
      } catch {}
      try {
        logsHandle.destroy();
      } catch {}
      try {
        cleanupGrid?.destroy();
      } catch {}
      try {
        root.replaceChildren();
      } catch {}
    }
  };
}

// src/ui/browser-translator.ts
var TARGET = "en";
var translatorByPair = null;
var detectorPromise = null;
var resultCache = new Map;
var unavailableLogged = false;
var fallbackDisabled = false;
var fallbackDisabledSubscribers = new Set;
function subscribeFallbackDisabled(cb) {
  fallbackDisabledSubscribers.add(cb);
  return () => fallbackDisabledSubscribers.delete(cb);
}
function disableFallback(reason) {
  if (fallbackDisabled)
    return;
  fallbackDisabled = true;
  console.warn(`[lumirealm] google-translate fallback disabled: ${reason}`);
  for (const cb of fallbackDisabledSubscribers) {
    try {
      cb(reason);
    } catch {}
  }
}
function chromeTranslator() {
  const tr = globalThis.Translator;
  if (tr && typeof tr.create === "function") {
    return tr;
  }
  return null;
}
function chromeLanguageDetector() {
  const d = globalThis.LanguageDetector;
  if (d && typeof d.create === "function") {
    return d;
  }
  return null;
}
async function getDetector() {
  if (detectorPromise)
    return detectorPromise;
  detectorPromise = (async () => {
    const ctor = chromeLanguageDetector();
    if (!ctor)
      return null;
    try {
      const avail = ctor.availability ? await ctor.availability() : "available";
      if (avail === "unavailable")
        return null;
      return await ctor.create();
    } catch {
      return null;
    }
  })();
  return detectorPromise;
}
async function getTranslatorForPair(src, tgt) {
  if (!translatorByPair)
    translatorByPair = new Map;
  const key = `${src}|${tgt}`;
  const existing = translatorByPair.get(key);
  if (existing)
    return existing;
  const promise = (async () => {
    const ctor = chromeTranslator();
    if (!ctor)
      return null;
    try {
      if (ctor.availability) {
        const avail = await ctor.availability({ sourceLanguage: src, targetLanguage: tgt });
        console.info(`[lumirealm] translator ${src}->${tgt} availability=${avail}`);
        if (avail !== "available")
          return null;
      }
      const inst = await ctor.create({ sourceLanguage: src, targetLanguage: tgt });
      console.info(`[lumirealm] translator ${src}->${tgt} created`);
      return inst;
    } catch (err) {
      console.warn(`[lumirealm] translator ${src}->${tgt} create failed:`, err);
      return null;
    }
  })();
  translatorByPair.set(key, promise);
  return promise;
}
function isTranslationAvailable() {
  if (chromeTranslator() !== null)
    return true;
  return !fallbackDisabled;
}
function isUsingFallback() {
  return chromeTranslator() === null && !fallbackDisabled;
}
async function googleTranslateFallback(text, src) {
  const url = "https://translate.googleapis.com/translate_a/single?client=gtx" + `&sl=${encodeURIComponent(src)}&tl=${TARGET}&dt=t&q=${encodeURIComponent(text)}`;
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.warn("[lumirealm] google-translate fetch failed:", err);
    return null;
  }
  if (res.status === 429) {
    disableFallback("rate limited (429)");
    return null;
  }
  if (!res.ok) {
    console.warn(`[lumirealm] google-translate http ${res.status}`);
    return null;
  }
  let data;
  try {
    data = await res.json();
  } catch {
    return null;
  }
  if (!Array.isArray(data) || !Array.isArray(data[0]))
    return null;
  let out = "";
  for (const seg of data[0]) {
    if (Array.isArray(seg) && typeof seg[0] === "string")
      out += seg[0];
  }
  return out;
}
function getTranslator() {
  const haveLocal = chromeTranslator() !== null;
  if (!haveLocal && fallbackDisabled) {
    if (!unavailableLogged) {
      unavailableLogged = true;
      console.info("[lumirealm] browser Translator API unavailable and fallback disabled");
    }
    return null;
  }
  return {
    translateOne: async (text, srcHint) => {
      const trimmed = (text ?? "").trim();
      if (trimmed.length === 0)
        return text;
      const src = srcHint ?? await detectLang(trimmed) ?? "ko";
      if (src === TARGET)
        return text;
      const cacheKey = `${src}|${TARGET}|${text}`;
      const cached = resultCache.get(cacheKey);
      if (cached !== undefined)
        return cached;
      if (haveLocal) {
        const tr = await getTranslatorForPair(src, TARGET);
        if (tr) {
          try {
            const out2 = await tr.translate(text);
            resultCache.set(cacheKey, out2);
            return out2;
          } catch {}
        }
      }
      if (fallbackDisabled) {
        resultCache.set(cacheKey, text);
        return text;
      }
      const out = await googleTranslateFallback(text, src);
      if (out === null) {
        resultCache.set(cacheKey, text);
        return text;
      }
      resultCache.set(cacheKey, out);
      return out;
    }
  };
}
async function detectLang(text) {
  const script = scriptLangFromText(text);
  if (script !== null)
    return script;
  try {
    const det = await getDetector();
    if (!det)
      return null;
    const results = await det.detect(text);
    if (results.length === 0)
      return null;
    const best = results[0].detectedLanguage;
    if (best === "und" || best === "unknown" || best === TARGET)
      return null;
    return best;
  } catch {
    return null;
  }
}
function scriptLangFromText(text) {
  const counts = countForeignScript(text);
  if (counts.hangul > 0)
    return "ko";
  if (counts.kana > 0)
    return "ja";
  if (counts.han > 0)
    return "zh";
  return null;
}
function dominantScriptLang(texts) {
  let hangul = 0, kana = 0, han = 0;
  for (const t of texts) {
    const c = countForeignScript(t);
    hangul += c.hangul;
    kana += c.kana;
    han += c.han;
  }
  if (hangul > 0)
    return "ko";
  if (kana > 0)
    return "ja";
  if (han > 0)
    return "zh";
  return null;
}
function countForeignScript(text) {
  let hangul = 0, kana = 0, han = 0;
  for (let i = 0;i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 44032 && code <= 55203 || code >= 4352 && code <= 4607 || code >= 43360 && code <= 43391 || code >= 55216 && code <= 55295)
      hangul++;
    else if (code >= 12352 && code <= 12447 || code >= 12448 && code <= 12543 || code >= 12784 && code <= 12799)
      kana++;
    else if (code >= 19968 && code <= 40959 || code >= 13312 && code <= 19903)
      han++;
  }
  return { hangul, kana, han };
}

// src/ui/translate-toggle.ts
var lastTranslateEnabled = true;
var subscribers = new Set;
function getTranslateEnabled() {
  return lastTranslateEnabled;
}
function subscribeTranslateEnabled(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
function setupTranslateToggle(opts) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "lr-realm-launcher lr-translate-toggle";
  const label = document.createElement("span");
  btn.appendChild(label);
  let enabled = lastTranslateEnabled;
  let apiAvailable = isTranslationAvailable();
  function paint() {
    label.textContent = `Translate: ${enabled && apiAvailable ? "On" : "Off"}`;
    btn.classList.toggle("lr-translate-toggle-on", enabled && apiAvailable);
    btn.classList.toggle("lr-translate-toggle-disabled", !apiAvailable);
    if (!apiAvailable) {
      btn.title = "Unavaliable. Blame Google Translate.";
    } else if (isUsingFallback()) {
      btn.title = enabled ? "Display module + lorebook names translated via Google Translate." : "Display original names.";
    } else {
      btn.title = enabled ? "Display module + lorebook names in browser-translated form (English)." : "Display original names.";
    }
  }
  function showToast(message) {
    const t = document.createElement("div");
    t.className = "lr-translate-toast";
    t.textContent = message;
    Object.assign(t.style, {
      position: "fixed",
      bottom: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(20,20,20,0.92)",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "13px",
      zIndex: "99999",
      maxWidth: "90vw",
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
    });
    document.body.appendChild(t);
    setTimeout(() => {
      try {
        t.remove();
      } catch {}
    }, 5000);
  }
  function applyEnabled(next, source) {
    if (next === enabled && next === lastTranslateEnabled)
      return;
    enabled = next;
    lastTranslateEnabled = next;
    paint();
    opts.log.info(`translate-toggle: -> ${enabled ? "on" : "off"} (via ${source})`);
    for (const cb of subscribers) {
      try {
        cb(next);
      } catch (err) {
        opts.log.error("translate-toggle: subscriber threw", err);
      }
    }
  }
  paint();
  btn.addEventListener("click", () => {
    if (!apiAvailable)
      return;
    applyEnabled(!enabled, "click");
    opts.sendToBackend({
      type: "update_settings",
      patch: { translateEnabled: enabled }
    });
  });
  if (!apiAvailable) {
    btn.setAttribute("aria-disabled", "true");
    btn.disabled = true;
  }
  opts.mountTarget.appendChild(btn);
  const unsubscribeFallback = subscribeFallbackDisabled((reason) => {
    apiAvailable = false;
    btn.setAttribute("aria-disabled", "true");
    btn.disabled = true;
    if (enabled)
      applyEnabled(false, "click");
    else
      paint();
    opts.log.warn(`translate-toggle: fallback disabled (${reason})`);
    showToast("Translation rate-limited. Translator turned off.");
  });
  opts.sendToBackend({ type: "request_settings" });
  function handleBackendMessage(msg) {
    if (msg.type !== "settings_pushed")
      return;
    const settings = msg.settings;
    if (!("translateEnabled" in settings))
      return;
    applyEnabled(settings.translateEnabled === true, "settings_pushed");
  }
  function destroy() {
    try {
      unsubscribeFallback();
    } catch {}
    try {
      btn.remove();
    } catch {}
  }
  return { handleBackendMessage, destroy };
}

// src/ui/translate-orchestrator.ts
var FLUSH_INTERVAL_MS = 250;
var singleton = null;
function initTranslateOrchestrator(opts) {
  if (singleton !== null)
    return singleton;
  singleton = setupTranslateOrchestrator(opts);
  return singleton;
}
async function translateModuleName(moduleId, name) {
  return singleton?.request({ kind: "module", moduleId }, "name", name, "name") ?? name;
}
async function translateCharacterName(characterId, name) {
  return singleton?.request({ kind: "character", characterId }, "name", name, "name") ?? name;
}
async function translateModuleDescription(moduleId, desc) {
  return singleton?.request({ kind: "module", moduleId }, "description", desc, "description") ?? desc;
}
async function translateLorebookComment(scope, sourceHash, comment) {
  return singleton?.request(scope, sourceHash, comment, "comment") ?? comment;
}
async function translateModuleToggleText(moduleId, original) {
  return singleton?.request({ kind: "module", moduleId }, original, original, "toggle") ?? original;
}
function setModuleScopeLang(moduleId, lang) {
  singleton?.setScopeLang({ kind: "module", moduleId }, lang);
}
function setCharacterScopeLang(characterId, lang) {
  singleton?.setScopeLang({ kind: "character", characterId }, lang);
}
function setupTranslateOrchestrator(opts) {
  const inFlight = new Map;
  const scopeLangs = new Map;
  const moduleBatches = new Map;
  const characterBatches = new Map;
  let timer = null;
  let destroyed = false;
  function scopeBatchKey(scope) {
    return scope.kind === "module" ? `m:${scope.moduleId}` : `c:${scope.characterId}`;
  }
  function inFlightKey(scope, key, original) {
    return `${scopeBatchKey(scope)}|${key}|${original}`;
  }
  function setScopeLang(scope, lang) {
    scopeLangs.set(scopeBatchKey(scope), lang);
  }
  function scheduleFlush() {
    if (destroyed)
      return;
    if (timer !== null)
      return;
    timer = setTimeout(flush, FLUSH_INTERVAL_MS);
  }
  function flush() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    for (const [moduleId, batch] of moduleBatches.entries()) {
      const lorebook = [];
      for (const [hash, comment] of batch.lorebook.entries()) {
        lorebook.push({ sourceHash: hash, comment });
      }
      const toggles = [];
      for (const [original, translated] of batch.toggles.entries()) {
        toggles.push({ original, translated });
      }
      const msg = {
        type: "cache_module_translation",
        moduleId,
        lang: "en",
        ...batch.name !== undefined ? { name: batch.name.translated } : {},
        ...batch.description !== undefined ? { description: batch.description.translated } : {},
        ...lorebook.length > 0 ? { lorebook } : {},
        ...toggles.length > 0 ? { toggles } : {}
      };
      opts.sendToBackend(msg);
    }
    moduleBatches.clear();
    for (const [characterId, batch] of characterBatches.entries()) {
      if (batch.name === undefined && batch.lorebook.size === 0)
        continue;
      const lorebook = [];
      for (const [hash, comment] of batch.lorebook.entries()) {
        lorebook.push({ sourceHash: hash, comment });
      }
      opts.sendToBackend({
        type: "cache_character_translation",
        characterId,
        lang: "en",
        ...batch.name !== undefined ? { name: batch.name.translated } : {},
        ...lorebook.length > 0 ? { lorebook } : {}
      });
    }
    characterBatches.clear();
  }
  function enqueue(scope, key, kind, translated) {
    if (scope.kind === "module") {
      let batch = moduleBatches.get(scope.moduleId);
      if (!batch) {
        batch = { lorebook: new Map, toggles: new Map };
        moduleBatches.set(scope.moduleId, batch);
      }
      if (kind === "name")
        batch.name = { translated };
      else if (kind === "description")
        batch.description = { translated };
      else if (kind === "toggle")
        batch.toggles.set(key, translated);
      else
        batch.lorebook.set(key, translated);
    } else {
      let batch = characterBatches.get(scope.characterId);
      if (!batch) {
        batch = { lorebook: new Map };
        characterBatches.set(scope.characterId, batch);
      }
      if (kind === "name")
        batch.name = { translated };
      else if (kind === "comment")
        batch.lorebook.set(key, translated);
    }
    scheduleFlush();
  }
  async function request(scope, key, original, kind) {
    if (!original || original.trim().length === 0)
      return original;
    const flightKey = inFlightKey(scope, key, original);
    const existing = inFlight.get(flightKey);
    if (existing)
      return existing;
    const translator = getTranslator();
    if (!translator)
      return original;
    const scopeLang = scopeLangs.get(scopeBatchKey(scope));
    if (scopeLang === null)
      return original;
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
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      flush();
      inFlight.clear();
      scopeLangs.clear();
    }
  };
}

// src/ui/modules-tab.ts
var CHUNK_BYTES2 = 2500 * 1024;
var CHUNK_WIRE_WARN_BYTES2 = 3800000;
var INIT_ACK_TIMEOUT_MS2 = 15000;
var CHUNK_ACK_TIMEOUT_MS2 = 20000;
var COMMIT_FIRST_PROGRESS_TIMEOUT_MS2 = 60000;
var UPLOAD_WINDOW_SIZE2 = 30;
var ACCEPT_EXTENSIONS2 = [".risum"];
var liveVizTimers = new Set;
function vizStartTimer(t) {
  t.startedAt = Date.now();
  t.timer = setTimeout(() => {
    t.timer = null;
    if (t.cancelled)
      return;
    liveVizTimers.delete(t);
    t.onFire();
  }, t.remainingMs);
}
function vizSetTimeout(ms, onFire) {
  const t = { remainingMs: ms, startedAt: 0, timer: null, onFire, cancelled: false };
  liveVizTimers.add(t);
  if (typeof document === "undefined" || document.visibilityState === "visible") {
    vizStartTimer(t);
  }
  return t;
}
function vizClearTimeout(t) {
  t.cancelled = true;
  if (t.timer !== null) {
    clearTimeout(t.timer);
    t.timer = null;
  }
  liveVizTimers.delete(t);
}
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const visible = document.visibilityState === "visible";
    for (const t of liveVizTimers) {
      if (t.cancelled)
        continue;
      if (visible && t.timer === null) {
        vizStartTimer(t);
      } else if (!visible && t.timer !== null) {
        const elapsed = Date.now() - t.startedAt;
        t.remainingMs = Math.max(0, t.remainingMs - elapsed);
        clearTimeout(t.timer);
        t.timer = null;
      }
    }
  });
}
function mountModulesPanel(opts) {
  const { sendToBackend, log } = opts;
  log.info("modules-panel: mounting");
  const root = opts.root;
  root.classList.add("lr-modules-drawer");
  let modules = null;
  let cards = [];
  const attachedByCharacter = new Map;
  let activeUpload = null;
  const expandedCharacters = new Set;
  const expandedModules = new Set;
  let lastError = null;
  const SUB_TABS2 = [
    { id: "characters", label: "Characters", title: "Imported Risu cards. Click any row to manage attached modules." },
    { id: "modules", label: "Modules", title: "Module library. Click any row for details / delete." },
    { id: "lorebooks", label: "Lorebooks", title: "Standalone lorebook import. Creates an unattached world_book; attach via Lumiverse." }
  ];
  const subnav = document.createElement("div");
  subnav.className = "lr-subtabs";
  subnav.setAttribute("role", "tablist");
  root.appendChild(subnav);
  const subnavBtns = new Map;
  for (const def of SUB_TABS2) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lr-subtab";
    btn.textContent = def.label;
    btn.title = def.title;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.addEventListener("click", () => activateSubTab(def.id));
    subnav.appendChild(btn);
    subnavBtns.set(def.id, btn);
  }
  let activeSubTab = "characters";
  const charBody = document.createElement("section");
  charBody.className = "lrm-section-body lrm-tab-body";
  const charDesc = document.createElement("div");
  charDesc.className = "lrm-section-desc";
  charDesc.textContent = "Upload Risu character cards (.charx, .png, .json, .jpg/.jpeg). Click any row to manage attached modules. Delete characters through Lumiverse.";
  charBody.appendChild(charDesc);
  const charHeaderSlot = document.createElement("div");
  charHeaderSlot.className = "lrm-character-header-slot";
  charBody.appendChild(charHeaderSlot);
  const charHeaderHandle = opts.mountCharactersHeader ? opts.mountCharactersHeader(charHeaderSlot) : null;
  let charSearchTerm = "";
  const charFilterRow = document.createElement("div");
  charFilterRow.className = "lrm-list-filter";
  const charSearch = document.createElement("input");
  charSearch.type = "search";
  charSearch.className = "lrm-list-search";
  charSearch.placeholder = "Search characters…";
  charSearch.spellcheck = false;
  charFilterRow.appendChild(charSearch);
  const charFilterCount = document.createElement("span");
  charFilterCount.className = "lrm-list-filter-count";
  charFilterRow.appendChild(charFilterCount);
  charBody.appendChild(charFilterRow);
  const charList = document.createElement("div");
  charList.className = "lrm-characters-list";
  charBody.appendChild(charList);
  const libBody = document.createElement("section");
  libBody.className = "lrm-section-body lrm-tab-body";
  const libToolbar = document.createElement("div");
  libToolbar.className = "lrm-toolbar";
  const uploadBtn = document.createElement("button");
  uploadBtn.type = "button";
  uploadBtn.className = "lrm-btn lrm-btn-primary";
  uploadBtn.textContent = "Upload .risum";
  uploadBtn.title = "Pick a .risum module file.";
  libToolbar.appendChild(uploadBtn);
  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "lrm-btn";
  refreshBtn.textContent = "Refresh";
  refreshBtn.title = "Re-fetch the module list.";
  libToolbar.appendChild(refreshBtn);
  libBody.appendChild(libToolbar);
  let moduleSearchTerm = "";
  const libFilterRow = document.createElement("div");
  libFilterRow.className = "lrm-list-filter";
  const moduleSearch = document.createElement("input");
  moduleSearch.type = "search";
  moduleSearch.className = "lrm-list-search";
  moduleSearch.placeholder = "Search modules…";
  moduleSearch.spellcheck = false;
  libFilterRow.appendChild(moduleSearch);
  const libFilterCount = document.createElement("span");
  libFilterCount.className = "lrm-list-filter-count";
  libFilterRow.appendChild(libFilterCount);
  libBody.appendChild(libFilterRow);
  const libList = document.createElement("div");
  libList.className = "lrm-modules-list";
  libBody.appendChild(libList);
  const lorebooksBody = document.createElement("section");
  lorebooksBody.className = "lrm-section-body lrm-tab-body";
  const lbToolbar = document.createElement("div");
  lbToolbar.className = "lrm-toolbar";
  const lbUploadBtn = document.createElement("button");
  lbUploadBtn.type = "button";
  lbUploadBtn.className = "lrm-btn lrm-btn-primary";
  lbUploadBtn.textContent = "Upload lorebook…";
  lbUploadBtn.title = "Pick a Risu native or CCSv3 lorebook JSON file.";
  lbToolbar.appendChild(lbUploadBtn);
  lorebooksBody.appendChild(lbToolbar);
  const lbStatus = document.createElement("div");
  lbStatus.className = "lrm-lorebook-status";
  lorebooksBody.appendChild(lbStatus);
  const panelsHost = document.createElement("div");
  panelsHost.className = "lr-subtab-panels";
  panelsHost.appendChild(charBody);
  panelsHost.appendChild(libBody);
  panelsHost.appendChild(lorebooksBody);
  root.appendChild(panelsHost);
  function activateSubTab(id) {
    activeSubTab = id;
    for (const [k, btn] of subnavBtns) {
      const sel = k === id;
      btn.classList.toggle("lr-subtab-active", sel);
      btn.setAttribute("aria-selected", sel ? "true" : "false");
    }
    charBody.hidden = id !== "characters";
    libBody.hidden = id !== "modules";
    lorebooksBody.hidden = id !== "lorebooks";
  }
  activateSubTab(activeSubTab);
  function setStatus(_msg, _isError = false) {}
  function renderModuleList() {
    libList.replaceChildren();
    if (modules === null) {
      libFilterCount.textContent = "";
      const loading = document.createElement("div");
      loading.className = "lrm-empty";
      loading.textContent = "Loading…";
      libList.appendChild(loading);
      return;
    }
    if (modules.length === 0) {
      libFilterCount.textContent = "";
      const empty = document.createElement("div");
      empty.className = "lrm-empty";
      empty.textContent = "No modules uploaded yet.";
      libList.appendChild(empty);
      return;
    }
    const filtered = moduleSearchTerm.trim().length === 0 ? modules.slice() : modules.filter((m) => matchesSearch(moduleSearchTerm, m.name, m.translatedName, m.id, m.filename));
    libFilterCount.textContent = moduleSearchTerm.trim().length > 0 ? `${filtered.length} of ${modules.length}` : "";
    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lrm-empty";
      empty.textContent = `No matches for "${moduleSearchTerm}".`;
      libList.appendChild(empty);
      return;
    }
    for (const m of filtered) {
      libList.appendChild(renderModuleRow(m));
    }
  }
  function pickModuleDisplayName(m) {
    if (getTranslateEnabled() && m.translatedName)
      return m.translatedName;
    return m.name;
  }
  function pickModuleDisplayDescription(m) {
    if (getTranslateEnabled() && m.translatedDescription)
      return m.translatedDescription;
    return m.description;
  }
  function pickAttachedDisplayName(a) {
    if (getTranslateEnabled() && a.translatedName)
      return a.translatedName;
    return a.name;
  }
  function renderModuleRow(m) {
    const det = document.createElement("details");
    det.className = "lrm-module";
    det.open = expandedModules.has(m.id);
    det.addEventListener("toggle", () => {
      if (det.open)
        expandedModules.add(m.id);
      else
        expandedModules.delete(m.id);
    });
    const sum = document.createElement("summary");
    sum.className = "lrm-module-summary";
    const nameEl = document.createElement("span");
    nameEl.className = "lrm-module-name";
    const displayName = pickModuleDisplayName(m);
    nameEl.textContent = displayName || "(unnamed)";
    nameEl.title = `${m.name}
id: ${m.id}
filename: ${m.filename}`;
    sum.appendChild(nameEl);
    if (getTranslateEnabled() && !m.translatedName && m.name) {
      translateModuleName(m.id, m.name).then((tx) => {
        if (tx && tx !== m.name && nameEl.isConnected) {
          nameEl.textContent = tx;
        }
      });
    }
    const attachedTo = countAttachments(m.id);
    if (attachedTo > 0) {
      const badge = document.createElement("span");
      badge.className = "lrm-module-attached-badge";
      badge.textContent = `${attachedTo} attached`;
      sum.appendChild(badge);
    }
    det.appendChild(sum);
    const body = document.createElement("div");
    body.className = "lrm-module-body";
    const sub = document.createElement("div");
    sub.className = "lrm-module-sub";
    const parts = [];
    if (m.lorebook_count > 0)
      parts.push(`${m.lorebook_count} lore`);
    if (m.regex_count > 0)
      parts.push(`${m.regex_count} regex`);
    if (m.trigger_count > 0)
      parts.push(`${m.trigger_count} trigger`);
    if (m.asset_count > 0)
      parts.push(`${m.asset_count} asset`);
    sub.textContent = parts.join(" · ") || "(empty)";
    body.appendChild(sub);
    if (m.description) {
      const desc = document.createElement("div");
      desc.className = "lrm-module-desc";
      const displayDesc = pickModuleDisplayDescription(m);
      desc.textContent = displayDesc || m.description;
      body.appendChild(desc);
      if (getTranslateEnabled() && !m.translatedDescription) {
        translateModuleDescription(m.id, m.description).then((tx) => {
          if (tx && tx !== m.description && desc.isConnected) {
            desc.textContent = tx;
          }
        });
      }
    }
    const actions = document.createElement("div");
    actions.className = "lrm-module-actions";
    const del = document.createElement("button");
    del.type = "button";
    del.className = "lrm-btn lrm-btn-danger";
    del.textContent = "Delete";
    del.title = `Remove "${displayName}" and detach from all characters.`;
    del.addEventListener("click", () => {
      if (!window.confirm(`Delete module "${displayName}"?`))
        return;
      log.info(`modules-panel: delete_module id=${m.id}`);
      sendToBackend({ type: "delete_module", moduleId: m.id });
    });
    actions.appendChild(del);
    body.appendChild(actions);
    det.appendChild(body);
    return det;
  }
  function countAttachments(moduleId) {
    let n = 0;
    for (const list of attachedByCharacter.values()) {
      if (list.some((a) => a.id === moduleId))
        n += 1;
    }
    return n;
  }
  const attachSelectHandles = [];
  function destroyAttachSelects() {
    for (const h of attachSelectHandles)
      h.destroy();
    attachSelectHandles.length = 0;
  }
  function matchesSearch(term, ...parts) {
    const q = term.trim().toLocaleLowerCase();
    if (q.length === 0)
      return true;
    for (const p of parts) {
      if (p && p.toLocaleLowerCase().includes(q))
        return true;
    }
    return false;
  }
  function renderCharacterList() {
    destroyAttachSelects();
    charList.replaceChildren();
    if (cards.length === 0) {
      charFilterCount.textContent = "";
      const empty = document.createElement("div");
      empty.className = "lrm-empty";
      empty.textContent = "No Risu cards imported yet.";
      charList.appendChild(empty);
      return;
    }
    const filtered = charSearchTerm.trim().length === 0 ? cards.slice() : cards.filter((c) => matchesSearch(charSearchTerm, c.character_name, c.translated_character_name, c.character_id));
    charFilterCount.textContent = charSearchTerm.trim().length > 0 ? `${filtered.length} of ${cards.length}` : "";
    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lrm-empty";
      empty.textContent = `No matches for "${charSearchTerm}".`;
      charList.appendChild(empty);
      return;
    }
    for (const c of filtered) {
      charList.appendChild(renderCharacterRow(c));
    }
  }
  function renderCharacterRow(card) {
    const det = document.createElement("details");
    det.className = "lrm-character";
    det.open = expandedCharacters.has(card.character_id);
    det.addEventListener("toggle", () => {
      if (det.open)
        expandedCharacters.add(card.character_id);
      else
        expandedCharacters.delete(card.character_id);
    });
    const summary = document.createElement("summary");
    summary.className = "lrm-character-summary";
    const summaryName = document.createElement("span");
    summaryName.className = "lrm-character-name";
    const original = card.character_name ?? "(character missing)";
    const useTranslated = getTranslateEnabled() && card.translated_character_name;
    summaryName.textContent = useTranslated ? card.translated_character_name : original;
    if (useTranslated)
      summaryName.title = original;
    summary.appendChild(summaryName);
    if (getTranslateEnabled() && !card.translated_character_name && card.character_name) {
      setCharacterScopeLang(card.character_id, dominantScriptLang([card.character_name]));
      translateCharacterName(card.character_id, card.character_name).then((tx) => {
        if (tx && tx !== card.character_name && summaryName.isConnected) {
          summaryName.textContent = tx;
          summaryName.title = card.character_name ?? "";
        }
      });
    }
    const attachedList = attachedByCharacter.get(card.character_id) ?? [];
    const summaryCount = document.createElement("span");
    summaryCount.className = "lrm-character-count";
    summaryCount.textContent = attachedList.length === 0 ? "manage modules" : `manage modules · ${attachedList.length} attached`;
    summaryCount.title = "Open to attach or detach modules for this character.";
    summary.appendChild(summaryCount);
    det.appendChild(summary);
    const body = document.createElement("div");
    body.className = "lrm-character-body";
    if (attachedList.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lrm-character-empty";
      empty.textContent = "No modules attached to this character.";
      body.appendChild(empty);
    } else {
      const ul = document.createElement("ul");
      ul.className = "lrm-attached-list";
      for (const a of attachedList) {
        const li = document.createElement("li");
        li.className = "lrm-attached-row";
        const label = document.createElement("span");
        label.className = "lrm-attached-name";
        const displayAttached = pickAttachedDisplayName(a);
        label.textContent = displayAttached || a.id;
        li.appendChild(label);
        if (getTranslateEnabled() && !a.translatedName && a.name) {
          translateModuleName(a.id, a.name).then((tx) => {
            if (tx && tx !== a.name && label.isConnected) {
              label.textContent = tx;
            }
          });
        }
        const detach = document.createElement("button");
        detach.type = "button";
        detach.className = "lrm-btn-mini lrm-btn-danger";
        detach.textContent = "Detach";
        detach.title = `Detach "${displayAttached || a.name}" from this character.`;
        detach.addEventListener("click", () => {
          log.info(`modules-panel: detach_module char=${card.character_id} module=${a.id}`);
          sendToBackend({
            type: "detach_module",
            characterId: card.character_id,
            moduleId: a.id
          });
        });
        li.appendChild(detach);
        ul.appendChild(li);
      }
      body.appendChild(ul);
    }
    const attachable = (modules ?? []).filter((m) => !attachedList.some((a) => a.id === m.id)).slice().sort((a, b) => {
      const an = (pickModuleDisplayName(a) || a.id).toLocaleLowerCase();
      const bn = (pickModuleDisplayName(b) || b.id).toLocaleLowerCase();
      return an.localeCompare(bn);
    });
    if (attachable.length > 0) {
      const attachWrap = document.createElement("div");
      attachWrap.className = "lrm-attach-wrap";
      const label = document.createElement("label");
      label.className = "lrm-attach-label";
      label.textContent = "Attach module:";
      const selectId = `lrm-attach-select-${card.character_id}`;
      label.htmlFor = selectId;
      attachWrap.appendChild(label);
      for (const m of attachable) {
        if (getTranslateEnabled() && !m.translatedName && m.name) {
          translateModuleName(m.id, m.name);
        }
      }
      const attachBtn = document.createElement("button");
      attachBtn.type = "button";
      attachBtn.className = "lrm-btn-mini lrm-btn-primary";
      attachBtn.textContent = "Attach";
      attachBtn.title = "Attach the selected module.";
      attachBtn.disabled = true;
      const ss = createSearchableSelect({
        id: selectId,
        className: "lrm-attach-trigger",
        placeholder: `Select a module… (${attachable.length})`,
        searchPlaceholder: "Search modules…",
        emptyMessage: "No matching modules",
        items: attachable.map((m) => {
          const display = pickModuleDisplayName(m) || m.id;
          const aliases = [];
          if (m.name && m.name !== display)
            aliases.push(m.name);
          if (m.translatedName && m.translatedName !== display)
            aliases.push(m.translatedName);
          return {
            value: m.id,
            label: display,
            ...m.translatedName && m.name && m.translatedName !== m.name ? { secondary: m.name } : {},
            ...aliases.length > 0 ? { searchTerms: aliases } : {}
          };
        }),
        onChange(selected) {
          attachBtn.disabled = selected === null;
        }
      });
      attachSelectHandles.push(ss);
      attachWrap.appendChild(ss.root);
      attachBtn.addEventListener("click", () => {
        const moduleId = ss.getValue();
        if (!moduleId)
          return;
        log.info(`modules-panel: attach_module char=${card.character_id} module=${moduleId}`);
        sendToBackend({
          type: "attach_module",
          characterId: card.character_id,
          moduleId
        });
        ss.setValue(null);
        attachBtn.disabled = true;
      });
      attachWrap.appendChild(attachBtn);
      body.appendChild(attachWrap);
    } else if ((modules ?? []).length > 0) {
      const all = document.createElement("div");
      all.className = "lrm-character-empty";
      all.textContent = "Every available module is already attached.";
      body.appendChild(all);
    }
    det.appendChild(body);
    return det;
  }
  function render() {
    renderModuleList();
    renderCharacterList();
    if (lastError)
      setStatus(lastError, true);
  }
  const unsubTranslate = subscribeTranslateEnabled(() => render());
  let charSearchTimer;
  charSearch.addEventListener("input", () => {
    if (charSearchTimer !== undefined)
      window.clearTimeout(charSearchTimer);
    charSearchTimer = window.setTimeout(() => {
      charSearchTerm = charSearch.value;
      renderCharacterList();
    }, 80);
  });
  let moduleSearchTimer;
  moduleSearch.addEventListener("input", () => {
    if (moduleSearchTimer !== undefined)
      window.clearTimeout(moduleSearchTimer);
    moduleSearchTimer = window.setTimeout(() => {
      moduleSearchTerm = moduleSearch.value;
      renderModuleList();
    }, 80);
  });
  uploadBtn.addEventListener("click", () => {
    onUploadClicked();
  });
  refreshBtn.addEventListener("click", () => {
    log.info("modules-panel: refresh clicked");
    sendToBackend({ type: "request_modules" });
  });
  let lorebookImportInFlight = false;
  lbUploadBtn.addEventListener("click", () => {
    onLorebookUploadClicked();
  });
  async function onLorebookUploadClicked() {
    if (lorebookImportInFlight)
      return;
    let file;
    try {
      file = await pickLorebookFile();
    } catch (err) {
      setLorebookStatus(`File pick failed: ${errMsg(err)}`, true);
      return;
    }
    if (!file)
      return;
    let text;
    try {
      text = await file.text();
    } catch (err) {
      setLorebookStatus(`Read failed: ${errMsg(err)}`, true);
      return;
    }
    lorebookImportInFlight = true;
    lbUploadBtn.disabled = true;
    setLorebookStatus(`Importing "${file.name}" (${(text.length / 1024).toFixed(1)} KB)…`, false);
    log.info(`modules-panel: import_lorebook standalone file=${file.name} bytes=${text.length}`);
    sendToBackend({
      type: "import_lorebook",
      characterId: null,
      json: text,
      filename: file.name
    });
  }
  function setLorebookStatus(msg, isError) {
    lbStatus.textContent = msg;
    lbStatus.classList.toggle("lrm-lorebook-status-error", isError);
  }
  async function onUploadClicked() {
    if (uploadBtn.disabled)
      return;
    log.info("modules-panel: upload clicked");
    let file = null;
    try {
      file = await pickViaInput();
    } catch (err) {
      log.error("modules-panel: file pick failed", err);
      lastError = `File pick failed: ${errMsg(err)}`;
      render();
      return;
    }
    if (!file) {
      log.info("modules-panel: pick dismissed");
      return;
    }
    lastError = null;
    setStatus(`Uploading ${file.name}…`);
    uploadBtn.disabled = true;
    const sessionId = generateSessionId2();
    const totalBytes = file.bytes.byteLength;
    const totalChunks = Math.max(1, Math.ceil(totalBytes / CHUNK_BYTES2));
    log.info(`modules-panel: upload session=${sessionId} file=${file.name} bytes=${totalBytes} chunks=${totalChunks}`);
    activeUpload = {
      sessionId,
      lastAckSeq: -999,
      receivedBytesOnBackend: 0,
      pendingAcks: new Map,
      aborted: false
    };
    const session = activeUpload;
    opts.onImportStart?.(file.name, () => {
      if (!session.aborted) {
        session.aborted = true;
        log.info(`modules-panel: cancel requested session=${sessionId}`);
        rejectAllPending(session, new Error("upload cancelled"));
      }
    }, totalBytes);
    try {
      sendToBackend({
        type: "upload_module_init",
        sessionId,
        fileName: file.name,
        totalBytes,
        totalChunks
      });
      await trackAck(session, -1, INIT_ACK_TIMEOUT_MS2, "init");
      let completed = 0;
      let nextSeq = 0;
      const errors = [];
      const sendOne = async () => {
        while (true) {
          if (session.aborted || errors.length > 0)
            return;
          const seq = nextSeq++;
          if (seq >= totalChunks)
            return;
          const start = seq * CHUNK_BYTES2;
          const end = Math.min(start + CHUNK_BYTES2, totalBytes);
          const slice = file.bytes.subarray(start, end);
          const b64 = bytesToBase642(slice);
          const chunkMsg = {
            type: "upload_module_chunk",
            sessionId,
            seq,
            bytesB64Chunk: b64
          };
          const wireSize = JSON.stringify(chunkMsg).length;
          if (wireSize > CHUNK_WIRE_WARN_BYTES2) {
            log.warn(`modules-panel: chunk wire size ${wireSize}B approaches Lumi's 64KB inbound guard ` + `(seq=${seq} of ${totalChunks}, raw_chunk=${slice.byteLength}B, b64=${b64.length}B).`);
          }
          const ack = trackAck(session, seq, CHUNK_ACK_TIMEOUT_MS2, `chunk ${seq}`);
          sendToBackend(chunkMsg);
          try {
            await ack;
          } catch (err) {
            errors.push(err);
            return;
          }
          completed += 1;
          setStatus(`Uploading ${file.name}… (${completed}/${totalChunks})`);
        }
      };
      const workers = [];
      for (let w = 0;w < Math.min(UPLOAD_WINDOW_SIZE2, totalChunks); w++) {
        workers.push(sendOne());
      }
      await Promise.all(workers);
      if (errors.length > 0)
        throw errors[0];
      if (session.aborted)
        throw new Error("upload aborted");
      setStatus("Processing on server…");
      sendToBackend({ type: "upload_module_commit", sessionId });
      await trackAck(session, -2, COMMIT_FIRST_PROGRESS_TIMEOUT_MS2, "commit");
      setStatus(null);
    } catch (err) {
      log.error("modules-panel: upload failed", err);
      try {
        sendToBackend({ type: "upload_module_abort", sessionId, reason: errMsg(err) });
      } catch {}
      lastError = `Upload failed: ${errMsg(err)}`;
      setStatus(lastError, true);
    } finally {
      rejectAllPending(session, new Error("session ended"));
      if (activeUpload?.sessionId === sessionId)
        activeUpload = null;
      uploadBtn.disabled = false;
    }
  }
  function trackAck(session, seq, timeoutMs, label) {
    if (session.lastAckSeq === seq)
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timer = vizSetTimeout(timeoutMs, () => {
        if (session.pendingAcks.delete(seq)) {
          session.aborted = true;
          reject(new Error(`timeout waiting for ${label} ack after ${timeoutMs}ms (visible time)`));
        }
      });
      session.pendingAcks.set(seq, { resolve, reject, timer });
    });
  }
  function rejectAllPending(session, err) {
    for (const [seq, p] of session.pendingAcks) {
      vizClearTimeout(p.timer);
      p.reject(err);
      session.pendingAcks.delete(seq);
    }
  }
  function onUploadAck(sessionId, seq, receivedBytes) {
    const session = activeUpload;
    if (!session || session.sessionId !== sessionId)
      return;
    session.lastAckSeq = seq;
    session.receivedBytesOnBackend = receivedBytes;
    const p = session.pendingAcks.get(seq);
    if (p) {
      session.pendingAcks.delete(seq);
      vizClearTimeout(p.timer);
      p.resolve();
    }
  }
  function handleBackendMessage(msg) {
    if (charHeaderHandle) {
      try {
        charHeaderHandle.handleBackendMessage(msg);
      } catch (err) {
        log.warn("characters header handler threw:", err);
      }
    }
    switch (msg.type) {
      case "cards_updated":
        cards = msg.cards;
        render();
        break;
      case "modules_pushed":
        modules = msg.modules;
        for (const m of modules) {
          setModuleScopeLang(m.id, dominantScriptLang([m.name, m.description]));
        }
        if (msg.attached_by_character) {
          for (const [charId, list] of Object.entries(msg.attached_by_character)) {
            attachedByCharacter.set(charId, list);
          }
        }
        render();
        break;
      case "attached_modules_pushed":
        attachedByCharacter.set(msg.characterId, msg.attached);
        render();
        break;
      case "module_upload_ack":
        onUploadAck(msg.sessionId, msg.seq, msg.receivedBytes);
        break;
      case "lorebook_import_result":
        if (msg.characterId === null) {
          lorebookImportInFlight = false;
          lbUploadBtn.disabled = false;
          if (msg.ok) {
            const nameSuffix = msg.worldBookName ? ` as "${msg.worldBookName}"` : "";
            const dropSuffix = msg.dropped > 0 ? ` (${msg.dropped} dropped)` : "";
            setLorebookStatus(`Imported ${msg.written} entr${msg.written === 1 ? "y" : "ies"}${nameSuffix}${dropSuffix}. Attach via Lumiverse to use.`, false);
          } else {
            setLorebookStatus(msg.reason ?? "Import failed.", true);
          }
        }
        break;
      case "error":
        if (activeUpload && msg.sessionId === activeUpload.sessionId) {
          rejectAllPending(activeUpload, new Error(msg.message));
        }
        if (lastError === null) {
          lastError = msg.message;
          setStatus(lastError, true);
        }
        break;
    }
  }
  function destroy() {
    log.info("modules-panel: destroy");
    destroyAttachSelects();
    if (charHeaderHandle) {
      try {
        charHeaderHandle.destroy();
      } catch {}
    }
    try {
      unsubTranslate();
    } catch {}
    try {
      root.replaceChildren();
    } catch {}
  }
  sendToBackend({ type: "get_cards" });
  sendToBackend({ type: "request_modules" });
  render();
  log.info("modules-panel: ready");
  return { handleBackendMessage, destroy };
}
function pickViaInput() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPT_EXTENSIONS2.join(",");
    input.style.display = "none";
    document.body.appendChild(input);
    let settled = false;
    const done = (result, err) => {
      if (settled)
        return;
      settled = true;
      try {
        document.body.removeChild(input);
      } catch {}
      if (err)
        reject(err);
      else
        resolve(result);
    };
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file)
        return done(null);
      file.arrayBuffer().then((ab) => done({ name: file.name, bytes: new Uint8Array(ab) }), (err) => done(null, err));
    });
    input.addEventListener("cancel", () => done(null));
    input.click();
  });
}
function pickLorebookFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.lorebook,application/json";
    input.style.display = "none";
    document.body.appendChild(input);
    let settled = false;
    const done = (f, err) => {
      if (settled)
        return;
      settled = true;
      try {
        document.body.removeChild(input);
      } catch {}
      if (err)
        reject(err);
      else
        resolve(f);
    };
    input.addEventListener("change", () => {
      const list = input.files;
      done(list && list.length > 0 ? list.item(0) : null);
    });
    input.addEventListener("cancel", () => done(null));
    input.click();
  });
}
function bytesToBase642(bytes) {
  let binary = "";
  const chunk = 32768;
  for (let i = 0;i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
function generateSessionId2() {
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (c?.randomUUID)
    return c.randomUUID();
  return `mod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// src/realm/markdown.ts
var ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
  "span",
  "div"
]);
var DROP_TAGS = new Set([
  "style",
  "script",
  "noscript",
  "template",
  "iframe",
  "object",
  "embed",
  "head",
  "title",
  "meta",
  "link",
  "base"
]);
var ALLOWED_ATTRS_PER_TAG = {
  a: new Set(["href", "title"]),
  img: new Set(["src", "alt", "title"])
};
var ALLOWED_URL_SCHEMES = new Set(["http:", "https:", "mailto:"]);
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function inlineMarkdown(input) {
  let out = input;
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
    return `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
  });
  out = out.replace(/`([^`\n]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`);
  out = out.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__([^_\n]+)__/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  out = out.replace(/(^|\W)_([^_\n]+)_(?=\W|$)/g, "$1<em>$2</em>");
  out = out.replace(/~~([^~\n]+)~~/g, "<del>$1</del>");
  return out;
}
function blockMarkdownToHtml(input) {
  if (!input)
    return "";
  if (containsHtmlTags(input))
    return input;
  const lines = input.replace(/\r\n?/g, `
`).split(`
`);
  const out = [];
  let i = 0;
  let para = [];
  const flushPara = () => {
    if (para.length === 0)
      return;
    const joined = para.join(`
`).trim();
    if (joined) {
      const withBreaks = joined.replace(/\n/g, "<br>");
      out.push(`<p>${inlineMarkdown(escapeHtml(withBreaks).replace(/&lt;br&gt;/g, "<br>"))}</p>`);
    }
    para = [];
  };
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      flushPara();
      i += 1;
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading && heading[1] && heading[2] !== undefined) {
      flushPara();
      const level = heading[1].length;
      out.push(`<h${level}>${inlineMarkdown(escapeHtml(heading[2]))}</h${level}>`);
      i += 1;
      continue;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushPara();
      out.push("<hr>");
      i += 1;
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      flushPara();
      const buf = [];
      while (i < lines.length && /^>\s?/.test((lines[i] ?? "").trim())) {
        buf.push((lines[i] ?? "").trim().replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote>${inlineMarkdown(escapeHtml(buf.join(`
`).replace(/\n/g, "<br>")).replace(/&lt;br&gt;/g, "<br>"))}</blockquote>`);
      continue;
    }
    const ulMatch = /^(?:[-*+])\s+(.*)$/.exec(trimmed);
    const olMatch = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (ulMatch || olMatch) {
      flushPara();
      const isOrdered = !!olMatch;
      const items = [];
      while (i < lines.length) {
        const cur = (lines[i] ?? "").trim();
        const m = isOrdered ? /^\d+\.\s+(.*)$/.exec(cur) : /^(?:[-*+])\s+(.*)$/.exec(cur);
        if (!m)
          break;
        items.push(`<li>${inlineMarkdown(escapeHtml(m[1] ?? ""))}</li>`);
        i += 1;
      }
      out.push(`<${isOrdered ? "ol" : "ul"}>${items.join("")}</${isOrdered ? "ol" : "ul"}>`);
      continue;
    }
    para.push(line);
    i += 1;
  }
  flushPara();
  return out.join(`
`);
}
function containsHtmlTags(s) {
  return /<[a-z][a-z0-9-]*(\s|>|\/)/i.test(s);
}
function isAllowedUrl(url) {
  try {
    const trimmed = url.trim();
    if (trimmed.startsWith("#") || trimmed.startsWith("/"))
      return true;
    const parsed = new URL(trimmed, "https://example.invalid/");
    return ALLOWED_URL_SCHEMES.has(parsed.protocol);
  } catch {
    return false;
  }
}
function sanitizeNode(input, target, doc) {
  const node = input;
  if (node.nodeType === Node.TEXT_NODE) {
    target.appendChild(doc.createTextNode(node.data));
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE)
    return;
  const el = node;
  const tagName = el.tagName.toLowerCase();
  if (DROP_TAGS.has(tagName))
    return;
  if (!ALLOWED_TAGS.has(tagName)) {
    for (const child of Array.from(el.childNodes)) {
      sanitizeNode(child, target, doc);
    }
    return;
  }
  const cleanEl = doc.createElement(tagName);
  const allowedAttrs = ALLOWED_ATTRS_PER_TAG[tagName];
  if (allowedAttrs) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (!allowedAttrs.has(name))
        continue;
      if (name === "href" || name === "src") {
        if (!isAllowedUrl(attr.value))
          continue;
      }
      cleanEl.setAttribute(name, attr.value);
    }
  }
  if (tagName === "a") {
    cleanEl.setAttribute("rel", "noopener noreferrer nofollow");
    cleanEl.setAttribute("target", "_blank");
  }
  if (tagName === "img") {
    cleanEl.setAttribute("loading", "lazy");
    cleanEl.setAttribute("referrerpolicy", "no-referrer");
  }
  for (const child of Array.from(el.childNodes)) {
    sanitizeNode(child, cleanEl, doc);
  }
  target.appendChild(cleanEl);
}
function renderDescription(raw) {
  const doc = document;
  const frag = doc.createDocumentFragment();
  if (!raw)
    return frag;
  const html = blockMarkdownToHtml(raw);
  const parsed = new DOMParser().parseFromString(`<div id="root">${html}</div>`, "text/html");
  const sourceRoot = parsed.getElementById("root");
  if (!sourceRoot) {
    frag.appendChild(doc.createTextNode(raw));
    return frag;
  }
  const wrapper = doc.createElement("div");
  for (const child of Array.from(sourceRoot.childNodes)) {
    sanitizeNode(child, wrapper, doc);
  }
  for (const child of Array.from(wrapper.childNodes)) {
    frag.appendChild(child);
  }
  return frag;
}

// src/ui/viewer-tab.ts
var MAX_ASSET_MB = 50;
var MAX_ASSET_BYTES = MAX_ASSET_MB * 1024 * 1024;
function mountViewerPanel(opts) {
  const { sendToBackend, log } = opts;
  log.info("viewer-panel: mounting");
  const root = opts.root;
  root.classList.add("lr-viewer-drawer");
  let cards = [];
  let modules = [];
  let selectedSourceKey = null;
  let viewerData = null;
  let loading = false;
  let lastError = null;
  let activeSubTab = "notes";
  let activeCharacterId = null;
  let pendingAutoSwitch = false;
  const ASSET_TILE_MIN_W = 140;
  const ASSET_TILE_H = 220;
  const ASSET_OVERSCAN_ROWS = 2;
  let assetSearchTerm = "";
  let assetPagesShown = 1;
  const attachedByCharacter = new Map;
  let assetUploadStatus = null;
  let renamingAssetName = null;
  let editingTriggerIndex = null;
  let editingTriggerLua = "";
  let defaultsTextBuffer = null;
  let bgHtmlTextBuffer = null;
  const intro = document.createElement("p");
  intro.className = "lrv-intro";
  intro.textContent = "Inspect, HTML, triggers, and assets for a character or module.";
  root.appendChild(intro);
  const toolbar = document.createElement("div");
  toolbar.className = "lrv-toolbar";
  const sourceLabel = document.createElement("label");
  sourceLabel.className = "lrv-source-label";
  sourceLabel.textContent = "Source:";
  toolbar.appendChild(sourceLabel);
  sourceLabel.htmlFor = "lrv-source-select";
  const sourceSelect = createSearchableSelect({
    id: "lrv-source-select",
    className: "lrv-source-trigger",
    placeholder: "(no characters or modules)",
    searchPlaceholder: "Search characters and modules…",
    emptyMessage: "No matches",
    items: [],
    onChange(next) {
      if (next === null)
        return;
      selectedSourceKey = next;
      const o = parseSourceKey(next);
      if (o)
        requestForSelection(o);
    }
  });
  toolbar.appendChild(sourceSelect.root);
  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "lrm-btn";
  refreshBtn.textContent = "Refresh";
  refreshBtn.title = "Re-fetch the selected source.";
  toolbar.appendChild(refreshBtn);
  const currentBtn = document.createElement("button");
  currentBtn.type = "button";
  currentBtn.className = "lrv-current-btn";
  currentBtn.textContent = "Current";
  currentBtn.title = "Switch to the character of the open chat.";
  currentBtn.addEventListener("click", () => {
    if (!activeCharacterId)
      return;
    selectToCharacter(activeCharacterId, "click");
  });
  toolbar.appendChild(currentBtn);
  function updateCurrentBtn() {
    const inLibrary = !!activeCharacterId && cards.some((c) => c.character_id === activeCharacterId);
    currentBtn.disabled = !inLibrary;
    currentBtn.style.display = activeCharacterId ? "" : "none";
  }
  function selectToCharacter(characterId, reason) {
    if (!cards.some((c) => c.character_id === characterId))
      return false;
    const key = `character::${characterId}`;
    if (selectedSourceKey === key)
      return true;
    log.info(`viewer-panel: select character=${characterId} reason=${reason}`);
    selectedSourceKey = key;
    sourceSelect.setValue(key);
    const o = parseSourceKey(key);
    if (o)
      requestForSelection(o);
    return true;
  }
  root.appendChild(toolbar);
  const status = document.createElement("div");
  status.className = "lrv-status";
  root.appendChild(status);
  const surfaceHost = document.createElement("div");
  surfaceHost.className = "lrv-surfaces";
  root.appendChild(surfaceHost);
  function rebuildSourceSelect() {
    const prev = selectedSourceKey;
    const options = [];
    const items = [];
    const translate = getTranslateEnabled();
    for (const c of cards) {
      const attached = attachedByCharacter.get(c.character_id) ?? [];
      const suffix = attached.length > 0 ? ` (+${attached.length} module${attached.length === 1 ? "" : "s"})` : "";
      const display = translate && c.translated_character_name ? c.translated_character_name : c.character_name ?? "(missing)";
      const o = {
        kind: "character",
        id: c.character_id,
        label: `${display}${suffix}`
      };
      options.push(o);
      const charAliases = [];
      if (c.character_name && c.character_name !== display)
        charAliases.push(c.character_name);
      if (c.translated_character_name && c.translated_character_name !== display)
        charAliases.push(c.translated_character_name);
      items.push({
        value: sourceKey(o),
        label: `${display}${suffix}`,
        group: "Characters",
        ...translate && c.translated_character_name && c.character_name && c.translated_character_name !== c.character_name ? { secondary: c.character_name } : {},
        ...charAliases.length > 0 ? { searchTerms: charAliases } : {}
      });
      if (translate && !c.translated_character_name && c.character_name) {
        setCharacterScopeLang(c.character_id, dominantScriptLang([c.character_name]));
        translateCharacterName(c.character_id, c.character_name);
      }
    }
    for (const m of modules) {
      const display = translate && m.translatedName ? m.translatedName : m.name;
      const o = {
        kind: "module",
        id: m.id,
        label: display || "(unnamed)"
      };
      options.push(o);
      const modAliases = [];
      if (m.name && m.name !== display)
        modAliases.push(m.name);
      if (m.translatedName && m.translatedName !== display)
        modAliases.push(m.translatedName);
      items.push({
        value: sourceKey(o),
        label: display || "(unnamed)",
        group: "Modules",
        ...translate && m.translatedName && m.name && m.translatedName !== m.name ? { secondary: m.name } : {},
        ...modAliases.length > 0 ? { searchTerms: modAliases } : {}
      });
      if (translate && !m.translatedName && m.name) {
        translateModuleName(m.id, m.name);
      }
    }
    sourceSelect.setItems(items);
    if (options.length === 0) {
      sourceSelect.setDisabled(true);
      sourceSelect.setValue(null);
      return;
    }
    sourceSelect.setDisabled(false);
    if (prev && options.some((o) => sourceKey(o) === prev)) {
      sourceSelect.setValue(prev);
    } else {
      const first = options[0];
      selectedSourceKey = sourceKey(first);
      sourceSelect.setValue(selectedSourceKey);
      requestForSelection(first);
    }
  }
  function sourceKey(o) {
    return `${o.kind}::${o.id}`;
  }
  function parseSourceKey(key) {
    const idx = key.indexOf("::");
    if (idx < 0)
      return null;
    const kind = key.slice(0, idx);
    const id = key.slice(idx + 2);
    if (kind !== "character" && kind !== "module")
      return null;
    if (id.length === 0)
      return null;
    if (kind === "character") {
      const c = cards.find((x) => x.character_id === id);
      if (!c)
        return { kind, id, label: id };
      const display = getTranslateEnabled() && c.translated_character_name ? c.translated_character_name : c.character_name ?? id;
      return { kind, id, label: display };
    }
    const m = modules.find((x) => x.id === id);
    return m ? { kind, id, label: m.name } : { kind, id, label: id };
  }
  function requestForSelection(o) {
    loading = true;
    viewerData = null;
    lastError = null;
    editingTriggerIndex = null;
    editingTriggerLua = "";
    defaultsTextBuffer = null;
    bgHtmlTextBuffer = null;
    renamingAssetName = null;
    assetSearchTerm = "";
    activeSubTab = o.kind === "character" ? "notes" : "assets";
    assetPagesShown = 1;
    renderStatus();
    renderSurfaces();
    log.info(`viewer-panel: request data kind=${o.kind} id=${o.id}`);
    sendToBackend({
      type: "request_viewer_data",
      source: o.kind === "character" ? { kind: "character", characterId: o.id } : { kind: "module", moduleId: o.id }
    });
  }
  function softRefetchCurrentSelection() {
    if (selectedSourceKey === null)
      return;
    const o = parseSourceKey(selectedSourceKey);
    if (!o)
      return;
    log.info(`viewer-panel: soft refetch kind=${o.kind} id=${o.id}`);
    sendToBackend({
      type: "request_viewer_data",
      source: o.kind === "character" ? { kind: "character", characterId: o.id } : { kind: "module", moduleId: o.id }
    });
  }
  function renderStatus() {
    if (lastError) {
      status.style.display = "";
      status.textContent = lastError;
      status.classList.add("lrv-status-error");
      return;
    }
    status.classList.remove("lrv-status-error");
    if (loading) {
      status.style.display = "";
      status.textContent = "Loading…";
      return;
    }
    if (!viewerData) {
      status.style.display = "";
      status.textContent = cards.length + modules.length === 0 ? "Import a character or upload a .risum module first." : "Pick a source above.";
      return;
    }
    status.style.display = "none";
    status.textContent = "";
  }
  function buildSubTabs(d) {
    const isCharacter = d.source.kind === "character";
    const tabs = [];
    const notes = d.creatorNotes ?? "";
    if (isCharacter && notes.trim().length > 0) {
      tabs.push({
        id: "notes",
        label: "Notes",
        render: () => renderNotesSection(notes)
      });
    }
    tabs.push({
      id: "assets",
      label: "Assets",
      render: () => renderAssetsSection(d.assets)
    });
    if (isCharacter) {
      tabs.push({
        id: "lorebook",
        label: "Lore",
        render: () => d.lorebookNeedsReimport ? renderLorebookLegacyNotice() : renderLorebookSection(d.lorebook)
      });
    } else {
      tabs.push({
        id: "regex",
        label: "Regex",
        render: () => renderRegexSection(d.regex)
      });
      tabs.push({
        id: "lorebook",
        label: "Lore",
        render: () => renderLorebookSection(d.lorebook)
      });
    }
    if (isCharacter) {
      tabs.push({
        id: "defaults",
        label: "Defaults",
        render: () => renderDefaultsSection(d)
      });
    }
    tabs.push({
      id: "triggers",
      label: "Triggers",
      render: () => renderTriggersSection(d.triggers)
    });
    tabs.push({
      id: "background",
      label: " HTML",
      render: () => renderBackgroundHtmlSection(d.backgroundHtml ?? "")
    });
    return tabs;
  }
  function renderSubTabBar(tabs) {
    const bar = document.createElement("div");
    bar.className = "lrv-subtab-bar";
    for (const t of tabs) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lrv-subtab";
      if (t.id === activeSubTab)
        btn.classList.add("lrv-subtab-active");
      btn.textContent = t.label;
      btn.addEventListener("click", () => {
        if (activeSubTab === t.id)
          return;
        activeSubTab = t.id;
        if (t.id !== "assets")
          assetPagesShown = 1;
        render();
      });
      bar.appendChild(btn);
    }
    return bar;
  }
  function renderSurfaces() {
    surfaceHost.replaceChildren();
    if (loading)
      return;
    if (!viewerData)
      return;
    const d = viewerData;
    if (d.fetchWarnings.length > 0) {
      const wb = document.createElement("div");
      wb.className = "lrv-warning";
      wb.textContent = d.fetchWarnings.join(" ");
      surfaceHost.appendChild(wb);
    }
    const tabs = buildSubTabs(d);
    if (tabs.length === 0)
      return;
    if (!tabs.some((t) => t.id === activeSubTab)) {
      activeSubTab = tabs[0].id;
    }
    surfaceHost.appendChild(renderSubTabBar(tabs));
    const active = tabs.find((t) => t.id === activeSubTab) ?? tabs[0];
    surfaceHost.appendChild(active.render());
  }
  function renderNotesSection(notes) {
    const det = document.createElement("section");
    det.className = "lrv-notes";
    const body = document.createElement("div");
    body.className = "lrv-notes-body";
    body.appendChild(renderDescription(notes));
    det.appendChild(body);
    return det;
  }
  function renderBackgroundHtmlSection(html) {
    const det = document.createElement("section");
    det.className = "lrv-section lrv-defaults-section";
    if (!viewerData)
      return det;
    const src = viewerData.source;
    if (src.kind !== "character" && src.kind !== "module") {
      const empty = document.createElement("div");
      empty.className = "lrv-empty";
      empty.textContent = "No background HTML.";
      det.appendChild(empty);
      return det;
    }
    const isModule = src.kind === "module";
    const snapshotText = html;
    const value = bgHtmlTextBuffer ?? snapshotText;
    const dirty = bgHtmlTextBuffer !== null && bgHtmlTextBuffer !== snapshotText;
    const ta = document.createElement("textarea");
    ta.className = "lrv-defaults-textarea";
    ta.spellcheck = false;
    ta.value = value;
    ta.rows = Math.max(12, Math.min(30, value.split(`
`).length + 2));
    ta.placeholder = `<style>
  /* background CSS */
</style>
<div class="bg">…</div>`;
    ta.addEventListener("input", () => {
      bgHtmlTextBuffer = ta.value;
      const lines = ta.value.split(`
`).length;
      ta.rows = Math.max(12, Math.min(30, lines + 2));
      paintStatus();
      saveBtn.disabled = !dirtyNow();
      revertBtn.disabled = !dirtyNow();
    });
    ta.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        commitSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        revert();
      }
    });
    det.appendChild(ta);
    const actions = document.createElement("div");
    actions.className = "lrv-defaults-actions";
    const statusEl = document.createElement("span");
    statusEl.className = "lrv-defaults-status";
    actions.appendChild(statusEl);
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "lrv-asset-action lrv-asset-action-primary";
    saveBtn.textContent = "Save";
    saveBtn.title = "Persist background HTML (Ctrl+Enter).";
    saveBtn.disabled = !dirty;
    saveBtn.addEventListener("click", commitSave);
    actions.appendChild(saveBtn);
    const revertBtn = document.createElement("button");
    revertBtn.type = "button";
    revertBtn.className = "lrv-asset-action";
    revertBtn.textContent = "Revert";
    revertBtn.title = "Discard unsaved edits (Esc).";
    revertBtn.disabled = !dirty;
    revertBtn.addEventListener("click", revert);
    actions.appendChild(revertBtn);
    if (!isModule) {
      const characterId = src.characterId;
      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "lrv-asset-action lrv-asset-action-danger";
      resetBtn.textContent = "Reset to card defaults";
      resetBtn.title = "Discard user edits, fall back to the card-side baseline.";
      resetBtn.addEventListener("click", () => {
        if (!window.confirm("Reset background HTML to the card-side baseline? Your edits are discarded."))
          return;
        log.info(`viewer-panel: set_background_html charId=${characterId} reset`);
        sendToBackend({ type: "set_background_html", characterId, html: null });
        bgHtmlTextBuffer = null;
      });
      actions.appendChild(resetBtn);
    }
    det.appendChild(actions);
    paintStatus();
    return det;
    function dirtyNow() {
      return bgHtmlTextBuffer !== null && bgHtmlTextBuffer !== snapshotText;
    }
    function paintStatus() {
      if (dirtyNow()) {
        statusEl.textContent = "Unsaved changes";
        statusEl.classList.add("lrv-defaults-status-dirty");
      } else {
        statusEl.textContent = snapshotText.length > 0 ? "Saved" : "Empty";
        statusEl.classList.remove("lrv-defaults-status-dirty");
      }
    }
    function commitSave() {
      const text = bgHtmlTextBuffer ?? "";
      const out = text.length > 0 ? text : null;
      if (isModule) {
        const moduleId = src.moduleId;
        log.info(`viewer-panel: set_module_background_embedding moduleId=${moduleId} len=${text.length}`);
        sendToBackend({ type: "set_module_background_embedding", moduleId, html: out });
      } else {
        const characterId = src.characterId;
        log.info(`viewer-panel: set_background_html charId=${characterId} len=${text.length}`);
        sendToBackend({ type: "set_background_html", characterId, html: out });
      }
      bgHtmlTextBuffer = null;
    }
    function revert() {
      bgHtmlTextBuffer = null;
      render();
    }
  }
  function renderDefaultsSection(d) {
    const det = document.createElement("section");
    det.className = "lrv-section lrv-defaults-section";
    if (d.source.kind !== "character") {
      const empty = document.createElement("div");
      empty.className = "lrv-empty";
      empty.textContent = "Modules do not carry default variables.";
      det.appendChild(empty);
      return det;
    }
    const characterId = d.source.characterId;
    const snapshotText = d.defaultVariablesText;
    const value = defaultsTextBuffer ?? snapshotText;
    const dirty = defaultsTextBuffer !== null && defaultsTextBuffer !== snapshotText;
    const ta = document.createElement("textarea");
    ta.className = "lrv-defaults-textarea";
    ta.spellcheck = false;
    ta.value = value;
    ta.rows = Math.max(8, Math.min(30, value.split(`
`).length + 2));
    ta.placeholder = `mood=happy
affection=0`;
    ta.addEventListener("input", () => {
      defaultsTextBuffer = ta.value;
      const lines = ta.value.split(`
`).length;
      ta.rows = Math.max(8, Math.min(30, lines + 2));
      paintStatus();
      saveBtn.disabled = !dirtyNow();
      revertBtn.disabled = !dirtyNow();
    });
    ta.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        commitSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        revert();
      }
    });
    det.appendChild(ta);
    const actions = document.createElement("div");
    actions.className = "lrv-defaults-actions";
    const statusEl = document.createElement("span");
    statusEl.className = "lrv-defaults-status";
    actions.appendChild(statusEl);
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "lrv-asset-action lrv-asset-action-primary";
    saveBtn.textContent = "Save";
    saveBtn.title = "Persist as the master defaults string (Ctrl+Enter).";
    saveBtn.disabled = !dirty;
    saveBtn.addEventListener("click", commitSave);
    actions.appendChild(saveBtn);
    const revertBtn = document.createElement("button");
    revertBtn.type = "button";
    revertBtn.className = "lrv-asset-action";
    revertBtn.textContent = "Revert";
    revertBtn.title = "Discard unsaved edits (Esc).";
    revertBtn.disabled = !dirty;
    revertBtn.addEventListener("click", revert);
    actions.appendChild(revertBtn);
    if (d.defaultVariablesUserEdited) {
      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "lrv-asset-action lrv-asset-action-danger";
      resetBtn.textContent = "Reset to card defaults";
      resetBtn.title = "Discard all your edits, restore the card-side defaults.";
      resetBtn.addEventListener("click", () => {
        if (!window.confirm("Reset default variables to the card-side baseline? This discards every edit you have saved."))
          return;
        log.info(`viewer-panel: set_default_variables_text char=${characterId} reset`);
        sendToBackend({ type: "set_default_variables_text", characterId, text: null });
        defaultsTextBuffer = null;
      });
      actions.appendChild(resetBtn);
    }
    det.appendChild(actions);
    paintStatus();
    queueMicrotask(() => {
      const focused = document.activeElement === ta;
      if (!focused && defaultsTextBuffer !== null) {
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
      }
    });
    return det;
    function dirtyNow() {
      return defaultsTextBuffer !== null && defaultsTextBuffer !== snapshotText;
    }
    function paintStatus() {
      if (dirtyNow()) {
        statusEl.textContent = "Unsaved changes";
        statusEl.classList.add("lrv-defaults-status-dirty");
      } else if (d.defaultVariablesUserEdited) {
        statusEl.textContent = "Saved (user edit)";
        statusEl.classList.remove("lrv-defaults-status-dirty");
      } else {
        statusEl.textContent = "Card defaults";
        statusEl.classList.remove("lrv-defaults-status-dirty");
      }
    }
    function commitSave() {
      const text = defaultsTextBuffer ?? "";
      log.info(`viewer-panel: set_default_variables_text char=${characterId} len=${text.length}`);
      sendToBackend({ type: "set_default_variables_text", characterId, text });
      defaultsTextBuffer = null;
    }
    function revert() {
      defaultsTextBuffer = null;
      render();
    }
  }
  function renderAssetsSection(assets) {
    const det = document.createElement("section");
    const toolbar2 = document.createElement("div");
    toolbar2.className = "lrv-asset-toolbar";
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "lrv-btn lrv-btn-primary";
    addBtn.textContent = "+ Add asset";
    addBtn.addEventListener("click", () => {
      onAddAssetClicked();
    });
    toolbar2.appendChild(addBtn);
    const search = document.createElement("input");
    search.type = "search";
    search.className = "lrv-asset-search";
    search.placeholder = `Search ${assets.length} asset${assets.length === 1 ? "" : "s"}…`;
    search.value = assetSearchTerm;
    search.spellcheck = false;
    toolbar2.appendChild(search);
    const filterCount = document.createElement("span");
    filterCount.className = "lrv-asset-filter-count";
    toolbar2.appendChild(filterCount);
    if (assetUploadStatus !== null) {
      const status2 = document.createElement("span");
      status2.className = "lrv-asset-upload-status";
      if (assetUploadStatus.kind === "error") {
        status2.classList.add("lrv-asset-upload-status-error");
      }
      status2.textContent = assetUploadStatus.message;
      toolbar2.appendChild(status2);
    }
    det.appendChild(toolbar2);
    const term = assetSearchTerm.trim().toLowerCase();
    const filtered = term ? assets.filter((a) => a.name.toLowerCase().includes(term)) : assets;
    filterCount.textContent = term ? `${filtered.length} of ${assets.length}` : "";
    if (assets.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lrv-empty";
      empty.textContent = "No assets.";
      det.appendChild(empty);
      return det;
    }
    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lrv-empty";
      empty.textContent = `No matches for "${assetSearchTerm}".`;
      det.appendChild(empty);
    }
    const grid = createVirtualGrid({
      hostClassName: "lrv-asset-virt-host",
      innerClassName: "lrv-asset-virt-inner",
      rowHeight: ASSET_TILE_H,
      minTileWidth: ASSET_TILE_MIN_W,
      overscanRows: ASSET_OVERSCAN_ROWS,
      getItems: () => filtered,
      renderItem: (a) => renderAssetTile(a),
      pinnedIndices: () => {
        if (renamingAssetName === null)
          return [];
        const idx = filtered.findIndex((a) => a.name === renamingAssetName);
        return idx >= 0 ? [idx] : [];
      }
    });
    if (filtered.length > 0)
      det.appendChild(grid.host);
    let searchTimer;
    search.addEventListener("input", () => {
      if (searchTimer !== undefined)
        window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        const caret = search.selectionStart;
        assetSearchTerm = search.value;
        render();
        const fresh = root.querySelector(".lrv-asset-search");
        if (fresh) {
          fresh.focus();
          if (caret !== null) {
            try {
              fresh.setSelectionRange(caret, caret);
            } catch {}
          }
        }
      }, 80);
    });
    return det;
  }
  function assetMediaKind(ext) {
    if (!ext)
      return "image";
    const e = ext.toLowerCase();
    if (e === "mp4" || e === "webm" || e === "mov" || e === "m4v" || e === "ogv")
      return "video";
    if (e === "mp3" || e === "wav" || e === "ogg" || e === "oga" || e === "m4a" || e === "aac" || e === "flac" || e === "opus")
      return "audio";
    return "image";
  }
  function renderAssetTile(a) {
    const tile = document.createElement("div");
    tile.className = "lrv-asset-tile";
    const kind = assetMediaKind(a.ext);
    if (kind === "video") {
      const vid = document.createElement("video");
      vid.src = a.url;
      vid.controls = true;
      vid.preload = "metadata";
      vid.playsInline = true;
      vid.className = "lrv-asset-media lrv-asset-media-video";
      tile.appendChild(vid);
    } else if (kind === "audio") {
      const aud = document.createElement("audio");
      aud.src = a.url;
      aud.controls = true;
      aud.preload = "metadata";
      aud.className = "lrv-asset-media lrv-asset-media-audio";
      tile.appendChild(aud);
    } else {
      const img = document.createElement("img");
      img.src = a.url;
      img.alt = a.name;
      img.loading = "lazy";
      img.className = "lrv-asset-media";
      tile.appendChild(img);
    }
    const cap = document.createElement("div");
    cap.className = "lrv-asset-caption";
    if (renamingAssetName === a.name) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "lrv-asset-rename-input";
      input.value = a.name;
      input.spellcheck = false;
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitRename(a.name, input.value);
        } else if (e.key === "Escape") {
          e.preventDefault();
          renamingAssetName = null;
          render();
        }
      });
      cap.appendChild(input);
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "lrv-asset-action lrv-asset-action-primary";
      saveBtn.textContent = "Save";
      saveBtn.addEventListener("click", () => commitRename(a.name, input.value));
      cap.appendChild(saveBtn);
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "lrv-asset-action";
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", () => {
        renamingAssetName = null;
        render();
      });
      cap.appendChild(cancelBtn);
      queueMicrotask(() => {
        input.focus();
        input.select();
      });
    } else {
      const nameEl = document.createElement("span");
      nameEl.className = "lrv-asset-name";
      nameEl.textContent = a.name;
      nameEl.title = a.name;
      cap.appendChild(nameEl);
      const meta = document.createElement("span");
      meta.className = "lrv-asset-meta";
      const parts = [];
      if (a.ext)
        parts.push(a.ext);
      if (a.multi)
        parts.push("multi");
      meta.textContent = parts.join(" · ");
      cap.appendChild(meta);
      const actions = document.createElement("div");
      actions.className = "lrv-asset-actions";
      const openBtn = document.createElement("a");
      openBtn.className = "lrv-asset-action lrv-asset-action-open";
      openBtn.textContent = "Open";
      openBtn.title = `Open "${a.name}" in a new tab (full size playback for video / audio).`;
      openBtn.href = a.url;
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      actions.appendChild(openBtn);
      const renameBtn = document.createElement("button");
      renameBtn.type = "button";
      renameBtn.className = "lrv-asset-action";
      renameBtn.textContent = "Rename";
      renameBtn.title = `Rename "${a.name}"`;
      renameBtn.addEventListener("click", () => {
        renamingAssetName = a.name;
        render();
      });
      actions.appendChild(renameBtn);
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "lrv-asset-action lrv-asset-action-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.title = `Remove "${a.name}" from the asset list.`;
      deleteBtn.addEventListener("click", () => {
        if (!window.confirm(`Remove asset "${a.name}"?`))
          return;
        sendCurrentSourceMutation({ type: "delete_asset", assetName: a.name });
      });
      actions.appendChild(deleteBtn);
      cap.appendChild(actions);
    }
    tile.appendChild(cap);
    return tile;
  }
  function commitRename(oldName, newNameRaw) {
    const newName = newNameRaw.trim();
    if (newName.length === 0 || newName === oldName) {
      renamingAssetName = null;
      render();
      return;
    }
    sendCurrentSourceMutation({
      type: "rename_asset",
      oldName,
      newName
    });
    renamingAssetName = null;
  }
  function sendCurrentSourceMutation(partial) {
    if (!viewerData)
      return;
    const source = viewerData.source.kind === "character" ? { kind: "character", characterId: viewerData.source.characterId } : { kind: "module", moduleId: viewerData.source.moduleId };
    log.info(`viewer-panel: ${partial.type} via current source kind=${source.kind}`);
    sendToBackend({ ...partial, source });
  }
  async function onAddAssetClicked() {
    if (!viewerData)
      return;
    let files;
    try {
      files = await pickFiles();
    } catch (err) {
      log.error("viewer-panel: file pick threw", err);
      assetUploadStatus = { kind: "error", message: `File pick failed: ${errMsg2(err)}` };
      render();
      return;
    }
    if (files.length === 0)
      return;
    await uploadAssetsBatch(files);
  }
  async function uploadAssetsBatch(files) {
    if (!viewerData)
      return;
    const startSource = viewerData.source.kind === "character" ? { kind: "character", characterId: viewerData.source.characterId } : { kind: "module", moduleId: viewerData.source.moduleId };
    const existingNames = new Set(viewerData.assets.map((a) => a.name));
    const planned = [];
    const failures = [];
    for (const f of files) {
      if (f.size > MAX_ASSET_BYTES) {
        failures.push({ filename: f.name, reason: `${formatMB(f.size)} > ${MAX_ASSET_MB} MB` });
        continue;
      }
      const { baseName, ext } = splitName(f.name);
      const assetName = disambiguateName(baseName, existingNames);
      existingNames.add(assetName);
      planned.push({ file: f, assetName, ext });
    }
    const total = planned.length;
    if (total === 0) {
      assetUploadStatus = {
        kind: "error",
        message: `${failures.length} file${failures.length === 1 ? "" : "s"} skipped — all exceeded ${MAX_ASSET_MB} MB. ${formatFailureList(failures)}`
      };
      render();
      return;
    }
    let processed = 0;
    const results = [];
    assetUploadStatus = { kind: "info", message: `Uploading 0/${total}…` };
    render();
    const concurrency = Math.min(6, total);
    let nextIndex = 0;
    const worker = async () => {
      while (true) {
        const i = nextIndex++;
        if (i >= total)
          break;
        const p = planned[i];
        try {
          const imageId = await uploadOne(p.file);
          results.push({
            assetName: p.assetName,
            imageId,
            ...p.ext !== undefined ? { ext: p.ext } : {}
          });
        } catch (err) {
          const reason = errMsg2(err);
          failures.push({ filename: p.file.name, reason });
          log.warn(`viewer-panel: batch upload failed name="${p.assetName}" file="${p.file.name}": ${reason}`);
        }
        processed += 1;
        if (processed === total || processed % Math.max(1, Math.floor(total / 20)) === 0) {
          const tail2 = failures.length > 0 ? ` (${failures.length} failed)` : "";
          assetUploadStatus = { kind: "info", message: `Uploading ${processed}/${total}${tail2}…` };
          render();
        }
      }
    };
    const workers = [];
    for (let w = 0;w < concurrency; w++)
      workers.push(worker());
    await Promise.all(workers);
    if (results.length === 0) {
      assetUploadStatus = {
        kind: "error",
        message: `All ${files.length} upload(s) failed. ${formatFailureList(failures)}`
      };
      render();
      return;
    }
    const tail = failures.length > 0 ? ` (${failures.length} failed — ${formatFailureList(failures)})` : "";
    assetUploadStatus = {
      kind: failures.length > 0 ? "error" : "info",
      message: `Saving ${results.length} asset${results.length === 1 ? "" : "s"}${tail}…`
    };
    render();
    log.info(`viewer-panel: add_assets via snapshot source kind=${startSource.kind} entries=${results.length}`);
    sendToBackend({ type: "add_assets", source: startSource, entries: results });
  }
  function formatFailureList(failures) {
    if (failures.length === 0)
      return "";
    const max = 3;
    const shown = failures.slice(0, max).map((f) => `"${f.filename}" (${f.reason})`).join(", ");
    if (failures.length <= max)
      return shown + ".";
    return `${shown}, +${failures.length - max} more — see console.`;
  }
  function formatMB(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  async function uploadOne(file) {
    const fd = new FormData;
    fd.set("image", file, file.name);
    const resp = await fetch("/api/v1/images", {
      method: "POST",
      body: fd,
      credentials: "include"
    });
    if (!resp.ok) {
      let detail = "";
      try {
        detail = ` — ${(await resp.text()).slice(0, 200)}`;
      } catch {}
      throw new Error(`HTTP ${resp.status}${detail}`);
    }
    const body = await resp.json();
    if (typeof body?.id !== "string" || body.id.length === 0) {
      throw new Error("upload response missing id");
    }
    return body.id;
  }
  function splitName(filename) {
    const lastDot = filename.lastIndexOf(".");
    const baseName = lastDot > 0 ? filename.slice(0, lastDot) : filename;
    const ext = lastDot > 0 ? filename.slice(lastDot + 1).toLowerCase() : undefined;
    return { baseName, ext };
  }
  function disambiguateName(base, taken) {
    if (!taken.has(base))
      return base;
    for (let n = 2;n < 1e4; n++) {
      const candidate = `${base} (${n})`;
      if (!taken.has(candidate))
        return candidate;
    }
    return `${base} (${Date.now()})`;
  }
  function pickFiles() {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,video/*,audio/*";
      input.multiple = true;
      input.style.display = "none";
      document.body.appendChild(input);
      let settled = false;
      const done = (result, err) => {
        if (settled)
          return;
        settled = true;
        try {
          document.body.removeChild(input);
        } catch {}
        if (err)
          reject(err);
        else
          resolve(result);
      };
      input.addEventListener("change", () => {
        const list = input.files;
        const out = [];
        if (list)
          for (let i = 0;i < list.length; i++)
            out.push(list.item(i));
        done(out);
      });
      input.addEventListener("cancel", () => done([]));
      input.click();
    });
  }
  function errMsg2(err) {
    return err instanceof Error ? err.message : String(err);
  }
  function renderTriggersSection(triggers) {
    const det = document.createElement("section");
    if (triggers.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lrv-empty";
      empty.textContent = "No triggers.";
      det.appendChild(empty);
      return det;
    }
    for (let i = 0;i < triggers.length; i++) {
      det.appendChild(renderTriggerRow(triggers[i], i));
    }
    return det;
  }
  function renderTriggerRow(t, index) {
    const row = document.createElement("div");
    row.className = "lrv-trigger-row";
    const head = document.createElement("div");
    head.className = "lrv-trigger-head";
    const name = document.createElement("span");
    name.className = "lrv-trigger-name";
    name.textContent = t.name;
    const tag = document.createElement("span");
    tag.className = "lrv-trigger-tag";
    tag.textContent = `${t.bindingType} · ${t.effectCount} effect${t.effectCount === 1 ? "" : "s"}`;
    head.appendChild(name);
    head.appendChild(tag);
    row.appendChild(head);
    if (editingTriggerIndex === index) {
      const editor = document.createElement("div");
      editor.className = "lrv-trigger-editor";
      const ta = document.createElement("textarea");
      ta.className = "lrv-trigger-textarea";
      ta.spellcheck = false;
      ta.value = editingTriggerLua;
      ta.rows = Math.max(8, Math.min(24, editingTriggerLua.split(`
`).length + 2));
      ta.addEventListener("input", () => {
        editingTriggerLua = ta.value;
        const lines = ta.value.split(`
`).length;
        ta.rows = Math.max(8, Math.min(24, lines + 2));
      });
      ta.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          commitTriggerLuaEdit(index);
        } else if (e.key === "Escape") {
          e.preventDefault();
          editingTriggerIndex = null;
          editingTriggerLua = "";
          render();
        }
      });
      editor.appendChild(ta);
      const actions = document.createElement("div");
      actions.className = "lrv-trigger-edit-actions";
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "lrv-asset-action lrv-asset-action-primary";
      saveBtn.textContent = "Save";
      saveBtn.title = "Save (Ctrl+Enter)";
      saveBtn.addEventListener("click", () => commitTriggerLuaEdit(index));
      actions.appendChild(saveBtn);
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "lrv-asset-action";
      cancelBtn.textContent = "Cancel";
      cancelBtn.title = "Cancel (Esc)";
      cancelBtn.addEventListener("click", () => {
        editingTriggerIndex = null;
        editingTriggerLua = "";
        render();
      });
      actions.appendChild(cancelBtn);
      editor.appendChild(actions);
      row.appendChild(editor);
      queueMicrotask(() => {
        ta.focus();
      });
    } else {
      const luaDet = document.createElement("details");
      luaDet.className = "lrv-trigger-lua";
      const luaSum = document.createElement("summary");
      const effectsLabel = t.effects.length > 0 ? ` · ${t.effects.length} V2 effect${t.effects.length === 1 ? "" : "s"}` : "";
      const luaLabel = t.lua ? `Lua (${t.lua.length} chars)` : t.effects.length > 0 ? "Lua (none)" : "Lua (empty)";
      luaSum.textContent = luaLabel + effectsLabel;
      luaDet.appendChild(luaSum);
      luaDet.open = !t.lua && t.effects.length > 0;
      if (t.lua) {
        const pre = document.createElement("pre");
        pre.className = "lrv-pre";
        pre.textContent = t.lua;
        luaDet.appendChild(pre);
      }
      if (t.effects.length > 0) {
        const pre = document.createElement("pre");
        pre.className = "lrv-pre";
        pre.textContent = t.effects.map((e) => `${"  ".repeat(Math.min(e.indent, 12))}${e.summary}`).join(`
`);
        luaDet.appendChild(pre);
      }
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "lrv-asset-action";
      editBtn.textContent = t.lua ? "Edit lua" : "Add lua";
      editBtn.style.margin = "4px 0 0 0";
      editBtn.addEventListener("click", () => {
        editingTriggerIndex = index;
        editingTriggerLua = t.lua ?? "";
        render();
      });
      luaDet.appendChild(editBtn);
      row.appendChild(luaDet);
    }
    return row;
  }
  function commitTriggerLuaEdit(index) {
    if (!viewerData)
      return;
    const source = viewerData.source.kind === "character" ? { kind: "character", characterId: viewerData.source.characterId } : { kind: "module", moduleId: viewerData.source.moduleId };
    log.info(`viewer-panel: set_trigger_lua index=${index} kind=${source.kind} luaLen=${editingTriggerLua.length}`);
    sendToBackend({
      type: "set_trigger_lua",
      source,
      triggerIndex: index,
      lua: editingTriggerLua
    });
    editingTriggerIndex = null;
    editingTriggerLua = "";
  }
  function renderRegexSection(regex) {
    const det = document.createElement("section");
    det.className = "lrv-section";
    const sum = document.createElement("div");
    sum.className = "lrv-section-summary";
    sum.textContent = `Regex · ${regex.length}`;
    det.appendChild(sum);
    if (regex.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lrv-empty";
      empty.textContent = "No regex rules.";
      det.appendChild(empty);
      return det;
    }
    for (const r of regex) {
      if (r.divider) {
        const div = document.createElement("div");
        div.className = "lrv-regex-divider";
        const label = document.createElement("span");
        label.className = "lrv-regex-divider-label";
        label.textContent = r.name;
        div.appendChild(label);
        det.appendChild(div);
        continue;
      }
      const row = document.createElement("div");
      row.className = "lrv-regex-row";
      if (r.disabled)
        row.classList.add("lrv-regex-row-disabled");
      const head = document.createElement("div");
      head.className = "lrv-regex-head";
      const name = document.createElement("span");
      name.className = "lrv-regex-name";
      name.textContent = r.name;
      head.appendChild(name);
      const tag = document.createElement("span");
      tag.className = "lrv-regex-tag";
      const tagParts = [r.target, r.placement].filter((p) => p && p.length > 0);
      tag.textContent = tagParts.join(" · ");
      head.appendChild(tag);
      if (r.moduleId) {
        const modBadge = document.createElement("span");
        modBadge.className = "lrv-regex-module";
        modBadge.textContent = `from module: ${r.moduleId.slice(0, 8)}…`;
        modBadge.title = `Module id: ${r.moduleId}`;
        head.appendChild(modBadge);
      }
      row.appendChild(head);
      const find = document.createElement("div");
      find.className = "lrv-regex-line";
      const findLabel = document.createElement("span");
      findLabel.className = "lrv-regex-line-label";
      findLabel.textContent = "find:";
      find.appendChild(findLabel);
      const findCode = document.createElement("code");
      findCode.textContent = r.find;
      find.appendChild(findCode);
      row.appendChild(find);
      const repl = document.createElement("div");
      repl.className = "lrv-regex-line";
      const replLabel = document.createElement("span");
      replLabel.className = "lrv-regex-line-label";
      replLabel.textContent = "replace:";
      repl.appendChild(replLabel);
      const replCode = document.createElement("code");
      replCode.textContent = r.replace.length > 200 ? r.replace.slice(0, 200) + "…" : r.replace;
      repl.appendChild(replCode);
      row.appendChild(repl);
      det.appendChild(row);
    }
    return det;
  }
  function renderLorebookLegacyNotice() {
    const wrap = document.createElement("div");
    wrap.className = "lrv-empty lrv-lb-legacy";
    wrap.textContent = "⚠️ This is a legacy card imported before 0.3.0. Please reimport this card to unlock the lorebook viewer.";
    return wrap;
  }
  function findGroupModule(g) {
    if (g.moduleId) {
      const byId = modules.find((x) => x.id === g.moduleId);
      if (byId)
        return byId;
    }
    if (g.groupId === "module")
      return;
    return modules.find((x) => {
      if (!x.name)
        return false;
      return g.groupName === x.name || g.groupName === `Module: ${x.name}` || g.groupName.includes(x.name);
    });
  }
  function pickLoreGroupDisplay(g) {
    if (!getTranslateEnabled())
      return g.groupName;
    const m = findGroupModule(g);
    if (m && m.name) {
      if (m.translatedName && m.translatedName !== m.name) {
        return g.groupName.includes(m.name) ? g.groupName.replace(m.name, m.translatedName) : m.translatedName;
      }
      translateModuleName(m.id, m.name);
      return g.translatedGroupName ?? g.groupName;
    }
    const src = viewerData?.source;
    if (src && src.kind === "character") {
      const c = cards.find((x) => x.character_id === src.characterId);
      if (c && c.character_name) {
        if (c.translated_character_name && c.translated_character_name !== c.character_name) {
          return g.groupName.includes(c.character_name) ? g.groupName.replace(c.character_name, c.translated_character_name) : c.translated_character_name;
        }
        translateCharacterName(c.character_id, c.character_name);
      }
    }
    return g.translatedGroupName ?? g.groupName;
  }
  function renderLorebookSection(groups) {
    const det = document.createElement("section");
    det.className = "lrv-section lrv-lb-section";
    if (groups.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lrv-empty";
      empty.textContent = "No lorebook entries available here.";
      det.appendChild(empty);
      return det;
    }
    for (const g of groups) {
      const risuEntries = [];
      const userAdditions = [];
      for (const e of g.entries) {
        if (e.fromRisu === false)
          userAdditions.push(e);
        else
          risuEntries.push(e);
      }
      const grpDet = document.createElement("details");
      grpDet.className = "lrv-lb-group";
      grpDet.open = true;
      const grpSum = document.createElement("summary");
      grpSum.className = "lrv-lb-group-summary";
      const display = pickLoreGroupDisplay(g);
      const isTranslated = display !== g.groupName;
      grpSum.textContent = `${display} (${g.entries.length})`;
      if (isTranslated)
        grpSum.title = g.groupName;
      grpDet.appendChild(grpSum);
      renderLorebookEntriesWithFolders(grpDet, risuEntries);
      if (userAdditions.length > 0) {
        const uaHead = document.createElement("div");
        uaHead.className = "lrv-lb-useradds-head";
        uaHead.textContent = `User Additions (${userAdditions.length})`;
        grpDet.appendChild(uaHead);
        renderLorebookEntriesWithFolders(grpDet, userAdditions);
      }
      det.appendChild(grpDet);
    }
    return det;
  }
  function renderLorebookEntriesWithFolders(container, entries) {
    const childrenByFolder = new Map;
    const folderKeys = new Set;
    for (const e of entries) {
      if (e.risuMode === "folder" && e.risuFolderKey)
        folderKeys.add(e.risuFolderKey);
      if (e.risuFolderRef) {
        const arr = childrenByFolder.get(e.risuFolderRef) ?? [];
        arr.push(e);
        childrenByFolder.set(e.risuFolderRef, arr);
      }
    }
    for (const e of entries) {
      if (e.risuMode === "folder" && e.risuFolderKey) {
        const children = childrenByFolder.get(e.risuFolderKey) ?? [];
        container.appendChild(renderLorebookFolderGroup(e, children));
        continue;
      }
      if (e.risuFolderRef && folderKeys.has(e.risuFolderRef))
        continue;
      container.appendChild(renderLorebookRow(e));
    }
  }
  function renderLorebookFolderGroup(folder, children) {
    const det = document.createElement("details");
    det.className = "lrv-lb-folder-group";
    const sum = document.createElement("summary");
    sum.className = "lrv-lb-folder-summary";
    const icon = document.createElement("span");
    icon.className = "lrv-lb-folder-icon";
    icon.setAttribute("aria-hidden", "true");
    sum.appendChild(icon);
    const name = document.createElement("span");
    name.className = "lrv-lb-folder-name";
    const display = lorebookDisplayComment(folder);
    name.textContent = display && display.length > 0 ? display : "(unnamed folder)";
    sum.appendChild(name);
    kickoffEntryTranslation(folder, name);
    const count = document.createElement("span");
    count.className = "lrv-lb-folder-count";
    count.textContent = `(${children.length})`;
    sum.appendChild(count);
    det.appendChild(sum);
    const body = document.createElement("div");
    body.className = "lrv-lb-folder-body";
    for (const c of children)
      body.appendChild(renderLorebookRow(c));
    det.appendChild(body);
    return det;
  }
  function renderLorebookRow(e) {
    if (e.risuMode === "folder")
      return renderLorebookFolderHeader(e);
    if (e.risuMode === "child")
      return renderLorebookChildLink(e);
    const row = document.createElement("details");
    row.className = "lrv-lb-row";
    if (e.disabled)
      row.classList.add("lrv-lb-row-disabled");
    const sum = document.createElement("summary");
    sum.className = "lrv-lb-row-summary";
    const dot = document.createElement("span");
    dot.className = e.constant ? "lrv-lb-status lrv-lb-status-always" : "lrv-lb-status lrv-lb-status-keyed";
    dot.title = e.disabled ? "disabled" : e.constant ? "always active" : "key-based";
    sum.appendChild(dot);
    const name = document.createElement("span");
    name.className = "lrv-lb-name";
    name.textContent = lorebookEntryName(e);
    sum.appendChild(name);
    row.appendChild(sum);
    row.appendChild(renderLorebookRowDetail(e));
    kickoffEntryTranslation(e, name);
    return row;
  }
  function renderLorebookFolderHeader(e) {
    const row = document.createElement("div");
    row.className = "lrv-lb-folder";
    const icon = document.createElement("span");
    icon.className = "lrv-lb-folder-icon";
    icon.setAttribute("aria-hidden", "true");
    row.appendChild(icon);
    const name = document.createElement("span");
    name.className = "lrv-lb-folder-name";
    const display = lorebookDisplayComment(e);
    name.textContent = display && display.length > 0 ? display : "(unnamed folder)";
    row.appendChild(name);
    kickoffEntryTranslation(e, name);
    return row;
  }
  function renderLorebookChildLink(e) {
    const row = document.createElement("div");
    row.className = "lrv-lb-child";
    const name = document.createElement("span");
    name.className = "lrv-lb-child-name";
    const display = lorebookDisplayComment(e);
    name.textContent = display && display.length > 0 ? display : "(linked entry)";
    row.appendChild(name);
    kickoffEntryTranslation(e, name);
    return row;
  }
  function lorebookDisplayComment(e) {
    if (getTranslateEnabled() && e.translatedComment)
      return e.translatedComment;
    return e.comment;
  }
  function classifyViewerScope(d) {
    const corpus = [];
    for (const g of d.lorebook) {
      corpus.push(g.groupName);
      for (const e of g.entries) {
        if (e.comment)
          corpus.push(e.comment);
      }
    }
    const lang = dominantScriptLang(corpus);
    if (d.source.kind === "character") {
      setCharacterScopeLang(d.source.characterId, lang);
    } else {
      setModuleScopeLang(d.source.moduleId, lang);
    }
  }
  function viewerScopeForTranslate() {
    const src = viewerData?.source;
    if (!src)
      return null;
    return src.kind === "module" ? { kind: "module", moduleId: src.moduleId } : { kind: "character", characterId: src.characterId };
  }
  function kickoffEntryTranslation(e, nameEl) {
    if (!getTranslateEnabled())
      return;
    if (e.translatedComment)
      return;
    if (!e.sourceHash || !e.comment)
      return;
    const scope = viewerScopeForTranslate();
    if (!scope)
      return;
    const original = e.comment;
    translateLorebookComment(scope, e.sourceHash, original).then((tx) => {
      if (tx && tx !== original && nameEl.isConnected && getTranslateEnabled()) {
        nameEl.textContent = tx;
      }
    });
  }
  function lorebookEntryName(e) {
    const display = lorebookDisplayComment(e);
    if (display && display.length > 0)
      return display;
    if (e.key.length > 0)
      return e.key.join(", ");
    return "(unnamed)";
  }
  function renderLorebookRowDetail(e) {
    const body = document.createElement("div");
    body.className = "lrv-lb-body";
    if (!e.constant && e.key.length > 0) {
      body.appendChild(field("Activation keys", e.key.join(", ")));
    }
    if (typeof e.position === "number") {
      body.appendChild(field("Position", positionLabel(e.position, e.depth)));
    }
    if (typeof e.orderValue === "number") {
      body.appendChild(field("Insert order", String(e.orderValue)));
    }
    const promptLabel = document.createElement("div");
    promptLabel.className = "lrv-lb-field-label";
    promptLabel.textContent = "Prompt";
    body.appendChild(promptLabel);
    const content = document.createElement("pre");
    content.className = "lrv-lb-content";
    content.textContent = e.content;
    body.appendChild(content);
    return body;
  }
  function field(label, value) {
    const row = document.createElement("div");
    row.className = "lrv-lb-field";
    const l = document.createElement("span");
    l.className = "lrv-lb-field-label";
    l.textContent = label;
    const v = document.createElement("span");
    v.className = "lrv-lb-field-value";
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    return row;
  }
  function positionLabel(position, depth) {
    switch (position) {
      case 0:
        return "before char";
      case 1:
        return "after char";
      case 2:
        return "before AN";
      case 3:
        return "after AN";
      case 4:
        return `depth ${depth ?? "?"}`;
      case 5:
        return "before ex";
      case 6:
        return "after ex";
      default:
        return `pos ${position}`;
    }
  }
  function render() {
    renderStatus();
    renderSurfaces();
  }
  const unsubTranslate = subscribeTranslateEnabled(() => {
    rebuildSourceSelect();
    render();
  });
  refreshBtn.addEventListener("click", () => {
    if (!selectedSourceKey)
      return;
    const o = parseSourceKey(selectedSourceKey);
    if (o)
      requestForSelection(o);
  });
  function handleBackendMessage(msg) {
    switch (msg.type) {
      case "set_active_chat": {
        const next = msg.characterId ?? null;
        if (next === activeCharacterId)
          break;
        activeCharacterId = next;
        updateCurrentBtn();
        pendingAutoSwitch = false;
        if (next !== null) {
          const switched = selectToCharacter(next, "set_active_chat");
          pendingAutoSwitch = !switched;
        }
        break;
      }
      case "cards_updated": {
        cards = msg.cards;
        const keyBeforeRebuild = selectedSourceKey;
        rebuildSourceSelect();
        updateCurrentBtn();
        render();
        let switched = false;
        if (pendingAutoSwitch && activeCharacterId !== null) {
          switched = selectToCharacter(activeCharacterId, "cards_updated");
          if (switched)
            pendingAutoSwitch = false;
        }
        const rebuildPickedFresh = selectedSourceKey !== null && (keyBeforeRebuild === null || keyBeforeRebuild !== selectedSourceKey);
        const rebuildIssuedFetch = rebuildPickedFresh && !switched;
        if (selectedSourceKey !== null && !switched && !rebuildIssuedFetch) {
          const o = parseSourceKey(selectedSourceKey);
          if (o?.kind === "character")
            requestForSelection(o);
        }
        break;
      }
      case "modules_pushed": {
        modules = msg.modules;
        const affectedChars = new Set;
        if (msg.attached_by_character) {
          for (const [charId, list] of Object.entries(msg.attached_by_character)) {
            attachedByCharacter.set(charId, list);
            affectedChars.add(charId);
          }
        }
        rebuildSourceSelect();
        render();
        const sel = selectedSourceKey ? parseSourceKey(selectedSourceKey) : null;
        if (sel?.kind === "character" && affectedChars.has(sel.id)) {
          softRefetchCurrentSelection();
        } else if (sel?.kind === "module" && !modules.some((m) => m.id === sel.id)) {
          viewerData = null;
          loading = false;
          render();
        }
        break;
      }
      case "attached_modules_pushed": {
        attachedByCharacter.set(msg.characterId, msg.attached);
        rebuildSourceSelect();
        render();
        const sel = selectedSourceKey ? parseSourceKey(selectedSourceKey) : null;
        if (sel?.kind === "character" && sel.id === msg.characterId) {
          softRefetchCurrentSelection();
        }
        break;
      }
      case "viewer_data_pushed": {
        const d = msg.data;
        const expectedKey = sourceKey(d.source.kind === "character" ? { kind: "character", id: d.source.characterId, label: d.source.name } : { kind: "module", id: d.source.moduleId, label: d.source.name });
        if (selectedSourceKey !== null && selectedSourceKey !== expectedKey) {
          log.info(`viewer-panel: ignoring stale push for ${expectedKey} (selected=${selectedSourceKey})`);
          return;
        }
        viewerData = d;
        loading = false;
        lastError = null;
        if (assetUploadStatus !== null && assetUploadStatus.kind === "info") {
          assetUploadStatus = null;
        }
        if (defaultsTextBuffer !== null && d.source.kind === "character" && defaultsTextBuffer === d.defaultVariablesText) {
          defaultsTextBuffer = null;
        }
        if (bgHtmlTextBuffer !== null && d.source.kind === "character" && bgHtmlTextBuffer === (d.backgroundHtml ?? "")) {
          bgHtmlTextBuffer = null;
        }
        classifyViewerScope(d);
        render();
        break;
      }
      case "error":
        if (loading) {
          loading = false;
          lastError = msg.message;
          render();
        } else if (assetUploadStatus !== null) {
          assetUploadStatus = { kind: "error", message: msg.message };
          render();
        }
        break;
    }
  }
  function destroy() {
    log.info("viewer-panel: destroy");
    try {
      sourceSelect.destroy();
    } catch {}
    try {
      unsubTranslate();
    } catch {}
    try {
      root.replaceChildren();
    } catch {}
  }
  sendToBackend({ type: "get_cards" });
  sendToBackend({ type: "request_modules" });
  updateCurrentBtn();
  render();
  log.info("viewer-panel: ready");
  return { handleBackendMessage, destroy };
}

// src/ui/toggles-tab.ts
function mountTogglesPanel(opts) {
  const { sendToBackend, log } = opts;
  log.info("toggles-panel: mounting");
  const root = opts.root;
  root.classList.add("lr-toggles-drawer");
  const intro = document.createElement("p");
  intro.className = "lr-toggles-intro";
  intro.textContent = "Module-defined toggles for the active chat.";
  root.appendChild(intro);
  const status = document.createElement("div");
  status.className = "lr-toggles-status";
  root.appendChild(status);
  const listHost = document.createElement("div");
  listHost.className = "lr-toggles-list";
  root.appendChild(listHost);
  let activeChatId = null;
  let defs = null;
  let values = null;
  const textEditBuffers = new Map;
  function renderStatus() {
    if (!activeChatId) {
      status.textContent = "Open a Risu chat to see toggles.";
      return;
    }
    if (!defs || defs.chatId !== activeChatId) {
      status.textContent = "Loading toggles…";
      return;
    }
    const interactiveCount = defs.toggles.filter((t) => t.type === "select" || t.type === "text" || t.type === "textarea" || t.type === "checkbox").length;
    if (interactiveCount === 0) {
      status.textContent = "No toggle-bearing modules attached.";
      return;
    }
    status.textContent = `${interactiveCount} toggle${interactiveCount === 1 ? "" : "s"} from attached modules.`;
  }
  function renderList() {
    listHost.innerHTML = "";
    if (!activeChatId || !defs || defs.chatId !== activeChatId) {
      return;
    }
    if (defs.toggles.length === 0) {
      return;
    }
    const tree = groupFlat(defs.toggles);
    for (const node of tree) {
      const el = renderNode(node);
      if (el)
        listHost.appendChild(el);
    }
  }
  function renderNode(t) {
    if (t.type === "group") {
      const det = document.createElement("details");
      det.className = "lr-toggle-group";
      det.open = true;
      const sum = document.createElement("summary");
      sum.className = "lr-toggle-group-summary";
      sum.textContent = pickDisplayValue(t) ?? "Group";
      kickValueTranslate(t, sum);
      det.appendChild(sum);
      const children = t.children ?? [];
      const groupAttr = pickGroupAttribution(children);
      if (groupAttr) {
        const attr = document.createElement("div");
        attr.className = "lr-toggle-attribution";
        const display = pickAttributionDisplay(groupAttr);
        attr.textContent = display;
        attr.title = `From module: ${display}`;
        kickAttributionTranslate(groupAttr, attr);
        det.appendChild(attr);
      }
      const body = document.createElement("div");
      body.className = "lr-toggle-group-body";
      for (const child of children) {
        const cel = renderNode(child);
        if (cel)
          body.appendChild(cel);
      }
      det.appendChild(body);
      return det;
    }
    if (t.type === "caption") {
      const cap = document.createElement("div");
      cap.className = "lr-toggle-caption";
      cap.textContent = pickDisplayValue(t) ?? t.value;
      kickValueTranslate(t, cap);
      return cap;
    }
    if (t.type === "divider") {
      const div = document.createElement("div");
      div.className = "lr-toggle-divider";
      if (t.value) {
        const lbl = document.createElement("span");
        lbl.className = "lr-toggle-divider-label";
        lbl.textContent = pickDisplayValue(t) ?? t.value;
        kickValueTranslate(t, lbl);
        div.appendChild(lbl);
      }
      const hr = document.createElement("hr");
      div.appendChild(hr);
      return div;
    }
    if (t.type === "groupEnd")
      return null;
    return renderInteractive(t);
  }
  function pickDisplayValue(t) {
    if (!getTranslateEnabled())
      return t.value;
    return t.translatedValue ?? t.value;
  }
  function kickValueTranslate(t, el) {
    if (!getTranslateEnabled())
      return;
    if (t.translatedValue)
      return;
    if (!t.moduleId)
      return;
    const original = t.value;
    if (!original || original.length === 0)
      return;
    translateModuleToggleText(t.moduleId, original).then((tx) => {
      if (tx && tx !== original && el.isConnected && getTranslateEnabled()) {
        el.textContent = tx;
      }
    });
  }
  function renderInteractive(t) {
    const row = document.createElement("div");
    row.className = "lr-toggle-row";
    row.dataset["key"] = t.key ?? "";
    row.dataset["kind"] = t.type;
    const label = document.createElement("label");
    label.className = "lr-toggle-label";
    const labelText = document.createElement("span");
    labelText.className = "lr-toggle-label-text";
    labelText.textContent = pickDisplayValue(t) ?? t.value;
    kickValueTranslate(t, labelText);
    label.appendChild(labelText);
    const key = t.key;
    if (t.type === "checkbox") {
      const stored = readToggle(key);
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "lr-toggle-checkbox";
      cb.checked = stored === "1";
      cb.addEventListener("change", () => {
        const next = cb.checked ? "1" : "0";
        sendSet(key, next);
      });
      row.appendChild(cb);
      row.appendChild(label);
    } else if (t.type === "select") {
      const sel = document.createElement("select");
      sel.className = "lr-toggle-select";
      const stored = readToggle(key);
      const options = t.options ?? [];
      const txMap = t.translatedOptionsByOriginal ?? {};
      const translateOn = getTranslateEnabled();
      for (let i = 0;i < options.length; i++) {
        const original = options[i] ?? "";
        const opt = document.createElement("option");
        opt.value = String(i);
        const cached = translateOn ? txMap[original] : undefined;
        opt.textContent = cached ?? original;
        if (stored === String(i))
          opt.selected = true;
        sel.appendChild(opt);
        if (translateOn && !cached && t.moduleId && original.length > 0) {
          const capturedOpt = opt;
          const capturedOriginal = original;
          translateModuleToggleText(t.moduleId, capturedOriginal).then((tx) => {
            if (tx && tx !== capturedOriginal && capturedOpt.isConnected && getTranslateEnabled()) {
              capturedOpt.textContent = tx;
            }
          });
        }
      }
      if (!stored && options.length > 0) {
        sel.selectedIndex = 0;
      }
      sel.addEventListener("change", () => {
        sendSet(key, sel.value);
      });
      row.appendChild(label);
      row.appendChild(sel);
    } else if (t.type === "text") {
      const stored = readToggle(key);
      const buffered = textEditBuffers.get(key);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "lr-toggle-text";
      input.value = buffered ?? stored;
      input.addEventListener("input", () => {
        textEditBuffers.set(key, input.value);
      });
      const commitText = () => {
        const next = input.value;
        textEditBuffers.delete(key);
        if (next !== stored)
          sendSet(key, next);
      };
      input.addEventListener("change", commitText);
      input.addEventListener("blur", commitText);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitText();
          input.blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          input.value = stored;
          textEditBuffers.delete(key);
          input.blur();
        }
      });
      row.appendChild(label);
      row.appendChild(input);
    } else if (t.type === "textarea") {
      const stored = readToggle(key);
      const buffered = textEditBuffers.get(key);
      const ta = document.createElement("textarea");
      ta.className = "lr-toggle-textarea";
      ta.rows = 3;
      ta.value = buffered ?? stored;
      ta.addEventListener("input", () => {
        textEditBuffers.set(key, ta.value);
      });
      const commitTextarea = () => {
        const next = ta.value;
        textEditBuffers.delete(key);
        if (next !== stored)
          sendSet(key, next);
      };
      ta.addEventListener("change", commitTextarea);
      ta.addEventListener("blur", commitTextarea);
      ta.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          commitTextarea();
          ta.blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          ta.value = stored;
          textEditBuffers.delete(key);
          ta.blur();
        }
      });
      row.classList.add("lr-toggle-row-stacked");
      row.appendChild(label);
      row.appendChild(ta);
    }
    return row;
  }
  function pickGroupAttribution(children) {
    if (!defs)
      return null;
    for (const c of children) {
      const k = c.key;
      if (!k)
        continue;
      const a = defs.attribution[k];
      if (a)
        return a;
    }
    return null;
  }
  function pickAttributionDisplay(a) {
    if (!getTranslateEnabled())
      return a.name;
    return a.translatedName ?? a.name;
  }
  function kickAttributionTranslate(a, el) {
    if (!getTranslateEnabled())
      return;
    if (a.translatedName)
      return;
    if (!a.name || a.name.length === 0)
      return;
    const moduleId = a.moduleId;
    const original = a.name;
    translateModuleName(moduleId, original).then((tx) => {
      if (tx && tx !== original && el.isConnected && getTranslateEnabled()) {
        el.textContent = tx;
        el.title = `From module: ${tx}`;
      }
    });
  }
  function readToggle(key) {
    if (!values)
      return "";
    const stored = values.scopes.global["toggle_" + key];
    return typeof stored === "string" ? stored : "";
  }
  function sendSet(key, value) {
    if (!activeChatId)
      return;
    log.info(`toggles-tab: set chatId=${activeChatId} key=${key} value=${value.length > 50 ? `<${value.length} chars>` : JSON.stringify(value)}`);
    sendToBackend({
      type: "set_toggle",
      chatId: activeChatId,
      key,
      value
    });
  }
  function render() {
    renderStatus();
    renderList();
  }
  function seedScopeLangs(toggles) {
    const corpusByModule = new Map;
    for (const t of toggles) {
      if (!t.moduleId)
        continue;
      let bucket = corpusByModule.get(t.moduleId);
      if (!bucket) {
        bucket = [];
        corpusByModule.set(t.moduleId, bucket);
      }
      if (typeof t.value === "string" && t.value.length > 0)
        bucket.push(t.value);
      if (t.type === "select") {
        for (const o of t.options) {
          if (typeof o === "string" && o.length > 0)
            bucket.push(o);
        }
      }
    }
    for (const [moduleId, corpus] of corpusByModule.entries()) {
      setModuleScopeLang(moduleId, dominantScriptLang(corpus));
    }
  }
  const unsubTranslate = subscribeTranslateEnabled(() => render());
  function handleBackendMessage(msg) {
    if (msg.type === "set_toggle_definitions") {
      if (defs && defs.chatId === msg.chatId && defs.seq > msg.seq)
        return;
      defs = {
        chatId: msg.chatId,
        seq: msg.seq,
        toggles: msg.toggles,
        attribution: msg.attribution
      };
      seedScopeLangs(msg.toggles);
      log.info(`toggles-tab.set_toggle_definitions: chat=${msg.chatId} seq=${msg.seq} count=${msg.toggles.length}`);
      render();
      return;
    }
    if (msg.type === "set_variables") {
      if (values && values.chatId === msg.chatId && values.seq > msg.seq)
        return;
      values = {
        chatId: msg.chatId,
        seq: msg.seq,
        scopes: msg.scopes
      };
      if (defs && defs.chatId === activeChatId) {
        render();
      }
      return;
    }
  }
  function setActiveChatId(chatId) {
    if (activeChatId === chatId)
      return;
    log.info(`toggles-tab.setActiveChatId: ${activeChatId ?? "null"} -> ${chatId ?? "null"}`);
    activeChatId = chatId;
    textEditBuffers.clear();
    if (chatId) {
      if (defs && defs.chatId !== chatId)
        defs = null;
      if (values && values.chatId !== chatId)
        values = null;
      sendToBackend({ type: "request_toggle_definitions", chatId });
      sendToBackend({ type: "request_variables_snapshot", chatId });
    } else {
      defs = null;
      values = null;
    }
    render();
  }
  render();
  log.info("toggles-panel: ready");
  return {
    handleBackendMessage,
    setActiveChatId,
    destroy() {
      log.info("toggles-panel: destroy");
      try {
        unsubTranslate();
      } catch {}
      try {
        root.replaceChildren();
      } catch {}
    }
  };
}
function groupFlat(flat) {
  const out = [];
  let openGroup = null;
  for (const t of flat) {
    if (t.type === "group") {
      const fresh = {
        ...t,
        children: []
      };
      out.push(fresh);
      openGroup = fresh;
      continue;
    }
    if (t.type === "groupEnd") {
      openGroup = null;
      continue;
    }
    if (openGroup) {
      openGroup.children.push(t);
    } else {
      out.push(t);
    }
  }
  return out;
}

// src/ui/icons/sidebar.svg
var sidebar_default = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pyramid-icon lucide-pyramid"><path d="M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0Z"/><path d="M12 2v20"/></svg>';

// src/ui/sidebar.ts
var SUB_TABS2 = [
  { id: "import", label: "Import", title: "Import cards and manage modules." },
  { id: "viewer", label: "Viewer", title: "Inspect character and module contents." },
  { id: "state", label: "State", title: "Variables, toggles, and persistent UIs for the active chat." },
  { id: "settings", label: "Settings", title: "Aux model, parity toggles, and diagnostic logs." }
];
var STATE_SUB_TABS = [
  { id: "variables", label: "Variables", title: "Live macro variables." },
  { id: "toggles", label: "Toggles", title: "Custom toggles." }
];
function createSidebar(opts) {
  const { ctx, sendToBackend, log } = opts;
  log.info("sidebar: registering single drawer tab");
  const tab = ctx.ui.registerDrawerTab({
    id: "lumirealm",
    title: "LumiRealm",
    shortName: "LumiRealm",
    description: "Run RisuAI .charx cards and .risum modules in Lumiverse.",
    keywords: [
      "risu",
      "charx",
      "risum",
      "module",
      "import",
      "translate",
      "lua",
      "lumirealm",
      "persistent",
      "portal",
      "overlay",
      "variables",
      "vars",
      "settings",
      "aux"
    ],
    iconSvg: sidebar_default
  });
  const root = tab.root;
  root.classList.add("lr-sidebar");
  const headerEl = document.createElement("div");
  headerEl.className = "lr-sidebar-header";
  root.appendChild(headerEl);
  const navEl = document.createElement("div");
  navEl.className = "lr-sidebar-nav";
  navEl.setAttribute("role", "tablist");
  root.appendChild(navEl);
  const navButtons = new Map;
  for (const sub of SUB_TABS2) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lr-sidebar-nav-btn";
    btn.textContent = sub.label;
    btn.title = sub.title;
    btn.dataset["subtab"] = sub.id;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.addEventListener("click", () => {
      activateSubTab(sub.id);
    });
    navEl.appendChild(btn);
    navButtons.set(sub.id, btn);
  }
  const panelsHost = document.createElement("div");
  panelsHost.className = "lr-sidebar-panels";
  root.appendChild(panelsHost);
  const panelHosts = new Map;
  const panels = new Map;
  for (const sub of SUB_TABS2) {
    const host = document.createElement("div");
    host.className = "lr-sidebar-panel";
    host.dataset["subtab"] = sub.id;
    host.hidden = true;
    panelsHost.appendChild(host);
    panelHosts.set(sub.id, host);
  }
  let activeSubTab = opts.initialTab ?? "import";
  let cachedActiveChatId = null;
  function ensurePanelMounted(id) {
    const existing = panels.get(id);
    if (existing)
      return existing;
    const host = panelHosts.get(id);
    if (!host) {
      throw new Error(`sidebar: missing host for sub-tab ${id}`);
    }
    let handle;
    switch (id) {
      case "import": {
        const modulesHandle = mountModulesPanel({
          root: host,
          sendToBackend,
          log,
          mountCharactersHeader: (slotRoot) => mountCardsPanel({
            root: slotRoot,
            ctx,
            sendToBackend,
            log,
            ...opts.onImportStart ? { onImportStart: opts.onImportStart } : {}
          }),
          ...opts.onModuleImportStart ? { onImportStart: opts.onModuleImportStart } : {}
        });
        handle = {
          handleBackendMessage(msg) {
            modulesHandle.handleBackendMessage(msg);
          },
          destroy() {
            try {
              modulesHandle.destroy();
            } catch {}
            try {
              host.replaceChildren();
            } catch {}
          }
        };
        break;
      }
      case "viewer":
        handle = mountViewerPanel({ root: host, sendToBackend, log });
        break;
      case "state": {
        let activateSub = function(id2) {
          for (const [navId, btn] of subBtns) {
            const sel = navId === id2;
            btn.classList.toggle("lr-subnav-btn-active", sel);
            btn.setAttribute("aria-selected", sel ? "true" : "false");
          }
          for (const [hostId, h] of subHosts) {
            h.hidden = hostId !== id2;
          }
          activeSub = id2;
          ensureSubMounted(id2);
        }, ensureSubMounted = function(id2) {
          const existing2 = subHandles.get(id2);
          if (existing2)
            return existing2;
          const h = subHosts.get(id2);
          if (!h)
            throw new Error(`state-subtab missing host ${id2}`);
          let sub;
          switch (id2) {
            case "variables":
              sub = mountVariablesPanel({ root: h, sendToBackend, log });
              if (sub.setActiveChatId)
                sub.setActiveChatId(cachedActiveChatId);
              break;
            case "toggles":
              sub = mountTogglesPanel({ root: h, sendToBackend, log });
              if (sub.setActiveChatId)
                sub.setActiveChatId(cachedActiveChatId);
              break;
            default: {
              const ex = id2;
              throw new Error(`state-subtab unknown ${ex}`);
            }
          }
          subHandles.set(id2, sub);
          return sub;
        };
        const subNav = document.createElement("div");
        subNav.className = "lr-subnav";
        subNav.setAttribute("role", "tablist");
        host.appendChild(subNav);
        const subPanelsHost = document.createElement("div");
        subPanelsHost.className = "lr-subnav-panels";
        host.appendChild(subPanelsHost);
        const subBtns = new Map;
        const subHosts = new Map;
        const subHandles = new Map;
        let activeSub = "variables";
        for (const def of STATE_SUB_TABS) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "lr-subnav-btn";
          btn.textContent = def.label;
          btn.title = def.title;
          btn.setAttribute("role", "tab");
          btn.setAttribute("aria-selected", "false");
          btn.addEventListener("click", () => activateSub(def.id));
          subNav.appendChild(btn);
          subBtns.set(def.id, btn);
          const subHost = document.createElement("div");
          subHost.className = "lr-subnav-panel";
          subHost.dataset["subnav"] = def.id;
          subHost.hidden = true;
          subPanelsHost.appendChild(subHost);
          subHosts.set(def.id, subHost);
        }
        ensureSubMounted("variables");
        activateSub(activeSub);
        handle = {
          handleBackendMessage(msg) {
            for (const sub of subHandles.values()) {
              try {
                sub.handleBackendMessage(msg);
              } catch (err) {
                log.error("state subpanel msg threw:", err);
              }
            }
          },
          setActiveChatId(chatId) {
            for (const sub of subHandles.values()) {
              if (sub.setActiveChatId) {
                try {
                  sub.setActiveChatId(chatId);
                } catch (err) {
                  log.error("state subpanel chat threw:", err);
                }
              }
            }
          },
          destroy() {
            for (const sub of subHandles.values()) {
              try {
                sub.destroy();
              } catch {}
            }
            try {
              host.replaceChildren();
            } catch {}
          }
        };
        break;
      }
      case "settings": {
        const settingsHandle = mountSettingsPanel({ root: host, sendToBackend, log });
        handle = {
          handleBackendMessage(msg) {
            settingsHandle.handleBackendMessage(msg);
          },
          destroy() {
            try {
              settingsHandle.destroy();
            } catch {}
            try {
              host.replaceChildren();
            } catch {}
          }
        };
        break;
      }
      default: {
        const exhaustive = id;
        throw new Error(`sidebar: unknown sub-tab ${exhaustive}`);
      }
    }
    panels.set(id, handle);
    log.info(`sidebar: panel mounted id=${id}`);
    return handle;
  }
  function activateSubTab(id) {
    if (id !== activeSubTab) {
      const prevHost = panelHosts.get(activeSubTab);
      if (prevHost)
        prevHost.hidden = true;
    }
    for (const [navId, btn] of navButtons) {
      const selected = navId === id;
      btn.classList.toggle("lr-sidebar-nav-btn-active", selected);
      btn.setAttribute("aria-selected", selected ? "true" : "false");
    }
    activeSubTab = id;
    ensurePanelMounted(id);
    const host = panelHosts.get(id);
    if (host)
      host.hidden = false;
  }
  ensurePanelMounted("import");
  activateSubTab(activeSubTab);
  function handleBackendMessage(msg) {
    if (msg.type === "open_settings_cleanup") {
      try {
        tab.activate();
      } catch (err) {
        log.warn("sidebar: tab.activate threw", err);
      }
      if (activeSubTab !== "settings")
        activateSubTab("settings");
    }
    for (const handle of panels.values()) {
      try {
        handle.handleBackendMessage(msg);
      } catch (err) {
        log.error("sidebar: panel handleBackendMessage threw:", err);
      }
    }
  }
  function setActiveChatId(chatId) {
    cachedActiveChatId = chatId;
    for (const handle of panels.values()) {
      if (handle.setActiveChatId) {
        try {
          handle.setActiveChatId(chatId);
        } catch (err) {
          log.error("sidebar: panel setActiveChatId threw:", err);
        }
      }
    }
  }
  function destroy() {
    log.info("sidebar: destroy");
    for (const handle of panels.values()) {
      try {
        handle.destroy();
      } catch {}
    }
    panels.clear();
    try {
      tab.destroy();
    } catch {}
  }
  return {
    handleBackendMessage,
    setActiveChatId,
    setActiveSubTab: activateSubTab,
    getActiveSubTab: () => activeSubTab,
    headerRoot: headerEl,
    destroy
  };
}

// src/ui/aux-debug.ts
var MAX_ENTRIES = 50;
function createAuxDebugPanel(log) {
  log.info("aux-debug: creating panel");
  const host = document.createElement("div");
  host.className = "risu-aux-debug-host";
  host.hidden = true;
  document.body.appendChild(host);
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "risu-aux-debug-toggle";
  const toggleLabel = document.createElement("span");
  toggleLabel.textContent = "Aux Debug";
  toggleBtn.title = "Open the aux-model capture panel.";
  const badge = document.createElement("span");
  badge.className = "risu-aux-debug-toggle-badge";
  badge.hidden = true;
  toggleBtn.appendChild(toggleLabel);
  toggleBtn.appendChild(badge);
  host.appendChild(toggleBtn);
  const panel = document.createElement("div");
  panel.className = "risu-aux-debug-panel";
  panel.hidden = true;
  host.appendChild(panel);
  const header = document.createElement("div");
  header.className = "risu-aux-debug-header";
  const title = document.createElement("div");
  title.className = "risu-aux-debug-title";
  title.textContent = "Aux-model captures";
  header.appendChild(title);
  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "risu-aux-debug-action";
  clearBtn.textContent = "Clear";
  clearBtn.title = "Drop captured entries.";
  header.appendChild(clearBtn);
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "risu-aux-debug-action";
  closeBtn.textContent = "Close";
  closeBtn.title = "Close the panel.";
  header.appendChild(closeBtn);
  panel.appendChild(header);
  const listEl = document.createElement("div");
  listEl.className = "risu-aux-debug-list";
  panel.appendChild(listEl);
  const emptyEl = document.createElement("div");
  emptyEl.className = "risu-aux-debug-empty";
  emptyEl.textContent = "No captures. Enable in Settings > Debug capture.";
  const entries = [];
  let unread = 0;
  let panelOpen = false;
  function refreshToggle() {
    host.hidden = entries.length === 0 && !panelOpen;
    if (unread > 0) {
      badge.hidden = false;
      badge.textContent = String(unread);
    } else {
      badge.hidden = true;
    }
  }
  function refreshListEmpty() {
    if (entries.length === 0) {
      if (!emptyEl.parentNode)
        listEl.appendChild(emptyEl);
    } else {
      if (emptyEl.parentNode)
        emptyEl.remove();
    }
  }
  function setPanelOpen(next) {
    panelOpen = next;
    panel.hidden = !next;
    if (next) {
      unread = 0;
    }
    refreshToggle();
  }
  toggleBtn.addEventListener("click", () => setPanelOpen(!panelOpen));
  closeBtn.addEventListener("click", () => setPanelOpen(false));
  clearBtn.addEventListener("click", () => {
    while (entries.length > 0) {
      const e = entries.pop();
      e.el.remove();
    }
    unread = 0;
    refreshListEmpty();
    refreshToggle();
    log.info("aux-debug: cleared");
  });
  function formatHeader(msg) {
    const ts = new Date(msg.ts);
    const hh = String(ts.getHours()).padStart(2, "0");
    const mm = String(ts.getMinutes()).padStart(2, "0");
    const ss = String(ts.getSeconds()).padStart(2, "0");
    const channel = msg.channel ?? "aux";
    const conn = msg.auxConnectionId ? msg.auxConnectionId.slice(0, 8) + "…" : "<default>";
    const model = msg.auxModelOverride ?? "<connection>";
    const chat = msg.chatId ? msg.chatId.slice(0, 8) + "…" : "<no-chat>";
    return `${hh}:${mm}:${ss} · ${channel} · conn=${conn} · model=${model} · chat=${chat}`;
  }
  function buildEntry(msg) {
    const entryEl = document.createElement("div");
    entryEl.className = "risu-aux-debug-entry";
    const headerRow = document.createElement("div");
    headerRow.className = "risu-aux-debug-entry-header";
    const channel = msg.channel ?? "aux";
    const channelBadge = document.createElement("span");
    channelBadge.className = `risu-aux-debug-channel risu-aux-debug-channel-${channel}`;
    channelBadge.textContent = channel;
    channelBadge.title = channel === "submodel" ? "V2 runLLM(model='submodel') call" : "Aux model (axLLMMain / LLMMain) call";
    headerRow.appendChild(channelBadge);
    const kindBadge = document.createElement("span");
    kindBadge.className = `risu-aux-debug-kind risu-aux-debug-kind-${msg.kind}`;
    kindBadge.textContent = msg.kind;
    headerRow.appendChild(kindBadge);
    const meta = document.createElement("span");
    meta.className = "risu-aux-debug-meta";
    meta.textContent = formatHeader(msg);
    headerRow.appendChild(meta);
    const elapsed = document.createElement("span");
    elapsed.className = "risu-aux-debug-elapsed";
    elapsed.textContent = msg.elapsedMs === null ? "-" : `${msg.elapsedMs}ms`;
    headerRow.appendChild(elapsed);
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "risu-aux-debug-copy";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const json = formatJson(msg.payload);
      copyToClipboard(json).then((ok) => {
        copyBtn.textContent = ok ? "Copied!" : "Failed";
        window.setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1200);
      });
    });
    headerRow.appendChild(copyBtn);
    entryEl.appendChild(headerRow);
    const body = document.createElement("div");
    body.className = "risu-aux-debug-body";
    const pre = document.createElement("pre");
    pre.className = "risu-aux-debug-json";
    pre.textContent = formatJson(msg.payload);
    body.appendChild(pre);
    entryEl.appendChild(body);
    headerRow.addEventListener("click", () => {
      entryEl.classList.toggle("is-open");
    });
    return entryEl;
  }
  function addEntry(msg) {
    const el = buildEntry(msg);
    listEl.appendChild(el);
    entries.push({ msg, el });
    while (entries.length > MAX_ENTRIES) {
      const dropped = entries.shift();
      dropped.el.remove();
    }
    if (!panelOpen)
      unread++;
    refreshListEmpty();
    refreshToggle();
  }
  function handleBackendMessage(msg) {
    if (msg.type !== "aux_debug_capture")
      return;
    log.info(`aux-debug: capture id=${msg.id} channel=${msg.channel ?? "aux"} kind=${msg.kind} ` + `chatId=${msg.chatId ?? "<none>"} elapsed=${msg.elapsedMs ?? "—"}ms`);
    addEntry(msg);
  }
  function destroy() {
    log.info("aux-debug: destroy");
    try {
      host.remove();
    } catch {}
    entries.length = 0;
  }
  refreshListEmpty();
  refreshToggle();
  log.info("aux-debug: ready");
  return { handleBackendMessage, destroy };
}
function formatJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    try {
      return String(value);
    } catch {
      return "<unserialisable>";
    }
  }
}
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

// src/bghtml/rewriter.ts
var CLASS_PREFIX = "x-risu-";
function shouldSkipHtmlClassToken(tok) {
  return tok.startsWith("hljs") || tok.startsWith(CLASS_PREFIX);
}
function shouldSkipCssClassName(name) {
  return name.startsWith(CLASS_PREFIX);
}
function rewriteClassValue(value) {
  if (!value)
    return value;
  return value.split(/\s+/).filter((t) => t.length > 0).map((t) => shouldSkipHtmlClassToken(t) ? t : CLASS_PREFIX + t).join(" ");
}
function rewriteHtmlClasses(html) {
  return html.replace(/\bclass\s*=\s*(["'])([\s\S]*?)\1/g, (_match, quote, value) => `class=${quote}${rewriteClassValue(value)}${quote}`);
}
function unprefixCssClassSelectors(css) {
  if (!css || css.length === 0)
    return css;
  try {
    return rewriteCss(css, {
      rewriteClassNames: false,
      unprefixClassNames: true,
      rewriteUniversalToHost: false,
      scopePrefix: "",
      killDataImports: true
    });
  } catch {
    return css;
  }
}
var DEFAULT_OPTS = {
  scopePrefix: ".chattext ",
  rewriteUniversalToHost: true,
  killDataImports: true,
  rewriteClassNames: true,
  unprefixClassNames: false
};
function rewriteCss(css, opts = {}) {
  const o = { ...DEFAULT_OPTS, ...opts };
  const parser = new CssParser(css);
  const nodes = parser.parseBlock(true);
  return serializeNodes(nodes, o, false);
}
var NESTING_AT_RULES = new Set([
  "media",
  "supports",
  "container",
  "document",
  "-moz-document",
  "host",
  "layer",
  "scope"
]);
var DECLARATION_AT_RULES = new Set([
  "font-face",
  "page",
  "property",
  "counter-style",
  "viewport",
  "-ms-viewport"
]);
var KEYFRAMES_AT_RULES = new Set(["keyframes", "-webkit-keyframes", "-moz-keyframes", "-o-keyframes"]);

class CssParser {
  src;
  pos = 0;
  constructor(src) {
    this.src = src;
  }
  parseBlock(topLevel) {
    const out = [];
    while (this.pos < this.src.length) {
      const ch = this.src[this.pos];
      if (ch === undefined)
        break;
      if (isWs(ch)) {
        const start = this.pos;
        while (this.pos < this.src.length && isWs(this.src[this.pos]))
          this.pos++;
        out.push({ kind: "raw", text: this.src.slice(start, this.pos) });
        continue;
      }
      if (ch === "/" && this.src[this.pos + 1] === "*") {
        out.push({ kind: "raw", text: this.readComment() });
        continue;
      }
      if (!topLevel && ch === "}") {
        this.pos++;
        return out;
      }
      if (ch === "@") {
        out.push(this.parseAtRule());
        continue;
      }
      out.push(this.parseStyleRule());
    }
    return out;
  }
  readComment() {
    const start = this.pos;
    this.pos += 2;
    while (this.pos < this.src.length) {
      if (this.src[this.pos] === "*" && this.src[this.pos + 1] === "/") {
        this.pos += 2;
        return this.src.slice(start, this.pos);
      }
      this.pos++;
    }
    return this.src.slice(start, this.pos);
  }
  parseAtRule() {
    this.pos++;
    const nameStart = this.pos;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos];
      if (isWs(c) || c === "{" || c === ";" || c === "(")
        break;
      this.pos++;
    }
    const name = this.src.slice(nameStart, this.pos);
    const preludeStart = this.pos;
    this.skipUntilBlockOrSemi();
    const prelude = this.src.slice(preludeStart, this.pos);
    const next = this.src[this.pos];
    if (next === ";") {
      this.pos++;
      return { kind: "at", name, prelude, block: null };
    }
    if (next === "{") {
      this.pos++;
      const lname = name.toLowerCase();
      if (DECLARATION_AT_RULES.has(lname)) {
        const bodyStart = this.pos;
        this.skipMatchingBrace();
        const bodyText = this.src.slice(bodyStart, this.pos);
        if (this.src[this.pos] === "}")
          this.pos++;
        return {
          kind: "at",
          name,
          prelude,
          block: [{ kind: "raw", text: bodyText }]
        };
      }
      const block = this.parseBlock(false);
      return { kind: "at", name, prelude, block };
    }
    return { kind: "at", name, prelude, block: null };
  }
  parseStyleRule() {
    const selStart = this.pos;
    this.skipUntilBlockOrSemi();
    const endCh = this.src[this.pos];
    if (endCh !== "{") {
      const text = this.src.slice(selStart, this.pos);
      if (this.src[this.pos] === ";")
        this.pos++;
      return { kind: "style", selectorList: text, declarations: "" };
    }
    const selectorList = this.src.slice(selStart, this.pos);
    this.pos++;
    const bodyStart = this.pos;
    this.skipMatchingBrace();
    const body = this.src.slice(bodyStart, this.pos);
    if (this.src[this.pos] === "}")
      this.pos++;
    return { kind: "style", selectorList, declarations: body };
  }
  skipUntilBlockOrSemi() {
    let parens = 0;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos];
      if (c === '"' || c === "'") {
        this.skipString(c);
        continue;
      }
      if (c === "/" && this.src[this.pos + 1] === "*") {
        this.readComment();
        continue;
      }
      if (c === "(") {
        parens++;
        this.pos++;
        continue;
      }
      if (c === ")") {
        if (parens > 0)
          parens--;
        this.pos++;
        continue;
      }
      if (parens === 0 && (c === "{" || c === ";"))
        return;
      this.pos++;
    }
  }
  skipMatchingBrace() {
    let depth = 1;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos];
      if (c === '"' || c === "'") {
        this.skipString(c);
        continue;
      }
      if (c === "/" && this.src[this.pos + 1] === "*") {
        this.readComment();
        continue;
      }
      if (c === "{") {
        depth++;
        this.pos++;
        continue;
      }
      if (c === "}") {
        depth--;
        if (depth === 0)
          return;
        this.pos++;
        continue;
      }
      this.pos++;
    }
  }
  skipString(quote) {
    this.pos++;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos];
      if (c === "\\") {
        this.pos += 2;
        continue;
      }
      if (c === quote) {
        this.pos++;
        return;
      }
      if (c === `
`)
        return;
      this.pos++;
    }
  }
}
function isWs(c) {
  return c === " " || c === "\t" || c === `
` || c === "\r" || c === "\f";
}
function serializeNodes(nodes, opts, inKeyframes) {
  let out = "";
  for (const n of nodes) {
    if (n.kind === "raw") {
      out += n.text;
    } else if (n.kind === "at") {
      out += serializeAtRule(n, opts, inKeyframes);
    } else {
      out += serializeStyleRule(n, opts, inKeyframes);
    }
  }
  return out;
}
function serializeAtRule(at, opts, parentIsKeyframes) {
  const name = at.name.toLowerCase();
  if (name === "import" && opts.killDataImports) {
    const prelude = at.prelude;
    if (/\burl\(\s*['"]?data:/i.test(prelude) || /^\s*['"]?data:/i.test(prelude)) {
      return `@import url('data:,');`;
    }
  }
  const preludeStr = at.prelude;
  if (at.block === null) {
    return `@${at.name}${preludeStr};`;
  }
  if (NESTING_AT_RULES.has(name)) {
    const inner2 = serializeNodes(at.block, opts, parentIsKeyframes);
    return `@${at.name}${preludeStr}{${inner2}}`;
  }
  if (KEYFRAMES_AT_RULES.has(name)) {
    const inner2 = serializeNodes(at.block, opts, true);
    return `@${at.name}${preludeStr}{${inner2}}`;
  }
  if (DECLARATION_AT_RULES.has(name)) {
    const inner2 = serializeNodes(at.block, opts, parentIsKeyframes);
    return `@${at.name}${preludeStr}{${inner2}}`;
  }
  const inner = serializeNodes(at.block, opts, parentIsKeyframes);
  return `@${at.name}${preludeStr}{${inner}}`;
}
function serializeStyleRule(rule, opts, inKeyframes) {
  if (inKeyframes) {
    return `${rule.selectorList}{${rule.declarations}}`;
  }
  const rewritten = rewriteSelectorList(rule.selectorList, opts);
  return `${rewritten}{${rule.declarations}}`;
}
function splitSelectorList(list) {
  const parts = [];
  let start = 0;
  let parens = 0;
  let brackets = 0;
  let inStr = null;
  for (let i = 0;i < list.length; i++) {
    const c = list[i];
    if (inStr) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === inStr)
        inStr = null;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = c;
      continue;
    }
    if (c === "(") {
      parens++;
      continue;
    }
    if (c === ")") {
      if (parens > 0)
        parens--;
      continue;
    }
    if (c === "[") {
      brackets++;
      continue;
    }
    if (c === "]") {
      if (brackets > 0)
        brackets--;
      continue;
    }
    if (c === "," && parens === 0 && brackets === 0) {
      parts.push(list.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(list.slice(start));
  return parts;
}
function rewriteSelector(selector, opts) {
  const leadMatch = /^\s*/.exec(selector);
  const tailMatch = /\s*$/.exec(selector);
  const lead = leadMatch[0];
  const tail = tailMatch[0];
  let core = selector.slice(lead.length, selector.length - tail.length);
  if (core.length === 0)
    return selector;
  if (opts.rewriteClassNames) {
    core = core.replace(/(?<![\\])\.(-?[_a-zA-Z][\w-]*)/g, (_m, name) => {
      if (shouldSkipCssClassName(name)) {
        return `.${name}`;
      }
      return `.${CLASS_PREFIX}${name}`;
    });
  } else if (opts.unprefixClassNames) {
    core = core.replace(/(?<![\\])\.x-risu-(-?[_a-zA-Z][\w-]*)/g, (_m, name) => `.${name}`);
  }
  if (opts.rewriteUniversalToHost) {
    core = rewriteUniversalLead(core);
  }
  const startsAtHost = /^:host(\b|[^a-zA-Z_-])/.test(core);
  if (opts.scopePrefix && !startsAtHost) {
    core = opts.scopePrefix + core;
  }
  return lead + core + tail;
}
function rewriteUniversalLead(selector) {
  const bareMatch = /^(body|html|:root|\*)(?=$|\s|[>+~,{])/.exec(selector);
  if (bareMatch) {
    return ":host" + selector.slice(bareMatch[1].length);
  }
  const compoundMatch = /^(body|html|:root|\*)(?=[.:\[#])/.exec(selector);
  if (compoundMatch) {
    return ":host" + selector.slice(compoundMatch[1].length);
  }
  return selector;
}
function rewriteSelectorList(list, opts) {
  return splitSelectorList(list).map((s) => rewriteSelector(s, opts)).join(",");
}
var STYLE_BLOCK_RE = /<style(?:\s[^>]*)?>([\s\S]*?)<\/style\s*>/gi;
function splitAndRewriteBgBundle(bgHtml, opts = {}) {
  const styles = [];
  const htmlWithoutStyles = bgHtml.replace(STYLE_BLOCK_RE, (_match, body) => {
    styles.push(body);
    return "";
  });
  const combinedCss = styles.join(`
`);
  const rewrittenCss = combinedCss.length > 0 ? rewriteCss(combinedCss, opts) : "";
  const rewrittenHtml = rewriteHtmlClasses(htmlWithoutStyles);
  return { css: rewrittenCss, html: rewrittenHtml };
}

// src/bghtml/mount.ts
var HOST_HOST_CSS = `
:host {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
:host > div.chattext {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
:host > div.chattext > [data-risu-bg-slot] {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
:host > div.chattext :is(a, button, [role='button'], input, textarea,
  select, [data-rc-trigger]) {
  pointer-events: auto;
}
`.trim();
function mountBgHost(ctx, opts = {}) {
  const host = ctx.dom.createElement("div", {
    "data-risu-bg-host": ""
  });
  host.style.position = "absolute";
  host.style.inset = "0";
  host.style.pointerEvents = "none";
  const target = opts.target ?? document.body;
  const placement = opts.placement ?? "first-child";
  if (placement === "first-child" && target.firstChild) {
    target.insertBefore(host, target.firstChild);
  } else {
    target.appendChild(host);
  }
  const shadow = host.attachShadow({ mode: "open" });
  const baseStyle = document.createElement("style");
  baseStyle.setAttribute("data-risu-bg-base", "");
  baseStyle.textContent = HOST_HOST_CSS;
  shadow.appendChild(baseStyle);
  const cardStyle = document.createElement("style");
  cardStyle.setAttribute("data-risu-bg-card", "");
  shadow.appendChild(cardStyle);
  const chattext = document.createElement("div");
  chattext.className = "chattext";
  shadow.appendChild(chattext);
  const slot = document.createElement("div");
  slot.setAttribute("data-risu-bg-slot", "");
  chattext.appendChild(slot);
  let destroyed = false;
  return {
    updateHtml(html) {
      if (destroyed)
        return;
      slot.innerHTML = html;
    },
    updateCss(css) {
      if (destroyed)
        return;
      if (cardStyle.textContent === css)
        return;
      cardStyle.textContent = css;
    },
    destroy() {
      if (destroyed)
        return;
      destroyed = true;
      host.remove();
    }
  };
}

// src/bghtml/strip-imports.ts
var IMPORT_RULE_RE = /@import\s+(?:url\(\s*["']?[^)"']*["']?\s*\)|["'][^"']*["'])[^;]*;/gi;
function stripCssImports(css) {
  if (!css || css.indexOf("@import") < 0)
    return css;
  return css.replace(IMPORT_RULE_RE, "");
}
function splitCssImports(css) {
  if (!css || css.indexOf("@import") < 0)
    return { imports: "", rest: css };
  const imports = [];
  const rest = css.replace(IMPORT_RULE_RE, (match) => {
    imports.push(match.trim());
    return "";
  });
  return { imports: imports.join(`
`), rest };
}

// src/bghtml/render.ts
var CHAT_SCOPE_STYLE_ID = "risu-compat-chat-scope-css";
function upsertChatScopeStyle(css) {
  let el = document.getElementById(CHAT_SCOPE_STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = CHAT_SCOPE_STYLE_ID;
    el.setAttribute("data-risu-compat", "chat-scope");
    document.head.appendChild(el);
  }
  if (el.textContent !== css)
    el.textContent = css;
}
function removeChatScopeStyle() {
  const el = document.getElementById(CHAT_SCOPE_STYLE_ID);
  if (el && el.parentNode)
    el.parentNode.removeChild(el);
}
function setupBgHtmlRenderer(ctx, flog, islandStyles) {
  flog.info("bg-html renderer: init");
  let activeChatId = null;
  let handle = null;
  let lastCss = null;
  function dismount() {
    if (handle) {
      flog.info(`bg-html renderer: dismount chatId=${activeChatId}`);
      handle.destroy();
      handle = null;
      lastCss = null;
    }
    removeChatScopeStyle();
    if (islandStyles)
      islandStyles.clear();
    activeChatId = null;
  }
  return {
    handleMessage(msg) {
      if (msg.type === "clear_bg_html") {
        if (activeChatId !== null && activeChatId !== msg.chatId) {
          flog.info(`bg-html renderer: chat-switch to empty bg, dismounting prior chat=${activeChatId}`);
        }
        dismount();
        return;
      }
      if (msg.chatId !== activeChatId) {
        dismount();
        activeChatId = msg.chatId;
      }
      let bundle;
      try {
        bundle = splitAndRewriteBgBundle(msg.bgHtml);
      } catch (err) {
        flog.error("bg-html renderer: rewrite failed", err);
        return;
      }
      if (!handle) {
        flog.info(`bg-html renderer: mount chatId=${msg.chatId} html_len=${bundle.html.length} css_len=${bundle.css.length}`);
        handle = mountBgHost(ctx);
      }
      const cssChanged = bundle.css !== lastCss;
      if (cssChanged) {
        handle.updateCss(bundle.css);
        lastCss = bundle.css;
      }
      handle.updateHtml(bundle.html);
      let chatBundle;
      try {
        chatBundle = splitAndRewriteBgBundle(msg.bgHtml, {
          scopePrefix: "[data-message-id] ",
          rewriteUniversalToHost: true,
          rewriteClassNames: false
        });
        chatBundle = { ...chatBundle, css: unprefixCssClassSelectors(chatBundle.css) };
      } catch (err) {
        flog.error("bg-html renderer: chat-scope rewrite failed", err);
        chatBundle = null;
      }
      if (islandStyles) {
        let islandBundle;
        try {
          islandBundle = splitAndRewriteBgBundle(msg.bgHtml, {
            scopePrefix: "",
            rewriteUniversalToHost: false,
            rewriteClassNames: false
          });
          islandBundle = { ...islandBundle, css: unprefixCssClassSelectors(islandBundle.css) };
        } catch (err) {
          flog.error("bg-html renderer: island-style rewrite failed", err);
          islandBundle = null;
        }
        if (islandBundle) {
          const islandImgReset = `img { max-width: 100%; }
`;
          const islandLineHeight = `:host { line-height: 28px; }
`;
          const islandCss = stripCssImports(islandLineHeight + islandImgReset + islandBundle.css);
          islandStyles.setStylesheet(islandCss);
          flog.info(`bg-html renderer: island-styles updated css_len=${islandCss.length} (raw=${islandBundle.css.length}, @import stripped)`);
        }
        const crossRuleParts = msg.crossRuleStyles ?? [];
        const cleanedParts = crossRuleParts.map((p) => unprefixCssClassSelectors(stripCssImports(p)));
        islandStyles.setCrossRuleSheets(cleanedParts);
      }
      if (chatBundle) {
        const imgReset = `[data-message-id] img { max-width: 100%; max-height: 80vh; }
`;
        const lineHeight = `[data-message-id] { line-height: 28px; }
`;
        const bubbleContainment = `[data-message-id] { overflow: visible !important; contain: none !important; }
`;
        const crossRuleParts = msg.crossRuleStyles ?? [];
        const wrappedCrossRule = crossRuleParts.map((p) => unprefixCssClassSelectors(stripCssImports(p))).filter((p) => p.trim().length > 0).map((p) => `[data-message-id] [data-component="MessageContent"] {
${p}
}
`).join(`
`);
        const { imports, rest } = splitCssImports(chatBundle.css);
        const chatScopeCss = (imports ? imports + `
` : "") + lineHeight + imgReset + bubbleContainment + rest + (wrappedCrossRule ? `
` + wrappedCrossRule : "");
        upsertChatScopeStyle(chatScopeCss);
        flog.info(`bg-html renderer: chat-scope CSS injected css_len=${chatScopeCss.length} ` + `(imports_hoisted_len=${imports.length}, body_len=${rest.length}, ` + `cross_rule_wrapped_len=${wrappedCrossRule.length}; ` + `+img-reset +bubble-containment preambles)`);
      }
      flog.info(`bg-html renderer: applied chatId=${msg.chatId} html_len=${bundle.html.length} css_len=${bundle.css.length} css_changed=${cssChanged}`);
    },
    destroy() {
      dismount();
    }
  };
}

// src/bghtml/quote-marks.ts
var SKIP_TAGS = new Set([
  "STYLE",
  "SCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
  "SVG",
  "MATH",
  "IFRAME"
]);
var DOUBLE_QUOTE_RE = /"([^"\n]+?)"/g;
var SINGLE_QUOTE_RE = /(?<![\w$])'([^'\n]+?)'(?![\w$])/g;
var MARK_OWN_ATTR = "data-lr-risu-quote";
function setupQuoteMarks(flog) {
  const watched = new WeakSet;
  const observers = [];
  function shouldSkipText(textNode, root) {
    let p = textNode.parentNode;
    while (p && p !== root) {
      if (p instanceof Element) {
        const tag = p.tagName;
        if (SKIP_TAGS.has(tag))
          return true;
        if (tag === "MARK" && p.hasAttribute(MARK_OWN_ATTR))
          return true;
      }
      p = p.parentNode;
    }
    return false;
  }
  function buildRangeTree(ranges) {
    ranges.sort((a, b) => a.start - b.start || b.end - a.end);
    const roots = [];
    const stack = [];
    for (const r of ranges) {
      while (stack.length > 0 && stack[stack.length - 1].end <= r.start) {
        stack.pop();
      }
      const top = stack[stack.length - 1];
      if (top && r.end > top.end)
        continue;
      const node = { start: r.start, end: r.end, kind: r.kind, children: [] };
      if (top)
        top.children.push(node);
      else
        roots.push(node);
      stack.push(node);
    }
    return roots;
  }
  function renderRangeNode(text, node, doc) {
    const mark = doc.createElement("mark");
    mark.setAttribute("risu-mark", node.kind);
    mark.setAttribute(MARK_OWN_ATTR, "");
    let cursor = node.start;
    for (const child of node.children) {
      if (cursor < child.start)
        mark.appendChild(doc.createTextNode(text.slice(cursor, child.start)));
      mark.appendChild(renderRangeNode(text, child, doc));
      cursor = child.end;
    }
    if (cursor < node.end)
      mark.appendChild(doc.createTextNode(text.slice(cursor, node.end)));
    return mark;
  }
  function transformTextNode(node) {
    const t = node.nodeValue || "";
    if (t.indexOf('"') < 0 && t.indexOf("'") < 0)
      return;
    const ranges = [];
    DOUBLE_QUOTE_RE.lastIndex = 0;
    let m;
    while ((m = DOUBLE_QUOTE_RE.exec(t)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, kind: "quote2" });
    }
    SINGLE_QUOTE_RE.lastIndex = 0;
    while ((m = SINGLE_QUOTE_RE.exec(t)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, kind: "quote1" });
    }
    if (ranges.length === 0)
      return;
    const tree = buildRangeTree(ranges);
    if (tree.length === 0)
      return;
    const doc = node.ownerDocument;
    if (!doc)
      return;
    const frag = doc.createDocumentFragment();
    let cursor = 0;
    for (const root of tree) {
      if (cursor < root.start)
        frag.appendChild(doc.createTextNode(t.slice(cursor, root.start)));
      frag.appendChild(renderRangeNode(t, root, doc));
      cursor = root.end;
    }
    if (cursor < t.length)
      frag.appendChild(doc.createTextNode(t.slice(cursor)));
    const parent = node.parentNode;
    if (parent)
      parent.replaceChild(frag, node);
  }
  function collectTextNodes(node, shadow, out) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!shouldSkipText(node, shadow))
        out.push(node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== 11)
      return;
    if (node instanceof Element) {
      const tag = node.tagName;
      if (SKIP_TAGS.has(tag))
        return;
      if (tag === "MARK" && node.hasAttribute(MARK_OWN_ATTR))
        return;
    }
    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      collectTextNodes(child, shadow, out);
      child = next;
    }
  }
  function walkSubtree(root, shadow) {
    const targets = [];
    collectTextNodes(root, shadow, targets);
    for (const node of targets) {
      try {
        transformTextNode(node);
      } catch (err) {
        flog.warn("quote-marks: transform threw", err);
      }
    }
  }
  function walkShadow(shadow) {
    if (!shadow)
      return;
    walkSubtree(shadow, shadow);
  }
  function watchShadow(shadow) {
    if (watched.has(shadow))
      return;
    watched.add(shadow);
    let scheduled = false;
    const pending = new Set;
    const observer = new MutationObserver((mutations) => {
      for (const mut of mutations) {
        if (mut.type === "characterData") {
          if (mut.target.nodeType === Node.TEXT_NODE)
            pending.add(mut.target);
          continue;
        }
        for (const n of mut.addedNodes) {
          if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) {
            pending.add(n);
          }
        }
      }
      if (!scheduled && pending.size > 0) {
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          const targets = Array.from(pending);
          pending.clear();
          for (const n of targets) {
            if (!n.isConnected)
              continue;
            if (n.nodeType === Node.TEXT_NODE) {
              if (!shouldSkipText(n, shadow)) {
                try {
                  transformTextNode(n);
                } catch (err) {
                  flog.warn("quote-marks: transform threw", err);
                }
              }
            } else {
              walkSubtree(n, shadow);
            }
          }
        });
      }
    });
    try {
      observer.observe(shadow, { childList: true, subtree: true, characterData: true });
      observers.push(observer);
    } catch (err) {
      flog.warn("quote-marks: observe failed", err);
    }
  }
  return {
    walkShadow,
    watchShadow,
    destroy() {
      for (const o of observers) {
        try {
          o.disconnect();
        } catch {}
      }
      observers.length = 0;
    }
  };
}

// src/bghtml/island-styles.ts
function setupIslandStyles(flog, opts = {}) {
  let sheet = null;
  let envSheet = null;
  const allOwnedSheets = new WeakSet;
  try {
    sheet = new CSSStyleSheet;
    allOwnedSheets.add(sheet);
  } catch (err) {
    flog.error("island-styles: CSSStyleSheet constructor unavailable (browser predates 2023)", err);
    return {
      setStylesheet: () => {},
      setCrossRuleSheets: () => {},
      clear: () => {},
      destroy: () => {}
    };
  }
  const quoteMarks = setupQuoteMarks(flog);
  let crossRuleSheets = [];
  let lastSheetCss = null;
  let lastCrossRuleKey = null;
  if (opts.riskuEnvironmentCss && opts.riskuEnvironmentCss.length > 0) {
    try {
      const rescoped = rescopeRisuEnvironment(opts.riskuEnvironmentCss);
      envSheet = new CSSStyleSheet;
      allOwnedSheets.add(envSheet);
      envSheet.replaceSync(rescoped.css);
      flog.info(`island-styles: Risu environment sheet built ${opts.riskuEnvironmentCss.length}->${rescoped.css.length} bytes, ` + `${envSheet.cssRules.length} top-level rules ` + `(rewrites: :root=${rescoped.rootHits} .prose=${rescoped.proseHits} ` + `.prose-invert=${rescoped.proseInvertHits} .chattext=${rescoped.chattextHits} ` + `.chat-width=${rescoped.chatWidthHits})`);
    } catch (err) {
      flog.error("island-styles: Risu environment sheet construction failed (falling back to per-card sheet only)", err);
      envSheet = null;
    }
  }
  const adopted = new WeakSet;
  const adoptedRefs = [];
  let adoptionCount = 0;
  let chatShadowCount = 0;
  let outsideChatShadowCount = 0;
  const ADOPT_LOG_STRIDE = 50;
  function injectInto(shadow) {
    if (adopted.has(shadow))
      return;
    if (!sheet)
      return;
    try {
      const append = [];
      if (envSheet)
        append.push(envSheet);
      if (sheet)
        append.push(sheet);
      for (const s of crossRuleSheets)
        append.push(s);
      const next = [...shadow.adoptedStyleSheets, ...append];
      shadow.adoptedStyleSheets = next;
      adopted.add(shadow);
      adoptedRefs.push(new WeakRef(shadow));
      if (shadow.host instanceof Element) {
        shadow.host.classList.add("not-island-prose");
      }
      const initialBase = shadow.querySelector("style[data-lumi-island-base]");
      if (initialBase)
        initialBase.remove();
      if (sheet.cssRules.length > 0) {
        quoteMarks.walkShadow(shadow);
        quoteMarks.watchShadow(shadow);
      }
      adoptionCount++;
      if (adoptionCount <= 8) {
        const host = shadow.host;
        const hostTag = host instanceof Element ? host.tagName.toLowerCase() : "?";
        const hostClass = host instanceof Element ? host.className : "";
        const childCount = shadow.childElementCount;
        const sheetRules = sheet.cssRules.length;
        const envRules = envSheet ? envSheet.cssRules.length : 0;
        flog.debug(`island-styles: adopted #${adoptionCount} into <${hostTag} class="${hostClass}"> ` + `(shadow has ${childCount} top-level children; envSheet ${envRules} rules + perCardSheet ${sheetRules} rules)`);
      } else if (adoptionCount % ADOPT_LOG_STRIDE === 0) {
        flog.info(`island-styles: adopted=${adoptionCount} (chat shadows visited=${chatShadowCount}, outside-chat shadows visited=${outsideChatShadowCount})`);
      }
    } catch (err) {
      flog.warn("island-styles: adoptedStyleSheets append failed", err);
    }
  }
  function visit(el) {
    const root = el.shadowRoot;
    if (!root || root.mode !== "open")
      return;
    if (el.closest("[data-message-id]")) {
      chatShadowCount++;
      injectInto(root);
    } else {
      outsideChatShadowCount++;
    }
  }
  function walkSubtree(root) {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    if (root instanceof Element)
      visit(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let cur = walker.nextNode();
    while (cur) {
      if (cur instanceof Element) {
        visit(cur);
        if (cur.shadowRoot && cur.shadowRoot.mode === "open") {
          walkSubtree(cur.shadowRoot);
        }
      }
      cur = walker.nextNode();
    }
  }
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof Element)
          walkSubtree(node);
      }
    }
  });
  try {
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (err) {
    flog.error("island-styles: observer.observe failed", err);
  }
  try {
    walkSubtree(document.body);
  } catch (err) {
    flog.warn("island-styles: initial walk failed", err);
  }
  flog.info("island-styles: setup complete (adopting into Lumi message-island shadows)");
  function nudgeAdopters(reason) {
    if (adoptedRefs.length === 0)
      return;
    let nudged = 0;
    let dead = 0;
    for (let i = adoptedRefs.length - 1;i >= 0; i--) {
      const shadow = adoptedRefs[i].deref();
      if (!shadow) {
        adoptedRefs.splice(i, 1);
        dead++;
        continue;
      }
      try {
        const current = Array.from(shadow.adoptedStyleSheets);
        shadow.adoptedStyleSheets = [];
        shadow.adoptedStyleSheets = current;
        nudged++;
      } catch {}
    }
    if (nudged > 0 || dead > 0) {
      flog.info(`island-styles: nudged adopters reason=${reason} ` + `nudged=${nudged} dead_refs_pruned=${dead} live=${adoptedRefs.length}`);
    }
  }
  function reAdoptAll() {
    for (let i = adoptedRefs.length - 1;i >= 0; i--) {
      const shadow = adoptedRefs[i].deref();
      if (!shadow) {
        adoptedRefs.splice(i, 1);
        continue;
      }
      try {
        const append = [];
        if (envSheet)
          append.push(envSheet);
        if (sheet)
          append.push(sheet);
        for (const s of crossRuleSheets)
          append.push(s);
        const existing = Array.from(shadow.adoptedStyleSheets);
        const filtered = existing.filter((s) => !allOwnedSheets.has(s));
        shadow.adoptedStyleSheets = [...filtered, ...append];
      } catch (err) {
        flog.warn("island-styles: re-adopt failed", err);
      }
    }
  }
  return {
    setStylesheet(css) {
      if (!sheet)
        return;
      if (lastSheetCss !== null && lastSheetCss === css) {
        flog.info(`island-styles: setStylesheet skipped — content unchanged (${css.length} bytes)`);
        return;
      }
      try {
        sheet.replaceSync(css);
        lastSheetCss = css;
        nudgeAdopters("setStylesheet");
      } catch (err) {
        flog.error("island-styles: replaceSync failed", err);
      }
    },
    setCrossRuleSheets(cssParts) {
      const key = cssParts.length + "\x1F" + cssParts.join("\x1E");
      if (lastCrossRuleKey === key) {
        flog.info(`island-styles: setCrossRuleSheets skipped — content unchanged (parts=${cssParts.length})`);
        return;
      }
      const next = [];
      let okCount = 0;
      let failCount = 0;
      for (let i = 0;i < cssParts.length; i++) {
        const part = cssParts[i] ?? "";
        if (part.trim().length === 0)
          continue;
        try {
          const s = new CSSStyleSheet;
          allOwnedSheets.add(s);
          s.replaceSync(part);
          next.push(s);
          okCount++;
        } catch (err) {
          failCount++;
          flog.warn(`island-styles: cross-rule sheet ${i} parse failed (skipped): ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      crossRuleSheets = next;
      lastCrossRuleKey = key;
      reAdoptAll();
      flog.info(`island-styles: cross-rule sheets set ok=${okCount} failed=${failCount} total_parts=${cssParts.length}`);
    },
    clear() {
      if (!sheet)
        return;
      try {
        sheet.replaceSync("");
        lastSheetCss = null;
        lastCrossRuleKey = null;
        nudgeAdopters("clear");
      } catch {}
    },
    destroy() {
      try {
        observer.disconnect();
      } catch {}
      if (sheet) {
        try {
          sheet.replaceSync("");
        } catch {}
      }
      sheet = null;
      envSheet = null;
    }
  };
}
function rescopeRisuEnvironment(input) {
  let css = input;
  const proseInvertHits = (css.match(/\.prose-invert\b/g) ?? []).length;
  css = css.replaceAll(/\.prose-invert\b/g, ":host");
  const proseHits = (css.match(/\.prose\b(?!-)/g) ?? []).length;
  css = css.replaceAll(/\.prose\b(?!-)/g, ":host");
  const chattextHits = (css.match(/\.chattext\b/g) ?? []).length;
  css = css.replaceAll(/\.chattext\b/g, ":host");
  const chatWidthHits = (css.match(/\.chat-width\b/g) ?? []).length;
  css = css.replaceAll(/\.chat-width\b/g, ":host");
  const rootHits = (css.match(/:root\b(?!,)/g) ?? []).length;
  css = css.replaceAll(/:root\b(?!,)/g, ":root,:host");
  css += `
:host{overflow:visible !important}
`;
  return {
    css,
    rootHits,
    proseHits,
    proseInvertHits,
    chattextHits,
    chatWidthHits
  };
}

// src/bghtml/risu-environment.css
var risu_environment_default = "@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1;--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-space-y-reverse:0;--tw-space-x-reverse:0;--tw-border-style:solid;--tw-gradient-position:initial;--tw-gradient-from:#0000;--tw-gradient-via:#0000;--tw-gradient-to:#0000;--tw-gradient-stops:initial;--tw-gradient-via-stops:initial;--tw-gradient-from-position:0%;--tw-gradient-via-position:50%;--tw-gradient-to-position:100%;--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial;--tw-ordinal:initial;--tw-slashed-zero:initial;--tw-numeric-figure:initial;--tw-numeric-spacing:initial;--tw-numeric-fraction:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-blur:initial;--tw-brightness:initial;--tw-contrast:initial;--tw-grayscale:initial;--tw-hue-rotate:initial;--tw-invert:initial;--tw-opacity:initial;--tw-saturate:initial;--tw-sepia:initial;--tw-drop-shadow:initial;--tw-drop-shadow-color:initial;--tw-drop-shadow-alpha:100%;--tw-drop-shadow-size:initial;--tw-backdrop-blur:initial;--tw-backdrop-brightness:initial;--tw-backdrop-contrast:initial;--tw-backdrop-grayscale:initial;--tw-backdrop-hue-rotate:initial;--tw-backdrop-invert:initial;--tw-backdrop-opacity:initial;--tw-backdrop-saturate:initial;--tw-backdrop-sepia:initial;--tw-duration:initial}}}@layer theme{:root,:host{--font-sans:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\";--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace;--color-red-200:oklch(88.5% .062 18.334);--color-red-300:oklch(80.8% .114 19.571);--color-red-400:oklch(70.4% .191 22.216);--color-red-500:oklch(63.7% .237 25.331);--color-red-600:oklch(57.7% .245 27.325);--color-red-700:oklch(50.5% .213 27.518);--color-red-800:oklch(44.4% .177 26.899);--color-red-900:oklch(39.6% .141 25.723);--color-orange-300:oklch(83.7% .128 66.29);--color-orange-400:oklch(75% .183 55.934);--color-orange-800:oklch(47% .157 37.304);--color-amber-400:oklch(82.8% .189 84.429);--color-amber-500:oklch(76.9% .188 70.08);--color-amber-600:oklch(66.6% .179 58.318);--color-amber-700:oklch(55.5% .163 48.998);--color-yellow-100:oklch(97.3% .071 103.193);--color-yellow-200:oklch(94.5% .129 101.54);--color-yellow-300:oklch(90.5% .182 98.111);--color-yellow-400:oklch(85.2% .199 91.936);--color-yellow-500:oklch(79.5% .184 86.047);--color-yellow-600:oklch(68.1% .162 75.834);--color-yellow-700:oklch(55.4% .135 66.442);--color-yellow-800:oklch(47.6% .114 61.907);--color-yellow-900:oklch(42.1% .095 57.708);--color-green-200:oklch(92.5% .084 155.995);--color-green-300:oklch(87.1% .15 154.449);--color-green-400:oklch(79.2% .209 151.711);--color-green-500:oklch(72.3% .219 149.579);--color-green-600:oklch(62.7% .194 149.214);--color-green-700:oklch(52.7% .154 150.069);--color-green-900:oklch(39.3% .095 152.535);--color-emerald-400:oklch(76.5% .177 163.223);--color-emerald-600:oklch(59.6% .145 163.225);--color-emerald-900:oklch(37.8% .077 168.94);--color-cyan-500:oklch(71.5% .143 215.221);--color-blue-200:oklch(88.2% .059 254.128);--color-blue-300:oklch(80.9% .105 251.813);--color-blue-400:oklch(70.7% .165 254.624);--color-blue-500:oklch(62.3% .214 259.815);--color-blue-600:oklch(54.6% .245 262.881);--color-blue-700:oklch(48.8% .243 264.376);--color-blue-800:oklch(42.4% .199 265.638);--color-blue-900:oklch(37.9% .146 265.522);--color-indigo-400:oklch(67.3% .182 276.935);--color-indigo-500:oklch(58.5% .233 277.117);--color-indigo-600:oklch(51.1% .262 276.966);--color-indigo-700:oklch(45.7% .24 277.023);--color-indigo-900:oklch(35.9% .144 278.697);--color-violet-500:oklch(60.6% .25 292.717);--color-purple-200:oklch(90.2% .063 306.703);--color-purple-500:oklch(62.7% .265 303.9);--color-purple-700:oklch(49.6% .265 301.924);--color-purple-800:oklch(43.8% .218 303.724);--color-purple-900:oklch(38.1% .176 304.987);--color-pink-500:oklch(65.6% .241 354.308);--color-pink-700:oklch(52.5% .223 3.958);--color-pink-900:oklch(40.8% .153 2.432);--color-rose-300:oklch(81% .117 11.638);--color-slate-500:oklch(55.4% .046 257.417);--color-slate-700:oklch(37.2% .044 257.287);--color-gray-100:oklch(96.7% .003 264.542);--color-gray-200:oklch(92.8% .006 264.531);--color-gray-300:oklch(87.2% .01 258.338);--color-gray-400:oklch(70.7% .022 261.325);--color-gray-500:oklch(55.1% .027 264.364);--color-gray-600:oklch(44.6% .03 256.802);--color-gray-700:oklch(37.3% .034 259.733);--color-gray-800:oklch(27.8% .033 256.848);--color-gray-900:oklch(21% .034 264.665);--color-zinc-100:oklch(96.7% .001 286.375);--color-zinc-200:oklch(92% .004 286.32);--color-zinc-300:oklch(87.1% .006 286.286);--color-zinc-400:oklch(70.5% .015 286.067);--color-zinc-500:oklch(55.2% .016 285.938);--color-zinc-600:oklch(44.2% .017 285.786);--color-zinc-700:oklch(37% .013 285.805);--color-zinc-800:oklch(27.4% .006 286.033);--color-zinc-900:oklch(21% .006 285.885);--color-neutral-50:var(--risu-theme-neutral-50);--color-neutral-200:var(--risu-theme-neutral-200);--color-stone-500:oklch(55.3% .013 58.071);--color-stone-900:oklch(21.6% .006 56.043);--color-black:#000;--color-white:#fff;--spacing:.25rem;--breakpoint-sm:40rem;--breakpoint-lg:64rem;--container-md:28rem;--container-xl:36rem;--container-2xl:42rem;--container-3xl:48rem;--container-4xl:56rem;--container-6xl:72rem;--text-xs:.75rem;--text-xs--line-height:calc(1/.75);--text-sm:.875rem;--text-sm--line-height:calc(1.25/.875);--text-base:1rem;--text-base--line-height: 1.5 ;--text-lg:1.125rem;--text-lg--line-height:calc(1.75/1.125);--text-xl:1.25rem;--text-xl--line-height:calc(1.75/1.25);--text-2xl:1.5rem;--text-2xl--line-height:calc(2/1.5);--text-3xl:1.875rem;--text-3xl--line-height: 1.2 ;--text-4xl:2.25rem;--text-4xl--line-height:calc(2.5/2.25);--text-6xl:3.75rem;--text-6xl--line-height:1;--font-weight-extralight:200;--font-weight-light:300;--font-weight-medium:500;--font-weight-semibold:600;--font-weight-bold:700;--font-weight-black:900;--tracking-wide:.025em;--tracking-wider:.05em;--leading-tight:1.25;--leading-snug:1.375;--leading-relaxed:1.625;--radius-xs:.125rem;--radius-sm:.25rem;--radius-md:.375rem;--radius-lg:.5rem;--radius-xl:.75rem;--radius-2xl:1rem;--radius-3xl:1.5rem;--drop-shadow-lg:0 4px 4px #00000026;--drop-shadow-2xl:0 25px 25px #00000026;--animate-spin:spin 1s linear infinite;--animate-pulse:pulse 2s cubic-bezier(.4,0,.6,1)infinite;--animate-bounce:bounce 1s infinite;--blur-sm:8px;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4,0,.2,1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono);--color-bgcolor:var(--risu-theme-bgcolor);--color-darkbg:var(--risu-theme-darkbg);--color-borderc:var(--risu-theme-borderc);--color-selected:var(--risu-theme-selected);--color-draculared:var(--risu-theme-draculared);--color-textcolor:var(--risu-theme-textcolor);--color-textcolor2:var(--risu-theme-textcolor2);--color-darkborderc:var(--risu-theme-darkborderc);--color-darkbutton:var(--risu-theme-darkbutton);--color-primary-500:var(--risu-theme-primary-500);--color-primary-600:var(--risu-theme-primary-600);--color-danger-500:var(--risu-theme-danger-500);--color-danger-600:var(--risu-theme-danger-600);--min-width-5:1.25rem;--min-width-6:1.5rem;--min-width-12:3rem;--min-width-14:3.5rem;--min-width-20:5rem;--min-width-96:24rem;--min-width-110:28rem;--min-width-124:32rem;--min-width-138:36rem;--container-14:3.5rem;--container-24:6rem;--container-36:9rem;--container-80vw:80vw;--container-100vw:100vw;--border-width-1:1px;--width-110:28rem;--width-124:32rem;--width-138:36rem;--width-2xl:48rem;--width-3xl:72rem;--width-7xl:1280px;--min-height-4:.75rem;--min-height-5:1.25rem;--min-height-8:2rem;--min-height-20:5rem;--min-height-32:9rem;--height-96:24rem;--height-138:36rem}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){appearance:button}::file-selector-button{appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}*,:after,:before,::backdrop{border-color:var(--color-gray-200,currentcolor)}::file-selector-button{border-color:var(--color-gray-200,currentcolor)}button:not(:disabled),[role=button]:not(:disabled){cursor:pointer}input::placeholder,textarea::placeholder{color:var(--color-gray-400)}dialog{margin:auto}}@layer components;@layer utilities{.pointer-events-auto{pointer-events:auto}.pointer-events-none{pointer-events:none}.collapse{visibility:collapse}.invisible{visibility:hidden}.visible{visibility:visible}.absolute{position:absolute}.fixed{position:fixed}.relative{position:relative}.static{position:static}.sticky{position:sticky}.inset-0{inset:calc(var(--spacing)*0)}.inset-1{inset:calc(var(--spacing)*1)}.end-1{inset-inline-end:calc(var(--spacing)*1)}.-top-1{top:calc(var(--spacing)*-1)}.-top-5{top:calc(var(--spacing)*-5)}.-top-96{top:calc(var(--spacing)*-96)}.top-0{top:calc(var(--spacing)*0)}.top-1\\/2{top:50%}.top-2{top:calc(var(--spacing)*2)}.top-3{top:calc(var(--spacing)*3)}.top-4{top:calc(var(--spacing)*4)}.-right-1{right:calc(var(--spacing)*-1)}.right-0{right:calc(var(--spacing)*0)}.right-2{right:calc(var(--spacing)*2)}.right-3{right:calc(var(--spacing)*3)}.right-4{right:calc(var(--spacing)*4)}.bottom-0{bottom:calc(var(--spacing)*0)}.bottom-2{bottom:calc(var(--spacing)*2)}.bottom-6{bottom:calc(var(--spacing)*6)}.bottom-16{bottom:calc(var(--spacing)*16)}.bottom-20{bottom:calc(var(--spacing)*20)}.bottom-36{bottom:calc(var(--spacing)*36)}.bottom-55{bottom:calc(var(--spacing)*55)}.bottom-full{bottom:100%}.-left-96{left:calc(var(--spacing)*-96)}.left-0{left:calc(var(--spacing)*0)}.left-1{left:calc(var(--spacing)*1)}.left-1\\/2{left:50%}.left-4{left:calc(var(--spacing)*4)}.left-6{left:calc(var(--spacing)*6)}.left-\\[-4px\\]{left:-4px}.isolate{isolation:isolate}.-z-10{z-index:-10}.z-0{z-index:0}.z-10{z-index:10}.z-20{z-index:20}.z-30{z-index:30}.z-40{z-index:40}.z-50{z-index:50}.z-100{z-index:100}.col-span-1{grid-column:span 1/span 1}.col-span-2{grid-column:span 2/span 2}.col-span-3{grid-column:span 3/span 3}.col-span-full{grid-column:1/-1}.float-end{float:inline-end}.float-right{float:right}.container{width:100%}@media(min-width:40rem){.container{max-width:40rem}}@media(min-width:48rem){.container{max-width:48rem}}@media(min-width:64rem){.container{max-width:64rem}}@media(min-width:80rem){.container{max-width:80rem}}@media(min-width:96rem){.container{max-width:96rem}}.m-0{margin:calc(var(--spacing)*0)}.m-1{margin:calc(var(--spacing)*1)}.m-2{margin:calc(var(--spacing)*2)}.m-4{margin:calc(var(--spacing)*4)}.mx-1\\.5{margin-inline:calc(var(--spacing)*1.5)}.mx-2{margin-inline:calc(var(--spacing)*2)}.mx-3{margin-inline:calc(var(--spacing)*3)}.mx-4{margin-inline:calc(var(--spacing)*4)}.mx-auto{margin-inline:auto}.my-1{margin-block:calc(var(--spacing)*1)}.my-2{margin-block:calc(var(--spacing)*2)}.my-3{margin-block:calc(var(--spacing)*3)}.my-4{margin-block:calc(var(--spacing)*4)}.my-6{margin-block:calc(var(--spacing)*6)}.prose{color:var(--tw-prose-body);max-width:65ch}.prose :where(p):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em;margin-bottom:1.25em}.prose :where([class~=lead]):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-lead);margin-top:1.2em;margin-bottom:1.2em;font-size:1.25em;line-height:1.6}.prose :where(a):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-links);font-weight:500;text-decoration:underline}.prose :where(strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-bold);font-weight:600}.prose :where(a strong):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(blockquote strong):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(thead th strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(ol):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em;margin-bottom:1.25em;padding-inline-start:1.625em;list-style-type:decimal}.prose :where(ol[type=A]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-alpha}.prose :where(ol[type=a]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-alpha}.prose :where(ol[type=A s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-alpha}.prose :where(ol[type=a s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-alpha}.prose :where(ol[type=I]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-roman}.prose :where(ol[type=i]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-roman}.prose :where(ol[type=I s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-roman}.prose :where(ol[type=i s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-roman}.prose :where(ol[type=\"1\"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:decimal}.prose :where(ul):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em;margin-bottom:1.25em;padding-inline-start:1.625em;list-style-type:disc}.prose :where(ol>li):not(:where([class~=not-prose],[class~=not-prose] *))::marker{color:var(--tw-prose-counters);font-weight:400}.prose :where(ul>li):not(:where([class~=not-prose],[class~=not-prose] *))::marker{color:var(--tw-prose-bullets)}.prose :where(dt):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);margin-top:1.25em;font-weight:600}.prose :where(hr):not(:where([class~=not-prose],[class~=not-prose] *)){border-color:var(--tw-prose-hr);border-top-width:1px;margin-top:3em;margin-bottom:3em}.prose :where(blockquote):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-quotes);border-inline-start-width:.25rem;border-inline-start-color:var(--tw-prose-quote-borders);quotes:\"“\"\"”\"\"‘\"\"’\";margin-top:1.6em;margin-bottom:1.6em;padding-inline-start:1em;font-style:italic;font-weight:500}.prose :where(blockquote p:first-of-type):not(:where([class~=not-prose],[class~=not-prose] *)):before{content:open-quote}.prose :where(blockquote p:last-of-type):not(:where([class~=not-prose],[class~=not-prose] *)):after{content:close-quote}.prose :where(h1):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);margin-top:0;margin-bottom:.888889em;font-size:2.25em;font-weight:800;line-height:1.11111}.prose :where(h1 strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-weight:900}.prose :where(h2):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);margin-top:2em;margin-bottom:1em;font-size:1.5em;font-weight:700;line-height:1.33333}.prose :where(h2 strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-weight:800}.prose :where(h3):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);margin-top:1.6em;margin-bottom:.6em;font-size:1.25em;font-weight:600;line-height:1.6}.prose :where(h3 strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-weight:700}.prose :where(h4):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);margin-top:1.5em;margin-bottom:.5em;font-weight:600;line-height:1.5}.prose :where(h4 strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-weight:700}.prose :where(img):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(picture):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em;display:block}.prose :where(video):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(kbd):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-kbd);box-shadow:0 0 0 1px var(--tw-prose-kbd-shadows),0 3px 0 var(--tw-prose-kbd-shadows);padding-top:.1875em;padding-inline-end:.375em;padding-bottom:.1875em;border-radius:.3125rem;padding-inline-start:.375em;font-family:inherit;font-size:.875em;font-weight:500}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-code);font-size:.875em;font-weight:600}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *)):before,.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *)):after{content:\"`\"}.prose :where(a code):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(h1 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(h2 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-size:.875em}.prose :where(h3 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-size:.9em}.prose :where(h4 code):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(blockquote code):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(thead th code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(pre):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-pre-code);background-color:var(--tw-prose-pre-bg);padding-top:.857143em;padding-inline-end:1.14286em;padding-bottom:.857143em;border-radius:.375rem;margin-top:1.71429em;margin-bottom:1.71429em;padding-inline-start:1.14286em;font-size:.875em;font-weight:400;line-height:1.71429;overflow-x:auto}.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *)){font-weight:inherit;color:inherit;font-size:inherit;font-family:inherit;line-height:inherit;background-color:#0000;border-width:0;border-radius:0;padding:0}.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *)):before,.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *)):after{content:none}.prose :where(table):not(:where([class~=not-prose],[class~=not-prose] *)){table-layout:auto;width:100%;margin-top:2em;margin-bottom:2em;font-size:.875em;line-height:1.71429}.prose :where(thead):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:1px;border-bottom-color:var(--tw-prose-th-borders)}.prose :where(thead th):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);vertical-align:bottom;padding-inline-end:.571429em;padding-bottom:.571429em;padding-inline-start:.571429em;font-weight:600}.prose :where(tbody tr):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:1px;border-bottom-color:var(--tw-prose-td-borders)}.prose :where(tbody tr:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:0}.prose :where(tbody td):not(:where([class~=not-prose],[class~=not-prose] *)){vertical-align:baseline}.prose :where(tfoot):not(:where([class~=not-prose],[class~=not-prose] *)){border-top-width:1px;border-top-color:var(--tw-prose-th-borders)}.prose :where(tfoot td):not(:where([class~=not-prose],[class~=not-prose] *)){vertical-align:top}.prose :where(th,td):not(:where([class~=not-prose],[class~=not-prose] *)){text-align:start}.prose :where(figure>*):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0;margin-bottom:0}.prose :where(figcaption):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-captions);margin-top:.857143em;font-size:.875em;line-height:1.42857}.prose{--tw-prose-body:oklch(37.3% .034 259.733);--tw-prose-headings:oklch(21% .034 264.665);--tw-prose-lead:oklch(44.6% .03 256.802);--tw-prose-links:oklch(21% .034 264.665);--tw-prose-bold:oklch(21% .034 264.665);--tw-prose-counters:oklch(55.1% .027 264.364);--tw-prose-bullets:oklch(87.2% .01 258.338);--tw-prose-hr:oklch(92.8% .006 264.531);--tw-prose-quotes:oklch(21% .034 264.665);--tw-prose-quote-borders:oklch(92.8% .006 264.531);--tw-prose-captions:oklch(55.1% .027 264.364);--tw-prose-kbd:oklch(21% .034 264.665);--tw-prose-kbd-shadows:oklab(21% -.00316127 -.0338527/.1);--tw-prose-code:oklch(21% .034 264.665);--tw-prose-pre-code:oklch(92.8% .006 264.531);--tw-prose-pre-bg:oklch(27.8% .033 256.848);--tw-prose-th-borders:oklch(87.2% .01 258.338);--tw-prose-td-borders:oklch(92.8% .006 264.531);--tw-prose-invert-body:oklch(87.2% .01 258.338);--tw-prose-invert-headings:#fff;--tw-prose-invert-lead:oklch(70.7% .022 261.325);--tw-prose-invert-links:#fff;--tw-prose-invert-bold:#fff;--tw-prose-invert-counters:oklch(70.7% .022 261.325);--tw-prose-invert-bullets:oklch(44.6% .03 256.802);--tw-prose-invert-hr:oklch(37.3% .034 259.733);--tw-prose-invert-quotes:oklch(96.7% .003 264.542);--tw-prose-invert-quote-borders:oklch(37.3% .034 259.733);--tw-prose-invert-captions:oklch(70.7% .022 261.325);--tw-prose-invert-kbd:#fff;--tw-prose-invert-kbd-shadows:#ffffff1a;--tw-prose-invert-code:#fff;--tw-prose-invert-pre-code:oklch(87.2% .01 258.338);--tw-prose-invert-pre-bg:#00000080;--tw-prose-invert-th-borders:oklch(44.6% .03 256.802);--tw-prose-invert-td-borders:oklch(37.3% .034 259.733);font-size:1rem;line-height:1.75}.prose :where(picture>img):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0;margin-bottom:0}.prose :where(li):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.5em;margin-bottom:.5em}.prose :where(ol>li):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(ul>li):not(:where([class~=not-prose],[class~=not-prose] *)){padding-inline-start:.375em}.prose :where(.prose>ul>li p):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.75em;margin-bottom:.75em}.prose :where(.prose>ul>li>p:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em}.prose :where(.prose>ul>li>p:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:1.25em}.prose :where(.prose>ol>li>p:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em}.prose :where(.prose>ol>li>p:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:1.25em}.prose :where(ul ul,ul ol,ol ul,ol ol):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.75em;margin-bottom:.75em}.prose :where(dl):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em;margin-bottom:1.25em}.prose :where(dd):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.5em;padding-inline-start:1.625em}.prose :where(hr+*):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(h2+*):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(h3+*):not(:where([class~=not-prose],[class~=not-prose] *)),.prose :where(h4+*):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(thead th:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-inline-start:0}.prose :where(thead th:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-inline-end:0}.prose :where(tbody td,tfoot td):not(:where([class~=not-prose],[class~=not-prose] *)){padding-top:.571429em;padding-inline-end:.571429em;padding-bottom:.571429em;padding-inline-start:.571429em}.prose :where(tbody td:first-child,tfoot td:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-inline-start:0}.prose :where(tbody td:last-child,tfoot td:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-inline-end:0}.prose :where(figure):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(.prose>:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(.prose>:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:0}.mt-0{margin-top:calc(var(--spacing)*0)}.mt-0\\.5{margin-top:calc(var(--spacing)*.5)}.mt-1{margin-top:calc(var(--spacing)*1)}.mt-1\\.5{margin-top:calc(var(--spacing)*1.5)}.mt-2{margin-top:calc(var(--spacing)*2)}.mt-3{margin-top:calc(var(--spacing)*3)}.mt-4{margin-top:calc(var(--spacing)*4)}.mt-5{margin-top:calc(var(--spacing)*5)}.mt-6{margin-top:calc(var(--spacing)*6)}.mt-8{margin-top:calc(var(--spacing)*8)}.mt-14{margin-top:calc(var(--spacing)*14)}.mt-auto{margin-top:auto}.mr-1{margin-right:calc(var(--spacing)*1)}.mr-2{margin-right:calc(var(--spacing)*2)}.mr-3{margin-right:calc(var(--spacing)*3)}.mr-4{margin-right:calc(var(--spacing)*4)}.mr-10{margin-right:calc(var(--spacing)*10)}.mr-auto{margin-right:auto}.\\!mb-0{margin-bottom:calc(var(--spacing)*0)!important}.mb-0{margin-bottom:calc(var(--spacing)*0)}.mb-1{margin-bottom:calc(var(--spacing)*1)}.mb-2{margin-bottom:calc(var(--spacing)*2)}.mb-3{margin-bottom:calc(var(--spacing)*3)}.mb-4{margin-bottom:calc(var(--spacing)*4)}.mb-5{margin-bottom:calc(var(--spacing)*5)}.mb-6{margin-bottom:calc(var(--spacing)*6)}.mb-8{margin-bottom:calc(var(--spacing)*8)}.mb-12{margin-bottom:calc(var(--spacing)*12)}.-ml-1{margin-left:calc(var(--spacing)*-1)}.ml-1{margin-left:calc(var(--spacing)*1)}.ml-2{margin-left:calc(var(--spacing)*2)}.ml-4{margin-left:calc(var(--spacing)*4)}.ml-9{margin-left:calc(var(--spacing)*9)}.ml-auto{margin-left:auto}.line-clamp-1{-webkit-line-clamp:1;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.line-clamp-2{-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.line-clamp-4{-webkit-line-clamp:4;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.block{display:block}.contents{display:contents}.flex{display:flex}.grid{display:grid}.hidden{display:none}.inline{display:inline}.inline-block{display:inline-block}.inline-flex{display:inline-flex}.table{display:table}.h-0{height:calc(var(--spacing)*0)}.h-0\\.5{height:calc(var(--spacing)*.5)}.h-1{height:calc(var(--spacing)*1)}.h-1\\.5{height:calc(var(--spacing)*1.5)}.h-2{height:calc(var(--spacing)*2)}.h-3{height:calc(var(--spacing)*3)}.h-3\\.5{height:calc(var(--spacing)*3.5)}.h-4{height:calc(var(--spacing)*4)}.h-5{height:calc(var(--spacing)*5)}.h-6{height:calc(var(--spacing)*6)}.h-8{height:calc(var(--spacing)*8)}.h-10{height:calc(var(--spacing)*10)}.h-11\\/12{height:91.6667%}.h-12{height:calc(var(--spacing)*12)}.h-14{height:calc(var(--spacing)*14)}.h-16{height:calc(var(--spacing)*16)}.h-20{height:calc(var(--spacing)*20)}.h-24{height:calc(var(--spacing)*24)}.h-28{height:calc(var(--spacing)*28)}.h-32{height:calc(var(--spacing)*32)}.h-36{height:calc(var(--spacing)*36)}.h-40{height:calc(var(--spacing)*40)}.h-44{height:calc(var(--spacing)*44)}.h-48{height:calc(var(--spacing)*48)}.h-52{height:calc(var(--spacing)*52)}.h-56{height:calc(var(--spacing)*56)}.h-60{height:calc(var(--spacing)*60)}.h-64{height:calc(var(--spacing)*64)}.h-80{height:calc(var(--spacing)*80)}.h-120{height:calc(var(--spacing)*120)}.h-138{height:var(--height-138)}.h-\\[8px\\]{height:8px}.h-\\[20px\\]\\!{height:20px!important}.h-\\[56px\\]{height:56px}.h-\\[70px\\]{height:70px}.h-\\[110px\\]{height:110px}.h-\\[calc\\(100\\%-2rem\\)\\]{height:calc(100% - 2rem)}.h-dvh{height:100dvh}.h-fit{height:fit-content}.h-full{height:100%}.h-px{height:1px}.h-screen{height:100vh}.h-svh{height:100svh}.max-h-8{max-height:calc(var(--spacing)*8)}.max-h-11\\/12{max-height:91.6667%}.max-h-24{max-height:calc(var(--spacing)*24)}.max-h-32{max-height:calc(var(--spacing)*32)}.max-h-48{max-height:calc(var(--spacing)*48)}.max-h-60{max-height:calc(var(--spacing)*60)}.max-h-64{max-height:calc(var(--spacing)*64)}.max-h-80{max-height:calc(var(--spacing)*80)}.max-h-\\[90\\%\\]{max-height:90%}.max-h-\\[90vh\\]{max-height:90vh}.max-h-\\[calc\\(100\\%-2rem\\)\\]{max-height:calc(100% - 2rem)}.max-h-full{max-height:100%}.min-h-0\\.5{min-height:calc(var(--spacing)*.5)}.min-h-4{min-height:var(--min-height-4)}.min-h-5{min-height:var(--min-height-5)}.min-h-6{min-height:calc(var(--spacing)*6)}.min-h-8{min-height:var(--min-height-8)}.min-h-10{min-height:calc(var(--spacing)*10)}.min-h-16{min-height:calc(var(--spacing)*16)}.min-h-18{min-height:calc(var(--spacing)*18)}.min-h-20{min-height:var(--min-height-20)}.min-h-24{min-height:calc(var(--spacing)*24)}.min-h-28{min-height:calc(var(--spacing)*28)}.min-h-32{min-height:var(--min-height-32)}.min-h-36{min-height:calc(var(--spacing)*36)}.min-h-40{min-height:calc(var(--spacing)*40)}.min-h-48{min-height:calc(var(--spacing)*48)}.min-h-56{min-height:calc(var(--spacing)*56)}.min-h-64{min-height:calc(var(--spacing)*64)}.min-h-72{min-height:calc(var(--spacing)*72)}.min-h-80{min-height:calc(var(--spacing)*80)}.min-h-full{min-height:100%}.min-h-screen{min-height:100vh}.min-h-svh{min-height:100svh}.w-0{width:calc(var(--spacing)*0)}.w-1{width:calc(var(--spacing)*1)}.w-1\\.5{width:calc(var(--spacing)*1.5)}.w-1\\/2{width:50%}.w-1\\/3{width:33.3333%}.w-2{width:calc(var(--spacing)*2)}.w-2\\/3{width:66.6667%}.w-2xl{width:var(--width-2xl)}.w-3{width:calc(var(--spacing)*3)}.w-3\\.5{width:calc(var(--spacing)*3.5)}.w-3xl{width:var(--width-3xl)}.w-4{width:calc(var(--spacing)*4)}.w-5{width:calc(var(--spacing)*5)}.w-5\\/6{width:83.3333%}.w-6{width:calc(var(--spacing)*6)}.w-7xl{width:var(--width-7xl)}.w-8{width:calc(var(--spacing)*8)}.w-10{width:calc(var(--spacing)*10)}.w-11\\/12{width:91.6667%}.w-12{width:calc(var(--spacing)*12)}.w-14{width:var(--container-14)}.w-16{width:calc(var(--spacing)*16)}.w-20{width:calc(var(--spacing)*20)}.w-24{width:var(--container-24)}.w-28{width:calc(var(--spacing)*28)}.w-32{width:calc(var(--spacing)*32)}.w-36{width:var(--container-36)}.w-40{width:calc(var(--spacing)*40)}.w-44{width:calc(var(--spacing)*44)}.w-48{width:calc(var(--spacing)*48)}.w-72{width:calc(var(--spacing)*72)}.w-96{width:calc(var(--spacing)*96)}.w-110{width:var(--width-110)}.w-124{width:var(--width-124)}.w-138{width:var(--width-138)}.w-\\[8px\\]{width:8px}.w-\\[56px\\]{width:56px}.w-auto{width:auto}.w-dvw{width:100dvw}.w-full{width:100%}.w-px{width:1px}.w-xl{width:var(--container-xl)}.max-w-\\(--breakpoint-lg\\){max-width:var(--breakpoint-lg)}.max-w-\\(--breakpoint-sm\\){max-width:var(--breakpoint-sm)}.max-w-2\\/3{max-width:66.6667%}.max-w-2xl{max-width:var(--container-2xl)}.max-w-3xl{max-width:var(--container-3xl)}.max-w-4xl{max-width:var(--container-4xl)}.max-w-6xl{max-width:var(--container-6xl)}.max-w-16{max-width:calc(var(--spacing)*16)}.max-w-24{max-width:var(--container-24)}.max-w-48{max-width:calc(var(--spacing)*48)}.max-w-80vw{max-width:var(--container-80vw)}.max-w-100vw{max-width:var(--container-100vw)}.max-w-\\[70\\%\\]{max-width:70%}.max-w-fit{max-width:fit-content}.max-w-full{max-width:100%}.max-w-md{max-width:var(--container-md)}.max-w-prose{max-width:65ch}.max-w-xl{max-width:var(--container-xl)}.min-w-0{min-width:calc(var(--spacing)*0)}.min-w-5{min-width:var(--min-width-5)}.min-w-6{min-width:var(--min-width-6)}.min-w-12{min-width:var(--min-width-12)}.min-w-14{min-width:var(--min-width-14)}.min-w-20{min-width:var(--min-width-20)}.min-w-32{min-width:calc(var(--spacing)*32)}.min-w-64{min-width:calc(var(--spacing)*64)}.min-w-96{min-width:var(--min-width-96)}.min-w-110{min-width:var(--min-width-110)}.min-w-124{min-width:var(--min-width-124)}.min-w-138{min-width:var(--min-width-138)}.min-w-\\[160px\\]{min-width:160px}.flex-1{flex:1}.shrink{flex-shrink:1}.shrink-0{flex-shrink:0}.flex-grow,.grow{flex-grow:1}.grow-0{flex-grow:0}.-translate-x-1\\/2{--tw-translate-x: -50% ;translate:var(--tw-translate-x)var(--tw-translate-y)}.-translate-y-1\\/2{--tw-translate-y: -50% ;translate:var(--tw-translate-x)var(--tw-translate-y)}.scale-95{--tw-scale-x:95%;--tw-scale-y:95%;--tw-scale-z:95%;scale:var(--tw-scale-x)var(--tw-scale-y)}.transform{transform:var(--tw-rotate-x,)var(--tw-rotate-y,)var(--tw-rotate-z,)var(--tw-skew-x,)var(--tw-skew-y,)}.animate-bounce{animation:var(--animate-bounce)}.animate-pulse{animation:var(--animate-pulse)}.animate-spin{animation:var(--animate-spin)}.cursor-default{cursor:default}.cursor-move{cursor:move}.cursor-not-allowed{cursor:not-allowed}.cursor-not-allowed\\!{cursor:not-allowed!important}.cursor-pointer{cursor:pointer}.resize{resize:both}.resize-none{resize:none}.list-inside{list-style-position:inside}.list-disc{list-style-type:disc}.appearance-none{appearance:none}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-\\[1fr_auto_1fr\\]{grid-template-columns:1fr auto 1fr}.flex-col{flex-direction:column}.flex-col-reverse{flex-direction:column-reverse}.flex-row{flex-direction:row}.flex-row-reverse{flex-direction:row-reverse}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.items-end{align-items:flex-end}.items-start{align-items:flex-start}.items-stretch{align-items:stretch}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.justify-start{justify-content:flex-start}.justify-stretch{justify-content:stretch}.gap-0{gap:calc(var(--spacing)*0)}.gap-0\\.5{gap:calc(var(--spacing)*.5)}.gap-1{gap:calc(var(--spacing)*1)}.gap-1\\.5{gap:calc(var(--spacing)*1.5)}.gap-2{gap:calc(var(--spacing)*2)}.gap-3{gap:calc(var(--spacing)*3)}.gap-4{gap:calc(var(--spacing)*4)}.gap-5{gap:calc(var(--spacing)*5)}.gap-6{gap:calc(var(--spacing)*6)}:where(.space-y-2>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*2)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*2)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-4>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*4)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*4)*calc(1 - var(--tw-space-y-reverse)))}.gap-x-3{column-gap:calc(var(--spacing)*3)}.gap-x-4{column-gap:calc(var(--spacing)*4)}:where(.space-x-4>:not(:last-child)){--tw-space-x-reverse:0;margin-inline-start:calc(calc(var(--spacing)*4)*var(--tw-space-x-reverse));margin-inline-end:calc(calc(var(--spacing)*4)*calc(1 - var(--tw-space-x-reverse)))}.gap-y-2{row-gap:calc(var(--spacing)*2)}.justify-self-end{justify-self:flex-end}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-x-hidden{overflow-x:hidden}.overflow-y-auto{overflow-y:auto}.overflow-y-clip{overflow-y:clip}.overflow-y-hidden{overflow-y:hidden}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:var(--radius-2xl)}.rounded-3xl{border-radius:var(--radius-3xl)}.rounded-full{border-radius:3.40282e38px}.rounded-lg{border-radius:var(--radius-lg)}.rounded-md{border-radius:var(--radius-md)}.rounded-sm{border-radius:var(--radius-sm)}.rounded-xl{border-radius:var(--radius-xl)}.rounded-xs{border-radius:var(--radius-xs)}.rounded-t-lg{border-top-left-radius:var(--radius-lg);border-top-right-radius:var(--radius-lg)}.rounded-t-md{border-top-left-radius:var(--radius-md);border-top-right-radius:var(--radius-md)}.rounded-l-lg{border-top-left-radius:var(--radius-lg);border-bottom-left-radius:var(--radius-lg)}.rounded-l-md{border-top-left-radius:var(--radius-md);border-bottom-left-radius:var(--radius-md)}.rounded-l-none{border-top-left-radius:0;border-bottom-left-radius:0}.rounded-tl-none{border-top-left-radius:0}.rounded-tl-sm{border-top-left-radius:var(--radius-sm)}.rounded-r-lg{border-top-right-radius:var(--radius-lg);border-bottom-right-radius:var(--radius-lg)}.rounded-r-md{border-top-right-radius:var(--radius-md);border-bottom-right-radius:var(--radius-md)}.rounded-r-none{border-top-right-radius:0;border-bottom-right-radius:0}.rounded-tr-none{border-top-right-radius:0}.rounded-tr-sm{border-top-right-radius:var(--radius-sm)}.rounded-b-lg{border-bottom-right-radius:var(--radius-lg);border-bottom-left-radius:var(--radius-lg)}.rounded-b-md{border-bottom-right-radius:var(--radius-md);border-bottom-left-radius:var(--radius-md)}.rounded-br-md{border-bottom-right-radius:var(--radius-md)}.rounded-bl-md{border-bottom-left-radius:var(--radius-md)}.border{border-style:var(--tw-border-style);border-width:1px}.border-0{border-style:var(--tw-border-style);border-width:0}.border-1{border-style:var(--tw-border-style);border-width:var(--border-width-1)}.border-2{border-style:var(--tw-border-style);border-width:2px}.border-4{border-style:var(--tw-border-style);border-width:4px}.border-x{border-inline-style:var(--tw-border-style);border-inline-width:1px}.border-y{border-block-style:var(--tw-border-style);border-block-width:1px}.border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.border-t-1{border-top-style:var(--tw-border-style);border-top-width:var(--border-width-1)}.border-t-2{border-top-style:var(--tw-border-style);border-top-width:2px}.border-r{border-right-style:var(--tw-border-style);border-right-width:1px}.border-r-0{border-right-style:var(--tw-border-style);border-right-width:0}.border-r-1{border-right-style:var(--tw-border-style);border-right-width:var(--border-width-1)}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-b-1{border-bottom-style:var(--tw-border-style);border-bottom-width:var(--border-width-1)}.border-l{border-left-style:var(--tw-border-style);border-left-width:1px}.border-l-4{border-left-style:var(--tw-border-style);border-left-width:4px}.border-dashed{--tw-border-style:dashed;border-style:dashed}.border-none{--tw-border-style:none;border-style:none}.border-solid{--tw-border-style:solid;border-style:solid}.border-\\[\\#bbbbbb15\\]{border-color:#bbbbbb15}.border-\\[\\#bbbbbb30\\]{border-color:#bbbbbb30}.border-amber-500{border-color:var(--color-amber-500)}.border-bgcolor{border-color:var(--color-bgcolor)}.border-black{border-color:var(--color-black)}.border-blue-400{border-color:var(--color-blue-400)}.border-blue-500{border-color:var(--color-blue-500)}.border-blue-500\\/40{border-color:#3080ff66}@supports (color:color-mix(in lab,red,red)){.border-blue-500\\/40{border-color:color-mix(in oklab,var(--color-blue-500)40%,transparent)}}.border-blue-600{border-color:var(--color-blue-600)}.border-borderc{border-color:var(--color-borderc)}.border-darkborderc{border-color:var(--color-darkborderc)}.border-darkbutton{border-color:var(--color-darkbutton)}.border-gray-300{border-color:var(--color-gray-300)}.border-gray-400{border-color:var(--color-gray-400)}.border-gray-700{border-color:var(--color-gray-700)}.border-gray-800{border-color:var(--color-gray-800)}.border-green-500{border-color:var(--color-green-500)}.border-green-500\\/40{border-color:#00c75866}@supports (color:color-mix(in lab,red,red)){.border-green-500\\/40{border-color:color-mix(in oklab,var(--color-green-500)40%,transparent)}}.border-red-500{border-color:var(--color-red-500)}.border-red-500\\/40{border-color:#fb2c3666}@supports (color:color-mix(in lab,red,red)){.border-red-500\\/40{border-color:color-mix(in oklab,var(--color-red-500)40%,transparent)}}.border-red-600{border-color:var(--color-red-600)}.border-selected{border-color:var(--color-selected)}.border-stone-500{border-color:var(--color-stone-500)}.border-textcolor\\/10{border-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.border-textcolor\\/10{border-color:color-mix(in oklab,var(--color-textcolor)10%,transparent)}}.border-textcolor2{border-color:var(--color-textcolor2)}.border-transparent{border-color:#0000}.border-white\\/10{border-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.border-white\\/10{border-color:color-mix(in oklab,var(--color-white)10%,transparent)}}.border-white\\/15{border-color:#ffffff26}@supports (color:color-mix(in lab,red,red)){.border-white\\/15{border-color:color-mix(in oklab,var(--color-white)15%,transparent)}}.border-white\\/20{border-color:#fff3}@supports (color:color-mix(in lab,red,red)){.border-white\\/20{border-color:color-mix(in oklab,var(--color-white)20%,transparent)}}.border-yellow-600{border-color:var(--color-yellow-600)}.border-zinc-600{border-color:var(--color-zinc-600)}.border-zinc-600\\/60{border-color:#52525c99}@supports (color:color-mix(in lab,red,red)){.border-zinc-600\\/60{border-color:color-mix(in oklab,var(--color-zinc-600)60%,transparent)}}.border-zinc-700{border-color:var(--color-zinc-700)}.border-x-blue-500{border-inline-color:var(--color-blue-500)}.border-x-red-500{border-inline-color:var(--color-red-500)}.border-y-red-500{border-block-color:var(--color-red-500)}.border-y-selected{border-block-color:var(--color-selected)}.border-t-bgcolor{border-top-color:var(--color-bgcolor)}.border-t-darkborderc{border-top-color:var(--color-darkborderc)}.border-t-gray-900{border-top-color:var(--color-gray-900)}.border-t-selected{border-top-color:var(--color-selected)}.border-t-transparent{border-top-color:#0000}.border-r-bgcolor{border-right-color:var(--color-bgcolor)}.border-r-darkborderc{border-right-color:var(--color-darkborderc)}.border-r-selected{border-right-color:var(--color-selected)}.border-b-darkborderc{border-bottom-color:var(--color-darkborderc)}.border-b-gray-200{border-bottom-color:var(--color-gray-200)}.border-b-red-500{border-bottom-color:var(--color-red-500)}.border-b-selected{border-bottom-color:var(--color-selected)}.border-l-black{border-left-color:var(--color-black)}.border-l-blue-500{border-left-color:var(--color-blue-500)}.border-l-gray-500{border-left-color:var(--color-gray-500)}.border-l-green-500{border-left-color:var(--color-green-500)}.border-l-red-500{border-left-color:var(--color-red-500)}.border-l-selected{border-left-color:var(--color-selected)}.border-l-yellow-500{border-left-color:var(--color-yellow-500)}.bg-\\[\\#212121\\]{background-color:#212121}.bg-\\[\\#303030\\]{background-color:#303030}.bg-\\[\\#bbbbbb\\]{background-color:#bbb}.bg-amber-700{background-color:var(--color-amber-700)}.bg-bgcolor,.bg-bgcolor\\/30{background-color:var(--color-bgcolor)}@supports (color:color-mix(in lab,red,red)){.bg-bgcolor\\/30{background-color:color-mix(in oklab,var(--color-bgcolor)30%,transparent)}}.bg-bgcolor\\/80{background-color:var(--color-bgcolor)}@supports (color:color-mix(in lab,red,red)){.bg-bgcolor\\/80{background-color:color-mix(in oklab,var(--color-bgcolor)80%,transparent)}}.bg-black{background-color:var(--color-black)}.bg-black\\/10{background-color:#0000001a}@supports (color:color-mix(in lab,red,red)){.bg-black\\/10{background-color:color-mix(in oklab,var(--color-black)10%,transparent)}}.bg-black\\/20{background-color:#0003}@supports (color:color-mix(in lab,red,red)){.bg-black\\/20{background-color:color-mix(in oklab,var(--color-black)20%,transparent)}}.bg-black\\/30{background-color:#0000004d}@supports (color:color-mix(in lab,red,red)){.bg-black\\/30{background-color:color-mix(in oklab,var(--color-black)30%,transparent)}}.bg-black\\/40{background-color:#0006}@supports (color:color-mix(in lab,red,red)){.bg-black\\/40{background-color:color-mix(in oklab,var(--color-black)40%,transparent)}}.bg-black\\/50{background-color:#00000080}@supports (color:color-mix(in lab,red,red)){.bg-black\\/50{background-color:color-mix(in oklab,var(--color-black)50%,transparent)}}.bg-black\\/60{background-color:#0009}@supports (color:color-mix(in lab,red,red)){.bg-black\\/60{background-color:color-mix(in oklab,var(--color-black)60%,transparent)}}.bg-black\\/70{background-color:#000000b3}@supports (color:color-mix(in lab,red,red)){.bg-black\\/70{background-color:color-mix(in oklab,var(--color-black)70%,transparent)}}.bg-black\\/80{background-color:#000c}@supports (color:color-mix(in lab,red,red)){.bg-black\\/80{background-color:color-mix(in oklab,var(--color-black)80%,transparent)}}.bg-black\\/90{background-color:#000000e6}@supports (color:color-mix(in lab,red,red)){.bg-black\\/90{background-color:color-mix(in oklab,var(--color-black)90%,transparent)}}.bg-blue-200{background-color:var(--color-blue-200)}.bg-blue-200\\/50{background-color:#bedbff80}@supports (color:color-mix(in lab,red,red)){.bg-blue-200\\/50{background-color:color-mix(in oklab,var(--color-blue-200)50%,transparent)}}.bg-blue-500{background-color:var(--color-blue-500)}.bg-blue-500\\/10{background-color:#3080ff1a}@supports (color:color-mix(in lab,red,red)){.bg-blue-500\\/10{background-color:color-mix(in oklab,var(--color-blue-500)10%,transparent)}}.bg-blue-500\\/15{background-color:#3080ff26}@supports (color:color-mix(in lab,red,red)){.bg-blue-500\\/15{background-color:color-mix(in oklab,var(--color-blue-500)15%,transparent)}}.bg-blue-600{background-color:var(--color-blue-600)}.bg-blue-700\\/20{background-color:#1447e633}@supports (color:color-mix(in lab,red,red)){.bg-blue-700\\/20{background-color:color-mix(in oklab,var(--color-blue-700)20%,transparent)}}.bg-blue-700\\/50{background-color:#1447e680}@supports (color:color-mix(in lab,red,red)){.bg-blue-700\\/50{background-color:color-mix(in oklab,var(--color-blue-700)50%,transparent)}}.bg-blue-800{background-color:var(--color-blue-800)}.bg-blue-900{background-color:var(--color-blue-900)}.bg-blue-900\\/70{background-color:#1c398eb3}@supports (color:color-mix(in lab,red,red)){.bg-blue-900\\/70{background-color:color-mix(in oklab,var(--color-blue-900)70%,transparent)}}.bg-borderc{background-color:var(--color-borderc)}.bg-danger-600{background-color:var(--color-danger-600)}.bg-darkbg,.bg-darkbg\\/20{background-color:var(--color-darkbg)}@supports (color:color-mix(in lab,red,red)){.bg-darkbg\\/20{background-color:color-mix(in oklab,var(--color-darkbg)20%,transparent)}}.bg-darkbg\\/50{background-color:var(--color-darkbg)}@supports (color:color-mix(in lab,red,red)){.bg-darkbg\\/50{background-color:color-mix(in oklab,var(--color-darkbg)50%,transparent)}}.bg-darkbg\\/70{background-color:var(--color-darkbg)}@supports (color:color-mix(in lab,red,red)){.bg-darkbg\\/70{background-color:color-mix(in oklab,var(--color-darkbg)70%,transparent)}}.bg-darkborderc{background-color:var(--color-darkborderc)}.bg-darkbutton{background-color:var(--color-darkbutton)}.bg-emerald-600{background-color:var(--color-emerald-600)}.bg-emerald-900\\/60{background-color:#004e3b99}@supports (color:color-mix(in lab,red,red)){.bg-emerald-900\\/60{background-color:color-mix(in oklab,var(--color-emerald-900)60%,transparent)}}.bg-gray-100{background-color:var(--color-gray-100)}.bg-gray-200{background-color:var(--color-gray-200)}.bg-gray-200\\/50{background-color:#e5e7eb80}@supports (color:color-mix(in lab,red,red)){.bg-gray-200\\/50{background-color:color-mix(in oklab,var(--color-gray-200)50%,transparent)}}.bg-gray-500{background-color:var(--color-gray-500)}.bg-gray-600{background-color:var(--color-gray-600)}.bg-gray-700{background-color:var(--color-gray-700)}.bg-gray-800{background-color:var(--color-gray-800)}.bg-gray-900{background-color:var(--color-gray-900)}.bg-green-500{background-color:var(--color-green-500)}.bg-green-500\\/10{background-color:#00c7581a}@supports (color:color-mix(in lab,red,red)){.bg-green-500\\/10{background-color:color-mix(in oklab,var(--color-green-500)10%,transparent)}}.bg-green-500\\/15{background-color:#00c75826}@supports (color:color-mix(in lab,red,red)){.bg-green-500\\/15{background-color:color-mix(in oklab,var(--color-green-500)15%,transparent)}}.bg-green-500\\/20{background-color:#00c75833}@supports (color:color-mix(in lab,red,red)){.bg-green-500\\/20{background-color:color-mix(in oklab,var(--color-green-500)20%,transparent)}}.bg-green-500\\/70{background-color:#00c758b3}@supports (color:color-mix(in lab,red,red)){.bg-green-500\\/70{background-color:color-mix(in oklab,var(--color-green-500)70%,transparent)}}.bg-green-600{background-color:var(--color-green-600)}.bg-green-700{background-color:var(--color-green-700)}.bg-green-700\\/20{background-color:#00813833}@supports (color:color-mix(in lab,red,red)){.bg-green-700\\/20{background-color:color-mix(in oklab,var(--color-green-700)20%,transparent)}}.bg-green-700\\/50{background-color:#00813880}@supports (color:color-mix(in lab,red,red)){.bg-green-700\\/50{background-color:color-mix(in oklab,var(--color-green-700)50%,transparent)}}.bg-green-900{background-color:var(--color-green-900)}.bg-green-900\\/70{background-color:#0d542bb3}@supports (color:color-mix(in lab,red,red)){.bg-green-900\\/70{background-color:color-mix(in oklab,var(--color-green-900)70%,transparent)}}.bg-indigo-400{background-color:var(--color-indigo-400)}.bg-indigo-600{background-color:var(--color-indigo-600)}.bg-indigo-700\\/20{background-color:#432dd733}@supports (color:color-mix(in lab,red,red)){.bg-indigo-700\\/20{background-color:color-mix(in oklab,var(--color-indigo-700)20%,transparent)}}.bg-indigo-700\\/50{background-color:#432dd780}@supports (color:color-mix(in lab,red,red)){.bg-indigo-700\\/50{background-color:color-mix(in oklab,var(--color-indigo-700)50%,transparent)}}.bg-indigo-900{background-color:var(--color-indigo-900)}.bg-indigo-900\\/60{background-color:#312c8599}@supports (color:color-mix(in lab,red,red)){.bg-indigo-900\\/60{background-color:color-mix(in oklab,var(--color-indigo-900)60%,transparent)}}.bg-orange-800{background-color:var(--color-orange-800)}.bg-pink-700\\/20{background-color:#c4005c33}@supports (color:color-mix(in lab,red,red)){.bg-pink-700\\/20{background-color:color-mix(in oklab,var(--color-pink-700)20%,transparent)}}.bg-pink-700\\/50{background-color:#c4005c80}@supports (color:color-mix(in lab,red,red)){.bg-pink-700\\/50{background-color:color-mix(in oklab,var(--color-pink-700)50%,transparent)}}.bg-pink-900{background-color:var(--color-pink-900)}.bg-primary-600{background-color:var(--color-primary-600)}.bg-purple-700\\/20{background-color:#8200da33}@supports (color:color-mix(in lab,red,red)){.bg-purple-700\\/20{background-color:color-mix(in oklab,var(--color-purple-700)20%,transparent)}}.bg-purple-700\\/50{background-color:#8200da80}@supports (color:color-mix(in lab,red,red)){.bg-purple-700\\/50{background-color:color-mix(in oklab,var(--color-purple-700)50%,transparent)}}.bg-purple-900{background-color:var(--color-purple-900)}.bg-purple-900\\/70{background-color:#59168bb3}@supports (color:color-mix(in lab,red,red)){.bg-purple-900\\/70{background-color:color-mix(in oklab,var(--color-purple-900)70%,transparent)}}.bg-red-500{background-color:var(--color-red-500)}.bg-red-500\\/10{background-color:#fb2c361a}@supports (color:color-mix(in lab,red,red)){.bg-red-500\\/10{background-color:color-mix(in oklab,var(--color-red-500)10%,transparent)}}.bg-red-500\\/15{background-color:#fb2c3626}@supports (color:color-mix(in lab,red,red)){.bg-red-500\\/15{background-color:color-mix(in oklab,var(--color-red-500)15%,transparent)}}.bg-red-500\\/20{background-color:#fb2c3633}@supports (color:color-mix(in lab,red,red)){.bg-red-500\\/20{background-color:color-mix(in oklab,var(--color-red-500)20%,transparent)}}.bg-red-600{background-color:var(--color-red-600)}.bg-red-600\\/80{background-color:#e40014cc}@supports (color:color-mix(in lab,red,red)){.bg-red-600\\/80{background-color:color-mix(in oklab,var(--color-red-600)80%,transparent)}}.bg-red-700{background-color:var(--color-red-700)}.bg-red-700\\/20{background-color:#bf000f33}@supports (color:color-mix(in lab,red,red)){.bg-red-700\\/20{background-color:color-mix(in oklab,var(--color-red-700)20%,transparent)}}.bg-red-700\\/50{background-color:#bf000f80}@supports (color:color-mix(in lab,red,red)){.bg-red-700\\/50{background-color:color-mix(in oklab,var(--color-red-700)50%,transparent)}}.bg-red-800{background-color:var(--color-red-800)}.bg-red-900{background-color:var(--color-red-900)}.bg-selected{background-color:var(--color-selected)}.bg-slate-500{background-color:var(--color-slate-500)}.bg-slate-700{background-color:var(--color-slate-700)}.bg-stone-900{background-color:var(--color-stone-900)}.bg-textcolor\\/5{background-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.bg-textcolor\\/5{background-color:color-mix(in oklab,var(--color-textcolor)5%,transparent)}}.bg-textcolor\\/10{background-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.bg-textcolor\\/10{background-color:color-mix(in oklab,var(--color-textcolor)10%,transparent)}}.bg-textcolor\\/15{background-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.bg-textcolor\\/15{background-color:color-mix(in oklab,var(--color-textcolor)15%,transparent)}}.bg-textcolor2{background-color:var(--color-textcolor2)}.bg-transparent{background-color:#0000}.bg-white{background-color:var(--color-white)}.bg-white\\/10{background-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.bg-white\\/10{background-color:color-mix(in oklab,var(--color-white)10%,transparent)}}.bg-yellow-100{background-color:var(--color-yellow-100)}.bg-yellow-600{background-color:var(--color-yellow-600)}.bg-yellow-700\\/20{background-color:#a3610033}@supports (color:color-mix(in lab,red,red)){.bg-yellow-700\\/20{background-color:color-mix(in oklab,var(--color-yellow-700)20%,transparent)}}.bg-yellow-700\\/50{background-color:#a3610080}@supports (color:color-mix(in lab,red,red)){.bg-yellow-700\\/50{background-color:color-mix(in oklab,var(--color-yellow-700)50%,transparent)}}.bg-yellow-900{background-color:var(--color-yellow-900)}.bg-yellow-900\\/70{background-color:#733e0ab3}@supports (color:color-mix(in lab,red,red)){.bg-yellow-900\\/70{background-color:color-mix(in oklab,var(--color-yellow-900)70%,transparent)}}.bg-zinc-600{background-color:var(--color-zinc-600)}.bg-zinc-700{background-color:var(--color-zinc-700)}.bg-zinc-700\\/40{background-color:#3f3f4666}@supports (color:color-mix(in lab,red,red)){.bg-zinc-700\\/40{background-color:color-mix(in oklab,var(--color-zinc-700)40%,transparent)}}.bg-zinc-700\\/65{background-color:#3f3f46a6}@supports (color:color-mix(in lab,red,red)){.bg-zinc-700\\/65{background-color:color-mix(in oklab,var(--color-zinc-700)65%,transparent)}}.bg-zinc-800{background-color:var(--color-zinc-800)}.bg-zinc-800\\/50{background-color:#27272a80}@supports (color:color-mix(in lab,red,red)){.bg-zinc-800\\/50{background-color:color-mix(in oklab,var(--color-zinc-800)50%,transparent)}}.bg-zinc-900{background-color:var(--color-zinc-900)}.bg-linear-to-b{--tw-gradient-position:to bottom}@supports (background-image:linear-gradient(in lab,red,red)){.bg-linear-to-b{--tw-gradient-position:to bottom in oklab}}.bg-linear-to-b{background-image:linear-gradient(var(--tw-gradient-stops))}.bg-linear-to-br{--tw-gradient-position:to bottom right}@supports (background-image:linear-gradient(in lab,red,red)){.bg-linear-to-br{--tw-gradient-position:to bottom right in oklab}}.bg-linear-to-br{background-image:linear-gradient(var(--tw-gradient-stops))}.bg-linear-to-r{--tw-gradient-position:to right}@supports (background-image:linear-gradient(in lab,red,red)){.bg-linear-to-r{--tw-gradient-position:to right in oklab}}.bg-linear-to-r{background-image:linear-gradient(var(--tw-gradient-stops))}.bg-\\[linear-gradient\\(135deg\\,rgba\\(255\\,255\\,255\\,0\\.06\\)_0\\,rgba\\(255\\,255\\,255\\,0\\.06\\)_10px\\,rgba\\(255\\,255\\,255\\,0\\.02\\)_10px\\,rgba\\(255\\,255\\,255\\,0\\.02\\)_20px\\)\\]{background-image:linear-gradient(135deg,#ffffff0f 0 10px,#ffffff05 10px 20px)}.from-blue-500{--tw-gradient-from:var(--color-blue-500);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position),var(--tw-gradient-from)var(--tw-gradient-from-position),var(--tw-gradient-to)var(--tw-gradient-to-position))}.from-gray-100{--tw-gradient-from:var(--color-gray-100);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position),var(--tw-gradient-from)var(--tw-gradient-from-position),var(--tw-gradient-to)var(--tw-gradient-to-position))}.from-gray-200{--tw-gradient-from:var(--color-gray-200);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position),var(--tw-gradient-from)var(--tw-gradient-from-position),var(--tw-gradient-to)var(--tw-gradient-to-position))}.to-gray-200{--tw-gradient-to:var(--color-gray-200);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position),var(--tw-gradient-from)var(--tw-gradient-from-position),var(--tw-gradient-to)var(--tw-gradient-to-position))}.to-gray-300{--tw-gradient-to:var(--color-gray-300);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position),var(--tw-gradient-from)var(--tw-gradient-from-position),var(--tw-gradient-to)var(--tw-gradient-to-position))}.to-purple-800{--tw-gradient-to:var(--color-purple-800);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position),var(--tw-gradient-from)var(--tw-gradient-from-position),var(--tw-gradient-to)var(--tw-gradient-to-position))}.bg-\\[length\\:20px_20px\\]{background-size:20px 20px}.bg-center{background-position:50%}.bg-top{background-position:top}.object-contain{object-fit:contain}.object-cover{object-fit:cover}.object-top{object-position:top}.p-0{padding:calc(var(--spacing)*0)}.p-1{padding:calc(var(--spacing)*1)}.p-1\\.5{padding:calc(var(--spacing)*1.5)}.p-2{padding:calc(var(--spacing)*2)}.p-2\\.5{padding:calc(var(--spacing)*2.5)}.p-3{padding:calc(var(--spacing)*3)}.p-4{padding:calc(var(--spacing)*4)}.p-5{padding:calc(var(--spacing)*5)}.p-6{padding:calc(var(--spacing)*6)}.p-px{padding:1px}.px-0{padding-inline:calc(var(--spacing)*0)}.px-0\\.5{padding-inline:calc(var(--spacing)*.5)}.px-1{padding-inline:calc(var(--spacing)*1)}.px-1\\.5{padding-inline:calc(var(--spacing)*1.5)}.px-2{padding-inline:calc(var(--spacing)*2)}.px-2\\.5{padding-inline:calc(var(--spacing)*2.5)}.px-3{padding-inline:calc(var(--spacing)*3)}.px-3\\.5{padding-inline:calc(var(--spacing)*3.5)}.px-4{padding-inline:calc(var(--spacing)*4)}.px-5{padding-inline:calc(var(--spacing)*5)}.px-6{padding-inline:calc(var(--spacing)*6)}.px-8{padding-inline:calc(var(--spacing)*8)}.py-0\\.5{padding-block:calc(var(--spacing)*.5)}.py-1{padding-block:calc(var(--spacing)*1)}.py-1\\.5{padding-block:calc(var(--spacing)*1.5)}.py-2{padding-block:calc(var(--spacing)*2)}.py-2\\.5{padding-block:calc(var(--spacing)*2.5)}.py-3{padding-block:calc(var(--spacing)*3)}.py-4{padding-block:calc(var(--spacing)*4)}.py-6{padding-block:calc(var(--spacing)*6)}.py-8{padding-block:calc(var(--spacing)*8)}.py-10{padding-block:calc(var(--spacing)*10)}.py-12{padding-block:calc(var(--spacing)*12)}.pt-2{padding-top:calc(var(--spacing)*2)}.pt-3{padding-top:calc(var(--spacing)*3)}.pt-8{padding-top:calc(var(--spacing)*8)}.pt-\\[4px\\]{padding-top:4px}.pr-0{padding-right:calc(var(--spacing)*0)}.pr-1{padding-right:calc(var(--spacing)*1)}.pr-2{padding-right:calc(var(--spacing)*2)}.pr-3{padding-right:calc(var(--spacing)*3)}.pb-0{padding-bottom:calc(var(--spacing)*0)}.pb-2{padding-bottom:calc(var(--spacing)*2)}.pb-\\[2px\\]{padding-bottom:2px}.pl-2{padding-left:calc(var(--spacing)*2)}.pl-3{padding-left:calc(var(--spacing)*3)}.pl-7{padding-left:calc(var(--spacing)*7)}.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}.text-start{text-align:start}.align-middle{vertical-align:middle}.font-mono{font-family:var(--font-mono)}.text-2xl{font-size:var(--text-2xl);line-height:var(--tw-leading,var(--text-2xl--line-height))}.text-3xl{font-size:var(--text-3xl);line-height:var(--tw-leading,var(--text-3xl--line-height))}.text-4xl{font-size:var(--text-4xl);line-height:var(--tw-leading,var(--text-4xl--line-height))}.text-6xl{font-size:var(--text-6xl);line-height:var(--tw-leading,var(--text-6xl--line-height))}.text-base{font-size:var(--text-base);line-height:var(--tw-leading,var(--text-base--line-height))}.text-lg{font-size:var(--text-lg);line-height:var(--tw-leading,var(--text-lg--line-height))}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xl{font-size:var(--text-xl);line-height:var(--tw-leading,var(--text-xl--line-height))}.text-xs{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}.text-\\[0\\.6rem\\]{font-size:.6rem}.text-\\[10px\\]{font-size:10px}.text-\\[11px\\]{font-size:11px}.leading-5{--tw-leading:calc(var(--spacing)*5);line-height:calc(var(--spacing)*5)}.leading-none{--tw-leading:1;line-height:1}.leading-relaxed{--tw-leading:var(--leading-relaxed);line-height:var(--leading-relaxed)}.leading-snug{--tw-leading:var(--leading-snug);line-height:var(--leading-snug)}.leading-tight{--tw-leading:var(--leading-tight);line-height:var(--leading-tight)}.font-black{--tw-font-weight:var(--font-weight-black);font-weight:var(--font-weight-black)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.font-extralight{--tw-font-weight:var(--font-weight-extralight);font-weight:var(--font-weight-extralight)}.font-light{--tw-font-weight:var(--font-weight-light);font-weight:var(--font-weight-light)}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.font-semibold{--tw-font-weight:var(--font-weight-semibold);font-weight:var(--font-weight-semibold)}.tracking-wide{--tw-tracking:var(--tracking-wide);letter-spacing:var(--tracking-wide)}.tracking-wider{--tw-tracking:var(--tracking-wider);letter-spacing:var(--tracking-wider)}.text-nowrap{text-wrap:nowrap}.text-wrap{text-wrap:wrap}.wrap-break-word{overflow-wrap:break-word}.break-all{word-break:break-all}.text-ellipsis{text-overflow:ellipsis}.hyphens-auto{-webkit-hyphens:auto;hyphens:auto}.whitespace-normal{white-space:normal}.whitespace-nowrap{white-space:nowrap}.whitespace-pre-wrap{white-space:pre-wrap}.text-\\[\\#bbbbbb\\]{color:#bbb}.text-amber-400{color:var(--color-amber-400)}.text-amber-500{color:var(--color-amber-500)}.text-black{color:var(--color-black)}.text-blue-200{color:var(--color-blue-200)}.text-blue-300{color:var(--color-blue-300)}.text-blue-400{color:var(--color-blue-400)}.text-blue-500{color:var(--color-blue-500)}.text-blue-600{color:var(--color-blue-600)}.text-borderc{color:var(--color-borderc)}.text-cyan-500{color:var(--color-cyan-500)}.text-draculared{color:var(--color-draculared)}.text-emerald-400{color:var(--color-emerald-400)}.text-emerald-600{color:var(--color-emerald-600)}.text-gray-100{color:var(--color-gray-100)}.text-gray-200{color:var(--color-gray-200)}.text-gray-300{color:var(--color-gray-300)}.text-gray-400{color:var(--color-gray-400)}.text-gray-500{color:var(--color-gray-500)}.text-gray-600{color:var(--color-gray-600)}.text-gray-800{color:var(--color-gray-800)}.text-green-200{color:var(--color-green-200)}.text-green-200\\/90{color:#b9f8cfe6}@supports (color:color-mix(in lab,red,red)){.text-green-200\\/90{color:color-mix(in oklab,var(--color-green-200)90%,transparent)}}.text-green-300{color:var(--color-green-300)}.text-green-400{color:var(--color-green-400)}.text-green-500{color:var(--color-green-500)}.text-green-600{color:var(--color-green-600)}.text-green-700{color:var(--color-green-700)}.text-indigo-400{color:var(--color-indigo-400)}.text-neutral-50{color:var(--color-neutral-50)}.text-orange-400{color:var(--color-orange-400)}.text-purple-200{color:var(--color-purple-200)}.text-purple-500{color:var(--color-purple-500)}.text-red-200\\/90{color:#ffcacae6}@supports (color:color-mix(in lab,red,red)){.text-red-200\\/90{color:color-mix(in oklab,var(--color-red-200)90%,transparent)}}.text-red-300{color:var(--color-red-300)}.text-red-400{color:var(--color-red-400)}.text-red-500{color:var(--color-red-500)}.text-red-700{color:var(--color-red-700)}.text-textcolor,.text-textcolor\\/20{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.text-textcolor\\/20{color:color-mix(in oklab,var(--color-textcolor)20%,transparent)}}.text-textcolor\\/30{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.text-textcolor\\/30{color:color-mix(in oklab,var(--color-textcolor)30%,transparent)}}.text-textcolor\\/40{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.text-textcolor\\/40{color:color-mix(in oklab,var(--color-textcolor)40%,transparent)}}.text-textcolor\\/50{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.text-textcolor\\/50{color:color-mix(in oklab,var(--color-textcolor)50%,transparent)}}.text-textcolor\\/60{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.text-textcolor\\/60{color:color-mix(in oklab,var(--color-textcolor)60%,transparent)}}.text-textcolor\\/70{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.text-textcolor\\/70{color:color-mix(in oklab,var(--color-textcolor)70%,transparent)}}.text-textcolor\\/80{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.text-textcolor\\/80{color:color-mix(in oklab,var(--color-textcolor)80%,transparent)}}.text-textcolor\\/90{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.text-textcolor\\/90{color:color-mix(in oklab,var(--color-textcolor)90%,transparent)}}.text-textcolor2,.text-textcolor2\\/40{color:var(--color-textcolor2)}@supports (color:color-mix(in lab,red,red)){.text-textcolor2\\/40{color:color-mix(in oklab,var(--color-textcolor2)40%,transparent)}}.text-textcolor2\\/50{color:var(--color-textcolor2)}@supports (color:color-mix(in lab,red,red)){.text-textcolor2\\/50{color:color-mix(in oklab,var(--color-textcolor2)50%,transparent)}}.text-textcolor2\\/60{color:var(--color-textcolor2)}@supports (color:color-mix(in lab,red,red)){.text-textcolor2\\/60{color:color-mix(in oklab,var(--color-textcolor2)60%,transparent)}}.text-textcolor2\\/70{color:var(--color-textcolor2)}@supports (color:color-mix(in lab,red,red)){.text-textcolor2\\/70{color:color-mix(in oklab,var(--color-textcolor2)70%,transparent)}}.text-textcolor2\\/80{color:var(--color-textcolor2)}@supports (color:color-mix(in lab,red,red)){.text-textcolor2\\/80{color:color-mix(in oklab,var(--color-textcolor2)80%,transparent)}}.text-transparent{color:#0000}.text-violet-500{color:var(--color-violet-500)}.text-white{color:var(--color-white)}.text-white\\/40{color:#fff6}@supports (color:color-mix(in lab,red,red)){.text-white\\/40{color:color-mix(in oklab,var(--color-white)40%,transparent)}}.text-white\\/50{color:#ffffff80}@supports (color:color-mix(in lab,red,red)){.text-white\\/50{color:color-mix(in oklab,var(--color-white)50%,transparent)}}.text-white\\/70{color:#ffffffb3}@supports (color:color-mix(in lab,red,red)){.text-white\\/70{color:color-mix(in oklab,var(--color-white)70%,transparent)}}.text-white\\/90{color:#ffffffe6}@supports (color:color-mix(in lab,red,red)){.text-white\\/90{color:color-mix(in oklab,var(--color-white)90%,transparent)}}.text-yellow-200{color:var(--color-yellow-200)}.text-yellow-300{color:var(--color-yellow-300)}.text-yellow-400{color:var(--color-yellow-400)}.text-yellow-400\\/70{color:#fac800b3}@supports (color:color-mix(in lab,red,red)){.text-yellow-400\\/70{color:color-mix(in oklab,var(--color-yellow-400)70%,transparent)}}.text-yellow-500{color:var(--color-yellow-500)}.text-yellow-800{color:var(--color-yellow-800)}.text-zinc-100{color:var(--color-zinc-100)}.text-zinc-200{color:var(--color-zinc-200)}.text-zinc-300{color:var(--color-zinc-300)}.text-zinc-400{color:var(--color-zinc-400)}.text-zinc-500{color:var(--color-zinc-500)}.text-zinc-600{color:var(--color-zinc-600)}.capitalize{text-transform:capitalize}.lowercase{text-transform:lowercase}.uppercase{text-transform:uppercase}.italic{font-style:italic}.ordinal{--tw-ordinal:ordinal;font-variant-numeric:var(--tw-ordinal,)var(--tw-slashed-zero,)var(--tw-numeric-figure,)var(--tw-numeric-spacing,)var(--tw-numeric-fraction,)}.overline{text-decoration-line:overline}.underline{text-decoration-line:underline}.placeholder-\\[\\#bbbbbb\\]::placeholder{color:#bbb}.placeholder-white\\/30::placeholder{color:#ffffff4d}@supports (color:color-mix(in lab,red,red)){.placeholder-white\\/30::placeholder{color:color-mix(in oklab,var(--color-white)30%,transparent)}}.placeholder-zinc-500::placeholder{color:var(--color-zinc-500)}.accent-green-500{accent-color:var(--color-green-500)}.opacity-15{opacity:.15}.opacity-20{opacity:.2}.opacity-25{opacity:.25}.opacity-30{opacity:.3}.opacity-40{opacity:.4}.opacity-50{opacity:.5}.opacity-60{opacity:.6}.opacity-70{opacity:.7}.opacity-75{opacity:.75}.shadow{--tw-shadow:0 1px 3px 0 var(--tw-shadow-color,#0000001a),0 1px 2px -1px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-2xl{--tw-shadow:0 25px 50px -12px var(--tw-shadow-color,#00000040);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-2xs{--tw-shadow:0 1px var(--tw-shadow-color,#0000000d);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-lg{--tw-shadow:0 10px 15px -3px var(--tw-shadow-color,#0000001a),0 4px 6px -4px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-md{--tw-shadow:0 4px 6px -1px var(--tw-shadow-color,#0000001a),0 2px 4px -2px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px var(--tw-shadow-color,#0000001a),0 8px 10px -6px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-xs{--tw-shadow:0 1px 2px 0 var(--tw-shadow-color,#0000000d);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.ring,.ring-1{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(1px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.ring-2{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(2px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.ring-3{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(3px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.ring-blue-500{--tw-ring-color:var(--color-blue-500)}.ring-red-500{--tw-ring-color:var(--color-red-500)}.ring-white\\/20{--tw-ring-color:#fff3}@supports (color:color-mix(in lab,red,red)){.ring-white\\/20{--tw-ring-color:color-mix(in oklab,var(--color-white)20%,transparent)}}.ring-white\\/50{--tw-ring-color:#ffffff80}@supports (color:color-mix(in lab,red,red)){.ring-white\\/50{--tw-ring-color:color-mix(in oklab,var(--color-white)50%,transparent)}}.ring-zinc-500{--tw-ring-color:var(--color-zinc-500)}.ring-offset-1{--tw-ring-offset-width:1px;--tw-ring-offset-shadow:var(--tw-ring-inset,)0 0 0 var(--tw-ring-offset-width)var(--tw-ring-offset-color)}.ring-offset-bgcolor{--tw-ring-offset-color:var(--color-bgcolor)}.outline-hidden{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.outline-hidden{outline-offset:2px;outline:2px solid #0000}}.outline{outline-style:var(--tw-outline-style);outline-width:1px}.blur{--tw-blur:blur(8px);filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}.drop-shadow-2xl{--tw-drop-shadow-size:drop-shadow(0 25px 25px var(--tw-drop-shadow-color,#00000026));--tw-drop-shadow:drop-shadow(var(--drop-shadow-2xl));filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}.drop-shadow-lg{--tw-drop-shadow-size:drop-shadow(0 4px 4px var(--tw-drop-shadow-color,#00000026));--tw-drop-shadow:drop-shadow(var(--drop-shadow-lg));filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}.grayscale{--tw-grayscale:grayscale(100%);filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}.invert{--tw-invert:invert(100%);filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}.filter{filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}.backdrop-blur{--tw-backdrop-blur:blur(8px);-webkit-backdrop-filter:var(--tw-backdrop-blur,)var(--tw-backdrop-brightness,)var(--tw-backdrop-contrast,)var(--tw-backdrop-grayscale,)var(--tw-backdrop-hue-rotate,)var(--tw-backdrop-invert,)var(--tw-backdrop-opacity,)var(--tw-backdrop-saturate,)var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,)var(--tw-backdrop-brightness,)var(--tw-backdrop-contrast,)var(--tw-backdrop-grayscale,)var(--tw-backdrop-hue-rotate,)var(--tw-backdrop-invert,)var(--tw-backdrop-opacity,)var(--tw-backdrop-saturate,)var(--tw-backdrop-sepia,)}.backdrop-blur-sm{--tw-backdrop-blur:blur(var(--blur-sm));-webkit-backdrop-filter:var(--tw-backdrop-blur,)var(--tw-backdrop-brightness,)var(--tw-backdrop-contrast,)var(--tw-backdrop-grayscale,)var(--tw-backdrop-hue-rotate,)var(--tw-backdrop-invert,)var(--tw-backdrop-opacity,)var(--tw-backdrop-saturate,)var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,)var(--tw-backdrop-brightness,)var(--tw-backdrop-contrast,)var(--tw-backdrop-grayscale,)var(--tw-backdrop-hue-rotate,)var(--tw-backdrop-invert,)var(--tw-backdrop-opacity,)var(--tw-backdrop-saturate,)var(--tw-backdrop-sepia,)}.backdrop-filter{-webkit-backdrop-filter:var(--tw-backdrop-blur,)var(--tw-backdrop-brightness,)var(--tw-backdrop-contrast,)var(--tw-backdrop-grayscale,)var(--tw-backdrop-hue-rotate,)var(--tw-backdrop-invert,)var(--tw-backdrop-opacity,)var(--tw-backdrop-saturate,)var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,)var(--tw-backdrop-brightness,)var(--tw-backdrop-contrast,)var(--tw-backdrop-grayscale,)var(--tw-backdrop-hue-rotate,)var(--tw-backdrop-invert,)var(--tw-backdrop-opacity,)var(--tw-backdrop-saturate,)var(--tw-backdrop-sepia,)}.transition{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,opacity,box-shadow,transform,translate,scale,rotate,filter,-webkit-backdrop-filter,backdrop-filter,display,content-visibility,overlay,pointer-events;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[width\\]{transition-property:width;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-all{transition-property:all;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-shadow{transition-property:box-shadow;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.duration-200{--tw-duration:.2s;transition-duration:.2s}.duration-300{--tw-duration:.3s;transition-duration:.3s}.prose-gray{--tw-prose-body:oklch(37.3% .034 259.733);--tw-prose-headings:oklch(21% .034 264.665);--tw-prose-lead:oklch(44.6% .03 256.802);--tw-prose-links:oklch(21% .034 264.665);--tw-prose-bold:oklch(21% .034 264.665);--tw-prose-counters:oklch(55.1% .027 264.364);--tw-prose-bullets:oklch(87.2% .01 258.338);--tw-prose-hr:oklch(92.8% .006 264.531);--tw-prose-quotes:oklch(21% .034 264.665);--tw-prose-quote-borders:oklch(92.8% .006 264.531);--tw-prose-captions:oklch(55.1% .027 264.364);--tw-prose-kbd:oklch(21% .034 264.665);--tw-prose-kbd-shadows:oklab(21% -.00316127 -.0338527/.1);--tw-prose-code:oklch(21% .034 264.665);--tw-prose-pre-code:oklch(92.8% .006 264.531);--tw-prose-pre-bg:oklch(27.8% .033 256.848);--tw-prose-th-borders:oklch(87.2% .01 258.338);--tw-prose-td-borders:oklch(92.8% .006 264.531);--tw-prose-invert-body:oklch(87.2% .01 258.338);--tw-prose-invert-headings:#fff;--tw-prose-invert-lead:oklch(70.7% .022 261.325);--tw-prose-invert-links:#fff;--tw-prose-invert-bold:#fff;--tw-prose-invert-counters:oklch(70.7% .022 261.325);--tw-prose-invert-bullets:oklch(44.6% .03 256.802);--tw-prose-invert-hr:oklch(37.3% .034 259.733);--tw-prose-invert-quotes:oklch(96.7% .003 264.542);--tw-prose-invert-quote-borders:oklch(37.3% .034 259.733);--tw-prose-invert-captions:oklch(70.7% .022 261.325);--tw-prose-invert-kbd:#fff;--tw-prose-invert-kbd-shadows:#ffffff1a;--tw-prose-invert-code:#fff;--tw-prose-invert-pre-code:oklch(87.2% .01 258.338);--tw-prose-invert-pre-bg:#00000080;--tw-prose-invert-th-borders:oklch(44.6% .03 256.802);--tw-prose-invert-td-borders:oklch(37.3% .034 259.733)}.prose-invert{--tw-prose-body:var(--tw-prose-invert-body);--tw-prose-headings:var(--tw-prose-invert-headings);--tw-prose-lead:var(--tw-prose-invert-lead);--tw-prose-links:var(--tw-prose-invert-links);--tw-prose-bold:var(--tw-prose-invert-bold);--tw-prose-counters:var(--tw-prose-invert-counters);--tw-prose-bullets:var(--tw-prose-invert-bullets);--tw-prose-hr:var(--tw-prose-invert-hr);--tw-prose-quotes:var(--tw-prose-invert-quotes);--tw-prose-quote-borders:var(--tw-prose-invert-quote-borders);--tw-prose-captions:var(--tw-prose-invert-captions);--tw-prose-kbd:var(--tw-prose-invert-kbd);--tw-prose-kbd-shadows:var(--tw-prose-invert-kbd-shadows);--tw-prose-code:var(--tw-prose-invert-code);--tw-prose-pre-code:var(--tw-prose-invert-pre-code);--tw-prose-pre-bg:var(--tw-prose-invert-pre-bg);--tw-prose-th-borders:var(--tw-prose-invert-th-borders);--tw-prose-td-borders:var(--tw-prose-invert-td-borders)}.outline-none{--tw-outline-style:none;outline-style:none}.select-none{-webkit-user-select:none;user-select:none}.\\[animation-delay\\:0ms\\]{animation-delay:0s}.\\[animation-delay\\:150ms\\]{animation-delay:.15s}.\\[animation-delay\\:300ms\\]{animation-delay:.3s}.\\[key\\:string\\]{key:string}.\\[method\\:string\\]{method:string}@media(hover:hover){.group-hover\\:h-\\[10px\\]:is(:where(.group):hover *){height:10px}.group-hover\\:bg-white:is(:where(.group):hover *){background-color:var(--color-white)}.group-hover\\:bg-white\\/10:is(:where(.group):hover *){background-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.group-hover\\:bg-white\\/10:is(:where(.group):hover *){background-color:color-mix(in oklab,var(--color-white)10%,transparent)}}.group-hover\\:outline:is(:where(.group):hover *),.group-hover\\:outline-1:is(:where(.group):hover *){outline-style:var(--tw-outline-style);outline-width:1px}.group-hover\\:outline-white\\/15:is(:where(.group):hover *){outline-color:#ffffff26}@supports (color:color-mix(in lab,red,red)){.group-hover\\:outline-white\\/15:is(:where(.group):hover *){outline-color:color-mix(in oklab,var(--color-white)15%,transparent)}}}.peer-focus\\:block:is(:where(.peer):focus~*){display:block}.peer-focus\\:border-textcolor:is(:where(.peer):focus~*){border-color:var(--color-textcolor)}.placeholder\\:text-sm::placeholder{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.placeholder\\:text-textcolor\\/25::placeholder{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.placeholder\\:text-textcolor\\/25::placeholder{color:color-mix(in oklab,var(--color-textcolor)25%,transparent)}}.first\\:mt-0:first-child{margin-top:calc(var(--spacing)*0)}.first\\:border-0:first-child{border-style:var(--tw-border-style);border-width:0}.first\\:pt-0:first-child{padding-top:calc(var(--spacing)*0)}.last\\:mb-0:last-child{margin-bottom:calc(var(--spacing)*0)}.last\\:border-0:last-child{border-style:var(--tw-border-style);border-width:0}.last\\:pb-0:last-child{padding-bottom:calc(var(--spacing)*0)}.focus-within\\:z-40:focus-within{z-index:40}.focus-within\\:border-borderc:focus-within{border-color:var(--color-borderc)}.focus-within\\:text-textcolor:focus-within{color:var(--color-textcolor)}.focus-within\\:ring-2:focus-within{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(2px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.focus-within\\:ring-borderc:focus-within{--tw-ring-color:var(--color-borderc)}.focus-within\\:outline-hidden:focus-within{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.focus-within\\:outline-hidden:focus-within{outline-offset:2px;outline:2px solid #0000}}@media(hover:hover){.hover\\:block:hover{display:block}.hover\\:cursor-grab:hover{cursor:grab}.hover\\:border-blue-500:hover{border-color:var(--color-blue-500)}.hover\\:border-gray-300:hover{border-color:var(--color-gray-300)}.hover\\:border-neutral-200:hover{border-color:var(--color-neutral-200)}.hover\\:border-white\\/40:hover{border-color:#fff6}@supports (color:color-mix(in lab,red,red)){.hover\\:border-white\\/40:hover{border-color:color-mix(in oklab,var(--color-white)40%,transparent)}}.hover\\:bg-bgcolor:hover,.hover\\:bg-bgcolor\\/50:hover{background-color:var(--color-bgcolor)}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-bgcolor\\/50:hover{background-color:color-mix(in oklab,var(--color-bgcolor)50%,transparent)}}.hover\\:bg-black\\/60:hover{background-color:#0009}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-black\\/60:hover{background-color:color-mix(in oklab,var(--color-black)60%,transparent)}}.hover\\:bg-blue-500:hover{background-color:var(--color-blue-500)}.hover\\:bg-blue-600:hover{background-color:var(--color-blue-600)}.hover\\:bg-blue-700:hover{background-color:var(--color-blue-700)}.hover\\:bg-blue-800:hover{background-color:var(--color-blue-800)}.hover\\:bg-danger-500:hover{background-color:var(--color-danger-500)}.hover\\:bg-darkbg:hover{background-color:var(--color-darkbg)}.hover\\:bg-darkbutton:hover{background-color:var(--color-darkbutton)}.hover\\:bg-gray-600:hover{background-color:var(--color-gray-600)}.hover\\:bg-gray-700:hover{background-color:var(--color-gray-700)}.hover\\:bg-green-700:hover{background-color:var(--color-green-700)}.hover\\:bg-indigo-500:hover{background-color:var(--color-indigo-500)}.hover\\:bg-primary-500:hover{background-color:var(--color-primary-500)}.hover\\:bg-red-500:hover{background-color:var(--color-red-500)}.hover\\:bg-red-600:hover{background-color:var(--color-red-600)}.hover\\:bg-red-700:hover{background-color:var(--color-red-700)}.hover\\:bg-selected:hover{background-color:var(--color-selected)}.hover\\:bg-textcolor\\/8:hover{background-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-textcolor\\/8:hover{background-color:color-mix(in oklab,var(--color-textcolor)8%,transparent)}}.hover\\:bg-textcolor\\/10:hover{background-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-textcolor\\/10:hover{background-color:color-mix(in oklab,var(--color-textcolor)10%,transparent)}}.hover\\:bg-textcolor\\/15:hover{background-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-textcolor\\/15:hover{background-color:color-mix(in oklab,var(--color-textcolor)15%,transparent)}}.hover\\:bg-textcolor2:hover{background-color:var(--color-textcolor2)}.hover\\:bg-white\\/10:hover{background-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/10:hover{background-color:color-mix(in oklab,var(--color-white)10%,transparent)}}.hover\\:bg-yellow-700:hover{background-color:var(--color-yellow-700)}.hover\\:bg-zinc-500:hover{background-color:var(--color-zinc-500)}.hover\\:bg-zinc-700:hover{background-color:var(--color-zinc-700)}.hover\\:text-amber-600:hover{color:var(--color-amber-600)}.hover\\:text-blue-300:hover{color:var(--color-blue-300)}.hover\\:text-blue-400:hover{color:var(--color-blue-400)}.hover\\:text-blue-500:hover{color:var(--color-blue-500)}.hover\\:text-draculared:hover{color:var(--color-draculared)}.hover\\:text-green-300:hover{color:var(--color-green-300)}.hover\\:text-green-400:hover{color:var(--color-green-400)}.hover\\:text-green-500:hover{color:var(--color-green-500)}.hover\\:text-orange-300:hover{color:var(--color-orange-300)}.hover\\:text-red-300:hover{color:var(--color-red-300)}.hover\\:text-red-400\\/50:hover{color:#ff656880}@supports (color:color-mix(in lab,red,red)){.hover\\:text-red-400\\/50:hover{color:color-mix(in oklab,var(--color-red-400)50%,transparent)}}.hover\\:text-red-500:hover{color:var(--color-red-500)}.hover\\:text-rose-300:hover{color:var(--color-rose-300)}.hover\\:text-textcolor:hover,.hover\\:text-textcolor\\/50:hover{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.hover\\:text-textcolor\\/50:hover{color:color-mix(in oklab,var(--color-textcolor)50%,transparent)}}.hover\\:text-textcolor\\/90:hover{color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.hover\\:text-textcolor\\/90:hover{color:color-mix(in oklab,var(--color-textcolor)90%,transparent)}}.hover\\:text-white\\/70:hover{color:#ffffffb3}@supports (color:color-mix(in lab,red,red)){.hover\\:text-white\\/70:hover{color:color-mix(in oklab,var(--color-white)70%,transparent)}}.hover\\:text-white\\/80:hover{color:#fffc}@supports (color:color-mix(in lab,red,red)){.hover\\:text-white\\/80:hover{color:color-mix(in oklab,var(--color-white)80%,transparent)}}.hover\\:text-yellow-300:hover{color:var(--color-yellow-300)}.hover\\:text-zinc-200:hover{color:var(--color-zinc-200)}.hover\\:underline:hover{text-decoration-line:underline}.hover\\:opacity-70:hover{opacity:.7}.hover\\:opacity-90:hover{opacity:.9}.hover\\:shadow-lg:hover{--tw-shadow:0 10px 15px -3px var(--tw-shadow-color,#0000001a),0 4px 6px -4px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.hover\\:ring-1:hover{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(1px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.hover\\:ring-2:hover{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(2px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.hover\\:ring-3:hover{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(3px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.hover\\:ring-darkbutton:hover{--tw-ring-color:var(--color-darkbutton)}}.focus\\:border-blue-500:focus{border-color:var(--color-blue-500)}.focus\\:border-borderc:focus{border-color:var(--color-borderc)}.focus\\:border-indigo-400:focus{border-color:var(--color-indigo-400)}.focus\\:border-textcolor:focus,.focus\\:border-textcolor\\/25:focus{border-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.focus\\:border-textcolor\\/25:focus{border-color:color-mix(in oklab,var(--color-textcolor)25%,transparent)}}.focus\\:bg-bgcolor:focus{background-color:var(--color-bgcolor)}.focus\\:bg-selected:focus{background-color:var(--color-selected)}.focus\\:bg-textcolor\\/10:focus{background-color:var(--color-textcolor)}@supports (color:color-mix(in lab,red,red)){.focus\\:bg-textcolor\\/10:focus{background-color:color-mix(in oklab,var(--color-textcolor)10%,transparent)}}.focus\\:bg-white\\/15:focus{background-color:#ffffff26}@supports (color:color-mix(in lab,red,red)){.focus\\:bg-white\\/15:focus{background-color:color-mix(in oklab,var(--color-white)15%,transparent)}}.focus\\:text-draculared:focus{color:var(--color-draculared)}.focus\\:ring-2:focus{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(2px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.focus\\:ring-blue-500:focus{--tw-ring-color:var(--color-blue-500)}.focus\\:ring-borderc:focus{--tw-ring-color:var(--color-borderc)}.focus\\:ring-red-600:focus{--tw-ring-color:var(--color-red-600)}.focus\\:ring-selected:focus{--tw-ring-color:var(--color-selected)}.focus\\:ring-zinc-500:focus{--tw-ring-color:var(--color-zinc-500)}.focus\\:outline-hidden:focus{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.focus\\:outline-hidden:focus{outline-offset:2px;outline:2px solid #0000}}.focus-visible\\:outline-2:focus-visible{outline-style:var(--tw-outline-style);outline-width:2px}.focus-visible\\:outline-offset-2:focus-visible{outline-offset:2px}.focus-visible\\:outline-danger-600:focus-visible{outline-color:var(--color-danger-600)}.focus-visible\\:outline-primary-600:focus-visible{outline-color:var(--color-primary-600)}.focus-visible\\:outline-solid:focus-visible{--tw-outline-style:solid;outline-style:solid}.active\\:cursor-grabbing:active{cursor:grabbing}.disabled\\:pointer-events-none:disabled{pointer-events:none}.disabled\\:cursor-not-allowed:disabled{cursor:not-allowed}.disabled\\:opacity-30:disabled{opacity:.3}.disabled\\:opacity-40:disabled{opacity:.4}.disabled\\:opacity-50:disabled{opacity:.5}@media(min-width:40rem){.sm\\:my-2{margin-block:calc(var(--spacing)*2)}.sm\\:mt-4{margin-top:calc(var(--spacing)*4)}.sm\\:mr-0{margin-right:calc(var(--spacing)*0)}.sm\\:mb-0{margin-bottom:calc(var(--spacing)*0)}.sm\\:mb-4{margin-bottom:calc(var(--spacing)*4)}.sm\\:ml-0{margin-left:calc(var(--spacing)*0)}.sm\\:inline{display:inline}.sm\\:h-28{height:calc(var(--spacing)*28)}.sm\\:h-96{height:var(--height-96)}.sm\\:min-h-56{min-height:calc(var(--spacing)*56)}.sm\\:w-28{width:calc(var(--spacing)*28)}.sm\\:w-72{width:calc(var(--spacing)*72)}.sm\\:min-w-72{min-width:calc(var(--spacing)*72)}.sm\\:flex-row{flex-direction:row}.sm\\:flex-wrap{flex-wrap:wrap}.sm\\:items-center{align-items:center}.sm\\:justify-center{justify-content:center}.sm\\:gap-1{gap:calc(var(--spacing)*1)}.sm\\:gap-4{gap:calc(var(--spacing)*4)}.sm\\:p-2{padding:calc(var(--spacing)*2)}.sm\\:p-3{padding:calc(var(--spacing)*3)}.sm\\:p-4{padding:calc(var(--spacing)*4)}.sm\\:p-6{padding:calc(var(--spacing)*6)}.sm\\:px-3{padding-inline:calc(var(--spacing)*3)}.sm\\:px-4{padding-inline:calc(var(--spacing)*4)}.sm\\:py-2{padding-block:calc(var(--spacing)*2)}.sm\\:py-3{padding-block:calc(var(--spacing)*3)}.sm\\:text-2xl{font-size:var(--text-2xl);line-height:var(--tw-leading,var(--text-2xl--line-height))}}@media(min-width:48rem){.md\\:col-span-2{grid-column:span 2/span 2}.md\\:mt-0{margin-top:calc(var(--spacing)*0)}.md\\:block{display:block}.md\\:flex{display:flex}.md\\:hidden{display:none}.md\\:h-auto{height:auto}.md\\:h-full{height:100%}.md\\:min-h-0{min-height:calc(var(--spacing)*0)}.md\\:w-48{width:calc(var(--spacing)*48)}.md\\:w-96{width:calc(var(--spacing)*96)}.md\\:min-w-138{min-width:var(--min-width-138)}.md\\:flex-1{flex:1}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:flex-col{flex-direction:column}.md\\:flex-row{flex-direction:row}.md\\:overflow-y-auto{overflow-y:auto}.md\\:overflow-y-visible{overflow-y:visible}.md\\:border-r{border-right-style:var(--tw-border-style);border-right-width:1px}.md\\:border-b-0{border-bottom-style:var(--tw-border-style);border-bottom-width:0}.md\\:p-4{padding:calc(var(--spacing)*4)}.md\\:text-lg{font-size:var(--text-lg);line-height:var(--tw-leading,var(--text-lg--line-height))}}@media(min-width:64rem){.lg\\:w-96{width:calc(var(--spacing)*96)}.lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}@media(hover:hover){.lg\\:hover\\:text-green-500:hover{color:var(--color-green-500)}}}}body{background-color:var(--risu-theme-bgcolor);margin:0;padding:0;overflow:hidden}:root{--FontColorStandard:#fafafa;--FontColorBold:#e5e5e5;--FontColorItalic:#8c8d93;--FontColorItalicBold:#8c8d93;--FontColorQuote1:#8c8d93;--FontColorQuote2:#8c8d93;--risu-animation-speed:.2s;--risu-theme-bgcolor:#282a36;--risu-theme-darkbg:#21222c;--risu-theme-borderc:#6272a4;--risu-theme-selected:#44475a;--risu-theme-draculared:#f55;--risu-theme-textcolor:#f5f5f5;--risu-theme-textcolor2:#64748b;--risu-theme-darkborderc:#4b5563;--risu-theme-darkbutton:#374151;--risu-height-size:100%;--risu-font-family:Arial,sans-serif,serif;--risu-theme-neutral-50:#f9fafb;--risu-theme-neutral-100:#f3f4f6;--risu-theme-neutral-200:#e5e7eb;--risu-theme-neutral-300:#d1d5db;--risu-theme-neutral-400:#9ca3af;--risu-theme-neutral-500:#6b7280;--risu-theme-neutral-600:#4b5563;--risu-theme-neutral-700:#374151;--risu-theme-neutral-800:#1f2937;--risu-theme-neutral-900:#111827;--risu-theme-primary-50:#eff6ff;--risu-theme-primary-100:#dbeafe;--risu-theme-primary-200:#bfdbfe;--risu-theme-primary-300:#93c5fd;--risu-theme-primary-400:#60a5fa;--risu-theme-primary-500:#3b82f6;--risu-theme-primary-600:#2563eb;--risu-theme-primary-700:#1d4ed8;--risu-theme-primary-800:#1e40af;--risu-theme-primary-900:#1e3a8a;--risu-theme-secondary-50:#f5f3ff;--risu-theme-secondary-100:#ede9fe;--risu-theme-secondary-200:#ddd6fe;--risu-theme-secondary-300:#c4b5fd;--risu-theme-secondary-400:#a78bfa;--risu-theme-secondary-500:#8b5cf6;--risu-theme-secondary-600:#7c3aed;--risu-theme-secondary-700:#6d28d9;--risu-theme-secondary-800:#5b21b6;--risu-theme-secondary-900:#4c1d95;--risu-theme-danger-50:#fef2f2;--risu-theme-danger-100:#fee2e2;--risu-theme-danger-200:#fecaca;--risu-theme-danger-300:#fca5a5;--risu-theme-danger-400:#f87171;--risu-theme-danger-500:#ef4444;--risu-theme-danger-600:#dc2626;--risu-theme-danger-700:#b91c1c;--risu-theme-danger-800:#991b1b;--risu-theme-danger-900:#7f1d1d;--risu-theme-success-50:#f0fdf4;--risu-theme-success-100:#dcfce7;--risu-theme-success-200:#bbf7d0;--risu-theme-success-300:#86efac;--risu-theme-success-400:#4ade80;--risu-theme-success-500:#22c55e;--risu-theme-success-600:#16a34a;--risu-theme-success-700:#15803d;--risu-theme-success-800:#166534;--risu-theme-success-900:#14532d}.x-risu-language-json{white-space:pre-wrap;overflow-x:hidden}html,body{height:var(--risu-height-size)}.chattext p{color:var(--FontColorStandard)}.chattext2 pre{background-color:var(--risu-theme-bgcolor);padding:.5rem;overflow-x:auto}.chattext em{color:var(--FontColorItalic)}.chattext strong{color:var(--FontColorBold)}.chattext strong em,.chattext em strong{color:var(--FontColorItalicBold)}.chattext x-em{color:var(--FontColorItalicBold);font-style:italic;font-weight:700}.chattext mark[risu-mark=quote1]{color:var(--FontColorQuote1);background-color:#0000}.chattext mark[risu-mark=quote2]{color:var(--FontColorQuote2);background-color:#0000}.chattext mark[risu-mark=blockquote1]{border-left:4px solid var(--FontColorQuote1);background-color:#0000}@supports (color:color-mix(in lab,red,red)){.chattext mark[risu-mark=blockquote1]{background-color:color-mix(in srgb,transparent 90%,var(--FontColorQuote1)10%)}}.chattext mark[risu-mark=blockquote1]{color:var(--FontColorQuote1);padding:.5rem 1rem}.chattext mark[risu-mark=blockquote2]{border-left:4px solid var(--FontColorQuote2);background-color:#0000}@supports (color:color-mix(in lab,red,red)){.chattext mark[risu-mark=blockquote2]{background-color:color-mix(in srgb,transparent 90%,var(--FontColorQuote2)10%)}}.chattext mark[risu-mark=blockquote2]{color:var(--FontColorQuote2);padding:.5rem 1rem}.strokeme{color:#000;text-shadow:-1px -1px #fff,1px -1px #fff,-1px 1px #fff,1px 1px #fff}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:0 0}::-webkit-scrollbar-thumb{background:#88888880}::-webkit-scrollbar-thumb:hover{background:#55555580}.n-scroll::-webkit-scrollbar-thumb{visibility:hidden;opacity:0;transition:visibility .5s,opacity .5s linear}.n-scroll:hover::-webkit-scrollbar-thumb{visibility:visible;opacity:1}.n-scroll:focus::-webkit-scrollbar-thumb{visibility:visible;opacity:1}*{font-family:var(--risu-font-family)}.chattext p:first-child{margin-top:.3rem}#app{width:100%;height:100%}.bgc{border-top:1px solid #6272a4b3}.text-bordered{-webkit-text-stroke:1px #000}.x-risu-risu-file{border:1px solid var(--risu-theme-selected);color:var(--FontColorStandard);white-space:nowrap;text-overflow:ellipsis;border-radius:.5rem;min-width:0;max-width:20rem;padding:1rem;overflow:hidden}.x-risu-button-default{border-radius:var(--radius-md);border-style:var(--tw-border-style);border-width:1px;border-color:var(--color-darkborderc);background-color:var(--color-darkbutton);padding-inline:calc(var(--spacing)*4);padding-block:calc(var(--spacing)*2);color:var(--color-textcolor);--tw-shadow:0 1px 2px 0 var(--tw-shadow-color,#0000000d);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration));--tw-duration:.2s;transition-duration:.2s}@media(hover:hover){.x-risu-button-default:hover{background-color:var(--color-borderc)}}.x-risu-button-default:focus{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(2px + var(--tw-ring-offset-width))var(--tw-ring-color,#3b82f680);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);--tw-ring-color:var(--color-borderc);--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.x-risu-button-default:focus{outline-offset:2px;outline:2px solid #0000}}.loadmove{border:.4rem solid #0000;border-top:.4rem solid var(--risu-theme-borderc);border-left:.4rem solid var(--risu-theme-borderc);border-radius:50%;width:1rem;height:1rem;transition:border-color .5s;animation:1s linear infinite spin}.x-risu-risu-comment{min-width:calc(var(--spacing)*0);border-radius:var(--radius-md);border-style:var(--tw-border-style);border-width:1px;border-color:var(--color-darkborderc);background-color:var(--color-darkbg);padding-inline:calc(var(--spacing)*4);padding-block:calc(var(--spacing)*2);color:var(--color-textcolor);--tw-shadow:0 1px 2px 0 var(--tw-shadow-color,#0000000d);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration));--tw-duration:.2s;transition-duration:.2s}.x-risu-risu-comment:focus{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.x-risu-risu-comment:focus{outline-offset:2px;outline:2px solid #0000}}::highlight(cbsnest3){color:var(--color-amber-500)}::highlight(cbsnest2){color:var(--color-green-500)}::highlight(cbsnest1){color:var(--color-blue-500)}::highlight(cbsnest0){color:var(--color-purple-500)}::highlight(cbsnest4){color:var(--color-pink-500)}::highlight(cbsdisplay){color:var(--color-cyan-500)}::highlight(comment){color:var(--risu-theme-textcolor2)}::highlight(decorator){color:var(--risu-theme-draculared)}::highlight(deprecated){color:var(--risu-theme-textcolor2);text-decoration:line-through}.prose pre{background-color:var(--tw-prose-pre-bg);color:var(--tw-prose-pre-code)}.prose :where(pre code) *{font-family:inherit}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *)):before,.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *)):after{content:\"\"}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *)):not(pre code){background-color:var(--tw-prose-pre-bg);color:var(--tw-prose-pre-code);border-radius:.25rem;padding:.125rem .25rem}.x-risu-risu-inlay-image{justify-content:center;width:100%;display:flex}.x-risu-risu-inlay-image img{width:100%;max-width:calc(var(--spacing)*80);border-radius:var(--radius-lg)}.x-risu-risu-inlay-image img:focus{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.x-risu-risu-inlay-image img:focus{outline-offset:2px;outline:2px solid #0000}}.x-risu-risu-inlay-image video{width:100%;max-width:calc(var(--spacing)*80);border-radius:var(--radius-lg)}.x-risu-risu-inlay-image video:focus{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.x-risu-risu-inlay-image video:focus{outline-offset:2px;outline:2px solid #0000}}.x-risu-risu-inlay-image audio{width:100%;max-width:calc(var(--spacing)*80);border-radius:var(--radius-lg)}.x-risu-risu-inlay-image audio:focus{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.x-risu-risu-inlay-image audio:focus{outline-offset:2px;outline:2px solid #0000}}.x-risu-risu-error{min-width:calc(var(--spacing)*0);border-radius:var(--radius-md);border-style:var(--tw-border-style);border-width:2px;border-color:var(--color-red-700);background-color:var(--color-red-500);padding-inline:calc(var(--spacing)*4);padding-block:calc(var(--spacing)*2);overflow-wrap:break-word;color:var(--color-white);--tw-shadow:0 1px 2px 0 var(--tw-shadow-color,#0000000d);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration));--tw-duration:.2s;transition-duration:.2s}.x-risu-risu-error:focus{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.x-risu-risu-error:focus{outline-offset:2px;outline:2px solid #0000}}.x-risu-risu-error h1{margin-bottom:calc(var(--spacing)*2);font-size:var(--text-xl);line-height:var(--tw-leading,var(--text-xl--line-height))}.z-100{z-index:100}.saving-animation{background-size:200%;animation:1s infinite saving-anime}@keyframes saving-anime{0%{background-position:0 0}50%{background-position:100% 100%}to{background-position:0 0}}.flexium{flex-direction:row;justify-content:flex-start;display:flex}.chat-width{word-break:normal;overflow-wrap:anywhere;max-width:calc(100% - .5rem)}.chat-message-container .dyna-icon{display:none}.chat-message-container:first-of-type .dyna-icon{display:block}.x-risu-tool-call{min-width:calc(var(--spacing)*0);border-radius:var(--radius-md);border-style:var(--tw-border-style);border-width:1px;border-color:var(--color-darkborderc);background-color:var(--color-darkbg);padding-inline:calc(var(--spacing)*4);padding-block:calc(var(--spacing)*2);color:var(--color-textcolor);--tw-shadow:0 1px 2px 0 var(--tw-shadow-color,#0000000d);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration));--tw-duration:.2s;transition-duration:.2s}.x-risu-tool-call:focus{--tw-outline-style:none;outline-style:none}@media(forced-colors:active){.x-risu-tool-call:focus{outline-offset:2px;outline:2px solid #0000}}.root-loaded-image{border-radius:.5rem;width:calc(100% - 1rem);max-width:20rem;height:auto;margin-left:auto;margin-right:auto;display:block;box-shadow:0 2px 4px #8989891a}.root-loaded-image-dynamic{object-fit:cover;object-position:top;max-height:14rem;transition:max-height .5s}.root-loaded-image-dynamic:hover{max-height:30rem}annotation{display:none}@property --tw-translate-x{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-y{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-z{syntax:\"*\";inherits:false;initial-value:0}@property --tw-scale-x{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-y{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-z{syntax:\"*\";inherits:false;initial-value:1}@property --tw-rotate-x{syntax:\"*\";inherits:false}@property --tw-rotate-y{syntax:\"*\";inherits:false}@property --tw-rotate-z{syntax:\"*\";inherits:false}@property --tw-skew-x{syntax:\"*\";inherits:false}@property --tw-skew-y{syntax:\"*\";inherits:false}@property --tw-space-y-reverse{syntax:\"*\";inherits:false;initial-value:0}@property --tw-space-x-reverse{syntax:\"*\";inherits:false;initial-value:0}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-gradient-position{syntax:\"*\";inherits:false}@property --tw-gradient-from{syntax:\"<color>\";inherits:false;initial-value:#0000}@property --tw-gradient-via{syntax:\"<color>\";inherits:false;initial-value:#0000}@property --tw-gradient-to{syntax:\"<color>\";inherits:false;initial-value:#0000}@property --tw-gradient-stops{syntax:\"*\";inherits:false}@property --tw-gradient-via-stops{syntax:\"*\";inherits:false}@property --tw-gradient-from-position{syntax:\"<length-percentage>\";inherits:false;initial-value:0%}@property --tw-gradient-via-position{syntax:\"<length-percentage>\";inherits:false;initial-value:50%}@property --tw-gradient-to-position{syntax:\"<length-percentage>\";inherits:false;initial-value:100%}@property --tw-leading{syntax:\"*\";inherits:false}@property --tw-font-weight{syntax:\"*\";inherits:false}@property --tw-tracking{syntax:\"*\";inherits:false}@property --tw-ordinal{syntax:\"*\";inherits:false}@property --tw-slashed-zero{syntax:\"*\";inherits:false}@property --tw-numeric-figure{syntax:\"*\";inherits:false}@property --tw-numeric-spacing{syntax:\"*\";inherits:false}@property --tw-numeric-fraction{syntax:\"*\";inherits:false}@property --tw-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:\"*\";inherits:false}@property --tw-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:\"*\";inherits:false}@property --tw-inset-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:\"*\";inherits:false}@property --tw-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:\"*\";inherits:false}@property --tw-inset-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:\"*\";inherits:false}@property --tw-ring-offset-width{syntax:\"<length>\";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:\"*\";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-blur{syntax:\"*\";inherits:false}@property --tw-brightness{syntax:\"*\";inherits:false}@property --tw-contrast{syntax:\"*\";inherits:false}@property --tw-grayscale{syntax:\"*\";inherits:false}@property --tw-hue-rotate{syntax:\"*\";inherits:false}@property --tw-invert{syntax:\"*\";inherits:false}@property --tw-opacity{syntax:\"*\";inherits:false}@property --tw-saturate{syntax:\"*\";inherits:false}@property --tw-sepia{syntax:\"*\";inherits:false}@property --tw-drop-shadow{syntax:\"*\";inherits:false}@property --tw-drop-shadow-color{syntax:\"*\";inherits:false}@property --tw-drop-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-drop-shadow-size{syntax:\"*\";inherits:false}@property --tw-backdrop-blur{syntax:\"*\";inherits:false}@property --tw-backdrop-brightness{syntax:\"*\";inherits:false}@property --tw-backdrop-contrast{syntax:\"*\";inherits:false}@property --tw-backdrop-grayscale{syntax:\"*\";inherits:false}@property --tw-backdrop-hue-rotate{syntax:\"*\";inherits:false}@property --tw-backdrop-invert{syntax:\"*\";inherits:false}@property --tw-backdrop-opacity{syntax:\"*\";inherits:false}@property --tw-backdrop-saturate{syntax:\"*\";inherits:false}@property --tw-backdrop-sepia{syntax:\"*\";inherits:false}@property --tw-duration{syntax:\"*\";inherits:false}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{opacity:.5}}@keyframes bounce{0%,to{animation-timing-function:cubic-bezier(.8,0,1,1);transform:translateY(-25%)}50%{animation-timing-function:cubic-bezier(0,0,.2,1);transform:none}}pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#abb2bf;background:#282c34}.hljs-comment,.hljs-quote{color:#5c6370;font-style:italic}.hljs-doctag,.hljs-formula,.hljs-keyword{color:#c678dd}.hljs-deletion,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-subst{color:#e06c75}.hljs-literal{color:#56b6c2}.hljs-addition,.hljs-attribute,.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#98c379}.hljs-attr,.hljs-number,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-pseudo,.hljs-template-variable,.hljs-type,.hljs-variable{color:#d19a66}.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-symbol,.hljs-title{color:#61aeee}.hljs-built_in,.hljs-class .hljs-title,.hljs-title.class_{color:#e6c07b}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}.hljs-link{text-decoration:underline}.ico.svelte-2mmmg5{cursor:pointer;border-radius:.375rem;height:3.5rem;width:3.5rem;min-height:3.5rem;--tw-shadow-color: 0, 0, 0;--tw-shadow: 0 10px 15px -3px rgba(var(--tw-shadow-color), .1), 0 4px 6px -2px rgba(var(--tw-shadow-color), .05);-webkit-box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow);--tw-bg-opacity: 1;background-color:rgba(107,114,128,var(--tw-bg-opacity));display:flex;justify-content:center;align-items:center;transition-property:background-color,border-color,color,fill,stroke;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1)}.ico.svelte-2mmmg5:hover{--tw-bg-opacity: 1;background-color:rgba(16,185,129,var(--tw-bg-opacity))}.numinput.svelte-klij55::-webkit-outer-spin-button,.numinput.svelte-klij55::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.numinput.svelte-klij55{-moz-appearance:textfield;appearance:textfield}.hide-text.svelte-tfapsj:not(:focus):not(:hover){text-indent:-9999px}.valuer.svelte-2flc86:hover{color:#10b981;cursor:pointer}.endflex.svelte-2flc86{display:flex;flex-grow:1;cursor:pointer}.risu-chosen-item{padding-bottom:.5rem;margin-bottom:.5rem;border-bottom:1px solid;border-bottom-color:var(--risu-theme-selected);opacity:.7}.risu-ghost-item{background-color:rgba(var(--risu-theme-selected-rgb),.2)}.valuer.svelte-yxerf1:hover{color:#10b981;cursor:pointer}.endflex.svelte-yxerf1{display:flex;flex-grow:1;cursor:pointer}.seperator.svelte-yxerf1{border:none;outline:0;width:100%;display:flex;flex-direction:column;margin-bottom:.5rem}.segmented-control-container.svelte-1wetomt{position:relative;display:inline-flex;width:fit-content;align-items:center;border-radius:.5rem;background-color:var(--risu-theme-darkbg);border:1px solid var(--risu-theme-darkborderc);padding:4px;gap:2px;-webkit-user-select:none;user-select:none;margin-bottom:1rem}.segmented-indicator.no-transition.svelte-1wetomt{transition:none!important}.segmented-indicator.svelte-1wetomt{position:absolute;left:0;top:4px;bottom:4px;border-radius:.375rem;background-color:var(--risu-theme-borderc);transition:transform .3s cubic-bezier(.4,0,.2,1),width .3s cubic-bezier(.4,0,.2,1);will-change:transform,width;pointer-events:none;z-index:0}.segmented-btn.svelte-1wetomt{position:relative;z-index:1;border:none;background:transparent;color:var(--risu-theme-textcolor2);font-weight:500;border-radius:.375rem;cursor:pointer;white-space:nowrap;transition:color .2s ease;line-height:1.4}.segmented-btn.svelte-1wetomt:hover:not(.segmented-btn-active){color:var(--risu-theme-textcolor)}.segmented-btn-active.svelte-1wetomt{color:#fff}.segmented-btn.svelte-1wetomt:focus-visible{outline:2px solid var(--risu-theme-borderc);outline-offset:-2px}.slider.svelte-1sehvhy{---track-width: var(--track-width, unset);---track-height: var(--track-height, 6px);---track-background: var(--track-background, #949494);---track-border: var(--track-border, none);---thumb-size: var(--thumb-size, 16px);---thumb-background: var(--thumb-background, #2d2d2d);---thumb-border: var(--thumb-border, none);---position: var(--position, 0px);---margin-inline-thumb-bigger: max(var(---thumb-size) - var(---track-height), 0px);---margin-inline-thumb-smaller: max(var(---track-height) - var(---thumb-size), 0px);position:relative;margin:auto;user-select:none;-webkit-user-select:none;background-color:transparent;cursor:pointer}.slider.svelte-1sehvhy:before{background-color:transparent}[aria-orientation=horizontal].svelte-1sehvhy{width:var(---track-width);max-width:calc(100% - 2 * var(---margin-inline-thumb-bigger));height:calc(max(var(---track-height),var(---thumb-size)) + 4px);height:max(var(---track-height),var(---thumb-size));margin-inline:var(---margin-inline-thumb-bigger);margin-block:var(--margin-block, 8px)}[aria-orientation=vertical].svelte-1sehvhy{width:max(var(---track-height),var(---thumb-size));height:var(---track-width);max-height:calc(100% - 2 * var(---margin-inline-thumb-bigger));margin-block:var(---margin-inline-thumb-bigger);margin-inline:var(--margin-block, 8px)}.track.svelte-1sehvhy{position:absolute;pointer-events:none;background:var(---track-background);border:var(---track-border);border-radius:calc(var(---track-height) / 2);box-sizing:border-box}[aria-orientation=horizontal].svelte-1sehvhy .track:where(.svelte-1sehvhy){height:var(---track-height);top:50%;transform:translateY(-50%);left:0;right:0}[aria-orientation=vertical].svelte-1sehvhy .track:where(.svelte-1sehvhy){width:var(---track-height);left:50%;transform:translate(-50%);top:0;bottom:0}.thumb.svelte-1sehvhy{pointer-events:none;position:absolute;height:var(---thumb-size);width:var(---thumb-size);border-radius:calc(var(---thumb-size) / 2);background:var(---thumb-background);border:var(---thumb-border);box-sizing:border-box;transform:translate(-50%,-50%);--margin-left: (2 * var(---track-height) - var(---thumb-size) - var(---margin-inline-thumb-smaller)) / 2;--left: calc(var(---position) * (100% - 2 * var(--margin-left)) + var(--margin-left))}[aria-orientation=horizontal].svelte-1sehvhy:not(.reverse) .thumb:where(.svelte-1sehvhy){top:50%;left:var(--left)}[aria-orientation=vertical].svelte-1sehvhy:not(.reverse) .thumb:where(.svelte-1sehvhy){left:50%;bottom:calc(var(--left) - var(---thumb-size))}[aria-orientation=horizontal].reverse.svelte-1sehvhy .thumb:where(.svelte-1sehvhy){top:50%;right:calc(var(--left) - var(---thumb-size))}[aria-orientation=vertical].reverse.svelte-1sehvhy .thumb:where(.svelte-1sehvhy){left:50%;top:calc(var(--left))}.slider.svelte-1sehvhy:focus-visible{outline:none}.slider.svelte-1sehvhy:focus-visible .track:where(.svelte-1sehvhy){outline:2px solid var(--focus-color, red);outline-offset:2px}.picker.svelte-1msexid{position:relative;display:inline-block;width:var(--picker-width, 200px);height:var(--picker-height, 200px);background:linear-gradient(#fff0,#000),linear-gradient(.25turn,#fff,#0000),var(--picker-color-bg);border-radius:var(--picker-radius, 8px);outline:none;-webkit-user-select:none;user-select:none;cursor:pointer}.s.svelte-1msexid,.v.svelte-1msexid{position:absolute;--track-background: none;--track-border: none;--thumb-background: none;--thumb-border: none;--thumb-size: 2px;--margin-block: 0;--track-height: var(--picker-indicator-size, 10px);user-select:none;-webkit-user-select:none}.s.svelte-1msexid{top:calc(var(--pos-y) * (var(--picker-height, 200px) - var(--picker-indicator-size, 10px) - 4px) / 100 + 2px);left:2px;--track-width: calc(var(--picker-width, 200px) - 4px)}.v.svelte-1msexid{top:2px;left:calc(var(--pos-x) * (var(--picker-width, 200px) - var(--picker-indicator-size, 10px) - 4px) / 100 + 2px);--track-width: calc(var(--picker-height, 200px) - 4px)}label.svelte-up8mhv{display:inline-flex;align-items:center;gap:8px;cursor:pointer;border-radius:3px;margin:4px;height:var(--input-size, 25px);-webkit-user-select:none;user-select:none}.container.svelte-up8mhv{position:relative;display:block;display:flex;align-items:center;justify-content:center;width:var(--input-size, 25px)}input.svelte-up8mhv{margin:0;padding:0;border:none;width:1px;height:1px;flex-shrink:0;opacity:0}.alpha.svelte-up8mhv{clip-path:circle(50%);background:var(--alpha-grid-bg)}.alpha.svelte-up8mhv,.color.svelte-up8mhv{position:absolute;width:var(--input-size, 25px);height:var(--input-size, 25px);border-radius:50%;-webkit-user-select:none;user-select:none}input.svelte-up8mhv:focus-visible~.color:where(.svelte-up8mhv){outline:2px solid var(--focus-color, red);outline-offset:2px}label.svelte-hwq23{display:flex;justify-content:center;margin-bottom:4px;grid-area:nullable;-webkit-user-select:none;user-select:none}input.svelte-hwq23{margin:0}input.svelte-hwq23:focus-visible{outline:none}input.svelte-hwq23:focus-visible+span:where(.svelte-hwq23){width:14px;height:14px;border-radius:2px;outline:2px solid var(--focus-color, red);outline-offset:2px}div.svelte-hwq23{width:32px;aspect-ratio:2;position:relative}div.svelte-hwq23 :where(.svelte-hwq23){position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}div.svelte-9d4bqy{position:absolute;left:calc(var(--pos-x) * (var(--picker-width, 200px) - 2px) / 100 - var(--picker-indicator-size, 10px) / 2 + 1px);top:calc(var(--pos-y) * (var(--picker-height, 200px) - 2px) / 100 - var(--picker-indicator-size, 10px) / 2 + 1px);width:var(--picker-indicator-size, 10px);height:var(--picker-indicator-size, 10px);background-color:#fff;box-shadow:0 0 4px #000;border-radius:50%;pointer-events:none;z-index:1;transition:box-shadow .2s}.swatches.svelte-183vb3n{display:grid;grid-template-columns:var(--cp-swatch-grid-template-columns, repeat(auto-fit, minmax(24px, 1fr)));gap:8px;width:100%;height:100%;margin-top:8px;margin-bottom:8px}.swatch.svelte-183vb3n{cursor:pointer;margin:0;padding:0;border:none;width:100%;aspect-ratio:1 / 1;height:auto;display:block}.swatch.svelte-183vb3n:focus{outline:2px solid var(--focus-color, red);outline-offset:2px}.text-input.svelte-1vscq08{margin:var(--text-input-margin, 5px 0 0)}.input-container.svelte-1vscq08{display:flex;flex:1;gap:10px}input.svelte-1vscq08,button.svelte-1vscq08,.button-like.svelte-1vscq08{flex:1;border:none;background-color:var(--cp-input-color, #eee);color:var(--cp-text-color, var(--cp-border-color));padding:0;border-radius:5px;height:30px;line-height:30px;text-align:center}input.svelte-1vscq08{width:5px;font-family:inherit}button.svelte-1vscq08,.button-like.svelte-1vscq08{position:relative;flex:1;margin:8px 0 0;height:30px;width:100%;transition:background-color .2s;cursor:pointer;font-family:inherit}.button-like.svelte-1vscq08{cursor:default}.appear.svelte-1vscq08,.disappear.svelte-1vscq08{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100%;transition:all .5s}button.svelte-1vscq08:hover .disappear:where(.svelte-1vscq08),.appear.svelte-1vscq08{opacity:0}.disappear.svelte-1vscq08,button.svelte-1vscq08:hover .appear:where(.svelte-1vscq08){opacity:1}button.svelte-1vscq08:hover{background-color:var(--cp-button-hover-color, #ccc)}input.svelte-1vscq08:focus,button.svelte-1vscq08:focus{outline:none}input.svelte-1vscq08:focus-visible,button.svelte-1vscq08:focus-visible{outline:2px solid var(--focus-color, red);outline-offset:2px}div.svelte-ohommi{padding:8px;background-color:var(--cp-bg-color, white);margin:0 10px 10px;border:1px solid var(--cp-border-color, black);border-radius:12px;display:none;width:max-content}.is-open.svelte-ohommi{display:inline-block}[role=dialog].svelte-ohommi{position:absolute;top:calc(var(--input-size, 25px) + 12px);left:0;z-index:var(--picker-z-index, 2)}span.svelte-hcuewk{position:relative;color:var(--cp-text-color, var(--cp-border-color));--alpha-grid-bg: linear-gradient(45deg, #eee 25%, #0000 25%, #0000 75%, #eee 75%) 0 0 / 10px 10px, linear-gradient(45deg, #eee 25%, #0000 25%, #0000 75%, #eee 75%) 5px 5px / 10px 10px}.h.svelte-hcuewk,.a.svelte-hcuewk{display:inline-flex;justify-content:center;--track-height: var(--slider-width, 10px);--track-width: var(--picker-height, 200px);--track-border: none;--thumb-size: calc(var(--slider-width, 10px) - 3px);--thumb-background: white;--thumb-border: 1px solid black;--margin-block: 0;--gradient-direction: .5turn}.horizontal.svelte-hcuewk .h:where(.svelte-hcuewk),.horizontal.svelte-hcuewk .a:where(.svelte-hcuewk){--track-width: calc(var(--picker-width, 200px) - 12px);--gradient-direction: .25turn;margin:4px 6px}.horizontal.svelte-hcuewk .h:where(.svelte-hcuewk){margin-top:8px}.vertical.svelte-hcuewk .h:where(.svelte-hcuewk),.vertical.svelte-hcuewk .a:where(.svelte-hcuewk){margin-left:3px}.h.svelte-hcuewk{grid-area:hue;--gradient-hue: #ff1500fb, #ffff00 17.2%, #ffff00 18.2%, #00ff00 33.3%, #00ffff 49.5%, #00ffff 51.5%, #0000ff 67.7%, #ff00ff 83.3%, #ff0000;--track-background: linear-gradient(var(--gradient-direction), var(--gradient-hue))}.a.svelte-hcuewk{grid-area:alpha;margin-top:2px;--alpha-grid-bg: linear-gradient(45deg, #eee 25%, #0000 25%, #0000 75%, #eee 75%) 0 0 / 10px 10px, linear-gradient(45deg, #eee 25%, #0000 25%, #0000 75%, #eee 75%) 5px 5px / 10px 10px;--track-background: linear-gradient(var(--gradient-direction), rgba(0, 0, 0, 0), var(--alphaless-color)), var(--alpha-grid-bg)}span.svelte-hcuewk .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.cl.svelte-1x5cxw5{--cp-bg-color: var(--risu-theme-bgcolor);--cp-border-color: var(--risu-theme-darkborderc);--cp-text-color: var(--risu-theme-textcolor);--cp-input-color: #555;--cp-button-hover-color: #777}.tabler.svelte-cdrlzn{table-layout:fixed}.tabler.svelte-cdrlzn td:where(.svelte-cdrlzn){overflow:hidden;text-overflow:ellipsis}.char-grid.svelte-cdrlzn{display:grid;grid-template-columns:auto 1fr auto}.tippy-box[data-animation=fade][data-state=hidden]{opacity:0}[data-tippy-root]{max-width:calc(100vw - 10px)}.tippy-box{position:relative;background-color:#333;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;white-space:normal;outline:0;transition-property:transform,visibility,opacity}.tippy-box[data-placement^=top]>.tippy-arrow{bottom:0}.tippy-box[data-placement^=top]>.tippy-arrow:before{bottom:-7px;left:0;border-width:8px 8px 0;border-top-color:initial;transform-origin:center top}.tippy-box[data-placement^=bottom]>.tippy-arrow{top:0}.tippy-box[data-placement^=bottom]>.tippy-arrow:before{top:-7px;left:0;border-width:0 8px 8px;border-bottom-color:initial;transform-origin:center bottom}.tippy-box[data-placement^=left]>.tippy-arrow{right:0}.tippy-box[data-placement^=left]>.tippy-arrow:before{border-width:8px 0 8px 8px;border-left-color:initial;right:-7px;transform-origin:center left}.tippy-box[data-placement^=right]>.tippy-arrow{left:0}.tippy-box[data-placement^=right]>.tippy-arrow:before{left:-7px;border-width:8px 8px 8px 0;border-right-color:initial;transform-origin:center right}.tippy-box[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{width:16px;height:16px;color:#333}.tippy-arrow:before{content:\"\";position:absolute;border-color:transparent;border-style:solid}.tippy-content{position:relative;padding:5px 9px;z-index:1}.tippy-box[data-theme~=translucent]{background-color:#000000b3}.tippy-box[data-theme~=translucent]>.tippy-arrow{width:14px;height:14px}.tippy-box[data-theme~=translucent][data-placement^=top]>.tippy-arrow:before{border-width:7px 7px 0;border-top-color:#000000b3}.tippy-box[data-theme~=translucent][data-placement^=bottom]>.tippy-arrow:before{border-width:0 7px 7px;border-bottom-color:#000000b3}.tippy-box[data-theme~=translucent][data-placement^=left]>.tippy-arrow:before{border-width:7px 0 7px 7px;border-left-color:#000000b3}.tippy-box[data-theme~=translucent][data-placement^=right]>.tippy-arrow:before{border-width:7px 7px 7px 0;border-right-color:#000000b3}.tippy-box[data-theme~=translucent]>.tippy-backdrop{background-color:#000000b3}.tippy-box[data-theme~=translucent]>.tippy-svg-arrow{fill:#000000b3}.editMode.svelte-yklqh{min-width:6rem}@keyframes svelte-yklqh-sidebar-transition{0%{width:0rem}to{width:var(--sidebar-size)}}@keyframes svelte-yklqh-sidebar-transition-close{0%{width:var(--sidebar-size);right:0rem}to{width:0rem;right:10rem}}@keyframes svelte-yklqh-sidebar-transition-non-dynamic{0%{width:0rem;min-width:0rem}to{width:var(--sidebar-size);min-width:var(--sidebar-size)}}@keyframes svelte-yklqh-sidebar-transition-close-non-dynamic{0%{width:var(--sidebar-size);min-width:var(--sidebar-size);right:0rem}to{width:0rem;min-width:0rem;right:3rem}}@keyframes svelte-yklqh-sub-sidebar-transition{0%{width:0rem;min-width:0rem}to{width:5rem;min-width:5rem}}@keyframes svelte-yklqh-sub-sidebar-transition-close{0%{width:5rem;min-width:5rem;max-width:5rem;right:0rem}to{width:0rem;min-width:0rem;max-width:0rem;right:10rem}}@keyframes svelte-yklqh-sidebar-dark-animation{0%{background-color:#0000!important}to{background-color:#00000080!important}}@keyframes svelte-yklqh-sidebar-dark-closing-animation{0%{background-color:#00000080!important}to{background-color:#0000!important}}.risu-sidebar.svelte-yklqh:not(.dynamic-sidebar){animation-name:svelte-yklqh-sidebar-transition-non-dynamic;animation-duration:var(--risu-animation-speed)}.risu-sidebar-close.svelte-yklqh:not(.dynamic-sidebar){animation-name:svelte-yklqh-sidebar-transition-close-non-dynamic;animation-duration:var(--risu-animation-speed);position:relative}.risu-sidebar.dynamic-sidebar.svelte-yklqh{animation-name:svelte-yklqh-sidebar-transition;animation-duration:var(--risu-animation-speed)}.risu-sidebar-close.dynamic-sidebar.svelte-yklqh{animation-name:svelte-yklqh-sidebar-transition-close;animation-duration:var(--risu-animation-speed);position:relative;right:3rem}.risu-sub-sidebar.svelte-yklqh{animation-name:svelte-yklqh-sub-sidebar-transition;animation-duration:var(--risu-animation-speed)}.risu-sub-sidebar-close.svelte-yklqh{animation-name:svelte-yklqh-sub-sidebar-transition-close;animation-duration:var(--risu-animation-speed);position:relative}.sidebar-dark-animation.svelte-yklqh{animation-name:sidebar-dark-transition;animation-duration:var(--risu-animation-speed);background-color:#00000080}.sidebar-dark-close-animation.svelte-yklqh{animation-name:sidebar-dark-closing-transition;animation-duration:var(--risu-animation-speed);background-color:#0000}.image-container.svelte-1j5xluv{position:relative;overflow:hidden}.image-container.svelte-1j5xluv img:where(.svelte-1j5xluv){position:absolute;bottom:0;left:0;width:100%;height:100%;object-fit:scale-down;object-position:50% 100%}.old-image.svelte-1j5xluv{animation:svelte-1j5xluv-fadeOutFromNone .5s ease-out}.new-image.svelte-1j5xluv{animation:svelte-1j5xluv-fadeInFromNone .5s ease-out}.img-waifu.svelte-1j5xluv{width:100%;height:90vh;margin-top:10vh}.img-mobile.svelte-1j5xluv{width:100%;height:100%}.img-risu.svelte-1j5xluv{width:100%;position:absolute;bottom:0;left:0;height:100%}@keyframes svelte-1j5xluv-fadeInFromNone{0%{opacity:0}to{opacity:1}}@keyframes svelte-1j5xluv-fadeOutFromNone{0%{opacity:1}to{opacity:0}}.box.svelte-19v45g0{position:absolute;right:0;top:0;border-bottom:1px solid var(--risu-theme-borderc);border-left:1px solid var(--risu-theme-borderc);width:12rem;height:12rem;z-index:5}.resize-handle.svelte-19v45g0{position:absolute;width:16px;height:16px;border-top:1px solid var(--risu-theme-borderc);border-right:1px solid var(--risu-theme-borderc);cursor:sw-resize;bottom:0;left:0;z-index:10}.loadmove.svelte-aad0hf{animation:svelte-aad0hf-spin 1s linear infinite;border-radius:50%;border:.4rem solid rgba(0,0,0,0);width:1rem;height:1rem;border-top:.4rem solid var(--risu-theme-textcolor);border-left:.4rem solid var(--risu-theme-textcolor)}@keyframes svelte-aad0hf-spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.partial-edit-btn-wrapper{display:none}.partial-edit-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;padding:8px;background:#fffffff2;border:1px solid rgba(0,0,0,.15);border-radius:6px;cursor:pointer;box-shadow:0 2px 8px #00000026;transition:all .15s ease;color:#666}.partial-edit-btn-edit:hover{background:#e0f2fe;border-color:#3b82f6;color:#3b82f6}.partial-edit-btn-delete:hover{background:#fee2e2;border-color:#ef4444;color:#ef4444}.partial-match-failed-modal.svelte-102kq8{background:var(--risu-theme-bgcolor, #fff);border-radius:12px;padding:20px;width:50vw;max-width:500px;min-width:320px;display:flex;flex-direction:column;gap:16px;box-shadow:0 8px 32px #0003}.partial-match-failed-header.svelte-102kq8{display:flex;align-items:center;gap:8px}.partial-match-failed-title.svelte-102kq8{font-weight:600;font-size:16px;color:var(--risu-theme-textcolor, #000)}.partial-match-failed-message.svelte-102kq8{font-size:14px;color:var(--risu-theme-textcolor, #000);margin:0;line-height:1.5}.partial-delete-modal.svelte-102kq8{background:var(--risu-theme-bgcolor, #fff);border-radius:12px;padding:20px;width:50vw;max-width:1600px;min-width:400px;display:flex;flex-direction:column;gap:12px;box-shadow:0 8px 32px #0003}.partial-delete-header.svelte-102kq8{display:flex;justify-content:space-between;align-items:center}.partial-delete-title.svelte-102kq8{font-weight:600;font-size:16px;color:var(--risu-theme-textcolor, #000)}.partial-delete-message.svelte-102kq8{font-size:14px;color:var(--risu-theme-textcolor, #000);margin:0}.partial-delete-preview.svelte-102kq8{padding:12px;background:var(--risu-theme-darkbg, #f5f5f5);border-radius:8px;font-size:13px;color:var(--risu-theme-textcolor, #000);max-height:100px;overflow:hidden;text-overflow:ellipsis}.partial-delete-confirm-btn.svelte-102kq8{display:flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s ease;background:#ef4444;color:#fff}.partial-delete-confirm-btn.svelte-102kq8:hover{background:#dc2626}.partial-edit-overlay.svelte-102kq8{position:fixed;inset:0;background:#0006;display:flex;align-items:center;justify-content:center;z-index:10000}.partial-edit-modal.svelte-102kq8{background:var(--risu-theme-bgcolor, #fff);border-radius:12px;padding:20px;width:50vw;max-width:1600px;min-width:400px;max-height:80vh;display:flex;flex-direction:column;gap:12px;box-shadow:0 8px 32px #0003}.partial-edit-header.svelte-102kq8{display:flex;justify-content:space-between;align-items:center}.partial-edit-title.svelte-102kq8{font-weight:600;font-size:16px;color:var(--risu-theme-textcolor, #000)}.partial-match-meta.svelte-102kq8{display:flex;align-items:center;gap:8px}.partial-match-hint.svelte-102kq8{font-size:12px;color:var(--risu-theme-textcolor, #000)}.partial-match-confidence.svelte-102kq8{font-size:11px;font-weight:600;padding:2px 6px;border-radius:4px;background:#10b981;color:#fff}.partial-match-confidence.low-confidence.svelte-102kq8{background:#f59e0b}.partial-edit-textarea.svelte-102kq8{width:100%;min-height:120px;max-height:50vh;padding:12px;border:1px solid var(--risu-theme-darkborderc, #ddd);border-radius:8px;background:var(--risu-theme-darkbg, #f5f5f5);color:var(--risu-theme-textcolor, #000);font-family:inherit;resize:vertical;box-sizing:border-box}.partial-edit-textarea.svelte-102kq8:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f626}.partial-edit-buttons.svelte-102kq8{display:flex;gap:8px;justify-content:flex-end}.partial-edit-save-btn.svelte-102kq8,.partial-edit-cancel-btn.svelte-102kq8{display:flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s ease}.partial-edit-save-btn.svelte-102kq8{background:#3b82f6;color:#fff}.partial-edit-save-btn.svelte-102kq8:hover{background:#2563eb}.partial-edit-cancel-btn.svelte-102kq8{background:#6b7280;color:#fff}.partial-edit-cancel-btn.svelte-102kq8:hover{background:#4b5563}.partial-match-selection-modal.svelte-102kq8{background:var(--risu-theme-bgcolor, #fff);border-radius:12px;padding:20px;width:50vw;max-width:1200px;min-width:400px;max-height:80vh;display:flex;flex-direction:column;gap:16px;box-shadow:0 8px 32px #0003}.match-selection-header.svelte-102kq8{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--risu-theme-darkborderc, #ddd)}.match-selection-title.svelte-102kq8{font-weight:600;font-size:16px;color:var(--risu-theme-textcolor, #000)}.match-count.svelte-102kq8{font-size:13px;font-weight:500;padding:4px 10px;border-radius:12px;background:var(--risu-theme-darkbg, #f5f5f5);color:var(--risu-theme-textcolor, #000)}.match-list.svelte-102kq8{display:flex;flex-direction:column;gap:12px;overflow-y:auto;max-height:calc(80vh - 160px);padding:4px}.match-item.svelte-102kq8{display:flex;flex-direction:column;gap:8px;padding:16px;border:1px solid var(--risu-theme-darkborderc, #ddd);border-radius:8px;background:var(--risu-theme-darkbg, #f9f9f9);cursor:pointer;transition:all .15s ease}.match-item.svelte-102kq8:hover{background:var(--risu-theme-bgcolor, #fff);border-color:#3b82f6;box-shadow:0 2px 8px #3b82f633;transform:translateY(-1px)}.match-meta.svelte-102kq8{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.match-line.svelte-102kq8{font-size:12px;font-weight:500;color:var(--risu-theme-textcolor, #000);background:var(--risu-theme-bgcolor, #fff);padding:2px 8px;border-radius:4px}.match-confidence.svelte-102kq8{font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;color:#fff}.match-confidence.high-confidence.svelte-102kq8{background:#10b981}.match-confidence.medium-confidence.svelte-102kq8{background:#3b82f6}.match-confidence.low-confidence.svelte-102kq8{background:#f59e0b}.match-method.svelte-102kq8{font-size:11px;font-weight:500;padding:2px 6px;border-radius:4px;background:var(--risu-theme-bgcolor, #fff);color:var(--risu-theme-textcolor, #000);font-family:monospace}.match-context-before.svelte-102kq8,.match-context-after.svelte-102kq8{font-size:12px;color:var(--risu-theme-textcolor, #000);padding:8px 12px;background:var(--risu-theme-bgcolor, #fff);border-radius:6px;border-left:3px solid var(--risu-theme-darkborderc, #ddd);line-height:1.5;font-style:italic;white-space:pre-line}.match-text.svelte-102kq8{font-size:13px;color:var(--risu-theme-textcolor, #000);padding:10px 12px;background:var(--risu-theme-bgcolor, #fff);border-radius:6px;border-left:3px solid #3b82f6;line-height:1.5;font-weight:500;white-space:pre-line}.cc.svelte-5jfnvs{width:88px;height:31px;border-width:0}.chat-process-stage-1.svelte-vtw7ku{border-top:.4rem solid #60a5fa;border-left:.4rem solid #60a5fa}.chat-process-stage-2.svelte-vtw7ku{border-top:.4rem solid #db2777;border-left:.4rem solid #db2777}.chat-process-stage-3.svelte-vtw7ku{border-top:.4rem solid #34d399;border-left:.4rem solid #34d399}.chat-process-stage-4.svelte-vtw7ku{border-top:.4rem solid #8b5cf6;border-left:.4rem solid #8b5cf6}.autoload.svelte-vtw7ku{border-top:.4rem solid #10b981;border-left:.4rem solid #10b981}@keyframes svelte-vtw7ku-spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.break-any.svelte-1t3c4d5,.break-any.svelte-1co5ci7{word-break:normal;overflow-wrap:anywhere}.halfw.svelte-1px1wn1,.halfwp.svelte-1px1wn1{max-width:calc(50% - 5rem)}.per33.svelte-1px1wn1{height:33.333333%}.plugin-confirm-content.svelte-1gfqgzq .plugin-name:where(.svelte-1gfqgzq){font-size:1.25rem;font-weight:700;color:#fff}.plugin-confirm-content.svelte-1gfqgzq .warnings-list:where(.svelte-1gfqgzq){list-style-type:disc;list-style-position:inside;margin-top:.5rem;margin-bottom:.5rem;padding-left:1rem;color:#f87171}.plugin-confirm-content.svelte-1gfqgzq .warning-item:where(.svelte-1gfqgzq){margin-bottom:.25rem}.plugin-confirm-content.svelte-1gfqgzq .confirm-message:where(.svelte-1gfqgzq){margin-top:1rem;color:#d1d5db}.break-any.svelte-1gfqgzq{word-break:normal;overflow-wrap:anywhere}@keyframes svelte-1gfqgzq-toastAnime{0%{opacity:0}50%{opacity:1}to{opacity:0}}.toast-anime.svelte-1gfqgzq{animation:svelte-1gfqgzq-toastAnime 1s ease-out}.vis.svelte-1gfqgzq{opacity:1!important;--tw-bg-opacity: 1 !important}.stack-trace-wrap.svelte-1gfqgzq{position:relative;margin-top:.5rem}.stack-trace.svelte-1gfqgzq{background-color:var(--risu-theme-bgcolor);color:var(--risu-theme-textcolor2);border:1px solid var(--risu-theme-darkborderc);border-radius:.25rem;padding:.75rem 2.75rem .75rem .75rem;font-family:monospace;font-size:.75rem;white-space:pre-wrap;word-break:break-all;max-height:200px;overflow-y:auto}.stack-trace-copy.svelte-1gfqgzq{position:absolute;top:.5rem;right:.5rem;display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border:1px solid var(--risu-theme-darkborderc);border-radius:.375rem;background-color:var(--risu-theme-darkbg);color:var(--risu-theme-textcolor2);transition:background-color .2s ease,color .2s ease,border-color .2s ease}.stack-trace-copy.svelte-1gfqgzq:hover{background-color:var(--risu-theme-bgcolor);color:var(--risu-theme-textcolor)}.request-log-code.svelte-1gfqgzq{background-color:#1a1a2e;color:#e0e0e0;border:1px solid var(--risu-theme-darkborderc);border-radius:.375rem;padding:.75rem;font-family:Consolas,Monaco,Courier New,monospace;font-size:.75rem;line-height:1.5;white-space:pre-wrap;word-break:break-all;max-height:12rem;overflow:auto}.welcome-bg.svelte-ngd78m{background-size:cover;position:relative}@keyframes svelte-ngd78m-darkness{0%{opacity:0}50%{opacity:.2}to{opacity:0}}.logo-animation.svelte-ngd78m{animation:svelte-ngd78m-logo-animation 3s ease-in-out;opacity:0}@keyframes svelte-ngd78m-logo-animation{0%{opacity:0}80%{opacity:1}to{opacity:0}}.chat-animation.svelte-ngd78m{animation:svelte-ngd78m-chat-animation 3s ease-in-out}@keyframes svelte-ngd78m-chat-animation{0%{top:100vh}to{top:0}}.break-any.svelte-1mqgnup{word-break:normal;overflow-wrap:anywhere}.prism-font-silver.svelte-1lxg8z1{background:linear-gradient(to right,#777,#fff,#777,#fff,#777)}.prism-font-gold.svelte-1lxg8z1{background:linear-gradient(to right,#d4af32,#fff,#d4af32,#fff,#d4af32)}.prism-font-copper.svelte-1lxg8z1{background:linear-gradient(to right,#b87333,#fff,#b87333,#fff,#b87333)}.prism-font.svelte-1lxg8z1{text-align:center;color:transparent;background-size:150px 100%;-webkit-background-clip:text;background-clip:text;animation-name:svelte-1lxg8z1-shimmer;animation-duration:2s;animation-iteration-count:infinite;background-repeat:no-repeat;background-position:0 0;background-color:#222}@keyframes svelte-1lxg8z1-shimmer{0%{background-position:top left}50%{background-position:top right}0%{background-position:top left}}.setting-bg.svelte-a6j5ff{background:linear-gradient(to right,var(--risu-theme-darkbg) 50%,var(--risu-theme-bgcolor) 50%)}.break-any.svelte-12htwcw{word-break:normal;overflow-wrap:anywhere}.draggable-preset.svelte-12htwcw:hover{cursor:grab}.draggable-preset.svelte-12htwcw:active{cursor:grabbing}.h-0\\.5.svelte-12htwcw{min-height:2px;height:2px}.h-1.svelte-12htwcw{min-height:4px;height:4px}.break-any.svelte-r72h1n,.break-any.svelte-1gqw8co{word-break:normal;overflow-wrap:anywhere}\r\n";

// src/ui/import-overlay.ts
var PHASE_LABEL = {
  decoding: "Decoding",
  translating: "Translating",
  creating_character: "Creating character",
  uploading_assets: "Uploading assets",
  saving_payload: "Saving",
  done: "Done",
  error: "Error"
};
var AUTO_HIDE_DELAY_MS = 1200;
function setupImportOverlay(log, sendToBackend) {
  const overlay = document.createElement("div");
  overlay.className = "lr-import-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-live", "polite");
  document.body.appendChild(overlay);
  const card = document.createElement("div");
  card.className = "lr-import-card";
  overlay.appendChild(card);
  const titleEl = document.createElement("div");
  titleEl.className = "lr-import-title";
  card.appendChild(titleEl);
  const phaseEl = document.createElement("div");
  phaseEl.className = "lr-import-phase";
  card.appendChild(phaseEl);
  const messageEl = document.createElement("div");
  messageEl.className = "lr-import-message";
  card.appendChild(messageEl);
  const consentEl = document.createElement("div");
  consentEl.className = "lr-import-consent";
  consentEl.hidden = true;
  const consentMsg = document.createElement("div");
  consentMsg.className = "lr-import-consent-message";
  consentEl.appendChild(consentMsg);
  const consentBtnRow = document.createElement("div");
  consentBtnRow.className = "lr-import-consent-buttons";
  const declineBtn = document.createElement("button");
  declineBtn.type = "button";
  declineBtn.className = "lrm-btn lrm-btn-secondary";
  const grantBtn = document.createElement("button");
  grantBtn.type = "button";
  grantBtn.className = "lrm-btn lrm-btn-primary";
  consentBtnRow.appendChild(declineBtn);
  consentBtnRow.appendChild(grantBtn);
  consentEl.appendChild(consentBtnRow);
  card.appendChild(consentEl);
  const progressOuter = document.createElement("div");
  progressOuter.className = "lr-import-progress";
  const progressInner = document.createElement("div");
  progressInner.className = "lr-import-progress-fill";
  progressOuter.appendChild(progressInner);
  card.appendChild(progressOuter);
  const buttonRow = document.createElement("div");
  buttonRow.className = "lr-import-button-row";
  card.appendChild(buttonRow);
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "lrm-btn lrm-btn-secondary";
  cancelBtn.textContent = "Cancel";
  cancelBtn.hidden = true;
  buttonRow.appendChild(cancelBtn);
  const dismissBtn = document.createElement("button");
  dismissBtn.type = "button";
  dismissBtn.className = "lrm-btn lrm-btn-primary";
  dismissBtn.textContent = "Dismiss";
  dismissBtn.hidden = true;
  dismissBtn.addEventListener("click", () => hideNow());
  buttonRow.appendChild(dismissBtn);
  let visible = false;
  let label = "";
  let lastPhase = "";
  let hideTimer;
  let pendingConsentRequestId = null;
  let pendingCancel = null;
  let uploadTotalBytes = 0;
  function setIndeterminate() {
    progressOuter.classList.add("lr-import-progress-indeterminate");
    progressInner.style.width = "40%";
  }
  function setFraction(frac) {
    progressOuter.classList.remove("lr-import-progress-indeterminate");
    const clamped = Math.max(0, Math.min(1, frac));
    progressInner.style.width = `${clamped * 100}%`;
  }
  function showOverlay(newLabel) {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
    }
    label = newLabel;
    visible = true;
    lastPhase = "";
    titleEl.textContent = `Importing ${label}`;
    phaseEl.textContent = "Starting";
    messageEl.textContent = "Preparing import…";
    progressOuter.classList.remove("lr-import-progress-error");
    setIndeterminate();
    dismissBtn.hidden = true;
    consentEl.hidden = true;
    overlay.hidden = false;
    log.info(`import-overlay: show label=${label}`);
  }
  function lockCancel() {
    pendingCancel = null;
    cancelBtn.hidden = true;
  }
  cancelBtn.addEventListener("click", () => {
    const cb = pendingCancel;
    pendingCancel = null;
    cancelBtn.hidden = true;
    if (cb) {
      try {
        cb();
      } catch (err) {
        log.warn("import-overlay: cancel callback threw", err);
      }
    }
    hideNow();
  });
  function hideNow() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
    }
    visible = false;
    overlay.hidden = true;
    log.info("import-overlay: hidden");
  }
  function scheduleHide() {
    if (hideTimer)
      clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      hideTimer = undefined;
      hideNow();
    }, AUTO_HIDE_DELAY_MS);
  }
  function applyProgress(phase, message, fraction) {
    phaseEl.textContent = PHASE_LABEL[phase] ?? phase;
    messageEl.textContent = message || "";
    lastPhase = phase;
    lockCancel();
    if (phase === "done") {
      progressOuter.classList.remove("lr-import-progress-error");
      setFraction(1);
      dismissBtn.hidden = true;
      consentEl.hidden = true;
      scheduleHide();
      return;
    }
    if (phase === "error") {
      progressOuter.classList.add("lr-import-progress-error");
      setFraction(1);
      dismissBtn.hidden = false;
      consentEl.hidden = true;
      return;
    }
    if (typeof fraction === "number") {
      setFraction(fraction);
    } else {
      setIndeterminate();
    }
  }
  let activeOperationId = null;
  function applyOperationProgress(msg) {
    activeOperationId = msg.operationId;
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
    }
    if (msg.phase === "started" || !visible) {
      visible = true;
      lastPhase = "";
      progressOuter.classList.remove("lr-import-progress-error");
      consentEl.hidden = true;
      dismissBtn.hidden = true;
      cancelBtn.hidden = true;
      pendingCancel = null;
      overlay.hidden = false;
    }
    titleEl.textContent = msg.title;
    if (msg.phase === "error") {
      progressOuter.classList.add("lr-import-progress-error");
      phaseEl.textContent = "Error";
      messageEl.textContent = msg.error || msg.message || "Operation failed";
      setFraction(1);
      dismissBtn.hidden = false;
      return;
    }
    if (msg.phase === "done") {
      progressOuter.classList.remove("lr-import-progress-error");
      phaseEl.textContent = "Done";
      messageEl.textContent = msg.message || "";
      setFraction(1);
      scheduleHide();
      return;
    }
    phaseEl.textContent = msg.phase === "started" ? "Starting" : "Working";
    messageEl.textContent = msg.message || "";
    if (typeof msg.fraction === "number") {
      setFraction(msg.fraction);
    } else {
      setIndeterminate();
    }
  }
  function showConsent(prompt) {
    if (!visible)
      showOverlay(label || "character");
    pendingConsentRequestId = prompt.requestId;
    titleEl.textContent = prompt.title;
    phaseEl.textContent = "Awaiting consent";
    messageEl.textContent = "";
    consentMsg.textContent = prompt.message;
    grantBtn.textContent = prompt.confirmLabel;
    declineBtn.textContent = prompt.cancelLabel;
    grantBtn.disabled = false;
    declineBtn.disabled = false;
    consentEl.hidden = false;
    setIndeterminate();
    log.info(`import-overlay: consent prompt requestId=${prompt.requestId}`);
  }
  function resolveConsent(confirmed) {
    const requestId = pendingConsentRequestId;
    if (!requestId)
      return;
    pendingConsentRequestId = null;
    grantBtn.disabled = true;
    declineBtn.disabled = true;
    consentEl.hidden = true;
    log.info(`import-overlay: consent response requestId=${requestId} confirmed=${confirmed}`);
    sendToBackend({ type: "consent_response", requestId, confirmed });
  }
  grantBtn.addEventListener("click", () => resolveConsent(true));
  declineBtn.addEventListener("click", () => resolveConsent(false));
  function notifyImportStart(newLabel, source, onCancel, totalBytes) {
    log.info(`import-overlay: notifyImportStart label=${newLabel} source=${source} cancellable=${!!onCancel} totalBytes=${totalBytes ?? "?"}`);
    uploadTotalBytes = typeof totalBytes === "number" && totalBytes > 0 ? totalBytes : 0;
    showOverlay(newLabel);
    pendingCancel = onCancel ?? null;
    cancelBtn.hidden = !pendingCancel;
  }
  function handleBackendMessage(msg) {
    switch (msg.type) {
      case "realm_download_started": {
        if (msg.ok) {
          const isPlaceholder = !!msg.fileName && /^realm-[0-9a-f-]+\.[a-z0-9]+$/i.test(msg.fileName);
          const preferred = isPlaceholder ? label : msg.fileName ?? label;
          if (!visible)
            showOverlay(preferred || "character");
          else
            titleEl.textContent = `Importing ${preferred || "character"}`;
        } else if (visible) {
          applyProgress("error", msg.error ?? "Download failed", null);
        }
        break;
      }
      case "import_upload_ack":
      case "module_upload_ack": {
        if (!visible && msg.seq === -1) {
          showOverlay(label || "character");
        }
        if (visible && lastPhase === "") {
          phaseEl.textContent = "Uploading";
          if (uploadTotalBytes > 0) {
            const sent = Math.min(msg.receivedBytes, uploadTotalBytes);
            messageEl.textContent = `Sent ${formatBytes(sent)} of ${formatBytes(uploadTotalBytes)} to backend…`;
            setFraction(sent / uploadTotalBytes);
          } else {
            messageEl.textContent = `Sent ${formatBytes(msg.receivedBytes)} to backend…`;
          }
        }
        break;
      }
      case "import_progress": {
        if (!visible && msg.phase !== "done" && msg.phase !== "error") {
          showOverlay(label || "character");
        }
        if (visible)
          applyProgress(msg.phase, msg.message, msg.fraction ?? null);
        break;
      }
      case "consent_prompt": {
        showConsent(msg);
        break;
      }
      case "operation_progress": {
        applyOperationProgress(msg);
        break;
      }
      case "rasterize_svgs": {
        if (visible) {
          phaseEl.textContent = "Rasterizing SVGs";
          messageEl.textContent = `Rasterizing ${msg.svgs.length} SVG${msg.svgs.length === 1 ? "" : "s"}…`;
          setIndeterminate();
        }
        break;
      }
      case "error": {
        if (visible && lastPhase !== "done")
          applyProgress("error", msg.message, null);
        break;
      }
    }
  }
  function destroy() {
    if (hideTimer)
      clearTimeout(hideTimer);
    overlay.remove();
  }
  return { handleBackendMessage, notifyImportStart, destroy };
}
function formatBytes(n) {
  if (n < 1024)
    return `${n} B`;
  if (n < 1024 * 1024)
    return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

// src/audio/bgm.ts
var BGM_POLL_MS = 100;
function parseBgmCtrl(ctrl) {
  if (!ctrl.startsWith("bgm___"))
    return null;
  const split = ctrl.split("___");
  if (split.length < 3)
    return null;
  const url = split[2] ?? "";
  if (!url)
    return null;
  const volumeRaw = split[1];
  const parsed = volumeRaw === "auto" ? 0.5 : Number.parseFloat(volumeRaw ?? "0.5");
  const safe = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0.5;
  return { volume: safe, url };
}
function setupBgmPlayer(log) {
  let bgmElement = null;
  let currentUrl = null;
  let pollHandle = null;
  let stopped = false;
  function tryPlayMarker(node) {
    const ctrl = node.getAttribute("risu-ctrl");
    if (!ctrl)
      return;
    const parsed = parseBgmCtrl(ctrl);
    if (!parsed)
      return;
    if (bgmElement)
      return;
    const { volume: safeVolume, url } = parsed;
    log.info(`bgm: starting url=${url.slice(0, 60)}... volume=${safeVolume}`);
    try {
      const audio = new Audio(url);
      audio.volume = safeVolume;
      audio.addEventListener("ended", () => {
        try {
          audio.remove();
        } catch {}
        if (bgmElement === audio) {
          bgmElement = null;
          currentUrl = null;
        }
      });
      audio.addEventListener("error", (e) => {
        log.warn(`bgm: audio error url=${url.slice(0, 60)}... event=${String(e)}`);
        if (bgmElement === audio) {
          bgmElement = null;
          currentUrl = null;
        }
      });
      bgmElement = audio;
      currentUrl = url;
      audio.play().catch((err) => {
        log.warn(`bgm: play() rejected — ${err.message}. ` + `Browser autoplay policy may require user gesture.`);
        if (bgmElement === audio) {
          bgmElement = null;
          currentUrl = null;
        }
      });
    } catch (err) {
      log.warn(`bgm: setup failed url=${url.slice(0, 60)}... — ${err.message}`);
    }
  }
  function walkSubtree(root) {
    if (stopped || bgmElement)
      return;
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    if (root instanceof HTMLElement && root.matches?.('[risu-ctrl^="bgm___"]')) {
      tryPlayMarker(root);
      if (bgmElement)
        return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let cur = walker.nextNode();
    while (cur) {
      if (cur instanceof HTMLElement) {
        if (cur.matches('[risu-ctrl^="bgm___"]')) {
          tryPlayMarker(cur);
          if (bgmElement)
            return;
        }
        if (cur.shadowRoot && cur.shadowRoot.mode === "open") {
          walkSubtree(cur.shadowRoot);
          if (bgmElement)
            return;
        }
      }
      cur = walker.nextNode();
    }
  }
  function scanRoot() {
    if (stopped)
      return;
    try {
      walkSubtree(document.body);
    } catch (err) {
      log.warn(`bgm: scanRoot threw — ${err.message}`);
    }
  }
  let observer = null;
  try {
    observer = new MutationObserver((mutations) => {
      if (stopped || bgmElement)
        return;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE)
            continue;
          walkSubtree(node);
          if (bgmElement)
            return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (err) {
    log.warn(`bgm: MutationObserver setup failed — ${err.message}`);
  }
  function poll() {
    if (stopped)
      return;
    scanRoot();
    pollHandle = setTimeout(poll, BGM_POLL_MS);
  }
  poll();
  log.info("bgm: setup ok (singleton observer + 100ms poll)");
  return {
    destroy() {
      stopped = true;
      if (pollHandle !== null) {
        clearTimeout(pollHandle);
        pollHandle = null;
      }
      try {
        observer?.disconnect();
      } catch {}
      if (bgmElement) {
        try {
          bgmElement.pause();
          bgmElement.remove();
        } catch {}
        bgmElement = null;
      }
      currentUrl = null;
      log.info("bgm: destroyed");
    }
  };
}

// src/svg-raster.ts
var MAX_RASTER_DIMENSION = 512;
function snapshotTheme() {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  return {
    color: cs.color || "#000",
    accent: cs.getPropertyValue("--lumiverse-primary").trim(),
    text: cs.getPropertyValue("--lumiverse-text").trim()
  };
}
function prepareSvgForRaster(svg, classification, theme) {
  if (classification !== "theme-reactive")
    return svg;
  const declarations = [
    `color:${theme.color}`,
    ...theme.accent ? [`--lumiverse-primary:${theme.accent}`] : [],
    ...theme.text ? [`--lumiverse-text:${theme.text}`] : []
  ].join(";");
  if (!declarations)
    return svg;
  const styleAttrRe = /(<svg\b[^>]*\sstyle\s*=\s*)(["'])([^"']*)(["'])/i;
  if (styleAttrRe.test(svg)) {
    return svg.replace(styleAttrRe, (_full, head, q, value, q2) => `${head}${q}${declarations};${value}${q2}`);
  }
  return svg.replace(/<svg\b/i, `<svg style="${declarations}"`);
}
async function rasterizeOne(svg, width, height) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image;
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
    });
    const w = Math.min(MAX_RASTER_DIMENSION, Math.max(1, Math.round(img.naturalWidth || width || 32)));
    const h = Math.min(MAX_RASTER_DIMENSION, Math.max(1, Math.round(img.naturalHeight || height || 32)));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return null;
    ctx.drawImage(img, 0, 0, w, h);
    const blobOut = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });
    if (!blobOut)
      return null;
    const buf = await blobOut.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
async function uploadPng(png, filename) {
  try {
    const fd = new FormData;
    fd.set("image", new Blob([png], { type: "image/png" }), filename);
    const resp = await fetch("/api/v1/images", {
      method: "POST",
      body: fd,
      credentials: "include"
    });
    if (!resp.ok)
      return null;
    const js = await resp.json();
    return typeof js?.id === "string" && js.id.length > 0 ? js.id : null;
  } catch {
    return null;
  }
}
function setupSvgRasterizer(opts) {
  const { log, sendToBackend } = opts;
  async function rasterizeBatch(msg) {
    const tStart = performance.now();
    const total = msg.svgs.length;
    if (total === 0) {
      sendToBackend({
        type: "register_svg_raster_index",
        characterId: msg.characterId,
        imageIdByMarker: {}
      });
      return;
    }
    log.info(`svg-raster: starting char=${msg.characterId} name=${msg.characterName} ` + `count=${total}`);
    const theme = snapshotTheme();
    log.info(`svg-raster: theme snapshot color=${theme.color} ` + `accent=${theme.accent || "<unset>"} text=${theme.text || "<unset>"}`);
    const CONCURRENCY = 6;
    const queue = [...msg.svgs];
    const imageIdByMarker = {};
    let done = 0;
    let failed = 0;
    const worker = async () => {
      while (queue.length > 0) {
        const task = queue.shift();
        if (!task)
          break;
        const prepared = prepareSvgForRaster(task.svg, task.classification, theme);
        const png = await rasterizeOne(prepared, task.width, task.height);
        if (!png) {
          imageIdByMarker[String(task.markerN)] = null;
          failed += 1;
          done += 1;
          log.warn(`svg-raster: rasterizeOne failed markerN=${task.markerN} ` + `class=${task.classification} svg_len=${task.svg.length}`);
          continue;
        }
        const fname = `svg-raster-${task.markerN}.png`;
        const imageId = await uploadPng(png, fname);
        if (!imageId) {
          imageIdByMarker[String(task.markerN)] = null;
          failed += 1;
          log.warn(`svg-raster: uploadPng failed markerN=${task.markerN} ` + `bytes=${png.byteLength}`);
        } else {
          imageIdByMarker[String(task.markerN)] = imageId;
        }
        done += 1;
      }
    };
    const workers = Array.from({ length: Math.min(CONCURRENCY, total) }, () => worker());
    await Promise.all(workers);
    log.info(`svg-raster: done char=${msg.characterId} total=${total} ` + `successful=${done - failed} failed=${failed} ` + `elapsed=${Math.round(performance.now() - tStart)}ms`);
    sendToBackend({
      type: "register_svg_raster_index",
      characterId: msg.characterId,
      imageIdByMarker
    });
  }
  return {
    handleRasterizeSvgsMessage(msg) {
      rasterizeBatch(msg).catch((err) => {
        log.error(`svg-raster: rasterizeBatch threw char=${msg.characterId}: ${err.message}`);
        sendToBackend({
          type: "register_svg_raster_index",
          characterId: msg.characterId,
          imageIdByMarker: {}
        });
      });
    }
  };
}

// src/realm/messages.ts
var REALM_HUB_API_URL = "https://sv.risuai.xyz";
var REALM_DOWNLOAD_URL = "https://realm.risuai.net";
function realmResourceUrl(img) {
  return `${REALM_HUB_API_URL}/resource/${img}`;
}
function realmShareUrl(id) {
  return `${REALM_DOWNLOAD_URL}/character/${id}`;
}

// src/realm/api.ts
function extractRealmId(input) {
  const trimmed = input.trim();
  if (trimmed.length === 0)
    return null;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const realm = url.searchParams.get("realm") ?? url.searchParams.get("code");
      if (realm)
        return realm;
      const last = trimmed.split(/[/?#]/).filter(Boolean).pop();
      return last ?? null;
    } catch {
      return null;
    }
  }
  const tail = trimmed.split("?").pop();
  return tail && tail.length > 0 ? tail : trimmed;
}

// src/realm/styles.css
var styles_default2 = `.lr-realm-launcher {\r
  box-sizing: border-box;\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  gap: 6px;\r
  height: 32px;\r
  padding: 0 12px;\r
  margin: 0;\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  border-radius: 999px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  color: var(--lumiverse-text, #e6e6e6);\r
  font-family: inherit;\r
  font-size: 12px;\r
  font-weight: 500;\r
  line-height: 1;\r
  cursor: pointer;\r
  transition: transform var(--lumiverse-transition-fast, 120ms) ease,\r
    background var(--lumiverse-transition-fast, 120ms) ease,\r
    border-color var(--lumiverse-transition-fast, 120ms) ease;\r
}\r
\r
.lr-sidebar-header {\r
  display: flex;\r
  align-items: center;\r
  gap: 8px;\r
  padding: 8px;\r
}\r
\r
.lr-realm-launcher:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.06));\r
  border-color: var(--lumiverse-primary, #5b8cff);\r
  transform: translateY(-1px);\r
}\r
\r
.lr-realm-launcher-icon {\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
}\r
\r
.lr-realm-launcher-icon svg {\r
  width: 14px;\r
  height: 14px;\r
  flex-shrink: 0;\r
}\r
\r
.lr-realm-root {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  min-height: 0;\r
  font-family: inherit;\r
  color: var(--lumiverse-text, #e6e6e6);\r
}\r
\r
.lr-realm-toolbar {\r
  display: flex;\r
  align-items: center;\r
  gap: 10px;\r
  flex-wrap: wrap;\r
  flex-shrink: 0;\r
}\r
\r
.lr-realm-search {\r
  flex: 1 1 320px;\r
  min-width: 240px;\r
  display: flex;\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  border-radius: var(--lumiverse-radius, 8px);\r
  overflow: hidden;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
}\r
\r
.lr-realm-search input {\r
  flex: 1;\r
  background: transparent;\r
  border: 0;\r
  outline: 0;\r
  color: inherit;\r
  padding: 8px 12px;\r
  font-size: 14px;\r
  font-family: inherit;\r
}\r
\r
.lr-realm-search button {\r
  background: transparent;\r
  border: 0;\r
  color: var(--lumiverse-text, #e6e6e6);\r
  padding: 0 14px;\r
  cursor: pointer;\r
}\r
\r
.lr-realm-search button:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.06));\r
}\r
\r
.lr-realm-sort {\r
  display: inline-flex;\r
  gap: 6px;\r
  flex-wrap: wrap;\r
}\r
\r
.lr-realm-pill {\r
  padding: 6px 12px;\r
  border-radius: 999px;\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  color: var(--lumiverse-text, #e6e6e6);\r
  cursor: pointer;\r
  font-size: 12px;\r
  font-family: inherit;\r
}\r
\r
.lr-realm-pill:hover {\r
  border-color: var(--lumiverse-border-hover, var(--lumiverse-primary, #5b8cff));\r
}\r
\r
.lr-realm-pill.active {\r
  border-color: var(--lumiverse-primary, #5b8cff);\r
  background: color-mix(in srgb, var(--lumiverse-primary, #5b8cff) 18%, transparent);\r
  color: var(--lumiverse-primary-text, #b3c7ff);\r
}\r
\r
.lr-realm-pill.danger {\r
  color: #ff8a8a;\r
}\r
\r
.lr-realm-pill.danger.active {\r
  background: rgba(255, 95, 95, 0.18);\r
  border-color: #ff5f5f;\r
  color: #ff8a8a;\r
}\r
\r
.lr-realm-additional {\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, #8b8b8b);\r
  flex-shrink: 0;\r
}\r
\r
.lr-realm-body {\r
  flex: 1;\r
  overflow-y: auto;\r
  min-height: 200px;\r
}\r
\r
.lr-realm-grid {\r
  display: grid;\r
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));\r
  gap: 12px;\r
}\r
\r
.lr-realm-card {\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  border-radius: var(--lumiverse-radius, 8px);\r
  padding: 12px;\r
  display: flex;\r
  gap: 10px;\r
  cursor: pointer;\r
  text-align: left;\r
  font-family: inherit;\r
  color: inherit;\r
  transition: background var(--lumiverse-transition-fast, 120ms) ease,\r
    border-color var(--lumiverse-transition-fast, 120ms) ease;\r
}\r
\r
.lr-realm-card:hover {\r
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.06));\r
  border-color: var(--lumiverse-border-hover, var(--lumiverse-primary, #5b8cff));\r
}\r
\r
.lr-realm-thumb {\r
  width: 84px;\r
  height: 84px;\r
  flex-shrink: 0;\r
  border-radius: var(--lumiverse-radius, 8px);\r
  background: rgba(255, 255, 255, 0.04);\r
  object-fit: cover;\r
  object-position: top;\r
}\r
\r
.lr-realm-thumb-fallback {\r
  width: 84px;\r
  height: 84px;\r
  flex-shrink: 0;\r
  border-radius: var(--lumiverse-radius, 8px);\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  color: var(--lumiverse-text-dim, #6f6f6f);\r
  font-size: 24px;\r
}\r
\r
.lr-realm-card-body {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
  min-width: 0;\r
  flex: 1;\r
}\r
\r
.lr-realm-card-name {\r
  font-weight: 600;\r
  font-size: 14px;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
\r
.lr-realm-card-desc {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, #8b8b8b);\r
  display: -webkit-box;\r
  -webkit-line-clamp: 2;\r
  -webkit-box-orient: vertical;\r
  overflow: hidden;\r
}\r
\r
.lr-realm-tags {\r
  display: flex;\r
  flex-wrap: wrap;\r
  gap: 4px;\r
  margin-top: auto;\r
}\r
\r
.lr-realm-tag {\r
  font-size: 10px;\r
  color: var(--lumiverse-primary, #6ea6ff);\r
  padding: 1px 6px;\r
  border-radius: 4px;\r
  background: color-mix(in srgb, var(--lumiverse-primary, #5b8cff) 8%, transparent);\r
}\r
\r
.lr-realm-card-stats {\r
  font-size: 10px;\r
  color: var(--lumiverse-text-dim, #6f6f6f);\r
  margin-top: 2px;\r
}\r
\r
.lr-realm-pager {\r
  display: flex;\r
  justify-content: center;\r
  align-items: center;\r
  gap: 8px;\r
  padding: 14px 0 6px 0;\r
}\r
\r
.lr-realm-pager button {\r
  width: 36px;\r
  height: 36px;\r
  border-radius: var(--lumiverse-radius, 8px);\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  color: inherit;\r
  font-family: inherit;\r
  cursor: pointer;\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
}\r
\r
.lr-realm-pager button:hover:not(:disabled) {\r
  border-color: var(--lumiverse-primary, #5b8cff);\r
}\r
\r
.lr-realm-pager button:disabled {\r
  opacity: 0.4;\r
  cursor: not-allowed;\r
}\r
\r
.lr-realm-pager-page {\r
  min-width: 36px;\r
  text-align: center;\r
  font-weight: 600;\r
}\r
\r
.lr-realm-status {\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  padding: 60px 20px;\r
  text-align: center;\r
  color: var(--lumiverse-text-muted, #8b8b8b);\r
  font-size: 13px;\r
  gap: 8px;\r
}\r
\r
.lr-realm-status.error {\r
  color: #ff8a8a;\r
}\r
\r
.lr-realm-popup-overlay {\r
  position: fixed;\r
  inset: 0;\r
  background: var(--lumiverse-bg-deep, #050608);\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  padding: 24px;\r
  z-index: 2147483600;\r
  overscroll-behavior: contain;\r
  -webkit-tap-highlight-color: transparent;\r
}\r
\r
.lr-realm-popup {\r
  background: var(--lumiverse-fill, #1c1f24);\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  border-radius: var(--lumiverse-radius, 10px);\r
  width: min(640px, 100%);\r
  max-height: calc(100vh - 48px);\r
  max-height: calc(100dvh - 48px);\r
  overflow-y: auto;\r
  padding: 20px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 14px;\r
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);\r
}\r
\r
@media (max-width: 600px) {\r
  .lr-realm-popup-overlay {\r
    padding: 0;\r
  }\r
  .lr-realm-popup {\r
    width: 100%;\r
    height: 100%;\r
    height: 100dvh;\r
    max-height: 100vh;\r
    max-height: 100dvh;\r
    border-radius: 0;\r
    border: 0;\r
  }\r
  .lr-realm-popup-header {\r
    flex-direction: column;\r
  }\r
  .lr-realm-popup-thumb {\r
    width: 100%;\r
    height: 200px;\r
  }\r
  .lr-realm-popup-actions button {\r
    flex: 1 1 calc(50% - 4px);\r
    min-height: 44px;\r
  }\r
}\r
\r
.lr-realm-popup-header {\r
  display: flex;\r
  gap: 16px;\r
}\r
\r
.lr-realm-popup-thumb {\r
  width: 132px;\r
  height: 132px;\r
  border-radius: var(--lumiverse-radius, 10px);\r
  object-fit: cover;\r
  object-position: top;\r
  flex-shrink: 0;\r
}\r
\r
.lr-realm-popup-info {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 6px;\r
  min-width: 0;\r
  flex: 1;\r
}\r
\r
.lr-realm-popup-name {\r
  font-size: 20px;\r
  font-weight: 700;\r
  word-break: break-word;\r
}\r
\r
.lr-realm-popup-author {\r
  font-size: 12px;\r
  color: var(--lumiverse-text-muted, #8b8b8b);\r
}\r
\r
.lr-realm-popup-license {\r
  font-size: 11px;\r
  color: var(--lumiverse-text-muted, #8b8b8b);\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  padding: 4px 8px;\r
  border-radius: 6px;\r
  display: inline-block;\r
  width: fit-content;\r
}\r
\r
.lr-realm-popup-desc {\r
  font-size: 13px;\r
  line-height: 1.5;\r
  color: var(--lumiverse-text, #e6e6e6);\r
  word-break: break-word;\r
}\r
\r
.lr-realm-popup-desc > *:first-child { margin-top: 0; }\r
.lr-realm-popup-desc > *:last-child { margin-bottom: 0; }\r
.lr-realm-popup-desc p { margin: 0 0 10px 0; }\r
.lr-realm-popup-desc h1,\r
.lr-realm-popup-desc h2,\r
.lr-realm-popup-desc h3,\r
.lr-realm-popup-desc h4,\r
.lr-realm-popup-desc h5,\r
.lr-realm-popup-desc h6 {\r
  margin: 12px 0 6px 0;\r
  font-weight: 700;\r
  line-height: 1.3;\r
}\r
.lr-realm-popup-desc h1 { font-size: 18px; }\r
.lr-realm-popup-desc h2 { font-size: 16px; }\r
.lr-realm-popup-desc h3 { font-size: 15px; }\r
.lr-realm-popup-desc h4,\r
.lr-realm-popup-desc h5,\r
.lr-realm-popup-desc h6 { font-size: 14px; }\r
.lr-realm-popup-desc strong,\r
.lr-realm-popup-desc b { font-weight: 700; }\r
.lr-realm-popup-desc em,\r
.lr-realm-popup-desc i { font-style: italic; }\r
.lr-realm-popup-desc del,\r
.lr-realm-popup-desc s { text-decoration: line-through; opacity: 0.75; }\r
.lr-realm-popup-desc a {\r
  color: var(--lumiverse-primary, #5b8cff);\r
  text-decoration: underline;\r
  text-underline-offset: 2px;\r
}\r
.lr-realm-popup-desc a:hover { filter: brightness(1.15); }\r
.lr-realm-popup-desc img {\r
  max-width: 100%;\r
  height: auto;\r
  border-radius: 6px;\r
  margin: 6px 0;\r
}\r
.lr-realm-popup-desc ul,\r
.lr-realm-popup-desc ol {\r
  margin: 0 0 10px 0;\r
  padding-left: 22px;\r
}\r
.lr-realm-popup-desc li { margin: 2px 0; }\r
.lr-realm-popup-desc code {\r
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
  font-size: 12px;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.06));\r
  padding: 1px 5px;\r
  border-radius: 4px;\r
}\r
.lr-realm-popup-desc pre {\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.05));\r
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));\r
  border-radius: 6px;\r
  padding: 8px 10px;\r
  overflow-x: auto;\r
  margin: 0 0 10px 0;\r
}\r
.lr-realm-popup-desc pre code {\r
  background: transparent;\r
  padding: 0;\r
  font-size: 12px;\r
}\r
.lr-realm-popup-desc blockquote {\r
  margin: 0 0 10px 0;\r
  padding: 4px 12px;\r
  border-left: 3px solid var(--lumiverse-border, rgba(255, 255, 255, 0.18));\r
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.7));\r
}\r
.lr-realm-popup-desc hr {\r
  border: 0;\r
  border-top: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));\r
  margin: 12px 0;\r
}\r
\r
.lr-realm-popup-actions {\r
  display: flex;\r
  gap: 8px;\r
  align-items: center;\r
  flex-wrap: wrap;\r
}\r
\r
.lr-realm-primary {\r
  background: var(--lumiverse-primary, #5b8cff);\r
  color: #ffffff;\r
  border: 0;\r
  padding: 9px 16px;\r
  border-radius: var(--lumiverse-radius, 8px);\r
  font-weight: 600;\r
  cursor: pointer;\r
  font-family: inherit;\r
  font-size: 13px;\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 6px;\r
}\r
\r
.lr-realm-primary:hover:not(:disabled) {\r
  filter: brightness(1.1);\r
}\r
\r
.lr-realm-primary:disabled {\r
  opacity: 0.6;\r
  cursor: not-allowed;\r
}\r
\r
.lr-realm-secondary {\r
  background: transparent;\r
  color: inherit;\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  padding: 9px 14px;\r
  border-radius: var(--lumiverse-radius, 8px);\r
  cursor: pointer;\r
  font-family: inherit;\r
  font-size: 13px;\r
}\r
\r
.lr-realm-secondary:hover {\r
  border-color: var(--lumiverse-primary, #5b8cff);\r
}\r
\r
.lr-realm-toast {\r
  position: absolute;\r
  bottom: 12px;\r
  left: 50%;\r
  transform: translateX(-50%);\r
  background: var(--lumiverse-fill, rgba(40, 40, 60, 0.95));\r
  color: var(--lumiverse-text, #e6e6e6);\r
  padding: 9px 14px;\r
  border-radius: var(--lumiverse-radius, 8px);\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  font-size: 12.5px;\r
  pointer-events: none;\r
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);\r
  z-index: 3;\r
}\r
\r
.lr-realm-toast.error {\r
  border-color: #ff5f5f;\r
  color: #ff8a8a;\r
}\r
\r
.lr-realm-prompt-overlay {\r
  position: fixed;\r
  inset: 0;\r
  background: var(--lumiverse-bg-deep, #050608);\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  padding: 24px;\r
  z-index: 2147483601;\r
  -webkit-tap-highlight-color: transparent;\r
}\r
\r
.lr-realm-prompt {\r
  background: var(--lumiverse-fill, #1c1f24);\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  border-radius: var(--lumiverse-radius, 10px);\r
  width: min(420px, 100%);\r
  padding: 16px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);\r
}\r
\r
@media (max-width: 600px) {\r
  .lr-realm-prompt-overlay {\r
    padding: 16px;\r
  }\r
  .lr-realm-prompt input {\r
    min-height: 44px;\r
  }\r
  .lr-realm-prompt-actions button {\r
    min-height: 44px;\r
  }\r
}\r
\r
.lr-realm-prompt input {\r
  width: 100%;\r
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.04));\r
  color: inherit;\r
  border: 1px solid var(--lumiverse-border, #2a2a2a);\r
  border-radius: var(--lumiverse-radius, 8px);\r
  padding: 9px 12px;\r
  font-family: inherit;\r
  font-size: 13px;\r
  outline: 0;\r
  box-sizing: border-box;\r
}\r
\r
.lr-realm-prompt input:focus {\r
  border-color: var(--lumiverse-primary, #5b8cff);\r
}\r
\r
.lr-realm-prompt-actions {\r
  display: flex;\r
  justify-content: flex-end;\r
  gap: 8px;\r
}\r
\r
.lr-realm-spinner {\r
  width: 14px;\r
  height: 14px;\r
  border-radius: 50%;\r
  border: 2px solid rgba(255, 255, 255, 0.2);\r
  border-top-color: var(--lumiverse-primary, #5b8cff);\r
  animation: lr-realm-spin 800ms linear infinite;\r
  display: inline-block;\r
}\r
\r
@keyframes lr-realm-spin {\r
  to {\r
    transform: rotate(360deg);\r
  }\r
}\r
`;

// src/realm/styles.ts
var REALM_STYLES = styles_default2;

// src/realm/frontend.ts
function isRealmBackendMessage(msg) {
  return msg.type === "realm_search_result" || msg.type === "realm_info_result" || msg.type === "realm_download_started";
}
var ICON_HUB = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3a14.4 14.4 0 0 1 0 18M12 3a14.4 14.4 0 0 0 0 18"/></svg>';
var ICON_SEARCH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
var ICON_LEFT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>';
var ICON_RIGHT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>';
var SEARCH_DEBOUNCE_MS = 350;
var TOAST_DURATION_MS = 4000;
var MODAL_MAX_WIDTH = 1357;
var MODAL_MAX_HEIGHT_CAP = 1600;
var MODAL_VIEWPORT_MARGIN = 32;
function computeModalWidth() {
  const vw = typeof window !== "undefined" && window.innerWidth ? window.innerWidth : 1180;
  return Math.max(640, Math.min(MODAL_MAX_WIDTH, vw - MODAL_VIEWPORT_MARGIN * 2));
}
function computeModalMaxHeight() {
  const vh = typeof window !== "undefined" && window.innerHeight ? window.innerHeight : 880;
  return Math.max(400, Math.min(MODAL_MAX_HEIGHT_CAP, vh - MODAL_VIEWPORT_MARGIN * 2));
}
function setupRealmModal(deps) {
  const { ctx, sendToBackend, log } = deps;
  const cleanups = [];
  cleanups.push(ctx.dom.addStyle(REALM_STYLES));
  const state = {
    search: "",
    page: 0,
    sort: "recommended",
    nsfw: false,
    loading: false,
    cards: [],
    additionalHTML: "",
    errorText: "",
    selected: null,
    promptOpen: false,
    downloading: false,
    pendingSearchReq: null,
    pendingInfoReq: null,
    pendingDownloadReq: null
  };
  let surface = null;
  let searchDebounceTimer;
  let toastTimer;
  let toastEl = null;
  let popupOverlay = null;
  let promptOverlay = null;
  const launchBtn = document.createElement("button");
  launchBtn.type = "button";
  launchBtn.className = "lr-realm-launcher";
  launchBtn.title = "Browse RisuRealm characters";
  const launchIcon = document.createElement("span");
  launchIcon.className = "lr-realm-launcher-icon";
  launchIcon.innerHTML = ICON_HUB;
  const launchLabel = document.createElement("span");
  launchLabel.textContent = "Browse RisuRealm";
  launchBtn.append(launchIcon, launchLabel);
  launchBtn.addEventListener("click", () => open());
  deps.mountTarget.appendChild(launchBtn);
  cleanups.push(() => launchBtn.remove());
  function open() {
    if (surface)
      return;
    log.info("realm: opening modal");
    let modalHandle;
    try {
      modalHandle = ctx.ui.showModal({
        title: "RisuRealm",
        width: computeModalWidth(),
        maxHeight: computeModalMaxHeight()
      });
    } catch (err) {
      log.error("realm: showModal failed:", err);
      return;
    }
    const root = document.createElement("div");
    root.className = "lr-realm-root";
    modalHandle.root.appendChild(root);
    const toolbar = document.createElement("div");
    toolbar.className = "lr-realm-toolbar";
    root.appendChild(toolbar);
    const searchWrap = document.createElement("div");
    searchWrap.className = "lr-realm-search";
    toolbar.appendChild(searchWrap);
    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.placeholder = "Search RisuRealm…";
    searchInput.value = state.search;
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value;
      if (searchDebounceTimer)
        clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.page = 0;
        if (state.sort === "recommended" || state.sort === "random") {
          state.sort = "";
        }
        doSearch();
      }, SEARCH_DEBOUNCE_MS);
    });
    searchInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        if (searchDebounceTimer)
          clearTimeout(searchDebounceTimer);
        state.page = 0;
        if (state.sort === "recommended" || state.sort === "random") {
          state.sort = "";
        }
        doSearch();
      }
    });
    searchWrap.appendChild(searchInput);
    const searchBtn = document.createElement("button");
    searchBtn.type = "button";
    searchBtn.title = "Search";
    searchBtn.innerHTML = ICON_SEARCH;
    searchBtn.addEventListener("click", () => {
      if (searchDebounceTimer)
        clearTimeout(searchDebounceTimer);
      state.page = 0;
      if (state.sort === "recommended" || state.sort === "random") {
        state.sort = "";
      }
      doSearch();
    });
    searchWrap.appendChild(searchBtn);
    const SORTS = [
      { id: "recommended", label: "Recommended" },
      { id: "", label: "Recent" },
      { id: "trending", label: "Trending" },
      { id: "downloads", label: "Downloads" },
      { id: "random", label: "Random" }
    ];
    const sortBtns = new Map;
    const sortRow = document.createElement("div");
    sortRow.className = "lr-realm-sort";
    toolbar.appendChild(sortRow);
    for (const s of SORTS) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lr-realm-pill";
      b.textContent = s.label;
      b.addEventListener("click", () => {
        const next = state.sort === s.id ? "recommended" : s.id;
        state.sort = next;
        if (next === "recommended" && state.nsfw)
          state.nsfw = false;
        state.page = 0;
        doSearch();
      });
      sortRow.appendChild(b);
      sortBtns.set(s.id, b);
    }
    const nsfwBtn = document.createElement("button");
    nsfwBtn.type = "button";
    nsfwBtn.className = "lr-realm-pill danger";
    nsfwBtn.textContent = "NSFW";
    nsfwBtn.addEventListener("click", () => {
      state.nsfw = !state.nsfw;
      if (state.nsfw && state.sort === "recommended")
        state.sort = "trending";
      state.page = 0;
      doSearch();
    });
    toolbar.appendChild(nsfwBtn);
    const importBtn = document.createElement("button");
    importBtn.type = "button";
    importBtn.className = "lr-realm-secondary";
    importBtn.textContent = "Import by URL/ID";
    importBtn.addEventListener("click", () => {
      state.promptOpen = true;
      render();
    });
    toolbar.appendChild(importBtn);
    const additionalEl = document.createElement("div");
    additionalEl.className = "lr-realm-additional";
    additionalEl.hidden = true;
    root.appendChild(additionalEl);
    const body = document.createElement("div");
    body.className = "lr-realm-body";
    root.appendChild(body);
    surface = {
      handle: modalHandle,
      bodyEl: body,
      toolbarEl: toolbar,
      searchInputEl: searchInput,
      sortBtns,
      nsfwBtn,
      additionalEl
    };
    modalHandle.onDismiss(() => {
      log.info("realm: modal dismissed");
      surface = null;
      state.selected = null;
      state.promptOpen = false;
      popupOverlay?.remove();
      popupOverlay = null;
      promptOverlay?.remove();
      promptOverlay = null;
      if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = undefined;
      }
      toastEl?.remove();
      toastEl = null;
    });
    if (state.cards.length === 0 && !state.loading) {
      doSearch();
    } else {
      render();
    }
  }
  function close() {
    surface?.handle.dismiss();
  }
  function render() {
    if (!surface)
      return;
    const { sortBtns, nsfwBtn, additionalEl, bodyEl } = surface;
    nsfwBtn.classList.toggle("active", state.nsfw);
    for (const [id, btn] of sortBtns) {
      btn.classList.toggle("active", id === state.sort);
    }
    additionalEl.hidden = true;
    additionalEl.textContent = "";
    bodyEl.replaceChildren();
    if (state.loading) {
      const status = document.createElement("div");
      status.className = "lr-realm-status";
      const spinner = document.createElement("span");
      spinner.className = "lr-realm-spinner";
      const label = document.createElement("span");
      label.textContent = "Loading…";
      status.append(spinner, label);
      bodyEl.appendChild(status);
    } else if (state.errorText.length > 0) {
      const status = document.createElement("div");
      status.className = "lr-realm-status error";
      status.textContent = state.errorText;
      bodyEl.appendChild(status);
    } else if (state.cards.length === 0) {
      const status = document.createElement("div");
      status.className = "lr-realm-status";
      status.textContent = "No characters found.";
      bodyEl.appendChild(status);
    } else {
      const grid = document.createElement("div");
      grid.className = "lr-realm-grid";
      for (const card of state.cards) {
        grid.appendChild(renderCard(card));
      }
      bodyEl.appendChild(grid);
      if (state.sort !== "random" && state.sort !== "recommended") {
        bodyEl.appendChild(renderPager());
      }
    }
    if (toastEl)
      bodyEl.appendChild(toastEl);
    syncOverlays();
  }
  function syncOverlays() {
    if (state.selected) {
      if (popupOverlay)
        popupOverlay.remove();
      const next = renderPopup(state.selected);
      document.body.appendChild(next);
      popupOverlay = next;
    } else if (popupOverlay) {
      popupOverlay.remove();
      popupOverlay = null;
    }
    if (state.promptOpen) {
      if (promptOverlay)
        promptOverlay.remove();
      const next = renderPrompt();
      document.body.appendChild(next);
      promptOverlay = next;
    } else if (promptOverlay) {
      promptOverlay.remove();
      promptOverlay = null;
    }
  }
  function renderCard(card) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lr-realm-card";
    btn.addEventListener("click", () => {
      state.selected = card;
      render();
    });
    if (card.img && card.img.length > 0) {
      const img = document.createElement("img");
      img.className = "lr-realm-thumb";
      img.alt = card.name;
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.src = realmResourceUrl(card.img);
      img.addEventListener("error", () => {
        const fb = document.createElement("div");
        fb.className = "lr-realm-thumb-fallback";
        fb.textContent = "?";
        img.replaceWith(fb);
      });
      btn.appendChild(img);
    } else {
      const fb = document.createElement("div");
      fb.className = "lr-realm-thumb-fallback";
      fb.textContent = "?";
      btn.appendChild(fb);
    }
    const bodyEl = document.createElement("div");
    bodyEl.className = "lr-realm-card-body";
    btn.appendChild(bodyEl);
    const name = document.createElement("div");
    name.className = "lr-realm-card-name";
    name.textContent = card.name || "(unnamed)";
    bodyEl.appendChild(name);
    const desc = document.createElement("div");
    desc.className = "lr-realm-card-desc";
    desc.textContent = pickDescription(card.desc);
    bodyEl.appendChild(desc);
    if (card.tags && card.tags.length > 0) {
      const tags = document.createElement("div");
      tags.className = "lr-realm-tags";
      const visible = card.tags.slice(0, 5);
      for (const t of visible) {
        const tag = document.createElement("span");
        tag.className = "lr-realm-tag";
        tag.textContent = t;
        tags.appendChild(tag);
      }
      if (card.tags.length > visible.length) {
        const more = document.createElement("span");
        more.className = "lr-realm-tag";
        more.textContent = `+${card.tags.length - visible.length}`;
        tags.appendChild(more);
      }
      bodyEl.appendChild(tags);
    }
    const stats = document.createElement("div");
    stats.className = "lr-realm-card-stats";
    const featureLabels = [];
    if (card.hasLore)
      featureLabels.push("Lorebook");
    if (card.hasEmotion)
      featureLabels.push("Emotion");
    if (card.hasAsset)
      featureLabels.push("Assets");
    const featurePart = featureLabels.length > 0 ? ` · ${featureLabels.join(" · ")}` : "";
    stats.textContent = `↓ ${card.download ?? 0}${featurePart}`;
    bodyEl.appendChild(stats);
    return btn;
  }
  function renderPager() {
    const pager = document.createElement("div");
    pager.className = "lr-realm-pager";
    const prev = document.createElement("button");
    prev.type = "button";
    prev.title = "Previous page";
    prev.disabled = state.page === 0;
    prev.innerHTML = ICON_LEFT;
    prev.addEventListener("click", () => {
      if (state.page > 0) {
        state.page -= 1;
        doSearch();
      }
    });
    pager.appendChild(prev);
    const label = document.createElement("div");
    label.className = "lr-realm-pager-page";
    label.textContent = String(state.page + 1);
    pager.appendChild(label);
    const next = document.createElement("button");
    next.type = "button";
    next.title = "Next page";
    next.innerHTML = ICON_RIGHT;
    next.addEventListener("click", () => {
      state.page += 1;
      doSearch();
    });
    pager.appendChild(next);
    return pager;
  }
  function renderPopup(card) {
    const wrap = document.createElement("div");
    wrap.className = "lr-realm-popup-overlay";
    wrap.addEventListener("click", (ev) => {
      if (ev.target === wrap) {
        state.selected = null;
        render();
      }
    });
    const popup = document.createElement("div");
    popup.className = "lr-realm-popup";
    wrap.appendChild(popup);
    const headerRow = document.createElement("div");
    headerRow.className = "lr-realm-popup-header";
    popup.appendChild(headerRow);
    if (card.img) {
      const img = document.createElement("img");
      img.className = "lr-realm-popup-thumb";
      img.alt = card.name;
      img.referrerPolicy = "no-referrer";
      img.src = realmResourceUrl(card.img);
      headerRow.appendChild(img);
    }
    const info = document.createElement("div");
    info.className = "lr-realm-popup-info";
    headerRow.appendChild(info);
    const name = document.createElement("div");
    name.className = "lr-realm-popup-name";
    name.textContent = card.name || "(unnamed)";
    info.appendChild(name);
    if (card.authorname) {
      const author = document.createElement("div");
      author.className = "lr-realm-popup-author";
      author.textContent = `by ${card.authorname}`;
      info.appendChild(author);
    }
    if (card.tags && card.tags.length > 0) {
      const tags = document.createElement("div");
      tags.className = "lr-realm-tags";
      for (const t of card.tags) {
        const tag = document.createElement("span");
        tag.className = "lr-realm-tag";
        tag.textContent = t;
        tags.appendChild(tag);
      }
      info.appendChild(tags);
    }
    const featureRow = document.createElement("div");
    featureRow.className = "lr-realm-popup-author";
    const featureBits = [`↓ ${card.download ?? 0}`];
    if (card.hasLore)
      featureBits.push("Lorebook");
    if (card.hasEmotion)
      featureBits.push("Emotion");
    if (card.hasAsset)
      featureBits.push("Assets");
    if (card.viewScreen && card.viewScreen !== "none")
      featureBits.push(`view: ${card.viewScreen}`);
    featureRow.textContent = featureBits.join(" · ");
    info.appendChild(featureRow);
    if (card.license && card.license.length > 0) {
      const lic = document.createElement("div");
      lic.className = "lr-realm-popup-license";
      lic.textContent = `License: ${card.license}`;
      info.appendChild(lic);
    }
    const desc = document.createElement("div");
    desc.className = "lr-realm-popup-desc";
    desc.appendChild(renderDescription(pickDescription(card.desc)));
    popup.appendChild(desc);
    const actions = document.createElement("div");
    actions.className = "lr-realm-popup-actions";
    popup.appendChild(actions);
    const importBtn = document.createElement("button");
    importBtn.type = "button";
    importBtn.className = "lr-realm-primary";
    importBtn.disabled = state.downloading;
    if (state.downloading) {
      const spin = document.createElement("span");
      spin.className = "lr-realm-spinner";
      const lbl = document.createElement("span");
      lbl.textContent = "Downloading…";
      importBtn.append(spin, lbl);
    } else {
      importBtn.textContent = "Import to Lumiverse";
    }
    importBtn.addEventListener("click", () => {
      if (state.downloading)
        return;
      doDownload(card.id);
    });
    actions.appendChild(importBtn);
    const linkBtn = document.createElement("button");
    linkBtn.type = "button";
    linkBtn.className = "lr-realm-secondary";
    linkBtn.textContent = "Copy share link";
    linkBtn.addEventListener("click", () => {
      const url = realmShareUrl(card.id);
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).then(() => showToast("Share link copied"), () => showToast("Copy failed", true));
      } else {
        showToast(url);
      }
    });
    actions.appendChild(linkBtn);
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "lr-realm-secondary";
    cancel.textContent = "Close";
    cancel.addEventListener("click", () => {
      state.selected = null;
      render();
    });
    actions.appendChild(cancel);
    return wrap;
  }
  function renderPrompt() {
    const wrap = document.createElement("div");
    wrap.className = "lr-realm-prompt-overlay";
    wrap.addEventListener("click", (ev) => {
      if (ev.target === wrap) {
        state.promptOpen = false;
        render();
      }
    });
    const promptEl = document.createElement("div");
    promptEl.className = "lr-realm-prompt";
    wrap.appendChild(promptEl);
    const heading = document.createElement("div");
    heading.style.fontWeight = "600";
    heading.textContent = "Import character from URL or ID";
    promptEl.appendChild(heading);
    const input = document.createElement("input");
    input.placeholder = "realm.risuai.net/character/… or character id";
    promptEl.appendChild(input);
    const actions = document.createElement("div");
    actions.className = "lr-realm-prompt-actions";
    promptEl.appendChild(actions);
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "lr-realm-secondary";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => {
      state.promptOpen = false;
      render();
    });
    actions.appendChild(cancel);
    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "lr-realm-primary";
    ok.textContent = "Import";
    const submit = () => {
      const id = extractRealmId(input.value);
      if (!id) {
        showToast("Could not parse URL or ID", true);
        return;
      }
      state.promptOpen = false;
      doDownload(id);
    };
    ok.addEventListener("click", submit);
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter")
        submit();
    });
    actions.appendChild(ok);
    setTimeout(() => input.focus(), 0);
    return wrap;
  }
  function showToast(message, isError = false) {
    if (!surface)
      return;
    if (toastTimer)
      clearTimeout(toastTimer);
    toastEl?.remove();
    toastEl = document.createElement("div");
    toastEl.className = isError ? "lr-realm-toast error" : "lr-realm-toast";
    toastEl.textContent = message;
    surface.bodyEl.appendChild(toastEl);
    toastTimer = setTimeout(() => {
      toastEl?.remove();
      toastEl = null;
      toastTimer = undefined;
    }, TOAST_DURATION_MS);
  }
  function pickDescription(raw) {
    if (!raw)
      return "";
    const trimmed = raw.trim();
    if (trimmed.length === 0)
      return "";
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const obj = JSON.parse(trimmed);
        const lang = (typeof navigator !== "undefined" ? navigator.language?.slice(0, 2) : "en") ?? "en";
        return obj[lang] ?? obj.en ?? obj.xx ?? Object.values(obj)[0] ?? trimmed;
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  function nextRequestId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
  function doSearch() {
    state.loading = true;
    state.errorText = "";
    const requestId = nextRequestId("search");
    state.pendingSearchReq = requestId;
    log.info(`realm modal: search req=${requestId} q=${JSON.stringify(state.search)} page=${state.page} sort=${state.sort} nsfw=${state.nsfw}`);
    sendToBackend({
      type: "realm_search",
      requestId,
      search: state.search,
      page: state.page,
      nsfw: state.nsfw,
      sort: state.sort
    });
    render();
  }
  function doDownload(id) {
    if (state.downloading)
      return;
    state.downloading = true;
    const requestId = nextRequestId("download");
    state.pendingDownloadReq = requestId;
    log.info(`realm modal: download req=${requestId} id=${id}`);
    const label = state.selected?.name || `RisuRealm character ${id}`;
    deps.onImportStart?.(label);
    sendToBackend({ type: "realm_download", requestId, id });
    surface?.handle.dismiss();
  }
  function handleBackendMessage(msg) {
    switch (msg.type) {
      case "realm_search_result": {
        if (state.pendingSearchReq && msg.requestId !== state.pendingSearchReq)
          return;
        state.pendingSearchReq = null;
        state.loading = false;
        if (msg.ok) {
          state.cards = msg.cards;
          state.errorText = "";
          state.additionalHTML = msg.additionalHTML ?? "";
        } else {
          state.cards = [];
          state.errorText = msg.error ?? "Search failed";
          state.additionalHTML = "";
        }
        render();
        break;
      }
      case "realm_info_result": {
        if (state.pendingInfoReq && msg.requestId !== state.pendingInfoReq)
          return;
        state.pendingInfoReq = null;
        if (msg.ok && msg.info) {
          state.selected = msg.info;
          if (!surface)
            open();
          render();
        } else {
          showToast(msg.error ?? "Lookup failed", true);
        }
        break;
      }
      case "realm_download_started": {
        if (state.pendingDownloadReq && msg.requestId !== state.pendingDownloadReq)
          return;
        state.pendingDownloadReq = null;
        state.downloading = false;
        if (msg.ok) {
          showToast("Downloaded — translating now…");
          state.selected = null;
          render();
          surface?.handle.dismiss();
        } else {
          showToast(msg.error ?? "Download failed", true);
          render();
        }
        break;
      }
    }
  }
  const onKeyDownCapture = (ev) => {
    if (ev.key !== "Escape")
      return;
    if (state.promptOpen) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      state.promptOpen = false;
      render();
      return;
    }
    if (state.selected) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      state.selected = null;
      render();
    }
  };
  document.addEventListener("keydown", onKeyDownCapture, true);
  cleanups.push(() => document.removeEventListener("keydown", onKeyDownCapture, true));
  function destroy() {
    if (searchDebounceTimer)
      clearTimeout(searchDebounceTimer);
    if (toastTimer)
      clearTimeout(toastTimer);
    surface?.handle.dismiss();
    for (const fn of cleanups) {
      try {
        fn();
      } catch {}
    }
  }
  return {
    open,
    close,
    isOpen: () => surface !== null,
    handleBackendMessage,
    destroy
  };
}

// src/ui/alert-modal.ts
function setupAlertModal(opts) {
  const { ctx, sendToBackend, log } = opts;
  const open = new Map;
  function show(msg) {
    let modal;
    try {
      modal = ctx.ui.showModal({ title: "", width: 380 });
    } catch (err) {
      log.error("alert-modal: showModal failed", err);
      sendToBackend({ type: "alert_dismissed", requestId: msg.requestId });
      return;
    }
    open.set(msg.requestId, modal);
    const root = modal.root;
    root.classList.add("lr-alert-modal");
    if (msg.kind === "error")
      root.classList.add("lr-alert-error");
    const messageEl = document.createElement("p");
    messageEl.className = "lr-alert-message";
    messageEl.textContent = msg.message;
    root.appendChild(messageEl);
    const actions = document.createElement("div");
    actions.className = "lr-alert-actions";
    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.className = "lr-alert-ok";
    okBtn.textContent = "OK";
    okBtn.addEventListener("click", () => {
      try {
        modal.dismiss();
      } catch {}
    });
    actions.appendChild(okBtn);
    root.appendChild(actions);
    modal.onDismiss(() => {
      open.delete(msg.requestId);
      sendToBackend({ type: "alert_dismissed", requestId: msg.requestId });
    });
    queueMicrotask(() => {
      try {
        okBtn.focus();
      } catch {}
    });
  }
  return {
    handleBackendMessage(msg) {
      if (msg.type === "request_alert")
        show(msg);
    },
    destroy() {
      for (const m of open.values()) {
        try {
          m.dismiss();
        } catch {}
      }
      open.clear();
    }
  };
}

// src/ui/pick-modal.ts
function setupPickModal(opts) {
  const { ctx, sendToBackend, log } = opts;
  const open = new Map;
  function show(msg) {
    let modal;
    try {
      modal = ctx.ui.showModal({ title: msg.title || "", width: 420 });
    } catch (err) {
      log.error("pick-modal: showModal failed", err);
      sendToBackend({ type: "pick_resolved", requestId: msg.requestId, value: null });
      return;
    }
    open.set(msg.requestId, modal);
    let chosen = null;
    const root = modal.root;
    root.classList.add("lr-pick-modal");
    const list = document.createElement("div");
    list.className = "lr-pick-list";
    for (const opt of msg.options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lr-pick-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        chosen = opt;
        try {
          modal.dismiss();
        } catch {}
      });
      list.appendChild(btn);
    }
    root.appendChild(list);
    const actions = document.createElement("div");
    actions.className = "lr-pick-actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "lr-pick-cancel";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => {
      chosen = null;
      try {
        modal.dismiss();
      } catch {}
    });
    actions.appendChild(cancel);
    root.appendChild(actions);
    modal.onDismiss(() => {
      open.delete(msg.requestId);
      sendToBackend({ type: "pick_resolved", requestId: msg.requestId, value: chosen });
    });
    queueMicrotask(() => {
      try {
        list.firstElementChild?.focus();
      } catch {}
    });
  }
  return {
    handleBackendMessage(msg) {
      if (msg.type === "request_pick")
        show(msg);
    },
    destroy() {
      for (const m of open.values()) {
        try {
          m.dismiss();
        } catch {}
      }
      open.clear();
    }
  };
}

// src/ui/legacy-reimport-modal.ts
function setupLegacyReimportModal(opts) {
  const { ctx, log } = opts;
  opts.sendToBackend;
  const open = new Map;
  const shownThisSession = new Set;
  function show(msg) {
    if (shownThisSession.has(msg.characterId))
      return;
    shownThisSession.add(msg.characterId);
    let modal;
    try {
      modal = ctx.ui.showModal({ title: "Legacy Card Detected", width: 460 });
    } catch (err) {
      log.error("legacy-reimport-modal: showModal failed", err);
      return;
    }
    open.set(msg.characterId, modal);
    const root = modal.root;
    root.classList.add("lr-alert-modal");
    const lead = document.createElement("p");
    lead.className = "lr-alert-lead";
    lead.textContent = "If you notice any issues with this card, please re-import it.";
    root.appendChild(lead);
    const context = document.createElement("p");
    context.className = "lr-alert-message";
    const nameEl = document.createElement("span");
    nameEl.className = "lr-alert-card-name";
    nameEl.textContent = msg.characterName;
    context.appendChild(nameEl);
    context.appendChild(document.createTextNode(" was imported before LumiRealm 0.3.0. Future translator updates apply " + "automatically only to cards imported on 0.3.0 or later."));
    root.appendChild(context);
    const guidance = document.createElement("p");
    guidance.className = "lr-alert-message";
    guidance.textContent = "You only need to re-import this card if you notice something rendering incorrectly. " + "This is a one-time prompt.";
    root.appendChild(guidance);
    const note = document.createElement("p");
    note.className = "lr-alert-note";
    const label = document.createElement("span");
    label.className = "lr-alert-note-label";
    label.textContent = "Note:";
    note.appendChild(label);
    note.appendChild(document.createTextNode(" you will never need to re-import cards imported from today onward. " + "This is a one-time improvement to our translator pipeline."));
    root.appendChild(note);
    const actions = document.createElement("div");
    actions.className = "lr-alert-actions";
    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.className = "lr-alert-ok";
    okBtn.textContent = "Got it";
    okBtn.addEventListener("click", () => {
      try {
        modal.dismiss();
      } catch {}
    });
    actions.appendChild(okBtn);
    root.appendChild(actions);
    modal.onDismiss(() => {
      open.delete(msg.characterId);
    });
    queueMicrotask(() => {
      try {
        okBtn.focus();
      } catch {}
    });
  }
  return {
    handleBackendMessage(msg) {
      if (msg.type === "notify_legacy_card_needs_reimport")
        show(msg);
    },
    destroy() {
      for (const m of open.values()) {
        try {
          m.dismiss();
        } catch {}
      }
      open.clear();
    }
  };
}

// src/ui/host-version-modal.ts
function setupHostVersionModal(opts) {
  const { ctx, log } = opts;
  opts.sendToBackend;
  let current = null;
  let shownThisSession = false;
  function show(msg) {
    if (shownThisSession)
      return;
    shownThisSession = true;
    let modal;
    try {
      modal = ctx.ui.showModal({ title: "Update Lumiverse", width: 460 });
    } catch (err) {
      log.error("host-version-modal: showModal failed", err);
      return;
    }
    current = modal;
    const root = modal.root;
    root.classList.add("lr-alert-modal");
    const lead = document.createElement("p");
    lead.className = "lr-alert-lead";
    lead.textContent = "LumiRealm needs a newer Lumiverse to work correctly.";
    root.appendChild(lead);
    const detail = document.createElement("p");
    detail.className = "lr-alert-message";
    const minSpan = document.createElement("span");
    minSpan.className = "lr-alert-card-name";
    minSpan.textContent = msg.minimum;
    detail.appendChild(document.createTextNode("Required: Lumiverse "));
    detail.appendChild(minSpan);
    detail.appendChild(document.createTextNode(" or newer. "));
    if (msg.hostVersion) {
      detail.appendChild(document.createTextNode("This host is running "));
      const hostSpan = document.createElement("span");
      hostSpan.className = "lr-alert-card-name";
      hostSpan.textContent = msg.hostVersion;
      detail.appendChild(hostSpan);
      detail.appendChild(document.createTextNode("."));
    } else {
      detail.appendChild(document.createTextNode("Host version unknown."));
    }
    root.appendChild(detail);
    const guidance = document.createElement("p");
    guidance.className = "lr-alert-message";
    guidance.textContent = "Some features may fail or behave unexpectedly until you update.";
    root.appendChild(guidance);
    const subnote = document.createElement("p");
    subnote.className = "lr-alert-message";
    const dim = document.createElement("span");
    dim.style.fontSize = "0.85em";
    dim.style.opacity = "0.7";
    dim.textContent = "⚠️ If a newer update isn't avaliable, you may need to switch to " + "the Lumiverse beta (staging). See the community guide on Discord.";
    subnote.appendChild(dim);
    root.appendChild(subnote);
    const actions = document.createElement("div");
    actions.className = "lr-alert-actions";
    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.className = "lr-alert-ok";
    okBtn.textContent = "Got it";
    okBtn.addEventListener("click", () => {
      try {
        modal.dismiss();
      } catch {}
    });
    actions.appendChild(okBtn);
    root.appendChild(actions);
    modal.onDismiss(() => {
      if (current === modal)
        current = null;
    });
    queueMicrotask(() => {
      try {
        okBtn.focus();
      } catch {}
    });
  }
  return {
    handleBackendMessage(msg) {
      if (msg.type === "notify_host_version_outdated")
        show(msg);
    },
    destroy() {
      if (current) {
        try {
          current.dismiss();
        } catch {}
        current = null;
      }
    }
  };
}

// src/ui/permissions-modal.ts
function setupPermissionsModal(opts) {
  const { ctx, log } = opts;
  opts.sendToBackend;
  let current = null;
  let lastShownKey = null;
  function show(msg) {
    if (msg.missing.length === 0) {
      if (current) {
        try {
          current.dismiss();
        } catch {}
        current = null;
      }
      lastShownKey = null;
      return;
    }
    const key = [...msg.missing].sort().join(",");
    if (key === lastShownKey)
      return;
    lastShownKey = key;
    if (current) {
      try {
        current.dismiss();
      } catch {}
      current = null;
    }
    let modal;
    try {
      modal = ctx.ui.showModal({ title: "LumiRealm: missing permissions", width: 520 });
    } catch (err) {
      log.error("permissions-modal: showModal failed", err);
      return;
    }
    current = modal;
    const root = modal.root;
    root.classList.add("lr-alert-modal");
    const lead = document.createElement("p");
    lead.className = "lr-alert-lead";
    lead.textContent = msg.missing.length === 1 ? "LumiRealm needs one permission that hasn't been granted." : `LumiRealm needs ${msg.missing.length} permissions that haven't been granted.`;
    root.appendChild(lead);
    const list = document.createElement("ul");
    list.className = "lr-alert-perm-list";
    for (const perm of msg.missing) {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.className = "lr-alert-card-name";
      name.textContent = perm;
      li.appendChild(name);
      const purpose = msg.purposes[perm];
      if (purpose) {
        li.appendChild(document.createTextNode(`: ${purpose}`));
      }
      list.appendChild(li);
    }
    root.appendChild(list);
    const note = document.createElement("div");
    note.className = "lr-alert-note";
    const noteLabel = document.createElement("span");
    noteLabel.className = "lr-alert-note-label";
    noteLabel.textContent = "⚠️";
    note.appendChild(noteLabel);
    note.appendChild(document.createTextNode(" Grant them, then toggle LumiRealm "));
    const emphasis = document.createElement("span");
    emphasis.className = "lr-alert-emphasize";
    emphasis.textContent = "off and back on";
    note.appendChild(emphasis);
    note.appendChild(document.createTextNode(" in the Extensions panel."));
    root.appendChild(note);
    const actions = document.createElement("div");
    actions.className = "lr-alert-actions";
    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.className = "lr-alert-ok";
    okBtn.textContent = "Got it";
    okBtn.addEventListener("click", () => {
      try {
        modal.dismiss();
      } catch {}
    });
    actions.appendChild(okBtn);
    root.appendChild(actions);
    modal.onDismiss(() => {
      if (current === modal)
        current = null;
    });
    queueMicrotask(() => {
      try {
        okBtn.focus();
      } catch {}
    });
  }
  return {
    handleBackendMessage(msg) {
      if (msg.type === "notify_missing_permissions")
        show(msg);
    },
    destroy() {
      if (current) {
        try {
          current.dismiss();
        } catch {}
        current = null;
      }
    }
  };
}

// src/ui/bridge-status-banner.ts
var EXT_LABELS = {
  lumiagent: "LumiAgent",
  lumirealm: "LumiRealm"
};
function labelFor(id) {
  if (!id)
    return "extension";
  return EXT_LABELS[id] ?? id;
}
function setupBridgeStatusBanner(opts) {
  const { log } = opts;
  let host = null;
  let lastKey = null;
  const dismissedKeys = new Set;
  function clearBanner() {
    if (host) {
      try {
        host.remove();
      } catch {}
      host = null;
    }
  }
  function makePermChip(text) {
    const chip = document.createElement("span");
    chip.className = "lr-bridge-perm";
    chip.textContent = text;
    Object.assign(chip.style, {
      display: "inline-block",
      padding: "1px 6px",
      margin: "0 1px",
      background: "var(--lumiverse-surface-alt, rgba(147, 112, 219, 0.18))",
      color: "var(--lumiverse-primary, #9370db)",
      borderRadius: "3px",
      fontFamily: "var(--lumiverse-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
      fontSize: "0.9em",
      fontWeight: "600"
    });
    return chip;
  }
  function renderBody(body, missing, missingSide, otherSide) {
    body.textContent = "";
    body.appendChild(document.createTextNode(`${missingSide} is missing the `));
    if (missing.length === 1) {
      body.appendChild(document.createTextNode("permission "));
      body.appendChild(makePermChip(missing[0]));
    } else {
      body.appendChild(document.createTextNode("permissions "));
      missing.forEach((p, i) => {
        if (i > 0)
          body.appendChild(document.createTextNode(", "));
        body.appendChild(makePermChip(p));
      });
    }
    body.appendChild(document.createTextNode(`, required for ${otherSide} communication. The agent integration will not work until this is granted in Lumiverse's extension panel.`));
  }
  function show(missing, forCaller) {
    const missingSide = "LumiRealm";
    const otherSide = labelFor(forCaller);
    const key = `${otherSide}::${[...missing].sort().join(",")}`;
    if (lastKey === key && host)
      return;
    lastKey = key;
    if (dismissedKeys.has(key)) {
      clearBanner();
      return;
    }
    clearBanner();
    try {
      host = document.createElement("div");
      host.className = "lr-bridge-banner";
      Object.assign(host.style, {
        position: "fixed",
        right: "16px",
        bottom: "16px",
        maxWidth: "420px",
        background: "var(--lumiverse-bg-elevated, #1a1a1a)",
        color: "var(--lumiverse-text, #e5e5e5)",
        border: "1px solid var(--lumiverse-border, #333)",
        borderRadius: "6px",
        padding: "12px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        fontSize: "13px",
        lineHeight: "1.4",
        zIndex: "9999"
      });
      const title = document.createElement("div");
      title.textContent = `${otherSide} bridge offline`;
      Object.assign(title.style, {
        fontWeight: "600",
        marginBottom: "6px",
        color: "var(--lumiverse-warning, #f0a04b)"
      });
      host.appendChild(title);
      const body = document.createElement("div");
      renderBody(body, missing, missingSide, otherSide);
      Object.assign(body.style, { marginBottom: "10px" });
      host.appendChild(body);
      const actions = document.createElement("div");
      Object.assign(actions.style, {
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px"
      });
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.textContent = "Dismiss";
      Object.assign(dismiss.style, {
        background: "transparent",
        color: "var(--lumiverse-text-secondary, #aaa)",
        border: "1px solid var(--lumiverse-border, #333)",
        borderRadius: "4px",
        padding: "4px 10px",
        cursor: "pointer",
        fontSize: "12px"
      });
      dismiss.addEventListener("click", () => {
        dismissedKeys.add(key);
        clearBanner();
      });
      actions.appendChild(dismiss);
      host.appendChild(actions);
      document.body.appendChild(host);
    } catch (err) {
      log.warn("bridge-status-banner: render failed", err);
      clearBanner();
    }
  }
  return {
    handleBackendMessage(msg) {
      if (msg.type !== "notify_bridge_status")
        return;
      if (!msg.offline || msg.missingPermissions.length === 0) {
        lastKey = null;
        dismissedKeys.clear();
        clearBanner();
        return;
      }
      show(msg.missingPermissions, msg.forCaller ?? null);
    },
    destroy() {
      clearBanner();
    }
  };
}

// src/log/store.ts
var LEVEL_RANK = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
};
var DEFAULT_LOG_LEVEL = "info";
var LOG_LEVEL_VALUES = [
  "silent",
  "error",
  "warn",
  "info",
  "debug",
  "trace"
];
function isLogThreshold(v) {
  return typeof v === "string" && LOG_LEVEL_VALUES.includes(v);
}
function meetsThreshold(call, threshold) {
  return LEVEL_RANK[call] <= LEVEL_RANK[threshold];
}
var MAX_BYTES = 5 * 1024 * 1024;
var DEFAULT_STATE = { enabled: false, includeChatData: false, level: DEFAULT_LOG_LEVEL };
var SYSTEM_KEY = "__SYSTEM__";

class LogStore {
  events = [];
  bytes = 0;
  statesByUser = new Map;
  keyOf(userId) {
    return typeof userId === "string" && userId.length > 0 ? userId : SYSTEM_KEY;
  }
  stateFor(userId) {
    return this.statesByUser.get(this.keyOf(userId)) ?? DEFAULT_STATE;
  }
  isEnabled(userId) {
    return this.stateFor(userId).enabled;
  }
  shouldRedact(userId) {
    return !this.stateFor(userId).includeChatData;
  }
  getLevel(userId) {
    return this.stateFor(userId).level;
  }
  shouldEmit(level, userId) {
    if (userId !== undefined && userId !== null) {
      const s = this.stateFor(userId);
      return s.enabled && meetsThreshold(level, s.level);
    }
    for (const s of this.statesByUser.values()) {
      if (s.enabled && meetsThreshold(level, s.level))
        return true;
    }
    return false;
  }
  push(level, category, message, userId) {
    if (!this.shouldEmit(level, userId))
      return;
    let redactNow;
    if (userId !== undefined) {
      redactNow = !this.stateFor(userId).includeChatData;
    } else {
      redactNow = false;
      for (const s of this.statesByUser.values()) {
        if (s.enabled && !s.includeChatData) {
          redactNow = true;
          break;
        }
      }
    }
    const text = redactNow ? redact(message) : message;
    const tagged = typeof userId === "string" && userId.length > 0 ? userId : null;
    const ev = { ts: Date.now(), level, category, message: text, userId: tagged };
    const size = approxBytes(ev);
    this.events.push(ev);
    this.bytes += size;
    while (this.bytes > MAX_BYTES && this.events.length > 1) {
      const dropped = this.events.shift();
      if (dropped)
        this.bytes -= approxBytes(dropped);
    }
  }
  snapshot(userId) {
    if (userId === undefined)
      return { events: this.events.slice() };
    const target = typeof userId === "string" && userId.length > 0 ? userId : null;
    return { events: this.events.filter((e) => e.userId === target || e.userId === null) };
  }
  clear(userId) {
    if (userId === undefined) {
      this.events = [];
      this.bytes = 0;
      return;
    }
    const target = typeof userId === "string" && userId.length > 0 ? userId : null;
    this.events = this.events.filter((e) => e.userId !== target && e.userId !== null);
    this.bytes = this.events.reduce((a, e) => a + approxBytes(e), 0);
  }
  getState(userId) {
    const s = this.stateFor(userId);
    let eventCount = 0;
    let bufferBytes = 0;
    if (userId === undefined) {
      eventCount = this.events.length;
      bufferBytes = this.bytes;
    } else {
      const target = typeof userId === "string" && userId.length > 0 ? userId : null;
      for (const e of this.events) {
        if (e.userId === target || e.userId === null) {
          eventCount += 1;
          bufferBytes += approxBytes(e);
        }
      }
    }
    return { ...s, eventCount, bufferBytes };
  }
  setState(next, userId) {
    const key = this.keyOf(userId);
    const prior = this.statesByUser.get(key) ?? DEFAULT_STATE;
    const merged = {
      enabled: next.enabled ?? prior.enabled,
      includeChatData: next.includeChatData ?? prior.includeChatData,
      level: isLogThreshold(next.level) ? next.level : prior.level
    };
    this.statesByUser.set(key, merged);
    if (!merged.enabled && prior.enabled)
      this.clear(userId);
    return this.getState(userId);
  }
}
var logStore = new LogStore;
function approxBytes(ev) {
  return ev.message.length + ev.category.length + 32;
}
var REDACT_PATTERNS = [
  { re: /Bearer\s+[A-Za-z0-9\-_.~+/]+=*/gi, to: "Bearer [REDACTED]" },
  { re: /\bsk-[A-Za-z0-9_-]{20,}/g, to: "sk-[REDACTED]" },
  { re: /\b(api[_-]?key|secret|password|token)\s*[=:]\s*[^\s,;}]+/gi, to: "$1=[REDACTED]" },
  { re: /\b(content|content_preview|message|message_preview|text|text_preview|raw|raw_preview|template|prompt|response|reply)\s*=\s*"[^"]*"/gi, to: '$1="[REDACTED]"' },
  { re: /\b(content|content_preview|message|message_preview|text|text_preview|raw|raw_preview|template|prompt|response|reply)\s*=\s*'[^']*'/gi, to: "$1='[REDACTED]'" },
  { re: /"[^"\n]{80,}"/g, to: '"[CONTENT_REDACTED]"' },
  { re: /'[^'\n]{80,}'/g, to: "'[CONTENT_REDACTED]'" }
];
function redact(input) {
  let out = input;
  for (const { re, to } of REDACT_PATTERNS)
    out = out.replace(re, to);
  return out;
}

// src/log/frontend-capture.ts
var CONSOLE_METHODS = ["log", "info", "warn", "error", "debug"];
var consoleShimInstalled = false;
var originalConsole = {};
function methodToLevel(m) {
  if (m === "warn")
    return "warn";
  if (m === "error")
    return "error";
  if (m === "debug")
    return "debug";
  if (m === "info")
    return "info";
  return "trace";
}
function installConsoleCapture() {
  if (consoleShimInstalled)
    return;
  for (const m of CONSOLE_METHODS) {
    const original = console[m];
    originalConsole[m] = original.bind(console);
    console[m] = (...args) => {
      try {
        originalConsole[m]?.(...args);
      } catch {}
      try {
        const text = args.map(formatArg).join(" ");
        logStore.push(methodToLevel(m), "console", text);
      } catch {}
    };
  }
  consoleShimInstalled = true;
}
function removeConsoleCapture() {
  if (!consoleShimInstalled)
    return;
  for (const m of CONSOLE_METHODS) {
    const original = originalConsole[m];
    if (original)
      console[m] = original;
  }
  consoleShimInstalled = false;
}
function formatArg(a) {
  if (typeof a === "string")
    return a;
  if (a instanceof Error)
    return `${a.name}: ${a.message}`;
  try {
    return JSON.stringify(a);
  } catch {
    return String(a);
  }
}
var DOM_ALLOWLIST = [
  "[data-risu-bg-host]",
  "[data-message-id]"
];
var CREDENTIAL_INPUT_PATTERNS = [
  /\bapi[-_ ]?key\b/i,
  /\btoken\b/i,
  /\bsecret\b/i,
  /\bpassword\b/i
];
function isCredentialInput(el) {
  if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA")
    return false;
  const t = el.getAttribute("type")?.toLowerCase() ?? "";
  if (t === "password")
    return true;
  const haystack = `${el.getAttribute("name") ?? ""} ${el.getAttribute("placeholder") ?? ""} ${el.getAttribute("aria-label") ?? ""}`;
  return CREDENTIAL_INPUT_PATTERNS.some((re) => re.test(haystack));
}
function sanitizeNode2(node) {
  if (!(node instanceof Element))
    return;
  if (isCredentialInput(node)) {
    node.setAttribute("value", "[REDACTED]");
    if ("value" in node)
      node.value = "[REDACTED]";
    node.setAttribute("data-lumirealm-redacted", "credential");
  }
  if (node.shadowRoot) {
    const root = node.shadowRoot;
    if (root) {
      for (const child of Array.from(root.children))
        sanitizeNode2(child);
    }
  }
  for (const child of Array.from(node.childNodes))
    sanitizeNode2(child);
}
function captureDomSnapshot(includeChatData) {
  if (!includeChatData)
    return null;
  const fragments = [];
  const seen = new WeakSet;
  for (const sel of DOM_ALLOWLIST) {
    const matches = document.querySelectorAll(sel);
    for (const el of Array.from(matches)) {
      if (seen.has(el))
        continue;
      seen.add(el);
      try {
        const cloned = el.cloneNode(true);
        sanitizeNode2(cloned);
        fragments.push(`<!-- ${sel} -->
${cloned.outerHTML}`);
      } catch {}
    }
  }
  return fragments.length > 0 ? fragments.join(`

`) : null;
}
function captureStylesheets() {
  const out = [];
  for (let i = 0;i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    if (!sheet)
      continue;
    const source = sheet.href ?? `inline:${i}`;
    try {
      const rules = sheet.cssRules;
      if (!rules)
        continue;
      const css = Array.from(rules).map((r) => r.cssText).join(`
`);
      out.push({ source, css });
    } catch {
      out.push({ source, css: "/* cross-origin sheet — rules inaccessible */" });
    }
  }
  return out;
}
function buildBundle(args) {
  const snap = logStore.snapshot();
  const frontendEvents = snap.events.map((e) => ({
    ts: e.ts,
    level: e.level,
    category: e.category,
    message: !args.includeChatData ? redact(e.message) : e.message
  }));
  return {
    schema: "lumirealm-log-v1",
    exportedAt: new Date().toISOString(),
    mode: { enabled: true, includeChatData: args.includeChatData },
    session: {
      ...args.session,
      userAgent: navigator.userAgent,
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    },
    events: { backend: args.backendEvents, frontend: frontendEvents },
    domSnapshot: captureDomSnapshot(args.includeChatData),
    stylesheets: captureStylesheets()
  };
}
function downloadBundle(bundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const a = document.createElement("a");
  a.href = url;
  a.download = `lumirealm-log-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// src/frontend.ts
var HANDSHAKE_RETRY_MS = 3000;
var flog = {
  error(msg, ...rest) {
    console.error("[lumirealm]", msg, ...rest);
    logStore.push("error", "frontend", formatLine(msg, rest));
  },
  warn(msg, ...rest) {
    if (logStore.shouldEmit("warn"))
      console.warn("[lumirealm]", msg, ...rest);
    logStore.push("warn", "frontend", formatLine(msg, rest));
  },
  info(msg, ...rest) {
    if (logStore.shouldEmit("info"))
      console.log("[lumirealm]", msg, ...rest);
    logStore.push("info", "frontend", formatLine(msg, rest));
  },
  debug(msg, ...rest) {
    if (logStore.shouldEmit("debug"))
      console.log("[lumirealm]", msg, ...rest);
    logStore.push("debug", "frontend", formatLine(msg, rest));
  },
  trace(msg, ...rest) {
    if (logStore.shouldEmit("trace"))
      console.log("[lumirealm]", msg, ...rest);
    logStore.push("trace", "frontend", formatLine(msg, rest));
  }
};
function formatLine(msg, rest) {
  if (rest.length === 0)
    return msg;
  const tail = rest.map((r) => {
    if (r instanceof Error)
      return `${r.name}: ${r.message}`;
    if (typeof r === "string")
      return r;
    try {
      return JSON.stringify(r);
    } catch {
      return String(r);
    }
  }).join(" ");
  return `${msg} ${tail}`;
}
var LOG_STATE_LS_KEY = "lumirealm/log-state-v1";
function hydrateLogStateFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOG_STATE_LS_KEY);
    if (!raw)
      return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.enabled === "boolean" && typeof parsed.includeChatData === "boolean") {
      logStore.setState({
        enabled: parsed.enabled,
        includeChatData: parsed.includeChatData,
        level: isLogThreshold(parsed.level) ? parsed.level : DEFAULT_LOG_LEVEL
      });
    }
  } catch {}
}
function persistLogStateToLocalStorage(state) {
  try {
    localStorage.setItem(LOG_STATE_LS_KEY, JSON.stringify(state));
  } catch {}
}
function setup(ctx) {
  hydrateLogStateFromLocalStorage();
  flog.info("frontend setup: begin");
  const cleanups = [];
  const originalFetch = window.fetch.bind(window);
  const taggedFetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const urlStr = typeof url === "string" ? url : "";
    const isResolveBatch = urlStr.includes("/api/v1/macros/resolve-batch");
    const isRegexApply = urlStr.includes("/api/v1/regex-scripts/apply");
    const isDisplayPreprocess = urlStr.includes("/display-preprocess");
    if (!isResolveBatch && !isRegexApply && !isDisplayPreprocess)
      return originalFetch(input, init);
    const t0 = performance.now();
    if (isRegexApply) {
      let preview = "";
      try {
        const body = init?.body;
        if (typeof body === "string") {
          const parsed = JSON.parse(body);
          const findKeys = Object.keys(parsed.resolved_find_patterns ?? {});
          const replaceKeys = Object.keys(parsed.resolved_replacements ?? {});
          const dynKeys = Object.keys(parsed.dynamic_macros ?? {});
          preview = `scripts=${parsed.scripts?.length ?? 0} content_len=${parsed.content?.length ?? 0} preFind=${findKeys.length} preReplace=${replaceKeys.length} dyn=[${dynKeys.join(",")}]`;
        }
      } catch {}
      flog.trace(`[macro-tap] → POST regex-scripts/apply ${preview}`);
      const resp2 = await originalFetch(input, init);
      try {
        const clone = resp2.clone();
        const text = await clone.text();
        const parsed = (() => {
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
        })();
        if (parsed && typeof parsed.result === "string") {
          const stillRaw = /\{\{(?!\s*(?:user|char|bot|notChar|not_char|charName)\s*\}\})/i.test(parsed.result);
          flog.trace(`[macro-tap] ← regex-scripts/apply 200 in ${Math.round(performance.now() - t0)}ms result_len=${parsed.result.length} touched=${parsed.touched_vars?.length ?? 0} cacheable=${parsed.cacheable} still_has_raw_cbs=${stillRaw} result[0..200]=${JSON.stringify(parsed.result.slice(0, 200))}`);
        } else {
          flog.warn(`[macro-tap] ← regex-scripts/apply HTTP ${resp2.status} in ${Math.round(performance.now() - t0)}ms (body not JSON)`);
        }
      } catch (err) {
        flog.warn("[macro-tap] regex-scripts/apply clone/parse failed:", err);
      }
      return resp2;
    }
    if (isDisplayPreprocess) {
      flog.trace(`[macro-tap] → POST display-preprocess`);
      const resp2 = await originalFetch(input, init);
      flog.trace(`[macro-tap] ← display-preprocess HTTP ${resp2.status} in ${Math.round(performance.now() - t0)}ms`);
      return resp2;
    }
    let reqPreview = "";
    try {
      const body = init?.body;
      if (typeof body === "string") {
        const parsed = JSON.parse(body);
        const keys = Object.keys(parsed.templates ?? {});
        const firstKey = keys[0];
        const firstTmpl = firstKey ? parsed.templates?.[firstKey] : undefined;
        reqPreview = `templates=${keys.length} chat_id=${parsed.chat_id ?? "?"} character_id=${parsed.character_id ?? "?"} first_template[0..200]=${JSON.stringify((firstTmpl ?? "").slice(0, 200))}`;
      }
    } catch {}
    flog.trace(`[macro-tap] → POST resolve-batch ${reqPreview}`);
    const resp = await originalFetch(input, init);
    try {
      const clone = resp.clone();
      const text = await clone.text();
      const parsed = (() => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })();
      if (parsed?.resolved) {
        const entries = Object.entries(parsed.resolved);
        const leaksRaw = entries.filter(([, v]) => /\{\{/.test(v));
        const emptyKeys = entries.filter(([, v]) => v.length === 0).length;
        flog.trace(`[macro-tap] ← resolve-batch 200 in ${Math.round(performance.now() - t0)}ms keys=${entries.length} leaks_with_raw_macros=${leaksRaw.length} empty_keys=${emptyKeys}`);
        if (leaksRaw.length > 0) {
          for (const [k, v] of leaksRaw.slice(0, 3)) {
            flog.warn(`[macro-tap]   leak id=${k} resolved[0..300]=${JSON.stringify(v.slice(0, 300))}`);
          }
        }
        for (const [k, v] of entries) {
          flog.trace(`[macro-tap]   id=${k} len=${v.length} resolved[0..200]=${JSON.stringify(v.slice(0, 200))}`);
        }
      } else {
        flog.warn(`[macro-tap] ← resolve-batch HTTP ${resp.status} in ${Math.round(performance.now() - t0)}ms (body not JSON)`);
      }
    } catch (err) {
      flog.warn("[macro-tap] clone/parse failed:", err);
    }
    return resp;
  };
  Object.assign(taggedFetch, originalFetch);
  window.fetch = taggedFetch;
  cleanups.push(() => {
    window.fetch = originalFetch;
  });
  const dumpBubble = () => {
    const out = [];
    const bubbles = document.querySelectorAll("[data-message-id]");
    for (const b of bubbles) {
      const msgId = b.getAttribute("data-message-id") || "?";
      const islands = [];
      const islandEls = b.querySelectorAll('[class*="_htmlIsland_"]');
      for (const ie of islandEls) {
        const sr = ie.shadowRoot;
        islands.push({
          cls: ie.className,
          hasShadow: sr !== null,
          shadowMode: sr?.mode ?? null,
          shadowChildren: sr ? sr.childElementCount : null,
          shadowHasStyle: sr ? sr.querySelectorAll("style").length : null,
          shadowAdoptedSheets: sr ? sr.adoptedStyleSheets.length : null,
          lightInnerLen: ie.innerHTML.length,
          shadowInnerLen: sr ? Array.from(sr.children).map((c) => c.outerHTML).join("").length : null
        });
      }
      out.push({ msgId: msgId.slice(0, 8), bubbleHtmlLen: b.innerHTML.length, islandCount: islandEls.length, islands });
    }
    console.log("[lumirealm] [BUBBLE-DUMP]", JSON.stringify(out, null, 2));
    return out;
  };
  const dumpStyleScope = () => {
    const chatScope = document.getElementById("risu-compat-chat-scope-css");
    const islandSheets = (() => {
      const out = [];
      const shadows = document.querySelectorAll('[class*="_htmlIsland_"]');
      for (const s of shadows) {
        const sr = s.shadowRoot;
        if (!sr)
          continue;
        const adopted = sr.adoptedStyleSheets ?? [];
        let totalRules = 0;
        for (const sh of adopted) {
          try {
            totalRules += sh.cssRules.length;
          } catch {}
        }
        out.push({ adoptedSheetCount: adopted.length, cssRulesCount: totalRules });
      }
      return out;
    })();
    const result = {
      chatScopeBytes: chatScope?.textContent?.length ?? null,
      bgHtmlHostExists: document.querySelector("[data-risu-bg-host]") !== null,
      islandShadows: islandSheets
    };
    console.log("[lumirealm] [STYLE-SCOPE]", JSON.stringify(result, null, 2));
    return result;
  };
  window.__riCompatDump = {
    bubble: dumpBubble,
    styleScope: dumpStyleScope
  };
  cleanups.push(() => {
    try {
      delete window.__riCompatDump;
    } catch {}
  });
  cleanups.push(ctx.dom.addStyle(STYLES));
  flog.info("frontend setup: styles injected");
  const QUIET_SEND_TYPES = new Set([
    "import_card_chunk",
    "upload_module_chunk"
  ]);
  const sendToBackend = (msg) => {
    if (!QUIET_SEND_TYPES.has(msg.type)) {
      flog.trace(`frontend send: ${msg.type}`, msg);
    }
    ctx.sendToBackend(msg);
  };
  const importOverlay = setupImportOverlay(flog, sendToBackend);
  cleanups.push(() => importOverlay.destroy());
  let sidebar = null;
  try {
    sidebar = createSidebar({
      ctx,
      sendToBackend,
      log: flog,
      onImportStart: (fileName, onCancel, totalBytes) => importOverlay.notifyImportStart(fileName, "drawer", onCancel, totalBytes),
      onModuleImportStart: (fileName, onCancel, totalBytes) => importOverlay.notifyImportStart(fileName, "module", onCancel, totalBytes)
    });
    cleanups.push(() => sidebar?.destroy());
    flog.info("frontend setup: unified sidebar registered");
  } catch (err) {
    flog.error("createSidebar failed:", err);
    return () => {
      for (const fn of cleanups) {
        try {
          fn();
        } catch {}
      }
    };
  }
  const islandStyles = setupIslandStyles(flog, {
    riskuEnvironmentCss: risu_environment_default
  });
  cleanups.push(() => islandStyles.destroy());
  const bgRenderer = setupBgHtmlRenderer(ctx, flog, islandStyles);
  cleanups.push(() => bgRenderer.destroy());
  const bgmPlayer = setupBgmPlayer(flog);
  cleanups.push(() => bgmPlayer.destroy());
  let auxDebug = null;
  try {
    auxDebug = createAuxDebugPanel(flog);
    cleanups.push(() => auxDebug?.destroy());
  } catch (err) {
    flog.error("createAuxDebugPanel failed:", err);
  }
  const alertModal = setupAlertModal({ ctx, sendToBackend, log: flog });
  cleanups.push(() => alertModal.destroy());
  const pickModal = setupPickModal({ ctx, sendToBackend, log: flog });
  cleanups.push(() => pickModal.destroy());
  const legacyReimportModal = setupLegacyReimportModal({ ctx, sendToBackend, log: flog });
  cleanups.push(() => legacyReimportModal.destroy());
  const hostVersionModal = setupHostVersionModal({ ctx, sendToBackend, log: flog });
  cleanups.push(() => hostVersionModal.destroy());
  const permissionsModal = setupPermissionsModal({ ctx, sendToBackend, log: flog });
  cleanups.push(() => permissionsModal.destroy());
  const bridgeBanner = setupBridgeStatusBanner({ ctx, log: flog });
  cleanups.push(() => bridgeBanner.destroy());
  let realm = null;
  try {
    if (!sidebar)
      throw new Error("realm: sidebar required");
    realm = setupRealmModal({
      ctx,
      sendToBackend,
      log: flog,
      mountTarget: sidebar.headerRoot,
      onImportStart: (label) => importOverlay.notifyImportStart(label, "realm")
    });
    cleanups.push(() => realm?.destroy());
    flog.info("frontend setup: realm modal registered");
  } catch (err) {
    flog.error("setupRealmModal failed:", err);
  }
  const translateToggle = setupTranslateToggle({
    mountTarget: sidebar.headerRoot,
    sendToBackend,
    log: flog
  });
  cleanups.push(() => translateToggle.destroy());
  const translateOrchestrator = initTranslateOrchestrator({ sendToBackend, log: flog });
  cleanups.push(() => translateOrchestrator.destroy());
  const svgRasterizer = setupSvgRasterizer({ log: flog, sendToBackend });
  let activeRisuChatId = null;
  const onClickCapture = (e) => {
    const path = typeof e.composedPath === "function" ? e.composedPath() : [];
    const t = path[0] ?? e.target;
    if (!t || typeof t.closest !== "function")
      return;
    const el = t.closest("[risu-trigger], [risu-btn]");
    if (!el)
      return;
    const triggerName = el.getAttribute("risu-trigger");
    const btn = triggerName ? null : el.getAttribute("risu-btn");
    if (!triggerName && !btn)
      return;
    const idAttr = el.getAttribute("risu-id") ?? undefined;
    const chatId = activeRisuChatId;
    if (!chatId) {
      const label = triggerName ?? `btn=${btn}`;
      flog.warn(`manual click: active chat isn't a lumirealm chat, ignoring ${label}`);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (triggerName) {
      flog.info(`manual-trigger click: triggerName=${triggerName} triggerId=${idAttr ?? "<none>"} chatId=${chatId}`);
      sendToBackend({
        type: "manual_trigger",
        triggerName,
        ...idAttr !== undefined ? { triggerId: idAttr } : {},
        chatId
      });
    } else if (btn) {
      flog.info(`manual-button click: btn=${btn} btnId=${idAttr ?? "<none>"} chatId=${chatId}`);
      sendToBackend({
        type: "manual_button_click",
        btn,
        ...idAttr !== undefined ? { btnId: idAttr } : {},
        chatId
      });
    }
  };
  document.addEventListener("click", onClickCapture, true);
  cleanups.push(() => document.removeEventListener("click", onClickCapture, true));
  const debugHook = {
    get activeChatId() {
      return activeRisuChatId;
    },
    fire(triggerName, triggerId) {
      const chatId = activeRisuChatId;
      if (!chatId) {
        flog.warn(`__riCompat.fire: active chat isn't a lumirealm chat; open one first. triggerName=${triggerName}`);
        return false;
      }
      if (typeof triggerName !== "string" || triggerName.length === 0) {
        flog.warn("__riCompat.fire: triggerName must be a non-empty string");
        return false;
      }
      sendToBackend({
        type: "manual_trigger",
        triggerName,
        ...triggerId !== undefined ? { triggerId } : {},
        chatId
      });
      return true;
    },
    requestVariablesSnapshot() {
      if (!activeRisuChatId) {
        flog.warn("__riCompat.requestVariablesSnapshot: no active Risu chat");
        return false;
      }
      sendToBackend({ type: "request_variables_snapshot", chatId: activeRisuChatId });
      flog.info(`__riCompat.requestVariablesSnapshot: requested for chatId=${activeRisuChatId}`);
      return true;
    }
  };
  try {
    Object.defineProperty(window, "__riCompat", {
      value: debugHook,
      writable: false,
      configurable: true,
      enumerable: false
    });
    cleanups.push(() => {
      try {
        delete window.__riCompat;
      } catch {}
    });
  } catch (err) {
    flog.warn(`__riCompat install failed: ${err.message}`);
  }
  let lastSentW = -1;
  let lastSentH = -1;
  const reportDims = (reason, force = false) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (!force && w === lastSentW && h === lastSentH)
      return;
    lastSentW = w;
    lastSentH = h;
    flog.debug(`screen_dims: reporting reason=${reason} w=${w} h=${h}`);
    sendToBackend({ type: "screen_dims", width: w, height: h });
  };
  let resizeTimer;
  const onResize = () => {
    if (resizeTimer !== undefined)
      window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => reportDims("resize"), 250);
  };
  window.addEventListener("resize", onResize);
  cleanups.push(() => {
    window.removeEventListener("resize", onResize);
    if (resizeTimer !== undefined)
      window.clearTimeout(resizeTimer);
  });
  let ready = false;
  const QUIET_RECV_TYPES = new Set([
    "import_upload_ack",
    "module_upload_ack"
  ]);
  const unsub = ctx.onBackendMessage((raw) => {
    const msg = raw;
    if (!QUIET_RECV_TYPES.has(msg.type)) {
      flog.trace(`frontend recv: ${msg.type}`, msg);
    }
    if (msg.type === "log_state_pushed") {
      const level = isLogThreshold(msg.level) ? msg.level : DEFAULT_LOG_LEVEL;
      logStore.setState({ enabled: msg.enabled, includeChatData: msg.includeChatData, level });
      persistLogStateToLocalStorage({ enabled: msg.enabled, includeChatData: msg.includeChatData, level });
      if (msg.enabled)
        installConsoleCapture();
      else
        removeConsoleCapture();
    }
    if (msg.type === "log_export_pushed") {
      try {
        const bundle = buildBundle({
          backendEvents: msg.events,
          session: {
            extensionVersion: msg.session.extensionVersion,
            userId: msg.session.userId,
            activeChatId: msg.session.activeChatId ?? activeRisuChatId,
            activeCharacterId: msg.session.activeCharacterId
          },
          includeChatData: logStore.getState().includeChatData
        });
        downloadBundle(bundle);
      } catch (err) {
        flog.error("log_export_pushed: bundle/download failed", err);
      }
      sendToBackend({ type: "log_set_state", enabled: false, includeChatData: false });
    }
    if (msg.type === "cards_updated") {
      if (!ready) {
        flog.info("handshake complete on first cards_updated");
        reportDims("cards_updated", true);
      }
      ready = true;
    }
    if (msg.type === "set_active_chat") {
      const prevChatId = activeRisuChatId;
      activeRisuChatId = msg.chatId;
      if (activeRisuChatId !== prevChatId) {
        if (sidebar)
          sidebar.setActiveChatId(activeRisuChatId);
      }
      sidebar?.handleBackendMessage(msg);
      return;
    }
    if (msg.type === "render_bg_html" || msg.type === "clear_bg_html") {
      try {
        bgRenderer.handleMessage(msg);
      } catch (err) {
        flog.error("bg-html dispatch failed:", err);
      }
      return;
    }
    if (msg.type === "rasterize_svgs") {
      svgRasterizer.handleRasterizeSvgsMessage(msg);
      return;
    }
    if (msg.type === "aux_debug_capture") {
      auxDebug?.handleBackendMessage(msg);
      return;
    }
    if (msg.type === "request_alert") {
      alertModal.handleBackendMessage(msg);
      return;
    }
    if (msg.type === "request_pick") {
      pickModal.handleBackendMessage(msg);
      return;
    }
    if (msg.type === "notify_legacy_card_needs_reimport") {
      legacyReimportModal.handleBackendMessage(msg);
      return;
    }
    if (msg.type === "notify_host_version_outdated") {
      hostVersionModal.handleBackendMessage(msg);
      return;
    }
    if (msg.type === "notify_missing_permissions") {
      permissionsModal.handleBackendMessage(msg);
      return;
    }
    if (msg.type === "notify_bridge_status") {
      bridgeBanner.handleBackendMessage(msg);
      return;
    }
    if (isRealmBackendMessage(msg)) {
      realm?.handleBackendMessage(msg);
      try {
        importOverlay.handleBackendMessage(msg);
      } catch (err) {
        flog.warn("importOverlay realm dispatch threw:", err);
      }
      return;
    }
    try {
      importOverlay.handleBackendMessage(msg);
    } catch (err) {
      flog.warn("importOverlay dispatch threw:", err);
    }
    try {
      translateToggle.handleBackendMessage(msg);
    } catch (err) {
      flog.warn("translateToggle dispatch threw:", err);
    }
    sidebar?.handleBackendMessage(msg);
  });
  cleanups.push(unsub);
  function handshake() {
    flog.info("handshake: sending get_cards + screen_dims + log_request_state");
    sendToBackend({ type: "get_cards" });
    sendToBackend({ type: "log_request_state" });
    reportDims("handshake", true);
  }
  handshake();
  const retry = window.setInterval(() => {
    if (ready) {
      window.clearInterval(retry);
      return;
    }
    flog.debug(`handshake retry (ready=${ready})`);
    handshake();
  }, HANDSHAKE_RETRY_MS);
  cleanups.push(() => window.clearInterval(retry));
  flog.info("frontend setup: done");
  return () => {
    flog.info("frontend teardown");
    for (const fn of cleanups) {
      try {
        fn();
      } catch {}
    }
  };
}
export {
  setup,
  flog
};
