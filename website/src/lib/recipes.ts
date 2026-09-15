import { readFileSync } from "node:fs";
import path from "node:path";

const Category = {
  css: "CSS",
  htmlApi: "HTML + API",
  webApi: "Web API",
} as const;

const Status = {
  newly: "Newly available",
  widely: "Widely available",
} as const;

// The one recipe whose embedded preview gets showcase-specific styling.
const styledPreviewId = "field-sizing";

const definitions = [
  {
    id: styledPreviewId,
    title: "A field that grows with you",
    feature: "field-sizing",
    category: Category.css,
    status: Status.newly,
    action: "Type a little. Paste a lot. Clear it.",
    description:
      "Let the browser size your textarea. Keep editing and scrolling available in the fallback.",
    why: "The control follows its content without a resize observer, mirrored element, or input handler.",
    fallback:
      "Browsers without field-sizing keep a conventional resizable textarea with a sensible minimum height.",
    check:
      "Type past several lines, paste a long paragraph, then clear the field and resize it manually.",
    source:
      "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing",
  },
  {
    id: "container-card",
    title: "Responsive, wherever it lives",
    feature: "@container",
    category: Category.css,
    status: Status.widely,
    action: "Slide to change the container width.",
    description:
      "A component responds to its own space. The compact layout is the usable base.",
    why: "The card is portable because its layout depends on the space it receives, not the viewport around it.",
    fallback:
      "The one-column card comes first; the richer horizontal arrangement is applied only inside a supporting container.",
    check:
      "Drag slowly across the breakpoint and confirm that content remains readable at every intermediate width.",
    source:
      "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries",
  },
  {
    id: "has-selection",
    title: "The parent gets the message",
    feature: ":has()",
    category: Category.css,
    status: Status.widely,
    action: "Choose an option. Try the arrow keys.",
    description:
      "Style a card from its selected input. Native radios still own the interaction.",
    why: "The parent can reflect real form state directly, removing the JavaScript that would otherwise synchronize a class.",
    fallback:
      "The radio group remains fully usable when the relational selector is unavailable; only the selected-card treatment is reduced.",
    check:
      "Use both pointer and arrow-key input and confirm the checked control, label, and visual state stay aligned.",
    source:
      "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has",
  },
  {
    id: "native-dialog",
    title: "Make room for a moment",
    feature: "dialog.showModal()",
    category: Category.htmlApi,
    status: Status.widely,
    action: "Open it. Tab through. Press Escape.",
    description:
      "Native modality, focus, and dismissal. This embedded preview is modal within its own frame.",
    why: "The top layer, focus trapping, Escape handling, and backdrop semantics come from the platform instead of a custom overlay stack.",
    fallback:
      "The demo uses the broadly supported dialog API, while the surrounding page makes the iframe boundary explicit.",
    check:
      "Open the dialog, move through its focusable controls, press Escape, and verify focus returns to the trigger.",
    source:
      "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal",
  },
  {
    id: "url-parser",
    title: "Let the platform parse it",
    feature: "URL.canParse()",
    category: Category.webApi,
    status: Status.widely,
    action: "Try a URL, then break it.",
    description:
      "Check structure without a homemade regular expression. Includes an older-browser fallback.",
    why: "URL parsing rules stay with the browser, including relative URLs and edge cases that a regular expression usually misses.",
    fallback:
      "A guarded URL constructor provides the same validation outcome where URL.canParse() is unavailable.",
    check:
      "Try absolute, relative, malformed, and whitespace-heavy values and compare the normalized result.",
    source:
      "https://developer.mozilla.org/en-US/docs/Web/API/URL/canParse_static",
  },
];

export const recipes = definitions.map((recipe) => {
  const tailwind = readFileSync(
    path.resolve(
      process.cwd(),
      "../skills/modern-web-ui/assets",
      `tailwind-${recipe.id}.html`
    ),
    "utf-8"
  ).replaceAll("\r\n", "\n");
  const html = readFileSync(
    path.resolve(
      process.cwd(),
      "../skills/modern-web-ui/assets",
      `${recipe.id}.html`
    ),
    "utf-8"
  ).replaceAll("\r\n", "\n");
  // Adapt only showcase presentation; the textarea component and controls are unchanged.
  const embedded =
    recipe.id === styledPreviewId
      ? html.replace(
          "</html>",
          `<style>
    :root{font-size:14px;color:#182334;background:#f2f5f9}body{padding:24px}main{max-width:none}.eyebrow,h1,.intro,.badge,footer,.panel+ .panel,#demo-heading{display:none}.layout{display:block;margin:0}.panel{border:0;padding:0;background:transparent}.content-field{min-block-size:6rem;max-block-size:10rem;background:white;border-color:#c9d3e2}.controls{margin-block:12px;gap:6px}button{background:#e7edfa;color:#294b9b;border-color:#c6d3ef;padding:6px 9px}.hint{font-size:12px;margin-block:8px}#support{margin-bottom:0}
  </style></html>`
        )
      : html;
  return { ...recipe, tailwind, html, embedded };
});
