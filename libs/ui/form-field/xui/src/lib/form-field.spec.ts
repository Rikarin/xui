import { Directive, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { XFormFieldControl } from '@xui/core/form-field';
import { expectClasses, render } from '@xui/testing';
import { XuiTextareaImports } from '@xui/textarea';
import { XuiError } from './error';
import { XuiFormField } from './form-field';
import { provideXuiFormFieldConfig } from './form-field.token';
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
  readonly ngControl = null;
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

  describe('label, helper and layout', () => {
    it('renders a label with secondary info', () => {
      const { query } = setup(
        '<xui-form-field label="Email" labelInfo="(required)"><input xuiFakeControl /></xui-form-field>'
      );

      expect(query('label').textContent).toContain('Email');
      expect(query('label').textContent).toContain('(required)');
    });

    it('associates the label with the projected control by id', () => {
      const { query } = setup('<xui-form-field label="Email"><input xuiFakeControl /></xui-form-field>');

      const forId = query('label').getAttribute('for');
      expect(forId).toBeTruthy();
      expect(query<HTMLInputElement>('input').id).toBe(forId);
    });

    it('keeps a control that already has an id, pointing the label at it', () => {
      const { query } = setup('<xui-form-field label="Email"><input xuiFakeControl id="my-email" /></xui-form-field>');

      expect(query('label').getAttribute('for')).toBe('my-email');
      expect(query<HTMLInputElement>('input').id).toBe('my-email');
    });

    it('renders helper text under the control while valid', () => {
      const { host } = setup(
        '<xui-form-field helperText="We never share it"><input xuiFakeControl /></xui-form-field>'
      );

      expect(host.textContent).toContain('We never share it');
    });

    it('hides helper text once the control reports an error', () => {
      const { fixture, host } = setup(`
        <xui-form-field helperText="We never share it">
          <input xuiFakeControl />
          <xui-error>Required</xui-error>
        </xui-form-field>
      `);

      control(fixture).errorState.set(true);
      fixture.detectChanges();

      expect(host.textContent).not.toContain('We never share it');
      expect(host.querySelector('xui-error')).toBeTruthy();
    });

    it('lays the label beside the control when inline', () => {
      const { query } = setup('<xui-form-field inline label="Email"><input xuiFakeControl /></xui-form-field>');

      expectClasses(query('xui-form-field'), 'flex', 'items-baseline');
    });

    it('tints the label with the colour accent', () => {
      const { query } = setup('<xui-form-field color="error" label="Email"><input xuiFakeControl /></xui-form-field>');

      expectClasses(query('label'), 'text-error');
    });
  });

  describe('with a real non-input control', () => {
    const IMPORTS = [XuiFormField, XuiError, XuiHint, XuiTextareaImports, ReactiveFormsModule];

    it('accepts a textarea as its control and points the label at it', () => {
      const { query } = render('<xui-form-field label="Notes"><textarea xuiTextarea></textarea></xui-form-field>', {
        imports: IMPORTS
      });

      const forId = query('label').getAttribute('for');
      expect(forId).toBeTruthy();
      expect(query<HTMLTextAreaElement>('textarea').id).toBe(forId);
    });

    it('swaps the hint for the error once the bound control is invalid and touched', async () => {
      const control = new FormControl('', Validators.required);
      const { fixture, host, detect } = render(
        `
          <xui-form-field label="Notes">
            <textarea xuiTextarea [formControl]="props().control"></textarea>
            <xui-hint>Optional</xui-hint>
            <xui-error>Required</xui-error>
          </xui-form-field>
        `,
        { imports: IMPORTS, props: { control } }
      );

      // The control resolves its NgControl after the first render.
      await fixture.whenStable();
      expect(host.querySelector('xui-hint')).toBeTruthy();
      expect(host.querySelector('xui-error')).toBeNull();

      control.markAsTouched();
      detect();

      expect(host.querySelector('xui-error')).toBeTruthy();
      expect(host.querySelector('xui-hint')).toBeNull();
    });
  });

  it('takes its default layout and colour from the config token', () => {
    const { query } = render('<xui-form-field label="Name"><input xuiFakeControl /></xui-form-field>', {
      imports: IMPORTS,
      providers: [provideXuiFormFieldConfig({ inline: true, color: 'primary' })]
    });

    expectClasses(query('xui-form-field'), 'flex', 'items-baseline');
    expectClasses(query('label'), 'text-primary');
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
