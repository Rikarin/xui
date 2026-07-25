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
