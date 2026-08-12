import {
  Component,
  ElementRef,
  ErrorHandler,
  effect,
  inject,
  viewChild,
  type Provider,
  type Type
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiPanelStackImports } from '../index';
import { XUI_PANEL_STACK } from './panel-stack.types';

/**
 * The panel stack on a platform with no compositor.
 *
 * The slide is a Web Animations call, `element.animate(...)`, reached from a
 * constructor `effect` whenever the depth changes. It is meant to be unreachable
 * on the server, and the thing that was supposed to make it unreachable is this:
 *
 * ```ts
 * if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
 * ```
 *
 * That guard does not hold on the server. `?.()` short-circuits the *whole*
 * chain, so with no `matchMedia` the expression is `undefined` — falsy — and the
 * render falls straight through to `element.animate`, which the server DOM does
 * not implement. It reads like a feature check and behaves like the opposite of
 * one.
 *
 * Three things about *how* this is measured, each of which would otherwise buy a
 * test that passes for the wrong reason:
 *
 * - **`renderApplication` resolves anyway.** Angular's `ErrorHandler` swallows
 *   what a constructor effect throws during change detection, so
 *   `await expect(render(...)).resolves` is green against the defect. These
 *   cases collect what the handler was handed and assert on that. The case under
 *   "the harness itself" proves the collector is wired up.
 * - **A static stack never reaches the branch.** `depth` and the effect's
 *   `previousDepth` both start at 1 and a static `initialPanel` never moves
 *   either, so rendering a panel stack and asserting it did not throw is green
 *   against the defect too. That case is kept below, labelled, as a
 *   non-assertion. The load-bearing case makes the two differ *during the
 *   render* — a component panel that opens another from its constructor, which
 *   is what `XUI_PANEL_STACK` is for.
 * - **The error is not the only damage.** The throw aborts the change-detection
 *   pass mid-flight, so the response carries the panel the stack was leaving
 *   rather than the one it arrived at. A reader gets "Root" and the client
 *   hydrates "Deeper". Asserting the served markup is a second, independent way
 *   for this defect to be caught.
 */

let sink: string[] = [];

class Collect extends ErrorHandler {
  override handleError(error: unknown): void {
    sink.push(error instanceof Error ? error.message : String(error));
  }
}

const COLLECT: Provider = { provide: ErrorHandler, useClass: Collect };

interface Served {
  html: string;
  /** Everything the application's `ErrorHandler` was handed during the render. */
  errors: string[];
}

async function render(root: Type<unknown>): Promise<Served> {
  sink = [];
  const html = await renderApplication(context => bootstrapApplication(root, { providers: [COLLECT] }, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });

  return { html, errors: sink };
}

/**
 * The defect written out by hand, in a component this library does not ship.
 *
 * Every assertion below is "no error was raised" or "the markup says X", and all
 * of them read green against a harness that never saw a render at all. This is
 * the case that proves the harness can see a swallowed throw — and, incidentally,
 * that the guard being fixed really does fall through on the server.
 */
@Component({ selector: 'xui-root', template: `<div #el>sabotage</div>` })
class Sabotage {
  private readonly el = viewChild.required<ElementRef<HTMLElement>>('el');

  constructor() {
    effect(() => {
      if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      this.el().nativeElement.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1 });
    });
  }
}

@Component({ selector: 'xui-leaf', template: `<span>leaf</span>` })
class Leaf {}

/** A component panel that drills one level deeper as soon as it is created. */
@Component({ selector: 'xui-auto', template: `<span>auto</span>` })
class AutoAdvance {
  constructor() {
    inject(XUI_PANEL_STACK).openPanel({ title: 'Deeper', content: Leaf });
  }
}

@Component({
  selector: 'xui-root',
  imports: [XuiPanelStackImports],
  template: `<xui-panel-stack [initialPanel]="{ title: 'Root', content: auto }" />`
})
class NavigatesWhileRendering {
  protected readonly auto = AutoAdvance;
}

@Component({
  selector: 'xui-root',
  imports: [XuiPanelStackImports],
  template: `
    <xui-panel-stack [initialPanel]="{ title: 'Root', content: root }" />
    <ng-template #root><span>root</span></ng-template>
  `
})
class StaticStack {}

describe('XuiPanelStack on the server', () => {
  describe('the harness itself', () => {
    it('sees a throw that the render swallowed', async () => {
      const { html, errors } = await render(Sabotage);

      // Resolved, with markup, having thrown. This is why nothing below is
      // written as "expect(render(...)).resolves".
      expect(html).toContain('sabotage');
      expect(errors).toEqual([expect.stringContaining('animate is not a function')]);
    });

    it('confirms the reduced-motion guard does not stop a server render', async () => {
      // `Sabotage` carries the exact expression from `panel-stack.ts`. If the
      // guard short-circuited to "skip the animation" rather than to `undefined`,
      // this render would be clean and the defect would not exist.
      const { errors } = await render(Sabotage);

      expect(globalThis.matchMedia).toBeUndefined();
      expect(errors).not.toHaveLength(0);
    });
  });

  // NOT EVIDENCE. Kept because it is the render everybody reaches for first, and
  // it is green against the broken component: a static `initialPanel` leaves
  // `depth` at 1 for the whole render, so `slide()` is never called. Every case
  // below it exists because this one cannot fail.
  it('renders a static stack without incident, which proves nothing', async () => {
    const { html, errors } = await render(StaticStack);

    expect(html).toContain('root');
    expect(errors).toEqual([]);
  });

  it('raises nothing when a panel navigates during the render', async () => {
    const { errors } = await render(NavigatesWhileRendering);

    // The load-bearing case. `openPanel` from a component panel's constructor
    // moves `depth` to 2 while `previousDepth` is still 1, which is the only
    // thing standing between this library and a server-side throw today.
    expect(errors).toEqual([]);
  });

  it('serves the panel it navigated to, not the one the throw froze', async () => {
    const { html } = await render(NavigatesWhileRendering);

    // The consequence, asserted independently of the error: an aborted
    // change-detection pass leaves the outgoing panel in the response, and the
    // client hydrates the incoming one.
    expect(html).toContain('<xui-leaf>');
    expect(html).not.toContain('<xui-auto>');
    expect(html).toContain('Deeper');
  });
});
