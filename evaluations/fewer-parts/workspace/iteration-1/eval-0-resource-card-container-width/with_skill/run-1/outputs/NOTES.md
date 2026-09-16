# Resource card - implementation notes

## What was implemented and why

Changed file: `project/index.html` only (plus the rebuilt `project/dist/output.css`, which is gitignored build output). No changes to `src/input.css`, no new tokens, no JavaScript, no new dependencies.

Each column now holds a `<ul class="space-y-4">` of cards. One card:

```html
<li class="@container">
  <article class="grid gap-3 rounded-lg border border-paper-100 bg-white p-4 @md:grid-cols-[minmax(0,1fr)_auto] @md:gap-x-6">
    <div class="min-w-0 space-y-1">
      <h3 id="pinned-style-title" class="font-semibold text-balance wrap-anywhere">Style guide</h3>
      <p class="text-sm text-ink-700 text-pretty wrap-anywhere">...</p>
    </div>
    <a href="..." class="justify-self-start self-start rounded border border-ink-500/40 bg-white px-3 py-1.5 text-sm font-medium text-accent-600 hover:bg-paper-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
       aria-describedby="pinned-style-title">Open resource</a>
  </article>
</li>
```

Decisions:

- **Container query instead of viewport breakpoints.** The same card lives in a 300px sidebar and a 720px main column on the same page, so a viewport breakpoint cannot pick the right layout. The `<li>` is the `@container` (an element cannot size-query itself); the card stacks by default and switches to `text | link` columns at `@md` (container width >= 28rem / 448px). Result: sidebar cards stack, main-column cards go side by side, and below the `lg` page breakpoint (where both columns are full width) all cards use whichever layout their actual width allows. Stacked is the base layout, so an engine without container queries would still get a usable card.
- **Long unbroken URLs and titles.** `wrap-anywhere` (`overflow-wrap: anywhere`) on both the heading and the description, plus `min-w-0` on the text cell and `minmax(0,1fr)` for the grid track. `anywhere` rather than `break-word` because it is counted in min-content sizing, which is what stops a long URL from widening the grid track/card. Verified in the browser: no card, paragraph, or page has `scrollWidth > clientWidth` at 375, 768 or 1280px.
- **Typography enhancements that degrade harmlessly.** `text-balance` on titles and `text-pretty` on descriptions. Unsupported browsers simply use normal wrapping (the declaration is dropped). Firefox does not support `pretty` (see support table) - that is acceptable because nothing depends on it.
- **Quiet visual design using existing tokens only.** White card on `paper-50`, `paper-100` border, `ink-700` description, `accent-600` link. The link is a small bordered pill so it has a real touch target (34px tall at mobile) and aligns with the card padding in both layouts; hover just tints the background. Focus uses the project's existing `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600` convention from `contact.html`.
- **Semantics.** Cards are `<article>` items in a `<ul>`. Heading level follows the column: `<h3>` under the sidebar's `<h2>Pinned</h2>`, `<h2>` under the main column's `<h1>Recently added</h1>`. Because every link reads "Open resource", each link carries `aria-describedby` pointing at its card title so screen-reader users hear which resource it opens (verified `describedText` resolves to the title).
- **Sample content.** Two cards per column. Sidebar card 2 has a long title and a long unbroken spreadsheet URL; main card 1 has a long tracking-parameter URL. Both are `example.com` hosts.

## What was verified and how

Build: `pnpm run build` (Tailwind v4.3.3) succeeded; `dist/output.css` contains `.\@container`, `.wrap-anywhere`, `.text-balance`, `.text-pretty` and the `@container (width >= 28rem)` block for the `@md:` utilities.

Browser (Chromium-based in-app browser pane, served with `python -m http.server 8873`; port 8847 was first tried but was shared with other tasks' servers, so a curl check of `Content-Length` was used to confirm the served page was this project's before viewing):

- 1280x900: `lg` grid active. Sidebar cards 298px wide, single column (`grid-template-columns: 266px`); main cards 718px wide, two columns (`543px 119px`). No horizontal overflow on any card, paragraph, or the document. Screenshot reviewed.
- 375x812 (mobile emulation): all cards 325px, stacked; long URLs wrap mid-string inside the card; no document overflow; link height 34px. Screenshot reviewed.
- 768x1024 (tablet): both columns full width, all four cards 718px and two-column - confirming the layout follows the container, not the viewport.
- Keyboard: Tab reaches "Open resource"; computed outline is `solid 2px oklch(0.5 0.14 250)` offset 2px, visible in screenshot. `aria-describedby` resolves to the card title.
- Contrast (computed from the OKLCH tokens via OKLab -> linear sRGB, WCAG 2 formula): `accent-600` on white 6.0:1 (5.8:1 on paper-50), `ink-700` on white 8.5:1, `ink-950` on white 18:1. All above 4.5:1.
- Viewport emulation was reset to desktop afterwards.

Not verified: Firefox and Safari (desktop and iOS) were not available in this environment; behaviour there rests on the support data below. Reduced-motion and dark theme are not applicable (no animation, project has no dark theme).

## Browser-support claims (looked up 2026-09-03)

Targets from README: current stable Chrome, Edge, Firefox, Safari, iOS Safari, Android Chrome.

| Feature | Chrome/Edge | Firefox | Safari / iOS | Source | Role |
| --- | --- | --- | --- | --- | --- |
| Size container queries (`@container`, `@md:`) | 106 | 110 | 16.0 | https://caniuse.com/css-container-queries ; MDN lists Baseline Widely available since Feb 2023 (https://developer.mozilla.org/en-US/docs/Web/CSS/@container) | Used directly; stacked base layout if absent |
| `overflow-wrap: anywhere` (`wrap-anywhere`) | 80 | 65 | 15.4 | https://caniuse.com/mdn-css_properties_overflow-wrap_anywhere | Used directly |
| `text-wrap: balance` (`text-balance`) | 114 partial, 130 full | 121 | 17.5 | https://caniuse.com/css-text-wrap-balance ; MDN: Baseline Newly available Mar 2024, balance limited to ~6 lines Chromium / 10 Firefox | Optional; ignored if unsupported |
| `text-wrap: pretty` (`text-pretty`) | 117 | not supported | 26.0 | https://caniuse.com/mdn-css_properties_text-wrap_pretty | Optional; ignored if unsupported |
| Tailwind `wrap-anywhere`, `@container`, `@md` (28rem) | n/a | n/a | n/a | https://tailwindcss.com/docs/overflow-wrap ; https://tailwindcss.com/docs/responsive-design | Present in installed v4.3.3 (confirmed in built CSS) |

`border-ink-500/40` compiles to `color-mix(in oklab, ...)`, the same construct the existing contact form already uses, so no new support surface was introduced.
