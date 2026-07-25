import { render } from '@xui/testing';
import { XuiDateInputImports } from '../index';
import { XuiDateInput } from './date-input';

const IMPORTS = [XuiDateInputImports];
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-date-input
       [value]="props().value ?? null"
       [closeOnSelection]="props().closeOnSelection ?? true"
       (dateChange)="props().onChange?.($event)" />`,
    { imports: IMPORTS, props }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-date-input')
    .componentInstance as XuiDateInput<Date>;
  return { ...result, cmp };
};

const input = () => document.querySelector('xui-date-input input') as HTMLInputElement;
const calendarButton = () => document.querySelector('xui-date-input button') as HTMLButtonElement;
const picker = () => document.querySelector('.cdk-overlay-container xui-date-picker');
const dayButton = (label: number) =>
  [...document.querySelectorAll('.cdk-overlay-container tbody button')].find(
    b => b.textContent?.trim() === String(label) && !b.className.includes('text-foreground-subtle')
  ) as HTMLButtonElement | undefined;

describe('XuiDateInput', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove()));

  it('shows an empty field with a placeholder when there is no value', () => {
    const { detect } = setup();
    detect();

    expect(input().value).toBe('');
  });

  it('formats the bound value into the field', () => {
    const { detect } = setup({ value: d(2024, 3, 15) });
    detect();

    // default format is a 2-digit locale date containing the parts
    expect(input().value).toMatch(/2024/);
    expect(input().value).toMatch(/15/);
  });

  it('opens a calendar popover from the trigger', () => {
    const { detect, click } = setup({ value: d(2024, 3, 15) });
    detect();

    click(calendarButton());
    detect();

    expect(picker()).toBeTruthy();
  });

  it('sets the value when a calendar day is picked and closes', () => {
    const changes: (Date | null)[] = [];
    const { detect, click, cmp } = setup({ value: d(2024, 3, 15), onChange: (v: Date | null) => changes.push(v) });
    detect();
    click(calendarButton());
    detect();

    dayButton(20)!.click();
    detect();

    expect(cmp.value()?.getDate()).toBe(20);
    expect(changes.at(-1)?.getDate()).toBe(20);
    expect(picker()).toBeNull(); // closeOnSelection
  });

  it('keeps the popover open when closeOnSelection is false', () => {
    const { detect, click } = setup({ value: d(2024, 3, 15), closeOnSelection: false });
    detect();
    click(calendarButton());
    detect();

    dayButton(20)!.click();
    detect();

    expect(picker()).toBeTruthy();
  });

  it('parses a typed date on Enter', () => {
    const { detect, cmp } = setup();
    detect();

    input().value = '2024-06-09';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    detect();

    expect(cmp.value()?.getFullYear()).toBe(2024);
    expect(cmp.value()?.getMonth()).toBe(5); // June
    expect(cmp.value()?.getDate()).toBe(9);
  });

  it('clears the value when the field is emptied', () => {
    const { detect, cmp } = setup({ value: d(2024, 3, 15) });
    detect();

    input().value = '';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    input().dispatchEvent(new Event('blur'));
    detect();

    expect(cmp.value()).toBeNull();
  });

  it('ignores unparseable text, keeping the current value', () => {
    const { detect, cmp } = setup({ value: d(2024, 3, 15) });
    detect();

    input().value = 'not a date';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    input().dispatchEvent(new Event('blur'));
    detect();

    expect(cmp.value()?.getDate()).toBe(15);
  });
});
