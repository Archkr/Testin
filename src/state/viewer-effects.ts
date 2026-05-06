// Human-readable one-line summaries for V2 trigger effects, for the Viewer panel.
// Per-opcode formatters mirror what the v2 emitter generates; the goal here is
// "readable pseudocode for the user", not parser fidelity.

export interface EffectSummary {
  readonly type: string;
  readonly indent: number;
  readonly summary: string;
}

export function summarizeEffect(eff: unknown): EffectSummary {
  if (!eff || typeof eff !== 'object') {
    return { type: 'unknown', indent: 0, summary: '(unknown)' };
  }
  const e = eff as Record<string, unknown>;
  const type = typeof e['type'] === 'string' ? (e['type'] as string) : 'unknown';
  const indent = typeof e['indent'] === 'number' && e['indent']! >= 0 ? (e['indent'] as number) : 0;
  return { type, indent, summary: formatBody(type, e) };
}

function formatBody(type: string, e: Record<string, unknown>): string {
  switch (type) {
    case 'v2Header': return '── header ──';
    case 'v2Comment': return `// ${str(e['value']).replace(/\r?\n/g, ' ').slice(0, 120)}`;
    case 'v2StopTrigger': return 'return';
    case 'v2BreakLoop': return 'break';
    case 'v2Else': return '} else {';
    case 'v2EndIndent': return '}';
    case 'v2Loop': return 'while (true) {';
    case 'v2LoopNTimes':
      return `for ${fmtRef(str(e['value']), valTy(e['valueType']))} times {`;
    case 'v2If':
      return `if ${fmtRef(str(e['source']), 'var')} ${str(e['condition'])} ${fmtRef(str(e['target']), valTy(e['targetType']))} {`;
    case 'v2IfAdvanced':
      return `if ${fmtRef(str(e['source']), valTy(e['sourceType']))} ${str(e['condition'])} ${fmtRef(str(e['target']), valTy(e['targetType']))} {`;
    case 'v2SetVar':
      return `$${str(e['var'])} ${str(e['operator'])} ${fmtRef(str(e['value']), valTy(e['valueType']))}`;
    case 'v2DeclareLocalVar':
      return `local $${str(e['var'])} = ${fmtRef(str(e['value']), valTy(e['valueType']))}`;
    case 'v2ConsoleLog':
      return `console.log ${fmtRef(str(e['source']), valTy(e['sourceType']))}`;
    case 'v2RunTrigger':
      return `runTrigger ${fmtRef(str(e['value']), valTy(e['valueType']))}`;
    case 'v2RunLLM':
      return `runLLM ${fmtRef(str(e['value']), valTy(e['valueType']))} → $${str(e['outputVar'])} (model=${str(e['model'])})`;
    case 'v2ShowAlert':
      return `alert ${fmtRef(str(e['value']), valTy(e['valueType']))}`;
    case 'v2Wait':
      return `wait ${fmtRef(str(e['value']), valTy(e['valueType']))}s`;
    case 'v2Impersonate':
      return `impersonate(${str(e['role'])}) ${fmtRef(str(e['value']), valTy(e['valueType']))}`;
    case 'v2SystemPrompt':
      return `systemPrompt @${str(e['location'])}: ${fmtRef(str(e['value']), valTy(e['valueType']))}`;
    case 'v2Tokenize':
      return `tokenize ${fmtRef(str(e['value']), valTy(e['valueType']))} → $${str(e['outputVar'])}`;
    case 'v2QuickSearchChat':
      return `quickSearchChat ${fmtRef(str(e['value']), valTy(e['valueType']))} (${str(e['condition'])}) → $${str(e['outputVar'])}`;
    case 'v2GetLastMessage': return `getLastMessage → $${str(e['outputVar'])}`;
    case 'v2GetMessageAtIndex':
      return `getMessage[${fmtRef(str(e['index']), valTy(e['indexType']))}] → $${str(e['outputVar'])}`;
    case 'v2GetMessageCount': return `getMessageCount → $${str(e['outputVar'])}`;
    case 'v2GetLastUserMessage': return `getLastUserMessage → $${str(e['outputVar'])}`;
    case 'v2GetLastCharMessage': return `getLastCharMessage → $${str(e['outputVar'])}`;
    case 'v2GetFirstMessage': return `getFirstMessage → $${str(e['outputVar'])}`;
    case 'v2CutChat':
      return `cutChat ${fmtRef(str(e['start']), valTy(e['startType']))}..${fmtRef(str(e['end']), valTy(e['endType']))}`;
    case 'v2ModifyChat':
      return `modifyChat[${fmtRef(str(e['index']), valTy(e['indexType']))}] = ${fmtRef(str(e['value']), valTy(e['valueType']))}`;
    case 'v2Command':
      return `command ${fmtRef(str(e['value']), valTy(e['valueType']))}`;
    case 'v2UpdateGUI': return 'updateGUI()';
    case 'v2UpdateChatAt':
      return `updateChatAt(${str(e['index'])})`;
    case 'v2SendAIprompt': return 'sendAIprompt = true';
    case 'v2StopPromptSending': return 'stopSending = true';
    case 'v2GetAlertInput':
      return `alertInput ${fmtRef(str(e['display']), valTy(e['displayType']))} → $${str(e['outputVar'])}`;
    case 'v2GetAlertSelect':
      return `alertSelect ${fmtRef(str(e['display']), valTy(e['displayType']))} options=${fmtRef(str(e['value']), valTy(e['valueType']))} → $${str(e['outputVar'])}`;
    case 'v2CheckSimilarity':
      return `checkSimilarity ${fmtRef(str(e['value']), valTy(e['valueType']))} vs ${fmtRef(str(e['source']), valTy(e['sourceType']))} → $${str(e['outputVar'])}`;
    case 'v2ImgGen':
      return `imgGen ${fmtRef(str(e['value']), valTy(e['valueType']))} → $${str(e['outputVar'])}`;
    case 'triggerlua': {
      const code = str(e['code']);
      return `(lua, ${code.length} chars)`;
    }
    case 'triggercode':
      return '(triggercode, dropped — Risu parity)';
    case 'setvar':
      return `setvar $${str(e['var'])} = ${str(e['value'])}`;
    case 'showAlert':
      return `alert ${str(e['value'])}`;
    case 'imggen':
      return 'imggen';
    default:
      return genericFallback(type, e);
  }
}

function genericFallback(type: string, e: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(e)) {
    if (k === 'type' || k === 'indent') continue;
    if (typeof v === 'string') {
      parts.push(`${k}=${JSON.stringify(v.length > 40 ? v.slice(0, 40) + '…' : v)}`);
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      parts.push(`${k}=${String(v)}`);
    }
    if (parts.length >= 4) {
      parts.push('…');
      break;
    }
  }
  return parts.length > 0 ? `${type}(${parts.join(', ')})` : type;
}

function str(x: unknown): string {
  return typeof x === 'string' ? x : x == null ? '' : String(x);
}

function valTy(x: unknown): 'var' | 'value' | undefined {
  return x === 'var' || x === 'value' ? x : undefined;
}

function fmtRef(value: string, type: 'var' | 'value' | undefined): string {
  if (type === 'var') return `$${value}`;
  return JSON.stringify(value);
}
