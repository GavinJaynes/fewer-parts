import { createHighlighter } from "@tanstack/highlight/core";
import { css } from "@tanstack/highlight/languages/css";
import { html } from "@tanstack/highlight/languages/html";
import { js } from "@tanstack/highlight/languages/js";

const highlighter = createHighlighter({ languages: [css, html, js] });

export type CodeLanguage = "css" | "html" | "js";

/**
 * Every code block on the site is rendered through here, so a full example and
 * a six-line excerpt get the same treatment, line-number gutter included. The
 * HTML tokenizer delegates embedded style and script blocks to the registered
 * CSS and JS tokenizers.
 */
export const highlightCode = function highlightCode(
  source: string,
  lang: CodeLanguage
): string {
  return highlighter.highlightToHtml(source, { lang, lineNumbers: true });
};
