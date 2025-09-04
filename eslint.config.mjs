import js from '@eslint/js';
import { defineConfig } from 'eslint-define-config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      js,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      eqeqeq: 'off',
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },

  {
    ignores: ['node_modules/**', 'dist/**'],
  },
]);
