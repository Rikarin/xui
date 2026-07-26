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
