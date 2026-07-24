import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectAttributes, render } from '@xui/testing';
import { XuiEditableTextImports } from '../index';

const IMPORTS = [XuiEditableTextImports, ReactiveFormsModule];

const display = () => document.querySelector('xui-editable-text span');
const field = () => document.querySelector('xui-editable-text input, xui-editable-text textarea') as HTMLInputElement;

describe('XuiEditableText', () => {
  it('shows the value as a button-role label until edited', () => {
    const { detect } = render('<xui-editable-text value="Hello" />', { imports: IMPORTS });
    detect();

    expect(display()?.textContent).toBe('Hello');
    expectAttributes(display() as HTMLElement, { role: 'button', tabindex: '0' });
  });

  it('falls back to the placeholder when empty', () => {
    const { detect } = render('<xui-editable-text placeholder="Click to edit" />', { imports: IMPORTS });
    detect();

    expect(display()?.textContent).toBe('Click to edit');
  });

  it('swaps to an input on click, seeded with the current value', () => {
    const { detect, click } = render('<xui-editable-text value="Hi" />', { imports: IMPORTS });
    detect();

    click('span');

    expect(field().tagName).toBe('INPUT');
    expect(field().value).toBe('Hi');
  });

  it('confirms on Enter and returns to the label', () => {
    const values: string[] = [];
    const { detect, click, press, fixture } = render('<xui-editable-text value="Hi" (confirmed)="0" />', {
      imports: IMPORTS
    });
    const cmp = fixture.debugElement.query(n => n.name === 'xui-editable-text').componentInstance;
    cmp.confirmed.subscribe((v: string) => values.push(v));
    detect();

    click('span');
    field().value = 'Updated';
    field().dispatchEvent(new Event('input', { bubbles: true }));
    press(field(), 'Enter');

    expect(values).toEqual(['Updated']);
    expect(display()?.textContent).toBe('Updated');
  });

  it('reverts on Escape without confirming', () => {
    const { detect, click, press } = render('<xui-editable-text value="Original" />', { imports: IMPORTS });
    detect();

    click('span');
    field().value = 'Discarded';
    field().dispatchEvent(new Event('input', { bubbles: true }));
    press(field(), 'Escape');

    expect(display()?.textContent).toBe('Original');
  });

  it('confirms on blur', () => {
    const { detect, click } = render('<xui-editable-text value="Hi" />', { imports: IMPORTS });
    detect();

    click('span');
    field().value = 'Blurred';
    field().dispatchEvent(new Event('input', { bubbles: true }));
    field().dispatchEvent(new Event('blur'));
    detect();

    expect(display()?.textContent).toBe('Blurred');
  });

  it('does not enter edit mode while disabled', () => {
    const { detect, click } = render('<xui-editable-text value="Hi" disabled />', { imports: IMPORTS });
    detect();

    click('span');

    expect(field()).toBeNull();
    expect(display()).toBeTruthy();
  });

  describe('multiline', () => {
    it('uses a textarea and lets Enter insert a newline by default', () => {
      const { detect, click, press } = render('<xui-editable-text multiline value="Line" />', { imports: IMPORTS });
      detect();

      click('span');
      expect(field().tagName).toBe('TEXTAREA');

      press(field(), 'Enter');
      // Still editing — Enter did not confirm.
      expect(field()).toBeTruthy();
    });

    it('confirms on Enter when confirmOnEnterKey is set', () => {
      const { detect, click, press } = render('<xui-editable-text multiline confirmOnEnterKey value="Line" />', {
        imports: IMPORTS
      });
      detect();

      click('span');
      press(field(), 'Enter');

      expect(field()).toBeNull();
    });
  });

  describe('as a form control', () => {
    it('writes the control value into the label', () => {
      const control = new FormControl('From form');
      const { detect } = render('<xui-editable-text [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      expect(display()?.textContent).toBe('From form');
    });

    it('pushes a confirmed edit back to the control', () => {
      const control = new FormControl('Old');
      const { detect, click, press } = render('<xui-editable-text [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      click('span');
      field().value = 'New';
      field().dispatchEvent(new Event('input', { bubbles: true }));
      press(field(), 'Enter');

      expect(control.value).toBe('New');
    });
  });
});
