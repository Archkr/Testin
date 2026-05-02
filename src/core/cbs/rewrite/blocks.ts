import type { CbsNode, CbsTemplate, BlockNode, BlockKind } from "../ast.js";
import { encodeOpaqueBody } from "./encode.js";


export const BLOCK_PREFIX = "risu_";

/** Kinds whose body is handed to the handler as an evaluated string (scoped). */
const STRUCTURAL_KINDS: ReadonlySet<BlockKind> = new Set<BlockKind>([
  "if", "when", "unknown",
]);

/** Kinds whose body must be preserved inert and encoded into an argument. */
const OPAQUE_KINDS: ReadonlySet<BlockKind> = new Set<BlockKind>([
  "each", "func", "pure", "pure_display", "ignore", "escape", "code",
]);

export interface BlockRewriteReport {
  readonly structural: number;
  readonly opaque: number;
  readonly legacy: number;
  /** Block kinds that passed through without a recognized handler. */
  readonly untouched: ReadonlyMap<BlockKind, number>;
}

export interface BlockRewriteResult {
  readonly template: CbsTemplate;
  readonly report: BlockRewriteReport;
}

export function rewriteBlocks(template: CbsTemplate): BlockRewriteResult {
  let structural = 0;
  let opaque = 0;
  let legacy = 0;
  const untouched = new Map<BlockKind, number>();

  const walk = (nodes: readonly CbsNode[]): CbsNode[] => nodes.map((n) => walkNode(n));

  const walkNode = (n: CbsNode): CbsNode => {
    switch (n.type) {
      case "text":
      case "macro":
        return n;
      case "legacy": {
        legacy++;
        // Legacy `{#…#}` is a single expression  - flatten to a leaf call.
        const name = `${BLOCK_PREFIX}legacy`;
        const enc = encodeOpaqueBody(n.raw);
        return makeLeaf(name, [enc], `${name}::${enc}`);
      }
      case "block":
        return rewriteBlock(n);
    }
  };

  const rewriteBlock = (b: BlockNode): CbsNode => {
    if (STRUCTURAL_KINDS.has(b.kind)) {
      structural++;
      return rewriteStructural(b);
    }
    if (OPAQUE_KINDS.has(b.kind)) {
      opaque++;
      return rewriteOpaque(b);
    }
    untouched.set(b.kind, (untouched.get(b.kind) ?? 0) + 1);
    return b;
  };

  const rewriteStructural = (b: BlockNode): BlockNode => {
    const targetKind: BlockKind = b.kind === "unknown" ? "unknown" : b.kind;
    const name = `${BLOCK_PREFIX}${b.kind === "unknown" ? extractUnknownName(b.headerRaw) : b.kind}`;
    const headerArgs = extractHeaderArgs(b.kind, b.headerRaw);
    const newHeader = headerArgs.length > 0 ? `${name}::${headerArgs}` : name;
    const newClose = `/${name}`;

    const children = b.children ? walk(b.children) : [];
    const elseChildren = b.elseChildren ? walk(b.elseChildren) : undefined;

    let combined: CbsNode[];
    if (elseChildren !== undefined) {
      combined = [
        ...children,
        { type: "macro", name: "else", args: [], raw: "else" },
        ...elseChildren,
      ];
    } else {
      combined = children;
    }

    return {
      type: "block",
      kind: targetKind,
      headerRaw: newHeader,
      closeRaw: newClose,
      children: combined,
    };
  };

  const rewriteOpaque = (b: BlockNode): CbsNode => {
    const name = `${BLOCK_PREFIX}${b.kind}`;
    const headerArgs = extractHeaderArgs(b.kind, b.headerRaw);
    const body = encodeOpaqueBody(b.bodyRaw ?? "");

    const parts: string[] = [name];
    if (headerArgs.length > 0) parts.push(headerArgs);
    parts.push(body);
    const raw = parts.join("::");

    const args: string[] = [];
    if (headerArgs.length > 0) args.push(headerArgs);
    args.push(body);

    return makeLeaf(name, args, raw);
  };

  const outTemplate: CbsTemplate = { nodes: walk(template.nodes) };
  return { template: outTemplate, report: { structural, opaque, legacy, untouched } };
}


function makeLeaf(name: string, args: readonly string[], raw: string): CbsNode {
  return { type: "macro", name, args, raw };
}

function extractHeaderArgs(kind: BlockKind, headerRaw: string): string {
  return dropFirstToken(headerRaw);
}

function dropFirstToken(s: string): string {
  const wsIdx = firstIndexOfAny(s, [0x20, 0x09, 0x0a, 0x0d]);
  const dblColIdx = s.indexOf("::");
  let sepStart: number;
  let sepLen: number;
  if (wsIdx >= 0 && (dblColIdx < 0 || wsIdx < dblColIdx)) {
    sepStart = wsIdx;
    // Consume all consecutive whitespace.
    let end = wsIdx;
    while (end < s.length) {
      const c = s.charCodeAt(end);
      if (c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0d) break;
      end++;
    }
    sepLen = end - wsIdx;
  } else if (dblColIdx >= 0) {
    sepStart = dblColIdx;
    sepLen = 2;
  } else {
    return "";
  }
  return s.slice(sepStart + sepLen);
}

function firstIndexOfAny(s: string, codes: readonly number[]): number {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    for (const x of codes) if (c === x) return i;
  }
  return -1;
}

/** Pull the first whitespace-delimited token — the "name" of an unknown block. */
function extractUnknownName(headerRaw: string): string {
  let i = 0;
  while (i < headerRaw.length) {
    const c = headerRaw.charCodeAt(i);
    if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d) break;
    i++;
  }
  const first = headerRaw.slice(0, i) || "unknown";
  return first.toLowerCase().replaceAll("-", "").replaceAll("_", "");
}
