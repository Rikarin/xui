import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { XFormFieldControl } from '@xui/core/form-field';
import { render } from '@xui/testing';
import { XuiSelectImports } from '../index';
import { XuiSelect } from './select';

interface Fruit {
  id: number;
  name: string;
  disabled?: boolean;
}

const FRUITS: Fruit[] = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry', disabled: true },
  { id: 4, name: 'Date' }
];

const IMPORTS = [XuiSelectImports];

const TEMPLATE = `
  <xui-select
    [items]="props().items"
    [itemText]="props().itemText"
    [itemDisabled]="props().itemDisabled"
    (valueChange)="props().onChange($event)"
  />
`;

const setup = (extra: Record<string, unknown> = {}) => {
  const changes: Fruit[] = [];
  const result = render(TEMPLATE, {
    imports: IMPORTS,
    props: {
      items: FRUITS,
      itemText: (f: Fruit) => f.name,
      itemDisabled: (f: Fruit) => !!f.disabled,
      onChange: (f: Fruit) => changes.push(f),
      ...extra
    }
  });
  const select = result.fixture.debugElement.query(n => n.name === 'xui-select').componentInstance as XuiSelect<Fruit>;
  return { ...result, select, changes };
};

const trigger = () => document.querySelector('xui-select button') as HTMLButtonElement;
const panel = () => document.querySelector('.cdk-overlay-container [role="listbox"]');
const options = () => [...document.querySelectorAll('[role="option"]')] as HTMLElement[];
const search = () => document.querySelector('.cdk-overlay-container input') as HTMLInputElement;

const typeSearch = (value: string, detect: () => void) => {
  search().value = value;
  search().dispatchEvent(new Event('input', { bubbles: true }));
  detect();
};

describe('XuiSelect', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove());
  });

  it('shows the placeholder and stays closed until clicked', () => {
    const { detect } = setup();
    detect();

    expect(trigger().textContent).toContain('Select…');
    expect(panel()).toBeNull();
  });

  it('opens a listbox of items on click', () => {
    const { detect, click } = setup();
    detect();

    click(trigger());
    detect();

    expect(panel()).toBeTruthy();
    expect(options().map(o => o.textContent?.trim())).toEqual(['Apple', 'Banana', 'Cherry', 'Date']);
  });

  it('filters the list from the search field', () => {
    const { detect, click } = setup();
    detect();
    click(trigger());
    detect();

    typeSearch('a', detect);

    // case-insensitive substring on the name
    expect(options().map(o => o.textContent?.trim())).toEqual(['Apple', 'Banana', 'Date']);
  });

  it('shows the empty message when nothing matches', () => {
    const { detect, click } = setup();
    detect();
    click(trigger());
    detect();

    typeSearch('zzz', detect);

    expect(options().length).toBe(0);
    expect(panel()?.textContent).toContain('No results.');
  });

  it('selects an item on click, closes, and reflects it on the trigger', () => {
    const { detect, click, select, changes } = setup();
    detect();
    click(trigger());
    detect();

    (options()[1] as HTMLElement).click();
    detect();

    expect(select.value()?.name).toBe('Banana');
    expect(changes).toEqual([FRUITS[1]]);
    expect(trigger().textContent).toContain('Banana');
    expect(panel()).toBeNull();
  });

  it('navigates with the arrow keys and selects with Enter, skipping disabled', () => {
    const { detect, click, select } = setup();
    detect();
    click(trigger());
    detect();

    // active starts at Apple; ArrowDown → Banana, ArrowDown → (Cherry disabled) Date
    search().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    search().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    detect();
    search().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    detect();

    expect(select.value()?.name).toBe('Date');
  });

  it('does not select a disabled item on click', () => {
    const { detect, click, select } = setup();
    detect();
    click(trigger());
    detect();

    // Cherry is disabled (index 2).
    (options()[2] as HTMLElement).click();
    detect();

    expect(select.value()).toBeNull();
  });

  it('closes on Escape', () => {
    const { detect, click } = setup();
    detect();
    click(trigger());
    detect();

    search().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    detect();

    expect(panel()).toBeNull();
  });

  it('provides XFormFieldControl, so xui-form-field accepts it', () => {
    const { detect, fixture } = setup();
    detect();

    const debug = fixture.debugElement.query(By.css('xui-select'));
    const control = debug.injector.get(XFormFieldControl);

    expect(control).toBeInstanceOf(XuiSelect);
    // The label points at the trigger button, not the host element.
    expect(control.controlId?.()).toBe(debug.nativeElement.querySelector('button').id);
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<Fruit | null>) =>
      render(`<xui-select [items]="props().items" [itemText]="props().itemText" [formControl]="props().control" />`, {
        imports: [XuiSelectImports, ReactiveFormsModule],
        props: { items: FRUITS, itemText: (f: Fruit) => f.name, control }
      });

    it('writes the control value into the trigger', () => {
      const control = new FormControl<Fruit | null>(FRUITS[1]);
      const { detect } = formSetup(control);
      detect();

      expect(trigger().textContent).toContain('Banana');

      control.setValue(FRUITS[3]);
      detect();
      expect(trigger().textContent).toContain('Date');
    });

    it('propagates a selection back to the control and honours disable()', () => {
      const control = new FormControl<Fruit | null>(null);
      const { detect, click } = formSetup(control);
      detect();

      click(trigger());
      detect();
      options()[0].click();
      detect();

      expect(control.value).toEqual(FRUITS[0]);
      // Closing the panel marks the control touched.
      expect(control.touched).toBe(true);

      control.disable();
      detect();
      expect(trigger().disabled).toBe(true);
    });
  });
});
