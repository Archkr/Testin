import { z } from "zod";


export const triggerBindingSchema = z.enum([
  "start",
  "manual",
  "output",
  "input",
  "display",
  "request",
]);
export type TriggerBinding = z.infer<typeof triggerBindingSchema>;

export const triggerConditionSchema = z
  .object({ type: z.string() })
  .passthrough();
export type TriggerCondition = z.infer<typeof triggerConditionSchema>;

export const triggerEffectSchema = z
  .object({ type: z.string() })
  .passthrough();
export type TriggerEffect = z.infer<typeof triggerEffectSchema>;

const looseComment = z.union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => v == null ? "" : String(v))
  .pipe(z.string());

export const triggerscriptSchema = z
  .object({
    comment: looseComment,
    type: triggerBindingSchema,
    conditions: z.array(triggerConditionSchema).nullish().transform((v) => v ?? []),
    effect: z.array(triggerEffectSchema).nullish().transform((v) => v ?? []),
    lowLevelAccess: z
      .unknown()
      .nullish()
      .transform((v) => (v === undefined || v === null ? undefined : Boolean(v))),
  })
  .passthrough();

export type TriggerScript = z.infer<typeof triggerscriptSchema>;

export const KNOWN_V2_OPCODES = [
  "v2Header", "v2IfVar", "v2If", "v2IfAdvanced", "v2Else", "v2EndIndent",
  "v2SetVar", "v2Loop", "v2LoopNTimes", "v2BreakLoop", "v2RunTrigger",
  "v2ConsoleLog", "v2StopTrigger", "v2CutChat", "v2ModifyChat", "v2SystemPrompt",
  "v2Impersonate", "v2Command", "v2SendAIprompt", "v2ImgGen",
  "v2CheckSimilarity", "v2RunLLM", "v2ShowAlert", "v2ExtractRegex",
  "v2GetLastMessage", "v2GetMessageAtIndex", "v2GetMessageCount",
  "v2ModifyLorebook", "v2GetLorebook", "v2GetLorebookCount", "v2GetLorebookEntry",
  "v2SetLorebookActivation", "v2GetLorebookIndexViaName", "v2Random",
  "v2GetCharAt", "v2GetCharCount", "v2ToLowerCase", "v2ToUpperCase",
  "v2SetCharAt", "v2SplitString", "v2JoinArrayVar", "v2GetCharacterDesc",
  "v2SetCharacterDesc", "v2GetPersonaDesc", "v2SetPersonaDesc",
  "v2MakeArrayVar", "v2GetArrayVarLength", "v2GetArrayVar", "v2SetArrayVar",
  "v2PushArrayVar", "v2PopArrayVar", "v2ShiftArrayVar", "v2UnshiftArrayVar",
  "v2SpliceArrayVar", "v2SliceArrayVar", "v2GetIndexOfValueInArrayVar",
  "v2RemoveIndexFromArrayVar", "v2ConcatString", "v2GetLastUserMessage",
  "v2GetLastCharMessage", "v2GetFirstMessage", "v2GetAlertInput",
  "v2GetAlertSelect", "v2GetDisplayState", "v2SetDisplayState",
  "v2GetRequestState", "v2GetRequestStateRole", "v2SetRequestState",
  "v2SetRequestStateRole", "v2GetRequestStateLength", "v2UpdateGUI",
  "v2UpdateChatAt", "v2Wait", "v2QuickSearchChat", "v2StopPromptSending",
  "v2Tokenize", "v2GetAllLorebooks", "v2GetLorebookByName",
  "v2GetLorebookByIndex", "v2CreateLorebook", "v2ModifyLorebookByIndex",
  "v2DeleteLorebookByIndex", "v2GetLorebookCountNew",
  "v2SetLorebookAlwaysActive", "v2RegexTest", "v2GetReplaceGlobalNote",
  "v2SetReplaceGlobalNote", "v2GetAuthorNote", "v2SetAuthorNote",
  "v2MakeDictVar", "v2GetDictVar", "v2SetDictVar", "v2DeleteDictKey",
  "v2HasDictKey", "v2ClearDict", "v2GetDictSize", "v2GetDictKeys",
  "v2GetDictValues", "v2Calculate", "v2ReplaceString", "v2Comment",
  "v2DeclareLocalVar",
] as const;

export const KNOWN_V1_EFFECTS = [
  "cutchat", "modifychat", "runImgGen", "extractRegex", "runLLM",
  "checkSimilarity", "sendAIprompt", "showAlert", "setvar", "systemprompt",
  "impersonate", "command", "stop", "runtrigger", "runAxLLM",
] as const;

export const KNOWN_CODE_EFFECTS = ["triggercode", "triggerlua"] as const;

export const ALL_KNOWN_EFFECT_TYPES = new Set<string>([
  ...KNOWN_V2_OPCODES,
  ...KNOWN_V1_EFFECTS,
  ...KNOWN_CODE_EFFECTS,
]);
