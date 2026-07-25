import { render } from '@xui/testing';
import { XuiColorPicker } from './color-picker';

const setup = (attrs = '', props: Record<string, unknown> = {}) => {
  const result = render(`<xui-color-picker ${attrs} [(value)]="props().value" />`, {
    imports: [XuiColorPicker],
    props: { value: '#1677FF', ...props }
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-color-picker').componentInstance as XuiColorPicker;
  return { ...result, cmp };
};

const trigger = () => document.querySelector('xui-color-picker button') as HTMLButtonElement;
const panel = () => document.querySelector('xui-color-picker [role="dialog"]') as HTMLElement | null;

describe('XuiColorPicker', () => {
  it('shows the current value on the trigger', () => {
    const { detect } = setup('', { value: '#FF0000' });
    detect();

    expect(trigger().textContent).toContain('#FF0000');
    expect(panel()).toBeNull();
  });

  it('opens and closes the panel', () => {
    const { detect } = setup();
    detect();

    trigger().click();
    detect();
    expect(panel()).not.toBeNull();

    trigger().click();
    detect();
    expect(panel()).toBeNull();
  });

  it('accepts a typed hex value', () => {
    const { detect, cmp } = setup();
    detect();
    trigger().click();
    detect();

    const hex = document.querySelector('xui-color-picker input') as HTMLInputElement;
    hex.value = '#00ff00';
    hex.dispatchEvent(new Event('change'));
    detect();

    expect(cmp.value()).toBe('#00FF00');
  });

  it('applies a preset swatch', () => {
    const { detect, cmp } = setup(`[presets]="['#f5222d','#52c41a']"`);
    detect();
    trigger().click();
    detect();

    const swatch = document.querySelector('xui-color-picker [aria-label="#52c41a"]') as HTMLElement;
    swatch.click();
    detect();

    expect(cmp.value()).toBe('#52C41A');
  });

  it('syncs the internal HSV from an external value change', () => {
    const { detect, cmp, setProps } = setup();
    detect();

    setProps({ value: '#FF0000' });
    detect();

    // Opening shows the SV handle at full saturation/value for red.
    expect(cmp['hsv']()).toEqual({ h: 0, s: 100, v: 100 });
  });
});
