import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { type XuiDateRange } from '@xui/date-range-picker';
import { render } from '@xui/testing';
import { XuiDateRangeInputImports } from '../index';
import { XuiDateRangeInput } from './date-range-input';

const IMPORTS = [XuiDateRangeInputImports, ReactiveFormsModule];
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(`<xui-date-range-input [value]="props().range ?? { start: null, end: null }" />`, {
    imports: IMPORTS,
    props
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-date-range-input')
    .componentInstance as XuiDateRangeInput<Date>;
  return { ...result, cmp };
};

const inputs = () => [...document.querySelectorAll('xui-date-range-input input')] as HTMLInputElement[];
const startField = () => inputs()[0];
const endField = () => inputs()[1];
const picker = () => document.querySelector('.cdk-overlay-container xui-date-range-picker');
const firstMonthDay = (label: number) => {
  const grid = document.querySelectorAll('.cdk-overlay-container table')[0];
  return [...grid.querySelectorAll('tbody button')].find(
    b => b.textContent?.trim() === String(label) && !b.className.includes('text-foreground-subtle')
  ) as HTMLButtonElement | undefined;
};

describe('XuiDateRangeInput', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove()));

  it('renders two boundary fields', () => {
    const { detect } = setup();
    detect();

    expect(inputs().length).toBe(2);
    expect(startField().placeholder).toBe('Start date');
    expect(endField().placeholder).toBe('End date');
  });

  it('formats a bound range into the two fields', () => {
    const { detect } = setup({ range: { start: d(2024, 3, 4), end: d(2024, 3, 20) } });
    detect();

    expect(startField().value).toMatch(/2024/);
    expect(startField().value).toMatch(/04/);
    expect(endField().value).toMatch(/20/);
  });

  it('opens a shared range calendar', () => {
    const { detect, click } = setup();
    detect();

    click(startField());
    detect();

    expect(picker()).toBeTruthy();
  });

  it('reflects a range selected in the calendar back into both fields', () => {
    const { detect, click, cmp } = setup({ range: { start: null, end: null } });
    detect();
    click(startField());
    detect();

    firstMonthDay(8)!.click();
    detect();
    firstMonthDay(16)!.click();
    detect();

    expect(cmp.value().start?.getDate()).toBe(8);
    expect(cmp.value().end?.getDate()).toBe(16);
    expect(endField().value).toMatch(/16/);
  });

  it('parses a typed start boundary on Enter', () => {
    const { detect, cmp } = setup({ range: { start: null, end: d(2024, 3, 20) } });
    detect();

    startField().value = '2024-03-05';
    startField().dispatchEvent(new Event('input', { bubbles: true }));
    startField().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    detect();

    expect(cmp.value().start?.getDate()).toBe(5);
    // the end boundary is untouched
    expect(cmp.value().end?.getDate()).toBe(20);
  });

  it('clears a boundary when its field is emptied', () => {
    const { detect, cmp } = setup({ range: { start: d(2024, 3, 5), end: d(2024, 3, 20) } });
    detect();

    endField().value = '';
    endField().dispatchEvent(new Event('input', { bubbles: true }));
    endField().dispatchEvent(new Event('blur'));
    detect();

    expect(cmp.value().end).toBeNull();
    expect(cmp.value().start?.getDate()).toBe(5);
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<XuiDateRange<Date> | null>) => {
      const result = render('<xui-date-range-input [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      result.detect();
      return result;
    };

    it('writes the control range into both fields', () => {
      formSetup(new FormControl<XuiDateRange<Date> | null>({ start: d(2024, 3, 4), end: d(2024, 3, 20) }));

      expect(startField().value).toMatch(/04|4/);
      expect(endField().value).toMatch(/20/);
    });

    it('reflects setValue into the fields', () => {
      const control = new FormControl<XuiDateRange<Date> | null>(null);
      const { detect } = formSetup(control);

      control.setValue({ start: d(2025, 6, 9), end: d(2025, 6, 12) });
      detect();

      expect(startField().value).toMatch(/2025/);
      expect(endField().value).toMatch(/12/);
    });

    it('propagates a calendar-picked range back to the control', () => {
      const control = new FormControl<XuiDateRange<Date> | null>({ start: null, end: null });
      const { detect, click } = formSetup(control);

      click(startField());
      detect();
      firstMonthDay(8)!.click();
      detect();
      firstMonthDay(16)!.click();
      detect();

      expect(control.value?.start?.getDate()).toBe(8);
      expect(control.value?.end?.getDate()).toBe(16);
    });

    it('honours control.disable()', () => {
      const control = new FormControl<XuiDateRange<Date> | null>({ start: d(2024, 3, 4), end: d(2024, 3, 20) });
      const { detect } = formSetup(control);

      control.disable();
      detect();

      expect(startField().disabled).toBe(true);
      expect(endField().disabled).toBe(true);
    });
  });
});
