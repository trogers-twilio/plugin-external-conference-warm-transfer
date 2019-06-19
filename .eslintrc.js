module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'space-before-function-paren': 0,
    'func-names': 0,
    'no-console': 0,
    'arrow-parens': ['error', 'as-needed'],
    'comma-dangle': 0,
    'import/no-extraneous-dependencies': 0,
    'class-methods-use-this': 0,
    'react/jsx-filename-extension': 0,
    'react/prop-types': 0,
    'react/destructuring-assignment': 0,
    'react/no-did-update-set-state': 0,
    'guard-for-in': 0,
    'no-restricted-syntax': 0,
    'react/forbid-prop-types': 0,
    'no-extra-boolean-cast': 0,
    'prefer-destructuring': 0
  },
};
