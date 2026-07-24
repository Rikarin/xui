import tailwindcss from '@tailwindcss/vite';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';

const config = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    // Supplies parameters.docs.renderer, which the `autodocs` tag below needs.
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-mcp')
  ],
  framework: {
    name: getAbsolutePath('@storybook/angular-vite'),
    options: {
      compodoc: false
    }
  },
  staticDirs: ['../public'],
  docs: {},

  // Storybook 10 builds Angular through Vite, so Tailwind is wired via the Vite
  // plugin instead of the postcss-loader the webpack builder used, and the
  // workspace `@xui/*` tsconfig paths need resolving explicitly.
  viteFinal: async config => {
    config.plugins = [
      ...(config.plugins ?? []),
      tailwindcss(),
      tsconfigPaths({ projects: [fileURLToPath(import.meta.resolve('../../../tsconfig.base.json'))] })
    ];
    return config;
  }
};

export default config;

function getAbsolutePath(value) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
