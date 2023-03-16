// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 9,

    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './eslint.tsconfig.json',
    tsconfigRootDir: './',
  },
  extends: [
    require.resolve('eslint-config-airbnb/rules/react'),
    'plugin:jsx-control-statements/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
  ],
  plugins: [
    'jsdoc',
    'import',
    'react',
    'jsx-a11y',
    'jsx-control-statements',
    'prettier',
    'react-hooks',
    'eslint-comments',
    'jest',
  ],
  env: {
    browser: true,
    node: true,
  },
  globals: {
    globalThis: 'readonly',
  },
  rules: {
    // New jsx transform
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'unicorn/catch-error-name': 0,
    'no-underscore-dangle': 'off',
    'node/no-unsupported-features/es-syntax': 0,
    'node/no-unsupported-features/es-builtins': 0,
    'node/no-unsupported-features/node-builtins': 0,
    'node/no-extraneous-require': 'off',
    'node/no-unpublished-require': 0,
    'import/no-extraneous-dependencies': 'off',
    'no-console': ['warn'],
    'arrow-parens': 0,
    'import/order': ['warn', { groups: ['builtin', 'external', 'index', 'internal', 'parent', 'sibling'] }],
    // React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-indent': 0,
    'react/jsx-curly-newline': 0,
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-wrap-multilines': 0,
    'react/state-in-constructor': 0,
    'react/jsx-no-undef': [2, { allowGlobals: true }],
    'jsx-control-statements/jsx-use-if-tag': 0,
    'jsx-quotes': ['error', 'prefer-single'],
    'react/static-property-placement': 0,
    'react/require-default-props': 0,
    'react/prefer-es6-class': 0,
    'react/jsx-indent-props': 0,
    'react/jsx-props-no-spreading': 0,
    'react/jsx-closing-tag-location': 0,
    'react/prefer-stateless-function': ['error', { ignorePureComponents: true }],
    'react/forbid-prop-types': ['error', { forbid: ['any'] }],
    'react/no-unused-prop-types': 0,
    'react/no-array-index-key': 'off',
    'react/jsx-filename-extension': 'off',
    'jsx-a11y/alt-text': [
      1,
      {
        elements: ['img', 'object', 'area', "input[type='image']"],
        img: ['Image'],
        object: ['Object'],
        area: ['Area'],
        "input[type='image']": ['InputImage'],
      },
    ],
    'react/no-danger': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'react/destructuring-assignment': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/sort-comp': [
      0,
      {
        order: ['static-variables', 'static-methods', 'lifecycle', 'everything-else', 'render'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: [
        'jsdoc',
        'import',
        'react',
        'jsx-a11y',
        'jsx-control-statements',
        'prettier',
        'react-hooks',
        'eslint-comments',
        'jest',
        '@typescript-eslint',
      ],
      rules: {
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
      },
    },
  ],
  settings: {
    'import/external-module-folders': [path.resolve(__dirname, './node_modules/')],
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['/es/**', '/node_modules/**', 'tsconfig.tsbuildinfo', '/storybook-static', '/test'],
}
