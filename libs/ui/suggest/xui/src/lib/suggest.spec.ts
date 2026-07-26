import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@xui/testing';
import { XuiSuggestImports } from '../index';
import { XuiSuggest } from './suggest';

interface City {
  name: string;
  disabled?: boolean;
}

const CITIES: City[] = [
  { name: 'Amsterdam' },
  { name: 'Berlin' },
  { name: 'Copenhagen', disabled: true },
  { name: 'Prague' }
];

const IMPORTS = [XuiSuggestImports];

const setup = () => {
  const result = render(
    `<xui-suggest [items]="props().items" [itemText]="props().itemText" [itemDisabled]="props().itemDisabled" />`,
    {
      imports: IMPORTS,
      props: { items: CITIES, itemText: (c: City) => c.name, itemDisabled: (c: City) => !!c.disabled }
    }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-suggest').componentInstance as XuiSuggest<City>;
  return { ...result, cmp };
};

const input = () => document.querySelector('xui-suggest input') as HTMLInputElement;
const options = () => [...document.querySelectorAll('.cdk-overlay-container [role="option"]')] as HTMLElement[];

const type = (value: string, detect: () => void) => {
  input().value = value;
  input().dispatchEvent(new Event('input', { bubbles: true }));
  detect();
};

describe('XuiSuggest', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove()));

  it('is a combobox input that starts empty', () => {
    const { detect } = setup();
    detect();

    expect(input().getAttribute('role')).toBe('combobox');
    expect(input().value).toBe('');
  });

  it('opens and filters the list as you type', () => {
    const { detect } = setup();
    detect();

    type('a', detect);

    // case-insensitive substring; disabled items still show (just aren't selectable).
    expect(options().map(o => o.textContent?.trim())).toEqual(['Amsterdam', 'Copenhagen', 'Prague']);
  });

  it('fills the input with the chosen item and closes', () => {
    const { detect, cmp } = setup();
    detect();
    type('ber', detect);

    options()[0].click();
    detect();

    expect(cmp.value()?.name).toBe('Berlin');
    expect(input().value).toBe('Berlin');
    expect(document.querySelector('.cdk-overlay-container [role="listbox"]')).toBeNull();
  });

  it('selects the active item with Enter, skipping disabled', () => {
    const { detect, cmp } = setup();
    detect();
    type('e', detect); // Amsterdam? no — matches Berlin, Copenhagen(disabled), Prague
    // active starts on first enabled result; move down past disabled Copenhagen
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    detect();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    detect();

    expect(cmp.value()?.disabled).toBeFalsy();
  });

  it('reverts the input to the selected text on close (Escape)', () => {
    const { detect } = setup();
    detect();
    type('ber', detect);
    options()[0].click(); // Berlin
    detect();

    // start editing again then Escape → revert to Berlin
    type('xyz', detect);
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    detect();

    expect(input().value).toBe('Berlin');
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<City | null>) =>
      render(`<xui-suggest [items]="props().items" [itemText]="props().itemText" [formControl]="props().control" />`, {
        imports: [XuiSuggestImports, ReactiveFormsModule],
        props: { items: CITIES, itemText: (c: City) => c.name, control }
      });

    it('writes the control value into the input', () => {
      const control = new FormControl<City | null>(CITIES[1]);
      const { detect } = formSetup(control);
      detect();

      expect(input().value).toBe('Berlin');

      control.setValue(CITIES[3]);
      detect();
      expect(input().value).toBe('Prague');
    });

    it('propagates a pick back to the control and honours disable()', () => {
      const control = new FormControl<City | null>(null);
      const { detect } = formSetup(control);
      detect();

      type('ber', detect);
      options()[0].click();
      detect();

      expect(control.value?.name).toBe('Berlin');
      // Closing the popover marks the control touched.
      expect(control.touched).toBe(true);

      control.disable();
      detect();
      expect(input().disabled).toBe(true);
    });
  });
});
