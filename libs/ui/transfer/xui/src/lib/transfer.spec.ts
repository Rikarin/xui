import { render } from '@xui/testing';
import { XuiTransfer, type XuiTransferItem } from './transfer';

const ITEMS: XuiTransferItem[] = Array.from({ length: 5 }, (_, i) => ({ key: `k${i}`, title: `Item ${i}` }));

const setup = (attrs = '', props: Record<string, unknown> = {}) => {
  const result = render(`<xui-transfer ${attrs} [items]="props().items" [(targetKeys)]="props().target" />`, {
    imports: [XuiTransfer],
    props: { items: ITEMS, target: [], ...props }
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-transfer').componentInstance as XuiTransfer;
  return { ...result, cmp };
};

const panels = () => [...document.querySelectorAll('xui-transfer > div')] as HTMLElement[];
const itemsIn = (panel: HTMLElement) => [...panel.querySelectorAll('li')].map(li => li.textContent?.trim());
const moveRightBtn = () => document.querySelector('xui-transfer button[aria-label="Move right"]') as HTMLButtonElement;
const moveLeftBtn = () => document.querySelector('xui-transfer button[aria-label="Move left"]') as HTMLButtonElement;
const liByText = (panel: HTMLElement, text: string) =>
  [...panel.querySelectorAll('li')].find(li => li.textContent?.trim() === text) as HTMLElement;
const press = (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

describe('XuiTransfer', () => {
  it('places non-target items on the left and target items on the right', () => {
    const { detect } = setup('', { target: ['k1', 'k3'] });
    detect();

    expect(itemsIn(panels()[0])).toEqual(['Item 0', 'Item 2', 'Item 4']);
    expect(itemsIn(panels()[2])).toEqual(['Item 1', 'Item 3']);
  });

  it('moves checked items to the right', () => {
    const { detect, cmp } = setup();
    detect();

    liByText(panels()[0], 'Item 0').click();
    liByText(panels()[0], 'Item 2').click();
    detect();
    moveRightBtn().click();
    detect();

    expect(cmp.targetKeys()).toEqual(['k0', 'k2']);
    expect(itemsIn(panels()[2])).toEqual(['Item 0', 'Item 2']);
  });

  it('moves checked items back to the left', () => {
    const { detect, cmp } = setup('', { target: ['k1', 'k3'] });
    detect();

    liByText(panels()[2], 'Item 1').click();
    detect();
    moveLeftBtn().click();
    detect();

    expect(cmp.targetKeys()).toEqual(['k3']);
  });

  it('disables the move buttons when nothing is checked', () => {
    const { detect } = setup();
    detect();

    expect(moveRightBtn().disabled).toBe(true);
    expect(moveLeftBtn().disabled).toBe(true);
  });

  it('exposes each side as a multi-select listbox', () => {
    const { detect } = setup();
    detect();

    const list = panels()[0].querySelector('ul')!;
    expect(list.getAttribute('role')).toBe('listbox');
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(list.getAttribute('aria-label')).toBe('Source');
    expect(list.tabIndex).toBe(0);

    const options = [...list.querySelectorAll('li')];
    expect(options.every(li => li.getAttribute('role') === 'option')).toBe(true);
    expect(options[0].getAttribute('aria-selected')).toBe('false');
    // The list drives focus by id rather than a roving tabindex.
    expect(list.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });

  it('moves the active option with the arrow keys and checks it with Space', () => {
    const { detect, cmp } = setup();
    detect();

    const list = panels()[0].querySelector('ul')!;
    press(list, 'ArrowDown');
    press(list, 'ArrowDown');
    detect();

    const options = [...list.querySelectorAll('li')];
    expect(list.getAttribute('aria-activedescendant')).toBe(options[2].id);

    press(list, ' ');
    detect();
    expect(options[2].getAttribute('aria-selected')).toBe('true');

    moveRightBtn().click();
    detect();
    expect(cmp.targetKeys()).toEqual(['k2']);
  });

  it('jumps to the ends with Home and End', () => {
    const { detect } = setup();
    detect();

    const list = panels()[0].querySelector('ul')!;
    press(list, 'End');
    detect();
    let options = [...list.querySelectorAll('li')];
    expect(list.getAttribute('aria-activedescendant')).toBe(options[options.length - 1].id);

    press(list, 'Home');
    detect();
    options = [...list.querySelectorAll('li')];
    expect(list.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });

  it('exposes the select-all control as a tri-state checkbox', () => {
    const { detect } = setup();
    detect();

    const selectAll = panels()[0].querySelector('button[role=checkbox]') as HTMLButtonElement;
    expect(selectAll.getAttribute('aria-checked')).toBe('false');

    liByText(panels()[0], 'Item 0').click();
    detect();
    expect(selectAll.getAttribute('aria-checked')).toBe('mixed');

    selectAll.click();
    detect();
    expect(selectAll.getAttribute('aria-checked')).toBe('true');
  });

  it('filters a side when searchable', () => {
    const { detect } = setup('searchable');
    detect();

    const search = panels()[0].querySelector('input') as HTMLInputElement;
    search.value = 'Item 3';
    search.dispatchEvent(new Event('input'));
    detect();

    expect(itemsIn(panels()[0])).toEqual(['Item 3']);
  });
});
