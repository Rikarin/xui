import { arrowDirectionOnAxis, type XDirection } from '@xui/core/a11y';

/** Identity of a tree node, unique across the whole tree. */
export type XTreeNodeId = string | number;

/**
 * The canonical tree node shape shared by every tree-flavoured surface.
 *
 * Styled packages extend it (`XuiTreeNode` adds icons and secondary labels) or
 * key it by their own identity (`XuiTreeSelectNode` uses `value` as the id and
 * carries the original node in `data`).
 */
export interface XTreeNode<T = unknown> {
  /** Stable identifier, unique across the whole tree. */
  id: XTreeNodeId;

  /** Primary label text. */
  label: string;

  /** Child nodes; presence (or `hasCaret`) makes the node expandable. */
  children?: XTreeNode<T>[];

  /** Start expanded. */
  isExpanded?: boolean;

  /** Force a caret even without loaded children (e.g. lazy loading). */
  hasCaret?: boolean;

  /** Non-selectable, non-expandable. */
  disabled?: boolean;

  /** Arbitrary payload echoed back on events. */
  data?: T;
}

/** One row of a flattened tree, in visual (depth-first) order. */
export interface XFlatTreeNode<N extends XTreeNode = XTreeNode> {
  node: N;
  /** 0 for roots, +1 per ancestor. */
  level: number;
  parentId: XTreeNodeId | null;
  expandable: boolean;
}

/** Whether the node can expand — it has children, or forces a caret for lazy loading. */
export function isTreeNodeExpandable(node: XTreeNode): boolean {
  return !!node.hasCaret || !!node.children?.length;
}

/** The ids of every node flagged `isExpanded`, at any depth — the initial expansion set. */
export function collectExpandedIds(nodes: readonly XTreeNode[]): Set<XTreeNodeId> {
  const out = new Set<XTreeNodeId>();
  const walk = (list: readonly XTreeNode[]): void => {
    for (const node of list) {
      if (node.isExpanded) {
        out.add(node.id);
      }
      if (node.children) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return out;
}

/**
 * Every root-to-node path whose last node `match` accepts, in depth-first order.
 *
 * What "reveal this node" is built on: a path's last entry is the node itself,
 * and everything before it is what has to be expanded for it to be on screen.
 *
 * All of them rather than the first, because a caller matching loosely — a URL
 * prefix, a substring — usually wants to choose between the hits rather than
 * take whichever happened to sit nearest the root.
 */
export function collectTreePaths<N extends XTreeNode>(nodes: readonly N[], match: (node: N) => boolean): N[][] {
  const paths: N[][] = [];

  const walk = (list: readonly N[], ancestors: N[]): void => {
    for (const node of list) {
      const path = [...ancestors, node];

      if (match(node)) {
        paths.push(path);
      }

      walk((node.children ?? []) as N[], path);
    }
  };

  walk(nodes, []);

  return paths;
}

/** Every node in the tree, in depth-first order. */
export function flattenTree<N extends XTreeNode>(nodes: readonly N[]): N[] {
  return nodes.flatMap(node => [node, ...flattenTree((node.children ?? []) as N[])]);
}

/** A new set with `id`'s membership toggled — the input set is not mutated. */
export function toggleExpandedId(expanded: ReadonlySet<XTreeNodeId>, id: XTreeNodeId): Set<XTreeNodeId> {
  const next = new Set(expanded);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

/**
 * Every visible node flattened in visual (depth-first) order: children are
 * included only when their parent's id is in `expanded`.
 */
export function flattenVisibleTree<N extends XTreeNode>(
  nodes: readonly N[],
  expanded: ReadonlySet<XTreeNodeId>
): XFlatTreeNode<N>[] {
  const out: XFlatTreeNode<N>[] = [];
  const walk = (list: readonly N[], level: number, parentId: XTreeNodeId | null): void => {
    for (const node of list) {
      const expandable = isTreeNodeExpandable(node);
      out.push({ node, level, parentId, expandable });
      if (expandable && expanded.has(node.id)) {
        // Subtypes narrow `children` to their own node type, so the cast holds.
        walk((node.children ?? []) as N[], level + 1, node.id);
      }
    }
  };
  walk(nodes, 0, null);
  return out;
}

/**
 * What a key press should do to the tree.
 *
 * - `focus` — move the roving focus/active row to `index`;
 * - `expand` / `collapse` — toggle the node open or closed;
 * - `select` — activate the current node (Enter/Space);
 * - `none` — the key belongs to the tree but has nothing to do here; consume it
 *   (prevent default scrolling) without changing state.
 */
export type XTreeKeyAction<N extends XTreeNode = XTreeNode> =
  | { kind: 'focus'; index: number; node: N }
  | { kind: 'expand'; node: N }
  | { kind: 'collapse'; node: N }
  | { kind: 'select'; node: N }
  | { kind: 'none' };

/**
 * The WAI-ARIA APG tree keyboard contract as a pure reducer.
 *
 * Up/Down move through the visible rows, Home/End jump to the ends, Enter and
 * Space select. The horizontal pair is RTL-aware: expanding walks *into* the
 * tree, which is the inline-end arrow — ArrowLeft in RTL; collapsing (or
 * stepping out to the parent) is the inline-start arrow.
 *
 * `index` is the current row's position in `flat` (`-1` when nothing is active
 * yet — the vertical keys then land on the first row). Returns `null` for keys
 * the tree does not handle.
 */
export function treeKeyAction<N extends XTreeNode>(
  key: string,
  direction: XDirection,
  flat: readonly XFlatTreeNode<N>[],
  index: number,
  expanded: ReadonlySet<XTreeNodeId>
): XTreeKeyAction<N> | null {
  const focusAt = (target: number): XTreeKeyAction<N> | null => {
    if (!flat.length) {
      return null;
    }
    const clamped = Math.max(0, Math.min(flat.length - 1, target));
    return { kind: 'focus', index: clamped, node: flat[clamped].node };
  };

  const current = flat[index] as XFlatTreeNode<N> | undefined;
  const inline = arrowDirectionOnAxis(key, direction, 'horizontal');

  if (inline) {
    if (!current) {
      return null;
    }

    if (inline === 'next') {
      // Deeper into the tree: expand a closed branch, else step into the first child.
      if (current.expandable && !expanded.has(current.node.id)) {
        return { kind: 'expand', node: current.node };
      }
      return current.expandable ? focusAt(index + 1) : { kind: 'none' };
    }

    // Back out: collapse an open branch, else step out to the parent.
    if (current.expandable && expanded.has(current.node.id)) {
      return { kind: 'collapse', node: current.node };
    }
    const parentIndex = flat.findIndex(f => f.node.id === current.parentId);
    return parentIndex >= 0 ? focusAt(parentIndex) : { kind: 'none' };
  }

  switch (key) {
    case 'ArrowDown':
      return focusAt(index + 1);
    case 'ArrowUp':
      return focusAt(index - 1);
    case 'Home':
      return focusAt(0);
    case 'End':
      return focusAt(flat.length - 1);
    case 'Enter':
    case ' ':
      return current ? { kind: 'select', node: current.node } : null;
    default:
      return null;
  }
}
