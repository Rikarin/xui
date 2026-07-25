import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiAspectRatio, XuiAspectRatioImports } from '@xui/aspect-ratio';

/**
 * Locks content to a fixed width : height `ratio`. Give it a width; the height
 * follows. Handy for images, video embeds and placeholder tiles.
 */
const meta: Meta<XuiAspectRatio> = {
  title: 'Layout/Aspect ratio',
  component: XuiAspectRatio,
  decorators: [moduleMetadata({ imports: [XuiAspectRatioImports] })]
};

export default meta;
type Story = StoryObj<XuiAspectRatio>;

export const Ratios: Story = {
  render: () => ({
    props: { ratios: [16 / 9, 4 / 3, 1] as number[], labels: ['16 / 9', '4 / 3', '1 / 1'] },
    template: `
      <div class="flex flex-wrap gap-6">
        @for (r of ratios; track r; let i = $index) {
          <div class="w-56">
            <xui-aspect-ratio [ratio]="r" class="bg-surface-inset border-border rounded-lg border">
              <div class="text-foreground-muted flex items-center justify-center text-sm">{{ labels[i] }}</div>
            </xui-aspect-ratio>
          </div>
        }
      </div>
    `
  })
};

export const WithImage: Story = {
  render: () => ({
    template: `
      <div class="w-72">
        <xui-aspect-ratio [ratio]="16 / 9" class="border-border rounded-lg border">
          <img src="https://picsum.photos/640/360" alt="Sample" />
        </xui-aspect-ratio>
      </div>
    `
  })
};
