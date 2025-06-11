import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { XuiStatusComponent, XuiStatusImports } from '@xui/status';

export default {
  title: 'Status',
  component: XuiStatusComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiStatusImports]
    })
  ]
} as Meta<XuiStatusComponent>;

type Story = StoryObj<XuiStatusComponent>;

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
