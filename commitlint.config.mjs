import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

/** Directory names one level under `path`, relative to the repo root. */
const dirs = path =>
  readdirSync(join(root, path), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'scope-enum': [
      2,
      'always',
      [
        // One scope per package and project, derived from the tree so the list
        // can never go stale.
        ...dirs('libs/ui'),
        ...dirs('libs'),
        ...dirs('apps'),
        // Cross-cutting scopes.
        'storybook',
        'repo',
        'release',
        'docs',
        'deps',
        'ci'
      ]
    ]
  }
};
