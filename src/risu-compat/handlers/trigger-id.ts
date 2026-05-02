import type { MacroHandler } from "../../core/cbs/index.js";
import { registry } from "../registry.js";

export const triggerIdHandler: MacroHandler = (ctx) => {
  return ctx.triggerId ?? "null";
};

registry.register({
  name: "trigger_id",
  handler: triggerIdHandler,
  description: "Returns the ID from the risu-id attribute of the last clicked trigger element, or the literal string \"null\".",
  category: "Risu / Identity",
  scoped: false,
});
