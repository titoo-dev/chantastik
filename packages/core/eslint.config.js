import { config as base } from "@repo/eslint-config/base";
import { hexagonalConfig } from "@repo/eslint-config/hexagonal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  ...hexagonalConfig,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
