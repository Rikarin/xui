import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiCardImports } from '@xui/card';
import { XuiCardList, XuiCardListImports } from '@xui/card-list';

const ROWS = ['Design review', 'Backend migration', 'Release checklist'];

const meta: Meta<XuiCardList> = {
  title: 'Card List',
  component: XuiCardList,
  args: { bordered: true, compact: false },
  argTypes: {
    bordered: { control: { type: 'boolean' } },
    compact: { control: { type: 'boolean' } }
  },
  decorators: [moduleMetadata({ imports: [XuiCardListImports, XuiCardImports] })],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div xuiCardList class="w-80" ${argsToTemplate(args)}>
        ${ROWS.map(row => `<button xuiCard interactive class="text-left">${row}</button>`).join('\n        ')}
      </div>
    `
  })
};

export default meta;
type Story = StoryObj<XuiCardList>;

export const Default: Story = {};

/** `compact` cascades to every row, so the child cards do not each need it. */
export const Compact: Story = { args: { compact: true } };

/** Drop the frame when the list is nested inside another bordered container. */
export const Unbordered: Story = { args: { bordered: false } };
