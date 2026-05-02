import type { MacroHandler } from "../../core/cbs/index.js";
import { registry } from "../registry.js";

// Context-read macros. Many are renamed to `risu_...` due to Lumi collisions.

function register(name: string, handler: MacroHandler, description: string): void {
  registry.register({
    name,
    handler,
    description,
    category: "Risu / Context",
    scoped: false,
  });
}


// cbs.ts. Risu pipes through risuChatParser; Lumiverse resolves at prompt-assembly time.
register("exampledialogue", (ctx) => ctx.character.exampleDialogue,
  "Returns the character's example dialogue field.");

// cbs.ts.
register("mainprompt", (ctx) => ctx.character.mainPrompt,
  "Returns the system/main prompt configured for the current character.");

// cbs.ts.
register("jb", (ctx) => ctx.character.jailbreakPrompt,
  "Returns the jailbreak prompt text.");

// cbs.ts.
register("globalnote", (ctx) => ctx.character.globalNote,
  "Returns the global note (system note / ujb) appended to prompts.");

// cbs.ts.
register("authornote", (ctx) => ctx.character.authorsNote,
  "Returns the author's note for the current chat.");


// cbs.ts.
register("risu_model", (ctx) => ctx.aiModel,
  "Returns the id of the currently selected AI model.");

// cbs.ts.
register("axmodel", (ctx) => ctx.axModel,
  "Returns the id of the auxiliary/secondary model.");

// cbs.ts. Returns literal "null" when unknown.
register("role", (ctx) => {
  if (ctx.isFirstMessage) return "char";
  if (ctx.role !== null) return ctx.role;
  return "null";
}, "Returns the role of the current message ('user', 'char'/'assistant', 'system').");

// cbs.ts.
register("isfirstmsg", (ctx) => ctx.isFirstMessage ? "1" : "0",
  "Returns '1' if the current context is the first (greeting) message, '0' otherwise.");


// cbs.ts.
register("unixtime", (ctx) => Math.floor(ctx.clock.now() / 1000).toString(),
  "Returns the current unix timestamp in seconds.");

// cbs.ts. Local time, unpadded.
register("risu_time", (ctx) => {
  const d = new Date(ctx.clock.now());
  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}, "Returns the current local time in H:M:S format (unpadded, matching Risu).");

// cbs.ts.
register("isotime", (ctx) => {
  const d = new Date(ctx.clock.now());
  return `${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}`;
}, "Returns the current UTC time in H:M:S format.");

// cbs.ts.
register("isodate", (ctx) => {
  const d = new Date(ctx.clock.now());
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}, "Returns the current UTC date in YYYY-M-D format (month/day not zero-padded, matching Risu).");

// cbs.ts.
register("messagetime", (ctx) => {
  if (ctx.currentMessageIndex === null) return "[Cannot get time]";
  const msgs = ctx.messages.all();
  const msg = msgs[ctx.currentMessageIndex];
  if (!msg) return "[Cannot get time]";
  if (!msg.createdAt) return "[Cannot get time, message was sent in older version]";
  return new Date(msg.createdAt).toLocaleTimeString();
}, "Returns the local time the current message was sent.");

// cbs.ts.
register("messagedate", (ctx) => {
  if (ctx.currentMessageIndex === null) return "[Cannot get time]";
  const msgs = ctx.messages.all();
  const msg = msgs[ctx.currentMessageIndex];
  if (!msg) return "[Cannot get time]";
  if (!msg.createdAt) return "[Cannot get time, message was sent in older version]";
  return new Date(msg.createdAt).toLocaleDateString();
}, "Returns the local date the current message was sent.");

// cbs.ts.
register("messageunixtimearray", (ctx) => {
  const arr = ctx.messages.all().map((m) => String(m.createdAt ?? 0));
  return makeArray(arr);
}, "Returns a JSON-encoded array of all message unix timestamps (milliseconds).");

// cbs.ts.
register("idleduration", (ctx) => {
  const msgs = ctx.messages.all();
  if (msgs.length === 0) return "00:00:00";
  const last = msgs[msgs.length - 1]!;
  if (!last.createdAt) return "[Cannot get time, message was sent in older version]";
  return formatDuration(ctx.clock.now() - last.createdAt);
}, "Returns HH:MM:SS since the most recent message.");

// cbs.ts.
register("messageidleduration", (ctx) => {
  if (ctx.currentMessageIndex === null) return "[Cannot get time]";
  const msgs = ctx.messages.all();
  let pointer = ctx.currentMessageIndex;
  let message: (typeof msgs)[number] | undefined;
  let previous: (typeof msgs)[number] | undefined;
  let stage: "findLast" | "findSecondLast" = "findLast";
  while (pointer >= 0) {
    const m = msgs[pointer];
    if (m && m.role === "user") {
      if (stage === "findLast") { message = m; stage = "findSecondLast"; }
      else { previous = m; break; }
    }
    pointer--;
  }
  if (!message) return "[No user message found]";
  if (!previous) return "[No previous user message found]";
  if (!message.createdAt) return "[Cannot get time, message was sent in older version]";
  if (!previous.createdAt) return "[Cannot get time, previous message was sent in older version]";
  return formatDuration(message.createdAt - previous.createdAt);
}, "Returns HH:MM:SS between the current and the previous user message.");


// cbs.ts. No Lumi collision; rewriter leaves `{{br}}` alone.
register("br", () => "\n",
  "Returns a literal newline character.");

// cbs.ts.
register("blank", () => "",
  "Returns an empty string.");


function formatDuration(ms: number): string {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = minutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// parser.svelte.ts.
function makeArray(arr: readonly unknown[]): string {
  return JSON.stringify(arr.map((v) => {
    if (typeof v === "string") return v.replaceAll("::", "\\u003A\\u003A");
    return v;
  }));
}
