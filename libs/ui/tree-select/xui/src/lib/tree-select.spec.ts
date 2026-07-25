import { render } from '@xui/testing';
import { XuiTreeSelect, type XuiTreeSelectNode } from './tree-select';

const NODES: XuiTreeSelectNode[] = [
  {
    value: 'fruit',
    label: 'Fruit',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' }
    ]
  },
  { value: 'veg', label: 'Vegetable', children: [{ value: 'carrot', label: 'Carrot' }] }
];

const setup = (attrs = '', props: Record<string, unknown> = {}) => {
  const result = render(`<xui-tree-select ${attrs} [nodes]="props().nodes" [(value)]="props().value" />`, {
    imports: [XuiTreeSelect],
    props: { nodes: NODES, value: null, ...props }
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-tree-select').componentInstance as XuiTreeSelect;
  return { ...result, cmp };
};

const trigger = () => document.querySelector('xui-tree-select > button') as HTMLButtonElement;
const rows = () => [...document.querySelectorAll('xui-tree-select [role="treeitem"]')] as HTMLElement[];
const rowByLabel = (label: string) => rows().find(r => r.textContent?.trim() === label) as HTMLElement;

describe('XuiTreeSelect', () => {
  it('shows the placeholder and opens the tree', () => {
    const { detect } = setup('placeholder="Pick"');
    detect();

    expect(trigger().textContent).toContain('Pick');
    trigger().click();
    detect();
    // Only roots are visible before expanding.
    expect(rows().map(r => r.textContent?.trim())).toEqual(['Fruit', 'Vegetable']);
  });

  it('expands a branch to reveal children', () => {
    const { detect } = setup();
    detect();
    trigger().click();
    detect();

    (rowByLabel('Fruit').querySelector('span') as HTMLElement).click(); // toggle expander
    detect();

    expect(rows().map(r => r.textContent?.trim())).toContain('Apple');
  });

  it('selects a node (single) and reflects its label on the trigger', () => {
    const { detect, cmp } = setup();
    detect();
    trigger().click();
    detect();
    (rowByLabel('Fruit').querySelector('span') as HTMLElement).click();
    detect();

    rowByLabel('Apple').click();
    detect();

    expect(cmp.value()).toBe('apple');
    expect(trigger().textContent).toContain('Apple');
    // Single-select closes the panel.
    expect(document.querySelector('xui-tree-select [role="tree"]')).toBeNull();
  });

  it('toggles multiple values with checkboxes', () => {
    const { detect, cmp } = setup('multiple');
    detect();
    trigger().click();
    detect();

    rowByLabel('Fruit').click();
    rowByLabel('Vegetable').click();
    detect();
    expect(cmp.value()).toEqual(['fruit', 'veg']);

    rowByLabel('Fruit').click();
    detect();
    expect(cmp.value()).toEqual(['veg']);
  });
});
