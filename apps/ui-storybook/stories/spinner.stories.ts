import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiSpinner, XuiSpinnerImports } from '@xui/spinner';

const COLORS = ['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;

const meta: Meta<XuiSpinner> = {
  title: 'Spinner',
  component: XuiSpinner,
  args: {
    color: 'primary',
    size: 'md'
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: { type: 'select' }
    },
    color: {
      options: [...COLORS, 'inherit'],
      control: { type: 'select' }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiSpinnerImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<xui-spinner ${argsToTemplate(args)}>Loading</xui-spinner>`
  })
};

export default meta;
type Story = StoryObj<XuiSpinner>;

/** Without a value the spinner turns indefinitely. */
export const Default: Story = {};

/** With a value it draws the matching arc instead of spinning. */
export const Determinate: Story = {
  args: { value: 0.7 },
  render: ({ ...args }) => {
    const rest = argsToTemplate(args, { exclude: ['value'] });

    return {
      props: args,
      template: `
        <div class="flex items-center gap-4">
          ${[0, 0.25, 0.5, 0.75, 1]
            .map(value => `<xui-spinner [value]="${value}" ${rest}>${value * 100}%</xui-spinner>`)
            .join('\n          ')}
        </div>
      `
    };
  }
};

export const Sizes: Story = {
  render: ({ ...args }) => {
    const rest = argsToTemplate(args, { exclude: ['size'] });

    return {
      props: args,
      template: `
        <div class="flex items-center gap-4">
          ${['xs', 'sm', 'md', 'lg', 'xl']
            .map(size => `<xui-spinner size="${size}" ${rest}>Loading</xui-spinner>`)
            .join('\n          ')}
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
        <div class="flex items-center gap-4">
          ${COLORS.map(color => `<xui-spinner color="${color}" ${rest}>Loading</xui-spinner>`).join('\n          ')}
        </div>
      `
    };
  }
};
