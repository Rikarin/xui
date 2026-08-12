import { Component, ErrorHandler, signal, ɵsetDocument } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { provideServerRendering } from '@angular/ssr';
import { XuiDockManagerImports } from '../index';
import type { XuiDockManagerLayout } from './dock-manager.types';

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
 * Hence the sabotage case below. A harness that cannot fail is worth nothing,
 * and this one silently could not, twice.
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

const layout = (): XuiDockManagerLayout => ({
  rootPane: {
    type: 'splitPane',
    orientation: 'horizontal',
    panes: [
      { type: 'contentPane', contentId: 'a', header: 'A' },
      { type: 'contentPane', contentId: 'b', header: 'B' }
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

@Component({
  selector: 'xui-root',
  imports: [XuiDockManagerImports],
  template: `
    <xui-dock-manager ngSkipHydration [layout]="left()">
      <ng-template xuiDockContent="a">Body A</ng-template>
      <ng-template xuiDockContent="b">Body B</ng-template>
    </xui-dock-manager>
  `
})
class SkippedContent {
  readonly left = signal(layout());
}

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
    // The anchor for every other case in this file. `toEqual([])` is only
    // evidence of hydration if this harness is capable of producing a non-empty
    // list, and for two separate reasons it was not.
    expect(await hydrate(PlainPage, DifferentPage)).not.toEqual([]);
  });

  it('hydrates a dock manager whose panes have no content', async () => {
    // The layout itself — splitters, headers, tab strips — is ordinary template
    // and hydrates. What breaks is only the projected content, below.
    expect(await hydrate(HeadersOnly)).toEqual([]);
  });

  /**
   * A known limitation, asserted rather than described so that fixing it fails
   * this file and forces the note to be rewritten.
   *
   * `mountContent` creates each content view from the dock manager's *own*
   * `ViewContainerRef` and then `appendChild`s its root nodes into a pane
   * element somewhere else in the tree. The view's declared position and its
   * nodes' real position are therefore different places, and hydration walks
   * from the declared one: `locateOrCreateAnchorNode` →
   * `locateDehydratedViewsInContainer` → `siblingAfter` →
   * `validateSiblingNodeExists`, which finds nothing where the annotation says
   * the view begins.
   *
   * The error surfaces as `Expecting instance of DOM Element` rather than the
   * NG0501 it should be: Angular's own reporting path calls `getComponent` on
   * the node it failed to find, and throws before it can name the real problem.
   *
   * The two cases below say why this is more than an annotation to add. The
   * layout hydrates on its own (above), so the defect is entirely in the moved
   * views; and `ngSkipHydration` does not help, because the `<ng-template>`s are
   * declared in the *consumer's* template, so the container Angular fails to
   * locate belongs to the consumer's view rather than the dock manager's, and
   * skipping the dock manager does not cover it.
   *
   * Fixing it means giving each pane's content host a `ViewContainerRef` of its
   * own and moving views between containers with `insert`/`detach` instead of
   * `appendChild`. That keeps the view instance, which is what the current
   * design is protecting — a pane holds its DOM, and so its scroll position,
   * focus and form state, as it is dragged, docked, floated and tabbed. It is
   * the same operation the component already performs, expressed so that Angular
   * knows about it.
   */
  it('cannot yet hydrate a pane whose content came from a template', async () => {
    expect(await hydrate(WithContent)).not.toEqual([]);
  });

  it('is not fixed by ngSkipHydration on the dock manager', async () => {
    expect(await hydrate(SkippedContent)).not.toEqual([]);
  });
});
