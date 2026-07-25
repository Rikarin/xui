/**
 * The dock manager's layout is a plain, serialisable tree — the same shape Ignite
 * UI's `IgcDockManagerLayout` uses, so layouts port across with only the `Igc`
 * prefix dropped. Nothing in the tree holds a DOM reference or an Angular type,
 * which is what makes a layout safe to persist and restore.
 */

/** Discriminator for the four node kinds a layout tree is built from. */
export type XuiDockPaneType = 'splitPane' | 'contentPane' | 'tabGroupPane' | 'documentHost';

/** Which axis a split pane lays its children out along. */
export type XuiDockSplitOrientation = 'horizontal' | 'vertical';

/**
 * Where a dragged pane lands relative to the pane it was dropped on. `start` and
 * `end` are inline-relative, so they follow the reading direction.
 */
export type XuiDockPosition = 'start' | 'end' | 'top' | 'bottom' | 'center';

/** Which edge of the dock manager an unpinned pane's tab sits on. */
export type XuiDockUnpinnedLocation = 'start' | 'end' | 'top' | 'bottom';

/** A floating pane's top-left corner, in pixels relative to the dock manager. */
export interface XuiDockPoint {
  x: number;
  y: number;
}

interface XuiDockPaneBase {
  /**
   * The pane's share of its parent split pane's main axis, as a weight relative
   * to its siblings — two children sized `1` and `3` split the space 25/75.
   * Defaults to `1`.
   */
  size?: number;
}

/**
 * A leaf pane: a header and a body, where the body is whichever
 * `[xuiDockContent]` template declares the matching `contentId`.
 */
export interface XuiDockContentPane extends XuiDockPaneBase {
  type: 'contentPane';

  /** Links the pane to its `<ng-template [xuiDockContent]="…">`. Must be unique. */
  contentId: string;

  /** Text shown in the pane header, or in its tab when it sits in a tab group. */
  header?: string;

  /**
   * `false` collapses the pane to a tab on one of the dock manager's edges; its
   * position in the tree is kept, so re-pinning puts it back where it was.
   * Defaults to `true`.
   */
  isPinned?: boolean;

  /** Which edge an unpinned pane's tab sits on. Derived from the tree when unset. */
  unpinnedLocation?: XuiDockUnpinnedLocation;

  /** Thickness of the fly-out an unpinned pane opens, in pixels. Defaults to 280. */
  unpinnedSize?: number;

  /** `true` fills the whole dock manager, hiding every other pane. */
  isMaximized?: boolean;

  /**
   * Restricts the pane to the document host — it cannot be docked outside one,
   * floated or unpinned. Use it for editor-style tabs.
   */
  documentOnly?: boolean;

  /** Show the close button and allow programmatic closing. Defaults to `true`. */
  allowClose?: boolean;
  /** Allow the pane to be dragged out of the layout into a floating window. Defaults to `true`. */
  allowFloating?: boolean;
  /** Allow the pane to be dragged and docked elsewhere in the layout. Defaults to `true`. */
  allowDocking?: boolean;
  /** Show the pin button. Defaults to `true`. */
  allowPinning?: boolean;
  /** Show the maximize button. Defaults to `true`. */
  allowMaximize?: boolean;
}

/**
 * Lays its children out along one axis with a draggable splitter between each
 * pair. Doubles as the root of a floating window, which is where the `floating*`
 * properties apply.
 */
export interface XuiDockSplitPane extends XuiDockPaneBase {
  type: 'splitPane';
  orientation: XuiDockSplitOrientation;
  panes: XuiDockPane[];

  /**
   * Keep the split pane in the tree once its last child is gone. Needed on a
   * document host's root pane, which must survive closing every document.
   */
  allowEmpty?: boolean;

  /** Top-left corner of the floating window, when this is a floating root. */
  floatingLocation?: XuiDockPoint;
  /** Floating window width in pixels. Defaults to 400. */
  floatingWidth?: number;
  /** Floating window height in pixels. Defaults to 300. */
  floatingHeight?: number;
  /** Show resize handles on the floating window. Defaults to `true`. */
  floatingResizable?: boolean;
}

/** Stacks content panes as tabs, showing one at a time. */
export interface XuiDockTabGroupPane extends XuiDockPaneBase {
  type: 'tabGroupPane';
  panes: XuiDockContentPane[];

  /** Index of the visible tab. Defaults to 0, and is clamped to the tab count. */
  selectedIndex?: number;

  /** Keep the tab group in the tree once its last tab is gone. */
  allowEmpty?: boolean;
}

/**
 * The area `documentOnly` panes live in — the editor surface of an IDE layout.
 * A layout has at most one, and it is the only valid drop target for documents.
 */
export interface XuiDockDocumentHost extends XuiDockPaneBase {
  type: 'documentHost';
  rootPane: XuiDockSplitPane;
}

/** Any node in the layout tree. */
export type XuiDockPane = XuiDockContentPane | XuiDockSplitPane | XuiDockTabGroupPane | XuiDockDocumentHost;

/** A pane that holds children, and so can be a docking target for `center`. */
export type XuiDockParentPane = XuiDockSplitPane | XuiDockTabGroupPane;

/** The whole layout: one docked tree plus any number of floating windows. */
export interface XuiDockManagerLayout {
  rootPane: XuiDockSplitPane | XuiDockDocumentHost;

  /** Each entry is the root of one floating window. */
  floatingPanes?: XuiDockSplitPane[];
}

/** Emitted whenever a pane's pinned, maximized or floating state is toggled. */
export interface XuiDockPaneStateEvent {
  pane: XuiDockContentPane;
  value: boolean;
}

export function isContentPane(pane: XuiDockPane): pane is XuiDockContentPane {
  return pane.type === 'contentPane';
}

export function isSplitPane(pane: XuiDockPane): pane is XuiDockSplitPane {
  return pane.type === 'splitPane';
}

export function isTabGroupPane(pane: XuiDockPane): pane is XuiDockTabGroupPane {
  return pane.type === 'tabGroupPane';
}

export function isDocumentHost(pane: XuiDockPane): pane is XuiDockDocumentHost {
  return pane.type === 'documentHost';
}

export function isParentPane(pane: XuiDockPane): pane is XuiDockParentPane {
  return pane.type === 'splitPane' || pane.type === 'tabGroupPane';
}
