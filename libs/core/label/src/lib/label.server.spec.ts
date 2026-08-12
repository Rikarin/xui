import { Component, viewChildren } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XLabel } from './label';

/**
 * Rendered against the real server platform — `@angular/platform-server` on top
 * of domino — rather than jsdom, because what is under test is a property of the
 * *response*: two requests for the same page, answered by the same process, have
 * to come back with the same bytes.
 *
 * A page is built fresh for every render, exactly as a request-scoped route
 * component would be, so nothing but the library carries state from one render
 * to the next.
 */
@Component({
  selector: 'x-root',
  imports: [XLabel],
  template: `
    <label xLabel>
      Email
      <input [attr.aria-labelledby]="labels()[0]?.id()" />
    </label>

    <label xLabel>
      Password
      <input [attr.aria-labelledby]="labels()[1]?.id()" />
    </label>
  `
})
class TwoLabels {
  readonly labels = viewChildren(XLabel);
}

function render(): Promise<string> {
  return renderApplication(context => bootstrapApplication(TwoLabels, {}, context), {
    document: '<html><body><x-root></x-root></body></html>'
  });
}

/** Every `id` in the document, in source order. */
const ids = (html: string): string[] => [...html.matchAll(/\sid="([^"]*)"/g)].map(match => match[1]);

/** Every `aria-labelledby` in the document, in source order. */
const labelledBy = (html: string): string[] => [...html.matchAll(/aria-labelledby="([^"]*)"/g)].map(match => match[1]);

describe('XLabel on the server', () => {
  it('renders both labels with an id', async () => {
    const html = await render();

    // Anchor: everything below is about the *values* of these ids, and a render
    // that never got as far as drawing a label would satisfy every one of those
    // assertions vacuously — two empty id lists compare equal, and an empty list
    // has no duplicates in it.
    expect(html).toContain('Email');
    expect(html).toContain('Password');
    expect(ids(html).filter(id => id.startsWith('x-label-'))).toHaveLength(2);
  });

  it('serves two requests for the same page the same bytes', async () => {
    const first = await render();
    const second = await render();

    // Not "the second response looks right" — the two have to be the *same*
    // response. An id drawn from a counter that outlives the request makes the
    // markup a function of how many pages the process has already served.
    expect(second).toBe(first);
  });

  it('numbers labels from the page rather than from the process', async () => {
    await render();
    await render();

    const html = await render();

    // The concrete values matter as well as their stability. Equality between
    // two server renders alone is also satisfied by an id that is wrong in the
    // same way twice — a constant, say — so pin what the third render emits.
    expect(ids(html).filter(id => id.startsWith('x-label-'))).toEqual(['x-label-0', 'x-label-1']);
  });

  it('keeps the two labels on a page apart', async () => {
    const html = await render();
    const labels = ids(html).filter(id => id.startsWith('x-label-'));

    // Determinism is cheap to buy by giving every label the same string, which
    // would leave both inputs named by whichever label came first.
    expect(new Set(labels).size).toBe(2);
  });

  it('points each input at the label that names it', async () => {
    const html = await render();
    const targets = labelledBy(html);

    // The id is not decoration: it is one half of an `aria-labelledby` pair, and
    // a pair that has come apart is invisible in the markup unless the *other*
    // half is checked too. Assert the relationship, not the attribute.
    expect(targets).toHaveLength(2);
    expect(new Set(targets).size).toBe(2);

    for (const target of targets) {
      expect(html).toContain(`id="${target}"`);
    }
  });
});
