# Agent skills

Small, reusable skills for coding agents. Each folder under `skills/` can be installed independently.

## Modern Web UI

[Modern Web UI](skills/modern-web-ui/SKILL.md) helps an agent find and apply native CSS and HTML examples from [modern-css.com](https://modern-css.com/). This basic version uses the live cheatsheet, site index, and existing AI exports. It requires an agent with web browsing or HTTP access; it has no MCP server, API key, or runtime dependency of its own.

The skill guides the agent to:

- Find a relevant upstream example and read its caveats.
- Adapt it to the existing project, with Tailwind preferred where appropriate.
- Check the exact feature against the project's browser requirements.
- Preserve required interactions and verify the result.

It does not bundle the site, prescribe a visual style, or promise that newer syntax improves browser coverage. If online access is unavailable, the agent should disclose that limitation and use a dependable base implementation.

## Install and use

Copy the complete `skills/modern-web-ui/` folder into your target project's `.agents/skills/modern-web-ui/` directory. Keep its `SKILL.md`, `references/`, and `agents/` together. If that destination already exists, review the differences before replacing it.

For Codex, invoke it with a request such as:

```text
Use $modern-web-ui to simplify this component's CSS while preserving its layout, keyboard behavior, and browser requirements.
```

Automatic selection is also enabled by default. See the [official skill documentation](https://learn.chatgpt.com/docs/build-skills) for supported installation locations and discovery behavior. For other agents, use that agent's skill installation mechanism. Do not replace your project's `AGENTS.md` with the upstream site's reference file.

## Validate and package

Repository tooling requires Python 3.10+ and the development dependency below. Installing the skill itself does not require Python.

```sh
python -m pip install -r requirements-dev.txt
python scripts/release.py check
python scripts/release.py package
```

Packaging validates the sources and writes `dist/modern-web-ui.zip` and `dist/SHA256SUMS`. The archive contains the skill folder plus its license and attribution notice. Tests, evaluation runs, dependencies, and local configuration are excluded. Identical inputs produce the same archive within the same Python/compression environment.

The GitHub Actions workflow runs validation and packaging on pushes, pull requests, and manual dispatches. It uploads the packages as workflow artifacts; it does not publish a release automatically.

## Repository layout

```text
skills/modern-web-ui/   Installable skill, source links, and agent metadata
scripts/release.py     Validation and packaging
requirements-dev.txt   Packaging/validation dependency
.github/workflows/    CI configuration
evaluations/           Historical observations and proposed comparisons
tests/modern-web-ui/   Original browser smoke fixture
```

When adding a skill, put it in its own named folder, link any supporting references from `SKILL.md`, and run the validation/package command. The current packager accepts Markdown and YAML skill files; extend its explicit file checks if a future skill needs other assets.

## Evidence and limitations

The [original pilot comparison](evaluations/modern-web-ui/modern-web-ui-evaluation.md) tested two tasks with and without an earlier draft. Both configurations chose similar native CSS. It does not establish a consistent output-quality improvement, and it was not a test of this basic version.

The [source coverage review](evaluations/modern-web-ui/upstream-integration-review.md) found that the full-text export omitted some live snippets. The skill therefore follows detailed pages and other site indexes when needed. Those observations are dated; feature support and source coverage remain live decisions.

The original manual smoke fixture can still be reproduced with Python, Node.js, and pnpm:

```sh
python tests/modern-web-ui/make_fixture.py
pnpm --dir tests/modern-web-ui install --frozen-lockfile --ignore-scripts
pnpm --dir tests/modern-web-ui exec tailwindcss -i input.css -o output.css
python -m http.server 8765 --bind 127.0.0.1 --directory tests/modern-web-ui
```

Open [the local fixture](http://127.0.0.1:8765/) to inspect it. This fixture exercises the original examples; it does not evaluate the skill or certify cross-browser compatibility. Its original observations are in the [validation report](evaluations/modern-web-ui/modern-web-ui-validation.md).

## Publishing

Run the package command and review the files Git will include before the first push. Commit the repository sources, configure your chosen remote, and push. Attach the generated ZIP and checksum file to a release when ready. Generated archives and installed dependencies are ignored by Git.

This repository currently ships one basic skill. Its original material is licensed under [MIT](LICENSE). See [NOTICE.md](NOTICE.md) for Modern CSS attribution and third-party content boundaries.
