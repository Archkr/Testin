// Throw loudly on unsupported surfaces; silent defaults corrupt state.

import { RisuCompatUnsupportedError } from '../host.js';

export function unsupported(feature: string, reason: string): never {
  throw new RisuCompatUnsupportedError(feature, reason);
}
