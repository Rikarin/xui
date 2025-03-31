import tailwindcss from '@tailwindcss/postcss';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  stories: ['../../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@chromatic-com/storybook'
  ],
  framework: {
    name: '@storybook/angular',
    options: {}
  },
  staticDirs: ['../public'],
  docs: {},

  webpackFinal: async config => {
    config.module?.rules?.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [tailwindcss]
            }
          }
        }
      ],
      include: path.resolve(__dirname, '../')
    });
    return config;
  }
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
