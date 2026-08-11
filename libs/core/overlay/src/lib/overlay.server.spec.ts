import { Component, effect, TemplateRef, untracked, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { injectXOverlay } from './overlay';

/**
 * A modal overlay opened from a plain constructor `effect()`.
 *
 * This is not a contrived shape. `XuiDialog` (`dialog.ts:126`), `XuiDrawer`
 * (`drawer.ts:132`) and `XuiAlertDialog` (`alert-dialog.ts:135`) all sync their
 * `open` model to the overlay from exactly this, and a plain effect runs during
 * server rendering. A page server-rendered with a dialog already open therefore
 * reaches `inertBackground`, which walks `body.children` — a collection with no
 * `Symbol.iterator` on the server's DOM.
 */
@Component({
  selector: 'x-root',
  template: `
    <ng-template #surface><p>Modal content</p></ng-template>
    <p>Page behind</p>
  `
})
class ServerHost {
  private readonly overlay = injectXOverlay();
  private readonly surface = viewChild.required<TemplateRef<unknown>>('surface');

  constructor() {
    effect(() => {
      const surface = this.surface();

      untracked(() =>
        this.overlay.open(surface, {
          position: 'global',
          hasBackdrop: true,
          trapFocus: true,
          autoFocus: false,
          restoreFocus: false,
          role: 'dialog',
          ariaLabel: 'Server dialog'
        })
      );
    });
  }
}

describe('injectXOverlay on the server', () => {
  /**
   * jsdom brings a `MutationObserver` that a real server does not have, and the
   * CDK's own `globalThis.MutationObserver &&` guard therefore takes the wrong
   * branch here — handing jsdom's observer a domino node, which kills the
   * worker. Removing it is what makes this environment behave like the server.
   */
  const observer = globalThis.MutationObserver;

  beforeEach(() => {
    Reflect.deleteProperty(globalThis, 'MutationObserver');
  });

  afterEach(() => {
    globalThis.MutationObserver = observer;
  });

  it('opens a modal without walking the body as if it were iterable', async () => {
    const html = await renderApplication(context => bootstrapApplication(ServerHost, {}, context), {
      document: '<html><body><x-root></x-root></body></html>'
    });

    // The throw lands after the overlay has attached, so the content is in the
    // response either way and asserting on it alone would not see the bug.
    // What the guard has to buy is the work that comes *after* the spread:
    // the siblings the modal is supposed to hide actually being marked.
    expect(html).toContain('Modal content');
    expect(html).toContain('inert');
  });
});
