import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiProgressBar, XuiProgressBarImports } from '@xui/progress-bar';

const COLORS = ['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;

const meta: Meta<XuiProgressBar> = {
  title: 'Feedback/Progress bar',
  component: XuiProgressBar,
  args: {
    value: 0.6,
    color: 'primary',
    size: 'md',
    stripes: true,
    animate: true
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    color: {
      options: COLORS,
      control: { type: 'select' }
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    stripes: { control: { type: 'boolean' } },
    animate: { control: { type: 'boolean' } }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiProgressBarImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<div class="max-w-sm"><xui-progress-bar ${argsToTemplate(args)} /></div>`
  })
};

export default meta;
type Story = StoryObj<XuiProgressBar>;

export const Default: Story = {};

/** Without a value the bar fills the track — use it when progress cannot be measured. */
export const Indeterminate: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `<div class="max-w-sm"><xui-progress-bar ${argsToTemplate(args, { exclude: ['value'] })} /></div>`
  })
};

export const Sizes: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div class="flex max-w-sm flex-col gap-4">
        <xui-progress-bar size="sm" ${argsToTemplate(args, { exclude: ['size'] })} />
        <xui-progress-bar size="md" ${argsToTemplate(args, { exclude: ['size'] })} />
        <xui-progress-bar size="lg" ${argsToTemplate(args, { exclude: ['size'] })} />
      </div>
    `
  })
};

export const Colors: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div class="flex max-w-sm flex-col gap-4">
        <xui-progress-bar color="primary" ${argsToTemplate(args, { exclude: ['color'] })} />
        <xui-progress-bar color="secondary" ${argsToTemplate(args, { exclude: ['color'] })} />
        <xui-progress-bar color="success" ${argsToTemplate(args, { exclude: ['color'] })} />
        <xui-progress-bar color="error" ${argsToTemplate(args, { exclude: ['color'] })} />
        <xui-progress-bar color="warning" ${argsToTemplate(args, { exclude: ['color'] })} />
        <xui-progress-bar color="info" ${argsToTemplate(args, { exclude: ['color'] })} />
      </div>
    `
  })
};

/** Flat bars, for dense layouts where the moving stripes would be noise. */
export const WithoutStripes: Story = {
  args: { stripes: false }
};
