import { render } from '@xui/testing';
import { XuiTruncatedFormat } from './truncated-format';

const setup = (props: Record<string, unknown>) =>
  render(
    `<xui-truncated-format [value]="props().value" [length]="props().length" [showExpand]="props().showExpand" />`,
    {
      imports: [XuiTruncatedFormat],
      props: { value: '', length: 80, showExpand: true, ...props }
    }
  );

const textEl = () => document.querySelector('xui-truncated-format > span') as HTMLElement;
const toggleEl = () => document.querySelector('xui-truncated-format button') as HTMLButtonElement | null;

describe('XuiTruncatedFormat', () => {
  it('shows a short value untouched, with no toggle', () => {
    const { detect } = setup({ value: 'hello', length: 80 });
    detect();

    expect(textEl().textContent).toBe('hello');
    expect(toggleEl()).toBeNull();
  });

  it('truncates a long value with an ellipsis and a full-text title', () => {
    const { detect } = setup({ value: 'abcdefghij', length: 4 });
    detect();

    expect(textEl().textContent).toBe('abcd…');
    expect(textEl().getAttribute('title')).toBe('abcdefghij');
  });

  it('expands and re-collapses via the toggle', () => {
    const { detect, click } = setup({ value: 'abcdefghij', length: 4 });
    detect();

    expect(toggleEl()?.textContent?.trim()).toBe('more');

    click(toggleEl()!);
    detect();
    expect(textEl().textContent).toBe('abcdefghij');
    expect(toggleEl()?.textContent?.trim()).toBe('less');

    click(toggleEl()!);
    detect();
    expect(textEl().textContent).toBe('abcd…');
  });

  it('omits the toggle when showExpand is false', () => {
    const { detect } = setup({ value: 'abcdefghij', length: 4, showExpand: false });
    detect();

    expect(textEl().textContent).toBe('abcd…');
    expect(toggleEl()).toBeNull();
  });
});
