import { FormsModule } from '@angular/forms';
import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiInputImports } from '../index';

const IMPORTS = [XuiInputImports, FormsModule];

const input = () => document.querySelector('xui-input-group input') as HTMLInputElement;
const clearButton = () => document.querySelector('button[aria-label="Clear"]');

const type = (value: string, detect: () => void) => {
  input().value = value;
  input().dispatchEvent(new Event('input', { bubbles: true }));
  detect();
};

describe('XuiInputGroup', () => {
  it('pads the leading edge when a left element is present', () => {
    const { detect } = render(
      `<xui-input-group>
         <span xuiInputLeftElement>@</span>
         <input xuiInput />
       </xui-input-group>`,
      { imports: IMPORTS }
    );
    detect();

    expectClasses(input(), 'ps-(--control-height-md)');
    expectNoClasses(input(), 'pe-(--control-height-md)');
  });

  it('pads the trailing edge when a right element is present', () => {
    const { detect } = render(
      `<xui-input-group>
         <input xuiInput />
         <button xuiInputRightElement>go</button>
       </xui-input-group>`,
      { imports: IMPORTS }
    );
    detect();

    expectClasses(input(), 'pe-(--control-height-md)');
  });

  it('reserves the trailing edge for the clear button', () => {
    const { detect } = render(`<xui-input-group clearable><input xuiInput /></xui-input-group>`, {
      imports: IMPORTS
    });
    detect();

    expectClasses(input(), 'pe-(--control-height-md)');
  });

  it('shows the clear button only once the input holds a value', () => {
    const { detect } = render(`<xui-input-group clearable><input xuiInput /></xui-input-group>`, {
      imports: IMPORTS
    });
    detect();

    expect(clearButton()).toBeNull();

    type('hello', detect);

    expect(clearButton()).toBeTruthy();
  });

  it('empties the input on clear and re-hides its own button', () => {
    const { detect, click } = render(`<xui-input-group clearable><input xuiInput /></xui-input-group>`, {
      imports: IMPORTS
    });
    detect();

    type('draft', detect);
    expect(clearButton()).toBeTruthy();

    click('button[aria-label="Clear"]');
    detect();

    // Clearing empties the field and, because it re-fires `input`, the button
    // hides itself again — proving the synthetic event round-trips through sync.
    expect(input().value).toBe('');
    expect(clearButton()).toBeNull();
  });

  it('leaves the input unpadded with no adornments', () => {
    const { detect } = render(`<xui-input-group><input xuiInput /></xui-input-group>`, { imports: IMPORTS });
    detect();

    expectNoClasses(input(), 'ps-(--control-height-md)', 'pe-(--control-height-md)');
  });
});
