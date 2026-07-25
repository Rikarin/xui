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
});
