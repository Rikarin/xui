import { withThemeByClassName } from '@storybook/addon-themes';
// Imported here rather than via the executor's `styles` option: the Vite builder
// injects that option as a workspace-relative path Rollup cannot resolve.
import './tailwind.css';

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark'
    },
    defaultTheme: 'dark'
  })
];

const preview = {
  decorators,

  parameters: {
    options: {
      storySort: {
        method: 'alphabetical'
      }
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },

  tags: ['autodocs']
};

export default preview;
