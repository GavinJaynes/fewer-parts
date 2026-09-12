# Modern CSS live-source integration review

Checked 12 September 2026. The user selected live discovery and task-relevant reading through the site's existing AI exports, rather than a bundled snapshot.

## Existing upstream capability

The [AI landing page](https://modern-css.com/ai/) exposes a [category-based rules generator](https://modern-css.com/ai/css-rules/), a [prompt library](https://modern-css.com/ai/prompts/), an [agent reference](https://modern-css.com/AGENTS.md), a [machine-readable index](https://modern-css.com/llms.txt), and a [cheatsheet](https://modern-css.com/cheatsheet/). The index links to a [full-text snippet export](https://modern-css.com/llms-full.txt). These already provide the pattern content and rule-generation mechanism; the local skill should reuse them.

## Coverage observations

The [dated inventory](upstream-coverage-2026-09-12.json) records the source URLs, counts, and all missing snippet URLs.

| Surface | Observed coverage |
| --- | --- |
| Homepage's published snippet index | 111 entries |
| `llms.txt` introduction | Advertises 87 snippets |
| `llms-full.txt` | Advertises and contains 85 entries, identified by `URL:` records |
| Current snippets absent from the full-text export | 26 |
| Sitemap | 954 URLs, including landing/category pages |
| Nested sitemap sections | 745 reference URLs, 46 block URLs, 7 article URLs, and 9 tool URLs, plus other sections |

This is a discovery and export-membership audit, not a claim that all 954 pages were read or tested. The full export was retrieved and its entries inventoried; selected content and the AI resource pages were inspected. A single export does not cover the entire site. Counts are a dated observation, not runtime assumptions.

## Local changes

- Make the live Modern CSS collection the primary source consulted before selecting an implementation, with lookup by user outcome or existing workaround as well as feature name.
- Route through existing exports, detailed pages, section indexes, and the sitemap. Read relevant content per task and report lookup failures or incomplete coverage.
- Reuse the upstream rules generator and prompts when appropriate, preserving project instructions and the chosen framework. Do not import the source site's asset/build instructions into another repository.
- Retain local browser-support reasoning, Tailwind adaptation, and behavior verification. These are the candidate added value over consuming the upstream resources directly.
- Move the original local pattern examples into the smoke-test directory, preserving their fixture generator. They no longer define the skill's coverage.

## Validation and evidence limits

The previous two-task pilot applies to the original skill. It does not measure this revision or establish that the wrapper improves CSS over the upstream resources alone.

Validation of this revision passed: the bundled skill validator, local Markdown reference targets, agent metadata YAML and invocation, and regeneration of the original smoke fixture with its fallback textarea and dialog intact. The source guide's HTML entry URLs were also found in the current sitemap; its text/XML exports were fetched directly. PyYAML was installed only in a temporary review directory to run the validator. No new browser or independent agent comparison was run. These checks establish format and routing integrity, not agent behavior or cross-browser compatibility.

The next behavioral comparison should have three configurations with the same model, tools, starting files, browser targets, and user brief: no skill; the upstream agent reference alone; this live-source adaptation skill. Repeat each configuration in isolated workspaces and servers. Do not show the grading criteria to the implementing agents.

Use tasks that distinguish source discovery and adaptation: a relevant technique missing from the full export (such as overflow-safe centering), a composed interaction requiring an article or reference page, Tailwind v3 constraints, an older required browser, and preservation of carousel keyboard behavior. Judge observable behavior, accessibility, useful feature selection, coverage of the brief, maintainability, and cost separately from citation quality. Merely naming a modern property or reporting an untested case should not count as functional success.

The original generated `benchmark.md` incorrectly labeled three runs per configuration and zero tokens. Its summary was corrected during publication preparation using `benchmark.json`, per-run timing files, and the evaluation narrative, which record one run per configuration with nonzero token counts. The raw records remain unchanged.

## Basic version prepared for publication

The installable skill was subsequently reduced to `SKILL.md`, one short `references/sources.md` guide, and `agents/openai.yaml`. The earlier discovery, support, and Tailwind references described above are no longer shipped. Essential project adaptation and verification guidance is now in the entrypoint. The repository adds MIT licensing, attribution, installation instructions, and repeatable validation/packaging. Historical fixtures and pilot records remain separate from the installable package. This simplification has not been independently evaluated for CSS output quality.
