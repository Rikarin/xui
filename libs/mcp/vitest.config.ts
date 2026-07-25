/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

/**
 * The sources use ESM `.js` import specifiers (NodeNext), which Vite does not resolve back to the
 * `.ts` file on its own.
 */
const resolveTsFromJsSpecifier = {
  name: 'resolve-ts-from-js-specifier',
  enforce: 'pre' as const,
  resolveId(
    this: { resolve: (source: string, importer: string, options: { skipSelf: boolean }) => unknown },
    source: string,
    importer: string | undefined
  ) {
    if (importer && /^\.{1,2}\//.test(source) && source.endsWith('.js')) {
      return this.resolve(source.slice(0, -3), importer, { skipSelf: true });
    }

    return null;
  }
};

export default defineConfig({
  // Pin the root to this project so the specs are discovered when vitest is invoked from the
  // workspace root.
  root: import.meta.dirname,
  plugins: [resolveTsFromJsSpecifier],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    reporters: ['default']
  }
});
