import { formatFiles, generateFiles, names, readJson, readProjectConfiguration, Tree } from '@nx/devkit';
import * as path from 'path';
import { XuiStoryGeneratorSchema } from './schema';

const COLORS = ['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

/**
 * Build the markup a story renders.
 *
 * `bindings` lands verbatim in the generated file inside a JS template literal,
 * so `${argsToTemplate(args)}` is interpolated by the story at runtime, not here.
 */
function usage(kind: 'component' | 'directive', selector: string, bindings: string, extra = ''): string {
  const attrs = [extra, bindings].filter(Boolean).join(' ');

  return kind === 'component' ? `<${selector} ${attrs}>Label</${selector}>` : `<div ${selector} ${attrs}>Label</div>`;
}

export async function xuiStoryGenerator(tree: Tree, options: XuiStoryGeneratorSchema) {
  const { root, name } = readProjectConfiguration(tree, options.project);

  if (!name) {
    throw new Error(`Could not find project name in workspace: ${options.project}`);
  }

  const kind = options.kind ?? 'component';
  const { className, fileName } = names(name);

  // derive the story name - e.g. radio-button => Radio Button
  const storyName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  // derive the imports name from the name - e.g. radio-button => XuiRadioButtonImports
  const componentImports = `Xui${className}Imports`;
  const selector = kind === 'component' ? `xui-${fileName}` : `xui${className}`;

  const { name: importPath } = readJson(tree, path.join(root, 'package.json'));

  // Stories live in the central Storybook app, not next to the library, so the
  // published packages stay free of dev-only files.
  const storiesRoot = path.join('apps', 'ui-storybook', 'stories');

  generateFiles(tree, path.join(__dirname, 'files'), storiesRoot, {
    fileName,
    componentName: options.componentName,
    componentImports,
    importPath,
    storyName,
    usage: usage(kind, selector, '${argsToTemplate(args)}'),
    sizesUsage: SIZES.map(size => usage(kind, selector, '${rest}', `size="${size}"`)).join('\n          '),
    colorsUsage: COLORS.map(color => usage(kind, selector, '${rest}', `color="${color}"`)).join('\n          ')
  });

  await formatFiles(tree);
}

export default xuiStoryGenerator;
