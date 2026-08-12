import { Injectable } from '@angular/core';
import {
  isContentPane,
  isDocumentHost,
  isParentPane,
  isSplitPane,
  isTabGroupPane,
  type XuiDockContentPane,
  type XuiDockDocumentHost,
  type XuiDockManagerLayout,
  type XuiDockPane,
  type XuiDockParentPane,
  type XuiDockPoint,
  type XuiDockPosition,
  type XuiDockSplitOrientation,
  type XuiDockSplitPane,
  type XuiDockTabGroupPane,
  type XuiDockUnpinnedLocation
} from './dock-manager.types';

/**
 * Tree operations over a {@link XuiDockManagerLayout}.
 *
 * Every mutating function works **in place** on the layout object it is given and
 * leaves the pane objects themselves identity-stable: docking a pane re-parents
 * the very same object rather than a copy. The dock manager depends on that — it
 * keys rendered panes, cached content views and drag targets off object identity,
 * so a pane keeps its DOM (and therefore its scroll position, form state and
 * focus) as it moves around the layout.
 *
 * Callers that need an undo buffer should snapshot with {@link cloneDockLayout}
 * before mutating.
 */

const paneKeys = new WeakMap<XuiDockPane, string>();

/**
 * Allocates the keys a dock manager writes to `data-dock-key`, one counter per
 * application.
 *
 * The counter has to be scoped to something, and the process is the one scope
 * that is wrong. A server renders many pages from one process, so a key drawn
 * from a module-level counter makes the response a function of how many pages
 * the process has already served: the same request answered twice comes back
 * with `pane-1` once and `pane-3` the next time. `providedIn: 'root'` puts the
 * counter in the application's own injector, and an application is exactly one
 * render — one server request, or one page in the browser. Two renders count
 * from the same place, and so does the client that takes over from either.
 *
 * One counter serves every dock manager in the application rather than one per
 * component, so two dock managers on a page still get four distinct keys for
 * their four panes. Nothing needs that — every lookup is scoped to the manager's
 * own host element — but a key that identifies a pane is worth more than one
 * that identifies its position in whichever manager happens to hold it.
 *
 * Keyed by object identity, so a key survives every operation in this file: a
 * pane keeps it while it is dragged, docked, floated and tabbed, and so keeps
 * its DOM. {@link cloneDockLayout} produces different objects, which get fresh
 * keys — that is the point of a clone.
 */
@Injectable({ providedIn: 'root' })
export class XuiDockPaneKeys {
  private readonly keys = new WeakMap<XuiDockPane, string>();
  private next = 0;

  /** This application's key for `pane`, allocated on first use. */
  keyFor(pane: XuiDockPane): string {
    let key = this.keys.get(pane);

    if (!key) {
      key = `pane-${++this.next}`;
      this.keys.set(pane, key);

      // Mirrored so {@link dockPaneKey} can answer for a pane without an
      // injector. The per-application map stays authoritative: two applications
      // sharing one pane object each number it from their own counter, and only
      // the last render's answer is visible here.
      paneKeys.set(pane, key);
    }

    return key;
  }
}

/**
 * The key a dock manager gave `pane`, or `''` if none has rendered it yet.
 *
 * Pairs with the `data-dock-key` attribute — `[data-dock-key="${dockPaneKey(pane)}"]`
 * finds the element a pane was rendered into. Keys are allocated by
 * {@link XuiDockPaneKeys}, so this reports one rather than minting it: a pane no
 * dock manager has drawn has no element to find, and `''` matches nothing.
 */
export function dockPaneKey(pane: XuiDockPane): string {
  return paneKeys.get(pane) ?? '';
}

/**
 * A structural copy of the layout, safe to keep as an undo snapshot.
 *
 * A round-trip through JSON, which the layout's own contract allows: every node
 * is plain data. The copy is a *different* set of objects, so its panes get fresh
 * {@link dockPaneKey}s and restoring it replaces the rendered panes rather than
 * moving them.
 */
export function cloneDockLayout(layout: XuiDockManagerLayout): XuiDockManagerLayout {
  return JSON.parse(JSON.stringify(layout)) as XuiDockManagerLayout;
}

/** The child panes of `pane`, or an empty array for a leaf. */
export function dockChildren(pane: XuiDockPane): readonly XuiDockPane[] {
  if (isParentPane(pane)) {
    return pane.panes;
  }

  return isDocumentHost(pane) ? [pane.rootPane] : [];
}

/** Every root of the layout: the docked tree, then each floating window. */
export function dockRoots(layout: XuiDockManagerLayout): XuiDockPane[] {
  return [layout.rootPane, ...(layout.floatingPanes ?? [])];
}

/**
 * Depth-first walk over every pane in the layout, floating windows included.
 * Returning `false` from `visitor` skips that pane's subtree.
 */
export function visitDockPanes(layout: XuiDockManagerLayout, visitor: (pane: XuiDockPane) => boolean | void): void {
  const walk = (pane: XuiDockPane): void => {
    if (visitor(pane) === false) {
      return;
    }

    for (const child of [...dockChildren(pane)]) {
      walk(child);
    }
  };

  for (const root of dockRoots(layout)) {
    walk(root);
  }
}

/** The pane whose `panes` array holds `pane`, or `null` for a root. */
export function findDockParent(layout: XuiDockManagerLayout, pane: XuiDockPane): XuiDockParentPane | null {
  let found: XuiDockParentPane | null = null;

  visitDockPanes(layout, candidate => {
    if (found) {
      return false;
    }

    if (isParentPane(candidate) && candidate.panes.includes(pane as XuiDockContentPane)) {
      found = candidate;
      return false;
    }

    return undefined;
  });

  return found;
}

/** `pane`'s ancestors, nearest first. */
export function dockAncestors(layout: XuiDockManagerLayout, pane: XuiDockPane): XuiDockPane[] {
  const path: XuiDockPane[] = [];

  const walk = (current: XuiDockPane, trail: XuiDockPane[]): boolean => {
    if (current === pane) {
      path.push(...trail);
      return true;
    }

    for (const child of dockChildren(current)) {
      if (walk(child, [current, ...trail])) {
        return true;
      }
    }

    return false;
  };

  for (const root of dockRoots(layout)) {
    if (walk(root, [])) {
      break;
    }
  }

  return path;
}

/** The layout's document host, if it has one. */
export function findDocumentHost(layout: XuiDockManagerLayout): XuiDockDocumentHost | null {
  let host: XuiDockDocumentHost | null = null;

  visitDockPanes(layout, pane => {
    if (host) {
      return false;
    }

    if (isDocumentHost(pane)) {
      host = pane;
      return false;
    }

    return undefined;
  });

  return host;
}

/** Whether `pane` sits inside the document host. */
export function isInDocumentHost(layout: XuiDockManagerLayout, pane: XuiDockPane): boolean {
  return dockAncestors(layout, pane).some(isDocumentHost);
}

/** Whether `pane` is the root of a floating window. */
export function isFloatingRoot(layout: XuiDockManagerLayout, pane: XuiDockPane): boolean {
  return (layout.floatingPanes ?? []).includes(pane as XuiDockSplitPane);
}

/** Whether `pane` is a root that must not be collapsed away. */
export function isDockRoot(layout: XuiDockManagerLayout, pane: XuiDockPane): boolean {
  return pane === layout.rootPane || isFloatingRoot(layout, pane);
}

/** Every content pane in the layout, in tree order. */
export function collectContentPanes(layout: XuiDockManagerLayout): XuiDockContentPane[] {
  const out: XuiDockContentPane[] = [];

  visitDockPanes(layout, pane => {
    if (isContentPane(pane)) {
      out.push(pane);
    }
  });

  return out;
}

/** The content pane that is currently maximized, if any. */
export function findMaximizedPane(layout: XuiDockManagerLayout): XuiDockContentPane | null {
  return collectContentPanes(layout).find(pane => pane.isMaximized) ?? null;
}

/**
 * Whether the pane takes up space in the docked layout. An unpinned content pane
 * does not, and neither does a split pane or tab group whose whole subtree is
 * unpinned — otherwise collapsing a sidebar would leave a gap behind it.
 */
export function isDockPaneVisible(pane: XuiDockPane): boolean {
  if (isContentPane(pane)) {
    return pane.isPinned !== false;
  }

  if (isDocumentHost(pane)) {
    return true;
  }

  return pane.panes.some(isDockPaneVisible);
}

/** The children of `pane` that take up space, in order. */
export function visibleDockChildren(pane: XuiDockPane): XuiDockPane[] {
  return [...dockChildren(pane)].filter(isDockPaneVisible);
}

/** The tab a tab group shows: its `selectedIndex`, or the first pinned tab. */
export function selectedTabPane(group: XuiDockTabGroupPane): XuiDockContentPane | null {
  const visible = group.panes.filter(isDockPaneVisible);

  if (!visible.length) {
    return null;
  }

  const selected = group.panes[group.selectedIndex ?? 0];

  return selected && visible.includes(selected) ? selected : visible[0];
}

/**
 * Which edge an unpinned pane collapses to when `unpinnedLocation` is unset.
 *
 * Follows the pane's own position in the tree — a pane in the first branch of a
 * horizontal split goes to the inline start, one in the last branch to the inline
 * end — so a sidebar collapses to the side it was already on.
 */
export function defaultUnpinnedLocation(layout: XuiDockManagerLayout, pane: XuiDockPane): XuiDockUnpinnedLocation {
  let child = pane;

  for (const ancestor of dockAncestors(layout, pane)) {
    if (isSplitPane(ancestor) && ancestor.panes.length > 1) {
      const first = ancestor.panes.indexOf(child as XuiDockContentPane) === 0;

      if (ancestor.orientation === 'horizontal') {
        return first ? 'start' : 'end';
      }

      return first ? 'top' : 'bottom';
    }

    child = ancestor;
  }

  return 'end';
}

/** The unpinned content panes, grouped by the edge their tabs sit on. */
export function unpinnedDockPanes(layout: XuiDockManagerLayout): Record<XuiDockUnpinnedLocation, XuiDockContentPane[]> {
  const groups: Record<XuiDockUnpinnedLocation, XuiDockContentPane[]> = { start: [], end: [], top: [], bottom: [] };

  for (const pane of collectContentPanes(layout)) {
    if (pane.isPinned === false) {
      groups[pane.unpinnedLocation ?? defaultUnpinnedLocation(layout, pane)].push(pane);
    }
  }

  return groups;
}

/**
 * Tidy the tree after a mutation: drop empty parents, unwrap split panes down to
 * a single child, merge nested splits that run along the same axis, and clamp
 * every tab group's selected index.
 *
 * Roots survive all of this — `layout.rootPane`, a floating window's root and a
 * document host's root pane are structural and stay put even when empty. A root
 * left with a single split pane beneath it absorbs that child rather than being
 * replaced by it.
 */
export function normalizeDockLayout(layout: XuiDockManagerLayout): void {
  const root = normalizePane(layout.rootPane, true);
  layout.rootPane = (root ?? emptySplitPane()) as XuiDockSplitPane | XuiDockDocumentHost;

  const floating: XuiDockSplitPane[] = [];

  for (const pane of layout.floatingPanes ?? []) {
    const normalized = normalizePane(pane, true);

    // A floating window whose last pane was closed or docked away is gone.
    if (normalized && isSplitPane(normalized) && normalized.panes.length) {
      floating.push(normalized);
    }
  }

  layout.floatingPanes = floating;
}

function emptySplitPane(): XuiDockSplitPane {
  return { type: 'splitPane', orientation: 'horizontal', panes: [], allowEmpty: true };
}

function normalizePane(pane: XuiDockPane, isRoot: boolean): XuiDockPane | null {
  if (isContentPane(pane)) {
    return pane;
  }

  if (isDocumentHost(pane)) {
    const inner = normalizePane(pane.rootPane, true);
    pane.rootPane = inner && isSplitPane(inner) ? inner : emptySplitPane();
    // The document host is structural: an empty editor area is a valid state.
    return pane;
  }

  if (isTabGroupPane(pane)) {
    if (!pane.panes.length && !pane.allowEmpty && !isRoot) {
      return null;
    }

    pane.selectedIndex = Math.min(Math.max(pane.selectedIndex ?? 0, 0), Math.max(0, pane.panes.length - 1));
    return pane;
  }

  const children: XuiDockPane[] = [];

  for (const child of pane.panes) {
    const normalized = normalizePane(child, false);

    if (!normalized) {
      continue;
    }

    // A split inside a split along the same axis is the same layout with an extra
    // level of nesting; splice it away so repeated docking cannot grow the tree
    // without bound.
    if (isSplitPane(normalized) && normalized.orientation === pane.orientation && normalized.panes.length > 1) {
      children.push(...redistribute(normalized.panes, normalized.size ?? 1));
      continue;
    }

    children.push(normalized);
  }

  pane.panes = children;

  if (!children.length) {
    return pane.allowEmpty || isRoot ? pane : null;
  }

  if (children.length === 1) {
    const only = children[0];

    if (!isRoot) {
      // The wrapper's share of the grandparent becomes the child's.
      only.size = pane.size ?? only.size;
      return only;
    }

    // A root cannot be replaced — floating geometry and the caller's reference
    // hang off it — so it absorbs its lone child's axis and children instead.
    // Without this, every drop onto the root would leave another dead level.
    if (isSplitPane(only)) {
      pane.orientation = only.orientation;
      pane.panes = only.panes;
    }
  }

  return pane;
}

/** Rescale `panes` so their weights sum to `total`, keeping their proportions. */
function redistribute(panes: XuiDockPane[], total: number): XuiDockPane[] {
  const sum = panes.reduce((acc, pane) => acc + (pane.size ?? 1), 0) || panes.length;

  for (const pane of panes) {
    pane.size = ((pane.size ?? 1) / sum) * total;
  }

  return panes;
}

/**
 * Detach `pane` from wherever it sits — a parent's `panes`, or the floating
 * window list — and tidy up behind it. Returns `false` if it was not in the
 * layout at all.
 */
export function removeDockPane(layout: XuiDockManagerLayout, pane: XuiDockPane): boolean {
  const floating = layout.floatingPanes ?? [];
  const floatingIndex = floating.indexOf(pane as XuiDockSplitPane);

  if (floatingIndex >= 0) {
    floating.splice(floatingIndex, 1);
    normalizeDockLayout(layout);
    return true;
  }

  const parent = findDockParent(layout, pane);

  if (!parent) {
    return false;
  }

  parent.panes.splice(parent.panes.indexOf(pane as XuiDockContentPane), 1);
  normalizeDockLayout(layout);
  return true;
}

/** The axis a docking position splits along. */
function axisOf(position: Exclude<XuiDockPosition, 'center'>): XuiDockSplitOrientation {
  return position === 'start' || position === 'end' ? 'horizontal' : 'vertical';
}

/** Whether the dragged pane goes before the target along that axis. */
function isBefore(position: Exclude<XuiDockPosition, 'center'>): boolean {
  return position === 'start' || position === 'top';
}

/**
 * Whether `pane` may be dropped onto `target`.
 *
 * A `documentOnly` pane is confined to the document host; anything else may dock
 * anywhere. A pane can never be dropped onto itself or into its own subtree.
 */
export function canDockInto(
  layout: XuiDockManagerLayout,
  pane: XuiDockPane,
  target: XuiDockPane,
  position: XuiDockPosition
): boolean {
  if (pane === target) {
    return false;
  }

  if (dockAncestors(layout, target).includes(pane)) {
    return false;
  }

  if (isContentPane(pane) && pane.allowDocking === false) {
    return false;
  }

  if (!documentOnlyPanes(pane)) {
    return true;
  }

  // Docking against the document host's outer edges would put the document
  // *beside* the editor area rather than in it, so only `center` qualifies.
  return isDocumentHost(target) ? position === 'center' : isInDocumentHost(layout, target);
}

/** Whether every content pane in `pane`'s subtree is `documentOnly`. */
function documentOnlyPanes(pane: XuiDockPane): boolean {
  const contents: XuiDockContentPane[] = [];
  const walk = (current: XuiDockPane): void => {
    if (isContentPane(current)) {
      contents.push(current);
      return;
    }

    for (const child of dockChildren(current)) {
      walk(child);
    }
  };

  walk(pane);

  return contents.length > 0 && contents.every(content => content.documentOnly);
}

/**
 * Attach `pane` to the layout next to `target`.
 *
 * `center` tabs the pane together with the target — turning a lone content pane
 * into a two-tab group — while the four edge positions split the space. An edge
 * drop reuses the target's parent when it already runs along the right axis, so
 * dropping three panes to the right of each other yields one three-way split
 * rather than three nested ones.
 */
export function insertDockPane(
  layout: XuiDockManagerLayout,
  pane: XuiDockPane,
  target: XuiDockPane,
  position: XuiDockPosition
): boolean {
  if (position === 'center') {
    return insertIntoCenter(layout, pane, target);
  }

  const axis = axisOf(position);
  const before = isBefore(position);
  const parent = findDockParent(layout, target);

  if (parent && isSplitPane(parent) && parent.orientation === axis) {
    const index = parent.panes.indexOf(target as XuiDockContentPane);
    // Split the target's own share rather than adding weight, so the panes either
    // side of it keep the proportions they had.
    const share = target.size ?? 1;
    target.size = share / 2;
    pane.size = share / 2;
    parent.panes.splice(before ? index : index + 1, 0, pane as XuiDockContentPane);
    normalizeDockLayout(layout);
    return true;
  }

  // A root has no parent to insert into, so it grows a level instead: it keeps
  // its own identity (and any floating geometry) and adopts the new axis.
  if (!parent && isSplitPane(target) && isDockRoot(layout, target)) {
    if (target.orientation !== axis && target.panes.length > 1) {
      const inner: XuiDockSplitPane = { type: 'splitPane', orientation: target.orientation, panes: target.panes };
      target.panes = [inner];
    }

    target.orientation = axis;
    target.panes.splice(before ? 0 : target.panes.length, 0, pane as XuiDockContentPane);
    normalizeDockLayout(layout);
    return true;
  }

  const wrapper: XuiDockSplitPane = {
    type: 'splitPane',
    orientation: axis,
    size: target.size ?? 1,
    panes: before ? [pane, target] : [target, pane]
  };

  target.size = 1;
  pane.size = 1;

  return replacePane(layout, target, wrapper);
}

function insertIntoCenter(layout: XuiDockManagerLayout, pane: XuiDockPane, target: XuiDockPane): boolean {
  const incoming = isContentPane(pane) ? [pane] : tabbableContentPanes(pane);

  if (isDocumentHost(target)) {
    return insertIntoCenter(layout, pane, target.rootPane);
  }

  if (isTabGroupPane(target) && incoming.length) {
    target.panes.push(...incoming);
    target.selectedIndex = target.panes.length - 1;
    normalizeDockLayout(layout);
    return true;
  }

  if (isSplitPane(target)) {
    // Nothing to tab with — an empty split pane (a bare document host) simply
    // adopts the pane.
    target.panes.push(pane as XuiDockContentPane);
    normalizeDockLayout(layout);
    return true;
  }

  if (!isContentPane(target) || !incoming.length) {
    return false;
  }

  const group: XuiDockTabGroupPane = {
    type: 'tabGroupPane',
    size: target.size ?? 1,
    panes: [target, ...incoming],
    // Select the pane that was just dropped, the way a dragged browser tab lands
    // in front.
    selectedIndex: 1
  };

  target.size = 1;

  return replacePane(layout, target, group);
}

/** The content panes of a subtree, flattened, for merging into a tab group. */
function tabbableContentPanes(pane: XuiDockPane): XuiDockContentPane[] {
  const out: XuiDockContentPane[] = [];
  const walk = (current: XuiDockPane): void => {
    if (isContentPane(current)) {
      out.push(current);
      return;
    }

    for (const child of dockChildren(current)) {
      walk(child);
    }
  };

  walk(pane);

  return out;
}

/** Swap `target` for `replacement` wherever it sits, root positions included. */
function replacePane(layout: XuiDockManagerLayout, target: XuiDockPane, replacement: XuiDockPane): boolean {
  if (target === layout.rootPane) {
    layout.rootPane = replacement as XuiDockSplitPane | XuiDockDocumentHost;
    normalizeDockLayout(layout);
    return true;
  }

  const floating = layout.floatingPanes ?? [];
  const floatingIndex = floating.indexOf(target as XuiDockSplitPane);

  if (floatingIndex >= 0) {
    floating[floatingIndex] = replacement as XuiDockSplitPane;
    normalizeDockLayout(layout);
    return true;
  }

  const parent = findDockParent(layout, target);

  if (parent) {
    parent.panes[parent.panes.indexOf(target as XuiDockContentPane)] = replacement as XuiDockContentPane;
    normalizeDockLayout(layout);
    return true;
  }

  const host = dockAncestors(layout, target).find(isDocumentHost);

  if (host && isSplitPane(replacement)) {
    host.rootPane = replacement;
    normalizeDockLayout(layout);
    return true;
  }

  return false;
}

/** Move `pane` out of the layout and into a floating window of its own. */
export function floatDockPane(
  layout: XuiDockManagerLayout,
  pane: XuiDockPane,
  location: XuiDockPoint,
  size?: { width: number; height: number }
): XuiDockSplitPane | null {
  if (isContentPane(pane) && pane.allowFloating === false) {
    return null;
  }

  // Already floating: this is a move, not a detach.
  if (isSplitPane(pane) && isFloatingRoot(layout, pane)) {
    pane.floatingLocation = location;
    return pane;
  }

  if (!removeDockPane(layout, pane)) {
    return null;
  }

  pane.size = 1;

  const window: XuiDockSplitPane = {
    type: 'splitPane',
    orientation: 'horizontal',
    panes: [pane],
    floatingLocation: location,
    floatingWidth: size?.width ?? 400,
    floatingHeight: size?.height ?? 300,
    floatingResizable: true
  };

  layout.floatingPanes = [...(layout.floatingPanes ?? []), window];
  normalizeDockLayout(layout);

  return window;
}

/** Move `pane` from wherever it is to `position` relative to `target`. */
export function dockPaneAt(
  layout: XuiDockManagerLayout,
  pane: XuiDockPane,
  target: XuiDockPane,
  position: XuiDockPosition
): boolean {
  if (!canDockInto(layout, pane, target, position)) {
    return false;
  }

  removeDockPane(layout, pane);

  // Geometry only means something while the pane is a floating window; leaving it
  // behind would resurrect the old size the next time it is floated.
  if (isSplitPane(pane)) {
    delete pane.floatingLocation;
    delete pane.floatingWidth;
    delete pane.floatingHeight;
    delete pane.floatingResizable;
  }

  // `removeDockPane` normalises, which can unwrap the target's parent — but never
  // the target itself, so it is still a valid insertion point.
  return insertDockPane(layout, pane, target, position);
}
