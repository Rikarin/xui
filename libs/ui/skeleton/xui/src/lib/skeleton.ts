import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A placeholder block standing in for content that has not loaded.
 *
 * ```html
 * <xui-skeleton class="h-4 w-32" />
 * ```
 *
 * Size it with utility classes — a skeleton should match the shape of whatever
 * it is standing in for.
 */
@Component({
  selector: 'xui-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    'aria-hidden': 'true',
    '[class]': 'computedClass()'
  }
})
export class XuiSkeleton {
  /** The user-defined classes */
  readonly class = input<ClassValue>('');

  /** The classes to apply to the component merged with the user-defined classes */
  protected readonly computedClass = computed(() => xui('block animate-pulse rounded-md bg-muted', this.class()));
}
