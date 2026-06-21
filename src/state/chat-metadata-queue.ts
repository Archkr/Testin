const chains = new Map<string, Promise<unknown>>();

export function runChatMetadataExclusive<T>(chatId: string, fn: () => Promise<T>): Promise<T> {
  const prev = chains.get(chatId) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  const tail = run.then(() => undefined, () => undefined);
  chains.set(chatId, tail);
  void tail.then(() => {
    if (chains.get(chatId) === tail) chains.delete(chatId);
  });
  return run;
}
