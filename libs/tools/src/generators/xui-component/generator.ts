import { formatFiles, generateFiles, joinPathFragments, names, readProjectConfiguration, Tree } from '@nx/devkit';
import * as path from 'path';
import { addExportStatement, addImportStatement, addToExportConstArray } from '../utils/ast';
import { XuiComponentGeneratorSchema } from './schema';

export async function xuiComponentGenerator(tree: Tree, options: XuiComponentGeneratorSchema) {
  const { root } = readProjectConfiguration(tree, options.project);
  const { fileName, className, propertyName } = names(options.componentName);
  const componentPath = joinPathFragments(root, 'src', 'lib');

  generateFiles(tree, path.join(__dirname, 'files'), componentPath, {
    fileName,
    propertyVariantsName: `${propertyName}Variants`,
    variantsName: `${className}Variants`,
    componentName: `Xui${className}Component`,
    selector: `xui-${fileName}`
  });

  // the path to the index.ts file
  const indexPath = joinPathFragments(root, 'src', 'index.ts');
  let sourceCode = tree.read(indexPath, 'utf-8');

  sourceCode = addImportStatement(
    sourceCode,
    `import { Xui${className}Component } from './lib/${fileName}.component';`
  );
  sourceCode = addExportStatement(sourceCode, `export * from './lib/${fileName}.component';`);
  sourceCode = addToExportConstArray(sourceCode, `Xui${className}Component`);

  tree.write(indexPath, sourceCode);
  await formatFiles(tree);
}

export default xuiComponentGenerator;
