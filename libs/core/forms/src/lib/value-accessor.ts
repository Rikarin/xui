import { computed, forwardRef, signal, type Provider, type Signal, type Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { XChangeFn, XTouchFn } from './control-value-accessor';

/**
 * Registers `type` as the `NG_VALUE_ACCESSOR` of its injector, so `ngModel`,
 * `formControl` and `formControlName` bind to the component directly.
 *
 * ```ts
 * providers: [provideXValueAccessor(() => XuiSwitch)]
 * ```
 */
export function provideXValueAccessor(type: () => Type<unknown>): Provider {
  return { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(type), multi: true };
}

export interface XCreateValueAccessorOptions<T> {
  /** Receives every value the form writes into the control. */
  onWrite: (value: T) => void;
  /** The control's own `disabled` input, folded into {@link XValueAccessor.disabled}. */
  disabled?: Signal<boolean>;
}

/** The state and plumbing a `ControlValueAccessor` implementation delegates to. */
export interface XValueAccessor<T> {
  /**
   * Whether the control is disabled — by its `disabled` input or by a reactive
   * form's `setDisabledState`, whichever says so.
   */
  readonly disabled: Signal<boolean>;
  /** Calls the registered touched callback, if a form has registered one. */
  markTouched(): void;
  /** Calls the registered change callback, if a form has registered one. */
  notifyChange(value: T): void;
  writeValue(value: T): void;
  registerOnChange(fn: XChangeFn<T>): void;
  registerOnTouched(fn: XTouchFn): void;
  setDisabledState(isDisabled: boolean): void;
}

/**
 * The `ControlValueAccessor` boilerplate as a field initializer: the
 * form-disabled signal merged with the `disabled` input, the registered
 * callbacks, and the four CVA methods, ready to be re-exposed by the component.
 *
 * ```ts
 * protected readonly cva = createXValueAccessor<boolean>({
 *   onWrite: value => this.checked.set(!!value),
 *   disabled: this.disabled
 * });
 * protected readonly isDisabled = this.cva.disabled;
 *
 * readonly writeValue = this.cva.writeValue;
 * readonly registerOnChange = this.cva.registerOnChange;
 * readonly registerOnTouched = this.cva.registerOnTouched;
 * readonly setDisabledState = this.cva.setDisabledState;
 * ```
 *
 * Needs no injection context — `signal`/`computed` are plain factories — so it
 * is safe anywhere, including outside a component.
 */
export function createXValueAccessor<T>(options: XCreateValueAccessorOptions<T>): XValueAccessor<T> {
  // Disabled comes from two independent sources — the input and a reactive
  // form's setDisabledState — so OR them rather than let one clobber the other.
  const disabledByForm = signal(false);
  const disabled = computed(() => (options.disabled?.() ?? false) || disabledByForm());

  let onChange: XChangeFn<T> | undefined;
  let onTouched: XTouchFn | undefined;

  return {
    disabled,
    markTouched: () => onTouched?.(),
    notifyChange: value => onChange?.(value),
    writeValue: value => options.onWrite(value),
    registerOnChange: fn => (onChange = fn),
    registerOnTouched: fn => (onTouched = fn),
    setDisabledState: isDisabled => disabledByForm.set(isDisabled)
  };
}
