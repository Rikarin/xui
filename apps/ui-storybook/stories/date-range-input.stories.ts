import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiDateRangeInput, XuiDateRangeInputImports } from '@xui/date-range-input';
import { XuiDateRange } from '@xui/date-range-picker';

/**
 * A date-range field: two text inputs (start → end) sharing one popover range
 * calendar. Focusing either field opens the picker; typing a boundary parses just
 * that end. The value is an `XuiDateRange` — `{ start, end }`, either boundary
 * `null` while selecting — bound with `[(value)]` or a form control.
 */
const meta: Meta<XuiDateRangeInput> = {
  title: 'Date & time/Date range input',
  component: XuiDateRangeInput,
  decorators: [
    moduleMetadata({
      imports: [XuiDateRangeInputImports, ReactiveFormsModule]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiDateRangeInput>;

/** `[(value)]` two-way binding with a pre-selected range. */
export const Default: Story = {
  render: () => ({
    props: {
      range: { start: new Date(2024, 2, 4), end: new Date(2024, 2, 20) } satisfies XuiDateRange<Date>
    },
    template: `
      <div>
        <xui-date-range-input [(value)]="range" />
        <p class="text-foreground-muted mt-3 text-sm">
          {{ range.start ? range.start.toDateString() : '—' }} → {{ range.end ? range.end.toDateString() : '—' }}
        </p>
      </div>
    `
  })
};

/**
 * A full `ControlValueAccessor`: bind a `FormControl<XuiDateRange<Date> | null>`
 * directly. Disabled state comes from the form (`control.disable()`), not the input.
 */
export const ReactiveForm: Story = {
  render: () => ({
    props: {
      stay: new FormControl<XuiDateRange<Date> | null>({
        start: new Date(2024, 5, 10),
        end: new Date(2024, 5, 14)
      })
    },
    template: `
      <div>
        <xui-date-range-input [formControl]="stay" />
        <p class="text-foreground-muted mt-3 text-sm">
          Form value: {{ stay.value?.start?.toDateString() ?? '—' }} → {{ stay.value?.end?.toDateString() ?? '—' }}
        </p>
      </div>
    `
  })
};

/** `min`/`max` clamp the pickable window; `allowSingleDayRange` permits start = end. */
export const MinMax: Story = {
  render: () => ({
    props: {
      range: { start: null, end: null } satisfies XuiDateRange<Date>,
      min: new Date(2024, 2, 1),
      max: new Date(2024, 3, 30)
    },
    template: `<xui-date-range-input [(value)]="range" [min]="min" [max]="max" allowSingleDayRange />`
  })
};

export const Disabled: Story = {
  render: () => ({
    props: {
      range: { start: new Date(2024, 2, 4), end: new Date(2024, 2, 20) } satisfies XuiDateRange<Date>
    },
    template: `<xui-date-range-input disabled [(value)]="range" />`
  })
};
