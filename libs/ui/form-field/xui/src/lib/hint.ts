import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * Supporting text under the control in a `xui-form-field`.
 *
 * ```html
 * <xui-hint>Use the address you signed up with.</xui-hint>
 * ```
 *
 * The projected form of the field's `helperText` input, for hints that need markup rather than a plain
 * string. Hidden while a `xui-error` is showing.
 */
@Component({
  selector: 'xui-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiHint {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected computedClass = computed(() => xui('block text-sm text-foreground-subtle', this.class()));
}
