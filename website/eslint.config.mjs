// This file is linted by its own config. The two parsers ship namespace exports
// only, and astro-eslint-parser arrives as a transitive dependency of
// eslint-plugin-astro rather than a direct one.
/* eslint-disable sonarjs/no-wildcard-import, import-x/no-extraneous-dependencies, n/no-extraneous-import, import-x/no-rename-default */
import * as tsParser from "@typescript-eslint/parser";
import * as astroParser from "astro-eslint-parser";
import astroPlugin from "eslint-plugin-astro";
import astro from "ultracite/eslint/astro";
import core from "ultracite/eslint/core";

export default [
  ...core,
  ...astro,
  {
    // Ultracite's astro preset registers eslint-plugin-astro and turns on all
    // of its rules, but never sets a parser. Without this block .astro files
    // fall through to the default parser, fail on the frontmatter, and every
    // astro/* rule — a11y included — silently does not run.
    files: ["**/*.astro"],
    plugins: { astro: astroPlugin },
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        extraFileExtensions: [".astro"],
        parser: tsParser,
      },
    },
    rules: {
      // A scroll container holding nothing focusable is unreachable by keyboard
      // unless it takes focus itself. Two carry tabindex="0" deliberately: the
      // named <section> wrapping the scorecard, and the <code> holding an
      // install command too long for its box. The <pre> in a code panel needs
      // the same thing, but its tabindex is injected in lib/highlight.ts
      // because that markup comes from the highlighter, not from a component.
      "astro/jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: ["section", "code"] },
      ],
      // Astro compiles <script> in a .astro file rather than injecting a
      // string. Revisit if this site ever ships a Content-Security-Policy.
      "astro/no-unsafe-inline-scripts": "off",
    },
  },
  {
    rules: {
      // The recipe definitions and the response headers are data literals whose
      // key order carries meaning (id, title, feature, category, status...).
      // Alphabetising them reads worse than the order a human chose.
      "sort-keys": "off",
    },
  },
  {
    // The loader's default export is also published under its own name, so
    // importing it as `wgslVitePlugin` trips no-named-as-default and importing
    // it as anything else trips no-rename-default. The two rules cannot both
    // be satisfied by this package; matching the upstream name is the more
    // useful of the two.
    files: ["astro.config.mjs"],
    rules: { "import-x/no-named-as-default": "off" },
  },
  {
    // The hero canvas is decoration inside an aria-hidden wrapper: it has no
    // control semantics and nothing to label. jsx-a11y treats every canvas as
    // a control and cannot see the hidden ancestor, so every way of satisfying
    // one of its rules here breaks another.
    files: ["src/components/CloudHero.astro"],
    rules: { "astro/jsx-a11y/control-has-associated-label": "off" },
  },
  {
    // Astro requires this exact filename for its ambient types; renaming it
    // to satisfy the rule would break the convention it documents.
    files: ["src/env.d.ts"],
    rules: { "unicorn/name-replacements": "off" },
  },
  {
    // Astro's file-based API routes must export a function named GET.
    files: ["src/pages/**/*.ts"],
    rules: { "sonarjs/function-name": "off" },
  },
  {
    // Ultracite's core lints **/*.json with the TypeScript parser and ships no
    // JSON language plugin, so every JSON file reports a parse error. Prettier
    // already formats them.
    ignores: ["**/*.json"],
  },
];
