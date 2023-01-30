/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint"
  ],
  extends: [
    'eslint:recommended',
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    'arrow-parens': ['error', 'always'],
    'no-trailing-spaces': ['error', { skipBlankLines: true }],
    'no-tabs': 0,
    '@typescript-eslint/no-unused-vars': 0,
    indent: ['warn', 2],
    quotes: ['warn', 'single'],
    'prettier/prettier': ['warn', { endOfLine: 'auto', singleQuote: true }],
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
