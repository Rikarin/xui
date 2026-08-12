import { Component, Directive, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XFormFieldControl } from '@xui/core/form-field';
import { XuiFormField } from './form-field';

/**
 * A stand-in for a real control (input, select, …), the same one the browser
 * spec uses, so the field's own behaviour is tested without depending on another
 * package.
 */
@Directive({
  selector: '[xuiFakeControl]',
  providers: [{ provide: XFormFieldControl, useExisting: FakeControl }]
})
class FakeControl implements XFormFieldControl {
  readonly ngControl = null;
  readonly errorState = signal(false);
}

/**
 * Rendered against the real server platform — `@angular/platform-server` on top
 * of domino — because what is under test is a property of the *response*: two
 * requests for the same page, answered by the same process, have to come back
 * with the same bytes.
 */
@Component({
  selector: 'xui-root',
  imports: [XuiFormField, FakeControl],
  template: `
    <xui-form-field label="Email"><input xuiFakeControl /></xui-form-field>
    <xui-form-field label="Password"><input xuiFakeControl /></xui-form-field>
  `
})
class TwoFields {}

function render(): Promise<string> {
  return renderApplication(context => bootstrapApplication(TwoFields, {}, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });
}

/** Every `<label for>` target, in source order. */
const labelTargets = (html: string): string[] => [...html.matchAll(/<label[^>]*\sfor="([^"]*)"/g)].map(m => m[1]);

/** Every `<input>` id, in source order. */
const inputIds = (html: string): string[] => [...html.matchAll(/<input[^>]*\sid="([^"]*)"/g)].map(m => m[1]);

describe('XuiFormField on the server', () => {
  it('renders both fields with their labels', async () => {
    const html = await render();

    // Anchor: the id assertions below are all satisfied by a response that never
    // drew a field, because an empty list is equal to another empty list and has
    // no duplicates in it.
    expect(html).toContain('Email');
    expect(html).toContain('Password');
    expect(labelTargets(html)).toHaveLength(2);
    expect(inputIds(html)).toHaveLength(2);
  });

  it('serves two requests for the same page the same bytes', async () => {
    const first = await render();
    const second = await render();

    expect(second).toBe(first);
  });

  it('numbers fields from the page rather than from the process', async () => {
    await render();
    await render();

    const html = await render();

    expect(labelTargets(html)).toEqual(['xui-form-field-0', 'xui-form-field-1']);
  });

  it('points each label at the control it names', async () => {
    const html = await render();

    // `<label for>` is the payload, and a `for` naming an id no element carries
    // is silent: it looks correct in the markup, and clicking the label simply
    // does nothing. Assert the pairing, not the attribute.
    expect(labelTargets(html)).toEqual(inputIds(html));
    expect(new Set(labelTargets(html)).size).toBe(2);
  });
});
