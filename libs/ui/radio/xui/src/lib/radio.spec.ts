import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectAttributes, render } from '@xui/testing';
import { XuiRadioImports } from '../index';

const IMPORTS = [XuiRadioImports, ReactiveFormsModule];

const GROUP = `
  <xui-radio-group [(value)]="props().value" aria-label="Plan">
    <xui-radio value="free" />
    <xui-radio value="pro" />
    <xui-radio value="team" disabled />
  </xui-radio-group>
`;

const radios = () => [...document.querySelectorAll('xui-radio')] as HTMLElement[];
const radio = (value: string) => radios()[['free', 'pro', 'team'].indexOf(value)];

const setup = (template = GROUP, props: Record<string, unknown> = { value: null }) =>
  render(template, { imports: IMPORTS, props });

describe('XuiRadio', () => {
  it('is a radiogroup of radios, labelled', () => {
    const { query } = setup();

    expectAttributes(query('xui-radio-group'), { role: 'radiogroup', 'aria-label': 'Plan' });
    expect(radios().every(node => node.getAttribute('role') === 'radio')).toBe(true);
  });

  it('selects on click and reflects the checked state', () => {
    const { fixture, click } = setup();

    click(radio('pro'));

    expectAttributes(radio('pro'), { 'aria-checked': 'true', 'data-state': 'checked' });
    expectAttributes(radio('free'), { 'aria-checked': 'false' });
    expect((fixture.componentInstance as { props: () => { value: unknown } }).props().value).toBe('pro');
  });

  it('holds a single tab stop: the first enabled option before any selection', () => {
    const { detect } = setup();
    detect();

    // free = 0 (first enabled), pro = -1, disabled team = -1.
    expect(radios().map(node => node.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('moves the tab stop onto the selected option', () => {
    const { click } = setup();

    click(radio('pro'));

    expect(radios().map(node => node.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('moves selection with the arrow keys, skipping disabled and wrapping', () => {
    const { press } = setup(GROUP, { value: 'free' });

    press('xui-radio-group', 'ArrowDown');
    expect(radio('pro').getAttribute('aria-checked')).toBe('true');

    // Down from pro skips the disabled team and wraps to free.
    press('xui-radio-group', 'ArrowDown');
    expect(radio('free').getAttribute('aria-checked')).toBe('true');

    press('xui-radio-group', 'ArrowUp');
    expect(radio('pro').getAttribute('aria-checked')).toBe('true');
  });

  it('finds radios wrapped in a label', () => {
    // The common markup nests each radio in a <label>, so the group must reach
    // its buttons through descendants, not just direct children.
    const { press } = setup(
      `<xui-radio-group [(value)]="props().value" aria-label="Plan">
         <label><xui-radio value="free" /> Free</label>
         <label><xui-radio value="pro" /> Pro</label>
       </xui-radio-group>`,
      { value: 'free' }
    );

    press('xui-radio-group', 'ArrowDown');

    expect(radio('pro').getAttribute('aria-checked')).toBe('true');
  });

  it('does not select a disabled option', () => {
    const { fixture, click } = setup();

    click(radio('team'));

    expect(radio('team').getAttribute('aria-checked')).toBe('false');
    expect((fixture.componentInstance as { props: () => { value: unknown } }).props().value).toBeNull();
  });

  describe('as a form control', () => {
    it('writes the control value onto the matching radio', () => {
      const control = new FormControl('pro');
      setup(
        '<xui-radio-group [formControl]="props().control"><xui-radio value="free" /><xui-radio value="pro" /></xui-radio-group>',
        {
          control
        }
      );

      expect(radio('pro').getAttribute('aria-checked')).toBe('true');
    });

    it('propagates a selection back to the control', () => {
      const control = new FormControl<string | null>(null);
      const { click } = setup(
        '<xui-radio-group [formControl]="props().control"><xui-radio value="free" /><xui-radio value="pro" /></xui-radio-group>',
        { control }
      );

      click(radios()[1]);

      expect(control.value).toBe('pro');
    });
  });
});
