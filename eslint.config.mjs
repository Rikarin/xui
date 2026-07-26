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

// ─── local rules ─────────────────────────────────────────────────────────────
// Small, dependency-free guards for the styling conventions in
// `.claude/skills/xui/rules/styling.md`. They only inspect string literals and
// template-literal quasis, and report once per string so a single
// `eslint-disable-next-line` can vouch for a whole class list.

const RAW_PALETTE_RE =
  /(?:^|[\s'"`])(?:bg|text|border|from|to|via)-(?:white|black|(?:zinc|slate|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\/\d+)?(?=$|[\s'"`])/;
const HAND_Z_INDEX_RE = /\bz-\d+\b/;

// Both rules only guard library code. The scope is enforced here rather than
// through `files` globs because every project spreads this base config from its
// own directory, where a `libs/ui/**` pattern would no longer match.
const LIBRARY_PATH_RE = /\/libs\/(?:ui|core)\//;

/** Report `node` when the string `value` contains a token matching `re`. */
function reportClassToken(context, node, value, re, messageId) {
  if (typeof value !== 'string') {
    return;
  }

  const match = re.exec(value);

  if (match) {
    context.report({ node, messageId, data: { token: match[0].trim() } });
  }
}

function classTokenRule(re, messageId, message) {
  return {
    meta: {
      type: 'problem',
      schema: [],
      messages: { [messageId]: message }
    },
    create(context) {
      if (!LIBRARY_PATH_RE.test(context.filename.replace(/\\/g, '/'))) {
        return {};
      }

      return {
        Literal(node) {
          reportClassToken(context, node, node.value, re, messageId);
        },
        TemplateElement(node) {
          reportClassToken(context, node, node.value.raw, re, messageId);
        }
      };
    }
  };
}

const localPlugin = {
  rules: {
    'no-raw-palette-classes': classTokenRule(
      RAW_PALETTE_RE,
      'rawPalette',
      "Raw palette class '{{token}}' cannot follow the active theme - use semantic tokens from theme.css."
    ),
    'no-hand-z-index': classTokenRule(
      HAND_Z_INDEX_RE,
      'handZIndex',
      "Hand-written '{{token}}' - overlay surfaces get stacking from the overlay container, not a z-index class."
    )
  }
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
    // `**/*.ts` so the block still matches when a project config spreads this
    // base config; the rules themselves bail outside `libs/ui` and `libs/core`.
    files: ['**/*.ts'],
    plugins: { local: localPlugin },
    rules: {
      'local/no-raw-palette-classes': 'error',
      'local/no-hand-z-index': 'error'
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
