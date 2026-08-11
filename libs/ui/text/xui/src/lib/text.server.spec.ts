import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiText } from '../index';

@Component({
  selector: 'xui-root',
  imports: [XuiText],
  template: `<span xuiText ellipsize>A value long enough to want truncating</span>`
})
class ServerHost {}

@Component({ selector: 'xui-root', template: `` })
class Empty {}

function render(root: unknown): Promise<string> {
  return renderApplication(context => bootstrapApplication(root as typeof Empty, {}, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });
}

describe('XuiText on the server', () => {
  let reads: number;

  // Starting the server platform swaps domino's DOM onto the globals, so the
  // prototype to instrument only exists once something has rendered.
  beforeAll(() => render(Empty));

  beforeEach(() => {
    reads = 0;

    // Neither property exists on a server element: both read back as
    // `undefined`, and `undefined > undefined` is `false`. Standing in a counter
    // is the only way to see the read at all, because its *result* is already
    // the answer the browser would eventually settle on.
    const count = { configurable: true, get: () => (reads++, 0) };

    Object.defineProperty(Element.prototype, 'scrollWidth', count);
    Object.defineProperty(Element.prototype, 'clientWidth', count);
  });

  afterEach(() => {
    Reflect.deleteProperty(Element.prototype, 'scrollWidth');
    Reflect.deleteProperty(Element.prototype, 'clientWidth');
  });

  it('never measures a box on a platform that has no layout', async () => {
    await render(ServerHost);

    // Asserting on the markup instead would pass against the unguarded
    // directive: the rendered result is already right. What has to be true is
    // that no measurement happened — `xuiText` is on nearly every page, so this
    // is otherwise a layout read per instance per request for a fixed answer.
    expect(reads).toBe(0);
  });

  it('leaves the overflow title off, since nothing is known to overflow', async () => {
    const html = await render(ServerHost);

    expect(html).not.toContain('title=');
  });
});
