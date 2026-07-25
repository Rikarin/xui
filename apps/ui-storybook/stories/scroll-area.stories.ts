import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiScrollArea, XuiScrollAreaImports } from '@xui/scroll-area';

/**
 * A scroll container with slim, theme-aware scrollbars. Give the host a bound —
 * a height for vertical scrolling, a width for horizontal.
 */
const meta: Meta<XuiScrollArea> = {
  title: 'Layout/Scroll area',
  component: XuiScrollArea,
  decorators: [moduleMetadata({ imports: [XuiScrollAreaImports] })]
};

export default meta;
type Story = StoryObj<XuiScrollArea>;

export const Vertical: Story = {
  render: () => ({
    props: { tags: Array.from({ length: 30 }, (_, i) => `v1.2.${i}`) },
    template: `
      <xui-scroll-area class="border-border h-72 w-56 rounded-lg border p-3">
        <p class="text-foreground mb-2 text-sm font-medium">Tags</p>
        @for (tag of tags; track tag) {
          <div class="text-foreground-muted border-border/60 border-b py-1.5 text-sm last:border-0">{{ tag }}</div>
        }
      </xui-scroll-area>
    `
  })
};

export const Horizontal: Story = {
  render: () => ({
    props: { items: Array.from({ length: 15 }, (_, i) => i + 1) },
    template: `
      <xui-scroll-area orientation="horizontal" class="border-border w-96 rounded-lg border p-3">
        <div class="flex gap-3">
          @for (i of items; track i) {
            <div class="bg-surface-inset text-foreground flex h-24 w-24 shrink-0 items-center justify-center rounded-md text-lg">
              {{ i }}
            </div>
          }
        </div>
      </xui-scroll-area>
    `
  })
};
