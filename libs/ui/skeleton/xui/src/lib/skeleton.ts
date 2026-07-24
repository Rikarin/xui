import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'xui-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiSkeleton {
  /** The user-defined classes */
  readonly class = input<ClassValue>('');

  /** The classes to apply to the component merged with the user-defined classes */
  protected readonly computedClass = computed(() => xui('block animate-pulse rounded-md bg-muted', this.class()));
}
