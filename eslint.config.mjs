import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// Flat-config equivalent of the old `.eslintrc.json`:
//   { "extends": ["next/core-web-vitals", "next/typescript"] }
// `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` are the
// flat-config subpaths that `next/core-web-vitals` and `next/typescript` resolved to
// under the legacy eslintrc resolver — same two rule sets, same coverage.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
