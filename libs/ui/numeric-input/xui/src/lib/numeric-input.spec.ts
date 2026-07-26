import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { XFormFieldControl } from '@xui/core/form-field';
import { render } from '@xui/testing';
import { XuiNumericInputImports } from '../index';
import { XuiNumericInput } from './numeric-input';

const IMPORTS = [XuiNumericInputImports, ReactiveFormsModule];

const field = () => document.querySelector('xui-numeric-input input') as HTMLInputElement;
const incrementBtn = () => document.querySelector('button[aria-label="Increment"]') as HTMLButtonElement;
const decrementBtn = () => document.querySelector('button[aria-label="Decrement"]') as HTMLButtonElement;

const type = (value: string, detect: () => void) => {
  field().value = value;
  field().dispatchEvent(new Event('input', { bubbles: true }));
  detect();
};

const arrow = (key: 'ArrowUp' | 'ArrowDown', mods: { shift?: boolean; alt?: boolean } = {}, detect?: () => void) => {
  field().dispatchEvent(
    new KeyboardEvent('keydown', { key, shiftKey: !!mods.shift, altKey: !!mods.alt, bubbles: true, cancelable: true })
  );
  detect?.();
};

describe('XuiNumericInput', () => {
  it('is an accessible spinbutton, empty by default', () => {
    const { detect } = render('<xui-numeric-input aria-label="Qty" />', { imports: IMPORTS });
    detect();

    expect(field().getAttribute('role')).toBe('spinbutton');
    expect(field().value).toBe('');
  });

  it('increments and decrements from the stepper buttons', () => {
    const { detect, click } = render('<xui-numeric-input value="5" />', { imports: IMPORTS });
    detect();

    click(incrementBtn());
    expect(field().value).toBe('6');

    click(decrementBtn());
    click(decrementBtn());
    expect(field().value).toBe('4');
  });

  it('treats empty as a step from zero, not from NaN', () => {
    const { detect, click } = render('<xui-numeric-input />', { imports: IMPORTS });
    detect();

    click(incrementBtn());

    expect(field().value).toBe('1');
  });

  it('steps by stepSize, majorStepSize with Shift and minorStepSize with Alt', () => {
    const { detect } = render(
      '<xui-numeric-input value="0" [stepSize]="1" [majorStepSize]="10" [minorStepSize]="0.1" />',
      {
        imports: IMPORTS
      }
    );
    detect();

    arrow('ArrowUp', {}, detect);
    expect(field().value).toBe('1');

    arrow('ArrowUp', { shift: true }, detect);
    expect(field().value).toBe('11');

    arrow('ArrowDown', { alt: true }, detect);
    expect(field().value).toBe('10.9');
  });

  it('keeps fractional steps exact', () => {
    const { detect } = render('<xui-numeric-input value="0.1" [stepSize]="0.2" />', { imports: IMPORTS });
    detect();

    arrow('ArrowUp', {}, detect);

    // Not 0.30000000000000004.
    expect(field().value).toBe('0.3');
  });

  it('clamps to [min, max] on the steppers and disables the button at the bound', () => {
    const { detect, click } = render('<xui-numeric-input value="9" [min]="0" [max]="10" />', { imports: IMPORTS });
    detect();

    click(incrementBtn());
    expect(field().value).toBe('10');
    expect(incrementBtn().disabled).toBe(true);

    click(incrementBtn());
    expect(field().value).toBe('10');
  });

  it('clamps an out-of-range typed value on blur', () => {
    const { detect } = render('<xui-numeric-input [min]="0" [max]="10" />', { imports: IMPORTS });
    detect();

    type('99', detect);
    field().dispatchEvent(new Event('blur', { bubbles: true }));
    detect();

    expect(field().value).toBe('10');
  });

  it('preserves a half-typed entry until blur', () => {
    const { detect } = render('<xui-numeric-input />', { imports: IMPORTS });
    detect();

    type('1.', detect);
    // The field keeps "1." rather than snapping to "1".
    expect(field().value).toBe('1.');
  });

  describe('as a form control', () => {
    it('writes the control value into the field', () => {
      const control = new FormControl(42);
      const { detect } = render('<xui-numeric-input [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      expect(field().value).toBe('42');
    });

    it('propagates typing and stepping back to the control as numbers', () => {
      const control = new FormControl<number | null>(null);
      const { detect, click } = render('<xui-numeric-input [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      type('7', detect);
      expect(control.value).toBe(7);

      click(incrementBtn());
      expect(control.value).toBe(8);
    });
  });

  it('provides XFormFieldControl, so xui-form-field accepts it', () => {
    const { detect, fixture } = render('<xui-numeric-input aria-label="Qty" />', { imports: IMPORTS });
    detect();

    const control = fixture.debugElement.query(By.css('xui-numeric-input')).injector.get(XFormFieldControl);

    expect(control).toBeInstanceOf(XuiNumericInput);
    // The label points at the inner text field, not the wrapper.
    expect(control.controlId?.()).toBe(field().id);
  });
});
