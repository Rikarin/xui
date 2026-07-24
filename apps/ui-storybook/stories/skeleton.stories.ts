import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiSkeleton, XuiSkeletonImports } from '@xui/skeleton';
import { XuiTextImports } from '@xui/text';

const meta: Meta<XuiSkeleton> = {
  title: 'Skeleton',
  component: XuiSkeleton,
  decorators: [
    moduleMetadata({
      imports: [XuiSkeletonImports, XuiTextImports, XuiButtonImports]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiSkeleton>;

/** `<xui-skeleton>` stands in for content that has not rendered yet. */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="flex w-fit items-center gap-4">
        <xui-skeleton class="h-12 w-12 rounded-full" />
        <div class="space-y-2">
          <xui-skeleton class="h-4 w-[250px]" />
          <xui-skeleton class="h-4 w-[200px]" />
        </div>
      </div>
    `
  })
};

/**
 * The `xuiSkeleton` directive masks an element in place instead of replacing it,
 * so the layout does not shift when the real content arrives. Masked content is
 * also inert and hidden from screen readers.
 */
export const MaskInPlace: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-2xl grid-cols-2 gap-8">
        <div class="space-y-3">
          <p xuiText color="subtle" size="sm">loading</p>
          <h3 xuiHeading xuiSkeleton>Quarterly report</h3>
          <p xuiText color="muted" xuiSkeleton>
            Revenue grew by 12% against the previous quarter, driven mainly by renewals.
          </p>
          <button xuiButton xuiSkeleton>Download</button>
        </div>

        <div class="space-y-3">
          <p xuiText color="subtle" size="sm">loaded</p>
          <h3 xuiHeading>Quarterly report</h3>
          <p xuiText color="muted">
            Revenue grew by 12% against the previous quarter, driven mainly by renewals.
          </p>
          <button xuiButton>Download</button>
        </div>
      </div>
    `
  })
};
