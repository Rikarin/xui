import { formatFiles, generateFiles, joinPathFragments, names, readProjectConfiguration, Tree } from '@nx/devkit';
import * as path from 'path';
import { addExportStatement, addImportStatement, addToExportConstArray } from '../utils/ast';
import { XuiDirectiveGeneratorSchema } from './schema';

export async function xuiDirectiveGenerator(tree: Tree, options: XuiDirectiveGeneratorSchema) {
  const { root } = readProjectConfiguration(tree, options.project);
  const { fileName, className, propertyName } = names(options.directiveName);
  const directivePath = joinPathFragments(root, 'src', 'lib');

  // Published directives are named `Xui<Name>` and live in `<name>.ts` — no
  // `Directive` suffix, no `.directive.` infix. `libs/ui/button` is the reference.
  const directiveName = `Xui${className}`;

  generateFiles(tree, path.join(__dirname, 'files'), directivePath, {
    fileName,
    className,
    directiveName,
    propertyVariantsName: `${propertyName}Variants`,
    variantsName: `${className}Variants`,
    selector: `xui${className}`
  });

  // the path to the index.ts file
  const indexPath = joinPathFragments(root, 'src', 'index.ts');
  let sourceCode = tree.read(indexPath, 'utf-8');
  if (sourceCode === null) {
    throw new Error(`Cannot read ${indexPath}.`);
  }

  sourceCode = addImportStatement(sourceCode, `import { ${directiveName} } from './lib/${fileName}';`);
  sourceCode = addExportStatement(sourceCode, `export * from './lib/${fileName}';`);
  sourceCode = addExportStatement(sourceCode, `export * from './lib/${fileName}.token';`);
  sourceCode = addToExportConstArray(sourceCode, directiveName);

  tree.write(indexPath, sourceCode);
  await formatFiles(tree);
}

export default xuiDirectiveGenerator;
