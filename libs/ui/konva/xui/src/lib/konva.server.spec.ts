import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiKonvaImports } from '../index';

/**
 * Rendered against the real server platform — `@angular/platform-server` on top
 * of domino — rather than jsdom with `PLATFORM_ID` swapped, because the DOM is
 * the thing under test. jsdom has `Element.prepend` and a `MutationObserver`;
 * domino, which is what a production server render actually runs on, has
 * neither, and that difference is the whole defect.
 */
@Component({
  selector: 'xui-root',
  imports: [XuiKonvaImports],
  template: `
    <p>Before</p>
    <xui-konva-stage [config]="{ width: 400, height: 300 }">
      <xui-konva-layer>
        <xui-konva-rect [config]="{ x: 20, y: 20, width: 80, height: 40, fill: 'red' }" />
      </xui-konva-layer>
    </xui-konva-stage>
    <p>After</p>
  `
})
class SizedStage {}

/** A stage told nothing about its size, which is a legal way to write one. */
@Component({
  selector: 'xui-root',
  imports: [XuiKonvaImports],
  template: `<xui-konva-stage><xui-konva-layer /></xui-konva-stage>`
})
class UnsizedStage {}

function render(root: typeof SizedStage | typeof UnsizedStage): Promise<string> {
  return renderApplication(context => bootstrapApplication(root, {}, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });
}

describe('XuiKonvaStage on the server', () => {
  /**
   * The suite's own setup gives jsdom a `MutationObserver`, and leaving it in
   * place would hide half of what these assert: a server render constructing one
   * is a `ReferenceError`, not a no-op.
   */
  const observer = globalThis.MutationObserver;

  beforeEach(() => {
    Reflect.deleteProperty(globalThis, 'MutationObserver');
  });

  afterEach(() => {
    globalThis.MutationObserver = observer;
  });

  it('renders the page the stage is on', async () => {
    const html = await render(SizedStage);

    // The anchor, and the defect itself. `host.prepend` does not exist on a
    // domino element, so the stage threw in its constructor and took itself and
    // everything nested inside it out of the response — the page came back with
    // no stage, no layer and no rect at all. Assert the surrounding page is
    // intact too: a throw here is not local to the component.
    expect(html).toContain('Before');
    expect(html).toContain('After');
    expect(html).toContain('<xui-konva-stage');
    expect(html).toContain('<xui-konva-layer');
    expect(html).toContain('<xui-konva-rect');
  });

  it('reserves the space the canvas will occupy', async () => {
    const html = await render(SizedStage);

    // The one fact about the scene the server knows. Without it the page reflows
    // the moment the canvas appears, which is the cost of rendering nothing.
    expect(html).toMatch(/<div[^>]*style="[^"]*width: 400px[^"]*"/);
    expect(html).toMatch(/<div[^>]*style="[^"]*height: 300px[^"]*"/);
  });

  it('gives the canvas a container the client can adopt', async () => {
    const html = await render(SizedStage);
    const stage = /<xui-konva-stage[^>]*>(.*?)<\/xui-konva-stage>/s.exec(html)?.[1] ?? '';

    // The container is a template element, so the client hydrates the very node
    // the server sent rather than prepending one hydration knows nothing about.
    expect(stage).toMatch(/^<div/);
  });

  it('reserves nothing for a stage that declared no size', async () => {
    const html = await render(UnsizedStage);

    // Same bargain the browser makes: a stage without a declared size has none.
    // Asserting a *number* here would be inventing one.
    expect(html).toContain('<xui-konva-stage');
    expect(html).not.toContain('width: undefinedpx');
    expect(html).not.toContain('NaN');
  });

  it('serves two requests for the same page the same bytes', async () => {
    const first = await render(SizedStage);
    const second = await render(SizedStage);

    expect(second).toBe(first);
  });
});
