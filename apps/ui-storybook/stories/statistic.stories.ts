import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiStatistic, XuiStatisticImports } from '@xui/statistic';

/**
 * A single numeric statistic with an optional title, prefix/suffix and decimal
 * precision — plus a live `<xui-countdown>` variant.
 */
const meta: Meta<XuiStatistic> = {
  title: 'Data display/Statistic',
  component: XuiStatistic,
  decorators: [moduleMetadata({ imports: [XuiStatisticImports] })]
};

export default meta;
type Story = StoryObj<XuiStatistic>;

export const Basic: Story = {
  render: () => ({
    template: `
      <div class="flex gap-12">
        <xui-statistic title="Active users" [value]="1128" />
        <xui-statistic title="Account balance" [value]="112893.5" [precision]="2" prefix="$" />
        <xui-statistic title="Uptime" [value]="99.9" [precision]="1" suffix="%" />
      </div>
    `
  })
};

export const Countdown: Story = {
  render: () => ({
    props: { deadline: Date.now() + (2 * 86400 + 4 * 3600 + 30 * 60) * 1000 },
    template: `
      <div class="flex gap-12">
        <xui-countdown title="Launch in" [target]="deadline" format="D 'd' HH:mm:ss" />
        <xui-countdown title="Sale ends" [target]="deadline" />
      </div>
    `
  })
};
