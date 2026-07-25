import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}', '{projectRoot}/vitest.config.ts'],
          // `typescript` is an optional peer: it is only loaded when the server extracts the index
          // from a checkout, never by a consumer answering from the bundled index.
          ignoredDependencies: ['typescript']
        }
      ]
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser')
    }
  }
];
