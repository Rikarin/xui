import { libraryGenerator, UnitTestRunner } from '@nx/angular/generators';
import { formatFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import xuiComponentGenerator from '../xui-component/generator';
import xuiDirectiveGenerator from '../xui-directive/generator';
import xuiStoryGenerator from '../xui-story/generator';
import { XuiLibraryGeneratorSchema } from './schema';

export async function xuiLibraryGenerator(tree: Tree, options: XuiLibraryGeneratorSchema) {
  const { fileName: normalizedName, className } = names(options.name);
  const projectName = normalizedName;

  await libraryGenerator(tree, {
    name: projectName,
    directory: joinPathFragments('libs', 'ui', normalizedName, 'xui'),
    importPath: `@xui/${normalizedName}`,
    prefix: 'xui',
    linter: 'eslint',
    standalone: true,
    strict: true,
    inlineStyle: true,
    inlineTemplate: true,
    unitTestRunner: UnitTestRunner.Jest,
    publishable: true,
    buildable: true,
    skipModule: true,
    tags: 'ui'
  });

  // remove the default component
  const srcPath = joinPathFragments('libs', 'ui', normalizedName, 'xui', 'src');
  tree.delete(joinPathFragments(srcPath, 'lib', projectName, `${projectName}.component.ts`));
  tree.delete(joinPathFragments(srcPath, 'lib', projectName, `${projectName}.component.spec.ts`));

  // empty the index.ts file
  tree.write(
    joinPathFragments(srcPath, 'index.ts'),
    `import { NgModule } from '@angular/core';

export const Xui${className}Imports = [] as const;

@NgModule({
	imports: [...Xui${className}Imports],
	exports: [...Xui${className}Imports],
})
export class Xui${className}Module {}`
  );

  // TODO
  // update the supported libraries json
  // const supportedLibrariesPath = joinPathFragments(
  //   'libs',
  //   'cli',
  //   'src',
  //   'generators',
  //   'ui',
  //   'supported-ui-libraries.json',
  // );
  //
  // updateJson(tree, supportedLibrariesPath, (json) => {
  //   json[normalizedName.replaceAll('-', '')] = {
  //     internalName: projectName,
  //     peerDependencies: {
  //       '@angular/core': `>=${VERSION.major}.0.0`,
  //       'class-variance-authority': '^0.7.0',
  //       clsx: '^2.1.1',
  //     },
  //   };
  //   return json;
  // });

  // TODO
  // create the generator files
  //   const generatorPath = joinPathFragments(
  //     'libs',
  //     'cli',
  //     'src',
  //     'generators',
  //     'ui',
  //     'libs',
  //     projectName,
  //     'generator.ts',
  //   );
  //
  //   tree.write(
  //     generatorPath,
  //     `import { Tree } from '@nx/devkit';
  // import hlmBaseGenerator from '../../../base/generator';
  // import type { HlmBaseGeneratorSchema } from '../../../base/schema';
  //
  // export async function generator(tree: Tree, options: HlmBaseGeneratorSchema) {
  // 	return await hlmBaseGenerator(tree, {
  // 		...options,
  // 		primitiveName: '${normalizedName}',
  // 		internalName: '${projectName}',
  // 		publicName: '${projectName}',
  // 	});
  // }`,
  //   );

  if (options.generate !== 'none' && options.story) {
    await xuiStoryGenerator(tree, {
      project: projectName,
      componentName: options.generate === 'component' ? `Xui${className}Component` : `Xui${className}Directive`
    });
  }

  if (options.generate === 'component') {
    await xuiComponentGenerator(tree, {
      project: projectName,
      componentName: normalizedName
    });
  } else if (options.generate === 'directive') {
    await xuiDirectiveGenerator(tree, {
      project: projectName,
      directiveName: normalizedName
    });
  }

  // TODO
  // if (options.documentation) {
  //   await helmDocumentationGenerator(tree, {
  //     name: options.name,
  //     description: options.description ?? 'TODO: Add a description',
  //   });
  // }

  await formatFiles(tree);
}

export default xuiLibraryGenerator;
