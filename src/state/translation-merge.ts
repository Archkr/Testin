export interface LorebookTranslationItem {
  readonly sourceHash?: string;
  readonly comment?: string;
}

export interface ToggleTranslationItem {
  readonly original: string;
  readonly translated: string;
}

export interface LangBlock {
  readonly name?: string;
  readonly description?: string;
  readonly lorebook?: Readonly<Record<string, { readonly comment?: string }>>;
  readonly toggles?: Readonly<Record<string, string>>;
}

export interface MergeLangArgs {
  readonly existing: LangBlock;
  readonly name?: string;
  readonly description?: string;
  readonly lorebookItems?: readonly LorebookTranslationItem[];
  readonly toggleItems?: readonly ToggleTranslationItem[];
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
  const existingToggles = args.existing.toggles ?? {};
  const nextToggles: Record<string, string> = { ...existingToggles };
  if (args.toggleItems) {
    for (const item of args.toggleItems) {
      if (!item.original) continue;
      if (typeof item.translated !== 'string') continue;
      nextToggles[item.original] = item.translated;
    }
  }
  return {
    ...args.existing,
    ...(args.name !== undefined ? { name: args.name } : {}),
    ...(args.description !== undefined ? { description: args.description } : {}),
    ...(Object.keys(nextLore).length > 0 ? { lorebook: nextLore } : {}),
    ...(Object.keys(nextToggles).length > 0 ? { toggles: nextToggles } : {}),
  };
}
