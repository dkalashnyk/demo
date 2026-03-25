import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import playwright from 'eslint-plugin-playwright';

export default [
  {
    ignores: [
      'allure-report/**',
      'allure-results/**',
      'playwright-report/**',
      'test-results/**',
      'node_modules/**',
      'dist/**',
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Disable formatting rules (Prettier owns formatting)
  prettier,

  // Your custom rules
  {
    files: ['**/*.ts'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // Playwright test rules
  {
    files: ['tests/**/*.ts'],
    plugins: {
      playwright: playwright,
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': 'off',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/no-networkidle': 'warn',
      'playwright/no-commented-out-tests': 'warn',
    },
  },
];
