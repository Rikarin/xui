import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * One row of a `xui-table`, header or body.
 *
 * ```html
 * <xui-tr><xui-td class="w-32">Ada Lovelace</xui-td><xui-td class="flex-1">Owner</xui-td></xui-tr>
 * ```
 *
 * A flex row, so its cells stretch to the tallest one — which is what makes each cell's divider span
 * the full height. Top-align a row's contents with `items-start` on the cells, never on the row, or
 * the dividers stop wherever the shortest cell ends.
 */
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
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected computedClass = computed(() =>
    xui(
      'flex border-b border-border transition-colors hover:bg-hover-overlay data-[state=selected]:bg-hover-overlay',
      this.class()
    )
  );
}
