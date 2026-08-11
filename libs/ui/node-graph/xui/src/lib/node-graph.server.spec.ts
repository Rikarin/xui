import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiNodeGraphImports } from '../index';

/**
 * These run against the real server platform — `@angular/platform-server` on top
 * of domino — rather than jsdom with `PLATFORM_ID` swapped, so what they exercise
 * is the DOM a production render actually gets: no `ResizeObserver`, no
 * `getBoundingClientRect`, and `clientWidth` reading back as `undefined`.
 *
 * Bootstrapping the server platform replaces the global DOM for the rest of the
 * file, which is why the server cases live here rather than beside the browser
 * ones.
 */
@Component({
  selector: 'xui-root',
  imports: [XuiNodeGraphImports],
  template: `
    <xui-node-graph [edges]="[]">
      <xui-graph-node nodeId="a" label="A" [position]="{ x: 0, y: 0 }">
        <xui-graph-port portId="out" direction="output" />
      </xui-graph-node>
      <xui-graph-node nodeId="b" label="B" [position]="{ x: 200, y: 80 }">
        <xui-graph-port portId="in" direction="input" />
      </xui-graph-node>
      <xui-graph-minimap />
    </xui-node-graph>
  `
})
class ServerHost {}

function render(): Promise<string> {
  return renderApplication(context => bootstrapApplication(ServerHost, {}, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });
}

describe('XuiNodeGraph on the server', () => {
  /**
   * The suite's own setup polyfills `ResizeObserver` so jsdom can run the browser
   * tests, and leaving that in place would hide the very thing these assert:
   * a server render reaching for one is a `ReferenceError`, not a no-op.
   */
  const polyfill = globalThis.ResizeObserver;

  beforeEach(() => {
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  });

  afterEach(() => {
    globalThis.ResizeObserver = polyfill;
  });

  it('renders the graph without reaching for a ResizeObserver', async () => {
    // Constructing one on the server is fatal rather than logged: the throw
    // lands in the component constructor, so the graph and everything projected
    // into it are missing from the response entirely.
    const html = await render();

    expect(html).toContain('xui-node-graph');
    expect(html).toContain('>A<');
    expect(html).toContain('>B<');
  });

  it('serialises the minimap without measuring the element it is drawn in', async () => {
    const html = await render();

    // `clientWidth` is `undefined` on a server element, so a scale derived from
    // it is NaN — and NaN reaches the response as an attribute value, which is
    // markup the browser has to recover from rather than a line in a log.
    expect(html).not.toContain('NaN');
  });
});
