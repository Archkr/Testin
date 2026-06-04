import { makeSafeLogger } from '../util/safe-log.js';

const log = makeSafeLogger('open-timeline');

interface OpenState {
  seq: number;
  t0: number;
  seen: Set<string>;
}

const opens = new Map<string, OpenState>();
let seqCounter = 0;

export function markOpen(chatId: string): void {
  seqCounter += 1;
  opens.set(chatId, { seq: seqCounter, t0: Date.now(), seen: new Set() });
  log.info(`open chat=${chatId} openSeq=${seqCounter} t0`);
}

export function markEvent(chatId: string, label: string): void {
  const st = opens.get(chatId);
  if (!st) return;
  if (st.seen.has(label)) return;
  st.seen.add(label);
  log.info(`open chat=${chatId} openSeq=${st.seq} +${Date.now() - st.t0}ms ${label}`);
}
