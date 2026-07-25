import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiDateInput, XuiDateInputImports } from '@xui/date-input';
import { XuiDateRangeInput, XuiDateRangeInputImports } from '@xui/date-range-input';
import { XuiTimezoneSelect, XuiTimezoneSelectImports } from '@xui/timezone-select';

/**
 * A date field: a text input paired with a popover calendar. Type a date or pick
 * one from the calendar. `[(value)]` two-way binding.
 */
const meta: Meta<XuiDateInput> = {
  title: 'Date & time/Date input',
  component: XuiDateInput,
  decorators: [moduleMetadata({ imports: [XuiDateInputImports, XuiDateRangeInputImports, XuiTimezoneSelectImports] })]
};

export default meta;
type Story = StoryObj<XuiDateInput>;

export const Default: Story = {
  render: () => ({
    props: { value: new Date(2024, 2, 15) },
    template: `
      <div>
        <xui-date-input [(value)]="value" />
        <p class="text-foreground-muted mt-3 text-sm">Value: {{ value ? value.toDateString() : '—' }}</p>
      </div>
    `
  })
};

/** Two boundary fields sharing one range calendar. */
export const RangeInput: StoryObj<XuiDateRangeInput> = {
  render: () => ({
    props: { range: { start: new Date(2024, 2, 4), end: new Date(2024, 2, 20) } },
    template: `<xui-date-range-input [(range)]="range" />`
  })
};

/** A searchable time-zone picker fed by `Intl.supportedValuesOf('timeZone')`. */
export const TimezoneSelect: StoryObj<XuiTimezoneSelect> = {
  render: () => ({
    props: { zone: 'Europe/Berlin' },
    template: `
      <div class="w-72">
        <xui-timezone-select [(value)]="zone" />
        <p class="text-foreground-muted mt-3 text-sm">Zone: {{ zone }}</p>
      </div>
    `
  })
};
