export class TranslationError extends Error {
  readonly kind: string;
  readonly breadcrumb: readonly string[];
  override readonly cause?: unknown;

  constructor(kind: string, message: string, opts: { breadcrumb?: readonly string[]; cause?: unknown } = {}) {
    super(message);
    this.name = "TranslationError";
    this.kind = kind;
    this.breadcrumb = opts.breadcrumb ?? [];
    if (opts.cause !== undefined) this.cause = opts.cause;
  }

  at(...segments: string[]): TranslationError {
    return new TranslationError(this.kind, this.message, {
      breadcrumb: [...segments, ...this.breadcrumb],
      cause: this.cause,
    });
  }
}

export type Result<T, E = TranslationError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
