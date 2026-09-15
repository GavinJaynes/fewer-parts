import config from "ultracite/stylelint";

/**
 * Ultracite's shared ignore patterns are wired into the ESLint config only,
 * so Stylelint needs build output excluded explicitly.
 */
export default {
  ...config,
  ignoreFiles: ["dist/**", ".astro/**"],
};
