module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // Function declarations are hoisted; only variables and classes must
    // be defined before use.
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
  },
  overrides: [
    {
      // A migration without a way back has an empty `down`.
      files: ['src/migrations/*.ts'],
      rules: { '@typescript-eslint/no-empty-function': 'off' },
    },
    {
      // Tests stub interfaces with empty methods and load package.json
      // files with require.
      files: ['test/**/*.ts', 'src/**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
