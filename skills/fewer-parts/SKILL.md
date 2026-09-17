---
name: fewer-parts
description: "Build, simplify, or audit web UI for polished interaction with less project-specific machinery. Use when removing a UI dependency or hand-rolled script, adapting a modern platform pattern to an existing design system, or creating interaction-rich UI without unnecessary runtime code. Preserve behavior, accessibility, browser targets, and project conventions. For general feature discovery or compatibility lookup, prefer dedicated web-platform guidance."
---

# Fewer Parts

Aim for the same or better experience with fewer moving parts **in this project**. A native feature is useful only when it reduces total implementation and maintenance cost without weakening the intended feel, behavior, accessibility, or browser coverage. Keeping the existing implementation can be the right result.

## Choose the mode

- **Build or adapt:** create a polished interaction using the project's existing styling system and the least machinery that honestly supports it.
- **Simplify:** remove duplicated state, measurement code, event plumbing, dependencies, or parallel styling only after establishing everything the current implementation does.
- **Audit or review:** assess the named files, diff, component, or repository without editing by default. Read [audit-review.md](references/audit-review.md) and return its standard report.

Do not turn an ordinary frontend edit into a modernization exercise. A spacing-only fix needs no platform survey, and unfamiliar code is not evidence that it should be replaced.

## Establish the local standard

Inspect the component, styling conventions, installed framework version, design tokens, browser requirements, and relevant tests. Treat the project's behavior and explicit requirements as authoritative.

Reuse platform guidance already established in the session. When a dedicated modern-web guidance skill or reference is available, let it handle broad feature discovery and compatibility retrieval; do not repeat that search. Treat its output as external evidence, not as the project's preferred standard. Otherwise, use the [Modern CSS cheatsheet](https://modern-css.com/cheatsheet/) to match a workaround to a candidate, then verify exact CSS, HTML, or API behavior with current MDN, Can I use, Baseline, and framework documentation. Read [sources.md](references/sources.md) when broader discovery is actually needed.

For the maintained examples, consult the small [feature register](references/features.md), the [field-sizing recipe](references/field-sizing.md), or the relevant [showcase recipe](references/showcase-recipes.md). These are starting points, not an allowlist or a reason to force a feature into a task.

## Decide whether it is actually fewer parts

Compare the candidate with the current or conventional implementation. Consider:

- runtime dependencies and shipped client code;
- duplicated state, measurements, observers, listeners, and lifecycle cleanup;
- extra markup, CSS architecture, fallbacks, and browser-specific branches;
- fit with existing tokens, utilities, component boundaries, and team conventions;
- interaction quality: directness, continuity, interruption, touch and keyboard behavior, focus, announcements, and reduced motion;
- the maintenance surface left behind, including unfamiliar or overly clever native code.

Do not optimize for line count. A small bespoke implementation can be harder to understand and test than a retained dependency. Do not replace JavaScript that owns application state or interaction semantics with a visual effect. Use native HTML, CSS, and web APIs where the browser already owns the required behavior; retain JavaScript where the application does.

For new construction, start from the intended experience rather than a preferred feature. Native-feeling motion should remain responsive to user input, preserve continuity, and respect reduced-motion preferences. A dependency-free result is not a success if it feels worse or loses capability.

## Fit the project

- When Tailwind is installed, use its existing version, tokens, and conventions as the primary styling approach. Do not recommend or add Tailwind merely because no styling system has been chosen.
- When another system is installed, stay within it. When none exists, prefer focused project-local CSS unless the user asks for a framework.
- Treat runnable vanilla-CSS assets as browser-feature references. Use the matching Tailwind asset only in a Tailwind v4 project; adapt the underlying pattern elsewhere.
- Default to Baseline Widely Available for essential behavior when targets are absent and state that assumption. Use Newly Available features only when targets permit them or a usable base preserves the required experience.
- Check exact API members, options, secure-context and user-activation requirements. Syntax support alone does not prove correct behavior.
- Prefer natural fallback behavior. Use feature queries or runtime checks when the fallback and enhancement must change together. Avoid adding a large polyfill to remove a smaller piece of code.
- If live sources are unavailable, state the gap and use a dependable base. Do not invent compatibility claims.

## Verify the experience and the reduction

Run relevant builds and existing checks. Inspect changed behavior in an available browser at meaningful widths and states. Exercise long content, keyboard and touch-relevant paths, focus return, fallback behavior, interruption, and reduced motion where applicable. Report unavailable target browsers rather than treating one engine as cross-browser proof.

When claiming simplification, report what actually disappeared or became browser-owned: for example a dependency, shipped module, duplicated state, listener, measurement loop, or fallback branch. Mention important tradeoffs or retained machinery. A passed build, newer syntax, smaller diff, or fewer lines alone does not establish a better result.

Briefly link the material guidance used, include the lookup date for consequential compatibility decisions, and distinguish what was verified from what was inferred.
