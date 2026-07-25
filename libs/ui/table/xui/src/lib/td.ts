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

  readonly truncate = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('flex flex-none p-3 items-center [&:has([role=checkbox])]:pe-0', this.columnDef?.class(), this.class())
  );
}
