import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTimePicker, XuiTimePickerImports } from '@xui/time-picker';

/**
 * A time field with hour/minute (and optional second/millisecond) spin buttons.
 * Arrow keys step each field with wrap-around; `useAmPm` switches to a 12-hour
 * clock with an AM/PM toggle. `[(value)]` two-way binding.
 */
const meta: Meta<XuiTimePicker> = {
  title: 'Date & time/Time picker',
  component: XuiTimePicker,
  decorators: [moduleMetadata({ imports: [XuiTimePickerImports] })],
  argTypes: { precision: { control: 'inline-radio', options: ['minute', 'second', 'millisecond'] } }
};

export default meta;
type Story = StoryObj<XuiTimePicker>;

export const Default: Story = {
  render: () => ({
    props: { value: new Date(2024, 0, 1, 9, 30) },
    template: `
      <div>
        <xui-time-picker [(value)]="value" />
        <p class="text-foreground-muted mt-3 text-sm">Value: {{ value ? value.toLocaleTimeString() : '—' }}</p>
      </div>
    `
  })
};

export const TwelveHour: Story = {
  render: () => ({
    props: { value: new Date(2024, 0, 1, 15, 45) },
    template: `<xui-time-picker [(value)]="value" useAmPm />`
  })
};

export const WithSeconds: Story = {
  render: () => ({
    props: { value: new Date(2024, 0, 1, 9, 30, 15) },
    template: `<xui-time-picker [(value)]="value" precision="second" />`
  })
};
