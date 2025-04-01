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
import { XuiTableComponent } from './table.component';

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
export class XuiCaptionComponent {
  private readonly table = inject(XuiTableComponent, { optional: true });

  protected readonly id = input<string | null | undefined>(`${captionIdSequence++}`);

  public readonly hidden = input(false, { transform: booleanAttribute });
  public readonly class = input<ClassValue>('');
  protected readonly computedClass = computed(() =>
    xui('text-center block mt-4 text-sm text-muted-foreground', this.hidden() ? 'sr-only' : 'order-last', this.class())
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
