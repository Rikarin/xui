import { type Tree, formatFiles, readJsonFile, updateJson } from '@nx/devkit';
import process from 'node:process';

const getXuiDependencyKeys = (dependencies?: Record<string, string>): string[] =>
  Object.keys(dependencies ?? {}).filter(key => key.startsWith('@xui'));

// export const replaceSpartanVersion = (content: string, oldVersion: string, newVersion: string): string => {
// 	/**
// 	 * Regular expression to match SPARTAN_VERSION constant:
// 	 * - `(SPARTAN_VERSION\\s*=\\s*['"])`:
// 	 *   1. `SPARTAN_VERSION`: Ensures the constant is named `SPARTAN_VERSION`.
// 	 *   4. `\\s*`: Matches zero or more spaces around the `=` sign.
// 	 *   5. `['"]`: Captures the opening quote (single or double).
// 	 *   6. Encloses the entire match before the version in group 1 (`$1`).
// 	 * - `${oldVersion}`: Matches the exact old version string.
// 	 * - `(['"])`: Captures the closing quote in group 2 (`$2`).
// 	 * - `g` flag: Ensures the regex replaces all matches globally, not just the first occurrence.
// 	 */
// 	const spartanVersionRegex = new RegExp(`(SPARTAN_VERSION\\s*=\\s*['"])${oldVersion}(['"])`, 'g');
// 	return content.replace(spartanVersionRegex, `$1${newVersion}$2`);
// };

// const replaceUiVersionInCliVersionsFile = (tree: Tree, oldVersion: string, newVersion: string) => {
// 	const filePath = `libs/cli/src/generators/base/versions.ts`;
// 	let contents = tree.read(filePath).toString();
// 	contents = replaceSpartanVersion(contents, oldVersion, newVersion);
// 	tree.write(filePath, contents);
// };

const replaceUiVersionGenerator = async (tree: Tree, options?: { newVersion: string }): Promise<void> => {
  const corePackageJsonPath = 'libs/core/package.json';
  const oldVersion = readJsonFile(corePackageJsonPath).version;
  const newVersion = options?.newVersion ?? process.env.VERSION;

  console.log(`oldVersion: ${oldVersion}`);

  if (!oldVersion) {
    console.error('Unable to find old version in core package.json.');
    return;
  }

  if (!newVersion) {
    console.error('Must define a VERSION environment variable to use with this script.');
    return;
  }

  if (oldVersion === newVersion) {
    console.error('Old version cannot be the same as new version');
    return;
  }

  console.log(`Updating UI libs version from ${oldVersion} to ${newVersion}`);

  // TODO: not exactly what I expected. Needs rework
  updateJson(tree, corePackageJsonPath, pkgJson => {
    console.log('Updating package.json', pkgJson);
    const peerDependencyKeysToUpdate = getXuiDependencyKeys(pkgJson.peerDependencies);
    pkgJson.version = newVersion;

    for (const key of peerDependencyKeysToUpdate) {
      pkgJson.peerDependencies[key] = newVersion;
    }

    return pkgJson;
  });

  // console.log(`Reflecting those changes in versions.ts file of the CLI`);
  // replaceUiVersionInCliVersionsFile(tree, oldVersion, newVersion);
  await formatFiles(tree);
};

export default replaceUiVersionGenerator;
