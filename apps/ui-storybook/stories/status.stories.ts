import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { XuiStatus, XuiStatusImports } from '@xui/status';

/**
 * A coloured dot with a label, for the state of a thing — online, degraded, failed.
 */
export default {
  title: 'Data display/Status',
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
