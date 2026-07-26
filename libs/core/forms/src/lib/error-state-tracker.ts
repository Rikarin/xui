import { computed, effect, signal, type Signal } from '@angular/core';
import type { AbstractControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { merge, type Observable } from 'rxjs';
import type { XErrorStateMatcher } from './error-options';

/**
 * Derives a control's error state reactively from the control's own event
 * stream — no per-CD polling.
 *
 * `errorState` is a computed that re-evaluates the active matcher whenever the
 * control emits a `ControlEvent` (status, touched, pristine or value changes)
 * or the parent form submits. Must be constructed in an injection context (it
 * wires itself with an `effect`), which a field initializer or constructor of
 * the owning directive provides.
 *
 * For a control that cannot inject `NgControl` eagerly (it provides its own
 * `NG_VALUE_ACCESSOR` via `useExisting`) and needs no matcher, the lighter
 * {@link createXErrorState} resolves the control lazily instead.
 */
export class XErrorStateTracker {
  /** User-defined matcher for the error state, overriding the default. */
  private readonly userMatcher = signal<XErrorStateMatcher | null>(null);

  /**
   * Bumped on every control/form event so `errorState` re-reads the matcher —
   * `AbstractControl.touched` and friends are not signals, so the event stream
   * is what invalidates the computed.
   */
  private readonly controlEvents = signal(0);

  /** Whether the tracker is currently in an error state. */
  readonly errorState: Signal<boolean>;

  /** User-defined matcher for the error state. */
  get matcher(): XErrorStateMatcher | null {
    return this.userMatcher();
  }
  set matcher(value: XErrorStateMatcher | null) {
    this.userMatcher.set(value);
  }

  constructor(
    private readonly defaultMatcher: XErrorStateMatcher | null,
    public ngControl: NgControl | null,
    private readonly parentFormGroup: FormGroupDirective | null,
    private readonly parentForm: NgForm | null
  ) {
    this.errorState = computed(() => {
      this.controlEvents();
      const parent = this.parentFormGroup || this.parentForm;
      const matcher = this.userMatcher() ?? this.defaultMatcher;
      const control = this.ngControl ? (this.ngControl.control as AbstractControl | null) : null;
      return matcher?.isInvalid(control, parent) ?? false;
    });

    // `NgControl.control` only attaches during the first change-detection pass,
    // after this constructor ran — so subscribe from an effect, whose first run
    // happens once that pass is done. It reads no signals, so it runs once.
    effect(onCleanup => {
      const control = this.ngControl?.control;
      const parent = this.parentFormGroup ?? this.parentForm;
      const sources: Observable<unknown>[] = [];

      if (control) {
        sources.push(control.events);
      }
      if (parent) {
        sources.push(parent.ngSubmit);
      }
      if (!sources.length) {
        return;
      }

      const subscription = merge(...sources).subscribe(() => this.controlEvents.update(count => count + 1));
      // The control was not there when `errorState` first evaluated — re-evaluate.
      this.controlEvents.update(count => count + 1);

      onCleanup(() => subscription.unsubscribe());
    });
  }
}
