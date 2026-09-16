# Agent skills

Small, reusable skills for coding agents. Each folder under `skills/` can be installed independently.

## Fewer Parts

[Fewer Parts](skills/fewer-parts/SKILL.md) helps an agent apply modern CSS, native HTML, and well-supported web APIs. It uses [Modern CSS](https://modern-css.com/)'s live cheatsheet and AI exports, plus MDN and Baseline sources. It requires an agent with web browsing or HTTP access; it has no MCP server, API key, or runtime dependency of its own.

The skill guides the agent to:

- Find a relevant upstream example and read its caveats.
- Lead with Tailwind examples when Tailwind is installed or no styling system has been chosen.
- Check the exact feature against the project's browser requirements.
- Preserve required interactions and verify the result.

It does not bundle the site, prescribe a visual style, or promise that newer syntax improves browser coverage. If online access is unavailable, the agent should disclose that limitation and use a dependable base implementation.

## Install and use

Copy the complete `skills/fewer-parts/` folder into your target project's `.agents/skills/fewer-parts/` directory. Keep its `SKILL.md`, `references/`, `assets/`, and `agents/` together. If that destination already exists, review the differences before replacing it.

For Codex, invoke it with a request such as:

```text
Use $fewer-parts to simplify this component's CSS while preserving its layout, keyboard behavior, and browser requirements.
```

Automatic selection is also enabled by default. See the [official skill documentation](https://learn.chatgpt.com/docs/build-skills) for supported installation locations and discovery behavior. For other agents, use that agent's skill installation mechanism. Do not replace your project's `AGENTS.md` with the upstream site's reference file.

## Recipes and current features

Start from the [Tailwind field-sizing example](skills/fewer-parts/assets/tailwind-field-sizing.html) when adapting the pattern to an application. Open the [standalone field-sizing demo](skills/fewer-parts/assets/field-sizing.html) in a browser to try typing, deletion, long content, and the fallback. The standalone demo displays its actual component CSS and runs directly from disk without external scripts or fonts.

The dated [feature register](skills/fewer-parts/references/features.md) includes CSS, HTML, and web API candidates. The skill checks live support against project targets: Widely Available is the default for essential behavior, with Newly Available features permitted where targets or progressive enhancement allow them. Candidate entries are not completed recipes.

Follow [feature maintenance](docs/feature-maintenance.md) for monthly discovery using existing Baseline Alerts, adoption criteria, and recipe verification. Installing the skill does not subscribe you to alerts or automatically update installed copies.

## Validate and package

Repository tooling requires Python 3.10+ and the development dependency below. Installing the skill itself does not require Python.

```sh
python -m pip install -r requirements-dev.txt
python scripts/release.py check
python scripts/release.py package
```

Packaging validates the sources and writes `dist/fewer-parts.zip` and `dist/SHA256SUMS`. The archive contains the skill folder plus its license and attribution notice. Tests, evaluation runs, dependencies, and local configuration are excluded. Identical inputs produce the same archive within the same Python/compression environment.

The GitHub Actions workflow runs skill validation, packaging, and the Astro production build on pushes, pull requests, and manual dispatches. It uploads packages as workflow artifacts; it does not publish a release automatically.

## Astro showcase

The [website](website/src/pages/index.astro) presents five interactive recipes, expandable source, support links, and the skill download. It uses Astro 7 with static output and small native browser scripts. Preview code is read from the skill's original HTML assets at build time, with only presentation overrides for the embedded textarea.

The showcase presents Tailwind v4 as the primary copyable source while retaining the dependency-free vanilla-CSS assets for live, isolated previews. Use Node.js 24+ and npm. First build the skill ZIP using the Python packaging command above, then:

```sh
cd website
npm ci --ignore-scripts
npm run dev
```

For production, run `npm run build` in `website/`. Deploy the generated `website/dist/` directory to a static host. Build from the repository root checkout, keeping the sibling `skills/` and `dist/` paths available; do not deploy the repository itself. The download endpoint fails the build when the skill archive is older than its source files, so regenerate the ZIP after skill changes. No hosting provider is configured yet.

With Playwright available to Node and Chrome installed, run `node tests/fewer-parts/showcase.cjs` from the repository root while the website is running. It defaults to `http://127.0.0.1:4321`; set `SHOWCASE_URL` for another preview. This checks demo behavior, source copying, the actual downloadable archive, and narrow layouts. See [showcase validation](evaluations/fewer-parts/showcase-validation.md).

## Repository layout

```text
skills/fewer-parts/   Skill, references, runnable recipes, and agent metadata
docs/                  Feature maintenance process
website/               Astro showcase with shared recipe sources
scripts/release.py     Validation and packaging
requirements-dev.txt   Packaging/validation dependency
.github/workflows/    CI configuration
evaluations/           Historical observations and proposed comparisons
tests/fewer-parts/   Original browser smoke fixture
```

When adding a skill, put it in its own named folder, link any supporting references from `SKILL.md`, and run the validation/package command. The packager accepts Markdown and YAML skill files, and HTML recipes under `assets/`; other asset types need an explicit validation change.

## Evidence and limitations

The [original pilot comparison](evaluations/fewer-parts/fewer-parts-evaluation.md) tested two tasks with and without an earlier draft. Both configurations chose similar native CSS. It does not establish a consistent output-quality improvement, and it was not a test of this basic version.

The [source coverage review](evaluations/fewer-parts/upstream-integration-review.md) found that the full-text export omitted some live snippets. The skill therefore follows detailed pages and other site indexes when needed. Those observations are dated; feature support and source coverage remain live decisions.

The original manual smoke fixture can still be reproduced with Python, Node.js, and pnpm:

```sh
python tests/fewer-parts/make_fixture.py
pnpm --dir tests/fewer-parts install --frozen-lockfile --ignore-scripts
pnpm --dir tests/fewer-parts exec tailwindcss -i input.css -o output.css
python -m http.server 8765 --bind 127.0.0.1 --directory tests/fewer-parts
```

Open [the local fixture](http://127.0.0.1:8765/) to inspect it. This fixture exercises the original examples; it does not evaluate the skill or certify cross-browser compatibility. Its original observations are in the [validation report](evaluations/fewer-parts/fewer-parts-validation.md).

The new recipe has a separate browser check at [field-sizing.cjs](tests/fewer-parts/field-sizing.cjs). With Playwright available to Node and Chrome installed, run `node tests/fewer-parts/field-sizing.cjs`. Set `BROWSER_CHANNEL=msedge` to exercise installed Edge instead. This checks actual behavior, including the fallback simulation and editing with JavaScript disabled. See the [recipe validation notes](evaluations/fewer-parts/field-sizing-validation.md) for observed results and limits. Browser checks are currently manual; packaging CI does not run them.

## Publishing

Run the package command and review the files Git will include before the first push. Commit the repository sources, configure your chosen remote, and push. Attach the generated ZIP and checksum file to a release when ready. Generated archives and installed dependencies are ignored by Git.

This repository currently ships one basic skill. Its original material is licensed under [MIT](LICENSE). See [NOTICE.md](NOTICE.md) for Modern CSS attribution and third-party content boundaries.
