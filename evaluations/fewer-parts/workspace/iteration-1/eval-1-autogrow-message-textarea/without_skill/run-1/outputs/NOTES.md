# Auto-growing Message textarea - notes

## What was implemented and why

Only `contact.html` changed (plus the rebuilt `dist/output.css`, which is gitignored). The Message textarea's class list gained four Tailwind v4 utilities:

```
field-sizing-content min-h-[calc(4lh+1rem+2px)] max-h-[calc(12lh+1rem+2px)] resize-y
```

Compiled output (`dist/output.css`):

```css
.field-sizing-content { field-sizing: content; }
.min-h-\[calc\(4lh\+1rem\+2px\)\] { min-height: calc(4lh + 1rem + 2px); }
.max-h-\[calc\(12lh\+1rem\+2px\)\] { max-height: calc(12lh + 1rem + 2px); }
.resize-y { resize: vertical; }
```

- `field-sizing: content` makes the browser size the textarea to its content, so it grows as the user types. No JavaScript, no hidden mirror element, no `scrollHeight` measuring on `input`; the form script (`src/contact-form.js`) is untouched.
- Because `field-sizing: content` ignores the `rows` attribute (MDN: `rows`/`cols` "have no effect" in content mode), `min-height` reinstates the original four-line starting size. The `calc(4lh + 1rem + 2px)` is 4 lines (`lh` = the textarea's own line-height, 24px here) + the existing `py-2` padding (1rem) + the 1px top/bottom borders, under Preflight's `box-sizing: border-box`.
- `max-height` of 12 lines is the "comfortable limit". Once content exceeds it the textarea stops growing and its default `overflow: auto` shows a scrollbar, so long messages remain readable and editable.
- `resize: vertical` keeps the native drag handle. Dragging sets an explicit inline `height`, which (as MDN documents) overrides content sizing from then on; the handle is clamped by the same min/max.
- `rows="4"` is deliberately kept on the element for the fallback below, and the textarea id/name/`aria-describedby`/error elements are unchanged so the validation and error messages keep working.

Utilities were used in markup rather than a component class, matching the README convention ("Tailwind utilities in markup").

## Fallback

Browsers without `field-sizing` simply drop that declaration and keep an ordinary `<textarea rows="4">`, vertically resizable by hand up to the same 12-line `max-height`. Nothing else is needed: `min-height`/`max-height`/`resize` are universally supported, and a browser too old for the `lh` unit would just drop those two declarations too and fall back to the plain `rows="4"` box. No `@supports` block and no JS polyfill were added, per the task's "older browsers may keep an ordinary textarea".

## What was verified and how

`pnpm run build` ran cleanly (Tailwind v4.3.3) and the four classes appear in `dist/output.css` (grep shown above).

The page was served with `python -m http.server 8847 --bind 127.0.0.1 --directory <project>` and opened in the in-app browser (my own tab, `tab-1`, Chromium-based, 1280x720 viewport). Using the page's JavaScript console:

- `CSS.supports('field-sizing','content')` is `true`; computed `field-sizing: content`, `min-height: 114px`, `max-height: 306px`, `resize: vertical`, `overflow-y: auto`, `line-height: 24px`.
- Heights by content: 0, 2 and 4 lines -> 114px (the min); 6 lines -> 162px; 12 lines -> 306px; 40 lines -> 306px with `scrollHeight` 976px and `scrollTop` settable to 672px, i.e. it scrolls. The document does not scroll horizontally.
- Form logic: clicking Send with everything empty showed "Enter your name.", "Enter a valid email address." and "Enter a message." with `aria-invalid="true"` on each field and focus moved to the name field; dispatching an `input` event with text in the message cleared the message error. This matches the pre-existing behaviour in `src/contact-form.js`.
- Manual resize: a real pointer drag on the resize handle (561,341 -> 561,400 in the screenshot frame) took the one-line textarea from 114px to 208px and left `style="height: 208px;"` on the element. Screenshots before/after confirmed the visual result.

Not verified: Firefox, Safari/iOS Safari and Android Chrome were not available in this environment, so the fallback path (a browser that does not support `field-sizing`) was not exercised in a real browser; it relies on the standard CSS behaviour of ignoring unknown declarations. The network submission (`POST /api/messages`) was not exercised because there is no backend behind the static server; the submit path was not modified.

## Browser-support claims and sources

- `field-sizing` is "Baseline 2026 - Newly available: Since June 2026, this feature works across the latest devices and browser versions" - MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing (fetched 2026-09-03). The same page states that `rows`/`cols` have no effect with `field-sizing: content` and recommends min/max sizing properties alongside it.
- First supporting versions: Chrome 123, Edge 123, Firefox 152, Safari 26.2, Safari on iOS 26.2, Samsung Internet 27; global usage 84.61% - caniuse, https://caniuse.com/mdn-css_properties_field-sizing (fetched 2026-09-03). Chrome for Android tracks desktop Chrome (caniuse only lists its current version, 151).
- Tailwind v4 ships the `field-sizing-content` utility and arbitrary-value `min-h-[...]`/`max-h-[...]`; confirmed empirically by the v4.3.3 build output rather than by a documentation fetch.

These versions match the README's "current stable Chrome, Edge, Firefox and Safari" targets; anything older gets the plain-textarea fallback.
