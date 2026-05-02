import type { CbsNode, CbsTemplate, MacroNode, BlockNode } from "../ast.js";
import type { CatalogIndex } from "../catalog/loader.js";

export const RENAME_PREFIX = "risu_";

export interface RenameOptions {
  readonly catalog: CatalogIndex;
  readonly prefix?: string;
}

export interface RenameReport {
  readonly renamed: ReadonlyMap<string, number>;
  readonly unknownMacros: ReadonlyMap<string, number>;
}

export function renameCollisions(
  template: CbsTemplate,
  opts: RenameOptions,
): { template: CbsTemplate; report: RenameReport } {
  const prefix = opts.prefix ?? RENAME_PREFIX;
  const renamed = new Map<string, number>();
  const unknownMacros = new Map<string, number>();

  const rewriteNodes = (nodes: readonly CbsNode[]): CbsNode[] =>
    nodes.map((n) => rewriteNode(n));

  const rewriteNode = (n: CbsNode): CbsNode => {
    switch (n.type) {
      case "text":
      case "legacy":
        return n;
      case "macro":
        return rewriteMacro(n);
      case "block":
        return rewriteBlock(n);
    }
  };

  const rewriteMacro = (n: MacroNode): MacroNode => {
    // Normalize {{? expr}} → calc::expr before rename so Lumi routes it correctly.
    let cur: MacroNode = n;
    if (n.name === "calc" && n.raw.startsWith("? ")) {
      const expr = n.raw.slice(2);
      cur = {
        type: "macro",
        name: "calc",
        args: [expr],
        raw: `calc::${expr}`,
      };
    }
    const entry = opts.catalog.find(cur.name);
    if (entry === null) {
      unknownMacros.set(cur.name, (unknownMacros.get(cur.name) ?? 0) + 1);
      return cur;
    }
    if (!opts.catalog.needsRename(cur.name)) return cur;
    const newName = `${prefix}${cur.name}`;
    renamed.set(cur.name, (renamed.get(cur.name) ?? 0) + 1);
    return {
      type: "macro",
      name: newName,
      args: cur.args,
      raw: rewriteMacroRaw(cur.raw, newName),
    };
  };

  const rewriteBlock = (n: BlockNode): BlockNode => {
    if (n.bodyRaw !== undefined) return n; // opaque — body is raw string, not AST
    const next: BlockNode = {
      type: "block",
      kind: n.kind,
      headerRaw: n.headerRaw,
      closeRaw: n.closeRaw,
      ...(n.children !== undefined ? { children: rewriteNodes(n.children) } : {}),
      ...(n.elseChildren !== undefined ? { elseChildren: rewriteNodes(n.elseChildren) } : {}),
    };
    return next;
  };

  const out: CbsTemplate = { nodes: rewriteNodes(template.nodes) };
  return { template: out, report: { renamed, unknownMacros } };
}

function rewriteMacroRaw(raw: string, newName: string): string {
  const dblIdx = raw.indexOf("::");
  if (dblIdx >= 0) return `${newName}${raw.slice(dblIdx)}`;
  const colIdx = raw.indexOf(":");
  if (colIdx >= 0) return `${newName}${raw.slice(colIdx)}`;
  return newName;
}
