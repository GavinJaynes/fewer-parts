# Audit and review

Use this workflow when the user asks to **audit** or **review** a web UI. The two terms are synonymous. Assess the requested target without editing source files unless the user separately asks for fixes.

## Establish scope and coverage

Honor an explicit file, component, route, package, or diff scope. Otherwise review the current repository's UI surface. Identify the framework and versions, styling system, design tokens, component conventions, declared browser targets, and relevant tests before judging individual patterns.

For a large repository, inspect a representative cross-section instead of implying exhaustive coverage. Include shared styles and configuration, foundational components, forms or interactive controls, and at least one responsive page or composed view when available. Record what was inspected and what was not. Run existing non-destructive checks only when they would materially improve the assessment.

Look for concrete opportunities involving:

- runtime dependencies, shipped client code, duplicated state, measurement, observers, listeners, and cleanup that may no longer be necessary;
- layout and responsive resilience, including container-aware behavior and long content;
- styling architecture, token reuse, duplication, specificity, and fit with the installed styling system;
- native HTML, CSS, or web APIs that can replace workarounds without losing application behavior or intended feel;
- semantics, keyboard interaction, focus, announcements, contrast, reduced motion, and fallback states;
- browser compatibility and progressive enhancement against declared targets, or Baseline Widely Available when targets are absent, which is itself worth reporting where tooling already reads those targets;
- consistency and maintainability across the inspected UI surface.

Do not recommend novelty or change for its own sake. Record when apparently removable machinery still owns required behavior and should stay. Validate each proposed feature against live sources and the project's actual constraints. Omit speculative findings that lack repository evidence.

## Score the inspected UI

Score each applicable dimension from 0 to 5:

| Score | Meaning |
| --- | --- |
| 0 | Missing or fundamentally unsuitable in the inspected scope |
| 1 | Major systemic gaps or fragile behavior |
| 2 | Several important gaps; simplification would materially help |
| 3 | Sound overall, with a mix of proportionate and avoidable machinery |
| 4 | Strong implementation with only focused improvements needed |
| 5 | Exemplary for the stated constraints; no meaningful issue found |

Use these dimensions when applicable: interaction quality; project and styling-system fit; runtime and dependency economy; accessibility and semantics; compatibility and fallbacks; consistency and maintainability. Mark unavailable dimensions `N/A`; never convert them to zero.

Report an overall score only when coverage is broad enough to support it. Calculate the unweighted mean of applicable dimension scores and round to one decimal. Label it **Fewer Parts score**, not a general code-quality, accessibility-conformance, performance, or security score. A high score means the inspected UI delivers its intended experience with proportionate, project-appropriate machinery; it does not reward using the newest feature. Pair it with coverage confidence:

- **High:** the relevant surface is small or most representative UI paths and configuration were inspected.
- **Medium:** representative paths were inspected, but meaningful areas remain unseen.
- **Low:** the assessment is narrow, sampled lightly, or constrained by missing build/runtime context.

Scores summarize evidence; they are not substitutes for findings. If the scope is a small diff or component, prefer dimension scores without an overall repository score.

## Rank findings

Order findings by practical value and user risk. For each finding, include:

- a short identifier and title;
- repository evidence with file and line when available;
- why it matters in this project;
- the recommended direction, preserving existing behavior and design;
- the concrete reduction expected, such as a dependency, shipped module, duplicated state, listener, measurement loop, or fallback branch; use **none** when the value is improved behavior rather than removal;
- **impact** from 1 (minor) to 5 (major);
- **effort** as S, M, or L;
- **compatibility risk** as Low, Medium, or High;
- **confidence** as Low, Medium, or High;
- a live source link and lookup date when the recommendation depends on browser or framework support.

Do not derive a single mathematical priority number from these fields or use raw line count as the measure of success. Use judgment to group findings as **Now**, **Next**, or **Later**. Include strengths and justified machinery worth preserving so the report does not encourage unnecessary rewrites.

Make repository evidence clickable when the host supports local file links. In Codex on Windows, use an absolute Markdown target with a leading slash and an optional one-based line number.

Correct:

```markdown
[Nav.tsx](/C:/projects/app/src/components/Nav.tsx:39)
```

Incorrect:

```markdown
[Nav.tsx](C:/projects/app/src/components/Nav.tsx:39)
```

Wrap a target containing spaces in angle brackets.

## Standard report

Use this order, omitting empty sections:

1. **Summary** — scope, overall Fewer Parts score when justified, coverage confidence, and the most important conclusion.
2. **Coverage** — inspected areas, checks run, browser-target assumption, and material exclusions.
3. **Scorecard** — applicable dimension, 0–5 score, and one-sentence evidence-based rationale.
4. **Findings** — Now, Next, and Later recommendations with the fields above.
5. **Strengths and machinery to preserve** — project-appropriate patterns and necessary code that should remain.
6. **Verification gaps** — unavailable browsers, runtime states, routes, or evidence that limit confidence.

Keep the report proportionate. A narrow review may need only a short summary, a small scorecard, and a few findings; a repository audit may justify the complete structure.
