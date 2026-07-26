import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'xui-tr',
  host: {
    '[class]': 'computedClass()',
    role: 'row'
  },
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTr {
  readonly class = input<ClassValue>('');

  protected computedClass = computed(() =>
    xui(
      'flex border-b border-border transition-colors hover:bg-hover-overlay data-[state=selected]:bg-hover-overlay',
      this.class()
    )
  );
}
