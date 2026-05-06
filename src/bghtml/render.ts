import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import { splitAndRewriteBgBundle } from "./rewriter.js";
import { mountBgHost, type BgMountHandle } from "./mount.js";
import type { IslandStyles } from "./island-styles.js";
import { stripCssImports, splitCssImports } from "./strip-imports.js";

// Lumi renders message-embedded HTML with no .chattext ancestor. Inject a
// chat-scope stylesheet into document.head scoped to [data-message-id]. One
// style element per chat, replaced on chat-switch, removed on dismount.

const CHAT_SCOPE_STYLE_ID = "risu-compat-chat-scope-css";

function upsertChatScopeStyle(css: string): void {
  let el = document.getElementById(CHAT_SCOPE_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = CHAT_SCOPE_STYLE_ID;
    el.setAttribute("data-risu-compat", "chat-scope");
    document.head.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
}

function removeChatScopeStyle(): void {
  const el = document.getElementById(CHAT_SCOPE_STYLE_ID);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

// Frontend bg-HTML orchestrator. One mount per chat.

export interface BgHtmlMessage {
  readonly type: "render_bg_html";
  readonly chatId: string;
  readonly bgHtml: string;
  readonly crossRuleStyles?: readonly string[];
}

export interface BgHtmlClearMessage {
  readonly type: "clear_bg_html";
  readonly chatId: string;
}

export interface BgHtmlRenderer {
  handleMessage(msg: BgHtmlMessage | BgHtmlClearMessage): void;
  destroy(): void;
}

interface Flog {
  info(msg: string, ...rest: unknown[]): void;
  warn(msg: string, ...rest: unknown[]): void;
  error(msg: string, ...rest: unknown[]): void;
}

export function setupBgHtmlRenderer(
  ctx: SpindleFrontendContext,
  flog: Flog,
  islandStyles?: IslandStyles,
): BgHtmlRenderer {
  flog.info("bg-html renderer: init");

  let activeChatId: string | null = null;
  let handle: BgMountHandle | null = null;
  let lastCss: string | null = null;

  function dismount(): void {
    if (handle) {
      flog.info(`bg-html renderer: dismount chatId=${activeChatId}`);
      handle.destroy();
      handle = null;
      lastCss = null;
    }
    removeChatScopeStyle();
    if (islandStyles) islandStyles.clear();
    activeChatId = null;
  }

  return {
    handleMessage(msg: BgHtmlMessage | BgHtmlClearMessage): void {
      if (msg.type === "clear_bg_html") {
        if (activeChatId === msg.chatId || activeChatId === null) {
          dismount();
        }
        return;
      }
      // render_bg_html
      if (msg.chatId !== activeChatId) {
        dismount();
        activeChatId = msg.chatId;
      }
      let bundle;
      try {
        bundle = splitAndRewriteBgBundle(msg.bgHtml);
      } catch (err) {
        flog.error("bg-html renderer: rewrite failed", err);
        return;
      }
      if (!handle) {
        flog.info(`bg-html renderer: mount chatId=${msg.chatId} html_len=${bundle.html.length} css_len=${bundle.css.length}`);
        handle = mountBgHost(ctx);
      }
      const cssChanged = bundle.css !== lastCss;
      if (cssChanged) {
        handle.updateCss(bundle.css);
        lastCss = bundle.css;
      }
      handle.updateHtml(bundle.html);
      // Chat-scope injection for display-regex-embedded HTML.
      let chatBundle;
      try {
        chatBundle = splitAndRewriteBgBundle(msg.bgHtml, {
          scopePrefix: "[data-message-id] ",
          // Universal selectors become :host-scoped, inert at document level.
          rewriteUniversalToHost: true,
          // Display-regex HTML uses unprefixed class names, CSS selectors must match.
          rewriteClassNames: false,
        });
      } catch (err) {
        flog.error("bg-html renderer: chat-scope rewrite failed", err);
        chatBundle = null;
      }
      // Shadow-injectable CSS for extractHtmlIslands shadows.
      // Chat-scope CSS doesn't pierce shadow boundaries, adopt an unscoped sheet instead.
      if (islandStyles) {
        let islandBundle;
        try {
          islandBundle = splitAndRewriteBgBundle(msg.bgHtml, {
            scopePrefix: "",
            // Adopted shadows aren't ours, :host conventions don't apply.
            rewriteUniversalToHost: false,
            rewriteClassNames: false,
          });
        } catch (err) {
          flog.error("bg-html renderer: island-style rewrite failed", err);
          islandBundle = null;
        }
        if (islandBundle) {
          // Default img max-width 100% (no cap) without !important. Shadow isolates,
          // so no [data-message-id] prefix needed.
          const islandImgReset =
            "img { max-width: 100%; }\n";
          // 28px absolute line-height mirrors Tailwind prose. Lumi's 1.65 unitless
          // ratio collapses bar-overlap layouts in cards with fixed-height text-box.
          const islandLineHeight = ':host { line-height: 28px; }\n';
          // @import is illegal in replaceSync (async-only). Google Fonts still
          // loads via the chat-scope style in document.head.
          const islandCss = stripCssImports(
            islandLineHeight + islandImgReset + islandBundle.css,
          );
          islandStyles.setStylesheet(islandCss);
          flog.info(
            `bg-html renderer: island-styles updated css_len=${islandCss.length} (raw=${islandBundle.css.length}, @import stripped)`,
          );
        }
        const crossRuleParts = msg.crossRuleStyles ?? [];
        const cleanedParts = crossRuleParts.map((p) => stripCssImports(p));
        islandStyles.setCrossRuleSheets(cleanedParts);
      }
      if (chatBundle) {
        // [data-message-id] img specificity (0,1,1) beats Lumi's .proseImage (0,1,0).
        // 80vh cap allows tall card images while bounding bare LLM-emitted img tags.
        // Card inline styles always win over this.
        const imgReset =
          "[data-message-id] img { max-width: 100%; max-height: 80vh; }\n";
        const lineHeight =
          "[data-message-id] { line-height: 28px; }\n";
        // Lumi sets overflow:hidden + contain:layout, which clips absolute
        // hover popups and creates a containing block for position:fixed.
        // The runtime DOM lifter handles fixed, drop both for Risu chats.
        const bubbleContainment =
          "[data-message-id] { overflow: visible !important; contain: none !important; }\n";
        // Cross-rule styles wrapped in `[data-message-id] { ... }` via CSS Nesting
        // so they reach light-DOM widgets too. Without this, fixed-position widgets
        // styled via a different rule wouldn't resolve to `fixed` and the lifter
        // wouldn't see them. Shadow-DOM case is covered by island-styles.
        const crossRuleParts = msg.crossRuleStyles ?? [];
        // Cross-rule wrap takes verbatim CSS (no rewriter pass) and folds it
        // under a parent selector via CSS Nesting. So an aggressive author
        // reset like `* { margin: 0; padding: 0 }` resolves to
        // `<wrapper-selector> *` post-nesting. Pre-fix the wrapper was just
        // `[data-message-id]` , that includes Lumi's bubble chrome
        // (`_card_*`/`_content_*`), so the reset zeroed Lumi's padding.
        // (THE AMOROUS REALM II bug, 2026-05-04 log sheet[5] offset 14561.)
        // Fix: scope INSIDE Lumi's chrome via two stable hooks:
        //   1. `[data-message-id] [data-component="MessageContent"]` , the
        //      live message bubble's content area (bubble chrome sits between
        //      the two attributes, so the reset can't reach it).
        //   2. `.lumi-message-portal-wrapper` , the runtime DOM lifter's
        //      overlay wrapper. Light-DOM clones live inside it; their CSS
        //      reaches them via this branch (see architecture §2.10 / quirks
        //      §3.74). Without this branch the lifter would render unstyled
        //      clones for cards that ship CSS in per-rule <style> blocks.
        // Selector list with comma is fine inside CSS Nesting , `& X` resolves
        // against each parent in turn.
        const wrappedCrossRule = crossRuleParts
          .map((p) => stripCssImports(p))
          .filter((p) => p.trim().length > 0)
          .map((p) => `[data-message-id] [data-component="MessageContent"], .lumi-message-portal-wrapper {\n${p}\n}\n`)
          .join("\n");
        // @import must precede other rules. Hoist them back to top after
        // preamble prepend, or Google Fonts silently stops loading.
        const { imports, rest } = splitCssImports(chatBundle.css);
        const chatScopeCss =
          (imports ? imports + "\n" : "")
          + lineHeight
          + imgReset
          + bubbleContainment
          + rest
          + (wrappedCrossRule ? "\n" + wrappedCrossRule : "");
        upsertChatScopeStyle(chatScopeCss);
        flog.info(
          `bg-html renderer: chat-scope CSS injected css_len=${chatScopeCss.length} ` +
            `(imports_hoisted_len=${imports.length}, body_len=${rest.length}, ` +
            `cross_rule_wrapped_len=${wrappedCrossRule.length}; ` +
            `+img-reset +bubble-containment preambles)`,
        );
      }
      flog.info(
        `bg-html renderer: applied chatId=${msg.chatId} html_len=${bundle.html.length} css_len=${bundle.css.length} css_changed=${cssChanged}`,
      );
    },
    destroy(): void {
      dismount();
    },
  };
}
