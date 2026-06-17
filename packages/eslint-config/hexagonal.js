import boundaries from "eslint-plugin-boundaries";

/**
 * Garde-fous d'architecture hexagonale pour `@repo/core` (et tout package
 * suivant le même découpage domain / application / testing).
 *
 * À spread dans le `eslint.config.js` du package concerné, APRÈS `base` :
 *
 *   import { config as base } from "@repo/eslint-config/base";
 *   import { hexagonalConfig } from "@repo/eslint-config/hexagonal";
 *   export default [...base, ...hexagonalConfig];
 *
 * Règles imposées (cf. MIGRATION_ROADMAP §2.2) :
 *   - `domain`      n'importe QUE `domain`            (cœur pur).
 *   - `application` importe `domain` + `application`  (orchestration).
 *   - `testing`     importe tout le package           (fakes/contrats).
 *   - AUCUNE couche n'importe d'infrastructure (next, cloudflare, remotion,
 *     react…) : le domaine reste agnostique du monde extérieur.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const hexagonalConfig = [
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "domain", pattern: "src/domain/**/*" },
        { type: "application", pattern: "src/application/**/*" },
        { type: "testing", pattern: "src/testing/**/*" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "domain", allow: ["domain"] },
            { from: "application", allow: ["domain", "application"] },
            { from: "testing", allow: ["domain", "application", "testing"] },
          ],
        },
      ],
      "boundaries/no-unknown-files": "off",
      "boundaries/no-unknown": "off",
    },
  },
  {
    // Aucune couche du cœur ne connaît une technologie d'infrastructure.
    // (Garde string-based : fiable sans résolveur de modules.)
    files: ["src/domain/**/*.ts", "src/application/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next",
                "next/*",
                "@opennextjs/*",
                "@cloudflare/*",
                "react",
                "react-dom",
                "@remotion/*",
                "hono",
                "express",
              ],
              message:
                "Le cœur doit rester agnostique : passez par un port (interface) et un adapter dans @repo/infra-*.",
            },
          ],
        },
      ],
    },
  },
  {
    // Le DOMAINE ne dépend de rien d'autre que lui-même : pas même la couche
    // application. La dépendance pointe toujours vers le centre.
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next",
                "next/*",
                "@opennextjs/*",
                "@cloudflare/*",
                "react",
                "react-dom",
                "@remotion/*",
                "hono",
                "express",
                "**/application/**",
                "**/application",
                "**/testing/**",
                "**/testing",
              ],
              message:
                "Le domaine n'importe que le domaine : ni application, ni infrastructure, ni testing.",
            },
          ],
        },
      ],
    },
  },
];

export default hexagonalConfig;
