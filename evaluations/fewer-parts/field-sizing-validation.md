# Field-sizing recipe validation

Checked 2026-09-14 using [the browser check](../../tests/fewer-parts/field-sizing.cjs) against [the distributable demo](../../skills/fewer-parts/assets/field-sizing.html).

Chrome 152.0.7977.84 reported native field-sizing support. Passed:

- Growth with long content and shrinking after replacement with short content.
- Clearing the field and overflowing content within the maximum height.
- Forced fallback keeping its height while remaining editable and scrollable to the end.
- A 375px viewport with long unbroken content and no page-level horizontal overflow.
- Keyboard movement from the textarea to the next button.
- Displayed CSS matching the actual component stylesheet, with no browser script errors.
- Editing with JavaScript disabled.

The desktop preview was also captured for visual inspection. The fallback switch tests the base CSS path in a current engine, not actual old-browser compatibility. Safari and Firefox were not tested; keyboard navigation is not a complete assistive-technology audit. Native support was checked against current MDN documentation; this single-engine run does not establish cross-browser behavior.

The bundled skill validator and repository packaging checks passed. These checks do not establish an improvement in model output; a new with/without-skill evaluation remains separate.
