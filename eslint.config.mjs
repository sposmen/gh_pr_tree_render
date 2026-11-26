import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', '.tmp/**', 'assets/dependencies/**', 'views/**'] },
  {
    files: ['**/*.{js,mjs,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node, sails: 'readonly', _: 'readonly', Config: 'readonly', Repo: 'readonly', Owner: 'readonly' },
    },
    rules: { ...js.configs.recommended.rules, 'eqeqeq': ['error', 'always'] },
  },
  {
    files: ['**/*.mjs', 'assets/src/**/*.{js,jsx}'],
    languageOptions: { sourceType: 'module' },
  },
  {
    files: ['assets/src/**/*.{js,jsx}'],
    languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  {
    files: ['**/*.jsx'],
    // Core ESLint does not track JSX component usages as variable references.
    rules: { 'no-unused-vars': 'off' },
  },
];
