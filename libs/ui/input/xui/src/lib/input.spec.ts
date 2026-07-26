import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiInput } from './input';

const setup = (template: string, props?: Record<string, unknown>) =>
  render(template, { imports: [XuiInput, ReactiveFormsModule], props });

const instance = (fixture: ReturnType<typeof setup>['fixture']) =>
  fixture.debugElement.children[0].injector.get(XuiInput);

describe('XuiInput', () => {
  it('applies the base classes to the host input', () => {
    const { query } = setup('<input xuiInput />');

    expectClasses(query('input'), 'flex', 'rounded-lg', 'border', 'border-border');
  });

  it('styles itself from theme tokens rather than a fixed palette', () => {
    const { query } = setup('<input xuiInput />');

    expectClasses(query('input'), 'bg-surface-inset', 'text-foreground', 'placeholder:text-foreground-subtle');
  });

  it('defaults to the default size', () => {
    const { query } = setup('<input xuiInput />');

    expectClasses(query('input'), 'h-(--control-height-md)', 'px-(--control-padding-md)');
  });

  it('applies the size variant', () => {
    const { query } = setup('<input xuiInput size="sm" />');

    expectClasses(query('input'), 'h-(--control-height-sm)', 'px-(--control-padding-sm)');
    expectNoClasses(query('input'), 'h-(--control-height-md)');
  });

  it('defers the error styling to the control state by default', () => {
    const { query } = setup('<input xuiInput />');

    expectClasses(query('input'), '[&.ng-invalid.ng-touched]:border-error');
    expectNoClasses(query('input'), 'border-error');
  });

  it('colours itself when the error input is forced on', () => {
    const { query } = setup('<input xuiInput error="true" />');

    expectClasses(query('input'), 'border-error', 'text-error');
  });

  it('setError updates the error state imperatively', () => {
    const { fixture, query } = setup('<input xuiInput />');

    instance(fixture).setError(true);
    fixture.detectChanges();

    expectClasses(query('input'), 'border-error');
  });

  it('merges the class input', () => {
    const { query } = setup('<input xuiInput class="w-full" />');

    expectClasses(query('input'), 'w-full', 'rounded-lg');
  });

  it('applies the colour accent border, independent of the invalid state', () => {
    const { query } = setup('<input xuiInput color="success" />');

    expectClasses(query('input'), 'border-success');
    expectNoClasses(query('input'), 'border-error');
  });

  describe('when bound to a form control', () => {
    it('exposes the control and stays clean until touched', () => {
      const control = new FormControl('', Validators.required);
      const { fixture } = setup('<input xuiInput [formControl]="props().control" />', { control });

      expect(instance(fixture).ngControl).toBeTruthy();
      expect(instance(fixture).errorState()).toBe(false);
    });

    it('reports an error state once the control is invalid and touched', () => {
      const control = new FormControl('', Validators.required);
      const { fixture } = setup('<input xuiInput [formControl]="props().control" />', { control });

      control.markAsTouched();
      fixture.detectChanges();

      expect(instance(fixture).errorState()).toBe(true);
    });
  });
});
