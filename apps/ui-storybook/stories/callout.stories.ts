import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiCallout, XuiCalloutImports } from '@xui/callout';

const COLORS = ['none', 'primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;

const meta: Meta<XuiCallout> = {
  title: 'Callout',
  component: XuiCallout,
  args: { color: 'none', minimal: false, compact: false, title: 'Heads up' },
  argTypes: {
    color: { options: COLORS, control: { type: 'select' } },
    minimal: { control: { type: 'boolean' } },
    compact: { control: { type: 'boolean' } }
  },
  decorators: [moduleMetadata({ imports: [XuiCalloutImports] })],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <xui-callout class="max-w-md" ${argsToTemplate(args)}>
        Saving will overwrite the existing draft.
      </xui-callout>
    `
  })
};

export default meta;
type Story = StoryObj<XuiCallout>;

export const Default: Story = {};

/** A colour implies an icon, so the common case needs no icon input at all. */
export const Colors: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-md flex-col gap-3">
        ${COLORS.map(
          c => `<xui-callout color="${c}" title="${c}">Saving will overwrite the existing draft.</xui-callout>`
        ).join('\n        ')}
      </div>
    `
  })
};

export const WithoutTitle: Story = { args: { title: null } };

/** `minimal` keeps the border but drops the tinted fill. */
export const Minimal: Story = { args: { minimal: true, color: 'warning' } };

export const Compact: Story = { args: { compact: true, color: 'info' } };
