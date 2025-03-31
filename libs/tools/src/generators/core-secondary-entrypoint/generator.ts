import { librarySecondaryEntryPointGenerator } from '@nx/angular/generators';
import { formatFiles, Tree } from '@nx/devkit';
import { CoreSecondaryEntrypointGeneratorSchema } from './schema';

export async function coreSecondaryEntrypointGenerator(tree: Tree, options: CoreSecondaryEntrypointGeneratorSchema) {
  await librarySecondaryEntryPointGenerator(tree, {
    name: options.name,
    library: 'core',
    skipFormat: true,
    skipModule: true
  });

  await formatFiles(tree);
}

export default coreSecondaryEntrypointGenerator;
