# Content-sized textarea

Use when a textarea should grow and shrink with its value, with bounded height. For Tailwind projects, start with the [Tailwind v4 component example](../assets/tailwind-field-sizing.html). Read the component CSS in [the runnable standalone demo](../assets/field-sizing.html) when the project does not use Tailwind or the underlying fallback is useful. Demo controls and presentation styles are not part of the component; the standalone file opens directly in a browser for experimentation.

`field-sizing` was Baseline Newly Available in June 2026, checked 2026-09-14. Verify current [MDN behavior and compatibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing) against the project before use.

## Decisions that matter

- Constrain inline size so a textarea grows vertically, and set minimum/maximum block sizes. Leave overflow available when the maximum is reached.
- Do not keep a fixed height or an old autosizing script's inline height that defeats native growth. Remove measurement code only after checking what else its listeners do.
- Placeholders influence content sizing; `rows` and `cols` no longer set the preferred size under `field-sizing: content`. The demo keeps `rows` for its base and sets explicit CSS size bounds for the enhancement.
- The base is a labelled, manually resizable, scrollable textarea. Older browsers keep that behavior when they ignore the enhancement. If autosizing itself is required on older targets, this base is insufficient: preserve the tested JavaScript autosizer there, gated by `CSS.supports('field-sizing', 'content')`.
- Keep app state, validation, announcements, and submission logic. Demo buttons only change sample content; native sizing requires no JavaScript.

## Exercise the result

Check empty and placeholder states, typing/paste, deletion back to empty, long unbroken text, and content beyond the height limit. Resize the container and check keyboard access. Use the demo's “Use fallback” control to inspect the base in a supporting browser; this simulates the CSS path, not an older engine. Real target-browser testing is still separate.
