import { render } from '@xui/testing';
import { XuiEditableCell } from './editable-cell';

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-editable-cell [value]="props().value" [editable]="props().editable" (edited)="props().onEdited($event)" (cancelled)="props().onCancelled()" />`,
    {
      imports: [XuiEditableCell],
      props: { value: 'hello', editable: true, onEdited: () => undefined, onCancelled: () => undefined, ...props }
    }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-editable-cell')
    .componentInstance as XuiEditableCell;
  return { ...result, cmp };
};

const span = () => document.querySelector('xui-editable-cell span') as HTMLElement | null;
const inputEl = () => document.querySelector('xui-editable-cell input') as HTMLInputElement | null;

describe('XuiEditableCell', () => {
  it('shows the value as text and no editor at rest', () => {
    const { detect } = setup({ value: 'hello' });
    detect();

    expect(span()?.textContent).toBe('hello');
    expect(inputEl()).toBeNull();
  });

  it('opens the editor on double-click and focuses it', () => {
    const { detect } = setup();
    detect();

    span()!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    detect();

    expect(inputEl()).not.toBeNull();
    expect(inputEl()?.value).toBe('hello');
    expect(document.activeElement).toBe(inputEl());
  });

  it('commits a changed value on Enter and emits edited once', () => {
    const edits: string[] = [];
    const { detect, cmp } = setup({ onEdited: (v: string) => edits.push(v) });
    detect();

    cmp.edit();
    detect();
    const field = inputEl()!;
    field.value = 'world';
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    detect();

    expect(edits).toEqual(['world']);
    expect(cmp.value()).toBe('world');
    expect(inputEl()).toBeNull();
  });

  it('does not emit when the value is unchanged', () => {
    const edits: string[] = [];
    const { detect, cmp } = setup({ onEdited: (v: string) => edits.push(v) });
    detect();

    cmp.edit();
    detect();
    inputEl()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    detect();

    expect(edits).toEqual([]);
  });

  it('cancels on Escape, keeping the original value', () => {
    const cancels: number[] = [];
    const { detect, cmp } = setup({ onCancelled: () => cancels.push(1) });
    detect();

    cmp.edit();
    detect();
    const field = inputEl()!;
    field.value = 'discard me';
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    detect();

    expect(cancels).toEqual([1]);
    expect(cmp.value()).toBe('hello');
    expect(span()?.textContent).toBe('hello');
  });

  it('does not open the editor when not editable', () => {
    const { detect } = setup({ editable: false });
    detect();

    span()!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    detect();

    expect(inputEl()).toBeNull();
  });
});
