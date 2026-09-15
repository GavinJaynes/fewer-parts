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
      // A scrollable <pre> needs tabindex="0" to be reachable by keyboard.
      // That is the accessible pattern here, not a violation of it.
      "astro/jsx-a11y/no-noninteractive-tabindex": ["error", { tags: ["pre"] }],
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
