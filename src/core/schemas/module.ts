import { z } from "zod";
import { customscriptSchema } from "./customscript.js";
import { loreBookSchema } from "./lorebook.js";
import { triggerscriptSchema } from "./triggerscript.js";

// Risu modules.ts MCPModule is `{ url: string }` but our extension does not
// execute MCP at all. Accept any shape so a malformed mcp block doesn't fail
// the whole module; the translator surfaces a manifest issue when present.
export const mcpModuleSchema = z.object({}).passthrough();
export type MCPModule = z.infer<typeof mcpModuleSchema>;

// Risu modules.ts: asset triple [name, url, hash]; url blanked before serialize.
// Risu reads asset[0]/[1]/[2] directly without length checks, so missing trailing
// elements are tolerated as undefined. Mirror by accepting any array of strings,
// padding to 3 entries.
export const moduleAssetSchema = z.preprocess(
  (v) => {
    if (!Array.isArray(v)) return v;
    const norm = (x: unknown) => x == null ? "" : String(x);
    return [norm(v[0]), norm(v[1]), norm(v[2])] as [string, string, string];
  },
  z.tuple([z.string(), z.string(), z.string()]),
);
export type ModuleAsset = z.infer<typeof moduleAssetSchema>;

const nullish = <T>(s: z.ZodType<T>) => s.nullish().transform((v) => v ?? undefined);

export const risuModuleSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    id: z.string(),
    lorebook: nullish(z.array(loreBookSchema)),
    regex: nullish(z.array(customscriptSchema)),
    cjs: nullish(z.string()),
    trigger: nullish(z.array(triggerscriptSchema)),
    lowLevelAccess: z
      .unknown()
      .nullish()
      .transform((v) => (v === undefined || v === null ? undefined : Boolean(v))),
    hideIcon: nullish(z.boolean()),
    backgroundEmbedding: nullish(z.string()),
    assets: nullish(z.array(moduleAssetSchema)),
    namespace: nullish(z.string()),
    customModuleToggle: nullish(z.string()),
    mcp: nullish(mcpModuleSchema),
  })
  .passthrough();

export type RisuModule = z.infer<typeof risuModuleSchema>;
