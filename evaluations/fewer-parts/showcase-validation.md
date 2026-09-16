# Astro showcase validation

2026-09-14: Astro 7.3.2 static build passed using Node 24.19.0. The website reads five HTML recipes from the skill assets and serves the generated skill ZIP through a static download endpoint. The site needs no server runtime in production. The interaction suite passed against both the development server and the production output served by a plain static HTTP server.

Chrome 152.0.7977.84 passed the [showcase checks](../../tests/fewer-parts/showcase.cjs):

- Textarea native growth/deletion and forced fallback.
- Container width changing the card's column layout.
- Native radio selection driving parent styling.
- Modal opening, Escape dismissal, and return focus.
- Valid/invalid URL parsing and the branch with URL.canParse unavailable.
- Displayed source matching the skill asset and copying successfully, allowing OS line-ending normalization.
- Prompt copying and a download matching the packaged ZIP byte for byte.
- No page errors or horizontal page overflow at a 390px viewport.

Desktop and mobile previews were captured for visual review. The demo iframes are sandboxed with scripts permitted but without same-origin access. Modal behavior is intentionally scoped to its preview frame. Examples retain browser-native controls and visible keyboard focus.

No Safari/Firefox run, screen-reader audit, or renewed agent-output comparison was performed. Browser tests are manual; CI runs packaging and the Astro build. Nothing here establishes a measured improvement in generated CSS.
