import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'xui-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiHint {
  readonly class = input<ClassValue>('');

  protected computedClass = computed(() => xui('block text-sm text-foreground-subtle', this.class()));
}
