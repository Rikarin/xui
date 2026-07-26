import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A validation message for the control in a `xui-form-field`.
 *
 * ```html
 * <xui-error>Enter a valid address.</xui-error>
 * ```
 *
 * Project it into the field and it replaces the hint and helper text — but only while the control's
 * error state is actually set, so it can be written unconditionally and needs no `@if`.
 */
@Component({
  selector: 'xui-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiError {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected computedClass = computed(() => xui('block text-error text-sm font-medium', this.class()));
}
