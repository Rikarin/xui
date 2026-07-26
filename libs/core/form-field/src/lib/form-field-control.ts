import { Directive, type Signal, signal } from '@angular/core';
import type { AbstractControlDirective, NgControl } from '@angular/forms';

@Directive()
export class XFormFieldControl {
  /** Gets the AbstractControlDirective for this control. */
  readonly ngControl: NgControl | AbstractControlDirective | null = null;

  /** Whether the control is in an error state. */
  readonly errorState: Signal<boolean> = signal(false);

  /**
   * The id of the focusable element the form field's `<label for>` should point
   * at, for controls whose host element is not itself the focusable control (a
   * select's trigger button, a component wrapping an inner `<input>`). Controls
   * whose host *is* the control (`<input xuiInput>`, `<textarea xuiTextarea>`)
   * leave it unset and the form field ids the host element instead.
   */
  readonly controlId?: Signal<string | null>;
}
