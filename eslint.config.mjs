import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build output of `opennextjs-cloudflare build`: the bundled Next server,
    // thousands of lines of generated code that no rule here applies to. Left
    // in, it buries the app's own findings under ~14k reports.
    ".open-next/**",
  ]),
]);

export default eslintConfig;
