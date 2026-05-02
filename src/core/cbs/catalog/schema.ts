import { z } from "zod";


export const stateReadKindSchema = z.enum([
  "none",
  "localVars",
  "globalVars",
  "chatState",
  "characterFields",
  "time",
  "rng",
  "messages",
]);
export type StateReadKind = z.infer<typeof stateReadKindSchema>;

// `none` is shorthand for an empty array.
export const stateWriteKindSchema = z.enum([
  "none",
  "localVars",
  "globalVars",
  "chatState",
  "messages",
]);
export type StateWriteKind = z.infer<typeof stateWriteKindSchema>;

export const macroCategorySchema = z.enum([
  "identity",
  "character_fields",
  "chat_context",
  "time",
  "variables",
  "math",
  "logic",
  "arrays",
  "strings",
  "random",
  "tokenize",
  "display",
  "escape_markup",
  "control_flow",
  "metadata",
  "flow_control",
  "other",
]);
export type MacroCategory = z.infer<typeof macroCategorySchema>;

export const lumiverseCollisionSchema = z.object({
  name: z.string(),
  compatible: z.boolean(),
  notes: z.string(),
});
export type LumiverseCollision = z.infer<typeof lumiverseCollisionSchema>;

export const macroCatalogEntrySchema = z.object({
  name: z.string().min(1),
  aliases: z.array(z.string()),
  category: macroCategorySchema,
  /** "UNCERTAIN" marks a skeleton entry not yet audited against the handler. */
  argShape: z.string().min(1),
  minArgs: z.number().int().min(0),
  /** -1 = variadic. */
  maxArgs: z.number().int().min(-1),
  pure: z.boolean(),
  readsState: z.array(stateReadKindSchema),
  writesState: z.array(stateWriteKindSchema),
  lumiverseCollision: lumiverseCollisionSchema.nullable(),
  risuFile: z.string(),
  risuLine: z.number().int().min(1),
  summary: z.string(),
  notes: z.string(),
});
export type MacroCatalogEntry = z.infer<typeof macroCatalogEntrySchema>;

export const macroCatalogSchema = z.array(macroCatalogEntrySchema);
export type MacroCatalog = z.infer<typeof macroCatalogSchema>;

export function isComplete(entry: MacroCatalogEntry): boolean {
  if (entry.argShape === "UNCERTAIN") return false;
  if (entry.summary.trim().length === 0) return false;
  if (!entry.pure && entry.readsState.length === 0 && entry.writesState.length === 0) return false;
  return true;
}
