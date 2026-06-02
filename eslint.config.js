import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const dateDisplayRestriction = {
  selector:
    "MemberExpression[property.name=/^(toLocaleDateString|toLocaleString|toLocaleTimeString)$/]",
  message:
    'Use formatters from @/lib/dates for user-facing dates (January, February, …).',
}

export default defineConfig([
  globalIgnores(['dist', 'coverage/**', 'convex/_generated/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-restricted-syntax': ['error', dateDisplayRestriction],
    },
  },
  {
    files: ['src/lib/dates.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['src/components/ui/**', 'src/context/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['tests/**'],
    rules: {
      'no-constant-binary-expression': 'off',
    },
  },
])
