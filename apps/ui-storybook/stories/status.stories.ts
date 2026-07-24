import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { XuiStatus, XuiStatusImports } from '@xui/status';

export default {
  title: 'Status',
  component: XuiStatus,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiStatusImports]
    })
  ]
} as Meta<XuiStatus>;

type Story = StoryObj<XuiStatus>;

export const Default: Story = {
  render: () => ({
    template: `
      <div class="inline-flex gap-2">
        <xui-status variant="online" />
        <xui-status variant="idle" />
        <xui-status variant="dnd" />
        <xui-status variant="offline" />
      </div>
		`
  })
};
