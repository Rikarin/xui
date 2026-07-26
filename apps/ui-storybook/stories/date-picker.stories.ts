import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiDatePicker, XuiDatePickerImports } from '@xui/date-picker';

/**
 * An inline month calendar. Click a day to select it; arrow keys move by day/week,
 * PageUp/PageDown by month, Home/End to the week ends, Enter/Space select.
 * `[(value)]` two-way binding, `min`/`max`/`dateFilter`, an optional Today/Clear
 * action bar. Uses the app's `DateAdapter` (native `Date` by default).
 */
const meta: Meta<XuiDatePicker> = {
  title: 'Date & time/Date picker',
  component: XuiDatePicker,
  decorators: [moduleMetadata({ imports: [XuiDatePickerImports] })]
};

export default meta;
type Story = StoryObj<XuiDatePicker>;

export const Default: Story = {
  render: () => ({
    props: { selected: new Date(2024, 2, 15) },
    template: `
      <div>
        <xui-date-picker [(value)]="selected" showActionsBar />
        <p class="text-foreground-muted mt-3 text-sm">Selected: {{ selected ? selected.toDateString() : '—' }}</p>
      </div>
    `
  })
};

/** Bounded to a range, with weekends disabled. */
export const Constrained: Story = {
  render: () => ({
    props: {
      selected: new Date(2024, 2, 13),
      min: new Date(2024, 2, 4),
      max: new Date(2024, 2, 27),
      noWeekends: (date: Date) => date.getDay() !== 0 && date.getDay() !== 6
    },
    template: `<xui-date-picker [(value)]="selected" [min]="min" [max]="max" [dateFilter]="noWeekends" />`
  })
};
