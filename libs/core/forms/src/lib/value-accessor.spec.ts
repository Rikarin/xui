import { signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { createXValueAccessor, provideXValueAccessor } from './value-accessor';

class Fake {}

describe('provideXValueAccessor', () => {
  it('builds a multi NG_VALUE_ACCESSOR provider for the type', () => {
    const provider = provideXValueAccessor(() => Fake) as {
      provide: unknown;
      useExisting: () => unknown;
      multi: boolean;
    };

    expect(provider.provide).toBe(NG_VALUE_ACCESSOR);
    expect(provider.multi).toBe(true);
    // forwardRef resolves to the component class it was given.
    expect(provider.useExisting()).toBe(Fake);
  });
});

describe('createXValueAccessor', () => {
  it('routes writeValue to onWrite', () => {
    const written: string[] = [];
    const cva = createXValueAccessor<string>({ onWrite: value => written.push(value) });

    cva.writeValue('a');
    cva.writeValue('b');

    expect(written).toEqual(['a', 'b']);
  });

  it('notifyChange calls the registered change callback with the value', () => {
    const changes: number[] = [];
    const cva = createXValueAccessor<number>({ onWrite: () => void 0 });

    // Before registration nothing is wired, and nothing throws.
    cva.notifyChange(1);
    cva.registerOnChange(value => changes.push(value));
    cva.notifyChange(2);

    expect(changes).toEqual([2]);
  });

  it('markTouched calls the registered touched callback', () => {
    let touched = 0;
    const cva = createXValueAccessor<string>({ onWrite: () => void 0 });

    cva.markTouched();
    cva.registerOnTouched(() => touched++);
    cva.markTouched();

    expect(touched).toBe(1);
  });

  it('tracks the form-disabled state via setDisabledState', () => {
    const cva = createXValueAccessor<string>({ onWrite: () => void 0 });

    expect(cva.disabled()).toBe(false);

    cva.setDisabledState(true);
    expect(cva.disabled()).toBe(true);

    cva.setDisabledState(false);
    expect(cva.disabled()).toBe(false);
  });

  it('ORs the disabled input with the form-disabled state', () => {
    const input = signal(false);
    const cva = createXValueAccessor<string>({ onWrite: () => void 0, disabled: input });

    expect(cva.disabled()).toBe(false);

    input.set(true);
    expect(cva.disabled()).toBe(true);

    // The form re-enabling cannot override an explicitly disabled input.
    cva.setDisabledState(false);
    expect(cva.disabled()).toBe(true);

    input.set(false);
    cva.setDisabledState(true);
    expect(cva.disabled()).toBe(true);
  });
});
