import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiLink, XuiLinkImports } from '@xui/link';

const COLORS = ['link', 'primary', 'secondary', 'success', 'error', 'warning', 'info', 'inherit'] as const;

const meta: Meta<XuiLink> = {
  title: 'Foundations/Link',
  component: XuiLink,
  args: {
    color: 'link',
    underline: 'always'
  },
  argTypes: {
    color: {
      options: COLORS,
      control: { type: 'select' }
    },
    underline: {
      options: ['always', 'hover', 'none'],
      control: { type: 'select' }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiLinkImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<a xuiLink href="https://xuijs.org" ${argsToTemplate(args)}>Documentation</a>`
  })
};

export default meta;
type Story = StoryObj<XuiLink>;

export const Default: Story = {};

export const Underline: Story = {
  render: ({ ...args }) => {
    const rest = argsToTemplate(args, { exclude: ['underline'] });

    return {
      props: args,
      template: `
        <div class="flex flex-col items-start gap-2">
          <a xuiLink underline="always" ${rest}>always</a>
          <a xuiLink underline="hover" ${rest}>hover</a>
          <a xuiLink underline="none" ${rest}>none</a>
        </div>
      `
    };
  }
};

export const Colors: Story = {
  render: ({ ...args }) => {
    const rest = argsToTemplate(args, { exclude: ['color'] });

    return {
      props: args,
      template: `
        <div class="flex flex-col items-start gap-2">
          ${COLORS.map(color => `<a xuiLink color="${color}" ${rest}>${color}</a>`).join('\n          ')}
        </div>
      `
    };
  }
};

/** `color="inherit"` is the one to use for links inside a paragraph of body copy. */
export const InRunningText: Story = {
  render: () => ({
    template: `
      <p class="text-foreground-muted max-w-prose">
        Every component styles itself with semantic utilities that resolve through the
        <a xuiLink color="inherit" underline="hover" href="https://xuijs.org">token layer</a>,
        so switching theme re-colours the whole page without a rebuild.
      </p>
    `
  })
};
