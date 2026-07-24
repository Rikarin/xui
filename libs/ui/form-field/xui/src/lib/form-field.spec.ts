import { Directive, signal } from '@angular/core';
import { XFormFieldControl } from '@xui/core/form-field';
import { expectClasses, render } from '@xui/testing';
import { XuiError } from './error';
import { XuiFormField } from './form-field';
import { XuiHint } from './hint';

/**
 * A stand-in for a real control (input, select, …) so the form-field's own
 * behaviour can be tested without depending on another package.
 */
@Directive({
  selector: '[xuiFakeControl]',
  providers: [{ provide: XFormFieldControl, useExisting: FakeControl }]
})
class FakeControl implements XFormFieldControl {
  readonly errorState = signal(false);
}

const IMPORTS = [XuiFormField, XuiError, XuiHint, FakeControl];
const setup = (template: string) => render(template, { imports: IMPORTS });

const control = (fixture: ReturnType<typeof setup>['fixture']) =>
  fixture.debugElement.query(node => node.name === 'input').injector.get(FakeControl);

describe('XuiFormField', () => {
  it('stacks its children', () => {
    const { query } = setup('<xui-form-field><input xuiFakeControl /></xui-form-field>');

    expectClasses(query('xui-form-field'), 'block', 'space-y-2');
  });

  it('throws when it contains no form-field control', () => {
    expect(() => setup('<xui-form-field></xui-form-field>')).toThrow(/must contain an XFormFieldControl/);
  });

  it('shows the hint while the control is valid', () => {
    const { host } = setup(`
      <xui-form-field>
        <input xuiFakeControl />
        <xui-hint>We never share it</xui-hint>
        <xui-error>Required</xui-error>
      </xui-form-field>
    `);

    expect(host.querySelector('xui-hint')).toBeTruthy();
    expect(host.querySelector('xui-error')).toBeNull();
  });

  it('swaps the hint for the error once the control reports an error', () => {
    const { fixture, host } = setup(`
      <xui-form-field>
        <input xuiFakeControl />
        <xui-hint>We never share it</xui-hint>
        <xui-error>Required</xui-error>
      </xui-form-field>
    `);

    control(fixture).errorState.set(true);
    fixture.detectChanges();

    expect(host.querySelector('xui-error')).toBeTruthy();
    expect(host.querySelector('xui-hint')).toBeNull();
  });

  it('keeps showing the hint when there is no error message to show', () => {
    const { fixture, host } = setup(`
      <xui-form-field>
        <input xuiFakeControl />
        <xui-hint>We never share it</xui-hint>
      </xui-form-field>
    `);

    control(fixture).errorState.set(true);
    fixture.detectChanges();

    expect(host.querySelector('xui-hint')).toBeTruthy();
  });
});

describe('XuiError', () => {
  it('renders in the error colour', () => {
    const { query } = setup('<xui-error>Required</xui-error>');

    expectClasses(query('xui-error'), 'block', 'text-error', 'text-sm');
  });
});

describe('XuiHint', () => {
  it('renders de-emphasised', () => {
    const { query } = setup('<xui-hint>Optional</xui-hint>');

    expectClasses(query('xui-hint'), 'block', 'text-sm', 'text-foreground-subtle');
  });
});
