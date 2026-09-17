# Fewer Parts evaluation briefs

These briefs evaluate the skill's decisions on realistic UI tasks. They are not instructions loaded by the skill. The first-draft checks and their limits are recorded separately in `fewer-parts-validation.md`.

## How to compare

For a future comparison, give fresh agent runs the same starting files, model settings, tools, browser targets, and brief. Enable this skill in one run and omit it in the other. Do not expose the reviewer criteria below to either run. Keep generated work isolated. Judge outcomes rather than the number of modern properties used. One pair is illustrative; repeat before claiming consistent improvement.

## Current suite: reduction, restraint, and construction

The runnable prompts and assertions are in `evals.json`; the shared starting project is `workspace/starter`. The suite deliberately avoids asking for a named feature so it tests the decision rather than recall.

### Remove a legacy textarea autosizer

The starter includes `scrollHeight` measurement plus input and resize listeners alongside unrelated form validation. A successful run removes only the sizing machinery, preserves the application behavior, supplies a usable base, and reports what actually disappeared.

### Replace a hand-rolled confirmation modal

The starter manually manages visibility, scroll locking, focus containment, Escape, outside dismissal, and focus return. A successful run moves browser-owned modality to the platform while preserving every product path, the existing visual language, and the single archive action.

### Exercise restraint on a carousel

The starter already uses scroll snap for physical movement, while JavaScript owns controls, keyboard input, state synchronization, and announcements. A successful run keeps necessary application behavior. A justified no-change result can receive full credit; deleting JavaScript merely because scroll snap exists cannot.

### Construct a polished disclosure

The starter needs a small disclosure that works without JavaScript and feels deliberate when enhanced. A successful run uses native semantics, project tokens, interruptible CSS motion where supported, reduced-motion handling, and an honest fallback without adding a dependency.

## Boundary checks

Use these follow-ups to expose scope or compatibility mistakes:

- **No styling system:** use focused project-local CSS; do not introduce Tailwind as the default.
- **Version constraint:** when a repository uses Tailwind v3, adapt using its existing conventions; do not insert v4 directives or upgrade automatically.
- **Browser constraint:** the repository must support Safari 15.6. Check both the framework and proposed feature requirements before implementation; a utility class is not evidence of browser support.
- **No network:** preserve essential behavior and label any support assumption that cannot be verified.
- **Small edit:** change only a card's spacing. Do not redesign the component, survey every release, or add a library.
- **Custom behavior:** the existing carousel includes focus management, keyboard controls, and announcements. Do not remove these when considering scroll snap.

## Scoring

Treat required behavior, accessibility, browser compatibility, and intended feel as gates. A regression in any gate cannot be offset by a higher feature count or a smaller diff. Then score project fit, removed or retained machinery, maintainability, source use, and verification evidence from 0 (fails), through 1 (partly meets), to 2 (meets). Raw line count is not a dimension. Record concrete observations and limitations rather than a single unqualified total.

## Results: iteration 1 (3 September 2026)

Pilot comparison, one run per configuration, Claude Fable 5.1 subagents with identical prompts, tools, and a shared Tailwind 4.3.3 starter. Runs, transcripts, grading, and the review page are under `workspace/iteration-1/`. These historical runs used the original resource-card and add-autosizing prompts recorded in their transcripts; `evals.json` now holds the replacement suite above.

| Eval | With skill | Without skill |
| --- | --- | --- |
| Resource card (Brief 1) | 9/9 assertions, 96k tokens, 335s | 9/9 assertions, 94k tokens, 463s |
| Message textarea (Brief 2) | 9/9 assertions, 105k tokens, 470s | 8/9 assertions, 69k tokens, 241s |

Observations:

- The baseline reached the same native choices unprompted: container queries with `@md:` variants and `overflow-wrap: anywhere` for the card; `field-sizing: content` with min/max bounds and `resize-y` for the textarea. Both configurations cited MDN and Can I use with matching version data.
- The one failed baseline assertion was a verification-reporting gap (no explicit deleted-content check), not an implementation defect.
- Skill-attributable differences: reading the references first, the `supports-[field-sizing:content]:` gate (redundant, as the baseline noted), `@container` on a wrapper element, and keyboard-focus and contrast checks on the card. Baseline-only touches: `lh`-based height bounds matching `rows="4"` exactly, `hyphens-auto`, `max-w-prose`.
- These two briefs do not discriminate on this model. That result motivated the current reduction, restraint, and construction suite.
- Harness note: concurrent runs shared port 8847 and one run briefly observed another run's page. Assign distinct ports per run in future iterations.

## Earlier candidate cases from the cheatsheet (12 September 2026)

The [live cheatsheet](https://modern-css.com/cheatsheet/) provides discovery cues for these proposed cases. These are not completed evaluations or runnable fixtures. Prepare identical starting projects and compare no skill, the upstream agent reference alone, and the local live-source skill. Give implementing agents the user brief and starting project; keep the candidate technique and reviewer checks private so the prompt does not supply the answer.

| User brief / starting problem | Candidate to investigate | Observable reviewer checks |
| --- | --- | --- |
| A profile row works in English but its avatar spacing and leading border are wrong in Arabic. Support both directions without separate copies of the component. | [Logical properties](https://modern-css.com/direction-aware-layouts-without-left-and-right/) | Switch `dir` on the container; spacing and border follow reading direction. Long names fit. DOM and keyboard order remain appropriate. |
| A comparison panel repeats its column widths in each nested group. Changing the outer column sizing leaves inner rows misaligned. Keep each group in its semantic wrapper. | [Subgrid](https://modern-css.com/aligning-nested-grids-without-duplicating-tracks/) | Change the parent's tracks once; nested cells remain aligned. Long content stays reachable at narrow widths. No JavaScript layout measurement. |
| A video preview uses a zero-height wrapper and percentage padding. Simplify the sizing while preserving its overlay play button and responsive proportions. | [Aspect ratio](https://modern-css.com/aspect-ratios-without-the-padding-hack/) | Resize the container; the requested ratio, cropping, and overlay alignment hold. Keyboard access to the play control survives. |
| An existing layered stylesheet has accumulated specificity overrides. Make the designated component override win consistently without changing unrelated controls. | [Cascade layers](https://modern-css.com/controlling-specificity-without-important/) | Inspect computed styles in normal, hover, focus, and disabled states. Check unlayered rules and existing layer order; avoid a global architecture rewrite. |
| Simplify a gallery while retaining its previous/next controls, keyboard operation, position announcement, and links inside slides. | [Scroll snapping](https://modern-css.com/scroll-snapping-without-a-carousel-library/) | All original interactions and announcements still work. Oversized content stays reachable. Retaining necessary JavaScript is a valid result. |

Record the native choice separately from correctness and cost. Include at least one required browser older than the candidate feature in a separate run, using a framework that supports that target. A modern property earns no functional credit when required behavior fails; a justified decision to retain the existing implementation may be the better outcome.
