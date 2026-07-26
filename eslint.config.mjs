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

// Every exported component/directive and every one of its `input()`/`model()`/`output()` members
// carries a doc comment, because those comments *are* the API reference: `@xui/mcp` extracts them
// and both the docs site and the MCP server render what it finds. An undocumented member shows up
// on the page as a name and a type with nothing to say what it is for.
//
// The check mirrors the extractor (`jsDocOf` in libs/mcp/src/lib/parse-source.ts), which keeps only
// the free text *before* the first `@tag` — so a comment that is nothing but `@see X` reads as
// documented here but renders as blank on the site, and is reported.
const DECLARABLE_RE = /^(Component|Directive)$/;
const DOCUMENTED_MEMBER_RE = /^(input|model|output)$/;

/** The free text of `node`'s leading JSDoc, as the docs extractor would read it. */
function jsDocProse(context, node) {
  const comments = context.sourceCode.getCommentsBefore(node);
  const block = [...comments].reverse().find(c => c.type === 'Block' && c.value.startsWith('*'));

  if (!block) {
    return '';
  }

  const lines = [];
  for (const raw of block.value.split('\n')) {
    const line = raw.replace(/^\s*\*/, '').trim();
    if (line.startsWith('@')) break;
    lines.push(line);
  }

  return lines.join(' ').trim();
}

/** The `input`/`model`/`output` call a property is initialised with, if any. */
function signalMemberKind(node) {
  let call = node.value;

  if (call?.type !== 'CallExpression') {
    return null;
  }

  // `input.required<T>()` — the callee is a member expression on `input`.
  const callee = call.callee.type === 'MemberExpression' ? call.callee.object : call.callee;

  return callee.type === 'Identifier' && DOCUMENTED_MEMBER_RE.test(callee.name) ? callee.name : null;
}

const requireApiDocsRule = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      undocumentedClass:
        "Exported {{kind}} '{{name}}' has no doc comment - it renders on the docs site as a heading with nothing under it.",
      undocumentedMember:
        "{{kind}}() '{{name}}' has no doc comment - it renders in the API table as a name and a type with no description."
    }
  },
  create(context) {
    if (!LIBRARY_PATH_RE.test(context.filename.replace(/\\/g, '/'))) {
      return {};
    }

    return {
      ClassDeclaration(node) {
        const decorator = node.decorators?.find(
          d => d.expression.type === 'CallExpression' && DECLARABLE_RE.test(d.expression.callee.name)
        );

        // Only the exported declarables reach the docs site.
        if (!decorator || node.parent.type !== 'ExportNamedDeclaration') {
          return;
        }

        if (!jsDocProse(context, decorator)) {
          context.report({
            node: node.id ?? node,
            messageId: 'undocumentedClass',
            data: { kind: decorator.expression.callee.name.toLowerCase(), name: node.id?.name ?? '(anonymous)' }
          });
        }
      },
      PropertyDefinition(node) {
        const kind = signalMemberKind(node);

        // Only public members reach the docs; the extractor skips the rest, so requiring a comment
        // on a `protected` model an internal template binds would be asking for dead prose.
        if (!kind || node.accessibility === 'private' || node.accessibility === 'protected') {
          return;
        }

        if (node.key.type !== 'Identifier') {
          return;
        }

        if (!jsDocProse(context, node)) {
          context.report({ node: node.key, messageId: 'undocumentedMember', data: { kind, name: node.key.name } });
        }
      }
    };
  }
};

const localPlugin = {
  rules: {
    'require-api-docs': requireApiDocsRule,
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
      'local/require-api-docs': 'error',
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
