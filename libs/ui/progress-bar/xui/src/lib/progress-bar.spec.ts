import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiProgressBar } from './progress-bar';
import { provideXuiProgressBarConfig } from './progress-bar.token';

const setup = (template: string, providers: unknown[] = []) =>
  render(template, { imports: [XuiProgressBar], providers });

const meter = (query: ReturnType<typeof setup>['query']) => query('xui-progress-bar > span');

describe('XuiProgressBar', () => {
  it('exposes itself as a progressbar over a 0–100 range', () => {
    const { query } = setup('<xui-progress-bar [value]="0.5" />');

    expectAttributes(query('xui-progress-bar'), {
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '50'
    });
  });

  it('renders the meter at the matching width', () => {
    const { query } = setup('<xui-progress-bar [value]="0.25" />');

    expect(meter(query).style.width).toBe('25%');
  });

  it.each([
    [-1, 0],
    [0, 0],
    [1, 100],
    [2, 100]
  ])('clamps a value of %s to %s percent', (value, expected) => {
    const { query } = setup(`<xui-progress-bar [value]="${value}" />`);

    expectAttributes(query('xui-progress-bar'), { 'aria-valuenow': String(expected) });
  });

  it('is indeterminate without a value, filling the track and omitting aria-valuenow', () => {
    const { query } = setup('<xui-progress-bar />');

    // A screen reader reads a progressbar with no `aria-valuenow` as "busy",
    // which is exactly what an unmeasurable operation should announce.
    expectAttributes(query('xui-progress-bar'), { 'aria-valuenow': null });
    expectClasses(meter(query), 'w-full');
    expect(meter(query).style.width).toBe('');
  });

  it('applies the colour variant to the meter', () => {
    const { query } = setup('<xui-progress-bar [value]="0.5" color="success" />');

    expectClasses(meter(query), 'bg-success');
    expectNoClasses(meter(query), 'bg-primary');
  });

  it('applies the size variant to the track', () => {
    const { query } = setup('<xui-progress-bar [value]="0.5" size="lg" />');

    expectClasses(query('xui-progress-bar'), 'h-3');
  });

  it('animates the stripes by default and stops when told to', () => {
    const { query: animated } = setup('<xui-progress-bar [value]="0.5" />');
    expectClasses(animated('xui-progress-bar > span'), 'animate-[xui-progress-stripes_1s_linear_infinite]');

    const { query: still } = setup('<xui-progress-bar [value]="0.5" [animate]="false" />');
    expectNoClasses(still('xui-progress-bar > span'), 'animate-[xui-progress-stripes_1s_linear_infinite]');
  });

  it('drops the stripe gradient and its animation together', () => {
    const { query } = setup('<xui-progress-bar [value]="0.5" [stripes]="false" />');

    expectNoClasses(meter(query), 'animate-[xui-progress-stripes_1s_linear_infinite]');
    expect(meter(query).className).not.toContain('linear-gradient');
  });

  it('takes its defaults from the injected config', () => {
    const { query } = setup('<xui-progress-bar [value]="0.5" />', [
      provideXuiProgressBarConfig({ color: 'error', size: 'sm' })
    ]);

    expectClasses(query('xui-progress-bar'), 'h-1');
    expectClasses(meter(query), 'bg-error');
  });

  it('accepts an accessible name', () => {
    const { query } = setup('<xui-progress-bar [value]="0.5" aria-label="Uploading" />');

    expectAttributes(query('xui-progress-bar'), { 'aria-label': 'Uploading' });
  });

  it('merges the class input', () => {
    const { query } = setup('<xui-progress-bar [value]="0.5" class="max-w-xs" />');

    expectClasses(query('xui-progress-bar'), 'max-w-xs', 'rounded-full');
  });
});
