import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@xui/testing';
import { XuiMultiSelectImports } from '../index';
import { XuiMultiSelect } from './multi-select';

interface Tag {
  id: number;
  name: string;
}

const TAGS: Tag[] = [
  { id: 1, name: 'design' },
  { id: 2, name: 'angular' },
  { id: 3, name: 'signals' },
  { id: 4, name: 'testing' }
];

const IMPORTS = [XuiMultiSelectImports];

const TEMPLATE = `
  <xui-multi-select [items]="props().items" [itemText]="props().itemText" />
`;

const setup = () => {
  const result = render(TEMPLATE, {
    imports: IMPORTS,
    props: { items: TAGS, itemText: (t: Tag) => t.name }
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-multi-select')
    .componentInstance as XuiMultiSelect<Tag>;
  return { ...result, cmp };
};

const input = () => document.querySelector('xui-multi-select input') as HTMLInputElement;
const options = () => [...document.querySelectorAll('.cdk-overlay-container [role="option"]')] as HTMLElement[];
const chips = () => [...document.querySelectorAll('xui-multi-select xui-tag')].map(t => t.textContent?.trim());

const type = (value: string, detect: () => void) => {
  input().value = value;
  input().dispatchEvent(new Event('input', { bubbles: true }));
  detect();
};

describe('XuiMultiSelect', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove()));

  it('opens the option list when typing', () => {
    const { detect } = setup();
    detect();

    type('a', detect);

    // Only 'angular' and 'signals' contain an "a".
    expect(options().map(o => o.textContent?.trim())).toEqual(['angular', 'signals']);
  });

  it('adds a chip when an option is chosen and clears the query', () => {
    const { detect, cmp } = setup();
    detect();
    type('signa', detect);

    options()[0].click();
    detect();

    expect(cmp.values().map(t => t.name)).toEqual(['signals']);
    expect(chips()).toEqual(['signals']);
    expect(input().value).toBe('');
  });

  it('keeps the popover open after a selection for multiple picks', () => {
    const { detect } = setup();
    detect();
    type('a', detect);
    options()[0].click(); // angular
    detect();

    // popover still open, list still there
    expect(document.querySelector('.cdk-overlay-container [role="listbox"]')).toBeTruthy();
  });

  it('toggles a selected option off when clicked again', () => {
    const { detect, cmp } = setup();
    detect();
    type('design', detect);
    options()[0].click();
    detect();
    expect(cmp.values().length).toBe(1);

    type('design', detect);
    options()[0].click();
    detect();

    expect(cmp.values().length).toBe(0);
  });

  it('marks selected options with aria-selected', () => {
    const { detect } = setup();
    detect();
    type('design', detect);
    options()[0].click();
    detect();
    type('design', detect);

    expect(options()[0].getAttribute('aria-selected')).toBe('true');
  });

  it('removes the last chip on Backspace when the query is empty', () => {
    const { detect, cmp } = setup();
    detect();
    // add two
    type('design', detect);
    options()[0].click();
    detect();
    type('angular', detect);
    options()[0].click();
    detect();
    expect(cmp.values().length).toBe(2);

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    detect();

    expect(cmp.values().map(t => t.name)).toEqual(['design']);
  });

  it('removes a chip via its ✕ button', () => {
    const { detect, cmp } = setup();
    detect();
    type('design', detect);
    options()[0].click();
    detect();

    (document.querySelector('xui-multi-select xui-tag button') as HTMLButtonElement).click();
    detect();

    expect(cmp.values().length).toBe(0);
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<Tag[]>) =>
      render(
        `<xui-multi-select [items]="props().items" [itemText]="props().itemText" [formControl]="props().control" />`,
        {
          imports: [...IMPORTS, ReactiveFormsModule],
          props: { items: TAGS, itemText: (t: Tag) => t.name, control }
        }
      );

    it('writes the control value into the chips', () => {
      const control = new FormControl<Tag[]>([TAGS[0]], { nonNullable: true });
      const { detect } = formSetup(control);
      detect();

      expect(chips()).toEqual(['design']);

      control.setValue([TAGS[1], TAGS[2]]);
      detect();
      expect(chips()).toEqual(['angular', 'signals']);
    });

    it('propagates a toggle back to the control and honours disable()', () => {
      const control = new FormControl<Tag[]>([], { nonNullable: true });
      const { detect } = formSetup(control);
      detect();

      type('design', detect);
      options()[0].click();
      detect();

      expect(control.value.map(t => t.name)).toEqual(['design']);

      control.disable();
      detect();
      expect(input().disabled).toBe(true);
    });
  });
});
