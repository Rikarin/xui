import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectAttributes, render } from '@xui/testing';
import { XuiDatePickerImports } from '../index';
import { XuiDatePicker } from './date-picker';

const IMPORTS = [XuiDatePickerImports, ReactiveFormsModule];
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-date-picker
       [value]="props().selected ?? null"
       [min]="props().min ?? null"
       [max]="props().max ?? null"
       [showActionsBar]="props().showActionsBar ?? false"
       (valueChange)="props().onChange?.($event)" />`,
    { imports: IMPORTS, props }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-date-picker')
    .componentInstance as XuiDatePicker<Date>;
  return { ...result, cmp };
};

const header = () => document.querySelector('xui-date-picker [aria-live="polite"]')?.textContent?.trim();
const dayButton = (label: number) =>
  [...document.querySelectorAll('xui-date-picker tbody button')].find(
    b => b.textContent?.trim() === String(label) && !b.className.includes('text-foreground-subtle')
  ) as HTMLButtonElement | undefined;

describe('XuiDatePicker', () => {
  it('shows the month of the selected date', () => {
    const { detect } = setup({ selected: d(2024, 3, 15) });
    detect();

    expect(header()).toBe('March 2024');
    expect(document.querySelectorAll('xui-date-picker [role="grid"]').length).toBe(1);
  });

  it('renders 7 weekday headers and a 6-week grid', () => {
    const { detect } = setup({ selected: d(2024, 3, 15) });
    detect();

    expect(document.querySelectorAll('xui-date-picker thead th').length).toBe(7);
    expect(document.querySelectorAll('xui-date-picker tbody tr').length).toBe(6);
  });

  it('marks the selected day on its gridcell', () => {
    const { detect } = setup({ selected: d(2024, 3, 15) });
    detect();

    // Selection is announced by the <td> gridcell; `aria-selected` on the inner
    // button is not a valid role/attribute pairing.
    expectAttributes(dayButton(15)!.closest('td')!, { 'aria-selected': 'true' });
    expectAttributes(dayButton(15)!, { 'aria-selected': null });
  });

  it('selects a day on click and emits it', () => {
    const changes: (Date | null)[] = [];
    const { detect, cmp } = setup({ selected: d(2024, 3, 15), onChange: (v: Date | null) => changes.push(v) });
    detect();

    dayButton(20)!.click();
    detect();

    expect(cmp.value()?.getDate()).toBe(20);
    expect(changes.at(-1)?.getDate()).toBe(20);
  });

  it('moves to the previous and next month with the nav buttons', () => {
    const { detect, query } = setup({ selected: d(2024, 3, 15) });
    detect();

    query('button[aria-label="Previous month"]').click();
    detect();
    expect(header()).toBe('February 2024');

    query('button[aria-label="Next month"]').click();
    query('button[aria-label="Next month"]').click();
    detect();
    expect(header()).toBe('April 2024');
  });

  it('disables days outside the min/max range', () => {
    const { detect } = setup({ selected: d(2024, 3, 15), min: d(2024, 3, 10), max: d(2024, 3, 20) });
    detect();

    expect(dayButton(9)?.disabled).toBe(true);
    expect(dayButton(10)?.disabled).toBe(false);
    expect(dayButton(21)?.disabled).toBe(true);
  });

  it('moves the focused day with the arrow keys', () => {
    const { detect, query, cmp } = setup({ selected: d(2024, 3, 15) });
    detect();

    const grid = query('[role="grid"]');
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    detect();
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    detect();

    // From the 15th, ArrowRight → 16th, Enter selects it.
    expect(cmp.value()?.getDate()).toBe(16);
  });

  it('changes month when arrowing across the boundary', () => {
    const { detect, query } = setup({ selected: d(2024, 3, 31) });
    detect();

    query('[role="grid"]').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    );
    detect();

    expect(header()).toBe('April 2024');
  });

  describe('actions bar', () => {
    it('is hidden by default and shown when enabled', () => {
      const { detect } = setup({ selected: d(2024, 3, 15), showActionsBar: true });
      detect();

      const actions = [...document.querySelectorAll('xui-date-picker button')].map(b => b.textContent?.trim());
      expect(actions).toContain('Today');
      expect(actions).toContain('Clear');
    });

    it('clears the selection', () => {
      const { detect, cmp } = setup({ selected: d(2024, 3, 15), showActionsBar: true });
      detect();

      const clear = [...document.querySelectorAll('xui-date-picker button')].find(
        b => b.textContent?.trim() === 'Clear'
      ) as HTMLButtonElement;
      clear.click();
      detect();

      expect(cmp.value()).toBeNull();
    });
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<Date | null>) => {
      const result = render('<xui-date-picker [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      result.detect();
      return result;
    };

    it('writes the control value into the grid', () => {
      formSetup(new FormControl<Date | null>(d(2024, 3, 15)));

      expect(header()).toBe('March 2024');
      expectAttributes(dayButton(15)!.closest('td')!, { 'aria-selected': 'true' });
    });

    it('reflects setValue into the grid', () => {
      const control = new FormControl<Date | null>(d(2024, 3, 15));
      const { detect } = formSetup(control);

      control.setValue(d(2025, 6, 9));
      detect();

      expect(header()).toBe('June 2025');
      expectAttributes(dayButton(9)!.closest('td')!, { 'aria-selected': 'true' });
    });

    it('propagates a day pick back to the control', () => {
      const control = new FormControl<Date | null>(d(2024, 3, 15));
      const { detect } = formSetup(control);

      dayButton(20)!.click();
      detect();

      expect(control.value?.getDate()).toBe(20);
    });

    it('honours control.disable()', () => {
      const control = new FormControl<Date | null>(d(2024, 3, 15));
      const { detect, query } = formSetup(control);

      control.disable();
      detect();

      expect(dayButton(20)!.disabled).toBe(true);
      expect(query<HTMLButtonElement>('button[aria-label="Next month"]').disabled).toBe(true);

      dayButton(20)!.click();
      detect();
      expect(control.value?.getDate()).toBe(15);
    });
  });
});
