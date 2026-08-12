import { Component, ErrorHandler, type Provider, type Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiDrawerImports } from '../index';

/**
 * A drawer that is already open when the page is rendered.
 *
 * `stillness()` reads `globalThis.matchMedia?.(…).matches` and wraps it in
 * `Boolean`, so on a platform with no `matchMedia` it answers "the user has not
 * asked for less motion" and `slideIn` proceeds — to `pane.animate(...)`, which
 * the server DOM does not implement.
 *
 * `slideOut` on the same component does not have this problem, and the
 * difference is worth naming because it is not the `matchMedia` line: it calls
 * `pane.animate?.(...)` and returns early when nothing comes back. The optional
 * call is on the API that might be missing, not on the one that is always there.
 * `slideIn` calls `animate` outright.
 *
 * As with the panel stack, `renderApplication` resolves regardless — Angular's
 * `ErrorHandler` absorbs what a constructor effect throws — so this asserts on
 * what the handler was given.
 */

let sink: string[] = [];

class Collect extends ErrorHandler {
  override handleError(error: unknown): void {
    sink.push(error instanceof Error ? error.message : String(error));
  }
}

const COLLECT: Provider = { provide: ErrorHandler, useClass: Collect };

async function render(root: Type<unknown>): Promise<{ html: string; errors: string[] }> {
  sink = [];
  const html = await renderApplication(context => bootstrapApplication(root, { providers: [COLLECT] }, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });

  return { html, errors: sink };
}

@Component({
  selector: 'xui-root',
  imports: [XuiDrawerImports],
  template: `<xui-drawer [open]="true" title="Filters"><p>body</p></xui-drawer>`
})
class OpenOnArrival {}

@Component({
  selector: 'xui-root',
  imports: [XuiDrawerImports],
  template: `<xui-drawer title="Filters"><p>body</p></xui-drawer>`
})
class Closed {}

describe('XuiDrawer on the server', () => {
  // NOT EVIDENCE. A closed drawer never attaches an overlay and so never
  // animates; this is green against the defect. It is here to keep the case
  // below honest about what it is actually exercising.
  it('renders a closed drawer without incident, which proves nothing', async () => {
    const { errors } = await render(Closed);

    expect(errors).toEqual([]);
  });

  it('raises nothing when the drawer is open before the first paint', async () => {
    const { errors } = await render(OpenOnArrival);

    expect(errors).toEqual([]);
  });
});
