import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiDivider, XuiDividerImports } from '@xui/divider';

const meta: Meta<XuiDivider> = {
  title: 'Layout/Divider',
  component: XuiDivider,
  args: {
    orientation: 'horizontal',
    compact: false
  },
  argTypes: {
    orientation: {
      options: ['horizontal', 'vertical'],
      control: { type: 'select' }
    },
    compact: { control: { type: 'boolean' } }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiDividerImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div class="max-w-sm">
        <p>Above the rule</p>
        <div xuiDivider ${argsToTemplate(args)}></div>
        <p>Below the rule</p>
      </div>
    `
  })
};

export default meta;
type Story = StoryObj<XuiDivider>;

export const Default: Story = {};

/** A vertical divider stretches to its flex parent's height on its own. */
export const Vertical: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div class="flex items-center">
        <span>Left</span>
        <div xuiDivider ${argsToTemplate({ ...args, orientation: 'vertical' })}></div>
        <span>Middle</span>
        <div xuiDivider ${argsToTemplate({ ...args, orientation: 'vertical' })}></div>
        <span>Right</span>
      </div>
    `
  })
};

/** `compact` removes the surrounding margin, for menus and toolbars. */
export const Compact: Story = {
  render: () => ({
    template: `
      <div class="max-w-sm">
        <p>Spaced</p>
        <div xuiDivider></div>
        <p>Spaced</p>

        <div class="mt-6 border-border rounded-lg border">
          <p class="p-2">Flush</p>
          <div xuiDivider compact></div>
          <p class="p-2">Flush</p>
        </div>
      </div>
    `
  })
};
