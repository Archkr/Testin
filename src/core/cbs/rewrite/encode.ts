
const OPEN_BRACE_A = "\uE9B8";
const OPEN_BRACE_B = "\uE9B9";
const CLOSE_BRACE_A = "\uE9BA";
const CLOSE_BRACE_B = "\uE9BB";
const COLON_A = "\uE9BC";
const COLON_B = "\uE9BD";

/** Encode so the result contains no `{{`, `}}`, or `::`. */
export function encodeOpaqueBody(s: string): string {
  // Order matters: longer-match tokens first so we don't misinterpret a
  // freshly introduced escape. Since our escapes never produce `{{`/`}}`/`::`
  // patterns, direct replaceAll is safe here.
  return s
    .replaceAll("{{", OPEN_BRACE_A + OPEN_BRACE_B)
    .replaceAll("}}", CLOSE_BRACE_A + CLOSE_BRACE_B)
    .replaceAll("::", COLON_A + COLON_B);
}

/** Inverse of `encodeOpaqueBody`. */
export function decodeOpaqueBody(s: string): string {
  return s
    .replaceAll(COLON_A + COLON_B, "::")
    .replaceAll(CLOSE_BRACE_A + CLOSE_BRACE_B, "}}")
    .replaceAll(OPEN_BRACE_A + OPEN_BRACE_B, "{{");
}

/** Sentinel code points reserved by this module. Exposed for tests / audits. */
export const SENTINELS: readonly string[] = [
  OPEN_BRACE_A, OPEN_BRACE_B, CLOSE_BRACE_A, CLOSE_BRACE_B, COLON_A, COLON_B,
];
