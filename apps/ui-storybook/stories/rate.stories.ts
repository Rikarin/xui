import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiRate, XuiRateImports } from '@xui/rate';

/**
 * A star-rating input — hover to preview, click to set, click again to clear.
 * Supports half stars and arrow-key adjustment; `readonly` renders a static score.
 */
const meta: Meta<XuiRate> = {
  title: 'Data entry/Rate',
  component: XuiRate,
  decorators: [moduleMetadata({ imports: [XuiRateImports] })]
};

export default meta;
type Story = StoryObj<XuiRate>;

export const Basic: Story = {
  render: () => ({
    props: { score: 3 },
    template: `
      <div class="flex flex-col gap-4">
        <xui-rate [(value)]="score" />
        <span class="text-foreground-muted text-sm">Value: {{ score }}</span>
      </div>
    `
  })
};

export const HalfStars: Story = {
  render: () => ({
    props: { score: 2.5 },
    template: `
      <div class="flex flex-col gap-4">
        <xui-rate [(value)]="score" allowHalf [starSize]="28" />
        <span class="text-foreground-muted text-sm">Value: {{ score }}</span>
      </div>
    `
  })
};

export const Readonly: Story = {
  render: () => ({
    template: `<xui-rate [value]="4" readonly />`
  })
};
