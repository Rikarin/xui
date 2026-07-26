import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import updateProjectsGenerator from './generator';

describe('update-projects generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    tree.write(
      'package.json',
      JSON.stringify({
        name: 'xui',
        description: 'Modern Angular 22 UI Library based on TailwindCSS',
        keywords: ['angular', 'ui'],
        author: 'Jiu',
        maintainers: ['Jiu'],
        repository: 'https://github.com/Rikarin/xui',
        bugs: { url: 'https://github.com/rikarin/xui/issues' },
        homepage: 'https://xuijs.org',
        license: 'Apache-2.0'
      })
    );
    tree.write('README.md', '# xUI root readme\n');
    tree.write('LICENSE', 'Apache License\nVersion 2.0\n');
  });

  it('syncs metadata and the README into a component package', async () => {
    tree.write('libs/ui/button/xui/package.json', JSON.stringify({ name: '@xui/button', description: 'stale' }));
    tree.write('libs/ui/button/xui/README.md', '# stale\n');

    await updateProjectsGenerator(tree);

    const packageJson = JSON.parse(tree.read('libs/ui/button/xui/package.json', 'utf-8') ?? '{}');
    expect(packageJson.description).toBe('Modern Angular 22 UI Library based on TailwindCSS');
    expect(packageJson.homepage).toBe('https://xuijs.org');
    expect(tree.read('libs/ui/button/xui/README.md', 'utf-8')).toContain('# xUI root readme');
    // Apache 2.0 §4(a): the licence has to travel with anything published.
    expect(tree.read('libs/ui/button/xui/LICENSE', 'utf-8')).toBe('Apache License\nVersion 2.0\n');
  });

  it('gives a package that opts out the licence anyway', async () => {
    tree.write('libs/mcp/package.json', JSON.stringify({ name: '@xui/mcp', xui: { syncFromRoot: false } }));

    await updateProjectsGenerator(tree);

    // Opting out is about content the package legitimately differs on, not about whether it ships
    // under the project's licence.
    expect(tree.read('libs/mcp/LICENSE', 'utf-8')).toBe('Apache License\nVersion 2.0\n');
  });

  it('leaves a package that opts out untouched', async () => {
    const manifest = {
      name: '@xui/mcp',
      description: 'Model Context Protocol server for xUI',
      keywords: ['mcp'],
      xui: { syncFromRoot: false }
    };

    tree.write('libs/mcp/package.json', JSON.stringify(manifest));
    tree.write('libs/mcp/README.md', '# @xui/mcp\n');

    await updateProjectsGenerator(tree);

    expect(JSON.parse(tree.read('libs/mcp/package.json', 'utf-8') ?? '{}')).toEqual(manifest);
    expect(tree.read('libs/mcp/README.md', 'utf-8')).toBe('# @xui/mcp\n');
  });
});
