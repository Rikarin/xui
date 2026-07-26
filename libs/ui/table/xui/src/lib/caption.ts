import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  untracked
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiTable } from './table';

let captionIdSequence = 0;

@Component({
  selector: 'xui-caption',
  host: {
    '[class]': 'computedClass()',
    '[id]': 'id()'
  },
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiCaption {
  private readonly table = inject(XuiTable, { optional: true });

  readonly hidden = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');

  protected readonly id = input<string | null | undefined>(`${captionIdSequence++}`);
  protected readonly computedClass = computed(() =>
    xui('text-center block mt-4 text-sm text-foreground-subtle', this.hidden() ? 'sr-only' : 'order-last', this.class())
  );

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        if (!this.table) {
          return;
        }

        this.table.labeledBy.set(id);
      });
    });
  }
}
