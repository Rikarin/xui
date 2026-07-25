import type {
  XuiDockContentPane,
  XuiDockDocumentHost,
  XuiDockManagerLayout,
  XuiDockSplitPane,
  XuiDockTabGroupPane
} from './dock-manager.types';
import {
  canDockInto,
  cloneDockLayout,
  defaultUnpinnedLocation,
  dockPaneAt,
  dockPaneKey,
  findDockParent,
  floatDockPane,
  insertDockPane,
  isDockPaneVisible,
  normalizeDockLayout,
  removeDockPane,
  selectedTabPane,
  unpinnedDockPanes,
  visibleDockChildren
} from './dock-manager.utils';

const content = (contentId: string, extra: Partial<XuiDockContentPane> = {}): XuiDockContentPane => ({
  type: 'contentPane',
  contentId,
  header: contentId.toUpperCase(),
  ...extra
});

const split = (
  orientation: XuiDockSplitPane['orientation'],
  panes: XuiDockSplitPane['panes'],
  extra: Partial<XuiDockSplitPane> = {}
): XuiDockSplitPane => ({ type: 'splitPane', orientation, panes, ...extra });

describe('dock layout utilities', () => {
  describe('normalizeDockLayout', () => {
    it('unwraps a split pane down to its last child', () => {
      const only = content('a');
      const layout: XuiDockManagerLayout = {
        rootPane: split('horizontal', [split('vertical', [only], { size: 3 }), content('b')])
      };

      normalizeDockLayout(layout);

      const root = layout.rootPane as XuiDockSplitPane;
      expect(root.panes[0]).toBe(only);
      // The wrapper's share of the parent passes to the child it leaves behind.
      expect(only.size).toBe(3);
    });

    it('merges a nested split that runs along the same axis, keeping proportions', () => {
      const layout: XuiDockManagerLayout = {
        rootPane: split('horizontal', [
          content('a', { size: 2 }),
          split('horizontal', [content('b', { size: 1 }), content('c', { size: 3 })], { size: 2 })
        ])
      };

      normalizeDockLayout(layout);

      const root = layout.rootPane as XuiDockSplitPane;
      expect(root.panes.map(pane => pane.type)).toEqual(['contentPane', 'contentPane', 'contentPane']);
      // b and c split the group's weight of 2 in their original 1:3 ratio.
      expect(root.panes.map(pane => pane.size)).toEqual([2, 0.5, 1.5]);
    });

    it('drops an empty tab group but keeps one marked allowEmpty', () => {
      const keep: XuiDockTabGroupPane = { type: 'tabGroupPane', panes: [], allowEmpty: true };
      const layout: XuiDockManagerLayout = {
        rootPane: split('horizontal', [{ type: 'tabGroupPane', panes: [] }, keep, content('a')])
      };

      normalizeDockLayout(layout);

      expect((layout.rootPane as XuiDockSplitPane).panes).toEqual([keep, expect.objectContaining({ contentId: 'a' })]);
    });

    it('keeps a document host even once its last document is gone', () => {
      const host: XuiDockDocumentHost = {
        type: 'documentHost',
        rootPane: split('horizontal', [], { allowEmpty: true })
      };
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [host, content('a')]) };

      normalizeDockLayout(layout);

      expect((layout.rootPane as XuiDockSplitPane).panes[0]).toBe(host);
    });

    it('clamps a tab group selection to the tabs it has left', () => {
      const group: XuiDockTabGroupPane = { type: 'tabGroupPane', panes: [content('a')], selectedIndex: 4 };
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [group, content('b')]) };

      normalizeDockLayout(layout);

      expect(group.selectedIndex).toBe(0);
    });

    it('discards a floating window once it is empty', () => {
      const layout: XuiDockManagerLayout = {
        rootPane: split('horizontal', [content('a')]),
        floatingPanes: [split('horizontal', [])]
      };

      normalizeDockLayout(layout);

      expect(layout.floatingPanes).toEqual([]);
    });
  });

  describe('removeDockPane', () => {
    it('detaches the pane and collapses the wrapper it leaves behind', () => {
      const b = content('b');
      const c = content('c');
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [split('vertical', [b, c]), content('a')]) };

      expect(removeDockPane(layout, c)).toBe(true);

      const root = layout.rootPane as XuiDockSplitPane;
      expect(root.panes[0]).toBe(b);
      expect(findDockParent(layout, b)).toBe(root);
    });

    it('reports a pane that was not in the layout', () => {
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [content('a')]) };

      expect(removeDockPane(layout, content('nope'))).toBe(false);
    });
  });

  describe('insertDockPane', () => {
    it('reuses a parent that already runs along the drop axis', () => {
      const a = content('a');
      const b = content('b');
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [a, b]) };

      insertDockPane(layout, content('c'), a, 'end');

      const root = layout.rootPane as XuiDockSplitPane;
      expect(root.panes.map(pane => (pane as XuiDockContentPane).contentId)).toEqual(['a', 'c', 'b']);
      // The new pane takes half of a's share, so b keeps the space it had.
      expect(root.panes.slice(0, 2).map(pane => pane.size)).toEqual([0.5, 0.5]);
    });

    it('wraps the target in a new split when the axis does not match', () => {
      const a = content('a', { size: 2 });
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [a, content('b')]) };

      insertDockPane(layout, content('c'), a, 'top');

      const wrapper = (layout.rootPane as XuiDockSplitPane).panes[0] as XuiDockSplitPane;
      expect(wrapper.type).toBe('splitPane');
      expect(wrapper.orientation).toBe('vertical');
      expect(wrapper.size).toBe(2);
      expect(wrapper.panes.map(pane => (pane as XuiDockContentPane).contentId)).toEqual(['c', 'a']);
    });

    it('turns a lone content pane into a tab group on a centre drop', () => {
      const a = content('a');
      const dropped = content('c');
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [a, content('b')]) };

      insertDockPane(layout, dropped, a, 'center');

      const group = (layout.rootPane as XuiDockSplitPane).panes[0] as XuiDockTabGroupPane;
      expect(group.type).toBe('tabGroupPane');
      expect(group.panes).toEqual([a, dropped]);
      // The dropped pane comes to the front.
      expect(selectedTabPane(group)).toBe(dropped);
    });

    it('appends to an existing tab group on a centre drop', () => {
      const group: XuiDockTabGroupPane = { type: 'tabGroupPane', panes: [content('a'), content('b')] };
      const dropped = content('c');
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [group, content('d')]) };

      insertDockPane(layout, dropped, group, 'center');

      expect(group.panes).toHaveLength(3);
      expect(selectedTabPane(group)).toBe(dropped);
    });

    it('re-orients the root rather than nesting a level above it', () => {
      const root = split('horizontal', [content('a'), content('b')]);
      const layout: XuiDockManagerLayout = { rootPane: root };

      insertDockPane(layout, content('c'), root, 'top');

      // The root object survives, with the old horizontal pair pushed one level down.
      expect(layout.rootPane).toBe(root);
      expect(root.orientation).toBe('vertical');
      expect((root.panes[0] as XuiDockContentPane).contentId).toBe('c');
      expect((root.panes[1] as XuiDockSplitPane).orientation).toBe('horizontal');
    });
  });

  describe('canDockInto', () => {
    const documentLayout = () => {
      const doc = content('doc', { documentOnly: true });
      const host: XuiDockDocumentHost = {
        type: 'documentHost',
        rootPane: split('horizontal', [doc], { allowEmpty: true })
      };
      const tool = content('tool');
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [tool, host]) };

      return { layout, host, doc, tool };
    };

    it('keeps a documentOnly pane inside the document host', () => {
      const { layout, doc, tool, host } = documentLayout();
      const other = content('doc2', { documentOnly: true });

      expect(canDockInto(layout, other, doc, 'end')).toBe(true);
      expect(canDockInto(layout, other, host, 'center')).toBe(true);
      // Docking against the host's outer edge would leave the editor area.
      expect(canDockInto(layout, other, host, 'end')).toBe(false);
      expect(canDockInto(layout, other, tool, 'end')).toBe(false);
    });

    it('lets a tool pane dock anywhere, including the document area', () => {
      const { layout, doc, tool } = documentLayout();

      expect(canDockInto(layout, content('new'), doc, 'end')).toBe(true);
      expect(canDockInto(layout, content('new'), tool, 'center')).toBe(true);
    });

    it('refuses a pane onto itself or into its own subtree', () => {
      const child = content('child');
      const branch = split('vertical', [child]);
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [branch, content('a')]) };

      expect(canDockInto(layout, branch, branch, 'end')).toBe(false);
      expect(canDockInto(layout, branch, child, 'end')).toBe(false);
    });

    it('honours allowDocking', () => {
      const pinned = content('pinned', { allowDocking: false });
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [pinned, content('a')]) };

      expect(canDockInto(layout, pinned, content('a'), 'end')).toBe(false);
    });
  });

  describe('floating windows', () => {
    it('moves a pane out of the tree and into a window of its own', () => {
      const a = content('a');
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [a, content('b')]) };

      const window = floatDockPane(layout, a, { x: 20, y: 30 }, { width: 500, height: 200 });

      expect(window?.panes).toEqual([a]);
      expect(window?.floatingLocation).toEqual({ x: 20, y: 30 });
      expect(window?.floatingWidth).toBe(500);
      expect(layout.floatingPanes).toEqual([window]);
      expect(findDockParent(layout, a)).toBe(window);
    });

    it('refuses a pane that opted out of floating', () => {
      const a = content('a', { allowFloating: false });
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [a, content('b')]) };

      expect(floatDockPane(layout, a, { x: 0, y: 0 })).toBeNull();
      expect(layout.floatingPanes ?? []).toEqual([]);
    });

    it('strips the floating geometry when a window docks back', () => {
      const a = content('a');
      const b = content('b');
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [a, b]) };
      const window = floatDockPane(layout, a, { x: 20, y: 30 });

      expect(dockPaneAt(layout, window as XuiDockSplitPane, layout.rootPane, 'end')).toBe(true);

      expect(layout.floatingPanes).toEqual([]);
      expect(findDockParent(layout, a)).toBe(layout.rootPane);
      // The one-pane window collapsed away, so the geometry went with it.
      expect((a as XuiDockSplitPane).floatingLocation).toBeUndefined();
    });
  });

  describe('unpinned panes', () => {
    it('collapses to the edge the pane already sat on', () => {
      const start = content('start');
      const end = content('end');
      const top = content('top');
      const layout: XuiDockManagerLayout = {
        rootPane: split('horizontal', [start, split('vertical', [top, content('mid')]), end])
      };

      expect(defaultUnpinnedLocation(layout, start)).toBe('start');
      expect(defaultUnpinnedLocation(layout, end)).toBe('end');
      expect(defaultUnpinnedLocation(layout, top)).toBe('top');
    });

    it('groups unpinned panes by edge, honouring an explicit location', () => {
      const layout: XuiDockManagerLayout = {
        rootPane: split('horizontal', [
          content('a', { isPinned: false }),
          content('b', { isPinned: false, unpinnedLocation: 'bottom' }),
          content('c')
        ])
      };

      const groups = unpinnedDockPanes(layout);

      expect(groups.start.map(pane => pane.contentId)).toEqual(['a']);
      expect(groups.bottom.map(pane => pane.contentId)).toEqual(['b']);
      expect(groups.end).toEqual([]);
    });

    it('takes no space, and neither does a branch that is entirely unpinned', () => {
      const branch = split('vertical', [content('a', { isPinned: false }), content('b', { isPinned: false })]);
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [branch, content('c')]) };

      expect(isDockPaneVisible(branch)).toBe(false);
      expect(visibleDockChildren(layout.rootPane).map(pane => (pane as XuiDockContentPane).contentId)).toEqual(['c']);
    });
  });

  describe('pane identity', () => {
    it('gives a pane the same key for as long as it lives', () => {
      const pane = content('a');

      expect(dockPaneKey(pane)).toBe(dockPaneKey(pane));
      expect(dockPaneKey(content('a'))).not.toBe(dockPaneKey(pane));
    });

    it('cloneDockLayout produces an independent snapshot', () => {
      const a = content('a');
      const layout: XuiDockManagerLayout = { rootPane: split('horizontal', [a, content('b')]) };
      const snapshot = cloneDockLayout(layout);

      a.header = 'changed';

      expect(((snapshot.rootPane as XuiDockSplitPane).panes[0] as XuiDockContentPane).header).toBe('A');
    });
  });
});
