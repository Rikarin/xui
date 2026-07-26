import type { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input
} from '@angular/core';
import { xui } from '@xui/core';
import { XColumnDef } from '@xui/core/table';
import type { ClassValue } from 'clsx';

/**
 * One body cell of a `xui-table`.
 *
 * ```html
 * <xui-td class="w-32">Ada Lovelace</xui-td>
 * ```
 *
 * A cell is `flex-none` — as wide as what is in it — so a column lines up only when every cell down it
 * carries the same width class, and the column that absorbs the leftover width needs `flex-1`. It also
 * lays its children out in a row, so anything that should stack goes in a single wrapper.
 *
 * Inside a `cdk-table`, it picks up the width and alignment classes from the enclosing `XColumnDef`,
 * so the column is described once rather than on every cell.
 */
@Component({
  selector: 'xui-td',
  imports: [NgTemplateOutlet],
  host: {
    '[class]': 'computedClass()'
  },
  template: `
    <ng-template #content>
      <ng-content />
    </ng-template>
    @if (truncate()) {
      <span class="flex-1 truncate">
        <ng-container [ngTemplateOutlet]="content" />
      </span>
    } @else {
      <ng-container [ngTemplateOutlet]="content" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTd {
  private readonly columnDef? = inject(XColumnDef, { optional: true });

  /** Clip overflowing content to one line with an ellipsis, instead of letting the cell grow. */
  readonly truncate = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('flex flex-none p-3 items-center [&:has([role=checkbox])]:pe-0', this.columnDef?.class(), this.class())
  );
}
