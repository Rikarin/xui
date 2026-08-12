import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { XCheckbox } from './checkbox';

@Component({
  imports: [XCheckbox],
  template: '<x-checkbox [(checked)]="checked">tick</x-checkbox>'
})
class Host {
  readonly checked = signal(false);
}

const setup = (): { fixture: ComponentFixture<Host>; checkbox: XCheckbox; button: HTMLButtonElement } => {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();

  const checkbox = fixture.debugElement.children[0].componentInstance as XCheckbox;
  const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;

  return { fixture, checkbox, button };
};

describe('XCheckbox', () => {
  it('toggle() flips the state and emits checkedChange', () => {
    const emitted: boolean[] = [];
    const { fixture, checkbox, button } = setup();
    checkbox.checked.subscribe(value => emitted.push(value));

    button.click();
    fixture.detectChanges();

    expect(checkbox.checked()).toBe(true);
    expect(emitted).toEqual([true]);
    expect(button.getAttribute('aria-checked')).toBe('true');
  });

  it('two-way binding writes back into the host', () => {
    const { fixture, button } = setup();

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it('writeValue updates the state without emitting checkedChange', () => {
    const emitted: boolean[] = [];
    const { fixture, checkbox, button } = setup();
    checkbox.checked.subscribe(value => emitted.push(value));

    checkbox.writeValue(true);
    fixture.detectChanges();

    expect(checkbox.checked()).toBe(true);
    expect(emitted).toEqual([]);
    expect(button.getAttribute('aria-checked')).toBe('true');
  });

  it('toggling out of indeterminate lands on checked', () => {
    const { fixture, checkbox } = setup();
    checkbox.indeterminate.set(true);
    fixture.detectChanges();

    checkbox.toggle();
    fixture.detectChanges();

    expect(checkbox.checked()).toBe(true);
    expect(checkbox.indeterminate()).toBe(false);
  });
});

@Component({
  imports: [XCheckbox],
  template: '<x-checkbox>tick</x-checkbox>'
})
class GeneratedIdHost {}

@Component({
  imports: [XCheckbox],
  template: '<x-checkbox id="terms">tick</x-checkbox>'
})
class SuppliedIdHost {}

/**
 * The component splits one id in two: the inner `<button>` is the focusable
 * element, so it takes the id the caller gave, and the host takes that id with
 * `-checkbox` appended. A `<label for>` therefore has to name the button.
 */
describe('XCheckbox ids', () => {
  const setupLabelled = (
    host: typeof GeneratedIdHost | typeof SuppliedIdHost
  ): { host: HTMLElement; checkbox: XCheckbox; button: HTMLButtonElement } => {
    const fixture = TestBed.createComponent(host);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const checkbox = fixture.debugElement.query(node => node.name === 'x-checkbox').componentInstance as XCheckbox;

    return { host: element, checkbox, button: element.querySelector('button') as HTMLButtonElement };
  };

  it('ids the host and the button', () => {
    const { host, button } = setupLabelled(GeneratedIdHost);

    // Anchor: every assertion below compares two id strings, and comparing two
    // empty strings succeeds. Establish that there are ids here at all first.
    expect(host.querySelector('x-checkbox')?.id).toBeTruthy();
    expect(button.id).toBeTruthy();
  });

  it('gives the button the caller id and the host that id suffixed', () => {
    const { host, button } = setupLabelled(SuppliedIdHost);

    expect(button.id).toBe('terms');
    expect(host.querySelector('x-checkbox')?.id).toBe('terms-checkbox');
  });

  it('gives the button the generated id, suffix included in the stem', () => {
    const { checkbox, host, button } = setupLabelled(GeneratedIdHost);

    // The generated id is `x-checkbox-N`, which contains the very suffix the
    // host appends. Deriving the button's id by removing the *first* match
    // instead of the trailing one turns `x-checkbox-0-checkbox` into
    // `x-0-checkbox`, an id no caller could predict and no label can name.
    expect(button.id).toBe(checkbox.id());
    expect(host.querySelector('x-checkbox')?.id).toBe(`${checkbox.id()}-checkbox`);
  });

  it('lets a label point at the checkbox by the id it reports', () => {
    const { host, checkbox, button } = setupLabelled(GeneratedIdHost);

    // What a consumer writes: the id the component reports is the id they put in
    // `for`. The pairing is the whole point of the ids, and a `for` naming an id
    // nothing carries is silent — the markup looks right and clicking the label
    // does nothing at all.
    const label = document.createElement('label');
    label.htmlFor = checkbox.id() as string;
    host.prepend(label);

    expect(host.querySelector(`[id="${label.htmlFor}"]`)).toBe(button);
  });
});
