// Adapts Lumi's getMessages() to the chat shape Risu cards expect at trigger time.

import type { HostMessage } from './host.js';

export interface RisuChatView {
  readonly messages: HostMessage[];
  readonly adjustments: readonly string[];
}

export interface BuildRisuChatViewInput {
  readonly messages: readonly HostMessage[];
}

export function buildRisuChatView(input: BuildRisuChatViewInput): RisuChatView {
  const messages: HostMessage[] = input.messages.map((m) => ({ ...m }));
  const adjustments: string[] = [];

  // Lumi commit 2b1ae51 stages an empty assistant before GENERATION_STARTED.
  // Strip trailing empty assistants so chatLen-1 targets the user message, not the placeholder.
  let stripped = 0;
  while (messages.length > 0) {
    const last = messages[messages.length - 1]!;
    if (last.role === 'assistant' && (!last.content || last.content === '')) {
      messages.pop();
      stripped++;
    } else {
      break;
    }
  }
  if (stripped > 0) adjustments.push(`stripped:${stripped}-trailing-empty-assistant`);

  return { messages, adjustments };
}
