import { createHighlighter } from "@tanstack/highlight/core";
import { css } from "@tanstack/highlight/languages/css";
import { html } from "@tanstack/highlight/languages/html";
import { js } from "@tanstack/highlight/languages/js";

const highlighter = createHighlighter({ languages: [css, html, js] });

/**
 * The examples ship as complete HTML documents. The HTML tokenizer delegates
 * embedded style and script blocks to the registered CSS and JS tokenizers.
 */
export const highlightHtml = function highlightHtml(source: string): string {
  return highlighter.highlightToHtml(source, {
    lang: "html",
    lineNumbers: true,
  });
};
