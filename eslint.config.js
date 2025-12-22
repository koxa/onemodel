const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const babelParser = require('@babel/eslint-parser');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        // CommonJS globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettier.rules,
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
          singleQuote: true,
        },
      ],
      'arrow-parens': ['error', 'always'],
      'no-trailing-spaces': ['error', { skipBlankLines: true }],
      'no-tabs': 0,
      quotes: ['warn', 'single'],
      'comma-dangle': ['error', 'always-multiline'],
      semi: ['error', 'always'],
    },
  },
  {
    ignores: ['dist/**', 'public/**', 'node_modules/**', '*.config.js'],
  },
];

