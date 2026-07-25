import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiDateRangePicker, XuiDateRangePickerImports } from '@xui/date-range-picker';

/**
 * A multi-month calendar for choosing a date range. First click sets the start,
 * the second the end (hovering previews the span); clicking again starts over.
 * `[(range)]` two-way binding, `months` (1 or 2), `min`/`max`/`dateFilter`,
 * `allowSingleDayRange`.
 */
const meta: Meta<XuiDateRangePicker> = {
  title: 'Date & time/Date range picker',
  component: XuiDateRangePicker,
  decorators: [moduleMetadata({ imports: [XuiDateRangePickerImports] })]
};

export default meta;
type Story = StoryObj<XuiDateRangePicker>;

export const Default: Story = {
  render: () => ({
    props: { range: { start: new Date(2024, 2, 8), end: new Date(2024, 2, 16) } },
    template: `
      <div>
        <xui-date-range-picker [(range)]="range" />
        <p class="text-foreground-muted mt-3 text-sm">
          {{ range.start ? range.start.toDateString() : '—' }} → {{ range.end ? range.end.toDateString() : '—' }}
        </p>
      </div>
    `
  })
};

export const SingleMonth: Story = {
  render: () => ({
    props: { range: { start: null, end: null } },
    template: `<xui-date-range-picker [(range)]="range" [months]="1" allowSingleDayRange />`
  })
};
