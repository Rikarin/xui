import { formatFiles, generateFiles, joinPathFragments, names, readProjectConfiguration, Tree } from '@nx/devkit';
import * as path from 'path';
import { addExportStatement, addImportStatement, addToExportConstArray } from '../utils/ast';
import { XuiComponentGeneratorSchema } from './schema';

export async function xuiComponentGenerator(tree: Tree, options: XuiComponentGeneratorSchema) {
  const { root } = readProjectConfiguration(tree, options.project);
  const { fileName, className, propertyName } = names(options.componentName);
  const componentPath = joinPathFragments(root, 'src', 'lib');

  // Published components are named `Xui<Name>` and live in `<name>.ts` — no
  // `Component` suffix, no `.component.` infix. `libs/ui/checkbox` is the reference.
  const componentName = `Xui${className}`;

  generateFiles(tree, path.join(__dirname, 'files'), componentPath, {
    fileName,
    className,
    componentName,
    propertyVariantsName: `${propertyName}Variants`,
    variantsName: `${className}Variants`,
    selector: `xui-${fileName}`
  });

  // the path to the index.ts file
  const indexPath = joinPathFragments(root, 'src', 'index.ts');
  let sourceCode = tree.read(indexPath, 'utf-8');
  if (sourceCode === null) {
    throw new Error(`Cannot read ${indexPath}.`);
  }

  sourceCode = addImportStatement(sourceCode, `import { ${componentName} } from './lib/${fileName}';`);
  sourceCode = addExportStatement(sourceCode, `export * from './lib/${fileName}';`);
  sourceCode = addExportStatement(sourceCode, `export * from './lib/${fileName}.token';`);
  sourceCode = addToExportConstArray(sourceCode, componentName);

  tree.write(indexPath, sourceCode);
  await formatFiles(tree);
}

export default xuiComponentGenerator;
