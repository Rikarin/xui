import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@xui/testing';
import { XuiDateRangePickerImports, type XuiDateRange } from '../index';
import { XuiDateRangePicker } from './date-range-picker';

const IMPORTS = [XuiDateRangePickerImports, ReactiveFormsModule];
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-date-range-picker
       [value]="props().range ?? { start: null, end: null }"
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
/** The days the band is rounded off at, which should be exactly the two endpoints. */
const roundedEnds = () =>
  [
    ...document.querySelectorAll('xui-date-range-picker td.rounded-s-full, xui-date-range-picker td.rounded-e-full')
  ].map(cell => cell.textContent?.trim());

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

    expect(cmp.value().start?.getDate()).toBe(10);
    expect(cmp.value().end).toBeNull();
  });

  it('second click completes the range', () => {
    const { detect, cmp } = setup();
    detect();

    firstMonthDay(8)!.click();
    detect();
    firstMonthDay(15)!.click();
    detect();

    expect(cmp.value().start?.getDate()).toBe(8);
    expect(cmp.value().end?.getDate()).toBe(15);
  });

  it('clicking before the start restarts the range', () => {
    const { detect, cmp } = setup({ range: { start: d(2024, 3, 15), end: null } });
    detect();

    firstMonthDay(5)!.click();
    detect();

    expect(cmp.value().start?.getDate()).toBe(5);
    expect(cmp.value().end).toBeNull();
  });

  it('ignores a single-day range unless allowed', () => {
    const { detect, cmp } = setup({ range: { start: d(2024, 3, 10), end: null } });
    detect();

    firstMonthDay(10)!.click(); // same day as start
    detect();

    expect(cmp.value().end).toBeNull();
  });

  it('allows a single-day range when enabled', () => {
    const { detect, cmp } = setup({ range: { start: d(2024, 3, 10), end: null }, allowSingleDayRange: true });
    detect();

    firstMonthDay(10)!.click();
    detect();

    expect(cmp.value().end?.getDate()).toBe(10);
  });

  it('runs the band across the whole range, endpoints included', () => {
    const { detect } = setup({ range: { start: d(2024, 3, 10), end: d(2024, 3, 14) } });
    detect();

    // 10 through 14. The endpoints carry it too, so the band can finish on the same rounded
    // silhouette their circles draw instead of a square corner poking out past the curve.
    expect(inRangeCount()).toBe(5);
    expect(roundedEnds()).toEqual(['10', '14']);
  });

  it('leaves a one-day range unbanded', () => {
    const { detect } = setup({ range: { start: d(2024, 3, 10), end: d(2024, 3, 10) } });
    detect();

    expect(inRangeCount()).toBe(0);
  });

  it('navigates months with the arrows', () => {
    const { detect, query } = setup({ range: { start: d(2024, 3, 10), end: null } });
    detect();

    query('button[aria-label="Next month"]').click();
    detect();

    expect(monthHeaders()).toEqual(['April 2024', 'May 2024']);
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<XuiDateRange<Date> | null>) => {
      const result = render('<xui-date-range-picker [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      result.detect();
      return result;
    };

    it('writes the control range into the calendar', () => {
      formSetup(new FormControl<XuiDateRange<Date> | null>({ start: d(2024, 3, 10), end: d(2024, 3, 14) }));

      expect(monthHeaders()).toEqual(['March 2024', 'April 2024']);
      expect(inRangeCount()).toBe(5);
    });

    it('reflects setValue into the calendar', () => {
      const control = new FormControl<XuiDateRange<Date> | null>(null);
      const { detect } = formSetup(control);

      control.setValue({ start: d(2025, 6, 9), end: d(2025, 6, 12) });
      detect();

      expect(monthHeaders()).toEqual(['June 2025', 'July 2025']);
      expect(inRangeCount()).toBe(4);
    });

    it('propagates a completed range back to the control', () => {
      const control = new FormControl<XuiDateRange<Date> | null>({ start: null, end: null });
      const { detect } = formSetup(control);

      firstMonthDay(8)!.click();
      detect();
      firstMonthDay(15)!.click();
      detect();

      expect(control.value?.start?.getDate()).toBe(8);
      expect(control.value?.end?.getDate()).toBe(15);
    });

    it('honours control.disable()', () => {
      const control = new FormControl<XuiDateRange<Date> | null>({ start: d(2024, 3, 10), end: null });
      const { detect, query } = formSetup(control);

      control.disable();
      detect();

      expect(firstMonthDay(15)!.disabled).toBe(true);
      expect(query<HTMLButtonElement>('button[aria-label="Next month"]').disabled).toBe(true);

      firstMonthDay(15)!.click();
      detect();
      expect(control.value?.end).toBeNull();
    });
  });
});
