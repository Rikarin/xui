import { libraryGenerator, UnitTestRunner } from '@nx/angular/generators';
import { formatFiles, joinPathFragments, names, readJson, Tree, updateJson } from '@nx/devkit';
import xuiComponentGenerator from '../xui-component/generator';
import xuiDirectiveGenerator from '../xui-directive/generator';
import xuiStoryGenerator from '../xui-story/generator';
import { XuiLibraryGeneratorSchema } from './schema';

export async function xuiLibraryGenerator(tree: Tree, options: XuiLibraryGeneratorSchema) {
  const { fileName: normalizedName, className } = names(options.name);
  const projectName = normalizedName;
  const projectRoot = joinPathFragments('libs', 'ui', normalizedName, 'xui');

  await libraryGenerator(tree, {
    name: projectName,
    directory: projectRoot,
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

  const srcPath = joinPathFragments(projectRoot, 'src');

  // Remove the placeholder component. Its file naming has changed across Nx
  // versions (`<name>.component.ts` → `<name>.ts`), so drop the whole directory
  // rather than named files.
  const placeholderDir = joinPathFragments(srcPath, 'lib', projectName);

  if (tree.exists(placeholderDir)) {
    tree.delete(placeholderDir);
  }

  // Seed the barrel with the `Xui<Name>Imports` const every package exports; the
  // component/directive generators below append to it. Deliberately not an
  // NgModule — every consumer imports the const into a standalone `imports` array.
  tree.write(joinPathFragments(srcPath, 'index.ts'), `export const Xui${className}Imports = [] as const;\n`);

  alignPackageJson(tree, projectRoot, normalizedName);
  alignSpecTsConfig(tree, projectRoot);
  alignJestConfig(tree, projectRoot, projectName);

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

  // Generated after the component/directive so the story's selector matches what
  // was actually produced.
  if (options.generate !== 'none' && options.story) {
    await xuiStoryGenerator(tree, {
      project: projectName,
      componentName: `Xui${className}`,
      kind: options.generate
    });
  }

  await formatFiles(tree);
}

/**
 * Bring the generated package.json in line with the published ones.
 *
 * The shared metadata (author, license, repository, …) is intentionally left to
 * `nx g @xui/tools:update-projects`, which syncs it from the root package.json.
 */
function alignPackageJson(tree: Tree, projectRoot: string, normalizedName: string) {
  const packageJsonPath = joinPathFragments(projectRoot, 'package.json');
  const { version } = readJson(tree, joinPathFragments('libs', 'core', 'package.json'));

  updateJson(tree, packageJsonPath, json => ({
    ...json,
    name: `@xui/${normalizedName}`,
    version,
    sideEffects: false,
    peerDependencies: {
      '@angular/core': '22',
      '@angular/cdk': '22',
      '@xui/core': version,
      'class-variance-authority': '^0.7.1',
      clsx: '^2.1.1'
    },
    publishConfig: { access: 'public' }
  }));
}

/**
 * `@nx/angular:library` writes an `include` rooted at the import path rather than
 * the tsconfig's own directory, so `src/**\/*.spec.ts` never matches and specs
 * fall outside the program. Repoint it at the project's own sources.
 */
function alignSpecTsConfig(tree: Tree, projectRoot: string) {
  const specTsConfigPath = joinPathFragments(projectRoot, 'tsconfig.spec.json');

  if (!tree.exists(specTsConfigPath)) {
    return;
  }

  updateJson(tree, specTsConfigPath, json => ({
    ...json,
    include: ['jest.config.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.d.ts']
  }));
}

/**
 * `@nx/angular:library` emits a CommonJS `jest.config.cts`. Every other library in
 * the workspace uses an ESM `jest.config.ts`, and the spec tsconfig's `include`
 * names that file — rewrite it and repoint the test target.
 */
function alignJestConfig(tree: Tree, projectRoot: string, projectName: string) {
  const generatedPath = joinPathFragments(projectRoot, 'jest.config.cts');
  const targetPath = joinPathFragments(projectRoot, 'jest.config.ts');
  // Jest resolves these against rootDir, which is the config's own directory.
  const toWorkspaceRoot = projectRoot
    .split('/')
    .map(() => '..')
    .join('/');

  if (tree.exists(generatedPath)) {
    tree.delete(generatedPath);
  }

  tree.write(
    targetPath,
    `export default {
  displayName: '${projectName}',
  preset: '${toWorkspaceRoot}/jest.preset.cjs',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '${toWorkspaceRoot}/coverage/${projectRoot}',
  transform: {
    '^.+\\\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\\\.(html|svg)$'
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ]
};
`
  );

  updateJson(tree, joinPathFragments(projectRoot, 'project.json'), json => {
    if (json.targets?.test?.options?.jestConfig) {
      json.targets.test.options.jestConfig = targetPath;
    }

    return json;
  });
}

export default xuiLibraryGenerator;
