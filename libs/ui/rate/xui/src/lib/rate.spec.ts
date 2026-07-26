import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@xui/testing';
import { XuiRate } from './rate';

const setup = (attrs = '', props: Record<string, unknown> = {}) => {
  const result = render(`<xui-rate ${attrs} [(value)]="props().value" />`, {
    imports: [XuiRate],
    props: { value: 0, ...props }
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-rate').componentInstance as XuiRate;
  return { ...result, cmp };
};

// Full-star click targets are the right-side overlay spans (`w-full` when not half).
const rightHalves = () => [...document.querySelectorAll('xui-rate > span > span:last-child')] as HTMLElement[];
const host = () => document.querySelector('xui-rate') as HTMLElement;

describe('XuiRate', () => {
  it('renders `count` stars and exposes slider semantics', () => {
    const { detect } = setup('[count]="5"');
    detect();

    expect(document.querySelectorAll('xui-rate > span').length).toBe(5);
    expect(host().getAttribute('role')).toBe('slider');
    expect(host().getAttribute('aria-valuemax')).toBe('5');
  });

  it('sets the value on click', () => {
    const { detect, cmp } = setup('[count]="5"');
    detect();

    rightHalves()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    detect();

    expect(cmp.value()).toBe(3);
    expect(host().getAttribute('aria-valuenow')).toBe('3');
  });

  it('clears when clicking the current value (allowClear)', () => {
    const { detect, cmp } = setup('[count]="5"', { value: 3 });
    detect();

    rightHalves()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    detect();

    expect(cmp.value()).toBe(0);
  });

  it('supports half values via the left half', () => {
    const { detect, cmp } = setup('[count]="5" allowHalf');
    detect();

    // The third star's left-half overlay → 2.5.
    const thirdStar = document.querySelectorAll('xui-rate > span')[2];
    const leftHalf = thirdStar.querySelector('span:nth-child(3)') as HTMLElement;
    leftHalf.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    detect();

    expect(cmp.value()).toBe(2.5);
  });

  it('adjusts with arrow keys', () => {
    const { detect, cmp } = setup('[count]="5"', { value: 2 });
    detect();

    host().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    detect();
    expect(cmp.value()).toBe(3);

    host().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    host().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    detect();
    expect(cmp.value()).toBe(1);
  });

  it('does not react when readonly', () => {
    const { detect, cmp } = setup('[count]="5" readonly', { value: 2 });
    detect();

    // No click overlays are rendered when readonly.
    expect(document.querySelectorAll('xui-rate > span > span.cursor-pointer').length).toBe(0);
    host().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    detect();
    expect(cmp.value()).toBe(2);
  });

  it('names the slider and describes its value', () => {
    const { detect } = setup();
    detect();

    // role="slider" with no name is an axe violation and announces as nothing.
    expect(host().getAttribute('aria-label')).toBe('Rating');
    expect(host().getAttribute('aria-valuetext')).toBe('0 of 5');
  });

  it('takes a caller-supplied name', () => {
    const { detect } = setup('aria-label="Food quality"');
    detect();

    expect(host().getAttribute('aria-label')).toBe('Food quality');
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<number>) =>
      render(`<xui-rate [formControl]="props().control" />`, {
        imports: [XuiRate, ReactiveFormsModule],
        props: { control }
      });

    it('writes the control value into the stars', () => {
      const control = new FormControl(3, { nonNullable: true });
      const { detect } = formSetup(control);
      detect();

      expect(host().getAttribute('aria-valuenow')).toBe('3');

      control.setValue(1);
      detect();
      expect(host().getAttribute('aria-valuenow')).toBe('1');
    });

    it('propagates a click back to the control and honours disable()', () => {
      const control = new FormControl(0, { nonNullable: true });
      const { detect } = formSetup(control);
      detect();

      rightHalves()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      detect();

      expect(control.value).toBe(3);

      control.disable();
      detect();
      expect(host().getAttribute('aria-disabled')).toBe('true');
      // The click overlays are removed while disabled, so no interaction is possible.
      expect(document.querySelectorAll('xui-rate > span > span.cursor-pointer').length).toBe(0);
    });
  });
});
