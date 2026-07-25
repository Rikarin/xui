import { render } from '@xui/testing';
import { XuiInputOtp } from './input-otp';

const setup = (attrs = '', props: Record<string, unknown> = {}) => {
  const result = render(`<xui-input-otp ${attrs} [(value)]="props().value" />`, {
    imports: [XuiInputOtp],
    props: { value: '', ...props }
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-input-otp').componentInstance as XuiInputOtp;
  const field = () => document.querySelector('xui-input-otp input') as HTMLInputElement;
  const slots = () => [...document.querySelectorAll('xui-input-otp > div > div')];
  return { ...result, cmp, field, slots };
};

const type = (field: HTMLInputElement, value: string) => {
  field.value = value;
  field.dispatchEvent(new Event('input'));
};

describe('XuiInputOtp', () => {
  it('renders one slot per length', () => {
    const { detect, slots } = setup(`[length]="4"`);
    detect();
    expect(slots()).toHaveLength(4);
  });

  it('shows each character in its slot', () => {
    const { detect, slots } = setup(`[length]="4"`, { value: '12' });
    detect();
    expect(slots()[0].textContent?.trim()).toBe('1');
    expect(slots()[1].textContent?.trim()).toBe('2');
    expect(slots()[2].textContent?.trim()).toBe('');
  });

  it('strips non-digits in numeric mode and updates the value', () => {
    const { detect, cmp, field } = setup(`[length]="6"`);
    detect();
    type(field(), '12a3');
    detect();
    expect(cmp.value()).toBe('123');
  });

  it('allows letters in text mode', () => {
    const { detect, cmp, field } = setup(`[length]="6" inputType="text"`);
    detect();
    type(field(), 'ab3');
    detect();
    expect(cmp.value()).toBe('ab3');
  });

  it('caps input at the length', () => {
    const { detect, cmp, field } = setup(`[length]="4"`);
    detect();
    type(field(), '1234567');
    detect();
    expect(cmp.value()).toBe('1234');
  });

  it('emits completed when every slot is filled', () => {
    const { detect, cmp, field } = setup(`[length]="4"`);
    detect();
    const done: string[] = [];
    cmp.completed.subscribe((v: string) => done.push(v));
    type(field(), '999');
    detect();
    expect(done).toEqual([]);
    type(field(), '9999');
    detect();
    expect(done).toEqual(['9999']);
  });

  it('masks characters when asked', () => {
    const { detect, slots } = setup(`[length]="4" mask`, { value: '12' });
    detect();
    expect(slots()[0].textContent?.trim()).toBe('•');
  });
});
