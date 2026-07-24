import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiSpinner } from './spinner';
import { provideXuiSpinnerConfig } from './spinner.token';

const setup = (template: string, providers: unknown[] = []) => render(template, { imports: [XuiSpinner], providers });

const head = (query: ReturnType<typeof setup>['query']) => query('svg circle:last-of-type');

describe('XuiSpinner', () => {
  it('announces itself as a status with a visually hidden label', () => {
    const { query } = setup('<xui-spinner>Loading users</xui-spinner>');

    expectAttributes(query('xui-spinner'), { role: 'status' });
    expect(query('.sr-only').textContent).toBe('Loading users');
  });

  it('hides the decorative svg from assistive technology', () => {
    const { query } = setup('<xui-spinner />');

    expectAttributes(query('svg'), { 'aria-hidden': 'true' });
  });

  it('spins and omits the value range while indeterminate', () => {
    const { query } = setup('<xui-spinner />');

    expectClasses(query('svg'), 'animate-spin');
    expectAttributes(query('xui-spinner'), { 'aria-valuenow': null, 'aria-valuemin': null, 'aria-valuemax': null });
  });

  it('stops spinning and reports the value once determinate', () => {
    const { query } = setup('<xui-spinner [value]="0.5" />');

    expectNoClasses(query('svg'), 'animate-spin');
    expectAttributes(query('xui-spinner'), { 'aria-valuenow': '50', 'aria-valuemin': '0', 'aria-valuemax': '100' });
  });

  it.each([
    [-1, 0],
    [0, 0],
    [1, 100],
    [2, 100]
  ])('clamps a value of %s to %s percent', (value, expected) => {
    const { query } = setup(`<xui-spinner [value]="${value}" />`);

    expectAttributes(query('xui-spinner'), { 'aria-valuenow': String(expected) });
  });

  it('draws the arc proportionally to the value', () => {
    const { query } = setup('<xui-spinner [value]="0.25" />');
    const circumference = Number(head(query).getAttribute('stroke-dasharray'));

    // A quarter of the way round leaves three quarters of the track undrawn.
    expect(Number(head(query).getAttribute('stroke-dashoffset'))).toBeCloseTo(circumference * 0.75, 5);
  });

  it('draws a full circle at 100 percent', () => {
    const { query } = setup('<xui-spinner [value]="1" />');

    expect(Number(head(query).getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 5);
  });

  it('applies the size variant', () => {
    const { query } = setup('<xui-spinner size="xs" />');

    expectClasses(query('xui-spinner'), 'h-4', 'w-4');
  });

  it('applies the colour variant', () => {
    const { query } = setup('<xui-spinner color="error" />');

    expectClasses(query('xui-spinner'), 'text-error');
  });

  it('can inherit the surrounding text colour', () => {
    const { query } = setup('<xui-spinner color="inherit" />');

    expectClasses(query('xui-spinner'), 'text-inherit');
  });

  it('takes its defaults from the injected config', () => {
    const { query } = setup('<xui-spinner />', [provideXuiSpinnerConfig({ color: 'success', size: 'lg' })]);

    expectClasses(query('xui-spinner'), 'text-success', 'h-12');
  });

  it('merges the class input', () => {
    const { query } = setup('<xui-spinner class="mx-auto" />');

    expectClasses(query('xui-spinner'), 'mx-auto', 'inline-block');
  });
});
