# Feature register

This shortlist routes common UI needs to live sources. Status observations below were checked on 2026-09-14; they are not permanent compatibility guarantees. Recheck the exact property, method, or option before a consequential adoption decision. “Candidate” means an idea with no maintained runnable recipe yet.

| Feature and source | Useful outcome | Observed Baseline | Inclusion |
| --- | --- | --- | --- |
| [field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing) | Grow and shrink a textarea without measuring it in JavaScript | Newly Available, June 2026 | [Recipe and runnable demo](field-sizing.md); enhancement with usable fallback |
| [Size container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) | Adapt a card to its container | Widely Available for size queries | [Runnable recipe](showcase-recipes.md); compact layout is the base |
| [:has()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has) | Style a form group or card from child state | Widely Available, per June digest | [Runnable recipe](showcase-recipes.md); preserve native radio state |
| [:dir()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:dir) | Adapt directional details to inherited text direction | Widely Available, per June digest | Candidate; pair with logical properties |
| [URL.canParse()](https://developer.mozilla.org/en-US/docs/Web/API/URL/canParse_static) | Check URL parsing before construction | Widely Available, per June digest | [Runnable recipe](showcase-recipes.md); parsing alone does not validate allowed protocols or destinations |
| [iframe loading](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#loading) | Defer optional offscreen embeds | Widely Available, per June digest | Candidate; eager-load essential visible content |
| [showModal()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) | Native modal dialog behavior | Widely Available | [Runnable recipe](showcase-recipes.md); verify focus, naming, dismissal, and return focus |
| [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) | Cancel obsolete searches or disposed work | Widely Available | Candidate; preserve stale-result protection and error handling |
| [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) | React to visibility without repeated scroll measurements | Widely Available for core API | Candidate; disconnect observers when no longer needed |
| [Element.animate()](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) | Control animation playback | Widely Available for core method | Candidate; check options separately and respect reduced motion |

Discovery source: [June 2026 Baseline digest](https://web.dev/blog/baseline-digest-jun-2026). The register deliberately records discovery provenance where a digest supplied the status; candidate pages still need implementation review. Specialised canvas/media features remain available through live search until a concrete UI use case warrants a recipe.

## Adoption decisions

- Prefer Widely Available features for essential behavior, subject to actual browser targets.
- Include Newly Available features when targets permit them or a usable base remains. If identical behavior is required in older browsers, preserve the existing implementation or provide a tested fallback.
- Keep limited, unknown, or regressed features as research candidates unless the task explicitly supports a narrower audience or optional enhancement.
- A recipe is ready when its benefit, exact syntax/API members, browser assumptions, fallback, and relevant accessibility/failure behavior are documented and exercised. A newer keyword alone earns no preference.
