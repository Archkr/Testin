

const SVG_BLOCK_RE = /<svg[\s>][\s\S]*?<\/svg\s*>/gi;
const TEMPLATED_RE = /\$\d|\{\{/;
const ANIMATED_RE = /<animate(?:Transform|Motion|)\b|<set\b|animation\s*:/i;
const THEME_REACTIVE_RE = /\bcurrentColor\b|var\s*\(\s*--/i;

const DANGEROUS_RE = /<image\s[^>]*\bhref\b|<use\s[^>]*\bhref\b|@import\s+url|<foreignObject\b|<script\b|on[a-z]+\s*=/i;


export type SvgClassification = "simple" | "theme-reactive" | "animated" | "templated";

export interface SvgRasterTask {
  readonly markerN: number;
  readonly svg: string;
  readonly classification: SvgClassification;
  // FNV-1a 32-bit content hash; backend deduplicates by this.
  readonly contentHash: string;
  readonly width: number;
  readonly height: number;
}

export interface ExtractResult {
  readonly rewritten: string;
  readonly templatedSkipped: number;
  readonly dangerousSkipped: number;
}


export class SvgIndexer {
  private readonly tasks: SvgRasterTask[] = [];
  private readonly byHash = new Map<string, number>();
  private readonly byClass: Record<SvgClassification, number> = {
    simple: 0,
    "theme-reactive": 0,
    animated: 0,
    templated: 0,
  };

  add(svg: string, classification: SvgClassification): number {
    const hash = fnv1aHash(svg);
    const existing = this.byHash.get(hash);
    if (existing !== undefined) return existing;
    const markerN = this.tasks.length;
    const { width, height } = inferDimensions(svg);
    this.tasks.push({
      markerN,
      svg,
      classification,
      contentHash: hash,
      width,
      height,
    });
    this.byHash.set(hash, markerN);
    this.byClass[classification] += 1;
    return markerN;
  }

  getTasks(): readonly SvgRasterTask[] {
    return this.tasks;
  }

  getCounts(): Readonly<Record<SvgClassification, number>> {
    return this.byClass;
  }

  size(): number {
    return this.tasks.length;
  }
}


export function classifySvg(svg: string): SvgClassification {
  if (TEMPLATED_RE.test(svg)) return "templated";
  if (DANGEROUS_RE.test(svg)) return "templated"; // skip — same fate
  if (ANIMATED_RE.test(svg)) return "animated";
  if (THEME_REACTIVE_RE.test(svg)) return "theme-reactive";
  return "simple";
}


export function extractAndReplaceSvgs(
  html: string,
  indexer: SvgIndexer,
): ExtractResult {
  if (html.length === 0 || html.indexOf("<svg") < 0) {
    return { rewritten: html, templatedSkipped: 0, dangerousSkipped: 0 };
  }

  let templatedSkipped = 0;
  let dangerousSkipped = 0;

  const rewritten = html.replace(SVG_BLOCK_RE, (svg) => {
    const classification = classifySvg(svg);
    if (classification === "templated") {
      if (DANGEROUS_RE.test(svg)) dangerousSkipped += 1;
      else templatedSkipped += 1;
      return svg;
    }
    const markerN = indexer.add(svg, classification);
    const { width, height } = indexer.getTasks()[markerN]!;
    return buildPlaceholder(markerN, width, height);
  });

  return { rewritten, templatedSkipped, dangerousSkipped };
}

function buildPlaceholder(markerN: number, width: number, height: number): string {
  return `<img data-lumirealm-svg-pending="${markerN}" alt="" width="${width}" height="${height}">`;
}

export const SVG_PENDING_ATTR = "data-lumirealm-svg-pending";


const WIDTH_ATTR_RE = /\bwidth\s*=\s*["']?([\d.]+)/i;
const HEIGHT_ATTR_RE = /\bheight\s*=\s*["']?([\d.]+)/i;
const VIEWBOX_RE = /\bviewBox\s*=\s*["']?\s*([\d.-]+)\s+([\d.-]+)\s+([\d.]+)\s+([\d.]+)/i;

export function inferDimensions(svg: string): { width: number; height: number } {
  let width: number | null = null;
  let height: number | null = null;
  const openTagEnd = svg.indexOf(">");
  const openTag = openTagEnd > 0 ? svg.slice(0, openTagEnd + 1) : svg;

  const wMatch = WIDTH_ATTR_RE.exec(openTag);
  if (wMatch) {
    const v = parseFloat(wMatch[1]!);
    if (Number.isFinite(v)) width = Math.round(v);
  }
  const hMatch = HEIGHT_ATTR_RE.exec(openTag);
  if (hMatch) {
    const v = parseFloat(hMatch[1]!);
    if (Number.isFinite(v)) height = Math.round(v);
  }

  if (width === null || height === null) {
    const vbMatch = VIEWBOX_RE.exec(openTag);
    if (vbMatch) {
      if (width === null) {
        const v = parseFloat(vbMatch[3]!);
        if (Number.isFinite(v)) width = Math.round(v);
      }
      if (height === null) {
        const v = parseFloat(vbMatch[4]!);
        if (Number.isFinite(v)) height = Math.round(v);
      }
    }
  }

  if (width === null) width = 32;
  if (height === null) height = 32;
  width = Math.max(1, Math.min(1024, width));
  height = Math.max(1, Math.min(1024, height));

  return { width, height };
}


function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}


const PLACEHOLDER_RE = /<img\b[^>]*\bdata-lumirealm-svg-pending\s*=\s*["']?(\d+)["']?[^>]*>/gi;

export function substituteSvgMarkers(
  html: string,
  markerToImageId: Readonly<Record<number, string | null>>,
): string {
  if (html.length === 0 || html.indexOf(SVG_PENDING_ATTR) < 0) return html;
  return html.replace(PLACEHOLDER_RE, (full, idxStr: string) => {
    const idx = Number.parseInt(idxStr, 10);
    if (!Number.isFinite(idx)) return full;
    const imageId = markerToImageId[idx];
    if (typeof imageId !== "string" || imageId.length === 0) return full;
    const withoutPendingAttr = full.replace(
      /\s*data-lumirealm-svg-pending\s*=\s*["']?\d+["']?/i,
      "",
    );
    return withoutPendingAttr.replace(
      /^<img\b/i,
      `<img src="/api/v1/images/${imageId}"`,
    );
  });
}
