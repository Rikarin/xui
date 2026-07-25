import { withThemeByClassName } from '@storybook/addon-themes';
// Imported here rather than via the executor's `styles` option: the Vite builder
// injects that option as a workspace-relative path Rollup cannot resolve.
import './tailwind.css';

// Components read the layout direction through `@angular/cdk/bidi`, which walks
// up to the nearest `dir` attribute — so setting it on <html> is enough to put
// every story into RTL without touching the stories themselves.
const withDirection = (story, context) => {
  document.documentElement.dir = context.globals.direction ?? 'ltr';
  return story();
};

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark'
    },
    defaultTheme: 'dark'
  }),
  withDirection
];

export const globalTypes = {
  direction: {
    description: 'Layout direction',
    defaultValue: 'ltr',
    toolbar: {
      title: 'Direction',
      icon: 'transfer',
      items: [
        { value: 'ltr', title: 'LTR' },
        { value: 'rtl', title: 'RTL' }
      ],
      dynamicTitle: true
    }
  }
};

const preview = {
  decorators,
  globalTypes,

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
