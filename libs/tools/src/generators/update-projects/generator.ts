import { Tree, formatFiles } from '@nx/devkit';

export default async function updateProjectsGenerator(tree: Tree) {
  const rootPackageJsonPath = 'package.json';
  const rootReadmePath = 'README.md';
  const rootLicensePath = 'LICENSE';

  if (!tree.exists(rootPackageJsonPath)) {
    throw new Error('Root package.json not found.');
  }

  function read(path: string): string {
    const content = tree.read(path, 'utf-8');
    if (content === null) {
      throw new Error(`Cannot read ${path}.`);
    }
    return content;
  }

  const rootReadmeContent = read(rootReadmePath);
  const rootLicenseContent = read(rootLicensePath);
  const rootPackageJson = JSON.parse(read(rootPackageJsonPath));

  /**
   * A package opts out with `"xui": { "syncFromRoot": false }`.
   *
   * The sync exists to keep the component packages - which share the library's description,
   * keywords and README - identical. A package that documents something else, such as `@xui/mcp`
   * with its own tool reference, would lose that content instead.
   */
  function syncsFromRoot(packageJson: { xui?: { syncFromRoot?: boolean } }): boolean {
    return packageJson.xui?.syncFromRoot !== false;
  }

  function updatePackageJson(packageJsonPath: string) {
    const packageJson = JSON.parse(read(packageJsonPath));
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

  /**
   * Apache 2.0 §4(a) asks that anyone receiving a redistribution receives the licence with it, so
   * every published package carries its own copy. Unlike the README this is not content a package
   * can reasonably differ on, so opting out of the sync does not opt out of this.
   */
  function copyLicense(libDir: string) {
    tree.write(`${libDir}/${rootLicensePath}`, rootLicenseContent);
  }

  function scanAndUpdate(dir: string) {
    for (const entry of tree.children(dir)) {
      const entryPath = `${dir}/${entry}`;

      if (tree.isFile(entryPath) && entry === 'package.json') {
        copyLicense(dir);

        if (!syncsFromRoot(JSON.parse(read(entryPath)))) {
          continue;
        }

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
