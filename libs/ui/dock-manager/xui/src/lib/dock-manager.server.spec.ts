import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiDockManagerImports } from '../index';
import type { XuiDockManagerLayout } from './dock-manager.types';

/**
 * These render against the real server platform — `@angular/platform-server` on
 * top of domino — rather than jsdom with `PLATFORM_ID` swapped, because what is
 * under test is a property of the *response*: two requests for the same page,
 * served by the same process, have to produce the same bytes.
 *
 * A page is built fresh for every render, exactly as a request-scoped route
 * component would be, so nothing but the library carries state from one render
 * to the next.
 */
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
class OnePage {
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
    <xui-dock-manager [layout]="right()">
      <ng-template xuiDockContent="a">Body A</ng-template>
      <ng-template xuiDockContent="b">Body B</ng-template>
    </xui-dock-manager>
  `
})
class TwoOnAPage {
  readonly left = signal(layout());
  readonly right = signal(layout());
}

function render(root: unknown): Promise<string> {
  return renderApplication(context => bootstrapApplication(root as typeof OnePage, {}, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });
}

const dockKeys = (html: string): string[] => [...html.matchAll(/data-dock-key="([^"]*)"/g)].map(match => match[1]);

describe('XuiDockManager on the server', () => {
  it('renders the panes it was given', async () => {
    const html = await render(OnePage);

    // The keys below mean nothing if the dock never laid out: under 2.2.0 the
    // overflow-list throw truncated the render before this point, so a response
    // carrying no `data-dock-key` at all compared equal to another one just like
    // it. Anchor the rest of the file on the panes actually being here.
    expect(dockKeys(html)).toHaveLength(2);
    expect(html).toContain('Body A');
    expect(html).toContain('Body B');
  });

  it('serves two requests for the same page the same bytes', async () => {
    const first = await render(OnePage);
    const second = await render(OnePage);

    // Not "the second response looks right" — the two have to be the *same*
    // response. A pane key drawn from a counter that outlives the request makes
    // the markup a function of how many pages the process has already served.
    expect(second).toBe(first);
  });

  it('numbers panes from the page rather than from the process', async () => {
    await render(OnePage);
    await render(OnePage);

    const html = await render(OnePage);

    // The concrete values matter as well as their stability: the browser starts
    // a fresh application, so it counts from the same place, and a client render
    // of this page agrees with the server's. Equality between two server renders
    // alone would also be satisfied by a key that is wrong in the same way twice.
    expect(dockKeys(html)).toEqual(['pane-1', 'pane-2']);
  });

  it('gives every pane on a page its own key, dock managers included', async () => {
    const html = await render(TwoOnAPage);
    const keys = dockKeys(html);

    // Determinism is easy to buy by making every key the same string, which
    // would leave `querySelector('[data-dock-key="…"]')` picking whichever pane
    // came first.
    expect(keys).toHaveLength(4);
    expect(new Set(keys).size).toBe(4);
    expect(keys.every(key => key.length > 0)).toBe(true);
  });

  it('serves two requests for a two-dock page the same bytes', async () => {
    const first = await render(TwoOnAPage);
    const second = await render(TwoOnAPage);

    expect(second).toBe(first);
  });
});
