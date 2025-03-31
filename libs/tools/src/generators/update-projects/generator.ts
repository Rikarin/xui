import { Tree, formatFiles } from '@nx/devkit';

export default async function updateProjectsGenerator(tree: Tree) {
  const rootPackageJsonPath = 'package.json';
  const rootReadmePath = 'README.md';

  if (!tree.exists(rootPackageJsonPath)) {
    throw new Error('Root package.json not found.');
  }

  const rootReadmeContent = tree.read(rootReadmePath, 'utf-8');
  const rootPackageJson = JSON.parse(tree.read(rootPackageJsonPath, 'utf-8'));

  function updatePackageJson(packageJsonPath: string) {
    const packageJson = JSON.parse(tree.read(packageJsonPath, 'utf-8'));
    packageJson.author = rootPackageJson.author;
    packageJson.description = rootPackageJson.description;
    packageJson.maintainers = rootPackageJson.maintainers;
    packageJson.keywords = rootPackageJson.keywords;
    packageJson.repository = rootPackageJson.repository;
    packageJson.bugs = rootPackageJson.bugs;
    packageJson.homepage = rootPackageJson.homepage;
    packageJson.license = rootPackageJson.license;

    tree.write(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }

  function copyReadme(libDir: string) {
    const readmePath = `${libDir}/README.md`;
    tree.write(readmePath, rootReadmeContent);
  }

  function scanAndUpdate(dir: string) {
    for (const entry of tree.children(dir)) {
      const entryPath = `${dir}/${entry}`;

      if (tree.isFile(entryPath) && entry === 'package.json') {
        updatePackageJson(entryPath);
        copyReadme(dir);
      } else if (!tree.isFile(entryPath)) {
        scanAndUpdate(entryPath);
      }
    }
  }

  scanAndUpdate('libs');
  await formatFiles(tree);
}
