import { type Tree, formatFiles, readJsonFile } from '@nx/devkit';
import replaceUiVersionGenerator from '../replace-ui-version/generator';

export default async function autoIncrementVersion(tree: Tree): Promise<void> {
  const oldVersion = readJsonFile('libs/core/package.json').version as string;
  const [prefix, branchAndNumber] = oldVersion.split('-');
  const [branch, patch] = branchAndNumber.split('.');

  const newPatch = +patch + 1;
  const newVersion = `${prefix}-${branch}.${newPatch}`;

  console.log(
    `preparing release with auto-incremented version ${newVersion} which should be 1 more than ${oldVersion}`
  );

  await replaceUiVersionGenerator(tree, { newVersion });
  // await replaceCliVersionGenerator(tree, { newVersion });
  await formatFiles(tree);
}
