// Role-name bridge between Risu's `chat.message[]` shape and Lumi's storage shape.
//
// Risu chat.message[i].role is `'user' | 'char'` natively (`scriptings.ts:182,201,208` —
// `setChatRole`/`addChat`/`insertChat` all coerce non-user input to `'char'`). Risu
// also accepts `'bot'` as a `'char'` alias on outbound LLM payloads (mirrored by
// `spindle-host.ts:354-358`). `'sys'` is a Risu prompt-payload alias for system
// messages but is NOT a `chat.message[]` role — Risu's `addChat` would coerce it
// to `'char'` too.
//
// Lumi stores `'user' | 'assistant' | 'system'`.
//
// Cards routinely branch on `msg.role == "char"` to gate aux-LLM dispatch,
// status-block detection, or context-stripping passes. Without this bridge,
// gates that compare `=="char"` always fail because we surface `'assistant'`.
// Matching Risu's `setChatRole` behaviour exactly: anything not `'user'` → char/assistant.

export function risuRoleToLumi(r: string): "user" | "assistant" {
  return r === "user" ? "user" : "assistant";
}

export function lumiRoleToRisu(r: string): "user" | "char" {
  return r === "user" ? "user" : "char";
}
