import { z } from "zod";
import { TranslationError } from "../errors.js";
import {
  risuModuleSchema,
  type RisuModule,
} from "./module.js";
import { loreBookSchema } from "./lorebook.js";
import { customscriptSchema } from "./customscript.js";
import { triggerscriptSchema } from "./triggerscript.js";

export interface ParseIssue {
  readonly path: readonly string[];
  readonly message: string;
  readonly raw?: unknown;
}

export interface ParsedModule {
  readonly module: RisuModule;
  readonly issues: readonly ParseIssue[];
}

function firstMessage(err: z.ZodError): string {
  return err.issues[0]?.message ?? "unknown zod error";
}

function parseEach<S extends z.ZodTypeAny>(
  items: readonly unknown[] | undefined,
  schema: S,
  label: string,
  issues: ParseIssue[],
): z.infer<S>[] {
  if (!items) return [];
  const out: z.infer<S>[] = [];
  items.forEach((item, i) => {
    const res = schema.safeParse(item);
    if (res.success) {
      out.push(res.data);
    } else {
      issues.push({
        path: [label, `[${i}]`],
        message: firstMessage(res.error),
        raw: item,
      });
    }
  });
  return out;
}

export function parseRisuModule(raw: unknown): ParsedModule {
  const topLevel = risuModuleSchema.safeParse(raw);
  if (topLevel.success) {
    const issues: ParseIssue[] = [];
    const mod = topLevel.data;
    const cleanLorebook = parseEach(mod.lorebook, loreBookSchema, "lorebook", issues);
    const cleanRegex = parseEach(mod.regex, customscriptSchema, "regex", issues);
    const cleanTriggers = parseEach(mod.trigger, triggerscriptSchema, "trigger", issues);

    const cleaned = {
      ...mod,
      ...(mod.lorebook !== undefined ? { lorebook: cleanLorebook } : {}),
      ...(mod.regex !== undefined ? { regex: cleanRegex } : {}),
      ...(mod.trigger !== undefined ? { trigger: cleanTriggers } : {}),
    } as RisuModule;
    return { module: cleaned, issues };
  }

  const issues: ParseIssue[] = [];
  const shaped = raw as Record<string, unknown> | null;
  if (!shaped || typeof shaped !== "object" || Array.isArray(shaped)) {
    throw new TranslationError(
      "schema/not_module",
      `module payload is not an object: ${JSON.stringify(raw).slice(0, 120)}`,
    );
  }

  const name = shaped["name"];
  const description = shaped["description"];
  const id = shaped["id"];
  if (typeof name !== "string" || typeof description !== "string" || typeof id !== "string") {
    throw new TranslationError(
      "schema/missing_required",
      `module is missing required string fields name/description/id`,
    );
  }

  const cleanLorebook = parseEach(
    Array.isArray(shaped["lorebook"]) ? shaped["lorebook"] : undefined,
    loreBookSchema,
    "lorebook",
    issues,
  );
  const cleanRegex = parseEach(
    Array.isArray(shaped["regex"]) ? shaped["regex"] : undefined,
    customscriptSchema,
    "regex",
    issues,
  );
  const cleanTriggers = parseEach(
    Array.isArray(shaped["trigger"]) ? shaped["trigger"] : undefined,
    triggerscriptSchema,
    "trigger",
    issues,
  );

  const scalarOnly: Record<string, unknown> = { ...shaped };
  delete scalarOnly["lorebook"];
  delete scalarOnly["regex"];
  delete scalarOnly["trigger"];
  const scalar = risuModuleSchema.omit({ lorebook: true, regex: true, trigger: true }).safeParse(scalarOnly);
  if (!scalar.success) {
    throw new TranslationError(
      "schema/top_level",
      `module top-level scalars failed validation: ${firstMessage(scalar.error)}`,
    );
  }
  const cleaned = {
    ...scalar.data,
    ...(shaped["lorebook"] !== undefined ? { lorebook: cleanLorebook } : {}),
    ...(shaped["regex"] !== undefined ? { regex: cleanRegex } : {}),
    ...(shaped["trigger"] !== undefined ? { trigger: cleanTriggers } : {}),
  } as RisuModule;
  return { module: cleaned, issues };
}
