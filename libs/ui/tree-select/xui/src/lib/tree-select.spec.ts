import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
// The tree panel renders in the CDK overlay container, not inside the host.
const tree = () => document.querySelector('.cdk-overlay-container [role="tree"]');
const rows = () => [...document.querySelectorAll('.cdk-overlay-container [role="treeitem"]')] as HTMLElement[];
const rowByLabel = (label: string) => rows().find(r => r.textContent?.trim() === label) as HTMLElement;
const activeRow = () => document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '');

describe('XuiTreeSelect', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove());
  });

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
    expect(tree()).toBeNull();
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

  it('indents nested rows with logical padding', () => {
    const { detect } = setup();
    detect();
    trigger().click();
    detect();
    (rowByLabel('Fruit').querySelector('span') as HTMLElement).click();
    detect();

    const apple = rowByLabel('Apple');
    expect(apple.style.getPropertyValue('padding-inline-start')).toBe('24px');
    expect(apple.style.paddingLeft).toBe('');
  });

  describe('keyboard', () => {
    it('opens with ArrowDown and moves the active row with the vertical arrows', () => {
      const { detect, press } = setup();
      detect();

      press(trigger(), 'ArrowDown');
      expect(tree()).toBeTruthy();
      expect(activeRow()?.textContent?.trim()).toBe('Fruit');

      press(trigger(), 'ArrowDown');
      expect(activeRow()?.textContent?.trim()).toBe('Vegetable');

      press(trigger(), 'ArrowUp');
      expect(activeRow()?.textContent?.trim()).toBe('Fruit');
    });

    it('expands with ArrowRight, walks in, and selects with Enter', () => {
      const { detect, press, cmp } = setup();
      detect();

      press(trigger(), 'ArrowDown'); // open, Fruit active
      press(trigger(), 'ArrowRight'); // expand Fruit
      expect(rowByLabel('Fruit').getAttribute('aria-expanded')).toBe('true');
      expect(rowByLabel('Apple')).toBeTruthy();

      press(trigger(), 'ArrowRight'); // step into the first child
      expect(activeRow()?.textContent?.trim()).toBe('Apple');

      press(trigger(), 'Enter');
      expect(cmp.value()).toBe('apple');
      expect(tree()).toBeNull();
    });

    it('collapses with ArrowLeft and jumps with Home/End', () => {
      const { detect, press } = setup();
      detect();

      press(trigger(), 'ArrowDown');
      press(trigger(), 'ArrowRight'); // expand Fruit
      press(trigger(), 'End');
      expect(activeRow()?.textContent?.trim()).toBe('Vegetable');

      press(trigger(), 'Home');
      expect(activeRow()?.textContent?.trim()).toBe('Fruit');

      press(trigger(), 'ArrowLeft'); // collapse Fruit
      expect(rowByLabel('Apple')).toBeUndefined();
      expect(rowByLabel('Fruit').getAttribute('aria-expanded')).toBe('false');
    });

    it('closes with Escape without changing the value', () => {
      const { detect, press, cmp } = setup();
      detect();

      press(trigger(), 'ArrowDown');
      press(trigger(), 'Escape');

      expect(tree()).toBeNull();
      expect(cmp.value()).toBeNull();
    });
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<string | string[] | null>) =>
      render(`<xui-tree-select [nodes]="props().nodes" [formControl]="props().control" />`, {
        imports: [XuiTreeSelect, ReactiveFormsModule],
        props: { nodes: NODES, control }
      });

    it('writes the control value onto the trigger', () => {
      const control = new FormControl<string | string[] | null>('apple');
      const { detect } = formSetup(control);
      detect();

      expect(trigger().textContent).toContain('Apple');

      control.setValue('carrot');
      detect();
      expect(trigger().textContent).toContain('Carrot');
    });

    it('propagates a pick back to the control and honours disable()', () => {
      const control = new FormControl<string | string[] | null>(null);
      const { detect } = formSetup(control);
      detect();

      trigger().click();
      detect();
      (rowByLabel('Fruit').querySelector('span') as HTMLElement).click();
      detect();
      rowByLabel('Apple').click();
      detect();

      expect(control.value).toBe('apple');
      // Closing the panel marks the control touched.
      expect(control.touched).toBe(true);

      control.disable();
      detect();
      expect(trigger().disabled).toBe(true);
      trigger().click();
      detect();
      expect(tree()).toBeNull();
    });
  });
});
