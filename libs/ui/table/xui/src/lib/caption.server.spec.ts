import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiCaption } from './caption';
import { XuiTable } from './table';

/**
 * Rendered against the real server platform — `@angular/platform-server` on top
 * of domino — because what is under test is a property of the *response*: two
 * requests for the same page, answered by the same process, have to come back
 * with the same bytes.
 */
@Component({
  selector: 'xui-root',
  imports: [XuiTable, XuiCaption],
  template: `
    <xui-table><xui-caption>Quarterly revenue by region</xui-caption></xui-table>
    <xui-table><xui-caption>Headcount by team</xui-caption></xui-table>
  `
})
class TwoTables {}

function render(): Promise<string> {
  return renderApplication(context => bootstrapApplication(TwoTables, {}, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });
}

/** The `aria-labelledby` of every table, in source order. */
const tableNames = (html: string): string[] =>
  [...html.matchAll(/<xui-table[^>]*\saria-labelledby="([^"]*)"/g)].map(match => match[1]);

/** The `id` of every caption, in source order. */
const captionIds = (html: string): string[] =>
  [...html.matchAll(/<xui-caption[^>]*\sid="([^"]*)"/g)].map(match => match[1]);

describe('XuiCaption on the server', () => {
  it('renders both tables with their captions', async () => {
    const html = await render();

    // Anchor: every assertion below is about the id a caption emits, and all of
    // them hold vacuously on a response that never got as far as drawing one —
    // two empty lists are equal, and an empty list has no duplicates in it.
    expect(html).toContain('Quarterly revenue by region');
    expect(html).toContain('Headcount by team');
    expect(captionIds(html)).toHaveLength(2);
    expect(tableNames(html)).toHaveLength(2);
  });

  it('serves two requests for the same page the same bytes', async () => {
    const first = await render();
    const second = await render();

    expect(second).toBe(first);
  });

  it('numbers captions from the page rather than from the process', async () => {
    await render();
    await render();

    const html = await render();

    // Pinned, not merely stable: two responses that are wrong in the same way
    // are equal to each other too.
    expect(captionIds(html)).toEqual(['xui-caption-0', 'xui-caption-1']);
  });

  it('gives a caption an id a selector can actually address', async () => {
    const html = await render();

    for (const id of captionIds(html)) {
      // A bare integer is a legal HTML id and an illegal CSS identifier, so
      // `querySelector('#0')` throws rather than missing. Anything reaching for
      // the caption by id — a test, a consumer's own styling, an anchor link —
      // has to escape it first, and nothing does.
      expect(id).toMatch(/^[A-Za-z][\w-]*$/);
    }
  });

  it('names each table after its own caption', async () => {
    const html = await render();

    // The relationship is the payload. An `aria-labelledby` that has come apart
    // from the id it points at is invisible in the markup unless both halves are
    // read together, and silent to everything except a screen reader.
    expect(tableNames(html)).toEqual(captionIds(html));
    expect(new Set(tableNames(html)).size).toBe(2);
  });
});
