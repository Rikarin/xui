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
 * One header cell of a `xui-table`.
 *
 * ```html
 * <xui-th class="w-32">Name</xui-th>
 * ```
 *
 * Sized like `xui-td` — give a column's header and body cells the same width class — with the fixed
 * header height and muted label styling on top.
 */
@Component({
  selector: 'xui-th',
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
export class XuiTh {
  private readonly columnDef? = inject(XColumnDef, { optional: true });

  /** Clip an overlong heading to one line with an ellipsis, instead of letting the header row grow. */
  readonly truncate = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui(
      'flex flex-none h-12 px-3 text-sm items-center font-medium text-foreground-muted [&:has([role=checkbox])]:pe-0',
      this.columnDef?.class(),
      this.class()
    )
  );
}
