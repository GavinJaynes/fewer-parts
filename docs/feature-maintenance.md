# Keeping Fewer Parts current

The installed skill does a focused live lookup for the current task. Repository maintenance discovers useful additions and keeps the dated [feature register](../skills/fewer-parts/references/features.md) and runnable recipes current. Neither requires mirroring a documentation site or an MCP server.

## Monthly discovery

Use [Baseline Alerts](https://web.dev/blog/baseline-alerts) rather than building a subscription service. In [Web Platform Status](https://webstatus.dev/), sign in with GitHub, save CSS and HTML searches, and subscribe monthly to Newly Available, Widely Available, and regression changes. Add selected API features or a broader saved search as the catalog grows. Choose email or its custom RSS feed. Account subscriptions are separate from installing this repository and are not configured by its code.

Read new [Baseline digests](https://web.dev/blog) and [Modern CSS updates](https://modern-css.com/whats-new/). Compare discoveries with the register and inspect existing recipes for changed support or caveats. Record only actionable additions, regressions, or decisions; avoid no-change churn.

For machine-readable comparisons, reuse the published [web-features dataset](https://github.com/web-platform-dx/web-features). Record the dataset version and lookup date, resolve moved/split IDs, and distinguish missing status from unsupported status. A status change is a review signal, not permission to rewrite a recipe automatically. The basic version uses live lookup and existing alerts rather than adding a data-fetching runtime dependency.

## Promote a candidate

1. Name the user-visible problem and concrete benefit. Inspect exact MDN members/options and project/browser constraints; investigate conflicting sources rather than selecting the most optimistic status.
2. Add or update the register's source, observation date, adoption decision, and recipe link. When dates differ, record the date in the row; do not renew the whole table's date without checking all entries.
3. Write an original runnable example under the skill's `assets/` and a short reference explaining the important decisions. Keep the component implementation in the asset as the single source for the preview and agent. Link it from the recipe and register.
4. Exercise relevant behavior, fallback, accessibility, and browser targets. Record engines/versions and limitations. For a support regression, revisit existing recipes and required fallbacks before adding new features.
5. Run repository validation and packaging. Publish updated skill files through the normal repository release process; installed copies do not update automatically.

Current examples: [field-sizing](../skills/fewer-parts/references/field-sizing.md) and four [showcase recipes](../skills/fewer-parts/references/showcase-recipes.md). Entries marked candidate remain ideas rather than completed implementations. The Astro gallery reads the assets directly; when support changes, update its dated labels in `website/src/lib/recipes.ts` as well as the register. Rebuild the skill archive before building the website so its download includes the current source.

## Measure skill value

Use the same brief and browser targets with and without the skill. Compare observable behavior, accessibility, compatibility, unnecessary JavaScript, and visual quality. Track time/token cost alongside benefits. Keep demonstration code separate from evaluation prompts so a comparison tests the agent's decisions. Prior pilot results do not establish improvement for this revision.
