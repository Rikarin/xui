import { expectAttributes, provideDirection, render } from '@xui/testing';
import { XuiTreeImports } from '../index';
import type { XuiTreeNode } from './tree.types';

const NODES: XuiTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    isExpanded: true,
    childNodes: [
      { id: 'app', label: 'app', childNodes: [{ id: 'main', label: 'main.ts' }] },
      { id: 'index', label: 'index.html', secondaryLabel: '2 kB' }
    ]
  },
  { id: 'readme', label: 'README.md', icon: 'matStar', disabled: true }
];

const IMPORTS = [XuiTreeImports];
const setup = (props: Record<string, unknown> = { nodes: NODES }) =>
  render('<xui-tree [nodes]="props().nodes" aria-label="Files" />', {
    imports: IMPORTS,
    props
  });

const items = () => [...document.querySelectorAll('[role="treeitem"]')] as HTMLElement[];
const rowById = (id: string) => document.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
// The treeitem <li> is nested, so match the *closest* one to the row div, not an ancestor.
const itemById = (id: string) => rowById(id)?.closest('[role="treeitem"]') as HTMLElement;

describe('XuiTree', () => {
  it('renders a tree with the initially-expanded branch shown', () => {
    const { detect } = setup();
    detect();

    expect(document.querySelector('[role="tree"]')?.getAttribute('aria-label')).toBe('Files');
    // src is expanded, so its children show; app is collapsed so main.ts is hidden.
    expect(rowById('src')).toBeTruthy();
    expect(rowById('app')).toBeTruthy();
    expect(rowById('index')).toBeTruthy();
    expect(rowById('main')).toBeNull();
    expect(rowById('readme')).toBeTruthy();
  });

  it('marks expandable nodes with aria-expanded', () => {
    const { detect } = setup();
    detect();

    expectAttributes(itemById('src'), {
      'aria-expanded': 'true'
    });
  });

  it('expands a collapsed node when its caret is clicked', () => {
    const { detect } = setup();
    detect();

    // app is collapsed; clicking its caret reveals main.ts.
    const caret = rowById('app').querySelector('ng-icon') as HTMLElement;
    caret.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    detect();

    expect(rowById('main')).toBeTruthy();
  });

  it('selects a node on row click and reflects aria-selected', () => {
    const { detect } = setup({ nodes: NODES, selected: null });
    detect();

    rowById('index').click();
    detect();

    expectAttributes(itemById('index'), {
      'aria-selected': 'true'
    });
  });

  it('does not select a disabled node', () => {
    const { detect } = setup({ nodes: NODES, selected: null });
    detect();

    rowById('readme').click();
    detect();

    expectAttributes(itemById('readme'), {
      'aria-selected': 'false'
    });
  });

  it('collapses an expanded node with ArrowLeft', () => {
    const { detect, press } = setup();
    detect();

    press(rowById('src'), 'ArrowLeft');

    // src collapsed → its children are gone.
    expect(rowById('app')).toBeNull();
    expectAttributes(itemById('src'), { 'aria-expanded': 'false' });
  });

  it('expands a collapsed node with ArrowRight', () => {
    const { detect, press } = setup();
    detect();

    press(rowById('app'), 'ArrowRight');
    detect();

    expect(rowById('main')).toBeTruthy();
  });

  it('selects the focused node with Enter', () => {
    const { detect, press } = setup({ nodes: NODES, selected: null });
    detect();

    press(rowById('index'), 'Enter');
    detect();

    expectAttributes(itemById('index'), {
      'aria-selected': 'true'
    });
  });

  it('uses roving tabindex with a single tab stop', () => {
    const { detect } = setup();
    detect();

    const tabbable = items()
      .map(i => i.querySelector('[data-node-id]') as HTMLElement)
      .filter(el => el.tabIndex === 0);
    expect(tabbable.length).toBe(1);
  });

  describe('RTL', () => {
    const rtlSetup = () =>
      render('<xui-tree [nodes]="props().nodes" aria-label="Files" />', {
        imports: IMPORTS,
        props: { nodes: NODES },
        providers: [provideDirection('rtl')]
      });

    it('expands with the inline-end arrow', () => {
      const { detect, press } = rtlSetup();
      detect();

      expectAttributes(itemById('app'), { 'aria-expanded': 'false' });

      // Deeper into the tree is leftwards in RTL.
      press(rowById('app'), 'ArrowLeft');
      expectAttributes(itemById('app'), { 'aria-expanded': 'true' });

      press(rowById('app'), 'ArrowRight');
      expectAttributes(itemById('app'), { 'aria-expanded': 'false' });
    });

    it('indents on the inline start', () => {
      const { detect } = rtlSetup();
      detect();

      // Logical padding so the indent lands on the right edge in RTL.
      expect(rowById('app').style.getPropertyValue('padding-inline-start')).toBe('1.75rem');
      expect(rowById('app').style.paddingLeft).toBe('');
    });
  });
});
