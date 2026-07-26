import { afterNextRender, DestroyRef, inject, Injector, signal, type Signal } from '@angular/core';
import { NgControl } from '@angular/forms';

/** The form wiring a control exposes to `xui-form-field`: see {@link createXErrorState}. */
export interface XErrorState {
  /** The `NgControl` bound to the host element, once resolved; `null` without a form. */
  readonly ngControl: Signal<NgControl | null>;
  /** True while the bound control is invalid and the user has interacted with it. */
  readonly errorState: Signal<boolean>;
}

/**
 * Derives a control's error state from the optional `NgControl` on its host
 * element, reactively: invalid and (touched or dirty), the same condition the
 * `ng-invalid.ng-touched` styling keys off.
 *
 * The `NgControl` is looked up after the first render, not injected in the
 * constructor, for two reasons. A control that registers itself as the
 * `NG_VALUE_ACCESSOR` via `useExisting` cannot inject `NgControl` while it is
 * being built — the form directive is in the middle of injecting *it* — and the
 * directive only binds its `control` in its own `ngOnChanges`, after every
 * directive on the element exists. By the first render both are settled.
 *
 * Must be called in an injection context (a field initializer or constructor).
 *
 * For matcher-aware error state (`XErrorStateMatcher`, submitted-form
 * semantics) use {@link XErrorStateTracker} instead; this helper is the
 * lightweight form for controls that provide their own `NG_VALUE_ACCESSOR`
 * via `useExisting` and therefore cannot inject `NgControl` eagerly.
 *
 * ```ts
 * private readonly formState = createXErrorState();
 * readonly errorState = this.formState.errorState;
 * get ngControl() { return this.formState.ngControl(); }
 * ```
 */
export function createXErrorState(): XErrorState {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);

  const ngControl = signal<NgControl | null>(null);
  const errorState = signal(false);

  afterNextRender(() => {
    const directive = injector.get(NgControl, null, { self: true, optional: true });
    ngControl.set(directive);

    const control = directive?.control;

    if (!control) {
      return;
    }

    const update = () => errorState.set(control.invalid && (control.touched || control.dirty));
    const subscription = control.events.subscribe(update);
    destroyRef.onDestroy(() => subscription.unsubscribe());
    update();
  });

  return { ngControl: ngControl.asReadonly(), errorState: errorState.asReadonly() };
}
