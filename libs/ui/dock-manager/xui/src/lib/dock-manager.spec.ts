import { provideDirection, render } from '@xui/testing';
import { XuiDockManagerImports } from '../index';
import { XuiDockManager } from './dock-manager';
import type {
  XuiDockContentPane,
  XuiDockDocumentHost,
  XuiDockManagerLayout,
  XuiDockSplitPane,
  XuiDockTabGroupPane
} from './dock-manager.types';

const TEMPLATE = `
  <xui-dock-manager [layout]="props().layout">
    <ng-template xuiDockContent="a"><input id="probe" /></ng-template>
    <ng-template xuiDockContent="b">Body B</ng-template>
    <ng-template xuiDockContent="c">Body C</ng-template>
  </xui-dock-manager>
`;

const content = (contentId: string, extra: Partial<XuiDockContentPane> = {}): XuiDockContentPane => ({
  type: 'contentPane',
  contentId,
  header: contentId.toUpperCase(),
  ...extra
});

const setup = (layout: XuiDockManagerLayout, direction?: 'ltr' | 'rtl', template = TEMPLATE) => {
  const result = render<{ layout: XuiDockManagerLayout }>(template, {
    imports: [XuiDockManagerImports],
    props: { layout },
    providers: direction ? [provideDirection(direction)] : []
  });
  const cmp = result.fixture.debugElement.query(node => node.name === 'xui-dock-manager')
    .componentInstance as XuiDockManager;

  return { ...result, cmp };
};

/** Two content panes side by side — the baseline for most cases below. */
const pair = () => {
  const a = content('a');
  const b = content('b');

  return {
    a,
    b,
    layout: { rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [a, b] } } as XuiDockManagerLayout
  };
};

const buttonFor = (host: HTMLElement, label: string) =>
  host.querySelector<HTMLElement>(`[aria-label="${label}"]`) as HTMLElement;

describe('XuiDockManager', () => {
  it('mounts each content template into the pane that names it', () => {
    const { host } = setup(pair().layout);

    const bodies = host.querySelectorAll('[data-dock-key] > div:last-child');

    expect(host.querySelector('#probe')).toBeTruthy();
    expect(bodies[bodies.length - 1].textContent).toContain('Body B');
  });

  it('renders each pane header and a gutter between the pair', () => {
    const { host } = setup(pair().layout);

    expect([...host.querySelectorAll('[data-dock-key]')].map(el => el.textContent?.trim().slice(0, 1))).toEqual([
      'A',
      'B'
    ]);
    expect(host.querySelectorAll('[role="separator"]')).toHaveLength(1);
  });

  it('keeps a content view alive as the layout changes around it', () => {
    const { a, b, layout } = pair();
    const { host, cmp, detect } = setup(layout);

    const probe = host.querySelector<HTMLInputElement>('#probe') as HTMLInputElement;
    probe.value = 'half-typed';

    // Docking A on top of B rebuilds the tree; the pane's own DOM should travel
    // with it rather than being recreated.
    cmp.dockPane(a, b, 'top');
    detect();

    const afterMove = host.querySelector<HTMLInputElement>('#probe');
    expect(afterMove).toBe(probe);
    expect(afterMove?.value).toBe('half-typed');
    expect((layout.rootPane as XuiDockSplitPane).orientation).toBe('vertical');
  });

  it('closes a pane, removes it from the layout and reports it', () => {
    const { a, layout } = pair();
    const { host, cmp, detect, click } = setup(layout);
    const closed: XuiDockContentPane[] = [];
    cmp.paneClose.subscribe(pane => closed.push(pane));

    click(buttonFor(host, 'Close A'));
    detect();

    expect(closed).toEqual([a]);
    // The lone survivor is unwrapped up to the root.
    expect((cmp.layout().rootPane as XuiDockSplitPane).panes).toHaveLength(1);
    expect(host.querySelector('#probe')).toBeNull();
  });

  it('leaves a pane alone when allowClose is false', () => {
    const a = content('a', { allowClose: false });
    const layout: XuiDockManagerLayout = {
      rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [a, content('b')] }
    };
    const { host, cmp } = setup(layout);

    expect(buttonFor(host, 'Close A')).toBeNull();

    cmp.closePane(a);
    expect((cmp.layout().rootPane as XuiDockSplitPane).panes).toHaveLength(2);
  });

  it('collapses an unpinned pane to an edge strip and opens it again on click', () => {
    const { a, layout } = pair();
    const { host, cmp, detect, click } = setup(layout);
    const pinned: boolean[] = [];
    cmp.panePinnedChange.subscribe(event => pinned.push(event.value));

    click(buttonFor(host, 'Collapse A'));
    detect();

    expect(pinned).toEqual([false]);
    expect(a.isPinned).toBe(false);

    const strip = host.querySelector('[data-dock-strip]') as HTMLElement;
    const tab = strip.querySelector('button') as HTMLElement;
    expect(tab.textContent?.trim()).toBe('A');
    // Collapsed panes are out of the flow, so B has the layout to itself.
    expect(host.querySelectorAll('[role="separator"]')).toHaveLength(0);

    click(tab);
    detect();
    expect(host.querySelector('[data-dock-flyout]')).toBeTruthy();
    expect(tab.getAttribute('aria-expanded')).toBe('true');

    // The fly-out's pin button puts it back where it came from.
    click(buttonFor(host, 'Pin A'));
    detect();
    expect(a.isPinned).toBe(true);
    expect(host.querySelector('[data-dock-flyout]')).toBeNull();
    expect(host.querySelectorAll('[role="separator"]')).toHaveLength(1);
  });

  it('hides every other pane while one is maximized', () => {
    const { a, layout } = pair();
    const { host, detect, click } = setup(layout);

    click(buttonFor(host, 'Maximize A'));
    detect();

    expect(a.isMaximized).toBe(true);
    expect(host.querySelectorAll('[data-dock-key]')).toHaveLength(1);
    expect(host.querySelector('#probe')).toBeTruthy();

    click(buttonFor(host, 'Restore A'));
    detect();
    expect(host.querySelectorAll('[data-dock-key]')).toHaveLength(2);
  });

  it('moves a pane into a floating window and docks it back', () => {
    const { layout } = pair();
    const { host, cmp, detect, click } = setup(layout);
    const floating: boolean[] = [];
    cmp.paneFloatingChange.subscribe(event => floating.push(event.value));

    click(buttonFor(host, 'Float A'));
    detect();

    expect(floating).toEqual([true]);
    expect(cmp.layout().floatingPanes).toHaveLength(1);
    // A one-pane window puts the pane's title in its own bar, not a second header.
    expect(buttonFor(host, 'Dock window')).toBeTruthy();
    expect(host.querySelector('#probe')).toBeTruthy();

    click(buttonFor(host, 'Dock window'));
    detect();

    expect(floating).toEqual([true, false]);
    expect(cmp.layout().floatingPanes).toEqual([]);
  });

  describe('tab groups', () => {
    const tabbed = () => {
      const group: XuiDockTabGroupPane = { type: 'tabGroupPane', panes: [content('a'), content('b'), content('c')] };

      return {
        group,
        layout: { rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [group] } } as XuiDockManagerLayout
      };
    };

    it('shows one tab per pane and only the selected body', () => {
      const { host } = setup(tabbed().layout);

      const tabs = host.querySelectorAll<HTMLElement>('[role="tab"]');
      expect([...tabs].map(tab => tab.textContent?.trim())).toEqual(['A', 'B', 'C']);
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
      expect(host.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);
      // Only tab A's body is mounted; B and C are parked until they are selected.
      expect(host.querySelector('[role="tabpanel"] #probe')).toBeTruthy();
      expect(host.textContent).not.toContain('Body B');
    });

    it('selects a tab on click', () => {
      const { group, layout } = tabbed();
      const { host, detect, click } = setup(layout);

      click(host.querySelectorAll<HTMLElement>('[role="tab"]')[1]);
      detect();

      expect(group.selectedIndex).toBe(1);
      expect(host.querySelector('[role="tabpanel"]')?.textContent).toContain('Body B');
    });

    it('walks the strip with the arrow keys', () => {
      const { group, layout } = tabbed();
      const { host, detect, press } = setup(layout);

      press(host.querySelectorAll<HTMLElement>('[role="tab"]')[0], 'ArrowRight');
      detect();
      expect(group.selectedIndex).toBe(1);

      press(host.querySelectorAll<HTMLElement>('[role="tab"]')[1], 'End');
      detect();
      expect(group.selectedIndex).toBe(2);

      // Wraps around from the last tab.
      press(host.querySelectorAll<HTMLElement>('[role="tab"]')[2], 'ArrowRight');
      detect();
      expect(group.selectedIndex).toBe(0);
    });

    it('falls back to a pinned tab when the selected one is collapsed', () => {
      const { group, layout } = tabbed();
      const { cmp, detect, host } = setup(layout);

      cmp.unpinPane(group.panes[0]);
      detect();

      expect([...host.querySelectorAll<HTMLElement>('[role="tab"]')].map(tab => tab.textContent?.trim())).toEqual([
        'B',
        'C'
      ]);
      expect(host.querySelector('[role="tabpanel"]')?.textContent).toContain('Body B');
    });
  });

  describe('splitters', () => {
    it('re-weights the panes either side with the arrow keys', () => {
      const { a, b, layout } = pair();
      const { host, detect } = setup(layout);

      const gutter = host.querySelector('[role="separator"]') as HTMLElement;
      // jsdom has no layout, so the wrappers are told how wide they are.
      for (const el of [gutter.previousElementSibling, gutter.nextElementSibling] as HTMLElement[]) {
        Object.defineProperty(el, 'offsetWidth', { value: 100, configurable: true });
      }

      gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      detect();

      // 110 of 200 shared pixels, out of a combined weight of 2.
      expect(a.size).toBeCloseTo(1.1);
      expect(b.size).toBeCloseTo(0.9);
    });

    it('will not squeeze a pane below its minimum', () => {
      const { a, b, layout } = pair();
      const { host, detect } = setup(layout);

      const gutter = host.querySelector('[role="separator"]') as HTMLElement;
      Object.defineProperty(gutter.previousElementSibling, 'offsetWidth', { value: 60, configurable: true });
      Object.defineProperty(gutter.nextElementSibling, 'offsetWidth', { value: 60, configurable: true });

      gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, bubbles: true }));
      detect();

      // A shrinks to the 48px floor, not to 20px.
      expect(a.size).toBeCloseTo(0.8);
      expect(b.size).toBeCloseTo(1.2);
    });

    it('ignores arrows across the splitter axis', () => {
      const { a, layout } = pair();
      const { host, detect } = setup(layout);

      const gutter = host.querySelector('[role="separator"]') as HTMLElement;
      expect(gutter.getAttribute('aria-orientation')).toBe('vertical');

      gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      detect();

      expect(a.size).toBeUndefined();
    });
  });

  describe('document host', () => {
    it('refuses a tool pane docked into it and accepts a document', () => {
      const doc = content('b', { documentOnly: true });
      const host: XuiDockDocumentHost = {
        type: 'documentHost',
        rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [doc], allowEmpty: true }
      };
      const tool = content('a');
      const layout: XuiDockManagerLayout = {
        rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [tool, host] }
      };
      const { cmp } = setup(layout);
      const document2 = content('c', { documentOnly: true });

      expect(cmp.dockPane(document2, tool, 'end')).toBe(false);
      expect(cmp.dockPane(document2, doc, 'center')).toBe(true);
    });

    it('offers no pin or float action for a documentOnly pane', () => {
      const doc = content('a', { documentOnly: true });
      const layout: XuiDockManagerLayout = {
        rootPane: {
          type: 'documentHost',
          rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [doc], allowEmpty: true }
        }
      };
      const { host } = setup(layout);

      expect(buttonFor(host, 'Collapse A')).toBeNull();
      expect(buttonFor(host, 'Float A')).toBeNull();
      expect(buttonFor(host, 'Close A')).toBeTruthy();
    });
  });

  describe('dragging', () => {
    /** jsdom has no layout, so the frames are told where they are. */
    const stub = (element: Element, rect: { left: number; top: number; width: number; height: number }) => {
      element.getBoundingClientRect = () =>
        ({
          ...rect,
          right: rect.left + rect.width,
          bottom: rect.top + rect.height,
          x: rect.left,
          y: rect.top,
          toJSON: () => rect
        }) as DOMRect;
    };

    /** Two 200×200 frames side by side inside a 400×200 dock manager. */
    const layoutOut = (direction?: 'ltr' | 'rtl') => {
      const { a, b, layout } = pair();
      const result = setup(layout, direction);
      const [frameA, frameB] = result.host.querySelectorAll<HTMLElement>('[data-dock-key]');

      stub(result.host.querySelector('xui-dock-manager') as Element, { left: 0, top: 0, width: 400, height: 200 });
      stub(frameA, { left: 0, top: 0, width: 200, height: 200 });
      stub(frameB, { left: 200, top: 0, width: 200, height: 200 });

      return { ...result, a, b, layout, frameA, frameB };
    };

    /**
     * Press at `press` and drag through `path`, without releasing.
     *
     * The suite runs zoneless, so callers that want to read the docking targets
     * out of the DOM must run change detection first.
     */
    const hold = (from: HTMLElement, press: [number, number], path: [number, number][]) => {
      from.dispatchEvent(
        new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: press[0], clientY: press[1] })
      );

      for (const [clientX, clientY] of path) {
        document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX, clientY }));
      }
    };

    /** Press at `press`, drag through `path`, release at its last point. */
    const drag = (from: HTMLElement, press: [number, number], path: [number, number][]) => {
      hold(from, press, path);

      const [x, y] = path[path.length - 1] ?? press;
      document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: x, clientY: y }));
    };

    /**
     * The docking targets currently on screen, as `{ side, active, centre }`.
     *
     * Mirrors the component's own geometry: 30px squares, 4px apart, so a test can
     * aim at one without reaching into private state.
     */
    const indicators = (host: HTMLElement) =>
      host.querySelectorAll<HTMLElement>('[aria-hidden="true"].z-55').length
        ? [...host.querySelectorAll<HTMLElement>('[aria-hidden="true"].z-55')].map(element => ({
            active: element.className.includes('border-primary'),
            side: element.firstElementChild?.className.includes('inset-1')
              ? 'center'
              : element.firstElementChild?.className.includes('left-1') &&
                  element.firstElementChild?.className.includes('w-1/3')
                ? 'left'
                : element.firstElementChild?.className.includes('right-1') &&
                    element.firstElementChild?.className.includes('w-1/3')
                  ? 'right'
                  : element.firstElementChild?.className.includes('top-1')
                    ? 'top'
                    : 'bottom',
            centre: [
              Number.parseFloat(element.style.left) + 15,
              Number.parseFloat(element.style.top) + 15
            ] as [number, number]
          }))
        : [];

    it('docks a pane against the edge of the pane it is dropped on', () => {
      const { a, b, layout, frameA, detect } = layoutOut();

      // Down the middle of B's lower half.
      drag(
        frameA.firstElementChild as HTMLElement,
        [20, 10],
        [
          [50, 20],
          [300, 170]
        ]
      );
      detect();

      const root = layout.rootPane as XuiDockSplitPane;
      expect(root.orientation).toBe('vertical');
      expect(root.panes).toEqual([b, a]);
    });

    it('tabs a pane with the one it is dropped in the middle of', () => {
      const { a, b, layout, frameA, detect } = layoutOut();

      drag(
        frameA.firstElementChild as HTMLElement,
        [20, 10],
        [
          [50, 20],
          [300, 100]
        ]
      );
      detect();

      const group = (layout.rootPane as XuiDockSplitPane).panes[0] as XuiDockTabGroupPane;
      expect(group.type).toBe('tabGroupPane');
      expect(group.panes).toEqual([b, a]);
    });

    it('docks against the whole layout near the dock manager frame', () => {
      const { a, b, layout, frameA, detect } = layoutOut();

      // Within 28px of the bottom edge, clear of the outer ring's own square.
      drag(
        frameA.firstElementChild as HTMLElement,
        [20, 10],
        [
          [50, 20],
          [300, 195]
        ]
      );
      detect();

      const root = layout.rootPane as XuiDockSplitPane;
      expect(root.orientation).toBe('vertical');
      expect(root.panes[0]).toBe(b);
      expect(root.panes[1]).toBe(a);
    });

    it('floats a pane dropped outside the layout', () => {
      const { a, cmp, frameA, detect } = layoutOut();
      const dragged: unknown[] = [];
      cmp.paneDragStart.subscribe(pane => dragged.push(pane));

      drag(
        frameA.firstElementChild as HTMLElement,
        [20, 10],
        [
          [50, 20],
          [700, 600]
        ]
      );
      detect();

      expect(dragged).toEqual([a]);
      expect(cmp.layout().floatingPanes?.[0].panes).toEqual([a]);
    });

    it('does nothing when the pointer never leaves the press point', () => {
      const { layout, frameA, detect } = layoutOut();
      const before = JSON.stringify(layout);

      drag(frameA.firstElementChild as HTMLElement, [20, 10], [[22, 12]]);
      detect();

      expect(JSON.stringify(layout)).toBe(before);
    });

    describe('docking targets', () => {
      it('raises a joystick over the hovered pane plus an outer ring', () => {
        const { host, frameA, detect } = layoutOut();

        expect(indicators(host)).toEqual([]);

        hold(
          frameA.firstElementChild as HTMLElement,
          [20, 10],
          [
            [50, 20],
            [300, 100]
          ]
        );
        detect();

        const shown = indicators(host);

        // Four for the layout's own edges, five for the pane under the pointer.
        expect(shown).toHaveLength(9);
        expect(shown.filter(target => target.side === 'center')).toHaveLength(1);
        // The joystick is centred on B, at (300, 100).
        expect(shown.find(target => target.side === 'center')?.centre).toEqual([300, 100]);
        // The pointer is on the centre square, so that is the one highlighted.
        expect(shown.filter(target => target.active).map(target => target.side)).toEqual(['center']);
      });

      it('follows the pointer from one arm to the next', () => {
        const { host, frameA, detect } = layoutOut();

        hold(
          frameA.firstElementChild as HTMLElement,
          [20, 10],
          [
            [50, 20],
            [300, 100]
          ]
        );
        detect();

        const bottom = indicators(host).find(
          target => target.side === 'bottom' && target.centre[1] > 100 && target.centre[0] === 300
        );

        document.dispatchEvent(
          new MouseEvent('pointermove', { bubbles: true, clientX: bottom?.centre[0], clientY: bottom?.centre[1] })
        );
        detect();

        expect(indicators(host).filter(target => target.active).map(target => target.side)).toEqual(['bottom']);
      });

      it('offers nothing where the dragged pane may not go', () => {
        const doc = content('b', { documentOnly: true });
        const documentHost: XuiDockDocumentHost = {
          type: 'documentHost',
          rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [doc], allowEmpty: true }
        };
        const tool = content('a');
        const layout: XuiDockManagerLayout = {
          rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [tool, documentHost] }
        };
        const result = setup(layout);
        const frames = result.host.querySelectorAll<HTMLElement>('[data-dock-key]');

        stub(result.host.querySelector('xui-dock-manager') as Element, { left: 0, top: 0, width: 400, height: 200 });
        stub(frames[0], { left: 0, top: 0, width: 200, height: 200 });
        stub(frames[1], { left: 200, top: 0, width: 200, height: 200 });
        stub(frames[2], { left: 200, top: 0, width: 200, height: 200 });

        // A document held over the tool pane: neither its joystick nor the outer
        // ring would take it, so no target is drawn at all.
        hold(
          frames[2].firstElementChild as HTMLElement,
          [250, 10],
          [
            [250, 20],
            [100, 100]
          ]
        );
        result.detect();

        expect(indicators(result.host)).toEqual([]);
      });

      it('mirrors the joystick arms in RTL', () => {
        const { a, b, layout, host, frameA, detect } = layoutOut('rtl');

        hold(
          frameA.firstElementChild as HTMLElement,
          [20, 10],
          [
            [50, 20],
            [300, 100]
          ]
        );
        detect();

        // The arm on the visual left of B's joystick is its *inline end* in RTL,
        // so A lands after B in the tree rather than before it.
        const left = indicators(host).find(target => target.side === 'left' && target.centre[0] === 266);
        expect(left).toBeTruthy();

        document.dispatchEvent(
          new MouseEvent('pointermove', { bubbles: true, clientX: left?.centre[0], clientY: left?.centre[1] })
        );
        document.dispatchEvent(
          new MouseEvent('pointerup', { bubbles: true, clientX: left?.centre[0], clientY: left?.centre[1] })
        );
        detect();

        expect((layout.rootPane as XuiDockSplitPane).panes).toEqual([b, a]);
      });

      it('clears the targets once the drag ends', () => {
        const { host, frameA, detect } = layoutOut();

        drag(
          frameA.firstElementChild as HTMLElement,
          [20, 10],
          [
            [50, 20],
            [300, 100]
          ]
        );
        detect();

        expect(indicators(host)).toEqual([]);
      });
    });

    describe('a floating window', () => {
      /** One 200×200 docked pane, plus a floating window holding pane B. */
      const floated = () => {
        const result = layoutOut();
        result.cmp.floatPane(result.b, { x: 220, y: 20 });
        result.detect();

        const window = result.cmp.layout().floatingPanes?.[0] as XuiDockSplitPane;
        const frames = result.host.querySelectorAll<HTMLElement>('[data-dock-key]');

        stub(result.host.querySelector('xui-dock-manager') as Element, { left: 0, top: 0, width: 400, height: 200 });
        stub(frames[0], { left: 0, top: 0, width: 400, height: 200 });
        stub(result.host.querySelector('[data-dock-window]') as Element, {
          left: 220,
          top: 20,
          width: 160,
          height: 120
        });

        return { ...result, window, titleBar: result.host.querySelector('[data-dock-window]')?.firstElementChild };
      };

      it('moves rather than docking when dropped over the middle of a pane', () => {
        const { window, titleBar, detect, cmp } = floated();

        // Clear of the edge bands and of the centre hotspot alike.
        drag(
          titleBar as HTMLElement,
          [220, 30],
          [
            [240, 50],
            [300, 100]
          ]
        );
        detect();

        expect(cmp.layout().floatingPanes).toEqual([window]);
        expect(window.floatingLocation).toEqual({ x: 300, y: 90 });
      });

      it('docks when dropped on a docking target', () => {
        const { a, b, layout, host, titleBar, detect, cmp } = floated();

        hold(titleBar as HTMLElement, [220, 30], [[240, 50]]);
        detect();

        // The remaining docked pane fills the layout, so its joystick sits at the
        // centre; aim at the arm that puts the window to its right.
        const right = indicators(host).find(target => target.side === 'right' && target.centre[0] === 234);
        expect(right).toBeTruthy();

        document.dispatchEvent(
          new MouseEvent('pointermove', { bubbles: true, clientX: right?.centre[0], clientY: right?.centre[1] })
        );
        document.dispatchEvent(
          new MouseEvent('pointerup', { bubbles: true, clientX: right?.centre[0], clientY: right?.centre[1] })
        );
        detect();

        expect(cmp.layout().floatingPanes).toEqual([]);
        expect((layout.rootPane as XuiDockSplitPane).panes).toEqual([a, b]);
      });
    });

    it('refuses a drop that would move a document out of the document host', () => {
      const doc = content('b', { documentOnly: true });
      const host: XuiDockDocumentHost = {
        type: 'documentHost',
        rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [doc], allowEmpty: true }
      };
      const tool = content('a');
      const layout: XuiDockManagerLayout = {
        rootPane: { type: 'splitPane', orientation: 'horizontal', panes: [tool, host] }
      };
      const result = setup(layout);
      const frames = result.host.querySelectorAll<HTMLElement>('[data-dock-key]');

      stub(result.host.querySelector('xui-dock-manager') as Element, { left: 0, top: 0, width: 400, height: 200 });
      stub(frames[0], { left: 0, top: 0, width: 200, height: 200 });
      // frames[1] is the host, frames[2] the document inside it.
      stub(frames[1], { left: 200, top: 0, width: 200, height: 200 });
      stub(frames[2], { left: 200, top: 0, width: 200, height: 200 });

      // Aim at the tool pane, which is off-limits — so the document floats instead.
      drag(
        frames[2].firstElementChild as HTMLElement,
        [250, 10],
        [
          [250, 20],
          [100, 100]
        ]
      );
      result.detect();

      expect(result.cmp.layout().floatingPanes?.[0].panes).toEqual([doc]);
      expect((layout.rootPane as XuiDockSplitPane).panes[0]).toBe(tool);
    });
  });

  it('tracks the active pane', () => {
    const { a, b, layout } = pair();
    const { host, cmp, detect } = setup(layout);
    const active: (XuiDockContentPane | null)[] = [];
    cmp.activePaneChange.subscribe(pane => active.push(pane));

    const frames = host.querySelectorAll<HTMLElement>('[data-dock-key]');
    // jsdom has no PointerEvent; the binding is by name, so a MouseEvent lands.
    frames[1].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    detect();

    expect(cmp.activePane()).toBe(b);
    expect(active).toEqual([b]);

    // Closing the active pane clears the selection.
    cmp.closePane(b);
    detect();
    expect(cmp.activePane()).toBeNull();
    expect(active.at(-1)).toBeNull();
    expect(a.isPinned).toBeUndefined();
  });
});
