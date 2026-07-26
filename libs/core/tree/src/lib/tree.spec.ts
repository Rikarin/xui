import { collectExpandedIds, flattenVisibleTree, toggleExpandedId, treeKeyAction, type XTreeNode } from './tree';

const NODES: XTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    isExpanded: true,
    children: [
      { id: 'app', label: 'app', children: [{ id: 'main', label: 'main.ts' }] },
      { id: 'index', label: 'index.html' }
    ]
  },
  { id: 'readme', label: 'README.md' }
];

const expanded = () => collectExpandedIds(NODES);
const flat = () => flattenVisibleTree(NODES, expanded());
const ids = () => flat().map(f => f.node.id);

describe('collectExpandedIds', () => {
  it('collects `isExpanded` ids at any depth', () => {
    expect([...expanded()]).toEqual(['src']);
  });
});

describe('toggleExpandedId', () => {
  it('toggles membership without mutating the input set', () => {
    const initial = expanded();
    const opened = toggleExpandedId(initial, 'app');

    expect(opened.has('app')).toBe(true);
    expect(initial.has('app')).toBe(false);
    expect(toggleExpandedId(opened, 'app').has('app')).toBe(false);
  });
});

describe('flattenVisibleTree', () => {
  it('flattens depth-first, hiding collapsed branches', () => {
    // src is expanded; app is collapsed, so main.ts stays hidden.
    expect(ids()).toEqual(['src', 'app', 'index', 'readme']);
  });

  it('tracks level, parent and expandability per row', () => {
    const app = flat().find(f => f.node.id === 'app')!;

    expect(app.level).toBe(1);
    expect(app.parentId).toBe('src');
    expect(app.expandable).toBe(true);
    expect(flat().find(f => f.node.id === 'index')!.expandable).toBe(false);
  });

  it('treats `hasCaret` as expandable even without children', () => {
    const lazy = flattenVisibleTree([{ id: 'lazy', label: 'Lazy', hasCaret: true }], new Set());

    expect(lazy[0].expandable).toBe(true);
  });
});

describe('treeKeyAction', () => {
  it('moves with the vertical arrows and clamps at the ends', () => {
    expect(treeKeyAction('ArrowDown', 'ltr', flat(), 0, expanded())).toMatchObject({ kind: 'focus', index: 1 });
    expect(treeKeyAction('ArrowUp', 'ltr', flat(), 0, expanded())).toMatchObject({ kind: 'focus', index: 0 });
    expect(treeKeyAction('Home', 'ltr', flat(), 3, expanded())).toMatchObject({ kind: 'focus', index: 0 });
    expect(treeKeyAction('End', 'ltr', flat(), 0, expanded())).toMatchObject({ kind: 'focus', index: 3 });
  });

  it('expands a closed branch with the inline-end arrow, then steps into it', () => {
    const appIndex = ids().indexOf('app');

    expect(treeKeyAction('ArrowRight', 'ltr', flat(), appIndex, expanded())).toMatchObject({
      kind: 'expand',
      node: { id: 'app' }
    });

    const open = toggleExpandedId(expanded(), 'app');
    const openFlat = flattenVisibleTree(NODES, open);
    expect(treeKeyAction('ArrowRight', 'ltr', openFlat, appIndex, open)).toMatchObject({
      kind: 'focus',
      node: { id: 'main' }
    });
  });

  it('collapses with the inline-start arrow, or steps out to the parent', () => {
    expect(treeKeyAction('ArrowLeft', 'ltr', flat(), 0, expanded())).toMatchObject({
      kind: 'collapse',
      node: { id: 'src' }
    });
    expect(treeKeyAction('ArrowLeft', 'ltr', flat(), ids().indexOf('index'), expanded())).toMatchObject({
      kind: 'focus',
      node: { id: 'src' }
    });
    // A root leaf has nowhere to go, but the key still belongs to the tree.
    expect(treeKeyAction('ArrowLeft', 'ltr', flat(), ids().indexOf('readme'), expanded())).toEqual({ kind: 'none' });
  });

  it('mirrors the horizontal arrows in RTL', () => {
    const appIndex = ids().indexOf('app');

    expect(treeKeyAction('ArrowLeft', 'rtl', flat(), appIndex, expanded())).toMatchObject({ kind: 'expand' });
    expect(treeKeyAction('ArrowRight', 'rtl', flat(), 0, expanded())).toMatchObject({ kind: 'collapse' });
  });

  it('selects with Enter and Space, and ignores keys it does not own', () => {
    expect(treeKeyAction('Enter', 'ltr', flat(), 2, expanded())).toMatchObject({
      kind: 'select',
      node: { id: 'index' }
    });
    expect(treeKeyAction(' ', 'ltr', flat(), 2, expanded())).toMatchObject({ kind: 'select' });
    expect(treeKeyAction('a', 'ltr', flat(), 2, expanded())).toBeNull();
    expect(treeKeyAction('Enter', 'ltr', flat(), -1, expanded())).toBeNull();
  });
});
