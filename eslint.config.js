import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const maxInlineImportSpecifiers = 3

const multilineNamedImports = {
  meta: {
    schema: [],
    messages: {
      multiline: `Place each named import on its own line when importing more than ${maxInlineImportSpecifiers} names.`,
    },
  },
  create: (context) => {
    const { sourceCode } = context

    return {
      ImportDeclaration: (node) => {
        const specifiers = node.specifiers.filter((specifier) => {
          return specifier.type === 'ImportSpecifier'
        })

        if (specifiers.length <= maxInlineImportSpecifiers) {
          return
        }

        const openingBrace = sourceCode.getTokenBefore(specifiers[0])
        const closingBrace = sourceCode.getTokenAfter(specifiers.at(-1), {
          filter: (token) => { return token.value === '}' },
        })
        const entries = [openingBrace, ...specifiers, closingBrace]
        const sharesLine = entries.slice(1).some((entry, index) => {
          return entry.loc.start.line === entries[index].loc.end.line
        })

        if (sharesLine) {
          context.report({ node, messageId: 'multiline' })
        }
      },
    }
  },
}

export default defineConfig([
  globalIgnores(['dist']),
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
    plugins: {
      local: { rules: { 'multiline-named-imports': multilineNamedImports } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Стиль кода
      'local/multiline-named-imports': 'warn',
      'max-len': ['warn', { code: 140 }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['warn', 'always-multiline'],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],

      // Лучшие практики
      'eqeqeq': ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/i18n/locales/**/*.{ts,tsx}'],
    rules: {
      'max-len': 'off',
    },
  },
])
