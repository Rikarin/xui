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
      // Sorted by hand rather than with `order` + `method`, because the two built-in choices are
      // both wrong here: `alphabetical` sorts a component's own stories too, so `Colors` would open
      // before `Default`, while leaving it off falls back to file-discovery order, which lists
      // "Button group" before "Button". This keeps groups in build order, components alphabetical
      // within a group, and every component's stories in the order they were written.
      // The index builder serialises this function and evaluates it on its own, so it cannot close
      // over anything in this module - the group list has to live inside it.
      storySort: (a, b) => {
        const groups = [
          'Foundations',
          'Actions',
          'Forms',
          'Date & time',
          'Data display',
          'Navigation',
          'Overlays',
          'Feedback',
          'Layout',
          'Visualisation'
        ];

        if (a.title === b.title) {
          return 0;
        }

        const groupOf = title => {
          const index = groups.indexOf(title.split('/')[0]);

          // An unlisted group sorts after the known ones instead of silently jumping to the top.
          return index === -1 ? groups.length : index;
        };

        // The introduction is the one page that should not be alphabetised into the middle.
        const rank = title => (title.endsWith('/Introduction') ? 0 : 1);

        return (
          groupOf(a.title) - groupOf(b.title) ||
          rank(a.title) - rank(b.title) ||
          a.title.localeCompare(b.title, undefined, { numeric: true })
        );
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
