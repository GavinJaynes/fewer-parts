# Original draft examples for smoke checks

These are the original local examples from the September 2026 draft, retained to reproduce its smoke fixture. They are not the installed skill's pattern catalog. New implementations use the live Modern CSS collection through the skill's source workflow.

Use the sections relevant to the task. These candidates are not a browser-support matrix. Verify the exact feature when adopting it, and express it through the project's Tailwind version where possible. Examples below assume Tailwind v4 and are small patterns to adapt, not a component library.

## Responsive layout

- **A component appears in different regions:** consider a size container and descendant container queries. Put `@container` on an ancestor whose width is determined by the surrounding layout; an element cannot size-query itself. Viewport variants still suit page-level changes. Check a narrow sidebar on a wide screen, not just narrow browser windows.
- **Nested content needs common alignment:** consider subgrid when the parent supplies shared tracks. A child needs the appropriate span; declaring subgrid alone does not create the intended layout.
- **A repeated collection adapts to space:** consider intrinsic Grid sizing, `minmax()`, and `auto-fit`/`auto-fill` before measuring items in JavaScript. Allow content to shrink with `min-w-0` where needed.
- **Images or media have predictable proportions:** use `aspect-ratio` and `object-fit`, preserve image dimensions where known, and choose cropping intentionally.
- **A panel fills the mobile screen:** choose between stable and dynamic viewport units based on whether browser-toolbar resizing should change the layout. Use minimum sizing when content can exceed the screen. Check overflow and the virtual keyboard.
- **Layout has a reading direction:** use logical spacing/alignment where it expresses the intent, while preserving meaningful DOM order. Visual reordering is not a fix for keyboard order.

An adaptable text card:

```html
<div class="@container">
  <article class="grid min-w-0 gap-4 rounded-xl border p-4 @md:grid-cols-[minmax(0,1fr)_auto]">
    <div class="min-w-0">
      <h2 class="text-balance text-xl font-semibold">Component preview</h2>
      <p class="[overflow-wrap:anywhere]">Content can grow without widening the surrounding layout.</p>
    </div>
    <a href="/preview" class="self-start rounded px-3 py-2 underline focus-visible:outline-2 focus-visible:outline-offset-2">
      Open preview
    </a>
  </article>
</div>
```

The stacked base is usable without the enhancement. The parent decides the available width. Reference: [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries).

## Typography and color

- Consider `text-wrap: balance` for short headings and `pretty` for suitable text; retain natural wrapping when unsupported. Avoid forcing editorial line breaks that fail with new content.
- Use `clamp()` when continuous scaling serves the design. Include a relative text-size contribution, keep sensible bounds, and check zoom and long translations. A breakpoint can still be the right choice when the composition changes.
- Use font-relative units such as `ch`, `lh`, or `cap` when they express the relationship being designed. Check support for the chosen unit rather than assuming all font units share it.
- Derive colors using project tokens, `oklch()`, `color-mix()`, or relative color syntax when this simplifies a real palette relationship. Perceptual lightness is not a contrast guarantee. Check final foreground/background pairs in actual themes.
- Match `color-scheme` to the theme so native controls fit. `light-dark()` can simplify paired values when supported, but follow the existing theme selector and user preference behavior.
- Preserve readable colors as a base for newer color functions. Use `@supports` around newer token definitions if an unsupported token value could invalidate a consuming declaration.

## Forms and validation

Use semantic input types, labels, `autocomplete`, and appropriate keyboard hints before creating custom controls. CSS validation states provide styling; they do not create explanatory messages or implement server validation.

- Use `:user-invalid` when feedback should follow interaction. `:invalid` can match required empty controls on initial load. Preserve the form's intended error timing and accessible error associations.
- Use `:has()` for a container reacting to state already present in its descendants. Keep the query local and relevant. Do not duplicate application state in CSS selectors.
- Consider `field-sizing` for growing fields. Constrain inline size, set a useful minimum, cap growth if needed, and keep overflow accessible. A fixed height defeats auto growth.
- Prefer native controls plus styling such as `accent-color` when they meet the behavior. Customizable selects and other newer control features need their own support checks.

An editable base with optional native growth:

```html
<label for="message" class="block font-medium">Message</label>
<textarea id="message" name="message" rows="3"
  class="block w-full min-h-24 max-h-64 resize-y overflow-auto rounded border p-3 supports-[field-sizing:content]:field-sizing-content"
  aria-describedby="message-help"></textarea>
<p id="message-help" class="text-sm">You can resize the field if you need more space.</p>
```

This intentionally permits manual resizing. Unsupported browsers retain ordinary textarea behavior. When content sizing is active, `rows` is not the growth control; test the CSS size bounds. References: [field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing), [constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation).

## Disclosures, dialogs, and popovers

Select by interaction contract:

| Need | Candidate | Behavior to preserve |
| --- | --- | --- |
| Inline expandable content | `<details>` / `<summary>` | An understandable summary and native keyboard activation; animate only if useful |
| A modal task | `<dialog>` with `showModal()` | Accessible name, deliberate initial focus, Escape behavior, close path, and focus restoration |
| A nonmodal floating panel | Popover API | Appropriate trigger and content semantics, dismissal, keyboard access, and placement |
| Position a panel beside a trigger | CSS anchor positioning | Independent support check, viewport collision handling, and usable alternate placement |

An HTML `popover` does not by itself implement an ARIA menu, listbox, or modal. Use the correct pattern for the content, and retain a component library if it supplies needed behavior. Do not simulate modal opening by only setting `<dialog open>`; that does not provide the modal contract of `showModal()`.

For a basic confirmation whose browser targets support `<dialog>`, the framework's open action can call `dialog.showModal()`, and a `<form method="dialog">` can provide a close action. Style the dialog and backdrop through Tailwind or the component stylesheet. Keep application mutations in the application's event handler; closing a dialog is not itself confirmation of a business action.

References: [dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog), [using popovers](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using), [anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning).

## Motion and state changes

- Use transitions for a small state change and keyframes for a sequence. Scope reduced-motion behavior to the affected effect; ensure the final state still appears when animation is absent.
- Consider `@starting-style` for entry transitions. Discrete transitions, top-layer exit, and auto-size interpolation are separate concerns. Check every feature used; scope inherited `interpolate-size` to the component rather than enabling it globally without need.
- Consider a View Transition for continuity across a state update. Keep the normal update path when the API is absent or motion is reduced. Confirm the specific same-document, cross-document, or scoped capability.
- For scroll-linked progress, consider a scroll or view timeline. Put the enhancement in a supported, motion-appropriate branch and keep the base content visible. Set the animation shorthand before the timeline longhand because the shorthand resets it. Scroll-driven progress and a one-time entry trigger have different behavior.
- CSS, native JavaScript animation APIs, and a library can each be appropriate. Choose according to the required interaction; do not replace orchestration, drag behavior, or cancellation logic with an incomplete visual approximation.

References: [scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations), [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

## Scrolling, rendering, and architecture

- Consider `scrollbar-gutter` for scrollbar-induced shifts and `overscroll-behavior` for scroll chaining. Neither alone provides full modal scroll management.
- Prefer native overflow and optional scroll snapping for browsable collections. Check reachability, keyboard use, and oversized items. Snapping is not a substitute for all carousel controls or announcements.
- Use lazy loading for suitable below-the-fold media; preserve dimensions and avoid delaying the primary visual. Use `content-visibility` selectively for expensive offscreen content, with a sensible intrinsic-size estimate and checks for navigation, find-in-page, and layout shifts. It does not eliminate the DOM or provide full virtualization.
- Use browser observers where the application needs events: `IntersectionObserver` can trigger data loading, and `ResizeObserver` can feed measured dimensions to a canvas or other external consumer. A CSS-only visual replacement does not preserve those side effects. Clean up subscriptions with the component lifecycle.
- Use existing cascade layers and local component styles to manage overrides. Nesting and `@scope` serve different purposes; avoid rewriting an established architecture to introduce them.

These opportunities should reduce maintenance or improve behavior. Retain an existing solution when it already fits the task and its replacement offers no useful benefit.
