import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiLabel } from './label';

const setup = (template: string) => render(template, { imports: [XuiLabel] });

const instance = (fixture: ReturnType<typeof setup>['fixture']) =>
  fixture.debugElement.children[0].injector.get(XuiLabel);

describe('XuiLabel', () => {
  it('applies the base typography classes', () => {
    const { query } = setup('<label xuiLabel>E-Mail</label>');

    expect(query('label').textContent).toBe('E-Mail');
    expectClasses(query('label'), 'text-sm', 'font-medium', 'leading-none');
  });

  it('gets a generated id from the XLabel host directive', () => {
    const { query } = setup('<label xuiLabel></label>');

    expect(query('label').id).toMatch(/^x-label-\d+$/);
  });

  it('honours an explicit id', () => {
    const { query } = setup('<label xuiLabel id="email-label"></label>');

    expect(query('label').id).toBe('email-label');
  });

  it('defers to the control for the error state by default', () => {
    const { query } = setup('<label xuiLabel></label>');

    // `auto` styles through a `:has()` selector rather than colouring eagerly.
    expectClasses(query('label'), '[&:has([xuiInput].ng-invalid.ng-touched)]:text-error');
    expectNoClasses(query('label'), 'text-error');
  });

  it('colours itself when the error input is forced on', () => {
    const { query } = setup('<label xuiLabel error="true"></label>');

    expectClasses(query('label'), 'text-error');
  });

  it('setError updates the error state imperatively', () => {
    const { fixture, query } = setup('<label xuiLabel></label>');

    instance(fixture).setError(true);
    fixture.detectChanges();

    expectClasses(query('label'), 'text-error');
  });

  it('merges the class input', () => {
    const { query } = setup('<label xuiLabel class="mb-1"></label>');

    expectClasses(query('label'), 'mb-1', 'font-medium');
  });
});
