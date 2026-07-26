import { Directive, type Signal, signal } from '@angular/core';
import type { AbstractControlDirective, NgControl } from '@angular/forms';

/**
 * The token a control provides so a form field can find it.
 *
 * ```ts
 * providers: [{ provide: XFormFieldControl, useExisting: forwardRef(() => XuiInput) }]
 * ```
 *
 * An abstract directive used purely as a DI token: `xui-form-field` queries its projected content for
 * it to learn which element to label and when to show an error. Implement it on any control that
 * should drop into a form field — the three members below are all it reads.
 */
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
