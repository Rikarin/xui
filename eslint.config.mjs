// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import nx from '@nx/eslint-plugin';

const moduleBoundaries = {
  enforceBuildableLibDependency: true,
  // The docs generator reads the compiled `@xui/mcp` extraction rather than its TypeScript source:
  // it runs under a plain Node loader, where the package's `.js` specifiers do not resolve back to
  // `.ts` files.
  allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$', '^.*/dist/libs/mcp/.*$'],
  depConstraints: [
    {
      sourceTag: '*',
      onlyDependOnLibsWithTags: ['*']
    }
  ]
};

export default [
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {
      '@nx/dependency-checks': 'error'
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser')
    }
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/angular'],
  {
    ignores: ['**/dist']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd()
      }
    },
    rules: {
      '@nx/enforce-module-boundaries': ['error', moduleBoundaries],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'classProperty',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase']
        }
      ],
      '@angular-eslint/prefer-output-readonly': ['error'],
      '@angular-eslint/prefer-on-push-component-change-detection': ['error']
      // '@nx/workspace-prefer-signals': 'error'
      // '@nx/workspace-prefer-rxjs-operator-compat': 'error'
    }
  },
  {
    files: ['**/*.spec.ts', '**/tests/**/*.ts'],
    rules: {
      // Specs are excluded from tsconfig.lib.json and never reach a published
      // bundle, so a buildable library may depend on the non-buildable
      // `@xui/testing` harness from its tests.
      '@nx/enforce-module-boundaries': ['error', { ...moduleBoundaries, enforceBuildableLibDependency: false }]
      // '@nx/workspace-prefer-signals': 'off'
    }
  },
  ...storybook.configs['flat/recommended']
];
