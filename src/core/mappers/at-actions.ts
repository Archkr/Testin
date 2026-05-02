import type { AtAtAction } from "./regex.js";
import type { ScriptPackEntry, ScriptBindingEntry } from "../pipeline/types.js";


const PHASE_EVENT_MAP: Readonly<Record<string, readonly string[]>> = {
  editinput: ["MESSAGE_SENT"],
  editprocess: ["GENERATION_STARTED"],
  editoutput: ["GENERATION_ENDED"],
  editdisplay: ["CHARACTER_MESSAGE_RENDERED"],
  edittrans: ["GENERATION_ENDED"],
  disabled: [],
};

export interface CompileAtActionsOptions {
  readonly characterId: string;
  readonly characterName?: string;
  readonly runtimeLibrary?: string;
}

export interface CompileAtActionsResult {
  readonly files: readonly ScriptPackEntry[];
  readonly issues: readonly { path: string; message: string }[];
}

export function compileAtActions(
  actions: readonly AtAtAction[],
  opts: CompileAtActionsOptions,
): CompileAtActionsResult {
  const files: ScriptPackEntry[] = [];
  const issues: { path: string; message: string }[] = [];
  const seenSlugs = new Set<string>();
  const runtimeLib = opts.runtimeLibrary ?? "risu-compat";

  for (const a of actions) {
    const events = PHASE_EVENT_MAP[a.phase] ?? ["MESSAGE_SENT"];
    const slug = uniqueSlug(a.script.comment || a.action, a.index, seenSlugs);
    const scriptName = `risu-at-${a.action}-${slug}`;
    try {
      const code = renderAtActionCode({
        slug,
        name: nonEmpty(a.script.comment, scriptName),
        characterId: opts.characterId,
        events,
        action: a,
        runtimeLib,
      });
      const bindings: readonly ScriptBindingEntry[] = [
        {
          type: "character",
          characterId: opts.characterId,
          displayName: opts.characterName ?? opts.characterId,
        },
      ];
      const entry: ScriptPackEntry = {
        name: scriptName,
        code,
        type: "trigger",
        folder: `risu/at-actions`,
        path: `scripts/at-actions/${scriptName}.js`,
        bindings,
        ...(events.length > 0 ? { triggers: events } : {}),
      };
      files.push(entry);
    } catch (e) {
      issues.push({
        path: `at-action[${a.index}]`,
        message: `emit failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }

  return { files, issues };
}

interface RenderArgs {
  readonly slug: string;
  readonly name: string;
  readonly characterId: string;
  readonly events: readonly string[];
  readonly action: AtAtAction;
  readonly runtimeLib: string;
}

function renderAtActionCode(a: RenderArgs): string {
  const s = a.action.script;
  const body = renderActionBody(a.action);

  const frontmatter = [
    `// @name       ${a.name}`,
    `// @type       trigger`,
    ...(a.events.length > 0
      ? [`// @triggers   ${a.events.join(", ")}`]
      : []),
    `// @folder     risu/at-actions`,
    `// @description LumiRealm @@${a.action.action} (character ${a.characterId}, phase ${a.action.phase})`,
  ].join("\n");

  const comment = [
    `//`,
    `// regex:     ${oneLine(s.in)}`,
    `// out:       ${oneLine(s.out)}`,
    `//`,
  ].join("\n");

  return [
    frontmatter,
    comment,
    ``,
    `const PATTERN = ${JSON.stringify(s.in)};`,
    `const FLAGS = ${JSON.stringify(a.action.flag)};`,
    `const OUT = ${JSON.stringify(s.out)};`,
    ``,
    `const __rc = await script.require(${JSON.stringify(a.runtimeLib)});`,
    `const __risu = await __rc.makeRisuRegexRuntime(api, data, script, { characterId: ${JSON.stringify(a.characterId)}, phase: ${JSON.stringify(a.action.phase)} });`,
    `const text = __risu.text();`,
    `const regex = new RegExp(PATTERN, FLAGS);`,
    `if (regex.test(text)) {`,
    body,
    `} else {`,
    a.action.action === "repeat_back"
      ? `  // Risu's repeat_back branch fires only on NO MATCH (scripts.ts).\n  const mode = OUT.split(" ", 2)[1];\n  await __risu.repeatBack(regex, mode);`
      : `  return;`,
    `}`,
    `await __risu.flush();`,
    ``,
  ].join("\n");
}

function renderActionBody(a: AtAtAction): string {
  switch (a.action) {
    case "emo": {
      return [
        `  const name = OUT.substring(6).trim();`,
        `  await __risu.setExpression(name);`,
      ].join("\n");
    }
    case "inject": {
      return [
        `  const cleaned = text.replace(regex, "");`,
        `  await __risu.setCurrentText(cleaned);`,
        `  const stripped = OUT.replace(/^@@inject\\s*/, "");`,
        `  await __risu.inject(stripped);`,
      ].join("\n");
    }
    case "move_top":
    case "move_bottom": {
      const direction = JSON.stringify(a.action === "move_top" ? "top" : "bottom");
      return [
        `  let out = OUT.replace("@@move_top ", "").replace("@@move_bottom ", "");`,
        `  const isGlobal = FLAGS.includes("g");`,
        `  const matches = isGlobal ? Array.from(text.matchAll(regex)) : (text.match(regex) ? [text.match(regex)] : []);`,
        `  let cleaned = text.replace(regex, "");`,
        `  for (const m of matches) {`,
        `    if (!m) continue;`,
        `    const mapped = __risu.applyMatchTemplate(out, m);`,
        `    cleaned = ${direction} === "top" ? (mapped + "\\n" + cleaned) : (cleaned + "\\n" + mapped);`,
        `  }`,
        `  await __risu.setCurrentText(cleaned);`,
      ].join("\n");
    }
    case "repeat_back": {
      // repeat fires only on no-match. Matched branch is empty.
      return `  return;`;
    }
    default: {
      return `  /* unknown @@action */`;
    }
  }
}

function oneLine(s: string): string {
  return s.replace(/\r?\n/g, " ").slice(0, 200);
}

function nonEmpty(s: string | undefined | null, fallback: string): string {
  if (typeof s === "string" && s.trim().length > 0) return s.trim();
  return fallback;
}

function uniqueSlug(base: string, index: number, seen: Set<string>): string {
  const slug = slugify(base) || `action_${index}`;
  let candidate = slug;
  let n = 1;
  while (seen.has(candidate)) {
    n++;
    candidate = `${slug}_${n}`;
  }
  seen.add(candidate);
  return candidate;
}

function slugify(s: string): string {
  const out: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (
      (c >= 0x30 && c <= 0x39) ||
      (c >= 0x41 && c <= 0x5a) ||
      (c >= 0x61 && c <= 0x7a) ||
      c === 0x5f ||
      c === 0x2d
    ) {
      out.push(s[i]!);
    } else if (c === 0x20 || c === 0x09) {
      out.push("_");
    }
  }
  return out.join("").slice(0, 64);
}
