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
      'flex flex border-b border-foreground/20 transition-colors hover:bg-foreground/10 data-[state=selected]:bg-foreground/10',
      this.class()
    )
  );
}
