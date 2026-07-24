import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiControlCardImports } from '../index';

const IMPORTS = [XuiControlCardImports, ReactiveFormsModule];

const card = () => document.querySelector('xui-control-card') as HTMLElement;

describe('XuiControlCard', () => {
  it('exposes the checkbox role by default and starts unchecked', () => {
    const { detect } = render('<xui-control-card>Wifi</xui-control-card>', { imports: IMPORTS });
    detect();

    expectAttributes(card(), { role: 'checkbox', 'aria-checked': 'false', tabindex: '0' });
    expect(card().textContent).toContain('Wifi');
  });

  it('maps the type to the matching ARIA role', () => {
    const { detect } = render('<xui-control-card type="switch">X</xui-control-card>', { imports: IMPORTS });
    detect();

    expectAttributes(card(), { role: 'switch' });
  });

  it('toggles on click and shows the selected style', () => {
    const { detect, click } = render('<xui-control-card>X</xui-control-card>', { imports: IMPORTS });
    detect();

    click('xui-control-card');

    expectAttributes(card(), { 'aria-checked': 'true' });
    expectClasses(card(), 'border-primary');
  });

  it('toggles back off on a second click', () => {
    const { detect, click } = render('<xui-control-card checked="true">X</xui-control-card>', { imports: IMPORTS });
    detect();

    click('xui-control-card');

    expectAttributes(card(), { 'aria-checked': 'false' });
  });

  it('a radio card only ever selects, never toggles off', () => {
    const { detect, click } = render('<xui-control-card type="radio" checked="true">X</xui-control-card>', {
      imports: IMPORTS
    });
    detect();

    click('xui-control-card');

    expectAttributes(card(), { 'aria-checked': 'true' });
  });

  it('toggles with Space and Enter', () => {
    const { detect, press } = render('<xui-control-card>X</xui-control-card>', { imports: IMPORTS });
    detect();

    press('xui-control-card', ' ');
    expectAttributes(card(), { 'aria-checked': 'true' });

    press('xui-control-card', 'Enter');
    expectAttributes(card(), { 'aria-checked': 'false' });
  });

  it('does not show the selected style when opted out', () => {
    const { detect } = render(
      '<xui-control-card checked="true" [showAsSelectedWhenChecked]="false">X</xui-control-card>',
      {
        imports: IMPORTS
      }
    );
    detect();

    expectNoClasses(card(), 'border-primary');
  });

  it('does not toggle while disabled', () => {
    const { detect, click } = render('<xui-control-card disabled>X</xui-control-card>', { imports: IMPORTS });
    detect();

    click('xui-control-card');

    expectAttributes(card(), { 'aria-checked': 'false', 'aria-disabled': 'true', tabindex: '-1' });
  });

  describe('as a form control', () => {
    it('reflects the control value', () => {
      const control = new FormControl(true);
      const { detect } = render('<xui-control-card [formControl]="props().control">X</xui-control-card>', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      expectAttributes(card(), { 'aria-checked': 'true' });
    });

    it('pushes the toggle back to the control', () => {
      const control = new FormControl(false);
      const { detect, click } = render('<xui-control-card [formControl]="props().control">X</xui-control-card>', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      click('xui-control-card');

      expect(control.value).toBe(true);
    });

    it('honours the disabled state from the form', () => {
      const control = new FormControl(false);
      const { detect } = render('<xui-control-card [formControl]="props().control">X</xui-control-card>', {
        imports: IMPORTS,
        props: { control }
      });
      detect();
      control.disable();
      detect();

      expectAttributes(card(), { 'aria-disabled': 'true', tabindex: '-1' });
    });
  });
});
