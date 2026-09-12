# Auto-growing Message textarea (contact.html)

## What was implemented and why

Only `contact.html` changed (one `class` attribute on the `#message` textarea) plus the rebuilt `dist/output.css`. No JavaScript was added or changed.

Before:

```html
<textarea id="message" name="message" rows="4" required
  class="mt-1 block w-full rounded border border-ink-500/40 bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
  aria-describedby="message-hint message-error"></textarea>
```

After:

```html
<textarea id="message" name="message" rows="4" required
  class="mt-1 block w-full min-h-28 max-h-80 resize-y overflow-auto rounded border border-ink-500/40 bg-white px-3 py-2 supports-[field-sizing:content]:field-sizing-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
  aria-describedby="message-hint message-error"></textarea>
```

The growth is done natively with the CSS `field-sizing: content` property instead of a JavaScript `input` listener that measures `scrollHeight` and writes `style.height`. That removes a layout-measurement loop, a resize/orientation re-sync, and any interaction with `form.reset()`; the browser sizes the control from its content the same way it sizes any other block.

Class by class (Tailwind v4.3.3 utilities only; nothing was added to `src/input.css`):

- `supports-[field-sizing:content]:field-sizing-content` emits `@supports (field-sizing:content) { … { field-sizing: content } }`. This is the enhancement, gated so an unsupported engine never sees the declaration.
- `min-h-28` (7rem = 112px) is the floor. With `field-sizing: content` the `rows` attribute stops controlling height (MDN), so the floor is what keeps the empty field from collapsing to one line. 112px is within 2px of what `rows="4"` produces in this project (4 × 24px line-height + 16px padding + 2px border = 114px), so the enhanced and fallback fields start at practically the same size.
- `max-h-80` (20rem = 320px, roughly 12 lines) is the "comfortable limit". Past it the textarea stops growing and scrolls internally.
- `resize-y` keeps the native resize handle (vertical only, matching Tailwind's preflight default for textarea, but stated explicitly because the behaviour is now load-bearing).
- `overflow-auto` makes the scrolling intent explicit once the cap is reached (it is also the textarea default, so it costs nothing).
- `rows="4"` was kept on purpose: it is the fallback's height.

Everything else on the element (border, padding, focus outline, `aria-describedby`, `required`, `name`) is untouched, and `src/contact-form.js` is untouched, so validation, error messages, `aria-invalid`, the POST, and `form.reset()` behave exactly as before.

## The fallback

The base rules (`min-h-28 max-h-80 resize-y overflow-auto` plus `rows="4"`) apply everywhere. A browser without `field-sizing` ignores the whole `@supports` block and gets an ordinary four-row textarea: editable, scrollable with long text, manually resizable, bounded by the same min/max heights. No JavaScript polyfill is used because the brief explicitly allows older browsers to keep an ordinary textarea.

## Browser-support decision

Feature/subfeature: CSS `field-sizing: content` on `<textarea>`.
Project targets (README): current stable Chrome, Edge, Firefox, Safari, incl. iOS Safari and Android Chrome.

Sources checked on 2026-09-03:

- Can I use, `mdn-css_properties_field-sizing` (https://caniuse.com/mdn-css_properties_field-sizing): Chrome 123+, Edge 123+, Firefox 152+, Safari 26.2+, iOS Safari 26.2+, Android Chrome 151+ (current listing), Samsung Internet 27+. No partial-support or flag notes. Global usage 84.61%.
- MDN browser-compat-data, `css/properties/field-sizing.json` (https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/field-sizing.json): chrome 123, firefox 152, safari 26.2; chrome_android/edge/firefox_android/safari_ios/webview_android/samsunginternet_android mirror those; the `content` value subfeature is identical; no flags, no `partial_implementation`, no notes.
- Web Platform Status API (https://api.webstatus.dev/v1/features/field-sizing): Baseline status "newly", low_date 2026-06-16. Chrome 123 (2024-03-19), Edge 123 (2024-03-22), Firefox 152 (2026-06-16), Safari 26.2 (2025-12-12).
- MDN reference (https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing): Baseline "Newly available" since June 2026; with `field-sizing: content` the `rows` attribute has no effect; `min-height`/`max-height` bound the growth and the control scrolls once the max is reached. (The compat table itself did not render through the fetch tool; the raw compat-data file above was used instead.)
- Tailwind v4 docs: `field-sizing-content` emits `field-sizing: content` (https://tailwindcss.com/docs/field-sizing); `supports-[property:value]:` emits `@supports (property: value)` (https://tailwindcss.com/docs/hover-focus-and-other-states).
- CSS Forms Level 1 draft (https://drafts.csswg.org/css-forms-1/#field-sizing): `content` means the UA sizes from content and ignores the host language's default preferred size. The draft does not say what happens after a user drags the resize handle; the behaviour described below is what Chromium does, not a spec guarantee.

Conclusion: supported by every current stable target with no partial-support caveats; Baseline Newly available (not yet Widely available, since Firefox only shipped it in June 2026). That is why it is applied as a gated enhancement rather than relied on unconditionally, and why the base rules are complete on their own. `webstatus.dev`'s HTML page returned only its app shell to the fetch tool; the JSON API above was used instead.

## What was verified and how

Build: `pnpm run build` (Tailwind v4.3.3) succeeded. `dist/output.css` now contains `.min-h-28`, `.max-h-80`, `.resize-y`, `.overflow-auto` and `@supports (field-sizing:content) { .supports-\[field-sizing\:content\]\:field-sizing-content { field-sizing: content } }`. Before the change the built CSS had no `field-sizing` rule at all.

Browser: the project was served with `python -m http.server 8847 --bind 127.0.0.1` and opened in the in-app browser pane (Chromium 148, Windows, DPR 2) in a tab created for this task. Observed:

- Empty field: 112px tall, computed `field-sizing: content`, `min-height: 112px`, `max-height: 320px`, `resize: vertical`, `overflow-y: auto`, `CSS.supports('field-sizing','content') === true`.
- 7 short lines: grows to 186px (7 × 24 + 16 + 2), no scrollbar.
- 40 lines: stops at 320px (`max-h-80`), `scrollHeight` 976px, scrollbar visible, content scrollable to the end.
- Manual resize: dragging the corner handle set an inline `height: 266px`; the field stayed editable and focused while typing. After a manual resize Chromium keeps the user's height (with 40 lines it stayed at 266px and scrolled) rather than resuming auto-growth; this is browser behaviour, not something the CSS forces.
- Fallback simulation: after a reload, `field-sizing: fixed` was set inline to disable the enhancement. The field then measured 114px (the `rows="4"` height), stayed at 114px with 7 lines, was scrollable (`scrollTop` moved to 4791 with 40 lines), `resize: vertical`, `overflow-y: auto`, not disabled/read-only. This exercises the base rules in a modern engine; it does not prove behaviour in an actual older browser.
- Form logic (unchanged JS): submitting empty showed "Enter your name.", "Enter a valid email address.", "Enter a message.", set `aria-invalid="true"` on the textarea and focused the name field. Typing into the textarea via the keyboard cleared the message error and reset `aria-invalid` to "false". Filling all fields and submitting reached the `fetch('/api/messages')` call; the static server rejects POST, so the existing "Sorry, something went wrong. Please try again." status appeared and the button was re-enabled, with the typed message preserved. `form.reset()` (what the success path calls) shrank a 306px field back to 112px and emptied it.
- Mobile preset (375 × 812): empty field 112px; five long wrapped lines grew it to 258px without a scrollbar; 40 lines capped at 320px with a scrollbar; document `scrollWidth` stayed 375px (no horizontal overflow). Viewport emulation was reset to desktop afterwards.

## Not verified / caveats

- Firefox and Safari (desktop and iOS) were not available in this environment; their support is taken from the sources above, not observed. Real-device virtual keyboard behaviour on mobile was not tested.
- On the very first page load in the pane, one diagnostic read computed `min-height: 114px` / `max-height: 306px` and reported a probe `<div>` with `min-h-28` as `min-height: 0`. This did not recur on three subsequent loads of the same URL (all read 112px / 320px, and the emitted CSS is `calc(var(--spacing) * 28)` / `* 80` with `--spacing: 0.25rem`), so it is treated as a transient state of that first tab instance rather than a property of the page, but it is recorded here because it was not explained.
- The in-app pane did not deliver Ctrl+End / Enter keystrokes to the textarea, so multi-line text in the manual-resize test was inserted via the DOM rather than typed; single-line typing was real keyboard input.
