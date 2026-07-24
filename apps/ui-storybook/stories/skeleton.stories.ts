import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { XuiSkeleton, XuiSkeletonImports } from '@xui/skeleton';

export default {
  title: 'Skeleton',
  component: XuiSkeleton,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiSkeletonImports]
    })
  ]
} as Meta<XuiSkeleton>;

type Story = StoryObj<XuiSkeleton>;

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
