import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'xui-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiError {
  readonly class = input<ClassValue>('');

  protected computedClass = computed(() => xui('block text-error text-sm font-medium', this.class()));
}
