# Modern Web UI evaluation briefs

These briefs evaluate the skill's decisions on realistic UI tasks. They are not instructions loaded by the skill. The first-draft checks and their limits are recorded separately in `modern-web-ui-validation.md`.

## How to compare

For a future comparison, give fresh agent runs the same starting files, model settings, tools, browser targets, and brief. Enable this skill in one run and omit it in the other. Do not expose the reviewer criteria below to either run. Keep generated work isolated. Judge outcomes rather than the number of modern properties used. One pair is illustrative; repeat before claiming consistent improvement.

## Brief 1: Reusable resource card

> Build a resource card for a Tailwind v4 application. The same component appears in a 300px sidebar and a 720px main column, sometimes on the same page. It has a title, description, and an Open resource link. Content comes from users and can include long URLs and titles. Keep the design quiet and readable. Target current stable Chrome, Edge, Firefox, and Safari, including mobile. Use no new runtime dependencies.

Reviewer criteria:

- Responds to available component width, including a narrow sidebar on a wide screen.
- Retains sensible semantic structure, keyboard access, and reading order.
- Long content remains reachable without page overflow.
- Tailwind is the primary styling approach; any extension has a clear purpose.
- Support claims are current and specific. No JavaScript layout measurement without a demonstrated need.

## Brief 2: Message form

> Build a labeled message textarea in an existing Tailwind v4 form. It should grow with its content up to a comfortable limit, remain editable and scrollable with long messages, and permit manual resizing. Older browsers may keep an ordinary textarea. Preserve the existing form's submission logic and error messages. Explain the implementation and the fallback briefly.

Reviewer criteria:

- Considers native content sizing and checks relevant support.
- Keeps an ordinary usable textarea in the base experience.
- Tests empty, short, long, and deleted content; bounds do not prevent the intended growth.
- Preserves labels, descriptions, validation timing, and application logic.
- Does not equate CSS validation styling with accessible error reporting.

## Brief 3: Interactive confirmation panel

> Add an archive-confirmation modal to a Tailwind v4 app. Users open it with Archive item, can cancel or press Escape, and return to the opener afterward. Confirmation invokes the supplied `archiveItem()` action once. Target current stable Chrome, Edge, Firefox, and Safari. Keep motion optional and avoid adding a dependency unless needed for the interaction.

Reviewer criteria:

- Chooses a modal mechanism that meets the behavior; assesses native dialog before rebuilding it.
- Uses a real accessible name and appropriate initial focus. Tests keyboard dismissal and restoration.
- Separates closing the panel from performing the archive action; cancel and Escape never archive.
- Uses Tailwind for appearance and JavaScript where behavior needs it.
- Optional animation never blocks visibility or completion of the action.

## Boundary checks

Use these follow-ups to expose scope or compatibility mistakes:

- **Version constraint:** the repository uses Tailwind v3. Adapt using its existing conventions; do not insert v4 directives or upgrade automatically.
- **Browser constraint:** the repository must support Safari 15.6. Check both the framework and proposed feature requirements before implementation; a utility class is not evidence of browser support.
- **No network:** preserve essential behavior and label any support assumption that cannot be verified.
- **Small edit:** change only a card's spacing. Do not redesign the component, survey every release, or add a library.
- **Custom behavior:** the existing carousel includes focus management, keyboard controls, and announcements. Do not remove these when considering scroll snap.

## Scoring

Score each dimension from 0 (fails), through 1 (partly meets), to 2 (meets): required behavior, native-feature fit, Tailwind integration, support/fallback reasoning, accessibility, maintainability, and verification evidence. A functional or accessibility regression cannot be offset by a higher feature count. Record concrete observations and limitations rather than a single unqualified total.

## Results: iteration 1 (3 September 2026)

Pilot comparison, one run per configuration, Claude Fable 5.1 subagents with identical prompts, tools, and a shared starter project (`workspace/starter`, Tailwind 4.3.3). Runs, transcripts, grading, and the review page are under `workspace/iteration-1/`; the eval prompts and assertions are in `evals.json`.

| Eval | With skill | Without skill |
| --- | --- | --- |
| Resource card (Brief 1) | 9/9 assertions, 96k tokens, 335s | 9/9 assertions, 94k tokens, 463s |
| Message textarea (Brief 2) | 9/9 assertions, 105k tokens, 470s | 8/9 assertions, 69k tokens, 241s |

Observations:

- The baseline reached the same native choices unprompted: container queries with `@md:` variants and `overflow-wrap: anywhere` for the card; `field-sizing: content` with min/max bounds and `resize-y` for the textarea. Both configurations cited MDN and Can I use with matching version data.
- The one failed baseline assertion was a verification-reporting gap (no explicit deleted-content check), not an implementation defect.
- Skill-attributable differences: reading the references first, the `supports-[field-sizing:content]:` gate (redundant, as the baseline noted), `@container` on a wrapper element, and keyboard-focus and contrast checks on the card. Baseline-only touches: `lh`-based height bounds matching `rows="4"` exactly, `hyphens-auto`, `max-w-prose`.
- These two briefs do not discriminate on this model. The boundary checks above (Tailwind v3, Safari 15.6, no network, small edit, custom carousel) are the better next test.
- Harness note: concurrent runs shared port 8847 and one run briefly observed another run's page. Assign distinct ports per run in future iterations.

## Concrete next cases from the cheatsheet (12 September 2026)

The [live cheatsheet](https://modern-css.com/cheatsheet/) provides discovery cues for these proposed cases. These are not completed evaluations or runnable fixtures. Prepare identical starting projects and compare no skill, the upstream agent reference alone, and the local live-source skill. Give implementing agents the user brief and starting project; keep the candidate technique and reviewer checks private so the prompt does not supply the answer.

| User brief / starting problem | Candidate to investigate | Observable reviewer checks |
| --- | --- | --- |
| A profile row works in English but its avatar spacing and leading border are wrong in Arabic. Support both directions without separate copies of the component. | [Logical properties](https://modern-css.com/direction-aware-layouts-without-left-and-right/) | Switch `dir` on the container; spacing and border follow reading direction. Long names fit. DOM and keyboard order remain appropriate. |
| A comparison panel repeats its column widths in each nested group. Changing the outer column sizing leaves inner rows misaligned. Keep each group in its semantic wrapper. | [Subgrid](https://modern-css.com/aligning-nested-grids-without-duplicating-tracks/) | Change the parent's tracks once; nested cells remain aligned. Long content stays reachable at narrow widths. No JavaScript layout measurement. |
| A video preview uses a zero-height wrapper and percentage padding. Simplify the sizing while preserving its overlay play button and responsive proportions. | [Aspect ratio](https://modern-css.com/aspect-ratios-without-the-padding-hack/) | Resize the container; the requested ratio, cropping, and overlay alignment hold. Keyboard access to the play control survives. |
| An existing layered stylesheet has accumulated specificity overrides. Make the designated component override win consistently without changing unrelated controls. | [Cascade layers](https://modern-css.com/controlling-specificity-without-important/) | Inspect computed styles in normal, hover, focus, and disabled states. Check unlayered rules and existing layer order; avoid a global architecture rewrite. |
| Simplify a gallery while retaining its previous/next controls, keyboard operation, position announcement, and links inside slides. | [Scroll snapping](https://modern-css.com/scroll-snapping-without-a-carousel-library/) | All original interactions and announcements still work. Oversized content stays reachable. Retaining necessary JavaScript is a valid result. |

Record the native choice separately from correctness and cost. Include at least one required browser older than the candidate feature in a separate run, using a framework that supports that target. A modern property earns no functional credit when required behavior fails; a justified decision to retain the existing implementation may be the better outcome.
