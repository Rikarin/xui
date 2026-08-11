import { Component, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { XuiOverflowList, XuiOverflowListImports } from '../index';

/**
 * jsdom reports every element as 0×0, so both the container width and the item
 * widths have to be supplied. Each item is stubbed at 100px.
 */
const ITEM_WIDTH = 100;

@Component({
  selector: 'xui-overflow-host',
  imports: [XuiOverflowListImports],
  template: `
    <xui-overflow-list
      [items]="items()"
      [collapseFrom]="collapseFrom()"
      [minVisibleItems]="minVisibleItems()"
      [alwaysRenderOverflow]="alwaysRenderOverflow()"
      [itemRole]="itemRole()"
      (overflowChange)="hidden.set($event)"
    >
      <ng-template xuiOverflowListItem let-item>
        <span class="item">{{ item }}</span>
      </ng-template>
      <ng-template xuiOverflowListOverflow let-count="count">
        <span class="overflow">+{{ count }}</span>
      </ng-template>
    </xui-overflow-list>
  `
})
class OverflowHost {
  readonly list = viewChild.required(XuiOverflowList);
  readonly items = signal(['a', 'b', 'c', 'd', 'e']);
  readonly collapseFrom = signal<'start' | 'end'>('start');
  readonly minVisibleItems = signal(0);
  readonly alwaysRenderOverflow = signal(false);
  readonly itemRole = signal<string | null>(null);
  readonly hidden = signal<string[] | null>(null);
}

/**
 * The items on screen. The ruler renders a copy of every item, so anything
 * inside it has to be filtered out or each item shows up twice.
 */
function visibleItems(root: HTMLElement): (string | null)[] {
  return [...root.querySelectorAll('.item')]
    .filter((node: Element) => !node.closest('[aria-hidden="true"]'))
    .map((node: Element) => node.textContent);
}

function setup(availableWidth: number) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [OverflowHost] });

  const fixture = TestBed.createComponent(OverflowHost);
  fixture.detectChanges();

  const listElement = fixture.nativeElement.querySelector('xui-overflow-list') as HTMLElement;
  Object.defineProperty(listElement, 'clientWidth', { value: availableWidth, configurable: true });

  // The ruler holds one wrapper per item; give each a fixed width.
  const ruler = listElement.querySelector('[aria-hidden="true"]') as HTMLElement;
  const stubWidths = () => {
    for (const child of ruler.children) {
      child.getBoundingClientRect = () => ({ width: ITEM_WIDTH }) as DOMRect;
    }
  };

  stubWidths();
  // The content query resolving and the first measurement land on separate
  // passes, as they would in a running app.
  fixture.detectChanges();

  return {
    fixture,
    host: fixture.componentInstance,
    stubWidths,
    remeasure: () => {
      stubWidths();
      // Re-run the measurement the way a resize would.
      fixture.componentInstance.items.update(items => [...items]);
      fixture.detectChanges();
    },
    visible: () => visibleItems(fixture.nativeElement),
    overflowLabel: () => fixture.nativeElement.querySelector('.overflow')?.textContent ?? null
  };
}

describe('XuiOverflowList', () => {
  it('shows every item when they all fit', () => {
    const { remeasure, visible, overflowLabel } = setup(1000);
    remeasure();

    expect(visible()).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(overflowLabel()).toBeNull();
  });

  it('shows everything before the container has been measured', () => {
    // Flashing an empty list while waiting for the first resize callback would
    // be worse than briefly overflowing.
    const { visible } = setup(0);

    expect(visible()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('collapses the leading items by default', () => {
    const { remeasure, visible } = setup(3 * ITEM_WIDTH);
    remeasure();

    // Breadcrumb semantics: the tail is the part the user needs.
    expect(visible()).toEqual(['d', 'e']);
  });

  it('reports the hidden items in their original order', () => {
    const { remeasure, host } = setup(3 * ITEM_WIDTH);
    remeasure();

    expect(host.hidden()).toEqual(['a', 'b', 'c']);
  });

  it('renders the overflow template with the hidden count', () => {
    const { remeasure, overflowLabel } = setup(3 * ITEM_WIDTH);
    remeasure();

    expect(overflowLabel()).toBe('+3');
  });

  it('collapses the trailing items when asked', () => {
    const { fixture, host, remeasure, visible } = setup(3 * ITEM_WIDTH);
    host.collapseFrom.set('end');
    fixture.detectChanges();
    remeasure();

    expect(visible()).toEqual(['a', 'b']);
  });

  it('never collapses below minVisibleItems', () => {
    const { fixture, host, remeasure, visible } = setup(ITEM_WIDTH);
    host.minVisibleItems.set(3);
    fixture.detectChanges();
    remeasure();

    expect(visible()).toHaveLength(3);
  });

  it('hides the overflow slot when nothing is hidden', () => {
    const { remeasure, overflowLabel } = setup(1000);
    remeasure();

    expect(overflowLabel()).toBeNull();
  });

  it('keeps the overflow slot rendered when asked', () => {
    const { fixture, host, remeasure, overflowLabel } = setup(1000);
    host.alwaysRenderOverflow.set(true);
    fixture.detectChanges();
    remeasure();

    // Useful when the overflow renderer owns a popover that must not be torn
    // down as the list resizes.
    expect(overflowLabel()).toBe('+0');
  });

  it('keeps the measurement pass out of the accessibility tree', () => {
    const { fixture } = setup(1000);
    const ruler = fixture.nativeElement.querySelector('xui-overflow-list > [aria-hidden="true"]');

    // Otherwise every item would be announced twice.
    expect(ruler).toBeTruthy();
    expect(ruler.className).toContain('invisible');
  });

  it('gives the layout wrappers a role on request, overflow included', () => {
    const { fixture, host, remeasure, visible } = setup(3 * ITEM_WIDTH);
    host.itemRole.set('listitem');
    fixture.detectChanges();
    remeasure();

    // Without this the wrappers sit between a role="list" and its items and
    // break the chain between them.
    const wrappers = fixture.nativeElement.querySelectorAll('[role="listitem"]');
    expect(wrappers).toHaveLength(visible().length + 1);
  });

  it('re-measures when the item set changes', () => {
    const { fixture, host, remeasure, visible } = setup(3 * ITEM_WIDTH);
    remeasure();
    expect(visible()).toHaveLength(2);

    host.items.set(['a', 'b']);
    fixture.detectChanges();
    remeasure();

    expect(visible()).toEqual(['a', 'b']);
  });

  describe('on the server', () => {
    /**
     * Angular renders on the server against domino, not jsdom, and the two
     * differ in exactly the places a measurement pass reads: `children` has no
     * `Symbol.iterator`, elements have no `getBoundingClientRect`, and
     * `clientWidth` is `undefined`. Standing those three in makes any attempt
     * to measure fail here the way it fails in production.
     */
    function useServerDom(onRulerChildren: () => void): () => void {
      const children = Object.getOwnPropertyDescriptor(Element.prototype, 'children');
      const clientWidth = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
      const boundingRect = Object.getOwnPropertyDescriptor(Element.prototype, 'getBoundingClientRect');

      Object.defineProperty(Element.prototype, 'children', {
        configurable: true,
        get(this: Element) {
          const live = children?.get?.call(this) as HTMLCollection;

          if (this.getAttribute('aria-hidden') === 'true') {
            onRulerChildren();
          }

          // domino's ChildrenCollection: indices and a length, and nothing else.
          const arrayLike: Record<number | 'length', unknown> = { length: live.length };

          for (let i = 0; i < live.length; i++) {
            arrayLike[i] = live[i];
          }

          return arrayLike;
        }
      });

      Object.defineProperty(Element.prototype, 'clientWidth', { configurable: true, get: () => undefined });
      Reflect.deleteProperty(Element.prototype, 'getBoundingClientRect');

      return () => {
        Object.defineProperty(Element.prototype, 'children', children!);
        Object.defineProperty(Element.prototype, 'clientWidth', clientWidth!);
        Object.defineProperty(Element.prototype, 'getBoundingClientRect', boundingRect!);
      };
    }

    let rulerReads: number;
    let restoreDom: () => void;

    beforeEach(() => {
      rulerReads = 0;
      restoreDom = useServerDom(() => rulerReads++);
    });

    afterEach(() => restoreDom());

    function render() {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [OverflowHost],
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
      });

      const fixture = TestBed.createComponent(OverflowHost);
      fixture.detectChanges();

      return fixture;
    }

    it('never measures, so nothing lands in the log', () => {
      // A measurement pass dies on the first thing it touches here — as it does
      // in production, where the platform reports the failure to its
      // `ErrorHandler` rather than failing the response: one log line per
      // rendered request, on a server that renders one list per page.
      expect(() => render()).not.toThrow();

      // Asserting on the output alone would pass without the guard: the throw
      // lands while `visibleCount` is still at its initial value, so the markup
      // is already right today. What has to be true is that the pass never ran.
      expect(rulerReads).toBe(0);
    });

    it('renders every item, since nothing has been measured yet', () => {
      const fixture = render();

      expect(visibleItems(fixture.nativeElement)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });
});
