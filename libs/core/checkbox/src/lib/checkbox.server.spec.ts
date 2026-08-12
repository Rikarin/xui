import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XCheckbox } from './checkbox';

/**
 * Rendered against the real server platform — `@angular/platform-server` on top
 * of domino — because what is under test is a property of the *response*: two
 * requests for the same page, answered by the same process, have to come back
 * with the same bytes.
 */
@Component({
  selector: 'x-root',
  imports: [XCheckbox],
  template: `
    <x-checkbox aria-label="Accept terms">tick</x-checkbox>
    <x-checkbox aria-label="Send me mail">tick</x-checkbox>
  `
})
class TwoCheckboxes {}

function render(): Promise<string> {
  return renderApplication(context => bootstrapApplication(TwoCheckboxes, {}, context), {
    document: '<html><body><x-root></x-root></body></html>'
  });
}

/** The `id` of every `x-checkbox` host, in source order. */
const checkboxIds = (html: string): string[] =>
  [...html.matchAll(/<x-checkbox[^>]*\sid="([^"]*)"/g)].map(match => match[1]);

describe('XCheckbox on the server', () => {
  it('renders both checkboxes with an id', async () => {
    const html = await render();

    // Anchor: the assertions below are about the values of these ids, and they
    // all pass vacuously against a render that never drew a checkbox.
    expect(html).toContain('role="checkbox"');
    expect(checkboxIds(html)).toHaveLength(2);
  });

  it('serves two requests for the same page the same bytes', async () => {
    const first = await render();
    const second = await render();

    expect(second).toBe(first);
  });

  it('numbers checkboxes from the page rather than from the process', async () => {
    await render();
    await render();

    const html = await render();

    // Pinned, not merely stable: two renders that are wrong in the same way are
    // also equal to each other. The host carries the id with `-checkbox`
    // appended, so `x-checkbox-0` becomes `x-checkbox-0-checkbox`.
    expect(checkboxIds(html)).toEqual(['x-checkbox-0-checkbox', 'x-checkbox-1-checkbox']);
  });

  it('keeps the two checkboxes on a page apart', async () => {
    const html = await render();

    expect(new Set(checkboxIds(html)).size).toBe(2);
  });
});
