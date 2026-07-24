import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@xui/testing';
import { XuiTagInputImports } from '../index';

const IMPORTS = [XuiTagInputImports, ReactiveFormsModule];

const field = () => document.querySelector('xui-tag-input input') as HTMLInputElement;
const tags = () =>
  [...document.querySelectorAll('xui-tag-input span')].map(s => s.textContent?.trim().replace(/\s+/g, ' '));
const removeButtons = () => [...document.querySelectorAll('xui-tag-input button')] as HTMLButtonElement[];

const typeAnd = (text: string, key: string, detect: () => void) => {
  field().value = text;
  field().dispatchEvent(new Event('input', { bubbles: true }));
  // Detect after typing so the draft renders — a real user's keystroke would have
  // done its own change detection before the commit key arrives.
  detect();
  field().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  detect();
};

describe('XuiTagInput', () => {
  it('renders the seeded tags', () => {
    const { detect } = render('<xui-tag-input [values]="props().v" />', {
      imports: IMPORTS,
      props: { v: ['red', 'green'] }
    });
    detect();

    expect(tags()).toEqual(['red', 'green']);
  });

  it('adds a tag on Enter and clears the field', () => {
    const { detect } = render('<xui-tag-input />', { imports: IMPORTS });
    detect();

    typeAnd('blue', 'Enter', detect);

    expect(tags()).toEqual(['blue']);
    expect(field().value).toBe('');
  });

  it('adds a tag when the separator key is pressed', () => {
    const { detect } = render('<xui-tag-input />', { imports: IMPORTS });
    detect();

    typeAnd('alpha', ',', detect);

    expect(tags()).toEqual(['alpha']);
  });

  it('ignores blank input', () => {
    const { detect } = render('<xui-tag-input />', { imports: IMPORTS });
    detect();

    typeAnd('   ', 'Enter', detect);

    expect(tags()).toEqual([]);
  });

  it('rejects duplicates by default', () => {
    const { detect } = render('<xui-tag-input [values]="props().v" />', { imports: IMPORTS, props: { v: ['a'] } });
    detect();

    typeAnd('a', 'Enter', detect);

    expect(tags()).toEqual(['a']);
  });

  it('allows duplicates when opted in', () => {
    const { detect } = render('<xui-tag-input allowDuplicates [values]="props().v" />', {
      imports: IMPORTS,
      props: { v: ['a'] }
    });
    detect();

    typeAnd('a', 'Enter', detect);

    expect(tags()).toEqual(['a', 'a']);
  });

  it('removes the last tag on Backspace when the field is empty', () => {
    const { detect } = render('<xui-tag-input [values]="props().v" />', {
      imports: IMPORTS,
      props: { v: ['x', 'y'] }
    });
    detect();

    typeAnd('', 'Backspace', detect);

    expect(tags()).toEqual(['x']);
  });

  it('removes a tag when its ✕ is clicked', () => {
    const { detect } = render('<xui-tag-input [values]="props().v" />', {
      imports: IMPORTS,
      props: { v: ['one', 'two', 'three'] }
    });
    detect();

    removeButtons()[1].click();
    detect();

    expect(tags()).toEqual(['one', 'three']);
  });

  it('splits pasted text on the separator', () => {
    const { detect } = render('<xui-tag-input />', { imports: IMPORTS });
    detect();

    // jsdom lacks DataTransfer/ClipboardEvent-with-data, so mock clipboardData.
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => 'a, b, c' } });
    field().dispatchEvent(event);
    detect();

    expect(tags()).toEqual(['a', 'b', 'c']);
  });

  it('hides the remove buttons while disabled', () => {
    const { detect } = render('<xui-tag-input disabled [values]="props().v" />', {
      imports: IMPORTS,
      props: { v: ['a'] }
    });
    detect();

    expect(removeButtons().length).toBe(0);
    expect(field().disabled).toBe(true);
  });

  describe('as a form control', () => {
    it('writes the control value as tags', () => {
      const control = new FormControl<string[]>(['from', 'form']);
      const { detect } = render('<xui-tag-input [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      expect(tags()).toEqual(['from', 'form']);
    });

    it('pushes added tags back to the control', () => {
      const control = new FormControl<string[]>([]);
      const { detect } = render('<xui-tag-input [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      typeAnd('new', 'Enter', detect);

      expect(control.value).toEqual(['new']);
    });
  });
});
