export interface LorebookTranslationItem {
  readonly sourceHash?: string;
  readonly comment?: string;
}

export interface LangBlock {
  readonly name?: string;
  readonly description?: string;
  readonly lorebook?: Readonly<Record<string, { readonly comment?: string }>>;
}

export interface MergeLangArgs {
  readonly existing: LangBlock;
  readonly name?: string;
  readonly description?: string;
  readonly lorebookItems?: readonly LorebookTranslationItem[];
}

export function mergeLangBlock(args: MergeLangArgs): LangBlock {
  const existingLore = args.existing.lorebook ?? {};
  const nextLore: Record<string, { comment?: string }> = { ...existingLore };
  if (args.lorebookItems) {
    for (const item of args.lorebookItems) {
      if (!item.sourceHash) continue;
      const prior = nextLore[item.sourceHash] ?? {};
      nextLore[item.sourceHash] = {
        ...prior,
        ...(item.comment !== undefined ? { comment: item.comment } : {}),
      };
    }
  }
  return {
    ...args.existing,
    ...(args.name !== undefined ? { name: args.name } : {}),
    ...(args.description !== undefined ? { description: args.description } : {}),
    ...(Object.keys(nextLore).length > 0 ? { lorebook: nextLore } : {}),
  };
}
