import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import type * as TS from 'typescript';
import { parseLibraryFile } from './parse-source.js';
import { parseStoryFile } from './parse-stories.js';
import { parseTokens } from './parse-tokens.js';
import type { XuiComponent, XuiDoc, XuiIndex } from './types.js';
import { readJson, readText } from './workspace.js';

const STORIES_DIR = join('apps', 'ui-storybook', 'stories');
const THEME_FILE = join('libs', 'core', 'styles', 'theme.css');
const DOCS_DIR = join('apps', 'app', 'docs');

/** `typescript` is only needed to extract from a checkout, so it is loaded on demand. */
export async function loadTypeScript(): Promise<typeof TS> {
  // `typescript` is CJS, so an ESM `import()` of it may land on the namespace or on its `default`
  // interop wrapper depending on the loader; accept either.
  const loaded = (await import('typescript')) as unknown as typeof TS & { default?: typeof TS };

  return loaded.default ?? loaded;
}

interface PackageJson {
  name: string;
  version: string;
  description?: string;
  peerDependencies?: Record<string, string>;
}

export async function buildIndex(workspaceRoot: string): Promise<XuiIndex> {
  const ts = await loadTypeScript();
  const core = readJson<PackageJson>(join(workspaceRoot, 'libs', 'core', 'package.json'));

  const components = [
    ...uiPackages(workspaceRoot).map(path => buildComponent(ts, workspaceRoot, path, 'ui')),
    ...corePackages(workspaceRoot).map(path => buildComponent(ts, workspaceRoot, path, 'core'))
  ]
    .filter((component): component is XuiComponent => component !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  const themeCss = readText(join(workspaceRoot, THEME_FILE));

  return {
    version: core?.version ?? '0.0.0',
    generatedAt: new Date().toISOString(),
    source: 'workspace',
    workspaceRoot,
    components,
    tokens: themeCss ? parseTokens(themeCss) : [],
    docs: buildDocs(workspaceRoot)
  };
}

/** `libs/ui/<name>/xui` - the styled packages. */
function uiPackages(workspaceRoot: string): string[] {
  const root = join(workspaceRoot, 'libs', 'ui');

  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root)
    .map(name => join(root, name, 'xui'))
    .filter(path => existsSync(join(path, 'package.json')) && existsSync(join(path, 'src')));
}

/**
 * `libs/core/<name>` - the headless secondary entrypoints. They have an `ng-package.json` but no
 * `package.json` of their own, which is what tells them apart from the primary `libs/core`.
 */
function corePackages(workspaceRoot: string): string[] {
  const root = join(workspaceRoot, 'libs', 'core');

  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root)
    .map(name => join(root, name))
    .filter(
      path =>
        statSync(path).isDirectory() &&
        existsSync(join(path, 'ng-package.json')) &&
        !existsSync(join(path, 'package.json')) &&
        existsSync(join(path, 'src'))
    );
}

function buildComponent(
  ts: typeof TS,
  workspaceRoot: string,
  packageRoot: string,
  kind: XuiComponent['kind']
): XuiComponent | undefined {
  const name = kind === 'ui' ? basename(join(packageRoot, '..')) : basename(packageRoot);
  const manifest = readJson<PackageJson>(join(packageRoot, 'package.json'));
  const corePackage = readJson<PackageJson>(join(workspaceRoot, 'libs', 'core', 'package.json'));

  const symbols = [];
  const types = [];
  const configApi: string[] = [];

  for (const file of sourceFiles(join(packageRoot, 'src'))) {
    const text = readText(file);

    if (!text) {
      continue;
    }

    const parsed = parseLibraryFile(ts, relative(workspaceRoot, file), text);
    symbols.push(...parsed.symbols);
    types.push(...parsed.types);
    configApi.push(...parsed.configApi);
  }

  const barrel = readText(join(packageRoot, 'src', 'index.ts')) ?? '';
  const importsConst = barrel.match(/export const (Xui\w*Imports)\b/)?.[1];

  const storyPath = kind === 'ui' ? join(workspaceRoot, STORIES_DIR, `${name}.stories.ts`) : undefined;
  const storyText = storyPath ? readText(storyPath) : undefined;
  const story = storyText ? parseStoryFile(ts, relative(workspaceRoot, storyPath as string), storyText) : undefined;

  return {
    name,
    kind,
    package: manifest?.name ?? `@xui/core/${name}`,
    version: manifest?.version ?? corePackage?.version ?? '0.0.0',
    description: manifest?.description,
    path: relative(workspaceRoot, packageRoot),
    peerDependencies: manifest?.peerDependencies ?? corePackage?.peerDependencies ?? {},
    importsConst,
    exports: [...new Set([...symbols.map(symbol => symbol.name), ...types.map(type => type.name)])],
    configApi: [...new Set(configApi)],
    symbols,
    types,
    examples: story?.examples ?? [],
    exampleImports: story?.imports ?? [],
    storyPath: storyText && storyPath ? relative(workspaceRoot, storyPath) : undefined
  };
}

/** Every non-spec `.ts` under a package's `src`, deepest-first order irrelevant. */
function sourceFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }

  const found: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);

    if (entry.isDirectory()) {
      found.push(...sourceFiles(path));
    } else if (
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.endsWith('.d.ts') &&
      entry.name !== 'test-setup.ts'
    ) {
      found.push(path);
    }
  }

  return found;
}

/**
 * Documentation topics: the ng-doc pages under `apps/app/docs`, plus the sections of the root
 * README. Several ng-doc pages are still `TODO` stubs while the README carries the real
 * installation and theming instructions, so stubs are dropped rather than answered with.
 */
function buildDocs(workspaceRoot: string): XuiDoc[] {
  return [...ngDocPages(workspaceRoot), ...readmeSections(workspaceRoot)].sort((a, b) => a.slug.localeCompare(b.slug));
}

function isStub(content: string): boolean {
  return content.replace(/^>.*$/gm, '').trim().length < 120;
}

function ngDocPages(workspaceRoot: string): XuiDoc[] {
  const root = join(workspaceRoot, DOCS_DIR);

  if (!existsSync(root)) {
    return [];
  }

  const docs: XuiDoc[] = [];

  for (const category of readdirSync(root, { withFileTypes: true })) {
    if (!category.isDirectory()) {
      continue;
    }

    for (const page of readdirSync(join(root, category.name), { withFileTypes: true })) {
      if (!page.isDirectory()) {
        continue;
      }

      const markdownPath = join(root, category.name, page.name, 'index.md');
      const content = readText(markdownPath);

      if (!content || isStub(content)) {
        continue;
      }

      const pageSource = readText(join(root, category.name, page.name, 'ng-doc.page.ts')) ?? '';

      docs.push({
        slug: `${category.name}/${page.name}`,
        title: pageSource.match(/title:\s*'([^']+)'/)?.[1] ?? content.match(/^#\s+(.+)$/m)?.[1] ?? page.name,
        path: relative(workspaceRoot, markdownPath),
        content
      });
    }
  }

  return docs;
}

/** `## Heading` sections of the root README, which is where setup and theming are documented. */
function readmeSections(workspaceRoot: string): XuiDoc[] {
  const path = join(workspaceRoot, 'README.md');
  const content = readText(path);

  if (!content) {
    return [];
  }

  const docs: XuiDoc[] = [];
  const sections = content.split(/^## /m).slice(1);

  for (const section of sections) {
    const title = section.split('\n', 1)[0].trim();
    const body = section.slice(title.length).trim();
    const slug = `readme/${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`;

    if (!body || /^table-of-contents|^packages$/.test(slug.slice('readme/'.length))) {
      continue;
    }

    docs.push({ slug, title, path: 'README.md', content: `## ${title}\n\n${body}` });
  }

  return docs;
}
