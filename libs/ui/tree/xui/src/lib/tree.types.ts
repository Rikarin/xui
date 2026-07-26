import type { XTreeNode } from '@xui/core/tree';

/**
 * A single node in a {@link XuiTree} — the shared {@link XTreeNode} shape
 * (`id`, `label`, `children`, `isExpanded`, `hasCaret`, `disabled`, `data`)
 * plus the styled extras.
 */
export interface XuiTreeNode extends XTreeNode {
  /** Child nodes; presence (or `hasCaret`) makes the node expandable. */
  children?: XuiTreeNode[];

  /** Muted text shown at the trailing edge of the row. */
  secondaryLabel?: string;

  /** Optional leading icon name (from the app's icon registry). */
  icon?: string;
}
