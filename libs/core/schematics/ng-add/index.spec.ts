import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import collection from '../collection.json';
import { ngAdd, Schema } from './index';

/**
 * The rule imports nothing from `@angular-devkit/schematics` at runtime, so it can be exercised
 * against a minimal in-memory tree. That keeps the specs out of `@angular-devkit/schematics/testing`,
 * whose test runner pulls in ESM-only packages that this Jest setup cannot transform - and it keeps
 * the tests honest about the surface the schematic actually uses.
 */
class FakeTree {
  private readonly files = new Map<string, string>();

  create(path: string, content: string): void {
    this.files.set(path, content);
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  read(path: string): Buffer | null {
    const content = this.files.get(path);

    return content === undefined ? null : Buffer.from(content);
  }

  overwrite(path: string, content: string): void {
    this.files.set(path, content);
  }

  contentOf(path: string): string {
    return this.files.get(path) ?? '';
  }
}

interface RunResult {
  tree: FakeTree;
  warnings: string[];
  info: string[];
}

function run(tree: FakeTree, options: Schema = {}): RunResult {
  const warnings: string[] = [];
  const info: string[] = [];
  const context = {
    logger: {
      warn: (message: string) => warnings.push(message),
      info: (message: string) => info.push(message)
    }
  } as unknown as SchematicContext;

  (ngAdd(options) as Rule)(tree as unknown as Tree, context);

  return { tree, warnings, info };
}

const TAILWIND = "@import 'tailwindcss';\n\nbody {\n  margin: 0;\n}\n";

function workspaceWith(stylesPath: string, contents = TAILWIND): FakeTree {
  const tree = new FakeTree();

  tree.create(
    'angular.json',
    JSON.stringify({
      version: 1,
      projects: {
        app: { projectType: 'application', architect: { build: { options: { styles: [stylesPath] } } } }
      }
    })
  );
  tree.create(stylesPath, contents);

  return tree;
}

describe('ng-add', () => {
  it('is the factory the collection points at', () => {
    expect(collection.schematics['ng-add'].factory).toBe('./ng-add/index#ngAdd');
    expect(typeof ngAdd).toBe('function');
  });

  it('adds the theme, overlay stylesheet and source scan, after the tailwind import', () => {
    const { tree } = run(workspaceWith('src/styles.css'));
    const css = tree.contentOf('src/styles.css');

    expect(css).toContain("@import '@xui/core/styles/theme.css';");
    expect(css).toContain("@import '@angular/cdk/overlay-prebuilt.css';");
    expect(css).toContain("@source '../node_modules/@xui';");

    // Tailwind has to stay first - the theme layers its tokens on top of it.
    expect(css.indexOf("@import 'tailwindcss';")).toBeLessThan(css.indexOf("@import '@xui/core"));
    // and the existing rules survive
    expect(css).toContain('body {');
  });

  it('counts the depth of the stylesheet when writing the source glob', () => {
    const { tree } = run(workspaceWith('apps/web/src/styles.css'));

    expect(tree.contentOf('apps/web/src/styles.css')).toContain("@source '../../../node_modules/@xui';");
  });

  it('skips the overlay stylesheet when asked', () => {
    const { tree } = run(workspaceWith('src/styles.css'), { skipOverlay: true });
    const css = tree.contentOf('src/styles.css');

    expect(css).toContain("@import '@xui/core/styles/theme.css';");
    expect(css).not.toContain('overlay-prebuilt');
  });

  it('is idempotent', () => {
    const first = run(workspaceWith('src/styles.css'));
    const second = run(first.tree);
    const css = second.tree.contentOf('src/styles.css');

    expect(css.match(/@xui\/core\/styles\/theme\.css/g)).toHaveLength(1);
    expect(css.match(/@source/g)).toHaveLength(1);
    expect(second.info.join('\n')).toContain('already set up');
  });

  it('adds only what is missing', () => {
    const existing = "@import 'tailwindcss';\n@import '@xui/core/styles/theme.css';\n";
    const { tree } = run(workspaceWith('src/styles.css', existing));
    const css = tree.contentOf('src/styles.css');

    expect(css.match(/@xui\/core\/styles\/theme\.css/g)).toHaveLength(1);
    expect(css).toContain("@source '../node_modules/@xui';");
  });

  it('patches a stylesheet with no tailwind import, and warns about it', () => {
    const { tree, warnings } = run(workspaceWith('src/styles.css', 'body {}\n'));

    expect(tree.contentOf('src/styles.css')).toContain("@import '@xui/core/styles/theme.css';");
    expect(warnings.join('\n')).toContain('tailwindcss');
  });

  it('honours an explicit stylesFile over the workspace configuration', () => {
    const tree = workspaceWith('src/styles.css');
    tree.create('src/theme.css', TAILWIND);

    run(tree, { stylesFile: 'src/theme.css' });

    expect(tree.contentOf('src/theme.css')).toContain('@xui/core/styles/theme.css');
    expect(tree.contentOf('src/styles.css')).not.toContain('@xui/core');
  });

  it('reads the styles entry from an Nx-style targets block', () => {
    const tree = new FakeTree();
    tree.create(
      'angular.json',
      JSON.stringify({
        projects: { web: { targets: { build: { options: { styles: [{ input: 'apps/web/src/styles.css' }] } } } } }
      })
    );
    tree.create('apps/web/src/styles.css', TAILWIND);

    run(tree);

    expect(tree.contentOf('apps/web/src/styles.css')).toContain('@xui/core/styles/theme.css');
  });

  it('falls back to the conventional stylesheet when there is no workspace file', () => {
    const tree = new FakeTree();
    tree.create('src/styles.css', TAILWIND);

    run(tree);

    expect(tree.contentOf('src/styles.css')).toContain('@xui/core/styles/theme.css');
  });

  it('warns with a copyable snippet when no stylesheet can be found', () => {
    const { warnings } = run(new FakeTree());

    expect(warnings.join('\n')).toContain("@import '@xui/core/styles/theme.css';");
    expect(warnings.join('\n')).toContain("@source '../node_modules/@xui';");
  });
});
