import {
  Component,
  ElementRef,
  ErrorHandler,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
  ɵsetDocument
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { provideServerRendering } from '@angular/ssr';
import { XuiDockManagerImports } from '../index';
import type { XuiDockContentPane, XuiDockManagerLayout } from './dock-manager.types';

/**
 * A server render handed to a real client bootstrap, so hydration is exercised
 * rather than described.
 *
 * Three things had to be right before this measured anything, and each was found
 * by the harness reporting a clean run it had not earned:
 *
 * - `provideServerRendering()` on the server. `provideClientHydration()` alone
 *   is enough for the `ngh` annotations but not for the `<script id="ng-state">`
 *   that carries them, and a client that finds no state hydrates nothing and
 *   says nothing about it.
 * - `ɵsetDocument` back to jsdom. Bootstrapping the server platform replaces the
 *   document Angular reads for the rest of the file.
 * - `head` and `body` restored separately. Writing the response into
 *   `documentElement.innerHTML` loses comment nodes, and hydration fails with
 *   NG0507 — a real error, about the harness rather than the component.
 *
 * Hence the two sabotage cases below. A harness that cannot fail is worth
 * nothing, and this one silently could not, twice. One of them mismatches an
 * ordinary page; the other mismatches a *pane body*, because "no errors" from a
 * dock manager is only evidence if a broken dock manager would have produced
 * some — an outer check passes just as happily on a harness that never sees
 * inside the component at all.
 */
const jsdomDocument = globalThis.document;

async function hydrate(server: unknown, client: unknown = server): Promise<string[]> {
  const errors: string[] = [];

  const html = await renderApplication(
    context =>
      bootstrapApplication(
        server as typeof PlainPage,
        { providers: [provideServerRendering(), provideClientHydration()] },
        context
      ),
    { document: '<html><body><xui-root></xui-root></body></html>' }
  );

  ɵsetDocument(jsdomDocument);
  jsdomDocument.head.innerHTML = /<head[^>]*>(.*)<\/head>/s.exec(html)?.[1] ?? '';
  jsdomDocument.body.innerHTML = /<body[^>]*>(.*)<\/body>/s.exec(html)?.[1] ?? '';

  const collect = { handleError: (error: unknown) => errors.push(String(error)) };

  try {
    await bootstrapApplication(client as typeof PlainPage, {
      providers: [provideClientHydration(), { provide: ErrorHandler, useValue: collect }]
    });
  } catch (error) {
    errors.push(String(error));
  }

  return errors;
}

const pane = (contentId: string): XuiDockContentPane => ({
  type: 'contentPane',
  contentId,
  header: contentId.toUpperCase()
});

const layout = (): XuiDockManagerLayout => ({
  rootPane: {
    type: 'splitPane',
    orientation: 'horizontal',
    panes: [pane('a'), pane('b')]
  }
});

/** A split beside a tab group, so one body is on screen and one is parked. */
const mixedLayout = (): XuiDockManagerLayout => ({
  rootPane: {
    type: 'splitPane',
    orientation: 'vertical',
    panes: [
      { type: 'splitPane', orientation: 'horizontal', panes: [pane('a'), pane('b')] },
      { type: 'tabGroupPane', panes: [pane('c'), pane('d')] }
    ]
  }
});

@Component({ selector: 'xui-root', template: `<p>Plain</p>` })
class PlainPage {}

@Component({
  selector: 'xui-root',
  template: `<div><span>Different</span></div>
    <section>More</section>`
})
class DifferentPage {}

@Component({
  selector: 'xui-root',
  imports: [XuiDockManagerImports],
  template: `<xui-dock-manager [layout]="left()" />`
})
class HeadersOnly {
  readonly left = signal(layout());
}

@Component({
  selector: 'xui-root',
  imports: [XuiDockManagerImports],
  template: `
    <xui-dock-manager [layout]="left()">
      <ng-template xuiDockContent="a">Body A</ng-template>
      <ng-template xuiDockContent="b">Body B</ng-template>
    </xui-dock-manager>
  `
})
class WithContent {
  readonly left = signal(layout());
}

/** `WithContent` with one pane body shaped differently — the sabotage. */
@Component({
  selector: 'xui-root',
  imports: [XuiDockManagerImports],
  template: `
    <xui-dock-manager [layout]="left()">
      <ng-template xuiDockContent="a"><span>Body A</span><em>and more</em></ng-template>
      <ng-template xuiDockContent="b">Body B</ng-template>
    </xui-dock-manager>
  `
})
class WithDifferentContent {
  readonly left = signal(layout());
}

@Component({
  selector: 'xui-root',
  imports: [XuiDockManagerImports],
  template: `
    <xui-dock-manager [layout]="left()">
      <ng-template xuiDockContent="a"><p>Body A</p></ng-template>
      <ng-template xuiDockContent="b">Body B</ng-template>
      <ng-template xuiDockContent="c"
        ><ul>
          <li>Body C</li>
        </ul></ng-template
      >
      <ng-template xuiDockContent="d">Body D</ng-template>
    </xui-dock-manager>
  `
})
class ManyPanes {
  readonly left = signal(mixedLayout());
}

@Component({
  selector: 'xui-root',
  imports: [XuiDockManagerImports],
  template: `
    <xui-dock-manager [layout]="left()">
      <ng-template xuiDockContent="a">Body A</ng-template>
      <ng-template xuiDockContent="b">Body B</ng-template>
    </xui-dock-manager>
    <xui-dock-manager [layout]="right()">
      <ng-template xuiDockContent="a"><p>Other A</p></ng-template>
      <ng-template xuiDockContent="b">Other B</ng-template>
      <ng-template xuiDockContent="c">Other C</ng-template>
      <ng-template xuiDockContent="d">Other D</ng-template>
    </xui-dock-manager>
  `
})
class TwoDocks {
  readonly left = signal(layout());
  readonly right = signal(mixedLayout());
}

/**
 * The defect this component used to have, reduced to its smallest form: a view
 * created from one container and moved into an element elsewhere.
 *
 * It exists to pin Angular's *reporting* of that mistake, which is what made the
 * original diagnosis expensive — see the case at the bottom of the file.
 */
@Component({ selector: 'xui-stranded-host', template: `<div #box></div>` })
class StrandedHost {
  private readonly container = inject(ViewContainerRef);
  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');

  /** The template to strand: created from this component's own container. */
  readonly body = input.required<TemplateRef<unknown>>();

  constructor() {
    effect(() => {
      const view = this.container.createEmbeddedView(this.body());

      for (const node of view.rootNodes as Node[]) {
        this.box().nativeElement.appendChild(node);
      }
    });
  }
}

@Component({
  selector: 'xui-root',
  imports: [StrandedHost],
  template: `<xui-stranded-host [body]="tpl" /> <ng-template #tpl><b>Stranded</b></ng-template>`
})
class StrandedPage {}

describe('XuiDockManager hydration', () => {
  const observer = globalThis.MutationObserver;
  const resize = globalThis.ResizeObserver;

  beforeEach(() => {
    Reflect.deleteProperty(globalThis, 'MutationObserver');
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  });

  afterEach(() => {
    globalThis.MutationObserver = observer;
    globalThis.ResizeObserver = resize;
    ɵsetDocument(jsdomDocument);
  });

  it('reports a clean hydration when there is one', async () => {
    expect(await hydrate(PlainPage)).toEqual([]);
  });

  it('notices a client that does not match the server', async () => {
    // `toEqual([])` is only evidence of hydration if this harness is capable of
    // producing a non-empty list, and for two separate reasons it once was not.
    expect(await hydrate(PlainPage, DifferentPage)).not.toEqual([]);
  });

  it('notices a pane body that does not match the server', async () => {
    // The anchor for every dock manager case below. The check above proves the
    // harness reports *a* mismatch; this one proves it reports one raised inside
    // a dock manager's projected content, which is the only place the cases
    // below can go wrong.
    expect(await hydrate(WithContent, WithDifferentContent)).not.toEqual([]);
  });

  it('hydrates a dock manager whose panes have no content', async () => {
    expect(await hydrate(HeadersOnly)).toEqual([]);
  });

  it('hydrates a pane whose content came from a template', async () => {
    expect(await hydrate(WithContent)).toEqual([]);
  });

  it('hydrates several panes, including one parked in an unselected tab', async () => {
    // One pane hydrating proves little: four do, and pane `d` has no outlet at
    // all on either side, so its body is never created and must be absent from
    // both the response and the browser's first render rather than merely
    // mismatched in the same way twice.
    expect(await hydrate(ManyPanes)).toEqual([]);
  });

  it('hydrates two dock managers on one page', async () => {
    // Both draw from the same `contentId`s and the same generated pane keys, and
    // each has to claim its own bodies rather than the other's.
    expect(await hydrate(TwoDocks)).toEqual([]);
  });

  /**
   * Not this library's bug, and left alone deliberately.
   *
   * A view whose nodes were moved out of the container that owns them fails
   * `validateSiblingNodeExists`, which should report NG0501 and name the element.
   * It never gets that far: `markRNodeAsHavingHydrationMismatch` walks up from
   * the offending node looking for a component, the node is the container's
   * anchor *comment*, and `getComponent` asserts `instanceof Element` under
   * `ngDevMode` and throws `Expecting instance of DOM Element` first. The walk
   * exists precisely to start from nodes that are not components, so the assert
   * inside it can never be satisfied by the case it was written for.
   *
   * This is what made the dock manager's own version of the fault expensive to
   * diagnose — the useful name never reaches the log — so it is worth a case that
   * fails loudly if Angular ever fixes it.
   */
  it('is still reported by Angular as the wrong error entirely', async () => {
    const errors = await hydrate(StrandedPage);

    expect(errors).not.toEqual([]);
    expect(errors.every(error => error.includes('Expecting instance of DOM Element'))).toBe(true);
    expect(errors.some(error => error.includes('NG0501'))).toBe(false);
  });
});
