import type { CodeLanguage } from "./highlight";

interface Snippet {
  readonly lang: CodeLanguage;
  readonly source: string;
}

export interface Excerpt extends Snippet {
  /**
   * Toolbar caption, derived so the stage and the language cannot disagree.
   */
  readonly label: string;
}

interface Definition {
  readonly id: string;
  readonly feature: string;
  readonly title: string;
  readonly summary: string;
  readonly preserves: string;
  readonly removes: string;
  readonly decision: string;
  readonly outcome: "replace" | "keep";
  readonly before: Snippet;
  readonly after: Snippet;
  readonly note: string;
  /**
   * True when a runnable recipe on this site shares the id.
   */
  readonly demo: boolean;
}

export interface Transformation extends Omit<Definition, "after" | "before"> {
  readonly before: Excerpt;
  readonly after: Excerpt;
}

/**
 * Before-and-after pairs written to be read, not pasted: each one is the
 * smallest honest excerpt of a change the skill makes. Two of them have no
 * recipe on this site, which is the point — the runnable demos are a sample of
 * the skill's range, not its limit.
 */
const definitions: readonly Definition[] = [
  {
    id: "field-sizing",
    feature: "field-sizing",
    title: "A textarea that follows its content",
    summary:
      "Measuring a field in JavaScript to resize it is work the browser can do.",
    preserves: "A field that grows, scrolls, and remains manually resizable",
    removes: "Two listeners, height measurement, and inline style mutation",
    decision: "Progressively enhance with CSS",
    outcome: "replace",
    before: {
      lang: "js",
      source: `const resize = (field) => {
  field.style.height = "auto";
  field.style.height = \`\${field.scrollHeight}px\`;
};

field.addEventListener("input", () => resize(field));
window.addEventListener("resize", () => resize(field));`,
    },
    after: {
      lang: "css",
      source: `.comment-field {
  field-sizing: content;
  min-block-size: 3lh;
  max-block-size: 12lh;
}`,
    },
    note: "Newly available, so the base stays a conventional resizable textarea with a sensible minimum height. Nothing breaks where the property is ignored.",
    demo: true,
  },
  {
    id: "container-card",
    feature: "@container",
    title: "A card that reads its own space",
    summary:
      "A viewport breakpoint answers the wrong question for a component that moves between a page and a sidebar.",
    preserves: "The same compact and expanded card layouts",
    removes: "Viewport coupling and parent-specific overrides",
    decision: "Let the component respond to its container",
    outcome: "replace",
    before: {
      lang: "css",
      source: `/* Wrong in the sidebar: the viewport is wide, the card is not. */
@media (min-width: 640px) {
  .resource-card {
    grid-template-columns: 96px 1fr;
  }
}`,
    },
    after: {
      lang: "css",
      source: `.card-slot {
  container-type: inline-size;
}

@container (min-width: 320px) {
  .resource-card {
    grid-template-columns: 96px 1fr;
  }
}`,
    },
    note: "The single-column card remains the base layout, so the component is still right in a slot that never reaches the threshold.",
    demo: true,
  },
  {
    id: "has-selection",
    feature: ":has()",
    title: "The parent reflects real form state",
    summary:
      "A class mirroring a checked radio is a second copy of state the form already holds.",
    preserves: "Native selection, labels, and keyboard behavior",
    removes: "Mirrored classes and a change listener",
    decision: "Style the state the form already owns",
    outcome: "replace",
    before: {
      lang: "js",
      source: `group.addEventListener("change", () => {
  for (const option of group.querySelectorAll(".option")) {
    const input = option.querySelector("input");
    option.classList.toggle("is-selected", input.checked);
  }
});`,
    },
    after: {
      lang: "css",
      source: `.option:has(input:checked) {
  border-color: var(--accent);
  background: var(--accent-surface);
}`,
    },
    note: "The listener goes. Arrow-key selection, labels, and the checked state stay exactly where they were, in the native radio group.",
    demo: true,
  },
  {
    id: "native-dialog",
    feature: "<dialog>",
    title: "Modality that comes from the platform",
    summary:
      "A custom overlay has to rebuild the top layer, focus containment, Escape, and focus return, then unwind all of it.",
    preserves: "A modal flow with application-specific save logic",
    removes: "Focus trapping, Escape handling, scroll lock, and z-index work",
    decision: "Keep app logic; return modality to the platform",
    outcome: "replace",
    before: {
      lang: "js",
      source: `overlay.hidden = false;
document.body.style.overflow = "hidden";
document.addEventListener("keydown", closeOnEscape);
trapFocus(overlay);
// ...then undo all four on close, and put focus back on the trigger`,
    },
    after: {
      lang: "js",
      source: `dialog.showModal();

dialog.addEventListener("close", () => {
  save(dialog.returnValue);
});`,
    },
    note: "Only application logic stays in JavaScript. The skill still checks the accessible name, how the dialog is dismissed, and where focus lands afterwards.",
    demo: true,
  },
  {
    id: "light-dark",
    feature: "light-dark()",
    title: "One set of tokens, both themes",
    summary:
      "A duplicated palette in a media query drifts the moment someone changes one colour.",
    preserves: "The same light and dark themes",
    removes: "A second token declaration block",
    decision: "Keep both values beside the token they define",
    outcome: "replace",
    before: {
      lang: "css",
      source: `:root {
  --surface: #fff;
  --text: #16202e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface: #10182a;
    --text: #e8eefb;
  }
}`,
    },
    after: {
      lang: "css",
      source: `:root {
  color-scheme: light dark;
  --surface: light-dark(#fff, #10182a);
  --text: light-dark(#16202e, #e8eefb);
}`,
    },
    note: "There is no demo for this one on this site. The skill gets there the way it gets anywhere else: it reads the live reference while it writes your code, and it checks the contrast of both results.",
    demo: false,
  },
  {
    id: "abort-controller",
    feature: "AbortController",
    title: "The superseded request actually stops",
    summary:
      "Ignoring a late response is not the same as cancelling the work behind it.",
    preserves: "Latest-result wins and real error handling",
    removes: "A request that keeps running after it is obsolete",
    decision: "Use the platform cancellation primitive",
    outcome: "replace",
    before: {
      lang: "js",
      source: `let latest = 0;

const search = async (term) => {
  const id = ++latest;
  const response = await fetch(\`/search?q=\${encodeURIComponent(term)}\`);
  // The superseded request still ran, and still resolved.
  if (id === latest) render(await response.json());
};`,
    },
    after: {
      lang: "js",
      source: `let inFlight;

const search = async (term) => {
  inFlight?.abort();
  inFlight = new AbortController();
  try {
    const response = await fetch(\`/search?q=\${encodeURIComponent(term)}\`, {
      signal: inFlight.signal,
    });
    render(await response.json());
  } catch (error) {
    if (error.name !== "AbortError") throw error;
  }
};`,
    },
    note: "No demo for this one either. Note what did not disappear: the error path is still handled, because a cancelled request is not a failed one.",
    demo: false,
  },
  {
    id: "url-parser",
    feature: "URL.canParse()",
    title: "URL parsing that follows the platform",
    summary:
      "A regular expression becomes a second, incomplete definition of what a URL is.",
    preserves: "Validation feedback for absolute and relative URLs",
    removes: "A handwritten parser and its edge-case tests",
    decision: "Use the URL parser, with a constructor fallback",
    outcome: "replace",
    before: {
      lang: "js",
      source: `const urlPattern = /^(https?:\\/\\/)?[\\w.-]+\\.[a-z]{2,}(\\/.*)?$/i;

const isValid = (value) => urlPattern.test(value);`,
    },
    after: {
      lang: "js",
      source: `const isValid = (value, base = location.href) =>
  URL.canParse?.(value, base) ?? canConstructUrl(value, base);`,
    },
    note: "The fallback uses the same URL constructor semantics, so older browsers get the same answer rather than a different home-grown grammar.",
    demo: true,
  },
  {
    id: "keep-the-carousel",
    feature: "keep it",
    title: "A carousel whose complexity is doing real work",
    summary:
      "Native scroll snapping can make a lovely gallery. It is not automatically a replacement for product requirements such as virtualization, live announcements, RTL, and controlled state.",
    preserves:
      "The tested interaction and the library that currently delivers it",
    removes: "Nothing—replacement would only move complexity into project code",
    decision: "Keep the dependency; document why it earns its place",
    outcome: "keep",
    before: {
      lang: "js",
      source: `createCarousel(track, {
  virtualize: true,
  direction: locale.direction,
  announceChanges: true,
  selectedId: state.productId,
});`,
    },
    after: {
      lang: "js",
      source: `// Keep the existing implementation.
// Its complexity matches requirements the platform alone
// does not replace more simply in this project.`,
    },
    note: "Fewer Parts is not a campaign against JavaScript or dependencies. If the existing machinery is proportionate, tested, and easier to maintain than the proposed replacement, the smaller decision is not to rewrite it.",
    demo: false,
  },
];

const labelled = function labelled(snippet: Snippet, stage: string): Excerpt {
  return { ...snippet, label: `${stage} · ${snippet.lang.toUpperCase()}` };
};

const toTransformation = function toTransformation(
  item: Definition
): Transformation {
  return {
    ...item,
    before: labelled(item.before, "CURRENT PROJECT"),
    after: labelled(
      item.after,
      item.outcome === "keep" ? "FEWER PARTS · KEEP" : "WITH FEWER PARTS"
    ),
  };
};

export const transformations: readonly Transformation[] = definitions.map(
  (item) => toTransformation(item)
);

export const transformationFor = (id: string): Transformation | undefined =>
  transformations.find((item) => item.id === id);
