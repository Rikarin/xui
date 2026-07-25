/** A single node in a {@link XuiTree}. */
export interface XuiTreeNode {
  /** Stable identifier, unique across the whole tree. */
  id: string | number;

  /** Primary label text. */
  label: string;

  /** Muted text shown at the trailing edge of the row. */
  secondaryLabel?: string;

  /** Optional leading icon name (from the app's icon registry). */
  icon?: string;

  /** Child nodes; presence (or `hasCaret`) makes the node expandable. */
  childNodes?: XuiTreeNode[];

  /** Start expanded. */
  isExpanded?: boolean;

  /** Force a caret even without loaded children (e.g. lazy loading). */
  hasCaret?: boolean;

  /** Non-selectable, non-expandable. */
  disabled?: boolean;

  /** Arbitrary payload echoed back on events. */
  data?: unknown;
}
