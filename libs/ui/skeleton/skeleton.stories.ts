import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { XuiSkeletonComponent, XuiSkeletonImports } from './xui/src';

export default {
  title: 'Skeleton',
  component: XuiSkeletonComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiSkeletonImports]
    })
  ]
} as Meta<XuiSkeletonComponent>;

type Story = StoryObj<XuiSkeletonComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <div class="flex gap-4 items-center w-fit">
        <xui-skeleton class="w-12 h-12 rounded-full" />
        <div class="space-y-2">
          <xui-skeleton class="h-4 w-[250px]" />
          <xui-skeleton class="h-4 w-[200px]" />
        </div>
      </div>
		`
  })
};
