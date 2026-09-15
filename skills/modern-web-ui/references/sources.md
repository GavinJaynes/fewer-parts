# Live sources

Use the live resources below as needed; fetch relevant entries rather than loading every source on each task.

| Need | Upstream resource |
| --- | --- |
| Match an old workaround to a native candidate | [Cheatsheet](https://modern-css.com/cheatsheet/) and its Details links |
| Search topics and page links | [llms.txt](https://modern-css.com/llms.txt) |
| Search several related examples in one export | [llms-full.txt](https://modern-css.com/llms-full.txt) |
| Read upstream pattern guidance | [AGENTS.md](https://modern-css.com/AGENTS.md) |
| Generate project rules or reuse a task prompt | [AI tools](https://modern-css.com/ai/), [rules generator](https://modern-css.com/ai/css-rules/), [prompt library](https://modern-css.com/ai/prompts/) |
| Find current snippets, combined examples, or detailed syntax | [Homepage](https://modern-css.com/), [articles](https://modern-css.com/articles/), [blocks](https://modern-css.com/blocks/), [CSS reference](https://modern-css.com/reference/) |
| Find utilities and recent additions | [Tools](https://modern-css.com/tools/), [what's new](https://modern-css.com/whats-new/), [resources](https://modern-css.com/resources/) |
| Locate material missing from an export | [Sitemap index](https://modern-css.com/sitemap-index.xml) and its listed sitemaps, or a search restricted to modern-css.com |

The exports and cheatsheet can lag behind the live collection. If a relevant topic is absent, follow the site indexes or search, then open the actual page. The full-text export is not a complete copy of every article, block, tool, or reference page. Keep source URLs and distinguish discovered pages from content actually read.

Detailed entries may include Tailwind examples and version notes. Check these before deriving your own mapping, then verify the installed compiler and required browsers. Keep the existing styling approach and interaction requirements even when an upstream prompt suggests framework removal or eliminating JavaScript.

## Native HTML, APIs, and feature discovery

Use [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) for API behavior and exact member compatibility, and [MDN HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) for native elements. Look up the actual options used rather than assuming all additions to an established API share its support.

[Web Platform Status](https://webstatus.dev/) and [Baseline](https://web.dev/baseline) provide interoperability status. The [web-features dataset](https://github.com/web-platform-dx/web-features) supplies machine-readable feature IDs and statuses if automated reporting becomes necessary. Missing status means unknown; it does not mean widely supported. Redirected or split feature IDs require resolving the intended feature.

Use the [web.dev blog](https://web.dev/blog) Baseline digests and [Modern CSS updates](https://modern-css.com/whats-new/) for discovery. Confirm candidates against live feature documentation before adoption. [Baseline Alerts](https://web.dev/blog/baseline-alerts) already supports monthly RSS/email subscriptions, including regressions. The [feature register](features.md) records our selected candidates; it is not a mirror of those sources.
