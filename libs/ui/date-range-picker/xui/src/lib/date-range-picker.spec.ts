import { render } from '@xui/testing';
import { XuiDateRangePickerImports } from '../index';
import { XuiDateRangePicker } from './date-range-picker';

const IMPORTS = [XuiDateRangePickerImports];
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-date-range-picker
       [range]="props().range ?? { start: null, end: null }"
       [months]="props().months ?? 2"
       [allowSingleDayRange]="props().allowSingleDayRange ?? false" />`,
    { imports: IMPORTS, props }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-date-range-picker')
    .componentInstance as XuiDateRangePicker<Date>;
  return { ...result, cmp };
};

const monthHeaders = () =>
  [...document.querySelectorAll('xui-date-range-picker .font-semibold')].map(el => el.textContent?.trim());
// A day button in the first visible month grid.
const firstMonthDay = (label: number) => {
  const grid = document.querySelectorAll('xui-date-range-picker table')[0];
  return [...grid.querySelectorAll('tbody button')].find(
    b => b.textContent?.trim() === String(label) && !b.className.includes('text-foreground-subtle')
  ) as HTMLButtonElement | undefined;
};
const inRangeCount = () => document.querySelectorAll('xui-date-range-picker td.bg-primary\\/10').length;

describe('XuiDateRangePicker', () => {
  it('shows two contiguous months by default', () => {
    const { detect } = setup({ range: { start: d(2024, 3, 10), end: d(2024, 3, 20) } });
    detect();

    expect(monthHeaders()).toEqual(['March 2024', 'April 2024']);
  });

  it('shows a single month when months=1', () => {
    const { detect } = setup({ range: { start: d(2024, 3, 10), end: null }, months: 1 });
    detect();

    expect(monthHeaders()).toEqual(['March 2024']);
  });

  it('first click sets the start and clears the end', () => {
    const { detect, cmp } = setup({ range: { start: d(2024, 3, 5), end: d(2024, 3, 25) } });
    detect();

    firstMonthDay(10)!.click();
    detect();

    expect(cmp.range().start?.getDate()).toBe(10);
    expect(cmp.range().end).toBeNull();
  });

  it('second click completes the range', () => {
    const { detect, cmp } = setup();
    detect();

    firstMonthDay(8)!.click();
    detect();
    firstMonthDay(15)!.click();
    detect();

    expect(cmp.range().start?.getDate()).toBe(8);
    expect(cmp.range().end?.getDate()).toBe(15);
  });

  it('clicking before the start restarts the range', () => {
    const { detect, cmp } = setup({ range: { start: d(2024, 3, 15), end: null } });
    detect();

    firstMonthDay(5)!.click();
    detect();

    expect(cmp.range().start?.getDate()).toBe(5);
    expect(cmp.range().end).toBeNull();
  });

  it('ignores a single-day range unless allowed', () => {
    const { detect, cmp } = setup({ range: { start: d(2024, 3, 10), end: null } });
    detect();

    firstMonthDay(10)!.click(); // same day as start
    detect();

    expect(cmp.range().end).toBeNull();
  });

  it('allows a single-day range when enabled', () => {
    const { detect, cmp } = setup({ range: { start: d(2024, 3, 10), end: null }, allowSingleDayRange: true });
    detect();

    firstMonthDay(10)!.click();
    detect();

    expect(cmp.range().end?.getDate()).toBe(10);
  });

  it('highlights the interior days of the selected range', () => {
    const { detect } = setup({ range: { start: d(2024, 3, 10), end: d(2024, 3, 14) } });
    detect();

    // 11, 12, 13 are interior (endpoints 10 & 14 are not counted as strip).
    expect(inRangeCount()).toBe(3);
  });

  it('navigates months with the arrows', () => {
    const { detect, query } = setup({ range: { start: d(2024, 3, 10), end: null } });
    detect();

    query('button[aria-label="Next month"]').click();
    detect();

    expect(monthHeaders()).toEqual(['April 2024', 'May 2024']);
  });
});
