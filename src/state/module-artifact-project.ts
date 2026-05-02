// Pure shape-conversion: Risu module body → Lumi world_book / regex_script wire shapes.
// Lifted from backend.ts for unit-testability. Synchronous + side-effect-free.

import type {
  ModuleLorebookEntry,
  PendingRegexScriptMsg,
} from '../types/messages.js';

export function projectModuleLorebookEntries(
  moduleId: string,
  raw: readonly unknown[] | undefined,
): readonly ModuleLorebookEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: ModuleLorebookEntry[] = [];
  for (const e of raw) {
    if (!e || typeof e !== 'object') continue;
    const eo = e as Record<string, unknown>;
    const content = typeof eo['content'] === 'string' ? eo['content'] : '';
    const keyRaw = eo['key'];
    const key = Array.isArray(keyRaw)
      ? keyRaw.filter((x): x is string => typeof x === 'string')
      : typeof keyRaw === 'string'
        ? [keyRaw]
        : [];
    if (key.length === 0 && content.length === 0) continue;
    const entry: ModuleLorebookEntry = {
      key,
      content,
      ...(typeof eo['comment'] === 'string' ? { comment: eo['comment'] } : {}),
      ...(typeof eo['constant'] === 'boolean' ? { constant: eo['constant'] } : {}),
      ...(typeof eo['disabled'] === 'boolean' ? { disabled: eo['disabled'] } : {}),
      ...(typeof eo['position'] === 'string' ? { position: eo['position'] } : {}),
      ...(typeof eo['priority'] === 'number' ? { priority: eo['priority'] } : {}),
      ...(typeof eo['order'] === 'number' ? { order: eo['order'] } : {}),
      ...(Array.isArray(eo['secondary_keys'])
        ? {
            secondary_keys: eo['secondary_keys'].filter(
              (x): x is string => typeof x === 'string',
            ),
          }
        : {}),
      ...(typeof eo['selective'] === 'boolean' ? { selective: eo['selective'] } : {}),
      metadata: { _risu: { module_id: moduleId } },
    };
    out.push(entry);
  }
  return out;
}

export function projectModuleRegexEntries(
  moduleId: string,
  moduleName: string,
  characterId: string,
  raw: readonly unknown[] | undefined,
  idGen: () => string,
): readonly PendingRegexScriptMsg[] {
  if (!Array.isArray(raw)) return [];
  const out: PendingRegexScriptMsg[] = [];
  let sortBase = 0;
  for (const e of raw) {
    if (!e || typeof e !== 'object') continue;
    const eo = e as Record<string, unknown>;
    const findRegex = typeof eo['in'] === 'string' ? eo['in'] : '';
    const replaceString = typeof eo['out'] === 'string' ? eo['out'] : '';
    if (findRegex.length === 0) continue;
    const ruleType = typeof eo['type'] === 'string' ? eo['type'] : 'editdisplay';
    const { placement, target, disabled } = riskCustomScriptTypeToLumi(ruleType);
    let flags = typeof eo['flag'] === 'string' ? eo['flag'] : '';
    flags = flags.replace(/[^dgimsuvy]/g, '');
    flags = [...new Set(flags.split(''))].join('');
    if (flags.length === 0) flags = 'g';
    const findHasCbs = findRegex.indexOf('{{') >= 0;
    if (findHasCbs) flags = flags.replace(/u/g, '');
    const ruleNameRaw =
      typeof eo['name'] === 'string' && eo['name'].length > 0
        ? eo['name']
        : `rule_${sortBase + 1}`;
    out.push({
      name: `[${moduleName}] ${ruleNameRaw}`,
      script_id: idGen(),
      find_regex: findRegex,
      replace_string: replaceString,
      flags,
      placement,
      scope: 'character',
      scope_id: characterId,
      target,
      min_depth: null,
      max_depth: target === 'prompt' && ruleType === 'editinput' ? 0 : null,
      trim_strings: [],
      run_on_edit: false,
      substitute_macros: replaceString.indexOf('{{') >= 0 ? 'raw' : 'none',
      disabled,
      sort_order: 1000 + sortBase,
      description: `From .risum module: ${moduleName}`,
      folder: `Module: ${moduleName}`,
      metadata: {
        _risu: {
          module_id: moduleId,
          source_type: ruleType,
        },
      },
    });
    sortBase += 1;
  }
  return out;
}

export function riskCustomScriptTypeToLumi(t: string): {
  placement: readonly string[];
  target: 'prompt' | 'response' | 'display';
  disabled: boolean;
} {
  switch (t) {
    case 'editinput':
      return { placement: ['user_input'], target: 'prompt', disabled: false };
    case 'editprocess':
      return {
        placement: ['user_input', 'ai_output', 'world_info'],
        target: 'prompt',
        disabled: false,
      };
    case 'editoutput':
      return { placement: ['ai_output'], target: 'response', disabled: false };
    case 'edittrans':
      return { placement: ['ai_output'], target: 'response', disabled: false };
    case 'disabled':
      return { placement: ['ai_output'], target: 'display', disabled: true };
    case 'editdisplay':
    default:
      return { placement: ['ai_output'], target: 'display', disabled: false };
  }
}
