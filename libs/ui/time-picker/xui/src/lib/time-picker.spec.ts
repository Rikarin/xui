import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@xui/testing';
import { XuiTimePickerImports } from '../index';
import { XuiTimePicker } from './time-picker';

const IMPORTS = [XuiTimePickerImports, ReactiveFormsModule];

const at = (h: number, m: number, s = 0, ms = 0) => new Date(2024, 0, 1, h, m, s, ms);

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-time-picker
       [value]="props().value ?? null"
       [precision]="props().precision ?? 'minute'"
       [useAmPm]="props().useAmPm ?? false"
       (valueChange)="props().onChange?.($event)" />`,
    { imports: IMPORTS, props }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-time-picker')
    .componentInstance as XuiTimePicker<Date>;
  return { ...result, cmp };
};

const fields = () => [...document.querySelectorAll('xui-time-picker input')] as HTMLInputElement[];
const hour = () => fields()[0];
const minute = () => fields()[1];

const arrow = (el: HTMLElement, key: 'ArrowUp' | 'ArrowDown', detect: () => void) => {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  detect();
};

describe('XuiTimePicker', () => {
  it('renders zero-padded hour and minute fields', () => {
    const { detect } = setup({ value: at(9, 5) });
    detect();

    expect(hour().value).toBe('09');
    expect(minute().value).toBe('05');
  });

  it('shows only hour and minute at minute precision', () => {
    const { detect } = setup({ value: at(9, 5) });
    detect();

    expect(fields().length).toBe(2);
  });

  it('adds a seconds field at second precision', () => {
    const { detect } = setup({ value: at(9, 5, 30), precision: 'second' });
    detect();

    expect(fields().length).toBe(3);
    expect(fields()[2].value).toBe('30');
  });

  it('adds a milliseconds field at millisecond precision', () => {
    const { detect } = setup({ value: at(9, 5, 30, 250), precision: 'millisecond' });
    detect();

    expect(fields().length).toBe(4);
    expect(fields()[3].value).toBe('250');
  });

  it('steps the hour up and down with the arrow keys', () => {
    const { detect, cmp } = setup({ value: at(9, 30) });
    detect();

    arrow(hour(), 'ArrowUp', detect);
    expect(cmp.value()?.getHours()).toBe(10);

    arrow(hour(), 'ArrowDown', detect);
    arrow(hour(), 'ArrowDown', detect);
    expect(cmp.value()?.getHours()).toBe(8);
  });

  it('wraps the minute from 59 to 00', () => {
    const { detect, cmp } = setup({ value: at(9, 59) });
    detect();

    arrow(minute(), 'ArrowUp', detect);

    expect(cmp.value()?.getMinutes()).toBe(0);
    // the hour is unaffected (fields wrap independently)
    expect(cmp.value()?.getHours()).toBe(9);
  });

  it('accepts a typed value, clamping by wrap', () => {
    const { detect, cmp } = setup({ value: at(9, 5) });
    detect();

    minute().value = '45';
    minute().dispatchEvent(new Event('input', { bubbles: true }));
    detect();

    expect(cmp.value()?.getMinutes()).toBe(45);
  });

  describe('12-hour mode', () => {
    it('shows a 12-hour clock with an AM/PM toggle', () => {
      const { detect } = setup({ value: at(15, 0), useAmPm: true });
      detect();

      expect(hour().value).toBe('03');
      const ampm = document.querySelector('xui-time-picker button');
      expect(ampm?.textContent?.trim()).toBe('PM');
    });

    it('toggles between AM and PM by shifting 12 hours', () => {
      const { detect, cmp } = setup({ value: at(15, 0), useAmPm: true });
      detect();

      (document.querySelector('xui-time-picker button') as HTMLButtonElement).click();
      detect();

      expect(cmp.value()?.getHours()).toBe(3); // 3 PM → 3 AM
    });
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<Date | null>) => {
      const result = render('<xui-time-picker [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      result.detect();
      return result;
    };

    it('writes the control value into the fields', () => {
      formSetup(new FormControl<Date | null>(at(9, 5)));

      expect(hour().value).toBe('09');
      expect(minute().value).toBe('05');
    });

    it('reflects setValue into the fields', () => {
      const control = new FormControl<Date | null>(at(9, 5));
      const { detect } = formSetup(control);

      control.setValue(at(17, 42));
      detect();

      expect(hour().value).toBe('17');
      expect(minute().value).toBe('42');
    });

    it('propagates a spun value back to the control', () => {
      const control = new FormControl<Date | null>(at(9, 30));
      const { detect } = formSetup(control);

      arrow(hour(), 'ArrowUp', detect);

      expect(control.value?.getHours()).toBe(10);
    });

    it('honours control.disable()', () => {
      const control = new FormControl<Date | null>(at(9, 30));
      const { detect } = formSetup(control);

      control.disable();
      detect();

      expect(hour().disabled).toBe(true);
      expect(minute().disabled).toBe(true);

      arrow(hour(), 'ArrowUp', detect);
      expect(control.value?.getHours()).toBe(9);
    });
  });
});
