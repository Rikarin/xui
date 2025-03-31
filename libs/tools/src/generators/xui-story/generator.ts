import { formatFiles, generateFiles, names, readJson, readProjectConfiguration, Tree } from '@nx/devkit';
import * as path from 'path';
import { XuiStoryGeneratorSchema } from './schema';

export async function xuiStoryGenerator(tree: Tree, options: XuiStoryGeneratorSchema) {
  const { root, name } = readProjectConfiguration(tree, options.project);

  if (!name) {
    throw new Error(`Could not find project name in workspace: ${options.project}`);
  }

  // derive the story name - e.g. radio-button => Radio Button
  const storyName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  // derive the imports name from the name - e.g. radio-button => XuiRadioButtonImports
  const componentImports = `Xui${name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}Imports`;

  const { name: importPath } = readJson(tree, path.join(root, 'package.json'));
  const projectRoot = path.join(root, '..');

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    fileName: names(options.componentName).fileName,
    componentName: options.componentName,
    componentImports,
    importPath,
    storyName
  });

  await formatFiles(tree);
}

export default xuiStoryGenerator;
