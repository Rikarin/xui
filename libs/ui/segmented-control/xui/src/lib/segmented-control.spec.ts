import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectAttributes, render } from '@xui/testing';
import { XuiSegmentedControlImports } from '../index';

const IMPORTS = [XuiSegmentedControlImports, ReactiveFormsModule];

const OPTIONS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'board', label: 'Board', disabled: true }
];

const segments = () => [...document.querySelectorAll('xui-segmented-control button')] as HTMLButtonElement[];
const segment = (label: string) => segments().find(b => b.textContent?.trim() === label)!;

const setup = (template: string, props: Record<string, unknown> = {}) =>
  render(template, { imports: IMPORTS, props: { options: OPTIONS, ...props } });

const CONTROL = '<xui-segmented-control [options]="props().options" [(value)]="props().value" aria-label="View" />';

describe('XuiSegmentedControl', () => {
  it('is a labelled radiogroup of radio segments', () => {
    const { query, detect } = setup(CONTROL, { value: null });
    detect();

    expectAttributes(query('xui-segmented-control'), { role: 'radiogroup', 'aria-label': 'View' });
    expect(segments().every(b => b.getAttribute('role') === 'radio')).toBe(true);
    expect(segments().map(b => b.textContent?.trim())).toEqual(['List', 'Grid', 'Board']);
  });

  it('selects on click and reflects the checked state', () => {
    const { fixture, detect, click } = setup(CONTROL, { value: null });
    detect();

    click(segment('Grid'));

    expect(segment('Grid').getAttribute('aria-checked')).toBe('true');
    expect(segment('List').getAttribute('aria-checked')).toBe('false');
    expect((fixture.componentInstance as { props: () => { value: unknown } }).props().value).toBe('grid');
  });

  it('holds a single tab stop on the first enabled segment before any choice', () => {
    const { detect } = setup(CONTROL, { value: null });
    detect();

    expect(segments().map(b => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('moves the tab stop onto the selected segment', () => {
    const { detect, click } = setup(CONTROL, { value: null });
    detect();

    click(segment('Grid'));

    expect(segments().map(b => b.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('moves selection with the arrow keys, skipping disabled and wrapping', () => {
    const { detect, press } = setup(CONTROL, { value: 'list' });
    detect();

    press(segment('List'), 'ArrowRight');
    expect(segment('Grid').getAttribute('aria-checked')).toBe('true');

    // Right from Grid skips the disabled Board and wraps to List.
    press(segment('Grid'), 'ArrowRight');
    expect(segment('List').getAttribute('aria-checked')).toBe('true');
  });

  it('does not select a disabled segment', () => {
    const { fixture, detect, click } = setup(CONTROL, { value: null });
    detect();

    click(segment('Board'));

    expect(segment('Board').getAttribute('aria-checked')).toBe('false');
    expect((fixture.componentInstance as { props: () => { value: unknown } }).props().value).toBeNull();
  });

  describe('as a form control', () => {
    it('writes the control value onto the matching segment', () => {
      const control = new FormControl('grid');
      setup('<xui-segmented-control [options]="props().options" [formControl]="props().control" />', {
        control
      });

      expect(segment('Grid').getAttribute('aria-checked')).toBe('true');
    });

    it('propagates a selection back to the control', () => {
      const control = new FormControl<string | null>(null);
      const { detect, click } = setup(
        '<xui-segmented-control [options]="props().options" [formControl]="props().control" />',
        { control }
      );
      detect();

      click(segment('Grid'));

      expect(control.value).toBe('grid');
    });
  });
});
