import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiTabsImports } from '../index';

/**
 * Rendered against the real server platform — `@angular/platform-server` on top
 * of domino — because what is under test is a property of the *response*: two
 * requests for the same page, answered by the same process, have to come back
 * with the same bytes.
 *
 * Tabs stand in here for the twenty-odd components that take their generated ids
 * from `injectUniqueId`. They are the case worth writing because both halves of two
 * ARIA relationships are built from the same generated stem: the tab's
 * `aria-controls` names its panel, and the panel's `aria-labelledby` names its
 * tab.
 */
@Component({
  selector: 'xui-root',
  imports: [XuiTabsImports],
  template: `
    <xui-tabs selectedTabId="a" [renderActiveTabPanelOnly]="false">
      <xui-tab id="a" title="Alpha">Panel A</xui-tab>
      <xui-tab id="b" title="Beta">Panel B</xui-tab>
    </xui-tabs>

    <xui-tabs selectedTabId="a" [renderActiveTabPanelOnly]="false">
      <xui-tab id="a" title="Alpha">Panel A</xui-tab>
      <xui-tab id="b" title="Beta">Panel B</xui-tab>
    </xui-tabs>
  `
})
class TwoTabSets {}

/** A tab set whose tabs were left without ids, so `xui-tab` generates them. */
@Component({
  selector: 'xui-root',
  imports: [XuiTabsImports],
  template: `
    <xui-tabs [renderActiveTabPanelOnly]="false">
      <xui-tab title="Alpha">Panel A</xui-tab>
      <xui-tab title="Beta">Panel B</xui-tab>
    </xui-tabs>
  `
})
class UnidentifiedTabs {}

function render(root: typeof TwoTabSets | typeof UnidentifiedTabs): Promise<string> {
  return renderApplication(context => bootstrapApplication(root, {}, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });
}

const attributes = (html: string, name: string): string[] =>
  [...html.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map(match => match[1]);

/** The `id` of every element carrying `role`, keyed by role. */
const idsByRole = (html: string, role: string): string[] =>
  [...html.matchAll(new RegExp(`<[^>]*role="${role}"[^>]*>`, 'g'))]
    .map(match => /\sid="([^"]*)"/.exec(match[0])?.[1] ?? '')
    .filter(Boolean);

describe('XuiTabs on the server', () => {
  it('renders both tab sets', async () => {
    const html = await render(TwoTabSets);

    // Anchor: what follows is entirely about generated id values, and a response
    // that never drew a tab satisfies all of it — empty lists are equal to each
    // other and contain no duplicates.
    expect(html).toContain('Panel A');
    expect(idsByRole(html, 'tab')).toHaveLength(4);
    expect(idsByRole(html, 'tabpanel')).toHaveLength(4);
  });

  it('serves two requests for the same page the same bytes', async () => {
    const first = await render(TwoTabSets);
    const second = await render(TwoTabSets);

    expect(second).toBe(first);
  });

  it('numbers tab sets from the page rather than from the process', async () => {
    await render(TwoTabSets);
    await render(TwoTabSets);

    const html = await render(TwoTabSets);

    // Pinned, not merely stable: two responses wrong in the same way are equal
    // to each other as well.
    expect(idsByRole(html, 'tab')).toEqual([
      'xui-tabs-0-tab-a',
      'xui-tabs-0-tab-b',
      'xui-tabs-1-tab-a',
      'xui-tabs-1-tab-b'
    ]);
  });

  it('keeps two tab sets on a page apart', async () => {
    const html = await render(TwoTabSets);
    const tabs = idsByRole(html, 'tab');

    // Determinism is buyable by giving every tab set the same stem, which would
    // put two elements under one id and leave `aria-controls` resolving to
    // whichever came first.
    expect(new Set(tabs).size).toBe(4);
  });

  it('wires each tab to its own panel, both ways', async () => {
    const html = await render(TwoTabSets);

    const controls = attributes(html, 'aria-controls');
    const labelledBy = attributes(html, 'aria-labelledby');

    // The ids are one half each of two ARIA pairs. A pair that has come apart
    // renders identically to one that has not.
    expect(controls).toEqual(idsByRole(html, 'tabpanel'));
    expect(labelledBy).toEqual(idsByRole(html, 'tab'));
  });

  it('gives a tab left without an id a deterministic one', async () => {
    await render(UnidentifiedTabs);

    const html = await render(UnidentifiedTabs);

    // `xui-tab`'s own `id` input defaults to a generated value, so a tab set
    // written without ids is a second counter reaching the same markup.
    expect(idsByRole(html, 'tab')).toEqual(['xui-tabs-0-tab-xui-tab-0', 'xui-tabs-0-tab-xui-tab-1']);
  });
});
