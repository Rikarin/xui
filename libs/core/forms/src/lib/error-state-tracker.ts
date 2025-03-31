import { signal } from '@angular/core';
import type { AbstractControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import type { ErrorStateMatcher } from './error-options';

export class ErrorStateTracker {
  /** Whether the tracker is currently in an error state. */
  readonly errorState = signal(false);

  /** User-defined matcher for the error state. */
  matcher: ErrorStateMatcher | null = null;

  constructor(
    private readonly defaultMatcher: ErrorStateMatcher | null,
    public ngControl: NgControl | null,
    private readonly parentFormGroup: FormGroupDirective | null,
    private readonly parentForm: NgForm | null
  ) {}

  /** Updates the error state based on the provided error state matcher. */
  updateErrorState() {
    const oldState = this.errorState();
    const parent = this.parentFormGroup || this.parentForm;
    const matcher = this.matcher || this.defaultMatcher;
    const control = this.ngControl ? (this.ngControl.control as AbstractControl) : null;
    const newState = matcher?.isInvalid(control, parent) ?? false;

    if (newState !== oldState) {
      this.errorState.set(newState);
    }
  }
}
