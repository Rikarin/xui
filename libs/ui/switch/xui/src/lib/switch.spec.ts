import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiSwitchImports } from '../index';

const IMPORTS = [XuiSwitchImports, ReactiveFormsModule];

describe('XuiSwitch', () => {
  it('is an accessible switch, off by default', () => {
    const { query } = render('<xui-switch aria-label="Wi-Fi" />', { imports: IMPORTS });

    expectAttributes(query('xui-switch'), { role: 'switch', 'aria-checked': 'false', 'data-state': 'unchecked' });
    expect(query('xui-switch').getAttribute('tabindex')).toBe('0');
  });

  it('toggles on click, reflecting the state', () => {
    const { query, click } = render('<xui-switch aria-label="Wi-Fi" />', { imports: IMPORTS });

    click('xui-switch');

    expectAttributes(query('xui-switch'), { 'aria-checked': 'true', 'data-state': 'checked' });
  });

  it('toggles on Space and Enter', () => {
    const { query, press } = render('<xui-switch aria-label="Wi-Fi" />', { imports: IMPORTS });

    press('xui-switch', ' ');
    expect(query('xui-switch').getAttribute('aria-checked')).toBe('true');

    press('xui-switch', 'Enter');
    expect(query('xui-switch').getAttribute('aria-checked')).toBe('false');
  });

  it('emits the two-way checked change', () => {
    const { query, click, fixture } = render<{ on: boolean }>('<xui-switch [(checked)]="props().on" />', {
      imports: IMPORTS,
      props: { on: false }
    });

    click('xui-switch');

    expect(fixture.componentInstance.props().on).toBe(true);
    expect(query('xui-switch').getAttribute('aria-checked')).toBe('true');
  });

  it('does not toggle while disabled', () => {
    const { query, click } = render('<xui-switch aria-label="Wi-Fi" disabled />', { imports: IMPORTS });

    click('xui-switch');

    expectAttributes(query('xui-switch'), { 'aria-checked': 'false', 'aria-disabled': 'true' });
    expect(query('xui-switch').getAttribute('tabindex')).toBe('-1');
  });

  it('applies the large size to track and thumb', () => {
    const { query } = render('<xui-switch size="lg" />', { imports: IMPORTS });

    expectClasses(query('xui-switch'), 'h-6', 'w-11');
    expectClasses(query('xui-switch span'), 'size-5');
  });

  describe('as a form control', () => {
    it('writes the model value into the view', () => {
      const control = new FormControl(true);
      const { query } = render('<xui-switch [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });

      expect(query('xui-switch').getAttribute('aria-checked')).toBe('true');
    });

    it('propagates a toggle back to the control, and honours disabled', () => {
      const control = new FormControl(false);
      const { query, click, detect } = render('<xui-switch [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });

      click('xui-switch');
      expect(control.value).toBe(true);

      control.disable();
      detect();
      expect(query('xui-switch').getAttribute('aria-disabled')).toBe('true');

      click('xui-switch');
      expect(control.value).toBe(true);
    });
  });
});
